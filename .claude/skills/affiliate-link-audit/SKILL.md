---
name: affiliate-link-audit
description: Weekly sweep of every outbound affiliate/partner link on BayHeat for broken links, missing tags, disclosure gaps, and the never-a-dollar-figure-near-a-buy-link rule (BLUEPRINT.md §8.3 loop B). Use for the Monday link audit or whenever a commerce change lands.
---

# Affiliate link audit

Run this whenever `lib/commerce/**` changes, and on a standing weekly cadence (Monday).

## Run these first

```
node scripts/verify-asins.mjs                                   # is every listing we link to still buyable? (plain URLs, no affiliate clicks)
npm run build && node scripts/link-audit.mjs                    # counts, dp vs search, tags, rel, disclosure above the first link
npm start & node scripts/link-audit.mjs --rail http://localhost:3000   # first paid link position on a phone and desktop
```

`verify-asins.mjs` is the only thing that touches Amazon, and it never sends an affiliate URL or retries past a robot check. It re-checks parked listings in `company/research/asin-ledger.json` and prints `RESTORE` when one is back. A listing that reads `unavailable` or `offers-only` earns nothing: park it (drop its `asin` and its `VERIFIED_ASINS` entry, mark it `parked` in the ledger) instead of leaving a dead link. `company/REVENUE-ANALYSIS.md` explains why.

## What to check

1. **Every outbound link resolves.** Walk `lib/commerce/products/*.ts`'s `ALL_PRODUCTS` (via `lib/commerce/products/index.ts`) and, for each, call `route(product, surface)` for every `Surface` it could realistically render on. Confirm every returned `href` is well-formed and (where feasible without hammering a live site) resolves.
2. **Verified ASINs only route to `/dp/`, and each is used once.** Cross-check `lib/commerce/products/core.ts`'s `VERIFIED_ASINS` — any product whose `asin` isn't in that list must route to a tagged search link, never `/dp/`. `lib/commerce/route.ts` should already enforce this; the audit is confirming it still does after any change, via `lib/commerce/commerce.test.ts`, which also fails if a product ASIN is unlisted or a listed ASIN is unused.
3. **Tag presence.** Every Amazon link carries a `tag=` param matching the right surface (`lib/env.public.ts`'s `AMAZON_TAG_*` constants). Every outbound link carries `rel="sponsored nofollow noopener"` — check `components/ui/BuyButton.tsx`'s `BuyButton` / `BuyTextLink` (re-exported from `ButtonLink.tsx`) is what's actually used, not a raw `<a>`: they add the rel and fire the `affiliate_click` / `cart_click` events. Per-page tracking IDs come from `NEXT_PUBLIC_AMAZON_TAGS`; a page with no entry falls back to its surface tag.
4. **Disclosure coverage.** `<Disclosure />` appears above the first paid link on every page that has one — grep `app/(site)/**/page.tsx` for `<BuyButton` or `route(` and confirm a `<Disclosure` appears earlier in the same file. `QuickPick` and `FixCart` carry their own disclosure inside the plate; `link-audit.mjs` flags `disclosure-after-link` on the built HTML, which is the real test. It also flags `missing-product-warning:<id>` when a page links a product directly but the product's own manual warning (its `safetyLine`) is not in the visible text; the planner report, which is dynamic, only links a model directly when one unit covers the modeled capacity (`productForRecommendation`).
5. **No dollar figure near a buy link.** Grep for a `$` followed by a digit in the same file as a `<BuyButton>`, and manually confirm none of those hits share a rendered block with the button (the one narrow exception is a headline with no buy button directly beside it, e.g. "$675 of fixes").
6. **The hard exclusions still hold.** Buddy-type propane (`g_unvented_buddy`), torpedo, and kerosene (`k_unvented`) never have a buy button anywhere in the codebase — grep for their product ids (`propane-buddy-9k`, `propane-big-buddy-18k`) next to a `<BuyButton>` and confirm zero hits.
7. **No Amazon links in a print surface** — check the print stylesheet actually strips `a[href*="amazon."]` (there should be a test enforcing this; confirm it still passes).

## Output

A short report: broken links (with the file and surface), missing tags, disclosure gaps, and any dollar-figure-adjacency or hard-exclusion violation, each with the exact file and line. Open a PR for anything mechanically fixable; escalate anything ambiguous (e.g. a partner env var that's set but the resulting link 404s) rather than guessing at a fix.
