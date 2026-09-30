import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Disclosure } from "@/components/commerce/Disclosure";
import { Cost } from "@/components/commerce/Cost";
import { BuyButton } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { insulateFirst, type RoiContext } from "@/lib/planner/roi";
import { heatLossDesign } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION, EXAMPLE_A_PRICES } from "@/lib/planner/fixtures";
import { SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/garage-door-insulation-kit")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const BUY_IDS = [
  "door-kit-eps-matador",
  "door-kit-eps-cellofoam",
  "door-kit-reflective-owens-corning",
  "door-kit-reflective-reach-barrier",
] as const;

export default function Page() {
  const baseEnvelope = resolveEnvelope(EXAMPLE_A_INPUT);
  const tOut = designTempFor(EXAMPLE_A_INPUT, EXAMPLE_A_STATION);
  const elevationFt = EXAMPLE_A_STATION.elevFt;
  const ctx: RoiContext = {
    input: EXAMPLE_A_INPUT,
    baseEnvelope,
    tOut,
    elevationFt,
    station: EXAMPLE_A_STATION,
    prices: EXAMPLE_A_PRICES,
  };
  const rows = insulateFirst(ctx);
  const eps = rows.find((r) => r.measure === "door_kit_eps")!;
  const reflective = rows.find((r) => r.measure === "door_kit_reflective")!;

  // Real heatLossDesign() calls, not a guess: the door alone with a kit, versus the same door once the
  // (still-bare) ceiling is also brought to R-30 -- the comparison the "do the ceiling first" section needs.
  const baseline = heatLossDesign(EXAMPLE_A_INPUT, baseEnvelope, tOut, elevationFt);
  const kitOnlyEnvelope = { ...baseEnvelope, doorTypes: baseEnvelope.doorTypes.map(() => "kit_eps_or_batt" as const) };
  const kitOnly = heatLossDesign(EXAMPLE_A_INPUT, kitOnlyEnvelope, tOut, elevationFt);
  const kitPlusCeilingEnvelope = { ...kitOnlyEnvelope, ceilingIns: "R30" as const };
  const kitPlusCeiling = heatLossDesign(EXAMPLE_A_INPUT, kitPlusCeilingEnvelope, tOut, elevationFt);

  const products = BUY_IDS.map((id) => {
    const product = findProduct(id)!;
    const links = route(product, "site");
    const primary = links.find((l) => l.slot === "primary") ?? links[0];
    return { product, primary };
  });

  return (
    <ReportPage entry={entry} sources={[]}>
      <AnswerBlock>
        An EPS door kit cuts about{" "}
        <Num v={eps.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'door_kit_eps' measure — lib/planner/roi.ts" /> of
        a 2-car garage&apos;s design-day heat loss on BayHeat&apos;s standard worked example; a reflective kit
        cuts about{" "}
        <Num v={reflective.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'door_kit_reflective' measure — lib/planner/roi.ts" />.
        Either one barely moves the needle if the ceiling above the garage is still bare drywall — that&apos;s
        where most of the load is.
      </AnswerBlock>
      <p className="text-sm text-(--color-fg-2)">{SAVINGS_VARY}</p>

      <h2>EPS versus reflective, on the same door</h2>
      <p>
        Both kit types glue or clip into the back of a standard steel door&apos;s panels. An EPS (rigid foam)
        kit is thicker and typically in the R-6 to R-8 class; a reflective kit is a thin foil-faced foam layer
        that relies on a radiant air gap rather than bulk insulation, and manufacturers publish it in a lower
        R-value class than an equivalent-thickness EPS kit. Exact R-value depends on the specific kit — check
        the manufacturer&apos;s own fact sheet before comparing two products on that number alone.
      </p>
      <table>
        <thead>
          <tr>
            <th>Kit type</th>
            <th>Design-day cut</th>
            <th>Share of load</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EPS / rigid foam</td>
            <td>
              <Num v={eps.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst() 'door_kit_eps' — lib/planner/roi.ts" />
            </td>
            <td>
              <Num v={eps.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'door_kit_eps' — lib/planner/roi.ts" />
            </td>
            <td>
              <Cost amount={eps.cost} />
            </td>
          </tr>
          <tr>
            <td>Reflective / foil-faced</td>
            <td>
              <Num v={reflective.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst() 'door_kit_reflective' — lib/planner/roi.ts" />
            </td>
            <td>
              <Num v={reflective.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'door_kit_reflective' — lib/planner/roi.ts" />
            </td>
            <td>
              <Cost amount={reflective.cost} />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Both figures beat the {reflective.paybackYears.electric < eps.paybackYears.electric ? "EPS kit's" : "reflective kit's"} payback
        window on electric heat — an EPS kit pays back in about{" "}
        <Num v={eps.paybackYears.electric} unit="yr" ev="C" src="insulateFirst() 'door_kit_eps' — cost / savingsPerYear.electric" /> year,
        a reflective kit in about{" "}
        <Num v={reflective.paybackYears.electric} unit="yr" ev="C" src="insulateFirst() 'door_kit_reflective' — cost / savingsPerYear.electric" /> year.
        The EPS kit removes more heat loss for a bit more money; the reflective kit is cheaper and lighter to
        install. Neither is the wrong buy — they trade off cost against the size of the cut.
      </p>

      <h2>Do the ceiling first</h2>
      <p>
        On the standard worked example, the door kit alone drops the design load from about{" "}
        <Num v={baseline.qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign() on EXAMPLE_A_INPUT, bare ceiling" /> to{" "}
        <Num v={kitOnly.qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign() with doorTypes: kit_eps_or_batt, ceiling still bare" />{" "}
        — real progress, but the ceiling above an uninsulated attic is still the single biggest hole in the
        envelope, door kit or not. Bringing that same ceiling to R-30 on top of the door kit drops the load
        further, to about{" "}
        <Num v={kitPlusCeiling.qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign() with doorTypes: kit_eps_or_batt, ceilingIns: R30" />{" "}
        — roughly double the door kit&apos;s own cut, for one more afternoon of work. A kit on a bare-ceiling
        garage is still worth doing, but it isn&apos;t the whole job. See{" "}
        <Link href="/how-to-insulate-a-garage">how to insulate a garage in the order that pays back →</Link>{" "}
        for the ceiling step and why it goes first.
      </p>

      <Disclosure />
      <h2>Buy a kit</h2>
      <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
        {products.map(({ product, primary }) => (
          <div key={product.id} className="border border-(--color-line) bg-(--color-surface) p-4">
            <p className="font-medium text-(--color-fg)">{product.name}</p>
            <p className="mt-1 font-mono text-xs text-(--color-fg-2)">Price class: {product.priceClass}</p>
            <div className="mt-3">
              {primary ? <BuyButton href={primary.href}>{primary.label}</BuyButton> : null}
            </div>
          </div>
        ))}
      </div>

      <h2>What not to buy</h2>
      <p>
        Don&apos;t buy a door kit as your first insulation project if the ceiling above the garage is still
        bare drywall or open joists. The ceiling carries more of a typical detached or attached garage&apos;s
        load than the door does, so a kit bought first is money spent on the smaller problem — seal the door
        (see the <Link href="/garage-door-weather-stripping">weather-stripping page</Link>) and insulate the
        ceiling before spending on a door kit, not after.
      </p>
    </ReportPage>
  );
}
