---
name: affiliate-link-audit
description: Weekly sweep of every outbound affiliate/partner link on BayHeat for broken links, missing tags, disclosure gaps, and the never-a-dollar-figure-near-a-buy-link rule (BLUEPRINT.md §8.3 loop B). Use for the Monday link audit or whenever a commerce change lands.
---

# Affiliate link audit

Run this whenever `lib/commerce/**` changes, and on a standing weekly cadence (Monday).

## What to check

1. **Every outbound link resolves.** Walk `lib/commerce/products/*.ts`'s `ALL_PRODUCTS` (via `lib/commerce/products/index.ts`) and, for each, call `route(product, surface)` for every `Surface` it could realistically render on. Confirm every returned `href` is well-formed and (where feasible without hammering a live site) resolves.
2. **Verified ASINs only route to `/dp/`.** Cross-check `lib/commerce/products/core.ts`'s `VERIFIED_ASINS` — any product whose `asin` isn't in that list must route to a tagged search link, never `/dp/`. `lib/commerce/route.ts` should already enforce this; the audit is confirming it still does after any change, via `lib/commerce/commerce.test.ts`.
3. **Tag presence.** Every Amazon link carries a `tag=` param matching the right surface (`lib/env.public.ts`'s `AMAZON_TAG_*` constants). Every outbound link carries `rel="sponsored nofollow noopener"` — check `components/ui/ButtonLink.tsx`'s `BuyButton` is what's actually used, not a raw `<a>`.
4. **Disclosure coverage.** `<Disclosure />` appears above the first paid link on every page that has one — grep `app/(site)/**/page.tsx` for `<BuyButton` or `route(` and confirm a `<Disclosure` appears earlier in the same file.
5. **No dollar figure near a buy link.** Grep for a `$` followed by a digit in the same file as a `<BuyButton>`, and manually confirm none of those hits share a rendered block with the button (the one narrow exception is a headline with no buy button directly beside it, e.g. "$675 of fixes").
6. **The hard exclusions still hold.** Buddy-type propane (`g_unvented_buddy`), torpedo, and kerosene (`k_unvented`) never have a buy button anywhere in the codebase — grep for their product ids (`propane-buddy-9k`, `propane-big-buddy-18k`) next to a `<BuyButton>` and confirm zero hits.
7. **No Amazon links in a print surface** — check the print stylesheet actually strips `a[href*="amazon."]` (there should be a test enforcing this; confirm it still passes).

## Output

A short report: broken links (with the file and surface), missing tags, disclosure gaps, and any dollar-figure-adjacency or hard-exclusion violation, each with the exact file and line. Open a PR for anything mechanically fixable; escalate anything ambiguous (e.g. a partner env var that's set but the resulting link 404s) rather than guessing at a fix.
