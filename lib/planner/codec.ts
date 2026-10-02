import type {
  Circuit, Fuel, GarageDoorType, GarageInput, Preset, Priority, RoofType, Tightness, UseCase, WallType,
} from "./types.ts";
import { PRESET_DEFAULTS } from "./presets.ts";
import { zip3ToState } from "./zip3.ts";
import { primaryStationForState, stationById } from "./stations.ts";
import { MID_WINDOW_TYPE, MID_SERVICE_DOOR_TYPE } from "./defaults.ts";

// The URL-safe, human-readable, '.'-separated codec (BLUEPRINT.md §2.3), version 1. Encodes a deliberately
// small CODEC DOMAIN of GarageInput -- not the whole type. decode() fills everything outside that domain from
// presets.ts's defaults; normalize() applies the exact same fill (and the same window-count/door-type
// collapsing) to an arbitrary GarageInput, so decode(encode(x)) === normalize(x) is the round-trip contract,
// not decode(encode(x)) === x. A bad or future-version token falls back to null, and the caller shows the
// example garage with a "different model version" notice, per §2.3.

const CODEC_VERSION = "1";

// --- Token maps (bidirectional) -------------------------------------------------------------------------

const WALL_TOKEN: Record<WallType, string> = {
  open_studs: "os", uninsulated_finished: "uf", R11: "11", R13: "13", R15: "15", R19: "19", R21: "21",
  metal_uninsulated: "mu", metal_R10: "m10", metal_R13: "m13", metal_R19: "m19", cmu8_uninsulated: "cu", cmu8_R10: "c10",
};
const WALL_FROM_TOKEN: Record<string, WallType> = Object.fromEntries(Object.entries(WALL_TOKEN).map(([k, v]) => [v, k as WallType]));

const DOOR_TOKEN: Record<GarageDoorType, string> = {
  steel_single: "s", wood_uninsulated: "w", steel_eps_1_375: "e1", steel_eps_2: "e2", steel_pu_1_375: "p1", steel_pu_2: "p2", kit_eps_or_batt: "k", kit_reflective: "kr",
};
const DOOR_FROM_TOKEN: Record<string, GarageDoorType> = Object.fromEntries(Object.entries(DOOR_TOKEN).map(([k, v]) => [v, k as GarageDoorType]));

const TIGHTNESS_TOKEN: Record<Tightness, string> = { tight: "t", average: "a", leaky: "l", very_leaky: "v" };
const TIGHTNESS_FROM_TOKEN: Record<string, Tightness> = Object.fromEntries(Object.entries(TIGHTNESS_TOKEN).map(([k, v]) => [v, k as Tightness]));

const CIRCUIT_TOKEN: Record<Circuit, string> = { "120V15A": "a15", "120V20A": "a20", "240V20A": "b20", "240V30A": "b30", "240V40A": "b40", "240V50A": "b50", "240V60A": "b60" };
const CIRCUIT_FROM_TOKEN: Record<string, Circuit> = Object.fromEntries(Object.entries(CIRCUIT_TOKEN).map(([k, v]) => [v, k as Circuit]));

const FUEL_TOKEN: Record<Fuel, string> = { electric: "E", natural_gas: "N", propane_bulk: "P", propane_cylinder: "Y", diesel: "D", kerosene: "K" };
const FUEL_FROM_TOKEN: Record<string, Fuel> = Object.fromEntries(Object.entries(FUEL_TOKEN).map(([k, v]) => [v, k as Fuel]));

const PRIORITY_TOKEN: Record<Priority, string> = { upfront: "u", running: "r", fast: "f", balanced: "b" };
const PRIORITY_FROM_TOKEN: Record<string, Priority> = Object.fromEntries(Object.entries(PRIORITY_TOKEN).map(([k, v]) => [v, k as Priority]));

const USE_CASE_TOKEN: Record<UseCase, string> = { shop: "shop", gym: "gym", hangout: "hang", car: "car", keep: "keep" };
const USE_CASE_FROM_TOKEN: Record<string, UseCase> = Object.fromEntries(Object.entries(USE_CASE_TOKEN).map(([k, v]) => [v, k as UseCase]));

const PRESET_TOKEN: Record<Exclude<Preset, "custom">, string> = { "1car": "1", "2car": "2", "3car": "3", "4car": "4" };
const PRESET_FROM_TOKEN: Record<string, Preset> = { "1": "1car", "2": "2car", "3": "3car", "4": "4car", C: "custom" };

// Ceiling tokens double-encode ceilingType + ceilingIns/roofType, since they're never independently useful.
type CeilingToken = { ceilingType: "attic" | "open_rafters" | "conditioned_above" | "unknown"; ceilingIns: GarageInput["ceilingIns"]; roofType: RoofType };
const CEILING_TOKEN: [string, CeilingToken][] = [
  ["d0", { ceilingType: "attic", ceilingIns: "drywall_uninsulated", roofType: "shingle_deck_uninsulated" }],
  ["d11", { ceilingType: "attic", ceilingIns: "R11", roofType: "shingle_deck_uninsulated" }],
  ["d19", { ceilingType: "attic", ceilingIns: "R19", roofType: "shingle_deck_uninsulated" }],
  ["d30", { ceilingType: "attic", ceilingIns: "R30", roofType: "shingle_deck_uninsulated" }],
  ["d38", { ceilingType: "attic", ceilingIns: "R38", roofType: "shingle_deck_uninsulated" }],
  ["d49", { ceilingType: "attic", ceilingIns: "R49", roofType: "shingle_deck_uninsulated" }],
  ["r0", { ceilingType: "open_rafters", ceilingIns: "drywall_uninsulated", roofType: "shingle_deck_uninsulated" }],
  ["r19", { ceilingType: "open_rafters", ceilingIns: "R19", roofType: "rafters_R19" }],
  ["r30", { ceilingType: "open_rafters", ceilingIns: "R30", roofType: "rafters_R30" }],
  ["m0", { ceilingType: "open_rafters", ceilingIns: "drywall_uninsulated", roofType: "metal_uninsulated" }],
  ["h", { ceilingType: "conditioned_above", ceilingIns: "R19", roofType: "shingle_deck_uninsulated" }],
  ["u", { ceilingType: "unknown", ceilingIns: "unknown", roofType: "shingle_deck_uninsulated" }],
];
function ceilingTokenFor(ceilingType: GarageInput["ceilingType"], ceilingIns: GarageInput["ceilingIns"], roofType: RoofType): string {
  if (ceilingType === "unknown" || ceilingIns === "unknown") return "u";
  if (ceilingType === "conditioned_above") return "h";
  const hit = CEILING_TOKEN.find(([, v]) => v.ceilingType === ceilingType && v.ceilingIns === ceilingIns && (ceilingType === "attic" || v.roofType === roofType));
  return hit?.[0] ?? (ceilingType === "attic" ? "d0" : "r0");
}
function ceilingFromToken(token: string): CeilingToken {
  return CEILING_TOKEN.find(([t]) => t === token)?.[1] ?? CEILING_TOKEN[CEILING_TOKEN.length - 1][1];
}

// --- Helpers ----------------------------------------------------------------------------------------------

function stationAndStateFor(zip3: string | undefined, state: string): { stationId: string; state: string } {
  const st = zip3 ? (zip3ToState(zip3) ?? state) : state;
  const station = primaryStationForState(st);
  return { stationId: station?.id ?? "IL-chicago", state: station?.st ?? st };
}

function fmtPrice(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

// --- encode -----------------------------------------------------------------------------------------------

export function encode(input: GarageInput): string {
  const location = input.zip3 ?? input.state;
  const presetChar = input.preset === "custom" ? "C" : PRESET_TOKEN[input.preset];
  const attachChar = input.attached ? "A" : "D";
  const windowCount = Math.round(input.windowsFt2 / 12);
  const dims = `${Math.round(input.width)}x${Math.round(input.depth)}x${Math.round(input.height)}n${windowCount}`;
  const wallToken = input.wallType === "unknown" ? "u" : WALL_TOKEN[input.wallType];
  const ceilingToken = ceilingTokenFor(input.ceilingType, input.ceilingIns, input.roofType);
  const doorType = input.garageDoors[0]?.type ?? "unknown";
  const doorToken = doorType === "unknown" ? "u" : DOOR_TOKEN[doorType];
  const tightnessToken = input.tightness === "unknown" ? "u" : TIGHTNESS_TOKEN[input.tightness];

  const useToken =
    input.usage.mode === "sessions"
      ? `${input.targetTemp}s${input.usage.sessionsPerWeek}x${input.usage.hoursPerSession}g${input.warmupGoalMin}`
      : `${input.targetTemp}cg${input.warmupGoalMin}`;

  const circuitToken = input.circuit === "unknown" ? "u" : CIRCUIT_TOKEN[input.circuit];
  const canAdd = input.canAddCircuit ? "+" : "";
  const panelToken = input.panelAmps === "unknown" ? "u" : String(input.panelAmps);
  const powerToken = `c${circuitToken}${canAdd}p${panelToken}`;

  const fuelsToken = "f" + input.fuels.map((f) => FUEL_TOKEN[f]).join("") + (input.ventingPossible ? "v" : "");
  const priorityToken = `p${PRIORITY_TOKEN[input.priority]}${input.wantsCooling ? "c" : ""}`;
  const flammablesToken = `z${input.flammablesStored === "unknown" ? "u" : input.flammablesStored === "yes" ? "1" : "0"}`;

  const optional: string[] = [];
  if (input.useCase) optional.push(`x${USE_CASE_TOKEN[input.useCase]}`);
  if (input.priceOverrides?.elecPerKwh != null) optional.push(`e${fmtPrice(input.priceOverrides.elecPerKwh * 100)}`);
  if (input.priceOverrides?.ngPerTherm != null) optional.push(`n${fmtPrice(input.priceOverrides.ngPerTherm)}`);
  if (input.priceOverrides?.propanePerGal != null) optional.push(`q${fmtPrice(input.priceOverrides.propanePerGal)}`);
  if (input.priceOverrides?.dieselPerGal != null) optional.push(`d${fmtPrice(input.priceOverrides.dieselPerGal)}`);

  return [CODEC_VERSION, location, `${presetChar}${attachChar}`, dims, `w${wallToken}`, `c${ceilingToken}`, `d${doorToken}`, `t${tightnessToken}`, useToken, powerToken, fuelsToken, priorityToken, flammablesToken, ...optional].join(".");
}

// --- decode -----------------------------------------------------------------------------------------------

export function decode(code: string): GarageInput | null {
  try {
    const parts = code.split(".");
    if (parts[0] !== CODEC_VERSION) return null;
    const [, location, presetAttach, dims, wallPart, ceilingPart, doorPart, tightnessPart, usePart, powerPart, fuelsPart, priorityPart, flammablesPart, ...optional] = parts;
    if (!location || !presetAttach || !dims || !wallPart || !ceilingPart || !doorPart || !tightnessPart || !usePart || !powerPart || !fuelsPart || !priorityPart || !flammablesPart) return null;

    const presetChar = presetAttach.slice(0, -1);
    const attachChar = presetAttach.slice(-1);
    const preset = PRESET_FROM_TOKEN[presetChar];
    if (!preset) return null;
    const attached = attachChar === "A";

    const dimsMatch = /^(\d+)x(\d+)x(\d+)n(\d+)$/.exec(dims);
    if (!dimsMatch) return null;
    const width = Number(dimsMatch[1]);
    const depth = Number(dimsMatch[2]);
    const height = Number(dimsMatch[3]);
    const windowCount = Number(dimsMatch[4]);

    const wallToken = wallPart.slice(1);
    const wallType = wallToken === "u" ? ("unknown" as const) : WALL_FROM_TOKEN[wallToken];
    if (!wallType) return null;

    const { ceilingType, ceilingIns, roofType } = ceilingFromToken(ceilingPart.slice(1));

    const doorToken = doorPart.slice(1);
    const doorType = doorToken === "u" ? ("unknown" as const) : DOOR_FROM_TOKEN[doorToken];
    if (!doorType) return null;

    const tightnessToken = tightnessPart.slice(1);
    const tightness = tightnessToken === "u" ? ("unknown" as const) : TIGHTNESS_FROM_TOKEN[tightnessToken];
    if (!tightness) return null;

    const useMatch = /^(\d+)(?:s(\d+)x(\d+(?:\.\d+)?)|c)g(\d+)$/.exec(usePart);
    if (!useMatch) return null;
    const targetTemp = Number(useMatch[1]);
    const isSessions = useMatch[2] !== undefined;
    const sessionsPerWeek = isSessions ? Number(useMatch[2]) : 0;
    const hoursPerSession = isSessions ? Number(useMatch[3]) : 0;
    const warmupGoalMin = Number(useMatch[4]) as 30 | 60 | 120;

    const powerMatch = /^c(a15|a20|b20|b30|b40|b50|b60|u)(\+)?p(\d+|u)$/.exec(powerPart);
    if (!powerMatch) return null;
    const circuit = powerMatch[1] === "u" ? ("unknown" as const) : CIRCUIT_FROM_TOKEN[powerMatch[1]];
    const canAddCircuit = powerMatch[2] === "+";
    const panelAmps = powerMatch[3] === "u" ? ("unknown" as const) : (Number(powerMatch[3]) as 100 | 150 | 200);

    const fuelsMatch = /^f([ENPYDK]*)(v)?$/.exec(fuelsPart);
    if (!fuelsMatch) return null;
    const fuels = Array.from(fuelsMatch[1]).map((c) => FUEL_FROM_TOKEN[c]).filter((f): f is Fuel => Boolean(f));
    if (!fuels.includes("electric")) fuels.unshift("electric");
    const ventingPossible = fuelsMatch[2] === "v";

    const priorityMatch = /^p([urfb])(c)?$/.exec(priorityPart);
    if (!priorityMatch) return null;
    const priority = PRIORITY_FROM_TOKEN[priorityMatch[1]];
    const wantsCooling = priorityMatch[2] === "c";

    const flammablesChar = flammablesPart.slice(1);
    const flammablesStored = flammablesChar === "1" ? ("yes" as const) : flammablesChar === "0" ? ("no" as const) : ("unknown" as const);

    let useCase: UseCase | undefined;
    const priceOverrides: GarageInput["priceOverrides"] = {};
    for (const token of optional) {
      if (token.startsWith("x")) useCase = USE_CASE_FROM_TOKEN[token.slice(1)];
      else if (token.startsWith("e")) priceOverrides.elecPerKwh = Number(token.slice(1)) / 100;
      else if (token.startsWith("n")) priceOverrides.ngPerTherm = Number(token.slice(1));
      else if (token.startsWith("q")) priceOverrides.propanePerGal = Number(token.slice(1));
      else if (token.startsWith("d")) priceOverrides.dieselPerGal = Number(token.slice(1));
    }

    const { stationId, state } = stationAndStateFor(/^\d{3}$/.test(location) ? location : undefined, /^\d{3}$/.test(location) ? "" : location);
    const zip3 = /^\d{3}$/.test(location) ? location : undefined;

    const presetDoors = preset === "custom" ? [{ w: Math.min(16, Math.max(6, width - 4)), h: 7 }] : PRESET_DEFAULTS[preset].garageDoors.map((d) => ({ w: d.w, h: d.h }));
    const garageDoors = presetDoors.map((d) => ({ ...d, type: doorType }));

    const input: GarageInput = {
      v: 1,
      zip3,
      state,
      stationId,
      preset,
      width,
      depth,
      height,
      roofPitch: 6,
      attached,
      commonWallLen: attached ? depth : 0,
      wallType,
      ceilingType,
      ceilingIns,
      roofType,
      garageDoors,
      windowsFt2: windowCount * 12,
      windowType: MID_WINDOW_TYPE,
      serviceDoorFt2: 20,
      serviceDoorType: MID_SERVICE_DOOR_TYPE,
      slabEdge: "none",
      tightness,
      flammablesStored,
      tHouse: 68,
      targetTemp,
      useCase,
      usage: { mode: isSessions ? "sessions" : "continuous", sessionsPerWeek, hoursPerSession, doorOpeningsPerSession: 2 },
      warmupGoalMin,
      circuit,
      canAddCircuit,
      panelAmps,
      fuels,
      ventingPossible,
      priority,
      wantsCooling,
      priceOverrides: Object.keys(priceOverrides).length > 0 ? priceOverrides : undefined,
    };
    return input;
  } catch {
    return null;
  }
}

// --- normalize --------------------------------------------------------------------------------------------

// Snaps a full GarageInput to exactly what decode(encode(x)) would produce: fields outside the codec domain
// reset to the same defaults decode() would fill, and fields with lossy encodings (the window count, the
// single door type applied to every door) quantized the same way.
export function normalize(input: GarageInput): GarageInput {
  const decoded = decode(encode(input));
  if (!decoded) throw new Error("normalize(): a GarageInput failed to round-trip through its own encode() -- this is a codec bug, not an input problem");
  return decoded;
}

// Whether a station lookup exists for a decoded/normalized input's zip3+state, used by callers that want to
// confirm a decoded code actually resolves before running plan() on it.
export function isKnownStation(input: GarageInput): boolean {
  return Boolean(stationById(input.stationId));
}
