# Competitive teardown: garage heating, cooling, and insulation SERPs

**Prepared:** 2026-09-25 · **For:** the BayHeat rebuild team (build) and the operating agent team (run)
**Inputs:** founding dossier (`scratchpad/dossier.md`), keyword tables (`keywords.tsv`, `keyword-metrics.tsv`), plus 30+ live page fetches and web searches run on 2026-09-25. No OpenSEO credits used.

**Access caveats:**
- **thespruce.com** blocks our crawler: curl returns HTTP 402, and WebSearch/WebFetch refuse the domain. Its section below covers only what can be inferred and is marked **UNVERIFIED**.
- **acdirect.com** returns HTTP 403 to every fetch, so its section is built from search-engine extracts of the page.
- **Visual scores (1–10)** are a judgment from page structure, template, media counts and extracted palette/fonts. We had no headless browser for screenshots. A human or screenshot agent should spot-check the top 5.

---

## 0. TL;DR for decision-makers

1. **No one owns "garage climate" as a brand.** Big publishers (Car and Driver, Bob Vila, Popular Science, Garage Gym Reviews) cover garage heaters as one article among hundreds. Retailers and manufacturers (VEVOR, AC Direct, Filterbuy, King Electric, Carrier, Bryant) write sales content for their own products. The garage-specific sites (thegarage.guide, electricgarageheaterguide.com, howmanybtus.com, toolgrit.com, garagemadesimple.com) are template-grade, with 0–10 images per page and no brand.
2. **Sizing answers disagree by 3x, and nobody explains why.** For the same 24×24 ft two-car garage, published rules give anywhere from **3,000 W (~10k BTU, Bob Vila)** to **~32k BTU (PickHVAC Zone 7, thegarage.guide "uninsulated")**. A transparent, physics-based planner that shows its math and where the heat goes is a real gap and a natural link magnet.
3. **Testing quality is thin everywhere.** The best test (Car and Driver) is six mostly-propane portables, 15 minutes each, in one Michigan garage. Bob Vila tested ACs 80→70 °F in a 240 ft² garage. Parasite sites ("I spent three months testing…") rank with invented testing. No one publishes cost-per-hour at local energy prices, the circuit a heater needs, or CO numbers side by side.
4. **Weak and spammy results rank.** Expired or reused domains rank for garage terms with "(September 2026)" in the title: sarahleeandjohnny.com (92 Amazon links on one page), findingdulcinea.com, progressiveradionetwork.com, panozauto.com, peccadille.net, and spam `.pl` sites at #8–9 for "garage heater calculator". These fall in every spam update, so the positions are there to take.
5. **The most winnable clusters in 60 days** (ranked in §5): (1) garage heater calculator / BTU sizing, (2) diesel heater for garage (peaks 22–27k/mo Dec–Jan), (3) propane-in-garage safety, (4) cost-to-run / "most efficient garage heater" (5,400/mo), (5) garage mini-split sizing (high CPC). Garage door insulation has the biggest volume (49.5k/22.2k) but the head terms are retail product results. We should attack its long tail (R-value, kit vs new door, bottom seal) and not the head.

---

## 1. SERP landscape map (who wins what, today)

| Cluster | Demand (US/mo, dossier) | Who ranks (types) | Result features | Winnability for a new domain |
|---|---|---|---|---|
| garage heater (head) | 27,100 · electric 14,800 · best 5,400 | AI Overview, product carousels, herschel-infrared (manufacturer), retailers (commercialheater, gasoutdoorpatioheaters, Home Depot), Car and Driver, The Spruce, Lennox, Reddit, gymcrafter | AI Overview + shopping | Low in 60 days; medium by Jan with links |
| garage heater calculator / size / BTU | 880 (peak 2,900 Jan) · 390 · 320+320 · 210 | acdirect blog, Reddit r/hvacadvice, GarageJournal thread, PickHVAC, heatinghelp forum, spam `.pl`. Newer tools not yet top: howmanybtus, toolgrit, toolcroze, King Electric, Heat Wagon | Forum-heavy, few real tools | **High** |
| diesel heater for garage | 6,600 avg (22–27k Dec/Jan; ~30 in June) · best 480 · vevor diesel heater 40,500 | Reddit r/dieselheater, Turbro, Amazon, YouTube (Hcalory, Project Farm), VEVOR blog, GarageJournal "Chinese diesel heater", SunFire (manufacturer) | Video + forum + retail | **High** (no independent, safety-first garage page) |
| propane heater for garage | 9,900 (grouped variants) · is it safe… 90 (peak 390) | Retailers, Reddit, combustionresearch.com (manufacturer), Euliss propane, GarageJournal threads | Retail + forum | Medium-high on safety/vented long tail |
| most efficient / cost to run | most efficient 5,400 · cheapest way 390 · cost to heat 50 | electricgarageheaterguide.com (cost calc), thegarage.guide, Angi (installation cost), EcoFlow blog, parasite listicles | Mixed | **High** |
| mini split for garage | 3,600 (peak 8,100 Jul) · ductless 1,600 · best 480 · sizing long tail 50–90 each | Carrier, Bryant, MRCOOL dealers, Filterbuy, AC Direct, Della, Comfort Temps, South Mini Splits, Reddit, FineWoodworking | Manufacturer + retailer | Medium (high CPC $2–3) |
| garage door insulation (kit) | 49,500 · kit 22,200 · best kit 590 · R-value 720 | Amazon, Lowe's, Home Depot, Walmart listings, Bob Vila (tested), Family Handyman, garage-door dealers, parasite listicles | Shopping-heavy | Low for head; **high for long tail** |
| garage cooling (AC/dehumidifier/fan) | 12,100 each (peaks 33–40k Jul) | Bob Vila (tested Jul 2026), Filterbuy, retailers, parasites | Shopping | Off-season now; plan for Apr–Jul 2027 |
| garage gym heater | 210 · best heater for garage gym 170 | Garage Gym Reviews (Mediavine, "GGR Score"), gymcrafter, homegymunlimited, powerliftingtechnique, Turbro blog | Niche publishers | Medium; low volume |

**Keyword-data note for the team:** Google groups close variants into one volume number. "propane heater for garage", "lp heater for garage", "lpg garage heater" and similar all show 9,900 because they are **one** demand pool, not 7×9,900. Do not add them up. The same applies to the 49,500 "garage door insulation / thermal / heat insulation" set.

**KD caveat:** KD is ~0 across the niche because ranking pages have few backlinks. That does **not** mean easy head terms. Google gives those to trusted domains, Reddit, AI Overviews and shopping results. KD 0 is real only where the results are forums, thin tools and parasites: the calculator, diesel, safety and cost clusters.

---

## 2. Page-by-page teardowns

### 2.1 Car and Driver: "Tested: Best Garage Heaters for 2026"
URL: https://www.caranddriver.com/car-accessories/g43410202/best-garage-heaters-tested/

| Field | Finding |
|---|---|
| Format | Hearst "gallery" listicle, 6 products, ~3,700 words incl. chrome. Published 2023-03-28, **modified 2025-11-17** (a pre-winter refresh pattern, so expect another refresh in Nov 2026). |
| Bylines | Gannon Burgett (Testing Editor), Jon Langston (Deputy Editor). "Tested by" Collin Morgan (Commerce Editor, ex-technician) and Katherine Keeler (Associate Testing Editor). Each has a bio. |
| Picks | Best Overall **Mr. Heater Big Buddy** (18k BTU propane; shows **$339 Amazon vs $140 Walmart/Wayfair**, a stale or wrong price widget); Runner-up **Heat Hog 9,000 BTU**; Large garages **DeWalt DXH70CFAV 68k BTU** forced-air propane ($195); Shops/barns **Remington 80k BTU** kerosene/diesel; Best infrared **Briza 1500 W** (a *patio* heater); Workbench **Isiler 1500 W** ceramic. |
| Test method | One Michigan garage. Door opened until 50 °F, then closed; each heater ran 15 min in the same spot; room temp read "using a thermostat"; thermal camera for distribution; readings at 10 ft in front, ceiling above, surface. Only number published: Remington took the garage **53→61 °F in 15 min** (door cracked, 38 °F outside). |
| Sizing advice | "10 watts per sq ft for electric or 45 BTU per sq ft for gas." Those two rules don't agree: 10 W = 34 BTU, not 45. |
| Monetization | Amazon (`/dp/` links), Walmart, Wayfair, Farm & Fleet price widgets; display ads ("Advertisement – Continue Reading Below" ×4); cross-links to Hearst gear roundups. |
| Visual quality | **7/10.** Clean Hearst template (Inter + Lora, accent #1c5f8b), original photos credited to staff, thermal images. Ad breaks and generic layout. |
| E-E-A-T | Strong: named testers with bios, hands-on photos, a "Why Trust Us" block, and a no-paid-placement policy. |
| Weaknesses to exploit | (1) **No hardwired 240 V electric heaters** (Fahrenheat FUH54, Comfort Zone CZ220/CZ230, NewAir G56, Dr. Infrared DR-975), even though that is the most common "real" garage-heater purchase. (2) No mini-split / heat pump and no diesel parking heater (VEVOR / Hcalory), which are the fastest-growing categories. (3) No natural-gas unit heaters (Big Maxx, Hot Dawg; 2,900 + 1,600 searches/mo). (4) No cost per hour, no circuit or breaker guidance, no CO measurements despite testing a kerosene torpedo indoors. (5) A 15-minute test doesn't show steady-state capacity. (6) Recommends a patio heater as "best infrared". (7) Wrong price data. |

### 2.2 The Spruce: "The 8 Best Garage Heaters" (UNVERIFIED)
URL: https://www.thespruce.com/best-garage-heaters-4176054

- **Not fetchable.** curl returns HTTP 402; the domain is refused for our user agent. The dossier confirms it ranks for "garage heater" and "best garage heater" with an 8-product format.
- **Expected format (Dotdash Meredith house style; confirm by manual visit):** 8 picks with award labels, a "Why trust The Spruce" block, a named writer plus an expert reviewer or fact-checker, retailer price widgets (Amazon, Home Depot, Walmart), a spec box per product, FAQ, and a date stamp. DDM usually lab- or home-tests with rating scales.
- **Weaknesses to expect:** the same generic multi-fuel roundup as other publishers. There is no sizing tool, no circuit or cost math, garage heating is a small part of a large home site, and the page is refreshed yearly. The ops team should do a manual browser check and fill in the actual picks, author and date.

### 2.3 PickHVAC: "Garage Heater Size Calculator: How Many BTU Do I Need?"
URL: https://www.pickhvac.com/garage-heater/sizing/

| Field | Finding |
|---|---|
| Format | Embedded calculator plus ~2,700-word guide. Published 2021-09-03, modified 2025-06-03. |
| Author | Rene Langer, "Senior Comfort Specialist", 10 yrs HVAC, HVAC associate degree, EPA and R-410A certifications. |
| Calculator | Inputs: climate zone (3, 4, 5&6, 7), length×width, ceiling height, insulation (Poor default/Average/Good), attached vs detached. Output: BTU and watts (1 W = 3.412 BTU). **Algorithm not disclosed.** |
| Tables | By garage size and zone (average insulation, detached): 10×20 = 8,000 / 9,000 / 10,500 / 12,000 BTU for Z3 / Z4 / Z5-6 / Z7, which works out to **40 / 45 / 52.5 / 60 BTU/ft²**. By area: 300 ft² 9–18k, 400 ft² 12–24k, 500 ft² 15–30k, 600 ft² 18–35k (so 30–60 BTU/ft²). 1-car 180–288 ft², 2-car 440–600 ft², 3-car 650–770 ft². |
| Monetization | **Pay-per-call lead gen**: "Free Local Quotes: 888-894-0154" repeated ~4×, with "Compare Local Quotes" CTAs (Networx partnership disclosed). Also Amazon Associates and Awin. |
| Visual quality | **4/10.** Dated WordPress (Open Sans; default WP blues #2271b1 / #2f71bc), phone-number banners, and the calculator looks like a plain form. |
| E-E-A-T | Credentialed author. No citations (no ASHRAE, DOE or ACCA), "many studies have shown" claims, no methodology. |
| Weaknesses | Black-box math; only 4 climate buckets and no ZIP/design temperature; no door, window or infiltration inputs; no fuel-cost output; no product matching; no circuit guidance; aggressive phone CTAs; content from 2021. |

### 2.4 AC Direct: "BTU Heater Calculator: Size Heat Correctly" (from search extracts; site returns 403)
URL: https://www.acdirect.com/blog/btu-heater-calculator/ (sister pages: `/blog/garage-heater-buying-guide/`, `/garage-ac-units`)

| Field | Finding |
|---|---|
| Format | Retailer blog calculator plus explainer. It ranks #1-ish for "garage heater calculator" per the dossier. |
| Inputs described | Climate zone, insulation R-value, window U-factor, ceiling height, air infiltration. |
| Rules published | Rule-of-thumb **25 BTU/ft² (mild, good insulation) to 70 BTU/ft² (cold, poor insulation)**. It says "garages, shops, and uninsulated spaces need their own math". For garage AC: **25–35 BTU/ft²** vs 20 for living space; apply **1.25–1.50×** to the Mini Split Sizing Calculator result (1.5 for a metal door, unfinished walls, South/Southwest). Good line: "A BTU heater calculator gives you a heat load, not an equipment nameplate rating." |
| Monetization | Own store: mini splits, garage AC units, heaters. The calculator funnels to the catalog. |
| Visual quality | Not verified (403). Retailer blog template, estimated **5/10**. |
| E-E-A-T | Retailer expertise with technical vocabulary (U-factor, infiltration). Commercial bias. |
| Weaknesses | Garage handled as a correction factor on residential math; biased toward selling mini splits; not independent; no comparison across fuels or brands; no cost-to-run at local prices. |

### 2.5 Bob Vila: "The Best Garage Heaters for Workshop Comfort, Tested" + "We Tested the Best Garage Door Insulation Kits" + "Best Garage Air Conditioners, Tested"
URLs: https://www.bobvila.com/articles/best-garage-heater/ · https://www.bobvila.com/articles/best-garage-door-insulation-kit/ · https://www.bobvila.com/reviews/best-garage-air-conditioner/

- **Heaters** (updated Aug 2024, so stale). 10 picks: Comfort Zone ceiling-mount (Best Overall), Lasko ceramic (value), Fahrenheat FUH (ceilings), Dr. Infrared DR-988 (infrared), Mr. Heater MH200CVX (barns), DR-966, Briza, Bio Green Palma, DeWalt 20V, Flame King. Test in Tom Scalisi's **uninsulated** garage. Sizing: "10 W per ft²", and "a 2-car needs 3,000 W or ~18,000 BTU gas". Those two figures don't match: 3,000 W ≈ 10,236 BTU.
- **Door insulation kits** (modified 2025-09-09). 5 tested over 1 week, priced $30–$130. Picks: Reach Barrier 3009 (Best Overall), US Energy Double Bubble foil (value, R-4), Nasatek 2-car foam kit (upgrade, R-8), Nasatek 1-car reflective, Matador (easy install). **Method:** a 2-bay garage with one door left uninsulated as the **control**; infrared thermometer 1 h after install showed **8–10 °F warmer** on the insulated door side. Monetization: 36 Amazon + 36 Home Depot links, Skimlinks, Impact.
- **Garage AC** (published 2026-07-28, fresh). 4 tested in a 240 ft² single-car garage, timed 80→70 °F: Dreo AC515S **45 min**, Coolblus 12k **55 min**, Keystone 14k **20 min**, LG window unit. 39 Amazon + 30 Home Depot + 13 Lowe's links.
- **Visual quality 6/10.** Recurring Media Group template (Roboto / IBM Plex Mono, Gutenberg preset colors #00d084 / #0693e3), staff photos mixed with Amazon images, "Testing Stats" box.
- **E-E-A-T:** named testers, a clear control-door method, a disclosure. **Weaknesses:** heater page 2 years old; one uninsulated garage; no energy-cost comparison; no sizing tool; no circuit guidance. The insulation test measures door surface temperature rather than heating load or dollars saved.
- **Borrowable idea:** the **control door / A-B garage** method is cheap, credible and easy to show in photos. We can copy it for real tests later.

### 2.6 Garage Gym Reviews: "Best Garage Heaters for Your Home Gym (2026)"
URL: https://www.garagegymreviews.com/best-garage-heater

- Published 2023-04-29, **modified 2026-06-02**, ~7,500 words incl. chrome. Written by Lauren (NSCA-CPT), "Expert-Verified" by staff, plus "resident HVAC expert Matt Strong (professional engineer, competitive powerlifter)". Founder Coop Mitchell's own MRCOOL anecdote.
- Picks: **MRCOOL mini-split heat pump (Best Overall; 9,000 BTU, 19 SEER, "up to 350 ft²")**, NewAir G56 5,600 W / 19,100 BTU 240 V (~$150, "600 ft²"), GoFlame oil-filled radiator (budget), Mr. Heater Big Maxx (wall-hung NG), Mr. Heater vent-free Blue Flame (small NG).
- Proprietary **"GGR Score"** per product (value, functionality, and so on, 1–5), Product/Review/FAQPage schema, **Mediavine** ads, "Check Price" buttons.
- **Visual 7/10**: strong brand (gold #ffc468 on navy #050024, Proxima Nova), scorecards, lots of images (91 `<img>`).
- **Weaknesses:** gym audience only; no sizing math beyond manufacturer ft² claims; recommends a **vent-free** gas heater for an enclosed training space (a CO/humidity issue during heavy breathing) with little safety depth; the mini-split "best overall" is a 9k unit rated for 350 ft², undersized for most 2-car garages.
- **Borrowable:** the audience-specific framing ("for your garage gym / woodshop / car-restoration bay") and one clear proprietary score.

### 2.7 VEVOR blog: "Best Diesel Heater for Garage 2026: Top Picks & Safety Guide"
URL: https://www.vevor.com/diy-ideas/best-diesel-heater-for-garage-2/

- Byline "Eric", dated 2025-12-16, ~2,500 words, 3 header images. VEVOR orange #ff5023, Inter Tight. **Visual 6/10.**
- Picks: VEVOR 12V 8 kW all-in-one (Best Overall), "Eberspächer Portable 5 kW", "Propex 10 kW", VEVOR 3 kW, "Snugger 5 kW". **No prices.** Sizing: 3 kW small, 5 kW medium, 8 kW+ large.
- Safety: generic advice (open a window, get a CO detector, 2 ft clearance, monthly filter cleaning). **No ppm thresholds, no exhaust-routing diagram, no fuel-burn-to-heat math** (states 0.1–0.5 L/h with no BTU link). Conflicts with VEVOR's own product-page warnings. Some VEVOR units have CO alarms that trigger at **300 ppm** and shut off at **500 ppm**, which is far above typical home CO alarm thresholds.
- Monetization: own store, with bias not disclosed.
- **Why it matters:** this is the brand's own page ranking for the cluster's head terms. An independent page is missing: brands compared, a through-wall exhaust kit diagram, a battery/12 V power plan, a CO-alarm spec, and cost per hour on diesel vs propane vs electric.
- Other diesel players: **SunFire** (US-made 80–160k BTU radiant diesel/kerosene; manufacturer site), **Project Farm** (YouTube test of VEVOR / Hcalory / SILVEL / LF Bros: Hcalory quietest on high, LF Bros hottest air), 4wdtalk.com, thecampingnerd (van-focused). **No garage-focused independent diesel hub exists.**

### 2.8 Filterbuy: "Best Mini Split for a Garage (2026)" and "How to Cool a Garage"
URLs: https://filterbuy.com/heating-cooling/mini-splits/guides/best-mini-split-for-garage/ · https://filterbuy.com/resources/mini-splits/guides/how-to-cool-a-garage/ (modified 2026-09-23)

- Company byline, no named author. Only its own **Filterbuy 12,000 BTU** unit featured (SEER 17, 115 V, heats to 5 °F, 7-yr compressor warranty).
- Sizing: ×1.3–1.5 garage factor. 1-car 12–18k, 2-car 18–24k, 3-car 24–36k+. Cost: unit $800–3,500 + install $1,000–2,000, **total $2,000–5,000**. Heavy HowTo schema (36 hits).
- **Visual 6/10** (SVG sizing infographic, clean). **Weakness:** single-brand sales page; no cross-brand comparison; no cold-climate capacity (HSPF2 / capacity at 5 °F) data; no DIY-vs-pro breakdown by brand.
- Related mini-split results: **Carrier** and **Bryant** (manufacturer "find a dealer" lead gen, 2-car = 18k single zone), **Della** (retailer, 2024), **Comfort Temps**, **South Mini Splits**, **AC Direct** garage AC collection, and **MiniSplitSizer.com** (independent affiliate tool site: BTU corrector, SEER2 payback, cost calculator; "HVAC engineering team" byline; visual 7/10).

### 2.9 Garage-calculator competitors (the cluster we most want)

| Site / URL | What it does well | Monetization | Visual | Gaps |
|---|---|---|---|---|
| **howmanybtus.com/garage-heater-calculator/** (mod. 2026-08-16) | The most technically honest: surface heat loss plus explicit **ACH presets (0.5 / 1.0 / 2.0)**, door count and size presets (9×7, 16×7, 12×7, 20×7), door R presets (R-2 / R-6–8 / R-13–18), **outdoor design temp** input, target temp; HowTo + FAQ schema | Light (1 Lowe's link) | **2/10** (unstyled, no images) | No products, no cost, no visuals, no brand |
| **toolgrit.com/tools/shop-heater-btu-calculator** (Dirt River Design) | Engineering-grade envelope rows (wall, ceiling, door, window, slab R), slab-edge F-factor, air-tightness class, fuel-cost prompts, **PDF/CSV export**, "review checklist", cites ASHRAE / UL 1484 / ACCA / IFGC / 2024 IECC | Amazon ("Shop heat kit": Senville AURA 24k, Big Maxx, ceiling heater, line-voltage t-stat), B2B referrals, "Buy me a coffee" | **5/10** (orange #fb8500, busy, SaaS-ish) | Formulas not shown; heavy disclaimers; generic "shops & outbuildings" framing |
| **toolcroze.com/garage-btu-calculator/** (2026-07-13) | Inputs incl. leakage, door area, efficiency, **recovery time** | AdSense (9 hits), Awin | **3/10** (purple #7b2fbf) | Generic calc farm, no authority |
| **King Electric** (king-electric.com/pro-tips/how-to-size-a-garage-heater/) | **Sizing that filters into the manufacturer's own SKU table**: zone 1–4, voltage (208/240/277/480), phase, thermostat type, portable vs permanent, insulation (Above std / FHA std / Minimum), dimensions → W/ft² → matching models with amps | Own products ("Buy Now") | 5/10 | Single brand; zone map not US-intuitive |
| **Heat Wagon** (heatwagon.com/heater-size-btu-calculator/) | Size × heat retention × temp rise | Own products / dealers (Awin) | 4/10, ~250 words | Construction-heater audience |
| **garagemadesimple.com/r-value-calculator/** ("Ted", retired engineer) | **Effective R-value** for door, walls, ceiling and floor with stud-fraction math, air films (0.68 / 0.17), IECC zone compliance, **downloadable PDF** | AdSense + Amazon | 4/10 (Tahoma / Raleway, pink #e8015c) | No heat-load or dollars output; no heater link |
| **diysmarthomehub.com** (door R-value + heat-loss calculators) | Zone-labeled with cities (Zone 5 "Chicago, Minneapolis"), recommended door R by zone | **Raptive** (113 ad hits) | 4/10 | Thin, ad-choked |
| **electricgarageheaterguide.com** (AU-timezone WP site, launched ~Nov 2025) | **Direct competitor to today's BayHeat** (electric-only). Cost calculator (watts ÷ 1000 × rate × hours) with hourly/daily/monthly/yearly output; clear examples (1500 W $0.23/h, 5000 W $0.75/h, 7500 W $1.13/h at $0.15/kWh) | Amazon/Lowe's/Awin, light | **3/10** (default Astra blue #046bd2) | No author, no images, no sizing-to-product flow |
| **thegarage.guide** (Mar 2026) | **Whole-garage topical hub**: cost guides with numbers in meta descriptions, "Garage Door Replacement Cost Calculator", heater guide with formula **BTU = ft² × ΔT × insulation factor (0.45 / 0.65 / 0.85 / 1.10)**, ventilation/CO guide, winterize checklist, 240 V wiring facts (5,000 W = 20.8 A → 30 A breaker, 10 AWG) | **"Get Free Quotes" (Networx lead form)** on every page; Lowe's affiliate | **5/10** (earthy palette #2b3a4a / #c8875f / #c45b3b / #f5f0eb, emoji category nav, ~1 image per page) | Looks AI-written, no named author, no testing, no interactive heater tool |

**What the calculator cluster tells us:** functional calculators exist, but they are ugly, unbranded, and stop at a BTU number. None of them combines **load → equipment → circuit → cost → insulation ROI → specific products** in one flow, and none is shareable or visually memorable.

### 2.10 Others worth knowing

- **Popular Science, "The best garage heaters"** (2023-11-08, stale): 9 picks, "how we chose" with no testing, 62 tagged Amazon links, Skimlinks. Visual 6/10. Easy to beat on freshness.
- **Parasite / expired-domain listicles:** sarahleeandjohnny.com ("10 Best Garage Heaters (September 2026)", published 2026-09-15, 92 Amazon links, fake first-person "I spent the last three months testing…", Tailwind indigo #4f46e5 template), findingdulcinea.com, progressiveradionetwork.com ("Cost To Heat Garage 2026"), panozauto.com (garage door insulation kits), peccadille.net, thehomepicker.com. **They show the SERP is soft**, and each spam update frees slots.
- **combustionresearch.com "Best Garage Heaters Tested for 2026"** (2026-07-22): a manufacturer listicle with generic category picks that funnels to its own commercial infrared tube heaters.
- **Garage.com**: a premium domain used for **pay-per-call garage-door service lead gen** (833 number) with thin "best insulation" content.
- **ProGarageGear.com**, "Matador R-4.8 vs Owens Corning… R-Value Tested" (modified 2026-09-01): claims a **20 °F-outside test with a 5,000 W heater for 1 h**: uninsulated 38 °F, Matador R-4.8 48 °F, R-8 55 °F, max 58 °F. It explains U = 1/R and "an R-18 door performs like R-9–12 as a system". AdSense + Amazon. Visual 5/10. **This is the kind of numeric, outcome-framed content that wins insulation queries.**
- **Family Handyman**, "6 Best Garage Door Insulation Kits" (2025-06-16): 53 Amazon / 48 Home Depot / 16 Walmart / 14 Lowe's links, Skimlinks + Impact.
- **The Garage Journal forum**: the community of record (100k+ topics). Threads rank for calculator, propane venting, diesel and dehumidifier queries. Recurring advice: "insulate first, then heat"; 7,500 W electric (run at 5 kW) heats a 600 ft² insulated garage; Toyostove Laser 73 (40k BTU direct-vent) for extreme cold; Big Buddy for small insulated garages. **This is where our tool should get linked**, by helping in threads (not spamming) and offering an embeddable widget.
- **Reddit** (r/hvacadvice, r/dieselheater, r/HomeImprovement): ranks across every cluster. Not beatable directly, but citable, and a distribution channel.
- **Angi / HomeAdvisor**: owns "garage heater installation cost" (CPC **$13.98**) with cost-guide lead gen (blocked fetch, 403).

---

## 3. Cross-cutting analysis

### 3.1 The sizing-rule mess (why a transparent planner wins)

Same garage: **24×24 ft (576 ft²), 9 ft ceiling, one 16×7 door**, target 50 °F, design outdoor 0 °F (ΔT = 50 °F):

| Source | Rule | Result |
|---|---|---|
| Bob Vila | "2-car → 3,000 W" | 3,000 W ≈ **10,200 BTU/h** |
| Car and Driver | 10 W/ft² electric · 45 BTU/ft² gas | 5,760 W (**19,650 BTU/h**) or **25,920 BTU/h** |
| Filterbuy / Bryant (mini split) | 2-car 18–24k | **18,000–24,000** |
| PickHVAC | ~52.5 BTU/ft² (Z5-6, avg insulation) | **~30,240** |
| thegarage.guide | ft² × ΔT × factor | insulated 0.45 → **12,960**; uninsulated 1.10 → **31,680** |
| AC Direct | 25–70 BTU/ft² | **14,400–40,320** |
| **Physics (our method)** | ΣA/R·ΔT + slab F·P·ΔT + 0.018·ACH·V·ΔT | **uninsulated ≈ 33,000 BTU/h (9.7 kW); insulated ≈ 10,400 BTU/h (3.0 kW)** |

Assumptions for the physics row:
- **Uninsulated case:** walls 752 ft² at R-3; door 112 ft² at R-2; ceiling 576 ft² at R-3; slab edge 96 ft × F 0.73; 1.0 ACH on 5,184 ft³.
- **Insulated case:** walls R-13, ceiling R-30, door R-8, 0.5 ACH.
- **Load breakdown, uninsulated:** walls 38%, ceiling 29%, infiltration 14%, slab edge 11%, door 8%.
- **Load breakdown, insulated:** slab edge 34%, infiltration 22%, walls 28%, ceiling 9%, door 7%.

**Content hooks from this math:**
- "Insulating the whole garage cuts the heater you need by ~70%."
- "A door kit alone saves ~6% of load in an uninsulated garage. Air-seal and do the ceiling first." This contrarian, data-backed angle is linkable, but show it honestly next to the door-kit affiliate content.
- "Bottom seal (27,100/mo) matters more than the panel kit." Infiltration (4,666 BTU/h) is ~1.7× the door's conduction loss (2,800 BTU/h).

Every competitor gives one number. **Nobody shows the range, the drivers, or where the heat goes.** That is the core product insight.

### 3.2 Monetization benchmarks observed

| Model | Who uses it | Economics (public data) |
|---|---|---|
| Amazon Associates | Almost everyone (C&D, Bob Vila, PopSci, FH, parasites, ToolGrit, GMS) | Home Improvement **3%** public rate (2026 cuts hit negotiated rate cards). Heater AOV $150–400 → **$4.50–12/sale**; diesel $100–200 → $3–6; door kit $60–150 → $2–4.50. 24 h cookie. Our tag `laqaer-20` is live. |
| Home Depot (Impact) | Bob Vila, FH | **1%** most products (8% select décor), **24 h cookie**. Weak. |
| VEVOR (Awin / Impact / in-house) | VEVOR blog, many diesel pages | **2–10%** (some sources up to 15%), **30-day cookie**, AOV ~$200. **Better than Amazon for diesel heaters.** |
| MRCOOL DIY Direct | Mini-split pages | **4%**, but *contractor-only* program (e.g. $2,888 36k system → $115.52). HVACDirect has an affiliate program (rate undisclosed). Worth applying to both. |
| Contractor lead gen (Networx) | PickHVAC (phone 888-894-0154), thegarage.guide (form) | Contractors pay **$14–100/lead**, shared with up to 4 pros. Publisher rev-share not public. High-CPC queries show lead value: garage heater installation cost **$13.98 CPC**, garage insulation contractor **$12.85**, insulation cost for garage **$8.68**, cost to insulate garage **$5.38**, radiant floor heat garage **$6.70**. |
| Display ads | GGR (Mediavine), DIY Smart Home Hub (Raptive), ToolCroze / ProGarageGear / GMS (AdSense) | Needs volume: Mediavine ~50k sessions/mo, Raptive 100k pageviews. Don't plan on it before winter 2027. |
| Own products | VEVOR, Filterbuy, AC Direct, King Electric, SunFire, Combustion Research | Content is a sales funnel with an obvious bias. Our independence is the counter-position. |
| Pay-per-call | PickHVAC, Garage.com | Aggressive UX; hurts trust. |

**Takeaway:** thin Amazon margins mean revenue needs (a) volume in the Dec–Jan peak, (b) higher-ticket routes (mini splits, 240 V hardwired heaters $200–700, vented gas unit heaters $500–1,500), (c) VEVOR direct for diesel, and (d) a lead or quote path for installation-cost queries, env-gated until a partner exists. An owned email list is the one asset none of the competitors build well.

### 3.3 Design / visual landscape

- Palettes in the niche: corporate blue (#1c5f8b C&D, #2271b1 PickHVAC, #046bd2 EGHG), WordPress defaults (#00d084 / #0693e3), retailer orange (#ff5023 VEVOR, #fb8500 ToolGrit), earthy beige (#f5f0eb / #c8875f thegarage.guide), Tailwind indigo on parasites (#4f46e5).
- **No one uses the obvious visual language of the topic: thermal imaging.** Heat-gradient ramps (deep indigo → magenta → orange → white-hot), infrared "camera" overlays on a garage cutaway, and live heat-loss flows would stand out in every SERP thumbnail, social share and Pinterest pin.
- **Nobody has original illustration**: no garage cutaways, no exhaust-routing diagrams, no circuit diagrams, no "where your heat goes" Sankey. The only original imagery is C&D and Bob Vila staff photos.
- Calculators are plain HTML forms. None uses visual pickers (tap your garage size, door type, insulation), animated results, or a shareable result card.

### 3.4 E-E-A-T patterns that work (and what we can honestly match)

| Signal | Who does it | Can we match now? |
|---|---|---|
| Named testers with bios | C&D, Bob Vila, GGR | Yes, with a real named editor (owner decision). **Don't invent people or credentials.** |
| Credentialed expert reviewer (PE, EPA 608, licensed electrician) | GGR (PE), PickHVAC (EPA) | Only if the owner hires or recruits one (Upwork/Fiverr licensed electrician or HVAC tech for a paid review, ~$100–300/article). Put it on the owner checklist. |
| Control-group testing with numbers | Bob Vila (control door), C&D (15-min ΔT), ProGarageGear (°F table) | Later: a real test program (see §4.6). Until then, **position as "open math, cited sources"**. Never claim testing we didn't do. |
| Standards citations | ToolGrit (ASHRAE, UL, IECC), GMS (IECC) | Yes: cite ASHRAE Fundamentals (design temps, air density 0.018 factor), DOE, EIA prices, NEC 210.19 / 424, NFPA 54/58, CPSC, UL 2021 / 1278, ANSI Z21.11.2 (vent-free). |
| Proprietary score | GGR Score | Yes: a transparent "Fit Score" computed from specs vs the user's garage. |
| Freshness | C&D refreshes every Nov; parasites fake monthly dates | Real changelogs and "prices checked on" stamps. |

---

## 4. What a 10x better resource looks like

Positioning: **"The garage climate authority: size it, power it, price it, fix it."** One brand covering heating, cooling, insulation and sealing, built around a tool that is better than every calculator above, with the visual identity of a thermal camera.

### 4.1 Hero tool: the Garage Climate Planner (flagship, launch before Nov 1)
Flow (mobile-first, visual pickers, ≤60 s):
1. **ZIP code** → ASHRAE 99% heating design temperature and 1% cooling design temperature (static JSON by ZIP3 or county, shipped in the bundle), plus EIA state average prices for electricity (¢/kWh), natural gas ($/therm), propane ($/gal) and heating oil/diesel ($/gal). Every price and temperature is editable.
2. **Garage preset**: 1-car (12×22), 2-car (24×24), 3-car (36×24), custom; ceiling height; attached vs detached (shared wall). Show an isometric illustration.
3. **Envelope** as tap cards: walls (bare studs / R-13 / R-19 + drywall), ceiling (open rafters / R-30 / R-38+), door (uninsulated steel R-0–2 / kit R-4–8 / insulated R-9–18), bottom seal (good / worn), windows count.
4. **Use pattern**: target temp (40 frost-free / 50 workshop / 60 gym / 68 living), hours per week, keep-above-freezing vs on-demand warm-up.
5. **Power and fuel on hand**: 120 V/15 A only, spare 240 V/30 A, panel capacity, natural gas line, propane tank, none.

Outputs:
- **Design load BTU/h and kW**, with a range band (±20%) and a "where your heat goes" breakdown (stacked bar or Sankey: walls / ceiling / door / slab / air leaks).
- **Warm-up time estimate** for on-demand users. Recovery sizing is a real gap; only ToolCroze has it.
- **Equipment matches by fuel**: electric (e.g. 5 kW 240 V → **30 A breaker, 10 AWG copper**, via the NEC 80% continuous rule), vented NG/LP unit heater (BTU input × AFUE), diesel parking heater (kW, fuel L/h), mini-split heat pump (capacity at design temp, not nameplate), and portable propane (spot heat only, with CO warning). Each links to 1–3 specific products with verified ASINs or tagged search links.
- **Cost per hour / month / season by fuel** at local prices. Formula: load × hours × duty ÷ (fuel BTU × efficiency). Fuel constants: propane 91,500 BTU/gal, natural gas 100,000 BTU/therm, diesel ~137,000 BTU/gal, electricity 3,412 BTU/kWh, heat pump at COP 2–3.
- **Upgrade ROI**: "Seal + door kit: $X, saves Y BTU/h, $Z/season, payback N months", ranked cheapest-first. This is the bridge to insulation and seal affiliate products (the 49.5k / 27.1k / 22.2k search pools).
- **Safety panel**: CO alarm requirement for any combustion appliance; vent-free restrictions; diesel exhaust must exit outside; clearances.
- **Shareable result**: a permalink with state in the URL, an OG image card ("My garage needs 18,400 BTU/h · $0.61/h on propane"), a printable PDF, and "email me my plan" (env-gated email capture).
- **Open methodology page** with every formula and constant, plus a worked example. This is the E-E-A-T and link-magnet page, and AI Overviews can cite it.
- **Embeddable widget** (iframe/script) for forums, blogs and YouTube descriptions. Each embed includes a follow link back to us.

### 4.2 Cluster hubs (each one visually rich, tool-embedded, and useful on its own)
- **Diesel heater for garage hub** (publish by Oct 20; peak Dec–Jan): brand matrix (VEVOR, Hcalory, generic, Webasto, Espar, with price bands and warranty), an **SVG through-wall exhaust and intake install diagram**, CO facts (why a 300 ppm heater alarm is not a home CO alarm; UL 2034 alarms sound at 70 ppm after 60–240 min), 12 V power plan (PSU vs battery, UPS tip from the forums), fuel burn → BTU → cost/hour, a noise and altitude table, and "is it legal / insurance" notes. Monetize with VEVOR direct (Awin/Impact) plus tagged Amazon search links.
- **Propane in the garage: safety-first hub**: portable Buddy-class vs forced-air torpedo vs **vented** unit heaters (Big Maxx, Hot Dawg 1,600/mo, Modine 1,000/mo), ODS explained, vent-free rules (ANSI Z21.11.2; restricted in some jurisdictions; verify per state before publishing), ventilation math, a **CO decision tree**, and tank sizing (1 lb vs 20 lb vs 100 lb runtime at BTU).
- **Garage heating cost hub**: "Cost to heat a garage in every state, 2026". A data table from EIA × a typical load, one page per state later. **The linkable data-PR asset** for local news and Reddit.
- **Electric garage heaters (existing BayHeat content, upgraded)**: 120 V vs 240 V, circuit chooser, hardwired picks (FUH54, CZ220, DR-975, NewAir G56). This is where our verified ASINs live.
- **Mini split for garage**: sizing at design temp, cold-climate capacity (HSPF2, rated output at 5 °F), DIY (MRCOOL DIY) vs pro install cost ($2k–7k), "heat pump vs 240 V resistive: 5-year cost" chart. Monetize with high-ticket affiliates and a quote path (env-gated).
- **Insulation and sealing** (year-round volume): "Garage door insulation kit: what it really saves (by the numbers)", kit vs new insulated door, bottom seal and weather-stripping guide, R-value explainer with a system-vs-center-of-panel correction. Comparison table of the 5–6 kits Bob Vila and Family Handyman cover, with R-value, price and weight (spring balance warning).
- **Use-case pages**: garage gym, woodshop (dust and open-flame warnings, no radiant near finishes), car restoration / painting (no open flame near solvents), keep-above-freezing (40 °F), EV garage.
- **Cooling season (build Mar–Apr 2027)**: garage AC / dehumidifier / fan hubs reusing the planner's cooling mode (1% design temp, solar gain on the door).

### 4.3 Visual and brand assets that no competitor has
- A thermal-camera color system for data and brand (heat ramp, cold ramp) used consistently in charts, OG images and illustrations.
- Isometric garage cutaway illustrations (SVG) that react to planner inputs, e.g. the door glows hot when uninsulated.
- A "where your heat goes" animated Sankey or stacked bar.
- Normalized comparison tables across every product: BTU, W, amps, breaker, wire gauge, vent type, realistic ft², price band, cost/h at the user's rates.
- Result share cards (OG images) designed to be screenshot-worthy on Reddit and forums.

### 4.4 Trust architecture (honest E-E-A-T)
- Named editor and a real publisher entity (Laqaer Products), an editorial policy, affiliate disclosure, a **methodology page** and a "sources" block on every page.
- A **"Checked on" date** for every price or spec, plus a changelog.
- **Never** fabricate testing, reviewers, reviews or credentials. The SERP is full of fake "I tested for three months" pages. Being visibly honest ("we did the math, here it is") is a differentiator.
- Owner checklist: recruit a paid licensed electrician and HVAC reviewer for the circuit and gas pages; run a real test program (below).

### 4.5 Technical SEO must-haves
- WebApplication / SoftwareApplication schema on tools; FAQPage where there's genuine FAQ content; HowTo on install guides; ItemList for roundups. Don't use Review / AggregateRating without genuine first-party reviews.
- Fast, static-first pages (Next 16 App Router, server components; the calculator as a small client island). Every tool state reachable by URL.
- Internal link graph: every guide → planner (prefilled with that page's context) → product matches.
- Seasonal refresh cadence: heating pages updated by Oct 15 and again before Black Friday (**Thanksgiving is Nov 26, 2026; Black Friday Nov 27; Cyber Monday Nov 30**).

### 4.6 Later moat: a real test program (Q4 2026 to Q1 2027, owner-funded)
- Buy 3–5 heaters (a 1500 W portable, a 240 V 5 kW, a Big Buddy, a VEVOR 8 kW diesel) plus a door kit. Budget ~$800–1,200.
- Log with cheap temperature/humidity loggers (e.g. Govee or Inkbird) and a CO meter. Run steady-state tests (not 15 minutes), measure warm-up curves and cost per hour, and use Bob Vila's control-door method for insulation.
- Publish raw data (CSV) and charts. This turns "open math" into "open math + measured data", which beats C&D's methodology.

---

## 5. Most winnable SERP clusters in 60 days (by 2026-11-24)

Ranked by (likely rank within 60 days) × (value in the Dec–Jan peak):

| # | Cluster | Key terms (vol/mo, peak) | Why winnable | Asset | Monetization |
|---|---|---|---|---|---|
| 1 | **Garage heater calculator / BTU sizing** | garage heater calculator 880 (2,900 Jan) · garage heater size calculator 390 · garage btu calculator 320 · btu calculator garage 320 · btu calculator garage heater 210 · how many btu to heat a garage 210 · what size heater for 2-car garage 70 · garage heater sizing 70 · mini-split calculator variants 50–90 each | The top 10 is forums, a retailer blog, a 2021 black-box calculator and spam `.pl` sites. Rival tools are ugly and unbranded. Tools earn links and forum citations. | Garage Climate Planner + methodology page + size-specific landing pages (1-car / 2-car / 3-car / 600 ft² / detached) | Product matches (Amazon, VEVOR), email capture, quote path |
| 2 | **Diesel heater for garage** | diesel heater for garage 6,600 (22–27k Dec/Jan) · garage diesel heater 6,600 · diesel fuel heater for garage 6,600 (same pool) · best diesel heater for garage 480 (1,600 peak) · vevor diesel heater for garage 880 | Only Reddit, retailers, YouTube and VEVOR's own biased blog. No independent garage-specific install or safety guide. The seasonal spike is right after our indexing window. | Diesel hub + install diagram + brand matrix + cost/hour | VEVOR affiliate (2–10%, 30-day cookie), Amazon tagged search |
| 3 | **Cost-to-run / efficiency** | most efficient garage heater 5,400 · cheapest way to heat a garage 390 (1,300 peak) · most efficient way to heat a garage 110 · electric vs propane garage heater 90 · cost to heat a garage 50 | Competitors are a small WP site, AI-ish thegarage.guide and parasites. A local-price calculator plus a state table is unmatched. | Cost mode of the planner + "cost to heat a garage by state" data page | Amazon, mini-split affiliates, email |
| 4 | **Propane / gas in the garage (safety + vented)** | propane heater for garage 9,900 pool · is it safe to use propane heater in garage 90 (390 peak) · vented garage heater 260 (880 peak) · natural gas garage heater 2,900 · hot dawg 1,600 · big maxx 2,900 / 390 | Retail and forum results with weak safety depth. Safety content earns trust and links. Branded model terms have low KD. | Propane safety hub + vented unit-heater comparison (Big Maxx vs Hot Dawg vs Modine) | Amazon (Big Maxx / Hot Dawg are $400–1,000+ → $12–30/sale), installation quote path |
| 5 | **Mini split / heat pump for garage (sizing long tail)** | what size mini split for 2-car garage 90 · sizing mini split for garage 70 · mini split calculator for garage 50 · garage heat pump 390 · heat pump for garage 390 (1,000 Jan) · best mini split for garage 480 | Retailer and manufacturer results. Heat-pump-for-winter is under-served, and the CPCs ($1.60–2.76) signal value. | Mini-split mode of the planner + "heat pump vs electric heater" cost chart | High-ticket affiliates (apply: HVACDirect, MRCOOL), quote path |
| 6 (long tail) | **Door insulation and sealing, long tail** | garage door insulation r value 720 · best garage door insulation kit 590 · garage door insulation panels 5,400 · cellofoam kit 4,400 · owens corning kit 2,400 · DIY kit 2,400 | Head terms are shopping results; mid-tail is Bob Vila, Family Handyman and parasites. A numbers-first page ("what it really saves") and R-value explainer can place. | Insulation ROI in the planner + kit comparison + R-value explainer | Amazon (kits $60–150), bottom seals |

**Not for the 60-day window:** the "garage heater" / "best garage heater" head terms (AI Overview, shopping, C&D / Spruce). Build toward them with links earned by the planner. The garage AC and dehumidifier cluster is off-season; produce in Mar–Apr 2027 for the Jun–Aug peak. "garage gym heater" (210 + 170) is GGR's home turf; do it as a cheap use-case page, not a pillar.

---

## 6. Threats and watch-items for the operating team

1. **Car and Driver will likely refresh in Nov 2026** (last modified 2025-11-17). The Spruce and Bob Vila may too. Our edge is tools and specificity, not brand authority.
2. **AI Overviews** will answer "how many BTU for a 2-car garage" directly. Counter with an interactive tool (AI can't replace it), clear tables AI Overviews can cite, and share cards.
3. **thegarage.guide** is the closest to "a garage brand". It is broad, has quote forms and could add a heater calculator quickly. Beat it on design, tool depth and honesty.
4. **electricgarageheaterguide.com** targets exactly today's BayHeat electric long tail. Out-tool and out-design it; don't match it page for page.
5. **VEVOR** owns its brand SERP (40,500/mo "vevor diesel heater"). Don't fight the brand term; win "for garage", "install", "safe" and "vs".
6. **Google spam updates** could remove parasite listicles (good), but also reward only sites with visible real authorship. Put the named editor and publisher entity live at launch.
7. **Amazon rate volatility** (2026 cuts). Diversify to VEVOR, HVACDirect and lead gen as soon as possible (owner checklist).

---

## 7. Sources (fetched or searched 2026-09-25)

- Car and Driver: https://www.caranddriver.com/car-accessories/g43410202/best-garage-heaters-tested/ (fetched)
- The Spruce: https://www.thespruce.com/best-garage-heaters-4176054 (blocked: HTTP 402)
- PickHVAC: https://www.pickhvac.com/garage-heater/sizing/ (fetched)
- AC Direct: https://www.acdirect.com/blog/btu-heater-calculator/ (403; search extracts) · https://www.acdirect.com/garage-ac-units · https://www.acdirect.com/blog/garage-heater-buying-guide/
- Bob Vila: https://www.bobvila.com/articles/best-garage-heater/ · https://www.bobvila.com/articles/best-garage-door-insulation-kit/ · https://www.bobvila.com/reviews/best-garage-air-conditioner/
- Garage Gym Reviews: https://www.garagegymreviews.com/best-garage-heater
- VEVOR: https://www.vevor.com/diy-ideas/best-diesel-heater-for-garage-2/ · https://www.vevor.com/diy-ideas/diesel-heater-indoors/
- Filterbuy: https://filterbuy.com/heating-cooling/mini-splits/guides/best-mini-split-for-garage/ · https://filterbuy.com/resources/mini-splits/guides/how-to-cool-a-garage/
- Carrier: https://www.carrier.com/us/en/residential/hvac-resources/ductless-mini-splits/ductless-mini-split-for-garage/ · Bryant: https://www.bryant.com/en/us/products/ductless-systems/garage-mini-split/ · Della: https://dellahome.com/blogs/della-blog/what-size-of-mini-split-right-for-garage
- Calculators: https://howmanybtus.com/garage-heater-calculator/ · https://www.toolgrit.com/tools/shop-heater-btu-calculator · https://toolcroze.com/garage-btu-calculator/ · https://king-electric.com/pro-tips/how-to-size-a-garage-heater/ · https://heatwagon.com/heater-size-btu-calculator/ · https://garagemadesimple.com/r-value-calculator/ · https://www.diysmarthomehub.com/garage-door-r-value-calculator/ · https://minisplitsizer.com/
- Garage niche sites: https://thegarage.guide/ · https://thegarage.guide/guides/garage-heater-guide · https://thegarage.guide/reviews/best-garage-heaters · https://electricgarageheaterguide.com/cost-to-run-electric-garage-heater/
- Others: https://www.popsci.com/gear/best-garage-heaters/ · https://www.sarahleeandjohnny.com/best-garage-heaters/ · https://combustionresearch.com/feeds/blog/best-heater-shop · https://thehomepicker.com/best-garage-heaters-2026/ · https://progaragegear.com/best-garage-door-insulation-kits/ · https://www.familyhandyman.com/list/garage-door-insulation-kits/ · https://garage.com/parts/best-garage-door-insulation/ · https://sunfireheaters.com/ · https://www.projectfarmreviews.com/posts/diesel-heater · https://www.garagejournal.com/forum/
- Monetization: https://getlasso.co/amazon-affiliate-commission-rate/ · https://www.getchatads.com/blog/amazon-associates-commission-cuts-what-bloggers-should-do/ · https://geniuslink.com/blog/home-depot-affiliate-program/ · https://ui.awin.com/merchant-profile/28831 (VEVOR) · https://affiliate-program.vevor.com/ · https://mrcooldiydirect.com/pages/mrcool-contractor-club · https://hvacdirect.com/affiliates-home · https://help.networx.com/en/articles/6805058-pay-per-lead
