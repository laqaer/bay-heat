# BAYHEAT: THE COMPANY BLUEPRINT (v1.0, 2026-09-25)

**This document is the single source of truth.** It serves two readers:

1. the build team: about 11 AI engineers who ship v1 in this Next.js 16.3.4 repo in one session;
2. the agent team that runs the company from week 1.

Where this document and a concept pitch, a research file or a judge disagree, **this document wins**. The research files in `company/research/` are reference material: the formulas, sources and evidence behind the decisions made here. When this blueprint says "per spec §N", it means `company/research/planner-engineering.md` §N.

**Origin.** Five concepts were pitched and scored by five judges:

| Concept | Score |
|---|---:|
| trust-lab | 36.9 |
| tool-first | 36.3 |
| revenue-max | 31.0 |
| brand-first | 26.6 |
| unanchored | 25.7 |

**We build on trust-lab, the winner.** It supplies the trust layer, the safety tool, the data asset and the art direction. On top of it we graft:
- from **tool-first**: the planner interaction loop, the architecture and the lane contract;
- from **revenue-max**: the launch page set, the commerce engineering and the "Shrinking Heater" moment;
- from **unanchored**: the freeze physics (as static content) and its honesty voice;
- from **brand-first**: the use-case presets and the Door Rise reveal.

Every graft and every conflict resolution is listed in §0.3.

**Tags used throughout:**

| Tag | Meaning |
|---|---|
| `[C]` | Computed by our engine. The build must recompute it; never paste it. |
| `[REF]` | Output of `scratchpad/ref/planner.py`. The TypeScript port must reproduce it. |
| `[MODEL]` | A business assumption. Replace it with measured data by 2027-01-15. |
| `[VERIFY]` | Must be checked against a primary source before it renders. The facts registry blocks rendering until it is checked. |

---

## 0. Decisions on one screen

### 0.1 The twelve decisions

1. **Name and domain.**
   - Brand: **BayHeat**.
   - Descriptor: **Garage Climate Lab**.
   - Domain: **bayheatguide.com** stays canonical through at least **2027-04-30**.
   - No rename, no domain purchase and no migration during the heating window.
   - Every absolute URL comes from `NEXT_PUBLIC_SITE_URL`.
2. **Tagline: "Every number shows its work."**
   - We do not use "Garage climate, measured." Our own rule bans the word "measured" until a published log exists, and none exists at launch.
3. **Flagship: the BayHeat Planner** at `/garage-heater-calculator`.
   - ZIP plus 5 tap steps, about 60 s, no sign-up.
   - It writes a **Garage Heat Report** with:
     - load band
     - A–F **BayGrade**
     - warm-up minutes
     - circuit
     - fix-first toggles
     - up to 3 spec plates
     - cost per hour for every fuel
     - safety verdicts
   - State lives in the URL query (`?g=<code>`). The permalink is `/r/<code>`.
4. **Four more signature products in v1:**
   - **Can I Run It?** (a safety verdict machine)
   - **The Garage Heat Index** (50-state cost data, CSV)
   - **Lab Report BH-001, "The 4× Problem"**
   - **Heat Report Pro** ($14 launch price, $19 from Dec 16)
5. **Art direction: "Inspection Grade."**
   - The light report paper (`#F6F4EF`) is the default surface.
   - Dark thermal-camera exhibits (`#08090C`) appear as numbered figures.
   - Two fonts only: Archivo (with its width axis) and Martian Mono.
   - One action color: Ember `#FF8A1F`. Red is for safety only.
6. **Evidence Marks (M/C/S/R/E) appear on decision-driving numbers only**, never on every numeral.
   - The Lab Label is a one-line stamp that expands on tap.
   - The evidence lint is a **warning** in v1. Only known drift literals fail the build.
7. **v1 launch set (live by Fri 2026-10-02):** 27 indexable routes, including:
   - the three sealing pages that peak now: bottom seal (33.1k in Oct), weather stripping (40.5k in Nov) and door kit (22.2k);
   - the `/garage-heaters` hub (27.1k) and the `/electric-garage-heater` hub (14.8k ×2);
   - diesel and propane hubs;
   - the 9 merged legacy URLs, each with a 308 redirect.
8. **Money.** The plan counts only affiliate revenue, email revenue and Heat Report Pro (at most 0.2% of sessions). Every other line is modeled at $0 until a signed deal or an approved account exists.
   - Amazon `laqaer-20` is the default partner, with a separate tracking ID for each surface.
   - The partner router falls back to Amazon.
   - No display ads in year 1.
   - Spending is gated in stages (§6.6).
9. **Safety sits at the point of sale.** The product-specific safety line appears on the spec plate, next to its buy button, in alarm red.
   - A CO alarm is **pre-checked but uncheckable** for every combustion recommendation.
   - An unvented heater is never the default pick for an attached garage.
10. **Trust is earned in public.** Two pre-registered, measured tests land before the peaks, using a phase-1 kit of about $1,050:
    - **BH-002**, door kit plus weatherstrip co-heating, by **Nov 6**;
    - **BH-003**, diesel CO and cost, by **Dec 3**.

    Phase-2 tests (5 kW warm-up and Big Buddy) are released only if December gross is at least $500.
11. **Architecture.**
    - Fully static: no `cacheComponents`.
    - Deliberate `ƒ` routes only: `/r/[code]`, its OG image, and the `POST` handlers.
    - Pure engine in `lib/planner` with T1–T13 vectors within ±1%.
    - A foundation PR lands first with frozen types.
    - 11 parallel lanes with strict file ownership, each capped at about 5 content routes.
12. **Run by agents, gated by humans.** 14 Claude Code subagents run the company through the weekly **Lab Gate** loop:

    draft → adversarial fact-check → standards → design QA → human sample.

    Humans hold every account, every post, every pitch and every signature. The owner needs about 3–4 hours a week.

### 0.2 The single worked example (use it everywhere; recompute at build)

This is the spec's §6 garage, example A:
- 24×24×9 ft, attached along a 24 ft side;
- R-13 walls, uninsulated drywall ceiling under a vented 6/12 attic;
- one 16×7 uninsulated steel door, a 12 ft² window, a 20 ft² hollow-core service door;
- average drafts;
- Chicago O'Hare, 99% design temperature 3.3 °F, target 55 °F.

| State (hero chip) | Q_size BTU/h [REF] | kW | BayGrade (UA_ext/ft²) | Heater class | Circuit |
|---|--:|--:|---|---|---|
| **As-is** | **31,742** | 9.3 | **D** (0.995) | 10 kW | 240 V / 60 A / 6 AWG THHN |
| **+ Seals & door kit** ($245) | **22,633** | 6.6 | **C** (0.717) | 7.5 kW (DR-975 class) | 240 V / 40 A / 8 AWG |
| **+ R-30 ceiling** ($675 total) | **13,025** | 3.8 | **B** (0.423) | 5 kW (CZ220/FUH54 class) | 240 V / 30 A / 10 AWG |
| **Bare & leaky** (open studs, leaky, single-pane metal window) | **48,380** | 14.2 | **F** (1.503) | 2 × 7.5 kW, or a vented gas unit heater | – |

- Headline: **"$675 of fixes. Half the heater."** (We say "fixes", not "insulation", because the weatherstrip and door kit are air sealing.)
- Both framings are always shown:
  - continuous heating: "pays back in about 0.4 yr on electric";
  - session users: "saves about $68/yr to run, and $1,000–1,500 on the heater and wiring".
- Warm-up: after fixes, 5 kW takes **38.1 → 55 °F in 108 ± 3 min** (T9). As-is, 7.5 kW takes **116 ± 3 min** from 33.4 °F (T8).

### 0.3 Grafts and conflict resolutions (final)

| Conflict | Ruling |
|---|---|
| **Hero:** trust-lab's argument hero vs. the customer judge's "input first" | Both. The H1 is the argument ("One garage. Seven answers. 10,200 to 40,300 BTU/h."). The **ZIP input and `Size my garage` button sit directly under it**, inside the first screen at 390×844. Then the camera exhibit. Then the Disagreement Strip. |
| **Buy rail placement:** revenue-max (first plate within 700 px) vs. growth (after the answer block) | Split by page intent (§3.3). On **verdict-first** buy-intent pages: H1, then a 40–70 word answer block, then the disclosure, then the top edge of the first spec plate, all within 700 px at 390×844. **Report-first** pages (safety, data, lab, how-to) have no rail in the first 700 px. |
| **Safety copy vs. buy buttons** | The customer judge wins. The product-specific safety line sits **on** the plate, next to the button, in `--alarm`. Revenue-max's "safety never beside a buy button" rule is dead. |
| **Locked-on CO alarm** | Pre-checked, uncheckable, with the reason shown. Never locked. |
| **Free Electrician Brief vs. a paid-only Brief** | The customer judge wins. The free Brief is complete: breaker, wire, GFCI, disconnect, clearances, the 6 questions to ask, QR. Heat Report Pro sells the things the Brief doesn't contain (§2.7). |
| **Evidence lint** | A warning in v1. Hard-fail only on drift literals outside `lib/facts`/`lib/planner` (§9.6). |
| **Lab Label** | One 28 px line, expandable. It never prints "M 0" or "review pending" in a header. Review status appears only in the expanded panel. |
| **Kits** | No `/kits/*` pages and no indexable landers. `amazonCartUrl()` ships tested but **dark**. An "Add N items to Amazon cart" button appears on the Fix-First card only when 2 or more items in it have verified ASINs. |
| **Embeds** | `/embed/planner` ships in v1 (the same component, no chrome). The compact 320 px widget, `/embed/heat-index` and the `/embed` landing page ship in v1.1 (Oct 29). |
| **State pages** | v1.1, batches of 10 from Nov 10. `noindex` until they pass the growth-playbook §2.5 gate. |
| **Lab costs** | Stage-gated (§6.6). The phase-1 kit (about $1,050) is approved for BH-002 and BH-003. Phase 2 is released only if December gross ≥ $500. |
| **Grade colours** | The letter is always ink (on paper) or bone (on camera). The grade scale runs from **F at the Frost end** ("heat escapes") to **A at Glow `#FFB547`** ("holds heat"), so it never contradicts the thermal frame. |
| **Line style** | Measured is **solid** ink. Modeled or forecast is **dotted**. This applies everywhere. |
| **Logo** | Tool-first's corner brackets, with revenue-max's **off-centre hot dot**. The Settle curve is rejected. |
| **Freeze product** | Unanchored's physics ships as **static computed content**: `/keep-garage-above-freezing` and `/how-cold-does-an-unheated-garage-get` (v1.1). There is no live garage-temperature forecast until reference calibration exists. Alerts are opt-in, at most 1 per 7 days, with "Nothing to do tonight" as the default. |
| **Rename (brand-first, unanchored)** | Rejected. Garagiste means wine, and "Overnight Low" belongs to weather and trading. |
| **Display ads, Test Fund, sponsors, leads, Pro embed** | Not built in v1, except a lead slot that is env-gated with the free Brief as fallback. Modeled at $0. |

---

## 1. Company

### 1.1 Name, domain, publisher

- **Name: BayHeat.** In running text it is "BayHeat". "Bay" means a garage bay.
- **The Lab** is our testing and editorial desk: "BayHeat Lab Reports", "the Lab notebook". We never write "BayHeat Guide" anywhere in the UI again.
- **Lockup:** the Spot Mark, then `BAYHEAT` (Archivo wdth 125, wght 800), then the descriptor `GARAGE CLIMATE LAB` (Martian Mono 500, 10–11 px, +0.12em). See §4.9.
- **Domain: `bayheatguide.com`, canonical.** It is owned, live, indexed for about 2 weeks, verified in GSC and on file with Amazon Associates.
  - The word "guide" in the URL costs nothing. A migration mid-season would reset crawl trust in the only indexing window we have.
  - **Review date: 2027-04-30.** Migrate only if both are true: branded search for "bayheat" is at least 300/mo in GSC, and a Sep–Apr trough is available. A move is then a config change plus 308s.
- **Publisher (legal entity): Laqaer Products** (`hello@bayheatguide.com`).
  - It appears in the footer, on `/about` and in the `Organization.parentOrganization` / `publisher` schema.
  - **Never mention the sibling brands** (Charting Stars, Seraph).
- **Name collision.** "Bay Heating & Cooling" is an HVAC contractor in Annapolis (bayheatcool.com). We never target the query "bay heat". Our thermal identity and the "Garage Climate Lab" descriptor keep the two apart.

### 1.2 Tagline, positioning, mission

**Tagline:** *Every number shows its work.*

**Positioning (one sentence):**

> BayHeat is the independent garage climate lab. Our open model sizes the heater for *your* garage, grades every number by where it came from, and tells you plainly when a heater will trip your breaker or fill your garage with carbon monoxide, so you buy the right heat once.

**Mission:** Every garage owner should buy the right heat once: sized to the building, safe for the people in it, and honest about the math.

**Four brand verbs.** They are the nav spine and the section rails:
- **Size it**
- **Power it**
- **Price it**
- **Fix it**

### 1.3 Audience and jobs to be done (priority order for the first 90 days)

| # | Segment | Job | Entry demand (US/mo, peak) | What we give them |
|---|---|---|---|---|
| 1 | **Winter Workshopper** (woodshop, project car) | "Get my shop to 55 °F within an hour on Saturday without tripping a breaker or gassing myself." | shop heater 6,600 (33,100 Jan) · garage heater electric 14,800 · electric shop heater 4,400 | Warm-up minutes, circuit card, **Shop notes** (glue and finish minimums once verified; dust and solvent ignition) |
| 2 | **Fix-First Homeowner** | "Which $40–150 fix stops the draft, and is the door kit worth it?" | bottom seal 27,100 (33,100 Oct) · weather stripping 22,200 (40,500 Nov) · door insulation kit 22,200 · how to insulate 2,400 | Door Leak Meter, Kit Payback Meter, ranked fixes with ΔBTU/h and payback, BH-002 measured |
| 3 | **Portable-Propane Owner** (Buddy class) | "Can I run this in my garage, how long does a tank last, and is it safe?" | propane heater for garage 9,900 pool · indoor safe propane 9,900 · kerosene heater indoors 22,200 · torpedo 14,800 | Can I Run It? verdict, tank runtime, moisture, CO alarm rules, the NFPA 58 storage limit |
| 4 | **Diesel-Curious** | "Is a $150 diesel heater safe and actually cheaper?" | diesel heater for garage 6,600 (27,100 Jan) · best diesel 480 (1,600) · vevor for garage 880 | Honest $/h vs electric, computed from this week's EIA diesel price; exhaust diagram; BH-003 measured CO |
| 5 | **Keep-Above-Freezer** (fridge, water heater, EV) | "Keep it above 40 °F all winter at the lowest cost." | garage fridge heater kit 1,600 ×2 · cheapest way to heat a garage 390 (1,300) | 40 °F season cost (HDD at the balance point, not HDD65), Cold Snap alerts, "Nothing to do tonight" |
| 6 | **Heat-Pump Decider** | "Does a $2.5–7k mini-split beat a $170 heater over 5 years here?" | mini split for garage 3,600 (8,100 Jul) · heat pump for garage 390 | 5-year TCO with cooling credit, capacity at design temperature, unmet load |
| 7 | **Garage Gym / Hangout** | "60 °F by 6 am without CO or condensation." | garage gym heater 210 (1,300) | Warm-up, unvented-heater warning |
| 8 | **The Citer** (journalists, meteorologists, Reddit answerers, LLMs) | "A sourced, dated number I won't be embarrassed by." | – (PR, Dataset Search) | Index CSV, methodology, "Cite this" box |
| 9 | **The Pro** (electrician, garage-door installer) | "A brief that makes my quote easier." | installing a garage heater 1,000 ($18.01 CPC) · 240 V outlet cost 170 ($7.94) | Free Electrician Brief with QR; embed in v1.1 |

### 1.4 Why we win

1. **The market's weakness is trust, not information.** For one 24×24 garage, six publishers give seven answers from **10,200 to 40,300 BTU/h**, and none of them shows why (`competitors.md` §3.1). Parasite listicles claim testing they never did. Car and Driver's real test ran 6 mostly propane portables for 15 minutes each, with no 240 V heaters, no CO data and no cost per hour.
2. **We connect physics to the purchase.** Nobody else links insulation to breaker size: $675 of fixes turns a 10 kW / 60 A job into a 5 kW / 30 A job. That one insight sells seals, door kits and the right heater. It is also where the affiliate volume is: 27k + 22k + 22k searches a month.
3. **Safety is the conversion lever.** These are $150–1,500 purchases, and the buyer is afraid of fire, CO and breakers. We answer those fears next to the buy button, with code citations.
4. **Every 2026 platform rule rewards what we produce:**
   - the Google core update (Mar 2026) and spam update (Aug 2026) target scaled, commodity content;
   - Amazon's 2026-04-14 policy requires original content;
   - the FTC fake-review rule (16 CFR 465) bans invented tests.

   Our computed-per-garage numbers and pre-registered tests are original by construction.
5. **Links and AI citations go to sources.** The Index CSV (CC BY 4.0, `Dataset` schema), the methodology page, BH-001 and the Safety Card are what journalists, fire departments, Redditors and LLMs cite.
6. **It compounds.** A calculator can be cloned in a weekend. A season of pre-registered tests, a public corrections log and a calibrated model cannot.

---

## 2. Product

### 2.1 The BayHeat Planner (`/garage-heater-calculator`): the five steps

**Engine.** `lib/planner` ports `scratchpad/ref/planner.py` and the spec: per-surface UA at the ASHRAE 2021 99% design temperature, attic in series, slab F-factor, altitude infiltration, warm-up simulation, HDD at the balance point, heat-pump bins, NEC circuits, rules S1–S11, `rankSystems`, `insulateFirst`. It is pure, deterministic, IP units, and recomputes in under 4 ms.

**Entry points.**
- The home hero ZIP field.
- The `Size my garage` button in the header.
- Every page's context link, pre-filled with **partial params** that are accepted only when `g` is absent: `preset` (`2D`), `fuel` (`D`), `use` (`shop`) and `focus` (`seal`, `power` or `price`). They are merged into the defaults, and the flow starts at step 1. Examples: the diesel hub links `?preset=2D&fuel=D`; the bottom-seal page links `?focus=seal`.
- Instruments' `Open the full planner →`.
- `/r/<code>` pages ("Plan your own garage").
- `/embed/planner`.

**Layout.**
- Report surface. The step panel is a white card. The thermal exhibit (FIG. 1) is a dark camera frame beside it on desktop (columns 7–12) and above it on mobile.
- A running readout sits above the step card in Martian Mono: `SIZE 26,000–41,000 BTU/h · answer 2 more to narrow to ±8%`.
- A progress rail `01 WHERE · 02 GARAGE · 03 SKIN · 04 USE · 05 POWER`, where each step is a button.
- On mobile, the step card is full width. Next/Back are sticky at the bottom, 56 px tall.

| Step | Question (H2) | Controls (exact) | Maps to `GarageInput` |
|---|---|---|---|
| **1 · WHERE** (≈5 s) | "Where is the garage?" | One `ZIP code` field: `inputmode="numeric"`, `autocomplete="postal-code"`, 5 digits. On the 5th digit, **ZIP re-light**: the ZIP3 resolves to the nearest of 113 stations plus the state. A readout types in: `CHICAGO O'HARE · 99% DESIGN 3.3 °F · ELECTRIC 19.2¢/kWh (IL, EIA JUL-2026) · GAS $1.09/therm`, and the exhibit re-renders at that outdoor temperature. Each price has an `edit` affordance ("use my bill: __ ¢/kWh"). **Fallback:** a `Pick a state` select. | `zip3`, `stationId`, `state`, `priceOverrides` |
| **2 · GARAGE** (≈10 s) | "Which garage?" | Isometric line-art tiles: `1-CAR 12×22` · `2-CAR 24×24` · `3-CAR 32×24` · `4-CAR 40×26` · `CUSTOM`. A segmented control, `ATTACHED TO HOUSE` / `DETACHED`. A ceiling height stepper: 8 / 9 / 10 / 12 ft. W and D steppers (hold to repeat: 400 ms, then 60 ms). Windows: 0 / 1 / 2 / 3+ (12 ft² each). The drawing redraws live. | `preset`, `width`, `depth`, `height`, `attached`, `commonWallLen = depth`, `windowsFt2` |
| **3 · SKIN** (≈15 s) | "What's it made of?" | **Walls:** Bare studs · Drywall, no insulation · Insulated (R-13) · Well insulated (R-19+) · Metal building · **Don't know**. **Ceiling:** Attic, no insulation · Attic, insulated (R-30) · Open rafters · Room above · **Don't know**. **Big door:** Plain steel · Insulated door · Kit added · Wood · **Don't know**. **Drafts**, a 3-question quiz: "Daylight under the closed door?" · "Bottom seal cracked or missing?" · "Feel air at the side stops?" 0 yes = tight, 1 = average, 2 = leaky, 3 = very leaky; **Don't know** is allowed. Each card shows its U-value in small mono. | `wallType` (`open_studs` / `uninsulated_finished` / `R13` / `R19` / `metal_uninsulated` / `unknown`), `ceilingType` + `ceilingIns`, `garageDoors[0].type`, `tightness` |
| **4 · USE** (≈10 s) | "What's the garage for?" | **Use-case presets** (brand-first graft), each setting target and pattern: `SHOP 55 °F · sessions` · `GYM 60 °F · sessions` · `HANGOUT 65 °F · sessions` · `CAR & STORAGE 40 °F · all winter` · `KEEP ABOVE FREEZING 40 °F · all winter`. For sessions: sessions/week (1–7) × hours (1–8) steppers, default 2 × 4. Warm-up goal: 30 / 60 / 120 min. | `useCase`, `targetTemp`, `usage`, `warmupGoalMin` |
| **5 · POWER & FUEL** (≈10 s) | "What power and fuel do you have?" | **Outlets:** Only regular outlets (120 V) · Spare 240 V circuit (dryer/EV style) · I can add a circuit · **Not sure**. "Not sure" opens a 3-picture helper: NEMA 5-15, 6-30, 14-50. **Panel:** 100 A · 150 A · 200 A · Don't know. **Fuel at the house:** Natural gas · Propane tank · Propane cylinders · None. **Can we vent through an exterior wall?** Yes / No. **Priority:** Lowest upfront · Lowest running cost · Fastest heat · Balanced. **Cool it in summer too?** Yes / No. | `circuit`, `canAddCircuit`, `panelAmps`, `fuels`, `ventingPossible`, `priority`, `wantsCooling` |

**How "Don't know" works.** Every "Don't know" widens the band. `lib/planner/uncertainty.ts` evaluates `plan()` at the low and high corner of each unknown, up to 2⁴ = 16 calls in under 4 ms. It returns `{low, mid, high}` and `narrowBy`: the unknown that shrinks the band most. The corner values are:

| Unknown | Low | Mid | High |
|---|---|---|---|
| walls | `R19` | `R13` | `uninsulated_finished` |
| ceiling | `R30` | `drywall_uninsulated` | `open_rafters` |
| door | `steel_eps_2` | `steel_single` | `steel_single` + leaky perimeter |
| tightness | `tight` | `average` | `leaky` |

A ±1 tightness class is **always** in the band, even when every question is answered.

**The result "develops".** The capture sequence (§4.8) runs, then the report appears (§2.2).

**Validation.**
- The output guard from spec §2.2 applies: if Q/ft² is over 90, show the banner "Check inputs: this looks like an open or very leaky building."
- Custom dimensions are bounded to 8–80 ft (W/D) and 7–24 ft (H), with a soft warning above 60 ft or 14 ft.

### 2.2 The result screen: the Garage Heat Report (one scroll, in this order)

The serial is `R-{preset}{A|D}-{zip3}-{hash4}`, e.g. `R-2A-606-7F3A`. `hash4` is the first 4 hex characters of FNV-1a over the codec string. Next to it: `MODEL v1.0.0 · PRICES AS OF 2026-09`.

| # | Section | Contents (worked example A) | Notes |
|---|---|---|---|
| 1 | **Readout card** (also the share card) | Left: **FIG. 1**, the modeled thermal frame of *their* configuration, with HUD `MODELED — NOT A PHOTOGRAPH`, a °F scale bar and a spot meter. Right: the **BayGrade letter** (Archivo wdth 125, wght 900, 120 px) on the GradeScale bar; `YOU NEED 31,700 BTU/h · 9.3 kW` with band `28,400–37,500 (±1 draft class)`; `WARM-UP TO 55 °F: 1 h 56 min on 7.5 kW (average January day)`; `THE RULES OF THUMB SAID 10,200–40,300 →` (links to BH-001). Actions: `Copy link` · `Save image` · `Email me this report`. | The one shadow token in the system is used here. `aria-live` announces the final values only. |
| 2 | **FIX IT FIRST: the Shrinking Heater** | Checkboxes, cheapest payback first: `Weatherstrip package ~$125` · `EPS door kit ~$120` · `R-30 blown ceiling ~$430` · `Attic hatch gasket ~$20`. Toggling re-runs `plan()` live: the frame cools at the leaks over 1.5 s; the grade animates **D → B**; the load goes **31,700 → 13,000**; the circuit card flips **60 A / 6 AWG → 30 A / 10 AWG**; the heater plate **shrinks** (a `<ViewTransition>` morph) from `10 kW · 240 V / 60 A · 6 AWG` to `5 kW · 240 V / 30 A · 10 AWG`. Headline: **"$675 of fixes. Half the heater."** Both framings are shown (§0.2). Each fix row has a buy button (verified ASIN or tagged search). The cart button stays dark until ASINs are verified. | Shown only when the fixes drop a circuit or equipment tier (spec §14.6). Otherwise it becomes the "Your garage is already tight" note. |
| 3 | **WHAT FITS**: up to 3 spec plates | From `rankSystems`: safety tier first, then 5-year TCO weighted by priority. Each plate shows OUTPUT, CIRCUIT, **FIT bar** ("92% of your load"), RUN COST at their price, and PRICE CLASS `$$`. There is **one safety line in alarm red on the plate** (e.g. "Manual: not where gasoline is stored [S]"). Buttons: the primary partner, with Amazon always second. **"Why not…?"** lines: torpedo, diesel (when power is under ~21¢/kWh), 120 V when undersized. | The CO alarm is auto-attached, pre-checked and uncheckable, on every combustion plate. **An unvented heater is never plate 1 for an attached garage.** |
| 4 | **SAFETY** | The `warnings[]` from S1–S11: a 3 px `--alarm` left bar, imperative copy and code citations as R chips. A block-level item (S3/S4/S7) sits above the plates when it removes a class. | "General information; your electrician, gas fitter, local code and the manual govern." |
| 5 | **FIG. 2 · WHERE YOUR HEAT GOES** | Horizontal bars, sorted: `CEILING 34% · AIR LEAKS 24% · BIG DOOR 23% · SLAB EDGE 9% · WALLS 8% · WINDOWS & DOORS 4% · HOUSE WALL −3%`. Each bar with a fix carries a link: `Fix this → R-30 blown ceiling ~$430 · pays back in 0.5 yr at your price`. | Bars carry text values, so the chart is not colour-only. |
| 6 | **POWER IT**: circuit card | `circuitFor()`: breaker, Cu gauge (NM vs THHN), GFCI rule (NEC 210.8(A) for any 125–250 V garage receptacle), 208 V derate, and **panel check**: "100 A panel + a 30 A+ heater → ask for an NEC 220.83 load calculation"; "EV charger on the panel? Tell your electrician." Buttons: `Print the Electrician Brief` (free, §2.6) and, only if `LEADS_PROVIDER` is set, `Get 3 installer quotes` (labeled "Sponsored"). | NEC sections appear as R chips. |
| 7 | **PRICE IT** | Per hour, per session, per month and per season for: electric resistance, cold-climate heat pump, NG vented 80%, propane bulk vented, propane cylinder (the exchange trap: about $83/MMBtu vs $36.5 bulk [C]) and diesel (η 0.78). Every price has an as-of date. The diesel-vs-electric crossover is stated at their ¢/kWh. | Continuous mode uses HDD at T_bal. Session mode uses the §7 simulation. |
| 8 | **FIG. 3 · WARM-UP** | Temperature vs minutes for plate 1 on an average January day. Model line **dotted**; label `PREDICTION`. Once BH-004 publishes, the measured curve overlays as a **solid** line with an M chip. | A clock readout `00:00 → 01:56` draws with the curve. |
| 9 | **SHOP NOTES** (useCase = shop only) | "Keep open flame and glowing elements away from sawdust and solvent vapour (S10, S11)"; separated-combustion units (Hot Dawg HDS) when combustion is chosen; glue and finish minimum temperatures **only when the facts carry `status: 'verified'`** (Titebond Original/II/III [VERIFY]). | Rendering is blocked until verified. |
| 10 | **WHAT WE ASSUMED** | Every `[A]` value used, with its sensitivity ("One draft class leakier: +3,500 BTU/h"), and a link to each methodology anchor. A "Show the math" accordion lists UA per surface, ΔT, station, T_bal and HDD. | |
| 11 | **KEEP IT** | `Email me this report` · `Alert me before my garage's first hard freeze` (ZIP3-tagged) · **Heat Report Pro** card ($14 through Dec 15, then $19; §2.7) · `Help calibrate: how long does your heater take?` (a 4-field form: heater kW or BTU, start °F, end °F, minutes → `CENSUS_ENDPOINT`, falling back to a pre-filled `mailto:`). | |

### 2.3 URL state, share and permalink

**In-flow state lives in the query string.**
- URL: `/garage-heater-calculator?g=<code>&step=<1-5|r>&focus=<seal|power|price>`.
- It is read in a client component with `useSearchParams()` inside `<Suspense>`.
- Written with `window.history.replaceState` on every change, and `pushState` on step change so Back works.
- The page stays `○` static. The server render shows the **default worked result** (example A) with real numbers and tables for crawlers and LLMs, and the client hydrates over it.

**The codec** (`lib/planner/codec.ts`, versioned, human-readable, URL-safe, `.`-separated). Worked example A encodes as:

```
1.606.2A.24x24x9n1.w13.cd0.ds.ta.55s2x4g60.cb30+p200.fE.pb.xshop
```

| Pos | Token | Values |
|---|---|---|
| 1 | version | `1` |
| 2 | location | ZIP3 `606`, **or** a USPS state `IL` for the state fallback. **ZIP5 is never encoded.** |
| 3 | preset + attach | `1 2 3 4 C` + `A` (attached) / `D` (detached) |
| 4 | dims | `{W}x{D}x{H}n{windows}` in integer ft |
| 5 | wall | `w` + `os` open studs · `uf` drywall/uninsulated · `11 13 15 19 21` · `mu m10 m13 m19` (metal) · `cu c10` (CMU) · `u` unknown |
| 6 | ceiling | `c` + `d0 d11 d19 d30 d38 d49` (drywall under attic, R-value) · `r0 r19 r30` (open rafters) · `m0` (metal roof) · `h` (heated room above) · `u` |
| 7 | door | `d` + `s` steel · `w` wood · `e1 e2` EPS · `p1 p2` PU · `k` EPS kit · `kr` reflective kit · `u` |
| 8 | tightness | `t` + `t a l v u` |
| 9 | use | `{target}` + `s{spw}x{hps}` (sessions) or `c` (continuous), then `g{30/60/120}` |
| 10 | power | `c` + `a15 a20` (120 V) · `b20 b30 b40 b50 b60` (240 V) · `u` + optional `+` (can add a circuit) + `p{100/150/200/u}` |
| 11 | fuels | `f` + a subset of `E N P Y D K` (E always) + optional `v` (can vent) |
| 12 | priority | `p` + `u r f b` + optional `c` (wants cooling) |
| 13+ | optional | `x{shop,gym,hang,car,keep}` use case · `e{19.2}` own ¢/kWh · `n{1.09}` own $/therm · `q{2.50}` own $/gal propane |

- **Decode failure** (a bad or future token) falls back to the default input, with a notice: "That link came from a different model version; we loaded the example garage."
- **Round-trip test** is required: `decode(encode(x))` deep-equals `x` for 200 seeded random inputs plus example A.

**Permalink `/r/[code]`** (a deliberate `ƒ` route):
- It decodes, runs `plan()` on the server and renders the full report.
- `robots: noindex, follow`; canonical is `/garage-heater-calculator`.
- `generateMetadata` gives the title `Garage Heat Report R-2A-606-7F3A · BayHeat`.
- `opengraph-image.tsx` renders 1200×630:
  - left: the thermal poster for the preset and state;
  - right: the grade letter, `31,700 → 13,000 BTU/h`, `10 kW / 60 A → 5 kW / 30 A`, `2-CAR · ATTACHED · ZIP 606xx`;
  - a Forge scale bar along the bottom;
  - the Spot Mark and serial bottom-left.
- The CTA is `Plan your own garage →`.
- `Copy link` copies `/r/<code>`. `Save image` downloads the OG PNG (`/r/<code>/opengraph-image`). `Share` uses the Web Share API when available.

**Local memory.**
- On completion, the code is stored in `localStorage["bayheat:garage"]`, read through `useSyncExternalStore`.
- It powers the sticky **"Your garage: 13.0k BTU/h · B"** bar and re-sorts the plates on every money page (MiniSizer, FIT bars).
- It is wrapped in try/catch. Absence is normal.

### 2.4 Email capture points (Kit, double opt-in, env-gated)

| Point | Copy | Kit tags | Fallback when `KIT_API_KEY` is unset |
|---|---|---|---|
| Result → Keep it | "Email me this report. You get the link and the one-page Brief. No spam, one welcome series, unsubscribe any time." | `planner`, `zone-{1-8}`, `use-{case}`, `state-{XX}` | `Copy link` plus a `mailto:` pre-filled with the permalink |
| Every content page, above the footer (one per page) | "Get one email before your garage's first hard freeze. At most 1 every 7 days. ZIP: [___]" | `alerts`, `zip3-{606}` | Hidden, replaced by "Bookmark the planner" |
| Electrician Brief print dialog | "Email me the Brief as a link" | `brief` | mailto |
| Heat Report Pro when checkout is unset | "Notify me when Pro opens (launch price $14)" | `pro-waitlist` | mailto to `hello@` |
| `/cost-to-heat-a-garage` | "Get the monthly Garage Heat Index (first Tuesday)" | `index` | mailto |
| `/lab` and reports | "Get Lab Reports when they publish (about 2 a month)" | `lab` | mailto |

**Implementation.** The Server Action is `app/actions/subscribe.ts`.
1. Honeypot field `company`, plus a 2 s minimum dwell check.
2. `POST https://api.kit.com/v4/subscribers` with body `{email_address, state:"inactive", fields:{zip3, source}}` and header `X-Kit-Api-Key`.
3. `POST /v4/forms/{KIT_FORM_ID}/subscribers` with `{email_address, referrer}`. The form's double opt-in sends the confirmation [VERIFY on the first live test].
4. Tag via `POST /v4/tags/{id}/subscribers`, using the IDs from `KIT_TAG_IDS`.
5. Return `{ok, mode: 'kit'|'fallback'}`. **Never** block the UI on email.

Amazon links go only to double-opted-in subscribers, using the `NEXT_PUBLIC_AMAZON_TAG_MAIL` tracking ID.

### 2.5 Recommendation logic (engine; formulas in spec §4–§15)

- **Load.**
  - `Q_design = Σ(U·A·ΔT) + ceiling/attic in series + F·P·ΔT + 0.018·f_alt·V·ACH·ΔT + house coupling`
  - `Q_size = 1.10 × Q_design`
  - Design temperature: the station's `h99`, or `h99 + 5 °F` for daytime-only use.
- **Grade.** `BayGrade = UA_ext / A_floor` (BTU/h·°F·ft², house wall excluded, independent of climate).

  | Grade | Threshold |
  |---|---|
  | A | ≤ 0.38 |
  | B | ≤ 0.62 |
  | C | ≤ 0.90 |
  | D | ≤ 1.25 |
  | F | > 1.25 |

  Tests: example A as-is → D (0.995); seals + kit → C (0.717); all three fixes → B (0.423); bare & leaky → F (1.503). The formula is published on the methodology page (`#grade`). **It is a computed metric, never a review score.**
- **Candidates.** Spec §12 classes × units (1–2, or up to 3 for 120 V). Capacity at design:
  - electric: nameplate;
  - heat pump: `cap(h99) × rated47`;
  - gas: input × η.
- **Hard filters.**
  - Fuel availability.
  - Unvented heaters are excluded for continuous or unattended use. Torpedo heaters are always excluded.
  - Vented gas requires `ventingPossible`.
  - A circuit must fit, unless `canAddCircuit`; then add the circuit cost ($300–900; sub-panel $1,000–2,500).
  - Capacity ≥ Q_req (≥ 60% in "edge-off" spot mode).
- **Safety tier.**
  - Tier 1: electric, heat pump, vented or separated-combustion gas.
  - Tier 2: diesel with outdoor exhaust.
  - Tier 3: unvented, spot use only. **It is never shown as plate 1 for an attached garage.**
- **Score** (lower is better): `TCO₅ = equip_mid + install_mid + circuitCost + 5×annualCost + warmupPenalty + coolingCredit`, weighted by priority:
  - upfront: ×2 on upfront;
  - running: ×2 on annual;
  - fast: ×3 on warm-up.
- **Insulate-first injection.** If measures with payback under 3 years drop a circuit tier or equipment class, the Fix-First card leads (§2.2 section 2).
- **Products.** Each class maps to product IDs in `lib/commerce/products.ts`.
  - Only the 5 verified ASINs link to `/dp/`: CZ220 `B009F1SWH8`, FUH54 `B00PX0T37I`, CZ798 `B004VVJANC`, DR-975 `B01M8KXXAB`, HS-1500-TT `B07JQPCFJ3`.
  - Everything else uses a tagged search link: `https://www.amazon.com/s?k=<query>&tag=<tag>`.
  - Partner routing is in §6.2.

### 2.6 The free Electrician Brief (print view, no Amazon links)

`Print the Electrician Brief` toggles `data-print="brief"` and calls `window.print()`. The print stylesheet hides everything except `<ElectricianBrief>`.

Contents (US Letter, one page):
- the garage summary;
- the design load and band;
- the recommended class and nameplate kW;
- `circuitFor` output: breaker, conductor (NM and THHN), GFCI note, disconnect-within-sight note, 208 V derate;
- clearances from the manual [S];
- thermostat type (line-voltage double-pole for 240 V);
- a panel check;
- **6 questions to ask on a quote:**
  1. "Is my panel's load calculation OK?"
  2. "NM or THHN in conduit?"
  3. "GFCI required on this receptacle?"
  4. "Disconnect location?"
  5. "Permit and inspection included?"
  6. "Mount height and clearances per manual?"
- a QR code to `/r/<code>`, and the footer `Generated by BayHeat · bayheatguide.com · R-2A-606-7F3A · model v1.0.0`.

**The print CSS removes every `a[href*="amazon."]`.** A test enforces this (§9.6).

### 2.7 Heat Report Pro (`/heat-report-pro`): $14 through 2026-12-15, then $19

- **What Pro adds beyond the free report and Brief.** It is a 10-page print-ready document generated in the browser from the code:
  1. a **panel load worksheet** (NEC 220.83 existing-dwelling method, pre-filled with the heater; EV charger and appliance lines to fill in);
  2. a **3-quote comparison sheet** with the job spec;
  3. good / better / best equipment options with install specs;
  4. **thermostat wiring diagrams** for each heater class;
  5. a **month-by-month cost table** at the buyer's own rate;
  6. a measure-by-measure fix-first shopping list with payback and quantities (feet of seal for their door width);
  7. a CO, clearance and venting checklist;
  8. from March 2027, a cooling and dehumidifier appendix (free for existing buyers).
- **No Amazon links inside.** Items link to bayheatguide.com pages.
- **Checkout:** a hosted link from `NEXT_PUBLIC_CHECKOUT_URL_PRO` (Polar recommended: 5% + 50¢, merchant of record). The success URL is `/heat-report-pro/print?g={code}`.
- **v1 unlock** (testable with no account):
  - The print page asks `POST /api/pro/verify {code, t}` (a deliberate `ƒ` route).
  - The handler checks `t = base64url(HMAC-SHA256(PRO_UNLOCK_SECRET, code))` and returns `{ok}`.
  - Tokens are minted by `scripts/pro-token.ts` (Commerce Desk, on a manual fulfillment email) until the Polar webhook lands in v1.1 (`app/api/polar/webhook/route.ts`, `POLAR_WEBHOOK_SECRET`). The webhook will email the tokenized link.
  - Without `PRO_UNLOCK_SECRET`, pages 1–2 render as a real sample (example A) and the CTA reads "Notify me".
  - This is a soft paywall by design, with zero PII stored.
- **Refunds:** 14 days, no questions asked.
- **Pricing rule:** if Pro sells fewer than 0.4 per 1,000 sessions by Dec 15, drop to $12 instead of raising to $19. The Ops Analyst applies the rule; the owner approves.

### 2.8 Other v1 signature features

**(a) Can I Run It? (`/can-i-run-it`).** A GO / GO-IF / NO-GO verdict in about 20 s, with citations. It targets:

| Search | Volume/mo |
|---|---:|
| kerosene heater indoors | 22,200 |
| torpedo heater | 14,800 |
| indoor safe propane heater | 9,900 |
| gas heater indoor | 5,400 |
| ventless propane | 4,400 |
| is it safe to use propane heater in garage | 90 (390 at peak) |

- **Step 1, heater tiles:** 120 V portable · 240 V hardwired · Buddy-type propane (unvented radiant, ODS) · Forced-air "torpedo" · Kerosene convection · Diesel air heater · Vented gas unit heater · Mini-split.
- **Step 2, situation taps (5–7):**
  - attached / detached;
  - gasoline, paint or solvents stored?
  - living space above?
  - unattended or overnight?
  - fresh-air opening?
  - the outlet's circuit (120 V/15 A shared · 120 V/20 A dedicated · extension cord · 240 V/20 · 240 V/30);
  - cylinder (1-lb / 20-lb);
  - exhaust and intake routed outdoors?
  - CO alarm installed?
  - garage size preset (for the IFGC 621 limit of 20 BTU/h per ft³ of room volume).
- **Engine:** `lib/safety/verdict.ts` is pure. It returns `{verdict, conditions[], saferAlternatives[], stamp}`. Each condition is `{text, cite, ev: 'R'|'S'|'C', severity}`.
- **The 20 required tests** (`lib/safety/verdict.test.ts`):
  1. Big Buddy + attached + overnight → **NO-GO**
  2. Big Buddy + detached + attended + fresh air + CO alarm → **GO-IF** (ODS ≠ CO alarm; 18 in² opening; not near gasoline)
  3. Buddy + gasoline stored → **NO-GO**
  4. Torpedo + any enclosed garage → **NO-GO**
  5. Kerosene + attached + sleeping above → **NO-GO**
  6. Kerosene + detached + attended + ventilation → **GO-IF**
  7. Diesel + exhaust indoors → **NO-GO**
  8. Diesel + exhaust and intake outdoors + CO alarm → **GO-IF 3 conditions**
  9. Diesel + attached + no CO alarm → **GO-IF** (install UL 2034 in the garage and the house)
  10. 120 V 1,500 W + shared 15 A → **GO-IF** (sole load; 12.5 A > 12 A per NEC 210.23(A)(1))
  11. 120 V + extension cord → **NO-GO**
  12. 120 V + dedicated 20 A → **GO**
  13. 4 kW + 240 V/20 A → **NO-GO** (needs 25 A)
  14. 5 kW + 240 V/30 A → **GO**
  15. 5 kW CZ220-class + gasoline stored → **GO-IF** (choose a unit whose manual allows it; CZ220's does not)
  16. Vented gas unit + attached → **GO-IF** (18 in ignition height IFGC 305.3; licensed fitter; CO alarms)
  17. Vented gas + solvent/sawdust shop → **GO-IF** (separated combustion, S10)
  18. Mini-split → **GO**
  19. Unvented aggregate input over 20 BTU/h per ft³ → **NO-GO**
  20. 20-lb cylinder stored in an attached garage → **GO-IF** (store outdoors; NFPA 58 [VERIFY section])
- **UI:**
  - The stamp is Archivo wdth 125, wght 900, with the stamp motion (§4.8).
  - Conditions are a numbered list with R/S chips.
  - "Safer alternatives for your situation": 2–3 classes. **Affiliate links appear only on safe alternatives and CO alarms, never next to a NO-GO product.**
- **Share:** the state goes into `?h=buddy&a=1&…` on the same static page; the generic tool OG is used in v1.
  - v1.1 adds static scenario pages with their own OG: `/can-i-run-it/buddy-heater-in-garage` (Oct 8), `/kerosene-heater-in-garage` (Oct 13), `/torpedo-heater-in-garage` (Oct 15).
- **Printable Safety Card:** a half-page, ungated "tape it to the wall" card. It is co-brandable: `?dept=` prints "Shared by {dept}" (sanitized, max 60 characters) for fire departments.

**(b) The Garage Heat Index (`/cost-to-heat-a-garage`).**
- **Definition (published on the page):** the season cost to hold a standard attached 2-car garage (24×24×9, R-13 walls, R-19 ceiling, uninsulated steel door, average drafts) at **50 °F**, for each state's population-primary station, per fuel, at the current EIA prices.
  - It is **computed by `scripts/build-index.ts` from `lib/planner`**. The preview JSON is not pasted.
  - Preview values for orientation only: US median about $548 electric; AK $2,579; IL $1,045; seals plus door kit cut about 27%.
- **Page:**
  - an accessible SVG **tile map** (51 equal squares, Frost→Forge, labeled scale);
  - fuel toggle and a 40/50/60 °F setpoint;
  - a sortable 51-row table (the accessible fallback);
  - a "Cite this" box;
  - `Dataset` JSON-LD;
  - `Download CSV` at `/data/garage-heat-index.csv` (CC BY 4.0, `force-static`, with dated snapshots such as `/data/garage-heat-index-2026-10.csv` added by the Data Desk).
- **Refresh:** within 48 h of each EIA Electric Power Monthly release (next about 2026-10-23), with one headline per release.

**(c) Lab Report BH-001, "The 4× Problem" (`/lab/reports/bh-001-the-4x-problem`).**
- Seven published rules for one 24×24 garage, each quoted verbatim with URL and retrieval date 2026-09-25:

  | Source | Rule | Value (BTU/h) |
  |---|---|---|
  | Bob Vila | "2-car → 3,000 W" | 10,200 |
  | Car and Driver | 10 W/ft² | 19,650 |
  | Car and Driver | 45 BTU/ft² | 25,920 |
  | Filterbuy | – | 18,000–24,000 |
  | PickHVAC | – | ~30,240 |
  | thegarage.guide | – | 12,960–31,680 |
  | AC Direct | – | 14,400–40,320 |

- Our model's answer across four envelopes: 13,000 / 22,600 / 31,700 / 48,400.
- It explains why the rules disagree: they ignore climate, the ceiling, air leaks and the attic.
- Evidence is R and C only. **No physical test is claimed.** A right of reply is offered by email.

**(d) The Lab (`/lab`).**
- **Test board:** protocols P-002…P-005 pre-registered 2026-10-09, with each hypothesis and the model's prediction computed by the engine.
- **Status stamps:** `PRE-REGISTERED`, `RUNNING`, `PUBLISHED`.
- **Instrument inventory:** lists only items actually owned (empty until bought).
- **Evidence Marks legend**, and a link to the notebook.

---
## 3. Information architecture

### 3.1 Global navigation

**Desktop.** One line at ≥1024 px, 64 px tall, paper background, 1 px bottom rule.
- Wordmark lockup on the left.
- Nav in Archivo wdth 75, wght 600, 13 px caps: `PLANNER · HEATERS ▾ · SEAL & INSULATE ▾ · CAN I RUN IT? · THE LAB`.
- On the right, the Ember button `Size my garage`.
- Dropdowns are plain link lists in columns:
  - HEATERS: All fuels · Electric · 240 V · Portable · Ceiling · Wall · Infrared · Diesel · Propane · Electric vs propane · Size chart · Cost by state
  - SEAL & INSULATE: Bottom seal · Weather stripping · Door insulation kit · How to insulate

**Mobile.**
- 56 px bar: wordmark, a `Size` pill (Ember) and `Menu`. The menu opens full screen.
- **Desktop never gets a hamburger.**
- A sticky bottom CTA `Size my garage — 60 s` appears after the hero scrolls away and hides while the planner is on screen.
- Once a garage is saved, it becomes the **"Your garage: 13.0k BTU/h · B"** bar.

**Footer (paper, 4 columns).**
1. The spine: Size it · Power it · Price it · Fix it.
2. Tools: Planner · Can I Run It? · Garage Heat Index · Methodology.
3. The Lab: Lab · BH-001 · Notebook & corrections · How we work.
4. Company: About · How we make money (`/how-we-work#money`) · Privacy · `hello@bayheatguide.com`.

Below the columns:
- the site-level Lab stamp: `MODEL v1.0.0 · PRICES AS OF 2026-09 · LAST CORRECTION —`;
- the Amazon sentence, the Laqaer Products line and the postal address (from env).

### 3.2 Page anatomy: the Report template (`components/page/ReportPage.tsx`)

Every content route uses the Report template, which has two variants.

**`verdict-first`** (buy-intent pages). The first 700 px at 390×844 must contain the H1, the answer block, the disclosure and the top edge of plate 1.
1. Breadcrumbs, 12 px.
2. **Lab stamp**: one line, 28 px, Martian Mono 11 px, e.g. `G-014 · REV 1 · CHECKED 2026-10-01 · MODEL v1.0.0 · C 22 S 9 R 6 ▾`. The expansion shows sources, the evidence legend, "Drafted with AI assistance · checked by {editor}", and technical review status and date.
3. **H1** (with a number, a garage noun or a decision).
4. **Answer block**: 40–70 words of computed specifics, with evidence chips on the decision numbers. It has a stable anchor, e.g. `#answer`.
5. **Disclosure line**: "Paid links: we earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases."
6. **Verdict Rail**: at most 3 spec plates. The MiniSizer (garage size, drafts, ZIP) sits inline above the rail on desktop, and collapses to a single "Fit to my garage" chip on mobile.
7. **FIG. 1**, then the body in columns 3–9. On desktop, a sticky right rail (columns 10–12) holds "Your garage" or a `Size my garage` CTA.
8. The **seal-first bridge**, on every heater page: "Sealing this garage first saves ≈X BTU/h (≈$Y/season)" → bottom seal and door kit.
9. A **Buy this, not that** block: at least one thing not to buy, and why.
10. The comparison table, where relevant.
11. Safety at the point of risk.
12. The **Next step** module, one step down the spine.
13. The Cold Snap alert capture.
14. Numbered sources.
15. Revision history.

**`report-first`** (tools, safety, data, lab, how-to). Same order, with two differences:
- FIG. 1 comes right after the answer block.
- Picks, if any, come after the first body section.

### 3.3 v1 routes (all live by Fri 2026-10-02)

- All pages live under `app/(site)/`.
- **V** means verdict-first; **R** means report-first.
- Volumes are US monthly averages, with the peak in parentheses.
- Every H1 number is computed at build time from `lib/planner` or `lib/facts`. The numbers shown here are for example A.

| # | Path | Type | H1 | Target keywords (vol/mo) | Primary CTA | Monetization |
|---:|---|---|---|---|---|---|
| 1 | `/` | Home | "One garage. Seven answers. 10,200 to 40,300 BTU/h." | garage heater 27,100 (long term via hubs) · brand | ZIP field + `Size my garage` | Via planner; picks on the hero plate |
| 2 | `/garage-heater-calculator` | Tool (R) | "Garage heater calculator: the BTU/h, breaker and cost per hour for your garage" | garage heater calculator 880 (2,900 Jan) · size calculator 390 · garage btu calculator 320 · btu calculator garage 320 · btu calc garage heater 210 · how many btu to heat a garage 210 (1,600) | `Size my garage` (step 1) | Plates (tag `_PLANNER`), Pro, email |
| 3 | `/garage-heater-calculator/methodology` | Reference (R) | "How the planner gets 31,700 BTU/h for a 2-car garage: every formula and constant" | citation magnet · AI answers | `Try it on your garage` | None (trust) |
| 4 | `/r/[code]` **ƒ, noindex** | Report permalink | "Garage Heat Report R-2A-606-7F3A" | (share loop) | `Plan your own garage` | Plates, Pro |
| 5 | `/can-i-run-it` | Safety tool (R) | "Can I run this heater in my garage? A verdict in 20 seconds, with the code section" | kerosene heater indoors 22,200 · torpedo 14,800 (safety slice) · indoor safe propane 9,900 · gas heater indoor 5,400 · ventless propane 4,400 | `Check my heater` | Safe alternatives and CO alarms only (tag `_SAFETY`) |
| 6 | `/cost-to-heat-a-garage` | Data (R) | "What it costs to keep a 2-car garage at 50 °F all winter, in every state" | cost to heat a garage 50 (PR asset) · most efficient way to heat a garage 110 (390) | `Download CSV` / `Size my garage` | Email (index), planner |
| 7 | `/data/garage-heat-index.csv` | Data file (`force-static`) | – | Dataset Search | – | – |
| 8 | `/garage-heater-size` | Matrix (R) | "What size heater for a 1-, 2- or 3-car garage: 7,500 to 94,300 BTU/h, depending on the walls" | how many btu to heat a garage 210 · for 3-car 170 (480) · 2-car 90 · what size heater for garage 50 · garage heater size 70 | `Size my garage` | Planner deep links |
| 9 | `/garage-door-bottom-seal` | Money (V) | "Garage door bottom seals: match the retainer, close the gap, cut the draft" | **garage door bottom seal 27,100 (33,100 Oct)** | Door Leak Meter → `Check price` | Amazon seals and retainers (search links until ASINs are verified) |
| 10 | `/garage-door-weather-stripping` | Money (V) | "Garage door weather stripping: a $125 package cuts a 2-car garage's heat loss by 12%" | **garage door weather stripping 22,200 (40,500 Nov)** · door insulation strip 2,400 | Door Leak Meter | Amazon |
| 11 | `/garage-door-insulation-kit` | Money (V) | "Garage door insulation kits: 16% of a typical 2-car garage's heat loss, and when a kit barely helps" | **garage door insulation kit 22,200** · panels 5,400 · cellofoam 4,400 · owens corning 2,400 · DIY 2,400 · best 590 | Kit Payback Meter | Amazon, Home Depot (env) |
| 12 | `/how-to-insulate-a-garage` | Guide (R) | "How to insulate a garage in the order that pays back: $675 cuts the heater you need by 59%" | how to insulate a garage 2,400 · garage insulation 9,900 · garage insulation kit 2,400 | Kit Payback Meter | Amazon (seal, kit, batts), Home Depot |
| 13 | `/garage-heaters` | Hub (V) | "Garage heaters by fuel: electric, gas, propane, diesel or heat pump, at your prices" | **garage heater 27,100** · heater to heat garage 14,800 · good garage heater 5,400 | Fuel Cost Meter → `Size my garage` | All partners |
| 14 | `/electric-garage-heater` | Hub (V) | "Electric garage heaters: 1.5 kW spot heat to 10 kW, and the circuit each one needs" | **garage heater electric 14,800 · heating garage with electric heater 14,800** · electric shop heater 4,400 · garage space heater electric 1,300 | Circuit Checker | Amazon (5 verified ASINs) |
| 15 | `/240v-garage-heater` | Money (V) | "240 V garage heaters: 5 kW needs a 30 A breaker and 10 AWG, and 4 kW won't fit a 20 A circuit" | electric garage heater 240v 1,300 · 240v garage heater 590 (1,600) · 240v electric heater 480 | Circuit Checker | Amazon (CZ220, FUH54, DR-975); lead slot (env) |
| 16 | `/portable-garage-heater` | Money (V) | "Portable garage heaters: 1,500 W draws 12.5 A and must be the only load on a 15 A circuit" | portable electric garage heater 4,400 · electric garage heater 120v 3,600 · space heater for garage 3,600 · garage portable heater 3,600 · plug in 480 | Circuit Checker (120 V mode) | Amazon (CZ798, HS-1500-TT) |
| 17 | `/ceiling-mount-garage-heater` | Money (V) | "Ceiling-mount garage heaters: 5 kW on 30 A, 6 ft minimum height, 8 in from any wall" | ceiling mounted heater 720 · comfort zone garage heater 720 · ceiling mount garage heater 480 (1,600) | Circuit Checker | Amazon (CZ220, FUH54) |
| 18 | `/best-wall-mount-garage-heaters` (kept URL) | Money (V) | "Wall-mount garage heaters: 1.5 kW, 5 kW and 7.5 kW, with the clearances from each manual" | wall mount garage heater 210 (720) · wall mounted electric garage heater 210 | `Size my garage` | Amazon (FUH54, DR-975, HS-1500-TT) |
| 19 | `/infrared-garage-heater` | Money (V) | "Infrared vs forced-air garage heaters: which one wins with the door open" | infrared garage heater 2,400 (9,900 Jan) · ir garage heater 2,400 · forced air heater for garage 1,900 · radiant 1,600 | `Size my garage` | Amazon |
| 20 | `/diesel-heater-for-garage` | Money (V) | "Diesel heater for a garage: {$/h diesel} vs {$/h electric} an hour at US prices, and the exhaust rule" (computed from the week's EIA diesel price; the as-of date is shown) | **diesel heater for garage 6,600 (27,100 Jan)** · garage diesel heater 6,600 · best diesel 480 (1,600) · vevor for garage 880 | Fuel Cost Meter | VEVOR/Hcalory via Awin (env), falling back to Amazon search; CO alarms |
| 21 | `/propane-heater-for-garage` | Money (V) | "Propane heaters for garages: vented vs Buddy-type, an 18-hour tank, and the CO alarm you need" | **propane heater for garage 9,900** (+ LP, LPG and gas variants, 9,900 each) · vented propane 6,600 · portable propane indoor 4,400 | `Check my heater` (Can I Run It?) | Amazon search; Northern Tool (env); CO alarms |
| 22 | `/electric-vs-propane-garage-heater` (kept URL) | Guide (R) | "Electric vs propane vs gas vs diesel: cost per million BTU delivered at your state's prices" | electric vs propane garage heater 90 (390) · gas vs electric 170 | Fuel Cost Meter | All partners |
| 23 | `/lab` | Lab (R) | "The BayHeat Lab: 4 pre-registered tests, each with its prediction published before we measure" | brand trust | `Get Lab Reports` | None |
| 24 | `/lab/reports/bh-001-the-4x-problem` | Report (R) | "BH-001: Six publishers, seven answers, one garage (10,200–40,300 BTU/h)" | calculator cluster · linkbait | `Size my garage` | None |
| 25 | `/lab/notebook` | Changelog (R) | "Lab notebook: every model release, price refresh and correction" | trust | `Report a problem` | None |
| 26 | `/how-we-work` | Standards (R) | "How we work: 7 pledges, how we make money, and who checks each page" | E-E-A-T, FTC | – | None |
| 27 | `/heat-report-pro` | Product (R) | "Heat Report Pro: a 10-page plan for your garage and your electrician, $14 until Dec 15" | – | `Get Heat Report Pro — $14` / `Notify me` | Pro |
| 28 | `/heat-report-pro/print` | Print (static, noindex) | "Heat Report Pro · R-…" | – | `Print / Save as PDF` | – |
| 29 | `/about` (kept URL) | Company (R) | "About BayHeat: an open garage-climate model, a lab, and the people who check it" | brand | – | – |
| 30 | `/privacy` (kept URL) | Legal | "Privacy: what BayHeat collects (almost nothing) and why" | – | – | – |
| 31 | `/embed/planner` (noindex) | Embed (bare layout) | – | referral | `Get the full report on BayHeat ↗` | – |

**System routes:**
- `app/sitemap.ts` lists indexable routes only; `/r`, `/embed`, `/heat-report-pro/print` and `noindex` state pages are excluded.
- `app/robots.ts` allows `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `Applebot`, `Bingbot`, `DuckAssistBot` and `Google-Extended`, and disallows `/api/` and `/r/`.
- `app/llms.txt/route.ts` is `force-static`.
- Also: `app/opengraph-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/not-found.tsx`.
- `app/api/pro/verify/route.ts` is POST, `ƒ`.

**Indexable count:** 27. Routes 4, 7, 28 and 31 are not indexed.

### 3.4 Redirects (`lib/redirects.ts` → `next.config.ts` `redirects()`, `permanent: true` = 308)

| Old URL | New URL |
|---|---|
| `/best-electric-garage-heaters-by-size` | `/garage-heater-size` |
| `/electric-garage-heater-operating-cost` | `/cost-to-heat-a-garage` |
| `/120v-vs-240v-garage-heater` | `/240v-garage-heater` |
| `/hardwired-vs-plugin-garage-heater` | `/240v-garage-heater` |
| `/portable-garage-heaters-15a-circuit` | `/portable-garage-heater` |
| `/forced-air-vs-infrared-garage-heater` | `/infrared-garage-heater` |
| `/best-ceiling-mount-garage-heaters-under-200` | `/ceiling-mount-garage-heater` |
| `/wall-mount-vs-ceiling-garage-heater` | `/ceiling-mount-garage-heater` |
| `/insulate-garage-before-heater-upgrade` | `/how-to-insulate-a-garage` |

**Kept URLs** (re-skinned, with audit fixes):
- `/best-wall-mount-garage-heaters`
- `/electric-vs-propane-garage-heater`
- `/about`
- `/privacy`
- `/`

**Rules:**
- `lib/redirects.test.ts` asserts that every `destination` has `app/(site)<destination>/page.tsx`.
- If a destination slips at integration, the integrator removes that entry and restores the old folder with `git checkout <foundation-parent> -- app/<old>` in the same commit.
- **GSC gate (owner, day 1):** export the last 28 days by page. Any old URL with 10 or more impressions or any click is still redirected, but its best paragraph is moved verbatim onto the destination, under an anchor matching the old topic.
- **Content moves with the redirect.** Keep the audit's facts. Kill the "What this page will not claim" sections, the "boring" copy, the stacked disclaimers, the "under $200" class and the astrology line. Fix all of these:
  - FUH54 is $468–500 (price class `$$$`);
  - DR-975 back-wall clearance is 4.5 in;
  - the CZ220 "not where gasoline… stored" warning;
  - GFCI on 125–250 V garage receptacles (NEC 210.8(A));
  - cite 210.23(A)(1) for portables and 424.4(B) for fixed heaters;
  - 10 kW → 52.1 A → 60 A / 6 AWG.

### 3.5 v1.1 rollout: at most 5 indexable pages a week (each with engine numbers, a figure, sources and review)

| Publish by | Route | Cluster (vol/mo, peak) | Money |
|---|---|---|---|
| Mon Oct 5 | `/natural-gas-garage-heater` | natural gas garage heater 2,900 (12,100 Nov) · gas garage heater 8,100 | Northern Tool (CJ), Amazon search, gas-fitter lead slot |
| Mon Oct 5 | `/big-maxx-vs-hot-dawg-vs-modine-vs-reznor` | mr heater big maxx 2,900 (12,100 Nov) · reznor 2,400 · hot dawg 1,600 · modine 1,000 | Northern Tool, Amazon |
| Thu Oct 8 | `/shop-heater` | shop heater 6,600 (33,100 Jan) · workshop heater 390 · best shop heater 210 | Amazon, Northern Tool |
| Thu Oct 8 | `/most-efficient-garage-heater` | most efficient garage heater 5,400 · cheapest way 390 (1,300) | Heat-pump partners, all |
| Thu Oct 8 | `/can-i-run-it/buddy-heater-in-garage` | buddy heater 40,500 (safety slice) · big buddy 12,100 · little buddy 18,100 | CO alarms, safer alternatives |
| Tue Oct 13 | `/best-garage-heater` ("Lab Picks · modeled"; upgraded as tests land) | best garage heater 5,400 · best heater to heat garage 5,400 · best electric heater for garage 2,900 | All |
| Tue Oct 13 | `/can-i-run-it/kerosene-heater-in-garage` | kerosene heater indoors 22,200 · kerosene heater for garage 720 | Safer alternatives |
| Thu Oct 15 | `/can-i-run-it/torpedo-heater-in-garage` | torpedo heater 14,800 (informational slice) | Safer alternatives |
| Thu Oct 15 | `/ventless-propane-heater` | ventless propane 4,400 · ventless gas 2,400 · ventless NG 1,300 | CO alarms, vented alternatives |
| Tue Oct 20 | `/garage-fridge-heater-kit` | garage fridge heater kit 1,600 · garage heater kit refrigerator 1,600 | Amazon |
| Tue Oct 20 | `/keep-garage-above-freezing` (static freeze physics: thresholds by daily mean, "fixes compound"; recomputed by the engine) | keep above freezing · cheapest way | Email (alerts), Amazon |
| Thu Oct 22 | `/garage-heater-installation-cost` | installing a garage heater 1,000 ($18.01 CPC) · installation cost 260 ($13.98) · 240 V outlet cost 170 ($7.94) | Lead slot (env), free Brief, Pro |
| Tue Oct 27 | `/heat-pump-mini-split-for-garage` | mini split for garage 3,600 · ductless 1,600 · heat pump for garage 390 (1,000) | HVACDirect, Got Ductless, Pioneer (env) |
| Tue Oct 27 | `/garage-door-insulation-r-value` | r value 720 (+ 4 variants) | Amazon |
| Thu Oct 29 | `/how-cold-does-an-unheated-garage-get` (the SERP is forum-only, per the 09-25 check) | long tail · PR | Email |
| Thu Oct 29 | `/embed` (landing; compact 320 px widget; `/embed/heat-index`) | referral | – |
| Tue Nov 3 | `/diesel-heater-garage-install` · `/lab/recall-watch` · `/cheapest-way-to-heat-a-garage` | install long tail · news · 390 (1,300) | VEVOR/Hcalory, CO alarms |
| Thu Nov 5 | `/garage-gym-heater` · **BH-002** `/lab/reports/bh-002-door-kit-co-heating` (first M marks, Nov 6) | 210 (1,300) · door-kit cluster, PR | Amazon |
| Tue Nov 10 | `/garage-heater-with-thermostat` · `/cost-to-heat-a-garage/[state]` batch 1 (10 coldest, `noindex` until they pass the gate) | 590 (2,400) · local PR | Amazon |
| Thu Nov 12 | `/first-garage-freeze` (dataset: garage freeze lags the first air frost; computed per station) | PR, email | Email |
| Fri Nov 20 | `/garage-heater-deals` (Black Friday and Cyber Monday; price **tiers** only, no Amazon prices) | seasonal | All |
| Thu Dec 3 | **BH-003** `/lab/reports/bh-003-diesel-heater-co` | diesel peak | VEVOR, CO alarms |
| Dec 7–11 | `/wood-stove-for-garage` (2,400) · state batches 3–5 | – | – |
| Jan 2027 | **BH-004** 5 kW warm-up · **BH-005** Big Buddy moisture (phase 2, if gated in) · `/waste-oil-heater-for-garage` (1,300) · `/garage-insulation-cost` (1,600, $8.68 CPC) · `/garage-subpanel` (720) · Index "coldest month" edition | – | Leads (env) |
| Mon Mar 1, 2027 | Cooling cluster plus planner cooling mode: `/garage-air-conditioner` (12,100 → 40,500 Jul) · `/garage-dehumidifier` (12,100 → 22,200) · `/garage-fan` (8,100 → 27,100) · `/portable-ac-for-garage` (4,400 → 14,800) · `/what-size-mini-split-for-garage` | – | Sylvane, HVACDirect, Amazon |

### 3.6 v2 backlog (after Mar 2027; each needs a GSC or revenue signal first)

- Heat Report Pro **Climate Pack** ($39: heat, cool and dehumidify).
- **Pro embed** for contractors ($29–49/mo; needs auth and billing).
- **BayGrade Index**, published at 1,000 or more real completions ("the median American garage is a D").
- **Neighbour compare**, only at n ≥ 50 per state.
- A **warm-up race** WebM export for Shorts.
- A live garage-temperature forecast, only after calibration against 20 or more reference garages.
- Open-source the model as `bayheat/garage-load-model` (MIT) and make the site repo private (Q1 2027).
- Results licensing, under the firewall in §5.4.
- Heat-wave alerts (May 2027).

**Never build:**
- city pages;
- per-size or per-SKU thin pages;
- indexable kit landers;
- "vevor diesel heater" brand-head pages;
- fake "tested" roundups;
- `Product`/`Review`/`AggregateRating` markup without first-party data;
- display ads on the planner, safety or money pages.

---

## 4. Design system: "Inspection Grade"

### 4.1 Art direction

**The site is a lab's published record.** It is calm report paper, with dark thermal-camera exhibits embedded as numbered figures, rating-plate labels and graded numbers.
- The light **Report** surface is the default, because reading, trust and buying happen there.
- The dark **Camera** surface is for exhibits, the planner capture panel, the hero frame and OG cards.

**Mood:** a FLIR inspection report crossed with Teenage Engineering restraint.

**What makes the site ours:**
- the Spot Mark;
- the ZIP re-light;
- the Shrinking Heater;
- the Disagreement Strip;
- the GO/NO-GO stamps;
- FIG. numbering;
- the `MODELED — NOT A PHOTOGRAPH` tag;
- evidence chips on the numbers that matter.

### 4.2 Color tokens (hex; contrast measured)

Declared in `app/globals.css`, scoped by `[data-surface]`. `:root` is report.

**Report surface (default).**

| Token | Hex | Semantic use | Contrast |
|---|---|---|---|
| `--bg` | `#F6F4EF` | page paper | – |
| `--surface` | `#FFFFFF` | tables, plates, step cards, Lab stamp | – |
| `--surface-2` | `#EFECE4` | row hover, input wells | – |
| `--line` | `#DAD6CC` | 1 px hairlines (decorative only) | 1.32:1 |
| `--grid` | `#E9E5DC` | graph grid inside figures only (8 px minor, 40 px major) | decorative |
| `--text` | `#15171C` | body, headings, grade letter | 16.31:1 |
| `--text-2` | `#565B66` | secondary, captions, units | 6.19:1 |
| `--link` | `#B8430B` | links, emphasis on paper (Ember ink) | 4.97:1 |
| `--ember` | `#FF8A1F` | **the one action color, as a fill only**, with `#15171C` text | 7.61:1 text-on-fill |
| `--ember-hover` | `#FF9D42` | button hover | – |
| `--frost-ink` | `#16607F` | cold and loss annotations; C chip fill | 6.34:1 |
| `--heat-ink` | `#8E1B0E` | "hot" data labels | 8.26:1 |
| `--alarm` | `#B3261E` | **safety only**: CO, clearance, overload, NO-GO | 5.95:1 |
| `--go` | `#1F6B3A` | GO stamp only | 6.4:1 |

**Camera surface (`[data-surface="camera"]`).**

| Token | Hex | Use | Contrast on `#08090C` |
|---|---|---|---|
| `--bg` | `#08090C` | sensor black | – |
| `--surface` | `#12151B` | panels | – |
| `--surface-2` | `#1A1E26` | raised, wells | – |
| `--line` | `#2A2F38` | hairlines | decorative |
| `--text` | `#F3EFE6` | bone | 17.35:1 |
| `--text-2` | `#A3A7B0` | secondary | 8.26:1 |
| `--text-3` | `#80858F` | units, meta | 5.38:1 |
| `--ember` | `#FF8A1F` | action, with `#08090C` text | 8.45:1 |
| `--glow` | `#FFB547` | result numbers, readouts | 11.33:1 |
| `--frost` | `#5CC8E6` | cold annotations | 10.30:1 |
| `--alarm` | `#FF4F3A` | safety | 6.10:1 |

**Data ramps** (the only gradients allowed; OKLab; always next to a labeled °F scale):
- **Forge:** `#3A0D0B → #8E1B0E → #D9480F → #F77F00 → #FCBF49 → #FFF1C9`
- **Frost:** `#0E2A3D → #16607F → #3FA7C9 → #BCE9F5`
- **Diverging:** `#BCE9F5 → #3FA7C9 → #16607F → #1A1C22 → #8E1B0E → #F77F00 → #FFF1C9`
- **Grade scale** (the only non-temperature ramp; it is labeled `HEAT ESCAPES ← → HOLDS HEAT`): F `#3FA7C9` → D `#BCE9F5` → C `#E9E5DC` → B `#FCBF49` → A `#FFB547`.

**Evidence chips.** 14 px tall; Martian Mono wdth 75, wght 600, 10 px; 2 px radius; the letter is always shown.

| Chip | Meaning | Style |
|---|---|---|
| **M** | measured | Ember fill, ink letter |
| **C** | computed | `#16607F` fill, white letter |
| **S** | spec | 1 px ink outline |
| **R** | reference/code | ink fill, paper letter |
| **E** | estimate | 1 px dashed `#565B66` |

**Rules:**
- Orange text on paper is banned (2.39:1).
- One action color per surface.
- Red means safety only.
- "Won't keep up" is a **dashed** FIT bar, never red.
- The slate-navy family (`#0B1120`, `#0F172A`, `#020617`) is banned as a background.

### 4.3 Typography (Google Fonts via `next/font/google`; two families only; ≤ 120 KB)

```ts
import { Archivo, Martian_Mono } from "next/font/google";
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--ff-archivo", display: "swap" });
export const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--ff-martian", display: "swap", preload: false });
```

- Both are variable fonts: Archivo wght 100–900, wdth 62–125; Martian Mono wght 100–800, wdth 75–112.5.
- Variables are prefixed `--ff-*` so they never collide with Tailwind theme variables.
- `@theme inline { --font-sans: var(--ff-archivo); --font-mono: var(--ff-martian); }`.
- Width is set with `font-variation-settings: "wdth" N` through utilities `.w-62 .w-75 .w-100 .w-112 .w-125`, defined with `@utility`.

| Role | Family / axes | Size | Line / tracking |
|---|---|---|---|
| Hero H1 | Archivo wdth 118, wght 800 | `clamp(2.5rem, 1.3rem + 5vw, 6rem)` | 0.95 / −0.04em (−0.03em mobile) |
| Page H1 | Archivo wdth 112, wght 750 | `clamp(2.1rem, 1.4rem + 2.8vw, 3.75rem)` | 1.0 / −0.03em |
| H2 | Archivo wdth 100, wght 700 | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | 1.1 / −0.02em |
| H3 | Archivo wdth 100, wght 650 | 1.25rem | 1.25 |
| Eyebrow / label / nav / table head | Archivo wdth 75, wght 600, caps | 12–13 px | 1.2 / +0.08em |
| Body | Archivo wdth 100, wght 400 (500 for emphasis) | 17 px desktop / 16 px mobile | 1.6; measure 62–68ch |
| Lead | Archivo wdth 100, wght 400 | 20 px | 1.5 |
| Readout / spec / table numbers | Martian Mono wdth 87.5, wght 400 (500 for results) | 13–15 px | 1.3 |
| Result numbers | Martian Mono wdth 75, wght 500 | `clamp(2.5rem, 1.5rem + 4vw, 5rem)` | 1.0 / −0.02em |
| Units | Martian Mono wght 300, `--text-2`, 0.6em | raised 0.35em | – |
| Grade letter / verdict stamp | Archivo wdth 125, wght 900 | 96–140 px / 48–72 px | 0.9 |

### 4.4 Grid, spacing, radius, shadow, z-index, breakpoints

- **Grid.**
  - 12 columns at ≥1024 px: max content 1392 px, 24 px gutters, 48 px outer margin.
  - 8 columns at 640–1023 px.
  - 4 columns below 640 px, with a **16 px side gutter**. There is never a horizontal page scroll.
  - Exposed rules: a 1 px `--line` at the column-1 and column-12 edges on home and planner, plus section rules.
- **Spacing scale** (4 px base): `4 8 12 16 24 32 48 64 96 128`. Sections are 96/128 px on desktop and 64 px on mobile.
- **Radius:** `0` for panels, tables and plates; `2px` for inputs and chips; `9999px` for filter pills only.
- **Shadow:** exactly one token, `--shadow-result: 0 0 0 1px var(--line), 0 24px 48px -24px #0000001f`, on the planner readout card only.
- **Z-index:**

  | Layer | z |
  |---|--:|
  | header | 40 |
  | sticky CTA | 30 |
  | popover | 50 |
  | menu | 60 |
  | skip-link | 70 |

- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440`.
- **Motion tokens:**
  - `--ease-settle: cubic-bezier(.2,.8,.2,1)`
  - `--ease-stamp: cubic-bezier(.3,1.4,.5,1)`
  - `--ease-shutter: steps(3,end)`
  - durations `120 / 240 / 480 / 900 ms`
- **Focus:** a 2 px Ember ring, offset 2 px, on every interactive element.

### 4.5 Components inventory (path → spec)

**Shell**
- **`components/shell/SiteHeader.tsx`**
  - Behaviour and layout as in §3.1. `position: sticky`. On scroll, a paper background at 96% opacity (no blur).
  - Nav labels never wrap at 1024 px.
  - The active route gets a 2 px Ember underline.
- **`components/shell/SiteFooter.tsx`**, as in §3.1.
- **`components/shell/StickyCta.tsx`**
  - Mobile only; 56 px; Ember fill, ink text.
  - Hidden while `[data-planner]` is in the viewport (IntersectionObserver).
  - Shows `Your garage: 13.0k BTU/h · B →` when the garage store has a code.
- **`components/shell/MobileMenu.tsx`**
  - Full screen, paper.
  - Link groups follow the 4 verbs.
  - Focus is trapped; Esc closes.

**Buttons** (`components/ui/Button.tsx`, `ButtonLink.tsx`)

| Variant | Style |
|---|---|
| `primary` | Ember fill, `#15171C` text, 0 radius, 48 px tall (56 px for hero and planner), Archivo wdth 100 wght 650 16 px; hover `#FF9D42`; active translateY(1px) |
| `secondary` | 1 px ink border, transparent |
| `text` | underline offset 4 px, ends in `→` |
| `buy` | primary + `↗` + `rel="sponsored nofollow noopener"` + `target="_blank"` |

**Button copy always names the action.** Examples: `Size my garage`, `Check price on Amazon ↗`, `Check price at Northern Tool ↗`, `Download CSV`, `Print the Electrician Brief`. Never "Learn more" or "Get started".

**Spec plate** (`components/commerce/SpecPlate.tsx`), modeled on a heater rating nameplate.
- 1 px `--line` border, 0 radius, white.
- **Header:** the class silhouette as a 64×48 thermal glyph, plus a label in Archivo wdth 75 caps (`LAB PICK · MODELED` / `LAB PICK · MEASURED`), plus the mount/voltage (`CEILING · 240 V`).
- **Name:** Archivo wdth 100, wght 700, 20 px.
- **Spec rows** use dotted leaders: `OUTPUT 5,000 W · 17,060 BTU/h [S]` · `CIRCUIT 240 V · 20.8 A → 30 A, 10 AWG [C]` · `FIT ████████░░ 92% of your load` (a dashed bar if under 100%) · `RUN COST $0.96/h at 19.2¢ [C]` · `PRICE CLASS $$ (our range, not a live price)`.
- **Safety line** in `--alarm` with the CO or clearance glyph.
- **Buttons:** primary partner, then Amazon, then the `Paid link` micro-label (11 px mono).
- `Why this fits →` expands the reasoning.
- **No stars, no scores, no Amazon images, no Amazon prices.**

**`VerdictRail`** holds up to 3 plates. Layout:
- desktop: 3 columns;
- tablet: 2 + 1;
- mobile: vertical, with plate 1's top edge within 700 px.

**`MiniSizer`**
- 3 inputs: preset (1/2/3-car), drafts (tight/average/leaky), ZIP.
- It runs `plan()` client-side, re-sorts the plates and fills the FIT bars.
- `Open full planner →` passes the code along.

**`CompareTable`**
- Sticky model column and header row.
- Numbers right-aligned in Martian Mono.
- 2 px Forge in-cell micro-bars scaled to the column max; ▲ marks the column best.
- Each spec has a footnote to the manufacturer PDF. Footer: `Specs checked 2026-10-01 · N sources`.
- Below 640 px it becomes scroll-snap model columns with the label column pinned.

**`Disclosure`** is the exact sentence in §5.3, rendered immediately above the first paid link. **`PaidLabel`** renders `Paid link`. **`Cost`** is the only component allowed to print `$` inside commerce subtrees.

**Evidence** (`components/evidence/`)
- **`<Num v={31742} unit="BTU/h" ev="C" src="planner:qSize" round={100} />`** or **`<Num f="cz220.watts.high" />`** renders the formatted number plus a chip, when `chip` is set.
- **`EvidencePopover`** opens in 120 ms, with no bounce. It shows: source title and link, date checked, formula (C) or instrument (M), and `Report a problem`.
- **`LabLabel`**: the one-line stamp, expandable.
- **`SourceList`**: numbered sources, `[n]` anchors.
- **`RevisionHistory`**
- **`AnswerBlock`**: 40–70 words, `id="answer"`, 1 px left rule in ink.

**Callouts** (`components/ui/Callout.tsx`)

| Variant | Style |
|---|---|
| `safety` | 3 px `--alarm` left bar, glyph, imperative copy, R chips |
| `note` | 3 px `--frost-ink` bar |
| `fix` | 3 px ink bar and a "Fix this →" link |

There are no stacked disclaimers above content, ever.

**Figures** (`components/figures/`)
- **`Figure`** frame: `FIG. n` label in Martian Mono, caption and source line.
- **`ThermalExhibit`**: camera frame, 4:3, corner brackets, HUD, scale bar, spot meter, `MODELED — NOT A PHOTOGRAPH`.
- **`HeatLossBars`**
- **`WarmupCurve`**: model dotted, measured solid.
- **`DisagreementStrip`**
- **`GarageIso`**: parametric isometric SVG. `x' = (x−y)cos30°`, `y' = (x+y)sin30° − z`. Props: `bays`, `attached`, `ceilingFt`, `doorType`.
- **`GarageSection`**
- **`ExplodedGarage`**
- **`ClassSilhouette`**: 14 heater classes, rendered as thermal glyphs.
- **`GradeScale`**
- **`FuelCostBars`**
- **`UsTileMap`**
- **`DieselExhaustDiagram`**
- **`BottomSealProfiles`**: T-style, bulb, J and beaded, with retainer widths.

**Planner widgets** (`components/planner/`)
- `ZipField`: numeric keypad; readout types in at 12 ms/character; reduced motion shows it at once.
- `TapCard`: 1 px border; selected = 2 px ink border plus an Ember corner tick; the U-value in mono.
- `Segmented`: a sliding 1 px indicator, 240 ms settle.
- `Stepper`: hold to repeat, 400 ms then 60 ms.
- `DraftQuiz`
- `LiveBand`
- `StepRail`
- `CaptureReveal`

**Instruments** (`components/instruments/`, each under 8 KB, each ending with `Open the full planner →`)

| Instrument | Lives on | Inputs → outputs |
|---|---|---|
| **Door Leak Meter** | bottom seal, weather stripping | Door width (8/9/16/18 ft), floor gap (1/8–1 in), retainer (T-style, bulb, J, none) → profile and width to buy, air-leak share of load, $/season at your price |
| **Kit Payback Meter** | door kit, how to insulate | Door size and type, ceiling state → ΔBTU/h, $/yr, payback months. States plainly that "a kit alone is ≈6% on a bare, leaky garage" |
| **Circuit Checker** | electric hub, 240 V, portable, ceiling | Outlet/breaker you have → the largest heater it can run, and what a new circuit costs |
| **Fuel Cost Meter** | garage-heaters hub, diesel, electric vs propane | State + hours → $/h for 17,060 BTU/h delivered on each fuel, plus the diesel-vs-electric crossover ¢/kWh (≈21¢ at the current EIA diesel price, recomputed) |

**Capture** (`components/capture/`)
- **`EmailCapture`**: one field, a primary button, the privacy line; states idle / sending / done / fallback.
- **`AlertSignup`**: ZIP plus email.
- **`NotifyMe`**

**Safety** (`components/safety/`)
- `VerdictStamp`
- `ConditionList`
- `SafetyCard`: print, half page.
- `SafetyCallout`
- `RecallStrip`: the last 3 relevant CPSC recalls from a committed snapshot, e.g. "2026-06-04 · Vornado SRTH tower heaters · ≈255,000 units · fire hazard".

### 4.6 Logo and wordmark (SVG-buildable)

**Spot Mark** (`components/brand/SpotMark.tsx`, `app/icon.svg`): sensor corner brackets, with the hot dot **off-centre, lower right**, like a spot meter landing on the leaking door corner.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <path d="M3 11V3h8M21 3h8v8M29 21v8h-8M11 29H3v-8" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/>
  <circle cx="20.5" cy="20.5" r="4.25" fill="var(--dot, #FF8A1F)"/>
</svg>
```

- **Favicon `app/icon.svg`:** the same mark in bone `#F3EFE6` on a `#08090C` rounded-0 square (32×32).
- **`app/apple-icon.tsx`:** 180×180 via `ImageResponse`.
- **In the planner result**, `--dot` takes the Glow → Frost value for the user's grade (A `#FFB547` … F `#3FA7C9`).
- **System rule:** the Ember dot marks **the key value** on every chart: the user's load on FIT bars, the endpoint of a warm-up curve, our band on the Disagreement Strip.
- **Wordmark (`Wordmark.tsx`):** live text `BAYHEAT`, Archivo, `font-variation-settings:"wdth" 125`, weight 800, tracking −0.01em, 20 px in the header. The descriptor `GARAGE CLIMATE LAB` is Martian Mono 500, 10 px, +0.12em, `--text-2`, beside it on desktop and hidden below 400 px.
- **Clear space** is one bracket length. Minimum mark size is 16 px.

### 4.7 OG image template (`lib/og/card.tsx`, `ImageResponse`, 1200×630)

- **Fonts:** committed static TTFs in `assets/fonts/`: `Archivo-ExpandedExtraBold.ttf` (wdth 125, wght 800), `Archivo-Medium.ttf`, `MartianMono-Regular.ttf`, `MartianMono-Medium.ttf`. Read once at module scope. **Not woff2.**
- **Layout:**
  - Camera `#08090C` background.
  - Left 560×420 at (48, 72): the thermal poster PNG for the scenario (`public/thermal/*.png`), inside HUD brackets.
  - Right column x = 648 → 1152:
    - eyebrow in Martian Mono 22 px `#A3A7B0` (e.g. `LAB REPORT BH-001` / `GARAGE HEAT REPORT`);
    - title in Archivo 800, 56–64 px, `#F3EFE6`, at most 3 lines;
    - readout in Martian Mono 500, 40 px, `#FFB547` (e.g. `31,700 → 13,000 BTU/h`);
    - a sub-readout in Martian Mono 24 px `#F3EFE6`.
  - Bottom: a 12 px Forge scale bar across the full width at y = 606, with `0 °F` and `71 °F` labels.
  - Bottom-left: the Spot Mark (40 px) plus `bayheatguide.com` plus the serial or page ID.
- **Variants:** `page` (static, per route), `report` (`/r/[code]`), `verdict` (the GO/NO-GO stamp replaces the readout: `BIG BUDDY · ATTACHED · OVERNIGHT → NO-GO`).
- Every route's `opengraph-image.tsx` calls `card({variant, eyebrow, title, readout, sub, poster})`.

### 4.8 Signature motion moments (each encodes heat, time, load, evidence or state)

| # | Moment | Implementation | Reduced motion / save-data |
|---|---|---|---|
| 1 | **Live thermal field** (hero, planner, exhibits) | `ThermalField` client canvas: a 160×120 `Float32Array`; 4 Jacobi iterations per frame; `T += 0.2·Σk(Tj−Ti) + q`; a 256-entry `Uint32Array` LUT from `lib/thermal/ramp.ts` (OKLab); `putImageData`; CSS upscaling. Mounts on `requestIdleCallback`, over a pre-baked about 10 KB PNG poster. 30 fps on `pointer: coarse`. Pauses off-screen (IntersectionObserver) and on `visibilitychange`. Spot meter follows the pointer, arrow keys in keyboard mode, `aria-live` on keyup. Under 6 KB gzipped. | The static poster for the current chip state |
| 2 | **ZIP re-light** | On the 5th digit, the frame's `T_out` animates to the station's h99 over 900 ms. The Martian Mono readout types in. | Instant swap |
| 3 | **Shrinking Heater** (hero chips and Fix-First) | Each chip re-parameterizes conductances. The field cools at the leaks over about 1.5 s. The load number settles. The grade letter crossfades. The pinned spec plate morphs through `import { ViewTransition } from 'react'` (`<ViewTransition name="heater-plate">`, wrapper in `page.tsx`) from `10 kW · 60 A · 6 AWG` to `5 kW · 30 A · 10 AWG`. The Ember band on the Disagreement Strip slides in sync. | A cut to the final state |
| 4 | **Disagreement drop** | On first view, the 7 source marks drop onto the 0–55,000 BTU/h axis in publication order (60 ms stagger, 240 ms each). Our band draws last, low edge to high edge. | Final state |
| 5 | **Capture** (planner result, ≤ 1.2 s) | A 3-frame white-noise shutter at 80×60 (`steps(3)`, 0–180 ms), then a radial develop wipe from greyscale to thermal (`clip-path: circle()` from the heater position, 180–700 ms), then **Settle**: numbers count with a critically damped spring (1.5% overshoot), and only final values go to `aria-live`. Then heat-loss bars fill largest-first (500–1,100 ms), then up to 3 plates slide 12 px up with a 60 ms stagger (800–1,200 ms). **Door Rise** (brand-first graft) opens the capture: the SVG door hinges up in 4 panels over 480 ms above the poster. | Instant render, with the door already open |
| 6 | **Verdict stamp** | Scale 1.25 → 1 in 180 ms with `--ease-stamp`, plus a 2% SVG `feTurbulence`/`feDisplacementMap` ink edge | A cut |
| 7 | **Time-lapse** | The warm-up curve draws in 1.2 s (`stroke-dashoffset`) while a Martian Mono clock ticks the modeled minutes (`00:00 → 01:56`) | Final state |
| 8 | **Where heat goes** (home §02) | A sticky isometric garage explodes into layers (`translateZ` 0 → 40/80/120 px) under `@supports (animation-timeline: view())`, while a stacked bar fills. **The default is the finished state.** | Final state |
| 9 | **Share morph** | The result card morphs into the share sheet (`<ViewTransition name="result-card" share="morph">`) | A 120 ms opacity change |

Banned: fade-up on every section, parallax, marquees, typewriter headlines (except the ZIP readout, which is data), cursor trails, scroll-jacking and carousels.

### 4.9 Home page (`/`), section by section

1. **Hero.**
   - **Desktop (1440×900):**
     - Left, columns 1–6, paper:
       - Eyebrow (Martian Mono 12 px): `LAB REPORT BH-001 · THE 4× PROBLEM`.
       - **H1:** "One garage. Seven answers. 10,200 to 40,300 BTU/h."
       - Sub (17 px, 46ch): "Rules of thumb can't see your garage. Our open model can: a ZIP and five taps give you the heat load, the heater that fits, the breaker it needs, the cost per hour and the warm-up time, with every formula shown."
       - **ZIP field plus `Size my garage — 60 s`** (56 px).
       - A text link, `Read the math →`.
       - The **Disagreement Strip**, 96 px.
     - Right, columns 7–12, bleeding to the edge: the **FIG. 1 camera exhibit** (4:3).
       - HUD: `BAYHEAT IR · MODELED · 160×120` · `24×24×9 FT · ATTACHED · OUT 3.3 °F · IN 55 °F` · scale bar `71 °F / 0 °F` · spot meter.
       - A **spec plate pinned lower right** of the frame.
       - Chips under the frame: `As-is 31,700 · D` · `+ Seals & door kit 22,600 · C` · `+ R-30 ceiling 13,000 · B` · `Bare & leaky 48,400 · F`.
       - The chips drive the field, the plate morph and the Ember band on the strip.
       - Every number comes from `lib/home/hero-states.ts`, which calls `plan()` at build time.
   - **Mobile (390×844):** eyebrow, then the H1 (40 px, ≤ 4 lines; **the LCP element**), then the ZIP and CTA, then the exhibit full-bleed with the chips scrolling horizontally, then the strip as a vertical dot plot.
   - **Proof strip:** `SOURCES: ASHRAE 2021 DESIGN TEMPS · EIA STATE PRICES · NEC 210.23 / 424.4 · IFGC 305.3 / 621 · NFPA 58 · UL 2034` in mono, not logos.
2. **`02 / WHERE YOUR HEAT GOES`**: the exploded garage and stacked bar for example A.
3. **`03 / CAN I RUN IT?`**: three live, answerable questions with stamps:
   - "Big Buddy, attached garage, overnight?" → `NO-GO`
   - "5 kW heater on a spare 240 V/30 A?" → `GO`
   - "Diesel heater, exhaust outside, CO alarm?" → `GO — IF 3 CONDITIONS`

   Then the `Check my heater` button.
4. **`04 / THE GARAGE HEAT INDEX`**: the tile map, the US median and the top/bottom 3 states, `Download CSV`.
5. **`05 / FROM THE LAB`**: the test board (P-002…P-005 with model predictions, and status stamps).
6. **`06 / RECALL WATCH`**: `RecallStrip`.
7. **`07 / HOW WE WORK`**: the 7 pledges as numbered spec rows, and the evidence legend.

Numbered `0N /` rails are used on home and planner sections only.

### 4.10 Anti-slop rules (CI grep in `scripts/anti-slop.ts` plus design-QA review)

1. No indigo, violet or purple (`#4F46E5`–`#8B5CF6`), no mesh or aurora, no decorative gradients. The only gradients are temperature ramps and the labeled grade scale.
2. No Inter, Poppins, Montserrat, Space Grotesk or Geist. Two families, maximum.
3. No 3-card icon feature rows and no bento (unless every cell holds live data).
4. No emoji. The only symbols allowed are `→ ↗ ▲ ■ □ × ± ° ·`.
5. Left-aligned on a visible 12-column grid. At most one centered block per page: the verdict stamp.
6. Every headline carries a number, a garage noun or a decision. There is no "Learn more", "Get started", "Unlock", "Elevate", "Seamless" or "reimagined".
7. No fake trust: no stars, testimonials, user counters, stock or AI photos, invented people or "As seen on" logos. Census and subscriber counts are real counts or nothing.
8. No `rounded-2xl`, `shadow-lg`, `backdrop-blur` or glassmorphism. Radii are 0, 2 px or pill. One shadow token.
9. One action color per surface. Red is for safety only.
10. No decorative motion (§4.8).
11. The slate-navy backgrounds `#0B1120`, `#0F172A`, `#020617` are banned.
12. `0N /` eyebrows appear only on numbered section rails.
13. At most **5 sub-brands**: BayHeat Planner, Can I Run It?, Garage Heat Index, Lab Reports, Heat Report Pro.
14. Every hero and H1 number is computed at build time from `lib/planner` or `lib/facts`. Round placeholder numbers ("10x", "99%") are banned.
15. No `m.media-amazon.com` or `images-amazon.com` image hosts.

The grep list includes: `from-indigo`, `from-purple`, `via-violet`, `rounded-2xl`, `rounded-3xl`, `shadow-lg`, `shadow-xl`, `backdrop-blur`, `Inter(`, `Poppins`, `Geist`, `Learn more`, `Get started`, `AI-powered`, and the emoji Unicode ranges.

---

## 5. Content, voice, editorial and safety standards

### 5.1 Voice: the lab tech explaining a result to a neighbour

- **Lead with the number and its condition.** "A 5 kW heater needs a 30 A breaker and 10 AWG copper. A 4 kW one doesn't fit a 20 A circuit either."
- **Verdict first:** the H1 plus the first 60 words contain a number, a product class and a circuit or fuel requirement.
- **Be contrarian when the data says so.** "The cheap diesel heater costs more per hour than electric below about 21¢/kWh." (Computed live from the EIA diesel price, with an as-of date, because the line flips if diesel falls toward $4.) "A door kit alone barely helps a garage with a bare ceiling. Do the ceiling first."
- **Admit uncertainty with a number.** "Between 26,000 and 41,000 BTU/h until you tell us about the ceiling."
- **Safety copy is imperative and calm.** "Install a UL 2034 CO alarm in the garage and one in the house by the garage door." Never fear-mongering, never buried.
- **Buy this, not that:** every money page names at least one thing not to buy, and why.
- **"Nothing to do tonight"** is a valid, frequent answer in alerts. At most one dry line per page, and never near safety copy.
- **Reading level:** grade 8. Sentences ≤ 22 words. Tables do the heavy lifting.
- **Units always paired:** `31,700 BTU/h (9.3 kW)`.
- **Rounding:** BTU/h to the nearest 100, kW to 0.1, dollars whole or cents under $10.

### 5.2 Hard rules (enforced by the Standards Editor agent and CI)

| Rule | Detail |
|---|---|
| **Numbers** | Every decision-driving number comes from `lib/planner` or `lib/facts` via `<Num>`, carrying an evidence mark and a source. No retyped circuit figures: the drift lint fails on the literals `20.9`, `20.8 A`, `10 AWG`, `1,440 W`, `17,060`, `12.5 A` outside `lib/`. |
| **Banned words** | "tested", "hands-on", "we tried", "measured" without a published M-backed log. "best-in-class", "game-changer", "ultimate", "top-rated", "#1", "look no further", "cozy", "in today's world", "elevate", "seamless", "unleash". "(Month Year)" in titles unless the page changed that month. "I spent X months". "boring". "we will not" litanies. |
| **Codes** | Cite the section: NEC 210.23(A)(1), 424.4(B), 210.8(A), 210.11(C)(4), 220.83, 240.4(D), 310.16; IFGC 305.3, 621; IRC R315, R302.5.2, G2408.2; NFPA 58, 54; UL 2034, 1278. Add "Your electrician and your local code edition govern." |
| **Manuals** | The manufacturer manual beats any rule of thumb. Quote it with an S mark and link the PDF. Carry the known corrections: DR-975 back wall 4.5 in; FUH54 $468–500 (class `$$$`); CZ220 "not where gasoline, paint, or flammable liquids are used or stored"; CZ220 max effective ceiling height 8 ft; FUH54 on 208 V ≈ 3,755 W. |
| **Competitors** | Name them only to quote a published claim, with link and retrieval date, and no adjectives. Offer a right of reply. When they update, we update and log it. |
| **FAQ** | Only questions found in keyword or PAA data. No expectation of FAQ rich results (removed 2026-05-07). |
| **Schema** | `Organization`, `WebSite`, `Person` (only when `NEXT_PUBLIC_EDITOR_NAME` is set), `WebApplication` (planner, Can I Run It?; no rating), `Article` (`datePublished` ≠ `dateModified`; `citation`), `Dataset`, `ItemList`, `BreadcrumbList`. **Never** `Product`, `Review` or `AggregateRating`. |
| **People** | Never invent a human. The byline is `NEXT_PUBLIC_EDITOR_NAME`, or "BayHeat editorial desk" until it is set. Reviewers come from `NEXT_PUBLIC_REVIEWERS` (name, license #, state, date verified on the state board). |
| **Scaled pages** | The growth-playbook §2.5 uniqueness gate: ≥ 8 differing data points, ≥ 1 differing computed visual, a different recommendation, ≥ 150 words of state-specific commentary, an editor stamp, and a human-reviewed 10% sample. |

### 5.3 Disclosure and legal copy (exact strings; they live in `lib/site.ts` and nowhere else)

- **Above the first paid link** (`DISCLOSURE_INLINE`):
  > "Paid links: we earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases."
- **Footer** (`DISCLOSURE_FOOTER`):
  > "BayHeat is published by Laqaer Products. As an Amazon Associate, BayHeat earns from qualifying purchases. Links to other retailers may also pay us. Money never changes our math, our picks or a verdict. How we make money →"
- **Micro-label** on each paid button: `Paid link`.
- **Lead block label:** `Sponsored: quotes from a partner network`.
- **Point-of-risk line** (`SAFETY_SCOPE`):
  > "General information. Your electrician, gas fitter, local code and the heater's manual govern."
- **AI line** (in the Lab stamp expansion and on `/how-we-work`):
  > "Drafted with AI assistance. Every number is computed or sourced; a named editor checks each page; licensed reviewers check electrical and gas rules."
- **Email footer:** the Laqaer Products postal address (`NEXT_PUBLIC_POSTAL_ADDRESS`), plus an unsubscribe link (CAN-SPAM).

### 5.4 The seven public pledges (on `/how-we-work` and home §07)

1. We never claim a test we didn't run. "Measured" means a published log, an instrument and a receipt.
2. We buy every unit we rate, at retail, and post the receipt. Samples are labeled `SAMPLE` and are never the basis of a verdict.
3. No money changes a result, a ranking, a verdict or a model constant. Sponsors, when they exist, never touch the planner, the Index, reports or picks.
4. No display ads in year 1, and never on the planner, the reports, safety pages or money pages.
5. We publish "Don't buy" verdicts, negative results and our model's misses.
6. We correct within 72 h, or 24 h for safety. Every change goes into `/lab/notebook`.
7. We show how every page is made: model version, sources, AI assistance, and who checked it.

### 5.5 Amazon Operating Agreement constraints (build-enforced by `scripts/check-affiliates.ts`)

- **No Amazon prices or star ratings.** Those are only allowed through the Creators API, which needs 10 qualifying sales in the trailing 30 days (PA-API 5 was retired 2026-05-15). We show our own price **class** (`$`–`$$$$`) with "our range, not a live price", and never a dollar amount on a plate.
- **No Amazon images, and no caching or hosting of them.** We use our class silhouettes.
- **Direct links only.** `https://www.amazon.com/dp/{ASIN}?tag={tag}` for the 5 verified ASINs; `https://www.amazon.com/s?k={query}&tag={tag}` otherwise. No `/go/` redirects, no shorteners, no cloaking. Clicks are tracked with a client event only.
- **Never invent an ASIN.** `products.ts` rejects any `asin` not in `VERIFIED_ASINS`. That list grows only through an owner-verified SiteStripe PR.
- **No Amazon links in print, PDF, Heat Report Pro, the Safety Card or the Electrician Brief.** A test enforces it.
- **Email Amazon links go only to double-opt-in subscribers**, using the mail tracking ID.
- **The Amazon sentence** appears in the footer site-wide and near the first link on each commercial page.
- **Every social profile and domain that carries Amazon links** is listed in Associates Central (owner).
- **The `laqaer-20` 3-sales-in-180-days status** is confirmed by the owner on day 1.
- **The 2026-04-14 original-content rule** is met because every commercial page carries our computed analysis.
- **Other networks:** show a price only where that network's terms allow it, with a timestamp [VERIFY per program]. In v1: no prices anywhere.

### 5.6 Editorial and safety workflow

- Each content page is marked `reviewed: 'electrical' | 'gas' | null` in the page registry.
  - Electrical and gas pages show a technical-review line only once a real reviewer has signed.
  - Until then, the Lab stamp expansion says "Technical review: not yet reviewed by a licensed electrician (scheduled)".
- **Physical tests:**
  - protocols reviewed by a licensed tech;
  - run in a detached garage, or one attached to an unoccupied house, never where people sleep;
  - combustion tests with the tester outside and logging remotely; **abort at 30 ppm CO for 1 minute or on any alarm**;
  - ABC extinguisher on site;
  - manuals followed exactly;
  - **no torpedo heaters indoors, ever**;
  - the owner confirms liability coverage [VERIFY].
- **Corrections:**
  - "Report a problem" (`CORRECTIONS_ENDPOINT`, falling back to `mailto:`) sits on every Lab stamp and popover;
  - acknowledge within 24 h; fix within 72 h, or 24 h for safety;
  - log it in `/lab/notebook`.

---
## 6. Monetization architecture

### 6.1 Streams: where each one appears

| # | Stream | Where it appears | Live in v1? | Modeled? |
|---|---|---|---|---|
| 1 | **Web affiliate**: Amazon `laqaer-20` plus routed partners | Planner plates and fix rows; the Verdict Rail on V pages; Can I Run It? safe alternatives and CO alarms; instruments' "buy the part" rows | Yes (Amazon). Partners are env-gated and fall back to Amazon. | Yes |
| 2 | **Email affiliate** | Welcome sequence (email 4 is the shortlist), Cold Snap alerts (**one** Fix Ticket product each), monthly Index, Black Friday / Cyber Monday. Uses the `_MAIL` tag. | Capture yes; sends from week 2 | Yes |
| 3 | **Heat Report Pro** $14 → $19 | Result "Keep it" card; `/heat-report-pro`; the Brief print dialog; welcome email 5 | Page and unlock yes; checkout env | Yes (≤ 0.2% of sessions) |
| 4 | **Amazon cart** (Fix-First kit) | The Fix-First card only | Dark until ≥ 2 verified ASINs | No (upside) |
| 5 | **Installer leads** | Circuit card (planner), `/240v-garage-heater`, `/garage-heater-installation-cost` (v1.1), `/natural-gas-garage-heater` (v1.1). Labeled "Sponsored". **Never inside safety content.** | Slot yes; `LEADS_PROVIDER` env; fallback is the free Brief | $0 until a partner signs |
| 6 | Newsletter sponsorship | Monthly Index email only; categories we don't rate (storage, flooring, lighting, openers) | No | $0 until signed |
| 7 | Contractor Pro embed | v2 | No | $0 |
| – | **Not in year 1** | Display ads, Test Fund, "certified by" badges (never), paid placements in rankings (never) | – | – |

### 6.2 Partner routing (`lib/commerce/route.ts`)

`route(product, surface)` returns `BuyLink[]`: a primary, a secondary and an optional also-at.

- **The primary is the highest-EPC partner that stocks the class**, according to the table below (re-ranked monthly by the Commerce Desk using measured EPC).
- **Amazon is always present**, either as the primary or as the second button.
- **A partner whose env var is missing drops out.** Amazon backfills it.

| Class | Primary (when env present) | Secondary | Cookie / rate (monetization.md §2) |
|---|---|---|---|
| Diesel air heaters, exhaust kits | VEVOR via Awin (`awinmid=28831`) / Hcalory | Amazon search | 30-day, 2–10% |
| Vented gas unit heaters (Big Maxx, Hot Dawg, Reznor) | Northern Tool via CJ | Amazon search | 30-day, 3%; EPC ≈ $0.77 |
| Mini-splits | HVACDirect / Got Ductless / Pioneer | Amazon search | 30-day 5% / 3% / 14-day 2% |
| Dehumidifiers (2027) | Sylvane | Amazon | 30-day 6% |
| Door kits, insulation | Amazon | Home Depot (Impact) | 24 h |
| Electric heaters (5 verified ASINs), seals, CO alarms, thermostats | Amazon `/dp/` (verified) or search | Home Depot / Walmart (Impact) | 24 h, 3% (4.5% for diesel listed under Automotive) |

**Link formats** (built only in `lib/commerce/partners.ts`):

```
amazon:   https://www.amazon.com/dp/{ASIN}?tag={tag}   |   https://www.amazon.com/s?k={encodeURIComponent(q)}&tag={tag}
awin:     https://www.awin1.com/cread.php?awinmid={MID}&awinaffid={NEXT_PUBLIC_AWIN_AFFID}&ued={encodeURIComponent(url)}
cj:       https://www.anrdoezrs.net/click-{NEXT_PUBLIC_CJ_PID}-{NEXT_PUBLIC_CJ_AID_NORTHERNTOOL}?url={encodeURIComponent(url)}   [VERIFY host in CJ Link Generator]
impact:   {NEXT_PUBLIC_HOMEDEPOT_LINK_BASE}?u={encodeURIComponent(url)}   (same for WALMART / LOWES)
direct:   {url}{?|&}{NEXT_PUBLIC_HVACDIRECT_REF | _GOTDUCTLESS_REF | _PIONEER_REF | _SYLVANE_LINK_BASE | _HCALORY_REF}
cart:     https://www.amazon.com/gp/aws/cart/add.html?AssociateTag={tag}&ASIN.1={a}&Quantity.1=1&ASIN.2={b}&Quantity.2=1…   (verified ASINs only, ≥ 2)
```

Every anchor gets:
- `rel="sponsored nofollow noopener"`;
- `target="_blank"`;
- `data-partner`, `data-product`, `data-class`, `data-slot`, `data-surface`.

`onClick` calls `track('affiliate_click', …)` via `navigator.sendBeacon`. **No redirect.**

### 6.3 Environment variables: exact names and fallbacks

Every variable is read only through `lib/env.ts` (typed getters). **With zero env vars set, the site is fully usable: no dead buttons, and every fallback is visible and honest.**

| Variable | Scope | Used for | Fallback when unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | all absolute URLs, canonical, OG | `https://bayheatguide.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public | footer, mailto fallbacks | `hello@bayheatguide.com` |
| `NEXT_PUBLIC_POSTAL_ADDRESS` | public | footer, email compliance | Line omitted. Email capture still works (Kit enforces an address before sending). |
| `NEXT_PUBLIC_EDITOR_NAME`, `NEXT_PUBLIC_EDITOR_URL` | public | byline, `Person` schema | "BayHeat editorial desk"; no `Person` schema |
| `NEXT_PUBLIC_REVIEWERS` | public | JSON `[{name, role, license, state, verified}]` | "Technical review: scheduled" (expansion only) |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE`, `_PINTEREST`, `_REDDIT`, `_INSTAGRAM`, `_TIKTOK`, `_FACEBOOK` | public | `sameAs`, footer | Omitted |
| `NEXT_PUBLIC_AMAZON_TAG` | public | default Amazon tag | `laqaer-20` |
| `NEXT_PUBLIC_AMAZON_TAG_PLANNER`, `_CART`, `_MAIL`, `_SAFETY` | public | per-surface tracking IDs (suggested `bayheat-plan-20`, `bayheat-cart-20`, `bayheat-mail-20`, `bayheat-safe-20` [VERIFY availability]) | `NEXT_PUBLIC_AMAZON_TAG`, then `laqaer-20` |
| `NEXT_PUBLIC_HOMEDEPOT_LINK_BASE`, `NEXT_PUBLIC_WALMART_LINK_BASE`, `NEXT_PUBLIC_LOWES_LINK_BASE` | public | Impact deep links | Button hidden; Amazon remains |
| `NEXT_PUBLIC_CJ_PID`, `NEXT_PUBLIC_CJ_AID_NORTHERNTOOL` | public | Northern Tool | Amazon search |
| `NEXT_PUBLIC_AWIN_AFFID` (+ Hcalory MID constant, TBD) | public | VEVOR 28831, Hcalory | Amazon search |
| `NEXT_PUBLIC_HCALORY_REF`, `NEXT_PUBLIC_HVACDIRECT_REF`, `NEXT_PUBLIC_GOTDUCTLESS_REF`, `NEXT_PUBLIC_PIONEER_REF`, `NEXT_PUBLIC_DELLA_REF`, `NEXT_PUBLIC_SYLVANE_LINK_BASE` | public | direct programs | Amazon search |
| `NEXT_PUBLIC_CHECKOUT_URL_PRO` | public | Heat Report Pro hosted checkout (Polar) | `Notify me` (EmailCapture, tag `pro-waitlist`) |
| `PRO_UNLOCK_SECRET` | server | HMAC for `/api/pro/verify` and `scripts/pro-token.ts` | Pages 1–2 of the sample only |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ORGANIZATION_ID` | server | v1.1 automatic fulfillment | Manual token email |
| `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_TAG_IDS` (JSON) | server | email capture and tags | `Copy link` plus `mailto:`; alert box hidden |
| `LEADS_PROVIDER` (`networx` \| `modernize` \| `hdservices` \| unset), `NEXT_PUBLIC_NETWORX_FORM_URL`, `NEXT_PUBLIC_HDSERVICES_LINK_BASE`, `NEXT_PUBLIC_CALL_NUMBER_ELECTRICAL`, `NEXT_PUBLIC_CALL_NUMBER_HVAC` | mixed | installer quotes | The free Electrician Brief |
| `CENSUS_ENDPOINT`, `CORRECTIONS_ENDPOINT` | server | webhooks (Apps Script / Formspree / Supabase later) for warm-up reports and corrections | CSV download plus pre-filled `mailto:` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA4_ID` | public | analytics | `track()` is a no-op |
| `INDEXNOW_KEY` | server | IndexNow ping script (agent) | Skipped |
| `EIA_API_KEY` | agent/CI | price refresh | Committed `lib/planner/prices.ts` snapshot |
| `NWS_USER_AGENT`, `CRON_SECRET` | agent | Cold Snap check | Alerts are not sent |
| `GSC_SITE_URL`, `GSC_SERVICE_ACCOUNT_JSON_B64` | agent | GSC pulls | Owner exports manually |
| `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_IDS` | agent | pin scheduling | Human uploads |
| `ADS_PROVIDER` | server | reserved | `none` (and no ads in year 1) |

### 6.4 Instrumentation (`lib/track.ts`; no PII; ZIP3 only)

| Event | Properties |
|---|---|
| `planner_start` | `entry` (hero/header/page/embed/r) |
| `planner_step` | `step`, `unknowns` |
| `planner_complete` | `preset`, `attached`, `grade`, `useCase`, `zone`, `band_width_pct` |
| `fix_toggle` | `measure`, `on` |
| `share` | `method` (copy/image/webshare) |
| `affiliate_click` | `partner`, `product`, `class`, `slot`, `surface`, `page`, `position` |
| `cart_click` | `items` |
| `email_submit` | `source`, `mode` (kit/fallback) |
| `pro_click` | – |
| `pro_unlock` | – |
| `verdict_view` | `heater`, `verdict` |
| `safety_card_print` | – |
| `brief_print` | – |
| `csv_download` | – |
| `embed_view` | `host` |
| `warmup_report` | – |
| `lead_click` | `vertical` |

**Monthly EPC** per partner × class = network earnings ÷ `affiliate_click`. The Commerce Desk re-ranks primaries monthly.

### 6.5 Revenue model: hard lines only (script: `scratchpad/blueprint/model.py`; the Ops Analyst ports it to `scripts/revenue-model.ts` in week 2)

**Hard lines are counted:**
- web affiliate: CTR × EPC × season (Nov 1.2, Dec 1.3, Jan 1.25, Mar–Apr 0.8, Jun–Jul 1.1–1.15);
- email affiliate: capture % × $/sub/mo, ×1.5 Nov–Feb, 1%/mo churn;
- Heat Report Pro: net of Polar's 5% + $0.50.

Leads, sponsors, display, Test Fund and embeds are all **$0**.

**Costs** are stage-gated (§6.6):
- $31/mo fixed;
- reviewers paid per page (electrical and gas only);
- the phase-1 lab kit, $1,050 in October;
- consumables of $60/mo from October to December;
- a $200 paid-search learning budget;
- the phase-2 kit, $700 in January, **only if December gross is at least $500**.

| Scenario | Sessions (12 mo) | CTR × EPC | Email capture / $ per sub | Pro conversion |
|---|--:|---|---|---|
| Conservative | 33.6k | 11% × $0.20 | 1.5% / $0.06 | 0.05% |
| **Base** | **125.5k** (matches the research ramp) | **17% × $0.25** | **2.5% / $0.12** | **0.10%** |
| Upside | 352.5k | 21% × $0.30 | 3.2% / $0.17 | 0.20% |

**Base case, by month [MODEL]:**

| Month | Sessions | Subs (end) | Web aff. | Email aff. | Pro | **Gross** | Costs | Net | Cum. net |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Oct-26 | 1,000 | 25 | $42 | $3 | $0 | **$46** | $2,341 | −$2,296 | −$2,296 |
| Nov-26 | 5,000 | 150 | $255 | $27 | $64 | **$346** | $691 | −$345 | −$2,641 |
| Dec-26 | 11,000 | 423 | $608 | $76 | $167 | **$851** | $391 | $460 | −$2,181 |
| Jan-27 | 14,000 | 769 | $744 | $138 | $246 | **$1,128** | $931 | $197 | −$1,984 |
| Feb-27 | 9,000 | 986 | $382 | $178 | $158 | **$718** | $231 | $487 | −$1,497 |
| Mar-27 | 6,500 | 1,139 | $221 | $137 | $114 | **$472** | $231 | $241 | −$1,256 |
| Apr-27 | 6,000 | 1,278 | $204 | $153 | $105 | **$463** | $231 | $232 | −$1,024 |
| May-27 | 9,000 | 1,490 | $363 | $179 | $158 | **$700** | $231 | $469 | −$555 |
| Jun-27 | 14,000 | 1,825 | $654 | $219 | $246 | **$1,119** | $331 | $788 | $233 |
| Jul-27 | 18,000 | 2,257 | $880 | $271 | $316 | **$1,466** | $331 | $1,135 | $1,368 |
| Aug-27 | 15,000 | 2,609 | $669 | $313 | $263 | **$1,246** | $231 | $1,015 | $2,383 |
| Sep-27 | 17,000 | 3,008 | $722 | $361 | $298 | **$1,382** | $431 | $951 | $3,334 |
| **12 mo** | **125,500** | 3,008 | $5,746 | $2,055 | $2,135 | **$9,936** | $6,602 | **$3,334** | |

- **Base:** $9.9k gross; $3.3k net; December gross $851; September 2027 run-rate $1.38k/mo; $79 per 1,000 sessions. The old $300/mo-net-by-Dec-31 goal is met: December net is $460.
- **Conservative:** $1.26k gross; −$2.7k net (the owner funds phase 1; phase 2 is never released).
- **Upside:** $46.2k gross; $39.6k net; December $3.7k; September 2027 run-rate $6.7k/mo.
- **Upside above base** (uncounted): signed leads (the install-cost CPC is $18.01), sponsors from April 2027 at ≥ 15k sessions or ≥ 2,500 subscribers, and the Amazon cart's 89-day credit on multi-item fixes.
- **Cash timing:** cash lands 60–90 days after accrual, so December earnings arrive in Feb–Mar 2027.

### 6.6 Stage gates and spend rules (the Ops Analyst enforces them; the owner approves)

| Gate | Spend released | Condition |
|---|---|---|
| G0 (Sep 28) | Fixed costs ≤ $31/mo (Vercel Pro $20, Plausible $9, domain); reviewers at $75–150 **per page**, for electrical and gas money pages only | – |
| G1 (Oct 5) | **Phase-1 lab kit ≈ $1,050**: Aranet4 ($199), 6× Inkbird IBS-TH2 ($96), a Forensics Detectors CO meter ($100), 2 UL 2034 alarms with display ($60), 2× CZ798 on separate circuits with 2 plug-in kWh meters ($150), a door kit plus weatherstrip package ($245), a VEVOR-class diesel heater plus exhaust kit ($180), dry ice ($30). Buy at retail and post the receipts. | Owner confirms liability coverage |
| G2 (Oct 12–25) | **$200 paid-search learning budget.** Microsoft plus Google, exact and phrase on `garage heater calculator` ($0.18), `garage btu calculator` ($0.12) and `garage heater size calculator` ($0.25). Lands on the planner, never on Amazon. | **Kill at 7 days** if estimated ROAS < 1.3, where est. revenue = `affiliate_click` × $0.25 + `email_submit` × $1.50 |
| G3 (Jan 4) | **Phase-2 kit ≈ $700**: TOPDON TC001 thermal camera ($199), CZ220 on a 240 V/30 A circuit (the electrician is the owner's cost), Big Buddy, Emporia Vue 3 ($149). Runs BH-004 and BH-005. | **December gross ≥ $500** |
| G4 (Jan 15) | Reviewer retainer, creators ($1,500), sponsorship sales | December gross ≥ $500 **and** January MTD pace ≥ base |
| Always | Every `[MODEL]` number is replaced with measured values by 2027-01-15 | – |

---

## 7. Growth plan

### 7.1 The flywheel

```
Open model + BH-001 + Index CSV + Can I Run It? Safety Card + pre-registered tests
  → cited by journalists, fire departments, Redditors, LLMs (links + AI citations)
  → rankings on seal / calculator / diesel / propane-safety / electric clusters
  → planner completions → shared reports, subscribers, calibration reports
  → measured reports + calibrated model v1.x → more to cite → (loop)
```

**AI-citation operations:**
- robots allows AI crawlers; `llms.txt`;
- 40–70 word answer blocks with numbers and stable anchors (`#circuit-5kw`, `#answer`);
- `Dataset` schema;
- IndexNow plus Bing Webmaster Tools on deploy;
- the GSC Generative AI report;
- a fixed **25-prompt citation panel** run monthly (list in `.claude/skills/ai-panel/prompts.md`).

### 7.2 12-week launch calendar (Mon 2026-09-28 → Sun 2026-12-20)

**[A]** = agent end to end · **[A→H]** = agent drafts, human approves or posts · **[H]** = human only

| Wk | Dates | Ship | Lab | PR / community / email | Human | Milestone |
|---:|---|---|---|---|---|---|
| 1 | Sep 28–Oct 4 | [A] **v1 live by Fri Oct 2** (§3.3, 27 indexable routes + 9 × 308). Sitemap, IndexNow, llms.txt. [A] Welcome sequence written. | [A] Draft protocols P-002…P-005 | [A→H] 5 Reddit comments a day, **no links** (karma) | [H] Owner checklist P0 (§8.5). GSC request-indexing for the 10 priority URLs. Bing WMT. Post the licensed-electrician gig. | 27 routes live; 10 submitted |
| 2 | Oct 5–11 | [A] natural gas, Big Maxx comparison (Oct 5); shop heater, most efficient, Buddy verdict (Oct 8). October Prime event page if dated [VERIFY]: "What's worth buying for your garage", no prices. | [H] **Buy the phase-1 kit** (G1). [A] **Publish pre-registered protocols Fri Oct 9** in `/lab` and the notebook. [H] 7-night free-float baseline (Inkbird). | [A→H] Denver first freeze ≈ Oct 8: Colorado pitch using Index numbers. [A] Welcome sequence on (after [H] approval). | [H] Kit + DNS, PO box, Polar, Awin / CJ / Impact / HVACDirect applications. Verify ~25 ASINs with SiteStripe. | 32 routes; first subscriber |
| 3 | Oct 12–18 | [A] best garage heater, kerosene verdict (Oct 13); torpedo verdict, ventless (Oct 15). Cart button on if ≥ 2 verified ASINs. | [A] Baseline analysis: free-float vs model (notebook entry) | [A→H] **PR wave 1** (MN, WI, ND, SD, MI, ME, VT, NH, AK, MT, WY, CO): 60 pitches. Minneapolis first freeze ≈ Oct 18. [H] **Show HN**: "A garage heater calculator that shows every formula and grades every number by evidence". [A] Cold Snap cron in shadow mode. | [H] Qwoted, Featured, SOS sign-ups; send pitches. **G2 paid search on.** | Index cited by ≥ 3 outlets or blogs |
| 4 | Oct 19–25 | [A] fridge heater kit, keep above freezing (Oct 20); install cost (Oct 22). **Index update after EIA's ≈ Oct 23 release.** | [H] **BH-002 "before" nights** (co-heating plus CO₂ decay) | [H] **r/dataisbeautiful [OC]**, the state tile map. [A→H] Pins at 5 a day. [A] **Cold Snap alerts live** for zones 6–7 (the first send needs human approval). | [H] Sign the first licensed reviewer; stamps go live on 240 V pages. G2 kill/keep decision. | ≥ 20 of 27 launch pages indexed |
| 5 | Oct 26–Nov 1 | [A] mini-split, R-value (Oct 27); unheated-garage temps, `/embed` + compact widget (Oct 29). Seasonal refresh of prices and dates. | [H] **BH-002 "after" nights** (kit plus weatherstrip installed) | [A→H] PR wave 2 (IL, IN, OH, PA, NY, MA, CT, RI, NJ). Chicago first freeze ≈ Oct 28. DST ends Nov 1: "winter workshop" Shorts. [A] First monthly Index email (Tue Nov 3, drafted). | [H] Upload 3 Shorts | 150k GSC impressions/mo run-rate |
| 6 | Nov 2–8 | [A] diesel install, Recall Watch, cheapest way (Nov 3); garage gym (Nov 5). | [A] **Publish BH-002 (Fri Nov 6)**, the first M marks: model vs measured | [A→H] Pitch BH-002 to Family Handyman, Bob Vila, Lifehacker, This Old House. [A] Index email Nov 3. | [H] Review BH-002 before publishing | First measured report |
| 7 | Nov 9–15 | [A] thermostat; **state batch 1** (10 coldest, `noindex` until they pass the gate) (Nov 10); first-garage-freeze dataset (Nov 12). | [H] **BH-003 diesel runs** (outdoor exhaust, remote monitoring, abort rule) | [A→H] PR wave 3 (KY, TN, VA, NC, MD, DE, DC, WV, MO, KS). Boston first freeze ≈ Nov 9. | – | ≥ 10 referring domains |
| 8 | Nov 16–22 | [A] **Model v1.1** (warm-up parameters from calibration reports); `/garage-heater-deals` (Nov 20, tiers only); state batch 2 | [A] BH-003 analysis | [A→H] PR wave 4 (GA, AL, MS, TX, OK, AR, LA). NYC and Atlanta first freezes ≈ Nov 20. [A] Thanksgiving preview email (Nov 24). | [H] Approve the v1.1 constants | Model change logged |
| 9 | Nov 23–29 | [A] Price refresh, internal-link and orphan audit | – | [A] **Black Friday (Fri Nov 27) email**. [A→H] BF Shorts: "Check your breaker before you buy a heater". | – | Record week |
| 10 | Nov 30–Dec 6 | [A] Cyber Monday update; state batch 3 | [A] **Publish BH-003 (Thu Dec 3)**: measured diesel CO, fuel by mass, $/h vs electric | [A] **Cyber Monday (Mon Nov 30) email** with the $14 Pro offer (if checkout is live). [A→H] Diesel Facebook groups: answers with the exhaust diagram. [H] r/dieselheater and GarageJournal posts as a person. | – | Diesel pages top 10 → +3 diesel pages |
| 11 | Dec 7–13 | [A] `/wood-stove-for-garage`; state batches 4–5 (warm states cooling-first) | – | [A→H] Reactive pitches within 2 h of any NWS Extreme Cold Warning over a metro of 1M+ | – | 51 state pages (gated) |
| 12 | Dec 14–20 | [A] Index December update; Q1 plan (cooling briefs, January "coldest month" edition) | [A] Lab retro: model error table | [A] "The coldest six weeks start now" email (Tue Dec 15). Pro moves to $19 on Dec 16, or $12 per §2.7. | [H] Approve the Q1 budget; the G3 decision on Jan 4 | 40 referring domains; retro in the notebook |

### 7.3 Content roadmap: the first 30 indexable pages, in order

1. `/garage-heater-calculator` (Oct 2)
2. `/garage-door-bottom-seal` (Oct 2)
3. `/garage-door-weather-stripping` (Oct 2)
4. `/garage-door-insulation-kit` (Oct 2)
5. `/garage-heaters` (Oct 2)
6. `/electric-garage-heater` (Oct 2)
7. `/diesel-heater-for-garage` (Oct 2)
8. `/propane-heater-for-garage` (Oct 2)
9. `/can-i-run-it` (Oct 2)
10. `/cost-to-heat-a-garage` (Oct 2)
11. `/garage-heater-calculator/methodology` (Oct 2)
12. `/lab/reports/bh-001-the-4x-problem` (Oct 2)
13. `/240v-garage-heater` (Oct 2)
14. `/portable-garage-heater` (Oct 2)
15. `/ceiling-mount-garage-heater` (Oct 2)
16. `/infrared-garage-heater` (Oct 2)
17. `/how-to-insulate-a-garage` (Oct 2)
18. `/garage-heater-size` (Oct 2)
19. `/best-wall-mount-garage-heaters` (Oct 2)
20. `/electric-vs-propane-garage-heater` (Oct 2)
21. `/natural-gas-garage-heater` (Oct 5)
22. `/big-maxx-vs-hot-dawg-vs-modine-vs-reznor` (Oct 5)
23. `/shop-heater` (Oct 8)
24. `/most-efficient-garage-heater` (Oct 8)
25. `/can-i-run-it/buddy-heater-in-garage` (Oct 8)
26. `/best-garage-heater` (Oct 13)
27. `/can-i-run-it/kerosene-heater-in-garage` (Oct 13)
28. `/can-i-run-it/torpedo-heater-in-garage` (Oct 15)
29. `/ventless-propane-heater` (Oct 15)
30. `/garage-fridge-heater-kit` (Oct 20)

The home, lab, notebook, how-we-work, about, privacy and Pro pages are launched but are not counted as content.

### 7.4 Linkable assets

| Asset | Hook | Target linkers |
|---|---|---|
| **BH-001, The 4× Problem** | "Seven answers for one garage" | Show HN, r/HVAC, r/HomeImprovement, AI answers |
| **Garage Heat Index** + CSV + tile map (+ embed in v1.1) | A monthly EIA-release headline; state rankings | Local TV meteorologists, state news, Dataset Search |
| **Can I Run It? Safety Card** (co-brandable `?dept=`) | "Tape it to the wall" | Fire departments, city safety pages, r/Frugal, FB groups |
| **Planner embed** | A free calculator for your site | Garage-door installers, electricians, garage-gym bloggers |
| **Methodology + constants CSV** | Open math | Engineers, forums, LLMs |
| **BH-002 door-kit co-heating; BH-003 diesel CO** | "We measured it" | Family Handyman, Bob Vila, r/dieselheater, GarageJournal |
| **First-garage-freeze dataset** (Nov 12) | "Your garage freezes on day 2–3, not the first frosty night" | Local news during cold snaps |
| **Free Electrician Brief** (QR) | Offline word of mouth | Electricians |

### 7.5 Community plan (humans post; agents draft; rules first)

**Reddit:** r/HomeImprovement, r/DIY, r/hvacadvice, r/woodworking, r/garagegym, r/homegym, r/dieselheater, r/electricians (read-only unless asked).
- **No links for the first 30 days.** After that, at most 1 link per 10 helpful comments, and only when it answers the question (a planner permalink or the Safety Card).
- The editor's own account, with the editor's name disclosed.

**Other channels:**
- **GarageJournal:** 5 helpful answers a week; a signature link only where the rules allow it.
- **Facebook diesel-heater groups:** exhaust and CO answers using our diagram.
- **Pinterest:** 5 pins a day from planner thermal renders ("Where a 2-car garage loses heat").
- **YouTube Shorts:** 3 a week from week 5 (thermal renders labeled `MODELED`; real TC001 footage after G3).
- **Any removal or warning:** stop linking in that community for 30 days, then review with a human.

### 7.6 Email plan (Kit)

**Welcome sequence** (6 emails over 12 days):
1. Your report plus how to read the band.
2. Fix first: the $675 logic for your grade.
3. Safety: CO alarms, clearances, circuits.
4. Your shortlist: up to 3 classes, mail tag.
5. Heat Report Pro.
6. "What's your garage for?" (reply-based; sets the use-case tag).

**Broadcasts:**
- **Cold Snap** (alerts tag): at most 1 per 7 days and 4 per season; sent by the ZIP3 zone when NWS forecasts the first ≤ 28 °F night within 72 h, or on an Extreme Cold Warning or Cold Weather Advisory. Default copy includes "Nothing to do tonight" when the modeled garage stays above 36 °F.
- **Monthly Index:** the first Tuesday.
- **Lab Reports:** as they publish.
- **Black Friday Nov 27, Cyber Monday Nov 30.**
- **"Coldest six weeks" Dec 15.**
- **Recall Watch:** only when a heater, CO alarm or fuel-container recall hits, verified by a human.
- **Switch to cooling tags on Mar 1, 2027.**

**Targets:**

| Email | Open rate | Click rate |
|---|--:|--:|
| Welcome | ≥ 45% | ≥ 8% |
| Alerts | ≥ 50% | ≥ 6% |

Unsubscribes stay under 0.5% per send.

### 7.7 KPIs: monthly targets (base / upside)

| Month | Sessions | Planner completions | Email subs (cum.) | Ref. domains (cum.) | Indexed pages | Affiliate clicks | AI panel citations (of 25) | Measured reports | Gross |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Oct-26 | 1.0k / 2.5k | 150 / 400 | 25 / 80 | 5 / 12 | 30 | 170 / 525 | 0 | 0 | $46 / $171 |
| Nov-26 | 5.0k / 12k | 750 / 1.9k | 150 / 460 | 20 / 40 | 45 | 850 / 2.5k | 1 | 1 | $346 / $1.3k |
| Dec-26 | 11k / 30k | 1.65k / 4.8k | 420 / 1.4k | 40 / 80 | 90 | 1.9k / 6.3k | 2 / 4 | 2 | $851 / $3.7k |
| Jan-27 | 14k / 40k | 2.1k / 6.4k | 770 / 2.7k | 60 / 110 | 110 | 2.4k / 8.4k | 3 / 6 | 3–4 | $1.1k / $5.2k |
| Feb-27 | 9k / 25k | 1.35k / 4.0k | 990 / 3.5k | 70 / 130 | 120 | 1.5k / 5.3k | 4 | 4 | $718 / $3.3k |
| Mar-27 | 6.5k / 18k | 975 / 2.9k | 1.1k / 4.0k | 80 / 150 | 140 | 1.1k / 3.8k | 5 | 4 | $472 / $2.2k |
| Apr-27 | 6k / 17k | 900 / 2.7k | 1.3k / 4.5k | 90 / 170 | 155 | 1.0k / 3.6k | 6 | 5 | $463 / $2.2k |
| May-27 | 9k / 26k | 1.35k / 4.2k | 1.5k / 5.3k | 105 / 190 | 165 | 1.5k / 5.5k | 7 | 6 | $700 / $3.4k |
| Jun-27 | 14k / 40k | 2.1k / 6.4k | 1.8k / 6.5k | 120 / 220 | 175 | 2.4k / 8.4k | 8 | 7 | $1.1k / $5.3k |
| Jul-27 | 18k / 50k | 2.7k / 8.0k | 2.3k / 8.1k | 140 / 250 | 180 | 3.1k / 10.5k | 9 | 8 | $1.5k / $6.7k |
| Aug-27 | 15k / 42k | 2.25k / 6.7k | 2.6k / 9.3k | 160 / 280 | 185 | 2.6k / 8.8k | 9 | 9 | $1.2k / $5.8k |
| Sep-27 | 17k / 50k | 2.55k / 8.0k | 3.0k / 10.8k | 180 / 300 | 190 | 2.9k / 10.5k | 10 / 15 | 10 | $1.4k / $6.7k |

**Leading indicators (weekly):**
- planner start rate ≥ 25% of sessions; completion ≥ 60% of starts;
- ≥ 70% of pages indexed within 14 days, and ≥ 90% by Dec 1;
- top 20 for 10 of the 25 tracked terms by Nov 15, and top 10 for 5 by Dec 15;
- affiliate clicks per 1,000 sessions ≥ 170;
- EPC by partner.

**Decision rules:**

| Trigger | Action |
|---|---|
| Planner completion < 40% of starts by Nov 1 | Freeze content for a week and fix the flow |
| < 50% of pages indexed 21 days after publishing | Pause new pages; fix internal links and uniqueness; win 5 referring domains; no state pages until fixed |
| Index earns < 2 links by Nov 30 | Re-pitch on a cold-snap hook, with a new chart |
| A test shows the model off by > 25% | Publish the miss that week, bump the model version, email the lab tag. **The miss is the story.** |
| Diesel or shop pages in the top 10 by Dec 1 | Add 3 diesel pages before Dec 15 |
| Pro < 0.4 sales per 1,000 sessions by Dec 15 | $12 |
| A partner's EPC < 50% of the class median | Demote it |
| Any community warning | 30-day link pause |

---
## 8. The agent team that runs BayHeat

### 8.1 Operating model

- **Agents** are Claude Code subagents defined in `.claude/agents/<name>.md`, with frontmatter `name`, `description`, `tools` and `model`.
- **Skills** are playbooks in `.claude/skills/<name>/SKILL.md`.
- **Scheduling** uses Claude Code Remote Routines (`create_trigger`, fresh session per fire, cron in UTC with jittered minutes).
- **All work lands as GitHub PRs** against `main`.
- **Nothing publishes without passing the Lab Gate:**
  1. CI (`npm run check`, plus `scripts/check-affiliates.ts`, `scripts/anti-slop.ts`, `scripts/evidence-lint.ts` (warn), `scripts/check-links.ts`);
  2. the **Fact-Checker**;
  3. the **Standards Editor**;
  4. **Design QA**, for any visual change;
  5. the human sampling rule.

**Humans alone:**
- create every account;
- sign every tax form and agreement;
- post to every community and social profile;
- send every press pitch;
- run every physical test;
- approve every safety-rule change and every model-constant change.

### 8.2 Roles (`.claude/agents/*.md`)

| Agent (file) | Mandate | Tools | Cadence (UTC) | KPIs | Guardrails |
|---|---|---|---|---|---|
| **chief-of-staff** | Turns the 12-week calendar into a weekly plan; assigns issues; runs the Monday loop; writes the weekly notebook entry; owns escalation | Read, Grep, Glob, Bash (`gh`), Routines | Mon `52 13 * * 1`; daily queue `07 14 * * *` | Plan hit rate ≥ 85%; 0 pages shipped without the Gate | Never merges its own PRs. The owner approves the weekly plan (10 min). |
| **report-writer** | Drafts guides, hubs, verdict pages and answer blocks from `lib/planner` + `lib/facts`, following §3.2 and §5 | Read, Write, Edit, Grep, Glob, Bash, WebFetch | Sprint Mon–Wed; 5 pages/wk Oct–Nov, then 2–3 | ≥ 70% indexed within 14 days; 0 Gate rejections on the second pass | Never types a unit-bearing number that exists in lib. Never writes "tested". Max 5 indexable pages/wk. |
| **fact-checker** (red team) | Adversarially re-derives every number in a PR from its formula or source; re-fetches sources and checks retrieval dates; tries to break verdict logic with edge cases | Read, Grep, Bash (`node --test`, `python3 scratchpad ref`), WebFetch, WebSearch | On every content PR; full-site sweep `09 17 1 * *` | 100% of numbers traced; post-publish corrections < 1 per 20 pages | Blocks on any untraceable number. Disputes go to the editor (human). |
| **standards-editor** | Final gate: evidence marks, banned words, disclosure placement, competitor quote rules, reading level, uniqueness gate for templates | Read, Grep, Bash (lints) | On every PR | 0 FTC or Amazon violations; 0 banned words shipped | The human editor samples 10% of pages per batch and 100% of Lab Reports. |
| **model-steward** | Owns `lib/planner`: the T1–T13 vectors, constants, the price snapshot, calibration from warm-up reports and tests, semver releases, the methodology page | Read, Edit, Bash (`node --test`, python ref) | Weekly `18 15 * * 3`; on each new calibration batch or test | Vectors 100% passing; warm-up MAPE ≤ 20% by Jan 31; every constant change logged | **The human editor approves every constant change.** |
| **data-desk** | EIA electricity, gas, propane, diesel and heating-oil refresh (`EIA_API_KEY`); Index recompute and dated CSV snapshots; NOAA normals; the Cold Snap check (NWS `api.weather.gov`, `NWS_USER_AGENT`) | Bash, WebFetch, Edit | Daily 11:05 NWS check; propane Wed `33 16 * * 3` (Oct–Mar); within 48 h of EIA 5.6.B (≈ 24th monthly) | Prices ≤ 35 days old; Index published ≤ 48 h after a release | The human approves each Index headline before pitches go out. |
| **safety-desk** | Can I Run It? rules; Recall Watch (CPSC `saferproducts.gov/RestWebServices/Recall`); code watch (NEC adoption, IFGC/IRC, NFPA 58/54, UL); the Safety Card | Read, Edit, Bash, WebFetch | Recalls daily `41 12 * * *`; code watch monthly `23 15 2 * *` | Relevant recall surfaced ≤ 24 h; 100% of safety pages licensed-reviewed ≤ 30 days after publishing | **A licensed reviewer approves every electrical or gas rule change. Safety corrections reach a human within 24 h.** |
| **lab-analyst** | Writes protocols; processes logger CSVs (Inkbird, Aranet, meters); computes UA, ACH and warm-up; charts model vs measured; drafts reports with raw CSV | Read, Write, Bash (python) | On each test; draft ≤ 7 days after data | Report ≤ 7 days; raw CSV with every report | **A human runs every test.** The editor signs every report. "Measured" only with a log. |
| **commerce-desk** | `products.ts`/`partners.ts`; weekly link audit (404, out of stock, variation drift); disclosure coverage; monthly EPC re-rank; enabling the cart once ASINs are verified; Pro fulfillment tokens until the Polar webhook | Read, Edit, Bash, WebFetch | Links Mon `27 10 * * 1`; EPC the 1st `14 16 1 * *` | 0 broken links; 100% disclosure coverage; EPC per class | Never invents an ASIN. Never adds a price. Accounts are owner-only. |
| **search-desk** | SEO review of every new page; GSC and Bing pulls; IndexNow; internal links and orphan crawl (≥ 3 inlinks); the 25-prompt AI panel; rank tracking for 25 terms; uniqueness-gate audits for state pages | Read, Grep, Bash, WebFetch, WebSearch | Daily GSC `36 8 * * *`; crawl Tue `44 9 * * 2`; AI panel `19 14 5 * *` | Rankings; indexed %; citations | No `mcp__OpenSEO__*` without an owner-approved credit budget. |
| **distribution-desk** | PR lists, localized pitches (Index numbers by state), cold-snap reactive kits; Reddit, GarageJournal and FB **drafts**; pins and Shorts scripts and renders | Read, Write, WebSearch, Bash (ffmpeg) | PR waves per §7.2; drafts daily `03 15 * * 1-5` | Pitch reply rate ≥ 8%; links per wave | **Humans post and send everything.** No undisclosed commercial accounts. |
| **email-desk** | Kit welcome sequence; Cold Snap, Index, Lab and BF/CM sends by tag; list hygiene | Read, Write, Bash (Kit API v4) | Cold Snap decision daily 11:10; Index on the first Tuesday `12 14 1-7 * 2` | §7.6 targets | The first send of each type is human-approved. Amazon links only to double-opt-in subscribers with `_MAIL`. |
| **design-qa** | Playwright screenshots at 390×844 and 1440×900 of the 14 key screens; axe; Lighthouse budgets; anti-slop review; the "stunning" rubric (§9.8) | Bash (Playwright at `/opt/node22/lib/node_modules/playwright`), Read | On every UI PR; weekly full pass `31 11 * * 4` | 0 serious axe issues; LCP < 2.5 s; rubric ≥ 8/10 | Blocks on any budget regression. |
| **ops-analyst** | Weekly dashboard (sessions, completions, clicks, EPC, subscribers, referring domains, indexation, citations, Pro sales, spend vs gates); applies the §7.7 decision rules and the §6.6 gates; replaces `[MODEL]` numbers | Bash, Read, Write | Mon `03 13 * * 1` | Dashboard on time; rules applied ≤ 48 h | The owner reads a one-page summary. Spend releases need owner approval. |

### 8.3 Recurring loops

**A. The weekly content sprint and fact-check gauntlet** (every Monday; Oct–Nov runs 5 pages a week).
1. **Mon: chief-of-staff** opens one issue per page, from the roadmap. The issue carries the brief: target cluster, H1 formula, planner deep-link state, the required figure, the instrument, products and the safety points.
2. **Mon–Tue: report-writer** drafts on a branch. It must pass locally: `npm run check`, evidence-lint (no new warnings), check-affiliates, anti-slop. It opens a PR with a **claims table**: each number → formula or fact ID → source.
3. **Wed: fact-checker** (a separate session with no draft context) re-derives every claim:
   - planner numbers are recomputed with `node --test` fixtures and the Python reference;
   - every source URL is re-fetched and its quote matched;
   - every "why not" and verdict is attacked with 5 edge cases;
   - it searches for a contradicting authoritative source.

   Result: `PASS`, or a list of `FAIL` items with evidence. Two FAIL rounds escalate to the human editor.
4. **Wed: standards-editor** checks banned words, disclosure placement, evidence marks on decision numbers, competitor quotes, reading level (grade ≤ 9), FAQ provenance and the uniqueness gate.
5. **Thu: design-qa** screenshots at 390 and 1440, checks the 700 px rail rule on V pages, runs axe and Lighthouse. It gates any new figure against the thermal quality bar: line art registered to the field, °F scale bar, legible at 390 px, and never a blob at thumbnail size.
6. **Thu: human editor** samples 10% of pages (100% of Lab Reports and safety pages) and approves. Electrical and gas pages add the licensed reviewer's sign-off within 30 days (the stamp appears only once they sign).
7. **Fri: merge and deploy** (Vercel), then search-desk runs IndexNow, requests GSC indexing for priority URLs and adds internal links from 3 existing pages.

**B. Affiliate link audit** (Mon 10:27).
- Crawl every outbound partner link: HTTP status, tag presence, `rel`, only verified ASINs on `/dp/`, disclosure above the first paid link, and no Amazon links in print or Pro. Amazon checks use HEAD/GET with a normal UA and respect rate limits.
- Open a PR for any fix. Report weekly EPC by surface.

**C. SEO review** (Tue 09:44).
- Orphan crawl, ≥ 3 inlinks per page, canonical and og:url correctness in built HTML, sitemap parity.
- GSC "Crawled – not indexed" list; top query gaps; title and answer-block tests on pages ranked 8–20.
- The monthly 25-prompt AI panel.

**D. Design QA** (Thu 11:31).
- A full screenshot pass of the 14 key screens (home hero desktop and mobile, each planner step, result, Fix-First after-state, share card, a V money page, Can I Run It? verdict, Index, BH-001, methodology), diffed against last week.
- Lighthouse mobile budgets (§9.8), axe, the anti-slop grep.

**E. Data refresh** (monthly, after EIA): prices, then the Index, then CSV snapshots, then a notebook entry, then the Index email and PR hook.

**F. Corrections** (every 4 h on weekdays): triage `CORRECTIONS_ENDPOINT` and email; acknowledge within 24 h; fix within 72 h (24 h for safety); log it.

### 8.4 Escalation to the human (owner or editor)

| Trigger | Channel | SLA |
|---|---|---|
| Any safety error found post-publish; any CPSC recall of a product we link | PushNotification + issue labeled `safety` | Human within 24 h; page patched immediately by the agent (remove the link, add a callout) |
| Model constant change; safety rule change | PR labeled `needs-editor` / `needs-licensed-review` | Before merge |
| Spend or gate decision (G1–G4); paid-search kill | Weekly summary + issue | 48 h |
| Account, credential, tax or legal question | OWNER-CHECKLIST issue | – |
| Community warning, journalist reply, brand or legal contact | Push | Same day |
| Two FAIL rounds from the fact-checker | Issue `needs-editor` | 48 h |
| Build red on `main` for more than 1 h | Push | Immediate |

### 8.5 OWNER CHECKLIST (accounts and keys only a human can create)

**P0: before or at launch (Sep 28 – Oct 2).**
1. **Upgrade the Vercel project to Pro** (~$20/mo). Hobby forbids affiliate-first sites and payments.
2. **Amazon Associates.**
   - Confirm `laqaer-20` has passed the 3-sales/180-days review.
   - Add bayheatguide.com to the site list; complete the tax interview and payment.
   - **Create 4 tracking IDs** and set `NEXT_PUBLIC_AMAZON_TAG_PLANNER/_CART/_MAIL/_SAFETY`.
3. **Name the editor.** Set `NEXT_PUBLIC_EDITOR_NAME` and `NEXT_PUBLIC_EDITOR_URL`.
4. Set **`NEXT_PUBLIC_POSTAL_ADDRESS`** (PO box or virtual mailbox) and confirm the `hello@bayheatguide.com` mailbox works.
5. **Analytics:** Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bayheatguide.com`, $9/mo) or GA4 (`NEXT_PUBLIC_GA4_ID`).
6. **Kit:**
   - account, double-opt-in form, tags `planner, alerts, brief, pro-waitlist, index, lab, zone-1…8`;
   - SPF, DKIM and DMARC;
   - set `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_TAG_IDS`.
7. **GSC:** export 28-day by-page data before the redirects (the §3.4 gate). Create a service account and set `GSC_SITE_URL` and `GSC_SERVICE_ACCOUNT_JSON_B64`. Verify Bing Webmaster Tools (import from GSC) and set `INDEXNOW_KEY`.
8. Generate `PRO_UNLOCK_SECRET` (32 random bytes).
9. **Make the GitHub repo private.** The audit flagged the public README and strategy docs.

**P1: week 1–2 (by Oct 11).**

10. **SiteStripe-verify about 25 ASINs** and send them as a PR to `lib/commerce/products.ts` `VERIFIED_ASINS`:
    - bottom seals (8 ft and 16 ft, T-style and bulb) and a retainer kit;
    - a perimeter stop seal and a service-door weatherstrip kit;
    - an attic hatch gasket;
    - door kits: Matador, Cellofoam, Owens Corning, Reach Barrier;
    - 2 UL 2034 CO alarms (plug-in with display, 10-year battery);
    - an ABC extinguisher;
    - a line-voltage double-pole thermostat;
    - a garage-fridge heater kit;
    - a Wi-Fi freeze alarm;
    - Mr. Heater Buddy and Big Buddy;
    - Big Maxx MHU50; Hot Dawg HD45;
    - 2 diesel heaters and a through-wall exhaust kit.
11. **Polar:** create the organization and the Heat Report Pro product ($14, changed to $19 on Dec 16). Set `NEXT_PUBLIC_CHECKOUT_URL_PRO` and `POLAR_ACCESS_TOKEN`/`POLAR_WEBHOOK_SECRET`/`POLAR_ORGANIZATION_ID`.
12. **Apply to affiliate networks:**
    - Awin ($5 deposit; VEVOR 28831, Hcalory) → `NEXT_PUBLIC_AWIN_AFFID`;
    - CJ (Northern Tool) → `NEXT_PUBLIC_CJ_PID`, `NEXT_PUBLIC_CJ_AID_NORTHERNTOOL`;
    - Impact (Home Depot, Walmart, Home Depot Services) → `NEXT_PUBLIC_*_LINK_BASE`;
    - HVACDirect, Got Ductless, Pioneer, Sylvane → `*_REF`.
13. **Hire a licensed electrician reviewer** ($75–150 per page; verify the license on the state board) and, by Nov 1, a gas/HVAC reviewer. Set `NEXT_PUBLIC_REVIEWERS`.
14. **Buy the phase-1 lab kit (G1)** and keep the receipts. Confirm liability coverage. Choose the test garage (detached, or a contracted Field Tester at ~$300/test).
15. **Social accounts:** YouTube, Pinterest Business, Instagram, TikTok, Facebook Page. Set `NEXT_PUBLIC_SOCIAL_*`, and add each to the Amazon site list.
16. **PR sources:** Qwoted, Featured, Source of Sources sign-ups.
17. **Weather and data:** `EIA_API_KEY` (free), `NWS_USER_AGENT="BayHeat/1.0 (hello@bayheatguide.com)"`, `CRON_SECRET`.
18. **Forms:** set `CENSUS_ENDPOINT` and `CORRECTIONS_ENDPOINT` (a Google Apps Script webhook is fine).

**P2: by Nov 30.**

19. **Lead partners.** Email affiliate@networx.com and affiliates@modernize.com with traffic stats, then set `LEADS_PROVIDER` and the lead URLs.
20. **Paid search (G2):** Microsoft and Google Ads accounts, a $200 cap.
21. **Pinterest developer app:** `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_IDS`.

**Owner time:** about 8 h of setup in week 1, then 3–4 h a week (approvals, posting, pitches, test days).

---

## 9. BUILD PLAN for v1 (one session, ~11 parallel AI engineers)

### 9.1 Ground rules for every builder

- **Read first:** `AGENTS.md`, the relevant guide in `node_modules/next/dist/docs/` (App Router), and `company/research/nextjs16-cheatsheet.md` §0 and §22.
- **This is Next 16.3.4 / React 19.2 / Tailwind v4:**
  - params, `searchParams`, `cookies()` and `headers()` are **Promises**;
  - use `PageProps<'/route'>` (global, no import);
  - `useSearchParams` only inside `<Suspense>`, or the build fails;
  - GET route handlers need `export const dynamic = 'force-static'` to be `○`;
  - `typedRoutes: true`; `ViewTransition` is imported from `react`;
  - `next lint` is gone; run `eslint`;
  - React Compiler lint rules are errors: no `setState` in effects, and no `Math.random`, `Date.now`, `localStorage` or `window` in render. Use `useSyncExternalStore`.
  - Do **not** enable `cacheComponents`. Do not add a `webpack` key.
- **Tested modules** (`lib/planner`, `lib/safety`, `lib/commerce`, `lib/index`, `lib/redirects`): relative imports with the `.ts` suffix, `import type` for types, **no enums, no JSX, no `@/` alias**. Tests run with `node --test 'lib/**/*.test.ts'` (the glob is quoted).
- **Numbers:** every displayed unit-bearing number on a content page comes from `lib/planner`, `lib/facts` or `lib/format`. Pages never retype them.
- **Static by default.** The only `ƒ` entries allowed in the build legend are `/r/[code]`, `/r/[code]/opengraph-image` and `/api/pro/verify`. The `subscribe` Server Action must not make a page dynamic.
- **Ownership is law.** You edit only the paths your lane owns (§9.3). Anything else is a request to the integrator.
- **Frozen interfaces:** exported names and signatures in W0 stubs and types are frozen after the foundation merges. A change needs the integrator's approval and a one-line ADR in `company/decisions.md` (the integrator creates that file).

### 9.2 W0: Foundation (lands first; ~60 min; engineers E1 + E2 together; then frozen and owned by the integrator)

**Deletes:**
- the 9 legacy folders in §3.4;
- `components/{guide-chrome,callouts,amazon-link,mobile-nav,site-header,site-footer,json-ld}.tsx`;
- `lib/{affiliates,json-ld}.ts`;
- `public/ads.txt`.

**Moves:** `app/page.tsx`, `about/`, `privacy/`, `best-wall-mount-garage-heaters/` and `electric-vs-propane-garage-heater/` into `app/(site)/`. Their contents are rewritten later by the owning lanes.

**Creates or rewrites:**

| Path | Contents |
|---|---|
| `package.json` | `"type":"module"`. Scripts: `dev`, `build`, `start`, `lint: eslint`, `typecheck: tsc --noEmit`, `typegen: next typegen`, `test: node --test 'lib/**/*.test.ts'`, `check: npm run typegen && npm run typecheck && npm run lint && npm test && npm run build`, `posters: node scripts/bake-posters.ts`, `index:build: node scripts/build-index.ts`, `qa: node scripts/smoke.mjs`, `lint:content: node scripts/check-affiliates.ts && node scripts/anti-slop.ts && node scripts/evidence-lint.ts`. **No new runtime dependencies.** A dev dependency on Playwright is **not** added; use the global install at `/opt/node22/lib/node_modules/playwright`. |
| `tsconfig.json` | Add `"allowImportingTsExtensions": true`, `"erasableSyntaxOnly": true`; target `ES2022` |
| `next.config.ts` | `poweredByHeader:false`, `typedRoutes:true`, `redirects: () => REDIRECTS.map(r => ({...r, permanent:true}))`, and security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: SAMEORIGIN` on everything **except** `/embed/:path*`, which gets `Content-Security-Policy: frame-ancestors *`. |
| `.gitignore` | Add `.artifacts/` |
| `app/layout.tsx` | html/body only. Fonts per §4.3. `<html lang="en" data-scroll-behavior="smooth" className={fonts}>`. `metadata` from `lib/seo.ts` `rootMetadata` (`metadataBase` from `NEXT_PUBLIC_SITE_URL`). `WebSite` + `Organization` JSON-LD. |
| `app/(site)/layout.tsx` | SiteHeader + `<main id="main">` + SiteFooter + StickyCta; `data-surface="report"` |
| `app/(bare)/layout.tsx` | Minimal wrapper for embed and print routes |
| `app/globals.css` | Tailwind v4 `@import "tailwindcss"`; the §4.2 tokens as CSS vars on `:root`/`[data-surface]`; `@theme inline` mapping (`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-line`, `--color-fg`, `--color-fg-2`, `--color-link`, `--color-ember`, `--color-frost`, `--color-heat`, `--color-alarm`, `--color-go`, `--color-glow`, `--font-sans`, `--font-mono`); `@utility w-62/w-75/w-100/w-112/w-125` (font-variation-settings); motion tokens; `.prose-report` styles; `@media print` base; `@media (prefers-reduced-motion: reduce)` base |
| `app/not-found.tsx` | "This page moved or never existed. Size your garage instead →" |
| `app/icon.svg`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | §4.6, §4.7 (the default card calls the `lib/og/card.tsx` stub) |
| `lib/site.ts` | `BRAND`, `SITE_URL`, `CONTACT_EMAIL`, `PUBLISHER`, `DISCLOSURE_INLINE`, `DISCLOSURE_FOOTER`, `SAFETY_SCOPE`, `AI_LINE`, `MODEL_VERSION = '1.0.0'`, `PRICES_AS_OF = '2026-09'` |
| `lib/env.ts` | Typed getters for every variable in §6.3, with defaults |
| `lib/seo.ts` | `pageMetadata({href, title, description, ogVariant?, noindex?}): Metadata`. Sets canonical, `openGraph.url`, `images`, `twitter: summary_large_image`, and a title template `%s · BayHeat` |
| `lib/jsonld.ts` | Builders (`organization`, `website`, `person`, `webApplication`, `article`, `dataset`, `itemList`, `breadcrumbs`); `<JsonLd>` escapes `<` as `<` |
| `lib/redirects.ts` + `lib/redirects.test.ts` | §3.4 map and destination test |
| `lib/track.ts` | `track(event, props)`: a no-op unless analytics env is set; uses `sendBeacon` |
| `lib/format.ts` | `btuh()`, `kw()`, `usd()`, `cents()`, `pct()`, `degF()`, `amps()`, `awg()` (rounding rules in §5.1) |
| `lib/garage-store.ts` | `useGarage()` via `useSyncExternalStore` on `localStorage["bayheat:garage"]`, try/catch-safe |
| `lib/pages/types.ts`, `lib/pages/index.ts` | The page registry aggregator. Lane files `lib/pages/{core,seal,electric,fuel,data,safety,lab,trust,product}.ts` are created as empty typed arrays and owned by lanes. |
| `lib/types/evidence.ts` | §9.4 |
| `lib/planner/types.ts` | §9.4 (frozen) |
| `lib/commerce/types.ts`, `lib/safety/types.ts`, `lib/index/types.ts` | §9.4 (frozen) |
| `lib/facts/index.ts` + `lib/facts/{sources,circuits,products,codes,fuels}.ts` | The audit §2.1 verified facts, as `Fact` objects. Empty lane files: `lib/facts/{seal,electric,fuel,safety,lab,rules-of-thumb}.ts`. |
| `components/shell/*`, `components/brand/*`, `components/ui/*`, `components/evidence/*`, `components/page/{ReportPage,NextStep,Breadcrumbs}.tsx` | Working, styled per §4. They are the base every lane composes. |
| **Typed stubs**, each with its final exported signature and a minimal render; the owning lane replaces the internals | `components/figures/*.tsx` (W3), `components/thermal/*.tsx` (W3), `components/commerce/*.tsx` (W8), `components/capture/*.tsx` (W5), `components/safety/{SafetyCallout,RecallStrip}.tsx` (W6), `components/instruments/*.tsx` (W9–W11), `lib/og/card.tsx` (W4) |
| **Route placeholders** | A `page.tsx` for **every** v1 route in §3.3 (a ReportPage with the H1 and "In build"), so `typedRoutes` and nav links compile. Owners overwrite them. |

**Foundation acceptance:**
- `npm run check` is green.
- The build legend shows only `○` (placeholders).
- `node --test` passes the redirect test.
- The header and footer render at 390 and 1440 with no horizontal scroll.
- Fonts load with no CLS.

### 9.3 Parallel lanes: strict file ownership

All app paths below are under `app/(site)/` unless marked `(bare)` or absolute `app/`.

| Lane | Engineer | Owns (exact paths) | Ships |
|---|---|---|---|
| **W1 Engine: physics** | E1 | `lib/planner/{constants,climate,stations,prices,geometry,heatLoss,warmup,seasonal,cooling,electrical}.ts`, `lib/planner/physics.test.ts`, `lib/planner/vectors.test.ts` | A port of `scratchpad/ref/planner.py` plus spec §3–§11 and Appendices B/C (113 stations with `h99, h996, elev, monthly dbavg/HDD stats`; 51-state `PRICES` with `asOf`). **T1–T13 within ±1%**, plus the §0.2 table (31,742 / 22,633 / 13,025 / 48,380 before rounding). `circuitFor` per §11.3. |
| **W2 Engine: decisions** | E2 | `lib/planner/{zip3,zip3.data,presets,defaults,catalog,recommend,roi,safety,grade,uncertainty,plan,codec,serial}.ts` + `decisions.test.ts`, `codec.test.ts`; `scripts/build-zip3.ts` | ZIP3 → centroid → nearest station + state (a ~15 KB committed table from the Census ZCTA gazetteer; the script is committed; state fallback). Catalog §12 with `productIds`; `rankSystems` §14; `insulateFirst` §15; S1–S11 → `warnings`; BayGrade §2.5 (tests: D/C/B/F on §0.2); `uncertainty` §2.1; `plan(input): PlannerResult`; codec §2.3 (round trip on 200 seeds plus example A); serial. `plan()` p95 under 4 ms (a timing test with a generous CI threshold of 20 ms). |
| **W3 Thermal, figures, home** | E3 | `lib/thermal/{ramp,field}.ts` + `ramp.test.ts`, `components/thermal/**`, `components/figures/{Figure,ThermalExhibit,HeatLossBars,WarmupCurve,DisagreementStrip,GarageIso,GarageSection,ExplodedGarage,ClassSilhouette,GradeScale,FuelCostBars,UsTileMap}.tsx`, `scripts/bake-posters.ts`, `public/thermal/*.png`, `lib/facts/rules-of-thumb.ts`, `lib/home/hero-states.ts`, `components/home/**`, `app/(site)/page.tsx`, `app/opengraph-image.tsx` (after W0) | Everything in §4.8 rows 1, 3, 4, 7 and 8; posters for 5 presets × {as-is, seal+kit, fixed, bare}; the hero (§4.9) including the pinned plate morph; home sections 02–07 (importing `RecallStrip` from W6, `VerdictStamp` from W6 and `UsTileMap` data from W7). Hero module ≤ 6 KB gzipped; the LCP element is the H1. |
| **W4 Planner flow and share** | E4 | `app/(site)/garage-heater-calculator/{page,opengraph-image}.tsx`, `components/planner/**`, `app/(site)/r/[code]/{page,opengraph-image}.tsx`, `app/(bare)/embed/planner/page.tsx`, `lib/og/card.tsx`, `assets/fonts/*.ttf`, `lib/pages/core.ts` | The 5 steps (§2.1); URL state (§2.3); the ZIP re-light; the capture reveal with Door Rise; `LiveBand`; the SSR default result; the `/r` permalink and OG; the embed (theme and preset params, a brand credit link `Garage heat planner by BayHeat ↗` with `utm_source={host}&utm_medium=embed`); the OG card template. The result body renders `<GarageHeatReport result>` from W5. |
| **W5 Result, Pro, capture** | E5 | `components/result/**` (incl. `GarageHeatReport.tsx`), `components/brief/**`, `components/capture/**`, `app/actions/{subscribe,report}.ts`, `lib/kit.ts`, `app/(site)/heat-report-pro/page.tsx`, `app/(bare)/heat-report-pro/print/page.tsx`, `app/api/pro/verify/route.ts`, `lib/pro/{token,token.test}.ts`, `scripts/pro-token.ts`, `lib/pages/product.ts` | The §2.2 sections 1–11: the Fix-First Shrinking Heater (ViewTransition), the free Electrician Brief print (no Amazon; test), Heat Report Pro pages 1–10 (1–2 always shown as a sample), HMAC verify, EmailCapture/AlertSignup/NotifyMe plus the Kit Server Action and fallbacks, `CalibrateForm` → `CENSUS_ENDPOINT`/mailto. |
| **W6 Safety, Lab, trust** | E6 | `lib/safety/{rules,verdict}.ts` + `verdict.test.ts` (20 cases §2.8), `lib/safety/recalls.snapshot.ts`, `lib/facts/{safety,lab}.ts`, `lib/lab/{protocols,notebook}.ts`, `components/safety/**`, `app/(site)/can-i-run-it/{page,opengraph-image}.tsx`, `app/(site)/lab/page.tsx`, `app/(site)/lab/reports/bh-001-the-4x-problem/{page,opengraph-image}.tsx`, `app/(site)/lab/notebook/page.tsx`, `app/(site)/{how-we-work,about,privacy}/page.tsx`, `lib/pages/{safety,lab,trust}.ts` | Can I Run It? with stamp, share, the Safety Card (with `?dept=`); protocols P-002…P-005 with engine predictions; BH-001 (using W3's `DisagreementStrip` and the `rules-of-thumb` facts); the notebook with its first entry, "2026-10-02 · Model v1.0.0 released"; the pledges; money disclosure (`#money`); About (the editor from env; Laqaer Products; no sibling brands); Privacy (analytics, email, embeds, zero PII in URLs). |
| **W7 Data desk** | E7 | `scripts/build-index.ts`, `lib/index/{compute,data.generated}.ts` + `compute.test.ts`, `app/data/garage-heat-index.csv/route.ts`, `app/data/constants.csv/route.ts`, `app/(site)/cost-to-heat-a-garage/{page,opengraph-image}.tsx`, `app/(site)/garage-heater-calculator/methodology/page.tsx`, `app/(site)/garage-heater-size/{page,opengraph-image}.tsx`, `components/data/**`, `lib/pages/data.ts` | The Index (§2.8b) computed from the engine; CSV routes (`force-static`, `text/csv`); `Dataset` JSON-LD; methodology (every constant pulled from `lib/planner` exports, the T1–T13 table, the grade formula `#grade`, the assumptions register, the constants CSV); the size matrix (4 presets × 4 envelopes × 6 climates, computed at build). |
| **W8 Commerce and QA infrastructure** | E8 | `lib/commerce/{products,partners,route,amazon,cart}.ts` + `commerce.test.ts`, `components/commerce/**`, `lib/facts/products.ts` (after W0), `scripts/{check-affiliates,anti-slop,evidence-lint,check-links,smoke}.ts\|mjs`, `.claude/skills/verify/**`, `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` | Router §6.2 (tests: missing env → Amazon; tags per surface; `amazonCartUrl` rejects fewer than 2 or unverified ASINs); SpecPlate, VerdictRail, MiniSizer, CompareTable, Disclosure, PaidLabel, Cost, FitBar, WhyNot, BuyButtons (§4.5); all lint scripts (§9.6); the Playwright smoke; the verify skill, ported from `.cursor/skills/verify-bay-heat` (keep its helper; add Playwright click-through, redirects and OG checks). |
| **W9 Content: seal and insulate** | E9 | `app/(site)/{garage-door-bottom-seal,garage-door-weather-stripping,garage-door-insulation-kit,how-to-insulate-a-garage}/{page,opengraph-image}.tsx`, `components/instruments/{DoorLeakMeter,KitPaybackMeter}.tsx`, `components/figures/seal/**`, `lib/facts/seal.ts`, `lib/pages/seal.ts` | 4 pages per §3.2/§3.3, 1,000–1,600 words each, with at least 1 figure, 1 instrument and engine numbers. The Fix-First spine from the old seal-first table. The contrarian line "a kit alone ≈ 6% on a bare, leaky garage". |
| **W10 Content: electric** | E10 | `app/(site)/{electric-garage-heater,240v-garage-heater,portable-garage-heater,ceiling-mount-garage-heater,best-wall-mount-garage-heaters}/{page,opengraph-image}.tsx`, `components/instruments/CircuitChecker.tsx`, `lib/facts/electric.ts`, `lib/pages/electric.ts` | 5 pages, carrying over the audit's facts and fixes (§3.4). Compare tables for CZ220 / FUH54 / DR-975 / CZ798 / HS-1500-TT with manual footnotes. The GFCI and 4 kW ≠ 20 A callouts. |
| **W11 Content: fuel and hubs** | E11 | `app/(site)/{garage-heaters,diesel-heater-for-garage,propane-heater-for-garage,electric-vs-propane-garage-heater,infrared-garage-heater}/{page,opengraph-image}.tsx`, `components/instruments/FuelCostMeter.tsx`, `components/figures/fuel/{DieselExhaustDiagram,FuelTierLadder}.tsx`, `lib/facts/fuel.ts`, `lib/pages/fuel.ts` | 5 pages. The diesel $/h vs electric computed from `PRICES` (diesel $6.529/gal as of 2026-09-21 [R: EIA]), with the as-of date. Tank runtime ≈ 18 h on high (computed). The propane-exchange trap. Can I Run It? embeds on the propane and diesel pages. |
| **Integrator** | the orchestrator session | All W0 files after the merge; `company/decisions.md`; merge order; final `npm run check`; the redirect slip procedure | Merge order: W0 → W1 → W2 → W8 → W3 → W4 → W5 → W6 → W7 → W9 → W10 → W11. Each merge is rebased, `npm run check` green, then smoke. |

**Shared-file conflict rules:**
- **Page registry and facts:** one file per lane (above). `lib/pages/index.ts` and `lib/facts/index.ts` import every lane file statically and are written once by W0.
- **OG:** each route owns its `opengraph-image.tsx` and calls `lib/og/card.tsx`.
- **CSS:** lanes use Tailwind utilities and tokens only. Component-scoped needs use `*.module.css` next to the component. **`app/globals.css` is W0/integrator only.**

### 9.4 Frozen interfaces (W0 writes these verbatim; lanes code against them)

```ts
// lib/types/evidence.ts
export type Ev = 'M' | 'C' | 'S' | 'R' | 'E';
export type Source = { id: string; title: string; publisher: string; url: string; retrieved: string /* YYYY-MM-DD */; quote?: string };
export type Fact<T extends number | string = number> = {
  id: string;                 // 'cz220.watts.high'
  value: T; unit?: string;    // 5000, 'W'
  ev: Ev; sourceId: string;   // key into SOURCES
  checked: string;            // YYYY-MM-DD
  status: 'verified' | 'verify'; // 'verify' facts never render in production (<Num> throws in dev, renders nothing in prod)
  note?: string;
};
```

```ts
// lib/planner/types.ts  (frozen; IP units; no enums)
export type Preset = '1car' | '2car' | '3car' | '4car' | 'custom';
export type WallType = 'open_studs' | 'uninsulated_finished' | 'R11' | 'R13' | 'R15' | 'R19' | 'R21'
  | 'cmu8_uninsulated' | 'cmu8_R10' | 'metal_uninsulated' | 'metal_R10' | 'metal_R13' | 'metal_R19';
export type CeilingType = 'attic' | 'open_rafters' | 'conditioned_above';
export type CeilingIns = 'drywall_uninsulated' | 'R11' | 'R19' | 'R30' | 'R38' | 'R49';
export type RoofType = 'shingle_deck_uninsulated' | 'metal_uninsulated' | 'metal_R10' | 'metal_R19' | 'rafters_R19' | 'rafters_R30';
export type GarageDoorType = 'steel_single' | 'wood_uninsulated' | 'steel_eps_1_375' | 'steel_eps_2' | 'steel_pu_1_375' | 'steel_pu_2' | 'kit_eps_or_batt' | 'kit_reflective';
export type WindowType = 'single_metal' | 'single_wood_vinyl' | 'double_clear' | 'double_lowe';
export type EntryDoorType = 'uninsulated_metal' | 'hollow_wood' | 'solid_wood' | 'insulated';
export type SlabEdge = 'none' | 'R10_24in' | 'R15_24in' | 'R20_48in';
export type Tightness = 'tight' | 'average' | 'leaky' | 'very_leaky';
export type Circuit = '120V15A' | '120V20A' | '240V20A' | '240V30A' | '240V40A' | '240V50A' | '240V60A';
export type Fuel = 'electric' | 'natural_gas' | 'propane_bulk' | 'propane_cylinder' | 'diesel' | 'kerosene';
export type Priority = 'upfront' | 'running' | 'fast' | 'balanced';
export type UseCase = 'shop' | 'gym' | 'hangout' | 'car' | 'keep';
export type Unknown<T> = T | 'unknown';

export type GarageInput = {
  v: 1;
  zip3?: string; state: string; stationId: string;          // USPS state; station WMO id
  preset: Preset; width: number; depth: number; height: number; roofPitch: number;
  attached: boolean; commonWallLen: number;
  wallType: Unknown<WallType>; ceilingType: CeilingType | 'unknown'; ceilingIns: Unknown<CeilingIns>; roofType: RoofType;
  garageDoors: { w: number; h: number; type: Unknown<GarageDoorType> }[];
  windowsFt2: number; windowType: WindowType; serviceDoorFt2: number; serviceDoorType: EntryDoorType;
  slabEdge: SlabEdge; tightness: Unknown<Tightness>;
  tHouse: number; targetTemp: number; useCase?: UseCase;
  usage: { mode: 'continuous' | 'sessions'; sessionsPerWeek: number; hoursPerSession: number; doorOpeningsPerSession: number };
  warmupGoalMin: 30 | 60 | 120;
  circuit: Unknown<Circuit>; canAddCircuit: boolean; panelAmps: 100 | 150 | 200 | 'unknown';
  fuels: Fuel[]; ventingPossible: boolean; priority: Priority; wantsCooling: boolean;
  priceOverrides?: { elecPerKwh?: number; ngPerTherm?: number; propanePerGal?: number; dieselPerGal?: number };
  designTempOverride?: number;
};

export type Station = { id: string; city: string; st: string; lat: number; lon: number; elevFt: number; h99: number; h996: number; c1: number; dr: number; zone: string };
export type PriceSet = { state: string; elecPerKwh: number; ngPerTherm: number; propanePerGal: number; propaneCylPerGal: number; dieselPerGal: number; keroPerGal: number; asOf: string; sources: string[] };
export type Band = { low: number; mid: number; high: number; unknowns: number; narrowBy?: 'walls' | 'ceiling' | 'door' | 'tightness'; narrowToPct?: number };
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type LoadKey = 'walls' | 'garage_doors' | 'windows' | 'service_door' | 'ceiling_roof' | 'slab_edge' | 'infiltration' | 'house_coupling';
export type Wire = '14 AWG' | '12 AWG' | '10 AWG' | '8 AWG' | '6 AWG' | '4 AWG';
export type CircuitSpec = { watts: number; volts: 120 | 208 | 240; amps: number; minAmps: number; breakerA: 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80;
  wireNM: Wire; wireTHHN: Wire; gfciReceptacle: boolean; deratedWatts?: number; notes: string[] };
export type SafetyCode = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11';
export type Warning = { code: SafetyCode; severity: 'block' | 'warn' | 'info'; text: string; cite: string; ev: 'R' | 'S' | 'C' };
export type HeaterClassId = 'e_port_1500' | 'e_ir_wall_1500' | 'e_240_4k' | 'e_240_5k' | 'e_240_7k5' | 'e_240_10k' | 'e_ir_240'
  | 'hp_diy_12k_115' | 'hp_12_24k_230' | 'g_unvented_buddy' | 'g_vented_unit' | 'diesel_air' | 'k_unvented' | 'torpedo';
export type HeaterClass = { id: HeaterClassId; label: string; outputBtuh: [number, number]; energy: Fuel; eta: number | 'curve';
  circuit?: Circuit; vented: boolean; tier: 1 | 2 | 3; equip: [number, number]; install: [number, number]; safety: SafetyCode[]; productIds: string[]; neverRecommend?: boolean };
export type RankedSystem = { classId: HeaterClassId; units: 1 | 2 | 3; capacityBtuh: number; fitPct: number; tier: 1 | 2 | 3;
  circuit?: CircuitSpec; costPerHour: number; perSeason: number; tco5: number; upfront: [number, number];
  minutesToTarget: number | null; why: string; safetyLine?: string; attachCoAlarm: boolean; productIds: string[] };
export type WhyNot = { classId: HeaterClassId; text: string };
export type Measure = 'weatherstrip' | 'door_kit_eps' | 'door_kit_reflective' | 'ceiling_r30' | 'attic_hatch' | 'new_pu_door' | 'wall_batts';
export type RoiRow = { measure: Measure; cost: number; dQDesign: number; pctOfLoad: number; dMMBtu: number;
  savingsPerYear: { electric: number; gas: number }; paybackYears: { electric: number; gas: number }; productIds: string[] };
export type FixFirst = { measures: Measure[]; cost: number; qBefore: number; qAfter: number; gradeBefore: Grade; gradeAfter: Grade;
  classBefore: HeaterClassId; classAfter: HeaterClassId; circuitBefore: CircuitSpec; circuitAfter: CircuitSpec;
  equipmentSavings: [number, number]; runningSavingsPerYear: number };
export type CostRow = { system: 'electric_resistance' | 'heat_pump_cc' | 'ng_vented_80' | 'propane_bulk_80' | 'propane_cyl_92' | 'diesel_78';
  eta: number | 'curve'; unitPrice: number; unit: '$/kWh' | '$/therm' | '$/gal'; perHour: number; perSession?: number; perMonth: number; perSeason: number; perMMBtu: number };
export type SessionRow = { month: 'nov' | 'dec' | 'jan' | 'feb' | 'mar'; tOut: number; tStart: number; minutesToTarget: number | null; kwhOrFuel: number; cost: number };

export type PlannerResult = {
  modelVersion: string; code: string; serial: string;          // '1.0.0', codec string, 'R-2A-606-7F3A'
  station: Station & { distanceMi: number }; prices: PriceSet;
  inputsEcho: GarageInput; assumptions: string[];
  heating: { tIn: number; tOutDesign: number; deltaT: number; items: { key: LoadKey; btuh: number; pct: number }[];
    qDesign: number; qSize: number; kwSize: number; btuhPerFt2: number; band: Band; uaExt: number; uaExtPerFt2: number; grade: Grade;
    atticTempF?: number; freeFloatDesignF: number; sanity?: 'check_inputs' };
  warmup: { classId: HeaterClassId; kw: number; janMinutes: number | null; curve: [number, number][] /* [min, °F] */ };
  circuits: { forSize: CircuitSpec; user?: CircuitSpec; fits: boolean; panelCheck: 'ok' | 'load_calc' | 'unknown'; notes: string[] };
  usage: { mode: 'continuous' | 'sessions'; seasonMonths: string[]; tBal?: number; hddAtBal?: number };
  costs: CostRow[]; sessions?: SessionRow[];
  recommendations: RankedSystem[]; whyNot: WhyNot[];
  insulateFirst: RoiRow[]; fixFirst: FixFirst | null;
  warnings: Warning[];
};

// SIGNATURE (implemented in the named module, not in types.ts): function plan(input: GarageInput): PlannerResult;          // lib/planner/plan.ts
// SIGNATURE (implemented in the named module, not in types.ts): function encode(input: GarageInput): string;              // lib/planner/codec.ts
// SIGNATURE (implemented in the named module, not in types.ts): function decode(code: string): GarageInput | null;
// SIGNATURE (implemented in the named module, not in types.ts): function gradeFor(uaExtPerFt2: number): Grade;            // lib/planner/grade.ts
// SIGNATURE (implemented in the named module, not in types.ts): function circuitFor(watts: number, voltsSupply: 120 | 208 | 240, voltsRated?: 120 | 240): CircuitSpec;
// SIGNATURE (implemented in the named module, not in types.ts): function band(input: GarageInput): Band;                  // lib/planner/uncertainty.ts
```

```ts
// lib/commerce/types.ts
import type { HeaterClassId } from '../planner/types.ts';
export type PartnerId = 'amazon' | 'homedepot' | 'walmart' | 'lowes' | 'northern_tool' | 'vevor' | 'hcalory' | 'hvacdirect' | 'gotductless' | 'pioneer' | 'della' | 'sylvane';
export type Surface = 'site' | 'planner' | 'cart' | 'mail' | 'safety';
export type ProductKind = HeaterClassId | 'seal_bottom' | 'seal_retainer' | 'seal_perimeter' | 'seal_service_door' | 'attic_hatch'
  | 'door_kit_eps' | 'door_kit_reflective' | 'co_alarm' | 'extinguisher' | 'thermostat_line_voltage' | 'fridge_heater_kit' | 'freeze_alarm' | 'diesel_exhaust_kit';
export type PriceClass = '$' | '$$' | '$$$' | '$$$$';                   // <$100 · $100–300 · $300–1,000 · >$1,000 (our range, not a live price)
export type Product = { id: string; name: string; kind: ProductKind; asin?: string /* must be in VERIFIED_ASINS */; searchQuery: string;
  partnerUrls: Partial<Record<Exclude<PartnerId, 'amazon'>, string>>; priceClass: PriceClass; priceClassChecked: string;
  specFactIds: string[]; safetyLine?: { text: string; ev: 'S' | 'R'; sourceId: string } };
export type BuyLink = { partner: PartnerId; href: string; label: string; slot: 'primary' | 'secondary' | 'also'; surface: Surface };
// SIGNATURE (lib/commerce/products.ts): export const VERIFIED_ASINS: readonly ['B009F1SWH8', 'B00PX0T37I', 'B004VVJANC', 'B01M8KXXAB', 'B07JQPCFJ3'];
// SIGNATURE (implemented in the named module, not in types.ts): function route(p: Product, surface: Surface): BuyLink[];
// SIGNATURE (implemented in the named module, not in types.ts): function amazonCartUrl(asins: string[], surface: Surface): string | null; // null unless ≥2 verified
```

```ts
// lib/safety/types.ts
export type HeaterKind = 'e120' | 'e240' | 'buddy' | 'torpedo' | 'kerosene' | 'diesel' | 'vented_gas' | 'minisplit';
export type Situation = { attached: boolean; flammablesStored: boolean; livingAbove: boolean; unattended: boolean; freshAir: boolean;
  circuit?: '120V15A_shared' | '120V20A_dedicated' | 'extension_cord' | '240V20A' | '240V30A'; heaterKw?: number; heaterBtuh?: number;
  cylinder?: '1lb' | '20lb'; exhaustOutdoors?: boolean; coAlarm: boolean; preset: '1car' | '2car' | '3car' };
export type Condition = { text: string; cite: string; ev: 'R' | 'S' | 'C'; severity: 'must' | 'should' };
export type Verdict = { verdict: 'GO' | 'GO_IF' | 'NO_GO'; stamp: string; conditions: Condition[]; saferAlternatives: HeaterKind[]; reasons: string[] };
// SIGNATURE (implemented in the named module, not in types.ts): function verdictFor(h: HeaterKind, s: Situation): Verdict;
```

```ts
// lib/index/types.ts
export type IndexRow = { state: string; stationId: string; city: string; hdd50: number; h99: number;
  elecPerKwh: number; ngPerTherm: number; propanePerGal: number;
  season: { electric: number; heatPump: number; naturalGas: number; propane: number }; fixedSeason: { electric: number };
  cheapest: 'electric' | 'heatPump' | 'naturalGas' | 'propane'; per5kwHour: number; asOf: string };
```

```ts
// lib/pages/types.ts
import type { Route } from 'next';
export type PageEntry = { href: Route; id: string /* 'G-014' */; title: string; h1: string; description: string;
  kind: 'home' | 'tool' | 'money' | 'guide' | 'data' | 'safety' | 'lab' | 'trust' | 'legal' | 'product';
  layout: 'verdict-first' | 'report-first'; nav?: { group: 'planner' | 'heaters' | 'seal' | 'safety' | 'lab'; label: string };
  primaryKeyword?: string; volume?: number; reviewed: 'electrical' | 'gas' | null; indexable: boolean; published: string; updated: string; rev: number };
```

### 9.5 Definition of done (v1)

1. **`npm run check` is green:** typegen, tsc, eslint and `node --test`, including T1–T13, §0.2, the grade tests, codec round-trip, the 20 verdicts, redirect destinations, commerce routing, the Pro token and the Index compute. Then `next build`.
2. **The build legend** shows `○`/`●` everywhere, except `ƒ` on `/r/[code]`, `/r/[code]/opengraph-image` and `/api/pro/verify`.
3. **Every route in §3.3 is live.** All 9 old URLs return a **308** to a 200 page. The sitemap lists the 27 indexable routes only.
4. **Planner:**
   - 5 steps completable in ≤ 60 s at 390×844 with no horizontal scroll.
   - The result shows every §2.2 section.
   - Example A shows 31.7k → 13.0k BTU/h, D → B, and 60 A/6 AWG → 30 A/10 AWG.
   - The URL restores state after a reload.
   - `/r/<code>` restores it and its link preview shows the card (fetch the OG image: 1200×630 PNG).
   - A printed Brief contains 0 `amazon.` links.
5. **Can I Run It?** returns stamped verdicts with citations. **The Index** serves the tile map, table and CSV computed from the engine. **Lab:** P-002…P-005 carry engine predictions; the notebook entry is dated.
6. **Commerce:**
   - every Amazon href carries a tag;
   - only the 5 verified ASINs use `/dp/`;
   - every paid anchor has `rel="sponsored nofollow noopener"`;
   - the disclosure precedes the first paid link;
   - no Amazon prices, stars or images;
   - a CO alarm is attached to every combustion recommendation.
7. **Zero env vars means zero dead buttons.** Every fallback is visible and honest.
8. **Each page** has a unique title, description, canonical, og:url and og:image (verified in the built HTML).
9. **The V-page 700 px rule** passes at 390×844 on all 12 V pages (Playwright measures `plate1.getBoundingClientRect().top ≤ 700`).
10. **Budgets and screenshots:** the budgets in §9.8 are met, and screenshots of the 14 key screens pass the design-QA rubric.

### 9.6 CI gates shipped in v1 (W8)

| Script | Fails on |
|---|---|
| `scripts/check-affiliates.ts` (built HTML in `.next/server/app/**/*.html`) | An Amazon link without a tag; `/dp/` for a non-verified ASIN; a missing `rel`; a paid page without `DISCLOSURE_INLINE` before the first paid anchor; an Amazon link inside `[data-print]`, `/heat-report-pro/print` or the SafetyCard; `m.media-amazon.com` |
| `scripts/anti-slop.ts` (source) | The §4.10 grep list; banned words (§5.2) in `app/**` and `components/**` string literals; `rounded-2xl`; banned colors |
| `scripts/evidence-lint.ts` | **Warn:** unit-bearing numerals in JSX text outside `<Num>`/tables. **Fail:** the drift literals `20.9`, `20.8 A`, `10 AWG`, `8 AWG`, `6 AWG`, `1,440 W`, `17,060`, `12.5 A`, `25,590` outside `lib/` |
| `scripts/check-links.ts` | Internal links pointing at non-routes; pages with fewer than 3 inlinks (warn in v1) |
| `scripts/smoke.mjs` (Playwright global) | Home, planner (5 steps at 390), the result's fix toggles, a `/r` round trip, a Can I Run It? verdict, the Index CSV (200, `text/csv`), 308 → 200 for all 9, the 700 px rule, OG tags in HTML, axe (0 serious), screenshots into `.artifacts/` |

### 9.7 Merge and integration protocol

- Each lane works in its own worktree and branch `v1/wNN-<slug>`, off the merged foundation.
- Commits end with the attribution lines required by the harness.
- **Before requesting a merge:** rebase on the latest integration branch, run `npm run check`, and run `npm run qa` for UI lanes.
- The integrator merges in the order in §9.3.
- **Missing data:**
  - if a lane needs data owned by another lane that hasn't landed, it imports the stub (the W0 signature) and never forks the file;
  - if a lane needs a new shared primitive, it builds it locally in its own folder, and the integrator promotes it after v1.
- **Slips:**
  - a content page that isn't Gate-quality by the cut-off keeps its placeholder, set to `noindex`, and is removed from the sitemap;
  - a merge destination that slips → the redirect-slip procedure (§3.4).

### 9.8 Quality bar: "stunning", Lighthouse-grade, zero build errors

**Performance budgets** (Lighthouse mobile, Moto G Power profile; `npm run qa` records them):

| Metric | Budget |
|---|---|
| LCP | < 2.0 s target, **< 2.5 s hard**, on home, planner and one V page. The LCP element is the H1. |
| CLS | < 0.05 |
| INP | < 200 ms (planner recompute < 4 ms; `useDeferredValue` for the band) |
| Home first-load JS | ≤ 130 KB gz |
| Planner route's own JS | ≤ 60 KB gz |
| Thermal module | ≤ 6 KB gz, loaded on idle |
| Fonts | ≤ 120 KB total; preload Archivo only |
| Rasters above the fold | 0, except the ~10 KB poster |

**Accessibility:**
- axe: 0 serious or critical;
- every control is keyboard-operable with a visible focus ring;
- every chart has a text or table equivalent;
- the canvas has an `aria-label` summary ("Modeled thermal view: door perimeter coldest at 18 °F, ceiling warmest at 71 °F");
- `aria-live` announces final values only;
- colour is never the only encoding;
- touch targets are at least 44 px.

**The "stunning" rubric** (design-qa scores each key screen 0–10; merge needs **≥ 8** on every screen and ≥ 8.5 on average):

| # | Criterion | The test |
|---|---|---|
| 1 | Distinctive | At 390 px, with the logo covered, it is still recognisably BayHeat: Spot Mark, thermal exhibit, mono readouts, Ember. |
| 2 | Hierarchy | One focal point per viewport. The number is the hero. |
| 3 | Typography | The width axis is visibly used (wide H1, condensed labels). Tabular numbers never jitter. Measure is 62–68ch. |
| 4 | Thermal quality bar | Line art registered to the field; labeled °F scale; spot meter; stratified plume; the door-seal leak legible at 390 px. Not a blob at thumbnail size. |
| 5 | Rhythm and grid | Exposed 12-column grid; left alignment; section rhythm 96/64. |
| 6 | Motion | Every motion encodes state; the reduced-motion final state is correct. |
| 7 | Honesty | Every number is traceable; the right chips on the right numbers; no fake trust. |
| 8 | Commerce | Plates read like nameplates; the safety line is on the plate; the disclosure is visible and not shouting. |
| 9 | Mobile | Thumb-reachable CTA; no horizontal scroll; the 700 px rule holds on V pages. |
| 10 | Zero slop | The §4.10 greps are clean, and a human reviewer finds no "template" smell. |

**Zero build errors:** `npm run check` is green on `main` at every merge. No `@ts-ignore`, no `eslint-disable` without a linked ADR, no console errors on the 14 key screens.

---

## Appendix A: sources behind the decisions

**Research dossiers** (in `company/research/`):
- `competitors.md` §3.1 (the 4× Problem), §5
- `monetization.md` §1, §2, §9–§12
- `planner-engineering.md` (§2–§17, Appendices A–C)
- `design-direction.md` §A, §4, §5
- `growth-playbook.md` §2.3–§2.8, §7–§10
- `nextjs16-cheatsheet.md` §0, §20–§22
- `current-site-audit.md` §2–§5

**Concepts and judges:** `scratchpad/concepts/*.md`, and the judges' output relayed in the task (trust-lab 36.9, tool-first 36.3, revenue-max 31.0, brand-first 26.6, unanchored 25.7).

**Worked-example values:** recomputed 2026-09-25 with `scratchpad/ref/planner.py`. Example A: 28,856 design / 31,742 size; seals + kit 20,576 / 22,633; all fixes 11,841 / 13,025; bare & leaky 43,982 / 48,380. Grades use UA_ext/ft² of 0.995 / 0.717 / 0.423 / 1.503.

**Kit API v4** (checked 2026-09-25): `POST /v4/subscribers` (upsert; `state` includes `inactive`) and `POST /v4/forms/{id}/subscribers` (the subscriber must exist), both with header `X-Kit-Api-Key`. Sources: https://developers.kit.com/api-reference/subscribers/create-a-subscriber and https://developers.kit.com/api-reference/forms/add-subscriber-to-form-by-email-address

**CPSC recalls** (from `scratchpad/recalls_heater.json`, 2026-09-25):
- recall 26532, Vornado SRTH, 2026-06-04, ≈ 255,000 units;
- recall 25203, Enerco DEWALT DXH70CFAVX, 2025-04-03, ≈ 21,250 units.
