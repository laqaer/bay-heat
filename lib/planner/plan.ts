import type { ClimateStation, GarageInput, PlannerResult, PriceSet, SessionRow } from "./types.ts";
import type { ResolvedEnvelope } from "./heatLoss.ts";
import { stationById, primaryStationForState } from "./stations.ts";
import { pricesForState } from "./prices.ts";
import { resolveEnvelope, resolveCircuit } from "./defaults.ts";
import { designTempFor, band } from "./uncertainty.ts";
import { heatLossDesign, freeFloatTemp } from "./heatLoss.ts";
import { hddAtBase } from "./climate.ts";
import { lightCapacitance, simulateSession } from "./warmup.ts";
import { balancePoint, seasonalLoadContinuous, heatPumpSeasonal } from "./seasonal.ts";
import { MAX_HEATER_CIRCUIT_WATTS, circuitFor, circuitsForLoad } from "./electrical.ts";
import { circuitCovers, circuitLabel } from "./classCircuit.ts";
import { costsForSeasonalLoad } from "./fuels.ts";
import { rankSystems, type RecommendContext } from "./recommend.ts";
import { insulateFirst, fixFirst, bundleCheapMeasures, type RoiContext } from "./roi.ts";
import { planWarnings } from "./warnings.ts";
import { encode } from "./codec.ts";
import { serialFor } from "./serial.ts";
import { HEATER_CLASSES } from "./catalog.ts";
import { WALL_U } from "./constants.ts";

const MODEL_VERSION = "1.0.1";
const SEASON_MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function houseCouplingUa(input: GarageInput, envelope: ResolvedEnvelope): number {
  if (!input.attached) return 0;
  return WALL_U[envelope.wallType] * input.commonWallLen * input.height + 40;
}

function circuitVolts(c: NonNullable<GarageInput["circuit"]>): 120 | 240 {
  return c.startsWith("120") ? 120 : 240;
}
function circuitAmps(c: NonNullable<GarageInput["circuit"]>): number {
  const m = /V(\d+)A$/.exec(c);
  return m ? Number(m[1]) : 0;
}
function etaFor(classId: keyof typeof HEATER_CLASSES): number {
  const eta = HEATER_CLASSES[classId].eta;
  return typeof eta === "number" ? eta : 1;
}

// A representative January daytime session, used for both the warmup curve and (in sessions mode) the
// seasonal-cost estimate. capacityBtuh is the specific heater being simulated -- unlike the continuous-mode
// balance-point/HDD math, warm-up energy genuinely depends on which heater is running (thermal mass absorbs
// part of its output), so there's no equipment-independent "seasonal load" figure for sessions mode.
function januarySession(input: GarageInput, envelope: ResolvedEnvelope, station: ClimateStation, uaOut: number, uaHouse: number, cLight: number, aFloor: number, tGnd: number, capacityBtuh: number, hours: number) {
  const janTOut = station.tMean[0] + 4;
  const tStart = freeFloatTemp(input, envelope, janTOut, station.elevFt, station, 0);
  return simulateSession({ uaOut, uaHouse, tOut: janTOut, tHouse: input.tHouse, tStart, tGnd, tTarget: input.targetTemp, capacityBtuh, hours, cLight, aFloor });
}

function buildSessionRows(input: GarageInput, envelope: ResolvedEnvelope, station: ClimateStation, uaOut: number, uaHouse: number, cLight: number, aFloor: number, tGnd: number, capacityBtuh: number, prices: PriceSet): SessionRow[] {
  const months: SessionRow["month"][] = ["nov", "dec", "jan", "feb", "mar"];
  const monthIndex: Record<SessionRow["month"], number> = { nov: 10, dec: 11, jan: 0, feb: 1, mar: 2 };
  return months.map((month) => {
    const tOut = station.tMean[monthIndex[month]] + 4;
    const tStart = freeFloatTemp(input, envelope, tOut, station.elevFt, station, 0);
    const sim = simulateSession({ uaOut, uaHouse, tOut, tHouse: input.tHouse, tStart, tGnd, tTarget: input.targetTemp, capacityBtuh, hours: input.usage.hoursPerSession || 4, cLight, aFloor });
    const kwh = sim.energyBtu / 3412;
    return { month, tOut, tStart, minutesToTarget: sim.minutesToTarget, kwhOrFuel: Math.round(kwh * 10) / 10, cost: Math.round(kwh * prices.elecPerKwh * 100) / 100 };
  });
}

// plan(): the planner's single entry point (planner-engineering.md §16, per types.ts's frozen SIGNATURE).
// Pure and deterministic -- runs once per request; band() (called inside) never re-runs it.
export function plan(input: GarageInput): PlannerResult {
  const station = stationById(input.stationId) ?? primaryStationForState(input.state) ?? stationById("IL-chicago")!;
  const prices: PriceSet = input.priceOverrides
    ? { ...pricesForState(input.state), ...Object.fromEntries(Object.entries(input.priceOverrides).filter(([, v]) => v != null)) }
    : pricesForState(input.state);

  const envelope = resolveEnvelope(input);
  const circuit = resolveCircuit(input);
  const tOut = designTempFor(input, station);
  const elevationFt = station.elevFt;

  const heatLoss = heatLossDesign(input, envelope, tOut, elevationFt);
  const heatBand = band(input);
  const freeFloatDesignF = freeFloatTemp(input, envelope, tOut, elevationFt, station, 7);
  const uaHouse = houseCouplingUa(input, envelope);

  const tGnd = station.tMean.reduce((a, b) => a + b, 0) / 12;
  const cLight = lightCapacitance(input, elevationFt, 0);
  const aFloor = input.width * input.depth;
  const tStartJan = freeFloatTemp(input, envelope, station.tMean[0] + 4, elevationFt, station, 0);

  const seasonMonths = station.tMean.map((t, i) => ({ i, t })).filter(({ t }) => t < input.targetTemp - 5).map(({ i }) => SEASON_MONTH_NAMES[i]);
  const monthsInSeason = Math.max(1, seasonMonths.length);
  const tBal = input.usage.mode === "continuous" ? balancePoint(input.targetTemp, uaHouse, input.tHouse, heatLoss.uaExt) : undefined;
  const hddAtBal = tBal !== undefined ? hddAtBase(station, tBal) : undefined;

  const recommendCtx: RecommendContext = { input, qReq: heatLoss.qSize, station, elevationFt, tOut, uaOut: heatLoss.uaExt, uaHouse, prices, circuit, cLight, aFloor, tStartJan };
  // No design heating load (design temperature at or above the target): nothing to size, price or rank, so
  // skip the whole recommendation/ROI path rather than ranking heaters against a zero load.
  const noHeatingLoad = heatLoss.qDesign <= 0;
  const { recommendations, whyNot } = noHeatingLoad ? { recommendations: [], whyNot: [] } : rankSystems(recommendCtx);
  const top = recommendations[0];

  const warmupClassId = top?.classId ?? "e_240_5k";
  const warmupCapacityBtuh = top?.capacityBtuh ?? HEATER_CLASSES[warmupClassId].outputBtuh[1];
  const warmupHours = input.usage.mode === "sessions" ? input.usage.hoursPerSession || 4 : 4;
  const janSim = januarySession(input, envelope, station, heatLoss.uaExt, uaHouse, cLight, aFloor, tGnd, warmupCapacityBtuh, warmupHours);

  let seasonalMMBtu: number;
  let heatPumpSeasonalCop = 2.5;
  const isHeatPump = top?.classId === "hp_diy_12k_115" || top?.classId === "hp_12_24k_230";
  if (input.usage.mode === "continuous") {
    seasonalMMBtu = seasonalLoadContinuous(station, tBal!, heatLoss.uaExt) / 1e6;
    if (isHeatPump) {
      heatPumpSeasonalCop = heatPumpSeasonal(station, tBal!, heatLoss.uaExt, top!.classId === "hp_12_24k_230" ? "cold_climate" : "standard", top!.capacityBtuh).seasonalCop;
    }
  } else {
    const sessionsPerSeason = input.usage.sessionsPerWeek * monthsInSeason * 4.348;
    seasonalMMBtu = (janSim.energyBtu * sessionsPerSeason) / 1e6;
  }
  const costs = costsForSeasonalLoad(seasonalMMBtu, heatLoss.qDesign, monthsInSeason, prices, heatPumpSeasonalCop);

  const roiCtx: RoiContext = { input, baseEnvelope: envelope, tOut, elevationFt, station, prices };
  const insulateFirstRows = noHeatingLoad ? [] : insulateFirst(roiCtx);
  const bundle = noHeatingLoad ? null : bundleCheapMeasures(roiCtx, insulateFirstRows);
  let fixFirstResult = null;
  // fixFirst()'s whole framing ("$X of fixes buys a smaller breaker") is about an ELECTRIC circuit shrinking;
  // for a combustion top pick (e.g. g_vented_unit) the "circuit" is a fixed blower/control nameplate rating
  // that doesn't shrink with the load at all, so there's no equivalent before/after story to tell here.
  if (top && bundle && HEATER_CLASSES[top.classId].energy === "electric") {
    // Re-rank against the smaller post-insulation load to find the equipment class fixing first actually buys.
    const afterCtx: RecommendContext = { ...recommendCtx, qReq: bundle.qAfter };
    const afterTopCandidate = rankSystems(afterCtx).recommendations[0] ?? top;
    const afterTop = HEATER_CLASSES[afterTopCandidate.classId].energy === "electric" ? afterTopCandidate : top;
    // capacityBtuh on a RankedSystem is the COMBINED output across `units` (recommend.ts's capacityBtuhFor());
    // the circuit fixFirst() sizes is a single unit's, same as recommend.ts's own per-unit circuit sizing.
    const wattsFor = (classId: (typeof top)["classId"], capacityBtuh: number, units: number) => capacityBtuh / units / etaFor(classId) / 3.412;
    fixFirstResult = fixFirst(
      roiCtx,
      insulateFirstRows,
      top.classId,
      afterTop.classId,
      wattsFor(top.classId, top.capacityBtuh, top.units),
      wattsFor(afterTop.classId, afterTop.capacityBtuh, afterTop.units),
    );
  }

  const sessions = input.usage.mode === "sessions" ? buildSessionRows(input, envelope, station, heatLoss.uaExt, uaHouse, cLight, aFloor, tGnd, warmupCapacityBtuh, prices) : undefined;

  const warnings = planWarnings(input, recommendations, whyNot);
  const code = encode(input);
  const serial = serialFor(input, code);
  const sanity = heatLoss.btuhPerFt2 > 90 ? ("check_inputs" as const) : undefined;

  const assumptions: string[] = [
    "House coupling: +40 BTU/h/degF for the garage-to-house door and interface leakage [A]",
    "Attic ventilation 3 ACH in winter; roof deck U 0.50 [A]",
    "10% sizing margin applied to qDesign to get qSize [A]",
  ];
  if (input.wallType === "unknown") assumptions.push(`Wall insulation unknown -- assumed ${envelope.wallType} [A]`);
  if (input.ceilingIns === "unknown") assumptions.push(`Ceiling insulation unknown -- assumed ${envelope.ceilingIns} [A]`);
  if (input.tightness === "unknown") assumptions.push(`Tightness unknown -- assumed ${envelope.tightness} (${heatBand.unknowns} field(s) still uncertain) [A]`);

  // "Power it" is the wiring for the electric-resistance heaters this report recommends: the top resistance pick that
  // covers the whole sized load, its own per-unit circuit, one per unit, so it can never disagree with that card.
  // rankSystems() also keeps picks that cover only part of the load (60% for keep-warm and tier-3 classes); those
  // don't count here. With no covering resistance pick (gas, diesel or heat-pump only, a partial fit, or nothing
  // fits), it falls back to the modeled heaters that cover the whole load (circuitsForLoad). It used to divide the
  // load by the warm-up class's efficiency, which for a gas or diesel top pick turned fuel INPUT into electric watts
  // and threw past an 80 A breaker.
  const resistancePick = recommendations.find((r) => {
    const cls = HEATER_CLASSES[r.classId];
    return cls.energy === "electric" && typeof cls.eta === "number" && r.circuit !== undefined && r.capacityBtuh >= Math.round(heatLoss.qSize);
  });
  const forSize = resistancePick?.circuit
    ? { spec: resistancePick.circuit, count: resistancePick.units as number }
    : circuitsForLoad(heatLoss.qSize / 3.412);
  // Load calculation: more heater load than one heater circuit carries (over 10 kW, so several circuits) needs one
  // whatever the panel size. Below that -- one heater, or a pair of plug-ins -- only a 100 A panel adding a 30 A+
  // heater load does (circuit.load_calc_threshold), judged on the heaters' total draw, not just the heat load.
  const heaterWatts = forSize.spec.watts * forSize.count;
  const panelCheck: PlannerResult["circuits"]["panelCheck"] =
    heaterWatts > MAX_HEATER_CIRCUIT_WATTS
      ? "load_calc"
      : input.panelAmps === "unknown"
        ? "unknown"
        : input.panelAmps === 100 && Math.max(heatLoss.qSize, heaterWatts * 3.412) > 20000
          ? "load_calc"
          : "ok";
  const oneCircuitCovers = heatLoss.qSize / 3.412 <= MAX_HEATER_CIRCUIT_WATTS;
  // A reader who can't add a circuit gets a pick only if it runs on their circuit (rankSystems). When none covers the
  // load, "Power it" still shows what covering it takes, but says plainly that their circuit can't -- it never
  // passes off a new circuit as the answer for someone who ruled one out (Codex review on #26).
  const beyondUserCircuit =
    !input.canAddCircuit && input.circuit !== "unknown" && (forSize.count > 1 || !circuitCovers(input.circuit, forSize.spec));

  return {
    modelVersion: MODEL_VERSION,
    code,
    serial,
    station: { ...station, distanceMi: 0 },
    prices,
    inputsEcho: input,
    assumptions,
    heating: {
      tIn: input.targetTemp,
      tOutDesign: tOut,
      deltaT: heatLoss.deltaT,
      items: heatLoss.items,
      qDesign: heatLoss.qDesign,
      qSize: heatLoss.qSize,
      kwSize: heatLoss.kwSize,
      btuhPerFt2: heatLoss.btuhPerFt2,
      band: heatBand,
      uaExt: heatLoss.uaExt,
      uaExtPerFt2: heatLoss.uaExtPerFt2,
      grade: heatLoss.grade,
      atticTempF: heatLoss.atticTempF,
      freeFloatDesignF,
      sanity,
    },
    warmup: { classId: warmupClassId, kw: Math.round((warmupCapacityBtuh / 3412) * 10) / 10, janMinutes: janSim.minutesToTarget, curve: janSim.curve },
    circuits: {
      forSize: forSize.spec,
      forSizeCount: forSize.count,
      forSizeClassId: resistancePick?.classId,
      user: input.circuit !== "unknown" ? circuitFor(circuitVolts(circuit) * circuitAmps(circuit) * 0.8, circuitVolts(circuit), circuitVolts(circuit)) : undefined,
      fits: top ? Boolean(top.circuit) : false,
      panelCheck,
      beyondUserCircuit: beyondUserCircuit || undefined,
      notes: [
        ...(beyondUserCircuit && input.circuit !== "unknown"
          ? [
              `You said you can't add a circuit, and your ${circuitLabel(input.circuit)} circuit can't carry an electric heater that covers this load. Covering it takes what's above; otherwise fix the envelope first or use a fuel-fired heater.`,
            ]
          : []),
        // The pick's own circuit notes: the plug-in "nothing else on that circuit" condition, a 208 V derate.
        ...(resistancePick?.circuit?.notes ?? []),
        ...(forSize.count > 1
          ? [
              oneCircuitCovers
                ? `Sized for the ${forSize.count} recommended heaters, each on its own circuit as above.`
                : `No single heater circuit covers this load: it takes ${forSize.count} heaters, each on its own circuit as above, a fuel-fired heater, or fixing the envelope first.`,
            ]
          : []),
        ...(input.circuit === "unknown" ? ["Circuit not yet known -- the planner will ask in step 5."] : []),
      ],
    },
    usage: { mode: input.usage.mode, seasonMonths, tBal, hddAtBal },
    costs,
    sessions,
    recommendations,
    whyNot,
    insulateFirst: insulateFirstRows,
    fixFirst: fixFirstResult,
    warnings,
  };
}
