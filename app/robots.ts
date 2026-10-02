import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /r/[code] is intentionally NOT disallowed here (feasibility red-team finding #8): X's card crawler and
// other social scrapers respect robots.txt, and a blocked path gets no link-preview image. /r/ pages carry
// their own `robots: {index:false, follow:true}` in generateMetadata instead, which keeps them out of the
// index without breaking their share cards.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
