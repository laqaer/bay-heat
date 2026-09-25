# Monetization research: garage heating, cooling and insulation brand (US)

Research date: 2026-09-25. Author: monetization strategist (research phase). Audience: the build team and the agent team that will run the company.
Scope: every realistic revenue stream for a US garage climate brand (heating, cooling, dehumidifying, sealing and insulation) running on bayheatguide.com (or its successor), with rates checked in September 2026.

Confidence tags used below:
- **[OFFICIAL]**: read on the program's own page or legal text.
- **[3P-2026]**: third-party directory or article dated 2026.
- **[3P-OLD]**: third-party source from 2025 or earlier, or undated.
- **[MODEL]**: our own estimate. Replace it with observed data after 90 days.

---

## 0. Decisions in one screen

1. **Affiliate commerce is the main engine in year 1**, at about 60–65% of revenue. Amazon (`laqaer-20`, already live) stays the default link because it converts best. We add retailers and DTC sellers that have **longer cookies and higher AOV** for considered purchases:
   - HVACDirect (5%, 30-day), Got Ductless (3%), Della, Pioneer (2%, 14-day) for mini-splits
   - Northern Tool (3%, 30-day, CJ EPC about $0.77/click) for gas unit heaters and shop heaters
   - VEVOR (2–10%, 30-day, Awin) and Hcalory (up to 10%) for diesel heaters
   - Sylvane (6%, 30-day) for dehumidifiers
   - Home Depot and Walmart (Impact) as secondary "also at" buttons
2. **Amazon rules shape the design.** The site must never show Amazon prices or star ratings. Those are only allowed through Creators API/PA-API, and PA-API 5 was retired May 15, 2026. Creators API needs **10 qualifying sales in the trailing 30 days**. The site must never put Amazon links in PDFs or printed/ebook material, must not cloak or redirect Amazon links, and must show "As an Amazon Associate [we] earn from qualifying purchases." Use our own illustrations, not Amazon images. Use price *tiers*, not live prices.
3. **Email is the multiplier.** Use Kit, which is free up to 10,000 subscribers and includes API access. Build "first-freeze" and "heat-wave" alerts plus a seasonal plan email. Amazon allows its links in emails only when the subscriber opted in, so use double opt-in.
4. **Digital product ladder:**
   - Free web planner
   - **$19 personalized "Garage Heat Plan" PDF**, which includes an Electrician Brief page
   - **$39 "Garage Climate Pack"** (adds heat, cool, insulate and door templates)

   Pricing anchor: homeowner Manual J reports sell for $27–$109. Sell through a merchant of record: **Polar** or **Lemon Squeezy/Stripe Managed Payments**, 5% + 50¢. The code must not depend on the provider: it reads a checkout URL from an env var.
5. **Installer lead generation** runs only on "cost", "install" and "circuit" intent pages. The dossier's CPCs show these intents are worth 5–20x the product terms: "garage heater installation cost" $13.98 CPC, "cost to install 240v outlet in garage" $7.94, "cost to insulate garage" $5.38. Start with Home Depot Services (Impact, $10–$30/lead) and Networx/Modernize. Add pay-per-call later: HVAC median $36.75/call, electrical $23.27, garage door $37.50 (Aug 2026 benchmarks).
6. **Display ads come last.** Keep them off the planner and money pages. Journey (1,000 tier-1 sessions) and later Raptive (25k pageviews) can run on informational pages only. Ezoic now requires 250k users for new publishers, so it is not an option. AdSense is not worth the damage to the design.
7. **Sponsorships** start in month 7–9: a "Presented by" planner sponsor and newsletter placements. Plan on $250–$1,500 per month by the end of year 1.
8. **The hosting plan must be Vercel Pro (about $20/mo).** Vercel Hobby explicitly forbids sites whose primary purpose is affiliate linking, sites with ads, and sites that take payments. This is an owner action and it blocks everything else.
9. **12-month model** (Oct-2026 → Sep-2027, gross):

   | Scenario | 12-month total | Dec-26 | Sep-27 run-rate |
   |---|---:|---:|---:|
   | Conservative | **~$0.9k** | $98 | $107/mo |
   | Base | **~$8.1k** | $650 | $1.3k/mo |
   | Upside | **~$42k** | $2.9k | $6.1k/mo |

   The prior goal of $300/mo by Dec 31 is reached at about **5,000 sessions in December**, which is the base-case trajectory.

---

## 1. Constraints that shape monetization

| Constraint | Consequence for build | Source |
|---|---|---|
| Vercel Hobby = non-commercial only. It lists "Affiliate linking is the primary purpose of the site", advertising (incl. AdSense) and "any method of requesting or processing payment" as commercial. | Owner must upgrade the project to **Vercel Pro** before we scale affiliate, ads or checkout. | https://vercel.com/docs/limits/fair-use-guidelines (last_updated 2026-09-14) [OFFICIAL] |
| Amazon: prices and availability can be shown only if Amazon serves them or they come from Creators API/PA-API. If shown via API, a timestamp and the standard disclaimer are required. | Do not show Amazon prices. Use "$ / $$ / $$$" tiers or cross-retailer typical ranges that are *not* placed next to Amazon buttons and are *not* called Amazon prices. | https://affiliate-program.amazon.com/help/operating/policies (effective 2026-04-14) [OFFICIAL] |
| Amazon: customer reviews and star ratings only via Creators API/PA-API. | No Amazon stars. Our own scoring must be transparent and rubric-based (see FTC, §7). | same [OFFICIAL] |
| Amazon: no storing or caching of product images; image links may be stored for at most 24h. | Use our own illustrations or diagrams of each product class (this also serves the "stunning" goal). Manufacturer press images only with permission. | same [OFFICIAL] |
| Amazon: links in email, SMS or DMs only if solicited (opted in). No promotion "in any offline manner … printed material, ebook, mailing". | **No Amazon links inside paid or free PDFs.** PDFs link to bayheatguide.com pages. Newsletter must be double opt-in. | same [OFFICIAL] |
| Amazon: no cloaking, redirect links or shorteners that make it unclear you are linking to Amazon. | Link directly to `https://www.amazon.com/dp/{ASIN}?tag=laqaer-20`. Track clicks with a client-side analytics event, **not** a `/go/` redirect. | same [OFFICIAL] |
| Amazon: required statement "As an Amazon Associate I earn from qualifying purchases." (or substantially similar). | Sitewide footer **and** near the first link on commercial pages: "As an Amazon Associate, BayHeat earns from qualifying purchases." | https://affiliate-program.amazon.com/help/operating/agreement (effective 2025-10-15) [OFFICIAL] |
| Amazon April 14, 2026 update: "original content" tightened (AI-only comparison pages without human input are out of policy). Onsite halo (non-link items) cut to a lower fixed % (reported 1–2%). 180-day purchase-and-ship limit. | Every commercial page needs original analysis: our planner math, circuit logic, and operating-cost modeling. Do not model halo income. | https://affiliyo.com/blog/amazon-associates-april-2026-policy-changes [3P-2026]; https://www.getchatads.com/blog/amazon-associates-commission-cuts-what-bloggers-should-do/ [3P-2026] |
| Amazon Creators API replaced PA-API 5 (PA-API retired May 15, 2026; 403s after). Eligibility is **10 qualified sales in the trailing 30 days**. | Live prices and images from the API are phase 2 at the earliest (after roughly 10 sales/month). Design must not depend on them. | https://www.keywordrush.com/blog/amazon-creator-api-what-changed-and-how-to-switch/ ; https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction [3P-2026/OFFICIAL] |
| Amazon new-account rule: 3 qualifying sales within 180 days of sign-up or the account is closed. | Owner: confirm `laqaer-20` has passed its first-3-sales review. If not, it is a hard deadline. | https://affiliate-program.amazon.com/help/node/topic/G7MJTPEP9NC3YKMG ; https://getaawp.com/blog/amazon-affiliate-program-requirements/ |

---

## 2. Affiliate programs

### 2.1 Amazon Associates (live: `laqaer-20`)

**Standard commission rates** [OFFICIAL, Associates Central fee table; azonpress mirror updated 2026-04-08]:

| Rate | Categories |
|---:|---|
| 10% | Luxury Beauty, Luxury Stores Beauty, Amazon Explore |
| 5% | Digital Music, Physical Music, Handmade, Digital Videos |
| **4.5%** | Physical Books, Kitchen, **Automotive** |
| 4% | Fashion, devices (Echo/Fire/Kindle/Ring), Watches, Jewelry, Luggage, Shoes; **"All Other Categories" 4%** |
| **3%** | Toys, Furniture, **Home**, **Home Improvement**, **Lawn & Garden**, Pets, Headphones, Beauty, Musical Instruments, **Business & Industrial Supplies**, **Outdoors**, **Tools**, Sports, Baby |
| 2.5% | PC, PC Components, DVD & Blu-Ray |
| 2% | Televisions, Digital Video Games |
| 1% | Amazon Fresh, Physical Video Games, Grocery, Health & Personal Care |
| 0% | Gift cards, alcohol, vehicles, etc. |

- **Product categories for us.** Garage heaters, mini-splits, door insulation kits, seals, fans, dehumidifiers and portable AC all sit under Tools & Home Improvement or Home, so **3%**.
  - Nuance: many 12V diesel air heaters are catalogued under **Automotive → RV parts**, which pays **4.5%**. The rate follows *Amazon's* category of the item bought, not our framing. Check the Earnings report by category.
- **Cookie.** 24 hours from click. The cart-add carry-over rule plus the new 180-day purchase-and-ship limit apply. No change to the 24h window in 2026 [3P-2026].
- **Rate-card cuts.** Negotiated rate cards for large publishers were cut by up to ~50% from about March 9, 2026. The standard public table is unchanged [3P-2026].
- **Strengths.**
  - Highest conversion of any retailer (trust, Prime, reviews, returns).
  - No approval friction; already live.
  - The verified ASINs in `lib/affiliates.ts` (CZ220, FUH54, CZ798, DR-975, Heat Storm HS-1500-TT) cover the electric line.
- **Weaknesses.**
  - 24h cookie, which hurts on $700–$2,500 mini-splits and $600–$1,000 unit heaters where people deliberate for days.
  - 3% on low-AOV sealing items ($25–$150).
  - Halo income cut in April 2026.
- **Build rules.**
  - Unverified products use tagged **search** links (`https://www.amazon.com/s?k=...&tag=laqaer-20`). Never invent ASINs (dossier rule).
  - Owner must list bayheatguide.com in Associates Central → Account Settings → "Website and Mobile App List".

### 2.2 Big-box and industrial retailers

| Program | Network | Commission | Cookie | Notes / AOV | Confidence |
|---|---|---|---|---|---|
| **The Home Depot** | Impact (`homedepot.sjv.io/c/{partnerId}/456723/8154?u={url}`) | 1% products, BOPIS and mobile; 1% appliances; up to 8% select home décor. Geniuslink cites ~2.14% average. | 24h | AOV > $300; conversion ~1.87%. In-store purchases, installation services, gift cards and special orders excluded. Sells MrCool, Della, Pioneer, Matador, Cellofoam, Dr. Infrared, Mr. Heater. | [3P-2026] geniuslink 2026-05-18; bloggingtips |
| **Home Depot Services** (installation leads) | Impact | **$10–$30 per lead; $10–$15 per appointment** | n/a | Covers HVAC, water heater, windows, appliance install and more. See lead gen (§3). | [3P-OLD] linkclicky; phonexa 2025-07 ($20–$200 range) |
| **Lowe's** | **Unclear.** Geniuslink (May 2026) says CJ, flat 2%, 24h. commissiondex (2026) says Impact, 2–4%, 14-day. FlexOffers listing says 0.8%. | 0.8–4% | 24h–14d | Low priority. Reach it through Sovrn/Skimlinks until the direct program is confirmed in the owner's network dashboard. | [3P mixed] |
| **Walmart** | Impact | 1–4% by category. Home improvement is reported at the top of that range (~4%). Walmart Creator is up to 18% on décor/beauty/apparel, but it targets social creators. | **3 days** | 72h cookie beats Amazon's 24h. Good secondary button for Mr. Heater, fans, dehumidifiers, portable ACs. | [3P-2026] argil.ai 2026-07-23 |
| **Northern Tool + Equipment** | CJ (also via Sovrn etc.) | 3% | **30 days** | **CJ 7-day EPC $76.71 and 3-month EPC $78.28 per 100 clicks (≈ $0.77/click)**. AOV about $234. Carries Mr. Heater, Modine Hot Dawg, Dr. Infrared, Fahrenheat, King, propane and kerosene torpedo heaters, and diesel heaters. **Best EPC for gas and shop heaters.** | [3P] linkmydeals; getlasso |
| **Tractor Supply** | Partnerize | 1.6%–5.6% reported | 7–30 days (conflicting) | Rural and shop audience; Mr. Heater, propane, kerosene. Secondary. | [3P mixed] taprefer, getlasso |
| **Zoro** | CJ/FlexOffers | 4% | 30 days | Industrial: Modine, King, Qmark, TPI, Fostoria unit heaters, fans. Good for "shop heater 240V/480V" pages. | [3P-OLD] |
| **Global Industrial** | own/Sovrn | ~4% | 30 days | $300 AOV; residual on 3 extra orders. Commercial unit heaters, big fans. | [3P-OLD] |

### 2.3 HVAC, air quality and DTC mini-split sellers (highest AOV)

| Program | How to join | Commission | Cookie | Payout | AOV / fit | Confidence |
|---|---|---|---|---|---|---|
| **HVACDirect.com** | Create a free account → Affiliate Section | **5%** pay-per-sale | 30 days (Affpaying) | $100 min; PayPal on request; coupon sites banned | MrCool, Senville, Gree, Cooper&Hunter mini-splits. $1,000–$3,000 orders mean **$50–$150 per sale** | [OFFICIAL] hvacdirect.com/affiliates-home |
| **Got Ductless** | UpPromote: af.uppromote.com/got-ductless/register | 3% | n/a | Monthly | Mitsubishi, Fujitsu, MrCool, Daikin, LG and more; pro-grade and higher AOV | [OFFICIAL] |
| **MrCool (Contractor Club)** | mrcooldiydirect.com | 4% | n/a | $100 min, monthly | **Requires proof of contractor status.** We are not eligible, so route MrCool through HVACDirect, Home Depot or Amazon. | [OFFICIAL] |
| **Pioneer Mini Split** | af.secomapp.com/pioneerminisplit/register | 2% (excluding tax and shipping) | 14 days; last click wins | per Affiliate Guide | Pioneer DIY / WYT 9k–36k | [OFFICIAL] |
| **Della** | dellahome.com/pages/affiliate-program | 3–4% (page text inconsistent) | n/a | n/a | Budget mini-splits ($500–$900); also on Home Depot | [3P-2026 + OFFICIAL page, unparsed] |
| **Senville** | No public page found. Contact 1-800-242-4935 or the Pro Partner form. | unknown | – | – | LETO/AURA mini-splits. Try later via email. | searched 2026-09-25 |
| **Sylvane** | sylvane.com/pages/affiliate-program | **6%** | 30 days | – | Dehumidifiers (Santa Fe, Aprilaire commercial at $1,000–$2,000), fans, heaters, air purifiers. **Best fit for "garage dehumidifier" (12,100/mo).** | [3P-2026] getlasso |

### 2.4 Heater brands

| Brand | Program | Rate / cookie | Notes |
|---|---|---|---|
| **VEVOR** (diesel heaters; "vevor diesel heater" 40,500/mo) | Awin merchant **28831** (VEVOR US); also Impact/UpPromote listings; affiliate-program.vevor.com | **2–10% by traffic source, 30-day cookie**, AOV about $200, ~2% conversion. Offers "Commission Boosts, Flat Fee Placements, Free Samples"; contact collaboration@vevor.com | Top pick for the diesel-heater cluster (peaks at 22–27k/mo in Dec–Jan). No brand-keyword bidding. [3P-2026 Awin profile] |
| **Hcalory** | hcalory.com/pages/affiliate-program → Awin, GoAffPro (ShareASale listed but ShareASale closed on 2025-10-06) | "Up to 10%"; free samples; contact affiliate@hcalory.com | Second diesel brand. Samples let us photograph and test, which supports honest reviews. [OFFICIAL] |
| Mr. Heater / Enerco | No public affiliate program found (mrheater.com "Industry Partnerships" is B2B) | – | Monetize through Amazon, Home Depot, Walmart, Northern Tool, Tractor Supply. |
| Dr. Infrared Heater | No public program found | – | Amazon (DR-975 verified ASIN) and Home Depot. |
| Heat Storm | No public program found | – | Amazon (HS-1500-TT verified). |
| King Electric, Modine (Hot Dawg), Fahrenheat, Comfort Zone | Distributor or retail only | – | Northern Tool, Zoro, Home Depot, Amazon. Modine and Hot Dawg are gas unit heaters at $600–$1,200, so the 30-day Northern Tool cookie is the right route. |

### 2.5 Insulation and sealing (year-round volume: "garage door insulation" 49,500, "garage door insulation kit" 22,200, "garage door bottom seal" 27,100)

- Matador, Cellofoam, Owens Corning and Reach Barrier kits have **no brand programs**. Monetize through Amazon (3%, 24h) and Home Depot (1–2%, 24h).
- These are low-AOV impulse items ($25–$150). Amazon wins on conversion, so make it the primary button.
- They are the best "starter" purchases in the planner's "seal before you heat" step, and they drive volume toward the 10-sales-in-30-days Creators API threshold.

### 2.6 Sub-affiliate aggregators (fallback while approvals are pending)

- **Sovrn Commerce** and **Skimlinks** both pay **75%** of the commission and keep 25%.
- Sovrn auto-approves 50,000+ merchants and pays 90 days after month-end.
- Use them only for merchants where we are not yet approved directly: Lowe's, Tractor Supply, Zoro.
- Prefer the **Sovrn link API/manual links over the auto-rewrite JS** to protect performance.
- Sources: https://www.nichepursuits.com/skimlinks-review/ ; https://www.sovrn.com/blog/getting-approved-for-commerce/ ; https://geniuslink.com/blog/home-depot-affiliate-program/ (Sovrn is about 75% of a direct program).

### 2.7 Which programs have the best EPC for our product classes? [MODEL]

EPC = click→order conversion × AOV × rate (+ Amazon halo about $0.50–$1/order after the April 2026 cut). Street prices are rough September 2026 ranges; verify before use.

| Product class | Typical AOV | Best primary route | Modeled EPC | Secondary |
|---|---:|---|---:|---|
| DIY mini-split 12–24k BTU | $700–$2,500 | **HVACDirect 5%/30d** (≈$50–$125/sale × 0.5–1%) | **$0.40–$0.90** | Amazon 3% (MrCool/Pioneer/Della), Home Depot |
| Gas / propane unit heater (Big Maxx, Hot Dawg, Modine) | $450–$1,200 | **Northern Tool 3%/30d** (network EPC ≈ $0.77) | **$0.40–$0.80** | Amazon, Zoro |
| Portable AC 12–14k BTU | $350–$650 | Amazon 3% (conversion) | $0.35–$0.60 | Walmart 72h |
| Dehumidifier (garage 50–70 pint; commercial) | $220–$2,000 | **Sylvane 6%/30d** for commercial; Amazon for consumer | $0.30–$0.90 | Home Depot |
| Electric 240V heater (CZ220, FUH54, DR-975) | $150–$400 | Amazon 3% (verified ASINs) | $0.25–$0.40 | Home Depot, Northern Tool |
| Propane portable (Big Buddy) | $120–$200 | Amazon 3% | $0.20–$0.30 | Walmart, Tractor Supply |
| Diesel air heater | $100–$250 | **VEVOR 2–10%/30d (Awin)** or Amazon (possibly 4.5% Automotive) | $0.20–$0.35 | Hcalory up to 10% |
| Garage door insulation kit | $60–$150 | Amazon 3% | $0.15–$0.25 | Home Depot |
| Bottom seal / weather stripping | $20–$60 | Amazon 3% | $0.05–$0.12 | Home Depot |
| Garage fans | $60–$250 | Amazon 3% | $0.12–$0.25 | Walmart |

**Routing rule for the build.** Each product card carries up to 3 buttons.
- **Primary button:** the highest *observed* EPC partner that has the item. Until data exists, use the modeled order above.
- **Second button:** Amazon, whenever Amazon is not primary (conversion and trust).
- **Third button:** "Also at Home Depot/Walmart".
- Any partner whose env var is missing drops out and falls back to Amazon (see §11).

---

## 3. Lead generation (installers: electrician, HVAC, insulation, garage door)

Why it matters here: CPCs in `keyword-metrics.tsv` show advertisers pay far more for *install* intent than for product intent:

| Keyword | Volume | CPC |
|---|---:|---:|
| garage heater installation cost | 260 | **$13.98** |
| garage makeover | 2,900 | $8.39 |
| cost to install 240v outlet in garage | 170 | $7.94 |
| radiant floor heat garage | 320 | $6.70 |
| cost to insulate garage | 590 | $5.38 |
| garage floor heating | 480 | $4.37 |
| garage door insulation r value | 720 | $3.34 |
| best mini split for garage | 480 | $2.97 |

| Partner | Model | Publisher payout | Verticals | Join | Confidence |
|---|---|---|---|---|---|
| **Home Depot Services** | Pay per lead / appointment | $10–$30/lead; $10–$15/appt | HVAC, water heaters, windows, appliances, remodel consults | Impact | [3P-OLD] linkclicky; phonexa 2025 |
| **Angi** (HomeAdvisor merged; "Angi Leads") | % of completed service (10% listed) / service requests | varies | All trades | Impact; angi.com/landing/affiliatepartners | [3P] linkclicky |
| HomeAdvisor (legacy) | fixed per sale | $1.50–$16 | general | CJ | [3P] phonexa 2025-07 |
| **Thumbtack** | per booking / % | "30%" listed on Impact (CID 238441); others report $12/booking; 7-day cookie | All local pros | Impact | [3P-2026] hienergy |
| **Networx** | per qualified lead (tracking link, embeddable HTML form, or API) | Not public; contractors pay $15–$60/lead, so publisher payout is likely $5–$25 [MODEL] | HVAC, electrical, insulation, garage doors, roofing | affiliate@networx.com, (478) 312-6591 | [OFFICIAL] affiliates.networx.com |
| **Modernize** (QuinStreet) | per lead | Disclosed after approval | HVAC, windows, doors, roofing, siding, solar | affiliates@modernize.com (24h reply) | [OFFICIAL] modernize.com/affiliates |
| Porch | per service | $1.60–$13.60; 7-day cookie | general | FlexOffers | [3P] |
| **Pay-per-call** (e.g., Service Direct; Lead Smart buyer panel) | per billable call (usually 60–120s minimum) | **Median: HVAC $36.75, electrical $23.27, garage door $37.50, plumbing $38.50, windows $102.50, siding $115.50** (Aug 23, 2026; 311k ZIP-level bids) | HVAC, electrical, garage door | Apply once traffic exceeds about 10k/mo | [3P-2026] wboc.com press release |

**Recommendation.**
- **Phase 1 (Nov 2026).** Add a "Get installer quotes" block on four intent clusters:
  - 240V circuit / electrician
  - Mini-split install
  - Garage heater install cost
  - Insulation and garage-door upgrade

  Wire it to **Home Depot Services** (HVAC) and **Networx** (electrical and insulation). Fallback when no env var is set: the free **Electrician Brief** (email capture), so every lead is still an email.
- **Phase 2 (at 10k+ sessions/mo).** Test pay-per-call on mobile for "cost" pages. It needs call-tracking numbers from the network.
- **Guardrail.** Lead blocks are clearly labeled ("Sponsored: quotes from partner network"). They never appear inside safety guidance, and they never block the free answer.

---

## 4. Display ads

| Network | Entry threshold (2026) | Revenue share / terms | Typical RPM, US home/lifestyle | Source |
|---|---|---|---|---|
| **Journey by Mediavine** | **1,000 sessions/30 days from tier-1** (US, CA, UK, AU) since Jan 15, 2026; original content; site ≥ 4 months old; Grow script running ≥ 30 days | **70%**; Net 65 | about $11 average reported; varies widely | mediavine.com/mediavine-requirements (OFFICIAL); productiveblogging.com 2026-01-19 |
| **Mediavine (Official)** | **$5,000 annual ad revenue** (traffic threshold dropped Jan 2026); automatic upgrade from Journey | up to 90% at scale | $15–$35 (home/lifestyle medians $18–$34) | mediavine.com (OFFICIAL); arbitragetimes 2026 |
| **Raptive** | **25,000 pageviews/mo** (cut from 100k in Oct 2025). 25k–99k PV needs ≥ 50% tier-1 traffic; Rise folded into "Insider" | not disclosed publicly (historically 75%) | $20–$40 | raptive.com blog; ppc.land; SEJ |
| **Ezoic** | **250,000 monthly users for new publishers** since Feb 19, 2026 (Incubator program for smaller sites) | – | $11–$22 | BlackHatWorld/Ezoic support; studytoearn |
| **Google AdSense** | none | 68% | $2–$8 for informational DIY | general 2026 guides |

**Recommendation.**
- **No display ads before February 2027.** Never put them on the planner, product-pick pages or the paid-product funnel.
- Ads cut affiliate CTR and wreck the "stunning" brand. At base-case traffic, Journey on informational pages is only worth about $6–$7 per 1,000 sessions, against an affiliate yield of about $38.
- Revisit when we reach **25k PV/mo** (Raptive, ad-light settings) on informational articles only ("how to insulate a garage", "is it safe to use propane heater in garage").
- ads.txt must then be served at `/ads.txt`. Raptive and Mediavine each provide a managed ads.txt redirect.

---

## 5. Digital products

### 5.1 What sells, and at what price

- **Anchor: homeowner load calcs.**
  - AutoHVAC: first report free, then $27/report.
  - manualjcalculator.com room-by-room: $109.
  - Market range: $79–$500.
  - CoolCalc (pro): $5–$15/report or $39–$99/mo.
  - Fiverr: $20–$90.

  Source: https://autohvac.ai/manual-j-cost [3P-2026]
- **Printable DIY plans** (garage cabinets, workbenches, rolling tool stations) are a mature Etsy and Gumroad category: 12-page PDFs with cut lists and 3D steps. We could not verify price medians; spot-check before pricing. Directionally they sell in the single to low double digits.
- **Our edge.**
  - Nobody sells a *garage-specific* climate plan.
  - The SERP for "garage heater calculator" is forums, a thin pickhvac calculator and spam.
  - The planner produces the inputs anyway, so the marginal cost of a personalized PDF is near zero.

### 5.2 Recommended product ladder

| Tier | Price | Contents | Delivery |
|---|---:|---|---|
| Free: **Garage Climate Planner** (web) | $0 | Heat load (BTU/W) from size, ceiling, insulation, door, climate zone. Fuel comparison (electric/propane/natural gas/diesel/heat pump). Circuit check (NEC 80% continuous rule; 5 kW → 240V/30A/10 AWG). Operating cost per month. Seal-first priority list. Product classes with affiliate buttons. | On screen; "Email me my plan" (Kit) |
| **Garage Heat Plan** | **$19** (launch $14 through Dec 15) | Personalized 8–12 page PDF: load worksheet; 3 equipment options (good/better/best class); **Electrician Brief** page (breaker, wire, disconnect, thermostat, clearances, and questions to ask for quotes); insulation and sealing shopping list with payback; month-by-month running-cost table; CO, clearance and venting checklist. **No Amazon links inside the PDF** (links go to bayheatguide.com). | Client-side PDF after verified purchase (license key or checkout session), or generated server-side |
| **Garage Climate Pack** | **$39** | Everything in the Heat Plan plus: cooling and dehumidifying plan; mini-split pre-install checklist (lineset, pad, disconnect, 240V, condensate); garage-door insulation panel cut templates; seasonal maintenance calendar; printable wall chart | Same |
| Year-2 experiment: **Contractor embed** | $29–$49/mo | White-label planner plus lead form for HVAC and garage-door contractors | Needs auth and billing; not in v1 |

- **Conversion assumptions [MODEL]:**
  - Planner completion: 20–30% of planner visitors
  - Paid conversion: 1–2% of completions, about 0.1–0.35% of all sessions
  - Blended price about $24
  - Net after fees about $22
- **Refund policy:** 14 days, no questions asked. This cuts chargebacks and supports trust.

### 5.3 Checkout platforms (fees verified September 2026)

| Platform | Fee per sale | Merchant of record (handles sales tax/VAT)? | Net on a $19 sale | Owner must provide | Notes |
|---|---|---|---:|---|---|
| **Stripe Payment Links / Checkout** | 2.9% + 30¢ (+0.5% if Stripe Tax enabled) | **No.** We owe sales tax where we have nexus (always the home state; economic nexus usually $100k) | ~$18.15 | Stripe account, bank, EIN/SSN, tax registrations | Cheapest; more compliance work. https://stripe.com/pricing |
| **Stripe Managed Payments** | 5% + 50¢ | Yes | ~$17.55 | Stripe account | Public preview since Feb 2026; the migration path for Lemon Squeezy |
| **Lemon Squeezy** | 5% + 50¢ (+1.5% international, +1.5% PayPal, +0.5% subscriptions) | Yes | ~$17.55 | LS account, bank, identity check | Owned by Stripe; in transition to Stripe Managed Payments. https://www.lemonsqueezy.com/blog/2026-update |
| **Polar** (Starter) | 5% + 50¢ (+1.5% international); payouts $2/mo + 0.25% + 25¢ | Yes | ~$17.50 | Polar account (Stripe Connect), bank | Pro $20/mo = 3.8% + 40¢. Orgs created before 2026-05-27 keep 4% + 40¢. Built-in license keys and file downloads. https://polar.sh/docs/merchant-of-record/fees |
| Gumroad | 10% + 50¢ **plus** card processing (~2.9% + 30¢); Discover marketplace 30% | Yes (since 2025-01-01) | ~$16.25 | Gumroad account | Worst economics. Keeps fees on refunds. |

**Pick: Polar Starter** (merchant of record, license-key benefit for unlocking the personalized PDF, file-download benefit, webhooks). The alternative is Lemon Squeezy/Stripe Managed Payments at the same price.
- The code must depend only on `NEXT_PUBLIC_CHECKOUT_URL_*`, plus optional webhook and verification secrets.
- Switching providers is then an env-var change.

---

## 6. Sponsorships, brand deals and newsletter

| Format | Benchmark | When | Candidate sponsors |
|---|---|---|---|
| "Planner presented by" (logo plus 1 labeled module; never changes the math or ranking) | Price like a sponsored post: $20–$50 CPM on planner pageviews, e.g. 30k PV/mo → $600–$1,500/mo | at ~15–20k sessions/mo | VEVOR (offers "Flat Fee Placements"), Hcalory, MrCool, Della, Pioneer, Dr. Infrared, garage flooring (Swisstrax, RaceDeck), storage (Gladiator) |
| Sponsored article or comparison ("Sponsored" label, rel="sponsored") | Typical blogger CPM $20–$50 on pageviews; $50 at 1k visitors to $600–$1,500 at 30k PV | month 7+ | same |
| Newsletter placement (primary / secondary / classified) | New lists: price at **2.5–5% of subscriber count** per primary placement (3k subs → $75–$150; 10k → $250–$500). Beehiiv-network CPMs $20–$50 per 1k sends; direct-sold is 2–5x network. Secondary 50–65% of primary; classified 25–35%. | at 2,500+ subscribers | seasonal: heaters (Oct–Jan), mini-split/AC (Apr–Jul), insulation (Sep–Nov) |
| Product samples for review | Free units (Hcalory, VEVOR explicitly offer samples) | anytime | Required to make "tested" claims honestly (§7) |

Sources: https://www.paved.com/blog/newsletter-sponsorship-rates/ ; https://www.beehiiv.com/blog/newsletter-cpm ; https://influenceflow.io/resources/sponsored-post-rates-complete-2026-pricing-guide-for-influencers-brands/ ; https://ui.awin.com/merchant-profile/28831

**Editorial firewall** (write it into the agent team's rules):
- Sponsors never influence rankings, recommendations or calculator outputs.
- Sponsored units are labeled "Sponsored".
- Sponsored links use `rel="sponsored"`.
- A sponsor's product is shown only when it would appear anyway on merit, or in a clearly separated ad slot.

---

## 7. FTC and legal compliance (affiliate, sponsored, reviews, email)

1. **FTC Endorsement Guides (16 CFR Part 255; revised June 29, 2023).** Disclose the material connection *clearly and conspicuously*, **close to the recommendation or link**.
   - A footer or a separate "disclosures" page alone is insufficient. One disclosure is enough only when it and the link are visible together.
   - Acceptable wording: "I get commissions for purchases made through links in this post"; "Paid link" placed next to the link.
   - **"Affiliate link" alone is not sufficient**, because consumers may not understand it. A bare "Buy now" button does not disclose anything.
   - Source: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
2. **Implementation spec for the build:**
   - (a) A one-line disclosure **above the first affiliate link on every commercial page**: "We earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases."
   - (b) Small "Paid link" micro-label beside each retailer button group.
   - (c) Sitewide footer disclosure.
   - (d) A `/how-we-make-money` page.
   - (e) `rel="sponsored nofollow noopener"` on all affiliate, lead and sponsor links (Google recommends `rel="sponsored"` for paid and affiliate links).
3. **Consumer Reviews and Testimonials Rule (16 CFR Part 465; effective Oct 21, 2024).** It bans:
   - fake or AI-fabricated reviews
   - buying reviews
   - undisclosed insider reviews
   - review suppression
   - misrepresenting independence

   **Civil penalty up to $53,088 per violation.** The 2025 level stays in force for 2026 because the 2026 inflation adjustment was cancelled (OMB M-26-11, 2026-04-17).
   - Never write "we tested" unless we physically tested the product.
   - Scores must follow a published rubric (spec-based) and be labeled as such.
   - Never show Amazon stars (Amazon also prohibits it).
   - Sources: https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-publishes-inflation-adjusted-civil-penalty-amounts-2025 ; https://www.federalregister.gov/documents/2026/09/15/2026-18853/civil-penalty-inflation-adjustments
4. **Sponsored content.** Label it at the top as "Sponsored" or "Paid partnership with {Brand}". If the whole unit is clearly marked as an ad, it needs no further disclosure.
5. **CAN-SPAM** (newsletter and alerts):
   - Accurate From and subject lines.
   - A **valid physical postal address** in every commercial email (street address, USPS PO box, or a registered private mailbox).
   - Working unsubscribe, honored within 10 business days.

   **The owner must supply a mailing address** (a virtual mailbox is fine). https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
6. **Google.** Site-reputation-abuse and product-review systems punish thin affiliate pages. Original analysis (planner math, circuit logic, operating-cost modeling) is both an Amazon policy requirement and a ranking requirement. https://developers.google.com/search/docs/essentials/spam-policies
7. **Safety and liability.** Keep the existing electrical disclaimer. Paid plans say "general information; a licensed electrician and the local inspector control the job". Include CO and venting warnings for propane and diesel.

---

## 8. Ranked revenue stack (what to build, in order)

| Rank | Stream | Why | Year-1 share (base) | Build dependency | Owner dependency |
|---:|---|---|---:|---|---|
| 1 | **Multi-retailer affiliate, routed by product class** | Live today (Amazon). KD ~0 niche with high-AOV products. Planner outputs map directly to purchasable classes. | ~63% | Partner registry, product cards, click events, disclosures | Vercel Pro; Impact, CJ and Awin sign-ups; direct programs |
| 2 | **Email capture + seasonal alerts** (enabler) | Recovers the 24h-cookie loss. Second touch at the first freeze and first heat wave. Sponsorship inventory. | (drives #1, #3, #5) | Kit form route, double opt-in, "email me my plan", NWS weather cron | Kit account, sending-domain DNS, postal address |
| 3 | **Digital plan ($19 / $39)** | ~92% margin; differentiates the brand; trivial marginal cost | ~7% | PDF generator, unlock flow, checkout env | Polar (or LS/Stripe) account, bank, W-9 |
| 4 | **Installer lead gen** | Highest per-action value on install/cost pages | ~6% | Lead block component, env-gated partner forms or links | Impact (HD Services, Angi, Thumbtack), Networx/Modernize approval |
| 5 | **Sponsorships** (planner, newsletter) | Brands in this niche buy flat-fee placements (VEVOR) | ~17% by run-rate at year end | Sponsor slot component, media kit page | Owner signs contracts and invoices |
| 6 | **Display ads** (info pages only) | Low incremental value; brand cost | ~7% | Ads provider switch, ads.txt | Journey/Raptive account |
| – | Not in year 1 | AdSense (low RPM; hurts design), Ezoic (250k threshold), Gumroad (fees), private-label hardware (capital, liability), contractor SaaS (year 2) | – | – | – |

---

## 9. 12-month revenue model (Oct-2026 → Sep-2027)

### 9.1 Traffic ramp assumptions (organic-led; new domain with about 2 weeks of indexing; KD ~0 niche)

- **Timing.** Heating terms peak Nov–Jan at 3–10x summer. Cooling peaks Jun–Aug. Insulation and door-seal terms are year-round (door insulation peaks Jan; bottom seal peaks Oct).
- **Conservative.** Indexing is slow and we mostly miss the first heating peak. About 150 pages ranking on page 2–3. Peaks at 4k sessions/mo in Jan and 4.5k in Jul.
- **Base.** The planner plus 60–100 pages are indexed by early November. The planner ranks top-5 for the calculator cluster (880–2,900/mo in peak) and long-tail pages capture about 1–2% of the cluster. Jan 14k and Jul 18k.
- **Upside.** The planner earns links (forums, Reddit, GarageJournal), about 2–4% share of the cluster, plus Pinterest/YouTube referrals. Jan 40k and Jul 50k.

### 9.2 Yield assumptions per 1,000 sessions [MODEL]

| Stream | Conservative | Base | Upside | Logic |
|---|---:|---:|---:|---|
| Affiliate | $22 | $38 | $60 | Outbound CTR 11% / 16% / 20% × blended EPC $0.20 / $0.24 / $0.30. Seasonal multiplier: Nov–Jan ×1.2–1.3, Mar–Apr ×0.8, Jun–Jul ×1.1–1.15. |
| Digital | $2.0 | $4.5 | $8.0 | 0.09% / 0.2% / 0.35% of sessions buy × ~$22 net. Starts November. |
| Leads | $1.5 | $4.0 | $8.0 | 0.1% / 0.2% / 0.3% of sessions submit or call × $15–$27 average payout. Starts Nov–Dec. |
| Display | $0 | $6.7 | $16.5 | Base: Journey from Mar-27, 40% of PVs × 1.4 PV/session × $12 RPM. Upside: Raptive from Jan-27. |
| Sponsors (flat $/mo) | $0 | $250–$400 from Jun-27 | $500–$1,500 from Jan-27 | §6 benchmarks |
| Fixed costs | –$30/mo | –$30/mo | –$30/mo | Vercel Pro ~$20 + domain ~$1 + analytics ~$9 (Plausible) |

### 9.3 Monthly tables (gross revenue by accrual month)

**Conservative (12-month gross ≈ $907; net ≈ $547)**

| Month | Sessions | Affiliate | Digital | Leads | Display | Sponsors | Gross |
|---|---:|---:|---:|---:|---:|---:|---:|
| Oct-26 | 400 | $9 | $0 | $0 | $0 | $0 | **$9** |
| Nov-26 | 1,500 | $41 | $3 | $0 | $0 | $0 | **$44** |
| Dec-26 | 3,000 | $86 | $6 | $6 | $0 | $0 | **$98** |
| Jan-27 | 4,000 | $106 | $8 | $7 | $0 | $0 | **$121** |
| Feb-27 | 2,800 | $55 | $6 | $4 | $0 | $0 | **$65** |
| Mar-27 | 2,000 | $35 | $4 | $2 | $0 | $0 | **$42** |
| Apr-27 | 1,800 | $32 | $4 | $2 | $0 | $0 | **$37** |
| May-27 | 2,400 | $48 | $5 | $3 | $0 | $0 | **$56** |
| Jun-27 | 3,500 | $85 | $7 | $6 | $0 | $0 | **$97** |
| Jul-27 | 4,500 | $114 | $9 | $8 | $0 | $0 | **$131** |
| Aug-27 | 3,800 | $88 | $8 | $6 | $0 | $0 | **$101** |
| Sep-27 | 4,200 | $92 | $8 | $6 | $0 | $0 | **$107** |
| **Total** | **33,900** | $790 | $67 | $50 | $0 | $0 | **$907** |

**Base (12-month gross ≈ $8,057; net ≈ $7,697)**

| Month | Sessions | Affiliate | Digital | Leads | Display | Sponsors | Gross |
|---|---:|---:|---:|---:|---:|---:|---:|
| Oct-26 | 1,000 | $38 | $0 | $0 | $0 | $0 | **$38** |
| Nov-26 | 5,000 | $238 | $22 | $0 | $0 | $0 | **$260** |
| Dec-26 | 11,000 | $543 | $50 | $57 | $0 | $0 | **$650** |
| Jan-27 | 14,000 | $638 | $63 | $67 | $0 | $0 | **$769** |
| Feb-27 | 9,000 | $308 | $40 | $32 | $0 | $0 | **$381** |
| Mar-27 | 6,500 | $198 | $29 | $21 | $44 | $0 | **$291** |
| Apr-27 | 6,000 | $182 | $27 | $19 | $40 | $0 | **$269** |
| May-27 | 9,000 | $308 | $40 | $32 | $60 | $0 | **$441** |
| Jun-27 | 14,000 | $585 | $63 | $62 | $94 | $250 | **$1,054** |
| Jul-27 | 18,000 | $787 | $81 | $83 | $121 | $300 | **$1,371** |
| Aug-27 | 15,000 | $598 | $68 | $63 | $100 | $400 | **$1,230** |
| Sep-27 | 17,000 | $646 | $76 | $68 | $114 | $400 | **$1,304** |
| **Total** | **125,500** | $5,069 | $560 | $505 | $573 | $1,350 | **$8,057** |

**Upside (12-month gross ≈ $42,276; net ≈ $41,916)**

| Month | Sessions | Affiliate | Digital | Leads | Display | Sponsors | Gross |
|---|---:|---:|---:|---:|---:|---:|---:|
| Oct-26 | 2,500 | $150 | $0 | $0 | $0 | $0 | **$150** |
| Nov-26 | 12,000 | $900 | $96 | $120 | $0 | $0 | **$1,116** |
| Dec-26 | 30,000 | $2,340 | $240 | $312 | $0 | $0 | **$2,892** |
| Jan-27 | 40,000 | $2,880 | $320 | $384 | $495 | $500 | **$4,579** |
| Feb-27 | 25,000 | $1,350 | $200 | $180 | $309 | $500 | **$2,539** |
| Mar-27 | 18,000 | $864 | $144 | $115 | $297 | $750 | **$2,170** |
| Apr-27 | 17,000 | $816 | $136 | $109 | $280 | $750 | **$2,091** |
| May-27 | 26,000 | $1,404 | $208 | $187 | $429 | $1,000 | **$3,228** |
| Jun-27 | 40,000 | $2,640 | $320 | $352 | $660 | $1,250 | **$5,222** |
| Jul-27 | 50,000 | $3,450 | $400 | $460 | $825 | $1,500 | **$6,635** |
| Aug-27 | 42,000 | $2,646 | $336 | $353 | $693 | $1,500 | **$5,528** |
| Sep-27 | 50,000 | $3,000 | $400 | $400 | $825 | $1,500 | **$6,125** |
| **Total** | **352,500** | $22,440 | $2,800 | $2,972 | $4,814 | $9,250 | **$42,276** |

Model script: `scratchpad/revmodel.py` in the session scratchpad (re-runnable; edit the arrays).

### 9.4 Sensitivities and cash timing

- **The biggest lever is traffic, then outbound CTR.** Every +1 point of site-wide outbound CTR adds about $2.40 per 1k sessions (base EPC $0.24). The planner result page should hit 25–35% CTR.
- **Break-even for the old goal ($300/mo net by 2026-12-31).** At the base December yield (~$59 per 1k sessions), we need about **5,200 sessions in December**.
- **Amazon share risk.** If Amazon cuts standard rates again (it did in April 2020, and cut rate cards in 2026), base affiliate revenue falls about 25–35%. Diversify buttons early.
- **Cash lags accrual:**
  - Amazon pays about 60 days after month-end.
  - Impact and CJ programs lock 30–60 days.
  - Journey pays Net 65.
  - Sovrn pays 90 days.
  - MoR checkouts pay out weekly to monthly.
  - **December revenue arrives in Feb–Mar 2027.**
- **Returns.** Heaters and ACs have meaningful return rates, and commissions on returned orders are reversed. Model 5–10% reversals on large items.

---

## 10. Instrumentation the build must ship (required to replace [MODEL] numbers)

| Event | Properties |
|---|---|
| `planner_start`, `planner_step`, `planner_complete` | inputs bucketed; no PII |
| `affiliate_click` | partner, product_class, product_id/ASIN, page, slot (primary/secondary/also-at), position |
| `lead_cta_view`, `lead_cta_click`, `lead_submit` | vertical, partner |
| `checkout_click`, `purchase` | product, provider (via webhook or success page) |
| `email_signup` | source (planner/footer/brief/alert), topic tags |

- Send events with `navigator.sendBeacon` or the analytics provider. Do not use redirects: Amazon forbids obscuring links.
- **Monthly EPC** per partner and product class = network-reported earnings ÷ our `affiliate_click` count. Re-rank buttons monthly.

---

## 11. OWNER CHECKLIST (accounts only a human can create) + exact env vars

All env vars are optional. The code must degrade gracefully: missing partner → hide that button and fall back to Amazon; missing checkout → show "Get notified" email capture; missing email provider → hide forms and show a mailto; missing lead partner → show the free Electrician Brief.

### 11.1 Must do first (blocks revenue)

| # | Account / action | Why | Cost | Env var(s) the code reads |
|---:|---|---|---|---|
| 1 | **Upgrade Vercel project to Pro** | Hobby forbids affiliate-primary sites, ads and payments | ~$20/mo per seat | – |
| 2 | **Amazon Associates: confirm `laqaer-20` is fully approved** (3 sales / 180 days review passed). Add bayheatguide.com to the Website List. Finish the tax interview (W-9) and payment method. | Keeps the main engine alive; commissions need a listed site | $0 | `NEXT_PUBLIC_AMAZON_TAG` (default `laqaer-20`) |
| 3 | **Business basics.** EIN for Laqaer Products (or SSN), business bank account, PayPal (some networks pay by PayPal), W-9 ready | Every network and checkout asks | $0 | – |
| 4 | **Postal mailing address** for email footer (USPS PO box or virtual mailbox) | CAN-SPAM | $5–$15/mo | `NEXT_PUBLIC_POSTAL_ADDRESS` (single line, shown in emails and footer) |
| 5 | **Mailbox `hello@bayheatguide.com`** working (receive and send) | Program applications, sponsors, support | $0–$7/mo | `NEXT_PUBLIC_CONTACT_EMAIL` (default `hello@bayheatguide.com`) |

### 11.2 Affiliate networks and programs (apply in October 2026, before the heating peak)

| # | Account | Apply to inside it | Env var(s) and format |
|---:|---|---|---|
| 6 | **Impact.com** (partner/"media partner" account) | The Home Depot; Home Depot Services (HVAC install leads); Walmart; Lowe's (if listed); Angi; Thumbtack | `NEXT_PUBLIC_HOMEDEPOT_LINK_BASE` = `https://homedepot.sjv.io/c/{MEDIA_PARTNER_ID}/456723/8154` (code appends `?u={encodeURIComponent(productUrl)}`)<br>`NEXT_PUBLIC_WALMART_LINK_BASE` = `https://goto.walmart.com/c/{MEDIA_PARTNER_ID}/{AD_ID}/9383` (copy from Impact deep-link generator; code appends `?u=`)<br>`NEXT_PUBLIC_LOWES_LINK_BASE`<br>`NEXT_PUBLIC_HDSERVICES_LINK_BASE`<br>`NEXT_PUBLIC_ANGI_LINK_BASE`<br>`NEXT_PUBLIC_THUMBTACK_LINK_BASE` |
| 7 | **CJ Affiliate** | Northern Tool + Equipment; Zoro; (Lowe's if on CJ) | `NEXT_PUBLIC_CJ_PID` (website/publisher ID)<br>`NEXT_PUBLIC_CJ_AID_NORTHERNTOOL`<br>`NEXT_PUBLIC_CJ_AID_ZORO`. Code builds `https://www.anrdoezrs.net/click-{PID}-{AID}?url={encodeURIComponent(productUrl)}`. Verify the exact deep-link host in CJ ("Link Generator"). |
| 8 | **Awin** ($5 refundable deposit; $20 payout threshold) | VEVOR US (merchant 28831); Hcalory | `NEXT_PUBLIC_AWIN_AFFID` (publisher ID). Code builds `https://www.awin1.com/cread.php?awinmid={MID}&awinaffid={AFFID}&ued={encodeURIComponent(productUrl)}`. Merchant IDs live in code: VEVOR=28831, Hcalory=TBD. |
| 9 | **HVACDirect.com** affiliate (create customer account → Affiliate Section) | 5% mini-splits | `NEXT_PUBLIC_HVACDIRECT_REF` (the ref param or full referral link the dashboard shows) |
| 10 | **Sylvane** affiliate | 6% dehumidifiers and fans | `NEXT_PUBLIC_SYLVANE_LINK_BASE` |
| 11 | **Got Ductless** (UpPromote) | 3% mini-splits (Mitsubishi, Fujitsu, MrCool) | `NEXT_PUBLIC_GOTDUCTLESS_REF` |
| 12 | **Pioneer Mini Split** (af.secomapp.com/pioneerminisplit/register) | 2%, 14-day | `NEXT_PUBLIC_PIONEER_REF` |
| 13 | **Della** (dellahome.com/pages/affiliate-program) | 3–4% | `NEXT_PUBLIC_DELLA_REF` |
| 14 | **Hcalory direct** (affiliate@hcalory.com); ask for samples | up to 10% | `NEXT_PUBLIC_HCALORY_REF` (if a direct program is used instead of Awin) |
| 15 | *(optional fallback)* **Sovrn Commerce** | Monetize not-yet-approved merchants at 75% | `SOVRN_COMMERCE_KEY` (server-side link API; **no auto-rewrite JS**) |

### 11.3 Revenue products

| # | Account | Env var(s) |
|---:|---|---|
| 16 | **Polar** (recommended MoR). Create org and 2 products ($19 Heat Plan, $39 Climate Pack), add a license-key benefit, connect payout bank. *Alternatives: Lemon Squeezy or Stripe.* | `NEXT_PUBLIC_CHECKOUT_URL_PLAN`, `NEXT_PUBLIC_CHECKOUT_URL_PACK` (hosted checkout links)<br>`POLAR_ACCESS_TOKEN` (server; license validation or order lookup)<br>`POLAR_WEBHOOK_SECRET`<br>`POLAR_ORGANIZATION_ID`<br>*Stripe alternative:* `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PLAN`, `STRIPE_PRICE_ID_PACK`<br>`CHECKOUT_PROVIDER` = `polar` \| `lemonsqueezy` \| `stripe` \| unset (unset = show "notify me") |
| 17 | **Kit** (free up to 10,000 subscribers; API on free plan). Create a form with double opt-in and tags (heat, cool, insulate, climate zone). | `KIT_API_KEY` (v4, server-only)<br>`KIT_FORM_ID`<br>`KIT_TAG_IDS` (JSON map, e.g. `{"heat":123,"cool":124,"insulate":125}`) |
| 18 | **DNS for email sending** on bayheatguide.com (SPF, DKIM, DMARC as Kit instructs) | – |
| 19 | **Lead partners:** email affiliate@networx.com and affiliates@modernize.com (send traffic stats after month 2). Later a pay-per-call network (Service Direct or similar) at 10k+ sessions/mo. | `LEADS_PROVIDER` = `networx` \| `modernize` \| `hdservices` \| `angi` \| unset<br>`NETWORX_AFFILIATE_ID`, `NETWORX_API_KEY` (if API form)<br>`NEXT_PUBLIC_NETWORX_FORM_URL` (if hosted form/link)<br>`NEXT_PUBLIC_CALL_NUMBER_HVAC`, `NEXT_PUBLIC_CALL_NUMBER_ELECTRICAL`, `NEXT_PUBLIC_CALL_NUMBER_GARAGEDOOR` (E.164 tracking numbers) |

### 11.4 Measurement and ops

| # | Account | Env var(s) |
|---:|---|---|
| 20 | **Analytics.** Plausible ($9/mo; cookie-less, no consent banner needed) *or* GA4 (free); Vercel Web Analytics included with Pro | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (e.g. `bayheatguide.com`) **or** `NEXT_PUBLIC_GA4_ID` (`G-XXXXXXX`) |
| 21 | **Google Search Console** (already verified) and **Bing Webmaster Tools**. Create a Google Cloud service account with read access to the GSC property so agents can pull performance. | `GSC_SITE_URL` (e.g. `sc-domain:bayheatguide.com`), `GSC_SERVICE_ACCOUNT_JSON_B64` |
| 22 | **Vercel Cron** secret for weather-triggered alerts (NWS api.weather.gov needs no key, only a User-Agent) | `CRON_SECRET`, `NWS_USER_AGENT` (e.g. `BayHeat/1.0 (hello@bayheatguide.com)`) |
| 23 | *(Phase 2, Feb 2027 or later)* Journey by Mediavine or Raptive | `ADS_PROVIDER` = `none` \| `journey` \| `raptive` (default `none`)<br>`NEXT_PUBLIC_GROW_SITE_ID` (Journey's Grow script)<br>`NEXT_PUBLIC_RAPTIVE_SITE_ID`<br>`ADS_TXT_REDIRECT_URL` (served at `/ads.txt`) |
| 24 | *(Phase 2, after 10 sales in 30 days)* Amazon Creators API credentials | `AMAZON_CREATORS_API_CREDENTIAL_ID`, `AMAZON_CREATORS_API_CREDENTIAL_SECRET` (names per Creators API console; server-only; enables live price and image with timestamp and disclaimer) |

---

## 12. Operating notes for the agent team

- **Monthly (1st business day):**
  - Pull network reports (Amazon, Impact, CJ, Awin, direct).
  - Compute EPC per partner × product class against our click events.
  - Re-rank primary buttons.
  - Flag partners with EPC below 50% of the class median for removal.
- **Weekly:**
  - Link-rot check on all ASINs and product URLs (404, out of stock, variation changes).
  - Verify the disclosure line renders above the first link on every commercial page.
- **Quarterly:**
  - Re-verify commission rates and cookie terms. Amazon changed rates in 2020 and April 2026; Lowe's network status is unclear.
  - Re-check Amazon policies (compare page: https://affiliate-program.amazon.com/help/operating/compare).
- **Seasonal calendar:**
  - **Oct:** publish and refresh the heating cluster, insulation and door-seal pages. Apply to all programs. Amazon's October Prime event is typically early October; verify dates.
  - **Nov 27 (Black Friday) – Nov 30, 2026 (Cyber Monday):** deals roundups, with no prices shown for Amazon items.
  - **Dec–Jan:** first-freeze alerts; diesel and shop-heater pages (peak 22–33k/mo searches).
  - **Mar–Apr:** build the cooling cluster (garage AC 12,100, dehumidifier 12,100, mini-split 3,600 → peak 8,100 in July).
  - **May–Aug:** cooling promotions; mini-split and portable-AC pushes; heat-wave alerts.
  - **Sep:** refresh the heating year.
- **Sponsor sales** start once we have 15k+ sessions/mo or 2,500+ subscribers. Media kit: audience, seasonality, placements, rates from §6.
- **Hard rules:**
  - Never invent ASINs, prices, stars, test results or reviews.
  - No Amazon links in PDFs.
  - No redirects or cloaking on Amazon links.
  - Sponsors never change rankings or math.

---

## 13. Sources (accessed 2026-09-25)

**Amazon**
- https://affiliate-program.amazon.com/help/node/topic/GRXPHT8U84RAYDXZ
- https://azonpress.com/amazon-affiliate-commission-rates/
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/help/operating/agreement
- https://affiliyo.com/blog/amazon-associates-april-2026-policy-changes
- https://www.getchatads.com/blog/amazon-associates-commission-cuts-what-bloggers-should-do/
- https://www.keywordrush.com/blog/amazon-creator-api-what-changed-and-how-to-switch/
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
- https://getaawp.com/blog/amazon-affiliate-program-requirements/

**Big-box and industrial retailers**
- https://geniuslink.com/blog/home-depot-affiliate-program/
- https://www.bloggingtips.com/affiliate-programs/home-depot
- https://linkclicky.com/affiliate-program/home-depot-services/
- https://geniuslink.com/blog/lowes-affiliate-program/
- https://commissiondex.com/programs/lowes/
- https://www.nichepursuits.com/lowes-affiliate-program/
- https://www.argil.ai/blog/walmart-affiliate-program-cd8f1
- https://linkmydeals.com/affiliate-programs/info/northerntool.com/
- https://taprefer.com/tractor-supply-affiliate-program/tractor-supply/
- https://getlasso.co/affiliate/zoro/
- https://www.globalindustrial.com/affiliate

**HVAC, air quality and mini-split sellers**
- https://hvacdirect.com/affiliates-home
- https://gotductless.com/pages/got-ductless-affiliate-partner
- https://mrcooldiydirect.com/pages/mrcool-contractor-club
- https://af.secomapp.com/pioneerminisplit/register
- https://dellahome.com/pages/affiliate-program
- https://getlasso.co/affiliate/sylvane/

**Heater brands**
- https://ui.awin.com/merchant-profile/28831
- https://hcalory.com/pages/affiliate-program

**Aggregators and networks**
- https://www.nichepursuits.com/skimlinks-review/
- https://www.sovrn.com/blog/getting-approved-for-commerce/
- https://hellopartner.com/2025/08/19/shareasale-to-sunset-in-us-as-awin-migration-wraps-up/
- https://orichi.info/awin-review/

**Lead generation**
- https://affiliates.networx.com/
- https://modernize.com/affiliates
- https://phonexa.com/blog/home-improvement-leads-affiliate-programs/
- https://app.hienergy.ai/a/thumbtack-hienergy-impact
- https://linkclicky.com/affiliate-program/angi/
- https://www.wboc.com/online_features/press_releases/lead-smart-publishes-2026-pay-per-call-payout-benchmarks-for-hvac-plumbing-roofing-garage-door/article_6afb47b2-86ce-514d-b136-b7b29f73a731.html
- https://www.flexoffers.com/affiliate-programs/porch-affiliate-program/

**Display ads**
- https://www.mediavine.com/mediavine-requirements/
- https://www.productiveblogging.com/everything-you-need-to-know-about-journey-by-mediavine/
- https://raptive.com/blog/opening-the-door-to-more-creators-who-meet-raptive-quality-standards/
- https://www.searchenginejournal.com/raptive-drops-traffic-requirement-by-75-to-25000-views/558780/
- https://www.blackhatworld.com/seo/ezoic-raises-minimum-requirement-for-new-publishers-to-250k-monthly-users.1795395/
- https://arbitragetimes.com/ezoic-vs-mediavine-in-2026-which-platform-wins-for-mid-tier-publishers/

**Checkout platforms and digital product pricing**
- https://www.lemonsqueezy.com/pricing
- https://www.lemonsqueezy.com/blog/2026-update
- https://polar.sh/docs/merchant-of-record/fees
- https://stripe.com/pricing
- https://checkoutpage.com/blog/gumroad-fees
- https://autohvac.ai/manual-j-cost

**Sponsorships and email platforms**
- https://www.paved.com/blog/newsletter-sponsorship-rates/
- https://www.beehiiv.com/blog/newsletter-cpm
- https://influenceflow.io/resources/sponsored-post-rates-complete-2026-pricing-guide-for-influencers-brands/
- https://www.emailtooltester.com/en/reviews/beehiiv/pricing/
- https://mailsoftly.com/blog/kit-free-plan/
- https://developers.kit.com/api-reference/forms/add-subscriber-to-form

**Legal and compliance**
- https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-publishes-inflation-adjusted-civil-penalty-amounts-2025
- https://www.federalregister.gov/documents/2026/09/15/2026-18853/civil-penalty-inflation-adjustments
- https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- https://developers.google.com/search/docs/essentials/spam-policies

**Hosting**
- https://vercel.com/docs/limits/fair-use-guidelines
