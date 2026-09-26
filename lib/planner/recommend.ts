import type { Circuit, ClimateStation, GarageInput, HeaterClass, HeaterClassId, PriceSet, RankedSystem, WhyNot } from "./types.ts";
import { HEATER_CLASSES } from "./catalog.ts";
import { circuitFor } from "./electrical.ts";
import { balancePoint, seasonalLoadContinuous, heatPumpCapacity, heatPumpCop, heatPumpSeasonal, type HeatPumpClass } from "./seasonal.ts";
import { simulateSession } from "./warmup.ts";
import { HEAT_CONTENT } from "./fuels.ts";
import { isFlammablesYes } from "./defaults.ts";

// Recommendation ranking (planner-engineering.md §14). Pure: takes a fully-resolved context, returns the top
// 3 candidates plus "why not" lines for the notable exclusions.

const HP_CLASS_FOR: Partial<Record<HeaterClassId, HeatPumpClass>> = {
  hp_diy_12k_115: "standard",
  hp_12_24k_230: "cold_climate",
};

// Cord-and-plug portable classes -- excluded from continuous or unattended/keep-warm use unless a verified
// manualAllowsUnattendedThermostat fact exists for the specific product (none does yet in the commerce
// catalog, so this filter is unconditional for now; see BLUEPRINT.md §2.5's hard-filter note).
const CORD_CONNECTED_PORTABLE: HeaterClassId[] = ["e_port_1500", "e_ir_wall_1500", "g_unvented_buddy", "k_unvented", "torpedo"];

const CIRCUIT_VOLTS: Record<Circuit, 120 | 240> = { "120V15A": 120, "120V20A": 120, "240V20A": 240, "240V30A": 240, "240V40A": 240, "240V50A": 240, "240V60A": 240 };
const CIRCUIT_AMPS: Record<Circuit, number> = { "120V15A": 15, "120V20A": 20, "240V20A": 20, "240V30A": 30, "240V40A": 40, "240V50A": 50, "240V60A": 60 };

function circuitFits(userCircuit: Circuit, required: Circuit): boolean {
  return CIRCUIT_VOLTS[userCircuit] === CIRCUIT_VOLTS[required] && CIRCUIT_AMPS[userCircuit] >= CIRCUIT_AMPS[required];
}

const NEW_CIRCUIT_COST: [number, number] = [300, 900];

function capacityBtuhFor(cls: HeaterClass, units: number, tOut: number): number {
  const hpClass = HP_CLASS_FOR[cls.id];
  if (hpClass) return heatPumpCapacity(hpClass, tOut, cls.outputBtuh[1]) * units;
  const eta = typeof cls.eta === "number" ? cls.eta : 1;
  return cls.outputBtuh[1] * eta * units;
}

function fuelAvailable(cls: HeaterClass, input: GarageInput): boolean {
  if (cls.id === "g_vented_unit") return input.fuels.includes("natural_gas") || input.fuels.includes("propane_bulk");
  if (cls.energy === "electric") return input.fuels.includes("electric");
  return input.fuels.includes(cls.energy);
}

export type RecommendContext = {
  input: GarageInput;
  qReq: number; // Q_size, or 0.6*qSize in "edge-off" spot mode, or Q_fastWarmup when priority is 'fast'
  station: ClimateStation;
  elevationFt: number;
  tOut: number;
  uaOut: number; // exterior UA from heatLossDesign, for the continuous-mode seasonal cost
  uaHouse: number;
  prices: PriceSet;
  circuit: Circuit; // resolved (not 'unknown')
  cLight: number; // from warmup.ts's lightCapacitance, for minutesToTarget scoring
  aFloor: number;
  tStartJan: number; // free-float start temp for a January session (warmupPenalty basis)
};

// Annual/seasonal cost to run one candidate at its capacity, continuous-mode basis (§8.1/§8.3). Session-mode
// usage is approximated by scaling a representative January session's energy by the season's session count --
// a documented simplification (no per-month session simulation), unlike the continuous path which is the
// same bin-integration/HDD math already validated in seasonal.test.ts.
function annualCostForClass(cls: HeaterClass, capacityBtuh: number, ctx: RecommendContext): number {
  const { input, station, uaOut, uaHouse, prices } = ctx;
  const hpClass = HP_CLASS_FOR[cls.id];

  if (input.usage.mode === "continuous") {
    const tBal = balancePoint(input.targetTemp, uaHouse, input.tHouse, uaOut);
    if (hpClass) {
      const seasonal = heatPumpSeasonal(station, tBal, uaOut, hpClass, cls.outputBtuh[1]);
      return seasonal.inputKwh * prices.elecPerKwh;
    }
    const seasonalBtu = seasonalLoadContinuous(station, tBal, uaOut);
    return costOfDeliveredBtu(cls, seasonalBtu, prices);
  }

  // Sessions: scale a representative January session's input energy by sessions/season.
  const sessionsPerSeason = estimateSessionsPerSeason(input, station);
  const janTOut = station.tMean[0] + 4;
  const tStart = ctx.tStartJan;
  const sim = simulateSession({
    uaOut, uaHouse, tOut: janTOut, tHouse: input.tHouse, tStart,
    tGnd: station.tMean.reduce((a, b) => a + b, 0) / 12, tTarget: input.targetTemp,
    capacityBtuh, hours: input.usage.hoursPerSession || 4, cLight: ctx.cLight, aFloor: ctx.aFloor,
  });
  if (hpClass) {
    const cop = heatPumpCop(hpClass, janTOut) || 1;
    const inputKwh = (sim.energyBtu / cop / HEAT_CONTENT.btuPerKwh) * sessionsPerSeason;
    return inputKwh * prices.elecPerKwh;
  }
  return costOfDeliveredBtu(cls, sim.energyBtu * sessionsPerSeason, prices);
}

function estimateSessionsPerSeason(input: GarageInput, station: ClimateStation): number {
  const seasonMonths = station.tMean.filter((t) => t < input.targetTemp - 5).length;
  const seasonWeeks = seasonMonths * 4.348;
  return input.usage.sessionsPerWeek * seasonWeeks;
}

function costOfDeliveredBtu(cls: HeaterClass, deliveredBtu: number, prices: PriceSet): number {
  const eta = typeof cls.eta === "number" ? cls.eta : 1;
  const inputBtu = deliveredBtu / eta;
  switch (cls.energy) {
    case "electric":
      return (inputBtu / HEAT_CONTENT.btuPerKwh) * prices.elecPerKwh;
    case "natural_gas":
      return (inputBtu / HEAT_CONTENT.ngBtuPerTherm) * prices.ngPerTherm;
    case "propane_bulk":
      return (inputBtu / HEAT_CONTENT.propaneBtuPerGal) * prices.propanePerGal;
    case "propane_cylinder":
      return (inputBtu / HEAT_CONTENT.propaneBtuPerGal) * prices.propaneCylPerGal;
    case "diesel":
      return (inputBtu / HEAT_CONTENT.dieselBtuPerGal) * prices.dieselPerGal;
    case "kerosene":
      return (inputBtu / HEAT_CONTENT.keroseneBtuPerGal) * prices.keroPerGal;
  }
}

function minutesToTargetFor(cls: HeaterClass, capacityBtuh: number, ctx: RecommendContext): number | null {
  const { station, uaOut, uaHouse, input } = ctx;
  const janTOut = station.tMean[0] + 4;
  const sim = simulateSession({
    uaOut, uaHouse, tOut: janTOut, tHouse: input.tHouse, tStart: ctx.tStartJan,
    tGnd: station.tMean.reduce((a, b) => a + b, 0) / 12, tTarget: input.targetTemp,
    capacityBtuh, hours: 4, cLight: ctx.cLight, aFloor: ctx.aFloor,
  });
  return sim.minutesToTarget;
}

const PRIORITY_WEIGHT: Record<GarageInput["priority"], { upfront: number; annual: number; warmup: number }> = {
  upfront: { upfront: 2, annual: 1, warmup: 1 },
  running: { upfront: 1, annual: 2, warmup: 1 },
  fast: { upfront: 1, annual: 1, warmup: 3 },
  balanced: { upfront: 1, annual: 1, warmup: 1 },
};

function mid(range: [number, number]): number {
  return (range[0] + range[1]) / 2;
}

export type Candidate = { classId: HeaterClassId; units: 1 | 2 | 3; capacityBtuh: number; fitPct: number; circuitCost: number; circuitSpec: RankedSystem["circuit"]; annualCost: number; minutesToTarget: number | null; tco5: number };

export function rankSystems(ctx: RecommendContext): { recommendations: RankedSystem[]; whyNot: WhyNot[] } {
  const { input, qReq } = ctx;
  const candidates: Candidate[] = [];
  const excludedReasons = new Map<HeaterClassId, string>();

  for (const cls of Object.values(HEATER_CLASSES)) {
    if (cls.neverRecommend) {
      excludedReasons.set(cls.id, cls.id === "torpedo" ? "Open-flame forced-air heaters are never recommended for an enclosed garage." : "Not recommended: an unvented kerosene heater has real CO and fire risk indoors.");
      continue;
    }
    if (!fuelAvailable(cls, input)) {
      excludedReasons.set(cls.id, `Needs ${cls.energy.replace("_", " ")}, which isn't listed as available.`);
      continue;
    }
    if (cls.vented && !input.ventingPossible) {
      excludedReasons.set(cls.id, "Needs an exterior wall for venting, which isn't available here.");
      continue;
    }
    const isUnattendedContinuousUse = input.usage.mode === "continuous" || input.useCase === "car" || input.useCase === "keep";
    if (CORD_CONNECTED_PORTABLE.includes(cls.id) && isUnattendedContinuousUse) {
      excludedReasons.set(cls.id, "A cord-and-plug portable isn't rated for continuous or unattended heating -- a hardwired, thermostat-controlled class is built for that instead.");
      continue;
    }

    const maxUnits = cls.id === "e_port_1500" || cls.id === "e_ir_wall_1500" ? 3 : 2;
    let best: Candidate | null = null;
    for (let units = 1; units <= maxUnits; units++) {
      const capacityBtuh = capacityBtuhFor(cls, units, ctx.tOut);
      const edgeOff = input.priority !== "fast" && (cls.tier === 3 || input.useCase === "keep");
      const threshold = edgeOff ? qReq * 0.6 : qReq;
      if (capacityBtuh < threshold) continue;

      let circuitCost = 0;
      let circuitSpec: RankedSystem["circuit"];
      if (cls.circuit) {
        // Per-UNIT wattage: each unit is its own circuit, not `units` heaters sharing one bigger breaker.
        const perUnitCapacityBtuh = capacityBtuhFor(cls, 1, ctx.tOut);
        const requiredWatts = perUnitCapacityBtuh / (typeof cls.eta === "number" ? cls.eta : 1) / 3.412;
        const volts = CIRCUIT_VOLTS[cls.circuit] as 120 | 240;
        circuitSpec = circuitFor(requiredWatts, volts, volts);
        const fits = circuitFits(ctx.circuit, cls.circuit);
        if (!fits) {
          if (!input.canAddCircuit) continue; // excluded for this unit count; a different class may still fit
          circuitCost = mid(NEW_CIRCUIT_COST) * units; // every unit needs its own new circuit here
        } else if (units > 1) {
          circuitCost = mid(NEW_CIRCUIT_COST) * (units - 1); // the existing circuit covers one unit
        }
      }

      const annualCost = annualCostForClass(cls, capacityBtuh, ctx);
      const minutesToTarget = minutesToTargetFor(cls, capacityBtuh, ctx);
      const w = PRIORITY_WEIGHT[input.priority];
      const equipInstall = mid(cls.equip) + mid(cls.install) + circuitCost;
      const warmupPenaltyBase = input.usage.mode === "sessions" && minutesToTarget != null ? 2 * Math.max(0, minutesToTarget - input.warmupGoalMin) * (estimateSessionsPerSeason(input, ctx.station) / 10) : 0;
      const tco5 = equipInstall * w.upfront + 5 * annualCost * w.annual + warmupPenaltyBase * w.warmup;

      const candidate: Candidate = { classId: cls.id, units: units as 1 | 2 | 3, capacityBtuh, fitPct: Math.round((qReq / capacityBtuh) * 100), circuitCost, circuitSpec, annualCost, minutesToTarget, tco5 };
      if (!best || candidate.tco5 < best.tco5) best = candidate;
    }
    if (best) candidates.push(best);
    else if (!excludedReasons.has(cls.id)) excludedReasons.set(cls.id, "No unit count of this class both fits the circuit and covers the load here.");
  }

  candidates.sort((a, b) => a.tco5 - b.tco5);
  const top = candidates.slice(0, 3);

  const recommendations: RankedSystem[] = top.map((c) => {
    const cls = HEATER_CLASSES[c.classId];
    const flammables = isFlammablesYes(input.flammablesStored);
    const safetyLineParts: string[] = [];
    if (flammables) safetyLineParts.push("Manual: not where gasoline, paint or flammable liquids are used or stored. Move them to an outdoor shed or cabinet first.");
    if (cls.id === "e_ir_240" || cls.id === "e_240_4k" || cls.id === "e_240_5k" || cls.id === "e_240_7k5" || cls.id === "e_240_10k") safetyLineParts.push("Elements at least 18 in above the floor (IRC M1307.3).");
    return {
      classId: c.classId,
      units: c.units,
      capacityBtuh: Math.round(c.capacityBtuh),
      fitPct: c.fitPct,
      tier: cls.tier,
      circuit: c.circuitSpec,
      costPerHour: Math.round((c.annualCost / Math.max(1, estimateAnnualHours(input, ctx.station))) * 100) / 100,
      perSeason: Math.round(c.annualCost),
      tco5: Math.round(c.tco5),
      upfront: [Math.round(cls.equip[0] + cls.install[0] + c.circuitCost), Math.round(cls.equip[1] + cls.install[1] + c.circuitCost)],
      minutesToTarget: c.minutesToTarget,
      why: whyFor(cls, c, input),
      safetyLine: safetyLineParts.length > 0 ? safetyLineParts.join(" ") : undefined,
      attachCoAlarm: cls.vented || cls.energy !== "electric",
      productIds: cls.productIds,
    };
  });

  const whyNot: WhyNot[] = [];
  for (const [classId, text] of excludedReasons) {
    if (classId === "torpedo" || classId === "diesel_air" || (classId === "e_port_1500" && input.priority !== "upfront")) {
      whyNot.push({ classId, text });
    }
  }
  // Always surface torpedo and diesel exclusions even if the loop above didn't naturally reach them (they may
  // have been excluded for a different reason than the primary "why not" line calls for).
  if (!whyNot.some((w) => w.classId === "torpedo")) whyNot.push({ classId: "torpedo", text: "Open-flame forced-air heaters are never recommended for an enclosed garage." });
  if (input.attached && !whyNot.some((w) => w.classId === "diesel_air")) whyNot.push({ classId: "diesel_air", text: "No UL/CSA listing for building heat -- not recommended as a permanent install in an attached garage." });

  return { recommendations, whyNot };
}

function estimateAnnualHours(input: GarageInput, station: ClimateStation): number {
  if (input.usage.mode === "continuous") {
    const seasonMonths = station.tMean.filter((t) => t < input.targetTemp - 5).length;
    return seasonMonths * 30.44 * 24;
  }
  return input.usage.sessionsPerWeek * input.usage.hoursPerSession * 52;
}

function whyFor(cls: HeaterClass, c: Candidate, input: GarageInput): string {
  if (cls.tier === 1 && cls.energy === "electric" && !HP_CLASS_FOR[cls.id]) return `Covers ${c.fitPct}% of the design load on a circuit you can run today or add easily.`;
  if (HP_CLASS_FOR[cls.id]) return "Also cools in summer, and typically the lowest 5-year cost once the envelope is reasonable.";
  if (cls.vented) return "Vented, licensed-install gas heat for a cold climate or a bare envelope.";
  return `Fits ${input.useCase ?? "your"} use at this garage's size.`;
}
