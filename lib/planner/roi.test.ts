import { test } from "node:test";
import assert from "node:assert/strict";
import { insulateFirst, fixFirst, type RoiContext } from "./roi.ts";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION, EXAMPLE_A_PRICES } from "./fixtures.ts";

function near(actual: number, expected: number, tolPct = 5) {
  const tol = Math.abs(expected) * (tolPct / 100) || 1;
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

const BASE_ENVELOPE = { wallType: "R13" as const, ceilingIns: "drywall_uninsulated" as const, doorTypes: ["steel_single" as const], tightness: "average" as const };
const CTX: RoiContext = { input: EXAMPLE_A_INPUT, baseEnvelope: BASE_ENVELOPE, tOut: EXAMPLE_A_STATION.h99, elevationFt: EXAMPLE_A_STATION.elevFt, station: EXAMPLE_A_STATION, prices: EXAMPLE_A_PRICES };

// §15's worked table for example A, continuous 55F, Chicago/IL prices.
test("insulateFirst matches the §15 worked table for example A", () => {
  const rows = insulateFirst(CTX);
  const byMeasure = Object.fromEntries(rows.map((r) => [r.measure, r]));

  near(byMeasure.ceiling_r30.dQDesign, 8735, 1);
  near(byMeasure.ceiling_r30.dMMBtu, 15.7, 3);
  near(byMeasure.ceiling_r30.savingsPerYear.electric, 886, 3);
  near(byMeasure.ceiling_r30.savingsPerYear.gas, 214, 3);
  assert.equal(byMeasure.ceiling_r30.cost, 430);
  near(byMeasure.ceiling_r30.paybackYears.electric, 0.5, 20);
  near(byMeasure.ceiling_r30.paybackYears.gas, 2.0, 20);

  near(byMeasure.door_kit_eps.dQDesign, 4748, 1);
  near(byMeasure.door_kit_eps.savingsPerYear.electric, 482, 3);
  near(byMeasure.door_kit_eps.savingsPerYear.gas, 116, 3);

  near(byMeasure.door_kit_reflective.dQDesign, 3764, 1);
  near(byMeasure.door_kit_reflective.savingsPerYear.electric, 382, 3);

  near(byMeasure.weatherstrip.dQDesign, 3532, 1);
  near(byMeasure.weatherstrip.savingsPerYear.electric, 359, 3);

  near(byMeasure.new_pu_door.dQDesign, 5269, 1);
  near(byMeasure.new_pu_door.savingsPerYear.electric, 535, 3);
  assert.equal(byMeasure.new_pu_door.cost, 2200);
});

test("insulateFirst is sorted by electric payback, cheapest-fastest first", () => {
  const rows = insulateFirst(CTX);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i].paybackYears.electric >= rows[i - 1].paybackYears.electric);
  }
});

test("a measure already maxed out is not returned", () => {
  const rows = insulateFirst({ ...CTX, baseEnvelope: { ...BASE_ENVELOPE, ceilingIns: "R30" } });
  assert.ok(!rows.some((r) => r.measure === "ceiling_r30"));
});

test("fixFirst combines the cheap measures and matches the 'all three' §15 total", () => {
  const rows = insulateFirst(CTX);
  const ff = fixFirst(CTX, rows, "e_240_10k", "e_240_5k", 10000, 5000, 3);
  assert.ok(ff);
  assert.equal(ff!.cost, 675); // weatherstrip 125 + door_kit_eps 120 + ceiling_r30 430 (reflective and PU door don't clear the payback bar or aren't cheaper alternatives to eps)
  near(ff!.qBefore, 31742, 2);
  near(ff!.qAfter, 13025, 2);
  assert.equal(ff!.gradeBefore, "D");
  assert.equal(ff!.gradeAfter, "B");
  near(ff!.runningSavingsPerYear, 1725, 5);
});
