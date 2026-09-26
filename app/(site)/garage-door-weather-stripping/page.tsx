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

const entry = findPage("/garage-door-weather-stripping")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const BUY_IDS = ["seal-perimeter-stop", "seal-service-door-kit", "seal-bottom-t-16ft", "seal-retainer-kit"] as const;

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
  const weatherstrip = rows.find((r) => r.measure === "weatherstrip")!;
  const newDoor = rows.find((r) => r.measure === "new_pu_door");

  const products = BUY_IDS.map((id) => {
    const product = findProduct(id)!;
    const links = route(product, "site");
    const primary = links.find((l) => l.slot === "primary") ?? links[0];
    return { product, primary };
  });

  return (
    <ReportPage entry={entry} sources={[]}>
      <AnswerBlock>
        A <Cost amount={weatherstrip.cost} /> weatherstrip package — bottom seal, perimeter stop, and
        service-door kit — cuts about{" "}
        <Num v={weatherstrip.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'weatherstrip' measure — lib/planner/roi.ts" /> of a
        2-car garage&apos;s design-day heat loss on BayHeat&apos;s standard worked example, for a payback under{" "}
        <Num v={weatherstrip.paybackYears.electric} unit="yr" ev="C" src="insulateFirst() 'weatherstrip' — cost / savingsPerYear.electric" /> year
        on electric heat.
      </AnswerBlock>
      <p className="text-sm text-(--color-fg-2)">{SAVINGS_VARY}</p>

      <h2>Three leaks, one afternoon</h2>
      <p>
        A garage door leaks air in three places, and a full weatherstrip package treats all three: the bottom
        edge (see the <Link href="/garage-door-bottom-seal">bottom seal page</Link> for track matching), the
        perimeter — the two sides and top where the door meets its jamb and header — and the service door
        most attached garages also have. Sealing only one of the three still leaves the other gaps open, so the
        package, not a single part, is what the{" "}
        <Num v={weatherstrip.dQDesign} unit="BTU/h" round={100} ev="C" src="insulateFirst() 'weatherstrip' measure — lib/planner/roi.ts" />{" "}
        figure above assumes.
      </p>
      <ul>
        <li>
          <strong>Perimeter stop</strong> — a rubber-bulb strip nailed or screwed to the door jamb and header,
          closing the gap the big door itself leaves at its sides and top.
        </li>
        <li>
          <strong>Bottom seal</strong> — see the <Link href="/garage-door-bottom-seal">bottom seal page</Link>{" "}
          for matching T-style, bulb, or beaded profiles to your retainer track.
        </li>
        <li>
          <strong>Service-door kit</strong> — jamb weatherstrip plus a door-bottom sweep for the walk-in door,
          which leaks the same way any exterior door does and is easy to forget because it isn&apos;t the big
          door.
        </li>
      </ul>

      <h2>The math behind &quot;$125 cuts 12%&quot;</h2>
      <p>
        BayHeat&apos;s standard worked example is a 24×24 ft attached two-car garage in Chicago, R-13 walls,
        one uninsulated steel door, average drafts, held at 55°F. Tightening the door and its openings by one
        tightness grade — average to tight — is what the weatherstrip package above buys, and it&apos;s worth{" "}
        <Cost amount={weatherstrip.savingsPerYear.electric} per="yr" /> on electric heat at Illinois rates in
        this example. A gas-heated garage saves less in dollars per year at typical gas prices, since gas costs
        less per BTU than electric resistance heat, but the BTU/h reduction itself doesn&apos;t change with fuel
        type.
      </p>

      <Disclosure />
      <h2>Buy the package</h2>
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
        {newDoor ? (
          <>
            Don&apos;t buy a new door to chase this same draft. A replacement polyurethane door costs roughly{" "}
            <Cost amount={newDoor.cost} /> installed and closes about{" "}
            <Num v={newDoor.pctOfLoad} unit="%" ev="C" src="insulateFirst() 'new_pu_door' measure — lib/planner/roi.ts" /> of
            the same garage&apos;s load — worth doing when the door panel itself is failing, but not a
            reasonable answer to a $125 draft problem.
          </>
        ) : (
          <>
            Don&apos;t buy a new door to chase this same draft — weatherstripping the door you have closes most
            of the same gap for a fraction of the cost, and a new door only earns its price once the door panel
            itself, not its seals, is what&apos;s failing.
          </>
        )}
      </p>
    </ReportPage>
  );
}
