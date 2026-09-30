import type { Product } from "../types.ts";

// Unverified electric classes (tagged Amazon search links only -- no ASIN has been checked against
// VERIFIED_ASINS, per BLUEPRINT.md §2.5). Every heater Product carries a safetyLine (S12, §9.4).

const FLAMMABLES_LINE = { text: "Manual: not where gasoline, paint or flammable liquids are used or stored.", ev: "S", sourceId: "generic-electric-heater-manual" } as const;

export const PRODUCTS: Product[] = [
  {
    id: "e-240-4k-generic",
    name: "240V 4,000W hardwired garage heater",
    kind: "e_240_4k",
    searchQuery: "240V 4000W hardwired garage heater",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: FLAMMABLES_LINE,
  },
  {
    id: "e-240-10k-generic",
    name: "Dr. Infrared DR-910F 10,000W 240V hardwired shop heater",
    kind: "e_240_10k",
    asin: "B01M276DQJ",
    outputBtuh: 34120,
    searchQuery: "240V 10000W hardwired garage unit heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: {
      text: "Manual: \u201cWARNING \u2013 RISK OF FIRE, DO NOT USE AS A RESIDENTIAL OR HOUSEHOLD HEATER.\u201d Also not where gasoline, paint or flammable liquids are used or stored. Ask Dr. Infrared whether your garage counts as residential before you buy.",
      ev: "S",
      sourceId: "dr910f-manual",
    },
  },
  {
    id: "e-ir-240-generic",
    name: "240V quartz/tube infrared ceiling heater, 3-6kW",
    kind: "e_ir_240",
    searchQuery: "240V infrared tube heater garage ceiling",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Keep clearances below the heating element per the manual -- radiant elements ignite anything left underneath.", ev: "S", sourceId: "generic-infrared-heater-manual" },
  },
  {
    id: "e-port-1500-generic",
    name: "120V 1,500W portable utility heater",
    kind: "e_port_1500",
    searchQuery: "120V 1500W portable garage utility heater UL listed",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Sole load on the circuit. No extension cords or power strips. 3 ft from anything flammable.", ev: "S", sourceId: "generic-portable-heater-manual" },
  },
];
