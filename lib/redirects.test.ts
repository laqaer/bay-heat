import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { REDIRECTS } from "./redirects.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function pagePathFor(destination: string): string {
  const seg = destination === "/" ? "" : destination;
  return join(repoRoot, "app", "(site)", ...seg.split("/").filter(Boolean), "page.tsx");
}

test("every redirect destination has a real page", () => {
  for (const rule of REDIRECTS) {
    const file = pagePathFor(rule.destination);
    assert.ok(
      existsSync(file),
      `redirect ${rule.source} -> ${rule.destination} has no page at ${file}`,
    );
  }
});

test("no redirect source collides with a real route", () => {
  for (const rule of REDIRECTS) {
    const file = pagePathFor(rule.source);
    assert.ok(
      !existsSync(file),
      `redirect source ${rule.source} still has a live page at ${file} -- remove the old folder`,
    );
  }
});

test("no redirect points at itself or forms a cycle", () => {
  const bySource = new Map(REDIRECTS.map((r) => [r.source, r.destination]));
  for (const rule of REDIRECTS) {
    assert.notEqual(rule.source, rule.destination, `${rule.source} redirects to itself`);
    assert.ok(!bySource.has(rule.destination), `${rule.source} -> ${rule.destination} chains to another redirect`);
  }
});
