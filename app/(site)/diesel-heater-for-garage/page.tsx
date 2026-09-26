import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { heaterClass } from "@/lib/planner/catalog";
import { PRICES, US_AVG_PRICES } from "@/lib/planner/prices";
import { costPerMMBtuDelivered, HEAT_CONTENT, ETA } from "@/lib/planner/fuels";
import { verdictFor } from "@/lib/safety/verdict";
import type { Situation, Condition } from "@/lib/safety/types";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/diesel-heater-for-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["eia-electric-power-monthly", "eia-diesel-weekly", "irc-2021", "ifgc-2021"];

const BASE_SITUATION: Situation = {
  attached: false,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  ulListed: "unknown",
  exhaustOutdoors: true,
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
};

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

export default function Page() {
  const prices = PRICES["IL"] ?? US_AVG_PRICES;
  const dieselClass = heaterClass("diesel_air");
  const repOutputBtuh = dieselClass.outputBtuh[1]; // 17,000 BTU/h -- the class's rated ceiling, comparable to a 5kW electric unit

  const dieselPerMMBtu = costPerMMBtuDelivered(prices.dieselPerGal, HEAT_CONTENT.dieselBtuPerGal, ETA.dieselAir);
  const electricPerMMBtu = costPerMMBtuDelivered(prices.elecPerKwh, HEAT_CONTENT.btuPerKwh, ETA.electricResistance);
  const dieselPerHour = (dieselPerMMBtu * repOutputBtuh) / 1e6;
  const electricPerHour = (electricPerMMBtu * repOutputBtuh) / 1e6;
  // The electricity price at which electric resistance costs the same per MMBtu delivered as diesel does today --
  // above this price, diesel wins; below it, electric wins. Both costPerMMBtuDelivered() calls above, solved for elecPerKwh.
  const crossoverElecPerKwh = (dieselPerMMBtu * HEAT_CONTENT.btuPerKwh) / 1e6;
  const crossoverCents = crossoverElecPerKwh * 100;
  const dieselWinsNow = prices.elecPerKwh > crossoverElecPerKwh;

  const detachedVerdict = verdictFor("diesel", BASE_SITUATION);
  const attachedVerdict = verdictFor("diesel", { ...BASE_SITUATION, attached: true });
  const noExhaustVerdict = verdictFor("diesel", { ...BASE_SITUATION, exhaustOutdoors: false });

  const diesel5kw = findProduct("diesel-heater-5kw")!;
  const diesel8kw = findProduct("diesel-heater-8kw")!;
  const exhaustKit = findProduct("diesel-exhaust-kit")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        At Illinois&apos; own {prices.asOf.diesel} diesel price and {prices.asOf.elec} electricity price, a{" "}
        <Num v={repOutputBtuh} unit="BTU/h" round={100} ev="S" src="HEATER_CLASSES.diesel_air.outputBtuh — lib/planner/catalog.ts" />{" "}
        diesel air heater costs about <Cost amount={dieselPerHour} per="hr" /> to run flat out, against{" "}
        <Cost amount={electricPerHour} per="hr" /> for an electric resistance heater putting out the same heat.
        Diesel only overtakes electric once electricity costs more than about{" "}
        <Num v={crossoverCents} unit="¢/kWh" ev="C" src="crossoverElecPerKwh x 100 — solved from costPerMMBtuDelivered() for elecPerKwh" round={0.1} /> —
        closer to California or Hawaii rates than the Midwest&apos;s.
      </AnswerBlock>

      <p>
        A diesel air heater burns like a parking heater&apos;s cabin unit: a small combustion chamber, a fuel pump
        sipping from a jerry can, and a fan pushing warm air out. It has none of a vented gas unit heater&apos;s
        UL or CSA listing for building heat, so this page treats it strictly as a detached-garage, exhaust-outdoors
        tool — see the safety section below before you buy one for anything else.
      </p>

      <h2>Cost per hour, computed at today&apos;s prices, not a spec-sheet estimate</h2>
      <p>
        Delivered heat costs <Cost amount={dieselPerMMBtu} per="MMBtu" /> on diesel at{" "}
        <Cost amount={prices.dieselPerGal} per="gal" /> and a{" "}
        <Num v={ETA.dieselAir * 100} unit="%" ev="E" src="ETA.dieselAir — lib/planner/fuels.ts" round={1} /> combustion
        efficiency, against <Cost amount={electricPerMMBtu} per="MMBtu" /> for electric resistance. Both prices are
        dated {prices.asOf.diesel} (diesel) and {prices.asOf.elec} (electricity) — check{" "}
        <Link href="/garage-heater-calculator">the calculator</Link> for your own state&apos;s numbers instead of Illinois&apos;.
      </p>
      <p>
        At those prices, {dieselWinsNow ? "diesel is the cheaper fuel here" : "electric resistance is the cheaper fuel here"} —
        the crossover sits at about{" "}
        <Num v={crossoverCents} unit="¢/kWh" ev="C" src="crossoverElecPerKwh x 100 — solved from costPerMMBtuDelivered() for elecPerKwh" round={0.1} />{" "}
        for electricity, and Illinois runs{" "}
        <Num v={prices.elecPerKwh * 100} unit="¢/kWh" ev="R" src="PRICES.IL.elecPerKwh x 100 — EIA Electric Power Monthly" round={0.1} /> today. Diesel&apos;s
        case gets stronger in high electricity-price states and weaker wherever diesel itself runs expensive at the
        pump — it&apos;s never a fixed answer, only today&apos;s two prices run through the same formula.
      </p>

      <Callout variant="note">
        This is a fuel-cost comparison only, not a recommendation to install either system in an attached garage —
        see the safety verdicts below. A diesel heater&apos;s low equipment cost is also why it shows up as a
        cheap-looking option online; it isn&apos;t priced here against install cost, only running cost.
      </Callout>

      <h2>No UL/CSA listing for building heat — read this before you buy one</h2>
      <SafetyCallout>
        <p>
          This class (<code>diesel_air</code> in BayHeat&apos;s catalog) carries no UL or CSA listing for heating a
          building. Its exhaust and combustion air intake both have to run outdoors through the maker&apos;s own
          thimble kit — never into the garage, and never into the house. BayHeat doesn&apos;t recommend a permanent
          install of an unlisted diesel heater in an attached garage, full stop, regardless of what the exhaust
          routing looks like.
        </p>
      </SafetyCallout>

      <h3>Detached garage, exhaust and intake outdoors: ONLY IF</h3>
      <p>Every one of these conditions has to hold, together, not just the ones that are convenient:</p>
      <ConditionList conditions={detachedVerdict.conditions} />

      <h3>Attached garage: NO-GO</h3>
      <p>{attachedVerdict.reasons[0]}</p>
      <ConditionList conditions={attachedVerdict.conditions} />

      <h3>Exhaust not yet routed outdoors: NO-GO</h3>
      <p>{noExhaustVerdict.reasons[0]}</p>
      <ConditionList conditions={noExhaustVerdict.conditions.slice(0, 1)} />

      <p className="text-sm text-(--color-fg-2)">
        Your electrician and your local code edition govern. {SAFETY_SCOPE}
      </p>

      <h2>Don&apos;t buy this class expecting a permanent, unattended fix</h2>
      <p>
        Don&apos;t buy a diesel air heater to heat an attached garage full time — buy a listed electric or vented
        natural-gas unit heater for that job instead (see the <Link href="/garage-heaters">fuel hub</Link>). A diesel
        heater&apos;s manual scope is a detached space, attended or thermostatically monitored, with its exhaust kit
        installed — not a set-and-forget house-adjacent heater.
      </p>

      <h2>Buy: 5 kW and 8 kW classes, plus the exhaust kit the safety rule requires</h2>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">DIESEL AIR · 5KW CLASS</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">{diesel5kw.name}</p>
          <p className="mt-2 text-xs text-(--color-alarm)">{diesel5kw.safetyLine?.text}</p>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {diesel5kw.priceClass}</p>
          <div className="mt-3">
            <BuyButton href={route(diesel5kw, "site")[0].href}>{route(diesel5kw, "site")[0].label} ↗</BuyButton>
          </div>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">DIESEL AIR · 8KW CLASS</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">{diesel8kw.name}</p>
          <p className="mt-2 text-xs text-(--color-alarm)">{diesel8kw.safetyLine?.text}</p>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {diesel8kw.priceClass}</p>
          <div className="mt-3">
            <BuyButton href={route(diesel8kw, "site")[0].href}>{route(diesel8kw, "site")[0].label} ↗</BuyButton>
          </div>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">REQUIRED FOR EITHER CLASS</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">{exhaustKit.name}</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            The wall thimble and muffler the ONLY IF conditions above require — not optional hardware.
          </p>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {exhaustKit.priceClass}</p>
          <div className="mt-3">
            <BuyButton href={route(exhaustKit, "site")[0].href}>{route(exhaustKit, "site")[0].label} ↗</BuyButton>
          </div>
        </div>
      </div>

      <h2>Next step</h2>
      <p>
        <Link href="/can-i-run-it">Check my heater and garage →</Link> for a verdict specific to your own situation,
        or <Link href="/garage-heaters">compare every fuel</Link> at your own state&apos;s prices.
      </p>
    </ReportPage>
  );
}
