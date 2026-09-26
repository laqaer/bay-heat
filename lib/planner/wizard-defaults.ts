import type { GarageInput } from "./types.ts";
import { PRESET_DEFAULTS } from "./presets.ts";

// A fresh, fully-valid GarageInput for the planner wizard to start from (BLUEPRINT.md §2.1's step table --
// every field has a schema default before the reader answers). Chicago/IL is the seed station only until
// step 1's ZIP resolves; every other field is the schema's own stated default, not an "unknown" sentinel, so
// heatLossDesign() can run and show a live preview from the very first step.
export function defaultGarageInput(): GarageInput {
  const preset = PRESET_DEFAULTS["2car"];
  return {
    v: 1,
    zip3: undefined,
    state: "IL",
    stationId: "IL-chicago",
    preset: "2car",
    width: preset.width,
    depth: preset.depth,
    height: preset.height,
    roofPitch: 6,
    attached: true,
    commonWallLen: preset.depth,
    wallType: "R13",
    ceilingType: "attic",
    ceilingIns: "drywall_uninsulated",
    roofType: "shingle_deck_uninsulated",
    garageDoors: preset.garageDoors,
    windowsFt2: preset.windowsFt2,
    windowType: "single_metal",
    serviceDoorFt2: preset.serviceDoorFt2,
    serviceDoorType: "hollow_wood",
    slabEdge: "none",
    tightness: "average",
    flammablesStored: "unknown",
    tHouse: 68,
    targetTemp: 55,
    useCase: "shop",
    usage: { mode: "sessions", sessionsPerWeek: 2, hoursPerSession: 4, doorOpeningsPerSession: 2 },
    warmupGoalMin: 60,
    circuit: "unknown",
    canAddCircuit: true,
    panelAmps: "unknown",
    fuels: ["electric"],
    ventingPossible: false,
    priority: "balanced",
    wantsCooling: false,
  };
}
