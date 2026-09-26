// Frozen type for the Garage Heat Index (/cost-to-heat-a-garage), computed by scripts/build-index.ts from
// lib/planner at build time -- one row per state's population-primary station.

export type IndexRow = {
  state: string;
  stationId: string;
  city: string;
  hdd50: number;
  h99: number;
  elecPerKwh: number;
  ngPerTherm: number;
  propanePerGal: number;
  season: { electric: number; heatPump: number; naturalGas: number; propane: number };
  fixedSeason: { electric: number }; // after the seals+kit fix-first bundle, for the "seals cut ~27%" headline
  cheapest: "electric" | "heatPump" | "naturalGas" | "propane";
  per5kwHour: number;
  asOf: string; // YYYY-MM
};
