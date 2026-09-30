import type { Measure } from "../planner/types.ts";
import { findProduct } from "./products/index.ts";
import { amazonCartUrl, cartTagFor } from "./cart.ts";

// The parts behind the fix-first measures, sized to the doors. Only measures with a verified Amazon listing
// appear; a measure with no part in the catalog (ceiling insulation, a new door) is simply absent, and the
// caller says so instead of pretending.
//
// Sizes follow the listings, not a guess: the 8 ft T-seal listing is for an 8 ft wide door, so anything wider
// gets the 16 ft one; the 30 ft M-D top-and-side seal is one door's top plus both jambs (16 + 7 + 7 = 30 ft);
// the Reach Barrier pack is two 8x8 single-door kits, which suits a double door.
export type FixCartLine = { productId: string; qty: number; name: string; asin: string };

export function fixCartLines(measures: readonly Measure[], doors: readonly { w: number }[]): FixCartLine[] {
  const want = new Map<string, number>();
  const add = (id: string, n = 1) => want.set(id, (want.get(id) ?? 0) + n);
  const list = doors.length > 0 ? doors : [{ w: 16 }];
  for (const m of measures) {
    if (m === "weatherstrip") {
      for (const d of list) {
        add(d.w <= 8 ? "seal-bottom-t-8ft" : "seal-bottom-t-16ft");
        add("seal-perimeter-stop");
      }
    } else if (m === "door_kit_reflective") {
      for (const d of list) if (d.w > 10) add("door-kit-reflective-reach-barrier");
    } else if (m === "attic_hatch") {
      add("attic-hatch-gasket");
    }
  }
  const out: FixCartLine[] = [];
  for (const [productId, qty] of want) {
    const p = findProduct(productId);
    if (p?.asin) out.push({ productId, qty, name: p.name, asin: p.asin });
  }
  return out;
}

export function fixCartHref(lines: readonly FixCartLine[], page?: string): string | null {
  return amazonCartUrl(lines.flatMap((l) => Array<string>(l.qty).fill(l.asin)), cartTagFor(page));
}

// The measures that put at least one part in the cart for these doors.
export function fixCartCoveredMeasures(measures: readonly Measure[], doors: readonly { w: number }[]): Measure[] {
  return measures.filter((m) => fixCartLines([m], doors).length > 0);
}
