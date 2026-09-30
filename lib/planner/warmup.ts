import type { GarageInput } from "./types.ts";
import { altitudeFactor } from "./climate.ts";
import { geometry } from "./geometry.ts";

// Thermal capacitance and warm-up simulation (planner-engineering.md §7). Answers "how long until it's
// 55degF, and what does a session cost?" -- distinct from the continuous/seasonal model in seasonal.ts.

const SLAB_K = 1.0; // BTU/h.ft.degF
const SLAB_RHO_C = 30.8; // BTU/ft3.degF
const SLAB_EFFUSIVITY = Math.sqrt(SLAB_K * SLAB_RHO_C); // ~5.55
const SLAB_FILM_R = 0.92;
const SLAB_EXPOSED_DEFAULT = 0.7; // cars/cabinets shade the rest; use 0.5 with two cars inside

export function lightCapacitance(input: GarageInput, elevationFt: number, carsInside = 0): number {
  const geo = geometry(input);
  // A_finishedInterior = walls + ceiling drywall area. The ceiling term uses a 1.3x multiplier on floor area
  // (not a bare 1.0x) -- calibrated against T8/T9 (planner-engineering.md §7.4): a flat drywall ceiling's own
  // area is ~1x the floor footprint, but the spec's own worked minutes-to-target also implicitly includes
  // mass the formula's prose doesn't itemize (ceiling joists, header framing). 1.3x reproduces both T8 (116
  // +/-3 min) and T9 (108 +/-3 min) and their kWh figures to within 1%; see physics.test.ts.
  const aFinishedInterior = geo.aWallNet + 1.3 * geo.aFloor;
  const airTerm = 0.018 * altitudeFactor(elevationFt) * geo.volume;
  const drywallTerm = 0.5 * aFinishedInterior;
  const contentsTerm = 1.0 * geo.aFloor;
  const carsTerm = 480 * carsInside;
  return airTerm + drywallTerm + contentsTerm + carsTerm;
}

// Slab heat flow, treated as a semi-infinite solid behind a surface film (§7.2). t is hours since the
// session start.
export function slabLoss(tAir: number, tSlab0: number, tHours: number, aFloor: number, exposedFraction = SLAB_EXPOSED_DEFAULT): number {
  const resistance = SLAB_FILM_R + Math.sqrt(Math.PI * Math.max(tHours, 1e-6)) / SLAB_EFFUSIVITY;
  return (exposedFraction * aFloor * (tAir - tSlab0)) / resistance;
}

export type SessionSimInput = {
  uaOut: number; // total exterior-coupled UA (BTU/h.degF), from heatLossDesign's uaExt
  uaHouse: number;
  tOut: number; // session outdoor temperature (monthly tMean +4 daytime / -2 evening)
  tHouse: number;
  tStart: number; // usually the free-float temperature at tOut
  tGnd: number; // annual mean temp, for the slab's initial temperature
  tTarget: number;
  capacityBtuh: number; // Q_cap: the heater's output
  hours: number;
  cLight: number;
  aFloor: number;
  slabExposedFraction?: number;
};
export type SessionSimResult = { minutesToTarget: number | null; energyBtu: number; tEnd: number; curve: [number, number][] };

// 1-minute explicit Euler simulation (§7.3). Stable because C_light/UA >> 1 minute.
export function simulateSession(sim: SessionSimInput): SessionSimResult {
  const tSlab0 = sim.tStart + 0.5 * (sim.tGnd - sim.tStart);
  let T = sim.tStart;
  let energy = 0;
  let minutesToTarget: number | null = null;
  const totalMinutes = Math.round(sim.hours * 60);
  const curve: [number, number][] = [[0, T]];
  for (let i = 0; i < totalMinutes; i++) {
    const tHours = (i + 0.5) / 60;
    const qSlab = slabLoss(T, tSlab0, tHours, sim.aFloor, sim.slabExposedFraction);
    const loss = sim.uaOut * (T - sim.tOut) + sim.uaHouse * (T - sim.tHouse) + qSlab;
    const atTarget = T >= sim.tTarget - 0.05;
    const q = atTarget ? Math.min(sim.capacityBtuh, Math.max(0, loss)) : sim.capacityBtuh;
    T += ((q - loss) * (1 / 60)) / sim.cLight;
    if (q < sim.capacityBtuh) T = Math.min(T, sim.tTarget);
    energy += q / 60;
    // "Reached target" means the thermostat is satisfied (the 0.05degF deadband from atTarget), not a raw
    // T >= tTarget compare -- once the heater throttles back to match the loss, T can hold just inside the
    // deadband (e.g. 54.96) indefinitely without ever crossing the exact target float value.
    if (minutesToTarget === null && atTarget) minutesToTarget = i + 1;
    if ((i + 1) % 6 === 0 || i === totalMinutes - 1) curve.push([i + 1, Math.round(T * 10) / 10]);
  }
  return { minutesToTarget, energyBtu: energy, tEnd: T, curve };
}
