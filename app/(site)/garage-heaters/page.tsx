import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton, ButtonLink } from "@/components/ui/ButtonLink";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import type { CostRow } from "@/lib/planner/types";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";

const entry = findPage("/garage-heaters")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["eia-electric-power-monthly", "eia-ng-annual", "eia-propane-weekly", "eia-diesel-weekly", "irc-2021"];

const SYSTEM_LABEL: Record<CostRow["system"], string> = {
  electric_resistance: "Electric resistance",
  heat_pump_cc: "Cold-climate mini-split (heat pump)",
  ng_vented_80: "Natural gas, vented unit heater",
  propane_bulk_80: "Propane, vented unit heater (bulk tank)",
  propane_cyl_92: "Propane, portable radiant (1-lb/20-lb cylinder)",
  diesel_78: "Diesel air heater",
};

const SUBPAGES: { href: "/electric-garage-heater" | "/diesel-heater-for-garage" | "/propane-heater-for-garage" | "/heat-pump-mini-split-for-garage" | "/infrared-garage-heater" | "/electric-vs-propane-garage-heater"; label: string; blurb: string }[] = [
  { href: "/electric-garage-heater", label: "Electric garage heaters", blurb: "1.5 kW plug-in to 10 kW hardwired — circuit size for every class." },
  { href: "/diesel-heater-for-garage", label: "Diesel heaters", blurb: "Cost per hour against electric, and why the exhaust has to go outside." },
  { href: "/propane-heater-for-garage", label: "Propane heaters", blurb: "Vented unit heaters vs portable Buddy-type radiant, and when each is safe." },
  { href: "/heat-pump-mini-split-for-garage", label: "Mini-split heat pumps", blurb: "Whether a pricier heat-pump install beats a cheap electric heater over 5 years." },
  { href: "/infrared-garage-heater", label: "Infrared garage heaters", blurb: "Radiant vs forced-air heat with the door open." },
  { href: "/electric-vs-propane-garage-heater", label: "Electric vs propane, head to head", blurb: "Delivered cost per million BTU, side by side." },
];

// One buyable representative class per fuel (BLUEPRINT.md §2.8: a Buddy-type portable propane heater never
// carries a buy button on any surface, so the propane_cyl_92 cost row below has no matching product here).
const BUYABLE: { system: Exclude<CostRow["system"], "propane_cyl_92">; productId: string; note: string }[] = [
  { system: "electric_resistance", productId: "cz220-5kw-ceiling", note: "240V ceiling class, no combustion, no exhaust to route." },
  { system: "heat_pump_cc", productId: "minisplit-12k-230v", note: "Same wattage moves 2-3x the heat above freezing; also cools in summer." },
  { system: "ng_vented_80", productId: "gas-unit-heater-big-maxx-50", note: "Runs on piped natural gas or a bulk propane tank — a licensed gas fitter installs it." },
  { system: "diesel_78", productId: "diesel-heater-5kw", note: "No UL/CSA listing for building heat — detached garage only, exhaust and intake outdoors." },
];

export default function Page() {
  const result = plan(EXAMPLE_A_INPUT);
  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        For BayHeat&apos;s standard 24×24 ft attached 2-car garage in Chicago, holding it at{" "}
        <Num v={EXAMPLE_A_INPUT.targetTemp} unit="°F" ev="S" src="EXAMPLE_A_INPUT.targetTemp — lib/planner/fixtures.ts" /> costs about{" "}
        <Num v={result.costs.find((c) => c.system === "electric_resistance")!.perMonth} unit="/mo" ev="C" src="costsForSeasonalLoad() at IL prices" /> on
        electric resistance and roughly <Num v={result.costs.find((c) => c.system === "diesel_78")!.perMonth} unit="/mo" ev="C" src="costsForSeasonalLoad() at IL prices" /> on
        diesel, in season. Your own garage and your own state&apos;s prices change both numbers — the calculator below runs them live.
      </AnswerBlock>
      <p>
        Every fuel heats a garage the same way — it just prices the BTUs differently, and each one carries its own
        install rule and its own carbon monoxide risk. This page compares all six systems side by side at one
        worked example; the pages below cover each fuel&apos;s heater classes, clearances and safety conditions in
        depth.
      </p>
      <div className="not-prose my-6">
        <ButtonLink href="/garage-heater-calculator">Size your garage and price every fuel free →</ButtonLink>
      </div>

      <h2>Which page you need</h2>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {SUBPAGES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block border border-(--color-line) bg-(--color-surface) p-4 transition-colors hover:border-(--color-fg)/30"
          >
            <p className="font-medium text-(--color-fg)">{s.label}</p>
            <p className="mt-1 text-sm leading-6 text-(--color-fg-2)">{s.blurb}</p>
          </Link>
        ))}
      </div>

      <h2>Fuel Cost Meter: every system, one garage, today&apos;s prices</h2>
      <p>
        This table runs the same 2-car garage, held at 55°F on the coldest day of a Chicago winter, through all six
        systems at Illinois&apos; own energy prices ({result.prices.asOf.elec} electricity, {result.prices.asOf.diesel} diesel).
        The <Link href="/garage-heater-calculator">calculator</Link> re-runs this exact math against your garage&apos;s size and
        your own state&apos;s prices instead of Illinois&apos; — the numbers below are one example, not a national average.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">System</th>
              <th className="py-2 pr-3 font-normal">Unit price</th>
              <th className="py-2 pr-3 font-normal">Per hour, full output</th>
              <th className="py-2 pr-3 font-normal">Per month, in season</th>
              <th className="py-2 font-normal">Per MMBtu delivered</th>
            </tr>
          </thead>
          <tbody>
            {result.costs.map((row) => (
              <tr key={row.system} className="border-b border-(--color-line)/50 align-top">
                <td className="py-3 pr-3 text-(--color-fg)">{SYSTEM_LABEL[row.system]}</td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  {row.unitPrice.toFixed(row.unit === "$/kWh" ? 4 : 3)} {row.unit}
                </td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Cost amount={row.perHour} per="hr" />
                </td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Cost amount={row.perMonth} per="mo" />
                </td>
                <td className="py-3 font-mono whitespace-nowrap">
                  <Cost amount={row.perMMBtu} per="MMBtu" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">
        &quot;Per hour, full output&quot; is this garage&apos;s{" "}
        <Num v={result.heating.qSize} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).heating.qSize" /> design load run flat
        out on the coldest day — a real winter runs mostly below that, which is what &quot;per month&quot; reflects. The portable
        radiant row&apos;s cylinder-exchange price is an estimate (about a dollar over bulk propane per gallon-equivalent) —
        exchange pricing isn&apos;t published state by state.
      </p>

      <h2>Buy: one representative heater per buyable fuel</h2>
      <p>
        A propane cylinder heater (the row above labeled portable radiant) is priced here for comparison only — it
        never gets a buy button on this site, attached garage or detached. See{" "}
        <Link href="/propane-heater-for-garage">the propane page</Link> for why, and{" "}
        <Link href="/can-i-run-it">Can I run it?</Link> for the exact conditions on the ones that do.
      </p>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        {BUYABLE.map(({ system, productId, note }) => {
          const product = findProduct(productId)!;
          const links = route(product, "site");
          const primary = links.find((l) => l.slot === "primary") ?? links[0];
          return (
            <div key={productId} className="border border-(--color-line) p-4">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">{SYSTEM_LABEL[system]}</p>
              <p className="mt-1 text-lg font-bold text-(--color-fg)">{product.name}</p>
              <p className="mt-2 text-sm text-(--color-fg-2)">{note}</p>
              <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {product.priceClass}</p>
              <div className="mt-3">
                <BuyButton href={primary.href}>{primary.label} ↗</BuyButton>
              </div>
            </div>
          );
        })}
      </div>

      <h2>Cost per MMBtu isn&apos;t the whole decision</h2>
      <p>
        Electric resistance and diesel land close together per delivered BTU at typical Midwest prices — diesel only
        pulls ahead once electricity costs more than roughly 21¢/kWh, closer to California or New England rates than
        Illinois&apos;. A mini-split beats resistance heat any month it stays above freezing, then loses that edge on
        the coldest nights. None of that changes the install rule: combustion heat needs a place for exhaust to go
        and a CO alarm; electric heat needs a circuit sized for its nameplate, not just its price tag.
      </p>

      <h2>Safety scope</h2>
      <SafetyCallout>
        <p>
          Every combustion system on this page needs a CO alarm in the house near the garage door (<Num f="code.irc.r315" />)
          and, for the classes we recommend, a garage-rated CO monitor while it runs. Electric classes skip the
          combustion risk entirely but still need the breaker and wire sized off the nameplate, not a guess.
        </p>
      </SafetyCallout>
    </ReportPage>
  );
}
