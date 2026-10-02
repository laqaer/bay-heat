import type { Product } from "../types.ts";
import { PRODUCTS as CORE } from "./core.ts";
import { PRODUCTS as SEAL } from "./seal.ts";
import { PRODUCTS as ELECTRIC } from "./electric.ts";
import { PRODUCTS as FUEL } from "./fuel.ts";
import { PRODUCTS as SAFETY } from "./safety.ts";

export const ALL_PRODUCTS: Product[] = [...CORE, ...SEAL, ...ELECTRIC, ...FUEL, ...SAFETY];

export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

// The product to put on a plate for a heater class: the first one with a verified Amazon listing (a direct
// /dp/ link earns; a search link is the fallback), else the first listed.
export function primaryProduct(ids: readonly string[]): Product | undefined {
  const products = ids.map((id) => findProduct(id)).filter((p): p is Product => p !== undefined);
  return products.find((p) => p.asin) ?? products[0];
}

// The generic flammables sentence that every heater plate already carries at class level.
const STANDARD_FLAMMABLES = "Manual: not where gasoline, paint or flammable liquids are used or stored.";

// A product's own manual warning, beyond the standard flammables line, or undefined when it has none. Anything
// a maker prints that a reader should see before buying (for example "do not use as a residential heater")
// goes through here so a plate that links to that product can never leave it out.
export function productWarning(p: Product | undefined): string | undefined {
  const text = p?.safetyLine?.text.replace(STANDARD_FLAMMABLES, "").trim();
  return text ? text : undefined;
}

// A plate for a planner recommendation may link one model directly only if that model can supply what was
// recommended: a single unit whose own nameplate output covers the modeled capacity. A multi-unit result ("two 12k
// mini-splits") or a ranged class ("vented gas unit heater, up to 125,000 BTU/h") must not turn one smaller model
// into a direct purchase link; those fall back to a search for the class's first product.
export function productForRecommendation(
  ids: readonly string[],
  need: { capacityBtuh: number; units: number },
): { product: Product | undefined; direct: boolean } {
  const products = ids.map((id) => findProduct(id)).filter((p): p is Product => p !== undefined);
  const fits = products.find((p) => p.asin && p.outputBtuh !== undefined && need.units === 1 && need.capacityBtuh <= p.outputBtuh * 1.01);
  return fits ? { product: fits, direct: true } : { product: products[0], direct: false };
}

// What a planner card must show for the product it links, given the class-level line it already renders. The class
// line carries the standard flammables sentence only when the reader did not say they store none (recommend.ts), so
// the sentence is dropped from the product's line only when the class line really has it; otherwise the product's
// whole line is shown, flammables included, because a direct purchase card never goes without the maker's rule.
export function warningToShow(product: Product | undefined, classLine: string | undefined): string | undefined {
  if (!product?.safetyLine) return undefined;
  const extra = classLine?.includes(STANDARD_FLAMMABLES) ? productWarning(product) : product.safetyLine.text;
  return extra && !classLine?.includes(extra) ? extra : undefined;
}
