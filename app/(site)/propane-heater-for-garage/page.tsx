import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton, ButtonLink } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { verdictFor } from "@/lib/safety/verdict";
import type { Situation, Condition } from "@/lib/safety/types";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/propane-heater-for-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["eia-propane-weekly", "mrheater-bigbuddy-manual", "ifgc-2021", "irc-2021"];

const DETACHED_BUDDY: Situation = {
  attached: false,
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

const VENTED_SITUATION: Situation = {
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
  const result = plan(EXAMPLE_A_INPUT);
  const bulkRow = result.costs.find((c) => c.system === "propane_bulk_80")!;
  const cylRow = result.costs.find((c) => c.system === "propane_cyl_92")!;

  const detachedVerdict = verdictFor("buddy", DETACHED_BUDDY);
  const attachedVerdict = verdictFor("buddy", { ...DETACHED_BUDDY, attached: true });
  const ventedVerdict = verdictFor("vented_gas", VENTED_SITUATION);

  const bigMaxx = findProduct("gas-unit-heater-big-maxx-50")!;
  const hotDawg = findProduct("gas-unit-heater-hot-dawg-45")!;
  const buddy9k = findProduct("propane-buddy-9k")!;
  const bigBuddy = findProduct("propane-big-buddy-18k")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A vented propane unit heater on a bulk tank runs about <Cost amount={bulkRow.perHour} per="hr" /> flat out at
        Illinois prices; a portable Buddy-type radiant heater on 1-lb cylinders costs more per hour to run (
        <Cost amount={cylRow.perHour} per="hr" />) and is built for attended spot heat only — never a whole-garage,
        set-and-forget system. This page sells the vented class; the portable class gets a safety verdict, not a
        buy button.
      </AnswerBlock>

      <p>
        &quot;Propane heater for a garage&quot; covers two unrelated tools. A vented unit heater bolts to the wall or
        ceiling, burns off a natural gas line or a bulk propane tank, and exhausts outdoors through its own flue —
        it&apos;s the class this page sells. A Buddy-type portable radiant heater burns unvented, indoors, on small
        disposable cylinders — it has a real, narrow use, and it never gets a buy link on any BayHeat page,
        attached garage or detached.
      </p>

      <div className="not-prose my-6">
        <ButtonLink href="/can-i-run-it">Check my heater →</ButtonLink>
      </div>

      <h2>Vented unit heaters: the class this page sells</h2>
      <p>
        A vented natural gas or propane unit heater covers a whole garage from one wall-mounted unit. Code sets a
        floor for where its burner can sit: <Num f="code.ifgc.305_3" />. Both units below need a licensed gas
        fitter for the connection and the permit — this isn&apos;t a DIY hookup.
      </p>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">VENTED UNIT HEATER</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">{bigMaxx.name}</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            Runs on natural gas or LP; a fan-forced flue keeps combustion products outdoors.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{bigMaxx.safetyLine?.text}</p>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {bigMaxx.priceClass}</p>
          <div className="mt-3">
            <BuyButton href={route(bigMaxx, "site")[0].href}>{route(bigMaxx, "site")[0].label} ↗</BuyButton>
          </div>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">SEPARATED COMBUSTION</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">{hotDawg.name}</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            Draws its combustion air from outside the room — the pick for a shop with sawdust or solvent vapor
            in the air.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{hotDawg.safetyLine?.text}</p>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {hotDawg.priceClass}</p>
          <div className="mt-3">
            <BuyButton href={route(hotDawg, "site")[0].href}>{route(hotDawg, "site")[0].label} ↗</BuyButton>
          </div>
        </div>
      </div>

      <h3>What it takes to run one, per BayHeat&apos;s own verdict tool</h3>
      <ConditionList conditions={ventedVerdict.conditions} />

      <h2>Cost per hour and per season, computed at Illinois prices</h2>
      <p>
        Bulk propane through a vented 80%-efficient unit heater costs about{" "}
        <Cost amount={bulkRow.perMMBtu} per="MMBtu" /> delivered ({result.prices.asOf.propane} price); the same
        garage&apos;s season comes to roughly <Cost amount={bulkRow.perSeason} per="season" />. Cylinder-exchange
        propane through a 92%-efficient Buddy-type unit costs about <Cost amount={cylRow.perMMBtu} per="MMBtu" />{" "}
        delivered — the exchange premium over bulk propane outweighs the Buddy&apos;s efficiency edge. Neither
        figure includes install cost; the calculator runs both against your own garage and state.
      </p>

      <h2>Why not a Buddy heater here</h2>
      <p>
        The {buddy9k.name} and {bigBuddy.name} are real, listed products with a real use — a stalled car, a job
        site trailer, a detached shed with no power run yet. Their own manuals scope that use narrowly, and
        BayHeat&apos;s <Link href="/can-i-run-it">Can I run it?</Link> tool quotes it rather than soften it:
      </p>
      <SafetyCallout>
        <p className="font-medium text-(--color-fg)">Detached garage, attended, ventilated: ONLY IF</p>
        <ConditionList conditions={detachedVerdict.conditions} />
        <p className="mt-3 font-medium text-(--color-fg)">Attached garage: NO-GO, regardless of ventilation</p>
        <p>{attachedVerdict.reasons[0]}</p>
      </SafetyCallout>
      <p>
        {buddy9k.safetyLine?.text} A 20-lb refillable cylinder can only feed this heater from outdoors, on the
        maker&apos;s own hose and fuel filter — never stored or used inside the garage, attached or detached. That
        manual scope is why this class carries no buy button on this page: it&apos;s a real product for a narrow
        job, not a whole-garage heating system to shop for here. Run your own situation through{" "}
        <Link href="/can-i-run-it">Can I run it?</Link> before you buy one anywhere.
      </p>

      <h2>Don&apos;t buy a torpedo heater either</h2>
      <p>
        A forced-air &quot;torpedo&quot; propane heater is excluded from every BayHeat recommendation for any
        enclosed garage, full stop — stricter than some of those heaters&apos; own manuals. Use the vented unit
        heater above, an electric class, or a mini-split instead.
      </p>

      <h2>Safety scope</h2>
      <SafetyCallout>
        <p>{SAFETY_SCOPE}</p>
      </SafetyCallout>

      <h2>Next step</h2>
      <p>
        <Link href="/can-i-run-it">Check my heater and garage →</Link> for a verdict specific to your circuit,
        cylinder and what&apos;s stored where, or <Link href="/garage-heaters">compare every fuel</Link> at your
        own state&apos;s prices.
      </p>
    </ReportPage>
  );
}
