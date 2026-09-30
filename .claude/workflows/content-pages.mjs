export const meta = {
  name: 'content-pages',
  description: 'Write real content for 24 stub pages across 8 parallel lanes, then a compliance verify pass',
  phases: [{ title: 'Write' }, { title: 'Verify' }],
}

const SHARED_BRIEF = `
You are writing production content for BayHeat, a real garage-heating information site (Next.js 16 App
Router, TypeScript, Tailwind v4). The physics/decisions engine (lib/planner/*) and the safety verdict engine
(lib/safety/verdict.ts) are already built, tested, and correct -- your job is CONTENT pages that read from
them, never a mock or a hardcoded guess standing in for them.

## Design system ("Inspection Grade") -- use these, don't invent new patterns
- Wrap every page body in the existing \`<ReportPage entry={entry} sources={sources}>...</ReportPage>\`
  (components/page/ReportPage.tsx) exactly as the current stub file already does -- keep the existing
  \`findPage\`/\`pageMetadata\` boilerplate at the top of the file, just replace the \`<InBuild owner="..." />\`
  body with real content. Do NOT add a data-surface="camera" wrapper on these pages -- they use the default
  light "report" surface.
- Prose classes already apply inside \`<ReportPage>\`'s \`prose-report\` wrapper -- use plain \`<h2>\`, \`<p>\`,
  \`<ul>\`, \`<table>\` etc. for body copy; Tailwind utility classes only where you need something the prose
  styles don't cover (e.g. \`not-prose\` wrapped figure/commerce components).
- \`<Num f="fact.id" />\` (components/evidence/Num.tsx) renders a cited number with its evidence chip --
  import \`getFact\`/\`getSource\` from \`@/lib/facts\` only if you need the raw value in a template string;
  normally just drop \`<Num f="..." />\` inline in prose. For a number you compute yourself (not from a fact
  id), use \`<Num v={123} unit="BTU/h" ev="C" src="heatLossDesign() at h99 design temp" />\`.
- \`<IfVerified ids={["fact.id"]}>...</IfVerified>\` (components/evidence/IfVerified.tsx) wraps a whole
  sentence that depends on a not-yet-confirmed fact -- it renders nothing at all in production rather than a
  gapped sentence. Use this for any claim resting on a fact you mark \`status: 'verify'\`.
- \`<Callout variant="safety">\` / \`variant="note"\` / \`variant="fix"\` (components/ui/Callout.tsx) for
  boxed asides. \`<SafetyCallout>\` (components/safety/SafetyCallout.tsx) for the site-wide safety-scope line.
- Money/verdict-first pages: \`<Disclosure />\` (components/commerce/Disclosure.tsx) once, directly above the
  FIRST paid link section. \`<BuyButton href={...}>\` (components/ui/ButtonLink.tsx) for outbound buy links --
  build the href via \`route(product, "site")\` from \`@/lib/commerce/route\` and \`findProduct(id)\` from
  \`@/lib/commerce/products\` (lib/commerce/ids.ts lists every valid product id; lib/planner/catalog.ts maps
  heater classes to their product ids). \`<Cost amount={n} per="hr" />\` (components/commerce/Cost.tsx) is the
  ONLY component allowed to print a "$" figure, and NEVER inside the same visual block as a buy button/link --
  price CLASS ($ / $$ / $$$ / $$$$) is fine next to a buy button, an actual dollar number is not.
- \`<FitBar pct={n} />\`, \`<HeatLossBars items={...} />\`, \`<WarmupCurve curve={...} minutesToTarget={...} />\`,
  \`<GradeScale current={grade} />\` (components/figures/*, components/commerce/FitBar.tsx) if a page benefits
  from showing a computed example -- feed them REAL output from calling lib/planner functions in the page
  component (a plain server component; you can call heatLossDesign(), circuitFor(), plan() on
  EXAMPLE_A_INPUT or a page-appropriate GarageInput synchronously at render time), never invented numbers.
- \`<WhyNot rows={...} />\` (components/commerce/WhyNot.tsx) for "why not X" lines on money pages.

## The physics/decisions engine you can call directly (all in lib/planner/*.ts, all pure functions)
- \`heatLossDesign(input, envelope, tOut, elevationFt)\` -- the core load calc. \`EXAMPLE_A_INPUT\`,
  \`EXAMPLE_A_STATION\` in lib/planner/fixtures.ts is the standard worked example (24x24 attached 2-car,
  Chicago) already used throughout the codebase and already validated against the spec -- reuse it for any
  "worked example" numbers on your pages rather than inventing a new scenario, unless your page is
  specifically about a different preset (use PRESET_DEFAULTS from lib/planner/presets.ts for 1/3/4-car).
- \`circuitFor(watts, voltsSupply, voltsRated)\` (lib/planner/electrical.ts) -- breaker/wire sizing.
- \`plan(input)\` (lib/planner/plan.ts) -- the full PlannerResult, if a page needs the whole picture.
- \`HEATER_CLASSES\`/\`heaterClass(id)\` (lib/planner/catalog.ts) -- the 14-class catalog with output ranges,
  equip/install cost RANGES (not exact prices), tier, safety codes.
- \`costsForSeasonalLoad\`, \`costPerMMBtuDelivered\`, \`HEAT_CONTENT\`, \`ETA\` (lib/planner/fuels.ts) for
  fuel cost comparisons.
- \`verdictFor(heaterKind, situation)\` (lib/safety/verdict.ts) for safety-adjacent claims -- never restate a
  verdict rule in prose without it tracing to this engine or lib/facts/codes.ts.

## Facts registry (lib/facts/*.ts, merged by lib/facts/index.ts)
Already populated and safe to cite freely: lib/facts/circuits.ts, codes.ts, fuels.ts, products.ts (the 5
verified-ASIN heaters' nameplate/manual facts), sources.ts. Still EMPTY lane stubs you may need to add to for
your own pages: lib/facts/electric.ts, fuel.ts, seal.ts, safety.ts, lab.ts, rules-of-thumb.ts (each already
has a \`FACTS: Fact[]\`/\`SOURCES: Record<string, Source>\` export -- add entries in the SAME file's array,
matching the \`Fact\`/\`Source\` shape in lib/types/evidence.ts; they're auto-merged into the registry, you
don't need to touch lib/facts/index.ts). Every fact needs a \`sourceId\` that resolves in some lane's SOURCES
export (add one if you're citing a new source) or in lib/facts/sources.ts.
CRITICAL: if you are not confident of a specific number (you don't have a primary source open in front of
you, e.g. a specific competitor product's wattage or a specific kit's exact R-value), mark that fact
\`status: 'verify'\` and wrap the sentence using it in \`<IfVerified ids={["that.fact.id"]}>\`. Do NOT mark
something 'verified' unless you would stand behind it as accurate. It is always safe to write qualitative
prose ("a typical EPS kit" / "in the R-6 to R-10 class") instead of a specific unverified number.

## Editorial rules (hard requirements, checked by a later compliance pass -- get them right the first time)
- Voice: lead with the number and its condition. Grade-8 reading level, sentences under ~22 words. Units
  always paired ("31,700 BTU/h (9.3 kW)"). BTU/h rounds to the nearest 100, kW to 0.1, dollars whole (or
  cents under $10). No dollar figure ever appears in an H1, a title, or beside a buy button.
- Every money page names at least one thing NOT to buy, and why (a WhyNot line or a plain sentence).
- Banned words/phrases -- do not use ANY of these anywhere: "tested", "hands-on", "we tried", "measured"
  (unless quoting an actual published log, which doesn't exist yet, so just don't use these four), "best-in-
  class", "game-changer", "ultimate", "top-rated", "#1", "look no further", "cozy", "in today's world",
  "elevate", "seamless", "unleash", "fake", "never tested", "parasite", "I spent X months", "boring".
  Don't put "(Month Year)" in a title unless this page changed that month (it isn't this month, so don't).
- Codes: cite the section AND its edition, e.g. "NEC 2023 §210.23(A)(1)", via \`<Num f="code.nec...">\` from
  lib/facts/codes.ts where the fact already exists, or add one. Always add: "Your electrician and your local
  code edition govern."
- Never invent a human byline. Don't add a Person schema or a named author anywhere.
- SAFETY_SCOPE (import from @/lib/site) renders under any safety-adjacent verdict or warning block.
- SAVINGS_VARY (import from @/lib/site) renders under any savings/payback/percentage-cut claim.
- If you reference a competitor by name, it must be a verbatim quote with a link and retrieval date, no
  adjectives, never "fake"/"never tested"/"parasite" -- if you're not confident of an exact competitor quote,
  don't name them at all; write about the general category of bad advice instead.

## Process
1. Read the current stub file at the given path first -- keep its imports/metadata boilerplate, replace only
   the InBuild body.
2. Read 1-2 sibling facts files you'll be touching (they're short) before adding to them.
3. Write real, useful, correctly-cited content matching the page's kind/layout and the brief given for it.
4. If you touched lib/facts/*.ts, run \`npx tsc --noEmit -p .\` and fix any type errors your additions caused.
5. Run \`npx eslint <every file you touched>\` and fix any errors/warnings.
6. Do NOT touch any file outside your assigned pages/facts files. Do NOT run git commands. Do NOT touch
   app/(site)/garage-heater-calculator, app/(site)/can-i-run-it, app/(site)/r/[code], or any component under
   components/capture or components/result -- those are already built and working.
`

const GROUPS = [
  {
    label: 'electric-a',
    pages: [
      { path: 'app/(site)/electric-garage-heater/page.tsx', href: '/electric-garage-heater', brief: 'Hub for every electric garage heater class, 1.5kW plug-in to 10kW ceiling. Primary CTA: link to /garage-heater-calculator and to /240v-garage-heater, /portable-garage-heater, /ceiling-mount-garage-heater, /best-wall-mount-garage-heaters as sub-pages. Table of classes with output/circuit/price-class, using lib/planner/catalog.ts HEATER_CLASSES for e_port_1500 through e_240_10k plus hp_diy_12k_115/hp_12_24k_230. Buy links via the 5 verified-ASIN products where they match a class (cz220-5kw-ceiling, fuh54-5kw, cz798-1500w-milkhouse, dr975-7k5-shop, hs1500tt-wall-infrared) plus the generic electric products for classes without a verified match.' },
      { path: 'app/(site)/240v-garage-heater/page.tsx', href: '/240v-garage-heater', brief: 'Money page: what a 240V garage heater actually needs -- breaker size, wire gauge, GFCI, why 4kW does not fit a 20A circuit (use circuitFor() live, and the T11-style test cases already validated in lib/planner/electrical.ts: 5000W->30A/10AWG, 4000W->25A not 20A, 7500W->40A/8AWG, 10000W->60A). Buy: cz220-5kw-ceiling, fuh54-5kw, dr975-7k5-shop, e-240-4k-generic, e-240-10k-generic. Why-not: undersized 120V for a real garage load.' },
      { path: 'app/(site)/portable-garage-heater/page.tsx', href: '/portable-garage-heater', brief: 'Money page, Circuit Checker angle (120V mode): a 1500W heater draws 12.5A -- above the 12A cord-and-plug limit on a shared 15A circuit (NEC 210.23(A)(1), already a fact circuit.1500w120v.amps / code.nec.210_23_a_1), fine as the sole load, and comfortable on a dedicated 20A circuit. Never an extension cord. Buy: cz798-1500w-milkhouse, hs1500tt-wall-infrared, e-port-1500-generic. Why-not: extension cords, running two heaters on one 15A circuit.' },
    ],
  },
  {
    label: 'electric-b',
    pages: [
      { path: 'app/(site)/ceiling-mount-garage-heater/page.tsx', href: '/ceiling-mount-garage-heater', brief: '5kW/7.5kW hardwired ceiling heaters: mounting height, throw, clearances from the actual manuals (cz220.clearance_wall_in, cz220.clearance_floor_ft, cz220.max_ceiling_ft, dr975.clearance_floor_ft/side_ft/back_in facts already exist in lib/facts/products.ts). Buy: cz220-5kw-ceiling, fuh54-5kw, dr975-7k5-shop. IRC M1307.3 "elements >= 18in above floor" citation (add a code fact if not already present).' },
      { path: 'app/(site)/best-wall-mount-garage-heaters/page.tsx', href: '/best-wall-mount-garage-heaters', brief: 'Wall-listed electric heaters 1.5kW to 7.5kW with manual clearances only (hs1500tt.mount_height_in_us, clearance_side_in, clearance_top_in facts exist). Never call anything "best" without a measured log -- title/H1 already avoid it, keep body copy the same way ("MODEL PICK - SPEC-BASED" framing per BLUEPRINT.md, not "best"). Buy: fuh54-5kw, dr975-7k5-shop, hs1500tt-wall-infrared.' },
      { path: 'app/(site)/infrared-garage-heater/page.tsx', href: '/infrared-garage-heater', brief: 'Infrared/radiant vs forced-air: which wins with the door open or in a drafty shop. Radiant heats people/surfaces directly -- planner-engineering.md models this as target-5F comfort-equivalent for radiant (mention as a modeled assumption, evidence mark E, not a measured claim). Buy: hs1500tt-wall-infrared, e-ir-240-generic, e-ir-wall-1500 class via catalog. Why-not: relying on radiant alone for a fully enclosed occupied space that needs even heat.' },
    ],
  },
  {
    label: 'fuel-a',
    pages: [
      { path: 'app/(site)/garage-heaters/page.tsx', href: '/garage-heaters', brief: 'The top-level fuel hub (Hub/V): every fuel option side by side, computed at the reader\\'s own state price via a Fuel Cost Meter -- show costsForSeasonalLoad() or costPerMMBtuDelivered() output for EXAMPLE_A_INPUT/EXAMPLE_A_STATION\\'s Illinois prices as the shown example, with a note that the planner personalizes it. Primary CTA: /garage-heater-calculator. Link out to every other heater/fuel page as the hub structure. Buy: a representative product per fuel class.' },
      { path: 'app/(site)/diesel-heater-for-garage/page.tsx', href: '/diesel-heater-for-garage', brief: 'Diesel vs electric cost per hour at current EIA prices (use lib/planner/prices.ts PRICES[\\'IL\\'] or US_AVG_PRICES + fuels.ts costPerMMBtuDelivered with ETA.dieselAir=0.78) -- state the crossover ¢/kWh where diesel stops winning, computed live, with an as-of date from the PriceSet. MUST say clearly: no UL/CSA listing for building heat (diesel_air class in catalog.ts), exhaust and intake outdoors only, never a permanent install in an attached garage (matches lib/safety/verdict.ts diesel rules exactly -- read that file\\'s dieselVerdict for the precise conditions and mirror them in prose, do not contradict the safety tool). Buy: diesel-heater-5kw, diesel-heater-8kw, diesel-exhaust-kit.' },
      { path: 'app/(site)/propane-heater-for-garage/page.tsx', href: '/propane-heater-for-garage', brief: 'Vented unit heaters (buyable, g_vented_unit class) vs portable Buddy-type radiant (g_unvented_buddy class) -- CRITICAL COMPLIANCE RULE: Buddy-type propane is NEVER shown with a buy button anywhere on this page, attached or detached garage. It appears only as a "why not a Buddy heater here" line pointing to /can-i-run-it. Only the vented unit heater (gas-unit-heater-big-maxx-50, gas-unit-heater-hot-dawg-45) gets real buy buttons. Read lib/safety/verdict.ts\\'s buddyVerdict for the exact manual-scope language (1-lb cylinders, never a 20-lb cylinder indoors, attended use only) and quote it faithfully. Primary CTA: "Check my heater" linking to /can-i-run-it.' },
    ],
  },
  {
    label: 'fuel-b',
    pages: [
      { path: 'app/(site)/electric-vs-propane-garage-heater/page.tsx', href: '/electric-vs-propane-garage-heater', brief: 'Guide/report-first: electric vs propane vs NG vs diesel, delivered cost per MMBtu, computed per state (use lib/planner/fuels.ts costPerMMBtuDelivered for a few example states\\' PRICES entries: IL, CA, TX, or US_AVG_PRICES). Fuel Cost Meter framing. No buy pressure -- this is report-first, informational, can still include a couple of relevant buy links but the page\\'s job is the comparison table, not conversion.' },
      { path: 'app/(site)/heat-pump-mini-split-for-garage/page.tsx', href: '/heat-pump-mini-split-for-garage', brief: 'Mini-split heat pump 5-year TCO vs a plain electric resistance heater -- does a $2,500-7,000 install (hp_12_24k_230 catalog equip+install range) beat a ~$170 heater over 5 years. Use heatPumpSeasonal()/heatPumpCop() from lib/planner/seasonal.ts for a real seasonal-COP example against EXAMPLE_A_STATION, and note it also cools (cooling engine ships later, don\\'t promise cooling numbers, just note the capability). Buy: minisplit-12k-230v.' },
      { path: 'app/(site)/garage-heater-size/page.tsx', href: '/garage-heater-size', brief: 'Matrix/guide: wattage brackets for 1/2/3/4-car by insulation tier and climate, explicitly labeled a planning BRACKET not a load calculation (push readers to /garage-heater-calculator for a real number). Compute real ranges by calling heatLossDesign() for each PRESET_DEFAULTS size at a tight envelope (R13/R30/kit_eps_or_batt/tight) and a leaky envelope (uninsulated_finished/drywall_uninsulated/steel_single/leaky) at a couple of representative stations (e.g. IL-chicago for a cold climate, GA-atlanta for mild) -- a real computed table, not invented numbers.' },
    ],
  },
  {
    label: 'seal',
    pages: [
      { path: 'app/(site)/garage-door-bottom-seal/page.tsx', href: '/garage-door-bottom-seal', brief: 'T-style/bulb/J/beaded bottom seals -- how to match the retainer track you have, computed weatherstrip BTU/h savings from lib/planner/roi.ts insulateFirst() for the "weatherstrip" measure on EXAMPLE_A_INPUT (dQDesign ~3,532 BTU/h, 12% of load, already validated in roi.test.ts -- reuse that exact scenario as your worked example). Buy: seal-bottom-t-8ft, seal-bottom-t-16ft, seal-bottom-bulb-16ft, seal-retainer-kit. SAVINGS_VARY under the percentage claim.' },
      { path: 'app/(site)/garage-door-weather-stripping/page.tsx', href: '/garage-door-weather-stripping', brief: 'The full weatherstrip package (bottom seal + perimeter stop + service door kit) -- same roi.ts "weatherstrip" measure and cost ($125, payback ~0.3yr electric per roi.test.ts) as the worked example, framed as "$125 cuts a 2-car garage\\'s heat loss by 12%". Buy: seal-perimeter-stop, seal-service-door-kit, seal-bottom-t-16ft, seal-retainer-kit. SAVINGS_VARY under the percentage claim.' },
      { path: 'app/(site)/garage-door-insulation-kit/page.tsx', href: '/garage-door-insulation-kit', brief: 'EPS vs reflective kits -- use roi.ts "door_kit_eps" (dQ 4,748 BTU/h, 16%, $120, payback 0.2yr) and "door_kit_reflective" (dQ 3,764, 13%, $80) measures, already validated in roi.test.ts, as the worked comparison. Explicitly state: a kit barely helps when the ceiling is still bare -- do the ceiling first (link to /how-to-insulate-a-garage). Buy: door-kit-eps-matador, door-kit-eps-cellofoam, door-kit-reflective-owens-corning, door-kit-reflective-reach-barrier. SAVINGS_VARY under the percentage claim, kit R-values only from a manufacturer fact sheet you mark verify if unconfirmed.' },
    ],
  },
  {
    label: 'guide',
    pages: [
      { path: 'app/(site)/how-to-insulate-a-garage/page.tsx', href: '/how-to-insulate-a-garage', brief: 'Guide/report-first, the ROI ordering. Reuse the already-validated roi.test.ts "all three cheap measures" bundle exactly (weatherstrip + door_kit_eps + ceiling_r30, $675 total, 31,742->13,025 BTU/h, grade D->B) by calling lib/planner/roi.ts insulateFirst()/bundleCheapMeasures() on EXAMPLE_A_INPUT live in the page, not by retyping those numbers. "$675 of fixes. Half the heater." headline (only place a rounded dollar total is allowed since no buy button sits directly beside it). Buy links per measure. SAVINGS_VARY under the framing.' },
      { path: 'app/(site)/garage-heater-calculator/methodology/page.tsx', href: '/garage-heater-calculator/methodology', brief: 'Reference page (citation magnet): explain every formula in lib/planner -- conduction (U*A*deltaT), infiltration (0.018*V*ACH*deltaT), the attic-as-series-resistance ceiling model, slab F-factor, warm-up simulation (thermal capacitance, 1-min Euler), the BayGrade formula (UA_ext/A_floor thresholds A<=0.38 through F>1.25, already in lib/planner/heatLoss.ts gradeFor()), NEC circuit sizing. Show the actual worked EXAMPLE_A_INPUT numbers (28,856 BTU/h design load breakdown) by calling heatLossDesign() live. No sales pressure at all -- this is the trust/citation page, "Try it on your garage" CTA to /garage-heater-calculator only.' },
      { path: 'app/(site)/cost-to-heat-a-garage/page.tsx', href: '/cost-to-heat-a-garage', brief: 'Data page, "The Garage Heat Index": season cost to hold a standard attached 2-car garage at 50F, computed per state. Call heatLossDesign() + lib/planner/seasonal.ts balancePoint()/seasonalLoadContinuous() for a STANDARD envelope (R13/drywall_uninsulated/steel_single/average) across primaryStationForState() for every state in lib/planner/prices.ts PRICES, building a real table (state, station city, season cost at that state\\'s own electric price). This can be a meaningfully-sized computation -- keep it a plain server component, compute the table in a module-level function, render as an HTML table (a link to /data/garage-heat-index.csv for the CSV, but you do not need to build that CSV route -- just check if it already exists and works; if it errors, leave a TODO comment, don\\'t try to fix a route outside your assigned pages). "Download CSV" / "Size my garage" CTAs.' },
    ],
  },
  {
    label: 'lab',
    pages: [
      { path: 'app/(site)/lab/page.tsx', href: '/lab', brief: 'Lab hub: pre-registered tests, each with its prediction published before measurement -- since NO physical test has actually run yet, this page must say so plainly (list planned protocols P-002..P-005 as "predicted, not yet measured" -- do not claim any test has been run). Link to /lab/reports/bh-001-the-4x-problem and /lab/notebook. The "Nothing running right now" dry line belongs here per BLUEPRINT.md as the idle-state line (use it once, not near safety copy).' },
      { path: 'app/(site)/lab/reports/bh-001-the-4x-problem/page.tsx', href: '/lab/reports/bh-001-the-4x-problem', brief: 'BH-001 "The 4x problem": the core finding is that different sizing rules of thumb disagree by up to 4x for the same garage. Do NOT fabricate specific competitor quotes/numbers you cannot verify -- lib/facts/rules-of-thumb.ts is currently EMPTY (a stub), so either add entries there with status:\\'verify\\' (safe, they simply will not render in production via IfVerified) or write the comparison in general terms ("published rules of thumb for a 2-car garage span a wide range") without inventing exact competitor figures. What you CAN state confidently and with full evidence: our own model\\'s computed range for 4 different real envelopes of the same 24x24 2-car garage (call heatLossDesign() for a bare/leaky envelope through a well-insulated/tight one) -- that range is real, computed, citable as evidence mark C. Frame the page around OUR computed spread being the trustworthy, shown-its-work answer, not around unverifiable claims about named competitors.' },
      { path: 'app/(site)/lab/notebook/page.tsx', href: '/lab/notebook', brief: 'Changelog: a dated log of model releases, price refreshes, corrections. Since this is the actual first release, the entry is simply: "2026-10-02 - Model v1.0.0 released" (matches BLUEPRINT.md\\'s own notebook first-entry text) plus a plain statement of the correction policy (72h general, 24h for a safety issue) -- do not invent past entries or a history that has not happened yet.' },
    ],
  },
  {
    label: 'trust',
    pages: [
      { path: 'app/(site)/how-we-work/page.tsx', href: '/how-we-work', brief: 'Standards page: the operating pledges (open model, cite everything, never fabricate, disclose money, correct fast, a licensed reviewer checks electrical/gas rules, no fake human personas), how the site makes money (Amazon Associate + partners, disclosed), and who checks each page technically (aiLine()-style: today it is "BayHeat editorial desk" and "not yet reviewed" for licensed review -- do not claim a named editor or a hired reviewer exists yet; import and use aiLine() from @/lib/site as the actual mechanism, do not hand-write a contradicting claim). Link to /privacy and /about.' },
      { path: 'app/(site)/about/page.tsx', href: '/about', brief: 'Company page: who publishes BayHeat (PUBLISHER="Laqaer Products" from @/lib/site), what the model is, how to reach them (CONTACT_EMAIL from @/lib/site). Per BLUEPRINT.md, the H1 drops "and the people who check it" until NEXT_PUBLIC_EDITOR_NAME is set (it is not set) -- so the H1/content must NOT claim named people exist; this is a real, mechanical conditional: import EDITOR_NAME from @/lib/env.public and branch on whether it is null. Never invent a founder or team bio.' },
      { path: 'app/(site)/privacy/page.tsx', href: '/privacy', brief: 'Privacy policy: what BayHeat actually collects today (localStorage for the planner\\'s saved-garage summary, wrapped in try/catch, no server-side account system exists yet; standard analytics if configured) and what it explicitly does not (no account creation, no garage data sent to a server beyond a single planner request). Plain, accurate, no legalese padding beyond what is true of THIS codebase today -- do not describe features (email lists, cookies, ad networks) that are not actually wired up; check lib/env.public.ts and lib/garage-store.ts for what is real.' },
    ],
  },
]

phase('Write')
const written = await pipeline(
  GROUPS,
  (group) => agent(
    `${SHARED_BRIEF}\n\nYour pages for this run (a group of ${group.pages.length}):\n\n` +
    group.pages.map((p, i) => `${i + 1}. File: ${p.path}\n   Route: ${p.href}\n   Brief: ${p.brief}`).join('\n\n') +
    `\n\nWrite all ${group.pages.length} pages now. Report back, for each page, in 1-2 sentences: what you wrote, any new facts you added (with their status), and whether tsc/eslint were clean.`,
    { label: `write:${group.label}`, phase: 'Write', effort: 'high' }
  ).then(summary => ({ group: group.label, pages: group.pages.map(p => p.path), summary }))
)

phase('Verify')
log('All groups written. Running a compliance/consistency pass over the finished pages.')

const VERIFY_BRIEF = `
You are the compliance/consistency checker for a batch of just-written BayHeat content pages. Read each file
listed below in full, then check EVERY item below and FIX any violation directly (you have edit access) --
do not just report it, fix it, unless fixing it requires information you do not have (e.g. a genuinely
missing fact), in which case wrap the claim in <IfVerified> or soften it to qualitative language instead.

Checklist per page:
1. Banned words/phrases (see list below) -- anywhere in the file, including comments visible in rendered
   text. Banned: "tested", "hands-on", "we tried", "measured" (unless quoting an actual M-marked fact),
   "best-in-class", "game-changer", "ultimate", "top-rated", "#1", "look no further", "cozy",
   "in today's world", "elevate", "seamless", "unleash", "fake", "never tested", "parasite", "boring",
   "I spent X months", a "(Month Year)" in the title/H1.
2. No dollar figure ($<number>) appears in the page's <h1>, in its exported metadata title, or in the same
   visual block/section as a <BuyButton> or an outbound buy <a> tag -- a price CLASS ($/$$/$$$/$$$$) is fine,
   an actual number is not, except the one "$675 of fixes" style headline explicitly permitted by the brief
   on /how-to-insulate-a-garage (nowhere else).
3. Every specific unit-bearing number (BTU/h, kW, A, AWG, $/unit, %, ft, in) traces to either a <Num f="..."/>
   referencing a real fact id in lib/facts/*.ts, a <Num v={...} ev="C" src="..."/> with a src note describing
   the lib/planner function that computed it, or plain prose with no specific number at all. A bare hardcoded
   number with no <Num> and no clear computed origin is a violation -- either wrap it properly or soften the
   sentence to remove the specific figure.
4. Money/verdict-first pages have a <Disclosure /> above their first buy link, and name at least one thing
   NOT to buy (a WhyNot or an explicit sentence).
5. Buddy-type propane (g_unvented_buddy class, any propane-buddy-*/propane-big-buddy-* product id) NEVER has
   a buy button anywhere in this batch -- if you find one, remove the buy button and replace it with a
   why-not line pointing to /can-i-run-it. This is a hard compliance rule, check it carefully on the fuel
   pages especially.
6. Torpedo heaters and kerosene (k_unvented) never have a buy button either.
7. No invented human byline, founder, or team member anywhere.
8. No specific claim that a physical test has been run, a measurement was taken, or a competitor was quoted,
   unless it's backed by a real fact in lib/facts with a real sourceId.

After fixing everything, run \`npx tsc --noEmit -p .\` and \`npx eslint <files you touched>\` and fix any
errors those introduce. Do not touch any file not listed above. Do not run git commands. Report back a short
summary: how many violations you found and fixed, by category, and confirm tsc/eslint are clean.
`

const verifyBatches = []
for (let i = 0; i < written.length; i += 3) verifyBatches.push(written.slice(i, i + 3).filter(Boolean))

const verifyResults = await parallel(verifyBatches.map((batch, i) => () =>
  agent(
    VERIFY_BRIEF + '\nFiles to check in this pass:\n' + batch.flatMap(w => w.pages).map(p => `- ${p}`).join('\n') + '\n',
    { label: `verify:${i}`, phase: 'Verify', effort: 'high' }
  )
))

return { written, verifyResults }
