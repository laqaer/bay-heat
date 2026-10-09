import { test } from "node:test";
import assert from "node:assert/strict";
import { HEATER_CLASSES, ALL_HEATER_CLASSES, heaterClass } from "./catalog.ts";
import { PRODUCT_IDS } from "../commerce/ids.ts";
import { ALL_PRODUCTS } from "../commerce/products/index.ts";

test("every HeaterClassId has a catalog entry with a matching id", () => {
  for (const [id, cls] of Object.entries(HEATER_CLASSES)) {
    assert.equal(cls.id, id);
  }
  assert.equal(ALL_HEATER_CLASSES.length, Object.keys(HEATER_CLASSES).length);
});

test("every catalog productId is in the frozen PRODUCT_IDS list", () => {
  const idSet = new Set<string>(PRODUCT_IDS);
  for (const cls of ALL_HEATER_CLASSES) {
    for (const pid of cls.productIds) {
      assert.ok(idSet.has(pid), `${cls.id}: productId "${pid}" is not in lib/commerce/ids.ts`);
    }
  }
});

test("every non-empty catalog productId resolves to an actual Product", () => {
  const byId = new Map(ALL_PRODUCTS.map((p) => [p.id, p]));
  for (const cls of ALL_HEATER_CLASSES) {
    for (const pid of cls.productIds) {
      assert.ok(byId.has(pid), `${cls.id}: productId "${pid}" has no Product entry in lib/commerce/products/*`);
    }
  }
});

test("every heater-kind Product carries a safetyLine (S12 / commerce test parity)", () => {
  const heaterClassIds = new Set(Object.keys(HEATER_CLASSES));
  for (const p of ALL_PRODUCTS) {
    if (heaterClassIds.has(p.kind)) {
      assert.ok(p.safetyLine, `${p.id} (kind ${p.kind}) is a heater product with no safetyLine`);
    }
  }
});

test("torpedo and kerosene classes are flagged neverRecommend with no products", () => {
  assert.equal(heaterClass("torpedo").neverRecommend, true);
  assert.equal(heaterClass("k_unvented").neverRecommend, true);
  assert.equal(heaterClass("torpedo").productIds.length, 0);
});

test("Buddy-type propane is tier 3 (spot use only, never a default buy plate)", () => {
  assert.equal(heaterClass("g_unvented_buddy").tier, 3);
});

test("outputBtuh ranges are non-decreasing [low, high] pairs", () => {
  for (const cls of ALL_HEATER_CLASSES) {
    assert.ok(cls.outputBtuh[0] <= cls.outputBtuh[1], `${cls.id}: outputBtuh ${cls.outputBtuh} is not [low, high]`);
  }
});

// The catalog's `circuit` string and the requirement readers see must be one requirement. Found 2026-10-09:
// e_240_4k claimed 240V20A (4 kW needs 25 A), e_ir_240 claimed 240V30A (6 kW needs 35 A), and the 1,500 W plug-ins
// were eligible on 15 A while their cards showed 20 A. classCircuit() is now the one source: eligibility, cards,
// "Power it" and the pages all read it, and each catalog string must be the smallest circuit in the planner's picker
// that carries it.
test("every class's catalog circuit is the smallest picker circuit that carries its requirement", async () => {
  const { classCircuit, circuitCovers, CIRCUIT_AMPS } = await import("./classCircuit.ts");
  const picker = (Object.keys(CIRCUIT_AMPS) as (keyof typeof CIRCUIT_AMPS)[]).sort((a, b) => CIRCUIT_AMPS[a] - CIRCUIT_AMPS[b]);
  for (const c of Object.values(HEATER_CLASSES)) {
    const spec = classCircuit(c);
    if (!c.circuit) {
      assert.equal(spec, undefined, `${c.id}: no catalog circuit, so no requirement`);
      continue;
    }
    const smallest = picker.find((p) => circuitCovers(p, spec!));
    assert.equal(c.circuit, smallest, `${c.id}: needs ${spec!.volts} V / ${spec!.breakerA} A, so its catalog circuit is ${smallest}`);
  }
  // The two the fact-check caught, and the plug-in rule from lib/safety/verdict.ts (15 A only with nothing else on it).
  assert.equal(classCircuit(HEATER_CLASSES.e_240_4k)!.breakerA, 25);
  assert.equal(classCircuit(HEATER_CLASSES.e_ir_240)!.breakerA, 35);
  assert.equal(classCircuit(HEATER_CLASSES.e_port_1500)!.breakerA, 15);
  assert.match(classCircuit(HEATER_CLASSES.e_port_1500)!.notes[0], /nothing else on that circuit/);
});
