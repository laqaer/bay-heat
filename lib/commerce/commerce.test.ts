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

test("fixCartLines sizes parts to the doors, leaves the bottom seal out, and drops measures with no verified listing", async () => {
  const { fixCartLines, fixCartHref, fixCartNeedsTrackChoice } = await import("./fixCart.ts");
  const two = fixCartLines(["weatherstrip", "door_kit_reflective", "ceiling_r30", "new_pu_door"], [{ w: 16 }]);
  assert.deepEqual(two.map((l) => l.productId), ["seal-perimeter-stop", "door-kit-reflective-reach-barrier"]);
  assert.ok(!two.some((l) => l.productId.startsWith("seal-bottom")), "the bottom seal depends on the track profile, which the planner never asks");
  assert.equal(fixCartNeedsTrackChoice(["weatherstrip"]), true);
  assert.equal(fixCartNeedsTrackChoice(["attic_hatch"]), false);
  const singles = fixCartLines(["weatherstrip", "door_kit_reflective"], [{ w: 9 }, { w: 9 }]);
  assert.deepEqual(singles.map((l) => [l.productId, l.qty]), [["seal-perimeter-stop", 2]]);
  const { fixCartCoveredMeasures } = await import("./fixCart.ts");
  assert.deepEqual(fixCartCoveredMeasures(["door_kit_eps", "weatherstrip", "ceiling_r30"], [{ w: 16 }]), ["weatherstrip"]);
  const { fixCartMissingParts } = await import("./fixCart.ts");
  assert.deepEqual(fixCartMissingParts(["weatherstrip"]), ["service-door weatherstrip kit"], "the weatherstrip package includes a service-door kit with no listing");
  assert.deepEqual(fixCartMissingParts(["attic_hatch"]), []);
  assert.equal(fixCartLines(["ceiling_r30", "new_pu_door"], [{ w: 16 }]).length, 0);
  assert.equal(fixCartHref(fixCartLines(["attic_hatch"], [{ w: 16 }])), null, "one product is a link, not a cart");
  assert.equal(fixCartHref(fixCartLines(["weatherstrip"], [{ w: 16 }])), null, "the top and side seal alone is a link, not a cart");
  assert.match(fixCartHref(two)!, /cart\/add\.html\?AssociateTag=/);
});

test("productForRecommendation links a model directly only when one unit covers the modeled capacity", async () => {
  const { productForRecommendation } = await import("./products/index.ts");
  const fit = productForRecommendation(["cz220-5kw-ceiling", "fuh54-5kw"], { capacityBtuh: 17060, units: 1 });
  assert.equal(fit.direct, true);
  assert.equal(fit.product?.id, "cz220-5kw-ceiling");
  const two = productForRecommendation(["minisplit-12k-230v"], { capacityBtuh: 37493, units: 2 });
  assert.equal(two.direct, false, "two 12k units are not one 12k mini-split");
  const big = productForRecommendation(["gas-unit-heater-big-maxx-50", "gas-unit-heater-hot-dawg-45"], { capacityBtuh: 100000, units: 1 });
  assert.equal(big.direct, false, "a 100,000 BTU/h result is not a 50,000 BTU Big Maxx");
  const unknown = productForRecommendation(["minisplit-12k-230v"], { capacityBtuh: 10000, units: 1 });
  assert.equal(unknown.direct, false, "no nameplate output on file: never a direct link");
  const noAsin = productForRecommendation(["hs1500tt-wall-infrared"], { capacityBtuh: 5000, units: 1 });
  assert.equal(noAsin.direct, false, "a parked listing is never direct");
});

test("warningToShow keeps the maker's flammables rule unless the class line already carries it", async () => {
  const { warningToShow, findProduct } = await import("./products/index.ts");
  const FLAM = "Manual: not where gasoline, paint or flammable liquids are used or stored.";
  const cz220 = findProduct("cz220-5kw-ceiling");
  const dr975 = findProduct("dr975-7k5-shop");
  assert.equal(warningToShow(cz220, `${FLAM} Move them first.`), undefined, "the class line already says it");
  assert.equal(warningToShow(cz220, undefined), cz220?.safetyLine?.text, "no flammables in the class line: show the product's whole line");
  assert.equal(warningToShow(cz220, "Elements at least 18 in above the floor."), cz220?.safetyLine?.text);
  const extra = warningToShow(dr975, `${FLAM} Move them first.`);
  assert.ok(extra && /RESIDENTIAL OR HOUSEHOLD HEATER/.test(extra), "a product's own warning always gets through");
  assert.equal(warningToShow(undefined, FLAM), undefined);
});
