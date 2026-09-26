# Cloudflare migration: BayHeat Guide

Status: **static-export compatibility only**. Production remains on Vercel.

## Why this app does not need a Worker runtime

The inspected App Router tree contains fixed pages, metadata routes, and a custom
not-found page. No API routes, dynamic routes, runtime `fetch()`, request
cookies/headers, or `next/image` usage were found in the compatibility audit.

The migration therefore uses Next.js' native `output: "export"` and deploys
the generated `out/` directory as Cloudflare Workers Static Assets. There is
no Worker `main` script, so ordinary traffic does not invoke Worker compute.

Cloudflare's SSG guidance recommends `not_found_handling: "404-page"` with
`html_handling: "auto-trailing-slash"`; the latter serves `foo.html` at
`/foo` and uses the nearest `404.html` for misses.

## Preview/build gate

The PR-only `.github/workflows/cloudflare-static-export.yml`:

1. installs locked dependencies;
2. runs lint and typecheck;
3. runs the real Next production build/static export;
4. asserts the expected HTML, robots, sitemap, and custom 404 outputs;
5. runs pinned Wrangler `deploy --dry-run`.

It has no Cloudflare credentials and cannot deploy.

The migration branch also disables Vercel Git deployment **only for the exact
branch `infra/cloudflare-static-export`**. Main-branch Vercel behavior is
unchanged while the migration is reviewed.

## Preview deployment

After the static-export gate passes, deploy the exact `out/` artifact to a
`workers.dev` preview and compare:

- homepage and every guide URL;
- canonical metadata, title/description, JSON-LD if present;
- `robots.txt` and `sitemap.xml`;
- custom 404 status/body;
- affiliate links/disclosures;
- internal links with both direct navigation and refresh;
- asset caching and browser console/network errors.

Do not attach the production domain during this phase.

## Production cutover

Before custom-domain attachment:

1. inventory the current production hostname and DNS;
2. record the last known-good Vercel production deployment;
3. attach the approved Cloudflare static deployment only after preview parity;
4. verify canonical URL/trailing-slash behavior to avoid SEO duplication;
5. leave the Vercel deployment available during stabilization.

No database, auth, payment, or background-job migration exists for this site.

## Rollback

Restore the recorded Vercel DNS/custom-domain routing. Because all BayHeat
content is build-time static, rollback does not require data reconciliation.
