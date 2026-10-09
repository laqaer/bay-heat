import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { Disclosure } from "@/components/commerce/Disclosure";
import { QuickPick } from "@/components/commerce/QuickPick";
import { Callout } from "@/components/ui/Callout";
import { BuyButton, BuyTextLink, ButtonLink } from "@/components/ui/ButtonLink";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { VerdictStamp } from "@/components/safety/VerdictStamp";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import type { Product } from "@/lib/commerce/types";
import { HEATER_CLASSES } from "@/lib/planner/catalog";
import { circuitFor, circuitSpecForNameplate } from "@/lib/planner/electrical";
import { costPerMMBtuDelivered, costsForSeasonalLoad, ETA, HEAT_CONTENT } from "@/lib/planner/fuels";
import { PRICES, US_AVG_PRICES } from "@/lib/planner/prices";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import type { HeaterClassId } from "@/lib/planner/types";
import { verdictFor } from "@/lib/safety/verdict";
import type { Condition, Situation, Verdict } from "@/lib/safety/types";
import type { Ev } from "@/lib/types/evidence";
import { btuh, kw } from "@/lib/format";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/shop-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = [
  "nec-2023",
  "ifgc-2021",
  "irc-2021",
  "cz220-manual",
  "fuh54-manual",
  "dr975-manual",
  "dr910f-manual",
  "big-maxx-manual",
  "vevor-diesel-manual",
  "kidde-c3010-datasheet",
  "eia-electric-power-monthly",
  "eia-ng-annual",
  "eia-propane-weekly",
  "eia-diesel-weekly",
];

// The shop every verdict below is asked about: detached, attended, listed heater, nothing flammable stored,
// exhaust outdoors where it applies. Every verdict is verdictFor() called live (lib/safety/verdict.ts), not retyped.
const SHOP: Situation = {
  attached: false,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  ulListed: "yes",
  exhaustOutdoors: true,
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
};

// Units always paired (BLUEPRINT.md §5.1): "17,100 BTU/h (5.0 kW)", BTU/h to the nearest 100, kW to 0.1.
const pair = (v: number | string) => `${btuh(Number(v))} BTU/h (${kw(Number(v) / HEAT_CONTENT.btuPerKwh)} kW)`;

function Output({ v, src, ev = "S" }: { v: number; src: string; ev?: Ev }) {
  return <Num v={v} ev={ev} src={src} format={pair} />;
}

// One chip for a "low to high" class range, with the units paired on both ends.
function OutputRange({ lo, hi, src, ev = "S" }: { lo: number; hi: number; src: string; ev?: Ev }) {
  const text = () => `${btuh(lo)} to ${btuh(hi)} BTU/h (${kw(lo / HEAT_CONTENT.btuPerKwh)} to ${kw(hi / HEAT_CONTENT.btuPerKwh)} kW)`;
  return <Num v={hi} ev={ev} src={src} format={text} />;
}

const STAMP_STYLE: Record<Verdict["verdict"], string> = {
  GO: "bg-(--color-ember) text-black",
  GO_IF: "border-2 border-(--color-fg) text-(--color-fg)",
  NO_GO: "bg-(--color-alarm) text-(--alarm-ink)",
};

function Stamp({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] ${STAMP_STYLE[verdict.verdict]}`}>
      {verdict.stamp}
    </span>
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

const classOutput = (id: HeaterClassId) => HEATER_CLASSES[id].outputBtuh;
const classSrc = (id: HeaterClassId) => `HEATER_CLASSES.${id}.outputBtuh — lib/planner/catalog.ts`;
// The class's nameplate wattage, recovered from its BTU/h output (W = BTU/h / 3.412), so no wattage is typed by hand.
const wattsOf = (id: HeaterClassId) => Math.round(classOutput(id)[1] / (HEAT_CONTENT.btuPerKwh / 1000));

// A buy card: the product's own manual warning sits above its button, and the router picks the tagged link.
function ProductCard({ eyebrow, product, note, extra }: { eyebrow: string; product: Product; note: string; extra?: Product[] }) {
  const link = route(product, "site", entry.href)[0];
  const lines = [...new Set([product, ...(extra ?? [])].flatMap((p) => (p.safetyLine ? [p.safetyLine.text] : [])))];
  return (
    <div className="border border-(--color-line) p-4">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">{eyebrow}</p>
      <p className="mt-1 text-lg font-bold text-(--color-fg)">{product.name}</p>
      <p className="mt-2 text-sm text-(--color-fg-2)">{note}</p>
      {lines.map((text) => (
        <p key={text} className="mt-2 text-xs text-(--color-alarm)">
          {text}
        </p>
      ))}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <BuyButton href={link.href}>{link.label}</BuyButton>
        {(extra ?? []).map((p) => (
          <BuyTextLink key={p.id} href={route(p, "site", entry.href)[0].href}>
            or the {p.name.split(" ").slice(0, 2).join(" ")} ↗
          </BuyTextLink>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {product.priceClass}</p>
    </div>
  );
}

export default function Page() {
  const example = plan(EXAMPLE_A_INPUT);

  const e5k = wattsOf("e_240_5k");
  const e7k5 = wattsOf("e_240_7k5");
  const e10k = wattsOf("e_240_10k");
  const c5k = circuitFor(e5k, 240, 240);
  const c7k5 = circuitFor(e7k5, 240, 240);
  const c10k = circuitFor(e10k, 240, 240);
  const fanCircuit = circuitSpecForNameplate(HEATER_CLASSES.g_vented_unit.circuit!);

  const electricVerdict = verdictFor("e240", { ...SHOP, circuit: "240V30A", heaterKw: e5k / 1000 });
  const electricFlammables = verdictFor("e240", { ...SHOP, circuit: "240V30A", heaterKw: e5k / 1000, flammablesStored: "yes" });
  const gasVerdict = verdictFor("vented_gas", SHOP);
  const gasCylinder = verdictFor("vented_gas", { ...SHOP, cylinder: "20lb" });
  const dieselDetached = verdictFor("diesel", SHOP);
  const dieselAttached = verdictFor("diesel", { ...SHOP, attached: true });
  const torpedoVerdict = verdictFor("torpedo", SHOP);
  const flammablesRule = electricFlammables.conditions[electricFlammables.conditions.length - 1];
  const coRule = gasVerdict.conditions[gasVerdict.conditions.length - 1];
  const kw5 = kw(e5k / 1000);
  const kw7k5 = kw(e7k5 / 1000);

  // Same heat from each fuel: the planner's own cost rows, run at a 5 kW electric heater's output, Illinois prices.
  const prices = PRICES["IL"] ?? US_AVG_PRICES;
  const refBtuh = classOutput("e_240_5k")[1];
  const costRows = costsForSeasonalLoad(0, refBtuh, 1, prices);
  const costOf = (system: string) => costRows.find((r) => r.system === system)!;
  const elec = costOf("electric_resistance");
  const gas = costOf("ng_vented_80");
  const propane = costOf("propane_bulk_80");
  const diesel = costOf("diesel_78");
  // Unrounded, from the same formula costsForSeasonalLoad() uses, so the ratio isn't skewed by the cents-rounded hourly cost.
  const electricToGas =
    costPerMMBtuDelivered(prices.elecPerKwh, HEAT_CONTENT.btuPerKwh, ETA.electricResistance) /
    costPerMMBtuDelivered(prices.ngPerTherm, HEAT_CONTENT.ngBtuPerTherm, ETA.ventedGas80);

  const cz220 = findProduct("cz220-5kw-ceiling")!;
  const fuh54 = findProduct("fuh54-5kw")!;
  const dr975 = findProduct("dr975-7k5-shop")!;
  const dr910f = findProduct("e-240-10k-generic")!;
  const bigMaxx = findProduct("gas-unit-heater-big-maxx-50")!;
  const hotDawg = findProduct("gas-unit-heater-hot-dawg-45")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A <Output v={classOutput("e_240_5k")[1]} src={classSrc("e_240_5k")} /> 240 V electric shop heater needs a{" "}
        <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA — lib/planner/electrical.ts" /> breaker and{" "}
        <Num v={c5k.wireNM} ev="C" src="circuitFor(5000, 240, 240).wireNM — lib/planner/electrical.ts" /> copper wire. A vented gas unit
        heater starts at <Output v={classOutput("g_vented_unit")[0]} src={classSrc("g_vented_unit")} /> and needs a licensed gas fitter and
        a flue to the outdoors. A diesel air heater suits a detached shop only. BayHeat does not recommend a torpedo heater in a closed
        shop.
      </AnswerBlock>
      <p className="text-sm">
        <a href="#buy">Jump to the heaters ↓</a>
      </p>

      <p>
        Shop heater, workshop heater, garage unit heater: the names change, but only four types are sold. Each asks something
        different of your building. The best shop heater is the one your building can feed: a circuit, a gas line or an outdoor
        exhaust.
      </p>
      <p>
        Size it before you shop. BayHeat&apos;s example 24×24 ft garage in Chicago needs{" "}
        <Output v={example.heating.qSize} src="plan(EXAMPLE_A_INPUT).heating.qSize — lib/planner/plan.ts" ev="C" /> to hold{" "}
        <Num v={EXAMPLE_A_INPUT.targetTemp} unit="°F" ev="S" src="EXAMPLE_A_INPUT.targetTemp — lib/planner/fixtures.ts" /> on the coldest
        design day. Your shop will differ with its insulation, doors and climate. Run the{" "}
        <Link href="/garage-heater-calculator">garage heater calculator</Link> first, then match that BTU/h to a type below.
      </p>

      <h2 id="types">The four types, side by side</h2>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Heat output</th>
              <th className="py-2 pr-3 font-normal">What your building must supply</th>
              <th className="py-2 font-normal">BayHeat verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#electric">240 V electric unit heater</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("e_240_5k")[0]} hi={classOutput("e_240_10k")[1]} src={`${classSrc("e_240_5k")}, ${classSrc("e_240_10k")}`} />
              </td>
              <td className="py-3 pr-3">
                A dedicated 240 V circuit with a{" "}
                <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA" /> to{" "}
                <Num v={c10k.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240).breakerA" /> breaker. No flue, no fuel.
              </td>
              <td className="py-3">
                <Stamp verdict={electricVerdict} />
                <span className="mt-1 block text-xs text-(--color-fg-2)">When the breaker and wire match the table below.</span>
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#gas">Vented natural-gas or propane unit heater</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("g_vented_unit")[0]} hi={classOutput("g_vented_unit")[1]} src={classSrc("g_vented_unit")} />
              </td>
              <td className="py-3 pr-3">
                A natural gas line or bulk propane tank, a flue to the outdoors, and a licensed gas fitter.
              </td>
              <td className="py-3">
                <Stamp verdict={gasVerdict} />
                <span className="mt-1 block text-xs text-(--color-fg-2)">Licensed install, burner height, CO alarm.</span>
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#diesel">Diesel air heater</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("diesel_air")[0]} hi={classOutput("diesel_air")[1]} src={classSrc("diesel_air")} />
              </td>
              <td className="py-3 pr-3">Exhaust and intake routed outdoors, in a detached building.</td>
              <td className="py-3">
                <Stamp verdict={dieselDetached} />
                <span className="mt-1 block text-xs text-(--color-fg-2)">
                  Detached only. Attached: <Stamp verdict={dieselAttached} />
                </span>
              </td>
            </tr>
            <tr className="align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#torpedo">Torpedo (open-flame forced-air)</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("torpedo")[0]} hi={classOutput("torpedo")[1]} src={classSrc("torpedo")} />
              </td>
              <td className="py-3 pr-3">A flue, which it does not have: all of its exhaust stays in the room.</td>
              <td className="py-3">
                <Stamp verdict={torpedoVerdict} />
                <span className="mt-1 block text-xs text-(--color-fg-2)">Any closed shop or garage.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">
        Verdicts assume a detached shop, an attended heater, a listed unit and nothing flammable stored. {SAFETY_SCOPE}
      </p>

      <SafetyCallout>
        <p className="font-medium text-(--color-fg)">Check what the shop stores before you pick a type.</p>
        <p className="mt-2">
          The electric makers&apos; manuals say not where gasoline, paint or flammable liquids are used or stored. The Big Maxx gas
          manual adds solvents, paint thinner and dust. {flammablesRule.text} If your shop holds finishes or fuel cans, move them
          out first, or heat the room another way. Run your own case through{" "}
          <Link href="/can-i-run-it">Can I run it?</Link>
        </p>
      </SafetyCallout>

      <h2 id="electric">240 V electric unit heater: it needs a circuit, nothing else</h2>
      <p>
        An electric unit heater has no flame, no flue and no fuel line. An electrician wires it to its own 240 V circuit. NEC 2023
        §424.4(B) is the rule behind every row below: <Num f="code.nec.424_4_b" />.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Heater</th>
              <th className="py-2 pr-3 font-normal">Heat output</th>
              <th className="py-2 pr-3 font-normal">Running current</th>
              <th className="py-2 pr-3 font-normal">Breaker</th>
              <th className="py-2 font-normal">Wire (NM, copper)</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["e_240_5k", e5k, c5k],
                ["e_240_7k5", e7k5, c7k5],
                ["e_240_10k", e10k, c10k],
              ] as const
            ).map(([id, watts, c], i) => (
              <tr key={id} className={i < 2 ? "border-b border-(--color-line)/50" : undefined}>
                <td className="py-3 pr-3 text-(--color-fg)">240 V, {kw(watts / 1000)} kW</td>
                <td className="py-3 pr-3 font-mono">
                  <Output v={classOutput(id)[1]} src={classSrc(id)} />
                </td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={c.amps} unit="A" ev="C" src={`circuitFor(${watts}, 240, 240).amps`} />
                </td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={c.breakerA} unit="A" ev="C" src={`circuitFor(${watts}, 240, 240).breakerA`} />
                </td>
                <td className="py-3 font-mono">
                  <Num v={c.wireNM} ev="C" src={`circuitFor(${watts}, 240, 240).wireNM`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Check the panel too. <Num f="circuit.load_calc_threshold" /> (NEC 2023 §220.83). Ask your electrician before you buy, not
        after.
      </p>
      <p>
        Check the supply voltage. Your shop may be fed 208 V instead of 240 V. Then a {e5k.toLocaleString("en-US")} W 240 V heater, like
        the Fahrenheat FUH54, draws only about{" "}
        <Num
          f="fuh54.watts_208v"
          format={(v) => `${Number(v).toLocaleString("en-US")} W (${btuh((Number(v) * HEAT_CONTENT.btuPerKwh) / 1000)} BTU/h)`}
        />
        . That is less than the <Output v={classOutput("e_240_5k")[1]} src={classSrc("e_240_5k")} /> it makes on 240 V.
      </p>
      <p>
        These figures also assume single-phase power. A three-phase unit heater needs different math, so have an electrician confirm
        your supply before you order.
      </p>

      <h3>Don&apos;t buy a plug-in heater as your shop heater</h3>
      <p>
        A <Num f="cz798.watts" /> plug-in heater draws <Num f="circuit.1500w120v.amps" /> and puts out at most{" "}
        <Output v={classOutput("e_port_1500")[1]} src={classSrc("e_port_1500")} />. That warms one workbench, not a room. NEC 2023
        §210.23(A)(1) sets the limit for a plug-in appliance. <Num f="code.nec.210_23_a_1" />. The{" "}
        <Link href="/portable-garage-heater">portable heater page</Link> shows what a garage outlet can run.
      </p>

      <h2 id="gas">Vented natural-gas or propane unit heater: it needs a gas line and a flue</h2>
      <p>
        A vented unit heater burns gas inside the unit and sends the exhaust out through a flue to the outdoors. One wall or ceiling
        mount can heat a whole shop. It asks three things of the building: fuel, a flue, and power for the fan.
      </p>
      <ul>
        <li>
          <strong>Fuel.</strong> {gasCylinder.conditions[0].text}
        </li>
        <li>
          <strong>Flue.</strong> The exhaust must leave through the flue the maker&apos;s manual specifies. A licensed gas fitter sets
          the route and pulls the permit.
        </li>
        <li>
          <strong>Power.</strong> Plan on a 120 V circuit for the fan and controls. BayHeat&apos;s class figure is a{" "}
          <Num v={fanCircuit.breakerA} unit="A" ev="E" src="circuitSpecForNameplate(HEATER_CLASSES.g_vented_unit.circuit) — lib/planner/electrical.ts" />{" "}
          breaker. The maker&apos;s manual sets the exact size.
        </li>
      </ul>
      <p>What BayHeat&apos;s verdict tool requires for a garage-type shop:</p>
      <ConditionList conditions={gasVerdict.conditions} />
      <p className="text-sm text-(--color-fg-2)">
        A shop in a separate commercial building may fall under other rules. Your gas fitter and local code office decide.
      </p>
      <p>
        Dust and solvent vapor change the pick. A woodshop or a finishing room puts fuel into the air. A separated-combustion unit
        draws its combustion air from outside the room. BayHeat points a dusty or solvent shop to that design, such as the Modine Hot
        Dawg HDS below.
      </p>
      <Callout variant="fix">
        Don&apos;t buy the Big Maxx for a dusty woodshop. The safety line on file for it says never where gasoline, solvents, paint
        thinner or dust are present. It suits a clean shop or garage.
      </Callout>
      <p>
        Gas cylinders alone don&apos;t count as a fuel supply here. See the <Link href="/propane-heater-for-garage">propane page</Link>{" "}
        for vented propane and why a Buddy-type portable heater is a different tool.
      </p>

      <h2 id="diesel">Diesel air heater: for a detached shop only</h2>
      <p>
        A diesel air heater is a small parking-heater-style unit. Its output runs from{" "}
        <OutputRange lo={classOutput("diesel_air")[0]} hi={classOutput("diesel_air")[1]} src={classSrc("diesel_air")} />, so even the top
        end only matches a {kw5} kW electric heater. It carries no UL or CSA listing for building heat.
      </p>
      <p>Detached shop, exhaust and intake outdoors: {dieselDetached.stamp}. Every one of these has to hold:</p>
      <ConditionList conditions={dieselDetached.conditions} />
      <p>
        Attached to a house: {dieselAttached.stamp}. {dieselAttached.reasons[0]}
      </p>
      <p>
        The <Link href="/diesel-heater-for-garage">diesel heater page</Link> has the cost per hour against electric and the full
        exhaust rule.
      </p>

      <h2 id="torpedo">Torpedo heater: don&apos;t buy one for a closed shop</h2>
      <p>
        A torpedo is a forced-air heater with an open flame. It burns cylinder propane with no flue, at up to{" "}
        <Output v={classOutput("torpedo")[1]} src={classSrc("torpedo")} />. It is a construction heater. All of its exhaust stays in the room.
      </p>
      <VerdictStamp verdict={torpedoVerdict} />
      <p>
        In a closed shop the exhaust has nowhere to go. The three types above are the ones BayHeat points you to. Check any heater
        with{" "}
        <Link href="/can-i-run-it">Can I run it?</Link>
      </p>

      <h2 id="cost">What each type costs to run</h2>
      <p>
        This is the same heat from each fuel: <Output v={refBtuh} src={classSrc("e_240_5k")} /> for one hour, the full output of a {kw5} kW
        electric heater. Prices are Illinois&apos; own ({prices.asOf.elec} electricity, {prices.asOf.ng} natural gas,{" "}
        {prices.asOf.propane} propane, {prices.asOf.diesel} diesel). The{" "}
        <Link href="/garage-heater-calculator">calculator</Link> re-runs it at your state&apos;s prices.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Fuel price</th>
              <th className="py-2 font-normal">Per hour, same heat</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["240 V electric unit heater", elec],
                ["Vented natural-gas unit heater", gas],
                ["Vented propane unit heater (bulk tank)", propane],
                ["Diesel air heater", diesel],
              ] as const
            ).map(([label, row], i) => (
              <tr key={label} className={i < 3 ? "border-b border-(--color-line)/50" : undefined}>
                <td className="py-3 pr-3 text-(--color-fg)">{label}</td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  {row.unitPrice.toFixed(row.unit === "$/kWh" ? 4 : 3)} {row.unit}
                </td>
                <td className="py-3 font-mono whitespace-nowrap">
                  <Cost amount={row.perHour} per="hr" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        At these prices, electric heat costs{" "}
        <Num
          v={electricToGas}
          ev="C"
          src="costPerMMBtuDelivered() electric / natural gas, IL prices — lib/planner/fuels.ts"
          format={(v) => `about ${Math.round(Number(v))} times`}
        />{" "}
        what natural gas does for the same heat. That gap shrinks where electricity is cheap or gas is dear. A torpedo is not priced,
        because BayHeat does not recommend one. Install cost is not included: get quotes for the circuit, or for the gas line and
        flue.
      </p>

      <h2 id="buy">Buy: by the circuit and the fuel you have</h2>
      <p>
        Price is a range class, never a live number. Check the real price on the retailer&apos;s page before you buy.
      </p>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <ProductCard
          eyebrow={`240 V · ${kw5} kW · ${c5k.breakerA} A`}
          product={cz220}
          note={`A ${kw5} kW ceiling heater on its own circuit. The FUH54 is the same class.`}
          extra={[fuh54]}
        />
        <ProductCard
          eyebrow={`240 V · ${kw7k5} kW · ${c7k5.breakerA} A`}
          product={dr975}
          note={`A shop-class ${kw7k5} kW heater. Read the maker's warning below before you order.`}
        />
        <ProductCard
          eyebrow={`240 V · ${kw(e10k / 1000)} kW · ${c10k.breakerA} A`}
          product={dr910f}
          note="The largest electric class here. Check the panel before you order."
        />
        <ProductCard
          eyebrow="Vented gas · clean shop"
          product={bigMaxx}
          note="Natural gas or propane, vented, connected by a licensed gas fitter."
        />
        <ProductCard
          eyebrow="Vented gas · dust or solvent vapor"
          product={hotDawg}
          note="A separated-combustion unit, the design for a shop with sawdust or solvent vapor in the air."
        />
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">Diesel air · detached shop only</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Diesel air heaters</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            The cost per hour, the exhaust rule and what to look for are on their own page.
          </p>
          <p className="mt-3">
            <Link href="/diesel-heater-for-garage">Read the diesel heater page →</Link>
          </p>
        </div>
      </div>
      <p>
        More circuit detail is on the <Link href="/240v-garage-heater">240V heater page</Link> and the{" "}
        <Link href="/electric-garage-heater">electric heater hub</Link>. Every fuel side by side is on the{" "}
        <Link href="/garage-heaters">garage heaters by fuel</Link> page.
      </p>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          Any fuel-burning heater needs CO protection. {coRule.text} The code behind the house alarm: <Num f="code.irc.r315" /> (IRC
          2021 R315). A fixed electric heater adds no CO, but it still needs the breaker and wire in the table above. Your
          electrician, gas fitter and local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
      <QuickPick
        productId="co-alarm-battery-10yr"
        page={entry.href}
        eyebrow="Safety add-on"
        headline="Put a UL 2034 CO alarm in the house, by the garage door and outside each sleeping area."
      />

      <h2>Next step</h2>
      <p>
        Pick the type your building can support, then check your own case. The calculator sizes the heat load and the circuit. The
        verdict tool checks the heater, the fuel and what is stored.
      </p>
      <div className="not-prose my-6 flex flex-wrap gap-3">
        <ButtonLink href="/garage-heater-calculator">Size your shop free →</ButtonLink>
        <ButtonLink href="/can-i-run-it" variant="secondary">
          Check my heater →
        </ButtonLink>
      </div>
    </ReportPage>
  );
}
