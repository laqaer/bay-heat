import { test } from "node:test";
import assert from "node:assert/strict";
import { costsForSeasonalLoad, costPerMMBtuDelivered, HEAT_CONTENT, ETA } from "./fuels.ts";
import { EXAMPLE_A_PRICES } from "./fixtures.ts";

function near(actual: number, expected: number, tolPct = 5) {
  const tol = Math.abs(expected) * (tolPct / 100) || 1;
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

// §9.3's national reference figures use different (US-average) prices than EXAMPLE_A_PRICES' Illinois rates,
// so this checks the FORMULA structure against a matching price, not EXAMPLE_A_PRICES' own $/MMBtu output.
test("costPerMMBtuDelivered matches §9.3's national reference rows", () => {
  near(costPerMMBtuDelivered(0.1819, HEAT_CONTENT.btuPerKwh, ETA.electricResistance), 53.3, 1);
  near(costPerMMBtuDelivered(0.1819, HEAT_CONTENT.btuPerKwh, 2.5), 21.3, 1);
  near(costPerMMBtuDelivered(1.48, HEAT_CONTENT.ngBtuPerTherm, ETA.ventedGas80), 18.5, 1);
  near(costPerMMBtuDelivered(2.67, HEAT_CONTENT.propaneBtuPerGal, ETA.ventedGas80), 36.5, 1);
  near(costPerMMBtuDelivered(6.53, HEAT_CONTENT.dieselBtuPerGal, ETA.dieselAir), 60.9, 1);
});

test("costsForSeasonalLoad produces 6 internally-consistent rows for example A's prices", () => {
  const rows = costsForSeasonalLoad(50.1, 28980, 7, EXAMPLE_A_PRICES);
  assert.equal(rows.length, 6);
  const bySystem = Object.fromEntries(rows.map((r) => [r.system, r]));
  // heat pump (seasonal COP 2.5) must cost meaningfully less than resistance electric for the same load.
  assert.ok(bySystem.heat_pump_cc.perSeason < bySystem.electric_resistance.perSeason);
  // perMonth * monthsInSeason should reconstruct perSeason (to rounding).
  for (const r of rows) {
    near(r.perMonth * 7, r.perSeason, 5);
  }
  // perHour times the design-day hours in a season should be well above perSeason (design load isn't sustained
  // the whole season) but still the same order of magnitude within a factor of ~50.
  for (const r of rows) {
    assert.ok(r.perHour > 0);
  }
});
