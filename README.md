# BayHeat Guide

Boring comparison site for electric garage and workshop heaters: 120V vs 240V, hardwired vs plug-in, forced-air vs infrared, portable vs ceiling-mount, wall vs ceiling, seal-first vs more watts, operating cost (watts × hours × your rate), and electric vs propane.

**Brand:** BayHeat Guide  
**Domain:** [bayheatguide.com](https://bayheatguide.com) (served by Vercel until the nameserver cutover; the same build runs on Cloudflare at [bay-heat.laqaer-products.workers.dev](https://bay-heat.laqaer-products.workers.dev). See `docs/cloudflare-migration.md`)  
**Contact:** [hello@bayheatguide.com](mailto:hello@bayheatguide.com)  
**Publisher:** Laqaer Products

## Mogul factory

This repo is **Mogul factory Site #1** — the first Laqaer Products comparison property in the Mogul factory line.

Mogul is the factory that ships small, useful buying-guide sites (circuit-honest, no doorway spam, no invented review scores). BayHeat Guide is the garage-heat vertical. Do not mix other Laqaer consumer brands into this codebase.

## Stack

- Next.js App Router (16) + TypeScript
- Tailwind CSS v4
- Static editorial pages. Live JSON-LD is `WebSite` and `Organization` on every page, plus `BreadcrumbList` on report pages. `FAQPage` is implemented for `/infrared-garage-heater` only and is not deployed. See [FAQPage status](#faqpage-status-bh-geo-001).
- Static export (`npm run build` writes `out/`, plus `out/_redirects` and `out/_headers`), served as an assets-only Cloudflare Worker (`wrangler.jsonc`); no env vars required

## Local setup

Requires Node.js 20+ (22 is fine).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Checks

CI (`.github/workflows/ci.yml`) runs these checks on every pull request to `main`. After `npm run build`, run them from the repo root. Each check reads the exported site in `out/`.

Terms:
- A **buy plate** is an element with the `data-buy-group` attribute. It holds a product and its buy button.
- The **inline disclosure** is the "Paid links: we earn a commission…" text above the first paid link.
- The **Amazon Associates line** is the sentence "As an Amazon Associate, BayHeat earns from qualifying purchases." in the page footer. The inline disclosure repeats it.

| Command | What it proves |
| --- | --- |
| `npm run check:affiliates` | No page in `out/` breaks an affiliate rule. A buy plate with an Amazon link shows no dollar figure, such as `$129`. The check allows a price class of two to four signs (`$$` to `$$$$`). A one-sign class (`$`) followed by a number on the same line reads as a price, so it fails. Each Amazon link has the tag and `rel="sponsored nofollow"`. A short link (`amzn.to`, `a.co`) without a `tag=` parameter fails. The inline disclosure comes before the first Amazon link. A directly linked product shows its manual warning near its button. |
| `npm run check:affiliates:control` | The affiliate check fails when it must. The control copies the built page with the most buy plates and makes ten copies. Six copies get a dollar figure inside a buy plate. The six forms are plain, React-split (`$<!-- -->129`), an entity, the number chip, the last buy plate and a nested buy plate. Four copies must pass: the unchanged copy, `$129` before a buy plate, and two price-class cases. The control runs the same CLI on all ten copies. |
| `npm run qa` | E2E. The smoke serves `out/` with the pinned `wrangler dev`. It requests every sitemap URL over HTTP. Each page must return 200, its canonical URL, a title, an `h1`, and the Amazon Associates line in its footer. The smoke also checks `robots.txt`, two 308 redirects and the 404 page. |
| `node scripts/source-audit.mjs` | Each product safety line on a page links or lists its manual. |

`npm run check` runs type generation, typecheck, lint, unit tests and the build. Then it runs the three `npm` checks above.

To check a running server instead of `out/`, give its origin: `node scripts/smoke.mjs --base https://bayheatguide.com`. The smoke then requests only that host. It never requests `amazon.com`.

Limits:
- The affiliate check reads static HTML only. A state that the browser renders later, such as a planner result, is not in `out/`. The check does not see it.
- CI runs on pull requests to `main` only. A direct push to `main` skips these checks.
- `npm run indexnow` is not a check. It sends URLs to the IndexNow API. After a production content change, run it once (see IndexNow below).

## Deploy on Cloudflare

1. `npm run build` runs `next build` (static export to `out/`) and then `scripts/cloudflare-routing.mjs`, which writes `out/_redirects` (from `lib/redirects.ts`) and `out/_headers`.
2. Every push to `main` deploys through `.github/workflows/deploy.yml`. It needs the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. To deploy by hand: `CLOUDFLARE_ACCOUNT_ID=... npx wrangler@4.135.0 deploy`.
3. To preview locally: `npm run build && npx wrangler@4.135.0 dev`. That serves `out/` with the same redirects and headers as production.
4. `bayheatguide.com` moves from Vercel when the Name.com nameservers change. Until then `vercel.json` keeps the redirects and headers on Vercel. The steps are in `docs/cloudflare-migration.md`.
5. Before you serve ads, set `ADSENSE_PUB_ID` in the build environment. `app/ads.txt/route.ts` then writes the seller line.

## IndexNow

The public key file is `public/96098d06c16790aabec2db1a232fee8f.txt`. Production serves it at [https://bayheatguide.com/96098d06c16790aabec2db1a232fee8f.txt](https://bayheatguide.com/96098d06c16790aabec2db1a232fee8f.txt). The file body is the key. IndexNow keys are public; search engines fetch that URL to verify the host.

`npm run build` does not ping IndexNow. The key URL has to return the key on `bayheatguide.com` before a submit is accepted.

After this file is on production:

```bash
npm run indexnow
```

That POSTs the homepage, the circuit and heat-type guides that now link to retailer listings, and the affiliate guides (wall-mount, ceiling-mount, 15 A portable, by-size, and wall vs ceiling) to `https://api.indexnow.org/indexnow`. Participating engines share that submission. `npm run indexnow -- --dry-run` prints the JSON and does not send it. Add a path in `scripts/indexnow.mjs` when a new affiliate guide ships.

## Routes

`app/(site)` has 31 page routes. `lib/pages/index.ts` registers each one. The build exports all 31. The sitemap lists the 30 indexable pages. It leaves out `/garage-heater-thermostat` until that page's review is done.

| Path | Page | Sitemap |
| --- | --- | --- |
| `/` | Home: the garage climate lab and the decision paths | yes |
| `/garage-heater-calculator` | Calculator: BTU/h, breaker and cost per hour | yes |
| `/garage-heater-calculator/methodology` | Every formula and constant the planner uses | yes |
| `/can-i-run-it` | Can I run this heater in my garage? A verdict with the code section | yes |
| `/shop-heater` | Shop heater: 240 V electric or vented gas | yes |
| `/best-garage-heater` | Best garage heater: size first, then match circuit or fuel | yes |
| `/garage-heaters` | Garage heaters by fuel, at your prices | yes |
| `/electric-garage-heater` | Electric heaters from 1.5 kW to 10 kW, and the circuit each needs | yes |
| `/240v-garage-heater` | 240 V heaters: breaker and wire size | yes |
| `/portable-garage-heater` | Portable 1,500 W heaters on a 15 A circuit | yes |
| `/ceiling-mount-garage-heater` | Ceiling-mount heaters: circuit, height and clearances | yes |
| `/best-wall-mount-garage-heaters` | Wall-mount heaters and their manual clearances | yes |
| `/infrared-garage-heater` | Infrared vs forced air | yes |
| `/diesel-heater-for-garage` | Diesel heater: cost per hour and the exhaust rule | yes |
| `/propane-heater-for-garage` | Propane heaters: vented vs Buddy-type, and the CO alarm | yes |
| `/natural-gas-garage-heater` | Natural gas unit heater: venting, height, licensed fitter | yes |
| `/electric-vs-propane-garage-heater` | Cost per million BTU delivered, by fuel and state | yes |
| `/heat-pump-mini-split-for-garage` | Mini-split heat pump vs a resistance heater over 5 years | yes |
| `/garage-heater-thermostat` | Thermostats (review in progress, `noindex`) | no |
| `/garage-heater-size` | Heater size for a 1-, 2- or 3-car garage | yes |
| `/cost-to-heat-a-garage` | Winter cost to keep a 2-car garage at 50 °F, by state | yes |
| `/how-to-insulate-a-garage` | Insulation in payback order | yes |
| `/garage-door-insulation-kit` | Door insulation kits: when they help | yes |
| `/garage-door-weather-stripping` | Door weather stripping | yes |
| `/garage-door-bottom-seal` | Door bottom seals: match the retainer | yes |
| `/lab` | The BayHeat Lab | yes |
| `/lab/reports/bh-001-the-4x-problem` | Lab report BH-001 | yes |
| `/lab/notebook` | Model releases, price refreshes and corrections | yes |
| `/how-we-work` | Pledges, how we make money, who checks each page | yes |
| `/about` | About BayHeat | yes |
| `/privacy` | Privacy policy | yes |

Generated files and other URLs:

| Path | Source |
| --- | --- |
| `/sitemap.xml` | `app/sitemap.ts` |
| `/robots.txt` | `app/robots.ts` |
| `/ads.txt` | `app/ads.txt/route.ts`; a placeholder until `ADSENSE_PUB_ID` is set |
| `/llms.txt` | `app/llms.txt/route.ts` |
| `/data/constants.csv`, `/data/garage-heat-index.csv` | `app/data/*/route.ts` |
| `/opengraph-image`, `/apple-icon`, `/icon.svg` | `app/opengraph-image.tsx`, `app/apple-icon.tsx`, `app/icon.svg` |
| `/og/<page>.png` | `app/og/[...slug]/route.tsx`; one share card for each page except `/` (30 files) |
| `/404` page | `app/not-found.tsx` (`noindex`) |
| `/96098d06c16790aabec2db1a232fee8f.txt` | `public/`; the IndexNow key file |
| `/drawings/*.svg` | `public/drawings/` (4 files) |
| `/r/<code>` | Goes to `/garage-heater-calculator?g=<code>`: 302 on Cloudflare (`out/_redirects`), 307 on Vercel (`vercel.json`, `permanent: false`) |

The 16 old URLs in `lib/redirects.ts` answer 308 to their new pages. For example, `/120v-vs-240v-garage-heater` goes to `/240v-garage-heater`. `vercel.json` repeats these 16 rules for Vercel. `scripts/cloudflare-routing.mjs` writes them to `out/_redirects` for Cloudflare.

A path with a trailing slash answers 308 to the path without it. On Cloudflare, rules in `out/_redirects` do this. Vercel answers the same 308 with no rule in `vercel.json` (observed on 2026-11-07).

The footer on every page carries the Amazon Associates line. `npm run qa` checks the footer of every sitemap page.

## FAQPage status (BH-GEO-001)

[PR #43](https://github.com/laqaer/bay-heat/pull/43) adds a visible Questions section and matching `FAQPage` JSON-LD on `/infrared-garage-heater` only. The other four money URLs stay as they are on `main` until a real electrical reviewer exists. The work id is BH-GEO-001. There is no separate GitHub issue. Cost is $0. Parked work ends 2026-11-28.

- **Implemented.** The questions live in `app/(site)/infrared-garage-heater/page.tsx` on the head of PR #43. There is no shared FAQ helper.
- **Locally verified, 2026-10-29.** `verify-bay-heat` on `http://127.0.0.1:4317` followed `Infrared` from the home page. `/infrared-garage-heater` returned HTTP 200, showed Questions, included `FAQPage`, and the visible text matched the JSON-LD. It had eight `laqaer-20` links. The other four money pages had no Questions section. `npm test` passed 165 tests.
- **Not merged. Not deployed. Not released.** The editorial gate for this diff asks for editorial review only. Production HTML does not include these questions until that review exists and the branch is merged.

## Editorial rules

- Nameplate and manual figures only. No composite scores.
- Wattage-per-square-foot numbers are planning brackets, not load calculations.
- “Under $200” is a shopping class; street prices move.
- This is not electrical, fire-code, or design advice. Hire a licensed electrician for 240 V hardwired work.
