import type { ClimateStation } from "./types.ts";
import { hddAtBase } from "./climate.ts";

// Continuous heating: seasonal load via the balance-point HDD method (planner-engineering.md §8.1).
// "Adjusting the HDD base is the whole point": a 40degF keep-from-freezing garage uses HDD40, not HDD65 --
// using HDD65 overstates cost by roughly 4x.
export function balancePoint(targetTemp: number, uaHouse: number, tHouse: number, uaOut: number, gainsBtuh = 0): number {
  if (uaOut === 0) return targetTemp;
  return targetTemp - (uaHouse * (tHouse - targetTemp) + gainsBtuh) / uaOut;
}

// Seasonal load in BTU, continuous heating, at the balance point.
export function seasonalLoadContinuous(station: ClimateStation, tBal: number, uaOut: number): number {
  return uaOut * 24 * hddAtBase(station, tBal);
}

// Heat-pump capacity/COP curves, relative to AHRI-rated heating capacity at 47F (§8.3). Values are
// [outdoorTempF, capacityRatio, COP], anchored to NEEP ccASHP v4.0 and Mitsubishi hyper-heat literature.
export type HeatPumpClass = "standard" | "cold_climate" | "hyper_heat";
const HP_CURVE: Record<HeatPumpClass, [number, number, number][]> = {
  standard: [
    [62, 1.05, 4.3], [47, 1.0, 3.7], [35, 0.88, 2.9], [17, 0.75, 2.3], [5, 0.6, 1.75], [-4, 0.5, 1.45], [-13, 0, 0],
  ],
  cold_climate: [
    [62, 1.05, 4.4], [47, 1.0, 3.8], [35, 0.95, 3.0], [17, 0.92, 2.4], [5, 0.8, 1.9], [-4, 0.7, 1.6], [-13, 0.6, 1.35], [-22, 0, 0],
  ],
  hyper_heat: [
    [62, 1.05, 4.5], [47, 1.0, 3.9], [35, 1.0, 3.1], [17, 1.0, 2.45], [5, 1.0, 1.9], [-13, 0.76, 1.45], [-22, 0.65, 1.25],
  ],
};

function interp(curve: [number, number, number][], t: number): { cap: number; cop: number } {
  const sorted = [...curve].sort((a, b) => a[0] - b[0]);
  if (t <= sorted[0][0]) return { cap: sorted[0][1], cop: sorted[0][2] };
  if (t >= sorted[sorted.length - 1][0]) return { cap: sorted[sorted.length - 1][1], cop: sorted[sorted.length - 1][2] };
  for (let i = 0; i < sorted.length - 1; i++) {
    const [t0, c0, k0] = sorted[i];
    const [t1, c1, k1] = sorted[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return { cap: c0 + f * (c1 - c0), cop: k0 + f * (k1 - k0) };
    }
  }
  return { cap: 0, cop: 1 };
}

export function heatPumpCapacity(hpClass: HeatPumpClass, tOut: number, ratedCapacity47: number): number {
  return interp(HP_CURVE[hpClass], tOut).cap * ratedCapacity47;
}
export function heatPumpCop(hpClass: HeatPumpClass, tOut: number): number {
  return interp(HP_CURVE[hpClass], tOut).cop;
}

// Bin integration over daily-mean temperature per month (§8.3): for each 0.5F bin from Tm-4sigma to Tm+4sigma,
// weight by the Normal density, compute load and heat-pump output, sum. Returns seasonal kWh input, unmet
// load (BTU, backed up by resistance), and the season-weighted COP.
export function heatPumpSeasonal(
  station: ClimateStation,
  tBal: number,
  uaOut: number,
  hpClass: HeatPumpClass,
  ratedCapacity47: number,
): { inputKwh: number; unmetBtu: number; seasonalCop: number } {
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let inputBtu = 0;
  let deliveredBtu = 0;
  let unmetBtu = 0;
  for (let m = 0; m < 12; m++) {
    const tm = station.tMean[m];
    const sd = station.tSd[m];
    const nDays = DAYS[m];
    if (sd <= 0) continue;
    const binWidth = 0.5;
    for (let t = tm - 4 * sd; t <= tm + 4 * sd; t += binWidth) {
      const z = (t - tm) / sd;
      const density = Math.exp(-(z * z) / 2) / (sd * Math.sqrt(2 * Math.PI));
      const wDays = density * binWidth * nDays;
      if (t >= tBal || wDays <= 0) continue;
      const loadBtuh = uaOut * (tBal - t);
      const load = loadBtuh * 24 * wDays;
      const capBtuh = heatPumpCapacity(hpClass, t, ratedCapacity47);
      const capOut = capBtuh * 24 * wDays;
      const hpOut = Math.min(load, capOut);
      const cop = heatPumpCop(hpClass, t) || 1;
      inputBtu += hpOut / cop;
      deliveredBtu += hpOut;
      const shortfall = load - hpOut;
      if (shortfall > 0) {
        inputBtu += shortfall; // resistance backup, COP 1
        unmetBtu += shortfall;
      }
    }
  }
  // Season-weighted COP is system-wide (delivered load over total electrical input, resistance backup
  // included at COP 1) -- not the heat pump's own COP while it's the one running.
  const seasonalCop = inputBtu > 0 ? (deliveredBtu + unmetBtu) / inputBtu : 0;
  return { inputKwh: inputBtu / 3412, unmetBtu, seasonalCop };
}
