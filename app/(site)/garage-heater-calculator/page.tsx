import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { PlannerApp } from "@/components/capture/PlannerApp";

const entry = findPage("/garage-heater-calculator")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

// Static page: PlannerApp reads ?g= / ?zip= in the browser and hides this header once a report is showing.
export default function Page() {
  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      <article className="mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14">
        <PlannerApp
          header={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Planner</p>
              <h1 className="wdth-112 mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{entry.h1}</h1>
              <p className="mt-4 max-w-xl text-[17px] leading-7 text-(--color-fg-2)">{entry.description}</p>
            </>
          }
        />
      </article>
    </div>
  );
}
