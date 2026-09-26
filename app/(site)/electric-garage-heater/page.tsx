import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Num } from "@/components/evidence/Num";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton, ButtonLink } from "@/components/ui/ButtonLink";
import { GradeScale } from "@/components/figures/GradeScale";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { heaterClass } from "@/lib/planner/catalog";
import type { HeaterClassId } from "@/lib/planner/types";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { getSource } from "@/lib/facts";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/electric-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

// e_port_1500 through e_240_10k, plus the two mini-split classes -- e_ir_240 gets its own page.
const CLASS_ORDER: HeaterClassId[] = [
  "e_port_1500",
  "e_ir_wall_1500",
  "e_240_4k",
  "e_240_5k",
  "e_240_7k5",
  "e_240_10k",
  "hp_diy_12k_115",
  "hp_12_24k_230",
];

const SUBPAGES: { href: "/240v-garage-heater" | "/portable-garage-heater" | "/ceiling-mount-garage-heater" | "/best-wall-mount-garage-heaters"; label: string; blurb: string }[] = [
  { href: "/240v-garage-heater", label: "240V garage heaters", blurb: "Breaker size, wire gauge and GFCI for a hardwired 4-10 kW unit, and why 4 kW doesn't fit a 20A circuit." },
  { href: "/portable-garage-heater", label: "Portable garage heaters", blurb: "What a 15A or 20A garage outlet can actually run without tripping." },
  { href: "/ceiling-mount-garage-heater", label: "Ceiling-mount garage heaters", blurb: "Mounting height, throw and clearance for a 5 kW or 7.5 kW ceiling unit." },
  { href: "/best-wall-mount-garage-heaters", label: "Wall-mount garage heaters", blurb: "1.5 kW to 7.5 kW wall units, with the clearances from each manual." },
];

const SOURCE_IDS = ["nec-2023", "cz798-manual", "hs1500tt-manual", "cz220-manual", "dr975-manual"];

function formatCircuit(c?: string): string {
  if (!c) return "—";
  const m = /^(\d+)V(\d+)A$/.exec(c);
  return m ? `${m[1]}V / ${m[2]}A` : c;
}

export default function Page() {
  const result = plan(EXAMPLE_A_INPUT);
  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <p>
        Electric garage heaters span a <Num v={1500} unit="W" ev="S" src="lib/planner/catalog.ts HEATER_CLASSES.e_port_1500" /> plug-in
        heater you carry in from the truck to a <Num v={10000} unit="W" ev="S" src="lib/planner/catalog.ts HEATER_CLASSES.e_240_10k" /> hardwired
        unit heater bolted to the ceiling. Output and circuit size scale together — a bigger heater always needs a bigger breaker and
        thicker wire, not just a bigger price tag.
      </p>
      <p>
        The <Link href="/garage-heater-calculator">garage heater calculator</Link> sizes the exact class for your garage from its
        dimensions, insulation and local design temperature. This page lists every class side by side; the pages below cover one class
        each in depth.
      </p>
      <div className="not-prose my-6">
        <ButtonLink href="/garage-heater-calculator">Size your garage free →</ButtonLink>
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

      <h2>Every electric class, side by side</h2>
      <p>
        Output ranges and circuits come from the same sizing engine behind the calculator, not a spec sheet we retyped by hand.
        Price is a range class, never a live number — check the actual price on the retailer&apos;s page before you buy.
      </p>
      <Disclosure />
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Class</th>
              <th className="py-2 pr-3 font-normal">Output</th>
              <th className="py-2 pr-3 font-normal">Circuit</th>
              <th className="py-2 pr-3 font-normal">Price</th>
              <th className="py-2 font-normal">Shop</th>
            </tr>
          </thead>
          <tbody>
            {CLASS_ORDER.map((id) => {
              const hc = heaterClass(id);
              const product = hc.productIds[0] ? findProduct(hc.productIds[0]) : undefined;
              const links = product ? route(product, "site") : [];
              const primary = links.find((l) => l.slot === "primary") ?? links[0];
              const [lo, hi] = hc.outputBtuh;
              return (
                <tr key={id} className="border-b border-(--color-line)/50 align-top">
                  <td className="py-3 pr-3 text-(--color-fg)">{hc.label}</td>
                  <td className="py-3 pr-3 font-mono whitespace-nowrap">
                    <Num v={lo} unit="BTU/h" round={100} ev="C" src={`HEATER_CLASSES.${id}.outputBtuh — lib/planner/catalog.ts`} />
                    {lo !== hi ? (
                      <>
                        {"–"}
                        <Num v={hi} unit="BTU/h" round={100} ev="C" src={`HEATER_CLASSES.${id}.outputBtuh — lib/planner/catalog.ts`} />
                      </>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3 font-mono whitespace-nowrap">{formatCircuit(hc.circuit)}</td>
                  <td className="py-3 pr-3 font-mono">{product?.priceClass ?? "—"}</td>
                  <td className="py-3">
                    {primary ? (
                      <BuyButton href={primary.href} className="h-9 px-3 text-xs">
                        {primary.label}
                      </BuyButton>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Don&apos;t buy by wattage alone</h2>
      <p>
        A <Num f="cz798.watts" /> plug-in heater keeps a workbench warm; it can&apos;t cover a whole detached garage, and running two or
        three of them to make up the difference means running two or three circuits. The opposite trap is a 240V heater that looks
        smaller because its wattage number is lower — a{" "}
        <Num v={4000} unit="W" ev="S" src="lib/planner/catalog.ts HEATER_CLASSES.e_240_4k" /> unit still needs a dedicated{" "}
        25A circuit, not the 20A circuit already run to most garages. The{" "}
        <Link href="/240v-garage-heater">240V page</Link> shows exactly why.
      </p>

      <h2>How big is &quot;enough&quot;? A worked example</h2>
      <p>
        A 24×24 ft attached two-car garage in Chicago, R-13 walls, one uninsulated steel door, average drafts, needs about{" "}
        <Num v={result.heating.qSize} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT) — lib/planner/plan.ts" /> (
        <Num v={result.heating.kwSize} unit="kW" round={0.1} ev="C" src="plan(EXAMPLE_A_INPUT)" />) to hold 55°F on the coldest design
        day — grade <Num v={result.heating.grade} ev="C" src="plan(EXAMPLE_A_INPUT).heating.grade" /> on the envelope scale below.
      </p>
      <GradeScale current={result.heating.grade} />
      <HeatLossBars items={result.heating.items} fig={1} />
      <p>
        That load calls for a{" "}
        <Num v={result.circuits.forSize.breakerA} unit="A" ev="C" src="circuitFor() inside plan(EXAMPLE_A_INPUT) — lib/planner/electrical.ts" />{" "}
        breaker and {result.circuits.forSize.wireNM} copper — a 10 kW class heater, not the smallest thing on the shelf.
      </p>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          Every 120V class here still needs GFCI protection on the outlet it plugs into (<Num f="code.nec.210_8_a" />); a hardwired
          240V unit isn&apos;t a receptacle, so that rule governs the garage&apos;s outlets, not the heater itself. Either way the
          circuit is sized for a continuous load (<Num f="code.nec.424_4_b" />), not just the heater&apos;s running current. Your
          electrician and your local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
    </ReportPage>
  );
}
