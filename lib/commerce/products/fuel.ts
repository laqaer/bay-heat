import type { Product } from "../types.ts";

// Lane: diesel, propane, vented gas, and the mini-split cross-sell (BLUEPRINT.md §2.5, §2.8). Buddy-type
// propane NEVER carries a buy button on any surface -- route.ts / the planner UI enforce that, not this file,
// but its safetyLine still quotes the manual's own scope since it appears as a "why not" / safe-alternative
// reference and on the Can I Run It? verdict.

export const PRODUCTS: Product[] = [
  {
    id: "diesel-heater-5kw",
    name: "Diesel air heater, 5kW class (parking-heater style, clone)",
    kind: "diesel_air",
    searchQuery: "diesel air heater 5kW parking heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: {
      text: "No UL/CSA listing for building heat. VEVOR\u2019s manual for its 8 kW diesel air heater lists \u201cLiving room, garage\u201d under places it can not be used for constant heating. Exhaust and intake outdoors only; CO alarm required.",
      ev: "S",
      sourceId: "vevor-diesel-manual",
    },
  },
  {
    id: "diesel-heater-8kw",
    name: "Diesel air heater, 8kW class (parking-heater style, clone)",
    kind: "diesel_air",
    searchQuery: "diesel air heater 8kW parking heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: {
      text: "No UL/CSA listing for building heat. VEVOR\u2019s manual for its 8 kW diesel air heater lists \u201cLiving room, garage\u201d under places it can not be used for constant heating. Exhaust and intake outdoors only; CO alarm required.",
      ev: "S",
      sourceId: "vevor-diesel-manual",
    },
  },
  {
    id: "diesel-exhaust-kit",
    name: "Diesel heater exhaust thimble and muffler kit",
    kind: "diesel_exhaust_kit",
    searchQuery: "diesel air heater exhaust muffler wall thimble kit",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
  },
  {
    id: "propane-buddy-9k",
    name: "Mr. Heater Buddy, 4,000-9,000 BTU/h portable propane heater",
    kind: "g_unvented_buddy",
    searchQuery: "Mr Heater Buddy portable propane heater indoor safe",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Manual: emergency indoor heating only, on 1-lb cylinders, never while sleeping. Never a refillable cylinder indoors.", ev: "S", sourceId: "mh-buddy-manual" },
  },
  {
    id: "propane-big-buddy-18k",
    name: "Mr. Heater Big Buddy, 4,000-18,000 BTU/h portable propane heater",
    kind: "g_unvented_buddy",
    searchQuery: "Mr Heater Big Buddy portable propane heater indoor safe",
    partnerUrls: {},
    priceClass: "$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Manual: emergency indoor heating only, on 1-lb cylinders, never while sleeping. Never a refillable cylinder indoors.", ev: "S", sourceId: "mh-bigbuddy-manual" },
  },
  {
    id: "gas-unit-heater-big-maxx-50",
    name: "Mr. Heater Big Maxx 50,000 BTU forced-air unit heater (propane or natural gas)",
    kind: "g_vented_unit",
    asin: "B00LWW7V7K",
    searchQuery: "Mr Heater Big Maxx vented natural gas garage unit heater",
    partnerUrls: {},
    priceClass: "$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: {
      text: "Licensed gas fitter and permit required. Manual: in a residential garage the bottom of the heater must be at least 8 ft above the floor (code minimum for burner and ignition: 18 in, IFGC 2021 §305.3). Never where gasoline, solvents, paint thinner or dust are present.",
      ev: "S",
      sourceId: "big-maxx-manual",
    },
  },
  {
    id: "gas-unit-heater-hot-dawg-45",
    name: "Modine Hot Dawg HDS, separated-combustion vented gas unit heater",
    kind: "g_vented_unit",
    searchQuery: "Modine Hot Dawg HDS separated combustion garage unit heater",
    partnerUrls: {},
    priceClass: "$$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    // Manual 6-584.12 pp. 2 and 4 (DANGER). Separated combustion keeps dusty room air out of the burner; it is not a
    // licence for a solvent or gasoline atmosphere, which an earlier version of this line implied.
    safetyLine: {
      text: "Licensed gas fitter and permit required. Manual: \u201cAppliances must not be installed where they may be exposed to a potentially explosive or flammable atmosphere.\u201d Separated combustion takes burner air from outdoors; it does not make a room with solvent or gasoline vapor safe.",
      ev: "S",
      sourceId: "hot-dawg-hds-manual",
    },
  },
  {
    // The 115 V DIY class (hp_diy_12k_115) is a different product from the 230 V unit: a reader whose garage cannot take a
    // 240 V circuit must never be sent to a 230 V model. No verified listing yet, so this stays a search link.
    id: "minisplit-12k-115v",
    name: "12,000 BTU/h 115V plug-in DIY mini-split heat pump (heat + cool)",
    kind: "minisplit",
    searchQuery: "12000 BTU mini split heat pump 115V DIY pre-charged",
    partnerUrls: {},
    priceClass: "$$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Refrigerant work (vacuum, charge, line-set brazing) needs EPA Section 608 certification -- have it installed by a licensed HVAC contractor.", ev: "R", sourceId: "epa-608" },
  },
  {
    id: "minisplit-12k-230v",
    name: "Della Optima 12,000 BTU 230V mini-split heat pump (heat + cool)",
    kind: "minisplit",
    asin: "B0CTJDVB8K",
    searchQuery: "12000 BTU mini split heat pump 230V garage",
    partnerUrls: {},
    priceClass: "$$$$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Refrigerant work (vacuum, charge, line-set brazing) needs EPA Section 608 certification -- have it installed by a licensed HVAC contractor.", ev: "R", sourceId: "epa-608" },
  },
];
