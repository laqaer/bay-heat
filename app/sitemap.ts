import type { MetadataRoute } from "next";
import { PAGES, isIndexed } from "@/lib/pages";
import { SITE_URL } from "@/lib/site";

// Indexed routes only (BLUEPRINT.md §3.3; isIndexed also leaves out pages awaiting editor review): the CSV data routes and the OG image routes are excluded.
// force-static: the site is a static export, so this is written to out/sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.filter(isIndexed).map((p) => ({
    url: `${SITE_URL}${p.href}`,
    lastModified: new Date(p.updated),
    changeFrequency: p.kind === "home" || p.kind === "tool" ? ("weekly" as const) : ("monthly" as const),
    priority: p.kind === "home" ? 1 : p.kind === "money" || p.kind === "tool" ? 0.8 : 0.5,
  }));
}
