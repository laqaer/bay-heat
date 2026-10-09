import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { QuickPick } from "@/components/commerce/QuickPick";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton, ButtonLink } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getFact, getSource } from "@/lib/facts";
import { kw, usd } from "@/lib/format";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { plan } from "@/lib/planner/plan";
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
import type { Situation, Condition } from "@/lib/safety/types";
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

const asPercent = (v: number | string) => `${Math.round(Number(v) * 100)}%`;

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

function ConditionList({ conditions }: { conditions: Condition[] }) {
  return (
    <ul className="my-2 space-y-1">
      {conditions.map((c, i) => (
        <li key={i}>
          {c.text} <span className="text-xs text-(--color-fg-2)">({c.cite}{c.edition ? `, ${c.edition}` : ""})</span>
        </li>
      ))}
    </ul>
  );
}

// The attached-garage question every verdict below asks: nothing flammable stored, house alarm in place, a
// permitted install -- so the only thing that varies between the calls is the heater class.
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
  const result = plan(EXAMPLE_A_INPUT);
  const qSize = result.heating.qSize;
  const gasInput = qSize / ETA.ventedGas80;

  const mhu50In = factNumber("bigmaxx.mhu50.input_btuh");
  const mhu50Out = factNumber("bigmaxx.mhu50.output_btuh");

  const ventedVerdict = verdictFor("vented_gas", ATTACHED);
  const noLineVerdict = verdictFor("vented_gas", { ...ATTACHED, cylinder: "1lb" });
  const unventedPropane = verdictFor("buddy", { ...ATTACHED, cylinder: "1lb", cylinderStoredWhere: "outdoors" });
  const unventedKerosene = verdictFor("kerosene", ATTACHED);
  const torpedoVerdict = verdictFor("torpedo", ATTACHED);
  const coCondition = ventedVerdict.conditions.find((c) => c.cite === "IRC R315")!;

  const sizeRows = SIZE_ROWS.flatMap((row) =>
    (["tight", "leaky"] as const).map((tier) => {
      const load = loadFor(row.key, tier);
      const bigger = LADDER.find((l) => factNumber(l.outId) >= load);
      return { row, tier, load, input: load / ETA.ventedGas80, fitsMhu50: load <= mhu50Out, overshoot: mhu50Out / load, bigger };
    }),
  );

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
        Our example 2-car garage in Chicago needs about{" "}
        <BtuhKw btuh={qSize} src="plan(EXAMPLE_A_INPUT).heating.qSize" /> of heat on its design day. A natural gas unit
        heater at <Num f="fuel.vented_unit.eta" format={asPercent} /> efficiency must burn about{" "}
        <Num v={gasInput} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).heating.qSize / ETA.ventedGas80" /> of
        gas to deliver it. One <Num f="bigmaxx.mhu50.input_btuh" /> input unit covers that, hung at least{" "}
        <Num f="bigmaxx.min_height_ft" /> up and vented outdoors by a licensed gas fitter.
      </AnswerBlock>

      <QuickPick
        productId="gas-unit-heater-big-maxx-50"
        page={entry.href}
        headline={`Vented unit heater for natural gas: ${factText("bigmaxx.mhu50.input_btuh")} in, ${factText("bigmaxx.mhu50.output_btuh")} out. A licensed gas fitter installs it, bottom at least ${factText("bigmaxx.min_height_ft")} up.`}
        compareHref="#not-to-buy"
        compareLabel="What to buy and what to skip"
      />

      <h2 id="which">Three kinds of heater share the name</h2>
      <p>
        Search for a natural gas garage heater and you find three different kinds of heater. Only the vented kinds belong
        in a garage. The difference is where the exhaust goes.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Where the exhaust goes</th>
              <th className="py-2 font-normal">Verdict in a garage</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Vented unit heater (Mr. Heater Big Maxx class)</td>
              <td className="py-2 pr-3">Outdoors, through a flue pipe</td>
              <td className="py-2">
                <strong>{ventedVerdict.stamp}</strong>: a licensed gas fitter installs it, hung high
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Separated-combustion unit heater (Modine Hot Dawg HDS class)</td>
              <td className="py-2 pr-3">Outdoors, and it draws its air from outdoors too</td>
              <td className="py-2">
                <strong>{ventedVerdict.stamp}</strong>: same install rules, built for a dusty or fume-heavy shop
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-2 pr-3 text-(--color-fg)">Vent-free (unvented) wall heater</td>
              <td className="py-2 pr-3">Into the garage</td>
              <td className="py-2">
                Don&apos;t buy. Every unvented class our verdict tool checks returns <strong>{unventedPropane.stamp}</strong> in an
                attached garage
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="not-prose my-6">
        <ButtonLink href="/can-i-run-it">Check my heater and garage →</ButtonLink>
      </div>

      <h2 id="sizing">Size it by BTU/h out, then buy by BTU/h in</h2>
      <p>
        A gas heater has two ratings. Input is the gas it burns. Output is the heat that reaches the room. Output is
        input times efficiency.
      </p>
      <p>
        The Big Maxx manual lists <FactBtuhKw id="bigmaxx.mhu50.input_btuh" /> in and{" "}
        <FactBtuhKw id="bigmaxx.mhu50.output_btuh" /> out for its smallest size, the MHU50. That is{" "}
        <Num f="fuel.vented_unit.eta" format={asPercent} /> efficiency, and BayHeat&apos;s planner uses the same figure
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
        margin, then divides by efficiency to get the gas input you need. This table runs that for six detached garages in
        Chicago.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Garage</th>
              <th className="py-2 pr-3 font-normal">Envelope</th>
              <th className="py-2 pr-3 text-right font-normal">Heat needed</th>
              <th className="py-2 pr-3 text-right font-normal">Gas input needed</th>
              <th className="py-2 font-normal">Does the MHU50 cover it?</th>
            </tr>
          </thead>
          <tbody>
            {sizeRows.map((r) => (
              <tr key={`${r.row.key}-${r.tier}`} className="border-b border-(--color-line)/50 align-top">
                <td className="py-2 pr-3 text-(--color-fg)">{r.row.label}</td>
                <td className="py-2 pr-3 text-(--color-fg-2)">{TIERS[r.tier].label}</td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <BtuhKw btuh={r.load} src={`heatLossDesign().qSize, ${r.row.label}, ${r.tier}, ${SIZE_STATION}`} />
                </td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Num v={r.input} unit="BTU/h" round={100} ev="C" src={`heatLossDesign().qSize / ETA.ventedGas80, ${r.row.label}, ${r.tier}`} />
                </td>
                <td className="py-2">
                  {r.fitsMhu50 ? (
                    <>
                      Yes, with <Num v={r.overshoot} unit="times the load" round={0.1} ev="C" src="MHU50 output / heatLossDesign().qSize" />
                    </>
                  ) : r.bigger ? (
                    <>
                      No. Step up to the <Num f={r.bigger.inId} /> size ({r.bigger.model})
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
        Read the last column from the top. A tight garage gets far more heat from the smallest unit than it needs.
        Insulate first, or look at an electric heater. A leaky 2-car garage already outruns the MHU50, and a leaky
        3-car garage needs the largest size in the manual.
      </p>
      <p>
        That manual lists two bigger sizes. The MHU80 burns <FactBtuhKw id="bigmaxx.mhu80.input_btuh" /> and puts out{" "}
        <FactBtuhKw id="bigmaxx.mhu80.output_btuh" />. The MHU125 burns <FactBtuhKw id="bigmaxx.mhu125.input_btuh" /> and
        puts out <FactBtuhKw id="bigmaxx.mhu125.output_btuh" />. BayHeat has no verified listing for either, so this page
        links only the MHU50.
      </p>

      <h2 id="venting">Venting and clearances</h2>
      <p>
        A vented unit heater sends its exhaust outdoors through a pipe. The Big Maxx owner&apos;s manual (2019 edition)
        allows two routes, and both use a <Num f="bigmaxx.vent_diameter_in" /> vent connector. Do not mix vent parts from different makers.
      </p>
      <ul>
        <li>
          <strong>Up through the roof.</strong> The manual lists the unit as a Category I appliance on this route. Use
          a Type B-1 gas vent or single-wall metal pipe, with a listed cap. Single-wall pipe needs{" "}
          <Num f="bigmaxx.vent_single_wall_clearance_in" /> of clearance to anything that burns, unless a listed thimble
          is used.
        </li>
        <li>
          <strong>Out a side wall.</strong> The unit is a Category III appliance on this route, and the pipe passes
          through a listed thimble. A residential run is <Num f="bigmaxx.vent_horizontal_min_ft" /> to{" "}
          <Num f="bigmaxx.vent_horizontal_max_ft" /> long, plus one 90-degree elbow, sloping up toward the cap.
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
        shielded. Code sets a lower floor. <Num f="code.ifgc.305_3" /> (IFGC 2021 §305.3; IRC 2021 §G2408.2). The verdict
        list further down shows the code minimums. The manual is stricter, so for this unit the manual wins.
      </p>
      <p>
        Check your ceiling before you order. The <Num f="bigmaxx.min_height_ft" /> is to the bottom of the heater. The
        body, the brackets and the joist all have to fit above that line. A low ceiling rules this class out.
      </p>

      <h3>Air and fumes</h3>
      <p>
        This unit burns room air. That air must be free of chlorine, solvents, glues, paint remover and similar fumes.
        Otherwise the heat exchanger wears out early (manual page 5). The manual sends you to section 5.3 of the National Fuel Gas
        Code (ANSI Z223.1) for combustion air. Your fitter applies the edition your area has adopted.
      </p>
      <p>
        The manual also bans the unit anywhere gasoline, solvents, paint thinner, dust or unknown chemicals are, or may be,
        present (page 2). A garage with a gas can and a mower is that place today. Move them to a shed first.
      </p>

      <h2 id="gas-line">The gas line and the licensed installer</h2>
      <p>
        This is not a plug-in heater. It needs a gas pipe, a vent and a hardwired <Num f="bigmaxx.mhu50.volts" /> feed. The
        manual says a qualified installer, service agency or the gas supplier must install and service it (page 1).
        BayHeat&apos;s catalog entry for this unit also calls for a permit. Treat the gas connection as a licensed-trade job.
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
        <Link href="/can-i-run-it">Can I run it?</Link> returns <strong>{ventedVerdict.stamp}</strong> for a vented gas unit
        heater in an attached garage. Every one of these has to hold:
      </p>
      <ConditionList conditions={ventedVerdict.conditions} />
      <p>
        No gas line? On small propane cylinders alone, the tool returns <strong>{noLineVerdict.stamp}</strong>. A vented unit
        heater needs piped gas or a bulk propane tank. The <Link href="/propane-heater-for-garage">propane page</Link> covers
        that route.
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
        <Num v={EXAMPLE_A_INPUT.targetTemp} unit="°F" ev="S" src="EXAMPLE_A_INPUT.targetTemp — lib/planner/fixtures.ts" />;
        set yours to what you actually need.
      </p>

      <h2 id="vent-free">Why a vent-free gas heater is a no in an attached garage</h2>
      <p>
        A vent-free heater releases its exhaust into the room. An attached garage shares walls, a door and sometimes duct
        paths with the house, so carbon monoxide can follow the air indoors. Ventilating the garage does not change that
        rule.
      </p>
      <SafetyCallout>
        <p className="font-medium text-(--color-fg)">
          Unvented portable propane heater, attached garage: {unventedPropane.stamp}
        </p>
        <p>{unventedPropane.reasons[0]}</p>
        <p className="mt-3 font-medium text-(--color-fg)">
          Unvented kerosene heater, attached garage: {unventedKerosene.stamp}
        </p>
        <p>{unventedKerosene.reasons[0]}</p>
      </SafetyCallout>
      <p>
        The tool has no menu entry for a vent-free natural gas heater, because BayHeat lists none. It treats the idea the
        same way. If the exhaust stays in an attached garage, the answer is no. A house with an attached garage also needs{" "}
        <Num f="code.irc.r315" format={() => "a CO alarm"} /> by code (IRC 2021 §R315). An alarm warns you. It does not make
        an unvented heater safe.
      </p>

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
        Per hour at full fire, for the same delivered heat. Computed live from EIA residential prices: natural gas as of{" "}
        {asOf.ng}, electricity as of {asOf.elec}. The gas figure leaves out the utility&apos;s fixed monthly charge.
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
      <h3>Buy: the vented unit heater, if the sizing table says it fits</h3>
      <Disclosure />
      <div className="not-prose my-6 border border-(--color-line) p-4">
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
        </div>
      </div>

      <h3>A dusty or fume-heavy shop</h3>
      <p>
        The Big Maxx burns room air, and its manual bans use where dust, solvent or paint-thinner vapor may be present. If
        you can&apos;t clear that air, ask a heating supplier about a separated-combustion unit. It draws its combustion air
        from outdoors. BayHeat&apos;s catalog lists the Modine Hot Dawg HDS in that class. We have no verified listing for it, so
        this page has no buy link for it. Its own manual governs the install.
      </p>

      <h3>Don&apos;t buy</h3>
      <ul>
        <li>
          <strong>A vent-free gas heater for an attached garage.</strong> The answer is {unventedPropane.stamp}, as above.
          BayHeat lists none.
        </li>
        <li>
          <strong>A unit chosen by its name.</strong> Use the sizing table. The MHU50 is too small for a leaky 2-car garage
          and well oversized for a tight one.
        </li>
        <li>
          <strong>Any heater before you check the ceiling.</strong> The bottom of this unit has to sit at least{" "}
          <Num f="bigmaxx.min_height_ft" /> above the floor.
        </li>
        <li>
          <strong>The wrong fuel.</strong> Confirm the listing says natural gas. Swapping fuels takes the maker&apos;s kit and a
          qualified service agency (manual page 15).
        </li>
        <li>
          <strong>A torpedo heater.</strong> {torpedoVerdict.reasons[0]}
        </li>
      </ul>

      <h2>Safety scope</h2>
      <SafetyCallout>
        <p>
          {coCondition.text} Have the heater and its vent inspected once a year by a qualified service agency, as the
          manual says. {SAFETY_SCOPE}
        </p>
      </SafetyCallout>

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
