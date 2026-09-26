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
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION, EXAMPLE_A_PRICES } from "@/lib/planner/fixtures";
import { SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/garage-door-bottom-seal")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const BUY_IDS = ["seal-bottom-t-8ft", "seal-bottom-t-16ft", "seal-bottom-bulb-16ft", "seal-retainer-kit"] as const;

export default function Page() {
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
  const seal = rows.find((r) => r.measure === "weatherstrip")!;

  const products = BUY_IDS.map((id) => {
    const product = findProduct(id)!;
    const links = route(product, "site");
    const primary = links.find((l) => l.slot === "primary") ?? links[0];
    return { product, primary };
  });

  return (
    <ReportPage entry={entry} sources={[]}>
      <AnswerBlock>
        A worn bottom seal on a 16 ft door is a small, cheap fix: sealing it on our standard 24×24 ft two-car
        worked example cuts about{" "}
        <Num v={seal.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst() 'weatherstrip' measure on EXAMPLE_A_INPUT — lib/planner/roi.ts" />{" "}
        of design-day heat loss for a <Cost amount={seal.cost} /> part. The right profile matters more than the
        brand — match the track you already have, or the seal won&apos;t hold.
      </AnswerBlock>

      <h2>Which seal fits your track</h2>
      <p>
        Most steel garage doors use a flat aluminum retainer channel screwed to the bottom edge. A T-style seal
        and a bulb seal both slide into that same flat channel — the difference is the rubber profile, not the
        track, so either works if the channel is in good shape.
      </p>
      <p>
        A beaded seal is different: it needs a rounder, molded-in bead track on the door&apos;s bottom
        aluminum astragal, not the flat channel above. Don&apos;t buy a beaded seal for a flat retainer, or a
        T-style/bulb seal for a beaded track — neither will seat, and the door will leak air at the bottom
        corners even after installation.
      </p>
      <p>
        A J-style or fin seal skips the track entirely — it tacks or nails straight to the bottom edge of the
        door. That makes it the fallback when a retainer is bent, rusted through, or missing, not a first
        choice when your existing track is still sound.
      </p>
      <ul>
        <li>Retainer intact, channel is flat → T-style or bulb seal, whichever profile you had before.</li>
        <li>Retainer intact, channel is a rounded bead track → beaded seal only.</li>
        <li>Retainer bent, cracked, or gone → replace the retainer track first, then pick a seal for it.</li>
      </ul>

      <h2>What sealing the bottom actually saves</h2>
      <p>
        On BayHeat&apos;s standard worked example — a 24×24 ft attached two-car garage in Chicago, R-13 walls,
        one uninsulated steel door, average drafts — tightening the door&apos;s bottom and perimeter by one
        tightness grade (the &quot;weatherstrip&quot; measure) removes about{" "}
        <Num v={seal.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'weatherstrip' measure — dQDesign / qDesign, lib/planner/roi.ts" /> of
        the garage&apos;s design-day heat loss, worth about{" "}
        <Cost amount={seal.savingsPerYear.electric} per="yr" /> on electric heat at Illinois rates, for a payback
        under <Num v={seal.paybackYears.electric} unit="yr" ev="C" src="insulateFirst() 'weatherstrip' — cost / savingsPerYear.electric" /> year.
      </p>
      <p className="text-sm text-(--color-fg-2)">{SAVINGS_VARY}</p>
      <p>
        That figure covers the whole weatherstrip package (bottom seal, perimeter stop, and service door), not
        the bottom seal alone — a bottom seal is the biggest single piece of it, since the bottom gap runs the
        full width of the door and sits right at floor level where cold air pools. See the{" "}
        <Link href="/garage-door-weather-stripping">full weather-stripping page</Link> for the perimeter stop
        and service-door kit that finish the job.
      </p>

      <Disclosure />
      <h2>Buy the right seal</h2>
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
        Don&apos;t replace the whole door to fix a drafty bottom edge. A new insulated steel door is a
        multi-hundred-dollar-and-up project aimed at the door&apos;s panel and core, not its bottom seal — it
        fixes a problem you don&apos;t have yet while leaving the actual leak (the seal) exactly as worn as it
        was. Fix the seal first; a new door only earns its cost once the door panel itself, not just its
        gasket, is the thing failing.
      </p>
    </ReportPage>
  );
}
