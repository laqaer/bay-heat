import type { PriceSet } from "./types.ts";
import { RAW_PRICES, US_AVG } from "./prices-data.ts";

// EIA-sourced prices (planner-engineering.md §9.4-9.5), labelled by the period each value actually covers --
// re-checked against EIA on 2026-10-09 by an adversarial fact-check:
// - electricity: year-to-date through Jul-2026 (Electric Power Monthly 5.6.B);
// - natural gas: the 2025 ANNUAL residential average (EIA's newest annual column; IL $11.25/Mcf = $1.086/therm),
//   previously mislabelled "2026-01";
// - propane: the weekly residential series' last reading of the 2025-26 heating season, 2026-03-30 (the series
//   resumed 2026-10-05; refreshing to it is a data-desk task), previously mislabelled "2026-09";
// - diesel: the 2026-09-21 weekly release -- a PADD REGIONAL average, not a per-state price.
const ASOF = { elec: "2026-07", ng: "2025 annual", propane: "2026-03-30", diesel: "2026-09-21" };
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
