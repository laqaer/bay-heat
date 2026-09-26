import type { ClimateStation } from "./types.ts";

// HDD/CDD at any base temperature, from a station's monthly mean/std-dev of daily-average temperature
// (planner-engineering.md §3.2). TS has no Math.erf, so we use the Abramowitz-Stegun 7.1.26 approximation
// (|error| < 1.5e-7), same as the spec calls for.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const t = 1 / (1 + p * ax);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1 - poly * Math.exp(-ax * ax);
  return sign * y;
}

function stdNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
function stdNormalPdf(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function hddAtBase(station: ClimateStation, baseF: number): number {
  let total = 0;
  for (let m = 0; m < 12; m++) {
    const tm = station.tMean[m];
    const sd = station.tSd[m];
    const n = DAYS_IN_MONTH[m];
    if (sd <= 0) {
      total += n * Math.max(0, baseF - tm);
      continue;
    }
    const z = (baseF - tm) / sd;
    total += n * sd * (z * stdNormalCdf(z) + stdNormalPdf(z));
  }
  return total;
}

export function cddAtBase(station: ClimateStation, baseF: number): number {
  let total = 0;
  for (let m = 0; m < 12; m++) {
    const tm = station.tMean[m];
    const sd = station.tSd[m];
    const n = DAYS_IN_MONTH[m];
    if (sd <= 0) {
      total += n * Math.max(0, tm - baseF);
      continue;
    }
    const z = (baseF - tm) / sd;
    total += n * sd * (stdNormalPdf(z) - z * (1 - stdNormalCdf(z)));
  }
  return total;
}

// Standard-atmosphere altitude density-correction factor for infiltration (§4.6). Denver (5,414 ft) -> 0.822.
export function altitudeFactor(elevationFt: number): number {
  return Math.pow(1 - 6.8754e-6 * elevationFt, 5.2559);
}

// Annual mean air temperature of a station, used as the ground temperature proxy for the free-float
// calculation (§4.10).
export function annualMeanTemp(station: ClimateStation): number {
  return station.tMean.reduce((a, b) => a + b, 0) / 12;
}
