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

test("every product asin is a verified ASIN, and every verified ASIN is used by exactly one product", () => {
  const verified = VERIFIED_ASINS as readonly string[];
  const used = ALL_PRODUCTS.filter((p) => p.asin).map((p) => p.asin as string);
  for (const asin of used) assert.ok(verified.includes(asin), `${asin} is on a product but not in VERIFIED_ASINS`);
  for (const asin of verified) assert.ok(used.includes(asin), `${asin} is in VERIFIED_ASINS but no product uses it`);
  assert.equal(new Set(used).size, used.length, "two products share an ASIN");
  assert.equal(new Set(verified).size, verified.length, "VERIFIED_ASINS has a duplicate");
});

test("a bad-format ASIN cannot get into the registry", () => {
  for (const asin of VERIFIED_ASINS) assert.match(asin, /^B[0-9A-Z]{9}$/);
});

test("a repeated ASIN raises quantity and does not count as a second product", () => {
  const [a, b] = [VERIFIED_ASINS[0], VERIFIED_ASINS[1]];
  assert.equal(amazonCartUrl([a, a]), null);
  const url = amazonCartUrl([a, b, a])!;
  assert.match(url, /ASIN\.1=B009F1SWH8&Quantity\.1=2&ASIN\.2=B00PX0T37I&Quantity\.2=1/);
});

test("fixCartLines sizes parts to the doors and drops measures with no verified listing", async () => {
  const { fixCartLines, fixCartHref } = await import("./fixCart.ts");
  const two = fixCartLines(["weatherstrip", "door_kit_reflective", "ceiling_r30", "new_pu_door"], [{ w: 16 }]);
  assert.deepEqual(two.map((l) => l.productId), ["seal-bottom-t-16ft", "seal-perimeter-stop", "door-kit-reflective-reach-barrier"]);
  const singles = fixCartLines(["weatherstrip", "door_kit_reflective"], [{ w: 9 }, { w: 9 }]);
  assert.deepEqual(singles.map((l) => [l.productId, l.qty]), [["seal-bottom-t-8ft", 2], ["seal-perimeter-stop", 2]]);
  assert.equal(fixCartLines(["ceiling_r30", "new_pu_door"], [{ w: 16 }]).length, 0);
  assert.equal(fixCartHref(fixCartLines(["attic_hatch"], [{ w: 16 }])), null, "one product is a link, not a cart");
  assert.match(fixCartHref(two)!, /cart\/add\.html\?AssociateTag=/);
});
