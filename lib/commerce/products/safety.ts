import type { Product } from "../types.ts";

// CO alarms, extinguishers, freeze protection -- the only products ever linked next to a NO-GO verdict, as
// "safer alternatives," never the NO-GO product itself (BLUEPRINT.md §2.8).

export const PRODUCTS: Product[] = [
  {
    id: "co-alarm-plugin-display",
    name: "Plug-in CO alarm with digital display and battery backup (UL 2034)",
    kind: "co_alarm",
    searchQuery: "plug in carbon monoxide alarm digital display UL 2034",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["code.irc.r315"],
  },
  {
    id: "co-alarm-battery-10yr",
    name: "10-year sealed battery CO alarm (UL 2034)",
    kind: "co_alarm",
    searchQuery: "10 year battery carbon monoxide alarm UL 2034",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: ["code.irc.r315"],
  },
  {
    id: "extinguisher-abc",
    name: "5 lb ABC dry-chemical fire extinguisher",
    kind: "extinguisher",
    searchQuery: "5 lb ABC fire extinguisher garage shop",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
  },
  {
    id: "thermostat-line-voltage-dp",
    name: "Line-voltage double-pole thermostat for a hardwired heater",
    kind: "thermostat_line_voltage",
    searchQuery: "line voltage double pole thermostat 240V heater",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
    safetyLine: { text: "Rated amperage must meet or exceed the heater's nameplate draw. Your electrician wires it per the heater manual, not a generic diagram.", ev: "S", sourceId: "generic-thermostat-manual" },
  },
  {
    id: "fridge-heater-kit",
    name: "Appliance freeze-protection heater kit (fridge/washer lines)",
    kind: "fridge_heater_kit",
    searchQuery: "appliance freeze protection heater kit garage",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
  },
  {
    id: "freeze-alarm-wifi",
    name: "Wi-Fi low-temperature freeze alarm sensor",
    kind: "freeze_alarm",
    searchQuery: "wifi low temperature freeze alarm sensor garage",
    partnerUrls: {},
    priceClass: "$",
    priceClassChecked: "2026-09-25",
    specFactIds: [],
  },
];
