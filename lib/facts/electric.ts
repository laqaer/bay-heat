import type { Fact, Source } from "../types/evidence.ts";

// Lane stub (W10: electric heaters). Most nameplate facts for the 5 verified ASINs already live in
// lib/facts/products.ts (shared/frozen) -- this file is for electric-hub-specific facts (e.g. non-verified
// classes' typical specs) that don't belong in the frozen products registry.
export const FACTS: Fact<number | string>[] = [
  // /shop-heater cites this for the 10 kW wire size. It is 'verify' because the DR-910F PDF has no text layer
  // (it is page images), so nobody on the page's team could read the figure off the manual; a 'verify' fact never
  // renders in production, so the sentence that uses it sits inside <IfVerified>. Flip to 'verified' once someone
  // reads "60 A, 6 AWG copper" in the manual itself (the engine's own 60 A / 6 AWG THHN row agrees with it).
  {
    id: "dr910f.breaker_wire",
    value: "a 60 A circuit and 6 AWG copper",
    ev: "S",
    sourceId: "dr910f-manual",
    checked: "2026-10-09",
    status: "verify",
    note: "reported by the Round-2 fact-check; not yet read from the PDF",
  },
];
export const SOURCES: Record<string, Source> = {};
