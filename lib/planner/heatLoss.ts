import type { GarageInput, LoadKey, Grade } from "./types.ts";
import type { ClimateStation } from "./types.ts";
import {
  WALL_U,
  CEILING_U,
  ROOF_U,
  DOOR_U,
  WINDOW_U,
  SERVICE_DOOR_U,
  SLAB_F,
  TIGHTNESS_ACH,
  HOUSE_COUPLING_UA,
  ATTIC_VENT_ACH,
  ATTIC_ROOF_DECK_U,
  SIZING_MARGIN,
  INFILTRATION_K,
} from "./constants.ts";
import { geometry } from "./geometry.ts";
import { altitudeFactor, annualMeanTemp } from "./climate.ts";

// The "unknown" resolver: when a field is 'unknown', callers must resolve it via lib/planner/defaults.ts or
// lib/planner/uncertainty.ts BEFORE calling heatLossDesign -- this module takes only fully-resolved values,
// so its formulas stay identical to planner-engineering.md §4 with no branching on "unknown".
export type ResolvedEnvelope = {
  wallType: keyof typeof WALL_U;
  ceilingIns: keyof typeof CEILING_U;
  doorTypes: (keyof typeof DOOR_U)[];
  tightness: keyof typeof TIGHTNESS_ACH;
};

export type HeatLossResult = {
  items: { key: LoadKey; btuh: number; pct: number }[];
  qDesign: number;
  qSize: number;
  kwSize: number;
  btuhPerFt2: number;
  uaExt: number;
  uaExtPerFt2: number;
  grade: Grade;
  atticTempF?: number;
  deltaT: number;
};

// BayGrade thresholds (planner-engineering.md §2.5 / BLUEPRINT.md §2.5). A computed metric, never a review score.
export function gradeFor(uaExtPerFt2: number): Grade {
  if (uaExtPerFt2 <= 0.38) return "A";
  if (uaExtPerFt2 <= 0.62) return "B";
  if (uaExtPerFt2 <= 0.9) return "C";
  if (uaExtPerFt2 <= 1.25) return "D";
  return "F";
}

// The core heat-load calculation (§4.2-§4.7). tOut is the design outdoor dry-bulb (h99, h996, or h99+5 for
// daytime-only use -- the caller decides which and passes it in). Pure and side-effect free.
export function heatLossDesign(input: GarageInput, envelope: ResolvedEnvelope, tOut: number, elevationFt: number): HeatLossResult {
  const geo = geometry(input);
  const tIn = input.targetTemp;
  const deltaT = tIn - tOut;

  const uWall = WALL_U[envelope.wallType];
  const q_wall = uWall * geo.aWallNet * deltaT;

  const q_gdoor = input.garageDoors.reduce((sum, gd, i) => {
    const doorType = envelope.doorTypes[i] ?? envelope.doorTypes[0];
    return sum + DOOR_U[doorType] * gd.w * gd.h * deltaT;
  }, 0);

  const q_window = WINDOW_U[input.windowType] * input.windowsFt2 * deltaT;
  const q_svcdoor = SERVICE_DOOR_U[input.serviceDoorType] * input.serviceDoorFt2 * deltaT;

  // House coupling (§4.3): negative when the house is warmer than the garage target (heat gain).
  const uaHouse = input.attached ? uWall * input.commonWallLen * input.height + HOUSE_COUPLING_UA : 0;
  const q_house = input.attached ? uaHouse * (tIn - input.tHouse) : 0;

  // Ceiling: three cases (§4.3-§4.4).
  let q_ceiling = 0;
  let atticTempF: number | undefined;
  if (input.ceilingType === "conditioned_above") {
    q_ceiling = CEILING_U[envelope.ceilingIns] * geo.aFloor * (tIn - input.tHouse);
  } else if (input.ceilingType === "open_rafters") {
    q_ceiling = ROOF_U[input.roofType] * geo.aFloor * geo.pitchFactor * deltaT;
  } else {
    // Vented attic in series with the outdoors (§4.4): the attic buffers the ceiling loss.
    const uaC = CEILING_U[envelope.ceilingIns] * geo.aFloor;
    const vAttic = geo.aFloor * (geo.rise / 2);
    const uaAo = ATTIC_ROOF_DECK_U * geo.aFloor * geo.pitchFactor + INFILTRATION_K * altitudeFactor(elevationFt) * vAttic * ATTIC_VENT_ACH;
    const uaCeilEff = 1 / (1 / uaC + 1 / uaAo);
    q_ceiling = uaCeilEff * deltaT;
    atticTempF = tOut + (uaC / (uaC + uaAo)) * deltaT;
  }

  // Slab-on-grade perimeter (§4.5). The door opening counts as part of the perimeter; commonWallLen is
  // already excluded from lExt (geometry.ts), matching "L_ext excludes the common wall".
  const q_slab = SLAB_F[input.slabEdge] * geo.lExt * deltaT;

  // Infiltration (§4.6).
  const ach = TIGHTNESS_ACH[envelope.tightness];
  const fAlt = altitudeFactor(elevationFt);
  const q_inf = INFILTRATION_K * fAlt * geo.volume * ach * deltaT;

  const qDesign = q_wall + q_gdoor + q_window + q_svcdoor + q_ceiling + q_slab + q_inf + q_house;
  const qSize = SIZING_MARGIN * qDesign;

  const items: { key: LoadKey; btuh: number }[] = [
    { key: "walls", btuh: q_wall },
    { key: "garage_doors", btuh: q_gdoor },
    { key: "windows", btuh: q_window },
    { key: "service_door", btuh: q_svcdoor },
    { key: "ceiling_roof", btuh: q_ceiling },
    { key: "slab_edge", btuh: q_slab },
    { key: "infiltration", btuh: q_inf },
    { key: "house_coupling", btuh: q_house },
  ];

  // BayGrade: UA_ext / A_floor, house wall excluded, independent of climate (§2.5). UA_ext is every
  // exterior-coupled UA term (not house coupling), computed at deltaT=1 for a clean per-degree UA.
  const uaExt = deltaT !== 0 ? (qDesign - q_house) / deltaT : 0;
  const uaExtPerFt2 = uaExt / geo.aFloor;

  return {
    items: items.map((it) => ({ ...it, pct: qDesign !== 0 ? Math.round((it.btuh / qDesign) * 100) : 0 })),
    qDesign,
    qSize,
    kwSize: qSize / 3412,
    btuhPerFt2: qDesign / geo.aFloor,
    uaExt,
    uaExtPerFt2,
    grade: gradeFor(uaExtPerFt2),
    atticTempF,
    deltaT,
  };
}

// Free-float (unheated) garage temperature (§4.10) -- also the session model's starting state.
export function freeFloatTemp(input: GarageInput, envelope: ResolvedEnvelope, tOut: number, elevationFt: number, station: ClimateStation, massDamping = 7): number {
  const geo = geometry(input);
  const uWall = WALL_U[envelope.wallType];
  const uaHouse = input.attached ? uWall * input.commonWallLen * input.height + HOUSE_COUPLING_UA : 0;
  // UA_out: every exterior-coupled UA term evaluated at deltaT=1 (reuse heatLossDesign's per-degree UA logic
  // by calling it at a synthetic 1 degF delta so BTU/h figures equal the UA directly).
  const synthetic = heatLossDesign({ ...input, targetTemp: tOut + 1 }, envelope, tOut, elevationFt);
  const uaOut = synthetic.uaExt;
  const uaGnd = 0.1 * geo.aFloor;
  const tGnd = annualMeanTemp(station);
  const numerator = uaOut * (tOut + massDamping) + uaHouse * input.tHouse + uaGnd * tGnd;
  const denominator = uaOut + uaHouse + uaGnd;
  return denominator !== 0 ? numerator / denominator : tOut;
}
