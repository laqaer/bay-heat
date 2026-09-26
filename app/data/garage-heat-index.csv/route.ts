// W0 placeholder. W7 (data desk) replaces this with the real 51-row export from scripts/build-index.ts
// (lib/index/data.generated.ts), computed from lib/planner at build time. force-static keeps it a plain file
// (○), not a request-time route.
export const dynamic = "force-static";

export async function GET() {
  const csv = "state,city,season_electric,season_heat_pump,season_natural_gas,season_propane,cheapest,as_of\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "inline; filename=garage-heat-index.csv" },
  });
}
