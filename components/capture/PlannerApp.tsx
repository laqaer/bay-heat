"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GarageInput, PlannerResult } from "@/lib/planner/types";
import { plan } from "@/lib/planner/plan";
import { PlannerWizard } from "./PlannerWizard";
import { GarageHeatReport } from "@/components/result/GarageHeatReport";
import { saveGarageSummary } from "@/lib/garage-store";

export function PlannerApp({ initialResult }: { initialResult: PlannerResult | null }) {
  const [result, setResult] = useState<PlannerResult | null>(initialResult);
  const router = useRouter();

  function handleComplete(input: GarageInput) {
    const r = plan(input);
    setResult(r);
    saveGarageSummary({ code: r.code, qSize: r.heating.qSize, grade: r.heating.grade, kw: r.heating.kwSize, breakerA: r.circuits.forSize.breakerA });
    router.replace(`/garage-heater-calculator?g=${encodeURIComponent(r.code)}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startOver() {
    setResult(null);
    router.replace("/garage-heater-calculator", { scroll: false });
  }

  if (result) {
    return (
      <div>
        <GarageHeatReport result={result} />
        <div className="mt-10 text-center">
          <button type="button" onClick={startOver} className="text-sm text-(--color-link) underline">
            Start over with a different garage
          </button>
        </div>
      </div>
    );
  }

  return <PlannerWizard onComplete={handleComplete} />;
}
