import type { Metadata } from "next";
import Link from "next/link";

// The one deliberate `ƒ` content route (BLUEPRINT.md §9.1): a shared Garage Heat Report permalink. W4
// (planner flow) replaces this with decode(code) -> plan() -> <GarageHeatReport> once lib/planner/codec.ts
// and lib/planner/plan.ts land. noindex + no canonical (the canonical page is the planner itself) --
// deliberately NOT disallowed in robots.txt, so link-preview crawlers can still fetch its OG image
// (feasibility red-team finding #8).
export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Garage Heat Report ${code}`,
    robots: { index: false, follow: true },
  };
}

export default async function ReportPermalink({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">Report {code}</p>
      <h1 className="wdth-112 mt-3 text-3xl font-bold text-(--color-fg)">This report is in build.</h1>
      <p className="mt-4 text-(--color-fg-2)">Run the planner on your own garage instead.</p>
      <Link href="/garage-heater-calculator" className="mt-6 inline-flex h-12 items-center bg-(--color-ember) px-5 text-[15px] font-medium text-black">
        Plan your own garage
      </Link>
    </div>
  );
}
