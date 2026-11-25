import { test } from "node:test";
import assert from "node:assert/strict";
import { findPage } from "./index.ts";
import { AMAZON_CTA, PRICE_NOTE, SEASONAL_UPDATED, amazonCtaText } from "./seasonal.ts";

const PATHS = ["/infrared-garage-heater", "/garage-door-bottom-seal", "/garage-heaters"] as const;

test("the winter note names no offer and the three pages carry the ship date", () => {
  assert.equal(
    PRICE_NOTE,
    "Black Friday and holiday prices change daily, so check today's price on Amazon.",
  );
  assert.equal(AMAZON_CTA, "Check today's price");
  assert.equal(/\b(deal|sale|save)\b|%\s*off|\$\d/i.test(`${PRICE_NOTE} ${AMAZON_CTA}`), false);
  for (const href of PATHS) {
    const page = findPage(href);
    assert.ok(page, href);
    assert.equal(page.updated, SEASONAL_UPDATED);
    assert.notEqual(page.published, page.updated);
  }
});

test("only an Amazon button takes the price-check label", () => {
  assert.equal(amazonCtaText("amazon", "Check price on Amazon"), "Check today's price");
  assert.equal(amazonCtaText("amazon", "Search on Amazon"), "Check today's price");
  assert.equal(amazonCtaText("homedepot", "Check price at Home Depot"), "Check price at Home Depot");
});
