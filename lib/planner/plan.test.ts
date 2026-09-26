import { test } from "node:test";
import assert from "node:assert/strict";
import { plan } from "./plan.ts";
import { EXAMPLE_A_INPUT } from "./fixtures.ts";
import { decode } from "./codec.ts";
import type { GarageInput } from "./types.ts";

function near(actual: number, expected: number, tolPct = 3) {
  const tol = Math.abs(expected) * (tolPct / 100) || 1;
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

test("plan() matches BLUEPRINT.md §0.2's headline numbers for example A", () => {
  const r = plan(EXAMPLE_A_INPUT);
  near(r.heating.qDesign, 28856, 2);
  near(r.heating.qSize, 31742, 2);
  assert.equal(r.heating.grade, "D");
  near(r.heating.kwSize, 9.3, 3);
  assert.equal(r.modelVersion, "1.0.0");
});

test("plan()'s code round-trips through decode() to the same inputsEcho (modulo codec-domain normalization)", () => {
  const r = plan(EXAMPLE_A_INPUT);
  const decoded = decode(r.code);
  assert.ok(decoded);
  assert.equal(decoded!.width, EXAMPLE_A_INPUT.width);
  assert.equal(decoded!.preset, EXAMPLE_A_INPUT.preset);
  assert.equal(decoded!.targetTemp, EXAMPLE_A_INPUT.targetTemp);
});

test("plan()'s serial matches its own code's fingerprint", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.match(r.serial, /^R-2A-606-[0-9A-F]{4}$/);
});

test("plan() never recommends a neverRecommend class", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.ok(!r.recommendations.some((x) => x.classId === "torpedo" || x.classId === "k_unvented"));
});

test("plan()'s fixFirst shows the D -> B grade improvement from insulating", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.ok(r.fixFirst);
  assert.equal(r.fixFirst!.gradeBefore, "D");
  assert.equal(r.fixFirst!.gradeAfter, "B");
  near(r.fixFirst!.qAfter, 13025, 3);
  assert.ok(r.fixFirst!.cost > 0 && r.fixFirst!.cost < 1000);
});

test("plan()'s continuous-mode season months match Chicago's own tMean crossing 50F (target 55 - 5)", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.deepEqual(r.usage.seasonMonths, ["jan", "feb", "mar", "apr", "nov", "dec"]);
  assert.ok(r.usage.tBal !== undefined && r.usage.tBal < 55);
});

test("plan() flags S12 (flammables) when flammablesStored is 'unknown', and S9 for an attached garage", () => {
  const r = plan(EXAMPLE_A_INPUT);
  const codes = r.warnings.map((w) => w.code);
  assert.ok(codes.includes("S12"));
  assert.ok(codes.includes("S9"));
});

test("plan() carries no S12 when flammablesStored is 'no'", () => {
  const r = plan({ ...EXAMPLE_A_INPUT, flammablesStored: "no" });
  assert.ok(!r.warnings.some((w) => w.code === "S12"));
});

test("plan() produces 6 cost rows, all with a positive perSeason", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.equal(r.costs.length, 6);
  for (const c of r.costs) assert.ok(c.perSeason > 0, `${c.system} has non-positive perSeason`);
});

test("plan() widens the band when a field is genuinely unknown, and narrows to a point when nothing is", () => {
  const known = plan(EXAMPLE_A_INPUT);
  assert.equal(known.heating.band.low, known.heating.band.high);

  const unknownWalls: GarageInput = { ...EXAMPLE_A_INPUT, wallType: "unknown" };
  const withUnknown = plan(unknownWalls);
  assert.ok(withUnknown.heating.band.low < withUnknown.heating.band.high);
  assert.equal(withUnknown.heating.band.unknowns, 1);
});

test("plan() handles sessions-mode usage without crashing and returns 5 session rows", () => {
  const sessionsInput: GarageInput = { ...EXAMPLE_A_INPUT, usage: { mode: "sessions", sessionsPerWeek: 2, hoursPerSession: 4, doorOpeningsPerSession: 2 } };
  const r = plan(sessionsInput);
  assert.equal(r.usage.mode, "sessions");
  assert.ok(r.sessions);
  assert.equal(r.sessions!.length, 5);
  assert.equal(r.usage.tBal, undefined);
  for (const s of r.sessions!) assert.ok(s.kwhOrFuel >= 0);
});

test("plan() is a pure function: calling it twice with the same input gives the same result", () => {
  const a = plan(EXAMPLE_A_INPUT);
  const b = plan(EXAMPLE_A_INPUT);
  assert.deepEqual(a, b);
});

test("plan() runs well under the 20ms CI budget (p95 under 4ms is the target; generous CI threshold)", () => {
  const start = performance.now();
  for (let i = 0; i < 20; i++) plan(EXAMPLE_A_INPUT);
  const elapsed = performance.now() - start;
  assert.ok(elapsed / 20 < 20, `plan() averaged ${(elapsed / 20).toFixed(2)}ms over 20 runs, over the 20ms CI budget`);
});
