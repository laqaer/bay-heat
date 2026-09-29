import { HOME_INDEX_ROWS } from "@/lib/home/heat-index-preview";

// The Garage Heat Index export: the same 51 rows the page and the home preview compute from lib/planner
// (standard 24x24x9 attached 2-car, R-13 walls / R-19 ceiling, held at 50 degF, each state's population-primary
// station at its own EIA prices). force-static keeps it a plain file, built once per deploy.
export const dynamic = "force-static";

const HEADER = "state,city,season_electric,season_heat_pump,season_natural_gas,season_propane,cheapest,as_of";

export async function GET() {
  const rows = HOME_INDEX_ROWS.map((r) =>
    [
      r.state,
      `"${r.city}"`,
      Math.round(r.season.electric),
      Math.round(r.season.heatPump),
      Math.round(r.season.naturalGas),
      Math.round(r.season.propane),
      r.cheapest,
      r.asOf,
    ].join(","),
  );
  return new Response(`${HEADER}\n${rows.join("\n")}\n`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "inline; filename=garage-heat-index.csv" },
  });
}
