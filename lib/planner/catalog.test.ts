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
