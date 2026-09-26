import type { Fact, Source } from "../types/evidence.ts";

// Lane stub (W11: fuel and hubs). Shared fuel-physics constants (heat contents, efficiencies) live in
// lib/facts/fuels.ts (plural, W0/frozen) -- this file is for diesel/propane/NG product-specific facts
// (e.g. a specific diesel heater's exhaust-kit spec, a Big Maxx's vent clearance).
export const FACTS: Fact[] = [];
export const SOURCES: Record<string, Source> = {};
