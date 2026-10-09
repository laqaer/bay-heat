import type { Source } from "../types/evidence.ts";

// Primary sources checked 2026-09-25 (company/research/current-site-audit.md §2.1, planner-engineering.md §19).
// Each lane's own sources.ts (once written) is merged into this map by lib/facts/index.ts. Do not invent a
// source: a Fact's sourceId must resolve here or the facts test fails.
export const SOURCES: Record<string, Source> = {
  "nec-2023": {
    id: "nec-2023",
    title: "NFPA 70, National Electrical Code, 2023",
    publisher: "NFPA",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    retrieved: "2026-09-25",
  },
  "ifgc-2021": {
    id: "ifgc-2021",
    title: "International Fuel Gas Code, 2021",
    publisher: "ICC",
    url: "https://codes.iccsafe.org/content/IFGC2021",
    retrieved: "2026-09-25",
  },
  "irc-2021": {
    id: "irc-2021",
    title: "International Residential Code, 2021",
    publisher: "ICC",
    url: "https://codes.iccsafe.org/content/IRC2021",
    retrieved: "2026-09-25",
  },
  "nfpa-58": {
    id: "nfpa-58",
    title: "NFPA 58, Liquefied Petroleum Gas Code",
    publisher: "NFPA",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-58-standard-development/58",
    retrieved: "2026-09-25",
  },
  "cz220-manual": {
    id: "cz220-manual",
    title: "Comfort Zone CZ220 Series ceiling mounted heater owner's manual",
    publisher: "Comfort Zone (Lowe's copy)",
    url: "https://pdf.lowes.com/productdocuments/a293375b-caf2-4aa6-b3fe-6ff954f52323/60559140.pdf",
    retrieved: "2026-10-09",
  },
  "fuh54-manual": {
    id: "fuh54-manual",
    title: "Fahrenheat FUH54 / FUH724 unit heater specification sheet (ZBL-FUH54)",
    publisher: "Marley Engineered Products",
    url: "https://marleymep.com/wp-content/uploads/zbl-fuh54.pdf",
    retrieved: "2026-10-09",
  },
  "dr975-manual": {
    id: "dr975-manual",
    title: "Dr. Infrared Heater DR-975 owner's manual",
    publisher: "Dr. Infrared Heater",
    url: "https://cdn.shopify.com/s/files/1/0557/0356/8589/files/DR-975.pdf",
    retrieved: "2026-09-30",
  },
  "dr238-manual": {
    id: "dr238-manual",
    title: "Dr. Infrared Heater DR-238 carbon infrared heater owner's manual",
    publisher: "Dr. Infrared Heater",
    url: "https://cdn.shopify.com/s/files/1/0496/6601/files/DR-238_User_Manual_v250108.pdf",
    retrieved: "2026-09-30",
  },
  "dr910f-manual": {
    id: "dr910f-manual",
    title: "Dr. Infrared Heater DR-910F 10,000W 240V wall/ceiling garage heater owner's manual",
    publisher: "Dr. Infrared Heater",
    url: "https://cdn.shopify.com/s/files/1/0557/0356/8589/files/DR-910F.pdf",
    retrieved: "2026-09-30",
  },
  "kidde-c3010-datasheet": {
    id: "kidde-c3010-datasheet",
    title: "Kidde C3010 sealed battery carbon monoxide alarm data sheet",
    publisher: "Kidde",
    url: "https://www.shareddocs.com/hvac/docs/2001/Public/03/Data_Sheet_Kidde_C3010_ENG.pdf",
    retrieved: "2026-09-30",
  },
  "epa-608": {
    id: "epa-608",
    title: "Section 608 of the Clean Air Act: stationary refrigeration and air conditioning",
    publisher: "US Environmental Protection Agency",
    url: "https://www.epa.gov/section608",
    retrieved: "2026-10-09",
  },
  "eia-therm-faq": {
    id: "eia-therm-faq",
    title: "How do I convert natural gas prices in dollars per Mcf to dollars per therm? (100 ft³ = 103,700 Btu = 1.037 therms)",
    publisher: "US Energy Information Administration",
    url: "https://www.eia.gov/tools/faqs/faq.php?id=45",
    retrieved: "2026-10-09",
  },
  "hot-dawg-hds-manual": {
    id: "hot-dawg-hds-manual",
    title: "Modine HDS/HDC separated combustion gas-fired unit heaters, installation and service manual 6-584.12 (April 2018)",
    publisher: "Modine Manufacturing",
    url: "https://www.modinehvac.com/wp-content/uploads/2020/01/Hot-Dog-Separated-Combustion.pdf",
    retrieved: "2026-10-09",
  },
  "big-maxx-manual": {
    id: "big-maxx-manual",
    title: "Mr. Heater MHU50 / MHU80 / MHU125 operating instructions and owner's manual",
    publisher: "Enerco Group (Mr. Heater)",
    url: "https://pdf.lowes.com/productdocuments/c1241ba0-97d8-4064-a2ef-a0988957c04e/62967718.pdf",
    retrieved: "2026-09-30",
  },
  "vevor-diesel-manual": {
    id: "vevor-diesel-manual",
    title: "VEVOR diesel air heater user manual, 8 kW",
    publisher: "VEVOR",
    url: "https://www.vevor.com/diy-ideas/product/vevor-diesel-air-heater-all-in-one-8kw-diesel-heater-12v-manual/",
    retrieved: "2026-09-30",
  },
  "hs1500tt-manual": {
    id: "hs1500tt-manual",
    title: "Heat Storm Tradesman HS-1500-TT owner's manual",
    publisher: "Heat Storm",
    url: "https://heatstorm.com/products/hs-1500-tt-tradesman",
    retrieved: "2026-09-25",
  },
  "cz798-manual": {
    id: "cz798-manual",
    // The US product page now 404s; the CZ798CA2 manual (the same CZ798 milkhouse heater, sold in Canada) is the
    // live copy: 1,500 W / 12.5 A, attended use only, not where flammable liquids are used or stored.
    title: "Comfort Zone CZ798CA2 milkhouse heater instruction manual (Canadian Tire copy)",
    publisher: "Comfort Zone / Canadian Tire",
    url: "https://media-www.canadiantire.ca/manual/product/0438409/im-cz798ca2-043-8409-milkhouseheater-mastercraft-english-2020-hires-5383ab15-0aa3-42fe-9c0f-3bf055285061.pdf",
    retrieved: "2026-10-09",
  },
  "eia-electric-power-monthly": {
    id: "eia-electric-power-monthly",
    title: "Electric Power Monthly, Table 5.6.B, average retail price by state",
    publisher: "US Energy Information Administration",
    url: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b",
    retrieved: "2026-09-25",
  },
  "eia-ng-annual": {
    id: "eia-ng-annual",
    title: "Natural gas residential price by state, annual",
    publisher: "US Energy Information Administration",
    url: "https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_a.htm",
    retrieved: "2026-09-25",
  },
  "eia-propane-weekly": {
    id: "eia-propane-weekly",
    title: "Weekly heating oil and propane prices, residential",
    publisher: "US Energy Information Administration",
    url: "https://www.eia.gov/dnav/pet/pet_pri_wfr_a_EPLLPA_PRS_dpgal_w.htm",
    retrieved: "2026-09-25",
  },
  "eia-diesel-weekly": {
    id: "eia-diesel-weekly",
    title: "On-highway diesel prices by PADD",
    publisher: "US Energy Information Administration",
    url: "https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epd2d_pte_dpgal_w.htm",
    retrieved: "2026-09-25",
  },
  "mrheater-bigbuddy-manual": {
    id: "mrheater-bigbuddy-manual",
    title: "Mr. Heater Big Buddy MH18B owner's manual",
    publisher: "Mr. Heater / Enerco",
    url: "https://images.thdstatic.com/catalog/pdfImages/53/53c06813-2588-49a2-ad28-8bf3eb3a9ae7.pdf",
    retrieved: "2026-09-25",
  },
  // Lab Report BH-001 ("The 4x Problem") published sizing-rule sources -- see lib/facts/rules-of-thumb.ts.
  // Car and Driver and AC Direct could not be verified (no reachable article with a sizing rule as of
  // retrieval) and were left out rather than guessed; see that file's header comment.
  "bob-vila-garage-heater-size": {
    id: "bob-vila-garage-heater-size",
    title: "The Best Garage Heaters for Workshop Comfort",
    publisher: "Bob Vila",
    url: "https://www.bobvila.com/articles/best-garage-heater/",
    retrieved: "2026-09-26",
    quote: "However, an electric garage heater with 3,000 watts is usually needed to heat a 2-car garage.",
  },
  "filterbuy-how-to-heat-a-garage": {
    id: "filterbuy-how-to-heat-a-garage",
    title: "How to Heat a Garage in 2026: Best Methods & Mini Split Options",
    publisher: "Filterbuy",
    url: "https://filterbuy.com/resources/mini-splits/guides/how-to-heat-a-garage/",
    retrieved: "2026-09-26",
    quote: "24,000 BTU: Covers up to 500–550 sq ft. Best for 2-car garages or larger spaces.",
  },
  "pickhvac-garage-heater-sizing": {
    id: "pickhvac-garage-heater-sizing",
    title: "Garage Heater Size Calculator: How Many BTU Do I Need?",
    publisher: "PickHVAC",
    url: "https://www.pickhvac.com/garage-heater/sizing/",
    retrieved: "2026-09-26",
    quote: "600 sq ft: 18,000 – 35,000 BTU",
  },
  "thegarage-guide-heater-guide": {
    id: "thegarage-guide-heater-guide",
    title: "Garage Heater Guide 2026: Types, BTU Sizing, Costs, and Installation",
    publisher: "The Garage Guide",
    url: "https://thegarage.guide/guides/garage-heater-guide",
    retrieved: "2026-09-26",
    quote:
      "2-car, 400–500 sq ft: well insulated 12,000–20,000 BTU, moderately insulated 20,000–30,000 BTU, uninsulated 40,000–60,000 BTU",
  },
};
