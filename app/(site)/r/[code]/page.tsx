import type { Metadata } from "next";
import Link from "next/link";
import { decode } from "@/lib/planner/codec";
import { plan } from "@/lib/planner/plan";
import { GarageHeatReport } from "@/components/result/GarageHeatReport";

// The one deliberate `ƒ` content route (BLUEPRINT.md §9.1): a shared Garage Heat Report permalink.
// noindex + no canonical (the canonical page is the planner itself) -- deliberately NOT disallowed in
// robots.txt, so link-preview crawlers can still fetch its OG image (feasibility red-team finding #8).
export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const input = decode(code);
  const serial = input ? plan(input).serial : code;
  return {
    title: `Garage Heat Report ${serial} · BayHeat`,
    robots: { index: false, follow: true },
  };
}

export default async function ReportPermalink({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  const input = decode(code);

  if (!input) {
    return (
      <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">Report {code}</p>
          <h1 className="wdth-112 mt-3 text-3xl font-bold text-(--color-fg)">That link came from a different model version.</h1>
          <p className="mt-4 text-(--color-fg-2)">We loaded the example garage instead — plan your own below.</p>
          <Link href="/garage-heater-calculator" className="mt-6 inline-flex h-12 items-center bg-(--color-ember) px-5 text-[15px] font-medium text-black">
            Plan your own garage
          </Link>
        </div>
      </div>
    );
  }

  const result = plan(input);

  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Shared report</p>
        <h1 className="wdth-112 mt-2 text-3xl font-bold text-(--color-fg) sm:text-4xl">Garage Heat Report</h1>
        <div className="mt-8">
          <GarageHeatReport result={result} />
        </div>
        <div className="mt-10 border-t border-(--color-line) pt-6 text-center">
          <Link href="/garage-heater-calculator" className="inline-flex h-12 items-center bg-(--color-ember) px-5 text-[15px] font-medium text-black">
            Plan your own garage →
          </Link>
        </div>
      </div>
    </div>
  );
}
