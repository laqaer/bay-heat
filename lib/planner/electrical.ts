import type { CircuitSpec, Wire } from "./types.ts";

// NEC 240.6(A) standard overcurrent device sizes we use up to 60 A (heater classes top out at 10 kW / 60 A).
const STANDARD_BREAKERS = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80] as const;

// NEC Table 310.16 copper ampacities, 60degC column (NM/Romex per NEC 334.80) and 75degC column (THHN in
// conduit with 75degC terminations), smallest-to-largest. planner-engineering.md §11.1-11.3.
const NM_60C: [Wire, number][] = [
  ["14 AWG", 15],
  ["12 AWG", 20],
  ["10 AWG", 30],
  ["8 AWG", 40],
  ["6 AWG", 55],
  ["4 AWG", 70],
];
const THHN_75C: [Wire, number][] = [
  ["14 AWG", 15], // capped by NEC 240.4(D) regardless of the 75degC table value
  ["12 AWG", 20],
  ["10 AWG", 30],
  ["8 AWG", 50],
  ["6 AWG", 65],
  ["4 AWG", 85],
];

function smallestBreakerAtLeast(minAmps: number): (typeof STANDARD_BREAKERS)[number] {
  const found = STANDARD_BREAKERS.find((b) => b >= minAmps);
  if (!found) throw new Error(`No standard breaker covers ${minAmps} A -- add a larger size to STANDARD_BREAKERS`);
  return found;
}
function smallestWireAtLeast(table: [Wire, number][], breakerA: number): Wire {
  const found = table.find(([, amps]) => amps >= breakerA);
  if (!found) throw new Error(`No wire gauge in table covers a ${breakerA} A breaker`);
  return found[0];
}

// circuitFor(): NEC 424.4(B) continuous-load sizing for a FIXED heater (125% of the actual current).
// voltsRated defaults to 240 (the heater's nameplate voltage); voltsSupply is what circuit it's actually fed
// from. A 240 V heater run on a 208 V supply derates by (208/240)^2 (planner-engineering.md §11.3, T11).
export function circuitFor(watts: number, voltsSupply: 120 | 208 | 240, voltsRated: 120 | 240 = 240): CircuitSpec {
  const actualWatts = watts * Math.pow(voltsSupply / voltsRated, 2);
  const amps = actualWatts / voltsSupply;
  const minAmps = 1.25 * amps;
  const breakerA = smallestBreakerAtLeast(minAmps);
  const wireNM = smallestWireAtLeast(NM_60C, breakerA);
  const wireTHHN = smallestWireAtLeast(THHN_75C, breakerA);
  const notes: string[] = [];
  if (voltsSupply !== voltsRated) {
    notes.push(`${watts.toLocaleString()} W is rated at ${voltsRated} V; on a ${voltsSupply} V supply it actually draws ${Math.round(actualWatts).toLocaleString()} W.`);
  }
  return {
    watts: Math.round(actualWatts),
    volts: voltsSupply,
    amps: Math.round(amps * 10) / 10,
    minAmps: Math.round(minAmps * 10) / 10,
    breakerA: breakerA as CircuitSpec["breakerA"],
    wireNM,
    wireTHHN,
    gfciReceptacle: false, // set true by the caller for a plug-in/corded circuit (NEC 210.8(A)(2)); hardwired units are not receptacles
    deratedWatts: voltsSupply !== voltsRated ? Math.round(actualWatts) : undefined,
    notes,
  };
}

// Whether a 120 V cord-and-plug appliance fits a shared multi-outlet circuit (NEC 210.23(A)(1): at most 80% of
// the branch rating for one cord-and-plug item). Fixed heaters use circuitFor() + 424.4(B) instead.
export function fitsCordAndPlug(watts: number, voltsSupply: 120 | 240, breakerA: 15 | 20): boolean {
  const amps = watts / voltsSupply;
  return amps <= breakerA * 0.8;
}
