import { test } from "node:test";
import assert from "node:assert/strict";
import { hddAtBase, altitudeFactor } from "./climate.ts";
import { stationById } from "./stations.ts";
import { circuitFor } from "./electrical.ts";
import { heatLossDesign, gradeFor } from "./heatLoss.ts";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } from "./fixtures.ts";

function near(actual: number, expected: number, tolPct = 1) {
  const tol = Math.abs(expected) * (tolPct / 100) || 1;
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

// T1: hddAtBase(Chicago, 50) / (...,65) / (...,40) / (...,55)
test("T1: hddAtBase for Chicago at four bases", () => {
  const chi = stationById("IL-chicago")!;
  near(hddAtBase(chi, 50), 2965);
  near(hddAtBase(chi, 65), 6143);
  near(hddAtBase(chi, 40), 1525);
  near(hddAtBase(chi, 55), 3888);
});

// T2: hddAtBase(Minneapolis, 65); (Phoenix, 65); (Atlanta, 50)
test("T2: hddAtBase for Minneapolis/Phoenix/Atlanta", () => {
  near(hddAtBase(stationById("MN-minneapolis")!, 65), 7389);
  near(hddAtBase(stationById("AZ-phoenix")!, 65), 863);
  near(hddAtBase(stationById("GA-atlanta")!, 50), 630);
});

test("hddAtBase matches ASHRAE published annual HDD65 within 3%", () => {
  for (const id of ["IL-chicago", "MN-minneapolis", "AZ-phoenix", "GA-atlanta"]) {
    const s = stationById(id)!;
    near(hddAtBase(s, 65), s.hdd65, 3);
  }
});

test("altitudeFactor: Denver at 5,414 ft is about 0.822", () => {
  near(altitudeFactor(5414), 0.822, 1);
});

test("altitudeFactor: sea level is 1.0", () => {
  near(altitudeFactor(0), 1.0, 0.1);
});

// T11: circuitFor(5000,240), (4000,240), (7500,240), (10000,240), (5000 rated240, 208)
test("T11: circuitFor matches the spec's five worked cases", () => {
  const c5k = circuitFor(5000, 240);
  assert.equal(c5k.breakerA, 30);
  assert.equal(c5k.wireNM, "10 AWG");

  const c4k = circuitFor(4000, 240);
  assert.equal(c4k.breakerA, 25);
  assert.equal(c4k.wireNM, "10 AWG");
  assert.notEqual(c4k.breakerA, 20, "4 kW must NOT fit a 240V/20A circuit");

  const c7k5 = circuitFor(7500, 240);
  assert.equal(c7k5.breakerA, 40);
  assert.equal(c7k5.wireNM, "8 AWG");

  const c10k = circuitFor(10000, 240);
  assert.equal(c10k.breakerA, 60);
  assert.equal(c10k.wireTHHN, "6 AWG");
  assert.equal(c10k.wireNM, "4 AWG");

  const derated = circuitFor(5000, 208, 240);
  assert.equal(derated.watts, 3756);
});

const ENVELOPE_AS_IS = { wallType: "R13" as const, ceilingIns: "drywall_uninsulated" as const, doorTypes: ["steel_single" as const], tightness: "average" as const };
const ENVELOPE_FIXED = { wallType: "R13" as const, ceilingIns: "R30" as const, doorTypes: ["kit_eps_or_batt" as const], tightness: "tight" as const };

// T3: example A heatLossDesign -- total 28,856; walls 2,319; door 6,659; ceiling 9,729 (attic 26.8F); slab
// 2,717; inf 7,065; house -770. Matched within 2% -- the spec's own worked example doesn't disclose its exact
// window/service-door assumptions, and those two terms (a combined ~4% of the total) are the only inputs this
// fixture had to estimate; every other term matches to the BTU.
test("T3: heatLossDesign for example A (as-is)", () => {
  const r = heatLossDesign(EXAMPLE_A_INPUT, ENVELOPE_AS_IS, EXAMPLE_A_STATION.h99, EXAMPLE_A_STATION.elevFt);
  near(r.qDesign, 28856, 2);
  const byKey = Object.fromEntries(r.items.map((i) => [i.key, i.btuh]));
  near(byKey.walls, 2319, 1);
  near(byKey.garage_doors, 6659, 1);
  near(byKey.ceiling_roof, 9729, 1);
  near(byKey.slab_edge, 2717, 1);
  near(byKey.infiltration, 7065, 1);
  near(byKey.house_coupling, -770, 5);
  near(r.atticTempF!, 26.8, 5);
  assert.equal(r.grade, "D");
});

// T4: example A with R-30 + EPS kit + tight -> 11,841; Q_size 13,025; grade B.
test("T4: heatLossDesign for example A (all three fixes)", () => {
  const r = heatLossDesign(EXAMPLE_A_INPUT, ENVELOPE_FIXED, EXAMPLE_A_STATION.h99, EXAMPLE_A_STATION.elevFt);
  near(r.qDesign, 11841, 2);
  near(r.qSize, 13025, 2);
  assert.equal(r.grade, "B");
});

// T5: detached 1-car "basic" Chicago -> 17.7k BTU/h (5.2 kW). "Basic" = the same envelope as example A
// (R-13 walls, uninsulated drywall ceiling, steel door, average tightness), resized to the 1-car preset.
test("T5: heatLossDesign for a detached 1-car basic garage", () => {
  const oneCar: typeof EXAMPLE_A_INPUT = {
    ...EXAMPLE_A_INPUT,
    preset: "1car",
    width: 12,
    depth: 22,
    height: 8,
    attached: false,
    commonWallLen: 0,
    garageDoors: [{ w: 9, h: 7, type: "steel_single" }],
    windowsFt2: 0,
    serviceDoorFt2: 20,
    serviceDoorType: "hollow_wood",
  };
  const r = heatLossDesign(oneCar, ENVELOPE_AS_IS, EXAMPLE_A_STATION.h99, EXAMPLE_A_STATION.elevFt);
  near(r.qSize, 17700, 2);
  near(r.kwSize, 5.2, 2);
});

test("gradeFor thresholds", () => {
  assert.equal(gradeFor(0.3), "A");
  assert.equal(gradeFor(0.5), "B");
  assert.equal(gradeFor(0.8), "C");
  assert.equal(gradeFor(1.1), "D");
  assert.equal(gradeFor(1.6), "F");
});
