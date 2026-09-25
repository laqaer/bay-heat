# Growth and distribution playbook: garage climate brand (launch 2026-09-25)

Research date: 2026-09-25. Author: growth lead (research phase). Readers: the build team, and the agent team that will run the company.
Companion docs: `competitors.md` (SERP teardown), `monetization.md` (revenue streams, owner checklist, env vars), `design-direction.md` (IRONBOW brand).
Domain: bayheatguide.com (owned, live, about 2 weeks of indexing). The brand name may change; the domain should not (see dossier).

Confidence tags:
- **[OFFICIAL]**: read on the platform's own page.
- **[3P-2026]**: third-party source dated 2026.
- **[DATA]**: computed by us from public data in `scratchpad/`.
- **[MODEL]**: our estimate. Replace it with observed data after 60–90 days.
- **[VERIFY]**: could not be confirmed from here, for example because reddit.com and garagejournal.com block our fetcher. A human or agent must check it before acting.

---

## 0. The playbook in one screen

1. **Search is the main channel, and the window is short.** KD is about 0 across the niche. Heating demand peaks Nov–Jan at 3–10x summer (for example, "diesel heater for garage" is 30/mo in June and 27,100/mo in January). Pages that are live and crawled by about **Oct 20** can catch the peak. Pages published after about Dec 1 mostly wait for next winter.
   - **Publish 30 pages in 6 weeks, in the order in §2.3.** The flagship planner and its sizing page go first. Then the hubs: diesel (6.6k/mo, peaks at 27k), propane-in-garage (9.9k pool), electric (14.8k), "most efficient" (5.4k), and door bottom seal (27.1k, **peaks in October at 33.1k**).
2. **Scaled pages: build 51 state data pages. Do not build city pages, and do not build per-size pages.**
   - Search demand for per-size and per-city queries is effectively zero. For example, "garage heater size calculator square feet" gets 30/mo and "electric heater for 800 sq ft garage" gets 170/mo. Pages like these would be doorways under Google's spam policy.
   - The **state pages** do pass the usefulness test. Each state has different energy prices, degree-days, freeze dates, design temperatures and vent-free code rules. Each one is also the URL that a local reporter or meteorologist links to.
   - State pages ship only through the uniqueness gate in §2.5.
3. **Our flagship linkable asset is already computed in preview**: *"What it costs to keep a garage at 50 °F all winter, in every state"* [DATA].
   - Electric resistance heating costs **$2,579 in Alaska, $1,792 in Maine and $1,212 in Minnesota, against $147 in Texas.**
   - A door kit plus seals cuts about 27% off every bill.
   - One hour of 5 kW heat costs **$2.31 in Hawaii, $1.66 in California and $0.62 in North Dakota.**
   - Pair it with NOAA first-freeze medians: **Duluth Oct 1, Denver Oct 8, Minneapolis Oct 18, Chicago Oct 28, Boston Nov 9, NYC and Atlanta Nov 20, Dallas Nov 29.** These give a rolling set of local-news hooks from now through December.
4. **AI citation strategy.** Google said on 2026-05-15 that llms.txt does nothing for AI Overviews or AI Mode, and that AI features rank from the core index. So the tactics are:
   - non-commodity numbers, tables and an open methodology;
   - a downloadable CSV with `Dataset` schema;
   - Bing and IndexNow, which feed ChatGPT search;
   - a genuine Reddit and YouTube presence (Reddit is about 40% of consolidated AI citations [3P-2026]).
   - Ship llms.txt anyway. It takes one hour and some agents read it. Do not spend more than that on it.
5. **FAQ rich results are gone (Google, 2026-05-07).** Keep genuine Q&A sections for readers and LLMs, but do not expect SERP features from them. Schema effort goes to Organization, Person, WebApplication, Article, Dataset, ItemList, BreadcrumbList and VideoObject.
6. **Communities.** Community work is human-posted and value-first, and Reddit gets **no affiliate links, ever**.
   - Reddit's API now needs pre-approval (Responsible Builder Policy, Nov 2025), and automated posting is a ban risk.
   - GarageJournal is a VerticalScope forum. Commercial posting there is confined to paid vendor areas.
   - Nextdoor (policy of 2026-08-19) allows promotion only from local Business Pages. **Skip Nextdoor.**
   - Pinterest and YouTube are the two owned channels that compound. The agent team drafts; a human approves and publishes.
7. **Email is the retention engine.** The lead magnets, in order of expected yield:
   - "Email me my plan" on the planner result.
   - **First-freeze and Extreme-Cold alerts by ZIP**, driven by the NWS API with no key. Event names changed in Oct 2024: "Extreme Cold Warning" and "Cold Weather Advisory" replaced the wind-chill products.
   - Printable checklists.
   - Expect about 2% of all sessions to subscribe (10–15% of planner completions).
   - Automated flows convert about 13x better than broadcasts (Klaviyo 2026, Home & Garden: flows 5.96% click and 2.12% order vs campaigns 1.78% and 0.13%).
   - Kit's free plan allows **1 sequence and 1 automation**. Design for that limit: one welcome sequence, and alerts sent as API-triggered broadcasts to tags.
8. **Base-case targets** (they match the `monetization.md` base model):
   - Sessions: 1k in Oct, 5k in Nov, 11k in Dec, 14k in Jan.
   - Email: 350 subscribers by Dec 31 and 2,300 by Sep 2027.
   - Links: 40 referring domains by Dec 31.
   - Planner: 1,650 completions in December.
   - Upside is about 2.5–3x all of these, and the kill criteria are in §7.
9. **Roughly 75% of the work is agent-executable**: research, writing, data, code, drafts, pitches, outreach lists, reporting.
   - Humans must own identity-bearing actions: social account creation and posting, Reddit and forum participation, journalist sends, sign-ups for programs and APIs, payments to creators, and the named editor and expert reviewers.
   - The split is in §8.

---

## 1. Seasonality and the calendar we are racing

### 1.1 Demand curves (from `keyword-metrics.tsv`)

| Cluster | Avg/mo | Peak month (vol) | Trough (vol) | Implication |
|---|---:|---|---|---|
| diesel heater for garage | 6,600 | Jan (27,100) | Jun (30) | Must rank by early Dec; publish by Oct 10 |
| shop heater | 6,600 | Jan (33,100) | Jun (720) | Same |
| garage heater calculator | 880 | Jan (2,900) | May (20) | Planner live, crawled and linked by Nov |
| mr heater big maxx | 2,900 | Nov (12,100) | Jun (590) | Nov peak → publish by Oct 17 |
| natural gas garage heater | 2,900 | Nov (12,100) | Jun (480) | Same |
| dr infrared garage heater | 720 | Dec (5,400) | Aug (10) | Existing ASIN; upgrade page |
| garage door bottom seal | 27,100 | **Oct (33,100)** | Feb (5,400) | **Peak is now → publish week 1** |
| garage door weather stripping | 22,200 | Nov (40,500) | Mar (8,100) | Publish by Oct 17 |
| insulated garage door / door insulation | 49,500 | Jan (90,500) | Mar (18,100) | Long tail only (head = retail SERP) |
| garage insulation kit | 2,400 | Jan (9,900) | Apr (390) | By Nov |
| garage air conditioner / AC unit | 12,100 | Jul (40,500) | Nov–Jan (390–720) | Publish Mar 2027 |
| garage dehumidifier | 12,100 | Jun (22,200) | Nov (880) | Publish Mar 2027 |
| garage mini split | 3,600 | Jul (8,100) | Dec (320) | Winter angle now ("heat pump for garage", peak Jan 1,000); cooling angle in Mar |

### 1.2 Fixed dates, Oct–Dec 2026

| Date | Event | Use |
|---|---|---|
| Oct 6–7 | Amazon Prime Big Deal Days [OFFICIAL, aboutamazon.com] | "Garage heat and seal: worth buying on Prime Day" page, with no Amazon prices shown (policy) |
| Oct 1 → Nov 29 | Median first 32 °F freeze rolls south (NOAA 1991–2020 normals; §3.2) | Regional freeze alerts and local PR, week by week |
| Nov 1 | DST ends; evenings get dark and cold | "Winter workshop" content push |
| Nov 26 / 27 / 30 | Thanksgiving / Black Friday / Cyber Monday | Deals roundups (no Amazon prices), biggest email send of Q4 |
| Dec 21 | Solstice | "Coldest 6 weeks start now" campaign; diesel and shop heater peak |

---

## 2. SEO strategy

### 2.1 Why KD 0 does not mean easy

- The top 10 for most garage terms is retailers, Reddit threads, forums, template affiliate sites and parasite pages on expired domains (`competitors.md` §0).
- They rank because the topic is under-served, not because they are strong. **A new domain still needs crawl, indexing and some trust.** In 2026 that means:
  - a visible named author;
  - a real publisher entity;
  - a handful of real links;
  - no scaled thin pages.
- Google's March 2026 core update and August 2026 spam update both hit scaled AI content and thin affiliates hard [3P-2026: gsqi.com, digitalapplied.com].
- We are an affiliate-monetized, AI-produced site, which is exactly the profile these updates target. **Quality gates are the growth strategy, not a compliance afterthought.**

### 2.2 Topical map (hub and spoke)

Keep the existing flat URL style, with no folder nesting, so none of the 11 indexed URLs need redirects. Hubs are pages, not folders.

```
/ (home: thermal hero + planner entry)
│
├── HUB A  /garage-heater-calculator  ← the Garage Climate Planner (heat mode)          [calculator cluster ~2.1k/mo, 5k+ Jan]
│     ├── /garage-heater-calculator/methodology  (every formula, constant, source; CSV)
│     ├── /garage-heater-size  (sizing matrix: 1/2/3-car × insulation × climate zone)    [how many btu, what size, by-car-count]
│     └── (later) /garage-ac-size-calculator  (cool mode, Mar 2027)                    [mini split size variants]
│
├── HUB B  /garage-heaters  (every fuel compared: table, costs, safety; "best" picks by use case)  [garage heater 27.1k, heater to heat garage 14.8k]
│     ├── Fuel spokes:  /electric-garage-heaters (14.8k) · /propane-garage-heater (9.9k pool) · /diesel-heater-for-garage (6.6k→27k)
│     │                 /natural-gas-garage-heater (2.9k + gas garage heater 8.1k) · /infrared-garage-heater (2.4k)
│     │                 /heat-pump-mini-split-for-garage (3.6k + 1.6k + 390 + 390) · /wood-stove-for-garage (2.4k) · /kerosene-heater-for-garage (720)
│     ├── Form spokes:  /plug-in-garage-heater (120V: 3.6k+480+390) · /240v-garage-heater (1.3k+590+480)
│     │                 /ceiling-mount-garage-heater (480) · /best-wall-mount-garage-heaters (existing) · /garage-heater-with-thermostat (590+390)
│     ├── Model spokes: /mr-heater-big-maxx-vs-hot-dawg-vs-modine (2.9k+1.6k+1.0k+2.4k Reznor) · /dr-infrared-dr-975-garage (720, peak 5.4k)
│     ├── Money / cost: /most-efficient-garage-heater (5.4k) · /cheapest-way-to-heat-a-garage (390→1.3k)
│     │                 /garage-heater-installation-cost (260 + 1k "installing" + 170 "240v outlet"; CPC $8–18 → lead gen)
│     ├── Safety:       /propane-heater-in-garage-safety (is it safe 90→390; ventless 4.4k/2.4k/1.3k) · /diesel-heater-garage-install (exhaust/CO)
│     └── Use cases:    /shop-heater (6.6k→33k) · /garage-gym-heater (210+170) · /woodshop-heater (110) · /keep-garage-above-freezing (+ fridge kit 1.6k)
│         Existing 11 electric guides become spokes of /electric-garage-heaters (kept at their URLs, re-skinned, cross-linked)
│
├── HUB C  /garage-insulation  (seal-first logic + ROI calculator from planner)               [garage insulation 9.9k, how to insulate 2.4k]
│     ├── /garage-door-bottom-seal (27.1k; Oct peak 33.1k) · /garage-door-weather-stripping (22.2k; Nov peak 40.5k)
│     ├── /garage-door-insulation-kit (22.2k; long tail: best kit 590, DIY 2.4k, panels 5.4k, 2-car/16-ft 590+390)
│     ├── /garage-door-insulation-r-value (720 × 5 variants) · /cost-to-insulate-a-garage (590 + 1.6k; CPC $5–9 → leads)
│     └── /insulated-garage-door-vs-kit (49.5k pool long tail)
│
├── HUB D  /cost-to-heat-a-garage  (50-state data study + interactive map + CSV)                [PR + links + AI citations]
│     ├── /cost-to-heat-a-garage/{state}  ×51 (gated; §2.5)
│     └── /first-freeze-map  (NOAA normals + live NWS alerts; email signup)
│
└── HUB E  /garage-cooling  (build Mar 2027)
      ├── /garage-air-conditioner (12.1k→40.5k) · /garage-dehumidifier (12.1k→22.2k) · /portable-ac-for-garage (4.4k→14.8k)
      ├── /garage-fan (8.1k→27.1k) · /mini-split-for-garage (cool angle; 3.6k→8.1k) · /what-size-mini-split-for-garage
```

### 2.3 The first 30 pages, in publish order

Rules for ordering:
1. **Seasonal deadline.** Peak month minus about 6 weeks to rank.
2. **Volume we can realistically win** in 60 days. `competitors.md` §5 ranks these clusters.
3. **Pages that feed the planner and email loops** go first.

"UPGRADE" means keep an existing indexed URL and rebuild the page.

| # | Publish by | URL | Primary keywords (US vol/mo, peak) | Type | Monetization |
|---:|---|---|---|---|---|
| 1 | Oct 2 | `/garage-heater-calculator` (Garage Climate Planner) | garage heater calculator 880 (2.9k Jan) · size calculator 390 · garage btu calculator 320 · btu calculator garage 320 · btu calc garage heater 210 | Tool | Email "send my plan", product matches, $19 plan |
| 2 | Oct 2 | `/garage-heater-calculator/methodology` | (link and citation magnet) | Reference + CSV | none |
| 3 | Oct 2 | `/garage-door-bottom-seal` | garage door bottom seal 27.1k (**Oct 33.1k**) | Guide + sizing table (T-style, bulb, J, retainer widths) | Amazon (seals $20–60) |
| 4 | Oct 4 | `/garage-heater-size` | how many btu to heat a garage 210 (1.6k) · what size heater for garage/2-car · garage heater for 2/3-car 90–170 · 30k/50k btu electric 70+70 | Matrix page (1/2/3-car × insulation × zone) | Planner deep links |
| 5 | Oct 6 | `/diesel-heater-for-garage` (hub) | diesel heater for garage 6.6k (27.1k Jan) · garage diesel heater 6.6k · best diesel 480 (1.6k) · vevor for garage 880 | Hub + SVG install diagram + brand matrix | VEVOR/Hcalory (Awin), Amazon search |
| 6 | Oct 6 | `/garage-heaters` (hub) | garage heater 27.1k · heater to heat garage 14.8k · good garage heater 5.4k | Fuel comparison hub | All partners |
| 7 | Oct 8 | `/propane-heater-in-garage-safety` | propane heater for garage / inside garage 9.9k pool · is it safe 90 (390) · ventless propane 4.4k · vented propane 6.6k | Safety-first guide + CO decision tree | Amazon (Big Buddy class, CO alarms) |
| 8 | Oct 8 | `/electric-garage-heaters` (hub; absorbs the existing 11) | garage heater electric 14.8k · portable electric 4.4k · electric shop heater 4.4k | Hub | Amazon (5 verified ASINs) |
| 9 | Oct 10 | `/most-efficient-garage-heater` | most efficient garage heater 5.4k · most efficient way 110 (390) · electric vs propane 90 (390) | Cost-per-hour by fuel at local prices | Planner, heat-pump affiliates |
| 10 | Oct 10 | `/garage-door-weather-stripping` | weather stripping 22.2k (Nov 40.5k) · door insulation strip 2.4k | Guide (top, sides, bottom; vinyl vs rubber) | Amazon |
| 11 | Oct 13 | `/cost-to-heat-a-garage` (data study hub) | cost to heat a garage 50 (low volume; this is a **PR asset**) | Data study + map + CSV + embed | Email (freeze alerts) |
| 12 | Oct 13 | `/garage-door-insulation-kit` | garage door insulation kit 22.2k · DIY kit 2.4k · best kit 590 · panels 5.4k · 2-car 590 | "What it really saves" + kit table | Amazon (kits $60–150) |
| 13 | Oct 15 | `/natural-gas-garage-heater` | natural gas garage heater 2.9k (12.1k Nov) · gas garage heater 8.1k · with thermostat 480 | Vented unit-heater guide | Amazon, Northern Tool (CJ), install leads |
| 14 | Oct 15 | `/mr-heater-big-maxx-vs-hot-dawg-vs-modine` | big maxx 2.9k (12.1k Nov) + 390 · hot dawg 1.6k ×2 · modine 1.0k ×2 · reznor 2.4k | Spec comparison | Amazon, Northern Tool |
| 15 | Oct 17 | `/best-garage-heater` | best garage heater 5.4k · best heater to heat garage 5.4k · best rated / residential 5.4k | Picks by use case, driven by our math, no fake testing | All |
| 16 | Oct 17 | `/shop-heater` | shop heater 6.6k (33.1k Jan) · workshop heater 390 · best shop heater 210 · electric unit heater 1.3k | Guide (240V unit, NG, diesel, torpedo) | Amazon, Northern Tool |
| 17 | Oct 20 | `/infrared-garage-heater` (UPGRADE of forced-air-vs-infrared) | infrared garage heater 2.4k (9.9k Jan) · ir 2.4k · radiant for garage 1.6k | Guide | Amazon |
| 18 | Oct 20 | `/240v-garage-heater` (UPGRADE of 120v-vs-240v; keep old URL, cross-link) | electric garage heater 240v 1.3k · 240v garage heater 590 · 240v electric heater 480 · 10000 watt 320 | Circuit-first guide (NEC 80% rule) | Amazon (FUH54, CZ220, DR-975) |
| 19 | Oct 22 | `/plug-in-garage-heater` (UPGRADE of portable-garage-heaters-15a-circuit) | electric garage heater 120v 3.6k · space heater for garage 3.6k · plug in 480 · 110v 590 | Guide | Amazon (CZ798, HS-1500-TT) |
| 20 | Oct 22 | `/garage-heater-installation-cost` | installation cost 260 ($13.98 CPC) · installing a garage heater 1.0k ($18 CPC) · 240v outlet cost 170 ($7.94) | Cost ranges + Electrician Brief | **Install leads**, $19 plan |
| 21 | Oct 27 | `/heat-pump-mini-split-for-garage` | mini split for garage 3.6k · ductless 1.6k · heat pump for garage 390 (1.0k Jan) · 12000 btu 260 | Winter-first mini-split guide | HVACDirect, Got Ductless, Pioneer, MRCOOL |
| 22 | Oct 27 | `/how-to-insulate-a-garage` (UPGRADE of insulate-before-upgrade) | how to insulate 2.4k · garage insulation 9.9k · garage insulation kit 2.4k · DIY 320 | Step guide + ROI | Amazon, insulation leads |
| 23 | Oct 29 | `/garage-door-insulation-r-value` | r value 720 · value/r rating/rating 720 ×3 | Explainer (center-of-panel vs system R) | Amazon |
| 24 | Oct 29 | `/keep-garage-above-freezing` | garage fridge heater kit 1.6k ×2 · keep garage above freezing (tiny) · water heater in garage 50 | Guide (pipes, fridge, batteries, paint) | Amazon (fridge kit, thermostats) |
| 25 | Nov 3 | `/cheapest-way-to-heat-a-garage` | cheapest way 390 (1.3k) | Ranked by $/season at local price | Planner |
| 26 | Nov 3 | `/diesel-heater-garage-install` | vevor diesel heater for garage 880 · (install/exhaust/CO long tail) | Step guide + diagram + safety | VEVOR/Hcalory, CO alarms |
| 27 | Nov 5 | `/garage-gym-heater` | garage gym heater 210 (1.3k) · best heater for garage gym 170 (1.0k) | Use case | Amazon |
| 28 | Nov 5 | `/garage-heater-with-thermostat` | with thermostat 590 (2.4k) · thermostat 390 (1.3k) · 120v with thermostat 260 | Guide | Amazon |
| 29 | Nov 10 | `/ceiling-mount-garage-heater` (UPGRADE of best-ceiling-mount-under-200) | ceiling mount 480 (1.6k) · ceiling mounted heater 720 · 120v ceiling 320 | Guide | Amazon (CZ220) |
| 30 | Nov 10 | `/first-freeze-map` | (PR and email asset) | Tool: NOAA normals + live NWS | Email |

**After 30 (weeks 7–12):**
- State pages in batches of 10: coldest and most searched first (MN, WI, MI, IL, NY, PA, OH, CO, MA, ME…).
- `/wood-stove-for-garage` (2.4k).
- `/kerosene-heater-for-garage` (720).
- `/waste-oil-heater-for-garage` (1.3k).
- `/garage-insulation-cost` (1.6k, $8.68 CPC).
- `/insulated-garage-door-vs-kit`.
- `/woodshop-heater`.
- `/garage-subpanel` (720; electrical lead-gen).
- Black Friday roundup (Nov 20).

**Not in the first 30:**
- The cooling cluster: plan it in Feb and publish in Mar 2027.
- "insulated garage door" head terms: a retail SERP.
- "vevor diesel heater" (40.5k): VEVOR owns its brand SERP. Win "for garage", "install" and "vs" instead.

**Velocity:** 30 pages in about 45 days is about 5 per week. This pace is safe **because each page carries planner-computed numbers, a diagram or table, and a named editor's review**. A site publishing 300 pages in its first month is the pattern the 2026 updates target. Do not do that.

### 2.4 Scaled pages: spam or useful? Verdict per pattern

Google's spam policies [OFFICIAL, developers.google.com/search/docs/essentials/spam-policies]:
- Scaled content abuse covers "using generative AI tools… to generate many pages without adding value for users".
- Doorway abuse covers pages "targeted at specific regions or cities that funnel users to one page" and "substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy".

| Pattern | Search demand (our data) | Unique info per page? | Verdict |
|---|---|---|---|
| **Per-state "cost to heat a garage in {state}"** (51) | Low for each state, but it is the link target for local news and the AI-citation unit for "in Minnesota…" | **Yes.** State electricity ¢/kWh (EIA 5.6.B), residential gas $/therm and propane $/gal (EIA), HDD50 and 99% design temperature for 2–3 stations, NOAA first-freeze dates, fuel ranking (which fuel is cheapest differs by state), cold-climate heat pump viability at design temperature, vent-free legality notes (e.g., California bans ventless gas appliances; Minnesota restricts them in cities over 2,500 people [3P, VERIFY per state]) | **BUILD, gated** (§2.5). Warm states (FL, HI, LA, AZ, southern CA) pivot to cooling and dehumidifying, so they are not clones. |
| Per-city pages (e.g., 300 metros) | ~0 | Mostly the same as the state page | **DO NOT BUILD.** This is textbook doorway. The planner's ZIP input serves city granularity. Revisit only if GSC shows ≥100 impressions/mo for a city query. |
| Per-size pages ("heater for 24×24 garage", "600 sq ft") | 10–170/mo each; "square feet calculator" 30 | The same formula with a different number | **DO NOT BUILD.** One `/garage-heater-size` matrix page with anchors (`#2-car`), plus planner permalinks (`?w=24&l=24`) canonicalized to the planner. |
| Per-car-count pages (1/2/3-car) | 90–170 each | Marginal | Sections of `/garage-heater-size`, not pages |
| Per-brand/model pages | Big Maxx 2.9k, Hot Dawg 1.6k, Modine 1k, Reznor 2.4k, Dr Infrared 720, Comfort Zone 720, NewAir 720 | Yes, if we compute each model's coverage, circuit and $/h | Build as **comparison** pages (3–4 models each), not one thin page per SKU |
| Planner result permalinks (`?zip=55401&size=2car…`) | n/a | Infinite combinations | `noindex, follow` plus a canonical to the planner. Never let result URLs be indexed. |
| Mini-split sizes (9k/12k/24k BTU for garage) | 50–260 each | Low | One page: `/what-size-mini-split-for-garage` (Mar 2027) |

### 2.5 The uniqueness gate for templated pages

A templated page may be indexed only if **all** of the following are true. The build team enforces this in code with a `noindex` flag until it passes. An agent audits it monthly.
1. It has **≥8 data points that differ from the national page**, each with a source and a "checked" date.
2. It has **≥1 computed visual** that differs by state: a cost bar by fuel, or a freeze-date strip.
3. Its **recommendation differs**: the cheapest fuel, the heat-pump verdict at design temperature, and the seal-first payback in months.
4. It has **≥150 words of state-specific commentary** written from the data, e.g., "Minnesota's gas is 1.06 $/therm, so a vented NG unit heater costs about 3.6x less to run than resistance heat". No spun intros.
5. It carries the named editor's review stamp, and a human-reviewed sample of 10% of pages each batch.
6. **Internal links stay a browseable hierarchy**: the state index, then the state page, then the fuel hubs. There is no sitewide footer block of 51 state links.
7. Warm states whose modeled winter heating is under $100 get a cooling-first page. If a state still fails the gate, it stays `noindex` until its cooling content exists.

### 2.6 Internal linking rules

- **Every page links to the planner with context pre-filled.** For example, `/garage-heater-calculator?fuel=diesel&size=2car` goes on the diesel hub, and `?door=uninsulated&focus=seal` goes on the bottom-seal page. The link text states the task, e.g., "Size a diesel heater for your garage", and does not say "click here".
- **The spine** is: size it (planner / size) → power it (240V / plug-in / install cost) → price it (most efficient / cost by state) → fix it (seal / insulate).
  - Every page ends with a "Next step" module that points one step down the spine.
- **Hub ↔ spoke**: each hub has a comparison table whose rows link to the spokes, and each spoke links to its hub in the breadcrumb and in its first 150 words.
- **Seal-first bridge**: every heater page shows "Sealing this garage first saves ~X BTU/h (~$Y/season)" and links to the bottom-seal and door-kit pages. This is the path from high-intent traffic to the 27k–49k/mo insulation products.
- **Cost bridge**: state pages link to the fuel hub for that state's cheapest fuel.
- **Link budget**: no more than about 100 links per page including navigation. Contextual links in body copy count most. No sitewide keyword-anchor footers.
- **Orphan check**: an agent runs a weekly crawl (Screaming Frog CLI, or a simple Node crawler) and fails any page with fewer than 3 internal inlinks.
- **Existing 11 URLs** stay live and are re-skinned. They link up to `/electric-garage-heaters`. They are not redirected unless a page is fully merged; if so, use a 308 in `next.config.ts` redirects.

### 2.7 Structured data (what is worth it in Sep 2026)

| Type | Where | Why / note |
|---|---|---|
| `Organization` (Laqaer Products, logo, `sameAs` socials) + `WebSite` | Sitewide | Entity clarity for Google and LLMs |
| `Person` (named editor; `sameAs` LinkedIn/YouTube) + `author` on every article | Articles | E-E-A-T. It must be a real human (owner action). |
| `WebApplication` (`applicationCategory: "UtilitiesApplication"`, `offers.price: 0`, `featureList`) | Planner, first-freeze map | No rich result without ratings. Do not fake `aggregateRating`. |
| `Article` with `dateModified`, `citation`, `about` | Guides | Freshness during the seasonal refresh |
| **`Dataset`** (name, description, `distribution` CSV URL, `temporalCoverage`, `spatialCoverage`, `license: CC BY 4.0`, `creator`) | Data study + methodology | **Google Dataset Search** is a discovery channel for journalists and researchers, and a strong AI-citation signal |
| `ItemList` | "Best" pages and comparisons | Carousel eligibility |
| `BreadcrumbList` | All | |
| `VideoObject` | Pages with our videos | Video results; AI Overviews favor multi-modal content (YouTube is 23% of AIO citations [3P-2026]) |
| `FAQPage` | Optional | **FAQ rich results were removed 2026-05-07** [3P-2026: SEJ]. Keep visible Q&A for users and LLMs, but expect no SERP benefit. |
| `HowTo` | Skip | Rich result deprecated since 2023 |
| `Product` / `Review` / `AggregateRating` | **Never**, unless we have genuine first-party test data | Fabricated review markup risks a manual action and breaks Amazon and FTC rules |

### 2.8 AI Overviews and LLM citation optimization

**What Google actually said** [OFFICIAL, "Optimizing your website for generative AI features on Google Search", 2026-05-15]:
- AI features draw on the core index and ranking systems.
- Content must be "unique, valuable… non-commodity". Google warns against content that "could easily be produced by a generative AI model".
- You "don't need to create new machine readable files, AI text files, markup, or Markdown".
- No chunking is needed.
- Search Console has a **Generative AI performance report**. Use it as the KPI source.

**Tactics, in priority order:**

1. **Own the numbers.** Every page opens with a 40–70-word "answer block" that contains a specific, computed number and its conditions. For example: "A typical insulated 2-car garage (24×24×9 ft) in climate zone 5 needs about 18,000–24,000 BTU/h (5.3–7.0 kW) at the 99% design temperature to hold 50 °F." A table follows.
   - AI Overviews favor tabular comparisons, and ChatGPT favors original studies with data [3P-2026: averi.ai, otterly.ai].
2. **Open methodology plus CSV.**
   - `/garage-heater-calculator/methodology` lists every formula and constant: propane 91,500 BTU/gal, natural gas 100,000 BTU/therm, diesel about 137,000 BTU/gal, 3,412 BTU/kWh, and NEC 80% continuous load.
   - `/data/garage-heating-cost-by-state-2026.csv` is published under CC BY 4.0 with a "cite as" line.
   - LLMs and journalists cite sources that show their work.
3. **Quotable facts with stable anchors.** Examples: "5 kW at 240 V draws 20.8 A → 30 A breaker, 10 AWG copper" and "UL 2034 CO alarms sound at 70 ppm after 60–240 min". Put each in its own `<p id>` so deep links such as `#circuit-5kw` work.
4. **Crawler access in `robots.ts`.**
   - Explicitly allow `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`, `Applebot`, `Bingbot` and `DuckAssistBot`.
   - Also allow the training crawlers `GPTBot` and `Google-Extended`. The brand benefits from being in model memory, and our content earns nothing by being withheld.
   - A third-party study found 73% of sites have technical barriers to AI crawlers [3P-2026]. Check that Vercel's firewall or bot protection is not blocking them.
5. **Bing Webmaster Tools + IndexNow.**
   - ChatGPT search leans on Bing's index.
   - The build ships a route that pings `api.indexnow.org` with changed URLs on deploy, with its key file at `/{key}.txt`.
   - Owner action: verify the site in Bing Webmaster Tools (it can import from GSC).
6. **llms.txt: ship it minimal and move on.**
   - Google says it is ignored. A third-party study found 97% of llms.txt files got zero requests in May 2026.
   - Anthropic and OpenAI agent tooling do read it, and Lighthouse 13.3 audits for it [3P-2026].
   - Contents: brand, one line on what we are, and links to the planner, methodology, CSV and 10 hubs. Cap the effort at 1 hour.
7. **Earn off-site mentions where LLMs read.**
   - Reddit (Perplexity: 46.7% of top citations [3P-2026]), YouTube (AIO) and Wikipedia-style reference pages.
   - Genuine answers on Reddit and GarageJournal that cite our methodology page are the AI-citation flywheel (§4).
8. **Freshness.** Put a visible "Prices checked: {date}" on cost pages, and refresh EIA prices monthly with an agent job. Freshness is a ranking and trust signal in a price-driven niche.
9. **Measure it.**
   - GSC Generative AI report, monthly.
   - A fixed **25-prompt panel**, run monthly by an agent in ChatGPT, Perplexity, Gemini, Claude and Google AI Mode. Examples: "how many BTU to heat a 2 car garage", "cost to heat a garage in Minnesota", "is it safe to use a diesel heater in a garage". Record whether we are cited and at what position.

### 2.9 Technical SEO checklist for the build (launch blockers)

- Static or ISR pages. The planner is a client island, and **the SSR HTML must contain the default result numbers and table** so crawlers and LLMs see content without running JS.
- `sitemap.ts` with `lastModified` from content front-matter; a separate sitemap for state pages (Next 16 `generateSitemaps`, where `id` is async per AGENTS.md).
- Canonicals on all pages, and `noindex` for planner result permalinks and ungated state pages.
- OG images per page (thermal share cards) via `next/og`.
- Core Web Vitals: LCP under 2.0 s on 4G. The thermal hero uses a pre-baked PNG (`design-direction.md`).
- GSC: submit the sitemap and request indexing for the first 10 URLs manually (owner, about 10/day quota).
- Bing WMT plus IndexNow.
- 404 monitoring. Keep the 11 old URLs 200 or 308.

---

## 3. Linkable assets

### 3.1 Data study #1: "What it costs to keep a garage at 50 °F all winter, in every state (2026)"

**Preview numbers, already computed** [DATA]. The script is in `scratchpad/`. The build team must recompute with the production planner engine and population-weighted stations before publishing.

Model inputs:
- **Garage:** attached 2-car, 24×24×9 ft. Walls R-13 (U 0.09), ceiling R-19 (U 0.06), uninsulated steel door (U 0.5, 112 ft²), slab edge F = 0.73 on 72 ft of perimeter, 0.75 ACH infiltration. That gives **UA ≈ 261 BTU/h·°F**.
- **After a door kit and seals:** door U 0.17 and 0.4 ACH, giving **UA ≈ 192**.
- **Season energy** = UA × HDD50 × 24. HDD50 is °F-days at base 50 °F from ASHRAE station data for the state's main city. It matches NOAA normals within 5%: Chicago is 2,961 in our data vs NOAA's 2,827.
- **Prices:**
  - Electricity: EIA Electric Power Monthly Table 5.6.B, residential, **Jan–Jul 2026 YTD**.
  - Natural gas: EIA residential 2025 annual in $/Mcf, divided by 10.37 to get $/therm.
  - Propane: EIA weekly residential for 2026-03-30, excluding taxes. States that EIA does not survey use their PADD average and are marked.
- **Efficiencies:** resistance 100%, vented gas and propane 80%, heat pump COP 2.5 (seasonal; this is optimistic in zones 6–7, so use the ASHP model in the planner).

| State (city) | HDD50 | ¢/kWh | Electric $/season | After seal + door kit | Saved | Heat pump | Propane | Nat. gas |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Alaska (Anchorage) | 5,187 | 27.1 | **$2,579** | $1,896 | $684 | $1,032 | $1,187* | $508 |
| Maine (Portland) | 3,254 | 30.0 | **$1,792** | $1,317 | $475 | $717 | $981 | $466 |
| Vermont (Burlington) | 3,676 | 23.9 | $1,616 | $1,188 | $428 | $647 | $1,174 | $499 |
| New Hampshire | 2,880 | 26.8 | $1,417 | $1,041 | $376 | $567 | $932 | $404 |
| Connecticut | 2,617 | 28.0 | $1,344 | $988 | $356 | $538 | $922 | $333 |
| Massachusetts (Boston) | 2,284 | 30.1 | $1,264 | $929 | $335 | $506 | $713 | $432 |
| Minnesota (Minneapolis) | 4,064 | 16.2 | **$1,212** | $891 | $322 | $485 | $715 | $337 |
| North Dakota (Fargo) | 5,119 | 12.4 | $1,162 | $853 | $308 | $464 | $744 | $367 |
| Wisconsin (Milwaukee) | 3,241 | 19.0 | $1,131 | $831 | $300 | $452 | $573 | $263 |
| Michigan (Detroit) | 2,848 | 21.5 | $1,126 | $827 | $298 | $451 | $578 | $235 |
| Illinois (Chicago) | 2,961 | 19.2 | $1,045 | $768 | $277 | $418 | $513 | $252 |
| New York (NYC) | 1,675 | 29.4 | $903 | $664 | $239 | $361 | $537 | $222 |
| Colorado (Denver) | 2,579 | 16.7 | $792 | $582 | $210 | $317 | $508 | $218 |
| Ohio (Columbus) | 2,268 | 18.7 | $779 | $572 | $207 | $312 | $523 | $237 |
| Pennsylvania (Philadelphia) | 1,672 | 21.0 | $646 | $474 | $171 | $258 | $441 | $190 |
| Washington (Seattle) | 1,067 | 14.4 | $282 | $207 | $75 | $113 | $244* | $142 |
| Georgia (Atlanta) | 648 | 15.4 | $183 | $134 | $48 | $73 | $176 | $100 |
| Texas (Dallas–Fort Worth) | 499 | 16.1 | **$147** | $108 | $39 | $59 | $128 | $73 |
| Florida (Miami) | 1 | 15.3 | ~$0 → **cooling page** | | | | | |

\* PADD or US average propane price (EIA does not survey this state weekly). The full 51-row preview is in `/tmp/claude-0/-home-user-bay-heat/86f9864d-2467-50b2-b9be-d395dbfda8cb/scratchpad/state_cost_preview.json` (session scratchpad; recompute in the repo's data pipeline).

**Headlines this produces:**
- "Keeping a garage at 50 °F costs 12x more in Maine than in Texas."
- "A $150 door kit and a $40 bottom seal cut the bill by about 27% in every state, worth $300–700/yr in the North."
- "Natural gas is 2.5–4x cheaper than resistance electric in 45 states."
- "Hawaii: $2.31 to run a 5 kW heater for one hour; California $1.66; North Dakota $0.62."

**Production spec:**
- An interactive US choropleth (Frost→Forge ramp from `design-direction.md`) with fuel toggles and sliders for garage size and setpoint (40/50/60 °F).
- A 51-row sortable table.
- Methodology.
- The CSV, with `Dataset` schema.
- An embeddable map (`/embed/cost-map?state=MN`).
- One PNG share card per state (1200×630, plus a 1000×1500 pin).
- A "Cite this data" box with suggested attribution text.

**Refresh:** monthly price update by an agent (EIA 5.6.B is released about the 24th of each month; the next release is 2026-10-23). The headline table is re-issued in January as a "coldest month" update.

### 3.2 Data asset #2: "When will your garage freeze?" (first-freeze map + live alerts)

NOAA 1991–2020 normals (`normals-annualseasonal/1991-2020/access/{STATION}.csv`) provide per-station fields `ANN-TMIN-PRBFST-T32FP10…90` (first 32 °F date at 10–90% probability), `T28FP50` (hard freeze) and `ANN-HTDD-BASE50`. Sample medians we pulled [OFFICIAL, NCEI]:

| Station | First 32 °F (median) | Early year (10%) | First 28 °F hard freeze (median) |
|---|---|---|---|
| Duluth | Oct 1 | Sep 18 | Oct 13 |
| Denver | Oct 8 | Sep 25 | Oct 18 |
| Minneapolis | Oct 18 | Oct 1 | Oct 29 |
| Chicago O'Hare | Oct 28 | Oct 15 | Nov 7 |
| Charlotte | Nov 3 | Oct 22 | Nov 14 |
| Louisville | Nov 7 | Oct 28 | Nov 17 |
| Boston | Nov 9 | Oct 29 | Nov 21 |
| New York (Central Park) | Nov 20 | Nov 6 | Dec 1 |
| Atlanta | Nov 20 | Nov 4 | Dec 5 |
| Seattle | Nov 23 | Nov 6 | Dec 10 |
| Dallas–Fort Worth | Nov 24 | Nov 6 | Dec 7 |

- Build the map from roughly 5,000 NOAA normals stations → ZIP3 lookup, shipped as static JSON.
- Add live overlays from `api.weather.gov/alerts/active?event=Freeze%20Warning,Hard%20Freeze%20Warning,Extreme%20Cold%20Warning,Cold%20Weather%20Advisory`.
  - The API is free and needs only a `User-Agent`, e.g., `BayHeat/1.0 (hello@bayheatguide.com)`.
  - The NWS renamed its wind-chill products on 2024-10-01: Extreme Cold Warning and Cold Weather Advisory [OFFICIAL/3P].
- The page's CTA is "Email me 48 hours before my first hard freeze" (§5).
- This is the asset for TV meteorologists, who run a "first freeze" segment every fall. The embed link is the ask.

### 3.3 Embeddable planner widget

- **Embed code** (shown on `/embed`, and on every planner result under "Put this calculator on your site"):
  ```html
  <iframe src="https://bayheatguide.com/embed/planner?preset=2car&theme=dark" title="Garage heater size calculator"
          width="100%" height="760" loading="lazy" style="border:0;max-width:720px"></iframe>
  <p style="font:12px sans-serif">Garage heater calculator by <a href="https://bayheatguide.com/garage-heater-calculator" rel="nofollow">BayHeat</a></p>
  ```
- **Attribution link: brand anchor with `rel="nofollow"` by default.** Google's widget-link guidance [OFFICIAL, Search Central blog 2016-09-08, "A reminder about widget links"; spam policy "links embedded in widgets"] treats keyword-rich widget links as link spam. We follow it. The widget's value is:
  - referral traffic;
  - brand exposure;
  - leads from partner sites;
  - **editorial links** that bloggers add in their own copy.
  Never use keyword anchors and never hide the link.
- Inside the iframe, the result has "Get the full plan on BayHeat" (opens in a new tab), with UTM `utm_source={parent host}&utm_medium=embed`.
- **Telemetry:** the embed pings `/api/embed-hit` with `document.referrer`. An agent reviews new embedding hosts weekly and emails them a thank-you plus the data CSV. That note converts some into editorial links.
- **Variants:**
  - `preset=` (1car/2car/3car/shop), `fuel=`, `mode=heat|cool`, `theme=dark|light`, and `compact=1` (a 320-px-tall "BTU only" version for forum signatures and blog sidebars).
  - A **contractor variant** (year 2, $29–49/mo per `monetization.md`) that removes our CTA and adds their lead form.
- **Outreach targets for embeds:**
  - garage-door installers and electricians (local SEO sites with thin content love a free tool);
  - garage gym and woodworking blogs;
  - HVAC contractor blogs;
  - Garage Journal members' build threads (a link to the planner is fine there, an iframe is not).

### 3.4 Free printable tools

These are email-gated PDFs, except the safety card, which is free and ungated. **No Amazon links inside PDFs** (Amazon policy). PDFs link only to our pages.

| Printable | Format | Gate | Purpose |
|---|---|---|---|
| **Garage Winterization Checklist** (18 items: seal, insulate, pipes, fridge, batteries, heater clearance, CO alarm test) | 1 page, Letter + A4 | Email | #2 lead magnet; Pinterest bait |
| **Heater Clearance & CO Safety Card** (3 ft clearances, CO alarm at 70 ppm, never run a portable propane unit while sleeping, diesel exhaust outside) | Half page, "tape to the wall" | **Ungated** | Link magnet for fire departments, safety pages and local news. Offer a co-branded version to fire departments. |
| **Electrician Brief** (fill-in: heater kW, voltage, breaker, wire gauge, disconnect, thermostat, location, questions to ask) | 1 page, fillable | Email (free) | Trust asset; bridge to install leads and the $19 plan |
| **Garage Door Insulation Cut Sheet** (panel cut list for 8×7, 9×7 and 16×7 doors; weight added per panel; spring-balance warning) | 2 pages | Email | Door-kit traffic (22.2k) |
| **Garage Temperature Log** (7-day overnight low log, to test before buying a heater) | 1 page | Ungated | Garage gym and woodworking communities |
| **Heater Buying Worksheet** (circuit? fuel? venting? size?) | 1 page | Email | Mid-funnel |

### 3.5 PR plan (local news during cold snaps and national data PR)

**Angles, ranked by expected pickup:**
1. **"What it costs to keep a garage warm in {state}"**: state tables for local TV and newspaper consumer desks. Pitch the northern tier in weeks 3–5, and the South before its first freeze in weeks 7–9.
2. **Reactive cold-snap pitch, sent within 24 hours of an NWS Extreme Cold Warning covering a metro of 1M+ people.**
   - Localized numbers: cost per night to keep a garage above freezing at local prices; pipes, fridge and EV/battery tips.
   - The safety card as an ungated asset.
   - An agent monitors NWS alerts and drafts the pitch; a human sends it (§8).
3. **Safety: "Garage heater fires and CO: what to know before the first cold night."**
   - Anchor it with NFPA figures: an average of 38,881 home heating fires per year (2019–2023), 432 deaths; space heaters are 29% of those fires and 77% of the deaths [3P citing NFPA, Nov 2025; VERIFY on nfpa.org].
   - Add the diesel-heater boom (VEVOR 40.5k searches/mo) and the difference between a 300 ppm heater alarm and a UL 2034 home alarm.
4. **First-freeze map** for meteorologists, from late September through November. The ask is to embed it or show it on air.
5. **"Hawaii pays $2.31 an hour to run a garage heater"**: an electricity-price angle for energy and personal-finance writers.
6. **"The $40 fix"**: the bottom seal and weatherstrip ROI for consumer and frugal outlets, e.g., Lifehacker-style tips pages.
7. **Winter garage gym** (lifestyle and fitness media) and **woodshop finishing temperatures** (glue and finish minimum temperatures) for woodworking media.

**Channels:**
- **Qwoted** (free tier; vetted journalist requests), **Featured**, **Source of Sources** (free) and `#journorequest` on X/Bluesky [3P-2026]. Connectively, the old HARO, is gone.
- Direct pitches to:
  - local TV consumer and weather desks in the 20 coldest-cost states;
  - regional newspapers (a metro business or consumer reporter);
  - AP state bureaus;
  - Patch;
  - home and DIY verticals: Family Handyman, Bob Vila, This Old House, Popular Mechanics, Lifehacker, Apartment Therapy (DIY), Real Simple (home);
  - personal-finance sites: Money, CNET Home, NerdWallet (energy).
- **Target:** 3–6 earned links from the state study by Dec 31 (base), and 15+ (upside). Local TV sites often link to "the full data".

**Pitch template** (under 120 words; human-signed):
> Subject: Minnesota: $1,212 to keep a garage above 50 °F this winter (state data)
> Hi {first name}, with {first freeze / Extreme Cold Warning} this week, you may get garage questions. We modeled what it costs to heat a typical 2-car garage in every state using EIA prices and NOAA degree-days. In {state} it's ${X} with electric heat, ${Y} with natural gas, and a $40 door seal plus a door kit cuts about 27%. The table, methodology and a free printable heater-safety card are here: {link}. Happy to run numbers for {city} or answer on the record. {Name}, editor, BayHeat (Laqaer Products)

---

## 4. Communities

**Global rules for the agent team.** They are non-negotiable, because a ban on Reddit or GarageJournal also costs us AI-citation surface.
1. **One human, one identity.** The named editor posts under their own account, with the affiliation in the profile ("I run BayHeat, a garage-heating calculator"). No sockpuppets, no purchased accounts, no upvote trading. These are sitewide violations (Reddit Content Policy rule 2).
2. **90/10.** At least 9 helpful contributions without links for every 1 that links to us [3P-2026, common norm]. Many subs are stricter.
3. **Never post affiliate links** on Reddit, forums or Facebook. Link only to our non-monetized pages, such as the methodology, the calculator and the safety card, and only when it directly answers the question.
4. **Answer in-thread first.** Put the full answer, with the numbers, in the comment itself. The link is optional ("I built a calculator that shows this math if useful: …").
5. **Read the sidebar before every first post in a community.** Reddit and GarageJournal block our fetcher, so every rule below marked [VERIFY] must be confirmed by the human poster.
6. **Automation limit.** Reddit now requires pre-approval for all API apps and explicitly covers "bots, AI agents, or non-human operated accounts" (Responsible Builder Policy, updated 2025-11-11) [OFFICIAL, support.reddithelp.com]. **Agents may find threads and draft replies. Only a human may post, from the human's own session.**

### 4.1 Reddit

| Subreddit | Size | Rules that matter | What to post |
|---|---|---|---|
| r/HomeImprovement | 4.83M [3P reddapi] | Text posts only; minimum karma to participate [3P]; self-promotion removed [VERIFY] | Answer "how do I heat/insulate my garage" threads with full numbers. No top-level promo posts. |
| r/DIY | ~20M+ [VERIFY] | Strict self-promo rules; "show your work" posts need process photos [VERIFY] | Only if we have a real build: e.g., the editor insulates their own door and documents it with before/after overnight temperature logs |
| r/hvacadvice | 273k [3P] | Homeowner Q&A. Pros answer. [VERIFY promo rule.] | Sizing answers ("24×24 in Zone 5 → ~20k BTU/h; here's why"); mini-split for garage |
| r/HVAC | [VERIFY] | Trade sub; homeowner questions are usually removed | **Do not post.** Read it for technical accuracy. |
| r/electricians | 575k [3P] | Trade-only; homeowner questions go to r/AskElectricians [VERIFY] | Do not post. Recruit a reviewer via DM only if they invite it. |
| r/AskElectricians | [VERIFY] | Homeowner Q&A | Answer 120V vs 240V and breaker/wire questions; link the NEC-80% explainer when asked |
| r/homegym | 1.21M [3P] | Self-promo restricted [VERIFY] | "My garage gym is 28 °F at 6 am" threads; heater and insulation answers; the temperature-log printable |
| r/garagegym | 60k [3P] | Smaller, more permissive [VERIFY] | Same |
| r/woodworking | 6.19M [3P] | Self-promo limited [VERIFY] | Finish and glue temperature minimums; woodshop heater safety (no open flame near dust or solvents) |
| r/heatpumps | 57k [3P] | Enthusiast | Heat pump vs resistance in a garage: cost math at design temperature |
| r/projectcar (358k), r/garageporn (491k) [3P] | Photo communities [VERIFY] | Comment help only. No links. |
| **r/dataisbeautiful** | [VERIFY] | [OC] posts allowed; the source and tool must be cited in a comment [VERIFY] | **One post:** "[OC] What it costs to keep a garage at 50 °F all winter, by state" (map). Best single Reddit shot. Post in week 4. |
| r/coolguides | [VERIFY] | Infographics | "Garage heater sizing cheat sheet" (no watermark spam; a small brand mark is fine) |
| r/Frugal | [VERIFY] | No promo | The $40-seal ROI answer in threads about heating bills |
| Diesel-heater subs (r/dieselheater and variants; small, e.g., 583 members for one [3P]) | [VERIFY] | Small, enthusiast | Install diagram (exhaust outside, CO) as an image post |

**Cadence:**
- Weeks 1–2: comments only, building karma and history, 5–10 comments per day by the human with drafts from the agent.
- Weeks 3–12: up to 2 link-containing comments per week across all subs.
- One [OC] post in week 4 and one cheat-sheet post in week 8.

### 4.2 GarageJournal (garagejournal.com)

- It is a VerticalScope forum. VerticalScope's standard vendor policy [OFFICIAL, VerticalScope vendor FAQ, same across AVS Forum, PromasterForum and others; VERIFY that GJ uses it]:
  - "Commercial posting… is limited to your specific sponsored area or the public vendor deals."
  - Vendors must post from an official vendor account.
- The moderators have publicly cracked down on light promotion by commercial members [3P, GJ thread].
- **Plan:**
  - The editor joins as a person and helps in the *Heating & Cooling*, *Insulation* and *Garage Build* forums.
  - Share the calculator only when someone asks "what size heater".
  - Post a build thread for any real test program (`competitors.md` §4.6); GJ loves data.
  - Consider a paid vendor sponsorship in month 6+ if referral data justifies it. Get a quote from VerticalScope.
- **Why it matters:** GJ threads rank on page 1 for "garage heater calculator" and similar terms. One well-regarded answer there ranks and gets cited by LLMs for years.

### 4.3 Facebook groups

| Group | Size | Approach |
|---|---|---|
| Chinese Diesel Vehicle Air Heaters | ~57k [3P] | Answer install and CO questions with our diagram image (no link unless the rules allow it) |
| The Chinese Diesel Heater Community; "2 or 5KW Chinese Diesel Air Heaters – Troubleshooting & Support"; "Chinese diesel parking heater projects and mods" | [VERIFY] | Same |
| Home Gym Community by Garage Gym Reviews | [VERIFY] | GGR is also a competitor. Help only, no links. |
| Small Workshop Woodworking Community; The Woodworking Community | [VERIFY] | Winter shop heating and finish temperatures |
| Local "{city} Homeowners" groups | varies | Owner's own town only, as a neighbor |

- Facebook groups need a human profile and rule-by-rule compliance.
- Priority is medium-low: the traffic is hard to measure and the groups skew UK/AU for diesel.
- Create a brand **Facebook Page** only to cross-post Reels.

### 4.4 YouTube (long-form + Shorts)

**Owned channel** (the owner creates it; the agents produce the content):
- **Shorts, 3 per week, 20–40 s, faceless:**
  - thermal-style visualizations rendered from the planner ("Your 2-car garage through a thermal camera: 38% of the heat leaves through the door");
  - "$40 vs $400" seal-vs-heater math;
  - "What breaker does a 5 kW heater need?";
  - "Diesel heater exhaust: the one rule".
  - Render with the site's canvas engine to MP4 (Remotion or ffmpeg), with captions burned in and text-on-screen.
  - If a synthetic voice is used, follow YouTube's altered/synthetic disclosure where it applies.
- **Long-form, 1 per month, 6–10 min:** "How to size a garage heater (with the math)" and "Diesel vs propane vs electric: real cost per hour in 5 states". Embed each on its matching page (VideoObject). YouTube is the #1 AI Overview source type [3P-2026].
- Descriptions link to the matching page (not Amazon) and carry the Amazon disclosure if any Amazon link is added. Amazon requires the channel to be listed in Associates first.

**Creators to partner with** are in §6.1.

### 4.5 Pinterest ("garage ideas" is a large evergreen category)

- **Why:** home improvement and DIY are among Pinterest's fastest-growing male categories [3P-2026]. Pins also live for months, and planners search 45–90 days ahead, so **winter garage pins must be live in October.**
- **Boards:** Garage Heating Ideas · Garage Insulation & Weatherproofing · Garage Gym Ideas · Workshop Ideas · Garage Makeover · Winter Home Checklist.
- **Pin formats:** 1000×1500 (2:3) [3P-2026], with text overlay in the IRONBOW style.
  - sizing cheat sheet;
  - "where your garage loses heat" thermal diagram;
  - winterization checklist;
  - door-kit ROI;
  - state cost card;
  - freeze-date card;
  - 15–30 s video pins, from the same renders as the Shorts.
- **Cadence:** 3–5 fresh pins per day; each URL gets 5+ distinct designs over time. Link to **our pages**, not Amazon (better attribution, and it builds email).
- **Automation:** Pinterest API v5 has native scheduling (`publish_at`, up to 30 days ahead; 1,000 writes per day).
  - It needs a business account, and Standard access needs an app review with a recorded OAuth video.
  - Per third-party reading of Pinterest's authenticity rule, **"an agent that drafts Pins for a user to approve and schedule fits; an agent that auto-generates and auto-publishes does not"** [3P-2026, VERIFY in Pinterest developer guidelines].
  - **Plan:** agents generate a batch of 35 pins weekly; a human approves them in one 15-minute session; the API schedules them.

### 4.6 TikTok / Instagram Reels / YouTube Shorts

- Post the same vertical renders on all three.
- Formats that work in DIY:
  - "POV: your garage is 34 °F and you have a 15 A outlet";
  - the thermal reveal;
  - "3 garage heaters that need a 240 V circuit";
  - "Don't run this in your garage" (CO), which is safety content and shareable.
- **Needs a human** for account creation and phone verification.
- TikTok's Content Posting API requires an app audit; unaudited clients can only post privately [VERIFY]. Plan on manual upload, or a scheduler such as Buffer after the account exists.
- Priority: medium. Referral traffic is small, but it is cheap reuse, and brand search is a quality signal.

### 4.7 Nextdoor: skip

- Since the 2026-08-19 policy update, promotion must come from a free **Business Page** [OFFICIAL, blog.nextdoor.com]. Business newsfeed posts are for **local** businesses; national and e-commerce brands are excluded [3P].
- We are neither local nor a service.
- The only legitimate use is the owner answering a garage question in their own neighborhood as a neighbor, with no links. **Not a channel. Do not spend agent time on it.**

### 4.8 Other one-shots

- **Hacker News "Show HN"** in week 3: "A garage heating calculator that shows all its math (and the 50-state data)". Open methodology plays well there. Human-posted, once.
- **Google Dataset Search**, which comes free with `Dataset` schema.
- **Wikipedia**: do **not** self-cite. If our CSV becomes a genuinely cited source elsewhere, editors may use it.

---

## 5. Email

### 5.1 Stack and constraints

- **Provider:** Kit (per `monetization.md`). Free up to 10,000 subscribers, but limited to **1 sequence and 1 basic visual automation**, with no A/B testing and Kit branding [3P-2026, fastlancer/mailsoftly; Kit Help Center returned 403, so VERIFY].
- **Design for that limit:**
  - one welcome sequence;
  - one automation (tag → sequence);
  - everything else as **broadcasts** to tags.
- Freeze alerts are **broadcasts created via the Kit v4 API** by our cron. VERIFY that broadcast creation is available on the free plan. If not, send alerts through Resend or Postmark (transactional, pennies) to a Kit-synced list, and upgrade to Kit Creator when the list passes 1,000.
- **Compliance:**
  - Double opt-in, because Amazon allows its links in email only to opted-in subscribers.
  - Physical address in the footer (CAN-SPAM; owner provides a PO box).
  - One-click unsubscribe.
  - Weather alerts are opt-in by type.
- **Tags:** `src:{planner|freeze|checklist|brief|state}`, `need:{heat|cool|insulate}`, `fuel:{electric|propane|ng|diesel|hp}`, `zone:{state}-{IECC zone}` (e.g., `MN-6A`), `size:{1car|2car|3car|shop}`, `use:{gym|wood|auto|storage}`.

### 5.2 Lead magnets and expected opt-in rates [MODEL, calibrate after 30 days]

| Magnet | Placement | Expected opt-in |
|---|---|---:|
| **"Email me my plan"** (permalink + PDF summary) | Planner result | **10–15% of completions** |
| **First-freeze and cold-snap alerts** ("48 h before your first 28 °F night, with a 10-minute garage checklist") | First-freeze map, state pages, heater pages (Oct–Dec) | 3–5% of page visitors |
| Garage Winterization Checklist | Inline on insulation and seal pages, and Pinterest landers | 2–4% |
| Electrician Brief | Install-cost, 240V and circuit pages | 4–6% |
| Door-kit cut sheet | Door-insulation pages | 3–5% |
| **Blended across all sessions** | | **1.5–2.5%** (base 2%) |

Klaviyo's 2026 benchmarks for Home & Garden (a DTC reference):
- Campaigns: 32.5% open, 1.78% click, 0.13% placed order.
- Flows: 34.2% open, 5.96% click, 2.12% placed order.
- Apple Mail Privacy Protection inflates opens, so **judge by clicks**.

Our targets:
- Welcome emails: ≥45% open, ≥8% click.
- Broadcasts: ≥35% open, ≥2.5% click.
- Freeze alerts: ≥50% open, ≥6% click (utility-driven).

### 5.3 Welcome sequence (the one Kit sequence; 6 emails over 12 days)

| # | Day | Subject (example) | Content | CTA |
|---:|---:|---|---|---|
| 0 | 0 | Your garage plan: {BTU} BTU/h, ~${cost}/month | Result recap, permalink, "where your heat goes" image | Open the plan |
| 1 | 1 | The cheapest BTUs are the ones you keep | Seal-first ROI from their own inputs: bottom seal, weatherstrip, door kit, payback months | Seal/kit page (affiliate) |
| 2 | 3 | 3 ways garage heaters go wrong | Circuit (80% rule), clearance, CO. Free safety card. | Safety card; CO alarm pick |
| 3 | 5 | Your shortlist: {fuel} heaters that fit your garage | 2–3 product classes matched to their size, circuit and fuel | Product page (affiliate) |
| 4 | 8 | Want it all on paper for the electrician? | $19 Garage Heat Plan with Electrician Brief; launch price $14 until Dec 15 | Checkout (env-gated) |
| 5 | 12 | What's your garage for? (reply) | Ask for use case and photos → feeds tags, UGC and case studies | Reply |

### 5.4 Broadcast calendar (Oct 2026 – Sep 2027)

- **Freeze alerts (automated, regional).**
  - A Vercel Cron runs daily at 11:00 UTC.
  - For each `zone` tag with subscribers, it fetches the NWS gridpoint forecast for the zone's representative point.
  - It triggers when the forecast minimum is ≤28 °F within 72 h for the first time this season ("first hard freeze"), or when an **Extreme Cold Warning** or **Cold Weather Advisory** is active.
  - Send limit: 1 alert per subscriber per 7 days, and at most 4 per season unless the subscriber opts into "every cold snap".
  - Content: the date and temperature, a 5-item checklist (pipes, fridge, batteries, heater test, CO alarm test), cost tonight at their prices, and one product link.
- **Monthly "Garage Climate Report"** on the first Tuesday: price changes (EIA), a new page or data point, one reader garage, one seasonal task.
- **Event sends:**
  - Oct 5: Prime Day, seal and heat (no Amazon prices in email either; link to our page).
  - Nov 24: Thanksgiving-week deals roundup preview.
  - Nov 27: Black Friday.
  - Nov 30: Cyber Monday.
  - Dec 21: coldest six weeks.
  - Jan 13: the January cost update to the state study.
  - Mar 17: "Your garage in summer" pivot, which switches tags to `need:cool`.
  - May–Aug: heat-wave alerts (NWS **Extreme Heat Warning**, the new name for Excessive Heat Warning since 2025 [VERIFY]) and dehumidifier and mini-split content.
  - Sep 1: next-winter prep.

### 5.5 Email economics [MODEL]

- Revenue per subscriber per year is about $1.50–3.00 (affiliate clicks from email plus plan sales). At 2,300 subscribers that is about $3.5–7k/yr, already counted inside the `monetization.md` affiliate and digital lines, not in addition to them.
- The bigger value is **seasonal re-activation**: the list we build in winter is the audience for mini-split and dehumidifier launches in May–July, which carry the highest AOV.

---

## 6. Partnerships

### 6.1 Creators (garage gym, woodworking, DIY, HVAC, diesel)

**Target profile:**
- 5k–150k subscribers;
- posted a garage winter, heater, insulation or diesel-heater video in the last 12 months;
- US audience;
- comments that ask "what size / what breaker".
Micro creators respond, are cheap, and their descriptions rank on YouTube and in AI Overviews.

**Example channels to evaluate** (reach and fit must be checked by an agent; none has been contacted):

| Niche | Examples to evaluate | Why |
|---|---|---|
| Garage gym | Garage Gym Reviews (large; also a SERP competitor, so co-marketing only); smaller home-gym build channels found via the YouTube search "garage gym winter heater" | Every winter they field "how do I heat my garage gym" |
| Woodworking | Woodworking for Mere Mortals (Steve Ramsey), Jonathan Katz-Moses, April Wilkerson, Fix This Build That, 731 Woodworks, Make Something | Shop heating, finish temperatures, dust and flame safety |
| DIY / home | Home RenoVision DIY, Everyday Home Repairs, The Honest Carpenter, Pure Living for Life | Garage insulation and door kits |
| HVAC / electrical education | HVAC School (Bryan Orr), AC Service Tech, Word of Advice TV, Electrician U | Credibility; potential paid technical reviewers |
| Diesel-heater reviewers | Channels behind the "Will a diesel heater heat my garage?" / VEVOR 8 kW test videos (YouTube, Nov 2024 – Nov 2025) | Exactly our Dec–Jan peak audience |
| Car / garage culture | ChrisFix, Vice Grip Garage (large; aspirational); smaller restoration channels | "Winter project car garage" |

**Offers, ranked from cheapest to most expensive:**
1. **Free custom data:** "Your shop through our thermal model". We render their actual garage from their dimensions and ZIP as a video-ready overlay, and they credit us in the video and link in the description. $0; agent-produced.
2. **Embed/tool swap:** they put the planner link in their pinned comment or description, and we feature their build on the matching use-case page (a real link back to them).
3. **Paid integration:** 30–60 s at a **$20–50 CPM** on the creator's 90-day average views (Home & Garden benchmark [3P-2026]). A 20k-view video costs $400–1,000.
   - Budget: $1,500 for Nov–Dec across 2–3 creators, only after the planner is live and polished.
   - Contract terms: FTC disclosure, `#ad`, and a link to our page (not Amazon).
4. **Sponsorship of our newsletter or planner** is the reverse flow and starts in month 7+ (`monetization.md` §6).

### 6.2 Electricians and HVAC pros

- **Paid expert reviewer, recruited in October.** A licensed electrician (any US state) reviews the circuit pages, the Electrician Brief and the 240V guide. A licensed HVAC tech reviews the mini-split and gas unit-heater pages.
  - $75–150 per page review, or a $500/month retainer.
  - Their byline reads "Reviewed by {name}, licensed master electrician, {state} #{license}". Verify the license on the state board site.
  - **This is the single biggest E-E-A-T upgrade available.**
  - Sources: Upwork/Contra, r/electricians only if it is allowed, trade-school instructors, or a local contractor the owner knows.
- **The Electrician Brief as a bridge.** Homeowners bring our brief to quotes. Electricians who see it become embed partners. Add "Are you an electrician? Put this calculator on your site" on the brief page.
- **Local contractor embeds** (year-1 experiment, free):
  - An agent compiles 200 electricians, garage-door installers and insulation contractors in the 10 coldest metros from public listings.
  - A human approves a 3-line email offering the free branded embed.
  - Aim for 5–10% uptake, which brings local links and a pipeline for the paid contractor tier in year 2.
  - Send from a separate subdomain (e.g., `mail.bayheatguide.com`) so the main domain's reputation stays safe. Include a CAN-SPAM opt-out.
- **Lead-gen partners** (Home Depot Services via Impact, Networx, Modernize) are in `monetization.md` §3. Growth's job is to route "install/cost" intent pages to them.

### 6.3 Brands

- **Samples** from Hcalory and VEVOR, which both offer them (`monetization.md`), for the real test program. Ask in October; use them in Dec–Jan content.
- **Mr. Heater, Modine and Dr Infrared:** request spec sheets and install manuals, to cite and to confirm clearances.
- **Utilities and energy offices:** state energy offices publish heat-pump rebates. Link to them from state pages and ask them to list our calculator as a resource. It is a long shot, but .gov links are high-trust.

---

## 7. KPIs and targets

### 7.1 Monthly targets (base / upside). Sessions match the `monetization.md` model.

| Month | Sessions | GSC impressions | Indexed pages | Ref. domains (cum.) | Planner completions | Email subs (cum.) | Affiliate clicks | Gross revenue |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Oct-26 | 1,000 / 2,500 | 20k / 50k | 40 | 5 / 10 | 150 / 400 | 20 / 60 | 160 / 500 | $38 / $150 |
| Nov-26 | 5,000 / 12,000 | 150k / 350k | 80 | 20 / 40 | 750 / 1,900 | 120 / 350 | 800 / 2,400 | $260 / $1.1k |
| Dec-26 | 11,000 / 30,000 | 400k / 1M | 110 | 40 / 80 | 1,650 / 4,800 | 350 / 1,000 | 1,760 / 6,000 | $650 / $2.9k |
| Jan-27 | 14,000 / 40,000 | 500k / 1.3M | 120 | 60 / 110 | 2,100 / 6,400 | 650 / 1,900 | 2,240 / 8,000 | $769 / $4.6k |
| Feb-27 | 9,000 / 25,000 | 330k / 900k | 125 | 70 / 130 | 1,350 / 4,000 | 800 / 2,400 | 1,440 / 5,000 | $381 / $2.5k |
| Mar-27 | 6,500 / 18,000 | 250k / 700k | 145 (cooling cluster) | 80 / 150 | 975 / 2,900 | 900 / 2,700 | 1,040 / 3,600 | $291 / $2.2k |
| Apr-27 | 6,000 / 17,000 | 250k / 700k | 160 | 90 / 170 | 900 / 2,700 | 1,000 / 3,000 | 960 / 3,400 | $269 / $2.1k |
| May-27 | 9,000 / 26,000 | 350k / 1M | 170 | 105 / 190 | 1,350 / 4,200 | 1,150 / 3,500 | 1,440 / 5,200 | $441 / $3.2k |
| Jun-27 | 14,000 / 40,000 | 550k / 1.5M | 175 | 120 / 220 | 2,100 / 6,400 | 1,400 / 4,300 | 2,240 / 8,000 | $1.05k / $5.2k |
| Jul-27 | 18,000 / 50,000 | 700k / 1.9M | 180 | 140 / 250 | 2,700 / 8,000 | 1,750 / 5,300 | 2,880 / 10,000 | $1.37k / $6.6k |
| Aug-27 | 15,000 / 42,000 | 600k / 1.6M | 185 | 160 / 280 | 2,250 / 6,700 | 2,000 / 6,100 | 2,400 / 8,400 | $1.23k / $5.5k |
| Sep-27 | 17,000 / 50,000 | 650k / 1.8M | 190 | 180 / 300 | 2,550 / 8,000 | 2,300 / 7,000 | 2,720 / 10,000 | $1.30k / $6.1k |

Assumptions [MODEL]:
- Planner completions are about 15% (base) or 16% (upside) of sessions, with the planner entry on every page.
- Affiliate CTR is 16% / 20% of sessions, matching `monetization.md` §9.2.
- Email capture is about 2% of sessions, less about 1%/month churn.

### 7.2 Leading indicators for the first 12 weeks (weekly dashboard, agent-compiled)

- **Pages:** published this week vs plan; **% of published pages indexed** (GSC URL Inspection API). Target ≥70% within 14 days of publishing, and ≥90% by Dec 1.
- **Planner:** start rate (planner starts ÷ sessions; target ≥25%), completion rate (≥60% of starts), share-card downloads, and embed hits by host.
- **Rankings** for 25 tracked terms: garage heater calculator, diesel heater for garage, propane heater for garage, most efficient garage heater, garage door bottom seal, garage door weather stripping, garage door insulation kit, and others. Target top 20 for 10 terms by Nov 15, and top 10 for 5 terms by Dec 15.
- **AI:** GSC Generative AI report impressions, and the 25-prompt citation panel. Target cited in ≥2 of 25 prompts by Dec 31, ≥5 by Mar 31, and ≥10 by Sep 30.
- **Links:** new referring domains per week (Ahrefs Webmaster Tools, free for verified sites), and PR pitches sent vs replies vs links.
- **Email:** opt-ins per week, by magnet; welcome-sequence click rate.
- **Money:** affiliate clicks per 1k sessions and EPC per partner (`monetization.md` §12).

### 7.3 Decision rules (kill, keep, double-down)

- **Planner completion under 40% of starts by Nov 1:** stop content work for a week and fix the UX (length of the flow, mobile layout).
- **Under 50% of pages indexed 21 days after publishing:**
  - pause new pages;
  - check GSC for "Crawled – currently not indexed";
  - improve internal links and uniqueness;
  - get 5 more referring domains.
  Do not publish state pages until this is fixed.
- **State study earns fewer than 2 links by Nov 30:** re-pitch using a cold-snap hook, and try r/dataisbeautiful again with a different chart. Do not build more data pages until one works.
- **A Reddit or forum removal or warning:** stop linking in that community for 30 days, and review the rules with a human.
- **Diesel or shop pages in the top 10 by Dec 1:** double down with 3 more diesel pages (e.g., diesel vs propane, 12 V power supply, altitude/noise) before Dec 15.

---

## 8. 12-week launch calendar (Mon 2026-09-28 → Sun 2026-12-20)

Legend: **[A]** agent-executable end to end · **[H]** needs a human action · **[A→H]** the agent drafts and a human approves or posts.

| Wk | Dates | SEO / pages | Assets / PR | Community / social | Email | Partnerships | Milestone |
|---:|---|---|---|---|---|---|---|
| 1 | Sep 28 – Oct 4 | [A] Ship pages #1–4 (planner, methodology, **bottom seal**, sizing matrix); robots with AI bots; sitemap; IndexNow; llms.txt. [H] GSC request-indexing for the 4 URLs; verify Bing WMT. | [A] Finalize the state cost dataset (population-weighted, 2–3 stations per state) and first-freeze station JSON | [H] Create accounts: YouTube, Pinterest (business), Facebook Page, TikTok, Instagram; the editor's Reddit account (existing personal account preferred). Add them to the Amazon Associates site list. [A→H] 20 Reddit comments per week with no links (karma) | [H] Create Kit account, DNS (SPF/DKIM/DMARC), PO box. [A] Build the "email me my plan" form, env-gated | [H] Post the paid-reviewer gig for a licensed electrician | Planner live; 4 URLs submitted |
| 2 | Oct 5 – 11 | [A] #5–10: diesel hub, heaters hub, propane safety, electric hub, most-efficient, weather stripping. Prime Day page (Oct 6–7; no prices). | [A] Printables: safety card (ungated), winterization checklist, Electrician Brief. [A] Share-card generator. | [A→H] First 35 pins (winter boards). 3 Shorts rendered; [H] upload. Denver's first freeze is about Oct 8: first local test pitch to Denver and Front Range outlets. | [A] Welcome sequence written and loaded; [H] turn it on | [A] Creator long-list (60 channels) with reach and fit scores | 10 pages live; first email subscriber |
| 3 | Oct 12 – 18 | [A] #11–16: **data study hub + CSV + Dataset schema**, door-insulation kit, natural gas, Big Maxx/Hot Dawg/Modine, best garage heater, shop heater | [A→H] **PR wave 1 (northern tier):** MN, WI, ND, SD, MI, ME, VT, NH, AK, MT, WY, CO. Minneapolis first freeze is about Oct 18. 60 pitches. [H] Qwoted, Featured and SOS sign-ups. | [H] **Show HN** post (planner + open math). [A→H] GJ: 5 helpful answers. | [A] First-freeze alert cron live (Kit API or fallback). Test in shadow mode. | [H] Sign up for Hcalory and VEVOR samples (links in `monetization.md`) | Data study live; ≥3 media replies |
| 4 | Oct 19 – 25 | [A] #17–20: infrared, 240V, plug-in, install cost | [A] Embeddable planner + cost map at `/embed`; `/embed-hit` telemetry | [H] **r/dataisbeautiful [OC] post** (state map). [A→H] Pins at 5 per day. | [A] Freeze alerts on for zones 6–7 | [A→H] Creator outreach batch 1 (20 micro creators; free thermal-model offer) | ≥20 of 30 pages indexed |
| 5 | Oct 26 – Nov 1 | [A] #21–24: heat pump/mini-split, how to insulate, R-value, keep-above-freezing. **Seasonal refresh** of all heater pages (prices, dates). | [A→H] PR wave 2 (Great Lakes/Northeast): IL, IN, OH, PA, NY, MA, CT, RI, NJ. Chicago first freeze is about Oct 28. | [A→H] YouTube long-form #1: "How to size a garage heater (with the math)". DST ends Nov 1: "winter workshop" Shorts. | [A] First monthly report (Nov 3) drafted | [H] Sign the first reviewer; the review stamp goes live on the circuit pages | 150k GSC impressions per month run-rate |
| 6 | Nov 2 – 8 | [A] #25–28: cheapest way, diesel install, garage gym, thermostat. **State pages batch 1** (10 coldest, gated). | [A] First-freeze map live (#30 moved up if ready) | [A→H] r/homegym and r/garagegym winter threads; woodworking finish-temperature answers | [A] Nov report sent. Freeze alerts for zone 5 (Boston about Nov 9). | [A→H] Contractor embed outreach batch 1 (50 emails; 3 metros) | 25 pages + 10 states |
| 7 | Nov 9 – 15 | [A] #29–30; state batch 2 (10) | [A→H] PR wave 3 (Mid-Atlantic/Upper South): KY, TN, VA, NC, MD, DE, DC, WV, MO, KS. Charlotte and Louisville freezes land Nov 3–7. | [A→H] GJ build or test thread (if samples arrived) | [A] Black Friday segment plan by tag | [A→H] Creator batch 2; paid integration #1 (budget approved by [H]) | 30 pages + 20 states; ≥10 ref. domains |
| 8 | Nov 16 – 22 | [A] Black Friday/Cyber Monday roundups (Nov 20; no Amazon prices). State batch 3 (10). | [A→H] PR wave 4 (South): GA, AL, MS, TX, OK, AR, LA. NYC and Atlanta freezes are about Nov 20. | [A→H] r/coolguides sizing cheat sheet; Pinterest holiday-gift angle ("gifts for the garage guy": heaters, thermostats, CO alarms) | [A] Thanksgiving-week preview (Nov 24) | [H] Approve the creator payment | ≥1 earned media link |
| 9 | Nov 23 – 29 | [A] Refresh pricing on money pages; internal-link audit; orphan fix | [A] Reactive cold-snap pitch kit (templates per NWS event) | [A→H] BF Shorts ("don't buy a heater before you check your breaker") | [A] **Black Friday (Nov 27)** broadcast | — | Record traffic week so far |
| 10 | Nov 30 – Dec 6 | [A] Cyber Monday update; state batch 4 (10); `/wood-stove-for-garage`, `/kerosene-heater-for-garage` | [A→H] Reactive pitches as Extreme Cold Warnings fire | [A→H] YouTube long-form #2: "Diesel vs propane vs electric: real cost per hour" | [A] **Cyber Monday (Nov 30)** broadcast. Plan offer ($14 launch price) if checkout exists. | [A→H] Contractor batch 2 | 11k-session December on pace |
| 11 | Dec 7 – 13 | [A] State batch 5 (remaining 11, including cooling-first warm states); waste-oil heater; garage subpanel | [A] **Data study v1.1** with December prices; re-pitch any outlet that replied | [A→H] Diesel peak: diesel Shorts + pins; FB diesel-group answers | [A] Broadcast: "The coldest 6 weeks start now" (sent Dec 15) | [H] Decide on a GJ vendor sponsorship quote | 51 state pages (gated) |
| 12 | Dec 14 – 20 | [A] Q1 plan: cooling-cluster briefs (AC, dehumidifier, fan, portable AC, mini-split cool mode); the January refresh list | [A] "January is the coldest month" state update prepared (publish Jan 12) | [A] Retro: which community drove clicks and subscribers | [A] Solstice email (Dec 21). Retro on sequence metrics. | [A] Creator results review (CPM achieved, clicks) | Retro doc; Q1 plan |

**After week 12:**
- Jan: the January data update and a diesel/shop push.
- Feb: build the cooling cluster.
- Mar: publish it and switch email tags.
- Apr–May: the heat-wave alert build.
- Jun–Jul: cooling peak.
- Sep 2027: next heating season, with a year of links behind us.

---

## 9. Who executes what: agent team vs human

| Workstream | Agent-autonomous | Needs a human (and why) |
|---|---|---|
| Keyword/SERP research, briefs, topical map upkeep | ✅ | — |
| Writing and updating pages, tables, diagrams, schema | ✅ (with the uniqueness gate and a self-review checklist) | **Named editor** reviews a 10% sample per batch and owns the byline. Paid **licensed reviewer** for electrical and gas pages. |
| Code: planner, embeds, cron alerts, IndexNow, sitemaps, share cards, video renders | ✅ | — |
| Data study compute and monthly price refresh (EIA, NOAA, NWS) | ✅ | — |
| GSC and Bing verification and request-indexing | Partial (APIs once credentials exist) | **Owner** creates the service account and BWT verification; manual request-indexing is a UI action |
| Analytics and reporting dashboards | ✅ (after keys exist) | Owner creates Plausible/GA4 and GSC API credentials |
| Reddit, GarageJournal, Facebook participation | Draft only (find threads, draft answers, check rules) | **Human posts** from their own account. Reddit's API needs pre-approval and covers AI agents, and forum rules forbid undisclosed commercial accounts. |
| Pinterest | Design pins, write copy, schedule via API after approval | **Human** creates the business account, completes the API app review (OAuth video) and approves batches |
| YouTube / TikTok / Instagram / Facebook Page | Script, render video, captions, descriptions, thumbnails | **Human** creates accounts (phone and ID verification) and uploads or approves. The TikTok posting API needs an audit. |
| Email: copy, sequences, segmentation, alert logic | ✅ | **Owner** creates the Kit account, DNS, postal address and double-opt-in settings |
| PR: lists, localized numbers, pitch drafts, monitoring NWS for hooks | ✅ | **Human sends** pitches under a real name and handles journalist replies and on-record quotes. Journalists expect a person. |
| Qwoted / Featured / SOS | Draft answers | **Human** signs up (identity) and submits |
| Creator outreach | Long-list, scoring, first-draft emails | **Human** approves spend, signs agreements and pays (money plus FTC disclosure obligations) |
| Contractor embed outreach | List building, drafts, follow-up scheduling | **Human** approves the template and volume. Sending domain and DNS belong to the owner. |
| Affiliate, lead-gen and checkout program sign-ups | — | **Owner only** (tax forms, bank, identity; `monetization.md` §11) |
| Amazon site-list updates for each social profile | — | **Owner** (Associates Central) |
| Paid expert reviewer hiring | Draft the job post and screening questions; verify the license on the state board site | **Owner** hires and pays |
| Test program (buying heaters, running tests) | Protocol, data logging template, analysis and charts | **Human** buys, installs and runs the physical tests |

**Owner time needed:** about 3 hours per week (approvals, posting, pitches, replies), plus a one-time setup of about 6–8 hours in week 1 (accounts, DNS, program sign-ups).
**Agent team roles** (map these to the ops design):
- SEO/content lead;
- data engineer (EIA/NOAA/NWS jobs);
- community drafter;
- social producer (pins and Shorts);
- PR researcher;
- email operator;
- analyst (weekly dashboard, decision rules in §7.3).

---

## 10. Owner checklist additions (growth-specific; add to `monetization.md` §11)

| # | Action | Blocks | Env var / artifact |
|---:|---|---|---|
| G1 | Name the **editor** (real person, photo, LinkedIn) for bylines, Reddit, PR | Trust, PR, communities | `NEXT_PUBLIC_EDITOR_NAME`, `NEXT_PUBLIC_EDITOR_URL` |
| G2 | Bing Webmaster Tools verification (import from GSC) | ChatGPT-search visibility | IndexNow key: `INDEXNOW_KEY` (the agent generates it; file at `/{key}.txt`) |
| G3 | Social accounts: YouTube, Pinterest Business, TikTok, Instagram, Facebook Page. Handle `@bayheat` or similar. | Social channels | `NEXT_PUBLIC_SOCIAL_*` for `sameAs` |
| G4 | Add each social profile to the Amazon Associates **Website and Mobile App List** | Amazon links in video and pin descriptions | — |
| G5 | Pinterest developer app, then Standard access review | Pin scheduling | `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_IDS` (JSON) |
| G6 | Qwoted, Featured and Source of Sources accounts | PR | — |
| G7 | Separate outreach subdomain with DNS (`mail.` or `hello.`) | Contractor and creator outreach | — |
| G8 | Budgets: creators $1,500 (Nov–Dec); reviewer ~$500/mo; test program $800–1,200 | Partnerships, E-E-A-T | — |
| G9 | NWS User-Agent contact and cron secret | Freeze alerts | `NWS_USER_AGENT`, `CRON_SECRET` (already in `monetization.md`) |

---

## 11. Sources (accessed 2026-09-25)

**Search and AI**
- Google spam policies (scaled content, doorways, widget links, thin affiliates) [OFFICIAL]: https://developers.google.com/search/docs/essentials/spam-policies
- Google, "Optimizing your website for generative AI features" (2026-05-15) [OFFICIAL]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide ; blog: https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- Google, "A reminder about widget links" (2016-09-08) [OFFICIAL]: https://developers.google.com/search/blog/2016/09/a-reminder-about-widget-links
- FAQ rich results removed 2026-05-07 [3P-2026]: https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- 2026 spam and core updates vs scaled content [3P-2026]: https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/ ; https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated
- llms.txt status and adoption [3P-2026]: https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026 ; https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained
- AI citation patterns [3P-2026]: https://otterly.ai/blog/the-ai-citations-report-2026/ ; https://www.tryprofound.com/blog/ai-platform-citation-patterns ; https://www.averi.ai/how-to/chatgpt-vs.-perplexity-vs.-google-ai-mode-the-b2b-saas-citation-benchmarks-report-(2026)

**Data**
- EIA Electric Power Monthly Table 5.6.B (Jul 2026 YTD; released 2026-09-24) [OFFICIAL]: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b
- EIA natural gas residential prices (annual 2025; released 2026-08-31) [OFFICIAL]: https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_a.htm
- EIA weekly heating oil and propane (through 2026-03-30; next release 2026-10-07) [OFFICIAL]: https://www.eia.gov/dnav/pet/pet_pri_wfr_a_EPLLPA_PRS_dpgal_w.htm
- NOAA NCEI 1991–2020 annual/seasonal normals (freeze probabilities, HDD base 50) [OFFICIAL]: https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/ ; https://www.ncei.noaa.gov/news/when-expect-first-fall-freeze
- NWS hazard simplification (Extreme Cold Warning / Cold Weather Advisory, 2024-10-01): https://en.wikipedia.org/wiki/Extreme_cold_warning ; https://www.kfyrtv.com/2024/10/24/wind-chill-alerts-get-new-names-this-winter-national-weather-service-morse-code-weather/
- NFPA heating-fire figures (via Fire Chiefs Association of Massachusetts; VERIFY on nfpa.org): https://fcam.org/nfpa-shares-information-on-u-s-home-heating-fires-which-peak-during-winter-months/ ; CPSC winter safety: https://www.cpsc.gov/Newsroom/News-Releases/2025/As-Winter-Storms-Threaten-Millions-in-the-US-CPSC-Issues-Safety-Tips-to-Help-Families-Prevent-Carbon-Monoxide-Poisoning-and-Fires
- Vent-free restrictions (VERIFY per state): https://thetorchguys.com/blogs/news/where-are-ventless-fireplaces-banned ; https://legalclarity.org/are-ventless-gas-fireplaces-legal-rules-and-regulations/

**Platforms**
- Reddit Responsible Builder Policy [OFFICIAL]: https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy
- Reddit self-promotion norms [3P-2026]: https://redship.io/blog/reddit-self-promotion-rules ; https://www.soar.sh/blog/self-promotion-rules-by-subreddit-database
- Subreddit sizes [3P]: https://reddapi.dev/subreddits/HomeImprovement/insights (and /garagegym, /woodworking, /hvacadvice, /homegym, /electricians, /heatpumps, /projectcar, /garageporn)
- VerticalScope vendor policy [OFFICIAL, network-wide]: https://www.avsforum.com/help/vendor_faq/ ; GJ moderation thread: https://www.garagejournal.com/forum/threads/flooring-industry-folks-not-invited-the-rest-read-this.282615/page-2
- Nextdoor self-promotion update (2026-08-19) [OFFICIAL]: https://blog.nextdoor.com/self-promotion-update ; business posts: https://business.nextdoor.com/en-us/getting-started/business-post
- Pinterest API access tiers and scheduling [OFFICIAL/3P]: https://developers.pinterest.com/docs/key-concepts/access-tiers/ ; https://vorplabs.com/agent-tools/pinterest-api ; https://posteverywhere.ai/blog/schedule-pinterest-pins-api
- Pinterest pin size and statistics [3P-2026]: https://postfa.st/sizes/pinterest/pin ; https://sproutsocial.com/insights/pinterest-statistics/
- Amazon Associates policies (email, social, offline) [OFFICIAL]: https://affiliate-program.amazon.com/help/operating/policies
- Prime Big Deal Days Oct 6–7, 2026 [OFFICIAL]: https://www.aboutamazon.com/news/retail/amazon-prime-big-deals-day-2026-when-october-6-7
- Facebook diesel-heater groups: https://www.facebook.com/groups/419122475590648/ ; https://www.facebook.com/groups/146837062640024/

**Email and partnerships**
- Klaviyo 2026 benchmarks (Home & Garden, Hardware) [3P-2026]: https://www.klaviyo.com/uk/blog/email-marketing-benchmarks-open-click-and-conversion-rates
- Kit free plan limits [3P-2026; VERIFY]: https://www.fastlancer.org/en/fastlancer-blog/kit-review/ ; https://mailsoftly.com/blog/kit-free-plan/ ; https://help.kit.com/en/articles/9053602-the-kit-newsletter-plan
- HARO alternatives [3P-2026]: https://www.prezly.com/academy/the-best-haro-alternatives ; https://linkinbound.com/blog/haro-alternatives
- YouTube sponsorship CPMs [3P-2026]: https://www.launchpointhq.com/guides/rates/how-much-do-home-garden-youtubers-charge ; https://outlierkit.com/resources/youtube-sponsorship-rates/
- Diesel-heater garage videos (creator discovery): https://www.youtube.com/watch?v=ezGgWcwkaas ; https://www.youtube.com/watch?v=f2VUYmfaMMM ; https://www.youtube.com/watch?v=0JeqWqzNHl8
