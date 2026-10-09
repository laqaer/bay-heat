#!/usr/bin/env node
/**
 * Compares two hosts page by page, for a hosting move: every sitemap URL's status, title, canonical,
 * description, robots meta, H1, JSON-LD count and tagged-link count, plus whether its og:image loads.
 * Fetches only the two BayHeat hosts given (never a retailer).
 *
 *   node scripts/host-parity.mjs [A=https://bayheatguide.com] [B=https://bay-heat.laqaer-products.workers.dev]
 */
const [A = "https://bayheatguide.com", B = "https://bay-heat.laqaer-products.workers.dev"] = process.argv.slice(2);
const UA = { "user-agent": "BayHeat-host-parity/1.0" };
const pick = (html, re) => (html.match(re) || [])[1] ?? null;

function facts(html) {
  return {
    title: pick(html, /<title>([^<]*)<\/title>/),
    canonical: pick(html, /<link rel="canonical" href="([^"]+)"/),
    desc: pick(html, /<meta name="description" content="([^"]*)"/),
    robots: pick(html, /<meta name="robots" content="([^"]*)"/),
    h1: pick(html, /<h1[^>]*>(.*?)<\/h1>/s)?.replace(/<[^>]+>/g, "").slice(0, 80) ?? null,
    jsonld: (html.match(/application\/ld\+json/g) || []).length,
    tagged: (html.match(/tag=laqaer-20/g) || []).length,
    og: pick(html, /<meta property="og:image" content="([^"]+)"/),
  };
}

// og:image URLs are absolute on the canonical host; fetch each from the host being checked.
async function ogStatus(url, host) {
  if (!url) return "none";
  const u = new URL(url);
  return (await fetch(host + u.pathname, { headers: UA })).status;
}

const sitemap = await (await fetch(`${A}/sitemap.xml`, { headers: UA })).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
let diffs = 0;
let brokenOg = 0;
for (const p of paths) {
  const [ra, rb] = await Promise.all([fetch(A + p, { headers: UA }), fetch(B + p, { headers: UA })]);
  const [fa, fb] = [facts(await ra.text()), facts(await rb.text())];
  const d = [];
  if (ra.status !== rb.status) d.push(`status ${ra.status} -> ${rb.status}`);
  for (const k of Object.keys(fa)) if (k !== "og" && fa[k] !== fb[k]) d.push(`${k}: ${JSON.stringify(fa[k])} -> ${JSON.stringify(fb[k])}`);
  const [oa, ob] = await Promise.all([ogStatus(fa.og, A), ogStatus(fb.og, B)]);
  if (ob !== 200) brokenOg++;
  process.stdout.write(`${p.padEnd(44)} ${rb.status} tagged=${fb.tagged} og A=${oa} B=${ob}${d.map((x) => `\n    DIFF ${x}`).join("")}\n`);
  diffs += d.length;
}
process.stdout.write(`\n${paths.length} sitemap URLs, ${diffs} differences, ${brokenOg} broken og:image on B\n`);
process.exitCode = diffs || brokenOg ? 1 : 0;
