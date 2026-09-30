import type { GarageInput } from "./types.ts";

// Report serial: R-{preset}{A|D}-{zip3}-{hash4} (BLUEPRINT.md §2.3), e.g. "R-2A-606-7F3A". hash4 is the first
// 4 hex characters of FNV-1a over the codec string -- a short, stable fingerprint of the exact garage, not a
// cryptographic identifier.
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const PRESET_CHAR: Record<GarageInput["preset"], string> = { "1car": "1", "2car": "2", "3car": "3", "4car": "4", custom: "C" };

export function serialFor(input: GarageInput, code: string): string {
  const presetChar = PRESET_CHAR[input.preset];
  const attachChar = input.attached ? "A" : "D";
  const location = input.zip3 ?? input.state;
  const hash4 = fnv1a(code).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  return `R-${presetChar}${attachChar}-${location}-${hash4}`;
}
