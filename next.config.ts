import type { NextConfig } from "next";

// Static export (out/), served by Cloudflare Workers static assets (wrangler.jsonc). Redirects and response
// headers can't live here in an export: scripts/cloudflare-routing.mjs writes them to out/_redirects and
// out/_headers after the build, from lib/redirects.ts and the header list in that script.
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  typedRoutes: true,
};

export default nextConfig;
