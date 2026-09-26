import type { HeaterClassId } from "../planner/types.ts";

export type PartnerId =
  | "amazon"
  | "homedepot"
  | "walmart"
  | "lowes"
  | "northern_tool"
  | "vevor"
  | "hcalory"
  | "hvacdirect"
  | "gotductless"
  | "pioneer"
  | "della"
  | "sylvane";
export type Surface = "site" | "planner" | "cart" | "mail" | "safety";
export type ProductKind =
  | HeaterClassId
  | "seal_bottom"
  | "seal_retainer"
  | "seal_perimeter"
  | "seal_service_door"
  | "attic_hatch"
  | "door_kit_eps"
  | "door_kit_reflective"
  | "co_alarm"
  | "extinguisher"
  | "thermostat_line_voltage"
  | "fridge_heater_kit"
  | "freeze_alarm"
  | "diesel_exhaust_kit"
  | "minisplit";
export type PriceClass = "$" | "$$" | "$$$" | "$$$$"; // <$100 . $100-300 . $300-1,000 . >$1,000 (our range, not a live price)
export type Product = {
  id: string; // one of PRODUCT_IDS (lib/commerce/ids.ts)
  name: string;
  kind: ProductKind;
  asin?: string; // must be in VERIFIED_ASINS (lib/commerce/products/core.ts) or the router rejects the /dp/ link
  searchQuery: string;
  partnerUrls: Partial<Record<Exclude<PartnerId, "amazon">, string>>;
  priceClass: PriceClass;
  priceClassChecked: string; // YYYY-MM-DD
  specFactIds: string[]; // ids into lib/facts
  safetyLine?: { text: string; ev: "S" | "R"; sourceId: string };
};
export type BuyLink = { partner: PartnerId; href: string; label: string; slot: "primary" | "secondary" | "also"; surface: Surface };

// SIGNATURE (implemented in the named module, not here): function route(p: Product, surface: Surface): BuyLink[];                    // lib/commerce/route.ts
// SIGNATURE (implemented in the named module, not here): function amazonCartUrl(asins: string[], surface: Surface): string | null;   // lib/commerce/cart.ts -- null unless >=2 verified ASINs; ships wired but dark until then (see BLUEPRINT.md §0.3)
