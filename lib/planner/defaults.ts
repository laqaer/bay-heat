import type { Circuit, EntryDoorType, GarageDoorType, GarageInput, Tightness, WallType, WindowType } from "./types.ts";
import type { ResolvedEnvelope } from "./heatLoss.ts";
import { TIGHTNESS_ORDER } from "./constants.ts";

// Resolving 'unknown' sentinels to concrete values the physics engine can run on (planner-engineering.md
// §2.2's schema defaults double as the "don't know" mid-point assumption -- see the reasoning note below).
//
// These are also literally the schema's own DEFAULT column values: R-13 walls, an uninsulated drywall
// ceiling, a plain steel door, average tightness. Using the same table for "what a fresh preset starts at"
// and "what we assume when the user later says they don't know" keeps one table instead of two, and matches
// how EXAMPLE_A_INPUT itself is built (BLUEPRINT.md §0.2's "as-is" scenario is exactly this default set).
export const MID_WALL_TYPE: WallType = "R13";
export const MID_CEILING_INS = "drywall_uninsulated" as const;
export const MID_DOOR_TYPE: GarageDoorType = "steel_single";
export const MID_TIGHTNESS: Tightness = "average";
export const MID_CIRCUIT: Circuit = "120V15A";
export const MID_WINDOW_TYPE: WindowType = "single_metal";
export const MID_SERVICE_DOOR_TYPE: EntryDoorType = "hollow_wood";

// Low/high corners for uncertainty.ts's band() -- a realistic range for genuine "I don't know" uncertainty,
// not the full enum extremes. A homeowner who can't tell you their wall insulation almost certainly has a
// finished, stud-framed wall (not open studs or a metal pole-barn shell they'd surely have noticed), so the
// corners span R-13 (code-minimum, since ~1990s) to a finished-but-unbatted wall, not the whole WallType enum.
export const WALL_TYPE_LOW: WallType = "R13"; // least loss (most likely to be insulated)
export const WALL_TYPE_HIGH: WallType = "uninsulated_finished"; // most loss (finished, no visible batt)
export const CEILING_INS_LOW = "R19" as const; // least loss (maybe there's some insulation up there)
export const CEILING_INS_HIGH = "drywall_uninsulated" as const; // most loss (matches the mid assumption)
export const DOOR_TYPE_LOW: GarageDoorType = "steel_eps_1_375"; // least loss (a common insulated door)
export const DOOR_TYPE_HIGH: GarageDoorType = "steel_single"; // most loss (matches the mid assumption)

export function tightnessLow(mid: Tightness = MID_TIGHTNESS): Tightness {
  const i = TIGHTNESS_ORDER.indexOf(mid);
  return TIGHTNESS_ORDER[Math.max(0, i - 1)];
}
export function tightnessHigh(mid: Tightness = MID_TIGHTNESS): Tightness {
  const i = TIGHTNESS_ORDER.indexOf(mid);
  return TIGHTNESS_ORDER[Math.min(TIGHTNESS_ORDER.length - 1, i + 1)];
}

// Resolves every Unknown<T> field on a GarageInput to a concrete mid-point value, for a single "best
// estimate" run through heatLossDesign(). uncertainty.ts's band() calls the LOW/HIGH tables above directly
// rather than through this function, so it can vary one field at a time.
export function resolveEnvelope(input: GarageInput): ResolvedEnvelope {
  return {
    wallType: input.wallType === "unknown" ? MID_WALL_TYPE : input.wallType,
    ceilingIns: input.ceilingIns === "unknown" ? MID_CEILING_INS : input.ceilingIns,
    doorTypes: input.garageDoors.map((d) => (d.type === "unknown" ? MID_DOOR_TYPE : d.type)),
    tightness: input.tightness === "unknown" ? MID_TIGHTNESS : input.tightness,
  };
}

export function resolveCircuit(input: GarageInput): Circuit {
  return input.circuit === "unknown" ? MID_CIRCUIT : input.circuit;
}

export function resolveCeilingType(input: GarageInput): "attic" | "open_rafters" | "conditioned_above" {
  return input.ceilingType === "unknown" ? "attic" : input.ceilingType;
}

// flammablesStored and ulListed-style unknowns are safety-only (they don't feed the thermal model): "unknown"
// is always treated as "yes" -- see lib/safety/verdict.ts's isYes() for the Can I Run It? engine's own copy of
// this rule, and GarageInput.flammablesStored's doc comment.
export function isFlammablesYes(v: GarageInput["flammablesStored"]): boolean {
  return v === "yes" || v === "unknown";
}
