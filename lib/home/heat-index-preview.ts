import type { GarageInput } from "@/lib/planner/types";
import type { IndexRow } from "@/lib/index/types";
import { STATIONS } from "@/lib/planner/stations";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";

// A home-page preview of the Garage Heat Index (BLUEPRINT.md §4.9 #4, §4.5(b)): the season cost to hold a
// standard attached 2-car garage (24x24x9, R-13 walls, R-19 ceiling, uninsulated steel door, average
// drafts) at 50 degF, for each state's population-primary station, at that state's own current EIA prices.
// This computes the same real plan() the full /cost-to-heat-a-garage page (owned separately) will use --
// it's a 51-row live computation, not a pasted table, so it stays correct as prices update.
const STANDARD: GarageInput = {
  ...EXAMPLE_A_INPUT,
  zip3: undefined,
  ceilingIns: "R19",
  targetTemp: 50,
};

const SEALED: GarageInput = {
  ...STANDARD,
  tightness: "tight",
  garageDoors: STANDARD.garageDoors.map((d) => ({ ...d, type: "kit_eps_or_batt" })),
};

function costOf(result: ReturnType<typeof plan>, system: string): number {
  return result.costs.find((c) => c.system === system)?.perSeason ?? 0;
}

function rowFor(stationId: string, state: string): IndexRow {
  const station = STATIONS.find((s) => s.id === stationId)!;
  const r = plan({ ...STANDARD, state, stationId });
  const fixed = plan({ ...SEALED, state, stationId });
  const season = {
    electric: costOf(r, "electric_resistance"),
    heatPump: costOf(r, "heat_pump_cc"),
    naturalGas: costOf(r, "ng_vented_80"),
    propane: costOf(r, "propane_bulk_80"),
  };
  const cheapest = (Object.entries(season) as [keyof typeof season, number][]).reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  return {
    state,
    stationId,
    city: station.city,
    hdd50: station.hdd50,
    h99: station.h99,
    elecPerKwh: r.prices.elecPerKwh,
    ngPerTherm: r.prices.ngPerTherm,
    propanePerGal: r.prices.propanePerGal,
    season,
    fixedSeason: { electric: costOf(fixed, "electric_resistance") },
    cheapest,
    per5kwHour: Math.round(5 * r.prices.elecPerKwh * 100) / 100,
    asOf: r.prices.asOf.elec,
  };
}

export const HOME_INDEX_ROWS: IndexRow[] = STATIONS.filter((s) => s.primary).map((s) => rowFor(s.id, s.st));

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export const HOME_INDEX_US_MEDIAN_ELECTRIC = Math.round(median(HOME_INDEX_ROWS.map((r) => r.season.electric)));

export const HOME_INDEX_SEALS_CUT_PCT = Math.round(
  median(HOME_INDEX_ROWS.map((r) => (1 - r.fixedSeason.electric / r.season.electric) * 100)),
);

const BY_ELECTRIC_COST = [...HOME_INDEX_ROWS].sort((a, b) => a.season.electric - b.season.electric);
export const HOME_INDEX_CHEAPEST_3 = BY_ELECTRIC_COST.slice(0, 3);
export const HOME_INDEX_COSTLIEST_3 = BY_ELECTRIC_COST.slice(-3).reverse();
