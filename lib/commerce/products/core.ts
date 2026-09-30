import type { Product } from "../types.ts";

// The only 5 Amazon-verified ASINs on the site (BLUEPRINT.md §2.5, §5.5). Never invent an ASIN here --
// commerce.test.ts asserts every catalog.ts productId with an `asin` resolves to one of these.
export const VERIFIED_ASINS = ["B009F1SWH8", "B00PX0T37I", "B004VVJANC", "B01M8KXXAB", "B07JQPCFJ3"] as const;

export const PRODUCTS: Product[] = [
  {
    id: "cz220-5kw-ceiling",
    name: "Comfort Zone CZ220 5,000W ceiling heater",
    kind: "e_240_5k",
    asin: "B009F1SWH8",
    searchQuery: "Comfort Zone CZ220 5000W 240V ceiling heater",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["cz220.watts.high", "cz220.amps.high", "cz220.btuh.high", "cz220.breaker", "cz220.wire"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "cz220-manual" },
  },
  {
    id: "fuh54-5kw",
    name: "Fahrenheat FUH54 5,000W ceiling/wall heater",
    kind: "e_240_5k",
    asin: "B00PX0T37I",
    searchQuery: "Fahrenheat FUH54 5000W 240V heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["fuh54.watts.high", "fuh54.amps.high", "fuh54.btuh.high", "fuh54.fuse_max", "fuh54.wire"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "fuh54-manual" },
  },
  {
    id: "cz798-1500w-milkhouse",
    name: "Comfort Zone CZ798 1,500W milkhouse heater",
    kind: "e_port_1500",
    asin: "B004VVJANC",
    searchQuery: "Comfort Zone CZ798 1500W milkhouse heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["cz798.watts", "cz798.amps"],
    safetyLine: { text: "Sole load on the circuit. No extension cords or power strips.", ev: "S", sourceId: "cz798-manual" },
  },
  {
    id: "dr975-7k5-shop",
    name: "Dr. Infrared DR-975 7,500W shop heater",
    kind: "e_240_7k5",
    asin: "B01M8KXXAB",
    searchQuery: "Dr Infrared DR-975 7500W shop heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["dr975.watts", "dr975.btuh", "dr975.breaker", "dr975.wire", "dr975.clearance_back_in"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "dr975-manual" },
  },
  {
    id: "hs1500tt-wall-infrared",
    name: "Heat Storm HS-1500-TT wall infrared heater",
    kind: "e_ir_wall_1500",
    asin: "B07JQPCFJ3",
    searchQuery: "Heat Storm HS-1500-TT wall infrared heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["hs1500tt.watts", "hs1500tt.mount_height_in_us", "hs1500tt.clearance_side_in"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "hs1500tt-manual" },
  },
];
