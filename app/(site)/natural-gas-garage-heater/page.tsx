import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { VerdictStamp } from "@/components/safety/VerdictStamp";
import { Callout } from "@/components/ui/Callout";
import { QuickPick } from "@/components/commerce/QuickPick";
import { Disclosure } from "@/components/commerce/Disclosure";
import { PaidLabel } from "@/components/commerce/PaidLabel";
import { BuyButton, ButtonLink } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getFact, getSource } from "@/lib/facts";
import { kw, usd } from "@/lib/format";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { PRESET_DEFAULTS } from "@/lib/planner/presets";
import { heatLossDesign } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { stationById } from "@/lib/planner/stations";
import { HEATER_CLASSES } from "@/lib/planner/catalog";
import { SIZING_MARGIN } from "@/lib/planner/constants";
import { PRICES, US_AVG_PRICES } from "@/lib/planner/prices";
import { costPerMMBtuDelivered, HEAT_CONTENT, ETA } from "@/lib/planner/fuels";
import { verdictFor } from "@/lib/safety/verdict";
import type { Situation } from "@/lib/safety/types";
import type { CeilingIns, GarageDoorType, GarageInput, Preset, PriceSet, Tightness, WallType } from "@/lib/planner/types";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/natural-gas-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["big-maxx-manual", "ifgc-2021", "irc-2021", "eia-ng-annual", "eia-electric-power-monthly"];

// A fact's number, or a loud build failure: every figure on this page traces to a registered fact or a planner call.
function factNumber(id: string): number {
  const f = getFact(id);
  if (!f || typeof f.value !== "number") throw new Error(`natural-gas-garage-heater: fact ${id} is missing or not a number`);
  return f.value;
}

// "50,000 BTU/h", for the one place a prop needs a string (the QuickPick headline) instead of a <Num>.
function factText(id: string): string {
  const f = getFact(id);
  if (!f) throw new Error(`natural-gas-garage-heater: fact ${id} is missing`);
  const v = typeof f.value === "number" ? f.value.toLocaleString("en-US") : f.value;
  return f.unit ? `${v} ${f.unit}` : String(v);
}

const asPercentUnit = (v: number | string) => `${v}%`;

// A computed heat rate with its kW pair ("31,900 BTU/h (9.3 kW)"), one chip on each.
const asKw = (v: number | string) => `${kw(Number(v))} kW`;

function BtuhKw({ btuh, src }: { btuh: number; src: string }) {
  return (
    <>
      <Num v={btuh} unit="BTU/h" round={100} ev="C" src={src} /> (
      <Num v={btuh / HEAT_CONTENT.btuPerKwh} ev="C" src={`${src} / HEAT_CONTENT.btuPerKwh`} format={asKw} />)
    </>
  );
}

// The same pair for a rating printed in the maker's manual.
function FactBtuhKw({ id }: { id: string }) {
  return (
    <>
      <Num f={id} /> (
      <Num v={factNumber(id) / HEAT_CONTENT.btuPerKwh} ev="C" src={`${id} / HEAT_CONTENT.btuPerKwh`} format={asKw} />)
    </>
  );
}

// The attached-garage question every verdict below asks: nothing flammable stored, a listed heater, house alarm in
// place -- so the only thing that varies between the calls is the heater class.
const ATTACHED: Situation = {
  attached: true,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  ulListed: "yes",
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
};

// The sizing-table scenarios, the same six detached Chicago garages as /garage-heater-size, so the two pages agree.
type TierName = "tight" | "leaky";
type Tier = { wallType: WallType; ceilingIns: CeilingIns; doorType: GarageDoorType; tightness: Tightness; label: string; describe: string };
const TIERS: Record<TierName, Tier> = {
  tight: { wallType: "R13", ceilingIns: "R30", doorType: "kit_eps_or_batt", tightness: "tight", label: "Tight", describe: "R-13 walls, an R-30 ceiling, an insulated door kit and tight construction" },
  leaky: { wallType: "uninsulated_finished", ceilingIns: "drywall_uninsulated", doorType: "steel_single", tightness: "leaky", label: "Leaky", describe: "uninsulated walls, a bare drywall ceiling, a plain steel door and leaky construction" },
};
const SIZE_ROWS: { key: Exclude<Preset, "custom" | "4car">; label: string }[] = [
  { key: "1car", label: "1-car" },
  { key: "2car", label: "2-car" },
  { key: "3car", label: "3-car" },
];
const SIZE_STATION = "IL-chicago";

function sizingInput(presetKey: (typeof SIZE_ROWS)[number]["key"], tier: TierName): GarageInput {
  const p = PRESET_DEFAULTS[presetKey];
  const t = TIERS[tier];
  return {
    v: 1,
    state: "IL",
    stationId: SIZE_STATION,
    preset: presetKey,
    width: p.width,
    depth: p.depth,
    height: p.height,
    roofPitch: 6,
    attached: false,
    commonWallLen: 0,
    wallType: t.wallType,
    ceilingType: "attic",
    ceilingIns: t.ceilingIns,
    roofType: "shingle_deck_uninsulated",
    garageDoors: p.garageDoors.map((d) => ({ w: d.w, h: d.h, type: t.doorType })),
    windowsFt2: p.windowsFt2,
    windowType: "single_metal",
    serviceDoorFt2: p.serviceDoorFt2,
    serviceDoorType: "hollow_wood",
    slabEdge: "none",
    tightness: t.tightness,
    flammablesStored: "unknown",
    tHouse: 68,
    targetTemp: 55,
    useCase: "shop",
    usage: { mode: "continuous", sessionsPerWeek: 0, hoursPerSession: 0, doorOpeningsPerSession: 0 },
    warmupGoalMin: 60,
    circuit: "unknown",
    canAddCircuit: true,
    panelAmps: 200,
    fuels: ["natural_gas"],
    ventingPossible: true,
    priority: "balanced",
    wantsCooling: false,
  };
}

function loadFor(presetKey: (typeof SIZE_ROWS)[number]["key"], tier: TierName): number {
  const input = sizingInput(presetKey, tier);
  const station = stationById(SIZE_STATION)!;
  return heatLossDesign(input, resolveEnvelope(input), designTempFor(input, station), station.elevFt).qSize;
}

// The three sizes in the Big Maxx manual, smallest first, read from the fact registry.
const LADDER = [
  { model: "MHU50", inId: "bigmaxx.mhu50.input_btuh", outId: "bigmaxx.mhu50.output_btuh" },
  { model: "MHU80", inId: "bigmaxx.mhu80.input_btuh", outId: "bigmaxx.mhu80.output_btuh" },
  { model: "MHU125", inId: "bigmaxx.mhu125.input_btuh", outId: "bigmaxx.mhu125.output_btuh" },
] as const;

// Cost to put the MHU50's rated output into the garage for one hour, on gas and on electric resistance, at one
// state's EIA prices. Same costPerMMBtuDelivered() the fuel hub and /electric-vs-propane-garage-heater use.
function hourlyCosts(prices: PriceSet, outputBtuh: number) {
  const gasPerMMBtu = costPerMMBtuDelivered(prices.ngPerTherm, HEAT_CONTENT.ngBtuPerTherm, ETA.ventedGas80);
  const elecPerMMBtu = costPerMMBtuDelivered(prices.elecPerKwh, HEAT_CONTENT.btuPerKwh, ETA.electricResistance);
  return { gas: (gasPerMMBtu * outputBtuh) / 1e6, electric: (elecPerMMBtu * outputBtuh) / 1e6 };
}

const COST_STATES: { code: string; name: string }[] = [
  { code: "IL", name: "Illinois" },
  { code: "MN", name: "Minnesota" },
  { code: "MI", name: "Michigan" },
  { code: "WI", name: "Wisconsin" },
  { code: "OH", name: "Ohio" },
  { code: "PA", name: "Pennsylvania" },
  { code: "NY", name: "New York" },
  { code: "MA", name: "Massachusetts" },
  { code: "CO", name: "Colorado" },
  { code: "WA", name: "Washington" },
  { code: "TX", name: "Texas" },
  { code: "CA", name: "California" },
];
// Names for the two states the all-state summary can call out; any other code falls back to the USPS letters.
const EXTRA_STATE_NAMES: Record<string, string> = { FL: "Florida", AK: "Alaska", HI: "Hawaii", AR: "Arkansas", GA: "Georgia", LA: "Louisiana" };

export default function Page() {
  const mhu50In = factNumber("bigmaxx.mhu50.input_btuh");
  const mhu50Out = factNumber("bigmaxx.mhu50.output_btuh");
  const mhu80Out = factNumber("bigmaxx.mhu80.output_btuh");

  // The manual's 80% (p.2) is what the page shows; the planner's ETA.ventedGas80 is what the math uses. They must agree.
  if (Math.abs(factNumber("bigmaxx.efficiency") / 100 - ETA.ventedGas80) > 1e-9) {
    throw new Error("natural-gas-garage-heater: bigmaxx.efficiency and ETA.ventedGas80 disagree");
  }

  // Ceiling stack-up (manual p.4, Table 1, p.3): bottom of the heater 8 ft up, the body, then 1 in of clearance above
  // it. The manual's text doesn't say which printed dimension is the height, so the smallest one (12 in) is used as a
  // floor and the result is rounded up to a whole foot, which also leaves room for the brackets.
  const bottomIn = factNumber("bigmaxx.min_height_ft") * 12;
  const bodyIn = factNumber("bigmaxx.body_dimension_in");
  const topClearIn = factNumber("bigmaxx.clearance_top_sides_in");
  const stackIn = bottomIn + bodyIn + topClearIn;
  const requiredCeilingFt = Math.ceil(stackIn / 12);

  const ventedVerdict = verdictFor("vented_gas", ATTACHED);
  const unventedPropane = verdictFor("buddy", { ...ATTACHED, cylinder: "1lb", cylinderStoredWhere: "outdoors" });

  const sizeRows = SIZE_ROWS.flatMap((row) =>
    (["tight", "leaky"] as const).map((tier) => {
      const load = loadFor(row.key, tier);
      const bigger = LADDER.find((l) => factNumber(l.outId) >= load);
      const ceilingFt = PRESET_DEFAULTS[row.key].height;
      return {
        row,
        tier,
        load,
        input: load / ETA.ventedGas80,
        fitsHeat: load <= mhu50Out,
        overshoot: mhu50Out / load,
        bigger,
        ceilingFt,
        ceilingOk: ceilingFt >= requiredCeilingFt,
      };
    }),
  );
  const passing = sizeRows.filter((r) => r.fitsHeat && r.ceilingOk);
  // The worked example in the answer box must itself pass both filters, or the page's own claim would be false.
  const example = sizeRows.find((r) => r.row.key === "3car" && r.tier === "tight")!;
  if (!(example.fitsHeat && example.ceilingOk)) throw new Error("natural-gas-garage-heater: the worked example no longer fits an MHU50");
  const lowCeilingPresets = SIZE_ROWS.filter((r) => PRESET_DEFAULTS[r.key].height < requiredCeilingFt);
  const leaky3 = sizeRows.find((r) => r.row.key === "3car" && r.tier === "leaky")!;
  const marginPushesPastMhu80 = leaky3.load > mhu80Out && leaky3.load / SIZING_MARGIN <= mhu80Out;

  // Cost per hour: the table states, then the all-state summary computed over every row of the price table.
  const tableRows = [
    ...COST_STATES.map((s) => ({ label: s.name, prices: PRICES[s.code] })),
    { label: "US average", prices: US_AVG_PRICES },
  ].map((r) => ({ ...r, ...hourlyCosts(r.prices, mhu50Out) }));
  const everyState = Object.entries(PRICES).map(([code, p]) => {
    const c = hourlyCosts(p, mhu50Out);
    return { code, ratio: c.electric / c.gas };
  });
  everyState.sort((a, b) => a.ratio - b.ratio);
  const gasCheaperCount = everyState.filter((s) => s.ratio > 1).length;
  const narrowest = everyState[0];
  const widest = everyState[everyState.length - 1];
  const stateName = (code: string) => COST_STATES.find((s) => s.code === code)?.name ?? EXTRA_STATE_NAMES[code] ?? code;
  const asOf = PRICES.IL.asOf;
  const install = HEATER_CLASSES.g_vented_unit.install;

  const bigMaxx = findProduct("gas-unit-heater-big-maxx-50")!;
  const buyLink = route(bigMaxx, "site", entry.href)[0];

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        Our insulated 3-car example in Chicago needs about{" "}
        <BtuhKw btuh={example.load} src="heatLossDesign().qSize, 3-car, tight, IL-chicago" /> of heat on its design day. A
        natural gas unit heater at <Num f="bigmaxx.efficiency" format={asPercentUnit} /> efficiency must burn about{" "}
        <Num v={example.input} unit="BTU/h" round={100} ev="C" src="heatLossDesign().qSize / ETA.ventedGas80, 3-car, tight" /> of
        gas to supply it. One <Num f="bigmaxx.mhu50.input_btuh" /> input unit covers that. Its bottom must hang at least{" "}
        <Num f="bigmaxx.min_height_ft" /> up, so the ceiling needs to be at least{" "}
        <Num v={requiredCeilingFt} unit="ft" ev="C" src="ceil((8 ft + body dimension + top clearance) / 12), bigmaxx facts" />.
      </AnswerBlock>

      <QuickPick
        productId="gas-unit-heater-big-maxx-50"
        page={entry.href}
        headline={`Vented gas unit heater: ${factText("bigmaxx.mhu50.input_btuh")} in, ${factText("bigmaxx.mhu50.output_btuh")} out. Bottom must hang at least ${factText("bigmaxx.min_height_ft")} up. BayHeat says hire a licensed gas fitter.`}
        compareHref="#not-to-buy"
        compareLabel="What to buy and what to skip"
      />

      <h2 id="which">Three kinds of heater share the name</h2>
      <p>
        Search for a natural gas garage heater and you find three different kinds of heater. In an attached garage, only
        the vented kinds belong. The difference is where the exhaust goes.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Where the exhaust goes</th>
              <th className="py-2 font-normal">Tool verdict or BayHeat rule</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Vented unit heater (Mr. Heater Big Maxx class)</td>
              <td className="py-2 pr-3">Outdoors, through a flue pipe</td>
              <td className="py-2">
                Tool verdict: <strong>{ventedVerdict.stamp}</strong>. BayHeat says hire a licensed gas fitter.
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Separated-combustion unit heater (Modine Hot Dawg HDS class)</td>
              <td className="py-2 pr-3">Outdoors, and it draws its air from outdoors too</td>
              <td className="py-2">
                Tool verdict: <strong>{ventedVerdict.stamp}</strong>, plus whatever its own manual adds
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Vent-free (unvented) wall heater</td>
              <td className="py-2 pr-3">Into the garage</td>
              <td className="py-2 italic text-(--color-fg-2)">
                BayHeat rule, not a tool verdict: don&apos;t buy one for an attached garage
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-(--color-fg-2)">{SAFETY_SCOPE}</p>

      <div className="not-prose my-6">
        <ButtonLink href="/can-i-run-it">Check my heater and garage →</ButtonLink>
      </div>

      <h2 id="sizing">Size it by BTU/h out, then check the ceiling</h2>
      <p>
        A gas heater has two ratings. Input is the gas it burns. Output is the heat that reaches the room. Output is
        input times efficiency.
      </p>
      <p>
        The Big Maxx manual lists <FactBtuhKw id="bigmaxx.mhu50.input_btuh" /> in and{" "}
        <FactBtuhKw id="bigmaxx.mhu50.output_btuh" /> out for its smallest size, the MHU50. That is{" "}
        <Num f="bigmaxx.efficiency" format={asPercentUnit} /> efficiency, and BayHeat&apos;s planner uses the same figure
        for every vented unit heater.
      </p>
      <p>
        Start from the heat your garage loses, not the number on the box. The planner finds that loss at your climate
        station&apos;s winter design temperature, a cold night but not the coldest on record. It adds a{" "}
        <Num
          v={SIZING_MARGIN}
          ev="C"
          src="SIZING_MARGIN — lib/planner/constants.ts"
          format={(v) => `${Math.round((Number(v) - 1) * 100)}%`}
        />{" "}
        margin, then divides by efficiency to get the gas input you need.
      </p>
      <h3>Heat is the first filter. Ceiling height is the second.</h3>
      <p>
        The manual puts the bottom of the heater at least <Num f="bigmaxx.min_height_ft" /> above a residential garage
        floor. Table 1 adds <Num f="bigmaxx.clearance_top_sides_in" /> of clearance above the top. The body, the brackets
        and the joist all have to fit between those two lines.
      </p>
      <p>
        The manual&apos;s drawing (page 3) gives the MHU50 a <Num f="bigmaxx.body_dimension_in" /> dimension. Its text
        doesn&apos;t say which dimension is the height. Even if <Num f="bigmaxx.body_dimension_in" /> were the height, the
        stack comes to{" "}
        <Num v={stackIn} unit="in" ev="C" src="bigmaxx.min_height_ft × 12 + bigmaxx.body_dimension_in + bigmaxx.clearance_top_sides_in" />.
        That is taller than the 2-car preset&apos;s{" "}
        <Num v={PRESET_DEFAULTS["2car"].height} unit="ft" ev="E" src="PRESET_DEFAULTS['2car'].height — lib/planner/presets.ts" /> ceiling (
        <Num v={PRESET_DEFAULTS["2car"].height * 12} unit="in" ev="C" src="PRESET_DEFAULTS['2car'].height × 12 — lib/planner/presets.ts" />
        ). So BayHeat asks for a ceiling of at least{" "}
        <Num v={requiredCeilingFt} unit="ft" ev="C" src="ceil(stack / 12), rounded up to leave room for brackets" /> for this
        unit. Your fitter checks the exact height on the drawing.
      </p>
      <p>
        That rules out the standard 2-car example garage used across BayHeat. Its ceiling is{" "}
        <Num v={EXAMPLE_A_INPUT.height} unit="ft" ev="E" src="EXAMPLE_A_INPUT.height — lib/planner/fixtures.ts" />.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Garage</th>
              <th className="py-2 pr-3 font-normal">Envelope</th>
              <th className="py-2 pr-3 text-right font-normal">Heat needed</th>
              <th className="py-2 pr-3 text-right font-normal">Gas input needed</th>
              <th className="py-2 font-normal">Does the MHU50 fit?</th>
            </tr>
          </thead>
          <tbody>
            {sizeRows.map((r) => (
              <tr key={`${r.row.key}-${r.tier}`} className="border-b border-(--color-line)/50 align-top">
                <td className="py-2 pr-3 text-(--color-fg)">
                  {r.row.label},{" "}
                  <Num v={r.ceilingFt} unit="ft" ev="E" src={`PRESET_DEFAULTS['${r.row.key}'].height — lib/planner/presets.ts`} /> ceiling
                </td>
                <td className="py-2 pr-3 text-(--color-fg-2)">{TIERS[r.tier].label}</td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <BtuhKw btuh={r.load} src={`heatLossDesign().qSize, ${r.row.label}, ${r.tier}, ${SIZE_STATION}`} />
                </td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Num v={r.input} unit="BTU/h" round={100} ev="C" src={`heatLossDesign().qSize / ETA.ventedGas80, ${r.row.label}, ${r.tier}`} />
                </td>
                <td className="py-2">
                  {r.fitsHeat && r.ceilingOk ? (
                    <>
                      Yes, with <Num v={r.overshoot} unit="times the load" round={0.1} ev="C" src="MHU50 output / heatLossDesign().qSize" />
                    </>
                  ) : r.fitsHeat ? (
                    <>Enough heat, but the ceiling rules it out</>
                  ) : !r.ceilingOk ? (
                    <>No. Too small for the load, and the ceiling is already too low for the MHU50</>
                  ) : r.bigger ? (
                    <>
                      No. Step up to the <Num f={r.bigger.inId} /> size ({r.bigger.model}), and check its height on the drawing
                    </>
                  ) : (
                    <>No. It needs more than one unit</>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">
        Tight means {TIERS.tight.describe}. Leaky means {TIERS.leaky.describe}. These garages are detached; an attached
        garage borrows some heat from the house and needs somewhat less. See{" "}
        <Link href="/garage-heater-size">the size chart</Link> for other climates.
      </p>
      <p>
        Read the last column from the top. Only{" "}
        <Num v={passing.length} ev="C" src="rows where the MHU50 covers the load and the ceiling clears the stack" /> of the{" "}
        <Num v={sizeRows.length} ev="C" src="sizing rows" /> garages {passing.length === 1 ? "passes" : "pass"} both filters, and
        the ceiling margin there is thin.
      </p>
      <p>
        A tight garage gets far more heat from the smallest unit than it needs. Look at a smaller heater or an electric
        one. A leaky garage should be insulated first, because that cuts the load (see{" "}
        <Link href="/how-to-insulate-a-garage">how to insulate a garage</Link>).
        {marginPushesPastMhu80 ? (
          <>
            {" "}
            The{" "}
            <Num v={SIZING_MARGIN} ev="C" src="SIZING_MARGIN — lib/planner/constants.ts" format={(v) => `${Math.round((Number(v) - 1) * 100)}%`} />{" "}
            margin is what pushes the leaky 3-car garage past the MHU80. Without it the load is{" "}
            <Num v={leaky3.load / SIZING_MARGIN} unit="BTU/h" round={100} ev="C" src="heatLossDesign().qSize / SIZING_MARGIN, 3-car, leaky" />, under
            the MHU80&apos;s <Num f="bigmaxx.mhu80.output_btuh" />.
          </>
        ) : null}
      </p>
      <p>
        The manual lists two bigger sizes. The MHU80 burns <FactBtuhKw id="bigmaxx.mhu80.input_btuh" /> and puts out{" "}
        <FactBtuhKw id="bigmaxx.mhu80.output_btuh" />. The MHU125 burns <FactBtuhKw id="bigmaxx.mhu125.input_btuh" /> and
        puts out <FactBtuhKw id="bigmaxx.mhu125.output_btuh" />. BayHeat has no verified listing for either, so this page
        links only the MHU50.
      </p>

      <h2 id="venting">Venting and clearances</h2>
      <p>
        A vented unit heater sends its exhaust outdoors through a pipe. The Big Maxx owner&apos;s manual (2019 edition)
        allows two routes, and both use a <Num f="bigmaxx.vent_diameter_in" /> vent connector. Do not mix vent parts from
        different makers.
      </p>
      <ul>
        <li>
          <strong>Up through the roof.</strong> The manual lists the unit as a Category I appliance on this route. Use a
          Type B-1 gas vent or single-wall metal pipe, with a listed cap. Single-wall pipe needs{" "}
          <Num f="bigmaxx.vent_single_wall_clearance_in" /> of clearance to anything that burns, unless a listed thimble is
          used. Insulate single-wall vent along its whole length if it runs longer than{" "}
          <Num f="bigmaxx.vent_single_wall_insulate_ft" />, elbows included, or through an unheated space. Use at least{" "}
          <Num f="bigmaxx.vent_insulation_in" /> of foil-faced fiberglass. Without it, flue gas condenses (manual page 6).
        </li>
        <li>
          <strong>Out a side wall.</strong> The unit is a Category III appliance on this route, and the pipe passes
          through a listed thimble. It slopes up toward the cap. For residential runs, section E.3 gives{" "}
          <Num f="bigmaxx.vent_horizontal_min_ft" /> minimum and <Num f="bigmaxx.vent_horizontal_max_ft" /> maximum, plus
          one 90-degree elbow. Section C and the notes under Figures 3 and 5 say{" "}
          <Num f="bigmaxx.vent_horizontal_min_general_ft" /> minimum, so a <Num f="bigmaxx.vent_horizontal_min_ft" /> run
          meets both. Table 2, which those notes point to, allows up to <Num f="bigmaxx.vent_table2_max_elbows" /> at
          shorter runs.
        </li>
      </ul>
      <p>
        A wall vent must end at least <Num f="bigmaxx.vent_term_opening_ft" /> from any door, window, gravity air inlet,
        gas or electric meter, or regulator. It must end at least <Num f="bigmaxx.vent_term_grade_in" /> above the ground and
        the deepest snow. It must stay <Num f="bigmaxx.vent_term_forced_air_ft" /> from any forced-air inlet, such as a
        dryer&apos;s fresh-air intake. Those are the U.S. figures in the manual (pages 6 and 7).
      </p>
      <p>
        The unit itself needs <Num f="bigmaxx.clearance_top_sides_in" /> of clearance to combustibles at the top and sides,
        and <Num f="bigmaxx.clearance_rear_in" /> at the rear. Keep <Num f="bigmaxx.clearance_access_in" /> free at the
        service panel (manual Table 1).
      </p>

      <h3>How high to hang it</h3>
      <p>
        The manual sets the height for a residential garage. The bottom of the heater goes at least{" "}
        <Num f="bigmaxx.min_height_ft" /> above the floor. The heater must also sit where a vehicle can&apos;t hit it, or be
        shielded.
      </p>
      <p>Code sets two lower floors, in short:</p>
      <ul>
        <li>
          Ignition source (IFGC 2021 §305.3; IRC 2021 §G2408.2): &quot;<Num f="code.ifgc.305_3" />.&quot;
        </li>
        <li>
          Whole appliance (IFGC 2021 §305.5; IRC 2021 §G2408.3): &quot;<Num f="code.ifgc.305_5.private_garage_height" />.&quot;
        </li>
      </ul>
      <p>The manual&apos;s number is stricter than both, so for this unit the manual wins.</p>

      <h3>Air and fumes</h3>
      <p>
        This unit burns room air. That air must be free of chlorine, solvents, glues, paint remover and similar fumes.
        Otherwise the heat exchanger wears out early (manual page 5). For combustion-air sizing, the manual points to the
        National Fuel Gas Code (ANSI Z223.1 / NFPA 54). Your fitter applies the edition your area has adopted.
      </p>
      <p>
        The manual also bans the unit anywhere gasoline, solvents, paint thinner, dust or unknown chemicals are, or may be,
        present (page 2). Move gasoline and solvents out of the garage, whatever heater you choose. A gas can and a mower in
        the corner is that place today.
      </p>

      <h2 id="gas-line">The gas line, the permit and the installer</h2>
      <p>
        This is not a plug-in heater. It needs a gas pipe, a vent and a hardwired <Num f="bigmaxx.mhu50.volts" /> feed. The
        manual says a qualified installer, service agency or the gas supplier must install and service it (page 1).
        BayHeat says hire a licensed gas fitter and get the permit your town requires. Some places let owners do gas work
        in their own home, but the manual&apos;s wording still stands.
      </p>
      <p>Here is what your gas fitter handles:</p>
      <ul>
        <li>
          Pipe size from the meter to the heater. The manual sizes natural gas piping for{" "}
          <Num f="bigmaxx.ng_line_pressure_inwc" /> of line pressure.
        </li>
        <li>
          Inlet pressure at the heater while it fires: between <Num f="bigmaxx.ng_inlet_min_inwc" /> and{" "}
          <Num f="bigmaxx.ng_inlet_max_inwc" /> (manual Table 6).
        </li>
        <li>
          A drip leg, plus a shutoff valve and a ground-joint union where local code asks for them. A plugged test tap goes
          just upstream of the unit.
        </li>
        <li>A soap-solution leak check of every joint. Never a flame.</li>
        <li>
          Altitude. The unit fires at full input up to <Num f="bigmaxx.full_input_altitude_ft" /> above sea level. Above
          that, some units need the manifold pressure adjusted.
        </li>
        <li>
          The power feed: <Num f="bigmaxx.mhu50.volts" />, <Num f="bigmaxx.mhu50.amps" />, with its own disconnect near the
          unit.
        </li>
      </ul>
      <p>
        Spark ignition and the combustion blower both run on that power. When the power is out, this heater is off.
      </p>
      <p>
        BayHeat&apos;s planning range for gas line, vent and labor is{" "}
        <Num
          v={`${usd(install[0])} to ${usd(install[1])}`}
          ev="E"
          src="HEATER_CLASSES.g_vented_unit.install — lib/planner/catalog.ts"
        />
        . It is an estimate, so get two local quotes. A detached garage may need a new buried gas line first. Ask the
        fitter to price that separately.
      </p>

      <h3>What the verdict tool says about a vented gas unit heater</h3>
      <p>
        Here is the <Link href="/can-i-run-it">Can I run it?</Link> answer for a vented gas unit heater in an attached
        garage. Every condition has to hold.
      </p>
      <VerdictStamp verdict={ventedVerdict} />
      <p>
        No gas line? A vented unit heater needs piped gas or a bulk propane tank. Small propane cylinders alone can&apos;t
        feed it. The <Link href="/propane-heater-for-garage">propane page</Link> covers that route.
      </p>

      <h2 id="thermostat">Garage heater with a thermostat</h2>
      <p>
        A gas unit heater takes a low-voltage wall thermostat. The manual lists <Num f="bigmaxx.thermostat_volts" /> terminals:
        R and W for an analog thermostat, plus C for a digital or Wi-Fi one. The manual suggests{" "}
        <Num f="bigmaxx.thermostat_wire_awg" /> wire. Never connect line power to the thermostat terminals.
      </p>
      <p>
        The spark makes radio noise. For a microprocessor thermostat, the manual suggests an isolation relay (page 9). Our
        example garage holds{" "}
        <Num v={EXAMPLE_A_INPUT.targetTemp} unit="°F" ev="E" src="EXAMPLE_A_INPUT.targetTemp — lib/planner/fixtures.ts" />;
        set yours to what you actually need.
      </p>

      <h2 id="vent-free">Why a vent-free gas heater is a no in an attached garage</h2>
      <p>
        A vent-free heater releases its exhaust into the room. An attached garage shares walls, a door and sometimes duct
        paths with the house, so carbon monoxide can follow the air indoors. Ventilating the garage does not change that.
      </p>
      <p>
        The verdict tool has no vent-free natural gas class. Its closest class, a portable unvented propane heater, gets
        this answer in an attached garage:
      </p>
      <VerdictStamp verdict={unventedPropane} />
      <Callout variant="note">
        <p>
          <strong>BayHeat&apos;s rule:</strong> the same answer applies to a vent-free natural gas heater in an attached garage.
          That is a BayHeat rule, not a result from the tool. A CO alarm warns you. It does not make an unvented heater
          safe.
        </p>
        <p className="mt-2 text-sm">{SAFETY_SCOPE}</p>
      </Callout>

      <h2 id="cost">Cost per hour against electric, at state prices</h2>
      <p>
        At full fire the MHU50 puts <FactBtuhKw id="bigmaxx.mhu50.output_btuh" /> into the garage. It burns{" "}
        <Num
          v={mhu50In / HEAT_CONTENT.ngBtuPerTherm}
          unit="therm"
          ev="C"
          src="bigmaxx.mhu50.input_btuh / HEAT_CONTENT.ngBtuPerTherm"
        />{" "}
        of gas an hour to do it. One therm is{" "}
        <Num f="fuel.natural_gas.btu_per_therm" format={(v) => `${Number(v).toLocaleString("en-US")} BTU`} />. Electric resistance heat needs the
        full <Num v={mhu50Out / HEAT_CONTENT.btuPerKwh} ev="C" src="bigmaxx.mhu50.output_btuh / HEAT_CONTENT.btuPerKwh" format={asKw} />{" "}
        of electricity for the same heat. Full fire is the most it can cost per hour. A thermostat cuts the burner off
        whenever the garage is warm enough.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">State</th>
              <th className="py-2 pr-3 text-right font-normal">Gas price</th>
              <th className="py-2 pr-3 text-right font-normal">Electric price</th>
              <th className="py-2 pr-3 text-right font-normal">Gas, per hour</th>
              <th className="py-2 text-right font-normal">Electric, per hour</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr key={r.label} className="border-b border-(--color-line)/50">
                <td className="py-2 pr-3 text-(--color-fg)">{r.label}</td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Cost amount={r.prices.ngPerTherm} per="therm" />
                </td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  {(r.prices.elecPerKwh * 100).toFixed(1)}¢/kWh
                </td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Cost amount={r.gas} per="hr" />
                </td>
                <td className="py-2 text-right font-mono whitespace-nowrap">
                  <Cost amount={r.electric} per="hr" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-(--color-fg-2)">
        Per hour at full fire, for the same delivered heat. Computed live from EIA residential prices (natural gas: {asOf.ng};
        electricity: {asOf.elec}). The gas figure leaves out the utility&apos;s fixed monthly charge.
      </p>
      <p>
        Gas costs less per hour than electric resistance heat in{" "}
        {gasCheaperCount === everyState.length ? "every one of" : `${gasCheaperCount} of`} the {everyState.length} rows of
        BayHeat&apos;s state price table. The closest call is {stateName(narrowest.code)}, where electric runs{" "}
        <Num v={narrowest.ratio} unit="times the gas cost" round={0.1} ev="C" src="electric $/MMBtu ÷ gas $/MMBtu, lowest of all state rows" />.
        The widest gap is {stateName(widest.code)}, at{" "}
        <Num v={widest.ratio} unit="times the gas cost" round={0.1} ev="C" src="electric $/MMBtu ÷ gas $/MMBtu, highest of all state rows" />.
        Your own rates decide it. A heat pump changes the electric side, so read{" "}
        <Link href="/heat-pump-mini-split-for-garage">the mini-split page</Link> too, and use the{" "}
        <Link href="/garage-heater-calculator">calculator</Link> for your state.
      </p>

      <h2 id="not-to-buy">Buy this, not that</h2>
      <h3>Buy: the vented unit heater, if your load and your ceiling both pass</h3>
      <Disclosure />
      <div data-buy-group className="not-prose my-6 border border-(--color-line) p-4">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">VENTED UNIT HEATER · NATURAL GAS</p>
        <p className="mt-1 text-lg font-bold text-(--color-fg)">{bigMaxx.name}</p>
        <p className="mt-2 text-sm text-(--color-fg-2)">
          The listing is the MHU50NG, the natural gas model. Converting it to propane takes the maker&apos;s kit, and the
          manual says a qualified service agency fits it. The unit needs a gas line, a vent and a{" "}
          <Num f="bigmaxx.mhu50.volts" /> feed, so budget for the fitter before the heater.
        </p>
        <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-(--color-fg-2)">Gas input</dt>
          <dd><FactBtuhKw id="bigmaxx.mhu50.input_btuh" /></dd>
          <dt className="text-(--color-fg-2)">Heat output</dt>
          <dd><FactBtuhKw id="bigmaxx.mhu50.output_btuh" /></dd>
          <dt className="text-(--color-fg-2)">Vent connector</dt>
          <dd><Num f="bigmaxx.vent_diameter_in" /></dd>
          <dt className="text-(--color-fg-2)">Bottom of unit above floor</dt>
          <dd>at least <Num f="bigmaxx.min_height_ft" /></dd>
        </dl>
        <p className="mt-3 text-xs text-(--color-alarm)">{bigMaxx.safetyLine?.text}</p>
        <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {bigMaxx.priceClass}</p>
        <div className="mt-3">
          <BuyButton href={buyLink.href}>{buyLink.label}</BuyButton>
          <PaidLabel />
        </div>
      </div>

      <h3>Dust in the shop</h3>
      <p>
        The Big Maxx burns room air. Its manual bans use where dust, solvents, paint thinner or gasoline vapor may be
        present. Move gasoline and solvents out of the garage, whatever heater you choose. For sawdust, a
        separated-combustion unit draws its combustion air from outdoors instead of from the shop. BayHeat&apos;s catalog
        lists the Modine Hot Dawg HDS in that class. We have no verified listing for it, so this page has no buy link for
        it. Its own manual governs the install, including where it may be used.
      </p>

      <h3>Don&apos;t buy</h3>
      <ul>
        <li>
          <strong>A vent-free gas heater for an attached garage.</strong> That is BayHeat&apos;s rule, as above. BayHeat lists
          none.
        </li>
        <li>
          <strong>A unit chosen by its name.</strong> Use the sizing table. The MHU50 is too small for a leaky 2-car garage
          and well oversized for a tight one.
        </li>
        <li>
          <strong>Any heater before you check the ceiling.</strong> The bottom of this unit has to sit at least{" "}
          <Num f="bigmaxx.min_height_ft" /> above the floor. In practice that means a ceiling of at least{" "}
          <Num v={requiredCeilingFt} unit="ft" ev="C" src="ceil(stack / 12), bigmaxx facts" />.{" "}
          {lowCeilingPresets.map((r, i) => (
            <span key={r.key}>
              {i > 0 ? " and the " : "The "}
              {r.label} preset (<Num v={PRESET_DEFAULTS[r.key].height} unit="ft" ev="E" src={`PRESET_DEFAULTS['${r.key}'].height — lib/planner/presets.ts`} />)
            </span>
          ))}{" "}
          fall short.
        </li>
        <li>
          <strong>The wrong fuel.</strong> Confirm the listing says natural gas. Swapping fuels takes the maker&apos;s kit and a
          qualified service agency (manual page 15).
        </li>
        <li>
          <strong>A torpedo heater.</strong> BayHeat excludes open-flame forced-air heaters from every enclosed garage.
        </li>
      </ul>

      <h2>Safety scope</h2>
      <SafetyCallout>
        <p>
          Put a UL 2034 CO alarm in the house outside each sleeping area. BayHeat also says to run a low-level CO monitor in
          the garage, rated for its temperature range, while this heater runs. Have the heater and its vent inspected once a
          year by a qualified service agency, as the manual says. {SAFETY_SCOPE}
        </p>
      </SafetyCallout>
      <p>Alarm rules depend on your place and on when the house was built. In short:</p>
      <ul>
        <li>
          IRC 2021 §R315.2.1: &quot;<Num f="code.irc.r315.new_construction" />.&quot;
        </li>
        <li>
          IRC 2021 §R315.2.2: &quot;<Num f="code.irc.r315.permitted_work" />.&quot; Adding a gas heater can count.
        </li>
      </ul>
      <p>Your local code edition governs.</p>

      <QuickPick
        productId="co-alarm-battery-10yr"
        page={entry.href}
        eyebrow="Safety add-on"
        headline="Put a UL 2034 CO alarm in the house, by the garage door and outside each sleeping area."
      />

      <h2>Next step</h2>
      <p>
        <Link href="/can-i-run-it">Check my heater and garage →</Link> for a verdict that fits your garage, or{" "}
        <Link href="/garage-heater-calculator">run the calculator</Link> with your own state&apos;s prices. To compare every fuel
        side by side, see <Link href="/garage-heaters">garage heaters by fuel</Link> and{" "}
        <Link href="/electric-vs-propane-garage-heater">electric vs propane vs gas</Link>.
      </p>
    </ReportPage>
  );
}
