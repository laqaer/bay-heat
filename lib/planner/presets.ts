import type { GarageDoorType, Preset } from "./types.ts";

// Garage size presets (planner-engineering.md §2.1). The "W" side is the door wall; roof is a gable
// spanning W at a 6/12 default pitch. 'custom' has no defaults -- every field is asked directly.
export type PresetDefaults = {
  width: number;
  depth: number;
  height: number;
  garageDoors: { w: number; h: number; type: GarageDoorType }[];
  windowsFt2: number;
  serviceDoorFt2: number;
};

export const PRESET_DEFAULTS: Record<Exclude<Preset, "custom">, PresetDefaults> = {
  "1car": { width: 12, depth: 22, height: 8, garageDoors: [{ w: 9, h: 7, type: "steel_single" }], windowsFt2: 0, serviceDoorFt2: 20 },
  "2car": { width: 24, depth: 24, height: 9, garageDoors: [{ w: 16, h: 7, type: "steel_single" }], windowsFt2: 12, serviceDoorFt2: 20 },
  "3car": { width: 32, depth: 24, height: 10, garageDoors: [{ w: 16, h: 7, type: "steel_single" }, { w: 9, h: 7, type: "steel_single" }], windowsFt2: 24, serviceDoorFt2: 20 },
  "4car": { width: 40, depth: 26, height: 10, garageDoors: [{ w: 16, h: 7, type: "steel_single" }, { w: 16, h: 7, type: "steel_single" }], windowsFt2: 24, serviceDoorFt2: 20 },
};

export function floorFt2(preset: PresetDefaults): number {
  return preset.width * preset.depth;
}
export function volumeFt3(preset: PresetDefaults): number {
  return preset.width * preset.depth * preset.height;
}
