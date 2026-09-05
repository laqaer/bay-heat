import type { MetadataRoute } from "next";
import { allPages, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(site.updated);

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...allPages.map((page) => ({
      url: `${site.url}${page.href}`,
      lastModified: new Date(page.updated),
      changeFrequency: "monthly" as const,
      priority: page.kind === "guide" ? 0.8 : 0.4,
    })),
  ];
}
