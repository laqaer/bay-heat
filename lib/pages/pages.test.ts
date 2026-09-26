import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
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
  const skip = new Set(["/r"]); // /r/[code] is a deliberate non-indexed report permalink, not in the content registry

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
