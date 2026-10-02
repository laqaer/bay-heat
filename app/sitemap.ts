import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/pages";
import { SITE_URL } from "@/lib/site";

// Indexable routes only (BLUEPRINT.md §3.3): /r/[code], the CSV data routes and the OG image routes are
// excluded. This file is static by default (no request-time API used).
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.filter((p) => p.indexable).map((p) => ({
    url: `${SITE_URL}${p.href}`,
    lastModified: new Date(p.updated),
    changeFrequency: p.kind === "home" || p.kind === "tool" ? ("weekly" as const) : ("monthly" as const),
    priority: p.kind === "home" ? 1 : p.kind === "money" || p.kind === "tool" ? 0.8 : 0.5,
  }));
}
