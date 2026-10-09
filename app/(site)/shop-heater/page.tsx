import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { IfVerified } from "@/components/evidence/IfVerified";
import { Num } from "@/components/evidence/Num";
import { Disclosure } from "@/components/commerce/Disclosure";
import { PaidLabel } from "@/components/commerce/PaidLabel";
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
import { btuh, kw, usd } from "@/lib/format";
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
  "cz798-manual",
  "fuh54-manual",
  "dr975-manual",
  "dr910f-manual",
  "big-maxx-manual",
  "hot-dawg-hds-manual",
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

function Output({ v, src, ev }: { v: number; src: string; ev: Ev }) {
  return <Num v={v} ev={ev} src={src} format={pair} />;
}

// One chip for a "low to high" range, with the units paired on both ends.
function OutputRange({ lo, hi, src, ev }: { lo: number; hi: number; src: string; ev: Ev }) {
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

// A stamp, optionally its reason and its conditions, and always the point-of-risk line directly under it
// (BLUEPRINT.md §5.3). The torpedo uses the shared <VerdictStamp>, which prints the same line itself.
function VerdictBlock({ title, verdict, reason = false, conditions = false }: { title: string; verdict: Verdict; reason?: boolean; conditions?: boolean }) {
  return (
    <div className="my-4 border-l-2 border-(--color-line) pl-4">
      <p className="font-medium text-(--color-fg)">
        <Stamp verdict={verdict} /> <span className="ml-2">{title}</span>
      </p>
      {reason ? <p className="mt-2">{verdict.reasons[0]}</p> : null}
      {conditions ? <ConditionList conditions={verdict.conditions} /> : null}
      <p className="mt-2 text-sm text-(--color-fg-2)">{SAFETY_SCOPE}</p>
    </div>
  );
}

// The point-of-risk line directly under a stamp that sits in a table cell (BLUEPRINT.md §5.3).
function ScopeLine() {
  return <span className="mt-1 block text-[11px] leading-4 text-(--color-fg-2)">{SAFETY_SCOPE}</span>;
}

const MODINE_HDS_URL = "https://www.modinehvac.com/all-products/gas-fired-unit-heaters/hot-dawg-separated-combustion-gas-fired-unit-heater-hds-hdc/";

const classOutput = (id: HeaterClassId) => HEATER_CLASSES[id].outputBtuh;
const classSrc = (id: HeaterClassId) => `HEATER_CLASSES.${id}.outputBtuh — lib/planner/catalog.ts`;
// The class's nameplate wattage, recovered from its BTU/h output (W = BTU/h / 3.412), so no wattage is typed by hand.
const wattsOf = (id: HeaterClassId) => Math.round(classOutput(id)[1] / (HEAT_CONTENT.btuPerKwh / 1000));

type CardProduct = { product: Product; shortName: string };

// A buy card: the product's own manual warning sits above its button, and the router picks the tagged link.
// data-buy-group marks the card as one purchase unit for the link audit. An internal rule id such as "(S10)" is
// hidden from the reader; nothing else in a product's line is changed.
function ProductCard({ eyebrow, main, note, extra = [] }: { eyebrow: string; main: CardProduct; note: ReactNode; extra?: CardProduct[] }) {
  const all = [main, ...extra];
  const link = route(main.product, "site", entry.href)[0];
  const lines = [...new Set(all.flatMap(({ product }) => (product.safetyLine ? [product.safetyLine.text.replace(/\s*\(S\d+\)/g, "")] : [])))];
  return (
    <div data-buy-group className="border border-(--color-line) p-4">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">{eyebrow}</p>
      <p className="mt-1 text-lg font-bold text-(--color-fg)">{main.product.name}</p>
      <p className="mt-2 text-sm text-(--color-fg-2)">{note}</p>
      {lines.map((text) => (
        <p key={text} className="mt-2 text-xs text-(--color-alarm)">
          {text}
        </p>
      ))}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <BuyButton href={link.href}>{link.label}</BuyButton>
        {extra.map(({ product, shortName }) => (
          <BuyTextLink key={product.id} href={route(product, "site", entry.href)[0].href}>
            or the {shortName} ↗
          </BuyTextLink>
        ))}
      </div>
      <PaidLabel />
      <p className="mt-2 font-mono text-xs text-(--color-fg-2)">
        Price class:{" "}
        {extra.length === 0 ? main.product.priceClass : all.map(({ product, shortName }) => `${product.priceClass} (${shortName})`).join(", ")}
      </p>
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
  const kw5 = kw(e5k / 1000);
  const kw7k5 = kw(e7k5 / 1000);

  // Asked of the engine exactly as written: 5 kW on a 240 V / 30 A circuit. The engine has no 40 A or 60 A option, so
  // the electric stamp is claimed for that one case only.
  const electricVerdict = verdictFor("e240", { ...SHOP, circuit: "240V30A", heaterKw: e5k / 1000 });
  const gasVerdict = verdictFor("vented_gas", SHOP);
  const gasCylinder = verdictFor("vented_gas", { ...SHOP, cylinder: "20lb" });
  const dieselDetached = verdictFor("diesel", SHOP);
  const dieselAttached = verdictFor("diesel", { ...SHOP, attached: true });
  const dieselUnattended = verdictFor("diesel", { ...SHOP, unattended: true });
  const torpedoVerdict = verdictFor("torpedo", SHOP);

  // Vented-gas class range is fuel INPUT (planner-engineering.md §12: "30,000-125,000 input (x0.80 output)").
  const gasIn = classOutput("g_vented_unit");
  const gasOut: [number, number] = [gasIn[0] * ETA.ventedGas80, gasIn[1] * ETA.ventedGas80];

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
  const COST_LINES = [
    { label: "240 V electric unit heater", row: elec, digits: 4, src: "PRICES.IL.elecPerKwh — EIA Electric Power Monthly (lib/planner/prices-data.ts)" },
    { label: "Vented natural-gas unit heater", row: gas, digits: 3, src: "PRICES.IL.ngPerTherm — EIA natural gas, annual (lib/planner/prices-data.ts)" },
    { label: "Vented propane unit heater (bulk tank)", row: propane, digits: 3, src: "PRICES.IL.propanePerGal — EIA weekly propane (lib/planner/prices-data.ts)" },
    { label: "Diesel air heater", row: diesel, digits: 3, src: "PRICES.IL.dieselGal — EIA weekly diesel, Midwest (PADD 2) regional average (lib/planner/prices-data.ts)" },
  ];

  const cz220 = findProduct("cz220-5kw-ceiling")!;
  const fuh54 = findProduct("fuh54-5kw")!;
  const dr975 = findProduct("dr975-7k5-shop")!;
  const dr910f = findProduct("e-240-10k-generic")!;
  const bigMaxx = findProduct("gas-unit-heater-big-maxx-50")!;
  const hotDawg = findProduct("gas-unit-heater-hot-dawg-45")!;
  const dieselUnit = findProduct("diesel-heater-8kw")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A <Num f="cz220.btuh.high" format={pair} /> 240 V electric shop heater needs a{" "}
        <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA — lib/planner/electrical.ts" /> breaker and{" "}
        <Num v={c5k.wireNM} ev="C" src="circuitFor(5000, 240, 240).wireNM — lib/planner/electrical.ts" /> copper wire. A vented gas unit
        heater starts at <Output v={gasIn[0]} src={classSrc("g_vented_unit")} ev="E" /> of fuel input. It needs a licensed gas fitter and a
        flue to the outdoors. A diesel air heater suits only a detached shop with its exhaust and intake outdoors, and only while you
        are in it. BayHeat does not recommend a torpedo heater in a closed shop.
      </AnswerBlock>
      <p className="text-sm">
        <a href="#buy">Jump to the heaters ↓</a>
      </p>

      <p>
        Shop heater, workshop heater, garage unit heater: the names change. This page compares four types. Each asks something different
        of your building. The best shop heater is the one your building can feed: a circuit, a gas line or an outdoor exhaust.
      </p>
      <p>
        Size it before you shop. BayHeat&apos;s example {EXAMPLE_A_INPUT.width}×{EXAMPLE_A_INPUT.depth} ft {EXAMPLE_A_INPUT.attached ? "attached" : "detached"} 2-car garage in
        Chicago needs <Output v={example.heating.qSize} src="plan(EXAMPLE_A_INPUT).heating.qSize — lib/planner/plan.ts" ev="C" /> to hold{" "}
        <Num v={EXAMPLE_A_INPUT.targetTemp} unit="°F" ev="E" src="EXAMPLE_A_INPUT.targetTemp — lib/planner/fixtures.ts" /> on a design
        day. Your shop will differ with its insulation, doors and climate. Run the{" "}
        <Link href="/garage-heater-calculator">garage heater calculator</Link> first, then match that BTU/h to a type below.
      </p>

      <h2 id="types">The four types, side by side</h2>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Heat, class range</th>
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
                <OutputRange lo={classOutput("e_240_5k")[0]} hi={classOutput("e_240_10k")[1]} src={`${classSrc("e_240_5k")}, ${classSrc("e_240_10k")}`} ev="C" />
              </td>
              <td className="py-3 pr-3">
                A dedicated 240 V circuit with a <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA" /> to{" "}
                <Num v={c10k.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240).breakerA" /> breaker. No flue, no fuel.
              </td>
              <td className="py-3">
                <Stamp verdict={electricVerdict} />
                <ScopeLine />
                <span className="mt-1 block text-xs text-(--color-fg-2)">
                  For {kw5} kW on a {c5k.breakerA} A circuit, with the breaker and wire in the table below. Bigger units need bigger circuits.
                </span>
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#gas">Vented natural-gas or propane unit heater</a>
              </td>
              <td className="py-3 pr-3">
                <span className="block">
                  Fuel input: <OutputRange lo={gasIn[0]} hi={gasIn[1]} src={classSrc("g_vented_unit")} ev="E" />
                </span>
                <span className="mt-1 block">
                  Heat output, at {Math.round(ETA.ventedGas80 * 100)}%:{" "}
                  <OutputRange lo={gasOut[0]} hi={gasOut[1]} src={`${classSrc("g_vented_unit")} x ETA.ventedGas80 — lib/planner/fuels.ts`} ev="C" />
                </span>
              </td>
              <td className="py-3 pr-3">A natural gas line or bulk propane tank, a flue to the outdoors, and a licensed gas fitter.</td>
              <td className="py-3">
                <Stamp verdict={gasVerdict} />
                <ScopeLine />
                <span className="mt-1 block text-xs text-(--color-fg-2)">
                  Licensed install, burner height, CO protection, and nothing flammable stored.
                </span>
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#diesel">Diesel air heater</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("diesel_air")[0]} hi={classOutput("diesel_air")[1]} src={classSrc("diesel_air")} ev="E" />
              </td>
              <td className="py-3 pr-3">Exhaust and intake routed outdoors, in a detached building, while you are in the shop.</td>
              <td className="py-3">
                <Stamp verdict={dieselDetached} />
                <ScopeLine />
                <span className="mt-1 block text-xs text-(--color-fg-2)">Detached, exhaust outdoors, and only while you are in it.</span>
                <span className="mt-1 block text-xs text-(--color-fg-2)">
                  Attached: {dieselAttached.stamp}. Left running: {dieselUnattended.stamp}. Details below.
                </span>
              </td>
            </tr>
            <tr className="align-top">
              <td className="py-3 pr-3 text-(--color-fg)">
                <a href="#torpedo">Torpedo (open-flame forced-air)</a>
              </td>
              <td className="py-3 pr-3">
                <OutputRange lo={classOutput("torpedo")[0]} hi={classOutput("torpedo")[1]} src={classSrc("torpedo")} ev="E" />
              </td>
              <td className="py-3 pr-3">A flue, which it does not have: all of its exhaust stays in the room.</td>
              <td className="py-3">
                <Stamp verdict={torpedoVerdict} />
                <ScopeLine />
                <span className="mt-1 block text-xs text-(--color-fg-2)">Any closed shop or garage.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">
        Verdicts assume a detached shop, an attended heater and nothing flammable stored, with a listed electric or gas unit.
      </p>

      <SafetyCallout>
        <p className="font-medium text-(--color-fg)">Check what the shop stores before you pick a type.</p>
        <p className="mt-2">
          The manuals on this page rule out gasoline, paint and other flammable liquids. Several also rule out dust. The CZ220 manual allows
          indoor use only, in a dry place. It must be free of gasoline, paint, flammable liquids or combustible dust or materials. The Big
          Maxx manual rules out dust as well as gasoline, solvents and paint thinner. VEVOR&apos;s diesel manual says its heater shall not be
          used in places with flammable vapor or dust.
        </p>
        <p className="mt-2">
          If your shop holds finishes or fuel cans, move them out first. Otherwise, heat the room another way. Run your own case through{" "}
          <Link href="/can-i-run-it">Can I run it?</Link>
        </p>
      </SafetyCallout>

      <h2 id="electric">240 V electric unit heater: it needs a circuit and a shop free of flammables and dust</h2>
      <p>
        An electric unit heater has no flame, no flue and no fuel line. An electrician wires it to its own 240 V circuit. The rule, in NEC
        2023 §424.4(B): <Num f="code.nec.424_4_b" />.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Heater</th>
              <th className="py-2 pr-3 font-normal">Heat output</th>
              <th className="py-2 pr-3 font-normal">Running current</th>
              <th className="py-2 pr-3 font-normal">Breaker</th>
              <th className="py-2 pr-3 font-normal">Wire, NM cable</th>
              <th className="py-2 font-normal">Wire, THHN in conduit</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["e_240_5k", e5k, c5k, "cz220.btuh.high"],
                ["e_240_7k5", e7k5, c7k5, "dr975.btuh"],
                ["e_240_10k", e10k, c10k, null],
              ] as const
            ).map(([id, watts, c, fact], i) => (
              <tr key={id} className={i < 2 ? "border-b border-(--color-line)/50" : undefined}>
                <td className="py-3 pr-3 text-(--color-fg)">240 V, {kw(watts / 1000)} kW</td>
                <td className="py-3 pr-3 font-mono">
                  {fact ? <Num f={fact} format={pair} /> : <Output v={classOutput(id)[1]} src={classSrc(id)} ev="C" />}
                </td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={c.amps} unit="A" ev="C" src={`circuitFor(${watts}, 240, 240).amps`} />
                </td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={c.breakerA} unit="A" ev="C" src={`circuitFor(${watts}, 240, 240).breakerA`} />
                </td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={c.wireNM} ev="C" src={`circuitFor(${watts}, 240, 240).wireNM`} />
                </td>
                <td className="py-3 font-mono">
                  <Num v={c.wireTHHN} ev="C" src={`circuitFor(${watts}, 240, 240).wireTHHN`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        All wire is copper. The NM column is cable in a wall, from the NEC 2023 60 °C column. It is BayHeat&apos;s conservative figure. The
        THHN column is single wires in conduit, from the 75 °C column. At {c10k.breakerA} A the two differ:{" "}
        <Num v={c10k.wireNM} ev="C" src="circuitFor(10000, 240, 240).wireNM" /> NM or{" "}
        <Num v={c10k.wireTHHN} ev="C" src="circuitFor(10000, 240, 240).wireTHHN" /> THHN.{" "}
        <IfVerified ids={["dr910f.breaker_wire"]}>
          The DR-910F manual itself calls for <Num f="dr910f.breaker_wire" />.{" "}
        </IfVerified>
        The manual for the unit you buy has the last word on wire.
      </p>
      <p>BayHeat&apos;s verdict tool, asked about one case:</p>
      <VerdictBlock title={`240 V electric, ${kw5} kW on a ${c5k.breakerA} A circuit`} verdict={electricVerdict} conditions />
      <p className="text-sm text-(--color-fg-2)">
        A hardwired heater has no plug, so your electrician applies the grounding line to its wiring. The tool covers this one case only.
        The 7.5 kW and 10 kW units need the larger circuits in the table.
      </p>
      <p>
        Check the panel too. BayHeat&apos;s rule of thumb: before you add a large 240 V circuit to a panel, ask your electrician for a load
        calculation. NEC 2023 §220.83 is one method. Do it before you buy, not after.
      </p>
      <p>
        Check the supply voltage. Your shop may be fed 208 V instead of 240 V. Then a <Num f="fuh54.watts.high" /> 240 V heater, like
        the Fahrenheat FUH54, draws only about{" "}
        <Num
          f="fuh54.watts_208v"
          format={(v) => `${Number(v).toLocaleString("en-US")} W (${btuh((Number(v) * HEAT_CONTENT.btuPerKwh) / 1000)} BTU/h)`}
        />
        . That is less than the <Num f="fuh54.btuh.high" format={pair} /> it makes on 240 V.
      </p>
      <p>
        These figures also assume single-phase power. A three-phase unit heater needs different math, so have an electrician confirm
        your supply before you order.
      </p>

      <h3>Don&apos;t buy a plug-in heater as your shop heater</h3>
      <p>
        A <Num f="cz798.watts" /> plug-in heater draws <Num f="circuit.1500w120v.amps" /> and puts out at most{" "}
        <Output v={classOutput("e_port_1500")[1]} src={classSrc("e_port_1500")} ev="C" />. That warms one workbench, not a room. NEC 2023
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
      <VerdictBlock title="Vented gas unit heater" verdict={gasVerdict} conditions />
      <p className="text-sm text-(--color-fg-2)">
        A shop in a separate commercial building may fall under other rules. Your gas fitter and local code office decide.
      </p>
      <p>
        Dust changes the pick. A separated-combustion unit, such as the Modine Hot Dawg HDS below, draws its combustion air from outside the
        room. <a href={MODINE_HDS_URL} rel="noopener noreferrer" target="_blank">Modine&apos;s HDS product page</a> says it is
        &ldquo;Designed for environments where dust, dirt, or fumes are present.&rdquo; That keeps dusty shop air out of the burner.
      </p>
      <p>
        It does not make a flammable atmosphere safe. No heater on this page is rated for a solvent or gasoline atmosphere. The Modine
        manual&apos;s DANGER line: &ldquo;Appliances must not be installed where they may be exposed to a potentially explosive or flammable
        atmosphere.&rdquo; Store solvents, finishes and fuel somewhere else, and don&apos;t run the heater while you use them.
      </p>
      <Callout variant="fix">
        Don&apos;t buy the Big Maxx for a dusty woodshop. The Big Maxx manual says never where gasoline, solvents, paint thinner or dust are
        present. It suits a clean shop or garage.
      </Callout>
      <p>
        Gas cylinders alone don&apos;t count as a fuel supply here. See the <Link href="/propane-heater-for-garage">propane page</Link>{" "}
        for vented propane and why a Buddy-type portable heater is a different tool.
      </p>

      <h2 id="diesel">Diesel air heater: detached shop only, and only while you&apos;re in it</h2>
      <p>
        A diesel air heater is a small parking-heater-style unit. Its output runs from{" "}
        <OutputRange lo={classOutput("diesel_air")[0]} hi={classOutput("diesel_air")[1]} src={classSrc("diesel_air")} ev="E" />. In
        BayHeat&apos;s estimate, even the top end only matches a {kw5} kW electric heater. Makers&apos; labels can claim more, so read the
        rated output in the manual. It carries no UL or CSA listing for building heat.
      </p>
      <SafetyCallout>
        <p>{dieselUnit.safetyLine?.text}</p>
        <p className="mt-2">The same manual says the heater shall not be used in places with flammable vapor or dust.</p>
      </SafetyCallout>
      <p>Every one of these has to hold at once, in a detached shop with the exhaust and intake outdoors:</p>
      <VerdictBlock title="Detached shop, attended" verdict={dieselDetached} conditions />
      <VerdictBlock title="Attached to a house" verdict={dieselAttached} reason />
      <VerdictBlock title="Left running while you are away or asleep" verdict={dieselUnattended} reason />
      <p>
        The <Link href="/diesel-heater-for-garage">diesel heater page</Link> has the cost per hour against electric and the full
        exhaust rule.
      </p>

      <h2 id="torpedo">Torpedo heater: don&apos;t buy one for a closed shop</h2>
      <p>
        A torpedo is a forced-air heater with an open flame. It burns propane, kerosene or diesel with no flue, at up to{" "}
        <Output v={classOutput("torpedo")[1]} src={classSrc("torpedo")} ev="E" /> in BayHeat&apos;s class range. It is a construction
        heater. All of its exhaust stays in the room.
      </p>
      <VerdictStamp verdict={torpedoVerdict} />
      <p>
        In a closed shop the exhaust has nowhere to go. BayHeat points you to a 240 V electric unit heater, a vented gas unit heater or a{" "}
        <Link href="/heat-pump-mini-split-for-garage">mini-split heat pump</Link>. Check any heater with <Link href="/can-i-run-it">Can I run it?</Link>
      </p>

      <h2 id="cost">What each type costs to run</h2>
      <p>
        The table gives the same heat from each fuel: <Num f="cz220.btuh.high" format={pair} /> for one hour. That is the
        full output of a {kw5} kW electric heater.
      </p>
      <p>
        Electricity, natural gas and propane use Illinois prices. Diesel uses the Midwest (PADD 2) regional average. The price dates are{" "}
        {prices.asOf.elec} (electricity), {prices.asOf.ng} (natural gas), {prices.asOf.propane} (propane) and {prices.asOf.diesel}{" "}
        (diesel). The <Link href="/garage-heater-calculator">calculator</Link> re-runs it at your state&apos;s prices.
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
            {COST_LINES.map(({ label, row, digits, src }, i) => (
              <tr key={label} className={i < COST_LINES.length - 1 ? "border-b border-(--color-line)/50" : undefined}>
                <td className="py-3 pr-3 text-(--color-fg)">{label}</td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Num v={row.unitPrice} ev="R" src={src} format={(v) => `${Number(v).toFixed(digits)} ${row.unit}`} />
                </td>
                <td className="py-3 font-mono whitespace-nowrap">
                  <Num
                    v={row.perHour}
                    ev="C"
                    src="costsForSeasonalLoad(0, HEATER_CLASSES.e_240_5k output, 1, PRICES.IL).perHour — lib/planner/fuels.ts"
                    format={(v) => `${usd(Number(v))}/hr`}
                  />
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
          main={{ product: cz220, shortName: "CZ220" }}
          extra={[{ product: fuh54, shortName: "FUH54" }]}
          note={
            <>
              A {kw5} kW ceiling heater on its own circuit. The FUH54 is the same class in a higher price class. The CZ220 manual&apos;s maximum
              ceiling height is <Num f="cz220.max_ceiling_ft" />, and BayHeat&apos;s example garage has a{" "}
              <Num v={EXAMPLE_A_INPUT.height} unit="ft" ev="E" src="EXAMPLE_A_INPUT.height — lib/planner/fixtures.ts" /> ceiling. For a taller
              shop, read the FUH54 manual&apos;s mounting height first. The CZ220 manual also asks for a dry place free of combustible dust.
            </>
          }
        />
        <ProductCard
          eyebrow={`240 V · ${kw7k5} kW · ${c7k5.breakerA} A`}
          main={{ product: dr975, shortName: "DR-975" }}
          note="The maker rules out residential and household use, so this heater suits a commercial shop, not a home one. If you are unsure which yours is, ask the maker first."
        />
        <ProductCard
          eyebrow={`240 V · ${kw(e10k / 1000)} kW · ${c10k.breakerA} A`}
          main={{ product: dr910f, shortName: "DR-910F" }}
          note="The largest electric class here. The maker rules out residential and household use, so it suits a commercial shop, not a home one. Check the panel before you order."
        />
        <ProductCard
          eyebrow="Vented gas · clean shop"
          main={{ product: bigMaxx, shortName: "Big Maxx" }}
          note="Natural gas or propane, vented, connected by a licensed gas fitter."
        />
        <ProductCard
          eyebrow="Vented gas · dusty shop"
          main={{ product: hotDawg, shortName: "Hot Dawg HDS" }}
          note="Separated combustion keeps dusty shop air out of the burner. It is not rated for a solvent or gasoline atmosphere."
        />
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">Diesel air · detached shop, attended</p>
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
          Any fuel-burning heater needs CO protection in the shop itself. Run a CO monitor in the shop whenever the heater runs. Choose one
          whose data sheet covers the shop&apos;s temperature range. An alarm in the house cannot tell you what the air in a separate
          building holds.
        </p>
        <p className="mt-2">
          If the shop is attached to a house, add UL 2034 alarms in the house. Put them by the garage door and outside each sleeping area.
          IRC 2021 R315 covers the house: <Num f="code.irc.r315" />.
        </p>
        <p className="mt-2">
          A fixed electric heater adds no CO, but it still needs the breaker and wire in the table above. Your electrician, gas fitter and
          local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
      <QuickPick
        productId="co-alarm-battery-10yr"
        page={entry.href}
        eyebrow="Safety add-on · for the house"
        headline="This alarm is for the house, outside each sleeping area. It is not rated for an unheated shop."
      />

      <h2>Next step</h2>
      <p>
        Pick the type your building can support, then check your own case. The calculator sizes the heat load and the circuit. The
        verdict tool gives a verdict for each heater type.
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
