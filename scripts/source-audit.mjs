#!/usr/bin/env node
/**
 * Source audit: every product safety line a built page shows must be traceable on that page.
 *
 *   npm run build && node scripts/source-audit.mjs        # exits 1 and lists each gap
 *
 * A product's safetyLine quotes or paraphrases a manual (its sourceId, lib/facts/sources.ts). When a page prints
 * that line, the page's Sources list must carry the same source, or a reader can't check the claim (Codex review
 * on #27: the propane page attributed a line to the Hot Dawg manual but never listed the manual). Lines whose
 * sourceId has no record in SOURCES -- the generic product classes, which cite no one model's manual -- are skipped.
 * Reads the static export in out/; never touches the network.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ALL_PRODUCTS } from "../lib/commerce/products/index.ts";
import { SOURCES } from "../lib/facts/sources.ts";

const OUT = process.argv[2] ?? "out";

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const onPage = (html, text) => html.includes(text) || html.includes(escapeHtml(text));

function pages(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "_next" ? [] : pages(p);
    return p.endsWith(".html") ? [p] : [];
  });
}

const gaps = [];
for (const file of pages(OUT)) {
  const html = readFileSync(file, "utf8");
  for (const product of ALL_PRODUCTS) {
    const line = product.safetyLine;
    if (!line?.sourceId || !onPage(html, line.text)) continue;
    const source = SOURCES[line.sourceId];
    if (source && !onPage(html, source.title)) gaps.push(`${relative(OUT, file)}: shows ${product.id}'s safety line but not its source "${line.sourceId}"`);
  }
}

if (gaps.length > 0) {
  process.stderr.write(`source-audit: ${gaps.length} safety line(s) without their source on the page:\n${gaps.map((g) => `  ${g}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("source-audit: every product safety line on every page lists its source\n");
