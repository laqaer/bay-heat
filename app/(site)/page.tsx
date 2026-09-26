import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { HERO_STATES, HERO_PLAN, HERO_QSIZE_RANGE } from "@/lib/home/hero-states";
import { HOME_CAN_I_RUN_IT_EXAMPLES } from "@/lib/home/can-i-run-it-examples";
import {
  HOME_INDEX_ROWS,
  HOME_INDEX_US_MEDIAN_ELECTRIC,
  HOME_INDEX_SEALS_CUT_PCT,
  HOME_INDEX_CHEAPEST_3,
  HOME_INDEX_COSTLIEST_3,
} from "@/lib/home/heat-index-preview";
import { DISAGREEMENT_MARKS } from "@/lib/home/disagreement-marks";
import { HeroFrame } from "@/components/home/HeroFrame";
import { HeroZipField } from "@/components/home/HeroZipField";
import { DisagreementStrip } from "@/components/figures/DisagreementStrip";
import { GarageIso } from "@/components/figures/GarageIso";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { UsTileMap } from "@/components/figures/UsTileMap";
import { Figure } from "@/components/figures/Figure";
import { SAVINGS_VARY, SAFETY_SCOPE } from "@/lib/site";
import { btuh, usd, commas } from "@/lib/format";

const entry = findPage("/")!;

export const metadata: Metadata = pageMetadata({ path: "/", title: entry.title, description: entry.description, type: "website" });

const STAMP_STYLE: Record<string, string> = {
  "GO · PER MANUAL": "bg-(--color-ember) text-black",
  "ONLY IF": "border-2 border-(--color-fg) text-(--color-fg)",
  "NO-GO": "bg-(--color-alarm) text-white",
};

const PLEDGES = [
  "We never claim a test we didn't run. Measured means a published log, an instrument and a receipt.",
  "We buy every unit we test, at retail, and post the receipt with the address redacted. A pick without an M mark was chosen from manufacturer specs and our model — we have not tested it.",
  "No money changes a result, a ranking, a verdict or a model constant.",
  "No display ads — not on the planner, the reports, safety pages or money pages.",
  "We publish \"Don't buy\" verdicts, negative results and our model's misses.",
  "We correct within 72 hours, or 24 for safety. Every change goes into the Lab notebook.",
  "We show how every page is made: model version, sources, AI assistance, and who checked it.",
];

// The home page (BLUEPRINT.md §4.9): runs on the dark Camera surface end to end, not a paper page with a
// boxed dark exhibit -- the thermal-camera concept is the one thing this brand exists to show. Sections
// 05 (Lab test board) and 06 (Recall Watch) are deliberately not built here: no physical test has produced
// real P-002..P-005 data yet, and no lib/safety/recalls.snapshot.ts exists -- both would mean fabricating
// "no recalls found" / status data this desk hasn't actually checked, which the seven pledges below forbid.
// Both ship once safety-desk and lab-analyst produce the real thing.
export default function HomePage() {
  const station = { city: HERO_PLAN.station.city, st: HERO_PLAN.station.st, h99: HERO_PLAN.station.h99 };

  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      {/* Hero */}
      <section className="mx-auto max-w-[1392px] px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          <div className="order-1 lg:col-span-6 lg:col-start-1 lg:row-start-1">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Lab report BH-001 · the 4× problem</p>
            <h1 className="wdth-118 mt-4 max-w-xl text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              One garage. Seven answers.{" "}
              <span className="text-(--color-fg-2)">
                {btuh(HERO_QSIZE_RANGE[0])}–{btuh(HERO_QSIZE_RANGE[1])} BTU/h.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-(--color-fg-2)">
              Rules of thumb can&rsquo;t see your garage. Our open model can.
            </p>
          </div>
          <div className="order-2 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2">
            <HeroFrame states={HERO_STATES} station={station} />
          </div>
          <div className="order-3 lg:col-span-6 lg:col-start-1 lg:row-start-2">
            <HeroZipField />
          </div>
        </div>

        <div className="mt-10">
          <DisagreementStrip marks={DISAGREEMENT_MARKS} ourBand={HERO_QSIZE_RANGE} fig={1} />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-(--color-line) pt-6 font-mono text-[11px] text-(--color-fg-2)">
          <span>ASHRAE · climate data</span>
          <span>EIA · gov&rsquo;t fuel prices</span>
          <span>NEC · electrical code</span>
          <span>IFGC · gas code</span>
          <span>NFPA · fire code</span>
          <span>UL · safety listing</span>
        </div>
      </section>

      {/* 02 / Where your heat goes */}
      <section className="border-t border-(--color-line) bg-(--color-surface)">
        <div className="mx-auto max-w-[1392px] px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">02 / Where your heat goes</p>
          <h2 className="wdth-112 mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            The ceiling loses more than the walls. The door loses more than the ceiling.
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Figure n={2} caption="Our example garage: 24×24×9, attached, R-13 walls, uninsulated ceiling, one steel door.">
              <div className="flex aspect-[4/3] items-center justify-center bg-(--color-bg) text-(--color-fg)">
                <GarageIso bays={2} attached ceilingFt={9} doorType="steel_single" />
              </div>
            </Figure>
            <HeatLossBars items={HERO_PLAN.heating.items} fig={3} />
          </div>
        </div>
      </section>

      {/* 03 / Can I Run It? */}
      <section className="border-t border-(--color-line)">
        <div className="mx-auto max-w-[1392px] px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">03 / Can I run it?</p>
          <h2 className="wdth-112 mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Three real questions. Three real answers.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {HOME_CAN_I_RUN_IT_EXAMPLES.map((ex) => (
              <div key={ex.question} className="border border-(--color-line) bg-(--color-surface) p-5">
                <p className="text-sm leading-6 text-(--color-fg-2)">{ex.question}</p>
                <div className={`wdth-125 mt-4 inline-block px-3 py-1.5 text-sm font-black tracking-tight ${STAMP_STYLE[ex.verdict.stamp]}`}>
                  {ex.verdict.stamp}
                </div>
                <p className="mt-3 text-xs text-(--color-fg-2)">{ex.verdict.conditions.length} condition{ex.verdict.conditions.length === 1 ? "" : "s"} to check</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-prose text-sm text-(--color-fg-2)">{SAFETY_SCOPE}</p>
          <Link
            href="/can-i-run-it"
            className="mt-6 inline-flex h-12 items-center border border-(--color-fg)/25 px-5 text-[15px] font-medium text-(--color-fg) hover:bg-(--color-surface-2)"
          >
            Check my heater →
          </Link>
        </div>
      </section>

      {/* 04 / The Garage Heat Index */}
      <section className="border-t border-(--color-line) bg-(--color-surface)">
        <div className="mx-auto max-w-[1392px] px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">04 / The Garage Heat Index</p>
          <h2 className="wdth-112 mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            The US median garage costs {usd(HOME_INDEX_US_MEDIAN_ELECTRIC)} a season to heat on electric resistance.
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-(--color-fg-2)">
            Same standard 24×24×9 garage, held at 50°F, priced at each state&rsquo;s own current electricity rate.
            Seals and a door kit cut the median about {HOME_INDEX_SEALS_CUT_PCT}%. {SAVINGS_VARY}
          </p>
          <div className="mt-6">
            <UsTileMap rows={HOME_INDEX_ROWS} />
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">Cheapest to heat</p>
              <ul className="mt-2 space-y-1 text-sm text-(--color-fg)">
                {HOME_INDEX_CHEAPEST_3.map((r) => (
                  <li key={r.state}>
                    {r.state} — {r.city} · {usd(r.season.electric)}/season
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">Costliest to heat</p>
              <ul className="mt-2 space-y-1 text-sm text-(--color-fg)">
                {HOME_INDEX_COSTLIEST_3.map((r) => (
                  <li key={r.state}>
                    {r.state} — {r.city} · {usd(r.season.electric)}/season
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/cost-to-heat-a-garage" className="mt-6 inline-block text-sm text-(--color-link) underline underline-offset-4">
            See all {commas(HOME_INDEX_ROWS.length)} states →
          </Link>
        </div>
      </section>

      {/* 07 / How we work */}
      <section className="border-t border-(--color-line)">
        <div className="mx-auto max-w-[1392px] px-4 py-16 sm:px-6 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">07 / How we work</p>
          <h2 className="wdth-112 mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Seven things we hold ourselves to.</h2>
          <ol className="mt-8 max-w-2xl space-y-4">
            {PLEDGES.map((p, i) => (
              <li key={i} className="flex gap-4 border-t border-(--color-line) pt-4 text-[15px] leading-7 text-(--color-fg-2) first:border-t-0 first:pt-0">
                <span className="shrink-0 font-mono text-sm text-(--color-fg)">{String(i + 1).padStart(2, "0")}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          <Link href="/how-we-work" className="mt-8 inline-block text-sm text-(--color-link) underline underline-offset-4">
            Read the full standards page →
          </Link>
        </div>
      </section>
    </div>
  );
}
