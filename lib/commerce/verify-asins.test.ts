import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "../../scripts/verify-asins.mjs";

const page = (body: string) => `<html><head><link rel="canonical" href="https://www.amazon.com/Some-Heater-Name/dp/B000000000"></head><body>${body}</body></html>`;
const title = '<span id="productTitle"> Some Heater 5000W </span>';
const stars = '<span class="a-icon-alt">4.4 out of 5 stars</span><span id="acrCustomerReviewText">(3,546)</span>';

test("a buyable listing is ok and its title, rating and review count are read", () => {
  const r = classify(200, page(`${title}${stars}<input id="add-to-cart-button">`));
  assert.equal(r.status, "ok");
  assert.equal(r.title, "Some Heater 5000W");
  assert.equal(r.rating, 4.4);
  assert.equal(r.reviews, "3,546");
  assert.equal(r.slug, "Some-Heater-Name");
});

test("Currently unavailable with no Add to Cart is unavailable, not ok", () => {
  const r = classify(200, page(`${title}<div>Currently unavailable. We don't know when or if this item will be back in stock.</div>`));
  assert.equal(r.status, "unavailable");
});

test("a listing with no featured offer is offers-only: it loads but has no Buy Box", () => {
  const r = classify(200, page(`${title}${stars}<div>Price No featured offers available</div><a>See All Buying Options</a><span data-should-render-add-to-cart-button="false"></span>`));
  assert.equal(r.status, "offers-only");
});

test("boilerplate 'Currently unavailable' strings on a buyable page do not flag it", () => {
  const r = classify(200, page(`${title}<script>{"currentlyUnavailableMessage":"Currently unavailable."}</script><input id="add-to-cart-button">`));
  assert.equal(r.status, "ok");
});

test("404s, robot checks and layout drift are told apart", () => {
  assert.equal(classify(404, "").status, "dead");
  assert.equal(classify(503, "Enter the characters you see below").status, "blocked");
  assert.equal(classify(200, page("<p>no title here</p>")).status, "error");
  assert.equal(classify(200, page(`${title}<p>neither cart button nor unavailable text</p>`)).status, "error");
});
