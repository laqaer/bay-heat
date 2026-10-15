// Swap path: set ADSENSE_PUB_ID (e.g. "pub-1234567890123456") in the build env, or replace the fallback below.
// Unset -> comment-only placeholder, so /ads.txt serves 200 without declaring a seller we don't have.
const ADSENSE_PUB_ID = process.env.ADSENSE_PUB_ID ?? null;

export const dynamic = "force-static";

export async function GET() {
  const body = ADSENSE_PUB_ID
    ? `google.com, ${ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt for bayheatguide.com\n# No authorized digital sellers yet.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
