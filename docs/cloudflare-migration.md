# Cloudflare migration: BayHeat Guide

Status: **free zone prepared, not authoritative yet**. Production still resolves through Vercel nameservers.

## Free-plan cutover prepared on 2026-09-26

`bayheatguide.com` is a pending zone on the Laqaer Products Cloudflare account, plan **Free Website**, price **$0**. Zone id `29285cb122d256e6cde1c85a265b82e9`. Nothing was subscribed, transferred, or proxied.

The zone is not live. Public nameservers are still `ns1.vercel-dns.com` and `ns2.vercel-dns.com`, and `https://bayheatguide.com` still answers from Vercel. The registrar is Name.com. This domain is not in the Cloudflare registrar, and a transfer would charge a registration term, so the registration stays at Name.com.

Publishing the zone is a nameserver change at Name.com, which Name.com does not charge for:

- `colin.ns.cloudflare.com`
- `zainab.ns.cloudflare.com`

Records already stored on the pending zone, all DNS-only:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| MX | `@` | `smtp.google.com` priority 1 |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT | `@` | existing `google-site-verification` value |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

The address and `www` records match `chartingstars.com`: Cloudflare DNS, origin still Vercel, grey-cloud. After the nameserver change, the site and the `www` redirect stay on the Vercel Hobby plan. The MX matches the other company domains. Google will not accept `hello@bayheatguide.com` until `bayheatguide.com` is a domain alias of `chartingstars.com` in that Workspace. Cloudflare Email Routing was not enabled: the API requires an active zone, and turning it on would replace the Google MX.

Do not upgrade this zone, subscribe to Workers Paid ($5/month minimum), enable Email Sending, or turn on Argo, Images, or SSL for SaaS. Static-asset requests on an assets-only Worker are free and unlimited, but this connection cannot mint a Workers deploy token, so the site files were not uploaded.

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
