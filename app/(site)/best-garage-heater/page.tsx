import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { VerdictStamp } from "@/components/safety/VerdictStamp";
import { Disclosure } from "@/components/commerce/Disclosure";
import { QuickPick } from "@/components/commerce/QuickPick";
import { FitBar } from "@/components/commerce/FitBar";
import { WhyNot } from "@/components/commerce/WhyNot";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
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
import { SAFETY_SCOPE, SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/best-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["nec-2023", "irc-2021", "ifgc-2021", "cz798-manual", "cz220-manual", "fuh54-manual", "dr238-manual", "dr975-manual", "big-maxx-manual"];

// Two stations that bracket the climate question for a plug-in heater. The worked example (Chicago) is the cold one.
const MILD_STATION = "GA-atlanta";
const COLD_STATION = "IL-chicago";

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

function parseCircuit(c: string | undefined): { volts: number; amps: number } {
  const m = /^(\d+)V(\d+)A$/.exec(c ?? "");
  if (!m) throw new Error(`best-garage-heater: unexpected circuit "${c}"`);
  return { volts: Number(m[1]), amps: Number(m[2]) };
}

// BTU/h and kW as a pair, rounded per BLUEPRINT.md §5.1 (BTU/h to the nearest 100, kW to 0.1).
function Load({ q, src }: { q: number; src: string }) {
  return (
    <>
      <Num v={q} unit="BTU/h" round={100} ev="C" src={src} /> (<Num v={q / HEAT_CONTENT.btuPerKwh} unit="kW" round={0.1} ev="C" src={src} />)
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
  const doorsPct = asIs.heating.items.find((i) => i.key === "garage_doors")?.pct ?? 0;
  const whyNotPortable = asIs.whyNot.filter((r) => r.classId === "e_port_1500");
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
  const c10 = circuitFor(classWatts("e_240_10k"), 240, 240);
  const miniCircuit = parseCircuit(miniSplit.circuit);

  // --- Pick 1: a small, tight 1-car in attended sessions, in a mild and a cold climate.
  const oneMild = plan(garage("1car", "tight", MILD_STATION));
  const oneCold = plan(garage("1car", "tight", COLD_STATION));
  const mildFit = (portableOut / oneMild.heating.qSize) * 100;
  const coldFit = (portableOut / oneCold.heating.qSize) * 100;
  const mildRec = oneMild.recommendations.find((r) => r.classId === "e_port_1500");
  const coldRec = oneCold.recommendations.find((r) => r.classId === "e_port_1500");
  const pick1 = mildRec ? productForRecommendation(mildRec.productIds, { capacityBtuh: mildRec.capacityBtuh, units: mildRec.units }) : undefined;
  // Don't-buy for pick 1: the same plug-in against an uninsulated 2-car.
  const bareTwoCar = plan(garage("2car", "leaky", COLD_STATION, { circuit: "unknown", canAddCircuit: true }));
  const bareTwoCarFit = (portableOut / bareTwoCar.heating.qSize) * 100;

  // --- Picks 2 and 3: the 5 kW class against the sealed example garage. A direct link only if one unit covers the load.
  const sealedFit = (fiveKwOut / sealed) * 100;
  const fiveKwUnitsAsBuilt = Math.ceil(asBuilt / fiveKwOut);
  const fiveKwUnitsSealed = Math.ceil(sealed / fiveKwOut);
  const pick2 = productForRecommendation(fiveKw.productIds, { capacityBtuh: sealed, units: 1 });
  const pick3 = productForRecommendation(["fuh54-5kw"], { capacityBtuh: sealed, units: 1 });
  const dr975Warning = productWarning(findProduct("dr975-7k5-shop"));
  const dieselWarning = productWarning(findProduct("diesel-heater-8kw"));

  // --- Pick 4: infrared spot heat. The product is the class's first verified listing.
  const pick4 = primaryProduct(infrared.productIds);
  const infraredFit = (infraredOut / asBuilt) * 100;

  // --- Pick 5: vented gas. The same garage as built, with natural gas listed.
  const gasPlan = plan({ ...EXAMPLE_A_INPUT, fuels: ["electric", "natural_gas"], ventingPossible: true });
  const gasFirst = gasPlan.recommendations[0]?.classId === "g_vented_unit";
  const pick5 = primaryProduct(vented.productIds);
  const buddyVerdict = verdictFor("buddy", ATTACHED_BUDDY);

  // --- Pick 6: mini-split. Output at the design temperature, relative to its 47 F rating (cold-climate curve).
  const pick6 = primaryProduct(miniSplit.productIds);
  const derate = heatPumpCapacity("cold_climate", station.h99, 1);
  const bigMiniAtDesign = heatPumpCapacity("cold_climate", station.h99, miniSplit.outputBtuh[1]);
  const bigMiniFitAsBuilt = (bigMiniAtDesign / asBuilt) * 100;

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        The best garage heater is the one sized to your garage and your circuit. Our example 2-car garage in {station.city} needs{" "}
        <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize — lib/planner/plan.ts" /> as built. Sealed, it needs{" "}
        <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter — lib/planner/roi.ts" />. A{" "}
        <Num f="cz220.watts.high" /> ceiling heater covers the sealed load on a{" "}
        <Num v={c5.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA — lib/planner/electrical.ts" />, {c5.wireNM}, 240 V circuit. Plan your
        garage first, then pick from the six cases below.
      </AnswerBlock>

      <div className="not-prose my-6">
        <ButtonLink href="/garage-heater-calculator">Plan your garage first, free →</ButtonLink>
      </div>

      <Disclosure />

      {pick2.direct && pick2.product ? (
        <QuickPick
          productId={pick2.product.id}
          page={entry.href}
          headline="For a sealed 2-car garage: a ceiling heater on its own 240 V circuit. The calculator tells you whether yours qualifies."
          compareHref="#picks"
          compareLabel="See all six picks"
        />
      ) : null}

      <h2 id="plan">Plan your garage first</h2>
      <p>
        Wattage on a box says nothing about your garage. The load does. It is the heat your garage loses on a cold design day, an outdoor
        temperature that only a few winter hours fall below. Walls, ceiling, door and air leaks set it.
      </p>
      <p>
        In our example, {joinList(fixLabels)} move the load from <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize" /> to{" "}
        <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />. The envelope grade goes from{" "}
        <Num v={fix.gradeBefore} ev="C" src="plan(EXAMPLE_A_INPUT).fixFirst.gradeBefore" /> to{" "}
        <Num v={fix.gradeAfter} ev="C" src="plan(EXAMPLE_A_INPUT).fixFirst.gradeAfter" />. Counted in 5 kW units, the answer drops from{" "}
        <Num v={fiveKwUnitsAsBuilt} ev="C" src="ceil(qSize / HEATER_CLASSES.e_240_5k.outputBtuh[1])" /> to{" "}
        <Num v={fiveKwUnitsSealed} ev="C" src="ceil(fixFirst.qAfter / HEATER_CLASSES.e_240_5k.outputBtuh[1])" />.
      </p>
      <p className="text-xs text-(--color-fg-2)">{SAVINGS_VARY}</p>
      <p>
        Not sure of your insulation? The calculator gives a range until you tell it. The <Link href="/garage-heater-size">size chart</Link> shows tight and
        leaky garages in four sizes, and <Link href="/how-to-insulate-a-garage">the insulation guide</Link> puts the fixes in payback order.
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
                  Small, tight 1-car, 120 V outlet
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={oneMild.heating.qSize} src="plan(1-car, tight, mild station, sessions).heating.qSize" />
                <span className="block text-xs text-(--color-fg-2)">
                  {oneMild.station.city}, {oneMild.station.st}
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
              <td className="py-3 pr-3">{fiveKw.label}</td>
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
              <td className="py-3 pr-3 font-mono">Same 5 kW class</td>
              <td className="py-3 pr-3">Fahrenheat FUH54 or Comfort Zone CZ220</td>
              <td className="py-3 font-mono">
                <Num f="fuh54.clearance_floor_ft" /> headroom
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a className="underline underline-offset-4" href="#pick-4">
                  Spot heat, door open
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
                  Big or drafty, gas piped in
                </a>
              </td>
              <td className="py-3 pr-3 font-mono">
                <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize" />
                <span className="block text-xs text-(--color-fg-2)">example as built</span>
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
              <td className="py-3 font-mono">
                <Num v={miniCircuit.amps} ev="S" src="HEATER_CLASSES.hp_12_24k_230.circuit — lib/planner/catalog.ts" format={() => `${miniCircuit.volts} V / ${miniCircuit.amps} A, HVAC installer`} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="pick-1">1. Small, tight 1-car garage on a 120 V outlet</h3>
      <p>
        This one is right when you work in the garage a few hours at a time and you are there the whole time. It also needs an insulated, sealed garage: R-13
        walls, an R-30 ceiling and an insulated door kit. The <Link href="/garage-heater-size">size chart</Link> calls that “tight.” In {oneMild.station.city},{" "}
        {oneMild.station.st}, a detached 1-car garage like that needs{" "}
        <Load q={oneMild.heating.qSize} src="plan(1-car, tight, mild station, sessions).heating.qSize" /> on its design day,{" "}
        <Num v={oneMild.heating.tOutDesign} unit="°F" round={1} ev="C" src="plan().heating.tOutDesign — station h99 plus the session offset" /> outside. A{" "}
        <Num f="cz798.watts" /> plug-in heater gives up to{" "}
        <Load q={portableOut} src="HEATER_CLASSES.e_port_1500.outputBtuh[1] — lib/planner/catalog.ts" />, which is{" "}
        <Pct v={mildFit} src="e_port_1500 output / plan(1-car, tight, mild station).heating.qSize" /> of the load.
      </p>
      <FitBar pct={mildFit} />
      <p>
        Move the same garage to {oneCold.station.city}, {oneCold.station.st} and the load is{" "}
        <Load q={oneCold.heating.qSize} src="plan(1-car, tight, cold station, sessions).heating.qSize" />. One plug-in covers{" "}
        <Pct v={coldFit} src="e_port_1500 output / plan(1-car, tight, cold station).heating.qSize" /> of that
        {coldFit < 100 && coldRec ? (
          <>
            , so the planner asks for{" "}
            <Num v={coldRec.units} ev="C" src="plan(1-car, tight, cold station).recommendations[e_port_1500].units" /> of them, or a 240 V unit
          </>
        ) : null}
        . Enter your ZIP code in the calculator before you buy.
      </p>
      <FitBar pct={coldFit} />
      <p>
        Plug it straight into a {c1500.volts} V, <Num v={c1500.breakerA} unit="A" ev="C" src="circuitFor(1500, 120, 120).breakerA" /> circuit with nothing else on
        it. Most garages already have one (NEC 2023 §210.11(C)(4): <Num f="code.nec.210_11_c_4" />).
      </p>
      {pick1?.direct && pick1.product ? (
        <QuickPick
          productId={pick1.product.id}
          page={entry.href}
          headline="A fan-forced milkhouse heater for a small, tight garage in a mild climate, used while you are there."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a 1,500 W heater for an uninsulated 2-car garage.</strong> With bare walls, a bare ceiling and a steel door, a detached 2-car in{" "}
        {bareTwoCar.station.city} needs{" "}
        <Load q={bareTwoCar.heating.qSize} src="plan(2-car, leaky, cold station, sessions).heating.qSize" /> even for daytime sessions. A plug-in covers{" "}
        <Pct v={bareTwoCarFit} src="e_port_1500 output / plan(2-car, leaky, cold station).heating.qSize" /> of it. Seal the garage first, or move up to a
        hardwired unit.
      </p>
      <FitBar pct={bareTwoCarFit} />
      <WhyNot rows={whyNotPortable} />

      <h3 id="pick-2">2. 2-car garage with a 240 V circuit: the 5 kW class</h3>
      <p>
        This one is right when the sealed load is under <Num f="cz220.btuh.high" /> (<Num f="cz220.watts.high" />) and you can run a 240 V circuit. Our sealed example needs <Load q={sealed} src="plan(EXAMPLE_A_INPUT).fixFirst.qAfter" />, so one unit covers{" "}
        <Pct v={sealedFit} src="cz220.btuh.high / plan(EXAMPLE_A_INPUT).fixFirst.qAfter" /> of it.
      </p>
      <p>
        It needs a <Num v={c5.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA" /> breaker and {c5.wireNM} copper. A fixed heater is a
        continuous load, so the breaker is sized at 125% of the running current (NEC 2023 §424.4(B): <Num f="code.nec.424_4_b" />).
      </p>
      {pick2.direct && pick2.product ? (
        <QuickPick
          productId={pick2.product.id}
          page={entry.href}
          headline="A ceiling heater on its own 240 V circuit. One unit covers the sealed example garage with room to spare."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a 4 kW 240 V heater to fit a 20 A circuit.</strong> It draws{" "}
        <Num v={c4.amps} unit="A" ev="C" src="circuitFor(4000, 240, 240).amps" />, but the breaker is sized at 125% of that:{" "}
        <Num v={c4.minAmps} unit="A" ev="C" src="circuitFor(4000, 240, 240).minAmps" />. The next standard size is{" "}
        <Num v={c4.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240).breakerA" />, so it needs its own circuit too. The{" "}
        <Link href="/240v-garage-heater">240 V page</Link> lists every size.
      </p>

      <h3 id="pick-3">3. Ceiling mount, to keep the floor and walls clear</h3>
      <p>
        The CZ220 manual asks for <Num f="cz220.clearance_floor_ft" /> of headroom below the heater, <Num f="cz220.clearance_wall_in" /> from any wall, and
        lists a maximum ceiling height of <Num f="cz220.max_ceiling_ft" />. The FUH54 manual asks for <Num f="fuh54.clearance_floor_ft" /> of headroom.
      </p>
      <p>
        The FUH54 is the other verified unit. It is sold for ceiling or wall mounting, so it suits a ceiling above the CZ220 limit or a high wall mount. We have
        no maximum ceiling height on file for it, so read the mounting section of its manual before you order. The{" "}
        <Link href="/ceiling-mount-garage-heater">ceiling-mount page</Link> has both clearance lists.
      </p>
      {pick3.direct && pick3.product ? (
        <QuickPick
          productId={pick3.product.id}
          page={entry.href}
          headline="The other verified 5 kW ceiling heater: ceiling or wall mount, on its own 240 V circuit."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a 7.5 kW or 10 kW Dr. Infrared shop heater for a home garage without asking the maker.</strong> The DR-975 and DR-910F manuals
        carry a residential warning. {dr975Warning}
      </p>

      <h3 id="pick-4">4. Spot heat with the garage door open: infrared</h3>
      <p>
        This one is right when you work in one bay with the door up. Forced-air heat leaves with the air. In our example the garage door is{" "}
        <Num v={doorsPct} unit="%" round={1} ev="C" src="plan(EXAMPLE_A_INPUT).heating.items[garage_doors].pct" /> of the design load even when it is shut.
        Radiant heat lands on you and the floor first, so judge a spot heater by where it points, not by the garage&apos;s load.
      </p>
      <p>
        It plugs into a 120 V outlet and mounts on a wall or ceiling. Its manual sets a minimum height of <Num f="dr238.mount_height_in" /> to the heater&apos;s
        lowest part, so measure your ceiling first. The <Link href="/infrared-garage-heater">infrared page</Link> explains the comfort trade-off.
      </p>
      {pick4 ? (
        <QuickPick
          productId={pick4.id}
          page={entry.href}
          headline="A 120 V infrared heater for one bay or a workbench. It heats what it points at, so the open door matters less."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy an infrared panel to warm the air in a closed garage.</strong> Its output tops out near{" "}
        <Load q={infraredOut} src="HEATER_CLASSES.e_ir_wall_1500.outputBtuh[1] — lib/planner/catalog.ts" />, only{" "}
        <Pct v={infraredFit} src="e_ir_wall_1500 output / plan(EXAMPLE_A_INPUT).heating.qSize" /> of our example as built. It does nothing for the air your tools and
        paint sit in.
      </p>
      <FitBar pct={infraredFit} />

      <h3 id="pick-5">5. Big or drafty garage with natural gas available: a vented unit heater</h3>
      <p>
        This one is right when the load is more than one electric unit carries and gas is already piped in. As built, our example needs{" "}
        <Load q={asBuilt} src="plan(EXAMPLE_A_INPUT).heating.qSize" />. The electric answer is{" "}
        <Num v={fiveKwUnitsAsBuilt} ev="C" src="ceil(qSize / HEATER_CLASSES.e_240_5k.outputBtuh[1])" /> of the 5 kW units, each on its own circuit, or one 10 kW
        unit on a <Num v={c10.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240).breakerA" /> breaker and {c10.wireNM} NM cable.
        {gasFirst ? " With natural gas listed, the planner ranks a vented unit heater first." : ""}
      </p>
      <p>
        Vented units in this class run from <Load q={vented.outputBtuh[0]} src="HEATER_CLASSES.g_vented_unit.outputBtuh[0] — lib/planner/catalog.ts" /> to{" "}
        <Load q={vented.outputBtuh[1]} src="HEATER_CLASSES.g_vented_unit.outputBtuh[1]" />, at about{" "}
        <Num f="fuel.vented_unit.eta" format={(v) => `${Math.round(Number(v) * 100)}%`} /> efficiency. A flue sends the exhaust outdoors. A licensed gas fitter
        installs it, and a permit is required. The manual&apos;s minimum mounting height, in the box below, rules out a low ceiling. Fuel costs are on the{" "}
        <Link href="/electric-vs-propane-garage-heater">fuel comparison</Link>.
      </p>
      {pick5 ? (
        <QuickPick
          productId={pick5.id}
          page={entry.href}
          headline="A vented unit heater for natural gas or propane. This listing is one size in the class, so match its rated output to the calculator's BTU/h."
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
        in an attached garage, and Buddy-type heaters never get a buy button on this site.
      </p>
      <VerdictStamp verdict={buddyVerdict} />
      <p>
        Torpedo heaters are always a NO-GO, and kerosene heaters are a NO-GO in an attached garage. Run your own situation through{" "}
        <Link href="/can-i-run-it">Can I run it?</Link>, or read the <Link href="/propane-heater-for-garage">propane page</Link>.
      </p>

      <h3 id="pick-6">6. Heat and cooling all year: a mini-split</h3>
      <p>
        This one is right when the garage is sealed, you want cooling too, and you can run a{" "}
        <Num v={miniCircuit.amps} unit="A" ev="S" src="HEATER_CLASSES.hp_12_24k_230.circuit — lib/planner/catalog.ts" />, {miniCircuit.volts} V circuit. A
        mini-split loses output as it gets cold. At {station.city}&apos;s <Num v={station.h99} unit="°F" ev="S" src="plan(EXAMPLE_A_INPUT).station.h99" /> design
        temperature, a cold-climate unit gives about{" "}
        <Pct v={derate * 100} src="heatPumpCapacity('cold_climate', station.h99, 1) — lib/planner/seasonal.ts" /> of its rated heat. Size it by that number,
        not the nameplate.
      </p>
      <p>
        It also cools in summer. We have not modeled cooling load yet, so this page quotes no cooling size. A licensed HVAC contractor does the refrigerant work.
        The <Link href="/heat-pump-mini-split-for-garage">mini-split page</Link> compares five-year running cost against a resistance heater.
      </p>
      {pick6 ? (
        <QuickPick
          productId={pick6.id}
          page={entry.href}
          headline="A 230 V mini-split that heats and cools. This listing is one size in the class, so match its heat output at your low temperature to the calculator's BTU/h."
        />
      ) : null}
      <p>
        <strong>Don&apos;t buy a mini-split for a garage you have not sealed.</strong> The largest unit in the class, rated{" "}
        <Load q={miniSplit.outputBtuh[1]} src="HEATER_CLASSES.hp_12_24k_230.outputBtuh[1] — lib/planner/catalog.ts" />, gives about{" "}
        <Load q={bigMiniAtDesign} src="heatPumpCapacity('cold_climate', station.h99, rated) — lib/planner/seasonal.ts" /> at that design temperature. That is{" "}
        <Pct v={bigMiniFitAsBuilt} src="heatPumpCapacity(...) / plan(EXAMPLE_A_INPUT).heating.qSize" /> of our example as built.
      </p>
      <FitBar pct={bigMiniFitAsBuilt} />

      <h2>What is not on this list</h2>
      <p>
        Diesel air heaters have no buy button here. Our safety note for them: {dieselWarning} Read the <Link href="/diesel-heater-for-garage">diesel page</Link> before you decide.
        Open-flame torpedo heaters are out for any enclosed garage.
      </p>
      <WhyNot rows={whyNotTorpedo} />

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          A plug-in heater needs GFCI protection on its outlet (NEC 2023 §210.8(A)(2): <Num f="code.nec.210_8_a" />). A fixed 240 V heater is a continuous load
          (NEC 2023 §424.4(B): <Num f="code.nec.424_4_b" />). A gas heater needs a licensed gas fitter. A house with an attached garage needs a CO alarm
          (IRC 2021 R315: <Num f="code.irc.r315" />). Your electrician and your local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>

      <h2>Next step</h2>
      <p>
        <Link href="/garage-heater-calculator">Run your own garage through the calculator →</Link> for a load, a heater class and a breaker sized to your
        dimensions. Then read the page for your class: <Link href="/240v-garage-heater">240 V</Link>, <Link href="/portable-garage-heater">portable</Link>,{" "}
        <Link href="/infrared-garage-heater">infrared</Link>, or <Link href="/garage-heaters">every fuel at your state&apos;s prices</Link>.
      </p>
    </ReportPage>
  );
}
