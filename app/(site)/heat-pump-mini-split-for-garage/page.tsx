import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Cost } from "@/components/commerce/Cost";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { WhyNot } from "@/components/commerce/WhyNot";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } from "@/lib/planner/fixtures";
import { heatPumpSeasonal, heatPumpCapacity, heatPumpCop } from "@/lib/planner/seasonal";
import { heaterClass } from "@/lib/planner/catalog";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { verdictFor } from "@/lib/safety/verdict";
import type { Situation } from "@/lib/safety/types";
import { SAFETY_SCOPE, SAVINGS_VARY } from "@/lib/site";

const entry = findPage("/heat-pump-mini-split-for-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["eia-electric-power-monthly", "nec-2023"];

export default function Page() {
  // Same worked-example garage as every other page (24x24 attached 2-car, Chicago), but sealed first --
  // ceiling to R-30, tightness to "tight" -- since a 12-24k class mini-split can't touch the as-is load (see
  // the fit check below). Every number past this line is a live call into the real engine, not a fixture.
  const sealedInput = { ...EXAMPLE_A_INPUT, ceilingIns: "R30" as const, tightness: "tight" as const };
  const sealed = plan(sealedInput);
  const asIs = plan(EXAMPLE_A_INPUT);

  const tBal = sealed.usage.tBal!;
  const uaOut = sealed.heating.uaExt;
  const ratedCapacity47 = 24000; // hp_12_24k_230's top of its 6,000-24,000 BTU/h class range, at the 47degF AHRI rating point

  const hpStandard = heatPumpSeasonal(EXAMPLE_A_STATION, tBal, uaOut, "standard", ratedCapacity47);
  const hpColdClimate = heatPumpSeasonal(EXAMPLE_A_STATION, tBal, uaOut, "cold_climate", ratedCapacity47);
  const capAtDesign = heatPumpCapacity("standard", EXAMPLE_A_STATION.h99, ratedCapacity47);
  const copAtDesign = heatPumpCop("standard", EXAMPLE_A_STATION.h99);
  const capAtDesignCold = heatPumpCapacity("cold_climate", EXAMPLE_A_STATION.h99, ratedCapacity47);

  const resistanceSeasonCost = sealed.costs.find((c) => c.system === "electric_resistance")!.perSeason;
  const hpSeasonCostStandard = hpStandard.inputKwh * sealed.prices.elecPerKwh;

  const hpClass = heaterClass("hp_12_24k_230");
  const diyClass = heaterClass("hp_diy_12k_115");
  const resClass = heaterClass("e_240_7k5");

  const hpInstallLow = hpClass.equip[0] + hpClass.install[0];
  const hpInstallHigh = hpClass.equip[1] + hpClass.install[1];
  const hpInstallMid = (hpInstallLow + hpInstallHigh) / 2;
  const resInstallLow = resClass.equip[0] + resClass.install[0];
  const resInstallHigh = resClass.equip[1] + resClass.install[1];
  const resInstallMid = (resInstallLow + resInstallHigh) / 2;

  const hp5yrStandard = hpInstallMid + 5 * hpSeasonCostStandard;
  const res5yr = resInstallMid + 5 * resistanceSeasonCost;

  const fitPctDesignStandard = (capAtDesign / sealed.heating.qSize) * 100;
  const fitPctDesignColdClimate = (capAtDesignCold / sealed.heating.qSize) * 100;
  const fitPctAsIsNameplate = (ratedCapacity47 / asIs.heating.qSize) * 100;

  const situation: Situation = {
    attached: true,
    flammablesStored: "no",
    livingAbove: false,
    unattended: true,
    freshAir: true,
    circuit: "240V30A",
    ulListed: "yes",
    coAlarmHouse: true,
    coMonitorGarageRated: false,
    preset: "2car",
  };
  const verdict = verdictFor("minisplit", situation);

  const minisplit = findProduct("minisplit-12k-230v")!;
  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A 12-24k class mini-split heat pump runs about <Cost amount={hpInstallLow} />–<Cost amount={hpInstallHigh} />{" "}
        installed, against about <Cost amount={resInstallLow} />–<Cost amount={resInstallHigh} /> for a plain 240V
        resistance heater sized to the same garage. In a sealed 2-car garage in Chicago, the heat pump&apos;s lower
        running cost usually closes that gap inside 5 years — and unlike the resistance heater, it also cools.
      </AnswerBlock>

      <h2>The real seasonal COP, not the nameplate number</h2>
      <p>
        A mini-split&apos;s rated output is set at a 47°F outdoor temperature — not a Chicago January night.
        As the outdoor temperature drops, both its capacity and its coefficient of performance (COP, heat
        delivered per unit of electricity) fall. At this garage&apos;s{" "}
        <Num v={EXAMPLE_A_STATION.h99} unit="°F" ev="S" src="EXAMPLE_A_STATION.h99 (ASHRAE 99% design dry-bulb)" /> design
        temperature, a standard-class unit rated for{" "}
        <Num v={ratedCapacity47} unit="BTU/h" round={100} ev="S" src="hp_12_24k_230 top of class, 47degF AHRI rating" /> can
        only deliver about{" "}
        <Num v={capAtDesign} unit="BTU/h" round={100} ev="C" src="heatPumpCapacity('standard', h99, 24000) — lib/planner/seasonal.ts" /> at
        a COP of about{" "}
        <Num v={copAtDesign} round={0.1} ev="C" src="heatPumpCop('standard', h99)" />. A cold-climate/hyper-heat model
        holds up better — about{" "}
        <Num v={capAtDesignCold} unit="BTU/h" round={100} ev="C" src="heatPumpCapacity('cold_climate', h99, 24000)" /> at
        the same outdoor temperature.
      </p>
      <p>
        Bin-integrated over a whole heating season in this sealed garage (qDesign about{" "}
        <Num v={sealed.heating.qSize} unit="BTU/h" round={100} ev="C" src="plan() on ceilingIns:R30, tightness:tight" />
        , grade {sealed.heating.grade}), a standard-class unit averages a season-wide COP of about{" "}
        <Num v={hpStandard.seasonalCop} round={0.1} ev="C" src="heatPumpSeasonal('standard', ...) — lib/planner/seasonal.ts" />;
        cold-climate averages about{" "}
        <Num v={hpColdClimate.seasonalCop} round={0.1} ev="C" src="heatPumpSeasonal('cold_climate', ...)" />. Both
        numbers already include the resistance backup that kicks in whenever the compressor can&apos;t keep up —
        that&apos;s normal, not a malfunction.
      </p>
      <p>
        On the coldest nights, a standard-class unit still only covers about{" "}
        <Num v={fitPctDesignStandard} unit="%" round={1} ev="C" src="capAtDesign / sealed qSize" /> of this sealed
        garage&apos;s design load; cold-climate gets to about{" "}
        <Num v={fitPctDesignColdClimate} unit="%" round={1} ev="C" src="capAtDesignCold / sealed qSize" />. Either
        way, check the manufacturer&apos;s low-ambient capacity curve against your own design temperature before
        assuming the nameplate BTU number is what you&apos;ll actually get in January.
      </p>

      <h2>5-year cost: heat pump vs. a plain resistance heater</h2>
      <p>
        Same sealed garage, same seasonal load, two ways to cover it — a 12-24k mini-split heat pump, or a
        right-sized 7.5 kW electric resistance heater:
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">System</th>
              <th className="py-2 pr-3 text-right font-normal">Installed</th>
              <th className="py-2 pr-3 text-right font-normal">Season, running</th>
              <th className="py-2 text-right font-normal">5-year total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-2 pr-3 text-(--color-fg)">Mini-split heat pump ({hpClass.label})</td>
              <td className="py-2 pr-3 text-right font-mono">
                <Cost amount={hpInstallLow} />–<Cost amount={hpInstallHigh} />
              </td>
              <td className="py-2 pr-3 text-right font-mono">
                <Cost amount={hpSeasonCostStandard} />
              </td>
              <td className="py-2 text-right font-mono">
                <Cost amount={hp5yrStandard} /> at mid-range install
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-2 pr-3 text-(--color-fg)">Electric resistance ({resClass.label})</td>
              <td className="py-2 pr-3 text-right font-mono">
                <Cost amount={resInstallLow} />–<Cost amount={resInstallHigh} />
              </td>
              <td className="py-2 pr-3 text-right font-mono">
                <Cost amount={resistanceSeasonCost} />
              </td>
              <td className="py-2 text-right font-mono">
                <Cost amount={res5yr} /> at mid-range install
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-(--color-fg-2)">{SAVINGS_VARY}</p>
      <p>
        At the midpoint of each install range, the heat pump comes out several hundred dollars ahead over 5 years
        of running cost alone — before counting cooling. But installed price is the real swing factor: at the
        cheap end for resistance and the expensive end for the heat pump, resistance wins outright. Get an actual
        installer quote before treating either total as settled.
      </p>

      <h2>Also runs backward: cooling</h2>
      <p>
        The same outdoor/indoor unit reverses in summer to cool the garage — useful if it doubles as a shop,
        gym or hangout space in July. BayHeat&apos;s cooling load calculator isn&apos;t live yet, so this page
        doesn&apos;t quote a cooling BTU/h or a summer running cost; treat the cooling capability as a real
        feature of the equipment, not a number to plan around until that calculator ships.
      </p>

      <h2>Why not sealing skips this</h2>
      <Callout variant="fix">
        This whole comparison assumes the garage is sealed first. The <em>as-is</em> version of the same 24×24
        garage (R-13 walls, one uninsulated steel door, average drafts) needs about{" "}
        <Num v={asIs.heating.qSize} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).heating.qSize" /> —
        a 24,000 BTU/h nameplate only covers about{" "}
        <Num v={fitPctAsIsNameplate} unit="%" round={1} ev="C" src="24000 / plan(EXAMPLE_A_INPUT).heating.qSize" /> of
        that, before any cold-weather derate. <a href="/how-to-insulate-a-garage">Seal the envelope first</a>, then
        size the heat pump to what&apos;s left.
      </Callout>

      <WhyNot
        rows={[
          {
            classId: "hp_diy_12k_115",
            text: `A DIY pre-charged 115V mini-split tops out around ${diyClass.outputBtuh[1].toLocaleString()} BTU/h on a shared 120V/20A circuit — enough for a small, already-sealed 1-car bay, not this comparison's 2-car load, and it skips the licensed refrigerant charge check most manufacturers require for warranty.`,
          },
        ]}
      />

      <Disclosure />
      <div className="not-prose my-6 border border-(--color-line) p-4">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">MINI-SPLIT HEAT PUMP · 12-24K CLASS · 230V</p>
        <p className="mt-1 text-lg font-bold text-(--color-fg)">{minisplit.name}</p>
        <p className="mt-2 text-sm text-(--color-fg-2)">
          Heats and cools on a dedicated{" "}
          <Num v="240V/30A" ev="S" src="HEATER_CLASSES.hp_12_24k_230.circuit — lib/planner/catalog.ts" /> circuit.
          Refrigerant work needs a licensed HVAC contractor — see the safety note below.
        </p>
        {minisplit.safetyLine ? <p className="mt-2 text-xs text-(--color-alarm)">{minisplit.safetyLine.text}</p> : null}
        <div className="mt-3">
          <BuyButton href={route(minisplit, "site")[0].href}>Search current listings ↗</BuyButton>
        </div>
        <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {minisplit.priceClass}</p>
      </div>

      <h2>Safety: {verdict.stamp}</h2>
      <SafetyCallout>
        <p>No combustion, no CO risk from the heater itself — the conditions here are about the install, not the fuel.</p>
        <ul className="mt-2 list-disc pl-5">
          {verdict.conditions.map((c, i) => (
            <li key={i}>
              {c.text} <span className="text-xs">({c.cite})</span>
            </li>
          ))}
        </ul>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>

      <h2>Next step</h2>
      <p>
        <a href="/garage-heater-calculator">Run your own garage through the planner →</a> to see whether it&apos;s
        sealed enough for a mini-split to actually cover the coldest night, or whether{" "}
        <a href="/how-to-insulate-a-garage">fixing the envelope first</a> gets you there for a lot less money.
      </p>
    </ReportPage>
  );
}
