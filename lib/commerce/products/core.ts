import type { Product } from "../types.ts";

// Every Amazon listing the site links to with /dp/ instead of a search page. An ASIN goes in only after
// `node scripts/verify-asins.mjs --only-candidates --asin <ASIN>` reports `ok` (a real, buyable listing with a Buy
// Box), the title on the page matches the Product it is attached to, and, for a heater, the manual behind its
// safetyLine was read. `unavailable` and `offers-only` listings are never primaries: they earn nothing.
// Evidence for each entry is in company/research/asin-ledger.json; re-run the script weekly. Never invent an ASIN --
// commerce.test.ts asserts every product `asin` is listed here and every listed ASIN is used by a product.
export const VERIFIED_ASINS = [
  // heaters (BLUEPRINT.md §2.5, §5.5)
  "B009F1SWH8",
  "B00PX0T37I",
  "B01M8KXXAB",
  "B077JM5PB9",
  "B01M276DQJ",
  "B08174Q7KY",
  // parked 2026-09-30, listing "Currently unavailable" (restore when verify-asins reports ok): B004VVJANC old CZ798 listing, B07JQPCFJ3 HS-1500-TT
  // seal / insulate
  "B07P43LTYH",
  "B07P55PSW1",
  "B0C9952GSX",
  "B0D9Y1NWCT",
  "B0009F86SE",
  "B00012FQCY",
  "B0HG41WQG3",
  // fuel and mini-split
  "B00LWW7V7K",
  "B0CTJDVB8K",
  // safety
  "B00FHW7PBS",
  "B00F5CK9X6",
  "B00M0YNECU",
  "B01M1OPOZB",
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "cz220-5kw-ceiling",
    name: "Comfort Zone CZ220 5,000W ceiling heater",
    kind: "e_240_5k",
    asin: "B009F1SWH8",
    outputBtuh: 17060,
    searchQuery: "Comfort Zone CZ220 5000W 240V ceiling heater",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["cz220.watts.high", "cz220.amps.high", "cz220.btuh.high", "cz220.breaker", "cz220.wire"],
    // Manual spec page: "FOR INDOOR USE ONLY, IN A DRY LOCATION FREE OF GASOLINE, PAINT, FLAMMABLE LIQUIDS OR
    // COMBUSTIBLE DUST OR MATERIALS" -- the dust clause matters in a woodshop, so it rides on every CZ220 plate.
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored. Indoors only, in a dry space free of combustible dust.", ev: "S", sourceId: "cz220-manual" },
  },
  {
    id: "fuh54-5kw",
    name: "Fahrenheat FUH54 5,000W ceiling/wall heater",
    kind: "e_240_5k",
    asin: "B00PX0T37I",
    outputBtuh: 17065,
    searchQuery: "Fahrenheat FUH54 5000W 240V heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["fuh54.watts.high", "fuh54.amps.high", "fuh54.btuh.high", "fuh54.fuse_max", "fuh54.wire"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "fuh54-manual" },
  },
  {
    id: "cz798-1500w-milkhouse",
    name: "Comfort Zone CZ798GR3 1,500W milkhouse heater",
    kind: "e_port_1500",
    asin: "B08174Q7KY",
    outputBtuh: 5118,
    searchQuery: "Comfort Zone CZ798 1500W milkhouse heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["cz798.watts", "cz798.amps"],
    safetyLine: { text: "Sole load on the circuit. No extension cords or power strips. Manual: attended use only, never while you're away or asleep, and not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "cz798-manual" },
  },
  {
    id: "dr975-7k5-shop",
    name: "Dr. Infrared DR-975 7,500W shop heater",
    kind: "e_240_7k5",
    asin: "B01M8KXXAB",
    outputBtuh: 25597,
    searchQuery: "Dr Infrared DR-975 7500W shop heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["dr975.watts", "dr975.btuh", "dr975.breaker", "dr975.wire", "dr975.clearance_back_in"],
    safetyLine: {
      text: "Manual: \u201cWARNING \u2013 RISK OF FIRE, DO NOT USE AS A RESIDENTIAL OR HOUSEHOLD HEATER.\u201d Also not where gasoline, paint or flammable liquids are used or stored. Ask Dr. Infrared whether your garage counts as residential before you buy.",
      ev: "S",
      sourceId: "dr975-manual",
    },
  },
  {
    id: "hs1500tt-wall-infrared",
    name: "Heat Storm HS-1500-TT wall infrared heater",
    kind: "e_ir_wall_1500",
    outputBtuh: 5118,
    searchQuery: "Heat Storm HS-1500-TT wall infrared heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["hs1500tt.watts", "hs1500tt.mount_height_in_us", "hs1500tt.clearance_side_in"],
    safetyLine: { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "hs1500tt-manual" },
  },
  {
    id: "dr238-1500w-infrared",
    name: "Dr. Infrared DR-238 1,500W carbon infrared heater (wall or ceiling)",
    kind: "e_ir_wall_1500",
    asin: "B077JM5PB9",
    outputBtuh: 5118,
    searchQuery: "Dr Infrared DR-238 1500W carbon infrared heater wall ceiling",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-30",
    specFactIds: ["dr238.watts", "dr238.mount_height_in", "dr238.clearance_ceiling_in", "dr238.clearance_wall_in"],
    safetyLine: {
      text: "Manual: the lowest part of the heater must be at least 94.5 in above the floor, wall or ceiling mounted, and a wall mount needs 15.8 in to the ceiling, so check your ceiling height first; a standard 8 ft ceiling will not meet it. Not where gasoline, paint or flammable liquids are used or stored. Plug it straight into the outlet: never an extension cord or power strip.",
      ev: "S",
      sourceId: "dr238-manual",
    },
  },
];
