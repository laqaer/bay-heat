import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { HEATER_CLASSES } from "@/lib/planner/catalog";
import type { HeaterClassId } from "@/lib/planner/types";
import { BuyButton } from "@/components/ui/BuyButton";
import { DISCLOSURE_INLINE } from "@/lib/site";
import { PaidLabel } from "./PaidLabel";

function circuitLabel(c: string): string {
  const m = /^(\d+)V(\d+)A$/.exec(c);
  return m ? `${m[1]} V / ${m[2]} A` : c;
}

// The above-the-fold pick (BLUEPRINT.md §3.3): one product, one button, inside the first screen on a phone. The
// revenue model's click-through rate assumes a buy plate within ~700 px; before this, every money page put its
// first paid link 1,250-3,800 px down on mobile. It is a model pick from spec sheets, so it says so.
//
// `productId` must exist in the product registry and carry the safety line a heater needs -- a bad id throws at
// build time, on purpose, so a typo can never ship an empty or unsafe plate.
export function QuickPick({
  productId,
  page,
  headline,
  compareHref,
  compareLabel = "Compare every option",
  eyebrow = "Model pick · spec-based",
}: {
  productId: string;
  page: string;
  headline: string;
  compareHref?: `#${string}`;
  compareLabel?: string;
  eyebrow?: string; // "Safety add-on" for a CO alarm; the default is the heater pick
}) {
  const product = findProduct(productId);
  if (!product) throw new Error(`QuickPick: unknown product id "${productId}"`);
  const links = route(product, "site", page);
  const primary = links.find((l) => l.slot === "primary") ?? links[0];

  const cls = HEATER_CLASSES[product.kind as HeaterClassId];
  const specs = cls ? `${(cls.outputBtuh[1] / 3.412 / 1000).toFixed(1)} kW${cls.circuit ? ` · ${circuitLabel(cls.circuit)}` : ""}` : null;

  return (
    <div data-buy-group className="not-prose my-4 border border-(--color-fg)/25 bg-(--color-surface) p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--color-fg-2)">{eyebrow}</p>
      <p className="mt-1 text-base font-bold leading-snug text-(--color-fg)">
        {product.name}
        {specs ? <span className="ml-2 font-mono text-sm font-normal text-(--color-fg-2)">{specs}</span> : null}
      </p>
      <p className="mt-1 text-sm leading-5 text-(--color-fg-2)">{headline}</p>
      <p className="mt-2 text-[11px] leading-4 text-(--color-fg-2)">{DISCLOSURE_INLINE}</p>
      <BuyButton href={primary.href} className="mt-2 h-11 w-full sm:w-auto">
        {primary.label}
      </BuyButton>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4">
        <PaidLabel />
        {compareHref ? (
          <a href={compareHref} className="text-sm text-(--color-link) underline underline-offset-4">
            {compareLabel} ↓
          </a>
        ) : null}
      </div>
      {product.safetyLine ? (
        <p className="mt-2 border-l-2 border-(--color-alarm) pl-2 text-[11px] leading-4 text-(--color-fg-2)">{product.safetyLine.text}</p>
      ) : null}
    </div>
  );
}
