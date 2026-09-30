"use client";

import Link from "next/link";
import { useGarage } from "@/lib/garage-store";

// Mobile-only sticky CTA (BLUEPRINT.md §4.5). Once a garage is saved, it becomes the
// "Your garage: 13.0k BTU/h · B" bar instead of the generic "Size my garage" pitch.
export function StickyCta() {
  const garage = useGarage();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-(--color-line) bg-(--color-ember) lg:hidden" data-sticky-cta>
      <Link href={garage ? `/garage-heater-calculator?g=${garage.code}` : "/garage-heater-calculator"} className="flex h-14 items-center justify-center px-4 text-[15px] font-medium text-black">
        {garage ? (
          <>
            Your garage: {(garage.qSize / 1000).toFixed(1)}k BTU/h · {garage.grade} &rarr;
          </>
        ) : (
          "Size my garage — 60 s"
        )}
      </Link>
    </div>
  );
}
