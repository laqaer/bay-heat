#!/usr/bin/env node
/**
 * ASIN health check: is each Amazon listing we link to still a real, buyable product?
 *
 *   node scripts/verify-asins.mjs                    # every ASIN in VERIFIED_ASINS, plus parked ones in the ledger
 *   node scripts/verify-asins.mjs --asin B0XXXXXXXX  # also check a candidate (repeatable)
 *   node scripts/verify-asins.mjs --only-candidates --asin B0XXXXXXXX
 *   node scripts/verify-asins.mjs --json out.json    # write the full report
 *
 * Why this exists: a link to a listing that is "Currently unavailable" earns nothing, and nothing else on the
 * site notices. Run it before each weekly link audit (.claude/skills/affiliate-link-audit) and before promoting
 * any candidate ASIN into VERIFIED_ASINS.
 *
 * Rules this script follows on purpose:
 *  - It requests the PLAIN product URL, never an affiliate URL. A request that carries `tag=` is an affiliate
 *    click, and automated affiliate clicks violate the Associates program rules. The production watchdog
 *    (scripts/healthcheck.mjs) does not request Amazon either; this is a separate, manual tool.
 *  - It identifies itself honestly, goes one page at a time with a pause between, and does not retry or try to
 *    get around a robot check. A blocked result is reported as `blocked` (inconclusive), not as a failure.
 *  - It never reads or stores prices.
 *
 * Statuses: ok | offers-only | unavailable | dead | mismatch | blocked | error
 *   offers-only = the page loads but Amazon shows "No featured offer" (no Buy Box), so a buyer has to open
 *   "See All Buying Options". It can still convert, but never make it a page's primary pick.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UA = "bayheat-link-check/1.0 (+https://bayheatguide.com)";

function parseArgs(argv) {
  const out = { asins: [], onlyCandidates: false, json: null, delay: 4000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--asin") out.asins.push(argv[++i]);
    else if (a === "--only-candidates") out.onlyCandidates = true;
    else if (a === "--json") out.json = argv[++i];
    else if (a === "--delay") out.delay = Number(argv[++i]);
  }
  return out;
}

function text(fragment) {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const NO_INFO = { title: null, slug: null, rating: null, reviews: null };

export function classify(status, html) {
  if (status === 404) return { status: "dead", note: "HTTP 404", ...NO_INFO };
  if (status === 503 || /Enter the characters you see below|automated access/i.test(html)) {
    return { status: "blocked", note: "robot check / 503 (inconclusive)", ...NO_INFO };
  }
  if (status !== 200) return { status: "error", note: `HTTP ${status}`, ...NO_INFO };
  if (/Looking for something\?|Page Not Found|we couldn't find that page/i.test(html) && !/id="productTitle"/.test(html)) {
    return { status: "dead", note: "not-found page", ...NO_INFO };
  }
  const title = /id="productTitle"[^>]*>([\s\S]*?)<\/span>/.exec(html);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html);
  const buyable = /id="add-to-cart-button"|id="buy-now-button"/.test(html);
  const unavailable = /Currently unavailable\./.test(html) && !buyable;
  const offersOnly = /No featured offers available/i.test(html) && !buyable;
  const rating = /<span class="a-icon-alt">([\d.]+) out of 5 stars/.exec(html);
  const reviews = /id="acrCustomerReviewText"[^>]*>([\s\S]*?)<\/span>/.exec(html);
  const info = {
    title: title ? text(title[1]) : null,
    slug: canonical ? decodeURIComponent(new URL(canonical[1]).pathname.split("/")[1] ?? "") : null,
    rating: rating ? Number(rating[1]) : null,
    reviews: reviews ? text(reviews[1]).replace(/[()]/g, "") : null,
  };
  if (!info.title) return { status: "error", note: "no product title found (page layout changed?)", ...info };
  if (unavailable) return { status: "unavailable", note: "Currently unavailable, no Add to Cart", ...info };
  if (offersOnly) return { status: "offers-only", note: "no featured offer (no Buy Box); only 'See All Buying Options'", ...info };
  if (!buyable) return { status: "error", note: "no Add to Cart button and no 'unavailable' text; check by hand", ...info };
  return { status: "ok", note: "buyable", ...info };
}

async function check(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });
    const html = await res.text();
    return { asin, url, ...classify(res.status, html) };
  } catch (err) {
    return { asin, url, status: "error", note: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let asins = [...args.asins];
  if (!args.onlyCandidates) {
    const { VERIFIED_ASINS } = await import("../lib/commerce/products/core.ts");
    // Parked listings (unavailable when last checked) are re-checked too, so a restock is noticed.
    let parked = [];
    try {
      const ledger = JSON.parse(readFileSync(new URL("../company/research/asin-ledger.json", import.meta.url), "utf8"));
      parked = ledger.entries.filter((e) => e.role === "parked");
    } catch {
      // no ledger yet: nothing parked
    }
    asins = [...new Set([...VERIFIED_ASINS, ...parked.map((e) => e.asin), ...asins])];
    args.parked = parked;
  }
  if (asins.length === 0) {
    process.stderr.write("No ASINs to check.\n");
    process.exit(2);
  }
  if (asins.length > 60) {
    process.stderr.write("Refusing to check more than 60 ASINs in one run.\n");
    process.exit(2);
  }
  const results = [];
  for (const asin of asins) {
    const r = await check(asin);
    results.push(r);
    const label = r.title ? r.title.slice(0, 70) : r.note;
    process.stdout.write(`${r.status.padEnd(11)} ${asin}  ${label}${r.rating ? `  [${r.rating}★ ${r.reviews ?? ""}]` : ""}\n`);
    if (r.status === "blocked") {
      process.stdout.write("Amazon returned a robot check. Stopping; do not retry in a loop.\n");
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, args.delay));
  }
  if (args.json) writeFileSync(args.json, JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
  for (const e of args.parked ?? []) {
    const r = results.find((x) => x.asin === e.asin);
    if (r?.status === "ok") process.stdout.write(`\nRESTORE: ${e.asin} (${e.productId}) reads ok again. Put its asin back in lib/commerce/products and VERIFIED_ASINS.\n`);
  }
  const parkedAsins = new Set((args.parked ?? []).map((e) => e.asin));
  const bad = results.filter((r) => ["unavailable", "offers-only", "dead", "mismatch"].includes(r.status) && !(parkedAsins.has(r.asin) && r.status !== "dead"));
  if (bad.length) {
    process.stdout.write(`\n${bad.length} listing(s) need attention: ${bad.map((b) => `${b.asin} (${b.status})`).join(", ")}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
