# Experiment 001 — complete the path from the decision pages to a tagged listing

Registered: 2026-09-26, before measurement.

## Hypothesis

Readers who land on the homepage, the 120 V vs 240 V guide, or the forced-air vs infrared guide leave without a product because those pages did not contain a disclosed retailer exit. Adding one matching-class module (internal guide link plus the existing Associates listings) will create a path from those entry points to a `laqaer-20` Amazon URL.

## Audience

US homeowners or shop users deciding an electric garage or workshop heater from the circuit they already have.

## Offer

Existing comparisons. No new SKUs. Listings already in `lib/affiliates.ts`: Comfort Zone CZ798 (`B004VVJANC`), Comfort Zone CZ220-class (`B009F1SWH8`), Fahrenheat FUH54-class (`B00PX0T37I`). The wall card links to the wall-mount guide instead of a single ASIN, because 5 kW, 7.5 kW, and 1,500 W wall units are different circuits.

## Channel

Organic search and on-site navigation. No paid ads. No email or social posts.

## Cost ceiling

$0 new discretionary spend. No ads, no new vendors, no OpenSEO credits, no Vercel plan change.

## Success metric

1. Immediate, verifiable here: production HTML for `/`, `/120v-vs-240v-garage-heater`, and `/forced-air-vs-infrared-garage-heater` returns 200 and contains `laqaer-20` plus the internal guide links. IndexNow accepts a submit after that HTML is live.
2. 28-day, blocked until Search Console is connected: clicks on `/best-ceiling-mount-garage-heaters-under-200`, `/portable-garage-heaters-15a-circuit`, `/best-wall-mount-garage-heaters`, and `/best-electric-garage-heaters-by-size` compared with the 28 days before this change. A sale still requires an Associates report before it counts as revenue.

## Evaluation window

Immediate check on the deploy that contains this page. Search metric: 28 days after that deploy, ending on or after 2026-10-24. If Search Console is still disconnected on that date, metric 2 is a blocked result, not a success.

## Result so far

Immediate metric, observed 2026-09-26 after merge commit `adb2754`:

- Production health check passed at 2026-09-26T05:01:39Z. `/`, `/120v-vs-240v-garage-heater`, `/forced-air-vs-infrared-garage-heater`, and the ceiling-mount guide returned 200 and contained `laqaer-20`. `www` returned 308 to the apex. The check did not request Amazon.
- IndexNow returned HTTP 202 for the nine submitted URLs.
- The 28-day Search Console metric is still blocked. This is not a commercial success.

## Stop or pivot

- Remove a card if its recommendation contradicts the page it sits on.
- Stop adding Associates links if the tag is rejected or the account is not approved.
- If Search Console later shows impressions on the edited pages down by more than 30 percent and money-page clicks do not rise, revert the retailer module.
- Do not declare the experiment a commercial success from HTML checks alone.
