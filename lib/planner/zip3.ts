import type { ClimateStation, PriceSet } from "./types.ts";
import { stationById, primaryStationForState } from "./stations.ts";
import { pricesForState } from "./prices.ts";
import { ZIP3_STATE_RANGES, ZIP3_STATION_OVERRIDES } from "./zip3.data.ts";

// ZIP3 -> {state, station, prices} (BLUEPRINT.md §2.3, the home hero ZIP field and codec token). Two layers:
// a coarse ~60-row USPS ZIP3 range table resolves the state (correctness-critical -- it picks the PriceSet),
// then a curated metro-prefix override table prefers the geographically nearest of that state's stations over
// always falling back to the state's primary. A ZIP3 with no override still resolves correctly to a station,
// just not necessarily the closest one -- the same kind of approximation the real ZCTA-gazetteer table makes.

export function zip3ToState(zip3: string): string | undefined {
  const n = Number(zip3);
  if (!Number.isFinite(n) || zip3.length !== 3) return undefined;
  const hit = ZIP3_STATE_RANGES.find(([lo, hi]) => n >= lo && n <= hi);
  return hit?.[2];
}

export function zip3ToStation(zip3: string): ClimateStation | undefined {
  const override = ZIP3_STATION_OVERRIDES[zip3];
  if (override) {
    const s = stationById(override);
    if (s) return s;
  }
  const state = zip3ToState(zip3);
  return state ? primaryStationForState(state) : undefined;
}

export type Zip3Resolution = { zip3: string; state: string; station: ClimateStation; prices: PriceSet };

// The "ZIP re-light" lookup: null when the ZIP3 doesn't resolve (territory, military, or malformed), in which
// case the UI falls back to the "Pick a state" select (§2.3).
export function resolveZip3(zip3: string): Zip3Resolution | null {
  const state = zip3ToState(zip3);
  if (!state) return null;
  const station = zip3ToStation(zip3) ?? primaryStationForState(state);
  if (!station) return null;
  return { zip3, state, station, prices: pricesForState(state) };
}
