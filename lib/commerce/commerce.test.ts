import { test } from "node:test";
import assert from "node:assert/strict";
import { route } from "./route.ts";
import { amazonCartUrl } from "./cart.ts";
import { VERIFIED_ASINS, PRODUCTS } from "./products/core.ts";
import { ALL_PRODUCTS } from "./products/index.ts";
import { PRODUCT_IDS } from "./ids.ts";

test("every product id is in the frozen PRODUCT_IDS list", () => {
  for (const p of ALL_PRODUCTS) {
    assert.ok((PRODUCT_IDS as readonly string[]).includes(p.id), `product id "${p.id}" is not in lib/commerce/ids.ts`);
  }
});

test("a verified ASIN always routes to /dp/, tagged", () => {
  const cz220 = PRODUCTS.find((p) => p.asin === VERIFIED_ASINS[0])!;
  const links = route(cz220, "site");
  const amazon = links.find((l) => l.partner === "amazon")!;
  assert.match(amazon.href, /amazon\.com\/dp\//);
  assert.match(amazon.href, /tag=/);
});

test("an unverified product routes to a tagged Amazon search link, never /dp/", () => {
  const fake = { ...PRODUCTS[0], id: "test-unverified", asin: "B000000000", searchQuery: "test heater" };
  const links = route(fake, "site");
  const amazon = links.find((l) => l.partner === "amazon")!;
  assert.match(amazon.href, /amazon\.com\/s\?k=/);
  assert.doesNotMatch(amazon.href, /\/dp\//);
});

test("missing partner env falls back to Amazon as primary", () => {
  const p = { ...PRODUCTS[0], partnerUrls: { northern_tool: "https://www.northerntool.com/x" } };
  const links = route(p, "site");
  assert.equal(links.length, 1);
  assert.equal(links[0].partner, "amazon");
  assert.equal(links[0].slot, "primary");
});

test("per-surface Amazon tags are used", () => {
  const links = route(PRODUCTS[0], "planner");
  const amazon = links.find((l) => l.partner === "amazon")!;
  assert.match(amazon.href, /tag=/);
});

test("amazonCartUrl requires at least 2 verified ASINs", () => {
  assert.equal(amazonCartUrl([VERIFIED_ASINS[0]]), null);
  assert.equal(amazonCartUrl(["B000000000", "B000000001"]), null);
  const url = amazonCartUrl([VERIFIED_ASINS[0], VERIFIED_ASINS[1]]);
  assert.ok(url);
  assert.match(url!, /ASIN\.1=/);
  assert.match(url!, /ASIN\.2=/);
});

test("no duplicate product ids across lanes", () => {
  const ids = ALL_PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});
