import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { decode } from "@/lib/planner/codec";
import { plan } from "@/lib/planner/plan";
import { PlannerApp } from "@/components/capture/PlannerApp";

const entry = findPage("/garage-heater-calculator")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default async function Page({ searchParams }: PageProps<"/garage-heater-calculator">) {
  const params = await searchParams;
  const g = typeof params.g === "string" ? params.g : undefined;
  const input = g ? decode(g) : null;
  const initialResult = input ? plan(input) : null;

  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      <article className="mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14">
        {!initialResult ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Planner</p>
            <h1 className="wdth-112 mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">{entry.h1}</h1>
            <p className="mt-4 max-w-xl text-[17px] leading-7 text-(--color-fg-2)">{entry.description}</p>
          </>
        ) : null}
        <div className="mt-10">
          <PlannerApp initialResult={initialResult} />
        </div>
      </article>
    </div>
  );
}
