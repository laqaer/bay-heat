#!/usr/bin/env node
/**
 * Source audit: every product safety line a built page shows must be traceable on that page.
 *
 *   npm run build && node scripts/source-audit.mjs        # exits 1 and lists each gap
 *
 * A product's safetyLine quotes or paraphrases a manual (its sourceId, lib/facts/sources.ts). Pages render each
 * line inside an element tagged data-source="<sourceId>", and the page's Sources list must carry that source, or a
 * reader can't check the claim (Codex review on #27). Three kinds of gap fail the audit:
 * - a tagged line whose source is registered but missing from the page's Sources;
 * - a tagged line whose source isn't registered at all, unless it is one of the GENERIC_SOURCE_IDS below;
 * - a product's safety line on the page with no tag naming a source that carries that wording, so a new render
 *   site can't skip the tag. Several products share one wording (the flammables rule), so the tag, not the
 *   text, says which product's manual is being quoted.
 * Reads the static export in out/; never touches the network.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ALL_PRODUCTS } from "../lib/commerce/products/index.ts";
import { SOURCES } from "../lib/facts/sources.ts";

const OUT = process.argv[2] ?? "out";

// Generic product classes ("a 240 V 4 kW heater") cite the instruction every listed heater's manual carries, not
// one model's manual, so there is no single document to list.
export const GENERIC_SOURCE_IDS = new Set([
  "generic-electric-heater-manual",
  "generic-infrared-heater-manual",
  "generic-portable-heater-manual",
  "generic-thermostat-manual",
]);

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const onPage = (html, text) => html.includes(text) || html.includes(escapeHtml(text));

function pages(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "_next" ? [] : pages(p);
    return p.endsWith(".html") ? [p] : [];
  });
}

// The sources whose products carry each safety-line wording.
const sourcesByText = new Map();
for (const product of ALL_PRODUCTS) {
  const line = product.safetyLine;
  if (!line?.sourceId) continue;
  if (!sourcesByText.has(line.text)) sourcesByText.set(line.text, new Set());
  sourcesByText.get(line.text).add(line.sourceId);
}

const gaps = [];
for (const file of pages(OUT)) {
  const html = readFileSync(file, "utf8");
  const page = relative(OUT, file);
  const tagged = new Set([...html.matchAll(/data-source="([^"]+)"/g)].map((m) => m[1]));
  for (const id of tagged) {
    if (GENERIC_SOURCE_IDS.has(id)) continue;
    const source = SOURCES[id];
    if (!source) gaps.push(`${page}: a safety line cites "${id}", which has no record in lib/facts/sources.ts`);
    else if (!onPage(html, source.title)) gaps.push(`${page}: a safety line cites "${id}", but the page's Sources don't list it`);
  }
  // Longest wording first, blanked once matched: the CZ220's line starts with the shared flammables sentence, and
  // that prefix must not count as a second, untagged line.
  let rest = html;
  for (const [text, ids] of [...sourcesByText].sort((a, b) => b[0].length - a[0].length)) {
    if (!onPage(rest, text)) continue;
    rest = rest.split(text).join("").split(escapeHtml(text)).join("");
    if (![...ids].some((id) => tagged.has(id))) {
      gaps.push(`${page}: shows the safety line "${text.slice(0, 60)}…" without a data-source tag (one of ${[...ids].join(", ")})`);
    }
  }
}

if (gaps.length > 0) {
  process.stderr.write(`source-audit: ${gaps.length} gap(s):\n${gaps.map((g) => `  ${g}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("source-audit: every product safety line on every page is tagged and lists its source\n");
