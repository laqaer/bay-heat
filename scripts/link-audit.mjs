#!/usr/bin/env node
/**
 * Affiliate link audit: what does each built page actually offer a buyer, and where?
 *
 *   npm run build && node scripts/link-audit.mjs                      # static: counts, link kinds, tags, rel
 *   npm run build && npm run check:affiliates                         # same audit; exits 1 on a rule violation
 *   node scripts/link-audit.mjs --rail http://localhost:3000          # + first paid link position in px
 *   node scripts/link-audit.mjs --json company/research/link-audit.json
 *
 * Static mode reads the exported HTML in out/ (the directory that deploys; --dir picks another) and never touches
 * the network. Rail mode drives a
 * running static build (`npm start`, which serves out/ with wrangler dev) with Playwright (resolved from PLAYWRIGHT_MODULE, or the local/global install) and measures
 * how far down the page the first paid link sits at 390x844 and 1440x900 -- the blueprint's "first plate within
 * 700 px" rule (BLUEPRINT.md §3.3), which the model's click-through assumptions rest on.
 *
 * Flags each page: no paid link at all, search-only links (lower intent than a /dp/ link), a link missing the
 * tag or rel="sponsored nofollow", a disclosure that is not above the first paid link, a directly linked
 * product whose own manual warning is not on the page, a dollar figure in the same [data-buy-group] as an Amazon
 * link, and a first link past the 700 px budget.
 *
 * --check (CI, after the build) exits 1 when any page carries a rule flag (RULE_FLAGS below). The other flags
 * (no-paid-link, search-only, past-700px-mobile) are information, not violations. The check reads static HTML
 * only: a state that exists only after client-side rendering (a planner result) is not in out/ and is not checked.
 */
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIL_BUDGET_PX = 700;

function parseArgs(argv) {
  const out = { dir: "out", json: null, rail: null, check: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") out.dir = argv[++i];
    else if (argv[i] === "--json") out.json = argv[++i];
    else if (argv[i] === "--rail") out.rail = argv[++i];
    else if (argv[i] === "--check") out.check = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!out.dir) throw new Error("--dir needs a directory");
  return out;
}

// out/_next holds hashed JS/CSS chunks, never a page.
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) return [p];
    return name === "_next" ? [] : walk(p);
  });
}

// One attribute; a quoted value may hold ">" (a Tailwind class such as [&>p]:mt-2).
const ATTR = String.raw`\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?`;
// Any Amazon host, in any letter case, with or without a scheme: www.amazon.com, amazon.com, amazon.co.uk, and the
// amzn.to, amzn.asia and a.co short links. A short link without a tag= parameter fails the untagged rule.
const AMAZON_HOST = String.raw`(?:[\w-]+\.)*(?:amazon\.[a-z]{2,3}(?:\.[a-z]{2})?|amzn\.[a-z]{2,4}|a\.co)(?=[/?#:"])`;
const AMAZON_ANCHOR = new RegExp(String.raw`<a(?:${ATTR})*?\s+href="((?:https?:)?\/\/${AMAZON_HOST}[^"]*)"(?:${ATTR})*\s*\/?>`, "gi");

export function auditHtml(html) {
  const links = [];
  for (const m of html.matchAll(AMAZON_ANCHOR)) {
    const tag = m[0];
    const href = m[1].replace(/&amp;/g, "&");
    const u = new URL(href, "https://www.amazon.com"); // the base only resolves a protocol-relative //host link
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
const AMAZON_ANCHOR_ANY = new RegExp(String.raw`<a(?:${ATTR})*?\s+href="(?:https?:)?\/\/${AMAZON_HOST}`, "i");

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

// A plate that links a product directly must show that product's own manual warning where the reader can see it,
// next to the button: the DR-975's "do not use as a residential heater", the Big Maxx's minimum mounting height, the
// DR-238's mounting height, the diesel heaters' "not for constant garage heating". A line that exists somewhere else
// on a long page is not at the point of sale, so the check is per link: the warning must appear in the visible text
// within WINDOW characters of HTML on either side of each /dp/ link. Returns the ids of products with a link that
// fails. `products` is ALL_PRODUCTS.
const WARNING_WINDOW = 3500;
export function missingProductWarnings(html, products, window = WARNING_WINDOW) {
  // Only links a reader can click count: blank out <script> bodies (Next's RSC payload repeats every href there) while
  // keeping offsets, then look for the link inside an href.
  const dom = html.replace(/<script[\s\S]*?<\/script>/g, (m) => " ".repeat(m.length));
  const out = new Set();
  for (const p of products) {
    if (!p.asin || !p.safetyLine) continue;
    const needle = visibleText(p.safetyLine.text);
    const marker = `href="https://www.amazon.com/dp/${p.asin}`;
    for (let at = dom.indexOf(marker); at !== -1; at = dom.indexOf(marker, at + marker.length)) {
      const near = visibleText(dom.slice(Math.max(0, at - window), at + window));
      if (!near.includes(needle)) out.add(p.id);
    }
  }
  return [...out];
}

// The buy-plate rule (BLUEPRINT.md §5.5, §6.1). A buy plate is an element with the data-buy-group attribute. No dollar
// figure may have a nearest buy plate that also holds an a[href*="amazon."]. Amazon allows a price only from its own
// approved feeds. A "$120" beside "Check price on Amazon" reads as an Amazon price.
//
// - The figure belongs to its nearest buy plate: nested plates are blanked before the figure search. The Amazon link
//   may sit anywhere in that plate, nested plates included.
// - A figure is one dollar sign, then a digit (or ".99"). Space, comments and inline tags may sit between them,
//   because a reader still sees "$129" there; React writes "$<!-- -->129". A block tag such as </p> ends the figure.
// - Two or more adjacent dollar signs are a price class ($$ to $$$$), never a figure. A one-sign class ($) followed by
//   a number in the same line reads as a price, so it fails; end the line after the class.
// - Numeric entities are decoded first (with or without the closing ";"), so &#36;129 and $&#49;29 count. Zero-width
//   characters and named entities between the sign and the digit do not hide a figure.
// - A buy plate with no closing tag fails.
const START_TAG = new RegExp(String.raw`<([a-zA-Z][\w-]*)((?:${ATTR})*)\s*/?>`, "g");
const AMAZON_HREF = new RegExp(String.raw`<a(?:${ATTR})*?\s+href\s*=\s*["']?[^"'\s>]*(?:amazon\.|amzn\.|\/\/a\.co\/)`, "i");
const BLOCK = "address|article|aside|blockquote|caption|dd|details|dialog|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hgroup|hr|li|main|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul";
const SIGN = String.raw`$\uFF04\uFE69`;
const BETWEEN = String.raw`\s|[\u200B-\u200D\u2060\uFEFF]|&[a-zA-Z][a-zA-Z0-9]*;|<\/?(?!(?:${BLOCK})(?=[\s/>]))[a-zA-Z][\w-]*(?:${ATTR})*\s*\/?>`;
const DOLLAR_FIGURE = new RegExp(String.raw`(?<![${SIGN}])[${SIGN}](?![${SIGN}])(?:${BETWEEN})*\.?\p{Nd}`, "iu");
const NAMED = { nbsp: "\u00a0", ensp: "\u2002", emsp: "\u2003", thinsp: "\u2009", dollar: "$" };

// Decode numeric entities and a few named ones. Keep <, > and & encoded, so decoding cannot create a tag.
function decodeForFigures(markup) {
  return markup
    .replace(/&#(?:x([0-9a-f]+)|(\d+));?/gi, (m, hex, dec) => {
      const code = hex ? parseInt(hex, 16) : Number(dec);
      return code === 38 || code === 60 || code === 62 || code > 0x10ffff ? m : String.fromCodePoint(code);
    })
    .replace(/&(nbsp|ensp|emsp|thinsp|dollar);/gi, (m, name) => NAMED[name.toLowerCase()]);
}

function closeOf(dom, name, from) {
  const tag = new RegExp(String.raw`<(/?)${name}(?=[\s/>])(?:${ATTR})*\s*/?>`, "gi");
  tag.lastIndex = from;
  let depth = 1;
  for (let m = tag.exec(dom); m; m = tag.exec(dom)) {
    if (m[1]) depth--;
    else if (!m[0].endsWith("/>")) depth++;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

export function buyGroupViolations(html) {
  // Keep offsets: blank script and style bodies (the RSC payload repeats every string) and comments.
  const dom = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
  const groups = [];
  for (const m of dom.matchAll(START_TAG)) {
    if (!/\sdata-buy-group(?=[\s=]|$)/.test(m[2])) continue;
    const start = m.index;
    const end = closeOf(dom, m[1], start + m[0].length);
    groups.push({ start, end });
  }
  const out = [];
  for (const g of groups) {
    if (g.end === -1) {
      out.push({ rule: "unclosed-buy-group", sample: dom.slice(g.start, g.start + 80) });
      continue;
    }
    const whole = dom.slice(g.start, g.end);
    if (!AMAZON_HREF.test(whole)) continue;
    let own = whole;
    for (const inner of groups) {
      if (inner === g || inner.start <= g.start || inner.start >= g.end) continue;
      const stop = inner.end === -1 ? g.end : Math.min(inner.end, g.end);
      own = own.slice(0, inner.start - g.start) + " ".repeat(stop - inner.start) + own.slice(stop - g.start);
    }
    const decoded = decodeForFigures(own);
    const figure = DOLLAR_FIGURE.exec(decoded);
    if (figure) out.push({ rule: "dollar-in-buy-group", sample: decoded.slice(figure.index, figure.index + 60).replace(/\s+/g, " ") });
  }
  return { groups: groups.length, violations: out };
}

// Flags that break a rule. --check fails on any of them; every other flag is information.
const RULE_FLAGS = /^(dollar-in-buy-group|unclosed-buy-group|disclosure-after-link|untagged|missing-rel|missing-product-warning:.+)$/;

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
  const details = [];
  let buyGroups = 0;
  for (const f of files) {
    const route = "/" + relative(args.dir, f).replace(/\.html$/, "").replace(/^index$/, "");
    const html = readFileSync(f, "utf8");
    const links = auditHtml(html);
    const flags = [];
    const plates = buyGroupViolations(html);
    buyGroups += plates.groups;
    for (const v of plates.violations) {
      if (!flags.includes(v.rule)) flags.push(v.rule);
      details.push(`${route}: ${v.rule}: ${JSON.stringify(v.sample)}`);
    }
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
  if (!args.check) return;

  // An empty or wrong directory must not pass as "no violations".
  if (pages.length === 0) throw new Error(`no HTML pages under ${args.dir}; run npm run build first`);
  const failing = pages.flatMap((p) => p.flags.filter((flag) => RULE_FLAGS.test(flag)).map((flag) => `${p.route}: ${flag}`));
  if (failing.length > 0) {
    process.stderr.write(`\ncheck-affiliates: FAIL, ${failing.length} rule violation(s) in ${args.dir}:\n`);
    for (const line of [...failing, ...details]) process.stderr.write(`  ${line}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`check-affiliates: pass, 0 rule violations in ${pages.length} pages, ${totals.links} paid links and ${buyGroups} buy groups under ${args.dir}\n`);
}

// Compare real paths: a space or a symlink in the checkout path must not skip main() and pass silently.
function isMain() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (process.argv[1] && isMain()) {
  main().catch((error) => {
    process.stderr.write(`link-audit: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
