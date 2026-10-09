# Cloudflare migration: BayHeat

Status on 2026-10-09: **the site runs on Cloudflare at <https://bay-heat.laqaer-products.workers.dev>. `bayheatguide.com` still answers from Vercel.** The domain moves when the owner changes the nameservers at Name.com (step 2 below). Until then both hosts serve the same build from `main`.

## How the site is built now

The app is a Next.js static export (`output: "export"` in `next.config.ts`). It deploys as an assets-only Worker (`wrangler.jsonc`, `assets.directory: ./out`). No Worker script runs for page traffic. Static-asset requests are free and unlimited on the Workers Free plan, and the size and CPU limits for Worker code do not apply.

Converting to a static export changed four things:

| Before (Vercel, server routes) | Now (static) |
| --- | --- |
| `/r/<code>` report permalink rendered on the server, with its own OG image | `out/_redirects` sends `/r/<code>` (302) to `/garage-heater-calculator?g=<code>`, which shows the same report. |
| The calculator read `?g=` / `?zip=` on the server | `components/capture/PlannerApp.tsx` reads them in the browser with `useSyncExternalStore`. The prerendered HTML is the wizard. |
| `redirects()` / `headers()` in `next.config.ts` | `scripts/cloudflare-routing.mjs` writes `out/_redirects` and `out/_headers` after `next build` (`npm run build` runs both). It adds 308s for trailing slashes to match Vercel. |
| `og:image` on every non-home page pointed at `/<page>/opengraph-image`, which returned **404** | `app/og/[...slug]/route.tsx` prebuilds one 1200x630 card per registered page at `/og/<path>.png` (the H1 plus the one-line answer from the SEO title), and `lib/seo.ts` points `og:image` there. |

`vercel.json` carries the same redirects and headers so Vercel keeps them until the cutover (`lib/redirects.test.ts` checks it). Delete it after step 5.

## Parity check (2026-10-09, before merge)

`node scripts/host-parity.mjs` compared `https://bayheatguide.com` (Vercel) with the workers.dev deploy:

- 27 of 27 sitemap URLs match: status 200, title, canonical, description, robots meta, H1, JSON-LD count, and `tag=laqaer-20` link count. Visible text is identical on `/`, `/electric-garage-heater`, `/garage-heater-calculator`, `/can-i-run-it`, and `/privacy`.
- `sitemap.xml`, `robots.txt`, and `data/garage-heat-index.csv` are byte-identical. `llms.txt`, `constants.csv`, the IndexNow key, `apple-icon`, and `opengraph-image` all return 200 with the right content type.
- The 10 legacy URLs return 308 to the same destinations, with or without a trailing slash. A missing URL gets the custom 404 page with status 404. Security headers match: `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. `/_next/static/*` is cached for a year as immutable.
- `og:image` returns 200 for 27 of 27 pages on Cloudflare. On Vercel it returns 200 only for the home page and 404 for the other 26.
- In the browser (Playwright, against `wrangler dev`) these all work with no console errors: `?g=` with a literal `+` or `%2B`, `/r/<code>`, a bad code (falls back to the wizard), `?zip=941`, the home-page ZIP field, and "Start over".

## Deploys

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, and can be run by hand. It needs two repository secrets, which this agent cannot set: the GitHub proxy blocks the Actions secrets API.

- `CLOUDFLARE_API_TOKEN`: a token with **Workers Scripts: Edit** on the Laqaer Products account.
- `CLOUDFLARE_ACCOUNT_ID`: `de80edcd32893f7153e5b793ad8317f9`.

Without them the job builds, then skips the upload with a warning. To deploy by hand: `npm run build && CLOUDFLARE_ACCOUNT_ID=de80edcd32893f7153e5b793ad8317f9 npx wrangler@4.135.0 deploy`. CI (`ci.yml`) checks that the export, `_redirects`, `_headers`, and the share cards exist, and runs `wrangler deploy --dry-run`.

## Cutover runbook

Zone: `bayheatguide.com`, id `29285cb122d256e6cde1c85a265b82e9`, plan **Free Website**, status **pending**. Registrar: Name.com. The registration stays at Name.com, because a transfer would charge a term.

1. **Owner: add the two GitHub secrets** above (Settings → Secrets and variables → Actions). After the next merge to `main`, confirm the "Deploy to Cloudflare" run uploaded.
2. **Owner: change the nameservers at Name.com** to `colin.ns.cloudflare.com` and `zainab.ns.cloudflare.com`. This is free and needs no downtime. The pending zone already holds `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`, both DNS-only, so the site keeps answering from Vercel while the change propagates. It also holds the Google MX, SPF, DMARC, and `google-site-verification` TXT records. Cloudflare marks the zone **active** once it sees the change, usually within a few hours.
3. **Point the domain at the Worker**, once the zone is active. This needs DNS edit on the zone. The agent's current token can read Workers custom domains but not zone DNS, so either the owner does it in the dashboard or a token with **Zone → DNS: Edit** does it:
   - Delete `A @ 76.76.21.21` and `CNAME www`. A Workers custom domain refuses a hostname that already has a record.
   - Add `"routes": [{ "pattern": "bayheatguide.com", "custom_domain": true }]` to `wrangler.jsonc`, and run the deploy workflow. Or use the dashboard: Workers & Pages → `bay-heat` → Settings → Domains & Routes → Add custom domain `bayheatguide.com`.
   - Deploy the www redirect: `npx wrangler@4.135.0 deploy -c workers/www-redirect/wrangler.jsonc`. That is a 301 to the apex, keeping path and query, the same pattern as `antemass.com` on this account.
   - The gap between deleting the records and the custom domain answering is usually under a minute. Do it at a low-traffic hour.
4. **Verify**, then put the results in `docs/operations/LEDGER.md`:
   - `curl -sI https://bayheatguide.com/` returns 200 and does not carry `server: Vercel`.
   - `curl -sI https://www.bayheatguide.com/about` returns 301 to `https://bayheatguide.com/about`.
   - `curl -sI https://bayheatguide.com/about/` returns 308 to `/about`.
   - `curl -sI https://bayheatguide.com/best-infrared-garage-heaters` returns 308.
   - `curl -sI https://bayheatguide.com/og/lab.png` returns 200 `image/png`.
   - Run `node scripts/host-parity.mjs https://bayheatguide.com https://bay-heat.laqaer-products.workers.dev`. Both hosts are then Cloudflare, so it checks that the apex serves the current build.
5. **Retire Vercel** after a week with no issues:
   - Remove `bayheatguide.com` from the Vercel project. Turn off its Git deploys, or delete the project.
   - Delete `vercel.json`.
   - Set `"workers_dev": false` in `wrangler.jsonc`, so the workers.dev copy stops being a second host for the same pages. Canonicals already point at the apex.
6. **Search:** the domain and URLs do not change, so Search Console needs nothing beyond a sitemap resubmit. Run `npm run indexnow` once, so Bing and Yandex recrawl and pick up the new share images.

**Rollback.** Before step 5, put `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com` back, after removing the custom domains. Vercel still has the last production deployment. There is no database, so nothing needs reconciling.

## Cost guardrails

$0. Static assets and the www redirect Worker (100,000 requests/day free) stay on the Free plan. Do not upgrade the zone, subscribe to Workers Paid ($5/month minimum), enable Email Sending, or turn on Argo, Images, or SSL for SaaS. Cloudflare Email Routing would replace the Google MX, so it stays off.
