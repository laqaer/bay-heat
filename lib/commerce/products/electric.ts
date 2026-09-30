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
    name: "240V 10,000W hardwired shop/garage unit heater",
    kind: "e_240_10k",
    searchQuery: "240V 10000W hardwired garage unit heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: FLAMMABLES_LINE,
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
