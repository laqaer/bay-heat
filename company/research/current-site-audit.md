# Current-site audit: bayheatguide.com as of 2026-09-25

**Prepared:** 2026-09-25 · **Role:** skeptical editor + SEO auditor · **Readers:** the rebuild team and the agent team that will run the company
**Scope:** everything in the repo at `HEAD` 650c2c9, which is also what the live site serves: `lib/site.ts`, `lib/affiliates.ts`, `lib/json-ld.ts`, `app/layout.tsx`, `app/page.tsx`, all 13 `app/*/page.tsx`, `components/*`, `app/globals.css`, `README.md`, and `.cursor/skills/verify-bay-heat/*`. The live site was checked with curl. Its sitemap lists the same 14 URLs, and `www` returns a 308 to the apex.
**Inputs:** `scratchpad/keywords.tsv` (526 terms) and `scratchpad/keyword-metrics.tsv` (76 terms with peaks). "Volume" means average US monthly searches, and "peak" is the highest month in the data. Primary-source checks of the manuals were run on 2026-09-25 and are cited inline.
**Companion docs** (not repeated here): `competitors.md`, `monetization.md`, `growth-playbook.md`, `design-direction.md`, `planner-engineering.md`.

---

## 0. Verdict in ten lines

1. **The content is careful and correct. The business is built on almost no demand.** The eleven guides aim at phrases whose exact-match volume adds up to **about 180 searches a month**. Seven of the eleven target phrases **do not appear at all** in a 526-term keyword pull. The same facts, placed on the right URLs, could compete for a pool of more than 50,000 searches a month (§1.3).
2. **The site turns money away on purpose.** The copy says "we will not" **21 times** and uses "invent" **29 times**. Four pages say, in so many words, "No affiliate buy buttons on this page". The insulation page refuses to link to door kits and seals, and those are the highest-volume purchases in the niche (bottom seal 27.1k/mo, insulation kit 22.2k/mo).
3. **Out of scope by choice:** propane (9.9k pool), diesel (6.6k average, 27.1k in January), natural gas (8.1k), mini-split and heat pump (3.6k), "most efficient" (5.4k), "best garage heater" (5.4k), the calculator (880 average, 2.9k in January), and door sealing and insulation (27.1k + 22.2k + 22.2k).
4. **No money path exists:** there is no tool, no email capture, no analytics, no images, no OG image, no product cards and no named author. Across the whole site there are 11 affiliate text links on 5 pages, and each one sits in the last column of a spec table near the bottom of its page.
5. **The design reads as a plain 2019 Substack:** cream paper `#f3eee4`, Source Serif 4, and nothing visual. The header has 12 nav items and wraps to two lines at 1440 px. On every guide page, **two disclaimer boxes come before the first sentence of content**. The rust accent `#b4532a` on paper has a contrast of **4.31:1**, which fails WCAG AA for the 12 px labels and links that use it.
6. **Accuracy is high.** Every circuit number I checked matches the manufacturer sheets (CZ220, FUH54, DR-975, HS-1500-TT) and the NEC arithmetic. There are **three real errors and three meaningful omissions** (§3):
   - "Under $200" is false for the FUH54, which lists at $468–$500 at Walmart.
   - The DR-975 back-wall clearance is 4.5 in, not 1 ft.
   - Stale copy says affiliate links are "still placeholders".
   - Missing: 2020+ NEC GFCI on 240 V garage receptacles, the CZ220's own "not for areas where gasoline is stored" warning, and heat pumps as the real answer to "most efficient".
7. **Keep:** the verified spec facts, the circuit tables, the cost and propane arithmetic, the seal-first checklist, and the portable-safety rules. They become a shared **facts registry** that the planner, product cards and every new page use (§2).
8. **Redirects:** 9 of the 11 guide URLs should merge into 7 keyword-shaped URLs using `permanent: true`, which sends a **308**. Two guides are kept (`/best-wall-mount-garage-heaters` and `/electric-vs-propane-garage-heater`), along with `/`, `/about` and `/privacy` (§5). The domain is about 3 weeks old, and a `site:` query returns nothing, so the equity at risk is close to zero. **Pull GSC first** and keep any URL that shows impressions.
9. **The verify skill is worth keeping as infrastructure.** Its 832-line zero-dependency Node helper handles port isolation, process ownership and link-following. Its content is stale: it lists 8 of 11 routes, and its doctor hardcodes the old home H1. It also cannot click, type, test mobile or assert redirects. It should be ported to `.claude/skills/` and extended with Playwright, which is already installed at `/opt/node22/lib/node_modules/playwright` (§6).
10. **Brand risk:** "BayHeat Guide" collides with **Bay Heating & Cooling** (bayheatcool.com), an Annapolis MD HVAC contractor that fills the `site:bayheatguide.com` results. "Heat" also limits the summer cooling and dehumidifier half of the business. Keep the domain, because it is a hard constraint. Consider "BayHeat" as the wordmark, with a descriptor such as "garage climate", and drop "Guide".

---

## 1. Page inventory and real demand

### 1.1 What exists

| # | URL (live, 200) | H1 (abridged) | Words* | Amazon links | Updated |
|---|---|---|---:|---:|---|
| 0 | `/` | "Choose the electric garage heater that matches the circuit you have." | ~900 | 0 | — |
| 1 | `/best-electric-garage-heaters-by-size` | Electric garage heater size: 1/2/3-car wattage ranges | 1,146 | 3 (CZ798, CZ220, FUH54) | 09-14 |
| 2 | `/120v-vs-240v-garage-heater` | 120V vs 240V: what your circuit can actually run | 947 | 0 | 09-04 |
| 3 | `/hardwired-vs-plugin-garage-heater` | Hardwired vs plug-in: outlet heat vs a landed circuit | 1,888 | 0 | 09-11 |
| 4 | `/forced-air-vs-infrared-garage-heater` | Forced-air vs infrared: drafty shops vs spot heat | 806 | 0 | 09-04 |
| 5 | `/best-ceiling-mount-garage-heaters-under-200` | Ceiling-mount under $200: Comfort Zone / Fahrenheat-class | 1,051 | 2 (CZ220, FUH54) | 09-11 |
| 6 | `/portable-garage-heaters-15a-circuit` | Portable garage heaters on a 15 A circuit | 906 | 1 (CZ798) | 09-11 |
| 7 | `/wall-mount-vs-ceiling-garage-heater` | Wall-mount vs ceiling-mount: joist load, throw, headroom | 1,982 | 2 (CZ220, FUH54) | 09-11 |
| 8 | `/best-wall-mount-garage-heaters` | Wall-mount electric: 5 kW, 7.5 kW, 15 A wall units | 1,491 | 3 (FUH54, DR-975, HS-1500-TT) | 09-18 |
| 9 | `/insulate-garage-before-heater-upgrade` | Seal and insulate first, or buy more watts? | 2,022 | 0 | 09-04 |
| 10 | `/electric-garage-heater-operating-cost` | How much an electric garage heater costs to run | 1,892 | 0 | 09-07 |
| 11 | `/electric-vs-propane-garage-heater` | Electric vs propane: attached air vs shop BTU | 2,436 | 0 | 09-09 |
| 12 | `/about` | About BayHeat Guide | 294 | 0 | 09-05 |
| 13 | `/privacy` | Privacy policy | 391 | 0 | 09-05 |

\*Words are visible body text in the page component, excluding the shared chrome.
The whole site has 11 Amazon link placements across 5 pages, all pointing at 5 verified ASINs. There are no images anywhere. There are no forms. There is no client-side interactivity except the mobile `<details>` menu.

### 1.2 Target keyword and real volume

The target is inferred from each page's title, H1 and slug. The volumes come from grepping `keywords.tsv` and `keyword-metrics.tsv`. "0 / absent" means the phrase is not among the 526 terms pulled, so it is effectively zero.

| Page | Phrase the page targets | Volume (peak) | What the same content should target instead (volume, peak) | Flag |
|---|---|---:|---|---|
| `/` | "choose an electric garage heater by circuit and size" | 0 / absent | garage heater **27,100** · garage heater electric **14,800** · heater to heat garage 14,800 | ⚠ The home page targets nothing |
| by-size | "electric garage heater size", "garage heater size" | **70** (260) | how many btu to heat a garage 210 (1.6k) · garage heater calculator **880 (2.9k)** · size calculator 390 · garage btu calculator 320 · garage heater for 3 car 170 (480) · electric heater for 2 car 110 · what size heater for 2 car 70 (210) | ⚠ Near-zero; should become the calculator's companion page |
| 120v-vs-240v | "120v vs 240v garage heater" | **0 / absent** | electric garage heater 120v **3,600** · electric garage heater 240v **1,300** · 120v garage heater 880 · 240v garage heater 590 (1.6k) · 240v electric heater 480 · 110v garage heater 590 | 🚫 Zero-demand phrasing |
| hardwired-vs-plugin | "hardwired vs plug-in garage heater" | **0 / absent** | plug in garage heater 480 (1.6k) · plug in electric garage heater 170 · best plug in 90 (480) | 🚫 Zero |
| forced-air-vs-infrared | "forced air vs infrared garage heater" | **0 / absent** | infrared garage heater **2,400** (9.9k Jan per growth doc) · forced air heater for garage **1,900** · radiant heater for garage 1,600 · forced air electric garage heater 1,000 | 🚫 Zero, but it sits next to about 7k of demand |
| ceiling-under-200 | "best ceiling mount garage heater (under $200)" | **10** (50) | ceiling mounted heater 720 · comfort zone garage heater 720 · ceiling mount garage heater 480 (1.6k) · 120v ceiling-mounted 320 · ceiling mount electric garage heater 260 | ⚠ Near-zero, and the "$200" premise is false (§3) |
| portable-15a | "portable garage heater 15 amp" | **0 / absent** ("15 amp" matches no term) | portable electric garage heater **4,400** · garage portable heater **3,600** · space heater for garage **3,600** · electric garage heater 120v 3,600 · best portable heater for garage 1,000 · best space heater garage 1,000 | 🚫 Zero phrasing; the pool here is about 16k |
| wall-vs-ceiling | "wall mount vs ceiling garage heater" | **0 / absent** | (none; this is a section, not a page) | 🚫 Merge |
| best-wall-mount | "best wall mount garage heater" | **10** (30) | wall mount garage heater 210 (720) · wall mounted electric garage heater 210 · 220 volt wall mounted electric heaters 590 · wall mounted electric heater 4,400 (generic, not garage) | ⚠ Tiny, but the slug is correct |
| insulate-first | "insulate garage before heater upgrade" | **0 / absent** | garage door bottom seal **27,100 (33.1k Oct)** · garage door insulation kit **22,200** · garage door weather stripping **22,200 (40.5k Nov)** · garage insulation **9,900** · how to insulate a garage 2,400 · insulation cost for garage 1,600 ($8.68 CPC) | 🚫 Zero phrasing, sitting next to the largest pool in the niche |
| operating-cost | "electric garage heater operating cost" | **0 / absent** | most efficient garage heater **5,400** · cheapest way to heat a garage 390 (1.3k) · most efficient way 110 (390) · cost to heat a garage 50 (210) | 🚫 Zero |
| electric-vs-propane | "electric vs propane garage heater" | **90** (390) | garage heater gas vs electric 170 · propane heater for garage **9,900** · gas garage heater **8,100** · indoor safe propane heater 9,900 · mr heater big maxx 2,900 (12.1k) | ⚠ Low, but it is the only page with any real match |

### 1.3 Arithmetic

- **Exact-match demand across all 11 guides:** 70 + 0 + 0 + 0 + 10 + 0 + 0 + 10 + 0 + 0 + 90 = **180 searches a month**. At a realistic 3–5% CTR from page 1 positions, that is roughly 5–9 visits a month. Then about 1% of visits click to Amazon, and about 4% of those click through to a purchase at 3% commission. This explains the revenue.
- **The pool adjacent to the same content**, using only the rows above and without double-counting generic "heater" terms, is about **56,000 searches a month**. Most of it is on sealing and insulation (≈71k raw including kit, seal and weatherstrip) and portables (≈16k). The heating-season peak roughly triples it.
- **The biggest clusters the site does not touch at all:** garage heater 27.1k, propane pool 9.9k, gas 8.1k, diesel 6.6k (27.1k Jan), shop heater 6.6k (33.1k Jan), best garage heater 5.4k, most efficient 5.4k, mini split 3.6k (8.1k Jul), garage AC 12.1k (33k Jul), garage dehumidifier 12.1k.
- **Root cause:** the pages were named after *the editor's decision tree*, such as "120V vs 240V" or "hardwired vs plug-in". They were not named after *the searcher's words*, such as "120v garage heater" or "portable electric garage heater". The decision-tree framing is good UX *inside* a page. It is the wrong basis for URLs, titles and H1s.

---

## 2. Content: keep, merge, kill

### 2.1 KEEP: move into a single facts registry (`lib/facts/*.ts` or similar), cited, and reuse everywhere

These facts are verified. They are the site's real asset. The planner, product cards, comparison tables and prose should all import them, so a number is never retyped. The current site repeats "20.9" 16 times, "10 AWG" 24 times and "1,440" 8 times by hand.

**Circuit table** (from `/120v-vs-240v-garage-heater`; the arithmetic is correct):

| Circuit | Continuous ceiling (80%) | Class it feeds |
|---|---|---|
| 15 A / 120 V | 1,440 W (12 A) | 1,500 W portable is 12.5 A. Keep it as the only load on the circuit. |
| 20 A / 120 V | 1,920 W (16 A) | Larger portable; still spot heat |
| 30 A two-pole / 240 V | 5,760 W | 5 kW: 20.8 A × 1.25 = 26.0 A, so a 30 A breaker, 10 AWG Cu |
| 40 A two-pole / 240 V | 7,680 W | 7.5 kW: 31.25 A × 1.25 = 39.1 A, so a 40 A breaker, 8 AWG Cu |
| 50–60 A two-pole / 240 V | 9.6–11.5 kW | 10 kW: 41.7 A × 1.25 = 52.1 A, so a 60 A breaker, 6 AWG Cu |

**Product facts** (checked against primary sheets on 2026-09-25):

- **Comfort Zone CZ220** (ASIN B009F1SWH8). Source: the Home Depot-hosted manual PDF, images.thdstatic.com …/009b17c0-….pdf.
  - Switch III / II / I = 5,000 / 4,000 / 3,000 W at 208–240 V, drawing 20.9 / 16.7 / 12.5 A, rated 17,060 / 13,650 / 10,240 BTU/h.
  - "RECOMMENDED CIRCUIT BREAKER 30 AMP or larger"; "10 AWG, COPPER ONLY", 75 °C.
  - Air throw is "18 FT (APPROXIMATE)". Weight is "BETWEEN 25 TO 30 LBS".
  - "Do not install closer than 8 inches to a vertical surface. Do not install less than 6 feet from the floor." Keep combustibles 3 ft from all sides.
  - "240V AC rated direct wired appliance. Never use extension cords or relocatable power taps."
  - **Not yet on our site:** "not suitable for use in hazardous locations… Do not use in areas where gasoline, paint, or flammable liquids are used or stored." "Maximum recommended ceiling height for effective vertical air flow is 8 ft."
- **Fahrenheat FUH54 / FUH54C** (ASIN B00PX0T37I).
  - 5,000 W / 240 V, 20.9 A, 17,065 BTU/h, 30 A maximum fuse.
  - Jumper derates to 4,165 / 3,332 / 2,500 W. The 208 V taps are listed separately: 5 kW elements on 208 V give (208/240)² × 5,000 ≈ **3,755 W**. Add that number.
  - 10 AWG Cu minimum (8 AWG for 7.5 kW), 75 °C, no aluminum. Mount at least 6 ft off the floor.
  - Wall or ceiling mounting is allowed per the FUH manual. The site's "6–11 ft window" and "18 ft throw" for the FUH were not re-verified this session; mark them [VERIFY].
- **Dr. Infrared DR-975** (ASIN B01M8KXXAB). Source: manual via manuals.plus.
  - 7,500 W / 240 V, 25,597 BTU/h. "Individual branch circuit protected by a 40 Amp circuit breaker only." "8 AWG (8.3 mm²) copper wires."
  - At least 6 ft from the floor. 1 ft from adjacent surfaces or walls on the sides. **4.5 in from the back wall** (see §3 error E2).
  - It has a fan despite the "infrared" brand name. That statement on the site is correct.
- **Heat Storm Tradesman HS-1500-TT** (ASIN B07JQPCFJ3).
  - 1,500 W / 120 V. Mount at least 72 in off the floor (US; 98 in for Canada). 18 in clearance at the sides, 24 in at the top.
  - The housing must be vertical for the tip-over switch to allow operation.
- **Comfort Zone CZ798** (ASIN B004VVJANC). A 1,500 W / 120 V milkhouse heater.

**Arithmetic blocks** (checked; all correct):

- Cost: `kWh = W/1000 × hours-on`, and `$ = kWh × $/kWh`. The worked session is 5 + (5 × 3 × 0.4) = 11 kWh, which is $2.20 at $0.20. The portable over 4 h is 6 kWh, or $1.20.
- Propane: 91,500 BTU/gal. 5 kW ≈ 17,060 BTU/h ≈ 0.19 gal/h, which is $0.65 at $3.50/gal. Burning 1 gal of propane makes about 0.83 gal of water: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O, and 4.24 lb of propane (43.6 mol) yields 3.14 kg of water. Indoor-rated unvented heaters run about 4–18k BTU/h.
- Portable amp table: 750–1,000 W = 6.3–8.3 A; 1,250–1,300 W = 10.4–10.8 A; 1,500 W = 12.5 A.
- Garage footprints: 1-car 200–300 ft², 2-car 400–600 ft², 3-car 600–900+ ft².
- W/ft² brackets: 8–10 insulated, 12–15 partial, 15–20+ uninsulated. **Keep these only as the planner's fallback or sanity check.** They are consistent with the planner spec's worked example: a 24×24 ft Chicago garage needs 9.3 kW (16 W/ft²) before sealing and 3.8 kW (6.6 W/ft²) after. They ignore climate, which is the reason the planner exists.

**Checklists and decision rules worth porting:**

- The 5-step seal-first table in `/insulate…`:
  1. Door weatherstrip
  2. Bottom seal
  3. Insulate the door
  4. Man-door and penetrations
  5. Reachable ceiling and walls

  Each row has a "good enough signal" and a "not a substitute for" column. **This becomes the spine of the insulation hub, and each row gets a product slot** (seal, kit, man-door sweep, foam, batts).
- The 6 portable-heater safety rules (`/portable…#safety`): wall outlet only, 3 ft clearance, no unattended overnight use, and so on.
- "When wall wins" (4 bullets) and the dust and fumes warning (`/wall-mount-vs-ceiling…`).
- The propane CO, listing and vent block, plus the CO alarm placement (garage *and* the house side of the service door).
- "Don't feed a 5 kW unit from a dryer, EVSE or welder circuit because it's 240."
- "Don't hang a portable from a joist; don't cord a hardwire-only cabinet."
- **Voice:** concrete numbers, "the manual wins over a blog height", honesty about duty cycle. **Keep that voice. Lose the defensiveness.**

### 2.2 MERGE

| From | Into | What survives |
|---|---|---|
| `/120v-vs-240v-garage-heater` + the circuit half of `/hardwired-vs-plugin…` | `/240v-garage-heater` | Circuit table, breaker and wire, panel capacity, corded-240 vs direct-wire, and the new GFCI note |
| `/portable-garage-heaters-15a-circuit` + the plug-in half of `/hardwired-vs-plugin…` | `/portable-garage-heater` (see §5 on the slug) | Amp table, milkhouse/ceramic/oil/quartz, GFCI and shared circuits, safety rules, CZ798 and HS-1500-TT cards |
| `/best-ceiling-mount-garage-heaters-under-200` + `/wall-mount-vs-ceiling-garage-heater` | `/ceiling-mount-garage-heater` | CZ220/FUH54 matrix, joist load, headroom, throw, "when wall wins" (links to the wall page) |
| `/forced-air-vs-infrared-garage-heater` | `/infrared-garage-heater` | "Two different jobs", drafty-shop ranking, spot-heat logic |
| `/insulate-garage-before-heater-upgrade` | `/how-to-insulate-a-garage` (insulation hub) | Seal-first table, slab and thermal mass, "when more watts are still required" |
| `/electric-garage-heater-operating-cost` | `/cost-to-heat-a-garage` (data-study hub), methodology section | Formula, duty cycle, reading the bill, worked session |
| `/best-electric-garage-heaters-by-size` | `/garage-heater-size` (planner companion matrix) | Footprints, W/ft² fallback, "cars label ≠ load" |

### 2.3 KILL

- **The "What this page will not claim" sections** on 5 pages (~150–250 words each), plus most of the 21 "we will not" and 29 "invent" phrases. Replace them with one `/editorial-policy` page and one line near each table ("Figures are nameplate and manual values; how we test").
- **The tagline and hero line calling the site boring:** "Boring, specific advice…" (`lib/site.ts` tagline) and "BayHeat Guide is a boring comparison site…" (home). Describing yourself as boring is not humility; it is anti-conversion.
- **The two stacked disclaimer callouts above the fold** on every guide (`components/guide-chrome.tsx`, `<SafetyCallout/><AffiliateCallout/>` before the TOC). Replace them with a one-line affiliate notice near the top plus a contextual safety callout at the point of risk. Keep the full text in the footer.
- **The "under $200" framing.** It is false for the FUH54 (§3 E1), and it caps order value.
- **Stale copy** (§3 E3). "Placeholder — retailer URL not live" on the ceiling page's 7.5 kW row, even though the DR-975 ASIN is verified.
- **About page:** "It is not an astrology, horoscope, or other Laqaer consumer brand." This leaks the sibling brands and reads as bizarre to a garage owner.
- **The `keywords` array in `app/layout.tsx` metadata.** Google ignores it.
- **"tag laqaer-20" printed in reader-facing copy** (the affiliate disclosure and the "Example products" paragraphs). Readers do not need the tag.
- **Tics:** "adult answer" / "adult step" (6×), "Saturday" as a unit of time (≥8×), and "is a conversation" (≥6×).
- **The `/wall-mount-vs-ceiling-garage-heater` page as a standalone page.** It has zero demand and duplicates the ceiling and wall pages.

---

## 3. Accuracy check of the key technical claims

Legend: ✅ correct · ⚠ correct but imprecise, mis-cited or incomplete · ❌ wrong

| # | Claim on site | Verdict | Evidence / fix |
|---|---|---|---|
| A1 | "15 A × 120 V × 0.8 = 1,440 W; a 1,500 W heater draws 12.5 A, over the continuous ceiling… does not make 1,500 W heaters illegal" | ⚠ | The arithmetic is right. **The code hook is wrong.** The site cites NEC 210.19/210.20 (conductor and OCPD sizing for continuous loads). The rule that actually caps a *cord-and-plug* heater is **NEC 210.23(A)(1)**: one cord-and-plug-connected piece of utilization equipment ≤ 80% of branch rating, which is 12 A on 15 A. UL 1278 accepts a 15 A plug up to 1,500 W, so a listed 1,500 W heater technically exceeds 210.23(A)(1) on a multi-outlet 15 A circuit. The honest fix is "use a dedicated 20 A circuit or run it on 1,300 W or lower", which the site already half-says. Change the citation to 210.23(A)(1) and add the UL 1278 note. |
| A2 | "1,500 W = 12.5 A" | ✅ | 1500/120 = 12.5. |
| A3 | "5,000 W at 240 V is about 20.9 A" | ⚠ | 5000/240 = **20.83 A**. The CZ220 and FUH54 sheets both print 20.9. Keep 20.9 when quoting a manual, and say "≈20.8 A" when doing arithmetic. Harmless. |
| A4 | "5 kW → 30 A two-pole breaker, 10 AWG copper" | ✅ | NEC 424.4(B) treats fixed space heating as a continuous load at 125%: 20.83 × 1.25 = 26.0 A, which is over the standard 25 A size, so the next size up is 30 A (240.6). 10 AWG Cu is 30 A at 60 °C (310.16), and 240.4(D) caps 10 AWG at 30 A. The CZ220 sheet says "30 AMP or larger… 10 AWG copper only", and the FUH says "30 A max fuse… 10 AWG min". **Add the 424.4(B) citation**; the site never cites Article 424 by number. |
| A5 | "30 A × 240 × 0.8 = 5,760 W; 40 A → ~7,680 W → 7.5 kW class" | ✅ | 7.5 kW is 31.25 A, and × 1.25 = 39.1 A, so 40 A and 8 AWG Cu. This matches the DR-975 manual (40 A only, 8 AWG) and the FUH 7.5 kW (8 AWG). |
| A6 | "10 kW… on the order of 40 A at 240 V before diversity and continuous-load derating" | ⚠ | It is 41.7 A, and with the 125% factor it is **52.1 A, so a 60 A breaker and 6 AWG Cu**. State that plainly. The panel-capacity point stands. |
| A7 | "5,000 W at 120 V would be about 41.7 A" | ✅ | |
| A8 | "Resistance heat is essentially 100% efficient… voltage does not change $/kWh" | ✅ / ⚠ | Correct for resistance. **It is incomplete for the searcher's question.** "Most efficient garage heater" (5.4k/mo) is answered by a **heat pump / mini-split with COP 2–4**, which the site scopes out ("Mini-splits and wood exist; they stay outside this site"). Saying "same watts = same dollars" without that caveat misleads by omission. |
| A9 | W/ft² brackets 8–10 / 12–15 / 15–20+ and bay tables (1-car 2–4 kW insulated, 2-car 4–6 kW, 3-car 6–10 kW) | ⚠ | They are defensible as rules of thumb and consistent with the planner spec's physics (6.6 W/ft² sealed vs 16 W/ft² leaky for a Chicago 24×24 at 55 °F). **They have no climate or setpoint input**: Houston and Duluth get the same bracket, and that is the gap the planner fills. Keep them as a fallback only, and always label them "planning bracket". |
| A10 | "Garage receptacles on modern residential codes are GFCI-protected… 1,500 W heater is a common nuisance-trip source" | ✅ / ⚠ | GFCI in garages is required by 210.8(A)(2). "Nuisance trip" is soft wording: a healthy heater does not leak to ground, so trips usually point at moisture or a failing element. The site says roughly that; rephrase to "a trip means leakage, so investigate". |
| A11 | Corded 240 V (NEMA 6-30) "needs a correctly rated receptacle on a dedicated circuit" | ⚠ **omission** | Since the **2020 NEC, 210.8(A) covers 125–250 V receptacles** in dwelling garages, so a garage NEMA 6-20/6-30 receptacle for a corded heater needs **GFCI protection**, usually a 2-pole GFCI breaker (about $100–$150 [VERIFY price]). The 2023 NEC continues this. This is where local adoption applies. It changes the cost comparison on `/hardwired-vs-plugin…` and belongs on `/240v-garage-heater`. |
| A12 | CZ220 table: 5,000/4,000/3,000 W; 20.9/16.7/12.5 A; ~18 ft throw; 25–30 lb; 3 ft combustibles; direct-wire, no extension cords | ✅ | Verbatim match to the manual PDF. |
| A13 | CZ220 environments | ⚠ **omission** | The manual says the unit is **not for hazardous locations, and not for "areas where gasoline, paint, or flammable liquids are used or stored."** Most garages store gasoline. The site mentions this only obliquely, on the wall-vs-ceiling page ("if… you store gasoline open, this aisle is the wrong equipment"). Promote it to a prominent safety callout on every 240 V product card and in the planner result. It is a real safety differentiator and it builds trust. |
| A14 | FUH54: 17,065 BTU/h, 20.9 A, 30 A max fuse, jumpers 4,165/3,332/2,500 W, 10 AWG Cu min, no aluminum, 208 V gives less heat | ✅ | Matches the manual excerpts. Add the number: **≈3,755 W at 208 V** for a 5 kW element set. |
| A15 | FUH54 "mounting height 6–11 ft window"; "~18 ft throw" | [VERIFY] | The 6 ft minimum is confirmed. The 11 ft maximum and the throw were not found in this session's sources; re-check against the FUH manual before reuse. |
| A16 | DR-975: 7,500 W/240 V, 25,597 BTU/h, no cord, 40 A, 8 AWG, at least 6 ft off the floor | ✅ | Manual (manuals.plus). |
| A17 | DR-975 "no closer than 1 ft to adjacent surfaces, **including the back wall** whether or not you use the wall bracket" | ❌ **E2** | The current manual says: "Keep at least **4.5 inches** (0.12 m) from the back wall, regardless of whether the wall mount bracket is used." The 1 ft figure applies to the sides and other adjacent surfaces. The site's version is more conservative, so it is not dangerous, but it is factually wrong and could put off a buyer with a tight wall. Fix it. |
| A18 | DR-975 "other retailer copy says 6 AWG" | [VERIFY] | Not found. Drop it unless a source is cited. |
| A19 | HS-1500-TT: 72 in off the floor (US), 18 in sides, 18–24 in above, housing must be vertical | ✅ | The manual says 72 in US / 98 in Canada, 24 in top, 18 in sides. |
| A20 | "Ceiling-mount garage heaters **under $200**: Comfort Zone and Fahrenheat-class" | ❌ **E1** | The CZ220 is roughly $150–$200 (the planner spec uses $170). The **Fahrenheat FUH54 lists at $468.59–$500.38 at Walmart** and $832.71 at HomElectrical in September 2026, and Lowe's no longer sells it. The site says prices "wander from well under $200 to a bit over"; they do not. Retitle the page and drop the price class, or use price *tiers* per `monetization.md`. |
| A21 | Propane: 91,500 BTU/gal; 1 kW = 3,412 BTU/h; 5 kW ≈ 0.19 gal/h ≈ $0.65 at $3.50; about 0.8 gal of water per gallon burned; indoor unvented 4–18k BTU/h | ✅ | Stoichiometry: 0.83 gal of water. Mr. Heater Buddy is 4–9k and Big Buddy is 4–18k. |
| A22 | Propane CO / ODS / venting: "outdoor-rated or construction torpedo never in a closed attached garage"; "ODS is a last resort"; CO alarm in the garage and on the house side; "local code can forbid unvented heaters" | ✅ | Sound. Add specifics [VERIFY each]: California prohibits unvented gas room heaters in dwellings; ANSI Z21.11.2 caps unvented room heaters at 40,000 BTU/h; **NFPA 58 restricts LP-gas cylinder storage inside residential buildings, including attached garages, to small (1 lb-class) cylinders**. That last point sharpens the site's "20 lb cylinder inside a closed bay" warning into a code citation. |
| A23 | "A 30 k BTU torpedo is roughly twice [5 kW]; 60 k is more than three times" | ✅ | 1.76× and 3.5×. |
| A24 | Cost-page example rates $0.12/$0.20/$0.30 per kWh | ✅ | They are clearly labeled as examples. The rebuild should use EIA state averages instead (planner spec §prices). |
| A25 | "An insulated door and weatherstrip often beat a jump from 5 kW to 7.5 kW" | ✅ (directionally) | The planner spec's worked example supports it: $675 of measures cut the load from 9.3 kW to 3.8 kW. Now it can be *quantified* rather than asserted. |
| E3 | `/hardwired-vs-plugin…`: "No live affiliate buy buttons. Retailer links elsewhere on the site are still placeholders until programs are live." | ❌ **stale** | Amazon links have been live since commit 34b43ef. Also, three pages say links are live only "on the ceiling-mount and 15 A portable guides", but they are on 5 pages. |
| E4 | JSON-LD `Article.datePublished = dateModified = guide.updated` | ❌ (structured-data accuracy) | This misstates the publish date. The author is an `Organization` named "BayHeat Guide", while the publisher is "Laqaer Products", so the entities are inconsistent. Use a real `Person` author and reviewer, as `growth-playbook.md` G1 already recommends. |
| E5 | Affiliate disclosure text | ⚠ compliance | Amazon's Operating Agreement requires the statement "**As an Amazon Associate [I/we] earn from qualifying purchases.**" The site's paraphrase ("Some retailer links are Amazon Associates… we may earn a commission") does not contain it. Add the exact sentence in the footer and near the first link. |

**Net:** there are 0 dangerous errors, 3 factual errors (E1 price class, E2 DR-975 back clearance, E3/E4 stale copy and schema), 3 material omissions (GFCI on 240 V garage receptacles, CZ220 no-gasoline-storage warning, heat pumps for "efficient"), and 2 citation fixes (210.23(A)(1) for portables, 424.4(B) for fixed heaters). The editorial caution is real. It is also overused, to the point of hurting the business.

---

## 4. UX, brand and conversion: why it makes no money

### 4.1 Demand (the dominant cause)
- The pages target about 180 searches a month in total (§1.3). Even ranking #1 everywhere could not reach the $300/month goal.
- The site's scope ("electric resistance only") excludes about 90% of the niche's demand and nearly all of its seasonal spikes: diesel 30 in June and 27.1k in January; shop heater 720 and 33.1k.
- There is no page that can rank for the head terms: "garage heater" 27.1k, "best garage heater" 5.4k.

### 4.2 No product and no loop
- **No tool.** The calculator cluster is about 2.1k/mo on average and about 5k+ in January. Per `competitors.md`, no good tool ranks for it. The site's answer is a static W/ft² table.
- **No email capture.** There is no form anywhere, and the privacy policy says "If we add… newsletters, we will update." There are no freeze alerts, no "email me my plan", and no seasonal re-engagement, so every visitor is lost after one session.
- **No analytics.** The privacy policy says "treat analytics as not present". The owner cannot tell which page or link earns anything. The rebuild needs env-gated analytics plus click events on affiliate links, using `sendBeacon` and no redirect, per `monetization.md`.
- **No shareable output** (no permalink, OG card or PDF), so there is no reason for anyone to link.

### 4.3 Weak commerce surfaces
- There are 11 placements in all, and each is a **text link in the last column of a spec table**, labeled like "Amazon: Fahrenheat FUH5-4 5000W (FUH54-class)". The link sits in the "Retailer links" section, which is the *last* H2 on 4 of the 5 pages.
- There are no product cards, no "best for" labels, no price tiers, no pros and cons, no illustrations, no "fits your circuit / fits your garage" match, and no comparison at the moment of decision.
- Four pages have explicit **anti-CTAs**: "No affiliate buy buttons on this page" on the propane, cost, hardwired and insulation pages, plus "It is not a propane catalog… send you to a buy button".
- The insulation page is the natural home for $20–$150 impulse-friendly products: bottom seal, weatherstrip, door kit. It says "Door and kit buy links are not live on this page."
- The price ceiling is self-imposed: an "under $200" page, 1,500 W portables and 5 kW cabinets. There is nothing for gas unit heaters ($400–$900), diesel ($120–$250), mini-splits ($1.5k–$3k, with higher-commission partners) or installer leads (CPC $8–$18).

### 4.4 Page UX
- **Above the fold on a guide** (desktop 1440×900, `shots-before/best-electric-garage-heaters-by-size-desktop.png`): breadcrumb, then eyebrow, H1, the meta description repeated as the dek, and the date. After that come **two disclaimer boxes, about 250 px** (safety, then affiliate), and then the TOC. The first sentence of actual content starts **at about y ≈ 1,100 px**. There is no answer-first box, no "quick answer" and no key numbers.
- **Header:** 12 nav links (every guide plus About) wrap to two lines at 1440 px, and the wordmark wraps ("BayHeat / Guide"). There is no primary CTA. On mobile there is a single "Guides" disclosure with 12 flat items.
- **Home:** the H1 is framed around circuits, which is jargon to a first-time buyer. It is followed by a 70-word run-on list of topics. The "Quick reality check" aside has about 300 px of empty space on desktop. The "Decision tree" is 8 static cards, and the tree does not branch. The mobile page is 8,304 px tall.
- **Related guides:** every guide lists **all 10 other guides** as cards, with no curation or next-step logic.
- **Tone:** it is defensive and inward-looking, with 21 × "we will not", 29 × "invent" and 5 × "What this page will not claim". Trust comes from showing work (a named reviewer, method, sources, test data), not from repeating what you won't do.
- **Titles:** "Best electric garage heaters by size (1-car, 2-car, 3-car) · BayHeat Guide" is 73 characters and gets truncated, and the page has no "best" picks, so it does not match the intent the title promises. "Portable garage heaters on a 15 A circuit" puts "15 A" in the title where searchers type "120v" or "portable electric".

### 4.5 Brand and design
- **Palette:** `--paper #f3eee4`, `--paper-2 #e8e0d2`, `--card #fbf7ef`, `--ink #1c1916`, `--ink-2 #3f3832`, `--muted #6d645b`, `--line #d4c8b6`, `--rust #b4532a`, `--moss #3d5a4c` (defined and never used). **Type:** Source Serif 4, Source Sans 3 and IBM Plex Mono. The result is generic literary-blog cream, which `design-direction.md` rightly calls "too close to soft beige luxury".
- **Contrast failures (WCAG AA 4.5:1 for normal text):**
  - rust `#b4532a` on paper `#f3eee4` is **4.31:1**. It is used for 12 px uppercase eyebrows, all inline links and the 404 label.
  - muted `#6d645b` on paper-2 `#e8e0d2` is **4.42:1**. It is used for 12 px footer disclosure text.
  - Passes: muted on paper 5.01, rust on card 4.67, ink-2 on paper 9.96.
- **No visual system for data:** tables are the only "visual". There are no diagrams, even for topics that beg for one (joist mounting, throw, the circuit path, CO flow). There are no images, no OG image (`twitter.card: "summary"` with no image), and no favicon beyond `icon.svg`.
- **Name:** "BayHeat Guide" means little to a searcher. "Bay" reads as the SF Bay Area before it reads as a garage bay. The name collides with **Bay Heating & Cooling (bayheatcool.com, Annapolis MD)**, which occupies the brand SERP. "Heat" limits the summer cooling half. The domain stays (dossier constraint), so the brand should work *with* it: "BayHeat" as the wordmark with a descriptor such as "garage climate". "Guide" signals a thin affiliate site.
- **Publisher entity:** "Laqaer Products" has no web presence tied to the site. No person is named anywhere. That is an E-E-A-T gap, and it is aggravated by the 2026 core and spam updates that target thin AI-made affiliate sites (see `growth-playbook.md` §2.1).

### 4.6 Technical SEO (minor; the build is clean)
- ✅ The build is static. `canonical` is set per page. `sitemap.ts` and `robots.ts` exist. The JSON-LD includes `WebSite`, `Article` and `BreadcrumbList`. `www` returns a 308 to the apex. There is no horizontal overflow at 390 px.
- ⚠ `WebSite` JSON-LD is injected on every page; it only needs to be on the home page. It is harmless.
- ⚠ The `robots.host` directive is Yandex-only, and the sitemap's `priority`/`changeFrequency` values are ignored by Google.
- ⚠ OG `url` values are relative strings. `metadataBase` resolves them, so this is fine.
- ⚠ Indexing: a `site:bayheatguide.com` web search on 2026-09-25 returned **zero site pages**, only the GitHub repo and the Annapolis HVAC company. GSC was not available to confirm. Treat the site as essentially unindexed.
- ⚠ The repo `laqaer/bay-heat` is **public on GitHub** and ranks for the brand query. Its README calls the site a "Mogul factory Site #1 … small, useful buying-guide sites". That signals a site factory to anyone who looks, including reviewers and journalists. Consider making the repo private (owner action).
- ⚠ Hosting: per `monetization.md` §0.8, Vercel Hobby forbids affiliate-primary sites, so Pro is needed (owner action).

---

## 5. Redirect map

### 5.1 Principles
1. **No old URL ever returns a 404.** Every retired guide URL gets a single-hop permanent redirect to its closest new page.
2. **Mechanism:** use `redirects()` in `next.config.ts` with `permanent: true`, which emits a **308**. Google treats 308 exactly like 301. This is what `node_modules/next/dist/docs/01-app/02-guides/redirecting.md` documents for Next 16. Do not use `proxy.ts` for a static map.
3. **Keep the redirects indefinitely**, for at least 12 months and preferably forever, because they are cheap.
4. **Gate: pull GSC Performance (last 28 days, by page) before shipping.** If an old URL has **≥ 10 impressions or any clicks**, weigh keeping it. If you keep it, rebuild the page at the old URL and point the new slug's intent at it, rather than splitting. Everything I can see (a site about 3 weeks old, zero pages in a `site:` search) says the equity is close to zero. That makes **this week the cheapest moment the site will ever have to fix its URLs**.
5. Take old URLs out of `sitemap.ts`. List only the new ones. Resubmit in GSC and ping IndexNow.
6. Update every internal link to point at the new URL directly, so internal links never chain through a redirect.
7. Anchors: a redirect cannot carry a `#fragment` from a server-side 308 target in a useful way for SEO. Point to the page, and place the merged content high on it.
8. The verify skill must assert each row: `GET old` returns `308` with `Location: new`, and `GET new` returns `200` (§6).

### 5.2 The map

| Old URL | Action | New URL | Why (new target's demand) |
|---|---|---|---|
| `/` | KEEP | `/` | Rebuilt as the brand home plus planner entry. Retarget "garage heater" 27.1k / "garage heater electric" 14.8k via the hub below. |
| `/best-electric-garage-heaters-by-size` | **308** | `/garage-heater-size` | Planner companion matrix. how many btu 210 (1.6k), what size heater 2-car 70 (210), 3-car 170 (480), garage heater size 70. |
| `/120v-vs-240v-garage-heater` | **308** | `/240v-garage-heater` | electric garage heater 240v 1.3k, 240v garage heater 590 (1.6k), 240v electric heater 480, 10000 watt 320. The 120 V content moves to the portable page. |
| `/hardwired-vs-plugin-garage-heater` | **308** | `/240v-garage-heater` | Its core question, "can I just plug it in, or do I need a circuit?", is the 240 V page's second section. The plug-in pick rules move to the portable page. |
| `/portable-garage-heaters-15a-circuit` | **308** | `/portable-garage-heater` | portable electric garage heater 4.4k, garage portable heater 3.6k, space heater for garage 3.6k, electric garage heater 120v 3.6k, 120v 880, 110v 590, plug in 480. **Slug decision:** `growth-playbook.md` proposes `/plug-in-garage-heater`, which has 650/mo of slug-word match. I recommend `/portable-garage-heater`, which has about 8k/mo of slug-word match. The page is the same either way. Pick one and update the other doc. |
| `/forced-air-vs-infrared-garage-heater` | **308** | `/infrared-garage-heater` | infrared garage heater 2.4k (9.9k Jan), radiant heater for garage 1.6k. Keep a strong "forced-air vs infrared" H2, because forced air heater for garage is 1.9k. |
| `/best-ceiling-mount-garage-heaters-under-200` | **308** | `/ceiling-mount-garage-heater` | ceiling mounted heater 720, comfort zone garage heater 720, ceiling mount garage heater 480 (1.6k), ceiling-mounted 120v 320, electric 260. It drops the false "$200" premise. |
| `/wall-mount-vs-ceiling-garage-heater` | **308** | `/ceiling-mount-garage-heater` | The comparison has zero demand. It becomes the "ceiling or wall?" section, linking out to the wall page. |
| `/best-wall-mount-garage-heaters` | **KEEP** | same | The slug already matches: wall mount garage heater 210 (720), wall mounted electric garage heater 210, 220 V wall-mounted 590. It is the DR-975 / FUH54 / HS-1500-TT money page. Rebuild it at the same URL. |
| `/insulate-garage-before-heater-upgrade` | **308** | `/how-to-insulate-a-garage` | how to insulate 2.4k, garage insulation 9.9k, insulation kit 2.4k. The seal-first table becomes the spine. It links to the new `/garage-door-bottom-seal` (27.1k), `/garage-door-weather-stripping` (22.2k) and `/garage-door-insulation-kit` (22.2k). |
| `/electric-garage-heater-operating-cost` | **308** | `/cost-to-heat-a-garage` | The data-study hub and PR asset. The formula and worked session become its methodology section. Cross-link from `/most-efficient-garage-heater` (5.4k). |
| `/electric-vs-propane-garage-heater` | **KEEP** | same | It is the only guide with a real exact match: 90 (390), plus gas vs electric 170. Rebuild it as the electric vs propane (vs gas, vs diesel) fuel comparison. Move the CO and venting block into the new `/propane-heater-in-garage-safety` and link to it. Alternatively, 308 it to `/garage-heaters` if the hub absorbs the comparison. My call is to keep it, because it has an exact-match phrase and the hub will be long enough already. |
| `/about` | KEEP | same | Add a named editor and reviewer. Delete the astrology line. |
| `/privacy` | KEEP | same | Update for email, analytics and affiliate-network cookies before those ship. |

The result is **5 kept** (`/`, `/best-wall-mount-garage-heaters`, `/electric-vs-propane-garage-heater`, `/about`, `/privacy`) and **9 redirected** into 7 new destinations. None goes to a 404.

`next.config.ts` shape, for the builders (read the Next 16 `redirects.md` first):

```ts
async redirects() {
  return [
    { source: "/best-electric-garage-heaters-by-size", destination: "/garage-heater-size", permanent: true },
    { source: "/120v-vs-240v-garage-heater", destination: "/240v-garage-heater", permanent: true },
    { source: "/hardwired-vs-plugin-garage-heater", destination: "/240v-garage-heater", permanent: true },
    { source: "/portable-garage-heaters-15a-circuit", destination: "/portable-garage-heater", permanent: true },
    { source: "/forced-air-vs-infrared-garage-heater", destination: "/infrared-garage-heater", permanent: true },
    { source: "/best-ceiling-mount-garage-heaters-under-200", destination: "/ceiling-mount-garage-heater", permanent: true },
    { source: "/wall-mount-vs-ceiling-garage-heater", destination: "/ceiling-mount-garage-heater", permanent: true },
    { source: "/insulate-garage-before-heater-upgrade", destination: "/how-to-insulate-a-garage", permanent: true },
    { source: "/electric-garage-heater-operating-cost", destination: "/cost-to-heat-a-garage", permanent: true },
  ];
}
```

Keep this list in one exported constant, for example `lib/redirects.ts`, so that `next.config.ts`, the sitemap test and the verify skill all read the same source.

**Ordering constraint:** a destination page must exist and return 200 **in the same deploy** as its redirect. Never ship a redirect to a page that has not been built yet. If a destination slips, leave the old page live and unredirected until it lands.

---

## 6. The existing verify skill: what the agent team can reuse

Location: `.cursor/skills/verify-bay-heat/`. It contains `SKILL.md` (≈190 lines), a `features/` map (README plus 5 feature files), `helpers/bay-heat` (832 lines of Node with no dependencies) and `evidence/home/` (480 KB of committed HTML, PNG, TXT and JSON).

### 6.1 Reuse as-is (good engineering)
- **Instance isolation:** it binds `127.0.0.1:$BAYHEAT_PORT` (default 4317). Run state lives in `/tmp/bay-heat-verify-$PORT/instance.json`. It refuses to drive any server it did not launch: the listener pid must be in the launched pid's process tree, found by parsing `/proc/net/tcp` socket inodes. This is exactly what parallel agents need so they do not trample each other or a human's `npm run dev`. Keep it.
- **Safe cleanup:** it kills only its own pid and listener, and never runs `pkill next`. Evidence survives cleanup.
- **The `follow --from <path> --name <link text>` pattern** proves the *reader path* (a named link on a real page), not a direct GET. Keep this rule in the agent team's QA standard.
- **HTML inspection:** it extracts title, h1/h2/h3, canonical, JSON-LD `@type`s, links and aria-labelled `nav`s. The `request()` function uses `http.get`, which **does not follow redirects**, so asserting 308 plus `Location` needs only a few lines added.
- **`seo` command:** checks robots, sitemap and ads.txt.
- **Evidence convention:** `evidence/<feature-id>/` with `PROOF.txt` (feature, entry point, commands, observations) plus `*.meta.json` (url, capturedAt).
- **Feature-map contract:** every feature file has an H1, one paragraph, and exactly 4 H2s (Sub-features / How to get to it / Driving it / Gotchas). This is a good template for agent-maintained QA docs.
- **Anti-jobs:** no production traffic, no following affiliate links, no touching sibling brands, no paid crawl tools. Adopt these as agent-team rules.

### 6.2 Stale or broken now
- The `SKILL.md` routes table lists **8 of 11 guides**. It is missing `/hardwired-vs-plugin-…`, `/electric-garage-heater-operating-cost` and `/electric-vs-propane-…`. The `seo-surfaces.md` sitemap assertions have the same gap.
- **`doctor` hardcodes the home H1** "Choose the electric garage heater that matches the circuit you have." It will fail on the first redesign deploy. Make identity a manifest value (for example `BAYHEAT_EXPECT_TITLE` or a `site-manifest.json` produced by the build) or check `<title>` contains the brand only.
- `SKILL.md` says "There is no account, search box, form, or checkout". The rebuild adds a planner, email forms and possibly checkout, so the premise changes.
- It lives in `.cursor/skills/`, which is Cursor-specific. Claude Code agents read `.claude/skills/<name>/SKILL.md`. The frontmatter (`name`, `description`) is already compatible, so a copy or move is enough.
- Committed binary evidence (PNG and HTML, 480 KB) will bloat the repo as agents re-run it. Commit `PROOF.txt` and `*.meta.json` only, and gitignore `evidence/**/*.png` and `*.html`, or upload them as CI artifacts.

### 6.3 Gaps to fill for the agent team
| Need | Why | How |
|---|---|---|
| **Interaction** (type into the planner, click results, submit email) | The flagship is a client-side tool; HTTP GET cannot prove it | Add a Playwright driver. It is already installed globally at `/opt/node22/lib/node_modules/playwright`, and `scratchpad/shoot.mjs` shows the `createRequire` pattern. |
| **Mobile viewport** | The helper only captures 1280×900. Most traffic is mobile. | `shoot.mjs` already does 1440×900 and 390×844, plus an overflow check and console errors. Merge it into the helper as `bay-heat shoot`. |
| **Redirect assertions** | §5 | `bay-heat redirects` reads `lib/redirects.ts` and asserts 308, `Location` and a destination status of 200. |
| **Affiliate lint** | Compliance and revenue | Every `amazon.com` href must have `tag=laqaer-20`, `rel` must include `sponsored`, the ASIN must be in an allowlist (the 5 verified, plus any added with evidence), otherwise it must be `/s?k=…&tag=laqaer-20`. No `/go/` redirects. The exact "As an Amazon Associate…" sentence must be present. |
| **Link check** | Merges create dead internal links | Crawl the sitemap, then every internal `href` must return 200 (not 308 and not 404). |
| **Facts check** | Numbers drift when retyped | Grep rendered pages for `20.9 A`, `10 AWG` and similar, and diff them against the facts registry. Alternatively, fail the build if a guide hardcodes a registry number. |
| **Structured data** | E4 | Validate that JSON-LD parses, that `Article` has a `Person` author, and that `datePublished ≤ dateModified`. |
| **Contrast / a11y** | The 4.31:1 failure | Run axe-core through Playwright on each template. |
| **CWV budget** | The design direction asks for LCP < 2.5 s | Use Lighthouse CI or Playwright `PerformanceObserver` on home, planner and one guide. |

---

## 7. Bottom line for the build team

1. Build the **facts registry** first. Port the verified numbers from §2.1 with source URLs. Every page, card and the planner import it.
2. Fix E1–E5 and the three omissions *while porting*, not after.
3. Ship each redirect only with its destination page (§5.2 ordering constraint). Pull GSC first.
4. Replace the "we will not" voice with a "here is our math" voice: method links, a named reviewer, planner-computed numbers.
5. Every rebuilt page needs an answer-first block above the fold, one primary CTA (planner or product), product cards at the decision point, a contextual safety callout, and email capture.
6. Port the verify skill to `.claude/skills/` and extend it per §6.3 before the gauntlet phase, so screenshot judging and regression checks run on real, owned instances.

### Sources checked this session
- Comfort Zone CZ220 manual (Home Depot-hosted PDF): https://images.thdstatic.com/catalog/pdfImages/00/009b17c0-4361-484d-a5a4-ad2a911e4a23.pdf
- Dr. Infrared DR-975 manual: https://manuals.plus/dr-heater/dr-975-ceiling-mounted-garage-heater-manual
- Heat Storm HS-1500-TT manual: https://www.manualslib.com/manual/1904654/Heat-Storm-Tradesman-Hs-1500-Tt.html
- Fahrenheat FUH54 manual excerpts: https://mans.io/item/fahrenheat/fuh54 · https://manuals.plus/fahrenheat/fuh-series-unit-heater-manual
- FUH54 retail prices: https://www.walmart.com/ip/Fahrenheat-FUH54-UNIT-HEATERS-Beige/38753345 · https://www.walmart.com/ip/Fahrenheat-FUH54-240-volt-Garage-Heater-2500-5000-watt/356533232 · https://www.homelectrical.com/5000w-electric-garage-heater-17065-btuh-208v240v.qmk-39987.1.html
- NEC 210.23(A)(1) and the 1,500 W heater: https://forums.mikeholt.com/threads/electric-space-heater-requirements-210-23-a-1.103006/page-2 · https://up.codes/s/cord-and-plug-connected-equipment-not-fastened-in-place
- NEC 424.4(B), 125% for fixed space heating: https://www.ecmweb.com/national-electrical-code/article/20900735/article-424-fixed-electric-space-heating-equipment · https://fasttraxsystem.com/fixed-electric-space-heating-calculations/
- 2020 NEC 210.8(A) GFCI for 125–250 V garage receptacles: https://iaeimagazine.org/issue/january2020/nec-requirements-for-gfci-protection-section-210-8/ · https://www.stpaul.gov/sites/default/files/2020-12/DSI.Bldg_Electrical_Checklist%20Garage.pdf
- Brand collision: https://www.bayheatcool.com/
- Next 16 redirects: `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`
