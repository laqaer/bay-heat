"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { GarageInput, PlannerResult } from "@/lib/planner/types";
import { decode } from "@/lib/planner/codec";
import { plan } from "@/lib/planner/plan";
import { PlannerWizard } from "./PlannerWizard";
import { GarageHeatReport } from "@/components/result/GarageHeatReport";
import { saveGarageSummary } from "@/lib/garage-store";

// The site is a static export, so the planner's URL state (?g=<code> for a finished report, ?zip=<3 digits>
// from the home page) is read in the browser, not on the server. useSyncExternalStore rather than
// useSearchParams (BLUEPRINT.md §2.3): useSearchParams needs a <Suspense> boundary in a static export, which
// would drop the wizard out of the prerendered HTML. The server snapshot is "" so hydration always matches
// the prerendered wizard, then React re-reads the real query string.
function subscribe(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
const getSearch = () => window.location.search;
const getServerSearch = () => "";

function fromSearch(search: string): { result: PlannerResult | null; zip3?: string } {
  const params = new URLSearchParams(search);
  // A code can contain "+", which a query string reads as a space unless it was sent as %2B.
  const g = params.get("g")?.replace(/ /g, "+");
  const input = g ? decode(g) : null;
  const zip = params.get("zip")?.slice(0, 3);
  return { result: input ? plan(input) : null, zip3: zip || undefined };
}

export function PlannerApp({ header }: { header?: ReactNode }) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const fromUrl = useMemo(() => fromSearch(search), [search]);
  // Set once the visitor finishes or resets the wizard on this page; until then the URL decides.
  const [local, setLocal] = useState<{ result: PlannerResult | null } | null>(null);
  const result = local ? local.result : fromUrl.result;
  const router = useRouter();

  function handleComplete(input: GarageInput) {
    const r = plan(input);
    setLocal({ result: r });
    saveGarageSummary({ code: r.code, qSize: r.heating.qSize, grade: r.heating.grade, kw: r.heating.kwSize, breakerA: r.circuits.forSize.breakerA });
    router.replace(`/garage-heater-calculator?g=${encodeURIComponent(r.code)}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startOver() {
    setLocal({ result: null });
    router.replace("/garage-heater-calculator", { scroll: false });
  }

  if (result) {
    return (
      <div className="mt-10">
        <GarageHeatReport result={result} />
        <div className="mt-10 text-center">
          <button type="button" onClick={startOver} className="text-sm text-(--color-link) underline">
            Start over with a different garage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {header}
      <div className={header ? "mt-10" : undefined}>
        {/* Keyed by zip so a ?zip= that only appears after hydration still seeds the wizard's initial state. */}
        <PlannerWizard key={fromUrl.zip3 ?? ""} onComplete={handleComplete} initialZip3={fromUrl.zip3} />
      </div>
    </>
  );
}
