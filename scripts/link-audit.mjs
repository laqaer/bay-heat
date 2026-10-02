#!/usr/bin/env node
/**
 * Affiliate link audit: what does each built page actually offer a buyer, and where?
 *
 *   npm run build && node scripts/link-audit.mjs                      # static: counts, link kinds, tags, rel
 *   node scripts/link-audit.mjs --rail http://localhost:3000          # + first paid link position in px
 *   node scripts/link-audit.mjs --json company/research/link-audit.json
 *
 * Static mode reads the prerendered HTML in .next/server/app and never touches the network. Rail mode drives a
 * running `next start` with Playwright (resolved from PLAYWRIGHT_MODULE, or the local/global install) and measures
 * how far down the page the first paid link sits at 390x844 and 1440x900 -- the blueprint's "first plate within
 * 700 px" rule (BLUEPRINT.md §3.3), which the model's click-through assumptions rest on.
 *
 * Flags each page: no paid link at all, search-only links (lower intent than a /dp/ link), a link missing the
 * tag or rel="sponsored nofollow", a disclosure that is not above the first paid link, a directly linked
 * product whose own manual warning is not on the page, and a first link past
 * the 700 px budget.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const RAIL_BUDGET_PX = 700;

function parseArgs(argv) {
  const out = { dir: ".next/server/app", json: null, rail: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") out.dir = argv[++i];
    else if (argv[i] === "--json") out.json = argv[++i];
    else if (argv[i] === "--rail") out.rail = argv[++i];
  }
  return out;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const AMAZON_ANCHOR = /<a\b[^>]*href="(https:\/\/www\.amazon\.com[^"]*)"[^>]*>/g;

export function auditHtml(html) {
  const links = [];
  for (const m of html.matchAll(AMAZON_ANCHOR)) {
    const tag = m[0];
    const href = m[1].replace(/&amp;/g, "&");
    const u = new URL(href);
    const dp = /\/dp\/([A-Z0-9]{10})/.exec(u.pathname);
    links.push({
      kind: dp ? "dp" : u.pathname.includes("/cart/add") ? "cart" : "search",
      target: dp ? dp[1] : u.pathname.includes("/cart/add") ? "cart" : (u.searchParams.get("k") ?? ""),
      tag: u.searchParams.get("tag") ?? u.searchParams.get("AssociateTag"),
      rel: /rel="([^"]*)"/.exec(tag)?.[1] ?? "",
    });
  }
  return links;
}

// The disclosure must be on the page above the first paid link (BLUEPRINT.md §5.3). The inline disclosure starts
// "Paid links: we earn a commission" (lib/site.ts DISCLOSURE_INLINE); the footer wording differs on purpose.
export function disclosureBeforeFirstLink(html) {
  const link = html.search(AMAZON_ANCHOR_ANY);
  if (link === -1) return true;
  const disclosure = html.indexOf("Paid links: we earn a commission");
  return disclosure !== -1 && disclosure < link;
}
const AMAZON_ANCHOR_ANY = /<a\b[^>]*href="https:\/\/www\.amazon\.com/;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// A plate that links a product directly must show that product's own manual warning where the reader can see it:
// the DR-975's "do not use as a residential heater", the Big Maxx's minimum mounting height, the diesel heaters'
// "not for constant garage heating". Returns the ids of products linked on the page whose safety line is missing
// from the visible text. `products` is ALL_PRODUCTS.
export function missingProductWarnings(html, products) {
  const text = visibleText(html);
  return products
    .filter((p) => p.asin && p.safetyLine && html.includes(`/dp/${p.asin}`) && !text.includes(visibleText(p.safetyLine.text)))
    .map((p) => p.id);
}

async function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, "playwright", "/opt/node22/lib/node_modules/playwright/index.js"].filter(Boolean);
  for (const c of candidates) {
    try {
      const mod = await import(c);
      return mod.chromium ? mod : mod.default;
    } catch {
      // try the next candidate
    }
  }
  throw new Error("Playwright not found; set PLAYWRIGHT_MODULE to its index.js");
}

async function measureRail(base, routes) {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const out = {};
  for (const [label, viewport] of [["mobile", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]]) {
    const page = await browser.newPage({ viewport });
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "load", timeout: 30_000 });
      const y = await page.evaluate(() => {
        const a = document.querySelector('a[rel~="sponsored"]');
        return a ? Math.round(a.getBoundingClientRect().top + window.scrollY) : null;
      });
      (out[route] ??= {})[label] = y;
    }
    await page.close();
  }
  await browser.close();
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { ALL_PRODUCTS } = await import("../lib/commerce/products/index.ts");
  const files = walk(args.dir).filter((f) => f.endsWith(".html") && !/_not-found|_global-error/.test(f));
  const pages = [];
  for (const f of files) {
    const route = "/" + relative(args.dir, f).replace(/\.html$/, "").replace(/^index$/, "");
    const html = readFileSync(f, "utf8");
    const links = auditHtml(html);
    const flags = [];
    if (!disclosureBeforeFirstLink(html)) flags.push("disclosure-after-link");
    for (const id of missingProductWarnings(html, ALL_PRODUCTS)) flags.push(`missing-product-warning:${id}`);
    if (links.length === 0) flags.push("no-paid-link");
    if (links.length > 0 && links.every((l) => l.kind === "search")) flags.push("search-only");
    if (links.some((l) => !l.tag)) flags.push("untagged");
    if (links.some((l) => !/\bsponsored\b/.test(l.rel) || !/\bnofollow\b/.test(l.rel))) flags.push("missing-rel");
    pages.push({
      route: route === "/" ? "/" : route.replace(/\/$/, ""),
      links: links.length,
      dp: links.filter((l) => l.kind === "dp").length,
      search: links.filter((l) => l.kind === "search").length,
      cart: links.filter((l) => l.kind === "cart").length,
      distinct: new Set(links.map((l) => l.target)).size,
      tags: [...new Set(links.map((l) => l.tag).filter(Boolean))],
      flags,
    });
  }
  pages.sort((a, b) => b.links - a.links || a.route.localeCompare(b.route));

  if (args.rail) {
    const linked = pages.filter((p) => p.links > 0).map((p) => p.route);
    const rail = await measureRail(args.rail.replace(/\/$/, ""), linked);
    for (const p of pages) {
      p.firstLinkPx = rail[p.route] ?? null;
      if (p.firstLinkPx && (p.firstLinkPx.mobile ?? 0) > RAIL_BUDGET_PX) p.flags.push("past-700px-mobile");
    }
  }

  const totals = pages.reduce((t, p) => ({ links: t.links + p.links, dp: t.dp + p.dp, search: t.search + p.search, cart: t.cart + p.cart }), { links: 0, dp: 0, search: 0, cart: 0 });
  process.stdout.write(`route`.padEnd(46) + `links dp  srch cart distinct  ${args.rail ? "first-link px (mobile / desktop)  " : ""}flags\n`);
  for (const p of pages) {
    const px = args.rail ? `${String(p.firstLinkPx?.mobile ?? "-").padStart(6)} / ${String(p.firstLinkPx?.desktop ?? "-").padEnd(6)}                  ` : "";
    process.stdout.write(`${p.route.padEnd(46)}${String(p.links).padEnd(6)}${String(p.dp).padEnd(4)}${String(p.search).padEnd(5)}${String(p.cart).padEnd(5)}${String(p.distinct).padEnd(10)}${px}${p.flags.join(",")}\n`);
  }
  process.stdout.write(`\nTOTAL ${totals.links} paid links: ${totals.dp} direct /dp/, ${totals.search} search, ${totals.cart} cart, across ${pages.filter((p) => p.links > 0).length} of ${pages.length} pages\n`);
  if (args.json) writeFileSync(args.json, JSON.stringify({ auditedAt: new Date().toISOString(), totals, pages }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
