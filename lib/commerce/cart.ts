import { AMAZON_TAG_CART } from "../env.public.ts";
import { VERIFIED_ASINS } from "./products/core.ts";

// The Fix-First "add to Amazon cart" button ships wired but dark until >=2 verified ASINs are in the fix
// row (BLUEPRINT.md §0.3). Returns null otherwise -- the caller must not render a cart button on null.
export function amazonCartUrl(asins: string[], tag: string = AMAZON_TAG_CART): string | null {
  const verified = asins.filter((a) => (VERIFIED_ASINS as readonly string[]).includes(a));
  if (verified.length < 2) return null;
  const params = verified.map((asin, i) => `ASIN.${i + 1}=${asin}&Quantity.${i + 1}=1`).join("&");
  return `https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=${tag}&${params}`;
}
