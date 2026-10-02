import type { PageEntry } from "./types.ts";
import { PAGES as CORE } from "./core.ts";
import { PAGES as SAFETY } from "./safety.ts";
import { PAGES as LAB } from "./lab.ts";
import { PAGES as TRUST } from "./trust.ts";
import { PAGES as DATA } from "./data.ts";
import { PAGES as SEAL } from "./seal.ts";
import { PAGES as ELECTRIC } from "./electric.ts";
import { PAGES as FUEL } from "./fuel.ts";

// The site-wide page registry: every indexable (and non-indexable-but-registered) route, one lane file per
// content area. app/sitemap.ts, the header/footer nav, and the "related guides" modules all read this instead
// of hard-coding a route list, so a new page can't ship without a title/description/H1.
export const PAGES: PageEntry[] = [...CORE, ...SAFETY, ...LAB, ...TRUST, ...DATA, ...SEAL, ...ELECTRIC, ...FUEL];

export function findPage(href: string): PageEntry | undefined {
  return PAGES.find((p) => p.href === href);
}

export function pagesByNavGroup(group: PageEntry["nav"] extends infer N ? (N extends { group: infer G } ? G : never) : never) {
  return PAGES.filter((p) => p.nav?.group === group);
}

export function relatedPages(href: string, max = 4): PageEntry[] {
  const current = findPage(href);
  const pool = PAGES.filter((p) => p.href !== href && p.kind !== "legal" && p.kind !== "home");
  if (!current?.nav) return pool.slice(0, max);
  const sameGroup = pool.filter((p) => p.nav?.group === current.nav?.group);
  const rest = pool.filter((p) => p.nav?.group !== current.nav?.group);
  return [...sameGroup, ...rest].slice(0, max);
}

export const NAV_GROUPS: { group: "heaters" | "seal" | "safety" | "lab"; label: string }[] = [
  { group: "heaters", label: "Heaters" },
  { group: "seal", label: "Seal & insulate" },
  { group: "safety", label: "Can I Run It?" },
  { group: "lab", label: "The Lab" },
];
