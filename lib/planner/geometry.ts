import type { GarageInput } from "./types.ts";

// Garage geometry (planner-engineering.md §4.1). All linear units ft, areas ft2, volumes ft3.
export type Geometry = {
  aFloor: number;
  lExt: number; // exterior perimeter, common wall excluded
  aGdoor: number;
  aWallNet: number;
  rise: number;
  pitchFactor: number;
  volume: number;
};

export function geometry(input: GarageInput): Geometry {
  const { width: w, depth: d, height: h, roofPitch, commonWallLen, garageDoors, windowsFt2, serviceDoorFt2, ceilingType } = input;
  const aFloor = w * d;
  const lExt = 2 * w + 2 * d - commonWallLen;
  const aGdoor = garageDoors.reduce((sum, gd) => sum + gd.w * gd.h, 0);
  const aWallNet = lExt * h - aGdoor - windowsFt2 - serviceDoorFt2;
  const rise = (w / 2) * (roofPitch / 12);
  const pitchFactor = Math.sqrt(1 + Math.pow(roofPitch / 12, 2));
  let volume = aFloor * h;
  if (ceilingType === "open_rafters") volume += (aFloor * rise) / 2;
  return { aFloor, lExt, aGdoor, aWallNet, rise, pitchFactor, volume };
}
