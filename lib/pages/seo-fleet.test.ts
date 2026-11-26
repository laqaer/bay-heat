import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { findPage } from "./index.ts";
import { documentTitle } from "../site.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const TITLE_PAGES: { href: string; query: RegExp }[] = [
  { href: "/", query: /BayHeat/ },
  { href: "/240v-garage-heater", query: /240V garage heater/i },
  { href: "/best-wall-mount-garage-heaters", query: /wall-mount garage heater/i },
  { href: "/can-i-run-it", query: /can I run/i },
  { href: "/diesel-heater-for-garage", query: /diesel heater for a garage/i },
  { href: "/garage-heater-size", query: /garage heater size|what size heater/i },
  { href: "/lab/notebook", query: /lab notebook/i },
  { href: "/natural-gas-garage-heater", query: /natural gas garage heater/i },
];

const JSONLD_PAGES = [
  "/240v-garage-heater",
  "/best-wall-mount-garage-heaters",
  "/can-i-run-it",
  "/diesel-heater-for-garage",
  "/garage-heater-size",
  "/how-to-insulate-a-garage",
  "/lab/notebook",
  "/natural-gas-garage-heater",
];

function renderedTitle(href: string): string {
  const entry = findPage(href);
  assert.ok(entry, href);
  return documentTitle(entry.href, entry.title);
}

function pageFile(href: string): string {
  const seg = href === "/" ? "" : href;
  return join(repoRoot, "app", "(site)", ...seg.split("/").filter(Boolean), "page.tsx");
}

test("fleet title pages render a 30 to 65 character title and keep the query", () => {
  const problems: string[] = [];
  for (const page of TITLE_PAGES) {
    const title = renderedTitle(page.href);
    if (title.length < 30 || title.length > 65) {
      problems.push(`${page.href} rendered title is ${title.length} characters: ${JSON.stringify(title)}`);
    }
    if (!page.query.test(title)) problems.push(`${page.href} title dropped its query: ${JSON.stringify(title)}`);
  }
  assert.deepEqual(problems, []);
});

test("homepage meta description is 70 to 160 characters", () => {
  const entry = findPage("/")!;
  const description = entry.description;
  assert.ok(
    description.length >= 70 && description.length <= 160,
    `homepage description is ${description.length} characters: ${JSON.stringify(description)}`,
  );
});

test("fleet pages render Article or WebPage JSON-LD", () => {
  const missing = JSONLD_PAGES.filter((href) => {
    const src = readFileSync(pageFile(href), "utf8");
    return !/articleJsonLd\(|articleForPage\(|"@type": "Article"|"@type": "WebPage"/.test(src);
  });
  assert.deepEqual(missing, []);
});
