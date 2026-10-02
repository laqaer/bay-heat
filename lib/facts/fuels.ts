import type { Fact } from "../types/evidence.ts";
type AnyFact = Fact<number | string>;

// Fuel heat contents and efficiencies (planner-engineering.md §9.1-9.2). propaneCylPerGal and keroPerGal are
// marked 'verify' per the assumptions register (§18.14) until a per-state source is confirmed -- a 'verify'
// fact never renders on a published page (see lib/types/evidence.ts Fact.status).
export const FACTS: AnyFact[] = [
  { id: "fuel.propane.btu_per_gal", value: 91500, unit: "BTU/gal", ev: "R", sourceId: "eia-propane-weekly", checked: "2026-09-25", status: "verified" },
  { id: "fuel.natural_gas.btu_per_therm", value: 100000, unit: "BTU/therm", ev: "R", sourceId: "eia-ng-annual", checked: "2026-09-25", status: "verified" },
  { id: "fuel.diesel.btu_per_gal", value: 138500, unit: "BTU/gal", ev: "R", sourceId: "eia-diesel-weekly", checked: "2026-09-25", status: "verified" },
  { id: "fuel.kerosene.btu_per_gal", value: 135000, unit: "BTU/gal", ev: "R", sourceId: "eia-diesel-weekly", checked: "2026-09-25", status: "verified" },
  { id: "fuel.electric.btu_per_w", value: 3.412, unit: "BTU/h per W", ev: "R", sourceId: "eia-electric-power-monthly", checked: "2026-09-25", status: "verified" },
  { id: "fuel.propane.unvented_eta", value: 0.92, ev: "E", sourceId: "eia-propane-weekly", checked: "2026-09-25", status: "verified", note: "sensible fraction, indoor unvented" },
  { id: "fuel.vented_unit.eta", value: 0.8, ev: "S", sourceId: "eia-ng-annual", checked: "2026-09-25", status: "verified", note: "Modine Hot Dawg / Mr Heater Big Maxx class" },
  { id: "fuel.diesel_air.eta", value: 0.78, ev: "E", sourceId: "eia-diesel-weekly", checked: "2026-09-25", status: "verified" },
  { id: "fuel.propane_cylinder.premium", value: "1-lb exchange cylinders run well above bulk price per gallon-equivalent", ev: "E", sourceId: "eia-propane-weekly", checked: "2026-09-25", status: "verify" },
  { id: "fuel.kerosene.price_note", value: "Kerosene priced as heating-oil + $1.00/gal small-customer premium", ev: "E", sourceId: "eia-diesel-weekly", checked: "2026-09-25", status: "verify" },
];
