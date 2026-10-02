import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESET_DEFAULTS, floorFt2, volumeFt3 } from "./presets.ts";
import { resolveEnvelope, resolveCircuit, isFlammablesYes } from "./defaults.ts";
import { band } from "./uncertainty.ts";
import { EXAMPLE_A_INPUT } from "./fixtures.ts";
import type { GarageInput } from "./types.ts";

test("preset floor/volume match the spec table", () => {
  assert.equal(floorFt2(PRESET_DEFAULTS["1car"]), 264);
  assert.equal(volumeFt3(PRESET_DEFAULTS["1car"]), 2112);
  assert.equal(floorFt2(PRESET_DEFAULTS["2car"]), 576);
  assert.equal(volumeFt3(PRESET_DEFAULTS["2car"]), 5184);
  assert.equal(floorFt2(PRESET_DEFAULTS["3car"]), 768);
  assert.equal(volumeFt3(PRESET_DEFAULTS["3car"]), 7680);
  assert.equal(floorFt2(PRESET_DEFAULTS["4car"]), 1040);
  assert.equal(volumeFt3(PRESET_DEFAULTS["4car"]), 10400);
});

test("resolveEnvelope passes through known fields and fills unknowns with the schema defaults", () => {
  const known = resolveEnvelope(EXAMPLE_A_INPUT);
  assert.equal(known.wallType, "R13");
  assert.equal(known.ceilingIns, "drywall_uninsulated");
  assert.deepEqual(known.doorTypes, ["steel_single"]);
  assert.equal(known.tightness, "average");

  const allUnknown: GarageInput = { ...EXAMPLE_A_INPUT, wallType: "unknown", ceilingIns: "unknown", tightness: "unknown", garageDoors: [{ w: 16, h: 7, type: "unknown" }] };
  const resolved = resolveEnvelope(allUnknown);
  assert.equal(resolved.wallType, "R13");
  assert.equal(resolved.ceilingIns, "drywall_uninsulated");
  assert.deepEqual(resolved.doorTypes, ["steel_single"]);
  assert.equal(resolved.tightness, "average");
});

test("resolveCircuit resolves 'unknown' to the schema default", () => {
  assert.equal(resolveCircuit({ ...EXAMPLE_A_INPUT, circuit: "unknown" }), "120V15A");
  assert.equal(resolveCircuit({ ...EXAMPLE_A_INPUT, circuit: "240V30A" }), "240V30A");
});

test("isFlammablesYes treats 'unknown' as 'yes'", () => {
  assert.equal(isFlammablesYes("unknown"), true);
  assert.equal(isFlammablesYes("yes"), true);
  assert.equal(isFlammablesYes("no"), false);
});

test("band() with no unknown fields returns a zero-width band at the point estimate", () => {
  const b = band(EXAMPLE_A_INPUT);
  assert.equal(b.unknowns, 0);
  assert.equal(b.low, b.mid);
  assert.equal(b.mid, b.high);
  assert.ok(b.mid > 0);
  assert.equal(b.narrowBy, undefined);
});

test("band() widens around the mid estimate when fields are genuinely unknown", () => {
  const input: GarageInput = { ...EXAMPLE_A_INPUT, wallType: "unknown", ceilingIns: "unknown", tightness: "unknown" };
  const b = band(input);
  assert.equal(b.unknowns, 3);
  assert.ok(b.low < b.mid, `low ${b.low} should be < mid ${b.mid}`);
  assert.ok(b.high > b.mid, `high ${b.high} should be > mid ${b.mid}`);
  assert.ok(b.narrowBy === "walls" || b.narrowBy === "ceiling" || b.narrowBy === "tightness", `unexpected narrowBy ${b.narrowBy}`);
  assert.ok(b.narrowToPct !== undefined && b.narrowToPct >= 0 && b.narrowToPct <= 100);
});

test("band() only varies the fields that are actually unknown, others stay fixed", () => {
  const input: GarageInput = { ...EXAMPLE_A_INPUT, wallType: "unknown" };
  const b = band(input);
  assert.equal(b.unknowns, 1);
  assert.equal(b.narrowBy, "walls");
  assert.equal(b.narrowToPct, 0); // the only unknown field, once answered, narrows the remaining spread to 0%
});
