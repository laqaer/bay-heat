#!/usr/bin/env node
/**
 * Negative control for the affiliate-rule check. It drives the real CLI the way CI does and reads only its exit
 * code and output. It does not import the check.
 *
 *   npm run build && npm run check:affiliates:control
 *
 * It copies one built page with a buy plate from out/ into a temporary directory, changes the copy, and runs
 * `node scripts/link-audit.mjs --check --dir <copy>` for each case:
 * - the unchanged copy must pass, so a failure below comes from the change and not from the copy;
 * - a dollar figure inside the plate must fail, written three ways ($129, React's "$<!-- -->129", &#36;129);
 * - the same figure just before the plate must pass, because the rule covers the plate only.
 * Exit 0 when every case gives the expected result. Exit 1 and print the CLI output for each case that does not.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = "out";
const CLI = fileURLToPath(new URL("./link-audit.mjs", import.meta.url));
const PLATE = /<[a-zA-Z][\w-]*\b[^>]*?\sdata-buy-group(?=[\s=/>])[^>]*>/;

// The first built page with an Amazon link soon after its first plate opens. Plain string checks only. A wrong pick
// cannot pass: the "inside the plate" cases then exit 0 and the control fails.
function sourcePage() {
  let names;
  try {
    names = readdirSync(OUT).filter((n) => n.endsWith(".html")).sort();
  } catch {
    throw new Error(`${OUT}/ not found; run npm run build first`);
  }
  for (const name of names) {
    const html = readFileSync(join(OUT, name), "utf8");
    const plate = PLATE.exec(html);
    if (!plate) continue;
    if (html.slice(plate.index, plate.index + 6000).includes('href="https://www.amazon.com/')) return { name, html, plate };
  }
  throw new Error(`no page in ${OUT}/ has a buy plate with an Amazon link; the control has nothing to change`);
}

const { name, html, plate } = sourcePage();
const inside = plate.index + plate[0].length;
const cases = [
  { id: "unchanged copy", html, expect: 0 },
  { id: "plain $129 inside the plate", html: html.slice(0, inside) + "<span>$129</span>" + html.slice(inside), expect: 1 },
  { id: "React-split $<!-- -->129 inside the plate", html: html.slice(0, inside) + "<p>$<!-- -->129</p>" + html.slice(inside), expect: 1 },
  { id: "entity &#36;129 inside the plate", html: html.slice(0, inside) + "<p>&#36;129</p>" + html.slice(inside), expect: 1 },
  { id: "$129 just before the plate", html: html.slice(0, plate.index) + "<p>$129</p>" + html.slice(plate.index), expect: 0 },
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
