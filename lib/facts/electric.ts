import type { Fact, Source } from "../types/evidence.ts";

// Lane stub (W10: electric heaters). Most nameplate facts for the 5 verified ASINs already live in
// lib/facts/products.ts (shared/frozen) -- this file is for electric-hub-specific facts (e.g. non-verified
// classes' typical specs) that don't belong in the frozen products registry.
export const FACTS: Fact[] = [];
export const SOURCES: Record<string, Source> = {};
