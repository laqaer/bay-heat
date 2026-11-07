#!/usr/bin/env node
/**
 * Negative control for the affiliate-rule check. It drives the real CLI the way CI does and reads only its exit
 * code and output. It does not import the check.
 *
 *   npm run build && npm run check:affiliates:control
 *
 * It copies the built page with the most buy plates from out/ into a temporary directory. A buy plate is an element
 * with the data-buy-group attribute. It changes the copy and runs `node scripts/link-audit.mjs --check --dir <copy>`
 * for each case below. Cases that expect exit 1 must also name dollar-in-buy-group in the output.
 * Exit 0 when every case gives the expected result. Exit 1 and print the CLI output for each case that does not.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = "out";
const CLI = fileURLToPath(new URL("./link-audit.mjs", import.meta.url));
// A start tag that carries data-buy-group. Quoted attribute values may hold ">".
const PLATE = /<[a-zA-Z][\w-]*(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*?\s+data-buy-group(?=[\s=/>])(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/g;
const LINK = '<a href="https://www.amazon.com/dp/B000000000?tag=laqaer-20" rel="sponsored nofollow noopener">Check price on Amazon</a>';

// The built page with the most buy plates. Plain string checks only. A wrong pick cannot pass: the cases that
// expect exit 1 then exit 0, and the control fails.
function sourcePage() {
  let names;
  try {
    names = readdirSync(OUT).filter((n) => n.endsWith(".html")).sort();
  } catch {
    throw new Error(`${OUT}/ not found; run npm run build first`);
  }
  let best = null;
  for (const name of names) {
    const html = readFileSync(join(OUT, name), "utf8");
    const plates = [...html.matchAll(PLATE)];
    if (plates.length > (best?.plates.length ?? 1)) best = { name, html, plates };
  }
  if (!best) throw new Error(`no page in ${OUT}/ has two or more buy plates; the control has nothing to change`);
  return best;
}

const { name, html, plates } = sourcePage();
const first = plates[0];
const last = plates[plates.length - 1];
const at = (m) => m.index + m[0].length; // just inside the buy plate's start tag
const insert = (pos, text) => html.slice(0, pos) + text + html.slice(pos);

const cases = [
  { id: "unchanged copy", html, expect: 0 },
  { id: "$129 in the first buy plate", html: insert(at(first), "<span>$129</span>"), expect: 1 },
  { id: "React-split $<!-- -->129", html: insert(at(first), "<p>$<!-- -->129</p>"), expect: 1 },
  { id: "entity &#36;129", html: insert(at(first), "<p>&#36;129</p>"), expect: 1 },
  {
    id: "$ before the site's number chip (span, button, span)",
    html: insert(at(first), '<p>Runs about $<span class="not-prose group"><button type="button"><span class="font-mono">129</span></button></span>/yr</p>'),
    expect: 1,
  },
  { id: `$129 in the last buy plate (${plates.length} on the page)`, html: insert(at(last), "<p>$129</p>"), expect: 1 },
  {
    id: "$129 in an outer buy plate whose nested buy plate holds the link",
    html: insert(at(first), `<div data-buy-group="true"><p>Our pick: $129</p><div data-buy-group="true">${LINK}</div></div>`),
    expect: 1,
  },
  { id: "$129 just before the first buy plate", html: insert(first.index, "<p>$129</p>"), expect: 0 },
  { id: "price class $$ followed by a number", html: insert(at(first), "<p>Price class: $$<!-- --> 240 V</p>"), expect: 0 },
];

const root = mkdtempSync(join(tmpdir(), "bayheat-affiliate-control-"));
const failures = [];
try {
  cases.forEach((c, i) => {
    const dir = join(root, `case-${i}`);
    mkdirSync(dir);
    writeFileSync(join(dir, name), c.html);
    const run = spawnSync(process.execPath, [CLI, "--check", "--dir", dir], { encoding: "utf8" });
    const output = `${run.stdout}${run.stderr}`;
    const named = c.expect === 0 || output.includes("dollar-in-buy-group");
    const ok = run.status === c.expect && named;
    process.stdout.write(`${ok ? "ok" : "FAIL"} ${c.id}: exit ${run.status}, expected ${c.expect}${c.expect ? " with dollar-in-buy-group" : ""}\n`);
    if (!ok) failures.push(`--- ${c.id}\n${output}`);
  });
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length > 0) {
  process.stderr.write(`\ncheck-affiliates control: FAIL on ${OUT}/${name}\n${failures.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`check-affiliates control: pass, ${cases.length} cases on a copy of ${OUT}/${name}\n`);
