// Frozen data types for the BayHeat planner engine. IP units throughout. No enums, no JSX, no @/ alias --
// this module (and everything under lib/planner, lib/safety, lib/commerce, lib/index) is unit-tested with
// `node --test` and imported with relative, .ts-suffixed paths.
//
// Corrected against company/BLUEPRINT.md §9.4 per the feasibility red-team (company's own
// planner-engineering.md Appendix B/C are the source of truth for Station and PriceSet; see
// scratchpad/redteam/feasibility.md finding #2 for the reconciliation).

export type Preset = "1car" | "2car" | "3car" | "4car" | "custom";
export type WallType =
  | "open_studs"
  | "uninsulated_finished"
  | "R11"
  | "R13"
  | "R15"
  | "R19"
  | "R21"
  | "cmu8_uninsulated"
  | "cmu8_R10"
  | "metal_uninsulated"
  | "metal_R10"
  | "metal_R13"
  | "metal_R19";
export type CeilingType = "attic" | "open_rafters" | "conditioned_above";
export type CeilingIns = "drywall_uninsulated" | "R11" | "R19" | "R30" | "R38" | "R49";
export type RoofType =
  | "shingle_deck_uninsulated"
  | "metal_uninsulated"
  | "metal_R10"
  | "metal_R19"
  | "rafters_R19"
  | "rafters_R30";
export type GarageDoorType =
  | "steel_single"
  | "wood_uninsulated"
  | "steel_eps_1_375"
  | "steel_eps_2"
  | "steel_pu_1_375"
  | "steel_pu_2"
  | "kit_eps_or_batt"
  | "kit_reflective";
export type WindowType = "single_metal" | "single_wood_vinyl" | "double_clear" | "double_lowe";
export type EntryDoorType = "uninsulated_metal" | "hollow_wood" | "solid_wood" | "insulated";
export type SlabEdge = "none" | "R10_24in" | "R15_24in" | "R20_48in";
export type Tightness = "tight" | "average" | "leaky" | "very_leaky";
export type Circuit = "120V15A" | "120V20A" | "240V20A" | "240V30A" | "240V40A" | "240V50A" | "240V60A";
export type Fuel = "electric" | "natural_gas" | "propane_bulk" | "propane_cylinder" | "diesel" | "kerosene";
export type Priority = "upfront" | "running" | "fast" | "balanced";
export type UseCase = "shop" | "gym" | "hangout" | "car" | "keep";
export type FlammablesStored = "yes" | "no";
export type Unknown<T> = T | "unknown";

export type GarageInput = {
  v: 1;
  zip3?: string;
  state: string; // USPS state abbreviation
  stationId: string; // ClimateStation.id, e.g. 'IL-chicago'
  preset: Preset;
  width: number;
  depth: number;
  height: number;
  roofPitch: number; // x/12
  attached: boolean;
  commonWallLen: number;
  wallType: Unknown<WallType>;
  ceilingType: CeilingType | "unknown";
  ceilingIns: Unknown<CeilingIns>;
  roofType: RoofType;
  garageDoors: { w: number; h: number; type: Unknown<GarageDoorType> }[];
  windowsFt2: number;
  windowType: WindowType;
  serviceDoorFt2: number;
  serviceDoorType: EntryDoorType;
  slabEdge: SlabEdge;
  tightness: Unknown<Tightness>;
  // Whether gasoline, paint, mower fuel or other flammable liquids are stored in the garage. UL 1278 heaters
  // (most portables and the CZ220 ceiling class) prohibit use where these are stored -- see rule S12 and
  // scratchpad/redteam/compliance.md finding #1. 'unknown' is treated as 'yes' by the safety engine.
  flammablesStored: Unknown<FlammablesStored>;
  tHouse: number;
  targetTemp: number;
  useCase?: UseCase;
  usage: { mode: "continuous" | "sessions"; sessionsPerWeek: number; hoursPerSession: number; doorOpeningsPerSession: number };
  warmupGoalMin: 30 | 60 | 120;
  circuit: Unknown<Circuit>;
  canAddCircuit: boolean;
  panelAmps: 100 | 150 | 200 | "unknown";
  fuels: Fuel[];
  ventingPossible: boolean;
  priority: Priority;
  // Captured at launch for the mini-split cross-sell and the v1.1 cooling mode; the cooling load itself
  // (heatLoss/cooling.ts, coolingLoadRLF, PlannerResult.cooling) is not computed until Mar 2027 -- see
  // scratchpad/redteam/feasibility.md finding #24 and revenue.md finding #5.
  wantsCooling: boolean;
  priceOverrides?: { elecPerKwh?: number; ngPerTherm?: number; propanePerGal?: number; dieselPerGal?: number };
  designTempOverride?: number;
};

// ASHRAE 2021 climatic design conditions, one row per station. Verbatim shape of
// company/research/planner-engineering.md Appendix B `ClimateStation` -- this is the actual dataset shape,
// not a summary of it.
export type ClimateStation = {
  id: string; // 'AL-birmingham'
  st: string; // USPS state
  city: string;
  wmo: string;
  lat: number;
  lon: number;
  elevFt: number;
  h996: number; // 99.6% heating design dry-bulb, degF
  h99: number; // 99% heating design dry-bulb, degF
  c1: number; // 1% cooling design dry-bulb, degF
  c1mcwb: number; // 1% cooling mean coincident wet-bulb, degF
  dr: number; // summer daily range, degF
  hr1: number; // 1% humidity ratio design condition (grains or the source's published unit)
  hdd50: number;
  hdd65: number;
  cdd65: number;
  zone: string; // IECC climate zone, e.g. '5A'; '*' suffix = county fallback
  primary: boolean; // true = the bold, primary city for its state in Appendix A
  tMean: number[]; // monthly mean daily-average dry-bulb, degF, Jan..Dec (length 12)
  tSd: number[]; // monthly std dev of daily-average dry-bulb, degF, Jan..Dec (length 12)
};
// Station, as used by GarageInput/PlannerResult, is the full climate row plus the caller's distance to it.
export type Station = ClimateStation & { distanceMi: number };

// Energy prices by state, $ per unit. Verbatim shape of Appendix C `PRICES`, plus the fields the codec and
// Index need (asOf, sources) that Appendix C's flat table does not carry per-row.
export type PriceSet = {
  state: string;
  elecPerKwh: number;
  ngPerTherm: number;
  propanePerGal: number;
  propaneCylPerGal: number; // 1-lb/20-lb cylinder-exchange equivalent price; status 'verify' until sourced per state
  heatingOilPerGal: number;
  dieselPerGal: number;
  keroPerGal: number; // heatingOilPerGal + $1.00 per the assumptions register; status 'verify'
  propaneSrc: string; // 'state' | 'US+0.50' | 'PADD 1B' | ... (Appendix C's provenance tag)
  asOf: { elec: string; ng: string; propane: string; diesel: string }; // 'YYYY-MM'
  sources: string[]; // Source ids in lib/facts/sources.ts
};

export type Band = { low: number; mid: number; high: number; unknowns: number; narrowBy?: "walls" | "ceiling" | "door" | "tightness"; narrowToPct?: number };
export type Grade = "A" | "B" | "C" | "D" | "F";
export type LoadKey = "walls" | "garage_doors" | "windows" | "service_door" | "ceiling_roof" | "slab_edge" | "infiltration" | "house_coupling";
export type Wire = "14 AWG" | "12 AWG" | "10 AWG" | "8 AWG" | "6 AWG" | "4 AWG" | "3 AWG";
export type CircuitSpec = {
  watts: number;
  volts: 120 | 208 | 240;
  amps: number;
  minAmps: number;
  breakerA: 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80;
  wireNM: Wire;
  wireTHHN: Wire;
  gfciReceptacle: boolean;
  deratedWatts?: number;
  notes: string[];
};
// S12 (added by the compliance red-team, finding #1): a UL 1278/manual flammables-storage warning that
// attaches to every heater plate where GarageInput.flammablesStored !== 'no'.
export type SafetyCode = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11" | "S12";
export type Warning = { code: SafetyCode; severity: "block" | "warn" | "info"; text: string; cite: string; ev: "R" | "S" | "C" };
export type HeaterClassId =
  | "e_port_1500"
  | "e_ir_wall_1500"
  | "e_240_4k"
  | "e_240_5k"
  | "e_240_7k5"
  | "e_240_10k"
  | "e_ir_240"
  | "hp_diy_12k_115"
  | "hp_12_24k_230"
  | "g_unvented_buddy"
  | "g_vented_unit"
  | "diesel_air"
  | "k_unvented"
  | "torpedo";
export type HeaterClass = {
  id: HeaterClassId;
  label: string;
  outputBtuh: [number, number];
  energy: Fuel;
  eta: number | "curve";
  circuit?: Circuit;
  vented: boolean;
  tier: 1 | 2 | 3;
  equip: [number, number];
  install: [number, number];
  safety: SafetyCode[];
  productIds: string[]; // ids into lib/commerce/ids.ts PRODUCT_IDS
  neverRecommend?: boolean;
};
export type RankedSystem = {
  classId: HeaterClassId;
  units: 1 | 2 | 3;
  capacityBtuh: number;
  fitPct: number;
  tier: 1 | 2 | 3;
  circuit?: CircuitSpec;
  costPerHour: number;
  perSeason: number;
  tco5: number;
  upfront: [number, number];
  minutesToTarget: number | null;
  why: string;
  safetyLine?: string;
  attachCoAlarm: boolean;
  productIds: string[];
};
export type WhyNot = { classId: HeaterClassId; text: string };
export type Measure = "weatherstrip" | "door_kit_eps" | "door_kit_reflective" | "ceiling_r30" | "attic_hatch" | "new_pu_door" | "wall_batts";
export type RoiRow = {
  measure: Measure;
  cost: number;
  dQDesign: number;
  pctOfLoad: number;
  dMMBtu: number;
  savingsPerYear: { electric: number; gas: number };
  paybackYears: { electric: number; gas: number };
  productIds: string[];
};
export type FixFirst = {
  measures: Measure[];
  cost: number;
  qBefore: number;
  qAfter: number;
  gradeBefore: Grade;
  gradeAfter: Grade;
  classBefore: HeaterClassId;
  classAfter: HeaterClassId;
  circuitBefore: CircuitSpec;
  circuitAfter: CircuitSpec;
  equipmentSavings: [number, number];
  runningSavingsPerYear: number;
};
export type CostRow = {
  system: "electric_resistance" | "heat_pump_cc" | "ng_vented_80" | "propane_bulk_80" | "propane_cyl_92" | "diesel_78";
  eta: number | "curve";
  unitPrice: number;
  unit: "$/kWh" | "$/therm" | "$/gal";
  perHour: number;
  perSession?: number;
  perMonth: number;
  perSeason: number;
  perMMBtu: number;
};
export type SessionRow = { month: "nov" | "dec" | "jan" | "feb" | "mar"; tOut: number; tStart: number; minutesToTarget: number | null; kwhOrFuel: number; cost: number };
// Cooling is typed for forward compatibility (the planner UI already asks wantsCooling) but is not computed
// until Mar 2027 -- see the note on GarageInput.wantsCooling above.
export type CoolingResult = {
  tOut: number;
  dr: number;
  sensible: number;
  latent: number;
  total: number;
  items: { key: string; btuh: number }[];
  nominalSuggestion: 9000 | 12000 | 18000 | 24000 | 30000 | 36000;
  dehumidifierPints: number;
};

export type PlannerResult = {
  modelVersion: string; // '1.0.0', or '0.0.0-stub' for W0 fixture data -- see fixtures.ts
  code: string; // codec string
  serial: string; // 'R-2A-606-7F3A'
  station: Station;
  prices: PriceSet;
  inputsEcho: GarageInput;
  assumptions: string[];
  heating: {
    tIn: number;
    tOutDesign: number;
    deltaT: number;
    items: { key: LoadKey; btuh: number; pct: number }[];
    qDesign: number;
    qSize: number;
    kwSize: number;
    btuhPerFt2: number;
    band: Band;
    uaExt: number;
    uaExtPerFt2: number;
    grade: Grade;
    atticTempF?: number;
    freeFloatDesignF: number;
    sanity?: "check_inputs";
  };
  cooling?: CoolingResult; // undefined in v1
  warmup: { classId: HeaterClassId; kw: number; janMinutes: number | null; curve: [number, number][] /* [min, degF] */ };
  circuits: { forSize: CircuitSpec; user?: CircuitSpec; fits: boolean; panelCheck: "ok" | "load_calc" | "unknown"; notes: string[] };
  usage: { mode: "continuous" | "sessions"; seasonMonths: string[]; tBal?: number; hddAtBal?: number };
  costs: CostRow[];
  sessions?: SessionRow[];
  recommendations: RankedSystem[];
  whyNot: WhyNot[];
  insulateFirst: RoiRow[];
  fixFirst: FixFirst | null;
  warnings: Warning[];
};

// SIGNATURE (implemented in the named module, not here): function plan(input: GarageInput): PlannerResult;                         // lib/planner/plan.ts
// SIGNATURE (implemented in the named module, not here): function encode(input: GarageInput): string;                             // lib/planner/codec.ts
// SIGNATURE (implemented in the named module, not here): function decode(code: string): GarageInput | null;                       // lib/planner/codec.ts
// SIGNATURE (implemented in the named module, not here): function normalize(input: GarageInput): GarageInput;                     // lib/planner/codec.ts -- fills codec-domain defaults; decode(encode(x)) === normalize(x)
// SIGNATURE (implemented in the named module, not here): function gradeFor(uaExtPerFt2: number): Grade;                           // lib/planner/grade.ts
// SIGNATURE (implemented in the named module, not here): function circuitFor(watts: number, voltsSupply: 120 | 208 | 240, voltsRated?: 120 | 240): CircuitSpec; // lib/planner/electrical.ts (voltsRated defaults to 240)
// SIGNATURE (implemented in the named module, not here): function band(input: GarageInput): Band;                                 // lib/planner/uncertainty.ts -- evaluates heatLossDesign() only at the unknown corners, not full plan()
