import type { PriceSet } from "./types.ts";
import { RAW_PRICES, US_AVG } from "./prices-data.ts";

// EIA-sourced prices as of Sept 2026: electricity Jul-2026 (Electric Power Monthly 5.6.B), natural gas the
// 2026 annual residential figure, propane/diesel the 2026-09-21 weekly release (planner-engineering.md §9.4-9.5).
const ASOF = { elec: "2026-07", ng: "2026-01", propane: "2026-09", diesel: "2026-09-21" };
const SOURCES = ["eia-electric-power-monthly", "eia-ng-annual", "eia-propane-weekly", "eia-diesel-weekly"];

function toPriceSet(state: string, row: (typeof RAW_PRICES)[string]): PriceSet {
  return {
    state,
    elecPerKwh: row.elec,
    ngPerTherm: row.ngTherm,
    propanePerGal: row.propaneGal,
    // Cylinder-exchange propane runs well above bulk delivery per gallon-equivalent (1-lb refill/exchange
    // pricing is not published by state; status 'verify' in lib/facts/fuels.ts until sourced per state).
    propaneCylPerGal: Math.round((row.propaneGal + 1.0) * 100) / 100,
    heatingOilPerGal: row.heatingOilGal,
    dieselPerGal: row.dieselGal,
    keroPerGal: Math.round((row.heatingOilGal + 1.0) * 100) / 100,
    propaneSrc: row.propaneSrc,
    asOf: ASOF,
    sources: SOURCES,
  };
}

export const PRICES: Record<string, PriceSet> = Object.fromEntries(
  Object.entries(RAW_PRICES).map(([st, row]) => [st, toPriceSet(st, row)]),
);

export const US_AVG_PRICES: PriceSet = toPriceSet("US", US_AVG);

export function pricesForState(state: string): PriceSet {
  return PRICES[state] ?? US_AVG_PRICES;
}
