import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { PAGES } from "./index.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const siteDir = join(repoRoot, "app", "(site)");

function pagePathFor(href: string): string {
  const seg = href === "/" ? "" : href;
  return join(siteDir, ...seg.split("/").filter(Boolean), "page.tsx");
}

test("every registry href has a page.tsx", () => {
  for (const p of PAGES) {
    const file = pagePathFor(p.href);
    assert.ok(existsSync(file), `${p.id} ${p.href} has no page at ${file}`);
  }
});

test("no duplicate hrefs or ids in the registry", () => {
  const hrefs = PAGES.map((p) => p.href);
  const ids = PAGES.map((p) => p.id);
  assert.equal(new Set(hrefs).size, hrefs.length, "duplicate href in the page registry");
  assert.equal(new Set(ids).size, ids.length, "duplicate id in the page registry");
});

test("every page.tsx under app/(site) that isn't a system route is in the registry", () => {
  const registered = new Set<string>(PAGES.map((p) => p.href));
  const skip = new Set<string>();

  function walk(dir: string, urlPrefix: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // route groups "(x)" don't appear in the URL; dynamic segments "[x]" are system routes, skipped
        const isGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
        const isDynamic = entry.name.startsWith("[");
        const nextPrefix = isGroup ? urlPrefix : `${urlPrefix}/${entry.name}`;
        if (isDynamic) {
          skip.add(nextPrefix || "/");
          continue;
        }
        walk(join(dir, entry.name), nextPrefix);
      } else if (entry.name === "page.tsx") {
        const href = urlPrefix || "/";
        if (skip.has(href)) continue;
        assert.ok(registered.has(href), `${href} has a page.tsx but no lib/pages registry entry`);
      }
    }
  }

  walk(siteDir, "");
});

// The methodology title quotes the worked example's sized load. It is a hand-written string, so pin it to the
// engine: a physics or constant change that moves the number fails here instead of shipping a stale title.
test("the methodology title quotes the worked example's computed load", async () => {
  const { heatLossDesign } = await import("../planner/heatLoss.ts");
  const { resolveEnvelope } = await import("../planner/defaults.ts");
  const { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } = await import("../planner/fixtures.ts");
  const r = heatLossDesign(EXAMPLE_A_INPUT, resolveEnvelope(EXAMPLE_A_INPUT), EXAMPLE_A_STATION.h99, EXAMPLE_A_STATION.elevFt);
  const shown = (Math.round(r.qSize / 100) * 100).toLocaleString("en-US");
  const entry = PAGES.find((p) => p.href === "/garage-heater-calculator/methodology")!;
  assert.ok(entry.title.includes(`${shown} BTU/h`), `methodology title should quote ${shown} BTU/h: "${entry.title}"`);
});

// The footer's "Last correction" date (lib/site.ts LAST_CORRECTION) must be the newest dated line in the Lab notebook.
test("the footer's last-correction date matches the newest notebook entry", () => {
  const site = readFileSync(join(repoRoot, "lib", "site.ts"), "utf8");
  const notebook = readFileSync(join(siteDir, "lab", "notebook", "page.tsx"), "utf8");
  const stamp = /LAST_CORRECTION = "(\d{4}-\d{2}-\d{2})"/.exec(site)?.[1];
  const dates = [...notebook.matchAll(/whitespace-nowrap">(\d{4}-\d{2}-\d{2})</g)].map((m) => m[1]).sort();
  assert.ok(stamp, "LAST_CORRECTION not found in lib/site.ts");
  assert.equal(stamp, dates[dates.length - 1]);
});
