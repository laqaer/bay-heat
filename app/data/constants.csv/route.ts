// W0 placeholder. W7 replaces this with every named constant lib/planner exports (U-values, ACH classes,
// heat contents, efficiencies), for the methodology page's "download the constants" link.
export const dynamic = "force-static";

export async function GET() {
  const csv = "constant,value,unit,evidence,source\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "inline; filename=constants.csv" },
  });
}
