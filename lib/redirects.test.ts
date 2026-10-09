import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

// Production stays on Vercel until bayheatguide.com's nameservers move to Cloudflare (docs/cloudflare-migration.md).
// A static export drops next.config redirects, so vercel.json carries them on Vercel in the meantime and
// scripts/cloudflare-routing.mjs writes them to out/_redirects for Cloudflare. Both must match lib/redirects.ts.
test("vercel.json carries every redirect while Vercel still serves production", () => {
  const vercel = JSON.parse(readFileSync(join(repoRoot, "vercel.json"), "utf8")) as {
    redirects: { source: string; destination: string; permanent: boolean }[];
  };
  for (const rule of REDIRECTS) {
    assert.ok(
      vercel.redirects.some((r) => r.source === rule.source && r.destination === rule.destination && r.permanent),
      `vercel.json is missing the permanent redirect ${rule.source} -> ${rule.destination}`,
    );
  }
});
