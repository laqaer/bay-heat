import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Required for Next.js static export: metadata route is build-time only.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.domain,
  };
}
