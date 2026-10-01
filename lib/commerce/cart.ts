import { AMAZON_TAG_CART, AMAZON_TAGS_BY_PAGE } from "../env.public.ts";
import { VERIFIED_ASINS } from "./products/core.ts";

// The Fix-First "add to Amazon cart" button ships wired but dark until >=2 distinct verified ASINs are in the
// fix row (BLUEPRINT.md §0.3). Returns null otherwise -- the caller must not render a cart button on null.
// A repeated ASIN raises that line's quantity (two doors, two seals); it does not count as a second product.
//
// One cart click credits the whole cart if the buyer checks out inside Amazon's 24 h window, so a bundle of
// $20 seals is the cheapest way to open a session in which they may also buy something bigger.
export function amazonCartUrl(asins: string[], tag: string = AMAZON_TAG_CART): string | null {
  const counts = new Map<string, number>();
  for (const a of asins) {
    if (!(VERIFIED_ASINS as readonly string[]).includes(a)) continue;
    counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  if (counts.size < 2) return null;
  const params = [...counts].map(([asin, qty], i) => `ASIN.${i + 1}=${asin}&Quantity.${i + 1}=${qty}`).join("&");
  return `https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=${tag}&${params}`;
}

// The tracking ID for a cart on a page: the page's own ID when NEXT_PUBLIC_AMAZON_TAGS names one.
export function cartTagFor(page?: string): string {
  return (page && AMAZON_TAGS_BY_PAGE[page]) || AMAZON_TAG_CART;
}
