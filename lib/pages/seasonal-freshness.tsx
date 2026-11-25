import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { HEATER_CLASSES } from "@/lib/planner/catalog";
import { circuitLabel, classCircuit } from "@/lib/planner/classCircuit";
import type { Surface } from "@/lib/commerce/types";
import type { HeaterClassId } from "@/lib/planner/types";
import { BuyButton } from "@/components/ui/BuyButton";
import { DISCLOSURE_INLINE, SITE_URL } from "@/lib/site";
import { PaidLabel } from "@/components/commerce/PaidLabel";
import { SourceLink } from "@/components/evidence/SourceLink";
import { JsonLd, articleJsonLd } from "@/lib/jsonld";
import type { PageEntry } from "./types.ts";
import { amazonCtaText, PRICE_NOTE } from "./seasonal.ts";

export function SeasonalFreshness({ entry }: { entry: PageEntry }) {
  return (
    <>
      <p className="text-sm text-(--color-fg-2)">{`Updated ${entry.updated}.`}</p>
      <p>{PRICE_NOTE}</p>
      <JsonLd
        data={articleJsonLd({
          headline: entry.h1,
          description: entry.description,
          url: `${SITE_URL}${entry.href}`,
          datePublished: entry.published,
          dateModified: entry.updated,
        })}
      />
    </>
  );
}

export function SeasonalPick({
  productId,
  page,
  headline,
  compareHref,
  compareLabel = "Compare every option",
  eyebrow = "Model pick · spec-based",
  surface = "site",
  direct = true,
}: {
  productId: string;
  page: string;
  headline: string;
  compareHref?: `#${string}`;
  compareLabel?: string;
  eyebrow?: string;
  surface?: Surface;
  direct?: boolean;
}) {
  const product = findProduct(productId);
  if (!product) throw new Error(`SeasonalPick: unknown product id "${productId}"`);
  const links = route(direct ? product : { ...product, asin: undefined }, surface, page);
  const primary = links.find((l) => l.slot === "primary") ?? links[0];

  const cls = HEATER_CLASSES[product.kind as HeaterClassId];
  const point = cls && cls.outputBtuh[0] === cls.outputBtuh[1];
  const specs = !cls || !point
    ? null
    : cls.energy === "electric"
      ? `${(cls.outputBtuh[1] / 3.412 / 1000).toFixed(1)} kW${classCircuit(cls) ? ` · ${circuitLabel(classCircuit(cls)!)}` : ""}`
      : `${Math.round(cls.outputBtuh[1]).toLocaleString("en-US")} BTU/h`;

  return (
    <div data-buy-group className="not-prose my-4 border border-(--color-fg)/25 bg-(--color-surface) p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--color-fg-2)">{eyebrow}</p>
      <p className="mt-1 text-base font-bold leading-snug text-(--color-fg)">
        {product.name}
        {specs ? <span className="ml-2 inline-block whitespace-nowrap font-mono text-sm font-normal text-(--color-fg-2)">{specs}</span> : null}
      </p>
      <p className="mt-1 max-w-none text-sm leading-5 text-(--color-fg-2)">{headline}</p>
      <p className="mt-2 max-w-none text-[11px] leading-4 text-(--color-fg-2)">{DISCLOSURE_INLINE}</p>
      <BuyButton href={primary.href} className="mt-2 h-11 w-full sm:w-auto">
        {amazonCtaText(primary.partner, primary.label)}
      </BuyButton>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4">
        <PaidLabel />
        {compareHref ? (
          <a href={compareHref} className="inline-flex min-h-11 items-center text-sm text-(--color-link) underline underline-offset-4">
            {compareLabel} ↓
          </a>
        ) : null}
      </div>
      {product.safetyLine ? (
        <p className="mt-2 max-w-none border-l-2 border-(--color-alarm) pl-2 text-[11px] leading-4 text-(--color-fg-2)" data-source={product.safetyLine.sourceId}>
          {product.safetyLine.text}
          <SourceLink sourceId={product.safetyLine.sourceId} />
        </p>
      ) : null}
    </div>
  );
}
