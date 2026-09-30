import type { Measure } from "@/lib/planner/types";
import { fixCartCoveredMeasures, fixCartHref, fixCartLines } from "@/lib/commerce/fixCart";
import { MEASURE_LABEL } from "@/lib/planner/roi";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { BuyButton, BuyTextLink } from "@/components/ui/BuyButton";
import { DISCLOSURE_INLINE } from "@/lib/site";
import { PaidLabel } from "./PaidLabel";

// The parts behind the fix-first measures, with one button that puts them all in an Amazon cart. This is the
// bottom of the funnel the report builds up to: the reader has just seen "fix these first"; this is where they
// can do it. Renders nothing when no measure has a verified listing.
//
// No prices in this block: a dollar figure inside a buy group is not allowed (BLUEPRINT.md §5.3), and the
// fix-first cost estimate above is a range from our own model, not an Amazon price.
export function FixCart({
  measures,
  doors,
  page,
  title = "Parts for these fixes",
}: {
  measures: readonly Measure[];
  doors: readonly { w: number }[];
  page: string;
  title?: string;
}) {
  const lines = fixCartLines(measures, doors);
  if (lines.length === 0) return null;
  const cart = fixCartHref(lines, page);
  // Say so when a fix in the plan has no part in the cart, instead of implying the cart is the whole plan.
  const covered = new Set(fixCartCoveredMeasures(measures, doors));
  const missing = measures.filter((m) => !covered.has(m)).map((m) => MEASURE_LABEL[m]);
  return (
    <div data-buy-group className="not-prose mt-5 border border-(--color-fg)/25 bg-(--color-surface) p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--color-fg-2)">{title}</p>
      <p className="mt-2 text-[11px] leading-4 text-(--color-fg-2)">{DISCLOSURE_INLINE}</p>
      <ul className="mt-3 divide-y divide-(--color-line)">
        {lines.map((l) => {
          const p = findProduct(l.productId);
          const link = p ? route(p, "planner", page)[0] : null;
          return (
            <li key={l.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-(--color-fg)">
                {l.qty > 1 ? `${l.qty} × ` : ""}
                {l.name}
              </span>
              {link ? (
                <BuyTextLink href={link.href} className="shrink-0 text-xs">
                  View ↗
                </BuyTextLink>
              ) : null}
            </li>
          );
        })}
      </ul>
      {cart ? (
        <BuyButton href={cart} className="mt-3 h-11 w-full sm:w-auto">
          Add all {lines.length} to your Amazon cart
        </BuyButton>
      ) : null}
      <PaidLabel />
      {missing.length > 0 ? (
        <p className="mt-2 text-[11px] leading-4 text-(--color-fg-2)">
          Not in this cart (no single part with a verified listing): {missing.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
