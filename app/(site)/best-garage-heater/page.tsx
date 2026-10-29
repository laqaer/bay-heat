import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { VerdictStamp } from "@/components/safety/VerdictStamp";
import { QuickPick } from "@/components/commerce/QuickPick";
import { FitBar } from "@/components/commerce/FitBar";
import { WhyNot } from "@/components/commerce/WhyNot";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getFact, getSource } from "@/lib/facts";
import { findProduct, primaryProduct, productForRecommendation, productWarning } from "@/lib/commerce/products";
import { plan } from "@/lib/planner/plan";
import { heaterClass } from "@/lib/planner/catalog";
import { circuitFor } from "@/lib/planner/electrical";
import { defaultGarageInput } from "@/lib/planner/wizard-defaults";
import { PRESET_DEFAULTS } from "@/lib/planner/presets";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { heatPumpCapacity } from "@/lib/planner/seasonal";
import { HEAT_CONTENT } from "@/lib/planner/fuels";
import type { CircuitSpec, GarageDoorType, GarageInput, HeaterClassId, Measure } from "@/lib/planner/types";
import { verdictFor } from "@/lib/safety/verdict";
import type { Situation } from "@/lib/safety/types";
import type { Ev } from "@/lib/types/evidence";
import { SAFETY_SCOPE, SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/best-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = [
  "nec-2023",
  "irc-2021",
  "ifgc-2021",
  "cz798-manual",
  "cz220-manual",
  "fuh54-manual",
  "dr238-manual",
  "dr975-manual",
  "dr910f-manual",
  "big-maxx-manual",
  "vevor-diesel-manual",
  "kidde-c3010-datasheet",
  "epa-608",
];

// Two stations that bracket the climate question for a plug-in heater. The worked example (Chicago) is the cold one.
const MILD_STATION = "GA-atlanta";
const COLD_STATION = "IL-chicago";

// FitBar's end of the sentence: every bar on this page is a worked-example garage, never the reader's.
const BAR = "of this garage's load";

// The 99% heating design temperature is the one the outdoor air falls below for 1% of the hours in a year.
const HOURS_PER_YEAR = 8760;
const DESIGN_HOURS = Math.round(0.01 * HOURS_PER_YEAR);

type Tier = "tight" | "leaky";
const TIERS: Record<Tier, { wallType: GarageInput["wallType"]; ceilingIns: GarageInput["ceilingIns"]; doorType: GarageDoorType; tightness: GarageInput["tightness"] }> = {
  tight: { wallType: "R13", ceilingIns: "R30", doorType: "kit_eps_or_batt", tightness: "tight" },
  leaky: { wallType: "uninsulated_finished", ceilingIns: "drywall_uninsulated", doorType: "steel_single", tightness: "leaky" },
};

// A detached garage of a preset size in one of the two envelope tiers the size chart uses (/garage-heater-size), run
// in attended work sessions: the only use the planner lets a cord-and-plug heater be recommended for.
function garage(preset: "1car" | "2car", tier: Tier, stationId: string, over: Partial<GarageInput> = {}): GarageInput {
  const p = PRESET_DEFAULTS[preset];
  const t = TIERS[tier];
  return {
    ...defaultGarageInput(),
    stationId,
    state: stationId.split("-")[0],
    preset,
    width: p.width,
    depth: p.depth,
    height: p.height,
    attached: false,
    commonWallLen: 0,
    wallType: t.wallType,
    ceilingIns: t.ceilingIns,
    tightness: t.tightness,
    garageDoors: p.garageDoors.map((d) => ({ ...d, type: t.doorType })),
    windowsFt2: p.windowsFt2,
    serviceDoorFt2: p.serviceDoorFt2,
    flammablesStored: "no",
    circuit: "120V20A",
    canAddCircuit: false,
    panelAmps: 200,
    ...over,
  };
}

const MEASURE_LABEL: Partial<Record<Measure, string>> = {
  weatherstrip: "weatherstripping",
  door_kit_eps: "an insulated door kit",
  ceiling_r30: "an R-30 ceiling",
};

const ATTACHED_BUDDY: Situation = {
  attached: true,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  ulListed: "yes",
  cylinder: "1lb",
  cylinderStoredWhere: "outdoors",
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
};

// A class's heater watts, read from the catalog's BTU/h output (3,412 BTU/h per kW) rather than retyped.
function classWatts(id: HeaterClassId): number {
  return (heaterClass(id).outputBtuh[1] / HEAT_CONTENT.btuPerKwh) * 1000;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// A numeric fact's value, so a sum built from facts never carries a retyped figure.
function factNum(id: string): number {
  const fact = getFact(id);
  if (!fact || typeof fact.value !== "number") throw new Error(`best-garage-heater: fact ${id} is missing or not a number`);
  return fact.value;
}

// The Product registry carries a listing's rated size only in its name ("... 12,000 BTU ..."), with no outputBtuh on file.
function ratedBtuhFromName(name: string): number {
  const m = /([\d,]+)\s*BTU/i.exec(name);
  if (!m) throw new Error(`best-garage-heater: no BTU rating in product name "${name}"`);
  return Number(m[1].replace(/,/g, ""));
}

// "40,000 BTU/h (11.7 kW)" as plain text, for a plate headline (a prop string cannot hold a <Num>).
function pairText(btuh: number): string {
  return `${Math.round(btuh).toLocaleString("en-US")} BTU/h (${(Math.round((btuh / HEAT_CONTENT.btuPerKwh) * 10) / 10).toFixed(1)} kW)`;
}

// BTU/h and kW as a pair, rounded per BLUEPRINT.md §5.1 (BTU/h to the nearest 100, kW to 0.1).
function Load({ q, src, ev = "C" }: { q: number; src: string; ev?: Ev }) {
  return (
    <>
      <Num v={q} unit="BTU/h" round={100} ev={ev} src={src} /> (<Num v={q / HEAT_CONTENT.btuPerKwh} unit="kW" round={0.1} ev={ev} src={src} />)
    </>
  );
}

function Pct({ v, src }: { v: number; src: string }) {
  return <Num v={v} ev="C" src={src} format={(x) => `${Math.round(Number(x))}%`} />;
}

// "240 V / 30 A, 10 AWG" as one evidence-marked figure.
function Circuit({ c, src }: { c: CircuitSpec; src: string }) {
  return <Num v={c.breakerA} ev="C" src={src} format={() => `${c.volts} V / ${c.breakerA} A, ${c.wireNM}`} />;
}

export default function Page() {
  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  // --- The worked example (BLUEPRINT.md §0.2): a 24x24 ft attached 2-car in Chicago, as built and after the cheap fixes.
  const asIs = plan(EXAMPLE_A_INPUT);
  const fix = asIs.fixFirst;
  if (!fix) throw new Error("best-garage-heater: plan(EXAMPLE_A_INPUT) returned no fixFirst result");
  const asBuilt = asIs.heating.qSize;
  const sealed = fix.qAfter;
  const station = asIs.station;
  const exampleCeilingFt = EXAMPLE_A_INPUT.height;
  const doorsPct = asIs.heating.items.find((i) => i.key === "garage_doors")?.pct ?? 0;
  const whyNotTorpedo = asIs.whyNot.filter((r) => r.classId === "torpedo");
  const fixLabels = fix.measures.map((m) => MEASURE_LABEL[m]).filter((l): l is string => Boolean(l));

  // --- Catalog classes the picks come from.
  const portable = heaterClass("e_port_1500");
  const fiveKw = heaterClass("e_240_5k");
  const infrared = heaterClass("e_ir_wall_1500");
  const vented = heaterClass("g_vented_unit");
  const miniSplit = heaterClass("hp_12_24k_230");
  const portableOut = portable.outputBtuh[1];
  const fiveKwOut = fiveKw.outputBtuh[1];
  const infraredOut = infrared.outputBtuh[1];

  // --- Circuits, each sized by the planner's own continuous-load rule (NEC 2023 §424.4(B)).
  const c1500 = circuitFor(classWatts("e_port_1500"), 120, 120);
  const c4 = circuitFor(classWatts("e_240_4k"), 240, 240);
  const c5 = circuitFor(classWatts("e_240_5k"), 240, 240);

  // --- Pick 1: a small, tight 1-car in attended work sessions, in a mild and a cold climate.
  const oneMild = plan(garage("1car", "tight", MILD_STATION));
  const oneCold = plan(garage("1car", "tight", COLD_STATION));
  const mildFit = (portableOut / oneMild.heating.qSize) * 100;
  const coldFit = (portableOut / oneCold.heating.qSize) * 100;
  const mildRec = oneMild.recommendations.find((r) => r.classId === "e_port_1500");
  const coldRec = oneCold.recommendations.find((r) => r.classId === "e_port_1500");
  const pick1 = mildRec ? productForRecommendation(mildRec.productIds, { capacityBtuh: mildRec.capacityBtuh, units: mildRec.units }) : undefined;
  // Don't-buy for pick 1: the same plug-in against an uninsulated 2-car. The planner's own answer for it is two units.
  const bareTwoCar = plan(garage("2car", "leaky", COLD_STATION, { circuit: "unknown", canAddCircuit: true }));
  const bareTwoCarFit = (portableOut / bareTwoCar.heating.qSize) * 100;
  // The planner's own reason for ruling out the plug-in in THIS scenario (detached, attended sessions), not the
  // worked example's continuous-use reason.
  const whyNotPortable = bareTwoCar.whyNot.filter((r) => r.classId === "e_port_1500");
  const bareTwoCarAnswers = bareTwoCar.recommendations.filter((r) => r.units > 1 && (r.classId === "e_240_7k5" || r.classId === "e_240_10k"));
  const tenKwFit = (heaterClass("e_240_10k").outputBtuh[1] / bareTwoCar.heating.qSize) * 100;

  // --- Picks 2 and 3: two 5 kW heaters against the sealed example garage. A direct link only if one unit covers the load.
  const fuh54 = findProduct("fuh54-5kw");
  const fuh54Out = fuh54?.outputBtuh ?? fiveKwOut;
  const sealedFit = (fuh54Out / sealed) * 100;
  const fiveKwUnitsAsBuilt = Math.ceil(asBuilt / fiveKwOut);
  const fiveKwUnitsSealed = Math.ceil(sealed / fiveKwOut);
  const pickFuh = productForRecommendation(["fuh54-5kw"], { capacityBtuh: sealed, units: 1 });
  const pickCz = productForRecommendation(["cz220-5kw-ceiling"], { capacityBtuh: sealed, units: 1 });
  const cz220 = findProduct("cz220-5kw-ceiling");
  const dr975Product = findProduct("dr975-7k5-shop");
  const dieselProduct = findProduct("diesel-heater-8kw");
  const dr975Warning = productWarning(dr975Product);
  const dieselWarning = productWarning(dieselProduct);

  // --- Pick 4: infrared spot heat. The product is the class's first verified listing.
  const pick4 = primaryProduct(infrared.productIds);
  const infraredFit = (infraredOut / asBuilt) * 100;

  // --- Pick 5: vented gas. The Big Maxx manual's mounting height rules out the 9 ft example garage, so this pick runs the
  // same garage with the 3-car preset's taller ceiling.
  const tallHeight = PRESET_DEFAULTS["3car"].height;
  const tallInput = { ...EXAMPLE_A_INPUT, height: tallHeight };
  const tallElectric = plan(tallInput);
  const tallGas = plan({ ...tallInput, fuels: ["electric", "natural_gas"], ventingPossible: true });
  const tallLoad = tallElectric.heating.qSize;
  const gasFirst = tallGas.recommendations[0]?.classId === "g_vented_unit";
  const tallMini = tallElectric.recommendations.find((r) => r.classId === "hp_12_24k_230");
  const tallFive = tallElectric.recommendations.find((r) => r.classId === "e_240_5k");
  const bigMaxxMinCeilingIn = factNum("bigmaxx.min_height_ft") * 12 + factNum("bigmaxx.mhu50.height_in") + factNum("bigmaxx.clearance_top_sides_in");
  const bigMaxxOut = factNum("bigmaxx.mhu50.output_btuh");
  const bigMaxxIn = factNum("bigmaxx.mhu50.input_btuh");
  const bigMaxxFit = (bigMaxxOut / tallLoad) * 100;
  const exampleTakesBigMaxx = exampleCeilingFt * 12 >= bigMaxxMinCeilingIn;
  const tallTakesBigMaxx = tallHeight * 12 >= bigMaxxMinCeilingIn;
  const pick5 = primaryProduct(vented.productIds);
  // A direct link only if the maker's output covers the load this pick describes and the ceiling is tall enough.
  const pick5Direct = bigMaxxOut >= tallLoad && tallTakesBigMaxx;
  const buddyVerdict = verdictFor("buddy", ATTACHED_BUDDY);

  // --- Pick 6: mini-split. Output at the design temperature, relative to its 47 F rating (cold-climate curve).
  // No nameplate output is on file for this listing, so productForRecommendation says direct:false and the plate is a search link.
  const pick6 = productForRecommendation(miniSplit.productIds, { capacityBtuh: sealed, units: 1 });
  const derate = heatPumpCapacity("cold_climate", station.h99, 1);
  const smallRated = pick6.product ? ratedBtuhFromName(pick6.product.name) : 0;
  const smallAtDesign = heatPumpCapacity("cold_climate", station.h99, smallRated);
  const smallFit = (smallAtDesign / sealed) * 100;
  const smallUnits = smallAtDesign > 0 ? Math.ceil(sealed / smallAtDesign) : 0;
  const smallPairFit = ((smallUnits * smallAtDesign) / sealed) * 100;
  const bigMiniAtDesign = heatPumpCapacity("cold_climate", station.h99, miniSplit.outputBtuh[1]);
  const bigMiniFitAsBuilt = (bigMiniAtDesign / asBuilt) * 100;
  const asBuiltMini = asIs.recommendations.find((r) => r.classId === "hp_12_24k_230");

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        The best garage heater is the one sized to your garage and your circuit. Our example 2-car garage in {station.city} needs{" "}
        <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize — lib/planner/plan.ts" /> as built. Sealed, it needs{" "}
        <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter — lib/planner/roi.ts" />. A <Num f="fuh54.watts.high" /> wall or ceiling heater covers the
        sealed load on a <Num v={c5.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA — lib/planner/electrical.ts" />, {c5.wireNM}, 240 V
        circuit. Plan your garage first, then pick from the six cases below.
      </AnswerBlock>
      <p className="text-xs text-(--color-fg-2)">{SAVINGS_VARY}</p>

      <div className="not-prose my-6">
        <ButtonLink href="/garage-heater-calculator">Plan your garage first, free →</ButtonLink>
      </div>

      {pickFuh.direct && pickFuh.product ? (
        <QuickPick
          productId={pickFuh.product.id}
          page={entry.href}
          headline="For a sealed 2-car garage: a 5 kW wall or ceiling heater on its own 240 V circuit."
          compareHref="#picks"
          compareLabel="See all six picks"
        />
      ) : null}

      <h2 id="plan">Plan your garage first</h2>
      <p>
        Wattage on a box says nothing about your garage. The load does. The load is the heat your garage loses on a cold design day. That is the outdoor
        temperature that about 1% of the year&apos;s hours, roughly{" "}
        <Num v={DESIGN_HOURS} unit="hours" ev="R" src="ASHRAE 99% heating design condition: 1% of 8,760 hours in a year" />, fall below. Walls, ceiling, door and air
        leaks set it.
      </p>
      <p>
        Three fixes cut the example&apos;s load: {joinList(fixLabels)}. It falls from <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize" /> to{" "}
        <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />. The envelope grade goes from{" "}
        <Num v={fix.gradeBefore} ev="C" src="plan(EXAMPLE_A_INPUT).fixFirst.gradeBefore" /> to{" "}
        <Num v={fix.gradeAfter} ev="C" src="plan(EXAMPLE_A_INPUT).fixFirst.gradeAfter" />. Counted in 5 kW units, the answer drops from{" "}
        <Num v={fiveKwUnitsAsBuilt} ev="C" src="ceil(qSize / HEATER_CLASSES.e_240_5k.outputBtuh[1])" /> to{" "}
        <Num v={fiveKwUnitsSealed} ev="C" src="ceil(fixFirst.qAfter / HEATER_CLASSES.e_240_5k.outputBtuh[1])" />.
      </p>
      <p className="text-xs text-(--color-fg-2)">{SAVINGS_VARY}</p>
      <p>
        Not sure of your insulation? The calculator gives a range until you tell it. The <Link href="/garage-heater-size">size chart</Link> shows tight and
        leaky garages in four sizes. <Link href="/how-to-insulate-a-garage">The insulation guide</Link> puts the fixes in payback order.
      </p>

      <h2 id="picks">Six picks, by situation</h2>
      <p>
        These are model picks. They come from the makers&apos; manuals and our load model, not from star ratings. Money never changes a pick (
        <Link href="/how-we-work#money">how we make money</Link>). Each pick names the garage it fits and one thing not to buy.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Your situation</th>
              <th className="py-2 pr-3 font-normal">Load it must cover</th>
              <th className="py-2 pr-3 font-normal">Pick</th>
              <th className="py-2 font-normal">What it needs</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-1">
                  Small, tight 1-car, 120 V outlet, attended
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={oneMild.heating.qSize} src="plan(1-car, tight, mild station, sessions).heating.qSize" />
                <span className="block text-xs text-(--color-fg-2)">
                  {oneMild.station.city}, {oneMild.station.st} · work session
                </span>
              </td>
              <td className="py-3 pr-3">{portable.label}</td>
              <td className="py-3 font-mono">
                <Circuit c={c1500} src="circuitFor(1500, 120, 120)" />
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-2">
                  2-car on a 240 V circuit
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />
                <span className="block text-xs text-(--color-fg-2)">sealed example</span>
              </td>
              <td className="py-3 pr-3">{fuh54?.name ?? fiveKw.label}</td>
              <td className="py-3 font-mono">
                <Circuit c={c5} src="circuitFor(5000, 240, 240)" />
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-3">
                  Ceiling mount, floor kept clear
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                Ceiling <Num f="cz220.max_ceiling_ft" /> or lower
              </td>
              <td className="py-3 pr-3">{cz220?.name ?? "Comfort Zone CZ220"}</td>
              <td className="py-3 font-mono">
                <Num f="cz220.clearance_floor_ft" /> headroom
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-4">
                  Spot heat, door open, attended
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">A spot, not the room</td>
              <td className="py-3 pr-3">{infrared.label}</td>
              <td className="py-3 font-mono">
                120 V outlet, <Num f="dr238.mount_height_in" /> mount
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-5">
                  Big or drafty, gas piped in, tall ceiling
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={tallLoad} src="plan({...EXAMPLE_A_INPUT, height: 3-car preset height}).heating.qSize" />
                <span className="block text-xs text-(--color-fg-2)">example with a taller ceiling</span>
              </td>
              <td className="py-3 pr-3">{vented.label}</td>
              <td className="py-3 font-mono">Gas line, gas fitter, vent</td>
            </tr>
            <tr className="align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-6">
                  Heat and cooling all year
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />
                <span className="block text-xs text-(--color-fg-2)">sealed example</span>
              </td>
              <td className="py-3 pr-3">{miniSplit.label}</td>
              <td className="py-3 font-mono">Dedicated 240 V circuit, HVAC installer</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="pick-1">1. Small, tight 1-car garage on a 120 V outlet</h3>
      <p>
        This one is right for a work session: a few hours at a time, with you there the whole time. The garage must be insulated and sealed, and nothing
        flammable can be stored in it. That means R-13 walls, an R-30 ceiling and an insulated door kit, which the{" "}
        <Link href="/garage-heater-size">size chart</Link> calls “tight.”
      </p>
      <p>
        In {oneMild.station.city}, {oneMild.station.st}, a detached 1-car garage like that needs{" "}
        <Load q={oneMild.heating.qSize} src="plan(1-car, tight, mild station, sessions).heating.qSize" /> for a work session at{" "}
        <Num v={oneMild.heating.tOutDesign} unit="°F" round={0.1} ev="C" src="plan().heating.tOutDesign — station h99 plus the session offset" /> outside. That is
        the station&apos;s <Num v={oneMild.station.h99} unit="°F" round={0.1} ev="R" src="ASHRAE 99% design dry-bulb — lib/planner/stations.ts" /> design temperature
        plus the planner&apos;s{" "}
        <Num
          v={oneMild.heating.tOutDesign - oneMild.station.h99}
          unit="°F"
          round={1}
          ev="E"
          src="designTempFor(): h99 + 5 °F for daytime sessions — lib/planner/uncertainty.ts"
        />{" "}
        daytime-session offset.
      </p>
      <p>
        A <Num f="cz798.watts" /> plug-in heater gives up to <Load q={portableOut} src="HEATER_CLASSES.e_port_1500.outputBtuh[1] — lib/planner/catalog.ts" />. That is{" "}
        <Pct v={mildFit} src="e_port_1500 output / plan(1-car, tight, mild station).heating.qSize" /> of the load.
      </p>
      <FitBar pct={mildFit} label={BAR} />
      <p>
        Move the same garage to {oneCold.station.city}, {oneCold.station.st} and the load is{" "}
        <Load q={oneCold.heating.qSize} src="plan(1-car, tight, cold station, sessions).heating.qSize" />. One plug-in covers{" "}
        <Pct v={coldFit} src="e_port_1500 output / plan(1-car, tight, cold station).heating.qSize" /> of that
        {coldFit < 100 && coldRec ? (
          <>
            . The planner asks for{" "}
            <Num v={coldRec.units} ev="C" src="plan(1-car, tight, cold station).recommendations[e_port_1500].units" /> of them, each on its own{" "}
            <Num v={c1500.breakerA} unit="A" ev="C" src="circuitFor(1500, 120, 120).breakerA" /> circuit
          </>
        ) : null}
        . Enter your ZIP code in the calculator before you buy.
      </p>
      <FitBar pct={coldFit} label={BAR} />
      <p>
        Plug it straight into a {c1500.volts} V, <Num v={c1500.breakerA} unit="A" ev="C" src="circuitFor(1500, 120, 120).breakerA" /> circuit, with nothing else
        running on it. Newer garages get a 20 A circuit that serves only garage outlets (NEC 2023 §210.11(C)(4)). Unplug everything else on it while the
        heater runs.
      </p>
      {pick1?.direct && pick1.product ? (
        <QuickPick
          productId={pick1.product.id}
          page={entry.href}
          headline="A fan-forced milkhouse heater for a small, tight garage in a mild climate, used while you are there."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a 1,500 W heater for an uninsulated 2-car garage.</strong> Take a detached 2-car in {bareTwoCar.station.city} with uninsulated walls, a
        bare ceiling and a steel door. It needs{" "}
        <Load q={bareTwoCar.heating.qSize} src="plan(2-car, leaky, cold station, sessions).heating.qSize" /> even for daytime sessions. A plug-in covers{" "}
        <Pct v={bareTwoCarFit} src="e_port_1500 output / plan(2-car, leaky, cold station).heating.qSize" /> of it. Seal the garage first.
        {bareTwoCarAnswers.length > 0 ? (
          <>
            {" "}
            The planner&apos;s answer for it is{" "}
            {bareTwoCarAnswers.map((r, i) => (
              <span key={r.classId}>
                {i > 0 ? ", or " : ""}
                <Num v={r.units} ev="C" src={`plan(2-car, leaky, cold station).recommendations[${r.classId}].units`} /> {i === 0 ? "units of the" : "of the"}{" "}
                <Num v={classWatts(r.classId) / 1000} unit="kW" ev="C" src={`HEATER_CLASSES.${r.classId}.outputBtuh[1] — lib/planner/catalog.ts`} /> class
              </span>
            ))}
            . Each unit gets its own circuit. One 10 kW unit covers only{" "}
            <Pct v={tenKwFit} src="HEATER_CLASSES.e_240_10k.outputBtuh[1] / plan(2-car, leaky, cold station).heating.qSize" />.
          </>
        ) : null}
      </p>
      <FitBar pct={bareTwoCarFit} label={BAR} />
      <WhyNot rows={whyNotPortable} />

      <h3 id="pick-2">2. 2-car garage with a 240 V circuit: the 5 kW class</h3>
      <p>
        This one is right when the sealed load is under <Num f="fuh54.btuh.high" /> (<Num f="fuh54.watts.high" />) and you can run a 240 V circuit. Our sealed
        example needs <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />. One unit covers{" "}
        <Pct v={sealedFit} src="fuh54.btuh.high / plan(EXAMPLE_A_INPUT).fixFirst.qAfter" /> of it.
      </p>
      <p>
        The FUH54 manual asks for <Num f="fuh54.wire" /> and a fuse of no more than <Num f="fuh54.fuse_max" />. That matches the planner&apos;s{" "}
        <Num v={c5.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA" /> breaker. A fixed heater is a continuous load, so the breaker is sized at
        125% of the running current. The rule is NEC 2023 §424.4(B): <Num f="code.nec.424_4_b" />.
      </p>
      <p>
        It is sold for wall or ceiling mounting. We have no ceiling-height limit on file for it, so read its mounting section before you order. Pick 3 explains
        why that matters for a <Num v={exampleCeilingFt} unit="ft" ev="E" src="EXAMPLE_A_INPUT.height — lib/planner/fixtures.ts" /> ceiling.
      </p>
      {pickFuh.direct && pickFuh.product ? (
        <QuickPick
          productId={pickFuh.product.id}
          page={entry.href}
          headline="A 5 kW heater for wall or ceiling mounting, on its own 240 V circuit. One unit covers the sealed example garage."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a 4 kW 240 V heater to fit a 20 A circuit.</strong> It draws <Num v={c4.amps} unit="A" ev="C" src="circuitFor(4000, 240, 240).amps" />.
        The breaker is sized at 125% of that: <Num v={c4.minAmps} unit="A" ev="C" src="circuitFor(4000, 240, 240).minAmps" />. The next standard size is{" "}
        <Num v={c4.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240).breakerA" />, so it needs its own circuit too. The{" "}
        <Link href="/240v-garage-heater">240 V page</Link> lists every size.
      </p>

      <h3 id="pick-3">3. Ceiling mount, to keep the floor and walls clear</h3>
      <p>
        A ceiling unit keeps the floor and walls free. The CZ220 manual asks for <Num f="cz220.clearance_floor_ft" /> of headroom below the heater and{" "}
        <Num f="cz220.clearance_wall_in" /> from any wall.
      </p>
      <p>
        The same manual gives <Num f="cz220.max_ceiling_ft" /> as the maximum recommended ceiling height for effective airflow. So the CZ220 suits a ceiling of{" "}
        <Num f="cz220.max_ceiling_ft" /> or lower. Our example garage has a <Num v={exampleCeilingFt} unit="ft" ev="E" src="EXAMPLE_A_INPUT.height" /> ceiling, so it
        gets the FUH54 from pick 2. The FUH54 manual also asks for <Num f="fuh54.clearance_floor_ft" /> of headroom.
      </p>
      <p>
        The <Link href="/ceiling-mount-garage-heater">ceiling-mount page</Link> lists the CZ220&apos;s clearances.
      </p>
      {pickCz.direct && pickCz.product ? (
        <QuickPick
          productId={pickCz.product.id}
          page={entry.href}
          headline="The other 5 kW heater we link. A ceiling mount for ceilings within its airflow limit, on its own 240 V circuit."
        />
      ) : null}
      <p>
        <span data-source={dr975Product?.safetyLine?.sourceId}>{dr975Warning}</span> <strong>Don&apos;t buy a 7.5 kW or 10 kW Dr. Infrared shop heater for a home garage.</strong> The DR-975 and DR-910F manuals both print that
        warning.
      </p>

      <h3 id="pick-4">4. Spot heat with the garage door open: infrared</h3>
      <p>
        This one is right when you work in one bay with the door up. Run it only while you are there: its manual says never to leave it unattended. Forced-air
        heat leaves with the air. In our example the garage door is{" "}
        <Num v={doorsPct} unit="%" round={1} ev="C" src="plan(EXAMPLE_A_INPUT).heating.items[garage_doors].pct" /> of the design load even when it is shut.
      </p>
      <p>
        Radiant heat lands on you and the floor first. Judge a spot heater by where it points, not by the garage&apos;s load. This unit plugs into a 120 V outlet
        and mounts on a wall or ceiling.
      </p>
      <p>
        Its manual sets a minimum height of <Num f="dr238.mount_height_in" /> to the heater&apos;s lowest part, so measure your ceiling first. The{" "}
        <Link href="/infrared-garage-heater">infrared page</Link> explains the comfort trade-off.
      </p>
      {pick4 ? (
        <QuickPick
          productId={pick4.id}
          page={entry.href}
          headline="A 120 V infrared heater for one bay or a workbench, used while you are there. It heats what it points at, so the open door matters less."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy an infrared panel to warm the air in a closed garage.</strong> Its output tops out near{" "}
        <Load q={infraredOut} src="HEATER_CLASSES.e_ir_wall_1500.outputBtuh[1] — lib/planner/catalog.ts" />. That is only{" "}
        <Pct v={infraredFit} src="e_ir_wall_1500 output / plan(EXAMPLE_A_INPUT).heating.qSize" /> of our example as built. It warms what it points at, not the air in
        the whole garage.
      </p>
      <FitBar pct={infraredFit} label={BAR} />

      <h3 id="pick-5">5. Big or drafty garage with natural gas available: a vented unit heater</h3>
      <p>
        This one is right when gas is already piped in and the garage is big or drafty. The model we link needs a tall ceiling. The Big Maxx manual wants{" "}
        <Num f="bigmaxx.min_height_ft" /> from the floor to the heater&apos;s bottom and <Num f="bigmaxx.clearance_top_sides_in" /> of clearance above its top.
        The MHU50&apos;s cabinet is <Num f="bigmaxx.mhu50.height_in" /> tall.
      </p>
      <p>
        So the ceiling must be at least{" "}
        <Num
          v={bigMaxxMinCeilingIn}
          ev="C"
          src="bigmaxx.min_height_ft x 12 + bigmaxx.mhu50.height_in + bigmaxx.clearance_top_sides_in"
          format={(x) => `${Math.floor(Number(x) / 12)} ft ${Number(x) % 12} in`}
        />
        . Our example garage has a <Num v={exampleCeilingFt} unit="ft" ev="E" src="EXAMPLE_A_INPUT.height" /> ceiling, so{" "}
        {exampleTakesBigMaxx ? "it can take this model" : "it can't take this model"}. A <Num v={tallHeight} unit="ft" ev="E" src="PRESET_DEFAULTS['3car'].height — lib/planner/presets.ts" />{" "}
        ceiling, as in the planner&apos;s 3-car preset, {tallTakesBigMaxx ? "can" : "can't"}.
      </p>
      <p>
        At that height the same garage needs <Load q={tallLoad} src="plan({...EXAMPLE_A_INPUT, height: 3-car preset height}).heating.qSize" /> as built. The
        Big Maxx MHU50 delivers <Num f="bigmaxx.mhu50.output_btuh" /> (
        <Num v={bigMaxxOut / HEAT_CONTENT.btuPerKwh} unit="kW" round={0.1} ev="C" src="bigmaxx.mhu50.output_btuh / 3,412 BTU/h per kW" />
        ), which is{" "}
        <Pct v={bigMaxxFit} src="bigmaxx.mhu50.output_btuh / plan(tall example).heating.qSize" /> of that.
        {gasFirst ? " With natural gas listed, the planner ranks a vented unit heater first." : ""}
        {tallMini && tallFive ? (
          <>
            {" "}
            Its top electric answers include <Num v={tallMini.units} ev="C" src="plan(tall example).recommendations[hp_12_24k_230].units" /> mini-splits, or{" "}
            <Num v={tallFive.units} ev="C" src="plan(tall example).recommendations[e_240_5k].units" /> heaters of the 5 kW class. Each unit gets its own circuit.
          </>
        ) : null}
      </p>
      <p>
        Vented units in this class run from <Load q={vented.outputBtuh[0]} src="HEATER_CLASSES.g_vented_unit.outputBtuh[0] — lib/planner/catalog.ts" /> to{" "}
        <Load q={vented.outputBtuh[1]} src="HEATER_CLASSES.g_vented_unit.outputBtuh[1]" />, at about{" "}
        <Num f="fuel.vented_unit.eta" format={(v) => `${Math.round(Number(v) * 100)}%`} /> efficiency. A flue sends the exhaust outdoors. BayHeat advises a
        licensed gas fitter and the permit your town requires. Fuel costs are on the <Link href="/electric-vs-propane-garage-heater">fuel comparison</Link>.
      </p>
      {pick5 ? (
        <QuickPick
          productId={pick5.id}
          page={entry.href}
          direct={pick5Direct}
          headline={`A vented unit heater for natural gas or propane. Match its ${pairText(bigMaxxOut)} output, not the ${pairText(bigMaxxIn)} input, to the calculator's BTU/h.`}
        />
      ) : null}
      <QuickPick
        productId="co-alarm-battery-10yr"
        page={entry.href}
        eyebrow="Safety add-on"
        headline="Put a UL 2034 CO alarm in the house, by the garage door and outside each sleeping area."
      />
      <p>
        <strong>Don&apos;t buy an unvented propane heater for an attached garage.</strong> Our Can I Run It? tool returns the verdict below for a Buddy-type heater
        in an attached garage. Buddy-type heaters never get a buy button on this site.
      </p>
      <VerdictStamp verdict={buddyVerdict} />
      <p>
        Torpedo heaters are always a NO-GO, and kerosene heaters are a NO-GO in an attached garage. Run your own situation through{" "}
        <Link href="/can-i-run-it">Can I run it?</Link>, or read the <Link href="/propane-heater-for-garage">propane page</Link>.
      </p>

      <h3 id="pick-6">6. Heat and cooling all year: a mini-split</h3>
      <p>
        This one is right when the garage is sealed and you want cooling too. It needs a dedicated 240 V circuit sized to the unit&apos;s nameplate. A mini-split
        loses output as it gets cold. At {station.city}&apos;s <Num v={station.h99} unit="°F" round={0.1} ev="R" src="ASHRAE 99% design dry-bulb — lib/planner/stations.ts" />{" "}
        design temperature, a cold-climate unit gives about{" "}
        <Pct v={derate * 100} src="heatPumpCapacity('cold_climate', station.h99, 1) — lib/planner/seasonal.ts" /> of its rated heat.
      </p>
      <p>
        The example listing is the <Load q={smallRated} ev="E" src="nominal size in the listing name — lib/commerce/products/fuel.ts" /> nominal size. A
        cold-climate unit of that nominal size gives about{" "}
        <Load q={smallAtDesign} src="heatPumpCapacity('cold_climate', station.h99, nominal size) — lib/planner/seasonal.ts" /> at{" "}
        <Num v={station.h99} unit="°F" round={0.1} ev="R" src="ASHRAE 99% design dry-bulb — lib/planner/stations.ts" />. That is{" "}
        <Pct v={smallFit} src="heatPumpCapacity(...) / plan(EXAMPLE_A_INPUT).fixFirst.qAfter" /> of the sealed example&apos;s load.
        {smallUnits > 1 ? (
          <>
            {" "}
            Together, <Num v={smallUnits} ev="C" src="ceil(fixFirst.qAfter / heatPumpCapacity(...))" /> of them cover{" "}
            <Pct v={smallPairFit} src="units x heatPumpCapacity(...) / fixFirst.qAfter" />.
          </>
        ) : null}{" "}
        The planner sizes this class at its{" "}
        <Load q={miniSplit.outputBtuh[1]} src="HEATER_CLASSES.hp_12_24k_230.outputBtuh[1] — lib/planner/catalog.ts" /> top size.
      </p>
      <FitBar pct={smallFit} label={BAR} />
      {pick6.product ? (
        <QuickPick
          productId={pick6.product.id}
          page={entry.href}
          direct={pick6.direct}
          headline={
            pick6.direct
              ? "A 230 V mini-split that heats and cools. Check its heat output at your low temperature against the calculator's BTU/h."
              : "A 230 V mini-split that heats and cools. The button opens a search: size by the calculator's BTU/h, not by this example listing."
          }
        />
      ) : null}
      <p>
        It also cools in summer. We have not modeled cooling load yet, so this page quotes no cooling size. BayHeat advises a licensed HVAC contractor for the refrigerant
        work. The <Link href="/heat-pump-mini-split-for-garage">mini-split page</Link> compares five-year running cost against a resistance heater.
      </p>
      <p>
        <strong>Don&apos;t buy a mini-split for a garage you have not sealed.</strong> The largest unit in the class, rated{" "}
        <Load q={miniSplit.outputBtuh[1]} src="HEATER_CLASSES.hp_12_24k_230.outputBtuh[1]" />, gives about{" "}
        <Load q={bigMiniAtDesign} src="heatPumpCapacity('cold_climate', station.h99, rated) — lib/planner/seasonal.ts" /> at that design temperature. One unit covers{" "}
        <Pct v={bigMiniFitAsBuilt} src="heatPumpCapacity(...) / plan(EXAMPLE_A_INPUT).heating.qSize" /> of our example as built.
        {asBuiltMini ? (
          <>
            {" "}
            The planner&apos;s answer for that garage is{" "}
            <Num v={asBuiltMini.units} ev="C" src="plan(EXAMPLE_A_INPUT).recommendations[hp_12_24k_230].units" /> of them, each on its own circuit.
          </>
        ) : null}
      </p>
      <FitBar pct={bigMiniFitAsBuilt} label={BAR} />

      <h2>What is not on this list</h2>
      <p>
        Diesel air heaters have no buy button here. Our safety note for them: <span data-source={dieselProduct?.safetyLine?.sourceId}>{dieselWarning}</span> Read the <Link href="/diesel-heater-for-garage">diesel page</Link>{" "}
        before you decide. Open-flame torpedo heaters are out for any enclosed garage.
      </p>
      <WhyNot rows={whyNotTorpedo} />

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          A plug-in heater needs GFCI protection on its outlet. The rule is NEC 2023 §210.8(A)(2): <Num f="code.nec.210_8_a" />. A fixed 240 V heater is a
          continuous load. The rule is NEC 2023 §424.4(B): <Num f="code.nec.424_4_b" />. For a gas heater, BayHeat advises a licensed gas fitter and the permit your town requires. A house with an attached garage
          needs a CO alarm. The rule is IRC 2021 R315: <Num f="code.irc.r315" />. Your electrician and your local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>

      <h2>Next step</h2>
      <p>
        <Link href="/garage-heater-calculator">Run your own garage through the calculator →</Link> You get a load, a heater class and a breaker sized to your
        dimensions. Then read the page for your class: <Link href="/240v-garage-heater">240 V</Link>, <Link href="/portable-garage-heater">portable</Link>,{" "}
        <Link href="/infrared-garage-heater">infrared</Link>, or <Link href="/garage-heaters">every fuel at your state&apos;s prices</Link>.
      </p>
    </ReportPage>
  );
}
