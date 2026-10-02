import type { CostRow, PriceSet } from "./types.ts";

// Heat contents and delivered-heat efficiencies (planner-engineering.md §9.1-9.2). [V EIA] anchors.
export const HEAT_CONTENT = {
  ngBtuPerTherm: 100000,
  propaneBtuPerGal: 91452,
  dieselBtuPerGal: 137381,
  heatingOilBtuPerGal: 138500,
  keroseneBtuPerGal: 135000,
  btuPerKwh: 3412,
} as const;

export const ETA = {
  electricResistance: 1.0,
  ventedGas80: 0.8,
  ventedGasCondensing: 0.92,
  unventedPropane: 0.92,
  unventedNg: 0.9,
  unventedKerosene: 0.93,
  dieselAir: 0.78,
} as const;

// $/MMBtu delivered (planner-engineering.md §9.3): price_per_unit / (BTU_per_unit x eta) x 1e6.
export function costPerMMBtuDelivered(pricePerUnit: number, btuPerUnit: number, eta: number): number {
  return (pricePerUnit / (btuPerUnit * eta)) * 1e6;
}

export type SystemKey = CostRow["system"];

const SYSTEM_HEAT_CONTENT: Record<SystemKey, number> = {
  electric_resistance: HEAT_CONTENT.btuPerKwh,
  heat_pump_cc: HEAT_CONTENT.btuPerKwh,
  ng_vented_80: HEAT_CONTENT.ngBtuPerTherm,
  propane_bulk_80: HEAT_CONTENT.propaneBtuPerGal,
  propane_cyl_92: HEAT_CONTENT.propaneBtuPerGal,
  diesel_78: HEAT_CONTENT.dieselBtuPerGal,
};

function priceFor(system: SystemKey, prices: PriceSet): number {
  switch (system) {
    case "electric_resistance":
    case "heat_pump_cc":
      return prices.elecPerKwh;
    case "ng_vented_80":
      return prices.ngPerTherm;
    case "propane_bulk_80":
      return prices.propanePerGal;
    case "propane_cyl_92":
      return prices.propaneCylPerGal;
    case "diesel_78":
      return prices.dieselPerGal;
  }
}

function etaFor(system: SystemKey, heatPumpSeasonalCop: number): number {
  switch (system) {
    case "electric_resistance":
      return ETA.electricResistance;
    case "heat_pump_cc":
      return heatPumpSeasonalCop;
    case "ng_vented_80":
      return ETA.ventedGas80;
    case "propane_bulk_80":
      return ETA.ventedGas80;
    case "propane_cyl_92":
      return ETA.unventedPropane;
    case "diesel_78":
      return ETA.dieselAir;
  }
}

const SYSTEM_KEYS: SystemKey[] = ["electric_resistance", "heat_pump_cc", "ng_vented_80", "propane_bulk_80", "propane_cyl_92", "diesel_78"];

// The 6-system cost comparison table for this garage (§8.4/§9.3): "what would heating THIS garage cost on
// each generic system," independent of which specific product the reader buys. `qDesign` (BTU/h) gives the
// perHour figure (cost of running flat-out on the coldest design day); `seasonalMMBtu` and `monthsInSeason`
// give the season/month totals. heatPumpSeasonalCop defaults to the §9.3 reference row (COP 2.5); pass the
// actual bin-integrated value from seasonal.ts's heatPumpSeasonal() when a specific heat pump is being priced.
export function costsForSeasonalLoad(seasonalMMBtu: number, qDesign: number, monthsInSeason: number, prices: PriceSet, heatPumpSeasonalCop = 2.5): CostRow[] {
  return SYSTEM_KEYS.map((system) => {
    const btuPerUnit = SYSTEM_HEAT_CONTENT[system];
    const unitPrice = priceFor(system, prices);
    const eta = etaFor(system, heatPumpSeasonalCop);
    const perMMBtu = costPerMMBtuDelivered(unitPrice, btuPerUnit, eta);
    const perSeason = perMMBtu * seasonalMMBtu;
    const perHour = (qDesign / btuPerUnit / eta) * unitPrice;
    return {
      system,
      eta: system === "heat_pump_cc" ? ("curve" as const) : eta,
      unitPrice,
      unit: system === "ng_vented_80" ? ("$/therm" as const) : system === "electric_resistance" || system === "heat_pump_cc" ? ("$/kWh" as const) : ("$/gal" as const),
      perHour: Math.round(perHour * 100) / 100,
      perMonth: Math.round(perSeason / monthsInSeason),
      perSeason: Math.round(perSeason),
      perMMBtu: Math.round(perMMBtu * 10) / 10,
    };
  });
}
