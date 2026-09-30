import type { Measure } from "../planner/types.ts";
import { findProduct } from "./products/index.ts";
import { amazonCartUrl, cartTagFor } from "./cart.ts";

// The parts behind the fix-first measures, sized to the doors. Only measures with a verified Amazon listing
// appear; a measure with no part in the catalog (ceiling insulation, a new door) is simply absent, and the
// caller says so instead of pretending.
//
// Sizes follow the listings, not a guess: the 30 ft M-D top-and-side seal is one door's top plus both jambs
// (16 + 7 + 7 = 30 ft); the Reach Barrier pack is two 8x8 single-door kits, which suits a double door.
//
// THE CART IS DARK TODAY, ON PURPOSE. The planner's fix-first bundle can only contain weatherstrip, door_kit_eps and
// ceiling_r30 (roi.ts bundleCheapMeasures). With the bottom seal left out (below) and no in-stock EPS kit listing
// verified, that bundle yields one cartable part (the top-and-side seal), and amazonCartUrl() needs two distinct
// ASINs, so FixCart renders as a parts list with its notes and no "Add all" button. It lights up once a second
// part is mapped below (an EPS kit listing with its size taken from the listing; a service-door kit). Until then
// nothing advertises a cart.
//
// The bottom seal is deliberately NOT in the cart. Which one fits depends on the track already on the door (a T or
// bulb seal slides into a flat retainer; a beaded track needs a beaded seal; a bent or missing retainer means a new
// track first, see /garage-door-bottom-seal) and the planner never asks. Putting a T-seal in the cart for everyone
// would sell some readers a seal that cannot seat. The cart says so and points at the profile guide instead.
export type FixCartLine = { productId: string; qty: number; name: string; asin: string };

export function fixCartLines(measures: readonly Measure[], doors: readonly { w: number }[]): FixCartLine[] {
  const want = new Map<string, number>();
  const add = (id: string, n = 1) => want.set(id, (want.get(id) ?? 0) + n);
  const list = doors.length > 0 ? doors : [{ w: 16 }];
  for (const m of measures) {
    if (m === "weatherstrip") {
      add("seal-perimeter-stop", list.length);
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

// Parts of a measure the cart does cover that are still missing: the planner's weatherstrip measure is a package
// (bottom seal, top and side seal, service-door kit) and the service-door kit has no verified listing. Names only;
// FixCart says so next to the button instead of letting "Add all" read as the whole package.
// (The bottom seal is reported separately, see fixCartNeedsTrackChoice.)
export function fixCartMissingParts(measures: readonly Measure[]): string[] {
  const out: string[] = [];
  if (measures.includes("weatherstrip") && !findProduct("seal-service-door-kit")?.asin) out.push("service-door weatherstrip kit");
  return out;
}

// True when the plan includes the weatherstrip package, whose bottom seal depends on the door's track profile.
export function fixCartNeedsTrackChoice(measures: readonly Measure[]): boolean {
  return measures.includes("weatherstrip");
}
