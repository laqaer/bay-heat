import type { GarageInput, Measure, PriceSet, RoiRow, FixFirst, Grade, HeaterClassId } from "./types.ts";
import type { ClimateStation } from "./types.ts";
import { heatLossDesign, type ResolvedEnvelope } from "./heatLoss.ts";
import { balancePoint, seasonalLoadContinuous } from "./seasonal.ts";
import { circuitFor } from "./electrical.ts";
import { geometry } from "./geometry.ts";
import { HOUSE_COUPLING_UA, WALL_U } from "./constants.ts";
import { heaterClass } from "./catalog.ts";

// Insulate-first ROI (planner-engineering.md §15). Every measure is evaluated against the SAME baseline
// envelope (not applied sequentially on top of each other), which is why the published "all three cheap
// measures" figure equals the exact sum of the three individual deltas -- validated to the BTU against T3/T4
// and the §15 worked table (see roi.test.ts).

export const MEASURE_LABEL: Record<Measure, string> = {
  weatherstrip: "Weatherstrip package (bottom seal, perimeter stop, service-door kit)",
  door_kit_eps: "EPS/fiberglass garage door insulation kit",
  door_kit_reflective: "Reflective garage door insulation kit",
  ceiling_r30: "Blow R-30 cellulose/fiberglass on the ceiling",
  attic_hatch: "Attic hatch weatherstrip gasket",
  new_pu_door: "Replace with a new R-18.4 polyurethane garage door",
  wall_batts: "Batt-insulate the walls to R-13",
};

// DIY mid-point costs [A], §15. wall_batts scales with wall area instead of a flat figure.
const FIXED_COST: Partial<Record<Measure, number>> = {
  weatherstrip: 125,
  door_kit_eps: 120,
  door_kit_reflective: 80,
  ceiling_r30: 430,
  attic_hatch: 20,
  new_pu_door: 2200,
};
const WALL_BATT_COST_PER_FT2 = 3.25; // midpoint of $2.50-4.00/ft2

const MEASURE_PRODUCT_IDS: Record<Measure, string[]> = {
  weatherstrip: ["seal-bottom-t-16ft", "seal-retainer-kit", "seal-perimeter-stop", "seal-service-door-kit"],
  door_kit_eps: ["door-kit-eps-matador", "door-kit-eps-cellofoam"],
  door_kit_reflective: ["door-kit-reflective-owens-corning", "door-kit-reflective-reach-barrier"],
  ceiling_r30: [],
  attic_hatch: ["attic-hatch-gasket"],
  new_pu_door: [],
  wall_batts: [],
};

function envelopeWithMeasure(base: ResolvedEnvelope, measure: Measure): ResolvedEnvelope | null {
  switch (measure) {
    case "ceiling_r30":
      return base.ceilingIns === "R30" ? null : { ...base, ceilingIns: "R30" };
    case "door_kit_eps":
      return { ...base, doorTypes: base.doorTypes.map(() => "kit_eps_or_batt") };
    case "door_kit_reflective":
      return { ...base, doorTypes: base.doorTypes.map(() => "kit_reflective") };
    case "new_pu_door":
      return { ...base, doorTypes: base.doorTypes.map(() => "steel_pu_1_375") };
    case "weatherstrip": {
      const order = ["very_leaky", "leaky", "average", "tight"] as const;
      const i = order.indexOf(base.tightness as (typeof order)[number]);
      return i === -1 || i >= order.length - 1 ? null : { ...base, tightness: order[i + 1] };
    }
    case "wall_batts": {
      const uninsulated: ResolvedEnvelope["wallType"][] = ["open_studs", "uninsulated_finished", "cmu8_uninsulated", "metal_uninsulated"];
      return uninsulated.includes(base.wallType) ? { ...base, wallType: "R13" } : null;
    }
    case "attic_hatch":
      return null; // modeled as a small fixed load reduction below, not an envelope change
  }
}

// A small fixed load reduction for the one measure too minor to model through the main envelope fields [A]:
// sealing a single attic-hatch penetration is a modest, roughly constant BTU/h saving, not proportional to
// anything else in the model.
const ATTIC_HATCH_DQ_DESIGN = 250;

function costFor(measure: Measure, input: GarageInput): number {
  if (measure === "wall_batts") {
    const geo = geometry(input);
    return Math.round(geo.aWallNet * WALL_BATT_COST_PER_FT2);
  }
  return FIXED_COST[measure] ?? 0;
}

function seasonalMMBtu(input: GarageInput, envelope: ResolvedEnvelope, tOut: number, elevationFt: number, station: ClimateStation, targetTemp: number): number {
  const synthetic = heatLossDesign({ ...input, targetTemp: tOut + 1 }, envelope, tOut, elevationFt);
  const uaOut = synthetic.uaExt;
  const uaHouse = input.attached ? WALL_U[envelope.wallType] * input.commonWallLen * input.height + HOUSE_COUPLING_UA : 0;
  const tBal = balancePoint(targetTemp, uaHouse, input.tHouse, uaOut);
  return seasonalLoadContinuous(station, tBal, uaOut) / 1e6;
}

// The $ difference in equipment-cost range between two catalog classes, e.g. a 10 kW class vs a 5 kW class
// after insulating -- what fixing the envelope first actually buys, not just lower energy bills.
function equipmentSavingsFor(classBefore: HeaterClassId, classAfter: HeaterClassId): [number, number] {
  const before = heaterClass(classBefore).equip;
  const after = heaterClass(classAfter).equip;
  return [Math.max(0, before[0] - after[0]), Math.max(0, before[1] - after[1])];
}

export type RoiContext = { input: GarageInput; baseEnvelope: ResolvedEnvelope; tOut: number; elevationFt: number; station: ClimateStation; prices: PriceSet };

// One RoiRow per applicable measure (a measure that's already maxed out -- e.g. ceiling already R-30 -- is
// left out, not returned with a zero delta).
export function insulateFirst(ctx: RoiContext): RoiRow[] {
  const { input, baseEnvelope, tOut, elevationFt, station, prices } = ctx;
  const base = heatLossDesign(input, baseEnvelope, tOut, elevationFt);
  const baseSeasonMMBtu = seasonalMMBtu(input, baseEnvelope, tOut, elevationFt, station, input.targetTemp);

  const measures: Measure[] = ["weatherstrip", "door_kit_eps", "door_kit_reflective", "ceiling_r30", "attic_hatch", "new_pu_door", "wall_batts"];
  const rows: RoiRow[] = [];
  for (const measure of measures) {
    let dQDesign: number;
    let dMMBtu: number;
    if (measure === "attic_hatch") {
      dQDesign = ATTIC_HATCH_DQ_DESIGN;
      dMMBtu = (dQDesign / base.qDesign) * baseSeasonMMBtu; // proportional approximation for a load too small to model directly
    } else {
      const measureEnvelope = envelopeWithMeasure(baseEnvelope, measure);
      if (!measureEnvelope) continue; // not applicable (already at or past this measure)
      const withMeasure = heatLossDesign(input, measureEnvelope, tOut, elevationFt);
      dQDesign = base.qDesign - withMeasure.qDesign;
      if (dQDesign <= 0) continue;
      dMMBtu = baseSeasonMMBtu - seasonalMMBtu(input, measureEnvelope, tOut, elevationFt, station, input.targetTemp);
    }
    const cost = costFor(measure, input);
    const elecSavings = (dMMBtu * 1e6) / 3412 * prices.elecPerKwh;
    const gasSavings = ((dMMBtu * 10) / 0.8) * prices.ngPerTherm; // 1 MMBtu = 10 therms; 80% AFUE vented gas
    rows.push({
      measure,
      cost,
      dQDesign: Math.round(dQDesign),
      pctOfLoad: Math.round((dQDesign / base.qDesign) * 100),
      dMMBtu: Math.round(dMMBtu * 10) / 10,
      savingsPerYear: { electric: Math.round(elecSavings), gas: Math.round(gasSavings) },
      paybackYears: {
        electric: elecSavings > 0 ? Math.round((cost / elecSavings) * 10) / 10 : Infinity,
        gas: gasSavings > 0 ? Math.round((cost / gasSavings) * 10) / 10 : Infinity,
      },
      productIds: MEASURE_PRODUCT_IDS[measure],
    });
  }
  return rows.sort((a, b) => a.paybackYears.electric - b.paybackYears.electric);
}

// The "$X of fixes first" card (planner-engineering.md §15's headline framing): the cheap measures with
// payback under `maxPaybackYears` (electric basis), applied together, and what that buys in equipment class
// and circuit -- not just dollars, since occasional users save far more in capacity than in energy.
export function fixFirst(
  ctx: RoiContext,
  rows: RoiRow[],
  classBefore: HeaterClassId,
  classAfter: HeaterClassId,
  ratedWattsBefore: number,
  ratedWattsAfter: number,
  maxPaybackYears = 3,
): FixFirst | null {
  const { input, baseEnvelope, tOut, elevationFt } = ctx;
  // The bundle is exactly planner-engineering.md §15's own worked "all three cheap measures": weatherstrip,
  // one door treatment (door_kit_eps, not door_kit_reflective -- they treat the same door, so only one
  // belongs in a combined bundle), and the ceiling. attic_hatch, new_pu_door and wall_batts stay available as
  // individual RoiRows but aren't folded into this bundle.
  const BUNDLE_MEASURES: Measure[] = ["weatherstrip", "door_kit_eps", "ceiling_r30"];
  const cheap = rows.filter((r) => BUNDLE_MEASURES.includes(r.measure) && r.paybackYears.electric <= maxPaybackYears);
  if (cheap.length === 0) return null;

  let envelope = { ...baseEnvelope };
  for (const row of cheap) {
    const next = envelopeWithMeasure(envelope, row.measure);
    if (next) envelope = next;
  }
  const before = heatLossDesign(input, baseEnvelope, tOut, elevationFt);
  const after = heatLossDesign(input, envelope, tOut, elevationFt);
  const cost = cheap.reduce((sum, r) => sum + r.cost, 0);
  const savingsPerYear = cheap.reduce((sum, r) => sum + r.savingsPerYear.electric, 0);

  const gradeBefore: Grade = before.grade;
  const gradeAfter: Grade = after.grade;

  return {
    measures: cheap.map((r) => r.measure),
    cost,
    qBefore: Math.round(before.qSize),
    qAfter: Math.round(after.qSize),
    gradeBefore,
    gradeAfter,
    classBefore,
    classAfter,
    circuitBefore: circuitFor(ratedWattsBefore, 240, 240),
    circuitAfter: circuitFor(ratedWattsAfter, 240, 240),
    equipmentSavings: equipmentSavingsFor(classBefore, classAfter),
    runningSavingsPerYear: savingsPerYear,
  };
}
