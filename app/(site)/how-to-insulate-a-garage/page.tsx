import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Num } from "@/components/evidence/Num";
import { Disclosure } from "@/components/commerce/Disclosure";
import { Cost } from "@/components/commerce/Cost";
import { BuyButton } from "@/components/ui/ButtonLink";
import { GradeScale } from "@/components/figures/GradeScale";
import { insulateFirst, fixFirst, MEASURE_LABEL, type RoiContext } from "@/lib/planner/roi";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION, EXAMPLE_A_PRICES } from "@/lib/planner/fixtures";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/how-to-insulate-a-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

function firstBuyLink(productIds: string[]) {
  for (const id of productIds) {
    const product = findProduct(id);
    if (!product) continue;
    const links = route(product, "site");
    const primary = links.find((l) => l.slot === "primary") ?? links[0];
    if (primary) return { product, primary };
  }
  return null;
}

export default function Page() {
  // Same worked example (24x24 attached 2-car, Chicago, R13/uninsulated-ceiling/steel door/average drafts)
  // roi.test.ts validates against the spec's own §15 table -- computed live here, not retyped.
  const baseEnvelope = resolveEnvelope(EXAMPLE_A_INPUT);
  const tOut = designTempFor(EXAMPLE_A_INPUT, EXAMPLE_A_STATION);
  const ctx: RoiContext = {
    input: EXAMPLE_A_INPUT,
    baseEnvelope,
    tOut,
    elevationFt: EXAMPLE_A_STATION.elevFt,
    station: EXAMPLE_A_STATION,
    prices: EXAMPLE_A_PRICES,
  };
  const rows = insulateFirst(ctx);
  const bundle = fixFirst(ctx, rows, "e_240_10k", "e_240_5k", 10000, 5000, 3);
  const byMeasure = Object.fromEntries(rows.map((r) => [r.measure, r]));

  return (
    <ReportPage entry={entry} sources={[]}>
      <p className="text-xl font-medium text-(--color-fg)">$675 of fixes. Half the heater.</p>
      <p>
        Seal the leaks, treat the door, then the ceiling — in that order, because each one pays back faster than the
        next. On BayHeat&apos;s standard worked example (a 24×24 ft attached two-car garage, Chicago design day),
        that order turns a{" "}
        {bundle ? (
          <>
            <Num v={bundle.qBefore} unit="BTU/h" round={100} ev="C" src="fixFirst() via lib/planner/roi.ts" /> load
            (grade <Num v={bundle.gradeBefore} ev="C" src="fixFirst()" />) into{" "}
            <Num v={bundle.qAfter} unit="BTU/h" round={100} ev="C" src="fixFirst()" /> (grade{" "}
            <Num v={bundle.gradeAfter} ev="C" src="fixFirst()" />) — a 10 kW class heater becomes a 5 kW class heater,
            and the breaker drops from <Num v={bundle.circuitBefore.breakerA} unit="A" ev="C" src="fixFirst()" /> to{" "}
            <Num v={bundle.circuitAfter.breakerA} unit="A" ev="C" src="fixFirst()" />
          </>
        ) : null}
        . None of that is a guess — it&apos;s the same <code>insulateFirst()</code> / <code>bundleCheapMeasures()</code>{" "}
        model behind the <Link href="/garage-heater-calculator">calculator</Link>, run live on this page.
      </p>
      <GradeScale current={bundle?.gradeAfter} />
      <p className="text-xs leading-5 text-(--color-fg-2)">{SAVINGS_VARY}</p>

      <h2>The order, and why it&apos;s this order</h2>
      <p>
        Fixing the envelope before buying a heater changes two things, not one: the energy it takes to run the
        heater, and the size (and price) of the heater itself. A garage that needs a 5 kW class heater instead of a
        10 kW class one saves on the equipment too, every year it&apos;s owned — not just on the electric bill. The
        table below is sorted by fastest electric payback first.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Fix</th>
              <th className="py-2 pr-3 font-normal">Cuts the load by</th>
              <th className="py-2 pr-3 font-normal">Cost</th>
              <th className="py-2 font-normal">Payback</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.measure} className="border-b border-(--color-line)/50 align-top">
                <td className="py-3 pr-3 text-(--color-fg)">{MEASURE_LABEL[r.measure]}</td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Num v={r.dQDesign} unit="BTU/h" round={100} ev="C" src={`insulateFirst().${r.measure} — lib/planner/roi.ts`} /> (
                  {r.pctOfLoad}%)
                </td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Cost amount={r.cost} />
                </td>
                <td className="py-3 font-mono whitespace-nowrap">
                  {Number.isFinite(r.paybackYears.electric) ? (
                    <Num v={r.paybackYears.electric} unit="yr" ev="C" src={`insulateFirst().${r.measure}.paybackYears.electric`} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-5 text-(--color-fg-2)">{SAVINGS_VARY}</p>

      <Disclosure />
      <h2>Shop the fixes</h2>
      <div className="not-prose my-4 grid gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const link = firstBuyLink(r.productIds);
          if (!link) return null;
          return (
            <div key={r.measure} className="border border-(--color-line) bg-(--color-surface) p-4">
              <p className="font-medium text-(--color-fg)">{link.product.name}</p>
              <p className="mt-1 font-mono text-xs text-(--color-fg-2)">Price class: {link.product.priceClass}</p>
              <div className="mt-3">
                <BuyButton href={link.primary.href}>{link.primary.label}</BuyButton>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-(--color-fg-2)">
        No specific product for the ceiling (a rented blower and bagged insulation from any home center) or a new
        door (get local quotes) — those two are hire-or-DIY jobs, not a single part to buy.
      </p>

      <h2>1. Seal the leaks first</h2>
      <p>
        Weatherstripping the garage door&apos;s bottom, sides and top, plus the service door, is the cheapest single
        step and the fastest payback on the list.{" "}
        {byMeasure.weatherstrip ? (
          <>
            At <Cost amount={byMeasure.weatherstrip.cost} /> it cuts{" "}
            <Num v={byMeasure.weatherstrip.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst().weatherstrip.dQDesign" /> off
            the design load.
          </>
        ) : null}{" "}
        Going from &quot;average&quot; drafts to &quot;tight&quot; doesn&apos;t require new materials science — it&apos;s a
        bottom seal, a perimeter stop, and closing the gaps around the service door.
      </p>

      <h2>2. Treat the big door</h2>
      <p>
        The garage door is usually the single largest area of uninsulated surface in the room. An EPS or fiberglass
        kit (a typical kit lands in the R-6 to R-10 class) drops in without replacing the door itself.{" "}
        {byMeasure.door_kit_eps ? (
          <>
            It cuts about{" "}
            <Num v={byMeasure.door_kit_eps.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst().door_kit_eps.dQDesign" />.
          </>
        ) : null}{" "}
        A reflective/radiant-barrier kit is cheaper but does less on a cold-climate design day — it works best
        against summer heat gain, not winter heat loss, so skip it if winter is the problem you&apos;re solving.
      </p>

      <h2>3. Then the ceiling</h2>
      <p>
        Blowing R-30 over a bare drywall ceiling (roughly R-2 as-is) is the single biggest fix on this list, because
        a vented attic sits directly above an uninsulated ceiling with almost nothing slowing the loss.{" "}
        {byMeasure.ceiling_r30 ? (
          <>
            It cuts{" "}
            <Num v={byMeasure.ceiling_r30.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst().ceiling_r30.dQDesign" /> —
            about {byMeasure.ceiling_r30.pctOfLoad}% of the whole load — for a materials cost most DIYers can rent a
            blower to install in an afternoon.
          </>
        ) : null}
      </p>

      <h2>What&apos;s optional, and what to skip for now</h2>
      <ul>
        {byMeasure.attic_hatch ? (
          <li>
            An attic hatch gasket is a small, cheap add-on — worth doing at the same time as the ceiling, but
            it&apos;s a minor line ({byMeasure.attic_hatch.pctOfLoad}% of the load), not a headline fix.
          </li>
        ) : null}
        {byMeasure.door_kit_reflective ? (
          <li>
            Skip the reflective kit if you&apos;re already doing the EPS kit above — they treat the same door, so
            only one belongs in your cart.
          </li>
        ) : null}
        {byMeasure.new_pu_door && byMeasure.door_kit_eps ? (
          <li>
            Skip a full <Cost amount={byMeasure.new_pu_door.cost} /> polyurethane door replacement for now. It saves
            less heat per dollar than the <Cost amount={byMeasure.door_kit_eps.cost} /> kit on the door you already
            have — put it on the list for when the door panel itself needs replacing, not before.
          </li>
        ) : null}
      </ul>

      <h2>Next step</h2>
      <p>
        <Link href="/garage-heater-calculator">Run your own garage through the calculator →</Link> to see your own
        load, grade and heater class before or after these fixes — the worked example above is one specific garage
        in Chicago, not yours.
      </p>
    </ReportPage>
  );
}
