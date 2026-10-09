import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Nothing under /og/ (the prebuilt share cards) is disallowed: X's card crawler and other social scrapers
// respect robots.txt, and a blocked image path gets no link preview (feasibility red-team finding #8).
// Old /r/<code> share links are a 302 to the planner (out/_redirects), so they need no rule here.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
