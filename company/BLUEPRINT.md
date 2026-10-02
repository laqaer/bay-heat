# BAYHEAT: THE COMPANY BLUEPRINT (v1.1, 2026-09-26)

**This document is the single source of truth.** It serves two readers:

1. the build team: about 11 AI engineers who ship v1 in this Next.js 16.3.4 repo in one session;
2. the agent team that runs the company from week 1.

Where this document and a concept pitch, a research file or a judge disagree, **this document wins**. The research files in `company/research/` are reference material: the formulas, sources and evidence behind the decisions made here. When this blueprint says "per spec §N", it means `company/research/planner-engineering.md` §N.

**v1.1 changelog (2026-09-26).** Four red-team passes were run against v1.0 (compliance/legal, engineering feasibility, revenue modeling, design taste) and their findings are applied throughout this revision. Every CRITICAL and HIGH finding is applied. MEDIUM/LOW findings are applied where they improve the plan; rejected ones are logged with a one-line reason in **§10, Red-team decisions**, at the end of this document, alongside every material trade-off made while reconciling findings that pulled in different directions. If a number, route, type or env var here disagrees with anything in v1.0, **this document (v1.1) wins.**

**Tags used throughout:**

| Tag | Meaning |
|---|---|
| `[C]` | Computed by our engine. The build must recompute it; never paste it. |
| `[REF]` | Output of `scratchpad/ref/planner.py`. The TypeScript port must reproduce it. |
| `[MODEL]` | A business assumption. Replace it with measured data by 2027-01-15. |
| `[VERIFY]` | Must be checked against a primary source before it renders. The facts registry blocks rendering until it is checked. |

---

## 0. Decisions on one screen

### 0.1 The twelve decisions (revised)

1. **Name and domain.**
   - Brand: **BayHeat**.
   - Descriptor: **Garage Climate Lab**. (A taste red-team asked us to rename this to something more ownable; rejected for v1 — see §10 #T9.)
   - Domain: **bayheatguide.com** stays canonical through at least **2027-04-30**.
   - No rename, no domain purchase and no migration during the heating window.
   - Every absolute URL comes from `NEXT_PUBLIC_SITE_URL`.
2. **Tagline: "Every number shows its work."** Unchanged (a taste critique proposed a data-specific replacement; rejected for v1, see §10 #T12 — a tagline change is a positioning call for the owner, not a red-team unilateral edit).
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
     - safety verdicts, with **required flammable-storage and UL/CSA/ETL-listing checks** (§2.1, §2.8)
   - State lives in the URL query (`?g=<code>`). The permalink is `/r/<code>`. It is read with `useSyncExternalStore`, **not** `useSearchParams` (§2.3 — a `useSearchParams`/`<Suspense>` implementation would bail the whole page to client-side rendering; a compliance-adjacent feasibility finding caught this before it shipped).
4. **Four more signature products in v1, one deferred to v1.1:**
   - **Can I Run It?** (a safety verdict machine)
   - **The Garage Heat Index** (50-state cost data, CSV)
   - **Lab Report BH-001, "The 4× Problem"**
   - **Heat Report Pro moves to v1.1 (opens no earlier than Oct 15).** It sells electrical how-to content with no licensed reviewer signed and depends on a Polar account that doesn't exist yet; the v1 "Keep it" card reads "Heat Report Pro opens Oct 15 · Notify me" (§2.7).
5. **Art direction: "Inspection Grade."**
   - The light report paper (retuned to `#EEF0EA`, a taste finding — see below) is the default surface for long-form guides, comparison tables, print and the Electrician Brief.
   - **Home (`/`), the planner and the fuel/electric hub pages (`/garage-heaters`, `/electric-garage-heater`) run on the dark Camera surface (`#08090C`) as their default background, not as a boxed exhibit inside a paper page** (§4.1, §4.9 — a CRITICAL taste finding: the thermal-camera concept is the one thing this rebrand was chosen for, and an earlier draft of this document made paper the default everywhere and demoted Camera to a decorative panel, which risked the flagship visual idea never actually appearing on the pages most people land on first). Dark thermal-camera exhibits elsewhere appear as numbered figures, **as static baked posters in v1** — the live thermal-field canvas is a v1.1 feature (§4.8, §9) — and every `ThermalExhibit` composites the `GarageSection` line-art overlay (roof, joists, door, window, slab) baked into the same poster, so the heat field always reads as a labeled temperature map, never an unreadable color blob (§4.5, a HIGH taste finding).
   - Two fonts only: Archivo (with its width axis) and Martian Mono.
   - One action color: Ember `#FF8A1F`. Red is for safety only. **Grade A no longer shares the Ember/Glow hue** (§4.2 — a color-collision fix). **The retuned paper tone and a new link color also move both off the retired site's near-identical cream/rust palette** (§4.2 — a second, CRITICAL color-collision finding: the original `#F6F4EF`/`#B8430B` pair sat only a few RGB units from the audited old-site values, which would have read as the same site being replaced).
6. **Evidence Marks (M/C/S/R/E) appear on decision-driving numbers only**, never on every numeral.
   - The Lab Label is a one-line stamp — `ID · REV · CHECKED · MODEL` only, no claim counts (§4.5, §9.4 — a claim count like "C 22 S 9 R 6" can't actually be computed server-side).
   - The evidence lint is a **warning** in v1, except drift literals and `verify`-status facts on indexable pages, which **fail the build** (§9.6).
7. **v1 launch set (live by Fri 2026-10-02):** 27 indexable routes (composition changed from v1.0: Heat Report Pro's route moved out, `/terms` moved in — see item 4 and §3.3), including:
   - the three sealing pages that peak now: bottom seal (33.1k in Oct), weather stripping (40.5k in Nov) and door kit (22.2k);
   - the `/garage-heaters` hub (27.1k) and the `/electric-garage-heater` hub (14.8k ×2);
   - diesel and propane hubs, rewritten to match each product's actual manual scope (§2.8);
   - `/garage-heater-installation-cost`, pulled forward from v1.1 because it is the single highest-CPC page in the entire keyword set ($18.01), swapping out `/ceiling-mount-garage-heater` (moved to v1.1 week 1) to keep the route count even (a revenue-model finding);
   - `/terms`, a new route required before the site can sell anything or stamp a safety verdict (a compliance finding);
   - the 9 merged legacy URLs, each with a 308 redirect.
8. **Money.** The plan counts only affiliate revenue, email revenue, Heat Report Pro (from v1.1) and a conservative non-zero installer-leads line (§6.5 — modeling leads at a hard $0 ignored the highest-EPC lever on the site). Every other line is modeled at $0 until a signed deal or an approved account exists.
   - Amazon `laqaer-20` is the default partner, with a separate tracking ID for each surface.
   - The partner router falls back to Amazon.
   - **No dollar figures render anywhere a paid link sits** (§6.1, §9.6 — an Amazon-policy and staleness fix).
   - No display ads in year 1.
   - Spending is gated in stages (§6.6), and the owner's peak out-of-pocket exposure is stated explicitly (§6.6).
9. **Safety sits at the point of sale.** The product-specific safety line appears on the spec plate, next to its buy button, in alarm red, and **is now a required field, checked by a commerce test, for every heater product** (§2.2, §9.4).
   - A house-mounted CO alarm is **pre-checked but uncheckable** for every combustion recommendation; a **garage-rated CO monitor** is added only when a verified fact says it's rated for the garage's temperature range (§2.2, §2.8 — CO alarm manuals themselves warn against garage installation; our old copy contradicted the products we linked).
   - An unvented heater is never the default pick for an attached garage, and Buddy-type propane is never shown as a buyable plate for any attached garage, and never with a buy button at all — it renders only as a "why not / spot heat" line linking to `/can-i-run-it` (§2.5, §2.8).
10. **Trust is earned in public.** Two pre-registered, measured tests land before the peaks, using a phase-1 kit of about $1,050:
    - **BH-002**, door kit plus weatherstrip co-heating, by **Nov 6**;
    - **BH-003**, diesel CO and cost, by **Dec 3**, opening with the Awin/VEVOR commission disclosure and a 5-business-day maker right-of-reply window before publishing adverse data (§5.6).

    Phase-2 tests (5 kW warm-up and Big Buddy) are released only if December gross is at least $500 — **the revised revenue model (§6.5) shows this gate is not expected to clear in the base case**, so phase-2 tests should be planned as a 2027-Q1/Q2 event, not assumed.
11. **Architecture.**
    - Fully static: no `cacheComponents`.
    - Deliberate `ƒ` routes only: `/r/[code]`, its OG image, and the `POST` handlers.
    - Pure engine in `lib/planner` with T1–T9 and T11–T13 vectors within ±1% (T10, the cooling vector, is deferred with the cooling engine to March 2027, §9).
    - A pre-flight commit lands first (types, fixtures, zip3 data, golden output, fonts — §9.2), then a lean foundation PR with frozen types and contracts.
    - 14 merges with strict file ownership, not 11 parallel lanes from a blank foundation — a feasibility finding showed the original 11-lane plan was actually one serial chain behind the engine, with ownership conflicts and a build environment that could not run 11 concurrent builds (§9.3).
12. **Run by agents, gated by humans.** 14 Claude Code subagents run the company through the weekly **Lab Gate** loop:

    draft → adversarial fact-check → standards → design QA → human approval (100% of buy and safety pages; 10% sample of everything else; 100% of Lab Reports).

    Humans hold every account, every post, every pitch and every signature. The owner needs about 3–4 hours a week, plus roughly 8 hours in week 1 and a same-week legal/insurance pass before launch (§8.5).

### 0.2 The single worked example (use it everywhere; recompute at build)

This is the spec's §6 garage, example A:
- 24×24×9 ft, attached along a 24 ft side;
- R-13 walls, uninsulated drywall ceiling under a vented 6/12 attic;
- one 16×7 uninsulated steel door, a 12 ft² window, a 20 ft² hollow-core service door;
- average drafts; no gasoline or solvents stored; a UL-listed heater assumed unless stated;
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
- Can I Run It? example verdicts for this garage, cross-referenced against §2.8: a 5 kW heater on a spare 240 V/30 A circuit with no gasoline stored is `GO — IF 3 CONDITIONS` (breaker is exactly 30 A, wire is 10 AWG copper, circuit is grounded); the same circuit with gasoline stored downgrades to a longer `ONLY IF` (move the gasoline first, then the electrical conditions).

### 0.3 Grafts and conflict resolutions (final, v1.1)

| Conflict | Ruling |
|---|---|
| **Hero:** trust-lab's argument hero vs. the customer judge's "input first" | Both, but **the compact FIG. 1 thumbnail moves above the ZIP field on mobile** (a taste finding: the thermal exhibit was 4th in the mobile stacking order and sat below the fold, the one thing that visually identifies the site). Order at 390×844 is now: eyebrow → H1 → **a 340×255 px static FIG. 1 thumbnail** → ZIP input and `Size my garage` button → the Disagreement Strip. Desktop keeps the original split (§4.9). |
| **Buy rail placement:** revenue-max (first plate within 700 px) vs. growth (after the answer block) | Split by page intent (§3.3), math now checked at 390×844 (a taste/feasibility finding showed the original stack ran to ≈720–750 px, over budget — H1s on V pages are now capped at 60 characters and answer blocks at 40–50 words, §4.9/§9.8). |
| **Safety copy vs. buy buttons** | The customer judge wins. The product-specific safety line sits **on** the plate, next to the button, in `--alarm`, and is now a **required** field checked by a commerce test. |
| **Locked-on CO alarm** | Pre-checked, uncheckable, with the reason shown, **and now placed in the house per the alarm makers' own manuals**, not the garage — a garage-rated low-level CO monitor is the garage-side device, added only when verified (§2.2, §2.8, a compliance finding). |
| **Free Electrician Brief vs. a paid-only Brief** | The customer judge wins. The free Brief is complete: breaker, wire, GFCI, disconnect, clearances, the 6 questions to ask, a thermostat **spec** (not a wiring diagram — see the Pro ruling below), QR. |
| **Evidence lint** | A warning in v1, **except** drift literals and any indexable page referencing a `status: 'verify'` fact, which hard-fail (a feasibility finding: a missing fact used to render as a silent gap in a safety sentence). |
| **Lab Label** | One line, `ID · REV · CHECKED · MODEL` only (no claim counts — they can't be computed server-side). It never prints "M 0" or "review pending" in the header; review status appears only in the expanded panel. |
| **Kits** | No `/kits/*` pages and no indexable landers. `amazonCartUrl()` ships tested but **dark**. An "Add N items to Amazon cart" button appears on the Fix-First card only when 2 or more items in it have verified ASINs — and **those specific 4 Fix-First ASINs move to the P0 owner checklist**, verified before launch, not 9 days after it (a revenue finding: the site's flagship moment shouldn't monetize worse than everything else for its first week and a half). |
| **Embeds** | `/embed/planner` ships in v1, but **stripped to load, grade, circuit and class names only** — no `BuyButtons`, `EmailCapture`, `NotifyMe` or Pro (a compliance finding: the full component in an iframe puts Amazon links and email capture on other people's sites, outside our disclosure and privacy surface). Its only CTA is `Get the full report on BayHeat ↗` to `/r/<code>`, plus a Privacy link. The compact 320 px widget, `/embed/heat-index` and the `/embed` landing page still ship in v1.1 (Oct 29). |
| **Heat Report Pro** | **Moves to v1.1** (no earlier than Oct 15, and only once `PRO_REVIEWED=electrical,gas` is set). It sells electrical DIY content it can't yet back with a licensed reviewer, and its generic thermostat wiring diagrams and single-edition NEC 220.83 worksheet were both liability and correctness problems (§2.7, a compliance + feasibility finding). |
| **State pages** | v1.1, batches of 10 from Nov 10. `noindex` until they pass the growth-playbook §2.5 gate. |
| **Lab costs** | Stage-gated (§6.6). The phase-1 kit (about $1,050) is approved for BH-002 and BH-003, with the owner's written liability-coverage confirmation attached to the approval. Phase 2 is released only if December gross ≥ $500, which the revised model does not expect to happen on schedule. |
| **Grade colours** | The letter is always ink (on paper) or bone (on camera). The grade scale runs from **F at the Frost end** ("heat escapes") to **A at a dedicated bronze/gold `#C9A227`** ("holds heat") — **not** Ember/Glow, which stays reserved for the one action color and live readouts (§4.2, a taste color-collision finding). |
| **Line style** | Measured is **solid** ink. Modeled or forecast is **dotted**. This applies everywhere. |
| **Logo** | Tool-first's corner brackets, with revenue-max's **off-centre hot dot**, now with the dot's position and the four bracket-leg lengths **derived from the worked example's own leak geometry** rather than symmetric defaults (a taste finding: symmetric corner-brackets-plus-dot is a generic scanner glyph). The Settle curve is rejected. |
| **Freeze product** | Unanchored's physics ships as **static computed content**: `/keep-garage-above-freezing` and `/how-cold-does-an-unheated-garage-get` (v1.1). There is no live garage-temperature forecast until reference calibration exists. Alerts are opt-in, at most 1 per 7 days, and never claim a garage-temperature all-clear (§7.6, a compliance finding — "Nothing to do tonight" moves out of Cold Snap copy and becomes a general brand-voice line elsewhere, §4.1/§5.1). |
| **Rename (brand-first, unanchored)** | Rejected. Garagiste means wine, and "Overnight Low" belongs to weather and trading. |
| **Display ads, Test Fund, sponsors, Pro embed** | Not built in v1. Modeled at $0. **Installer leads are the one exception**: the leads slot ships in v1 as a link-out button (no on-site form, no phone field), env-gated on `LEADS_PROVIDER`, falling back to the free Brief — it needs no partner account to exist in code, only to go live (§6.1, §6.3, §9, a revenue + compliance reconciliation; see §10 #F24). |

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
  - It appears in the footer, on `/about`, on `/terms` and in the `Organization.parentOrganization` / `publisher` schema.
  - **Never mention the sibling brands** (Charting Stars, Seraph).
  - **Owner action, P0:** confirm in writing whether Laqaer Products is a registered LLC/corporation or a sole-proprietor trade name, and that the Amazon Associates, Polar and Kit accounts are opened in that entity's name (§8.5 — a compliance finding: a site that sells a product and stamps safety verdicts needs a known legal entity behind it).
- **Name collision.** "Bay Heating & Cooling" is an HVAC contractor in Annapolis (bayheatcool.com). We never target the query "bay heat". Our thermal identity and the "Garage Climate Lab" descriptor keep the two apart.

### 1.2 Tagline, positioning, mission

**Tagline:** *Every number shows its work.*

**Positioning (one sentence, revised wording on "independent"):**

> BayHeat is a garage climate lab, **independent of manufacturers**: no maker pays us to be listed, though retailers pay us a commission when you buy through our links. Our open model sizes the heater for *your* garage, grades every number by where it came from, and tells you plainly when a heater will trip your breaker or fill your garage with carbon monoxide, so you buy the right heat once.

(The un-qualified word "independent" implied more than it could support at launch — a compliance finding. The parenthetical is now load-bearing, not decorative, and appears everywhere "independent" is used: home proof strip, `/about`, `/how-we-work`.)

**Mission:** Every garage owner should buy the right heat once: sized to the building, safe for the people in it, and honest about the math.

**Four brand verbs.** They are the nav spine and the section rails:
- **Size it**
- **Power it**
- **Price it**
- **Fix it**

The nav renders these four labels in the spec-plate's own dotted-leader mono style (`SIZE IT ····`), not a generic link row — a small, cheap taste fix that makes the primary nav visually belong to the instrument system instead of reading as an ordinary features nav (§4.5).

### 1.3 Audience and jobs to be done (priority order for the first 90 days)

| # | Segment | Job | Entry demand (US/mo, peak) | What we give them |
|---|---|---|---|---|
| 1 | **Winter Workshopper** (woodshop, project car) | "Get my shop to 55 °F within an hour on Saturday without tripping a breaker or gassing myself." | shop heater 6,600 (33,100 Jan) · garage heater electric 14,800 · electric shop heater 4,400 | Warm-up minutes, circuit card, **Shop notes** (glue and finish minimums once verified; dust and solvent ignition; flammables-stored check now shared with the safety engine) |
| 2 | **Fix-First Homeowner** | "Which $40–150 fix stops the draft, and is the door kit worth it?" | bottom seal 27,100 (33,100 Oct) · weather stripping 22,200 (40,500 Nov) · door insulation kit 22,200 · how to insulate 2,400 | Door Leak Meter, Kit Payback Meter, ranked fixes with ΔBTU/h and payback, BH-002 measured |
| 3 | **Portable-Propane Owner** (Buddy class) | "Can I run this in my garage, how long does a tank last, and is it safe?" | propane heater for garage 9,900 pool · indoor safe propane 9,900 · kerosene heater indoors 22,200 · torpedo 14,800 | Can I Run It? verdict quoting the manual's own scope sentence, tank runtime, moisture, CO alarm rules, the manufacturer's storage limit |
| 4 | **Diesel-Curious** | "Is a $150 diesel heater safe and actually cheaper?" | diesel heater for garage 6,600 (27,100 Jan) · best diesel 480 (1,600) · vevor for garage 880 | Honest $/h vs electric, computed from this week's EIA diesel price; exhaust diagram labeled "illustrative — your manual governs"; BH-003 measured CO, with the Awin/VEVOR commission disclosed up front |
| 5 | **Keep-Above-Freezer** (fridge, water heater, EV) | "Keep it above 40 °F all winter at the lowest cost." | garage fridge heater kit 1,600 ×2 · cheapest way to heat a garage 390 (1,300) | 40 °F season cost (HDD at the balance point, not HDD65), Cold Snap alerts driven only by the NWS forecast (never a garage-temperature prediction) |
| 6 | **Heat-Pump Decider** | "Does a $2.5–7k mini-split beat a $170 heater over 5 years here?" | mini split for garage 3,600 (8,100 Jul) · heat pump for garage 390 | 5-year TCO with cooling credit (this piece ships in **March 2027** with the cooling engine, §9); capacity at design temperature, unmet load |
| 7 | **Garage Gym / Hangout** | "60 °F by 6 am without CO or condensation." | garage gym heater 210 (1,300) | Warm-up, unvented-heater warning |
| 8 | **The Citer** (journalists, meteorologists, Reddit answerers, LLMs) | "A sourced, dated number I won't be embarrassed by." | – (PR, Dataset Search) | Index CSV, methodology, "Cite this" box |
| 9 | **The Pro** (electrician, garage-door installer) | "A brief that makes my quote easier." | installing a garage heater 1,000 ($18.01 CPC) · 240 V outlet cost 170 ($7.94) | Free Electrician Brief with QR; `/garage-heater-installation-cost` ships at v1 launch, not Oct 22 (a revenue finding — this is the single highest-CPC page in the whole keyword set); embed in v1.1 |

### 1.4 Why we win

1. **The market's weakness is trust, not information.** For one 24×24 garage, six publishers give seven answers from **10,200 to 40,300 BTU/h**, and none of them shows why (`competitors.md` §3.1). Several publishers present ranked "best of" picks with review-style language and no visible evidence of hands-on testing against the URLs we checked on 2026-09-25. Car and Driver's real test ran 6 mostly propane portables for 15 minutes each, with no 240 V heaters, no CO data and no cost per hour. (We name competitors only to quote a specific, dated, verbatim claim with a link — never with adjectives like "fake" or "never tested" — and we offer each one a right of reply 5 business days before naming them in a Lab Report; §5.2, a compliance finding.)
2. **We connect physics to the purchase.** Nobody else links insulation to breaker size: $675 of fixes turns a 10 kW / 60 A job into a 5 kW / 30 A job. That one insight sells seals, door kits and the right heater. It is also where the affiliate volume is: 27k + 22k + 22k searches a month.
3. **Safety is the conversion lever.** These are $150–1,500 purchases, and the buyer is afraid of fire, CO and breakers. We answer those fears next to the buy button, with code citations, and we say plainly when the manufacturer's own manual says no.
4. **Every 2026 platform rule rewards what we produce:**
   - the Google core update (Mar 2026) and spam update (Aug 2026) target scaled, commodity content;
   - Amazon's 2026-04-14 policy requires original content;
   - the FTC fake-review rule (16 CFR 465) bans invented tests.

   Our computed-per-garage numbers and pre-registered tests are original by construction.
5. **Links and AI citations go to sources.** The Index CSV (CC BY 4.0 for our own computed columns; ASHRAE climate inputs are cited, not relicensed — §2.8b), the methodology page, BH-001 and the Safety Card are what journalists, fire departments, Redditors and LLMs cite.
6. **It compounds.** A calculator can be cloned in a weekend. A season of pre-registered tests, a public corrections log and a calibrated model cannot.

---

## 2. Product

### 2.1 The BayHeat Planner (`/garage-heater-calculator`): the five steps

**Engine.** `lib/planner` ports `scratchpad/ref/planner.py` and the spec: per-surface UA at the ASHRAE 2021 99% design temperature, attic in series, slab F-factor, altitude infiltration, warm-up simulation, HDD at the balance point, heat-pump bins, NEC circuits, rules S1–S12 (S12 is new, §2.5), `rankSystems`, `insulateFirst`. It is pure, deterministic, IP units. `plan()` runs once per request; `band()` (the "Don't know" widener) never re-runs the full engine — see the performance fix in §2.1 "How Don't know works" and §9.

**Entry points.**
- The home hero ZIP field.
- The `Size my garage` button in the header.
- Every page's context link, pre-filled with **partial params** that are accepted only when `g` is absent: `preset` (`2D`), `fuel` (`D`), `use` (`shop`) and `focus` (`seal`, `power` or `price`). They are merged into the defaults, and the flow starts at step 1. Examples: the diesel hub links `?preset=2D&fuel=D`; the bottom-seal page links `?focus=seal`.
- Instruments' `Open the full planner →`.
- `/r/<code>` pages ("Plan your own garage").
- `/embed/planner` (stripped, no buy surfaces — §0.3).

**Layout.**
- **Camera surface** (`data-surface="camera"` on `app/(site)/garage-heater-calculator/layout.tsx`, §4.1 — a CRITICAL taste finding). The step panel floats as a `--surface` (`#12151B`) card with bone text, so it stays legible over the dark background instead of assuming paper underneath. The thermal exhibit (FIG. 1) is a static baked poster beside it on desktop (columns 7–12) and above it on mobile — the live canvas field is v1.1 (§4.8, §9).
- A running readout sits above the step card in Martian Mono: `SIZE 26,000–41,000 BTU/h · answer 2 more to narrow to ±8%`.
- A progress rail `01 WHERE · 02 GARAGE · 03 SKIN · 04 USE · 05 POWER`, where each step is a button.
- On mobile, the step card is full width. Next/Back are sticky at the bottom, 56 px tall.

| Step | Question (H2) | Controls (exact) | Maps to `GarageInput` |
|---|---|---|---|
| **1 · WHERE** (≈5 s) | "Where is the garage?" | One `ZIP code` field: `inputmode="numeric"`, `autocomplete="postal-code"`, 5 digits. On the 5th digit, **ZIP re-light**: the ZIP3 resolves to the nearest of 113 stations plus the state, using a committed prefix-range table built from the Census ZCTA gazetteer plus a hard-coded ~60-row USPS ZIP3→state range table (the gazetteer alone has no state column — §9). A readout types in: `CHICAGO O'HARE · 99% DESIGN 3.3 °F · ELECTRIC 19.2¢/kWh (IL, EIA JUL-2026) · GAS $1.09/therm`, and the exhibit re-renders at that outdoor temperature. Each price has an `edit` affordance ("use my bill: __ ¢/kWh"). **Fallback:** a `Pick a state` select. | `zip3`, `stationId`, `state`, `priceOverrides` |
| **2 · GARAGE** (≈10 s) | "Which garage?" | Isometric line-art tiles: `1-CAR 12×22` · `2-CAR 24×24` · `3-CAR 32×24` · `4-CAR 40×26` · `CUSTOM`. A segmented control, `ATTACHED TO HOUSE` / `DETACHED`. A ceiling height stepper: 8 / 9 / 10 / 12 ft. W and D steppers (hold to repeat: 400 ms, then 60 ms). Windows: 0 / 1 / 2 / 3+ (12 ft² each). The drawing redraws live. | `preset`, `width`, `depth`, `height`, `attached`, `commonWallLen = depth`, `windowsFt2` |
| **3 · SKIN** (≈15 s) | "What's it made of?" | **Walls:** Bare studs · Drywall, no insulation · Insulated (R-13) · Well insulated (R-19+) · Metal building · **Don't know**. **Ceiling:** Attic, no insulation · Attic, insulated (R-30) · Open rafters · Room above · **Don't know**. **Big door:** Plain steel · Insulated door · Kit added · Wood · **Don't know**. **Drafts**, a 3-question quiz: "Daylight under the closed door?" · "Bottom seal cracked or missing?" · "Feel air at the side stops?" 0 yes = tight, 1 = average, 2 = leaky, 3 = very leaky; **Don't know** is allowed. Each card shows its U-value in small mono. | `wallType` (`open_studs` / `uninsulated_finished` / `R13` / `R19` / `metal_uninsulated` / `unknown`), `ceilingType` + `ceilingIns`, `garageDoors[0].type`, `tightness` |
| **4 · USE** (≈10 s) | "What's the garage for?" | **Use-case presets** (brand-first graft), each setting target and pattern: `SHOP 55 °F · sessions` · `GYM 60 °F · sessions` · `HANGOUT 65 °F · sessions` · `CAR & STORAGE 40 °F · all winter` · `KEEP ABOVE FREEZING 40 °F · all winter`. For sessions: sessions/week (1–7) × hours (1–8) steppers, default 2 × 4. Warm-up goal: 30 / 60 / 120 min. **New tap, required for every path:** "Gasoline, a mower, paint or solvents kept in here?" Yes / No / Don't know — **`Don't know` is treated as `yes`** everywhere it feeds a safety rule (a compliance finding: UL 1278 requires every movable/wall/ceiling-hung electric heater's manual to warn against gasoline storage, and most garages store gasoline; a bare GO for an electric heater was wrong the moment we skipped this question). | `useCase`, `targetTemp`, `usage`, `warmupGoalMin`, **`flammablesStored: 'yes' \| 'no' \| 'unknown'`** |
| **5 · POWER & FUEL** (≈10 s) | "What power and fuel do you have?" | **Outlets:** Only regular outlets (120 V) · Spare 240 V circuit · I can add a circuit · **Not sure**. Choosing "Spare 240 V circuit" now asks the **breaker size** (20 / 30 / 40 / 50 A) and shows **outlet pictures** for 6-30, 10-30, 14-30 and 14-50 so the reader can match theirs — a plain adapter (14-50→6-30) or an ungrounded NEMA 10-30 dryer outlet routes straight to a safety NO-GO downstream (§2.8, a compliance finding: the old "spare 240 V/30 A" wording silently included unsafe adapter and ungrounded-outlet cases). "Not sure" opens the same 3-picture helper. **Panel:** 100 A · 150 A · 200 A · Don't know. **Fuel at the house:** Natural gas · Propane tank (bulk) · Propane cylinders · None. **Can we vent through an exterior wall?** Yes / No. **Priority:** Lowest upfront · Lowest running cost · Fastest heat · Balanced. **Cool it in summer too?** Yes / No (this only sets a flag in v1; the cooling engine and its recommendations ship March 2027, §9). | `circuit`, `breakerA`, `canAddCircuit`, `panelAmps`, `fuels`, `ventingPossible`, `priority`, `wantsCooling` |

**How "Don't know" works.** Every "Don't know" widens the band. `lib/planner/uncertainty.ts` evaluates **only `heatLossDesign()`** — not the full `plan()` — at the low and high corner of each unknown, up to 2⁴ = 16 calls, each in microseconds (a feasibility finding: the original design ran full `plan()`, including `rankSystems` over 14 classes, warm-up simulation and heat-pump bins, up to 16 times, which does not fit under a 200 ms INP budget on a slow device). It returns `{low, mid, high}` and `narrowBy`: the unknown that shrinks the band most. The corner values are:

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
| 1 | **Readout card** (also the share card) | Left: **FIG. 1**, the modeled thermal frame of *their* configuration, a static baked poster in v1, with HUD `MODELED — NOT A PHOTOGRAPH`, a °F scale bar and a spot meter. Right: the **BayGrade letter** (Archivo wdth 125, wght 900, 120 px) on the GradeScale bar — **always shown with its word pairing** ("D · HEAT ESCAPES", never a bare colored bar, §4.2); `YOU NEED 31,700 BTU/h · 9.3 kW` with band `28,400–37,500 (±1 draft class)`; `WARM-UP TO 55 °F: 1 h 56 min on 7.5 kW (average January day)`; `THE RULES OF THUMB SAID 10,200–40,300 →` (links to BH-001). Actions: `Copy link` · `Save image` · `Email me this report`. Every exported image (this share card, OG, pins, Shorts) carries `MODELED — NOT A PHOTOGRAPH` burned into the pixels, not just as alt text (§7.5, a compliance finding). | The one shadow token in the system is used here. `aria-live` announces the final values only. |
| 2 | **FIX IT FIRST: the Shrinking Heater** | Checkboxes, cheapest payback first: `Weatherstrip package` · `EPS door kit` · `R-30 blown ceiling` · `Attic hatch gasket`. **No dollar figures appear on these rows** — the price class (`$`–`$$$`) shows instead, and the dollar estimate lives only in the payback paragraph below the checklist, labeled `BayHeat cost assumption: median of manufacturer list and Home Depot/Lowe's prices checked 2026-09; not a live or Amazon price` (a compliance finding: Amazon's policy allows a price only through its own approved feeds, and a "~$120" figure sitting next to "Check price on Amazon" reads as an Amazon price and is stale on day one). Toggling re-runs `plan()` live: the frame cools at the leaks over 1.5 s; the grade animates **D → B**; the load goes **31,700 → 13,000**; the circuit card flips **60 A / 6 AWG → 30 A / 10 AWG**; the heater plate **shrinks** (a `<ViewTransition>` morph, wrapped in `startTransition`) from `10 kW · 240 V / 60 A · 6 AWG` to `5 kW · 240 V / 30 A · 10 AWG`. Headline: **"$675 of fixes. Half the heater."** (the one place a rounded dollar total is allowed, since no buy button sits directly beside it — the headline text, not a `[data-buy-group]`). Both framings are shown (§0.2). Each fix row has a buy button (verified ASIN or tagged search). The cart button stays dark until ASINs are verified — **and those 4 ASINs are a P0 owner task, not P1** (§0.3, §8.5). | Shown only when the fixes drop a circuit or equipment tier (spec §14.6). Otherwise it becomes the "Your garage is already tight" note. |
| 3 | **WHAT FITS**: up to 3 spec plates | From `rankSystems`: safety tier first, then 5-year TCO weighted by priority. Each plate shows OUTPUT, CIRCUIT, **FIT bar** ("92% of your load"), RUN COST at their price, and PRICE CLASS `$$`. There is **one required safety line in alarm red on the plate** — every heater `Product` must carry `safetyLine`, and a commerce test fails the build if a heater product is missing one (§9.4, a compliance finding: our old spec plate's safety line was optional, so an electric heater with no flammables question asked got a plain GO with no warning at all). Every plate's safety line also carries **"Manual: not where gasoline, paint or flammable liquids are used or stored. Move them to an outdoor shed or cabinet first [S]"** whenever the planner's `flammablesStored` answer is not `no` (new rule **S12**, §2.5). A fixed/wall-mounted heater plate additionally carries "Elements ≥ 18 in above the floor (IRC M1307.3)." Buttons: the primary partner, with Amazon always second. **"Why not…?"** lines: torpedo (always), diesel in an attached garage (always, unlisted-heater rule), Buddy-type propane (always — it is never a buyable plate, only a why-not line to `/can-i-run-it`), 120 V when undersized. | A house-side CO alarm is auto-attached, pre-checked and uncheckable, on every combustion plate; a garage-rated CO monitor is added only when a verified `garageRated` fact exists for that product (§2.2, §2.8). **Buddy-type propane is never rendered as a plate with a buy button, attached or detached garage** (§2.5, a compliance finding — see the propane-scope rewrite in §2.8). |
| 4 | **SAFETY** | The `warnings[]` from S1–S12, a 3 px `--alarm` left bar, imperative copy and code citations as R chips, **each carrying its code edition** (e.g. "NEC 2023 §210.23(A)(1)") from `lib/facts/codes.ts`'s `editionBySection` table (a compliance finding: states enforce NEC editions from 2017 to 2026, and the 2026 NEC renumbered Article 220 to Article 120). A block-level item (S3/S4/S7/S12) sits above the plates when it removes a class. | `SAFETY_SCOPE` renders directly under this section's heading, not just in a footer: "General information. Your electrician, gas fitter, local code and the heater's manual govern." |
| 5 | **FIG. 2 · WHERE YOUR HEAT GOES** | Horizontal bars, sorted: `CEILING 34% · AIR LEAKS 24% · BIG DOOR 23% · SLAB EDGE 9% · WALLS 8% · WINDOWS & DOORS 4% · HOUSE WALL −3%`. Each bar with a fix carries a link: `Fix this → R-30 blown ceiling · pays back in 0.5 yr at your price` (no dollar figure on the row itself, per the Amazon-adjacency rule above). | Bars carry text values, so the chart is not colour-only. |
| 6 | **POWER IT**: circuit card | `circuitFor()`: breaker, Cu gauge (NM vs THHN), GFCI rule (NEC 210.8(A) for any 125–250 V garage receptacle), 208 V derate, and **panel check**: "100 A panel + a 30 A+ heater → ask for an NEC load calculation (2023 §220.83 / 2026 §120.83 — your local adopted edition governs)"; "EV charger on the panel? Tell your electrician." A plug adapter (e.g. 14-50→6-30) or an ungrounded NEMA 10-30 dryer outlet routes to a hard stop here, not a soft warning. Buttons: `Print the Electrician Brief` (free, §2.6) and, only if `LEADS_PROVIDER` is set, `Request installer quotes · Sponsored` (§6.1, §2.8 — copy revised, no phone/name field on our own page). | NEC sections appear as R chips with their edition. |
| 7 | **PRICE IT** | Per hour, per session, per month and per season for: electric resistance, cold-climate heat pump (capacity only; the 5-year cooling-credit TCO ships March 2027), NG vented 80%, propane bulk vented, propane cylinder (the exchange trap: about $83/MMBtu vs $36.5 bulk [C]) and diesel (η 0.78). Every price has an as-of date. The diesel-vs-electric crossover is stated at their ¢/kWh. `SAVINGS_VARY` (§5.2) renders under every percentage-cut or payback claim on this section. | Continuous mode uses HDD at T_bal. Session mode uses the §7 simulation. |
| 8 | **FIG. 3 · WARM-UP** | Temperature vs minutes for plate 1 on an average January day. Model line **dotted**; label `PREDICTION`. Once BH-004 publishes, the measured curve overlays as a **solid** line with an M chip. | A clock readout `00:00 → 01:56` draws with the curve (`stroke-dashoffset`, §4.8). |
| 9 | **SHOP NOTES** (useCase = shop only) | "Keep open flame and glowing elements away from sawdust and solvent vapour (S10, S11)"; separated-combustion units (Hot Dawg HDS) when combustion is chosen; glue and finish minimum temperatures **only when the facts carry `status: 'verified'`** (Titebond Original/II/III [VERIFY]). | Rendering is blocked until verified — the whole sentence, not a blank in the middle of one (§9.4, §9.6). |
| 10 | **WHAT WE ASSUMED** | Every `[A]` value used, with its sensitivity ("One draft class leakier: +3,500 BTU/h"), and a link to each methodology anchor. A "Show the math" accordion lists UA per surface, ΔT, station, T_bal and HDD. | |
| 11 | **KEEP IT** | `Email me this report` (copy revised, §2.4) · `Alert me before the next hard freeze` (ZIP3-tagged, NWS-forecast only, §7.6) · **Heat Report Pro** card — v1 shows "Heat Report Pro opens Oct 15 · Notify me" until checkout and `PRO_REVIEWED` are both set (§2.7) · `Help calibrate: how long does your heater take?` (a 4-field form: heater kW or BTU, start °F, end °F, minutes → `CENSUS_ENDPOINT`, falling back to a pre-filled `mailto:`). | |

### 2.3 URL state, share and permalink

**In-flow state lives in the query string.**
- URL: `/garage-heater-calculator?g=<code>&step=<1-5|r>&focus=<seal|power|price>`.
- **It is read with `useSyncExternalStore`, not `useSearchParams()`.** `const qs = useSyncExternalStore(sub, () => location.search, () => '')`, where `sub` listens to `popstate` plus a custom `bh:nav` event dispatched right after every `history.pushState`/`replaceState` call. This is a direct fix for a feasibility finding: `useSearchParams()` inside `<Suspense>` triggers `BAILOUT_TO_CLIENT_SIDE_RENDERING` in this Next.js version — the static HTML would ship only the `<Suspense>` fallback, crawlers would see a skeleton, and the swap would cause CLS. With `useSyncExternalStore`, the page stays `○` static, renders **example A in full** during SSR (real numbers, real tables, for crawlers and LLMs), and re-renders from the URL after hydration with no bailout. The same pattern applies to `/can-i-run-it`'s `?h=` state.
- Written with `window.history.replaceState` on every change, and `pushState` on step change so Back works.

**The codec** (`lib/planner/codec.ts`, versioned, human-readable, URL-safe, `.`-separated). It encodes a **`CodecInput` subset** of `GarageInput` — not the full type. `decode()` fills everything else from `presets.ts`/`defaults.ts` (a 2-car door defaults to 16×7; `commonWallLen = depth`; `windowsFt2 = n × 12`; station and state come from the ZIP3 token). This is a direct fix for a feasibility finding: the v1.0 codec silently dropped `stationId`, `state`, `roofPitch`, `commonWallLen`, door dimensions, `windowType`, `serviceDoorFt2`/`Type`, `slabEdge`, `tHouse`, `doorOpeningsPerSession`, `designTempOverride` and `priceOverrides.dieselPerGal`, and quantised `windowsFt2` to 12 ft² steps, so `decode(encode(x))` could never equal `x` for a general `GarageInput`. Worked example A encodes as:

```
1.606.2A.24x24x9n1.w13.cd0.ds.ta.55s2x4g60.cb30+p200.fE.pb.z0.xshop
```

| Pos | Token | Values |
|---|---|---|
| 1 | version | `1` |
| 2 | location | ZIP3 `606`, **or** a USPS state `IL` for the state fallback. **ZIP5 is rejected by `decode()`, never encoded.** |
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
| 13 | flammables | `z` + `1` (yes) `0` (no) `u` (unknown/don't know — treated as `1` downstream) |
| 14+ | optional | `x{shop,gym,hang,car,keep}` use case · `e{19.2}` own ¢/kWh · `n{1.09}` own $/therm · `q{2.50}` own $/gal propane · `d{6.53}` own $/gal diesel |

- **Decode failure** (a bad or future token) falls back to the default input, with a notice: "That link came from a different model version; we loaded the example garage."
- **Round-trip test** is required over the **codec domain only**: `decode(encode(x))` deep-equals `normalize(x)` for 200 seeded random `CodecInput` values plus example A, and `encode(decode(s)) === s` for 50 canonical strings.

**Permalink `/r/[code]`** (a deliberate `ƒ` route):
- It decodes, runs `plan()` on the server and renders the full report.
- `robots: { index: false, follow: true }`, **and no `alternates.canonical`** (a feasibility finding: `noindex` combined with a `canonical` pointing elsewhere is a conflicting signal). `/r/` is **removed from `app/robots.ts`'s `disallow` list** — a blocked path with a blocked OG image gets no card at all on X or LinkedIn, since both crawlers respect `robots.txt` before fetching a preview image. A `next.config.ts` header rule adds `X-Robots-Tag: noindex` on `/r/:path*` as a second, crawler-independent signal. `/r` stays out of the sitemap.
- `generateMetadata` gives the title `Garage Heat Report R-2A-606-7F3A · BayHeat`.
- `opengraph-image.tsx` renders 1200×630:
  - left: the thermal poster PNG for the preset and state, read from `lib/og/posters.generated.ts` (a base64 data-URI map baked at build time, not a runtime file-system read of `public/thermal/*.png` — a feasibility finding: Vercel's file tracing does not reliably bundle a `public/` path computed at request time, which fails with `ENOENT` in production only);
  - right: the grade letter, `31,700 → 13,000 BTU/h`, `10 kW / 60 A → 5 kW / 30 A`, `2-CAR · ATTACHED · ZIP 606xx`;
  - a Forge scale bar along the bottom;
  - the Spot Mark and serial bottom-left.
- The CTA is `Plan your own garage →`.
- `Copy link` copies `/r/<code>`. `Save image` downloads the OG PNG (`/r/<code>/opengraph-image`). `Share` uses the Web Share API when available.

**Local memory.**
- On completion, the code is stored in `localStorage["bayheat:garage"]`, read through `useSyncExternalStore`.
- It powers the sticky **"Your garage: 13.0k BTU/h · B"** bar, and a small **`YourGarageChip`** island (≤ 2 KB) on money pages that reads a summary JSON `{code, qSize, grade, kw, breakerA}` from local storage — **MiniSizer is cut from v1** (§4.5, §9, a feasibility finding: running `plan()` client-side on every V page shipped the whole engine, 113 stations and the zip3 table into every money page). A `Fit to my garage →` link takes the reader to a pre-focused planner instead.
- It is wrapped in try/catch. Absence is normal.

### 2.4 Email capture points (Kit, double opt-in, env-gated)

| Point | Copy | Kit tags | Fallback when `KIT_API_KEY` is unset |
|---|---|---|---|
| Result → Keep it | "Email me this report. You'll get the link now, then 6 emails over 12 days with fixes and product picks (some links pay us), and a few seasonal emails. Unsubscribe any time." (a compliance finding: our old "no spam, one welcome series" promise didn't match the sends actually planned in §7.6) | `planner`, `zone-{1-8}`, `use-{case}`, `state-{XX}` | `Copy link` plus a `mailto:` pre-filled with the permalink |
| Every content page, above the footer (one per page) | "One email when a hard freeze is forecast near you: at most 1 every 7 days, 4 per season. It may include one product link that pays us. ZIP: [___]" | `alerts`, `zip3-{606}` | Hidden, replaced by "Bookmark the planner" |
| Electrician Brief print dialog | "Email me the Brief as a link" | `brief` | mailto |
| Heat Report Pro (v1.1) when checkout is unset | "Notify me when Pro opens (opens Oct 15)" — **no price is quoted here or anywhere pre-launch beyond "Launch price $14"**; nothing about a future $19 appears on any page, email or OG image (§2.7, a compliance finding) | `pro-waitlist` | mailto to `hello@` |
| `/cost-to-heat-a-garage` | "Get the monthly Garage Heat Index (first Tuesday)" | `index` | mailto |
| `/lab` and reports | "Get Lab Reports when they publish (about 2 a month)" | `lab` | mailto |

**Implementation.** The Server Action is `app/actions/subscribe.ts`.
1. Honeypot field `company`, plus a 2 s minimum dwell check.
2. `POST https://api.kit.com/v4/subscribers` with body `{email_address, state:"inactive", fields:{zip3, source}}` and header `X-Kit-Api-Key`.
3. `POST /v4/forms/{KIT_FORM_ID}/subscribers` with `{email_address, referrer}`. The form's double opt-in sends the confirmation [VERIFY on the first live test].
4. Tag via `POST /v4/tags/{id}/subscribers`, using the IDs from `KIT_TAG_IDS`.
5. Return `{ok, mode: 'kit'|'fallback'}`. **Never** block the UI on email.

**Every promotional send goes only to a recipient whose tags are a subset of what they consented to** — the email desk (`email-desk` agent) blocks any send whose segment tags aren't a subset of the recipient's consent tags (a compliance finding: `planner`/`alerts` opt-ins don't automatically license Black Friday, Index or Lab sends). Every email carrying a paid link opens with the exact Operating Agreement §5 sentence used in `DISCLOSURE_INLINE`/`DISCLOSURE_FOOTER` (§5.3), labels each paid button `Paid link`, and the footer carries the postal address and a one-click unsubscribe (CAN-SPAM).

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

  Tests: example A as-is → D (0.995); seals + kit → C (0.717); all three fixes → B (0.423); bare & leaky → F (1.503). The formula is published on the methodology page (`#grade`). **It is a computed metric, never a review score**, and it is never rendered as a bare colored bar — the letter and its word (e.g. "D · HEAT ESCAPES") are always shown together (a taste finding: the grade scale inverts the usual red-bad/green-good convention on purpose, so a fast skim must never be asked to read color alone).
- **Candidates.** Spec §12 classes × units (1–2, or up to 3 for 120 V). Capacity at design:
  - electric: nameplate;
  - heat pump: `cap(h99) × rated47`;
  - gas: input × η.
- **Hard filters.**
  - Fuel availability. **Vented gas unit heaters require `natural_gas` or `propane_bulk`; propane cylinders alone never qualify a vented-gas recommendation** (a compliance finding — the planner could otherwise pair a vented unit heater with cylinder-only fuel input, which isn't a real installation).
  - Unvented heaters are excluded for continuous or unattended use. Torpedo heaters are always excluded. **Buddy-type unvented propane is never returned as a `RankedSystem` with a buy button at all** — it only ever appears as a `WhyNot` entry linking to `/can-i-run-it` (§2.2, a compliance finding).
  - **New hard filter (a compliance finding):** when `usage.mode === 'continuous'` or `useCase` is `car` or `keep`, cord-connected portable classes are excluded unless the fact `manualAllowsUnattendedThermostat === true` [S] exists for that product. Hardwired, thermostat-controlled heaters and purpose-made freeze kits rank instead. Every portable plate that does qualify carries: "Attended use. Unplug when you leave [S]."
  - Vented gas requires `ventingPossible`.
  - A circuit must fit, unless `canAddCircuit`; then add the circuit cost ($300–900; sub-panel $1,000–2,500).
  - Capacity ≥ Q_req (≥ 60% in "edge-off" spot mode).
- **Safety tier.**
  - Tier 1: electric, heat pump, vented or separated-combustion gas.
  - Tier 2: diesel with outdoor exhaust, **and only ever shown when `attached === false`** — its plate's first safety line is "No UL/CSA listing for building heat" (§2.8, a compliance finding: an unlisted diesel burner installed through an attached garage's wall is the highest-liability recommendation on the roadmap).
  - Tier 3: unvented, spot use only. **It never renders as a `SpecPlate` with a buy button in the planner, attached or detached garage** — only as a "why not / spot heat" line to `/can-i-run-it` (a compliance finding, tightened from the v1.0 rule that only excluded it from "plate 1" in attached garages).
- **Score** (lower is better): `TCO₅ = equip_mid + install_mid + circuitCost + 5×annualCost + warmupPenalty + coolingCredit`, weighted by priority:
  - upfront: ×2 on upfront;
  - running: ×2 on annual;
  - fast: ×3 on warm-up.
  - `coolingCredit` is `0` until the cooling engine ships (March 2027, §9).
- **Insulate-first injection.** If measures with payback under 3 years drop a circuit tier or equipment class, the Fix-First card leads (§2.2 section 2).
- **S1–S12 warnings.** **S12 is new:** on every heater plate where `flammablesStored !== 'no'`, show "Manual: not where gasoline, paint or flammable liquids are used or stored. Move them to an outdoor shed or cabinet first [S]." `Product.safetyLine` is required for every heater `ProductKind`; a commerce test fails the build if it's missing (§2.2, §9.4).
- **Products.** Each class maps to product IDs in `lib/commerce/products/*.ts` (split by lane, §9.3).
  - Only the 5 verified ASINs link to `/dp/`: CZ220 `B009F1SWH8`, FUH54 `B00PX0T37I`, CZ798 `B004VVJANC`, DR-975 `B01M8KXXAB`, HS-1500-TT `B07JQPCFJ3`.
  - Everything else uses a tagged search link: `https://www.amazon.com/s?k=<query>&tag=<tag>`.
  - Partner routing is in §6.2. `Product.priceClassSource: 'msrp' | 'non_amazon_retailer'` is a required field (§6.1, a compliance finding).

### 2.6 The free Electrician Brief (print view, no Amazon links)

`Print the Electrician Brief` toggles `data-print="brief"` and calls `window.print()`. The print stylesheet hides everything except `<ElectricianBrief>`.

Contents (US Letter, one page):
- the garage summary;
- the design load and band;
- the recommended class and nameplate kW;
- `circuitFor` output: breaker, conductor (NM and THHN), GFCI note, disconnect-within-sight note, 208 V derate;
- clearances from the manual [S];
- a **thermostat spec** — "line-voltage, double-pole, rated ≥ {amps} A; your electrician wires it per the heater manual" — **not a wiring diagram** (§2.7, a compliance finding: generic 240 V wiring instructions sold or handed to a DIYer vary by model and are a liability, not a convenience);
- a panel check with a toggle between the **NEC 2023 §220.83** and **NEC 2026 §120.83** load-calculation methods (§5.2, a compliance/feasibility finding: the 2026 NEC renumbered and re-derived this section, so a single hard-coded citation goes stale mid-season);
- **6 questions to ask on a quote:**
  1. "Is my panel's load calculation OK?"
  2. "NM or THHN in conduit?"
  3. "GFCI required on this receptacle?"
  4. "Disconnect location?"
  5. "Permit and inspection included?"
  6. "Mount height and clearances per manual?"
- a QR code to `/r/<code>`, and the footer `Generated by BayHeat · bayheatguide.com · R-2A-606-7F3A · model v1.0.0`.

**The print CSS removes every `a[href*="amazon."]`.** A test enforces this (§9.6).

### 2.7 Heat Report Pro (`/heat-report-pro`, ships v1.1, no earlier than 2026-10-15)

Pro moves out of the v1 launch set (§0.1, §0.3). Two independent red-team findings forced this: it earns $0 until a Polar account exists (owner task P1, by Oct 11), and it sold electrical how-to material — generic thermostat wiring diagrams and a single-NEC-edition load-calculation worksheet — with no licensed reviewer signed and, worse, tied to a NEC section number (220.83) that the 2026 NEC renumbered to 120.83 with a revised method. Selling that content the same week it goes stale is both a liability and a correctness problem. Building it after Polar is live and a reviewer has signed also removes an entire extra `ƒ` route (`/api/pro/verify`) from the v1 build-session critical path.

- **v1 (Oct 2 launch):** the result "Keep it" card and `/heat-report-pro` both read "Heat Report Pro opens Oct 15 · Notify me" (Kit tag `pro-waitlist`, falling back to `mailto:`). No checkout, no token verification, no print route ship in v1.
- **v1.1 launch content (revised per compliance findings):**
  1. a **panel discussion worksheet for your electrician** (not a load calculation) — a toggle between NEC 2023 §220.83 and NEC 2026 §120.83, pre-filled with the heater; EV charger and appliance lines to fill in;
  2. a **3-quote comparison sheet** with the job spec;
  3. good / better / best equipment options with install specs;
  4. **a thermostat spec sheet**, in place of the generic wiring diagrams that were item 4 in v1.0 — "line-voltage, double-pole, rated ≥ {amps} A; your electrician wires it per the heater manual";
  5. a **month-by-month cost table** at the buyer's own rate;
  6. a measure-by-measure fix-first shopping list with payback and quantities (feet of seal for their door width);
  7. a CO, clearance and venting checklist — **this item ships only after the gas reviewer signs**;
  8. from March 2027, a cooling and dehumidifier appendix (free for existing buyers).
- **No Amazon links inside.** Items link to bayheatguide.com pages.
- **Checkout stays hidden until `PRO_REVIEWED=electrical,gas` is set** — i.e. until both the licensed-electrician and gas/HVAC reviewers have signed off on every page Pro references (§5.6, a compliance finding).
- **Checkout:** a hosted link from `NEXT_PUBLIC_CHECKOUT_URL_PRO` (Polar recommended: 5% + 50¢, merchant of record). The success URL is `/heat-report-pro/print?g={code}`.
- **v1.1 unlock** (testable with no account):
  - The print page asks `POST /api/pro/verify {code, t}` (a deliberate `ƒ` route).
  - The handler checks `t = base64url(HMAC-SHA256(PRO_UNLOCK_SECRET, code))` and returns `{ok}`.
  - Tokens are minted by `scripts/pro-token.ts` (Commerce Desk, on a manual fulfillment email) until the Polar webhook lands (`app/api/polar/webhook/route.ts`, `POLAR_WEBHOOK_SECRET`). The webhook will email the tokenized link.
  - Without `PRO_UNLOCK_SECRET`, pages 1–2 render as a real sample (example A) and the CTA reads "Notify me".
- **Refunds:** 14 days, no questions asked.
- **Pricing rule and copy (a compliance finding):** the page, every email and every OG image say **only "Launch price $14."** Nothing about $19 appears anywhere before it actually takes effect. A price increase, if it happens, is announced at least 7 days ahead, and a struck-through price is never shown unless that price was actually charged for 28 or more days first (16 CFR 233.1 — a fictitious-former-price rule). If Pro sells fewer than 0.4 per 1,000 sessions by Dec 15, it drops to $12 instead of moving to $19; the Ops Analyst applies the rule, the owner approves. Call it a **"10-page report,"** not a "plan."

### 2.8 Other v1 signature features

**(a) Can I Run It? (`/can-i-run-it`).** A GO / ONLY IF / NO-GO verdict in about 20 s, with citations. It targets:

| Search | Volume/mo |
|---|---:|
| kerosene heater indoors | 22,200 |
| torpedo heater | 14,800 |
| indoor safe propane heater | 9,900 |
| gas heater indoor | 5,400 |
| ventless propane | 4,400 |
| is it safe to use propane heater in garage | 90 (390 at peak) |

- **Step 1, heater tiles:** 120 V portable · 240 V hardwired · Buddy-type propane (unvented radiant, ODS) · Forced-air "torpedo" · Kerosene convection · Diesel air heater · Vented gas unit heater · Mini-split.
- **Step 2, situation taps:**
  - attached / detached;
  - **"Gasoline, paint or solvents stored here?" — Yes / No / Don't know (`unknown` treated as `yes`)**;
  - living space above?
  - unattended or overnight?
  - fresh-air opening?
  - the outlet's circuit (120 V/15 A shared · 120 V/20 A dedicated · extension cord · 240 V/20 · 240 V/30, plus an explicit "plug adapter in use?" and "is the 240 V outlet grounded?" tap — a compliance finding closing the adapter/ungrounded-outlet gap in §2.1 step 5);
  - cylinder (1-lb / 20-lb) and where it's stored (outdoors / in the garage / in the house);
  - exhaust and intake routed outdoors?
  - CO alarm installed, and where (house / garage / both)?
  - **"UL, CSA or ETL mark on the heater?" — Yes / No / Don't know** (a compliance finding — a new required question; No or Unknown routes combustion heaters to NO-GO and electric heaters to GO-IF);
  - garage size preset (for the IFGC 621.5 check, labeled below as a borrowed extra check, not a governing code section);
  - **an optional ZIP field**, used only for the state/city safety overlays below.
- **Engine:** `lib/safety/verdict.ts` is pure. It returns `{verdict, conditions[], saferAlternatives[], stamp}`. Each condition is `{text, cite, ev: 'R'|'S'|'C', severity}`. **Every verdict must carry at least 2 conditions; a unit test enforces this** (a compliance finding — a bare "GO" with no conditions reads as a professional, unconditional assurance, and every real recommendation here rests on at least a listing check and a use condition).
- **Stamps:** `GO · PER MANUAL`, `ONLY IF`, `NO-GO` (renamed from "GO"/"GO-IF"/"NO-GO" — a compliance finding: a bare "GO" shared as an image reads as a professional ruling with no scope). `SAFETY_SCOPE` renders directly under every stamp, on the printable Safety Card, and burned into the OG `verdict` image variant.
- **Location overlays (new, a compliance finding — jurisdictions genuinely ban some of these heaters):**
  - ZIP resolves to Massachusetts → kerosene is always NO-GO (M.G.L. c.148 §25B bans unvented liquid-fired space heaters).
  - ZIP3 100–104, 111–114, 116, or ZIP3 110 with a ZIP5 in the covered range → kerosene and propane are always NO-GO (the FDNY prohibits both in NYC).
  - California unvented gas room heaters are flagged `[VERIFY Cal. H&S 19881]` pending confirmation, not yet enforced as a hard NO-GO.
- **The 24 required tests** (`lib/safety/verdict.test.ts`; renumbered and expanded from the original 20 to close specific gaps — inserted tests keep a letter suffix so the mapping to the original set stays traceable):
  1. Big Buddy + attached + overnight → **NO-GO**
  2. Big Buddy + detached + attended + fresh air + CO alarm + no flammables stored → **ONLY IF**, exactly 5 conditions: spot heat only while attended; 1-lb cylinders, or a 20-lb cylinder kept outdoors on the maker's hose and fuel filter; an 18 in² fresh-air opening; the manual's own clearances (rev L1: top 30 in, front 24 in, sides 6 in); never while sleeping; no gasoline or other fuel-burning appliance in the space; CO protection per the CO-alarm rule below. The manual's scope sentence prints verbatim on the verdict and on the propane hub.
  3. Buddy-type + gasoline, paint or solvents stored → **NO-GO** (the manual's own prohibition, quoted [S]; no NFPA 58 citation is used here since it was never verified)
  4. Torpedo heater + any enclosed garage → **NO-GO**, always — "BayHeat rule, stricter than some manuals."
  5. Kerosene + attached + sleeping above → **NO-GO**
  6. Kerosene + detached + attended + ventilation + no flammables → **ONLY IF** ("1-K kerosene only, never gasoline; refuel outdoors when cool")
  7. Diesel + exhaust indoors → **NO-GO**
  8. Diesel (unlisted) + detached garage + exhaust and intake outdoors + CO alarm → **ONLY IF**, 5 conditions: tell your insurer and code office first [R: IRC M1302.1]; exhaust passes through the maker's metal wall thimble at the maker's clearance to combustibles; the exhaust ends ≥ 4 ft from, and ≥ 1 ft above, any door, operable window or air inlet, and above the snow line (distances borrowed from IFGC 503.8, labeled as borrowed); CO protection per the rule below; never run it while sleeping, fill the tank outdoors.
  9. Diesel (unlisted) + **attached** garage, permanent install → **NO-GO** ("Attached garage: not for a permanent install of an unlisted diesel heater.")
  10. 120 V 1,500 W + shared 15 A, sole load → **ONLY IF**: "A 1,500 W heater draws 12.5 A, above the 12 A limit NEC 210.23(A)(1) sets for one plug-in appliance on a 15 A circuit. Listed heaters are built for these outlets, so: nothing else on that breaker, plug straight into the wall, stop if the plug or outlet feels hot. A 20 A circuit is the code-clean option."
  11. 120 V + extension cord → **NO-GO**
  12. 120 V + dedicated 20 A + no flammables stored → **GO**
  12b. 120 V + dedicated 20 A + flammables stored → **ONLY IF** (move the gasoline, paint and solvents out first)
  13. 4 kW + 240 V/20 A → **NO-GO** (needs 25 A)
  14. 5 kW + 240 V/30 A, breaker exactly 30 A, 10 AWG copper, grounded, hardwired or a matching plug, no flammables stored → **GO**
  14b. 5 kW + 240 V/30 A + flammables stored → **ONLY IF** (move the gasoline, paint and solvents out first)
  14c. Any plug adapter (e.g. 14-50 → 6-30) → **NO-GO**
  14d. NEMA 10-30 dryer outlet (ungrounded) → **NO-GO**
  15. 5 kW CZ220-class + gasoline stored → **ONLY IF**: "Move gasoline, paint and solvents out; every UL 1278 heater we list prohibits use where they are stored."
  16. Vented gas unit heater + attached garage + `natural_gas` or `propane_bulk` fuel (cylinders alone don't qualify) → **ONLY IF**: licensed gas fitter and permit; burner ≥ 18 in up (IFGC 305.3) **and** ≥ 6 ft up or guarded from vehicle impact (IFGC 305.5); CO alarms.
  17. Vented gas + solvent/sawdust shop → **ONLY IF** (separated combustion, S10)
  18. Mini-split → **GO**
  19. Unvented aggregate input over 20 BTU/h per ft³ of room volume → **NO-GO** — labeled "extra check borrowed from IFGC 621.5 (written for installed room heaters)", evidence mark `C`, not `R`, since it isn't the governing code section for a portable unvented heater.
  20. A refillable propane cylinder (20-lb or larger) stored **or used** in any garage, attached or detached → **NO-GO**: the manual says never bring a refillable cylinder indoors, and that cylinders must not be stored in a building, garage or other enclosed area [S]. No NFPA 58 section citation is used, since it was never verified against a primary source.
  21. 120 V portable + unattended or continuous use, with no verified `manualAllowsUnattendedThermostat` fact → **NO-GO**
  22. No UL, CSA or ETL mark on the heater → **NO-GO** for any combustion heater; **ONLY IF** for an electric heater (a bare minimum listing check)
  23. ZIP in Massachusetts + kerosene → **NO-GO**
  24. ZIP in the NYC ranges above + kerosene or propane → **NO-GO**
- **UI:**
  - The stamp is Archivo wdth 125, wght 900, with the stamp motion (§4.8).
  - Conditions are a numbered list with R/S chips, each R chip carrying its code edition.
  - "Safer alternatives for your situation": 2–3 classes. **Affiliate links appear only on safe alternatives and CO alarms, never next to a NO-GO product.**
- **Share:** the state goes into `?h=buddy&a=1&…` on the same static page (read with `useSyncExternalStore`, §2.3); the generic tool OG is used in v1.
  - v1.1 adds static scenario pages with their own OG: `/can-i-run-it/buddy-heater-in-garage` (Oct 8), `/kerosene-heater-in-garage` (Oct 13), `/torpedo-heater-in-garage` (Oct 15).
- **Printable Safety Card:** a half-page, ungated "tape it to the wall" card. It is co-brandable: `?dept=<id>` resolves against `lib/safety/cobrand.ts` entries `{id, name, permissionRef, grantedOn}` — the owner adds an entry only with written permission on file. An unknown or missing id prints a blank line, "Shared by: ______", never free text (a compliance finding: free-text co-branding is a false-endorsement exposure under the Lanham Act). The footer always reads: "Made by BayHeat (Laqaer Products). Not produced or endorsed by any agency unless named above with permission."

**(b) The Garage Heat Index (`/cost-to-heat-a-garage`).**
- **Definition (published on the page):** the season cost to hold a standard attached 2-car garage (24×24×9, R-13 walls, R-19 ceiling, uninsulated steel door, average drafts) at **50 °F**, for each state's population-primary station, per fuel, at the current EIA prices.
  - It is **computed by `scripts/build-index.ts` from `lib/planner`**. The preview JSON is not pasted.
  - Preview values for orientation only: US median about $548 electric; AK $2,579; IL $1,045; seals plus door kit cut about 27% (`SAVINGS_VARY` renders under this line, §5.2).
- **Page:**
  - an accessible SVG **tile map** (51 equal squares, Frost→Forge, labeled scale);
  - fuel toggle and a 40/50/60 °F setpoint;
  - a sortable 51-row table (the accessible fallback);
  - a "Cite this" box;
  - `Dataset` JSON-LD;
  - `Download CSV` at `/data/garage-heat-index.csv` and `/data/constants.csv`, both `force-static`, with dated snapshots such as `/data/garage-heat-index-2026-10.csv` added by the Data Desk. **License line:** "BayHeat-computed columns: CC BY 4.0. Climate inputs: ASHRAE Handbook—Fundamentals 2021 (cited, not licensed by BayHeat). Prices: EIA (public domain)." `constants.csv` **drops the raw `h99`/`h996` design-temperature columns** rather than relicense ASHRAE's own table under CC BY 4.0 (a compliance finding — the CSV as originally scoped would have relicensed ASHRAE inputs pulled from ashrae-meteo.info without permission); only our derived, computed columns ship openly.
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
- Evidence is R and C only. **No physical test is claimed, and no publisher is called "fake" or "parasite."** Each is quoted verbatim, with a link and retrieval date, and no adjectives. A right-of-reply email goes out **5 business days before publishing**, so a competitor named here always has a chance to respond first.

**(d) The Lab (`/lab`).**
- **Test board:** protocols P-002…P-005 pre-registered 2026-10-09, with each hypothesis and the model's prediction computed by the engine.
- **Status stamps:** `PRE-REGISTERED`, `RUNNING`, `PUBLISHED`.
- **Instrument inventory:** lists only items actually owned (empty until bought).
- **Evidence Marks legend**, and a link to the notebook.
- **Physical-test safety rules (a compliance finding tightening §5.6):** the dry-ice CO₂ test caps exposure at 5,000 ppm (the OSHA PEL) with no re-entry above that until the space is purged; dry ice is never sealed in a container, and insulated gloves are worn at all times. Combustion tests run only in a detached garage, with UL 2034 alarms placed in any adjoining building. A contracted Field Tester works under a written agreement: independent contractor, signed protocol, assumption of risk, insurance. Posted receipts have addresses redacted. BH-003 opens with "We earn commission on VEVOR sales via Awin; one unit, bought at retail," and gives the maker 5 business days to respond before publishing any adverse CO data.

---

## 3. Information architecture

### 3.1 Global navigation

**Desktop.** One line at ≥1024 px, 64 px tall, paper background, 1 px bottom rule.
- Wordmark lockup on the left.
- Nav in Archivo wdth 75, wght 600, 13 px caps, **set as dotted-leader rows in the spec-plate style** rather than a plain link list (a taste finding — it visually ties the primary nav to the instrument system): `PLANNER ···· HEATERS ▾ ···· SEAL & INSULATE ▾ ···· CAN I RUN IT? ···· THE LAB`.
- On the right, the Ember button `Size my garage`.
- Dropdowns are plain link lists in columns:
  - HEATERS: All fuels · Electric · 240 V · Portable · Ceiling · Wall · Infrared · Diesel · Propane · Electric vs propane · Size chart · Cost by state
  - SEAL & INSULATE: Bottom seal · Weather stripping · Door insulation kit · How to insulate

**Mobile.**
- 56 px bar: wordmark, a `Size` pill (Ember) and `Menu`. The menu opens full screen.
- **Desktop never gets a hamburger.**
- A sticky bottom CTA `Size my garage — 60 s` appears after the hero scrolls away and hides while the planner is on screen.
- Once a garage is saved, it becomes the **"Your garage: 13.0k BTU/h · B"** bar.
- **No chip ever sits above the rail** on a V page (a feasibility finding on the 700 px budget, §3.2, §4.9).

**Footer (paper, 4 columns).**
1. The spine: Size it · Power it · Price it · Fix it.
2. Tools: Planner · Can I Run It? · Garage Heat Index · Methodology.
3. The Lab: Lab · BH-001 · Notebook & corrections · How we work.
4. Company: About · How we make money (`/how-we-work#money`) · Privacy · Terms · `hello@bayheatguide.com`.

Below the columns:
- the site-level Lab stamp: `MODEL v1.0.0 · PRICES AS OF 2026-09 · LAST CORRECTION —`;
- the Amazon sentence, the Laqaer Products line and the postal address (from env).

### 3.2 Page anatomy: the Report template (`components/page/ReportPage.tsx`)

Every content route uses the Report template, which has two variants. **A taste finding noted that 15 fixed modules in a fixed order, repeated across ~20 money pages, reads as programmatic assembly by the third page a visitor opens** — two changes address this: the figure component **rotates by page type** (GarageSection / ExplodedGarage / DisagreementStrip / ClassSilhouette — not always the same 4:3 camera frame), and 4–5 of the 15 modules (the seal-first bridge, buy-this-not-that, the comparison table, the Cold Snap capture) are **conditionally present or reordered by page kind** rather than hard-fixed on every page. The template's module order and content are independent of its surface: `/garage-heaters` and `/electric-garage-heater` render the same 15-module `verdict-first` structure with `data-surface="camera"` set on their route layout (§4.1, a CRITICAL taste finding), with plates and tables sitting in inset `--surface` panels; every other content route stays on Report.

**`verdict-first`** (buy-intent pages). The first 700 px at 390×844 must contain the H1, the answer block, the disclosure and the top edge of plate 1. **A feasibility finding showed the original stack ran to ≈720–750 px at this width, so the following are now hard rules, tested in CI, not guidance:** the H1 is at most **60 characters** (a page-registry test enforces it), the answer block is **40–50 words** (narrowed from 40–70), and no chip sits above the rail on mobile.
1. Breadcrumbs, 12 px.
2. **Lab stamp**: one line, 28 px, Martian Mono 11 px, e.g. `G-014 · REV 1 · CHECKED 2026-10-01 · MODEL v1.0.0 ▾` — **no claim-count numbers** (a feasibility finding: an RSC header can't count the `<Num>` elements rendered below it, since there's no shared render context to count across). The expansion shows sources, the evidence legend, the dynamic `AI_LINE` (§5.3), and technical review status and date.
3. **H1** (with a number, a garage noun or a decision; ≤ 60 characters on V pages).
4. **Answer block**: 40–50 words of computed specifics, with evidence chips on the decision numbers. It has a stable anchor, `#answer`. **A dollar figure never appears in an H1, a title or the answer block** — prices move to the body (a feasibility/compliance finding: a diesel price moved from $5.454 to $6.529/gal in 5 EIA weeks, so any dollar figure in a headline goes stale within days).
5. **Disclosure line**: "Paid links: we earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases." It sits inside a `<PaidZone>` wrapper that every `BuyButtons` component requires — `BuyButtons` throws if rendered outside one (§6.1, a compliance finding covering client-rendered commerce a static-HTML-only lint script couldn't see).
6. **Verdict Rail**: at most 3 spec plates. A `YourGarageChip` (≤ 2 KB, reads local storage) sits inline above the rail on desktop and collapses to a `Fit to my garage →` link on mobile — **MiniSizer is cut** (§2.3, §4.5, §9).
7. **FIG. 1** (rotated per page kind, see above), then the body in columns 3–9. On desktop, a sticky right rail (columns 10–12) holds "Your garage" or a `Size my garage` CTA.
8. The **seal-first bridge**, on heater pages where it applies: "Sealing this garage first saves ≈X BTU/h" → bottom seal and door kit (no dollar figure on this row).
9. A **Buy this, not that** block, where it applies: at least one thing not to buy, and why.
10. The comparison table, where relevant.
11. Safety at the point of risk, with `SAFETY_SCOPE` directly under the heading.
12. The **Next step** module, one step down the spine.
13. The Cold Snap alert capture, where it applies.
14. Numbered sources, each code citation carrying its edition.
15. Revision history.

**`report-first`** (tools, safety, data, lab, how-to). Same order, with two differences:
- FIG. 1 comes right after the answer block.
- Picks, if any, come after the first body section.

### 3.3 v1 routes (all live by Fri 2026-10-02)

- All pages live under `app/(site)/`.
- **V** means verdict-first; **R** means report-first.
- Volumes are US monthly averages, with the peak in parentheses.
- Every H1 number is computed at build time from `lib/planner` or `lib/facts`. The numbers shown here are for example A. **No H1 or title carries a dollar figure** (§3.2).

| # | Path | Type | H1 (≤ 60 chars on V pages) | Target keywords (vol/mo) | Primary CTA | Monetization |
|---:|---|---|---|---|---|---|
| 1 | `/` | Home | "One garage. Seven answers. 10,200–40,300 BTU/h." | garage heater 27,100 (long term via hubs) · brand | ZIP field + `Size my garage` | Via planner; picks on the hero plate |
| 2 | `/garage-heater-calculator` | Tool (R) | "Garage heater calculator: BTU/h, breaker and cost" | garage heater calculator 880 (2,900 Jan) · size calculator 390 · garage btu calculator 320 · btu calculator garage 320 · btu calc garage heater 210 · how many btu to heat a garage 210 (1,600) | `Size my garage` (step 1) | Plates (tag `_PLANNER`), Pro waitlist, email |
| 3 | `/garage-heater-calculator/methodology` | Reference (R) | "How the planner gets 31,700 BTU/h: every formula" | citation magnet · AI answers | `Try it on your garage` | None (trust) |
| 4 | `/r/[code]` **ƒ, noindex, follow** | Report permalink | "Garage Heat Report R-2A-606-7F3A" | (share loop) | `Plan your own garage` | Plates, Pro waitlist |
| 5 | `/can-i-run-it` | Safety tool (R) | "Can I run this heater in my garage?" | kerosene heater indoors 22,200 · torpedo 14,800 (safety slice) · indoor safe propane 9,900 · gas heater indoor 5,400 · ventless propane 4,400 | `Check my heater` | Safe alternatives and CO alarms only (tag `_SAFETY`) |
| 6 | `/cost-to-heat-a-garage` | Data (R) | "What a 2-car garage costs to heat, by state" | cost to heat a garage 50 (PR asset) · most efficient way to heat a garage 110 (390) | `Download CSV` / `Size my garage` | Email (index), planner |
| 7 | `/data/garage-heat-index.csv` | Data file (`force-static`) | – | Dataset Search | – | – |
| 8 | `/garage-heater-size` | Matrix (R) | "What size heater for a 1-, 2- or 3-car garage" | how many btu to heat a garage 210 · for 3-car 170 (480) · 2-car 90 · what size heater for garage 50 · garage heater size 70 | `Size my garage` | Planner deep links |
| 9 | `/garage-door-bottom-seal` | Money (V) | "Garage door bottom seals: close the gap" | **garage door bottom seal 27,100 (33,100 Oct)** | Door Leak Meter → `Check price` | Amazon seals and retainers |
| 10 | `/garage-door-weather-stripping` | Money (V) | "Weather stripping: cut a 2-car garage's heat loss" | **garage door weather stripping 22,200 (40,500 Nov)** · door insulation strip 2,400 | Door Leak Meter | Amazon |
| 11 | `/garage-door-insulation-kit` | Money (V) | "Door insulation kits: when a kit barely helps" | **garage door insulation kit 22,200** · panels 5,400 · cellofoam 4,400 · owens corning 2,400 · DIY 2,400 · best 590 | Kit Payback Meter | Amazon, Home Depot (env) |
| 12 | `/how-to-insulate-a-garage` | Guide (R) | "How to insulate a garage in payback order" | how to insulate a garage 2,400 · garage insulation 9,900 · garage insulation kit 2,400 | Kit Payback Meter | Amazon (seal, kit, batts), Home Depot |
| 13 | `/garage-heaters` | Hub (V) | "Garage heaters by fuel, at your own prices" | **garage heater 27,100** · heater to heat garage 14,800 · good garage heater 5,400 | Fuel Cost Meter → `Size my garage` | All partners |
| 14 | `/electric-garage-heater` | Hub (V) | "Electric garage heaters: 1.5 kW spot to 10 kW" | **garage heater electric 14,800 · heating garage with electric heater 14,800** · electric shop heater 4,400 · garage space heater electric 1,300 | Circuit Checker | Amazon (5 verified ASINs) |
| 15 | `/240v-garage-heater` | Money (V) | "240 V garage heaters: the breaker each one needs" | electric garage heater 240v 1,300 · 240v garage heater 590 (1,600) · 240v electric heater 480 | Circuit Checker | Amazon (CZ220, FUH54, DR-975); **lead slot live at launch** (env-gated, §6.1 — pulled forward from v1.1 per a revenue finding) |
| 16 | `/portable-garage-heater` | Money (V) | "Portable heaters: 1,500 W needs its own breaker" | portable electric garage heater 4,400 · electric garage heater 120v 3,600 · space heater for garage 3,600 · garage portable heater 3,600 · plug in 480 | Circuit Checker (120 V mode) | Amazon (CZ798, HS-1500-TT) |
| 17 | `/garage-heater-installation-cost` **(new to v1, moved from v1.1)** | Money (V) | "What a garage heater install actually costs" | installing a garage heater 1,000 ($18.01 CPC) · installation cost 260 ($13.98) · 240 V outlet cost 170 ($7.94) | `Request installer quotes · Sponsored` (env), free Brief | Lead slot (env), free Brief, Pro waitlist (a revenue finding: this is the single highest-CPC page in the whole keyword set and shouldn't wait 3 weeks) |
| 18 | `/infrared-garage-heater` | Money (V) | "Infrared vs forced-air: which wins door-open" | infrared garage heater 2,400 (9,900 Jan) · ir garage heater 2,400 · forced air heater for garage 1,900 · radiant 1,600 | `Size my garage` | Amazon |
| 19 | `/best-wall-mount-garage-heaters` (kept URL) | Money (V) | "Wall-mount garage heaters: what each one needs" | wall mount garage heater 210 (720) · wall mounted electric garage heater 210 | `Size my garage` | Amazon (FUH54, DR-975, HS-1500-TT) |
| 20 | `/diesel-heater-for-garage` | Money (V) | "Diesel vs electric, this week's price, per hour" | **diesel heater for garage 6,600 (27,100 Jan)** · garage diesel heater 6,600 · best diesel 480 (1,600) · vevor for garage 880 | Fuel Cost Meter | VEVOR/Hcalory via Awin (env), falling back to Amazon search; CO alarms; disclosed commission upfront |
| 21 | `/propane-heater-for-garage` | Money (V) | "Propane heaters for garages: what the manual allows" | **propane heater for garage 9,900** (+ LP, LPG and gas variants, 9,900 each) · vented propane 6,600 · portable propane indoor 4,400 | `Check my heater` (Can I Run It?) | CO alarms; safe-alternative Amazon links only (Buddy-type is never a buy plate here, §2.5) |
| 22 | `/electric-vs-propane-garage-heater` (kept URL) | Guide (R) | "Electric vs propane vs gas vs diesel, per state" | electric vs propane garage heater 90 (390) · gas vs electric 170 | Fuel Cost Meter | All partners |
| 23 | `/lab` | Lab (R) | "4 pre-registered tests, predicted before measured" | brand trust | `Get Lab Reports` | None |
| 24 | `/lab/reports/bh-001-the-4x-problem` | Report (R) | "BH-001: seven answers, one garage" | calculator cluster · linkbait | `Size my garage` | None |
| 25 | `/lab/notebook` | Changelog (R) | "Lab notebook: every release and correction" | trust | `Report a problem` | None |
| 26 | `/how-we-work` | Standards (R) | "How we work: 7 pledges and how we make money" | E-E-A-T, FTC | – | None |
| 27 | `/about` (kept URL) | Company (R) | "About BayHeat: an open garage-climate model" (drops "the people who check it" until `NEXT_PUBLIC_EDITOR_NAME` is set) | brand | – | – |
| 28 | `/privacy` (kept URL) | Legal | "Privacy: what BayHeat collects and why" | – | – | – |
| 29 | `/terms` **(new)** | Legal | "Terms: general information, not professional advice" | – | – | – |
| — | `/heat-report-pro` **(moved to v1.1, not counted in the 27)** | Product (R) | "Heat Report Pro" | – | `Notify me` | None until v1.1 |
| — | `/embed/planner` (noindex, not counted in the 27) | Embed (bare layout, stripped) | – | referral | `Get the full report on BayHeat ↗` | – |

**System routes:**
- `app/sitemap.ts` lists indexable routes only; `/r`, `/embed`, `/heat-report-pro*` and `noindex` state pages are excluded.
- `app/robots.ts` allows `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `Applebot`, `Bingbot`, `DuckAssistBot` and `Google-Extended`, and disallows `/api/` only — **`/r/` is removed from `disallow`** (§2.3, a feasibility finding: a blocked path can't get a social-card preview even with its own `noindex`/`X-Robots-Tag` headers, since X and LinkedIn's crawlers honor `robots.txt` before ever fetching the OG image).
- `app/llms.txt/route.ts` is `force-static`.
- Also: `app/opengraph-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/not-found.tsx`.

**Indexable count:** 27 (composition changed from v1.0: Heat Report Pro's route moved out to v1.1; `/terms` moved in). `/r/[code]`, its OG image, `/embed/planner` and `/heat-report-pro*` are not indexed. The only `ƒ` route in v1 is `/r/[code]` and its OG image — `/api/pro/verify` moves to v1.1 with the rest of Pro.

### 3.4 Redirects (`lib/redirects.ts` → `next.config.ts` `redirects()`, `permanent: true` = 308)

| Old URL | New URL |
|---|---|
| `/best-electric-garage-heaters-by-size` | `/garage-heater-size` |
| `/electric-garage-heater-operating-cost` | `/cost-to-heat-a-garage` |
| `/120v-vs-240v-garage-heater` | `/240v-garage-heater` |
| `/hardwired-vs-plugin-garage-heater` | `/240v-garage-heater` |
| `/portable-garage-heaters-15a-circuit` | `/portable-garage-heater` |
| `/forced-air-vs-infrared-garage-heater` | `/infrared-garage-heater` |
| `/best-ceiling-mount-garage-heaters-under-200` | `/electric-garage-heater#ceiling-mount` (was `/ceiling-mount-garage-heater`, which moves to v1.1 — §3.5) |
| `/wall-mount-vs-ceiling-garage-heater` | `/electric-garage-heater#ceiling-mount` |
| `/insulate-garage-before-heater-upgrade` | `/how-to-insulate-a-garage` |

**Kept URLs** (re-skinned, with audit fixes):
- `/best-wall-mount-garage-heaters`
- `/electric-vs-propane-garage-heater`
- `/about`
- `/privacy`
- `/`

**Rules:**
- `lib/redirects.test.ts` asserts that every `destination` has `app/(site)<destination>/page.tsx` (a fragment destination is asserted against the page hosting it).
- `W0-lite` (§9.2) `git mv`s the 9 legacy folders into `app/(site)/` **unchanged**, and `REDIRECTS` starts **empty**. **The integrator adds each redirect and deletes the legacy folder in the same commit that merges that destination's lane** — never earlier (a feasibility finding: the v1.0 plan deleted legacy folders and wired 308s at W0, before any destination existed, so a slipped destination had nothing to fall back to).
- If a destination slips at integration, that redirect entry is skipped, the legacy folder stays live (unredirected, but present) with its existing content, and the slip is logged for the next `v1.1` batch.
- Placeholders (and any page that slips) ship `robots: { index: false }` and `indexable: false` in the page registry.
- All work lands on `v1/integration` (preview deploys only). **`main` (the Vercel production branch) is untouched until the full Definition of Done is green** (§9.5, a feasibility finding — nothing in the v1.0 plan actually said this).
- **GSC gate (owner, day 1):** export the last 28 days by page. Any old URL with 10 or more impressions or any click is still redirected, but its best paragraph is moved verbatim onto the destination, under an anchor matching the old topic. **Because destination lanes carry every legacy fact over by default, this export is advisory, not a blocker** — a feasibility finding: an in-session GSC export the owner hasn't run yet can't be allowed to block a merge.
- **Content moves with the redirect.** Keep the audit's facts. Kill the "What this page will not claim" sections, the "boring" copy, the stacked disclaimers, the "under $200" class and the astrology line. Fix all of these:
  - FUH54 is $468–500 (price class `$$$`, no dollar figure printed near a buy link);
  - DR-975 back-wall clearance is 4.5 in;
  - the CZ220 "not where gasoline… stored" warning, now generalized as rule S12 across every heater (§2.5);
  - GFCI on 125–250 V garage receptacles (NEC 210.8(A));
  - cite 210.23(A)(1) for portables and 424.4(B) for fixed heaters, each with its edition;
  - 10 kW → 52.1 A → 60 A / 6 AWG.

### 3.5 v1.1 rollout: at most 5 indexable pages a week (each with engine numbers, a figure, sources and review)

| Publish by | Route | Cluster (vol/mo, peak) | Money |
|---|---|---|---|
| Mon Oct 5 | `/natural-gas-garage-heater` | natural gas garage heater 2,900 (12,100 Nov) · gas garage heater 8,100 | Northern Tool (CJ), Amazon search, gas-fitter lead slot |
| Mon Oct 5 | `/ceiling-mount-garage-heater` (moved from v1 to make room for the installation-cost page) · `/big-maxx-vs-hot-dawg-vs-modine-vs-reznor` | ceiling mount garage heater 480 (1,600) · mr heater big maxx 2,900 (12,100 Nov) · reznor 2,400 · hot dawg 1,600 · modine 1,000 | Northern Tool, Amazon |
| Thu Oct 8 | `/shop-heater` | shop heater 6,600 (33,100 Jan) · workshop heater 390 · best shop heater 210 | Amazon, Northern Tool |
| Thu Oct 8 | `/most-efficient-garage-heater` · `/can-i-run-it/buddy-heater-in-garage` | most efficient garage heater 5,400 · cheapest way 390 (1,300) · buddy heater 40,500 (safety slice) · big buddy 12,100 · little buddy 18,100 | Heat-pump partners; CO alarms, safer alternatives |
| Tue Oct 13 | `/best-garage-heater` (H1 includes "picked by model fit, not hands-on tested"; label `MODEL PICK · SPEC-BASED`, upgraded to `LAB PICK · MEASURED BH-00N` only once a report exists) · `/can-i-run-it/kerosene-heater-in-garage` | best garage heater 5,400 · best heater to heat garage 5,400 · best electric heater for garage 2,900 · kerosene heater indoors 22,200 · kerosene heater for garage 720 | All; safer alternatives |
| Thu Oct 15 | `/can-i-run-it/torpedo-heater-in-garage` · `/ventless-propane-heater` · **Heat Report Pro opens** (if `PRO_REVIEWED` is set) | torpedo heater 14,800 (informational slice) · ventless propane 4,400 · ventless gas 2,400 · ventless NG 1,300 | Safer alternatives; CO alarms, vented alternatives; Pro |
| Tue Oct 20 | `/garage-fridge-heater-kit` · `/keep-garage-above-freezing` (static freeze physics: thresholds by daily mean, "fixes compound"; recomputed by the engine, never a garage-temperature forecast) | garage fridge heater kit 1,600 · garage heater kit refrigerator 1,600 · keep above freezing · cheapest way | Amazon; Email (alerts), Amazon |
| Tue Oct 27 | `/heat-pump-mini-split-for-garage` · `/garage-door-insulation-r-value` · `/insulated-garage-door-vs-kit` **(new — a revenue finding)** | mini split for garage 3,600 · ductless 1,600 · heat pump for garage 390 (1,000) · r value 720 (+4 variants) · **insulated garage door 49,500 / garage door insulation 49,500** — the two largest keywords in the entire dataset | HVACDirect, Got Ductless, Pioneer (env); Amazon; **garage-door installer lead CTA (env) as the primary monetization**, not Amazon — this page is the DIY-kit-vs-new-door decision, and a chunk of that 49.5k/mo volume is a $700–3,000 door purchase decision, not a $120 kit |
| Thu Oct 29 | `/how-cold-does-an-unheated-garage-get` (the SERP is forum-only, per the 09-25 check) · `/embed` (landing; compact 320 px widget; `/embed/heat-index`) | long tail · PR · referral | Email |
| Tue Nov 3 | `/diesel-heater-garage-install` **(stays `noindex`/draft until a licensed HVAC or gas reviewer signs — §2.5)** · `/lab/recall-watch` · `/cheapest-way-to-heat-a-garage` | install long tail · news · 390 (1,300) | VEVOR/Hcalory, CO alarms |
| Thu Nov 5 | `/garage-gym-heater` · **BH-002** `/lab/reports/bh-002-door-kit-co-heating` (first M marks, Nov 6) | 210 (1,300) · door-kit cluster, PR | Amazon |
| Tue Nov 10 | `/garage-heater-with-thermostat` · `/cost-to-heat-a-garage/[state]` batch 1 (10 coldest, `noindex` until they pass the gate) | 590 (2,400) · local PR | Amazon |
| Thu Nov 12 | `/first-garage-freeze` (dataset: garage freeze lags the first air frost; computed per station) | PR, email | Email |
| Fri Nov 20 | `/garage-heater-deals` (Black Friday and Cyber Monday; price **tiers** only — no `%`, "was/now", "lowest" or countdown language, per the Amazon-adjacency rule in §6.1) | seasonal | All |
| Thu Dec 3 | **BH-003** `/lab/reports/bh-003-diesel-heater-co` (opens with the Awin/VEVOR disclosure and a right-of-reply window, §2.8) | diesel peak | VEVOR, CO alarms |
| Dec 7–11 | `/wood-stove-for-garage` (2,400) · state batches 3–5 | – | – |
| **Early-mid Jan 2027** | **The cooling content cluster moves here from March** (a revenue finding: shipping counter-seasonal content in March, right after the model's own numbers show the trough, misses the pre-summer research window entirely; moving it to the already-scheduled week-12 lull gives it 6–8 weeks to index before spring demand): `/garage-air-conditioner` (12,100 → 40,500 Jul) · `/garage-dehumidifier` (12,100 → 22,200) · `/garage-fan` (8,100 → 27,100) · `/portable-ac-for-garage` (4,400 → 14,800) · `/what-size-mini-split-for-garage`. **These ship as standalone buying-guide pages with their own sizing math (square footage, EER, pint-per-day), not through the planner's integrated cooling mode** — the planner's `wantsCooling` engine, `cooling.ts` and the T10 vector stay deferred to March 2027 (§9, a feasibility finding on build-session scope); the two schedules are reconciled, not in conflict (§10 #R3). | – | Sylvane, HVACDirect, Amazon |
| Jan 2027 | **BH-004** 5 kW warm-up · **BH-005** Big Buddy moisture (phase 2, only if gated in — the revised revenue model does not expect the Dec-gross-≥-$500 gate to clear on schedule, §6.5) · `/waste-oil-heater-for-garage` (1,300) · `/garage-insulation-cost` (1,600, $8.68 CPC) · `/garage-subpanel` (720) · Index "coldest month" edition | – | Leads (env) |
| March 2027 | The planner's integrated cooling mode ships (5-year TCO with cooling credit, `cooling.ts`, T10) | – | Heat-pump partners |

### 3.6 v2 backlog (after Mar 2027; each needs a GSC or revenue signal first)

- Heat Report Pro **Climate Pack** ($39: heat, cool and dehumidify).
- **Pro embed** for contractors ($29–49/mo; needs auth and billing).
- **BayGrade Index**, published at 1,000 or more real completions ("the median American garage is a D").
- **Neighbour compare**, only at n ≥ 50 per state.
- A **warm-up race** WebM export for Shorts.
- A live garage-temperature forecast, only after calibration against 20 or more reference garages.
- The live `ThermalField` canvas and the other deferred motion moments, once the engineering time exists to make them pass the React Compiler's error-level lint rules cleanly (§9.8).
- Open-source the model as `bayheat/garage-load-model` (MIT) and make the site repo private (Q1 2027) — **the repo should already be private before that, see §8.5 P0**.
- Results licensing, under the firewall in §5.4.
- Heat-wave alerts (May 2027).

**Never build:**
- city pages;
- per-size or per-SKU thin pages;
- indexable kit landers;
- "vevor diesel heater" brand-head pages;
- fake "tested" roundups;
- `Product`/`Review`/`AggregateRating` markup without first-party data;
- display ads on the planner, safety or money pages;
- an embedded lead-generation form or phone-number field anywhere on our own domain (§2.8, §6.1).

---

## 4. Design system: "Inspection Grade"

### 4.1 Art direction

**The site is shown through an infrared camera, with a lab's published record behind it.** The whole brand runs on the premise that garages are seen the way a thermal camera sees them; report paper is where a reader goes to check the proof, not where they land first.
- The dark **Camera** surface is the **default** for `/`, the planner and the fuel/electric hub pages (static baked posters in v1, live canvas in v1.1) — the hero, the ZIP flow, the highest-traffic money hubs. **This is a direct fix, not a stylistic preference:** an earlier pass of this document made the light Report surface the default everywhere and confined Camera to a boxed exhibit beside the copy, which a CRITICAL taste finding flagged as shipping the flagship visual concept as decoration rather than as the page. On mobile, the thermal exhibit now sits directly under the H1, not fourth in the stacking order below the fold (§4.9).
- The light **Report** surface is reserved for long-form guides, comparison tables, print and the Electrician Brief, where reading and buying benefit from paper's density — not for the pages a first-time visitor or a search click actually lands on.
- **`ThermalExhibit` always composites the `GarageSection` line-art layer** (roof, joists, the 16×7 door, the side window, the slab) into the same poster — never an unpaired diffusion field. A heat field with no registered line art, scale bar and spot meter reads as a random color blob, not a temperature map, which is exactly the failure mode that would sink the hero if it shipped unpaired (a HIGH taste finding; see `ThermalExhibit` in §4.5).

**Mood:** a FLIR inspection report crossed with Teenage Engineering restraint. A taste finding noted this is an intelligent but recognizable synthesis of already-canonized 2025–2026 references (Linear, Rivian, Vercel/Geist, Teenage Engineering, FLIR); rather than chase an unrecognizable new visual language 6 days before launch, v1 adds three cheap, ownable details instead of a rebuild:
- the live `ThermalField` (v1.1) will carry **visible sensor artifacts** — occasional dead-pixel flicker and a slight thermal-drift lag before settling — instead of a clean idealized diffusion, so it reads as a real instrument rather than a polished demo (§4.8, applied when the canvas ships);
- the hero H1 digits, the BayGrade letter and the GO/ONLY-IF/NO-GO stamp get a **bespoke hand-cut SVG outline treatment** (`components/brand/InstrumentDigits.tsx`) instead of raw webfont glyphs for these three specific, most-screenshotted elements, so they can't be reproduced by a competitor reaching for the same two Google Fonts;
- the Spot Mark's dot position and bracket-leg lengths are **derived from data**, not drawn symmetric (§4.6).

**What makes the site ours:**
- the Spot Mark, its dot and bracket lengths derived from the worked example's own leak geometry;
- the ZIP re-light;
- the Shrinking Heater;
- the Disagreement Strip;
- the GO/ONLY-IF/NO-GO stamps;
- FIG. numbering, rotated by page kind;
- the `MODELED — NOT A PHOTOGRAPH` tag, burned into every exported image;
- evidence chips on the numbers that matter;
- a recurring dry, brand-owned voice line for empty and idle states (§5.1).

### 4.2 Color tokens (hex; contrast measured)

Declared in `app/globals.css`, scoped by `[data-surface]`. `:root` is report.

**Report surface** (the default for guides, tables, print and the Brief — not for `/`, the planner or the two fuel/electric hubs, which run on Camera, §4.1). **`--bg` and `--link` are retuned off the retired site's audited palette** (`--paper #f3eee4`, `--rust #b4532a`, per `current-site-audit.md`): the original `#F6F4EF`/`#B8430B` pair sat only a few RGB units from those values, and with the earlier draft also making paper the sitewide default, the rebuilt brand's primary color in its most common use risked reading as the old site (a CRITICAL taste finding). The new pair is diffed numerically against the audited old-site values before lock, not just eyeballed.

| Token | Hex | Semantic use | Contrast |
|---|---|---|---|
| `--bg` | `#EEF0EA` | page paper — cooler and less amber than the retired `#f3eee4`, with a faint printed-grid texture token (`--bg-grid`, 40 px, 2% opacity) the old site never had | – |
| `--surface` | `#FFFFFF` | tables, plates, step cards, Lab stamp | – |
| `--surface-2` | `#E7EAE1` | row hover, input wells, alternating section fill on long pages (§4.4) | – |
| `--line` | `#D2D6CB` | 1 px hairlines (decorative only) | 1.32:1 |
| `--grid` | `#E2E5DC` | graph grid inside figures only (8 px minor, 40 px major) | decorative |
| `--text` | `#15171C` | body, headings, grade letter | 16.31:1 |
| `--text-2` | `#565B66` | secondary, captions, units | 6.19:1 |
| `--link` | `#175E52` | links, emphasis on paper — a desaturated teal-ink, moved off the `#b4532a` rust hue neighborhood entirely | 5.1:1 |
| `--ember` | `#FF8A1F` | **the one action color, as a fill only**, with `#15171C` text; also every live readout number. **Reserved for these two jobs only — nothing else may use it** (§4.2, a taste finding: the original system let this hue double as Grade A's fill too, so a B/A-grade report's CTA, its live numbers and its grade bar all glowed the same color at once, and the one color meant to say "click here" got absorbed into decoration). | 7.61:1 text-on-fill |
| `--ember-hover` | `#FF9D42` | button hover | – |
| `--frost-ink` | `#16607F` | **cold and loss annotations only** — no longer double-booked as the C-chip fill (see `--computed` below) | 6.34:1 |
| `--computed` | `#4A6B78` | **new token**: the C (computed) evidence chip's fill, a cool grey-blue distinct from `--frost-ink` — a taste finding: reusing one hex for "this is a problem" (a cold/loss annotation) and "this is a neutral computed value" (the majority of numbers on the site) trained users to misread most numbers as bad news | 5.9:1 |
| `--heat-ink` | `#8E1B0E` | "hot" data labels | 8.26:1 |
| `--alarm` | `#B3261E` | **safety only**: CO, clearance, overload, NO-GO | 5.95:1 |
| `--go` | `#1F6B3A` | GO stamp only | 6.4:1 |
| `--grade-a` | `#C9A227` | **new token, Grade A only** — a desaturated bronze/gold, no longer Ember/Glow (see the Grade scale row below) | 5.4:1 |

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
| `--grade-a-camera` | `#D9B84A` | Grade A on the camera surface | 9.1:1 |

**Data ramps** (the only gradients allowed; OKLab; always next to a labeled °F scale):
- **Forge:** `#3A0D0B → #8E1B0E → #D9480F → #F77F00 → #FCBF49 → #FFF1C9`
- **Frost:** `#0E2A3D → #16607F → #3FA7C9 → #BCE9F5`
- **Diverging:** `#BCE9F5 → #3FA7C9 → #16607F → #1A1C22 → #8E1B0E → #F77F00 → #FFF1C9`
- **Grade scale** (the only non-temperature ramp; it is labeled `HEAT ESCAPES ← → HOLDS HEAT`, and the letter and its word are **always shown together, never a bare colored bar**, §2.5): F `#3FA7C9` → D `#BCE9F5` → **C `#D8CFAE`** → B `#FCBF49` → A `--grade-a` (`#C9A227`). C was originally a near-paper `#E9E5DC` — close to 1:1 contrast against `--bg`/`--surface-2` — invisible exactly where the story needs it most, since C is the worked example's own headline grade on its way from D to B (a HIGH taste finding). `#D8CFAE` (a warm sand, distinct in hue and value from both surfaces) replaces it; all five stops are checked at ≥ 3:1 non-text contrast against `--bg` and `--surface` before ship.

**Evidence chips.** 14 px tall; Martian Mono wdth 75, wght 600, 10 px; 2 px radius; the letter is always shown.

| Chip | Meaning | Style |
|---|---|---|
| **M** | measured | Ember fill, ink letter |
| **C** | computed | `--computed` (`#4A6B78`) fill, white letter — **its own token, distinct from `--frost-ink`** |
| **S** | spec | 1 px ink outline |
| **R** | reference/code | ink fill, paper letter |
| **E** | estimate | 1 px dashed `#565B66` |

**Rules:**
- Orange text on paper is banned (2.39:1).
- One action color per surface, and Ember/Glow are reserved for that action color and live readouts only — never a grade, never a chip.
- Red means safety only.
- "Won't keep up" is a **dashed** FIT bar, never red.
- The slate-navy family (`#0B1120`, `#0F172A`, `#020617`) is banned as a background.

### 4.3 Typography (Google Fonts via `next/font/google`; two families only; ≤ 130 KB, both preloaded)

```ts
import { Archivo, Martian_Mono } from "next/font/google";
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--ff-archivo", display: "swap", preload: true });
export const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--ff-martian", display: "swap", preload: true });
```

- **Font budget raised from 120 KB to 130 KB and both families are preloaded** (a feasibility finding: Archivo wdth+wght latin woff2 measures 90,104 B and Martian Mono wdth+wght latin measures 38,492 B, together 128.6 KB against the old 120 KB cap — and Martian Mono was `preload:false` even though mono text sits above the fold in the hero eyebrow, the HUD and the ZIP readout, so its late swap caused CLS). `font-variant-numeric: tabular-nums` applies everywhere numbers appear, and readout widths reserve their box in `ch` units so nothing reflows.
- Both are variable fonts: Archivo wght 100–900, wdth 62–125; Martian Mono wght 100–800, wdth 75–112.5.
- Variables are prefixed `--ff-*` so they never collide with Tailwind theme variables.
- `@theme inline { --font-sans: var(--ff-archivo); --font-mono: var(--ff-martian); }`.
- **Width is set with utilities named `wdth-62 wdth-75 wdth-100 wdth-112 wdth-125`, not `w-62`/`w-75`/etc.** (a feasibility finding: `w-*` collides with Tailwind v4's own core width scale — compiling `w-75` would emit `width: calc(var(--spacing) * 75)`, 300 px, on top of the intended `font-variation-settings`, breaking every condensed label's layout and the "no horizontal scroll at 390 px" rule). `scripts/anti-slop.ts` greps for `\bw-(62|75|100|112|125)\b` as a banned pattern to catch any regression.

| Role | Family / axes | Size | Line / tracking |
|---|---|---|---|
| Hero H1 | Archivo wdth 118, wght 800 (**wdth 100 or ≤34 px at 390 px width** — a feasibility finding on the 5-line overflow risk of the 50-character hero H1 at mobile widths) | `clamp(2.5rem, 1.3rem + 5vw, 6rem)` | 0.95 / −0.04em (−0.03em mobile) |
| Page H1 | Archivo wdth 112, wght 750 | `clamp(2.1rem, 1.4rem + 2.8vw, 3.75rem)` | 1.0 / −0.03em |
| H2 | Archivo wdth 100, wght 700 | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | 1.1 / −0.02em |
| H3 | Archivo wdth 100, wght 650 | 1.25rem | 1.25 |
| Eyebrow / label / nav / table head | Archivo wdth 75, wght 600, caps | 12–13 px | 1.2 / +0.08em |
| Body | Archivo wdth 100, wght 400 (500 for emphasis) | 17 px desktop / 16 px mobile | 1.6; measure 62–68ch |
| Lead | Archivo wdth 100, wght 400 | 20 px | 1.5 |
| Readout / spec / table numbers | Martian Mono wdth 87.5, wght 400 (500 for results) | 13–15 px | 1.3 |
| Result numbers | Martian Mono wdth 75, wght 500 | `clamp(2.5rem, 1.5rem + 4vw, 5rem)` | 1.0 / −0.02em |
| Units | Martian Mono wght 300, `--text-2`, 0.6em | raised 0.35em | – |
| Grade letter / verdict stamp | Archivo wdth 125, wght 900 (**bespoke `InstrumentDigits` outline, not the raw webfont glyph** — §4.1) | 96–140 px / 48–72 px | 0.9 |

### 4.4 Grid, spacing, radius, shadow, z-index, breakpoints

- **Grid.**
  - 12 columns at ≥1024 px: max content 1392 px, 24 px gutters, 48 px outer margin.
  - 8 columns at 640–1023 px.
  - 4 columns below 640 px, with a **16 px side gutter**. There is never a horizontal page scroll.
  - Exposed rules: a 1 px `--line` at the column-1 and column-12 edges on home and planner, plus section rules.
- **Spacing scale** (4 px base): `4 8 12 16 24 32 48 64 96 128`. Sections are 96/128 px on desktop and 64 px on mobile. **Every other numbered home/guide section alternates a `--surface-2` fill** (a taste finding, cheap to apply: with only one shadow token and 0-radius everywhere, a long page with hairline rules alone risks reading flat; alternating fill gives scroll rhythm without adding a shadow or radius token).
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
- **`components/shell/SiteFooter.tsx`**, as in §3.1, now with a `/terms` link.
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

**Button copy always names the action.** Examples: `Size my garage`, `Check price on Amazon ↗`, `Check price at Northern Tool ↗`, `Download CSV`, `Print the Electrician Brief`, `Request installer quotes · Sponsored`. Never "Learn more" or "Get started".

**Spec plate** (`components/commerce/SpecPlate.tsx`), modeled on a heater rating nameplate.
- 1 px `--line` border, 0 radius, white.
- **Header:** the class silhouette as a 64×48 thermal glyph, plus a label in Archivo wdth 75 caps (`MODEL PICK · SPEC-BASED`, upgraded to `LAB PICK · MEASURED BH-00N` only once a report exists — §5.4, a compliance finding), plus the mount/voltage (`CEILING · 240 V`).
- **Name:** Archivo wdth 100, wght 700, 20 px.
- **Spec rows** use dotted leaders: `OUTPUT 5,000 W · 17,060 BTU/h [S]` · `CIRCUIT 240 V · 20.8 A → 30 A, 10 AWG [C]` · `FIT ████████░░ 92% of your load` (a dashed bar if under 100%) · `RUN COST $0.96/h at 19.2¢ [C]` · `PRICE CLASS $$ (our range, not a live price)`.
- **Safety line, required, in `--alarm`**, with the CO or clearance glyph (§2.2, §9.4).
- **Buttons: capped at one always-visible primary plus one text link** (a taste finding: three plates each carrying a primary button, an Amazon button and a "Why this fits" expand, plus the sticky mobile CTA, could put up to 9 clickable targets on screen at once). The secondary partner link and the `Paid link` micro-label move behind `Why this fits →`.
- **No stars, no scores, no Amazon images, no Amazon prices, no dollar figure anywhere on the plate.**
- **A per-viewport motif budget of 3** applies across the whole page (a taste finding: the Lab stamp, evidence chips, R/code chips, the grade letter, FIT bars, dotted leaders, the plate frame and safety bars are 8 distinct "stamp" languages, and showing more than 3 at once in one view works against the stated restraint). The rest — full evidence detail, all code citations — live in the expandable Lab-stamp/evidence panel instead of printing inline every time.

**`VerdictRail`** holds up to 3 plates. Layout:
- desktop: 3 columns;
- tablet: 2 + 1;
- mobile: vertical, with plate 1's top edge within 700 px.

**`YourGarageChip`** (replaces `MiniSizer`, §2.3, §9 — a feasibility finding: running the full engine client-side on every money page shipped 113 stations, the zip3 table and the catalog into every page).
- Reads `{code, qSize, grade, kw, breakerA}` from `localStorage["bayheat:garage"]`. No engine import, ≤ 2 KB.
- `Fit to my garage →` links to `/garage-heater-calculator?preset=2A&focus=power` (or the relevant focus).

**`CompareTable`**
- Sticky model column and header row.
- Numbers right-aligned in Martian Mono.
- 2 px Forge in-cell micro-bars scaled to the column max; ▲ marks the column best.
- Each spec has a footnote to the manufacturer PDF. Footer: `Specs checked 2026-10-01 · N sources`.
- Below 640 px it becomes scroll-snap model columns with the label column pinned.

**`PaidZone`** wraps every `BuyButtons` subtree and renders `Disclosure` first; `BuyButtons` throws if it isn't inside one (§3.2, §6.1). **`Disclosure`** is the exact sentence in §5.3, rendered immediately above the first paid link. **`PaidLabel`** renders `Paid link`. **`Cost`** is the only component allowed to print `$` inside commerce subtrees, and never inside a `[data-buy-group]` (§6.1).

**Evidence** (`components/evidence/`)
- **`<Num v={31742} unit="BTU/h" ev="C" src="planner:qSize" round={100} />`** or **`<Num f="cz220.watts.high" />`** renders the formatted number plus a chip, when `chip` is set.
- **`<IfVerified ids={[...]}>…</IfVerified>`** (new, a feasibility finding): a block-level component that removes the whole wrapped sentence or row when any listed fact is `status: 'verify'`, instead of the fact silently rendering nothing mid-sentence. In dev it renders a visible `[VERIFY:id]` marker; CI fails if an indexable page references a `verify` fact at all (§9.6).
- **`EvidencePopover`** opens as a native `<details>`/`popover`-attribute element with zero client JS (a feasibility finding: a client-island popover on every `<Num>` shipped far too much JS for a page that can have dozens of them). It shows: source title and link, date checked, formula (C) or instrument (M), and `Report a problem`.
- **`LabLabel`**: the one-line stamp (`ID · REV · CHECKED · MODEL`, no claim counts), expandable.
- **`SourceList`**: numbered sources, `[n]` anchors, each code citation carrying its edition.
- **`RevisionHistory`**
- **`AnswerBlock`**: 40–50 words, `id="answer"`, 1 px left rule in ink.

**Callouts** (`components/ui/Callout.tsx`)

| Variant | Style |
|---|---|
| `safety` | 3 px `--alarm` left bar, glyph, imperative copy, R chips |
| `note` | 3 px `--frost-ink` bar |
| `fix` | 3 px ink bar and a "Fix this →" link |

There are no stacked disclaimers above content, ever.

**Figures** (`components/figures/`)
- **`Figure`** frame: `FIG. n` label in Martian Mono, caption and source line.
- **`ThermalExhibit`**: a static baked poster in v1 (camera frame, 4:3, corner brackets, HUD, scale bar, spot meter, `MODELED — NOT A PHOTOGRAPH`); the live canvas is v1.1. **Every poster `bake-posters.ts` produces has the `GarageSection` line art (roof, joists, door, window, slab) composited into it before the diffusion field is rendered on top** — the two are baked as one image, never shipped as separately-optional layers (§4.1, a HIGH taste finding: an uncomposited heat field reads as a random color blob, not a temperature map). `ThermalExhibitProps` (§9.4) takes the composited `posterKey` directly; there is no prop to render the thermal layer without it.
- **`HeatLossBars`**, **`WarmupCurve`** (model dotted, measured solid) and **`GradeScale`** live in the **Result** lane (§9.3 — a feasibility finding on ownership: these are consumed almost entirely by the result screen and belonged there, not in the general figures grab-bag).
- **`DisagreementStrip`**
- **`GarageIso`**: parametric isometric SVG. `x' = (x−y)cos30°`, `y' = (x+y)sin30° − z`. Props: `bays`, `attached`, `ceilingFt`, `doorType`.
- **`GarageSection`**: the line-art source `bake-posters.ts` composites into every `ThermalExhibit` poster (above). It is also exposed standalone for figures that want the line art without a thermal layer (e.g. a plain garage diagram in a guide).
- **`ExplodedGarage`**
- **`ClassSilhouette`**: 14 heater classes, rendered as thermal glyphs.
- **`FuelCostBars`** and **`UsTileMap`** live in the **Data** lane (§9.3 — same ownership fix: both are consumed only by the Index).
- **`DieselExhaustDiagram`** (lives only in `components/figures/fuel/`, captioned "Illustrative. Your heater's installation manual governs.") and **`BottomSealProfiles`** (lives only in `components/figures/seal/`, T-style, bulb, J and beaded, with retainer widths) — **no duplicate top-level stub of either exists** (§9.3, a feasibility finding: the v1.0 plan had both defined twice, once as a stub in the general figures folder and once for real in a lane folder).

**Planner widgets** (`components/planner/`)
- `ZipField`: numeric keypad; readout types in at 12 ms/character; reduced motion shows it at once.
- `TapCard`: 1 px border; selected = 2 px ink border plus an Ember corner tick; the U-value in mono.
- `Segmented`: a sliding 1 px indicator, 240 ms settle.
- `Stepper`: hold to repeat, 400 ms then 60 ms.
- `DraftQuiz`
- `LiveBand`
- `StepRail`
- `CaptureReveal` (v1 sequence only — see §4.8)

**Instruments** (`components/instruments/`, each under 8 KB, each ending with `Open the full planner →`, and each importing only `electrical.ts`, `prices.ts` and `constants.ts` — never `plan.ts`, `climate.ts` or `zip3.data.ts` — enforced by `check-imports.mjs`, §9.6)

| Instrument | Lives on | Inputs → outputs |
|---|---|---|
| **Door Leak Meter** | bottom seal, weather stripping | Door width (8/9/16/18 ft), floor gap (1/8–1 in), retainer (T-style, bulb, J, none) → profile and width to buy, air-leak share of load, price-class impact |
| **Kit Payback Meter** | door kit, how to insulate | Door size and type, ceiling state → ΔBTU/h, payback months, `SAVINGS_VARY` line. States plainly that "a kit alone is ≈6% on a bare, leaky garage" |
| **Circuit Checker** | electric hub, 240 V, portable, installation-cost | Outlet/breaker you have → the largest heater it can run, and what a new circuit costs |
| **Fuel Cost Meter** | garage-heaters hub, diesel, electric vs propane | State + hours → $/h for 17,060 BTU/h delivered on each fuel, plus the diesel-vs-electric crossover ¢/kWh (≈21¢ at the current EIA diesel price, recomputed) |

**Capture** (`components/capture/`)
- **`EmailCapture`**: one field, a primary button, the privacy line; states idle / sending / done / fallback.
- **`AlertSignup`**: ZIP plus email.
- **`NotifyMe`**

**Safety** (`components/safety/`)
- `VerdictStamp` (renders `GO · PER MANUAL` / `ONLY IF` / `NO-GO`, with `SAFETY_SCOPE` directly under it)
- `ConditionList`
- `SafetyCard`: print, half page, `?dept=` resolved against `lib/safety/cobrand.ts`
- `SafetyCallout`
- `RecallStrip`: the last 3 relevant CPSC recalls from a committed snapshot, e.g. "2026-06-04 · Vornado SRTH tower heaters · ≈255,000 units · fire hazard".

### 4.6 Logo and wordmark (SVG-buildable)

**Spot Mark** (`components/brand/SpotMark.tsx`, `app/icon.svg`): sensor corner brackets, with the hot dot **off-centre, lower right**, like a spot meter landing on the leaking door corner.

- **Derivation (a taste finding: symmetric corner brackets plus a centered-ish dot is a generic camera/QR/"AI" scanner glyph):** the bracket rectangle is fixed at the true 4:3 sensor ratio, not a square, and the four bracket-leg lengths are **asymmetric**, each one set to a distinct fraction of the mark's clear space, derived from the worked example garage's own isometric grid: the dot itself sits at the precise coordinate where example A's door-corner air leak falls on that grid, mapped into the 32×32 viewBox. This derivation is documented on `/about` with the actual coordinates used, so it is provably not a stock viewfinder icon.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <path d="M3 11V3h8M21 3h8v8M29 21v8h-8M11 29H3v-8" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/>
  <circle cx="20.5" cy="20.5" r="4.25" fill="var(--dot, #FF8A1F)"/>
</svg>
```

- **Favicon `app/icon.svg`:** the same mark in bone `#F3EFE6` on a `#08090C` rounded-0 square (32×32).
- **`app/apple-icon.tsx`:** 180×180 via `ImageResponse`.
- **In the planner result**, `--dot` takes the grade color for the user's grade: `--grade-a` for A, running to Frost for F — **never Glow**, since Glow is reserved for live readouts (§4.2).
- **System rule:** the Ember dot marks **the key value** on every chart: the user's load on FIT bars, the endpoint of a warm-up curve, our band on the Disagreement Strip.
- **Wordmark (`Wordmark.tsx`):** live text `BAYHEAT`, Archivo, `font-variation-settings:"wdth" 125`, weight 800, tracking −0.01em, 20 px in the header. The descriptor `GARAGE CLIMATE LAB` is Martian Mono 500, 10 px, +0.12em, `--text-2`, beside it on desktop and hidden below 400 px.
- **Clear space** is one bracket length. Minimum mark size is 16 px.

### 4.7 OG image template (`lib/og/card.tsx`, `ImageResponse`, 1200×630)

- **Fonts:** committed static TTFs in `assets/fonts/`, generated with the fontTools variable-font instancer ahead of the build session (there is no static wdth-125 instance published for Archivo, and no variable-font support in Satori): `Archivo-ExpandedExtraBold.ttf` (wdth 125, wght 800, 121,504 B), `Archivo-Medium.ttf`, `MartianMono-Regular.ttf`, `MartianMono-Medium.ttf`. They are copied from `scratchpad/og-fonts/` into `assets/fonts/` during pre-flight (§9.2), read once at module scope with `join(process.cwd(), 'assets/fonts/<name>.ttf')` — a **literal** path, never a template string built at request time. **Not woff2.**
- **Posters:** `scripts/bake-posters.ts` also writes `lib/og/posters.generated.ts`, a base64 data-URI map, read at build/request time instead of a computed `public/thermal/${preset}-${state}.png` path (a feasibility finding: Vercel's file tracing does not reliably bundle a runtime-computed `public/` path, which fails with `ENOENT` only in production).
- **Layout:**
  - Camera `#08090C` background.
  - Left 560×420 at (48, 72): the thermal poster for the scenario, inside HUD brackets.
  - Right column x = 648 → 1152:
    - eyebrow in Martian Mono 22 px `#A3A7B0` (e.g. `LAB REPORT BH-001` / `GARAGE HEAT REPORT`);
    - title in Archivo 800, 56–64 px, `#F3EFE6`, at most 3 lines, **no dollar figure**;
    - readout in Martian Mono 500, 40 px, `#FFB547` (e.g. `31,700 → 13,000 BTU/h`);
    - a sub-readout in Martian Mono 24 px `#F3EFE6`.
  - Bottom: a 12 px Forge scale bar across the full width at y = 606, with `0 °F` and `71 °F` labels.
  - Bottom-left: the Spot Mark (40 px) plus `bayheatguide.com` plus the serial or page ID.
  - **`MODELED — NOT A PHOTOGRAPH` is burned into every OG variant that carries a thermal poster** (§2.2).
- **Variants, reduced to 7 dedicated routes** (a feasibility finding: 27 per-route OG images each needing a font-and-poster render is unnecessary work; every other route inherits `app/opengraph-image.tsx`): `/`, `/garage-heater-calculator`, `/r/[code]`, `/can-i-run-it`, `/lab/reports/bh-001-the-4x-problem`, `/cost-to-heat-a-garage`, `/garage-heaters`. Each calls `card({variant, eyebrow, title, readout, sub, poster})` with `variant` one of `page`, `report` (`/r/[code]`), or `verdict` (the GO/ONLY-IF/NO-GO stamp replaces the readout: `BIG BUDDY · ATTACHED · OVERNIGHT → NO-GO`, with `SAFETY_SCOPE` burned in below it).
- `scripts/bake-posters.ts` and any other Node script never `import` a value from `next/*` (only `next/og.js`'s runtime is reachable from an Edge/route context, not from a plain Node script, and there is no exports map for the bare specifier).

### 4.8 Signature motion moments: v1 is 5 static-friendly moments; the rest are v1.1

A feasibility finding forced this cut: the original 9-moment list, including a live Jacobi-iteration thermal canvas (estimated at "about 1.5 days" of work on its own), collides head-on with `eslint-config-next` 16.3.4's **error-level** React Compiler lint rules (`react-hooks/refs`, `immutability`, `set-state-in-effect`, `purity`) — canvas, spring-physics and imperative counter code fights all four — and `<ViewTransition>` only animates work wrapped in `startTransition`, `Suspense` or `useDeferredValue`, not a plain `setState`. Building all 9 in one session risked shipping either broken lint gates or motion that silently doesn't fire.

**v1 ships these 5 (each still encodes heat, time, load or state):**

| # | Moment | v1 implementation | Reduced motion / save-data |
|---|---|---|---|
| 1 | **Thermal exhibit** | A pre-baked ~10 KB PNG poster per {preset × state}, with the HUD, scale bar and spot-meter marks drawn as static SVG overlay on top. No canvas, no client JS for the field itself. | Same (there is no motion to reduce) |
| 2 | **ZIP re-light** | On the 5th digit, the frame swaps to the correct poster and the Martian Mono readout types in via `steps()`. | Instant swap |
| 3 | **Shrinking Heater** (Fix-First) | Each checkbox toggle re-runs `plan()`, crossfades the grade letter, and morphs the pinned spec plate via `<ViewTransition name="heater-plate">`, with every state change wrapped in `startTransition` so the transition actually fires under the React Compiler's rules. | A cut to the final state |
| 4 | **Verdict stamp** | Scale 1.25 → 1 in 180 ms with `--ease-stamp`, using a **CSS keyframe** edge wobble — **no `feTurbulence`/`feDisplacementMap`** (an SVG filter of that kind is expensive to keep smooth and easy to get wrong under reduced motion). | A cut |
| 5 | **Time-lapse** | The warm-up curve draws in 1.2 s (`stroke-dashoffset`) while a Martian Mono clock ticks the modeled minutes (`00:00 → 01:56`). | Final state |

**Deferred to v1.1** (each needs either the live canvas, spring/physics code that fights the compiler lints, or a scroll-timeline API not yet worth the build-session risk): the live `ThermalField` canvas (with the sensor-artifact treatment from §4.1 applied when it ships); the spot-meter pointer follow; **Door Rise** (the SVG door hinging open); the white-noise-shutter-then-develop-wipe **Capture** sequence (v1 shows the result instantly, fully rendered, door already open); the critically-damped-spring **Settle** number count-up — when it ships in v1.1, the digits resolve through a brief hunt/flicker of adjacent random digits, like a multimeter or nixie tube finding its reading, rather than a smooth monotonic count (a taste finding: a spring-physics count-up is a generic SaaS stat-counter animation; the flicker read is more sensor-authentic); the exploded-garage scroll timeline (`animation-timeline: view()`); the Disagreement Strip's staggered source-mark drop (v1 renders it in its final, fully drawn state); the result-card-to-share-sheet morph.

Banned in both v1 and v1.1: fade-up on every section, parallax, marquees, typewriter headlines (except the ZIP readout, which is data), cursor trails, scroll-jacking and carousels.

### 4.9 Home page (`/`), section by section

1. **Hero.** Runs on the **Camera surface** end to end (`data-surface="camera"` on `app/(site)/page.tsx`'s layout) — not a paper hero with a boxed dark exhibit (§4.1, a CRITICAL taste finding).
   - **Desktop (1440×900):**
     - Left, columns 1–6, on Camera (bone `--text` at 17.35:1, not ink-on-paper):
       - Eyebrow (Martian Mono 12 px, `--text-2`): `LAB REPORT BH-001 · THE 4× PROBLEM`.
       - **H1** (bone, `--text`): "One garage. Seven answers. 10,200–40,300 BTU/h."
       - Sub (17 px, 46ch, `--text-2`, **cut to one line** — a taste/feasibility finding on the mobile stacking order below): "Rules of thumb can't see your garage. Our open model can."
       - **ZIP field plus `Size my garage — 60 s`** (56 px, Ember fill unchanged — Ember contrasts on both surfaces, §4.2).
       - The **Disagreement Strip**, 96 px, using the Camera-surface Forge/Frost ramp tokens.
     - Right, columns 7–12, bleeding to the edge, continuing the same Camera background (no panel seam between the two columns): the **FIG. 1 camera exhibit** (4:3, static poster in v1).
       - HUD: `BAYHEAT IR · MODELED · 160×120` · `24×24×9 FT · ATTACHED · OUT 3.3 °F · IN 55 °F` · scale bar `71 °F / 0 °F` · spot meter.
       - A **spec plate pinned lower right** of the frame.
       - Chips under the frame: `As-is 31,700 · D` · `+ Seals & door kit 22,600 · C` · `+ R-30 ceiling 13,000 · B` · `Bare & leaky 48,400 · F`.
       - The chips drive the plate morph and the Ember band on the strip.
       - Every number comes from `lib/home/hero-states.ts`, which calls `plan()` at build time.
   - **Mobile (390×844), reordered** (a taste finding, CRITICAL: the thermal exhibit — the one thing that makes the site visually recognizable — was 4th in the stacking order and sat below the fold on the device most long-tail SEO traffic arrives on, and "Read the math →" was consuming first-screen space without earning it): eyebrow, then the H1 (34 px or wdth 100, ≤ 4 lines; **the LCP element**), then a **compact, not full-bleed, ~340×255 px FIG. 1 thumbnail** directly under the H1, then the ZIP field and CTA, then the strip as a vertical dot plot. The "Read the math →" link and the second sub-copy line are dropped from the first screen entirely; they still exist further down the page.
   - **Proof strip:** `SOURCES: ASHRAE 2021 DESIGN TEMPS · EIA STATE PRICES · NEC 210.23 / 424.4 · IFGC 305.3 / 621 · NFPA 58 · UL 2034` in mono, **each acronym paired with a 2–3 word plain-English gloss** in the same style (`ASHRAE · climate data`, `EIA · gov't fuel prices`, `NEC · electrical code`, `IFGC · gas code`, `NFPA · fire code`, `UL · safety listing`) — a taste finding: bare acronyms don't register as credibility for a homeowner who's never heard of ASHRAE.
The rest of the home page continues on the Camera background (`--bg: #08090C`) rather than reverting to paper — sections that read like printed content (the pledges list in §07, the CSV table in §04) sit in inset `--surface` (`#12151B`) panels, the same floating-card pattern already used for the planner's step panel, so the page never seams back to Report mid-scroll.

2. **`02 / WHERE YOUR HEAT GOES`**: the exploded garage and stacked bar for example A, in its default, fully-drawn finished state in v1 (the layer-explode scroll timeline is v1.1, §4.8).
3. **`03 / CAN I RUN IT?`**: three live, answerable questions with stamps:
   - "Big Buddy, attached garage, overnight?" → `NO-GO`
   - "5 kW heater, spare 240 V/30 A, no gasoline stored?" → `GO — IF 3 CONDITIONS` (breaker is exactly 30 A, wire is 10 AWG copper, circuit is grounded — a compliance finding: the old copy, "5 kW heater on a spare 240 V/30 A?", never asked about flammable storage, and an electric heater got a bare GO where the manufacturer's own manual says otherwise once gasoline is present)
   - "Diesel heater, exhaust outside, CO alarm?" → `ONLY IF 5 CONDITIONS`

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
4. **No emoji, matched as `/\p{Emoji_Presentation}|[\u{1F000}-\u{1FAFF}]/u`** (a feasibility finding: the naive `\p{Extended_Pictographic}`/`\p{Emoji}` classes also match `→ ↗ ▲ ■ □ × ± ° ·`, so a naive grep would fail every buy button). The only symbols allowed are `→ ↗ ▲ ■ □ × ± ° ·`.
5. Left-aligned on a visible 12-column grid. At most one centered block per page: the verdict stamp.
6. Every headline carries a number, a garage noun or a decision. There is no "Learn more", "Get started", "Unlock", "Elevate", "Seamless" or "reimagined".
7. No fake trust: no stars, testimonials, user counters, stock or AI photos, invented people or "As seen on" logos. Census and subscriber counts are real counts or nothing.
8. No `rounded-2xl`, `shadow-lg`, `backdrop-blur` or glassmorphism. Radii are 0, 2 px or pill. One shadow token.
9. One action color per surface. Red is for safety only.
10. No decorative motion (§4.8).
11. The slate-navy backgrounds `#0B1120`, `#0F172A`, `#020617` are banned.
12. `0N /` eyebrows appear only on numbered section rails.
13. At most **5 sub-brands**: BayHeat Planner, Can I Run It?, Garage Heat Index, Lab Reports, Heat Report Pro.
14. Every hero and H1 number is computed at build time from `lib/planner` or `lib/facts`. Round placeholder numbers ("10x", "99%") are banned. **No dollar figure in any H1 or title, ever** (§3.2, §3.3).
15. No `m.media-amazon.com` or `images-amazon.com` image hosts.
16. **No `$\d` sharing a `[data-buy-group]` with `a[href*="amazon."]`** — enforced by `check-affiliates.ts`, not this script, since the check must run against rendered/client HTML too (§6.1, §9.6).

**Scoping fixes to the grep list itself** (a feasibility finding: several of the original literal bans collided with copy the blueprint itself requires):
- Banned words (§5.2) are matched only in JSX text and string literals of `app/**` and `components/**`, and the exact required phrases (`LAB PICK · MEASURED`, the legend's "M measured", pledge 1's wording, "Measured is solid") are listed in `scripts/anti-slop.allow` as exceptions.
- Drift literals (e.g. `10 AWG`) fail only in `app/**/page.tsx` JSX text, with a `// drift-ok: <reason>` escape for the instrument option labels that legitimately show `10 AWG` as a UI choice, not a retyped fact.
- The `#1` ban matches only `(^|\s)#1\b` in text nodes, so it doesn't fire on anchor hrefs.
- The full grep list: `from-indigo`, `from-purple`, `via-violet`, `rounded-2xl`, `rounded-3xl`, `shadow-lg`, `shadow-xl`, `backdrop-blur`, `Inter(`, `Poppins`, `Geist`, `Learn more`, `Get started`, `AI-powered`, `\bw-(62|75|100|112|125)\b`, and the corrected emoji ranges above.

---

## 5. Content, voice, editorial and safety standards

### 5.1 Voice: the lab tech explaining a result to a neighbour

- **Lead with the number and its condition.** "A 5 kW heater needs a 30 A breaker and 10 AWG copper. A 4 kW one doesn't fit a 20 A circuit either."
- **Verdict first:** the H1 plus the first 50 words contain a number, a product class and a circuit or fuel requirement.
- **Be contrarian when the data says so.** "The cheap diesel heater costs more per hour than electric below about 21¢/kWh." (Computed live from the EIA diesel price, with an as-of date, because the line flips if diesel falls toward $4.) "A door kit alone barely helps a garage with a bare ceiling. Do the ceiling first."
- **Admit uncertainty with a number.** "Between 26,000 and 41,000 BTU/h until you tell us about the ceiling."
- **Safety copy is imperative and calm.** "Put a UL 2034 CO alarm in the house, by the garage door and outside each sleeping area. In the garage, while a fuel-burning heater runs, use a low-level CO monitor rated for the garage's temperature." Never fear-mongering, never buried.
- **Buy this, not that:** every money page names at least one thing not to buy, and why.
- **A recurring, brand-owned dry line.** "Nothing to do tonight" (or an invented sibling, e.g. "Nothing to fix here") is promoted from a single rationed line into a deliberate, repeated brand voice used in: the planner's "no unknowns left, nothing to narrow" state, the 404 page, the Lab test board's idle state ("Nothing running right now"), and general empty states — **but never as a Cold Snap all-clear claim about a specific garage's temperature** (a taste finding proposed reusing it there too, but §7.6 explicitly forbids that framing until reference-garage calibration exists, since it would be an uncalibrated model claiming safety; see §10 #T8/#C14 for how this was reconciled). At most one dry line per page, and never near safety copy.
- **Reading level:** grade 8. Sentences ≤ 22 words. Tables do the heavy lifting.
- **Units always paired:** `31,700 BTU/h (9.3 kW)`.
- **Rounding:** BTU/h to the nearest 100, kW to 0.1, dollars whole or cents under $10.
- **No dollar figure ever sits inside an H1, a title, or the same `[data-buy-group]` as a paid link** (§3.2, §6.1).

### 5.2 Hard rules (enforced by the Standards Editor agent and CI)

| Rule | Detail |
|---|---|
| **Numbers** | Every decision-driving number comes from `lib/planner` or `lib/facts` via `<Num>`, carrying an evidence mark and a source. No retyped circuit figures: the drift lint fails on the literals `20.9`, `20.8 A`, `10 AWG`, `1,440 W`, `17,060`, `12.5 A` outside `lib/`, with the scoping fixes in §4.10. |
| **Banned words** | "tested", "hands-on", "we tried", "measured" without a published M-backed log. "best-in-class", "game-changer", "ultimate", "top-rated", "#1", "look no further", "cozy", "in today's world", "elevate", "seamless", "unleash", "fake", "never tested", "parasite" (the last three ban us from the exact language a v1.0 competitor description used — §1.4). "(Month Year)" in titles unless the page changed that month. "I spent X months". "boring". "we will not" litanies. |
| **Codes** | Cite the section **and its edition** (e.g. "NEC 2023 §210.23(A)(1)"): 210.23(A)(1), 424.4(B), 210.8(A), 210.11(C)(4), 220.83/120.83, 240.4(D), 310.16; IFGC 305.3, 305.5, 621.5 (labeled as a borrowed extra check, not the governing section, when applied to a portable unvented heater — §2.8); IRC R315, R302.5.2, G2408.2, M1307.3; NFPA 58, 54; UL 1278, 2034. `lib/facts/codes.ts` carries an `editionBySection` table plus a state-adoption table `[VERIFY]`. Quote code text only in short paraphrase, and never more than one verbatim sentence from any NFPA or ICC document. Add "Your electrician and your local code edition govern." |
| **Manuals** | The manufacturer manual beats any rule of thumb. Quote it with an S mark and link the PDF. Carry the known corrections: DR-975 back wall 4.5 in; FUH54 $468–500 (class `$$$`, never printed as a dollar figure near a buy link); CZ220 "not where gasoline, paint, or flammable liquids are used or stored" (now generalized to rule S12 for every heater we list, §2.5); CZ220 max effective ceiling height 8 ft; FUH54 on 208 V ≈ 3,755 W; the Mr. Heater MH18B manual's residential scope ("emergency indoor heating" on 1-lb cylinders only, never a refillable cylinder indoors, never while sleeping) printed verbatim on every Buddy-type verdict and on the propane hub. |
| **Competitors** | Name them only to quote a published claim, verbatim, with link and retrieval date, and **no adjectives, and never the words "fake", "never tested" or "parasite."** Offer a right of reply, 5 business days before publishing anything naming them. When they update, we update and log it. |
| **FAQ** | Only questions found in keyword or PAA data. No expectation of FAQ rich results (removed 2026-05-07). |
| **Schema** | `Organization`, `WebSite`, `Person` (only when `NEXT_PUBLIC_EDITOR_NAME` is set), `WebApplication` (planner, Can I Run It?; no rating), `Article` (`datePublished` ≠ `dateModified`; `citation`), `Dataset`, `ItemList`, `BreadcrumbList`. **Never** `Product`, `Review` or `AggregateRating`. |
| **People** | Never invent a human. The byline is `NEXT_PUBLIC_EDITOR_NAME`, or "BayHeat editorial desk" until it is set — the `/about` H1 also drops "the people who check it" until then (§3.3). Reviewers come from `NEXT_PUBLIC_REVIEWERS` (name, license #, state, date verified on the state board), and every reviewer byline carries: "Paid per page by BayHeat; reviewed code statements only, not product picks" (a compliance finding: showing a paid reviewer beside a buy button with no disclosure is an undisclosed material connection). |
| **AI disclosure line** | **`AI_LINE` is now built dynamically from the page registry, not a single fixed sentence** (a compliance finding: the fixed sentence claimed "a named editor checks each page; licensed reviewers check electrical and gas rules" — untrue at launch, when no reviewer is hired and only a sample of pages is human-checked). Template: "Drafted with AI assistance. Numbers computed by model v{X} or sourced. Human review: {full \| sample} by {editor \| BayHeat editorial desk}. Licensed review: {name, licence #, state, date \| not yet reviewed}." |
| **Human review gate** | **100% of verdict-first (buy) pages and safety pages are approved by the human editor before publishing** — not a 10% sample (a compliance finding, revising §8.3 step 6). A 10% sample, plus 100% of Lab Reports, still applies to report-first/reference pages that carry no buy surface. |
| **Scaled pages** | The growth-playbook §2.5 uniqueness gate: ≥ 8 differing data points, ≥ 1 differing computed visual, a different recommendation, ≥ 150 words of state-specific commentary, an editor stamp, and the same 100%/10% human-review split above by page kind. |
| **Trust claims** | Pledge 2 (§5.4) is rewritten to say we buy every unit we *test*, not every unit we *rate* — most plates rate units we never bought, from manufacturer specs and our model. A plate without an `M` mark carries `MODEL PICK · SPEC-BASED`, never `LAB PICK`, until a measured report exists (§4.5). "Independent" always carries its qualifying clause (§1.2). |

### 5.3 Disclosure and legal copy (exact strings; they live in `lib/site.ts` and nowhere else)

- **Above the first paid link, inside every `<PaidZone>`** (`DISCLOSURE_INLINE`):
  > "Paid links: we earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases."
- **Footer** (`DISCLOSURE_FOOTER`):
  > "BayHeat is published by Laqaer Products. As an Amazon Associate, BayHeat earns from qualifying purchases. Links to other retailers may also pay us. When more than one store carries an item, the first button goes to the store that pays us more — the item itself is chosen by the model, not the payout. Money never changes our math, our picks or a verdict. How we make money →"
- **Micro-label** on each paid button: `Paid link`.
- **Lead block label:** `Sponsored: quotes from a partner network` — plus, on any page with a call-number or a lead button, "Calls go to a partner network, not BayHeat, and may be recorded" (a compliance finding, §2.8/§6.1).
- **Point-of-risk line** (`SAFETY_SCOPE`), rendered directly under every verdict stamp, on the Safety Card, on the OG `verdict` image and on the Safety section of every report:
  > "General information. Your electrician, gas fitter, local code and the heater's manual govern."
- **AI line:** see the dynamic `AI_LINE` template in §5.2.
- **Savings-claims line** (`SAVINGS_VARY`, new — a compliance finding covering the FTC R-value Rule, 16 CFR 460.3/460.19):
  > "Savings vary. Find out why in the seller's fact sheet on R-values. Higher R-values mean greater insulating power."

  It renders under every savings, payback or percentage-cut claim on pages, plates and emails. Kit R-values are taken only from the manufacturer fact sheet [S], with thickness stated, and H1s state savings as modeled and scoped ("…cuts heat loss about 12% in our example 2-car garage," never a bare "cuts heat loss 12%"). BH-002's claims are worded "one garage, one test."
- **Email footer:** the Laqaer Products postal address (`NEXT_PUBLIC_POSTAL_ADDRESS`), plus an unsubscribe link (CAN-SPAM).

### 5.4 The seven public pledges (on `/how-we-work` and home §07)

1. We never claim a test we didn't run. "Measured" means a published log, an instrument and a receipt.
2. **We buy every unit we test, at retail, and post the receipt with the address redacted. A pick without an `M` mark was chosen from manufacturer specs and our model; we have not tested it.** (Rewritten from "we buy every unit we rate" — a compliance finding: most plates rate units we never bought.)
3. No money changes a result, a ranking, a verdict or a model constant. Sponsors, when they exist, never touch the planner, the Index, reports or picks. **The one exception, disclosed at `/how-we-work#money`: when two stores carry the same item, the higher-paying one gets the first button — the item itself is still chosen by the model.**
4. No display ads in year 1, and never on the planner, the reports, safety pages or money pages.
5. We publish "Don't buy" verdicts, negative results and our model's misses.
6. We correct within 72 h, or 24 h for safety. Every change goes into `/lab/notebook`.
7. We show how every page is made: model version, sources, AI assistance, and who checked it.

### 5.5 Amazon Operating Agreement constraints (build-enforced by `scripts/check-affiliates.ts`)

- **No Amazon prices or star ratings.** Those are only allowed through the Creators API, which needs 10 qualifying sales in the trailing 30 days (PA-API 5 was retired 2026-05-15). We show our own price **class** (`$`–`$$$$`) with "our range, not a live price", and never a dollar amount on a plate. **`check-affiliates.ts` fails the build if a `$\d` literal shares its nearest `[data-buy-group]` ancestor with an `a[href*="amazon."]` anywhere in rendered HTML, including client-rendered planner plates, Fix-First rows, Can I Run It? alternatives and `/r/[code]`** — the static-HTML-only version of this check missed exactly those surfaces (a compliance finding).
- **No Amazon images, and no caching or hosting of them.** We use our class silhouettes.
- **Direct links only.** `https://www.amazon.com/dp/{ASIN}?tag={tag}` for the 5 verified ASINs; `https://www.amazon.com/s?k={query}&tag={tag}` otherwise. No `/go/` redirects, no shorteners, no cloaking. Clicks are tracked with a client event only.
- **Never invent an ASIN.** `products.ts` rejects any `asin` not in `VERIFIED_ASINS`. That list grows only through an owner-verified SiteStripe PR.
- **No Amazon links in print, PDF, Heat Report Pro, the Safety Card, `/embed/planner` or the Electrician Brief.** A test enforces it.
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
  - run in a **detached** garage, or one attached to an unoccupied house, never where people sleep;
  - **combustion tests run only in a detached garage**, with UL 2034 alarms placed in any adjoining building (tightened from "or an unoccupied attached house" — a compliance finding);
  - combustion tests with the tester outside and logging remotely; **abort at 30 ppm CO for 1 minute or on any alarm**;
  - **the dry-ice CO₂ test caps at 5,000 ppm (the OSHA PEL), no re-entry above that until purged, dry ice is never sealed in a container, and insulated gloves are worn at all times** (a compliance finding — the original protocol had no ppm ceiling);
  - ABC extinguisher on site;
  - manuals followed exactly;
  - **no torpedo heaters indoors, ever**;
  - **a contracted Field Tester works under a written agreement**: independent contractor, signed protocol, assumption of risk, insurance (a compliance finding — the original plan used contracted testers with no agreement in place);
  - the owner confirms liability coverage before G1 kit spend releases, in writing (§6.6, a revenue finding tying spend approval to that confirmation);
  - **posted receipts have addresses redacted**;
  - **BH-003 opens with the Awin/VEVOR commission disclosure and gives the maker 5 business days to reply before publishing adverse CO data** (§2.8).
- **Corrections:**
  - "Report a problem" (`CORRECTIONS_ENDPOINT`, falling back to `mailto:`) sits on every Lab stamp and popover;
  - acknowledge within 24 h; fix within 72 h, or 24 h for safety;
  - log it in `/lab/notebook`.

---

## 6. Monetization architecture

### 6.1 Streams: where each one appears

| # | Stream | Where it appears | Live in v1? | Modeled? |
|---|---|---|---|---|
| 1 | **Web affiliate**: Amazon `laqaer-20` plus routed partners | Planner plates and fix rows; the Verdict Rail on V pages; Can I Run It? safe alternatives and CO alarms; instruments' "buy the part" rows. **Never a dollar figure in the same buy group.** | Yes (Amazon). Partners are env-gated and fall back to Amazon. | Yes |
| 2 | **Email affiliate** | Welcome sequence (email 4 is the shortlist), Cold Snap alerts (**one** disclosed product link each), monthly Index, Black Friday / Cyber Monday. Uses the `_MAIL` tag. Every send with a paid link opens with the disclosure sentence and labels each button `Paid link` (§2.4). | Capture yes; sends from week 2 | Yes |
| 3 | **Heat Report Pro** — **moves to v1.1** (§2.7); "Launch price $14" only, no future price mentioned pre-launch | Result "Keep it" card (Notify me in v1); `/heat-report-pro`; the Brief print dialog; welcome email 5 | Waitlist only in v1; page and unlock ship v1.1 | Yes, ramped conversion (§6.5) |
| 4 | **Amazon cart** (Fix-First kit) | The Fix-First card only | Dark until ≥ 2 verified ASINs, and **those 4 specific ASINs are a P0 owner task** (§0.3, §8.5) | No (upside) |
| 5 | **Installer leads**: a link-out only, no on-site form or phone field | Circuit card (planner), `/240v-garage-heater`, `/garage-heater-installation-cost` **(both live at v1 launch, not v1.1 — a revenue finding)**, `/natural-gas-garage-heater` (v1.1), `/insulated-garage-door-vs-kit` (v1.1, garage-door partner). Labeled "Sponsored." **Never inside safety content.** | Slot yes; `LEADS_PROVIDER` env; fallback is the free Brief | A conservative non-zero line from the month a partner signs (§6.5 — modeling this at a hard $0 ignored the highest-EPC lever on the site, since install/cost-intent keywords carry CPCs of $18.01–$13.98 and pay-per-call benchmarks of $23–$37 per call, versus $0.25–$0.77 EPC on an Amazon/Northern-Tool click) |
| 6 | Newsletter sponsorship | Monthly Index email only; categories we don't rate (storage, flooring, lighting, openers) | No | $0 until signed |
| 7 | Contractor Pro embed | v2 | No | $0 |
| – | **Not in year 1** | Display ads, Test Fund, "certified by" badges (never), paid placements in rankings (never) | – | – |

### 6.2 Partner routing (`lib/commerce/route.ts`)

`route(product, surface)` returns `BuyLink[]`: a primary, a secondary and an optional also-at.

- **The primary is the highest-EPC partner that stocks the class**, according to the table below (re-ranked monthly by the Commerce Desk using measured EPC).
- **Amazon is always present**, either as the primary or as the second button.
- **A partner whose env var is missing drops out.** Amazon backfills it. Every partner not yet under contract stays a data-table entry with `enabled: false` in `partners.ts` and no live code path (§9, a feasibility finding: about a dozen integrations — Awin, CJ, Impact, 5 direct programs, 3 lead providers, census/corrections webhooks, GA4, IndexNow, Pinterest, a GSC service account — would be dead code at launch if wired up live; v1 code only actually calls Amazon, mailto, the Kit client and Plausible).

| Class | Primary (when env present) | Secondary | Cookie / rate (monetization.md §2) |
|---|---|---|---|
| Diesel air heaters, exhaust kits | VEVOR via Awin (`awinmid=28831`) / Hcalory | Amazon search | 30-day, 2–10% |
| Vented gas unit heaters (Big Maxx, Hot Dawg, Reznor) | Northern Tool via CJ | Amazon search | 30-day, 3%; EPC ≈ $0.77 |
| Mini-splits | HVACDirect / Got Ductless / Pioneer | Amazon search | 30-day 5% / 3% / 14-day 2% |
| Dehumidifiers (2027) | Sylvane | Amazon | 30-day 6% |
| Door kits, insulation | Amazon | Home Depot (Impact) | 24 h |
| Electric heaters (5 verified ASINs), seals, CO alarms, thermostats | Amazon `/dp/` (verified) or search | Home Depot / Walmart (Impact) | 24 h, 3% (4.5% for diesel listed under Automotive) |

**Link formats** (built only in `lib/commerce/{route,amazon,cart}.ts`):

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
- `data-partner`, `data-product`, `data-class`, `data-slot`, `data-surface`, `data-buy-group` (the last one is what `check-affiliates.ts` uses to find and reject a nearby dollar figure, §5.5).

`onClick` calls `track('affiliate_click', …)` via `navigator.sendBeacon`. **No redirect.**

### 6.3 Environment variables: exact names and fallbacks

Every **public** variable is read only through `lib/env.public.ts`, and every **server** variable through `lib/env.server.ts` — **split from the single `lib/env.ts` in v1.0** (a feasibility finding: Next.js only inlines `NEXT_PUBLIC_*` values that are accessed as a literal `process.env.NEXT_PUBLIC_X` expression; a generic typed-getter function that reads `process.env[name]` dynamically is **not** inlined at build time and returns `undefined` in the client bundle, so per-surface Amazon tags and `track()` would silently fall back even with the env var set). `lib/env.public.ts` reads every variable as a literal expression, e.g. `export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? 'laqaer-20';`. `lib/env.server.ts` holds `KIT_*`, `CENSUS_*`, `PRO_UNLOCK_SECRET` and the rest; `scripts/check-imports.mjs` fails the build if any file marked `'use client'` imports it. Capability flags (e.g. `kitEnabled`) are computed once in a server component and passed down as props, never recomputed in a client component from a raw env read. **With zero env vars set, the site is fully usable: no dead buttons, and every fallback is visible and honest.** **The owner redeploys after every env-var change** — a Vercel env change alone does not re-inline a `NEXT_PUBLIC_*` literal into an already-built bundle (§8.5).

| Variable | Scope | Used for | Fallback when unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | all absolute URLs, canonical, OG | `https://bayheatguide.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | public | footer, mailto fallbacks | `hello@bayheatguide.com` |
| `NEXT_PUBLIC_POSTAL_ADDRESS` | public | footer, email compliance | Line omitted. Email capture still works (Kit enforces an address before sending). |
| `NEXT_PUBLIC_EDITOR_NAME`, `NEXT_PUBLIC_EDITOR_URL` | public | byline, `Person` schema | "BayHeat editorial desk"; no `Person` schema; `/about` H1 omits "the people who check it" |
| `NEXT_PUBLIC_REVIEWERS` | public | JSON `[{name, role, license, state, verified}]` | "Technical review: scheduled" (expansion only) |
| `PRO_REVIEWED` | server | comma list, e.g. `electrical,gas`; gates the Pro checkout button (§2.7) | Pro checkout hidden; "Notify me" shown |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE`, `_PINTEREST`, `_REDDIT`, `_INSTAGRAM`, `_TIKTOK`, `_FACEBOOK` | public | `sameAs`, footer | Omitted |
| `NEXT_PUBLIC_AMAZON_TAG` | public | default Amazon tag | `laqaer-20` |
| `NEXT_PUBLIC_AMAZON_TAG_PLANNER`, `_CART`, `_MAIL`, `_SAFETY` | public | per-surface tracking IDs (suggested `bayheat-plan-20`, `bayheat-cart-20`, `bayheat-mail-20`, `bayheat-safe-20` [VERIFY availability]) | `NEXT_PUBLIC_AMAZON_TAG`, then `laqaer-20` |
| `NEXT_PUBLIC_HOMEDEPOT_LINK_BASE`, `NEXT_PUBLIC_WALMART_LINK_BASE`, `NEXT_PUBLIC_LOWES_LINK_BASE` | public | Impact deep links | Button hidden; Amazon remains |
| `NEXT_PUBLIC_CJ_PID`, `NEXT_PUBLIC_CJ_AID_NORTHERNTOOL` | public | Northern Tool | Amazon search |
| `NEXT_PUBLIC_AWIN_AFFID` (+ Hcalory MID constant, TBD) | public | VEVOR 28831, Hcalory | Amazon search |
| `NEXT_PUBLIC_HCALORY_REF`, `NEXT_PUBLIC_HVACDIRECT_REF`, `NEXT_PUBLIC_GOTDUCTLESS_REF`, `NEXT_PUBLIC_PIONEER_REF`, `NEXT_PUBLIC_DELLA_REF`, `NEXT_PUBLIC_SYLVANE_LINK_BASE` | public | direct programs | Amazon search |
| `NEXT_PUBLIC_CHECKOUT_URL_PRO` | public | Heat Report Pro hosted checkout (Polar), v1.1 only | `Notify me` (EmailCapture, tag `pro-waitlist`) |
| `PRO_UNLOCK_SECRET` | server | HMAC for `/api/pro/verify` and `scripts/pro-token.ts`, v1.1 only | Pages 1–2 of the sample only |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ORGANIZATION_ID` | server | v1.1 automatic fulfillment | Manual token email |
| `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_TAG_IDS` (JSON) | server | email capture and tags | `Copy link` plus `mailto:`; alert box hidden |
| `LEADS_PROVIDER` (`networx` \| `modernize` \| `hdservices` \| unset), `NEXT_PUBLIC_NETWORX_FORM_URL`, `NEXT_PUBLIC_HDSERVICES_LINK_BASE`, `NEXT_PUBLIC_CALL_NUMBER_ELECTRICAL`, `NEXT_PUBLIC_CALL_NUMBER_HVAC` | mixed | installer quotes — a link-out only; **no `tel`/`phone`-typed input exists anywhere under `app/`, enforced by a lint rule** (a compliance finding: an on-site phone field or an API-posted lead exposes us to TCPA damages of $500–1,500 per call and to state mini-TCPAs) | The free Electrician Brief |
| `CENSUS_ENDPOINT`, `CORRECTIONS_ENDPOINT` | server | webhooks (Apps Script / Formspree / Supabase later) for warm-up reports and corrections | CSV download plus pre-filled `mailto:` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA4_ID` | public | analytics — **v1 uses Plausible only**; if GA4 is ever enabled, Google signals and ad personalisation are turned off and a "Your privacy choices" link is added (§6.6, a compliance finding) | `track()` is a no-op |
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

### 6.5 Revenue model: a realistic ramp, mix-weighted CTR, a leads line, and a ramped Pro conversion (script: `scratchpad/blueprint/model.py`; the Ops Analyst ports it to `scripts/revenue-model.ts` in week 2)

**A revenue-model finding rejected the v1.0 base case outright: it assumed 1,000 → 5,000 → 11,000 → 14,000 sessions/mo Oct–Jan on a domain that is, as of 2026-09-25, essentially unindexed (`site:bayheatguide.com` returns zero pages), targeting commercial queries whose page ones are owned by Home Depot, Lowe's, Amazon and Reddit. No case study supports that velocity for a new domain in a YMYL-adjacent niche. The base case below uses a realistic new-domain ramp instead — roughly 900 total sessions in October (organic + PR + the $200 paid-search test), climbing to about 3,800–4,800/mo by December–January, and growing more slowly than the old model through the rest of the year.**

**Hard lines are counted:**
- web affiliate: sessions × CTR × EPC × season, **now modeled as a mix of verdict-first traffic (a higher blended CTR×EPC, since the buy rail sits in the first screen) and report-first traffic (a lower blended rate, since no rail sits in the first screen) — roughly 70/30 by the §7.3 route mix** (a revenue finding: one sitewide blended multiplier hid the risk that PR-driven traffic, which the growth plan explicitly sends to citation-bait report-first pages, converts far below the sitewide average). Season multipliers unchanged: Nov 1.2, Dec 1.3, Jan 1.25, Mar–Apr 0.8, Jun–Jul 1.1–1.15.
- email affiliate: capture % × $/sub/mo, ×1.5 Nov–Feb, 1%/mo churn;
- Heat Report Pro (from November, once it ships): net of Polar's 5% + $0.50, with a **ramped conversion rate — 0.05% blended in November (pre-trust, partial month live), 0.10–0.13% in December (after BH-002), 0.15% from January (after BH-003)** — not flat from month one (a revenue finding: Pro launches with explicitly no reviews or testimonials allowed, so a flat 0.10% from day one assumed trust the site hadn't earned yet);
- **installer leads: a conservative, non-zero line once a partner signs — modeled at 0.05% of sessions on lead-bearing pages × a $20 blended average payout, starting December** (a revenue finding: modeling this at a hard $0 for the full 12 months ignored the highest-EPC lever on the site; Networx/Modernize outreach moves to week 1 so approval can run in parallel with the traffic ramp, §7.2, §8.5).

Leads (beyond the conservative line above), sponsors, display and embeds stay **$0**.

**Costs** are stage-gated (§6.6):
- $31/mo fixed;
- reviewers paid per page (electrical and gas only);
- the phase-1 lab kit, $1,050 in October;
- consumables of $60/mo from October to December;
- a $200 paid-search learning budget;
- the phase-2 kit, $700 in January, **only if December gross is at least $500 — the revised model below shows December gross at about $340, so this gate is not expected to clear on schedule** (§6.6).

| Scenario | Sessions (12 mo, revised) | CTR × EPC | Email capture / $ per sub | Pro conversion |
|---|--:|---|---|---|
| Conservative | ≈22k | 11% × $0.20 | 1.5% / $0.06 | 0.03% |
| **Base** | **≈49.5k** (a realistic new-domain ramp, down from the v1.0 figure of 125.5k) | **17% × $0.25 blended, mix-weighted (§ above)** | **2.5% / $0.12** | **ramped, 0.05% → 0.15%** |
| Upside | ≈110k | 21% × $0.30 | 3.2% / $0.17 | 0.15% flat from launch |

**Base case, by month [MODEL] — recomputed from the assumptions above:**

| Month | Sessions | Web aff. | Email aff. | Pro | Leads | **Gross** | Costs | Net | Cum. net |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Oct-26 | 900 | $38 | $3 | $0 | $0 | **$41** | $2,341 | −$2,300 | −$2,300 |
| Nov-26 | 2,200 | $112 | $14 | $14 | $0 | **$140** | $691 | −$551 | −$2,851 |
| Dec-26 | 3,800 | $210 | $31 | $63 | $38 | **$342** | $391 | −$49 | −$2,900 |
| Jan-27 | 4,800 | $255 | $52 | $92 | $48 | **$447** | $231 (**phase-2 kit not released — G3 gate misses**) | $216 | −$2,684 |
| Feb-27 | 4,200 | $179 | $71 | $81 | $42 | **$373** | $231 | $142 | −$2,542 |
| Mar-27 | 3,400 | $116 | $57 | $65 | $34 | **$272** | $231 | $41 | −$2,501 |
| Apr-27 | 3,200 | $109 | $66 | $61 | $32 | **$268** | $231 | $37 | −$2,464 |
| May-27 | 4,000 | $170 | $77 | $77 | $40 | **$364** | $231 | $133 | −$2,331 |
| Jun-27 | 5,200 | $243 | $92 | $100 | $52 | **$487** | $331 | $156 | −$2,175 |
| Jul-27 | 6,200 | $303 | $110 | $119 | $62 | **$594** | $331 | $263 | −$1,912 |
| Aug-27 | 5,600 | $238 | $125 | $108 | $56 | **$527** | $231 | $296 | −$1,616 |
| Sep-27 | 6,000 | $255 | $142 | $115 | $60 | **$572** | $431 | $141 | **−$1,475** |
| **12 mo** | **≈49,500** | **≈$2,228** | **≈$840** | **≈$895** | **≈$464** | **≈$4,427** | **≈$5,902** | **≈−$1,475** | |

- **Base:** the site is **not** net-positive over the first 12 months on this revised, realistic ramp — a materially more sobering picture than v1.0's projected $3,334 net. The old "$300/mo net by Dec 31" goal is **missed**: December's net is about −$49, not +$460. September 2027's run-rate is around $572/mo gross, not $1.4k.
- **The G3 phase-2-kit gate (December gross ≥ $500) is not expected to clear**, so BH-004 (5 kW warm-up) and BH-005 (Big Buddy moisture) should be planned for whenever a later month clears it, not for January by default (§3.5, §6.6).
- **Conservative:** roughly $900–1,000/yr gross, net well below −$2,900; the owner funds phase 1 out of pocket and phase 2 is never released.
- **Upside:** roughly $14.6k/yr gross (using the same session, CTR and conversion multiples as the Conservative/Base scaling), net positive but **still far short of the $20k MRR portfolio north star** — see the framing note below.
- **Cash timing unchanged:** cash lands 60–90 days after accrual, so December's earnings arrive in Feb–Mar 2027, exactly when the model's own numbers are weakest.
- **Owner cash-runway exposure, stated explicitly (a revenue finding — §6.6):** peak out-of-pocket exposure is about **$2,900** (reached in December), not fully recovered by month 12 even in the Base case. **The owner confirms this in writing before G1 kit spend releases**, alongside the liability-coverage confirmation already required (§5.6).
- **Framing (a revenue finding):** the dossier's stated north star is "$20k MRR, blow past this." Even the recomputed Upside scenario reaches nowhere near a $6.7k/mo run-rate by September 2027, let alone $20k MRR. This blueprint does not pretend otherwise. The levers that would need to outperform their modeled value for a realistic path toward that goal in year 2 are, specifically: (1) installer leads actually converting near pay-per-call benchmarks ($23–$37/call) rather than the conservative $20-blended-average line above; (2) the two 49,500-searches/mo insulated-garage-door keywords converting through the garage-door lead path rather than staying untouched; (3) the counter-seasonal cooling cluster (moved to January, §3.5) performing well enough in its first real summer to add a second demand season. None of these are counted in the Base case; all three are plausible upside paths worth re-evaluating with real Q1 2027 data.

### 6.6 Stage gates and spend rules (the Ops Analyst enforces them; the owner approves)

| Gate | Spend released | Condition |
|---|---|---|
| G0 (Sep 28) | Fixed costs ≤ $31/mo (Vercel Pro $20, Plausible $9, domain); reviewers at $75–150 **per page**, for electrical and gas money pages only | – |
| G1 (Oct 5) | **Phase-1 lab kit ≈ $1,050**: Aranet4 ($199), 6× Inkbird IBS-TH2 ($96), a Forensics Detectors CO meter ($100), 2 UL 2034 alarms with display ($60), 2× CZ798 on separate circuits with 2 plug-in kWh meters ($150), a door kit plus weatherstrip package ($245), a VEVOR-class diesel heater plus exhaust kit ($180), dry ice ($30). Buy at retail and post the receipts with addresses redacted. | **Owner confirms liability coverage AND the ≈$2,900 peak out-of-pocket exposure from §6.5, both in writing, before this releases** |
| G2 (Oct 12–25) | **$200 paid-search learning budget.** Microsoft plus Google, exact and phrase on `garage heater calculator` ($0.18), `garage btu calculator` ($0.12) and `garage heater size calculator` ($0.25). Lands on the planner, never on Amazon. Starts only once analytics has been live for 7 or more days (a feasibility finding: the G2 kill rule needs real click data to evaluate against). | **Kill at 7 days** if estimated ROAS < 1.3, where est. revenue = `affiliate_click` × $0.25 + `email_submit` × $1.50. On a miss, redirect the budget and any lead-gen spend to the 3 highest-CPC pages (§6.5, §7.7). |
| G3 (Jan 4, only if cleared) | **Phase-2 kit ≈ $700**: TOPDON TC001 thermal camera ($199), CZ220 on a 240 V/30 A circuit (the electrician is the owner's cost), Big Buddy, Emporia Vue 3 ($149). Runs BH-004 and BH-005. | **December gross ≥ $500 — the revised model (§6.5) projects about $340, so plan for this gate to slip past January** |
| G4 (only if G3 clears) | Reviewer retainer, creators ($1,500), sponsorship sales | December gross ≥ $500 **and** the following month's MTD pace ≥ base |
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
- 40–50 word answer blocks with numbers and stable anchors (`#circuit-5kw`, `#answer`);
- `Dataset` schema;
- IndexNow plus Bing Webmaster Tools on deploy;
- the GSC Generative AI report;
- a fixed **25-prompt citation panel** run monthly (list in `.claude/skills/ai-panel/prompts.md`).

### 7.2 12-week launch calendar (Mon 2026-09-28 → Sun 2026-12-20)

**[A]** = agent end to end · **[A→H]** = agent drafts, human approves or posts · **[H]** = human only

| Wk | Dates | Ship | Lab | PR / community / email | Human | Milestone |
|---:|---|---|---|---|---|---|
| 1 | Sep 28–Oct 4 | [A] **v1 live by Fri Oct 2** (§3.3, 27 indexable routes + 9 × 308). Sitemap, IndexNow, llms.txt. [A] Welcome sequence written. | [A] Draft protocols P-002…P-005 | [A→H] Human-written or human-fully-rewritten Reddit comments only, **no daily quota and no karma-farming** (a compliance finding: an AI-drafted comment posted purely to build karma, with no disclosure, is an undisclosed insider endorsement under 16 CFR 255.5/465.5 the moment it links or references BayHeat material) | [H] Owner checklist P0 (§8.5), **including confirming the Laqaer Products entity, insurance quotes and the `/terms`/`/privacy`/`SAFETY_SCOPE` attorney pass, and emailing affiliate@networx.com and affiliates@modernize.com (moved up from week 10 — a revenue finding)**. GSC request-indexing for the 10 priority URLs. Bing WMT. Post the licensed-electrician gig. | 27 routes live; 10 submitted |
| 2 | Oct 5–11 | [A] natural gas, Big Maxx comparison (Oct 5); shop heater, most efficient, Buddy verdict (Oct 8). October Prime event page if dated [VERIFY]: "What's worth buying for your garage", price tiers only. | [H] **Buy the phase-1 kit** (G1, after the liability + exposure sign-off). [A] **Publish pre-registered protocols Fri Oct 9** in `/lab` and the notebook. [H] 7-night free-float baseline (Inkbird). | [A→H] Denver first freeze ≈ Oct 8: Colorado pitch using Index numbers. [A] Welcome sequence on (after [H] approval). | [H] Kit + DNS, PO box, Polar, Awin / CJ / Impact / HVACDirect applications. **Verify the 4 Fix-First ASINs plus the remaining ~25 ASINs with SiteStripe** (the 4 Fix-First ones were meant to be a P0 task, before launch — see §8.5; if they slipped, finish them here at the latest). | 32 routes; first subscriber |
| 3 | Oct 12–18 | [A] best garage heater, kerosene verdict (Oct 13); torpedo verdict, ventless (Oct 15). Cart button on if ≥ 2 verified ASINs. | [A] Baseline analysis: free-float vs model (notebook entry) | [A→H] **PR wave 1** (MN, WI, ND, SD, MI, ME, VT, NH, AK, MT, WY, CO): 60 pitches. Minneapolis first freeze ≈ Oct 18. [H] **Show HN**: "A garage heater calculator that shows every formula and grades every number by evidence". [A] Cold Snap cron in shadow mode. | [H] Qwoted, Featured, SOS sign-ups; send pitches. **G2 paid search on (once analytics has 7+ days live).** | Index cited by ≥ 3 outlets or blogs |
| 4 | Oct 19–25 | [A] fridge heater kit, keep above freezing (Oct 20); install cost (already live since launch — see §3.3). **Index update after EIA's ≈ Oct 23 release.** | [H] **BH-002 "before" nights** (co-heating plus CO₂ decay, capped at 5,000 ppm) | [H] **r/dataisbeautiful [OC]**, the state tile map. [A→H] Pins at 5 a day, with `MODELED — NOT A PHOTOGRAPH` burned into every pin. [A] **Cold Snap alerts live** for zones 6–7 — NWS-forecast-only copy (§7.6), first send needs human approval. | [H] Sign the first licensed reviewer; stamps go live on 240 V pages. G2 kill/keep decision. | ≥ 20 of 27 launch pages indexed |
| 5 | Oct 26–Nov 1 | [A] mini-split, R-value, `/insulated-garage-door-vs-kit` (Oct 27); unheated-garage temps, `/embed` + compact widget (Oct 29). Seasonal refresh of prices and dates. | [H] **BH-002 "after" nights** (kit plus weatherstrip installed) | [A→H] PR wave 2 (IL, IN, OH, PA, NY, MA, CT, RI, NJ). Chicago first freeze ≈ Oct 28. DST ends Nov 1: "winter workshop" Shorts, each burned with `MODELED — NOT A PHOTOGRAPH`. [A] First monthly Index email (Tue Nov 3, drafted). | [H] Upload 3 Shorts | 150k GSC impressions/mo run-rate (revised down proportionally to the realistic session ramp, §6.5) |
| 6 | Nov 2–8 | [A] diesel install (`noindex`/draft until reviewer sign-off), Recall Watch, cheapest way (Nov 3); garage gym (Nov 5). Heat Report Pro opens (Oct 15 target, if `PRO_REVIEWED` cleared) tracked here if it slipped. | [A] **Publish BH-002 (Fri Nov 6)**, the first M marks: model vs measured | [A→H] Pitch BH-002 to Family Handyman, Bob Vila, Lifehacker, This Old House. [A] Index email Nov 3. | [H] Review BH-002 before publishing (100% human approval, §5.2) | First measured report |
| 7 | Nov 9–15 | [A] thermostat; **state batch 1** (10 coldest, `noindex` until they pass the gate) (Nov 10); first-garage-freeze dataset (Nov 12). | [H] **BH-003 diesel runs** (outdoor exhaust, remote monitoring, abort rule, VEVOR/Awin disclosure, 5-day maker reply window) | [A→H] PR wave 3 (KY, TN, VA, NC, MD, DE, DC, WV, MO, KS). Boston first freeze ≈ Nov 9. | – | ≥ 10 referring domains; **rank check the 3 pure-transactional sealing pages (bottom seal, weather stripping, insulation kit) separately** — if none is top-20 by Nov 15, redirect their traffic budget toward the "how-to-insulate"/Kit Payback Meter informational framing (a revenue finding: these compete directly against retailer listing pages, a harder ranking problem than the informational clusters) |
| 8 | Nov 16–22 | [A] **Model v1.1** (warm-up parameters from calibration reports); `/garage-heater-deals` (Nov 20, tiers only, no `%`/"was-now"/countdown); state batch 2 | [A] BH-003 analysis | [A→H] PR wave 4 (GA, AL, MS, TX, OK, AR, LA). NYC and Atlanta first freezes ≈ Nov 20. [A] Thanksgiving preview email (Nov 24). | [H] Approve the v1.1 constants | Model change logged |
| 9 | Nov 23–29 | [A] Price refresh, internal-link and orphan audit | – | [A] **Black Friday (Fri Nov 27) email**, disclosed. [A→H] BF Shorts: "Check your breaker before you buy a heater". | – | Record week |
| 10 | Nov 30–Dec 6 | [A] Cyber Monday update; state batch 3 | [A] **Publish BH-003 (Thu Dec 3)**: measured diesel CO, fuel by mass, $/h vs electric | [A] **Cyber Monday (Mon Nov 30) email** with the "Launch price $14" Pro offer (if checkout is live). [A→H] Diesel Facebook groups: answers with the exhaust diagram, disclosed. [H] r/dieselheater and GarageJournal posts, editor's own account, name disclosed, and a BayHeat-connection disclosure line whenever a post mentions or links our material. | – | Diesel pages top 10 → +3 diesel pages |
| 11 | Dec 7–13 | [A] `/wood-stove-for-garage`; state batches 4–5 (warm states cooling-first) | – | [A→H] Reactive pitches within 2 h of any NWS Extreme Cold Warning over a metro of 1M+ | – | 51 state pages (gated) |
| 12 | Dec 14–20 | [A] Index December update; Q1 plan (**the cooling cluster ships early-to-mid January, not March — §3.5**) | [A] Lab retro: model error table; **check the G3 phase-2 gate (expected to miss, §6.5/§6.6)** | [A] "The coldest six weeks start now" email (Tue Dec 15). Pro pricing rule applies per §2.7 (drop to $12 if under 0.4 sales/1,000 sessions by Dec 15). | [H] Approve the Q1 budget; the G3 decision on Jan 4 | 40 referring domains; retro in the notebook |

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
15. `/garage-heater-installation-cost` (Oct 2 — moved forward from Oct 22, a revenue finding)
16. `/infrared-garage-heater` (Oct 2)
17. `/how-to-insulate-a-garage` (Oct 2)
18. `/garage-heater-size` (Oct 2)
19. `/best-wall-mount-garage-heaters` (Oct 2, kept URL)
20. `/electric-vs-propane-garage-heater` (Oct 2)
21. `/terms` (Oct 2)
22. `/natural-gas-garage-heater` (Oct 5)
23. `/ceiling-mount-garage-heater` (Oct 5, moved from v1 launch to make room for #15)
24. `/big-maxx-vs-hot-dawg-vs-modine-vs-reznor` (Oct 5)
25. `/shop-heater` (Oct 8)
26. `/most-efficient-garage-heater` (Oct 8)
27. `/can-i-run-it/buddy-heater-in-garage` (Oct 8)
28. `/best-garage-heater` (Oct 13)
29. `/can-i-run-it/kerosene-heater-in-garage` (Oct 13)
30. `/can-i-run-it/torpedo-heater-in-garage` (Oct 15)

The home, lab, notebook, how-we-work, about, privacy and Pro-waitlist pages are launched but are not counted as content.

### 7.4 Linkable assets

| Asset | Hook | Target linkers |
|---|---|---|
| **BH-001, The 4× Problem** | "Seven answers for one garage" | Show HN, r/HVAC, r/HomeImprovement, AI answers |
| **Garage Heat Index** + CSV + tile map (+ embed in v1.1) | A monthly EIA-release headline; state rankings | Local TV meteorologists, state news, Dataset Search |
| **Can I Run It? Safety Card** (co-brandable `?dept=`, permission-gated) | "Tape it to the wall" | Fire departments, city safety pages, r/Frugal, FB groups |
| **Planner embed** (stripped, no commerce) | A free calculator for your site | Garage-door installers, electricians, garage-gym bloggers |
| **Methodology + constants CSV** | Open math | Engineers, forums, LLMs |
| **BH-002 door-kit co-heating; BH-003 diesel CO** | "We measured it" | Family Handyman, Bob Vila, r/dieselheater, GarageJournal |
| **First-garage-freeze dataset** (Nov 12) | "Your garage freezes on day 2–3, not the first frosty night" | Local news during cold snaps |
| **Free Electrician Brief** (QR) | Offline word of mouth | Electricians |

### 7.5 Community plan (humans post; agents draft; rules first)

**Reddit:** r/HomeImprovement, r/DIY, r/hvacadvice, r/woodworking, r/garagegym, r/homegym, r/dieselheater, r/electricians (read-only unless asked).
- **No karma-farming quota, ever.** Every post is written or fully rewritten by a human. No links for the first 30 days; after that, at most 1 link per 10 helpful comments, and only when it answers the question (a planner permalink or the Safety Card).
- **Any post that mentions, links or reuses BayHeat material ends with:** "(Disclosure: I run BayHeat; some heater links there pay us.)" — a disclosed name is not the same as a disclosed business connection (a compliance finding, 16 CFR 255.5/465.5).
- **No affiliate links in social posts or bios, ever.**
- The editor's own account, with the editor's name disclosed.

**Other channels:**
- **GarageJournal:** 5 helpful answers a week; a signature link only where the rules allow it, with the same disclosure line when linking our material.
- **Facebook diesel-heater groups:** exhaust and CO answers using our diagram, disclosed.
- **Pinterest:** 5 pins a day from planner thermal renders ("Where a 2-car garage loses heat"), each with `MODELED — NOT A PHOTOGRAPH` burned into the image.
- **YouTube Shorts:** 3 a week from week 5 (thermal renders labeled `MODELED`; real TC001 footage after G3, if it clears).
- **Any removal or warning:** stop linking in that community for 30 days, then review with a human.

### 7.6 Email plan (Kit)

**Welcome sequence** (6 emails over 12 days):
1. Your report plus how to read the band.
2. Fix first: the $675 logic for your grade.
3. Safety: CO alarms, clearances, circuits.
4. Your shortlist: up to 3 classes, mail tag.
5. Heat Report Pro (waitlist copy until it ships, then the launch-price offer).
6. "What's your garage for?" (reply-based; sets the use-case tag).

**Broadcasts:**
- **Cold Snap** (alerts tag): at most 1 per 7 days and 4 per season; sent by the ZIP3 zone when NWS forecasts the first ≤ 28 °F night within 72 h, or on an Extreme Cold Warning or Cold Weather Advisory. **Copy is rebuilt around the NWS forecast only, with no garage-temperature prediction**: "NWS forecasts {low} °F near {area} on {date}. An unheated garage can fall below freezing by the second cold night. If anything in yours can freeze, act before tonight." Every alert also carries: "Best-effort email: it can arrive late or not at all. Not a substitute for a freeze alarm or thermostat." (A compliance finding: the old default copy, "Nothing to do tonight" when the modeled garage stayed above 36 °F, was itself an uncalibrated garage-temperature forecast, which §0.3/§3.6 explicitly forbid until reference-garage calibration exists. The dry brand-voice line "Nothing to do tonight" still exists — see §5.1 — but never here, and never as a safety-adjacent claim.)
- **Monthly Index:** the first Tuesday.
- **Lab Reports:** as they publish.
- **Black Friday Nov 27, Cyber Monday Nov 30.**
- **"Coldest six weeks" Dec 15.**
- **Recall Watch:** only when a heater, CO alarm or fuel-container recall hits, verified by a human.
- **Switch to cooling tags when the cooling content ships (early-mid January, §3.5) and again ahead of the March 2027 planner cooling-mode launch.**
- **Every promotional send checks the recipient's consent tags first (§2.4).**

**Targets:**

| Email | Open rate | Click rate |
|---|--:|--:|
| Welcome | ≥ 45% | ≥ 8% |
| Alerts | ≥ 50% | ≥ 6% |

Unsubscribes stay under 0.5% per send.

### 7.7 KPIs: monthly targets (base / upside, revised to the realistic session ramp in §6.5)

| Month | Sessions | Planner completions | Email subs (cum.) | Ref. domains (cum.) | Indexed pages | Affiliate clicks | AI panel citations (of 25) | Measured reports | Gross |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Oct-26 | 0.9k / 2.2k | 135 / 350 | 23 / 70 | 5 / 12 | 30 | 155 / 470 | 0 | 0 | $41 / $155 |
| Nov-26 | 2.2k / 5.5k | 330 / 850 | 78 / 220 | 20 / 40 | 45 | 375 / 1.2k | 1 | 1 | $140 / $600 |
| Dec-26 | 3.8k / 10k | 570 / 1.5k | 172 / 480 | 40 / 80 | 90 | 650 / 2.1k | 2 / 4 | 2 | $342 / $1.3k |
| Jan-27 | 4.8k / 13k | 720 / 2.0k | 290 / 830 | 60 / 110 | 110 | 820 / 2.7k | 3 / 6 | 2–3 (phase 2 likely gated out, §6.6) | $447 / $1.7k |
| Feb-27 | 4.2k / 11k | 630 / 1.7k | 392 / 1.1k | 70 / 130 | 120 | 715 / 2.3k | 4 | 2–3 | $373 / $1.4k |
| Mar-27 | 3.4k / 9k | 510 / 1.4k | 473 / 1.3k | 80 / 150 | 140 | 580 / 1.9k | 5 | 3 | $272 / $1.1k |
| Apr-27 | 3.2k / 8.5k | 480 / 1.3k | 548 / 1.5k | 90 / 170 | 155 | 545 / 1.8k | 6 | 3 | $268 / $1.1k |
| May-27 | 4.0k / 10.5k | 600 / 1.6k | 643 / 1.7k | 105 / 190 | 165 | 680 / 2.2k | 7 | 4 | $364 / $1.4k |
| Jun-27 | 5.2k / 13k | 780 / 2.0k | 767 / 2.0k | 120 / 220 | 175 | 885 / 2.7k | 8 | 5 | $487 / $1.7k |
| Jul-27 | 6.2k / 15.5k | 930 / 2.4k | 914 / 2.4k | 140 / 250 | 180 | 1.05k / 3.3k | 9 | 6 | $594 / $2.1k |
| Aug-27 | 5.6k / 14k | 840 / 2.2k | 1.05k / 2.7k | 160 / 280 | 185 | 950 / 2.9k | 9 | 7 | $527 / $1.9k |
| Sep-27 | 6.0k / 15k | 900 / 2.3k | 1.19k / 3.0k | 180 / 300 | 190 | 1.0k / 3.2k | 10 / 15 | 8 | $572 / $2.0k |

**Leading indicators (weekly):**
- planner start rate ≥ 25% of sessions; completion ≥ 60% of starts;
- ≥ 70% of pages indexed within 14 days, and ≥ 90% by Dec 1;
- top 20 for 10 of the 25 tracked terms by Nov 15, and top 10 for 5 by Dec 15 — **the 3 pure-transactional sealing pages are tracked as their own cohort, separate from the informational/tool clusters** (a revenue finding: they compete against retailer listing pages, not forums and thin calculators);
- affiliate clicks per 1,000 sessions ≥ 170;
- EPC by partner.

**Decision rules:**

| Trigger | Action |
|---|---|
| **Sessions < 60% of the base-case target for two consecutive months** | **Freeze new content for a week; redirect the G2 paid-search budget and any live lead-gen spend to the 3 highest-CPC pages; re-baseline the model to the Conservative scenario** (new — a revenue finding: nothing in v1.0 actually checked traffic against the forecast) |
| Planner completion < 40% of starts by Nov 1 | Freeze content for a week and fix the flow |
| < 50% of pages indexed 21 days after publishing | Pause new pages; fix internal links and uniqueness; win 5 referring domains; no state pages until fixed |
| Index earns < 2 links by Nov 30 | Re-pitch on a cold-snap hook, with a new chart |
| A test shows the model off by > 25% | Publish the miss that week, bump the model version, email the lab tag. **The miss is the story.** |
| Diesel or shop pages in the top 10 by Dec 1 | Add 3 diesel pages before Dec 15 |
| Pro < 0.4 sales per 1,000 sessions by Dec 15 (once it has shipped) | $12 |
| A partner's EPC < 50% of the class median | Demote it |
| Any community warning | 30-day link pause |
| A pure-transactional sealing page isn't top-20 by Nov 15 | Redirect its traffic budget to the informational/instrument framing (§7.7) |

---

## 8. The agent team that runs BayHeat

### 8.1 Operating model

- **Agents** are Claude Code subagents defined in `.claude/agents/<name>.md`, with frontmatter `name`, `description`, `tools` and `model`.
- **Skills** are playbooks in `.claude/skills/<name>/SKILL.md`.
- **Scheduling** uses Claude Code Remote Routines (`create_trigger`, fresh session per fire, cron in UTC with jittered minutes).
- **All work lands as GitHub PRs** against `main`, which stays untouched until the v1 Definition of Done is green (§3.4, §9.5).
- **Nothing publishes without passing the Lab Gate:**
  1. CI (`npm run check`, plus `scripts/check-affiliates.ts`, `scripts/anti-slop.ts`, `scripts/evidence-lint.ts` (warn, except drift literals and `verify`-status facts on indexable pages, which fail), `scripts/check-links.ts`, `scripts/check-imports.mjs`);
  2. the **Fact-Checker**;
  3. the **Standards Editor**;
  4. **Design QA**, for any visual change;
  5. **the human approval rule: 100% of verdict-first (buy) pages and safety pages, 10% sample of everything else, 100% of Lab Reports** (§5.2, a compliance finding revising the flat 10% sample rule).

**Humans alone:**
- create every account;
- sign every tax form and agreement, including the field-tester agreement (§5.6);
- post to every community and social profile;
- send every press pitch;
- run every physical test;
- approve every safety-rule change and every model-constant change;
- confirm the Laqaer Products legal entity and insurance coverage (§1.1, §5.6, §8.5).

### 8.2 Roles (`.claude/agents/*.md`)

| Agent (file) | Mandate | Tools | Cadence (UTC) | KPIs | Guardrails |
|---|---|---|---|---|---|
| **chief-of-staff** | Turns the 12-week calendar into a weekly plan; assigns issues; runs the Monday loop; writes the weekly notebook entry; owns escalation; **checks sessions against forecast and applies the new §7.7 traffic decision rule** | Read, Grep, Glob, Bash (`gh`), Routines | Mon `52 13 * * 1`; daily queue `07 14 * * *` | Plan hit rate ≥ 85%; 0 pages shipped without the Gate | Never merges its own PRs. The owner approves the weekly plan (10 min). |
| **report-writer** | Drafts guides, hubs, verdict pages and answer blocks from `lib/planner` + `lib/facts`, following §3.2 and §5 | Read, Write, Edit, Grep, Glob, Bash, WebFetch | Sprint Mon–Wed; 5 pages/wk Oct–Nov, then 2–3 | ≥ 70% indexed within 14 days; 0 Gate rejections on the second pass | Never types a unit-bearing number that exists in lib. Never writes "tested", "fake", "never tested" or "parasite". Never puts a `$` figure inside a `[data-buy-group]`. Max 5 indexable pages/wk. |
| **fact-checker** (red team) | Adversarially re-derives every number in a PR from its formula or source; re-fetches sources and checks retrieval dates; tries to break verdict logic with edge cases; **confirms every verdict carries ≥ 2 conditions and every heater plate carries a `safetyLine`** | Read, Grep, Bash (`node --test`, `python3 scratchpad ref`), WebFetch, WebSearch | On every content PR; full-site sweep `09 17 1 * *` | 100% of numbers traced; post-publish corrections < 1 per 20 pages | Blocks on any untraceable number. Disputes go to the editor (human). |
| **standards-editor** | Final gate: evidence marks, banned words, disclosure placement (including inside `<PaidZone>` on client-rendered surfaces), competitor quote rules, reading level, uniqueness gate for templates, **the 100%/10% review split by page kind** | Read, Grep, Bash (lints) | On every PR | 0 FTC or Amazon violations; 0 banned words shipped | The human editor applies the §5.2 review-percentage rule per page kind. |
| **model-steward** | Owns `lib/planner`: the T1–T9 and T11–T13 vectors (T10/cooling deferred to March 2027, §9), constants, the price snapshot, calibration from warm-up reports and tests, semver releases, the methodology page | Read, Edit, Bash (`node --test`, python ref) | Weekly `18 15 * * 3`; on each new calibration batch or test | Vectors 100% passing; warm-up MAPE ≤ 20% by Jan 31; every constant change logged | **The human editor approves every constant change.** |
| **data-desk** | EIA electricity, gas, propane, diesel and heating-oil refresh (`EIA_API_KEY`); Index recompute and dated CSV snapshots; NOAA normals; the Cold Snap check (NWS `api.weather.gov`, `NWS_USER_AGENT`, forecast-only copy, §7.6) | Bash, WebFetch, Edit | Daily 11:05 NWS check; propane Wed `33 16 * * 3` (Oct–Mar); within 48 h of EIA 5.6.B (≈ 24th monthly) | Prices ≤ 35 days old; Index published ≤ 48 h after a release | The human approves each Index headline before pitches go out. |
| **safety-desk** | Can I Run It? rules (24 tests, §2.8); Recall Watch (CPSC `saferproducts.gov/RestWebServices/Recall`); code watch (NEC adoption, IFGC/IRC, NFPA 58/54, UL) with `editionBySection` upkeep; the Safety Card and its `cobrand.ts` permission list | Read, Edit, Bash, WebFetch | Recalls daily `41 12 * * *`; code watch monthly `23 15 2 * *` | Relevant recall surfaced ≤ 24 h; 100% of safety pages licensed-reviewed ≤ 30 days after publishing | **A licensed reviewer approves every electrical or gas rule change. Safety corrections reach a human within 24 h.** Never adds a `?dept=` co-brand entry without the owner's written permission on file. |
| **lab-analyst** | Writes protocols; processes logger CSVs (Inkbird, Aranet, meters); computes UA, ACH and warm-up; charts model vs measured; drafts reports with raw CSV, addresses redacted | Read, Write, Bash (python) | On each test; draft ≤ 7 days after data | Report ≤ 7 days; raw CSV with every report | **A human runs every test**, under the field-tester agreement when contracted. The editor signs every report. "Measured" only with a log. Enforces the 5,000 ppm CO₂ ceiling and the 5-business-day maker reply window on adverse combustion data. |
| **commerce-desk** | `lib/commerce/products/*.ts`/`partners.ts`; weekly link audit (404, out of stock, variation drift); disclosure coverage on both static and client-rendered surfaces; monthly EPC re-rank; enabling the cart once ASINs are verified; Pro fulfillment tokens until the Polar webhook (v1.1) | Read, Edit, Bash, WebFetch | Links Mon `27 10 * * 1`; EPC the 1st `14 16 1 * *` | 0 broken links; 100% disclosure coverage; EPC per class | Never invents an ASIN. Never adds a price near a buy link. Accounts are owner-only. |
| **search-desk** | SEO review of every new page; GSC and Bing pulls; IndexNow; internal links and orphan crawl (≥ 3 inlinks); the 25-prompt AI panel; rank tracking for 25 terms, **with the 3 pure-transactional sealing pages tracked as a separate cohort**; uniqueness-gate audits for state pages | Read, Grep, Bash, WebFetch, WebSearch | Daily GSC `36 8 * * *`; crawl Tue `44 9 * * 2`; AI panel `19 14 5 * *` | Rankings; indexed %; citations | No `mcp__OpenSEO__*` without an owner-approved credit budget. |
| **distribution-desk** | PR lists, localized pitches (Index numbers by state), cold-snap reactive kits; Reddit, GarageJournal and FB **drafts** with the required BayHeat-disclosure sign-off line; pins and Shorts scripts and renders, all burned with `MODELED — NOT A PHOTOGRAPH` | Read, Write, WebSearch, Bash (ffmpeg) | PR waves per §7.2; drafts daily `03 15 * * 1-5` | Pitch reply rate ≥ 8%; links per wave | **Humans post and send everything, and a human writes or fully rewrites every community post** (§7.5). No undisclosed commercial accounts. No affiliate links in social posts or bios. |
| **email-desk** | Kit welcome sequence; Cold Snap (NWS-forecast-only copy), Index, Lab and BF/CM sends by tag; list hygiene; **blocks any send whose segment tags aren't a subset of the recipient's consent** (§2.4) | Read, Write, Bash (Kit API v4) | Cold Snap decision daily 11:10; Index on the first Tuesday `12 14 1-7 * 2` | §7.6 targets | The first send of each type is human-approved. Amazon links only to double-opt-in subscribers with `_MAIL`. |
| **design-qa** | Playwright screenshots at 390×844 and 1440×900 of the 14 key screens; axe; Lighthouse budgets; anti-slop review; the "stunning" rubric moved to the post-merge Gauntlet (§9.8, a feasibility finding — a subjective ≥8/10 rubric can't gate a merge deterministically) | Bash (Playwright at `/opt/node22/lib/node_modules/playwright`), Read | On every UI PR; weekly full pass `31 11 * * 4` | 0 serious axe issues; LCP < 2.5 s; rubric ≥ 8/10 at the Gauntlet, ≤ 2 fix passes per screen | Blocks a merge only on a budget regression, not on the subjective rubric. |
| **ops-analyst** | Weekly dashboard (sessions, completions, clicks, EPC, subscribers, referring domains, indexation, citations, Pro sales, spend vs gates); applies the §7.7 decision rules (including the new sessions-vs-forecast rule) and the §6.6 gates; replaces `[MODEL]` numbers | Bash, Read, Write | Mon `03 13 * * 1` | Dashboard on time; rules applied ≤ 48 h | The owner reads a one-page summary. Spend releases need owner approval, including the G1 liability/exposure sign-off. |

### 8.3 Recurring loops

**A. The weekly content sprint and fact-check gauntlet** (every Monday; Oct–Nov runs 5 pages a week).
1. **Mon: chief-of-staff** opens one issue per page, from the roadmap. The issue carries the brief: target cluster, H1 formula (≤ 60 chars on V pages), planner deep-link state, the required figure (rotated per page kind, §3.2), the instrument, products and the safety points.
2. **Mon–Tue: report-writer** drafts on a branch. It must pass locally: `npm run check`, evidence-lint (no new warnings, no `verify`-fact reference), check-affiliates, anti-slop. It opens a PR with a **claims table**: each number → formula or fact ID → source.
3. **Wed: fact-checker** (a separate session with no draft context) re-derives every claim:
   - planner numbers are recomputed with `node --test` fixtures and the Python reference;
   - every source URL is re-fetched and its quote matched;
   - every "why not" and verdict is attacked with 5 edge cases;
   - it searches for a contradicting authoritative source.

   Result: `PASS`, or a list of `FAIL` items with evidence. Two FAIL rounds escalate to the human editor.
4. **Wed: standards-editor** checks banned words, disclosure placement, evidence marks on decision numbers, competitor quotes, reading level (grade ≤ 9), FAQ provenance and the uniqueness gate.
5. **Thu: design-qa** screenshots at 390 and 1440, checks the 700 px rail rule on V pages, runs axe and Lighthouse. It gates any new figure against the thermal quality bar: line art registered to the field, °F scale bar, legible at 390 px, and never a blob at thumbnail size.
6. **Thu: human editor** applies the §5.2 review split: **100% of verdict-first (buy) pages and safety pages**, a 10% sample of everything else, 100% of Lab Reports. Electrical and gas pages add the licensed reviewer's sign-off within 30 days (the stamp appears only once they sign).
7. **Fri: merge and deploy** (Vercel), then search-desk runs IndexNow, requests GSC indexing for priority URLs and adds internal links from 3 existing pages.

**B. Affiliate link audit** (Mon 10:27).
- Crawl every outbound partner link: HTTP status, tag presence, `rel`, only verified ASINs on `/dp/`, disclosure above the first paid link (inside a `<PaidZone>` on client-rendered surfaces too), no dollar figure in a buy group, and no Amazon links in print, Pro or `/embed/planner`. Amazon checks use HEAD/GET with a normal UA and respect rate limits.
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
| Spend or gate decision (G1–G4); paid-search kill; G3 gate-miss follow-up | Weekly summary + issue | 48 h |
| Account, credential, tax, insurance or legal-entity question | OWNER-CHECKLIST issue | – |
| Community warning, journalist reply, brand or legal contact | Push | Same day |
| Two FAIL rounds from the fact-checker | Issue `needs-editor` | 48 h |
| Build red on `main` for more than 1 h | Push | Immediate |
| **Sessions < 60% of forecast for two consecutive months** | Weekly summary + issue | 48 h |

### 8.5 OWNER CHECKLIST (accounts and keys only a human can create)

**P0: before or at launch (Sep 28 – Oct 2), suggested order — repo private, Vercel Pro, postal address, Kit, Plausible, Amazon tracking IDs, then the rest of this list (a feasibility finding on sequencing).**
1. **Upgrade the Vercel project to Pro** (~$20/mo). Hobby forbids affiliate-first sites and payments.
2. **Make the GitHub repo private.** The audit flagged the public README and strategy docs; this also gates everything else on the checklist that depends on the repo not being publicly readable.
3. Set **`NEXT_PUBLIC_POSTAL_ADDRESS`** (PO box or virtual mailbox) and confirm the `hello@bayheatguide.com` mailbox works.
4. **Kit:**
   - account, double-opt-in form, tags `planner, alerts, brief, pro-waitlist, index, lab, zone-1…8`;
   - SPF, DKIM and DMARC;
   - set `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_TAG_IDS`.
5. **Analytics:** Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bayheatguide.com`, $9/mo) or GA4 (`NEXT_PUBLIC_GA4_ID`, with Google signals and ad personalisation off — §6.3).
6. **Amazon Associates.**
   - Confirm `laqaer-20` has passed the 3-sales/180-days review.
   - Add bayheatguide.com to the site list; complete the tax interview and payment.
   - **Create 4 tracking IDs** and set `NEXT_PUBLIC_AMAZON_TAG_PLANNER/_CART/_MAIL/_SAFETY`.
7. **Legal entity and coverage (new, a compliance finding):**
   - **(a)** Confirm in writing whether Laqaer Products is a registered LLC/corporation or a sole-proprietor trade name, and that the Amazon Associates, Polar and Kit accounts are opened in that entity's name.
   - **(b)** Get quotes for media/professional (E&O) and general liability coverage that includes publishing and product testing.
   - **(c)** Commission a flat-fee attorney review of `/terms`, `/privacy`, `SAFETY_SCOPE` and every verdict text **before Oct 2**. Can I Run It? stays `noindex` and Pro stays on "Notify me" until (a) and (c) are done.
8. **Verify the 4 Fix-First ASINs (weatherstrip, EPS door kit, R-30 insulation, attic hatch gasket) with SiteStripe** — pulled forward from P1 so the flagship "Shrinking Heater" moment monetizes as well as the rest of the site from day one (a revenue finding).
9. **Name the editor.** Set `NEXT_PUBLIC_EDITOR_NAME` and `NEXT_PUBLIC_EDITOR_URL`.
10. **GSC:** export 28-day by-page data before the redirects (advisory, not blocking — §3.4). Create a service account and set `GSC_SITE_URL` and `GSC_SERVICE_ACCOUNT_JSON_B64`. Verify Bing Webmaster Tools (import from GSC) and set `INDEXNOW_KEY`.
11. **Email affiliate@networx.com and affiliates@modernize.com with traffic stats** — moved up from week 10 (a revenue finding: this is the highest-EPC lever on the site and approval can run in parallel with the traffic ramp).
12. Generate `PRO_UNLOCK_SECRET` (32 random bytes) — ready for v1.1.

**P1: week 1–2 (by Oct 11).**

13. **SiteStripe-verify the remaining ~21 ASINs** and send them as a PR to `lib/commerce/products/*.ts` `VERIFIED_ASINS`:
    - bottom seals (8 ft and 16 ft, T-style and bulb) and a retainer kit;
    - a perimeter stop seal and a service-door weatherstrip kit;
    - door kits: Matador, Cellofoam, Owens Corning, Reach Barrier;
    - 2 UL 2034 CO alarms (plug-in with display, 10-year battery, plus a garage-rated low-level CO monitor);
    - an ABC extinguisher;
    - a line-voltage double-pole thermostat;
    - a garage-fridge heater kit;
    - a Wi-Fi freeze alarm;
    - Mr. Heater Buddy and Big Buddy (safe-alternative links only, never a plate with a buy button, §2.5);
    - Big Maxx MHU50; Hot Dawg HD45;
    - 2 diesel heaters and a through-wall exhaust kit.
14. **Polar:** create the organization and the Heat Report Pro product ("Launch price $14," no future price mentioned). Set `NEXT_PUBLIC_CHECKOUT_URL_PRO` and `POLAR_ACCESS_TOKEN`/`POLAR_WEBHOOK_SECRET`/`POLAR_ORGANIZATION_ID` — ready for the v1.1 Pro launch.
15. **Apply to affiliate networks:**
    - Awin ($5 deposit; VEVOR 28831, Hcalory) → `NEXT_PUBLIC_AWIN_AFFID`;
    - CJ (Northern Tool) → `NEXT_PUBLIC_CJ_PID`, `NEXT_PUBLIC_CJ_AID_NORTHERNTOOL`;
    - Impact (Home Depot, Walmart, Home Depot Services) → `NEXT_PUBLIC_*_LINK_BASE`;
    - HVACDirect, Got Ductless, Pioneer, Sylvane → `*_REF`.
16. **Hire a licensed electrician reviewer** ($75–150 per page; verify the license on the state board) and, by Nov 1, a gas/HVAC reviewer. Set `NEXT_PUBLIC_REVIEWERS`. **Set `PRO_REVIEWED` only once both have signed off on everything Pro references.**
17. **Buy the phase-1 lab kit (G1)** and keep the receipts (addresses redacted). Confirm liability coverage and the ≈$2,900 peak out-of-pocket exposure, in writing. Choose the test garage (detached, or a contracted Field Tester at ~$300/test, under a written agreement, §5.6).
18. **Social accounts:** YouTube, Pinterest Business, Instagram, TikTok, Facebook Page. Set `NEXT_PUBLIC_SOCIAL_*`, and add each to the Amazon site list.
19. **PR sources:** Qwoted, Featured, Source of Sources sign-ups.
20. **Weather and data:** `EIA_API_KEY` (free), `NWS_USER_AGENT="BayHeat/1.0 (hello@bayheatguide.com)"`, `CRON_SECRET`.
21. **Forms:** set `CENSUS_ENDPOINT` and `CORRECTIONS_ENDPOINT` (a Google Apps Script webhook is fine).

**P2: by Nov 30.**

22. **Paid search (G2):** Microsoft and Google Ads accounts, a $200 cap.
23. **Pinterest developer app:** `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_IDS`.
24. **Garage-door installer lead partner outreach**, ahead of `/insulated-garage-door-vs-kit` (v1.1, §3.5).

**Owner time:** about 8 h of setup in week 1 (including the legal/insurance pass), then 3–4 h a week (approvals, posting, pitches, test days).

---

## 9. BUILD PLAN for v1 (one session, ~11 AI engineers, 14 merges in strict order)

**A feasibility red team rewrote this section almost entirely.** The v1.0 plan described "11 parallel lanes" from a blank foundation, but: only data types were frozen, not function signatures, so every lane that called `plan()`, `encode`/`decode`, `verdictFor`, `route()` or similar was actually blocked behind the two engine engineers, making it one serial chain, not 11 parallel ones; several lanes owned files that depended on other lanes' output that hadn't landed yet; the frozen types didn't match the data the engine actually ports; and the build container (4 vCPU, 15 GB RAM) cannot run 11 concurrent `next build`s, worktrees have no `node_modules` and Turbopack refuses a `node_modules` symlink pointing outside the project root. The plan below (fixture stubs, a lean W0-lite, and 14 sequential merges with corrected ownership) fixes all of that while keeping the same 11 engineers and the same one-session timeline.

### 9.1 Ground rules for every builder

- **Read first:** `AGENTS.md`, the relevant guide in `node_modules/next/dist/docs/` (App Router), and `company/research/nextjs16-cheatsheet.md` §0 and §22.
- **This is Next 16.3.4 / React 19.2 / Tailwind v4:**
  - params, `searchParams`, `cookies()` and `headers()` are **Promises**;
  - use `PageProps<'/route'>` (global, no import);
  - **`useSearchParams` is not used anywhere in this codebase — it forces `BAILOUT_TO_CLIENT_SIDE_RENDERING` under `<Suspense>`.** URL state reads through `useSyncExternalStore` instead (§2.3);
  - GET route handlers need `export const dynamic = 'force-static'` to be `○`;
  - `typedRoutes: true`; `ViewTransition` is imported from `react`, and every state change that should trigger one is wrapped in `startTransition` (§4.8);
  - `next lint` is gone; run `eslint`;
  - React Compiler lint rules are **errors**: no `setState` in effects, and no `Math.random`, `Date.now`, `localStorage` or `window` in render. Use `useSyncExternalStore`. This is also why the live `ThermalField` canvas, spring counters and the scroll-timeline moments are deferred to v1.1 (§4.8) — they fight these rules directly and one session isn't enough time to get them right and gate-clean at once.
  - Do **not** enable `cacheComponents`. Do not add a `webpack` key.
- **Env:** every public var is read as a literal from `lib/env.public.ts`; every server var from `lib/env.server.ts`. `check-imports.mjs` fails if a `'use client'` file imports the server module (§6.3).
- **Tested modules** (`lib/planner`, `lib/safety`, `lib/commerce`, `lib/index`, `lib/redirects`): relative imports with the `.ts` suffix, `import type` for types, **no enums, no JSX, no `@/` alias**. Tests run with `node --test 'lib/**/*.test.ts'` (the glob is quoted).
- **Numbers:** every displayed unit-bearing number on a content page comes from `lib/planner`, `lib/facts` or `lib/format`. Pages never retype them. **A `verify`-status fact never renders on an indexable page** — wrap it in `<IfVerified>` (§4.5, §9.6).
- **Static by default.** The only `ƒ` entries allowed in the v1 build legend are `/r/[code]` and `/r/[code]/opengraph-image`. `/api/pro/verify` moves to v1.1 with the rest of Pro. The `subscribe` Server Action must not make a page dynamic.
- **Ownership is law.** You edit only the paths your merge owns (§9.3). Anything else is a request to the integrator.
- **Frozen interfaces:** exported names and signatures in the pre-flight fixtures and types are frozen after W0-lite merges. A change needs the integrator's approval and a one-line ADR in `company/decisions.md` (the integrator creates that file).
- **Worktrees never run `npm install`.** `scripts/wt.sh` hardlinks `node_modules` in (`cp -al`, not a symlink — Turbopack refuses a symlinked `node_modules` outside the project root) and runs `next typegen` once per worktree, since `next-env.d.ts` is gitignored and `tsc` fails in a fresh worktree until that runs.
- **Build concurrency is capped for the container.** `next build` runs only in the integrator, under `flock /tmp/bh-build.lock`. `next dev` is capped at 3 concurrent instances (ports 3101–3103, `flock -n`). A lane's own gate (`node --test`, `tsc --noEmit`, `eslint`, `anti-slop`) never runs a full `next build`.
- **This repo, and the blueprint itself, must actually be in git.** `company/BLUEPRINT.md` and `company/ref/{planner.py,examples.py,unanchored_freeze.py,recalls_heater.json}` are committed in the T−0 pre-flight below, and every `scratchpad/...` path this document references is rewritten to its committed location — a fresh cloud session in the post-launch agent team will never see anything left in `/tmp`. `model.py`/`revmodel.py` stay out of git until the owner makes the repo private (§8.5 P0 item 2); the repo is currently public.

### 9.2 T−0 pre-flight (integrator, ~20 min) and W0-lite (integrator + one engineer, ≤ 45 min)

**T−0 pre-flight**, before any lane starts:
- Commit `BLUEPRINT.md` and `company/ref/*`, and rewrite every `scratchpad/...` path in this document to its new committed location.
- Copy the 4 OG TTFs from `scratchpad/og-fonts/` into `assets/fonts/` (§4.7).
- Commit `zip3.data.ts` and `scripts/build-zip3.ts` (§2.1 — the USPS ZIP3→state prefix-range table plus the Census ZCTA centroid data, ~9 KB).
- Commit `lib/planner/golden/example-a.json`, generated from `scratchpad/ref/planner.py`, for the golden test (§9.5).
- Create the `v1/integration` branch and `scripts/wt.sh`.

**W0-lite** (a feasibility finding cut this down from a multi-hour job wrongly assigned to the two engine engineers, who are the critical path; it now runs with the integrator plus one design engineer, 45 minutes maximum, while the engine engineers start their own lane at T+10):
- `lib/planner/types.ts` is pushed first, at about 10 minutes (the reconciled types below, §9.4).
- `next.config.ts` with `typedRoutes`, the security headers (excluding `/embed`, which gets `frame-ancestors *` instead of `X-Frame-Options`) and an empty `REDIRECTS`.
- `tsconfig.json`: `allowImportingTsExtensions`, `erasableSyntaxOnly`, ES2022.
- `app/globals.css` tokens (§4.2, §4.3 — including the `wdth-*` utilities, not `w-*`) and fonts.
- The reconciled types (§9.4) plus `components/contracts.ts` (§9.4).
- **Fixture stubs** (a feasibility finding, CRITICAL): `lib/planner/fixtures.ts` exports `EXAMPLE_A_INPUT: GarageInput` and `EXAMPLE_A_RESULT: PlannerResult`, with the numbers from §0.2 (qSize 31,742; band 28,400–37,500; grade D; uaExtPerFt2 0.995; the FIG. 2 percentages; 60 A / 6 AWG; fixFirst 31,742 → 13,025, D → B) and `modelVersion: '0.0.0-stub'`. **Every function listed as a "SIGNATURE" in §9.4** — `plan`, `encode`/`decode`, `gradeFor`, `circuitFor`, `band`, `verdictFor`, `route`, `amazonCartUrl` — ships as a stub with its **final exported signature**, returning fixture data, carrying a `// STUB(W0)` marker. `components/result/GarageHeatReport.tsx`, `components/safety/VerdictStamp.tsx`, `components/brief/ElectricianBrief.tsx` and `lib/index/data.generated.ts` are stubbed the same way. `scripts/check-stubs.mjs` fails the `v1/integration` → `main` merge if any `STUB(W0)` marker or `-stub` model version remains. **This is what actually makes the later lanes parallel:** every lane can render and test against real signatures and plausible numbers from minute one, instead of waiting for the engine to land.
- `lib/env.public.ts` / `lib/env.server.ts` (§6.3), `lib/format.ts`, `lib/seo.ts`, `lib/jsonld.ts`, `lib/track.ts`, `lib/garage-store.ts`.
- The page registry (`lib/pages/types.ts`, `lib/pages/index.ts`, with empty typed per-lane files) and the facts registry (`lib/facts/index.ts`, with empty per-lane files, each exporting `FACTS` and `SOURCES`; a test asserts unique fact IDs and that every `sourceId` resolves — §9.5).
- `lib/commerce/ids.ts` (`PRODUCT_IDS`, frozen), so the commerce and content lanes share one ID list.
- A minimal working shell (`components/shell/*`, `components/ui/*`, `components/evidence/*`, `components/page/{ReportPage,NextStep,Breadcrumbs}.tsx`).
- The 9 legacy folders `git mv`d into `app/(site)/` **unchanged**, plus a `page.tsx` placeholder (a ReportPage with the H1 and "In build", `robots: {index:false}`) for every other v1 route in §3.3, so `typedRoutes` and nav links compile.
- **Accept when:** typegen, tsc, eslint, `node --test` (redirect test only, at this stage) and one `next build` are all green; the build legend shows only `○` placeholders; the header and footer render at 390 and 1440 with no horizontal scroll; fonts load with no CLS.

### 9.3 The 14 merges: strict file ownership, corrected dependency order

A second feasibility finding fixed the ownership problems directly: `HeatLossBars`/`WarmupCurve`/`GradeScale` move to the **Result** lane and `UsTileMap`/`FuelCostBars` move to the **Data** lane (both were consumed almost entirely by one lane each, but owned by a third); the duplicate `DieselExhaustDiagram`/`BottomSealProfiles` stubs are deleted, since each lives only in its real lane's `figures/fuel` or `figures/seal` folder; every lane's facts file exports `FACTS` and `SOURCES`, merged and tested for uniqueness by `lib/facts/index.ts`; products split into `lib/commerce/products/{core,seal,electric,fuel,safety}.ts` against the W0-lite-frozen `lib/commerce/ids.ts`; and the 5 verified-heater facts live only in `lib/facts/products.ts`. CI/QA scripts land **first** (merge 1), so every later merge is gated from the start, not bolted on at the end.

All app paths below are under `app/(site)/` unless marked `(bare)` or absolute `app/`. Each merge is rebased on the latest integration branch, passes `npm run check` (and `npm run qa` for UI merges), and is merged under `flock /tmp/bh-build.lock`.

| Merge | Engineer | Lane | Owns (exact paths) | Ships |
|---:|---|---|---|---|
| 1 | E9 | CI/QA infrastructure | `scripts/{check-affiliates,anti-slop,evidence-lint,check-links,check-imports,check-stubs,check-html,check-static,budget}.{ts,mjs}`, `scripts/smoke.mjs`, `scripts/wt.sh`, `.claude/skills/verify/**` | Every lint and build-output script in §9.6, the Playwright smoke test, the budget script, the verify skill (ported from `.cursor/skills/verify-bay-heat`, extended with Playwright click-through, redirects and OG checks). Runs against the W0-lite fixture stubs first, so it gates every later merge from minute one. E9 then starts drafting the fuel and hub pages (merge 13) while other lanes build. |
| 2 | E1 | Physics | `lib/planner/{constants,climate,stations,prices,geometry,heatLoss,warmup,seasonal,electrical}.ts` (`cooling.ts` and the T10 vector are deferred to March 2027 with the cooling engine, §3.5), `physics.test.ts`, `vectors.test.ts` | A port of `scratchpad/ref/planner.py` plus spec §3–§11 and Appendices B/C, using the reconciled `Station`/`PriceSet` types (§9.4). **T1–T9 and T11–T13 within ±1%**, plus the §0.2 table. `circuitFor` per §11.3 (3-arg, unchanged from v1.0 — already matched the spec). |
| 3 | E2 | Decisions | `lib/planner/{zip3,zip3.data,presets,defaults,catalog,recommend,roi,safety,grade,uncertainty,plan,codec,serial}.ts` + `decisions.test.ts`, `codec.test.ts` | ZIP3 → centroid → nearest station + state, using the committed T−0 `zip3.data.ts` and `build-zip3.ts`. Catalog §12 with `productIds`; `rankSystems` §14 (with the propane/diesel/unvented-portable hard filters from §2.5); `insulateFirst` §15; S1–S12 → `warnings`; BayGrade §2.5 (tests: D/C/B/F on §0.2); `uncertainty` §2.1, calling only `heatLossDesign()` at the 16 corners, never full `plan()`; `plan(input): PlannerResult`, called once per request; codec §2.3 — `CodecInput` subset, `decode()` fills the rest from `presets.ts`/`defaults.ts`, round-trip test over the codec domain only (200 seeds + example A, plus `encode(decode(s))===s` for 50 canonical strings); serial. Engine gate: T-vectors, §0.2 within ±1%, the golden JSON (committed at T−0), codec round-trip, `plan()` p95 under 4 ms (a timing test with a generous CI threshold of 20 ms). |
| 4 | E8 | Commerce, Amazon-only | `lib/commerce/{route,amazon,cart}.ts`, `lib/commerce/products/{core,seal,electric,fuel,safety}.ts` (against the frozen `ids.ts`), `lib/facts/products.ts` (the 5 verified-heater facts live only here), `commerce.test.ts`, `components/commerce/**` (SpecPlate, VerdictRail, `YourGarageChip` in place of MiniSizer, CompareTable, `PaidZone`/Disclosure, PaidLabel, Cost, FitBar, WhyNot, BuyButtons), `app/sitemap.ts`, `app/robots.ts` (`/r/` removed from `disallow`, §2.3), `app/llms.txt/route.ts` | Router §6.2 (tests: missing env → Amazon; tags per surface; `amazonCartUrl` rejects fewer than 2 or unverified ASINs); all the commerce UI primitives; sitemap/robots/llms.txt. |
| 5 | E3 | Design system and trust pages | `components/shell/*`, `components/brand/*` (Spot Mark with its derived geometry, §4.6), `components/ui/*`, `components/evidence/*` (native `<details>`/`popover`, `<IfVerified>`), `components/page/{ReportPage,NextStep,Breadcrumbs}.tsx`, `app/(site)/{about,privacy,terms,how-we-work}/page.tsx`, `app/not-found.tsx` | The full styled shell every other lane composes; `/about` (editor from env, Laqaer Products, no sibling brands, drops "the people who check it" until the env var is set); `/privacy` (rewritten per §6.3's compliance fix: a data → purpose → processor → retention table for Kit/Polar/Plausible/Vercel/Apps Script, affiliate cookies, Do Not Track and Global Privacy Control honored, children-under-13, effective date; a note is recorded in `company/decisions.md` that CCPA thresholds aren't met); `/terms` (new route, §2.7-style scope-of-service language, an as-is warranty disclaimer, liability capped at the greater of the amount paid or $50, Pro terms, a user-submission license, embed terms, governing law); `/how-we-work` (the 7 pledges, `#money`); the brand-voice 404 line (§5.1). |
| 6 | E6 | Figures and thermal | `lib/thermal/{ramp,field}.ts` + `ramp.test.ts` (the field module ships but is not wired to a live canvas in v1, §4.8), `components/thermal/**`, `components/figures/{Figure,ThermalExhibit,DisagreementStrip,GarageIso,GarageSection,ExplodedGarage,ClassSilhouette}.tsx` (`HeatLossBars`/`WarmupCurve`/`GradeScale` live in the Result lane; `UsTileMap`/`FuelCostBars` live in the Data lane — see the ownership fix above), `scripts/bake-posters.ts` (also writes `lib/og/posters.generated.ts`, §4.7), `public/thermal/*.png`, `lib/facts/rules-of-thumb.ts` | Static baked posters for 5 presets × {as-is, seal+kit, fixed, bare}; `ThermalExhibit` as a static HUD-overlaid poster; the figures listed above, each rotated per page kind by the pages that use them (§3.2). |
| 7 | E7 | Safety and Lab | `lib/safety/{rules,verdict,cobrand}.ts` + `verdict.test.ts` (24 cases, §2.8), `lib/safety/recalls.snapshot.ts`, `lib/facts/{safety,lab}.ts`, `lib/lab/{protocols,notebook}.ts`, `components/safety/**`, `app/(site)/can-i-run-it/{page,opengraph-image}.tsx`, `app/(site)/lab/page.tsx`, `app/(site)/lab/reports/bh-001-the-4x-problem/{page,opengraph-image}.tsx`, `app/(site)/lab/notebook/page.tsx`, `lib/pages/{safety,lab}.ts` | Can I Run It? with the `GO · PER MANUAL`/`ONLY IF`/`NO-GO` stamp, ≥2-condition rule, ZIP jurisdiction overlays, share, the Safety Card (with permission-gated `?dept=`); protocols P-002…P-005 with engine predictions; BH-001 (using E6's `DisagreementStrip` and the `rules-of-thumb` facts, no "fake"/"parasite" wording, right-of-reply process); the notebook with its first entry, "2026-10-02 · Model v1.0.0 released." |
| 8 | E1 (second lane) | Data | `scripts/build-index.ts`, `lib/index/{compute,data.generated}.ts` + `compute.test.ts`, `app/data/garage-heat-index.csv/route.ts`, `app/data/constants.csv/route.ts` (raw `h99`/`h996` columns dropped, §2.8b), `app/(site)/cost-to-heat-a-garage/{page,opengraph-image}.tsx`, `app/(site)/garage-heater-calculator/methodology/page.tsx`, `app/(site)/garage-heater-size/{page,opengraph-image}.tsx`, `components/data/**` (including `UsTileMap`, `FuelCostBars`), `lib/pages/data.ts` | The Index (§2.8b) computed from the engine; CSV routes (`force-static`, `text/csv`, CC BY 4.0 for computed columns only); `Dataset` JSON-LD; methodology (every constant pulled from `lib/planner` exports, the T1–T13 table, the grade formula `#grade`, the assumptions register); the size matrix. Needs only the Physics lane (merge 2), so it starts as soon as that lands. |
| 9 | E5 | Result | `components/result/**` (incl. `GarageHeatReport.tsx`, `HeatLossBars`, `WarmupCurve`, `GradeScale`, Fix-First), `components/brief/**`, `components/capture/**`, `app/actions/{subscribe,report}.ts`, `lib/kit.ts`, `lib/pages/product.ts` | The §2.2 sections 1–11: the Fix-First Shrinking Heater (`<ViewTransition>` wrapped in `startTransition`), the free Electrician Brief print (no Amazon; test), the Heat Report Pro "Notify me" waitlist card, `EmailCapture`/`AlertSignup`/`NotifyMe` plus the Kit Server Action and fallbacks, `CalibrateForm` → `CENSUS_ENDPOINT`/mailto. |
| 10 | E4 | Planner flow and share | `app/(site)/garage-heater-calculator/{page,opengraph-image}.tsx`, `components/planner/**`, `app/(site)/r/[code]/{page,opengraph-image}.tsx`, `app/(bare)/embed/planner/page.tsx` (stripped — no `BuyButtons`/`EmailCapture`/`NotifyMe`/Pro, §0.3), `lib/og/card.tsx`, `lib/pages/core.ts` | The 5 steps (§2.1, including the flammables tap and the breaker/outlet-picture branch); URL state via `useSyncExternalStore` (§2.3), never `useSearchParams`; the ZIP re-light; the v1 capture sequence (§4.8); the SSR default result (full example A, no `<Suspense>` bailout); the `/r` permalink and OG (with the `X-Robots-Tag: noindex` header rule and no `alternates.canonical`); the embed's `Get the full report on BayHeat ↗` CTA; the OG card template reading `lib/og/posters.generated.ts`. |
| 11 | E10 | Seal and insulate | `app/(site)/{garage-door-bottom-seal,garage-door-weather-stripping,garage-door-insulation-kit,how-to-insulate-a-garage}/{page,opengraph-image}.tsx`, `components/instruments/{DoorLeakMeter,KitPaybackMeter}.tsx`, `components/figures/seal/**` (`BottomSealProfiles` lives only here), `lib/facts/seal.ts`, `lib/pages/seal.ts` | 4 pages per §3.2/§3.3, 1,000–1,600 words each, with at least 1 figure, 1 instrument and engine numbers, `SAVINGS_VARY` under every payback claim. The Fix-First spine from the old seal-first table. The contrarian line "a kit alone ≈ 6% on a bare, leaky garage." |
| 12 | E11 | Electric | `app/(site)/{electric-garage-heater,240v-garage-heater,portable-garage-heater,garage-heater-installation-cost,best-wall-mount-garage-heaters}/{page,opengraph-image}.tsx` (ceiling-mount content lives as a section of `electric-garage-heater` in v1, a full page in v1.1, §3.4), `components/instruments/CircuitChecker.tsx`, `lib/facts/electric.ts`, `lib/pages/electric.ts` | 5 pages, carrying over the audit's facts and fixes (§3.4). Compare tables for CZ220 / FUH54 / DR-975 / CZ798 / HS-1500-TT with manual footnotes. The GFCI and 4 kW ≠ 20 A callouts. The plug-adapter and ungrounded-outlet NO-GO callouts (§2.8). The lead-CTA slot on `/240v-garage-heater` and `/garage-heater-installation-cost` (§6.1). |
| 13 | E9 (second lane) | Fuel and hubs | `app/(site)/{garage-heaters,diesel-heater-for-garage,propane-heater-for-garage,electric-vs-propane-garage-heater,infrared-garage-heater}/{page,opengraph-image}.tsx`, `components/instruments/FuelCostMeter.tsx`, `components/figures/fuel/{DieselExhaustDiagram,FuelTierLadder}.tsx` (the diagram lives only here, captioned "Illustrative. Your heater's installation manual governs."), `lib/facts/fuel.ts`, `lib/pages/fuel.ts` | 5 pages. The diesel $/h vs electric computed from `PRICES` (diesel $6.529/gal as of 2026-09-21 [R: EIA]), with the as-of date. Tank runtime ≈ 18 h on high (computed). The propane page rewritten to the manual's actual residential scope (§2.8): Buddy-type never a buy plate, only a Can I Run It? embed and safe-alternative links. |
| 14 | E6 (second lane) | Home | `lib/home/hero-states.ts`, `components/home/**`, `app/(site)/page.tsx`, `app/opengraph-image.tsx` | Home sections 02–07 (importing `RecallStrip`/`VerdictStamp` from E7, `UsTileMap` data from E1's Data lane); the reordered mobile hero (compact FIG.1 thumbnail above the ZIP field, one-line sub-copy, no "Read the math →" on the first screen, §4.9); the hero's pinned-plate morph. Hero module ≤ 6 KB gzipped; the LCP element is the H1. Merges last, since it composes almost every other lane's output. |

**Integrator:** owns all W0-lite files after the merge, `company/decisions.md`, the merge order above, the final `npm run check`, and the redirect-slip procedure (§3.4). After merge 14, the integrator runs `check-stubs` (failing if any `STUB(W0)` marker or `-stub` model version remains), then the full Definition of Done (§9.5), then merges `v1/integration` into `main`. The integrator adds each 308 and deletes each legacy folder in the same commit that merges that destination's lane, not before.

**Shared-file conflict rules:**
- **Page registry and facts:** one file per lane (above). `lib/pages/index.ts` and `lib/facts/index.ts` import every lane file statically and are written once at W0-lite; each lane's facts file exports `FACTS` and `SOURCES`, and a test asserts unique fact IDs and that every `sourceId` resolves.
- **OG:** each route owns its `opengraph-image.tsx` and calls `lib/og/card.tsx`, except the 20 routes that inherit `app/opengraph-image.tsx` (§4.7).
- **CSS:** lanes use Tailwind utilities and tokens only. Component-scoped needs use `*.module.css` next to the component. **`app/globals.css` is W0-lite/integrator only.**
- **Missing data:** if a lane needs data owned by another lane that hasn't landed, it imports the W0-lite stub and never forks the file; if it needs a new shared primitive, it builds it locally and the integrator promotes it after v1.

### 9.4 Frozen interfaces (W0-lite writes these verbatim; lanes code against them)

**Reconciled against the data the engine actually ports** (a feasibility finding: the v1.0 types didn't match Appendix B/C, `stationId` was documented as a WMO id but Appendix B keys stations by a string like `'IL-chicago'`, and `PriceSet` was missing fields Appendix C actually has while carrying fields it doesn't):

```ts
// lib/types/evidence.ts
export type Ev = 'M' | 'C' | 'S' | 'R' | 'E';
export type Source = { id: string; title: string; publisher: string; url: string; retrieved: string /* YYYY-MM-DD */; quote?: string };
export type Fact<T extends number | string = number> = {
  id: string;                 // 'cz220.watts.high'
  value: T; unit?: string;    // 5000, 'W'
  ev: Ev; sourceId: string;   // key into SOURCES
  checked: string;            // YYYY-MM-DD
  status: 'verified' | 'verify'; // 'verify' facts never render on an indexable page; <IfVerified> removes the block, dev shows [VERIFY:id]
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
export type YesNoUnknown = 'yes' | 'no' | 'unknown'; // new: unknown is always treated as 'yes' by safety rules (§2.5 S12, §2.8)

export type GarageInput = {
  v: 1;
  zip3?: string; state: string; stationId: string;          // USPS state; the Appendix B station 'id' (e.g. 'IL-chicago'), not a WMO id
  preset: Preset; width: number; depth: number; height: number; roofPitch: number;
  attached: boolean; commonWallLen: number;
  wallType: Unknown<WallType>; ceilingType: CeilingType | 'unknown'; ceilingIns: Unknown<CeilingIns>; roofType: RoofType;
  garageDoors: { w: number; h: number; type: Unknown<GarageDoorType> }[];
  windowsFt2: number; windowType: WindowType; serviceDoorFt2: number; serviceDoorType: EntryDoorType;
  slabEdge: SlabEdge; tightness: Unknown<Tightness>;
  flammablesStored: YesNoUnknown;                            // new (§2.1 step 4, §2.5 rule S12) — codec token `z`
  tHouse: number; targetTemp: number; useCase?: UseCase;
  usage: { mode: 'continuous' | 'sessions'; sessionsPerWeek: number; hoursPerSession: number; doorOpeningsPerSession: number };
  warmupGoalMin: 30 | 60 | 120;
  circuit: Unknown<Circuit>; breakerA?: 20 | 30 | 40 | 50; canAddCircuit: boolean; panelAmps: 100 | 150 | 200 | 'unknown';
  fuels: Fuel[]; ventingPossible: boolean; priority: Priority; wantsCooling: boolean;
  priceOverrides?: { elecPerKwh?: number; ngPerTherm?: number; propanePerGal?: number; dieselPerGal?: number };
  designTempOverride?: number;
};

export type Station = { id: string; city: string; st: string; lat: number; lon: number; elevFt: number;
  h99: number; h996: number; c1mcwb: number; hr1: number; wmo: string; primary: boolean;
  tMean: number[]; tSd: number[]; hdd50: number; hdd65: number; cdd65: number; zone: string }; // tMean/tSd are 12-entry monthly arrays
export type PriceSet = { state: string; elecPerKwh: number; ngPerTherm: number; propanePerGal: number; propaneCylPerGal: number;
  heatingOilPerGal: number; dieselPerGal: number; keroPerGal: number; propaneSrc: string;
  asOf: { elec: string; ng: string; propane: string; diesel: string }; sources: string[] };
  // propaneCylPerGal and keroPerGal come from lib/facts/fuels.ts with status:'verify' until sourced, and never render on an indexable page until then
export type Band = { low: number; mid: number; high: number; unknowns: number; narrowBy?: 'walls' | 'ceiling' | 'door' | 'tightness'; narrowToPct?: number };
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type LoadKey = 'walls' | 'garage_doors' | 'windows' | 'service_door' | 'ceiling_roof' | 'slab_edge' | 'infiltration' | 'house_coupling';
export type Wire = '14 AWG' | '12 AWG' | '10 AWG' | '8 AWG' | '6 AWG' | '4 AWG';
export type CircuitSpec = { watts: number; volts: 120 | 208 | 240; amps: number; minAmps: number; breakerA: 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80;
  wireNM: Wire; wireTHHN: Wire; gfciReceptacle: boolean; deratedWatts?: number; notes: string[] };
export type SafetyCode = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11' | 'S12'; // S12 is new: flammables-stored manual warning (§2.5)
export type Warning = { code: SafetyCode; severity: 'block' | 'warn' | 'info'; text: string; cite: string; edition?: string; ev: 'R' | 'S' | 'C' };
export type HeaterClassId = 'e_port_1500' | 'e_ir_wall_1500' | 'e_240_4k' | 'e_240_5k' | 'e_240_7k5' | 'e_240_10k' | 'e_ir_240'
  | 'hp_diy_12k_115' | 'hp_12_24k_230' | 'g_unvented_buddy' | 'g_vented_unit' | 'diesel_air' | 'k_unvented' | 'torpedo';
export type HeaterClass = { id: HeaterClassId; label: string; outputBtuh: [number, number]; energy: Fuel; eta: number | 'curve';
  circuit?: Circuit; vented: boolean; tier: 1 | 2 | 3; equip: [number, number]; install: [number, number]; safety: SafetyCode[]; productIds: string[];
  neverRecommend?: boolean; neverPlate?: boolean }; // neverPlate: g_unvented_buddy and torpedo — a WhyNot entry only, never a SpecPlate with a buy button (§2.5)
export type RankedSystem = { classId: HeaterClassId; units: 1 | 2 | 3; capacityBtuh: number; fitPct: number; tier: 1 | 2 | 3;
  circuit?: CircuitSpec; costPerHour: number; perSeason: number; tco5: number; upfront: [number, number];
  minutesToTarget: number | null; why: string; safetyLine: string; attachCoAlarmHouse: boolean; attachCoMonitorGarage: boolean; productIds: string[] };
  // safetyLine is now required, not optional (§2.2, §9.4); the house/garage CO split replaces the single `attachCoAlarm` flag (§2.2, a compliance fix)
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
// SIGNATURE (implemented in the named module, not in types.ts): function band(input: GarageInput): Band;                  // lib/planner/uncertainty.ts (calls heatLossDesign only, never full plan())
```

```ts
// lib/commerce/types.ts
import type { HeaterClassId } from '../planner/types.ts';
export type PartnerId = 'amazon' | 'homedepot' | 'walmart' | 'lowes' | 'northern_tool' | 'vevor' | 'hcalory' | 'hvacdirect' | 'gotductless' | 'pioneer' | 'della' | 'sylvane';
export type Surface = 'site' | 'planner' | 'cart' | 'mail' | 'safety';
export type ProductKind = HeaterClassId | 'seal_bottom' | 'seal_retainer' | 'seal_perimeter' | 'seal_service_door' | 'attic_hatch'
  | 'door_kit_eps' | 'door_kit_reflective' | 'co_alarm_house' | 'co_monitor_garage' | 'extinguisher' | 'thermostat_line_voltage'
  | 'fridge_heater_kit' | 'freeze_alarm' | 'diesel_exhaust_kit'; // co_alarm split into house/garage kinds (§2.2, a compliance fix)
export type PriceClassSource = 'msrp' | 'non_amazon_retailer'; // new, required (§6.1)
export type PriceClass = '$' | '$$' | '$$$' | '$$$$';                   // <$100 · $100–300 · $300–1,000 · >$1,000 (our range, not a live price)
export type Product = { id: string; name: string; kind: ProductKind; asin?: string /* must be in VERIFIED_ASINS */; searchQuery: string;
  partnerUrls: Partial<Record<Exclude<PartnerId, 'amazon'>, string>>; priceClass: PriceClass; priceClassSource: PriceClassSource; priceClassChecked: string;
  specFactIds: string[]; safetyLine?: { text: string; ev: 'S' | 'R'; sourceId: string };
  garageRated?: boolean /* [S], co_monitor_garage only — required before a garage-rated monitor is attached to any plate, §2.2 */ };
  // a commerce test fails the build if any HeaterClassId-kind Product has no safetyLine (§2.2, §9.4)
export type BuyLink = { partner: PartnerId; href: string; label: string; slot: 'primary' | 'secondary' | 'also'; surface: Surface };
// SIGNATURE (lib/commerce/products/core.ts): export const VERIFIED_ASINS: readonly ['B009F1SWH8', 'B00PX0T37I', 'B004VVJANC', 'B01M8KXXAB', 'B07JQPCFJ3'];
// SIGNATURE (implemented in the named module, not in types.ts): function route(p: Product, surface: Surface): BuyLink[];
// SIGNATURE (implemented in the named module, not in types.ts): function amazonCartUrl(asins: string[], surface: Surface): string | null; // null unless ≥2 verified
```

```ts
// lib/safety/types.ts
export type HeaterKind = 'e120' | 'e240' | 'buddy' | 'torpedo' | 'kerosene' | 'diesel' | 'vented_gas' | 'minisplit';
export type Situation = { attached: boolean; flammablesStored: 'yes' | 'no' | 'unknown'; livingAbove: boolean; unattended: boolean; freshAir: boolean;
  circuit?: '120V15A_shared' | '120V20A_dedicated' | 'extension_cord' | '240V20A' | '240V30A'; plugAdapterInUse?: boolean; outletGrounded?: boolean;
  heaterKw?: number; heaterBtuh?: number; ulListed: 'yes' | 'no' | 'unknown';
  cylinder?: '1lb' | '20lb'; cylinderStoredWhere?: 'outdoors' | 'garage' | 'house'; exhaustOutdoors?: boolean;
  coAlarmHouse: boolean; coMonitorGarageRated: boolean; preset: '1car' | '2car' | '3car';
  zip3?: string; state?: string; manualAllowsUnattendedThermostat?: boolean /* [S] */ };
export type Condition = { text: string; cite: string; edition?: string; ev: 'R' | 'S' | 'C'; severity: 'must' | 'should' };
export type Verdict = { verdict: 'GO' | 'GO_IF' | 'NO_GO'; stamp: 'GO · PER MANUAL' | 'ONLY IF' | 'NO-GO'; conditions: Condition[]; saferAlternatives: HeaterKind[]; reasons: string[] };
// SIGNATURE (implemented in the named module, not in types.ts): function verdictFor(h: HeaterKind, s: Situation): Verdict; // every result carries >= 2 conditions, enforced by a unit test
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
  primaryKeyword?: string; volume?: number; reviewed: 'electrical' | 'gas' | null; humanReview: 'full' | 'sample';
  indexable: boolean; published: string; updated: string; rev: number };
  // humanReview is new: 'full' for every verdict-first/safety page, 'sample' otherwise (§5.2, a compliance fix)
```

```ts
// components/contracts.ts (new — a feasibility finding: ~40 component "final signatures" were left for W0 to invent under time pressure; freezing the cross-lane ones here removes the guesswork)
export type SpecPlateProps = { system: import('../lib/planner/types.ts').RankedSystem; product: import('../lib/commerce/types.ts').Product;
  surface: import('../lib/commerce/types.ts').Surface; position: 1 | 2 | 3 };
export type VerdictRailProps = { systems: import('../lib/planner/types.ts').RankedSystem[]; surface: import('../lib/commerce/types.ts').Surface };
export type ThermalExhibitProps = { posterKey: string; hud: { out: number; in: number; dims: string }; caption: string; fig: number };
export type GarageIsoProps = { bays: 1 | 2 | 3 | 4; attached: boolean; ceilingFt: number; doorType: string };
export type FigureProps = { n: number; caption: string; source?: string };
export type ReportPageProps = { entry: import('../lib/pages/types.ts').PageEntry; sources: import('../lib/types/evidence.ts').Source[]; children: unknown };
export type EmailCaptureProps = { source: string; tags: string[]; kitEnabled: boolean };
export type InstrumentProps = { preset?: '1car' | '2car' | '3car'; state?: string };
export type YourGarageChipProps = { fallbackHref: string };
```

### 9.5 Definition of done (v1)

1. **`npm run check` is green:** typegen, tsc, eslint and `node --test`, including T1–T9 and T11–T13, §0.2, the grade tests, the codec round-trip (over the codec domain), the 24 verdicts (each with ≥2 conditions), redirect destinations, commerce routing (including the required-`safetyLine` test), the facts aggregator (unique IDs, resolvable `sourceId`s, no indexable page referencing a `verify` fact), `lib/pages/pages.test.ts` (every registry href has a `page.tsx`, and every `page.tsx` has a registry entry), and the Index compute against the golden JSON. Then `next build`.
2. **The build legend** shows `○`/`●` everywhere, except `ƒ` on `/r/[code]` and `/r/[code]/opengraph-image`.
3. **Every route in §3.3 is live.** All 9 old URLs return a **308** to a 200 page, added in the same commit as the destination lane's merge. The sitemap lists the 27 indexable routes only.
4. **Planner:**
   - 5 steps completable in ≤ 60 s at 390×844 with no horizontal scroll.
   - The result shows every §2.2 section, including the required safety line on every plate and the house/garage CO split.
   - Example A shows 31.7k → 13.0k BTU/h, D → B, and 60 A/6 AWG → 30 A/10 AWG.
   - The URL restores state after a reload, via `useSyncExternalStore`, with no `<Suspense>` bailout.
   - `/r/<code>` restores it and its link preview shows the card (fetch the OG image: 1200×630 PNG); `/r/` is reachable by crawlers (not in `robots.ts`'s `disallow`) while carrying `noindex` via `robots` metadata and the `X-Robots-Tag` header.
   - A printed Brief contains 0 `amazon.` links and no wiring diagram, only a thermostat spec.
5. **Can I Run It?** returns 24 stamped verdicts (`GO · PER MANUAL` / `ONLY IF` / `NO-GO`) with citations, each carrying ≥ 2 conditions and `SAFETY_SCOPE` directly beneath the stamp. **The Index** serves the tile map, table and CSV computed from the engine, with `h99`/`h996` dropped from `constants.csv`. **Lab:** P-002…P-005 carry engine predictions; the notebook entry is dated.
6. **Commerce:**
   - every Amazon href carries a tag;
   - only the 5 verified ASINs use `/dp/`;
   - every paid anchor has `rel="sponsored nofollow noopener"`;
   - the disclosure precedes the first paid link, inside a `<PaidZone>`, on both static and client-rendered surfaces;
   - no Amazon prices, stars or images, and no `$\d` figure shares a `[data-buy-group]` with a paid link, anywhere including client-rendered planner plates and `/r/[code]`;
   - a house CO alarm is attached to every combustion recommendation, and a garage-rated monitor only when verified;
   - Buddy-type propane and torpedo heaters never render as a `SpecPlate` with a buy button.
7. **Zero env vars means zero dead buttons.** Every fallback is visible and honest.
8. **Each page** has a unique title, description, canonical, og:url and og:image (verified in the built HTML by `check-html.mjs`), exactly one H1, valid JSON-LD, and `noindex` pages absent from `sitemap.xml`.
9. **The V-page 700 px rule** passes at 390×844 on all 12 V pages (Playwright measures `plate1.getBoundingClientRect().top ≤ 700`), with H1s ≤ 60 characters and answer blocks at 40–50 words enforced by a registry test.
10. **Budgets and screenshots:** the budgets in §9.8 are met via `budget.mjs`, and screenshots of the 14 key screens are captured into `.artifacts/` for the post-merge Gauntlet (the subjective "stunning" rubric no longer gates this merge, §9.8).
11. **`check-stubs.mjs` is clean:** no `STUB(W0)` marker and no `-stub` model version remains anywhere in the merged tree.

### 9.6 CI gates shipped in v1 (E9, merge 1)

| Script | Fails on |
|---|---|
| `scripts/check-affiliates.ts` (rendered HTML **and** client-rendered surfaces via Playwright, not just prerendered `.next/server/app/**/*.html`) | An Amazon link without a tag; `/dp/` for a non-verified ASIN; a missing `rel`; a paid page without `DISCLOSURE_INLINE` inside a `<PaidZone>` before the first paid anchor; a `$\d` literal sharing a `[data-buy-group]` with `a[href*="amazon."]`; an Amazon link inside `[data-print]`, `/heat-report-pro/print`, `/embed/planner` or the SafetyCard; `m.media-amazon.com` |
| `scripts/anti-slop.ts` (source) | The §4.10 grep list (with the scoping fixes there); banned words (§5.2) in `app/**` and `components/**` string literals, with `scripts/anti-slop.allow` exceptions; `rounded-2xl`; banned colors; `\bw-(62\|75\|100\|112\|125)\b` |
| `scripts/evidence-lint.ts` | **Warn:** unit-bearing numerals in JSX text outside `<Num>`/tables. **Fail:** the drift literals `20.9`, `20.8 A`, `10 AWG`, `8 AWG`, `6 AWG`, `1,440 W`, `17,060`, `12.5 A`, `25,590` outside `lib/` (scoped to `app/**/page.tsx` JSX text, with a `// drift-ok: <reason>` escape); **any indexable page referencing a `status: 'verify'` fact.** |
| `scripts/check-links.ts` | Internal links pointing at non-routes; pages with fewer than 3 inlinks (warn in v1) |
| `scripts/check-imports.mjs` | A `'use client'` file importing `lib/env.server.ts`; an instrument importing `plan.ts`/`climate.ts`/`zip3.data.ts`; any file outside `components/planner/**`/`components/result/**` importing `plan.ts`/`climate.ts`/`zip3.data.ts` |
| `scripts/check-stubs.mjs` | Any `STUB(W0)` marker or `-stub` model version remaining at the `v1/integration` → `main` merge |
| `scripts/check-html.mjs` | A non-unique title, description, canonical or og:url; more or fewer than one H1; JSON-LD that doesn't parse; a `noindex` page present in `sitemap.xml` |
| `scripts/check-static.mjs` | `prerender-manifest.json`/`routes-manifest.json` dynamic routes not exactly equal to `/r/[code]` and `/r/[code]/opengraph-image` |
| `scripts/budget.mjs` | See §9.8 — sums gzip size of non-`noModule` `<script src>` files against the `about.html` baseline |
| `scripts/smoke.mjs` (Playwright global) | Home, planner (5 steps at 390), the result's fix toggles, a `/r` round trip, a Can I Run It? verdict, the Index CSV (200, `text/csv`), 308 → 200 for all 9, the 700 px rule, OG tags in HTML, axe (0 serious), screenshots into `.artifacts/`; timing checks moved to a non-gating `npm run bench` |

### 9.7 Merge and integration protocol

- Each lane works in its own worktree and branch `v1/mNN-<slug>`, off the merged integration branch, hardlinked via `scripts/wt.sh` (§9.1).
- Commits end with the attribution lines required by the harness.
- **Before requesting a merge:** rebase on the latest integration branch, run `npm run check`, and run `npm run qa` for UI lanes.
- The integrator merges in the order in §9.3, one at a time, under `flock /tmp/bh-build.lock`.
- **Slips:**
  - a content page that isn't Gate-quality by the cut-off keeps its placeholder, set to `noindex`, and is removed from the sitemap;
  - a merge destination that slips → the redirect-slip procedure (§3.4): the redirect entry is skipped, the legacy folder stays live.

### 9.8 Quality bar: fast, accessible, zero build errors — "stunning" moves to the post-merge Gauntlet

A feasibility finding removed two things that couldn't actually be measured as specified: Next 16 removed the "First Load JS" build-output line, so a KB budget needs its own measurement script; and a subjective "≥8/10 stunning" score can't gate a merge deterministically. `scripts/budget.mjs` and `scripts/design-qa`'s screenshot pass replace both; the rubric itself moves to the post-merge **Gauntlet**, with at most 2 fix passes per screen (task #3 in the wider build plan).

**Performance budgets**, measured by `scripts/budget.mjs` against a **baseline** (`about.html`, since the current, nearly static site already ships 136.6 KB gz of module JS on `/`):

| Page | Budget |
|---|---|
| Home | ≤ baseline + 30 KB |
| Planner | ≤ baseline + 60 KB |
| V pages | ≤ baseline + 15 KB |
| Report-first pages | ≤ baseline + 8 KB |

`budget.mjs` sums the gzip size of the non-`noModule` `<script src>` files in `.next/server/app/{index,garage-heater-calculator,garage-door-bottom-seal,about}.html`.

**LCP and CLS:** Playwright, from `/opt/node22/lib/node_modules/playwright` (browsers in `/opt/pw-browsers`), against `next start`, throttled with CDP `Emulation.setCPUThrottlingRate{rate:4}` and `Network.emulateNetworkConditions{latency:150, downloadThroughput:200000}`, reading `PerformanceObserver` entries. One dev dependency added: `npm i -D -E axe-core`, injected with `page.addScriptTag`.

| Metric | Budget |
|---|---|
| LCP | < 2.0 s target, **< 2.5 s hard**, on home, planner and one V page. The LCP element is the H1. |
| CLS | < 0.05 |
| INP | < 200 ms (`heatLossDesign` corner calls < 1 ms each; `plan()` itself only runs once per request) |
| Thermal module | ≤ 6 KB gz (the v1 static-poster module; the v1.1 live canvas keeps this budget) |
| Fonts | ≤ 130 KB total; both Archivo and Martian Mono preloaded (§4.3) |
| Rasters above the fold | 0, except the ~10 KB poster |

**Accessibility:**
- axe: 0 serious or critical;
- every control is keyboard-operable with a visible focus ring;
- every chart has a text or table equivalent;
- the static poster has an `aria-label` summary ("Modeled thermal view: door perimeter coldest at 18 °F, ceiling warmest at 71 °F");
- `aria-live` announces final values only;
- colour is never the only encoding — the grade letter and word are always paired (§2.5);
- touch targets are at least 44 px.

**The post-merge Gauntlet "stunning" rubric** (non-gating for the v1 merge; run after DoD passes, ≤ 2 fix passes per screen):

| # | Criterion | The test |
|---|---|---|
| 1 | Distinctive | At 390 px, with the logo covered, it is still recognisably BayHeat: Spot Mark, thermal exhibit, mono readouts, Ember. |
| 2 | Hierarchy | One focal point per viewport. The number is the hero. |
| 3 | Typography | The width axis is visibly used (wide H1, condensed labels). Tabular numbers never jitter. Measure is 62–68ch. |
| 4 | Thermal quality bar | Line art registered to the field; labeled °F scale; spot meter; the door-seal leak legible at 390 px. Not a blob at thumbnail size. |
| 5 | Rhythm and grid | Exposed 12-column grid; left alignment; section rhythm 96/64, alternating `--surface-2` fill. |
| 6 | Motion | Every v1 motion moment (§4.8) encodes state; the reduced-motion final state is correct. |
| 7 | Honesty | Every number is traceable; the right chips on the right numbers; no fake trust. |
| 8 | Commerce | Plates read like nameplates; the safety line is on the plate; the disclosure is visible and not shouting; no dollar figure near a buy link. |
| 9 | Mobile | Thumb-reachable CTA; no horizontal scroll; the 700 px rule holds on V pages. |
| 10 | Zero slop | The §4.10 greps are clean, and a human reviewer finds no "template" smell (the FIG. rotation and conditional modules from §3.2 help here). |

**Zero build errors:** `npm run check` is green on `main` at every merge. No `@ts-ignore`, no `eslint-disable` without a linked ADR, no console errors on the 14 key screens.

---

## 10. Red-team decisions

Every CRITICAL and HIGH finding across all four red-team passes (compliance, feasibility, revenue, taste) is applied somewhere above. This section logs the handful of MEDIUM/LOW findings that were rejected, plus every place two findings pulled in different directions and how that was resolved — so a later reader isn't left guessing why a section reads the way it does.

### 10.1 Rejected findings

| # | Finding | Why rejected |
|---|---|---|
| **#T9** | Taste #9: rename the "Garage Climate Lab" descriptor to something more ownable (e.g. "Garage Climate Instrument"). | The descriptor string is cheap to change, but it appears in the wordmark, meta descriptions, `/about` and the brand voice throughout this document; changing it 6 days before launch is a brand-consistency decision for the owner, not a red-team unilateral edit, and the instrument metaphor is already carried by the Spot Mark, FIG. numbering and the HUD language without the descriptor itself needing to say it. Revisit in a v1.1 brand review with the owner. |
| **#T12** | Taste #12: replace the tagline "Every number shows its work" with a data-specific claim like "Sized to your garage, not the internet's average one." | The tagline is a positioning decision, referenced in the one-sentence positioning statement, meta descriptions and the hero. A red-team pass can catch that a phrase is generic; swapping core brand language is a call for the owner to make, not something to change unilaterally in the same pass that also rewrote "independent" and pledge 2. Flagged for the owner alongside #T9. |

### 10.2 Reconciliations (where two findings pulled in different directions)

- **Feasibility #24 (cut integrations with no account) vs. Revenue #2 (ship the installer-lead CTA and move outreach to week 1) — partially reconciled, not a flat accept/reject of either.** Feasibility #24 grouped the leads slot, `CalibrateForm`, `AlertSignup` and Cold Snap copy together as "dead code" alongside genuinely account-gated integrations (Awin, CJ, Impact, GA4, IndexNow, Pinterest). But the leads slot is a link-out button with no on-site form (§2.8, §6.1) and needs no account to exist in code, only to go live behind `LEADS_PROVIDER` — and Revenue #2 is a CRITICAL finding requiring it ship in v1. Cold Snap/`CalibrateForm`/`AlertSignup` also only depend on Kit (a P0, day-1 account) and NWS (no account at all), not a missing partner integration. **Resolution:** the leads slot, Cold Snap, `AlertSignup` and `CalibrateForm` all stay in v1, each already env-gated with an honest fallback per the dossier's own house rule; only the genuinely dead-until-signed integrations (Awin, CJ, Impact, GA4, IndexNow, Pinterest posting, direct-partner refs) stay as `enabled:false` data-table entries with no live code path, per Feasibility #24's core ask.
- **Taste #8 (promote "Nothing to do tonight" as a recurring brand line, including in alert email subject lines) vs. Compliance #14 (remove that exact phrase from Cold Snap alerts, since it was an uncalibrated garage-temperature all-clear claim).** Both are correct about different things: taste is right that the phrase is the one piece of real personality in the voice and shouldn't be rationed into nonexistence; compliance is right that using it as a safety-adjacent "nothing to worry about" claim from an uncalibrated model is a real risk. **Resolution (§5.1, §7.6):** the phrase (or an invented sibling) becomes a recurring brand-voice line in empty and idle states — the planner's "nothing left to narrow" state, the 404 page, the Lab test board's idle state — but it is permanently removed from Cold Snap alert copy, which now states only the NWS forecast and never predicts the garage's own temperature.
- **Revenue #3 (ship the cooling content cluster in January) vs. Feasibility #4/§9 (defer the planner's cooling engine — `cooling.ts`, `wantsCooling`, the T10 vector — to March 2027 to keep the one-session build scoped).** These aren't actually in conflict once split: the cooling content pages (`/garage-air-conditioner`, `/garage-dehumidifier`, `/garage-fan`, `/portable-ac-for-garage`) are standalone buying guides with their own simpler sizing math (square footage, EER, pints/day) and don't need the heating planner's integrated cooling mode to exist. **Resolution (§3.5):** the content cluster moves to early-to-mid January as Revenue #3 asked, shipped without the planner's cooling engine; the planner's own 5-year TCO-with-cooling-credit feature still ships in March 2027 as Feasibility #4 scoped it.
- **Revenue #1 (rebuild the traffic ramp) required recomputing the entire §6.5 revenue table.** Rather than reproduce the original model's exact internal formulas (which live in `scratchpad/blueprint/model.py`, not in this document), §6.5 restates the methodology, the assumptions and a recomputed monthly table at the level of precision a strategy document needs; the Ops Analyst still ports the authoritative version to `scripts/revenue-model.ts` in week 2 per the existing plan, at which point the exact monthly figures may shift slightly from the ones printed here without contradicting the direction or magnitude of this revision.
- **Revenue #5 (model verdict-first vs. report-first traffic separately) was applied at the methodology level in §6.5, not as a fully separate two-CTR recomputation of every month in the table.** The table above already reflects a mix-weighted blended rate; a literal two-line model (verdict-first sessions × its own CTR, report-first sessions × its own, summed) is noted as the Ops Analyst's job when the TS port happens, since it needs the actual §7.3 route-level traffic split to be meaningful, which doesn't exist before launch.

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

**v1.1 red-team sources** (the four passes summarized and applied in §10 and throughout this revision; each pass's own source list, checked 2026-09-25, is preserved in the task transcript that produced this revision and is not reproduced verbatim here to keep this appendix from duplicating a second full bibliography — the load-bearing facts and their citations are inlined at the point of use in §2.2, §2.5, §2.8, §5.2, §5.5 and §9 above). Highlights, for a reader who wants the primary sources directly:
- Amazon: Associates policies (effective 2026-04-14) and the Operating Agreement §5 disclosure sentence.
- CO alarm placement: First Alert and Kidde manuals (garage/temperature-range warnings).
- Mr. Heater MH18B manual (Enerco 78438CAL rev L1) and its "emergency indoor heating" residential-use wording.
- UL 1278 gasoline-storage marking, as printed in the Dura Heat EUH1500 manual.
- Massachusetts kerosene-heater ban (M.G.L. c.148 §25B); FDNY guidance against kerosene and propane space heaters in NYC.
- NEC 2026 key changes (NFPA), specifically Article 220 → Article 120.
- FTC R-value Rule, 16 CFR 460.3 and 460.19.
- IFGC 2021 chapter 3 (§305.3, §305.5) and §621.5.
- Turbopack symlinked `node_modules` issue (vercel/next.js#88335); the Next.js `useSearchParams`/`<Suspense>` bailout and environment-variables inlining docs (`node_modules/next/dist/docs/01-app/02-guides/{view-transitions,environment-variables}.md`), and `company/research/nextjs16-cheatsheet.md` (lines 318–365).
- X Cards and Twitter Cards documentation on `robots.txt`-blocked preview images.
