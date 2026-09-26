// W0 stub data (feasibility red-team finding #1): every content lane needs real-shaped GarageInput /
// PlannerResult numbers to build against before the real engine (W1 physics, W2 decisions) lands. This file
// is that fixture. modelVersion is pinned to '0.0.0-stub' so scripts/check-stubs.mjs can fail the merge to
// main if any indexable page still imports it once the real plan() ships.
//
// Numbers are the "worked example A" from company/BLUEPRINT.md §0.2 and company/research/planner-engineering.md
// §6 (24x24x9 attached 2-car, R-13 walls, uninsulated steel door, average drafts, Chicago, 55degF target).
// Where the source documents didn't pin an exact figure (a few CostRow entries, the warm-up curve's
// intermediate points), the value here is a labeled, order-of-magnitude placeholder -- W1/W2 replace this
// whole file's *content* with a real plan() call; they must not change its *exported names*.

import type { GarageInput, PlannerResult, Station, PriceSet } from "./types.ts";

export const EXAMPLE_A_STATION: Station = {
  id: "IL-chicago",
  st: "IL",
  city: "Chicago",
  wmo: "725300",
  lat: 41.96,
  lon: -87.932,
  elevFt: 662,
  h996: -1.7,
  h99: 3.3,
  c1: 88.5,
  c1mcwb: 72.8,
  dr: 17.6,
  hr1: 124.0,
  hdd50: 2961,
  hdd65: 6157,
  cdd65: 919,
  zone: "5A",
  primary: true,
  tMean: [24.1, 27.8, 38.1, 49.1, 59.7, 69.8, 74.6, 73.1, 66.0, 53.7, 40.7, 29.7],
  tSd: [11.77, 11.35, 10.98, 9.11, 8.89, 7.41, 5.85, 5.27, 7.53, 8.81, 9.63, 10.71],
  distanceMi: 0,
};

export const EXAMPLE_A_PRICES: PriceSet = {
  state: "IL",
  elecPerKwh: 0.1922,
  ngPerTherm: 1.086,
  propanePerGal: 2.026,
  propaneCylPerGal: 3.0, // [E] exchange-cylinder premium over bulk; status 'verify' in lib/facts/fuels.ts
  heatingOilPerGal: 5.535,
  dieselPerGal: 6.68,
  keroPerGal: 6.535, // [E] heatingOilPerGal + $1.00 per the assumptions register
  propaneSrc: "state",
  asOf: { elec: "2026-07", ng: "2026-01", propane: "2026-09", diesel: "2026-09" },
  sources: ["eia-electric-power-monthly", "eia-ng-annual", "eia-propane-weekly", "eia-diesel-weekly"],
};

export const EXAMPLE_A_INPUT: GarageInput = {
  v: 1,
  zip3: "606",
  state: "IL",
  stationId: "IL-chicago",
  preset: "2car",
  width: 24,
  depth: 24,
  height: 9,
  roofPitch: 6,
  attached: true,
  commonWallLen: 24,
  wallType: "R13",
  ceilingType: "attic",
  ceilingIns: "drywall_uninsulated",
  roofType: "shingle_deck_uninsulated",
  garageDoors: [{ w: 16, h: 7, type: "steel_single" }],
  windowsFt2: 12,
  windowType: "single_metal",
  serviceDoorFt2: 20,
  serviceDoorType: "hollow_wood",
  slabEdge: "none",
  tightness: "average",
  flammablesStored: "unknown",
  tHouse: 68,
  targetTemp: 55,
  useCase: "shop",
  usage: { mode: "continuous", sessionsPerWeek: 0, hoursPerSession: 0, doorOpeningsPerSession: 0 },
  warmupGoalMin: 60,
  circuit: "unknown",
  canAddCircuit: true,
  panelAmps: 200,
  fuels: ["electric"],
  ventingPossible: false,
  priority: "balanced",
  wantsCooling: false,
};

// PlannerResult for EXAMPLE_A_INPUT "as-is" (before any fix-first measures). See BLUEPRINT.md §0.2 row "As-is":
// 31,742 BTU/h, 9.3 kW, grade D (UA_ext/ft2 0.995), 10 kW class, 240V/60A/6AWG.
export const EXAMPLE_A_RESULT: PlannerResult = {
  modelVersion: "0.0.0-stub",
  code: "1.606.2A.24x24x9n1.w13.cd0.ds.ta.55c.cu.fE.pb",
  serial: "R-2A-606-STUB",
  station: EXAMPLE_A_STATION,
  prices: EXAMPLE_A_PRICES,
  inputsEcho: EXAMPLE_A_INPUT,
  assumptions: [
    "House coupling: +40 BTU/h/degF for the garage-to-house door and interface leakage [A]",
    "Attic ventilation 3 ACH in winter; roof deck U 0.50 [A]",
    "10% sizing margin applied to qDesign to get qSize [A]",
    "Tightness 'average' (2.5 ACH design-condition natural ACH) [A]",
  ],
  heating: {
    tIn: 55,
    tOutDesign: 3.3,
    deltaT: 51.7,
    items: [
      { key: "walls", btuh: 2319, pct: 8 },
      { key: "garage_doors", btuh: 6659, pct: 23 },
      { key: "windows", btuh: 650, pct: 2 },
      { key: "service_door", btuh: 487, pct: 2 },
      { key: "ceiling_roof", btuh: 9729, pct: 34 },
      { key: "slab_edge", btuh: 2717, pct: 9 },
      { key: "infiltration", btuh: 7065, pct: 24 },
      { key: "house_coupling", btuh: -770, pct: -3 },
    ],
    qDesign: 28856,
    qSize: 31742,
    kwSize: 9.3,
    btuhPerFt2: 55.1,
    band: { low: 28400, mid: 31742, high: 37500, unknowns: 0 },
    uaExt: 573,
    uaExtPerFt2: 0.995,
    grade: "D",
    atticTempF: 26.8,
    freeFloatDesignF: 10.3,
  },
  warmup: {
    // [E] placeholder class: qSize (31,742) exceeds the 7.5 kW class's rated output (25,590 BTU/h). T8's test
    // vector (116 min from a 7.5 kW unit) is used here as the closest sourced number; W2's real rankSystems()
    // resolves whether "as-is" plate 1 is 7.5 kW (undersized, "why not" case) or 10 kW.
    classId: "e_240_7k5",
    kw: 7.5,
    janMinutes: 116,
    curve: [
      [0, 33.4],
      [30, 42.1],
      [60, 48.6],
      [90, 52.9],
      [116, 55],
    ],
  },
  circuits: {
    forSize: {
      watts: 10000,
      volts: 240,
      amps: 41.7,
      minAmps: 52.1,
      breakerA: 60,
      wireNM: "4 AWG",
      wireTHHN: "6 AWG",
      gfciReceptacle: false,
      notes: ["Fixed heater, not a receptacle: NEC 424.4(B) continuous-load sizing, not 210.8(A) GFCI."],
    },
    fits: false,
    panelCheck: "unknown",
    notes: ["Circuit not yet known -- the planner will ask in step 5."],
  },
  usage: { mode: "continuous", seasonMonths: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"], tBal: 53.66, hddAtBal: 3888 },
  costs: [
    { system: "electric_resistance", eta: 1.0, unitPrice: 0.1922, unit: "$/kWh", perHour: 0.96, perMonth: 331, perSeason: 1725, perMMBtu: 56.3 },
    { system: "propane_bulk_80", eta: 0.8, unitPrice: 2.026, unit: "$/gal", perHour: 0.46, perMonth: 158, perSeason: 826, perMMBtu: 27.7 },
    { system: "diesel_78", eta: 0.78, unitPrice: 6.68, unit: "$/gal", perHour: 1.05, perMonth: 361, perSeason: 1888, perMMBtu: 61.9 },
  ],
  recommendations: [],
  whyNot: [],
  insulateFirst: [
    {
      measure: "ceiling_r30",
      cost: 430,
      dQDesign: 8735,
      pctOfLoad: 30,
      dMMBtu: 15.7,
      savingsPerYear: { electric: 886, gas: 214 },
      paybackYears: { electric: 0.5, gas: 2.0 },
      productIds: [],
    },
    {
      measure: "door_kit_eps",
      cost: 120,
      dQDesign: 4748,
      pctOfLoad: 16,
      dMMBtu: 8.6,
      savingsPerYear: { electric: 482, gas: 116 },
      paybackYears: { electric: 0.2, gas: 1.0 },
      productIds: [],
    },
    {
      measure: "weatherstrip",
      cost: 125,
      dQDesign: 3532,
      pctOfLoad: 12,
      dMMBtu: 6.4,
      savingsPerYear: { electric: 359, gas: 86 },
      paybackYears: { electric: 0.3, gas: 1.4 },
      productIds: [],
    },
  ],
  // "$675 of fixes. Half the heater." (all three cheap measures): 31,742 -> 13,025 BTU/h, D -> B, 60A/6AWG -> 30A/10AWG.
  fixFirst: {
    measures: ["weatherstrip", "door_kit_eps", "ceiling_r30"],
    cost: 675,
    qBefore: 31742,
    qAfter: 13025,
    gradeBefore: "D",
    gradeAfter: "B",
    classBefore: "e_240_10k",
    classAfter: "e_240_5k",
    circuitBefore: {
      watts: 10000, volts: 240, amps: 41.7, minAmps: 52.1, breakerA: 60,
      wireNM: "4 AWG", wireTHHN: "6 AWG", gfciReceptacle: false, notes: [],
    },
    circuitAfter: {
      watts: 5000, volts: 240, amps: 20.8, minAmps: 26.0, breakerA: 30,
      wireNM: "10 AWG", wireTHHN: "10 AWG", gfciReceptacle: false, notes: [],
    },
    equipmentSavings: [1000, 1500],
    runningSavingsPerYear: 1725,
  },
  warnings: [],
};
