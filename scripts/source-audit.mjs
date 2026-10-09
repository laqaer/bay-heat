#!/usr/bin/env node
/**
 * Source audit: every product safety line a built page shows must be traceable on that page.
 *
 *   npm run build && node scripts/source-audit.mjs        # exits 1 and lists each gap
 *
 * A product's safetyLine quotes or paraphrases a manual (its sourceId; the registry is lib/facts). Pages render each
 * line inside an element tagged data-source="<sourceId>", and the line must be traceable: either the element links
 * its own source (components/evidence/SourceLink, used by QuickPick and the calculator report, which also render in
 * client-only views this static scan can't reach) or the page's Sources list carries it (Codex review on #27).
 * Gaps that fail the audit:
 * - a tagged line whose source is registered but neither linked in the element nor listed in the page's Sources;
 * - a tagged line whose source isn't registered at all, unless it is one of the GENERIC_SOURCE_IDS below;
 * - any occurrence of a product's safety line outside a tagged element, so a new render site can't skip the tag.
 *   Each occurrence is checked: tagged elements are cut out of the page first, and whatever product wording is
 *   left is untagged. Several products share one wording (the flammables rule), so the tag, not the text, says
 *   which product's manual is being quoted.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ALL_PRODUCTS, GENERIC_SOURCE_IDS } from "../lib/commerce/products/index.ts";
import { getSource } from "../lib/facts/index.ts";

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

const TEXTS = [...new Set(ALL_PRODUCTS.flatMap((p) => (p.safetyLine?.sourceId ? [p.safetyLine.text] : [])))].sort((a, b) => b.length - a.length);
// One tagged element: <p|span|td ... data-source="id" ...>...</p|span|td>. Safety lines hold only text and links.
const TAGGED = /<(p|span|td)\b([^>]*?)\sdata-source="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g;

const gaps = [];
for (const file of pages(OUT)) {
  const page = relative(OUT, file);
  // The flight data in <script> repeats every string on the page; only rendered markup counts.
  const html = readFileSync(file, "utf8").replace(/<script\b[\s\S]*?<\/script>/g, "");
  for (const [, , , id, , inner] of html.matchAll(TAGGED)) {
    if (GENERIC_SOURCE_IDS.has(id)) continue;
    const source = getSource(id);
    if (!source) gaps.push(`${page}: a safety line cites "${id}", which has no record in lib/facts`);
    else if (!inner.includes(`data-source-link="${id}"`) && !onPage(html, source.title)) {
      gaps.push(`${page}: a safety line cites "${id}", but neither links it nor finds it in the page's Sources`);
    }
  }
  let rest = html.replace(TAGGED, "");
  for (const text of TEXTS) {
    if (!onPage(rest, text)) continue;
    rest = rest.split(text).join("").split(escapeHtml(text)).join("");
    gaps.push(`${page}: shows the safety line "${text.slice(0, 60)}…" outside a data-source tag`);
  }
}
if (gaps.length > 0) {
  process.stderr.write(`source-audit: ${gaps.length} gap(s):\n${gaps.map((g) => `  ${g}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("source-audit: every product safety line on every page is tagged and lists its source\n");
