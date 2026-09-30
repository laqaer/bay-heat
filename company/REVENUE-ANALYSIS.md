# BayHeat revenue analysis and Amazon link plan

Written 2026-09-30. Owner constraints that shaped every recommendation here: $0 new discretionary spend, Associates is the business, nameplate and manual figures only, no invented prices or scores (docs/operations/README.md).

## 1. Bottom line

1. **Revenue is one product of four numbers:** sessions × click-through × orders per click × commission per order. This round fixed the middle two. It cannot fix the first. On the blueprint's own realistic traffic ramp (49,500 sessions in 12 months), even a strong click-through and a good Amazon EPC earn about **$0.4k to $2k a year**. The owner's stated goal of about $300 a month needs roughly **8,000 to 20,000 sessions a month** (table in section 3). Nothing built here changes that; traffic does.
2. **Nothing on this site has a measured click, sale or session.** Analytics is off, Search Console and GA4 are not connected, the Associates dashboard is not visible from here, and the ledger says earnings are unknown. Every conversion figure below is an assumption, and is labeled as one. The first deliverable of this work is therefore measurement.
3. **The as-built site was leaking before it got to traffic.** Zero of the 15 pages with a buy link had one inside the first phone screen (closest: 1,250 px down; several 3,000+). 65% of the links were Amazon search pages, not product pages. Two of the five "verified" listings were "Currently unavailable" and were linked from four pages, including both direct links on the portable-heater page. A dead listing earns exactly nothing.
4. **What changed in this branch:** links went from 52 to 70 across the same 15 pages, direct product links from 18 to 50 (35% to 71%), verified listings from 5 to 19, dead listings removed from the money path, every paid click now fires a tracked event, every page can have its own Amazon tracking ID, and the first paid link is inside the first phone screen on 12 of the 15 pages that have one (section 2).
5. **The five owner actions worth doing, in order:** (a) create per-page Amazon tracking IDs and paste one env var; (b) turn on GA4 and connect Search Console (both free); (c) check the Associates 180-day rule; (d) spend ten minutes spot-checking the 19 ASINs in SiteStripe; (e) sign up for Northern Tool (CJ) and HVACDirect and add their env vars. Full list with exact variable names is in section 6.

## 2. The funnel as found, and as it is now

Static audit of the built HTML (`node scripts/link-audit.mjs`) plus a Playwright measurement of where the first paid link sits at 390×844 and 1440×900 (`--rail`). Baseline is saved in `company/research/link-audit-2026-09-30-baseline.json`; the after-run is `link-audit-2026-09-30-after.json`.

| Measure | As found | After this branch |
|---|---:|---:|
| Pages with any paid link | 15 of 26 | 15 of 26 |
| Paid links | 52 | 70 |
| Direct `/dp/` product links | 18 (35%) | 50 (71%) |
| Amazon search links | 34 (65%) | 20 (29%) |
| Cart links | 0 | 0 on the static pages; the report builds one when a plan has two or more cartable parts |
| Pages with the first paid link in the first phone screen (≤ 844 px) | 0 of 15 | 12 of 15 (the other three: how-to-insulate at 894 px, the diesel page, and the fuel comparison page) |
| Closest first link on a phone | 1,250 px | ~520 px |
| Pages sending readers to an unavailable listing | 4 | 0 |
| Verified ASINs | 5 | 19 |
| Amazon tracking IDs in use | 1 (`laqaer-20`) | 1 until the owner adds more (per-page support is built) |
| Recorded click events | 0 | wired; fire once analytics env is set |

Why first-screen placement matters: the blueprint's click-through assumptions (11% / 17% / 21%) were written for a buy plate inside about 700 px (BLUEPRINT.md §3.3, §6.5). The built pages did not have one. The model was optimistic for the pages as they existed.

## 3. The arithmetic

`node scripts/revenue-model.mjs` prints these; the formulas are in `scripts/revenue-model.mjs` and tested in `lib/commerce/revenue-model.test.ts`.

```
EPC = P(order | click) × order value × commission rate × (1 + cart halo)
monthly revenue = sessions × CTR × EPC
```

A worked EPC: 8% of clicks order × a $250 heater × 3% × 1.1 halo = **$0.66 per click**. The blueprint's blended $0.25 corresponds to about a 3% order rate. Commission is the public Associates table (3% for Home Improvement, Tools and Lawn & Garden; the ledger notes the account's own rate was never read from SiteStripe, so treat 3% as unverified). The cookie is 24 hours.

Sessions per month needed for $300 a month of affiliate revenue:

| CTR \ EPC | $0.10 | $0.15 | $0.25 | $0.40 | $0.60 |
|---|---:|---:|---:|---:|---:|
| 3% | 100,000 | 66,667 | 40,000 | 25,000 | 16,667 |
| 6% | 50,000 | 33,333 | 20,000 | 12,500 | 8,333 |
| 10% | 30,000 | 20,000 | 12,000 | 7,500 | 5,000 |
| 17% (blueprint base) | 17,647 | 11,765 | 7,059 | 4,412 | 2,941 |

Twelve-month affiliate revenue on the blueprint base-case traffic (49,500 sessions, Oct-26 to Sep-27):

| CTR \ EPC | $0.10 | $0.15 | $0.25 | $0.40 | $0.60 |
|---|---:|---:|---:|---:|---:|
| 3% | $149 | $223 | $371 | $594 | $891 |
| 6% | $297 | $446 | $743 | $1,188 | $1,782 |
| 10% | $495 | $743 | $1,238 | $1,980 | $2,970 |
| 17% | $842 | $1,262 | $2,104 | $3,366 | $5,049 |

Reading it: revenue per 1,000 sessions is **$3 to $102** across this whole grid; a plausible middle (6% CTR, $0.25 EPC) is **$15 per 1,000 sessions**. The blueprint's peak month is 6,200 sessions, so about $90 a month in that middle case. The blueprint's own base case already concludes the $300-a-month-by-December goal is missed (BLUEPRINT.md §6.5); this analysis agrees and shows why.

Modeled EPC by product class (company/research/monetization.md §2.7, midpoints of the stated ranges):

| Class | EPC range | Best route |
|---|---|---|
| DIY mini-split | $0.40–0.90 | HVACDirect 5% / 30-day |
| Gas / propane unit heater | $0.40–0.80 | Northern Tool 3% / 30-day (network EPC about $0.77) |
| Electric 240 V heater | $0.25–0.40 | Amazon 3% / 24 h |
| Diesel air heater | $0.20–0.35 | VEVOR 2–10% / 30-day |
| Door insulation kit | $0.15–0.25 | Amazon |
| Bottom seal / weatherstrip | $0.05–0.12 | Amazon |

Implication: a click on a seal page earns a fifth of a click on a mini-split or gas unit-heater page. Seals are still worth linking, because they are the entry to the seal-first story and the cart bundle (below), but the money is in the higher-ticket classes and in the higher-EPC programs, none of which are signed up yet.

## 4. Levers, ranked by expected value per unit of effort

| # | Lever | How it moves revenue | State | Evidence quality |
|---|---|---|---|---|
| 1 | **Stop linking dead listings** | A dead listing has EPC 0. Four money pages were sending clicks to one. | Done: two ASINs parked, current CZ798GR3 listing wired, DR-238 added for infrared; `verify-asins.mjs` re-checks parked listings weekly and says when to restore | Measured (listing pages read 2026-09-30) |
| 2 | **First-screen pick** | Raises CTR. This is the single largest modeled lever because the click term multiplies everything. | Done on 12 of 15 linked pages (QuickPick, FixCart); size of the effect is an assumption | Placement measured; uplift assumed |
| 3 | **Direct product links instead of search links** | A named product page converts better than a search list for a reader who has already chosen a class. | 35% to 71% direct; the rest are classes with no verified in-stock listing that fits (diesel, 4 kW and 240 V infrared, EPS door kits, the Hot Dawg) | Placement measured; uplift assumed |
| 4 | **Cart bundle** | One click credits every item bought in the 24-hour window. A small part opens a session where the reader may also buy the heater. | Built on the report and the how-to page, sized to the doors. The bottom seal is left out on purpose: which one fits depends on the track already on the door, which the planner never asks, so the cart points at the profile guide instead. A plan gets a cart button only when it has two or more distinct parts (for example the top-and-side seal plus a reflective kit or attic tape). | Mechanism from Amazon's cart-add rules; effect assumed |
| 5 | **Per-page tracking IDs** | No direct revenue. It turns "earnings unknown" into per-page earnings, which decides everything else. | Built and dormant until the owner sets `NEXT_PUBLIC_AMAZON_TAGS` | Mechanism certain |
| 6 | **Higher-EPC programs** | Northern Tool, HVACDirect and VEVOR pay 2 to 4× the per-click rate of Amazon on the classes where Amazon is weakest. | Routing code exists behind env vars; nothing signed up | Network figures from monetization.md; account-level terms unknown |
| 7 | **Installer leads** | Highest revenue per session by the blueprint's own benchmarks ($10–30 a lead, $23–37 a call), on cost and install pages. | Not built: no `/garage-heater-installation-cost` page and no lead slot exist. `LEADS_PROVIDER` is only a constant. | Benchmarks only; no partner |
| 8 | **Safety add-ons** | Small tickets ($20–60) but attached to the highest-trust moments (NO-GO verdicts, fuel-fired reports). Also the cheapest way to earn on a reader who arrived for a verdict, not a purchase. | Built: CO alarm, freeze sensor, safer alternative on the verdict tool | Effect assumed |
| 9 | **More traffic** | The binding constraint. See section 5. | Not something links can do | Blueprint: domain essentially unindexed on 2026-09-25 |
| 10 | Display ads | Not recommended. Conflicts with the published pledge ("No display ads", home page) and with the owner's own README. | Not built | n/a |

## 5. Traffic is the constraint, and what is known about it

- `site:bayheatguide.com` returned zero pages on 2026-09-25 (BLUEPRINT.md §6.5). Search Console mail exists but the property is not connected to the OpenSEO project; GA4 is not connected; OpenSEO credits are 0.
- Money pages already cover the blueprint's top intents. Not yet built, in the blueprint's own priority: `/garage-heater-installation-cost` (the highest-CPC page in the keyword set), `/best-garage-heater`, the `can-i-run-it/kerosene-heater-in-garage` page (22,200 monthly searches), and the cooling cluster.
- Until Search Console is connected, nothing here can say which pages have impressions. The 28-day check in EXPERIMENT-001 is still blocked on that.

## 6. Owner checklist (accounts only a person can create)

Ordered by value. Each is free.

1. **Amazon tracking IDs → `NEXT_PUBLIC_AMAZON_TAGS`.** In Associates Central, Account Settings → Manage Tracking IDs, create one ID per page (up to 100 are allowed). Amazon caps ID length, so keep them short. Then set this in Vercel (values are examples; use the IDs you create):

   ```
   NEXT_PUBLIC_AMAZON_TAGS={"/garage-heaters":"bh-hub-20","/electric-garage-heater":"bh-electric-20","/240v-garage-heater":"bh-240v-20","/portable-garage-heater":"bh-portable-20","/ceiling-mount-garage-heater":"bh-ceiling-20","/best-wall-mount-garage-heaters":"bh-wall-20","/infrared-garage-heater":"bh-infrared-20","/diesel-heater-for-garage":"bh-diesel-20","/propane-heater-for-garage":"bh-propane-20","/electric-vs-propane-garage-heater":"bh-evp-20","/heat-pump-mini-split-for-garage":"bh-mini-20","/garage-door-bottom-seal":"bh-bseal-20","/garage-door-weather-stripping":"bh-wstrip-20","/garage-door-insulation-kit":"bh-dkit-20","/how-to-insulate-a-garage":"bh-howto-20","/garage-heater-calculator":"bh-calc-20","/can-i-run-it":"bh-verdict-20","/r":"bh-report-20"}
   ```

   A page with no entry keeps using `laqaer-20`, so this can be done a few pages at a time. After a week the Associates report shows clicks, orders and earnings per page.
2. **Analytics.** Set `NEXT_PUBLIC_GA4_ID` (free). `lib/track.ts` then records `affiliate_click` (with page, partner, target) and `cart_click`. Connect the Search Console property (the verification mail already goes to add461977@gmail.com) and, if wanted, GA4 to the OpenSEO project.
3. **Associates 180-day rule.** Amazon closes an account that has not produced qualifying sales within its first 180 days (three sales is the figure in Amazon's program policies; confirm the current number in Associates Central). Check when this account was created and how many qualifying sales it has. Ledger status says earnings are unknown, so this could be the largest single risk to the whole business.
4. **SiteStripe spot-check of the 19 ASINs** (BLUEPRINT.md §9 asks for owner verification). Ten minutes: open each `/dp/` link from `company/research/asin-ledger.json` "wired" rows while signed in, confirm the product is the one named, and read the account's own commission rate from SiteStripe (the ledger says the 3% rate was never read from the account).
5. **Higher-EPC programs** (monetization.md §11.2 has the sign-up steps): Northern Tool via CJ (`NEXT_PUBLIC_CJ_PID`, `NEXT_PUBLIC_CJ_AID_NORTHERNTOOL`), HVACDirect, VEVOR via Awin. The router already prefers them where the class is stocked.
6. **Hosting plan.** Vercel Hobby forbids commercial and affiliate sites (monetization.md §0.8). Production is on Hobby today, which risks the deployment being suspended without notice. This needs the owner's decision; the $0 cap and the paused Cloudflare migration (`docs/cloudflare-migration.md`) both bear on it.
7. **`hello@bayheatguide.com` has no MX record** (ledger). Any promise of email support or capture is currently unmet.
8. **Lead partner.** Pick one lead program (Home Depot Services via Impact, or Networx), and say so; the lead slot and the installation-cost page are the next build.

## 7. Weekly operating loop

```
node scripts/verify-asins.mjs                 # every verified and parked listing; says RESTORE when one is back
npm run build && node scripts/link-audit.mjs  # link counts, dp vs search, disclosure above first link
node scripts/link-audit.mjs --rail http://localhost:3000   # first-paid-link position in px (after `next start`)
node scripts/revenue-model.mjs --sessions N --ctr C --epc E   # plug in the measured numbers
```

Then read the Associates report by tracking ID: the page with the most clicks and no orders has a listing, price or trust problem; the page with orders and few clicks needs a better first-screen pick. Re-rank primaries by observed EPC once there is a month of data. `verify-asins.mjs` requests plain product URLs only (never an affiliate URL, which would be a fake click) and stops at a robot check.

## 8. What was not verified

- Every CTR, order rate and uplift in sections 3 and 4 is an assumption.
- Amazon prices, ratings and stock are read only from listing pages on 2026-09-30, by script, and recorded in `asin-ledger.json` for the maintainer. The site never shows them.
- The DR-975 and DR-910F manuals say "WARNING – RISK OF FIRE, DO NOT USE AS A RESIDENTIAL OR HOUSEHOLD HEATER." That wording is now on their safety lines. Whether a home garage counts is the maker's call; the site says so and stops recommending the DR-975 in a first-screen pick.
- Diesel, 4 kW hardwired, 240 V infrared, the Hot Dawg and the EPS door kits still link to Amazon search pages, because no in-stock listing that fits was confirmed. The diesel case is deliberate: VEVOR's own manual lists "Living room, garage" under places its 8 kW heater can not be used for constant heating, and no UL, ETL or CSA mark was found. That warning is now on the diesel plates; whether a garage-heater site should sell the class at all is for the human editor.
- The two mini-split and unit-heater ASINs (Della Optima 12k, Mr. Heater Big Maxx) are third-party or retailer-fulfilled listings (Align Inc., Northern Tool). Amazon may credit them differently from Amazon-sold items; the Associates report will show it.
