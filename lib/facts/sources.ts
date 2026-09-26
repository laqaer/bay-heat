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
    title: "Comfort Zone CZ220 ceiling heater owner's manual",
    publisher: "Comfort Zone / Home Depot",
    url: "https://images.thdstatic.com/catalog/pdfImages/09/09b17c0e-owners-manual.pdf",
    retrieved: "2026-09-25",
  },
  "fuh54-manual": {
    id: "fuh54-manual",
    title: "Fahrenheat FUH54/FUH54C owner's manual",
    publisher: "Marley Engineered Products",
    url: "https://www.marleymep.com/products/fuh54",
    retrieved: "2026-09-25",
  },
  "dr975-manual": {
    id: "dr975-manual",
    title: "Dr. Infrared Heater DR-975 owner's manual",
    publisher: "Dr. Infrared Heater",
    url: "https://manuals.plus/dr-infrared-heater/dr-975-shop-garage-heater-manual",
    retrieved: "2026-09-25",
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
    title: "Comfort Zone CZ798 milkhouse heater owner's manual",
    publisher: "Comfort Zone",
    url: "https://comfortzoneproducts.com/products/cz798",
    retrieved: "2026-09-25",
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
};
