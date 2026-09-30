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
import { FuelCostBars } from "@/components/figures/FuelCostBars";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { costPerMMBtuDelivered, HEAT_CONTENT, ETA } from "@/lib/planner/fuels";
import { PRICES, US_AVG_PRICES } from "@/lib/planner/prices";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { heaterClass } from "@/lib/planner/catalog";
import { SAFETY_SCOPE } from "@/lib/site";
import type { PriceSet } from "@/lib/planner/types";

const entry = findPage("/electric-vs-propane-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["eia-electric-power-monthly", "eia-ng-annual", "eia-propane-weekly", "eia-diesel-weekly", "ifgc-2021"];

type RateRow = { label: string; electric: number; propane: number; ng: number; diesel: number };

function rateRow(label: string, p: PriceSet): RateRow {
  return {
    label,
    electric: costPerMMBtuDelivered(p.elecPerKwh, HEAT_CONTENT.btuPerKwh, ETA.electricResistance),
    propane: costPerMMBtuDelivered(p.propanePerGal, HEAT_CONTENT.propaneBtuPerGal, ETA.ventedGas80),
    ng: costPerMMBtuDelivered(p.ngPerTherm, HEAT_CONTENT.ngBtuPerTherm, ETA.ventedGas80),
    diesel: costPerMMBtuDelivered(p.dieselPerGal, HEAT_CONTENT.dieselBtuPerGal, ETA.dieselAir),
  };
}

export default function Page() {
  const rows: RateRow[] = [
    rateRow("Illinois", PRICES.IL),
    rateRow("California", PRICES.CA),
    rateRow("Texas", PRICES.TX),
    rateRow("US average", US_AVG_PRICES),
  ];
  const il = rows[0];

  // The standard worked example (24x24 attached 2-car, Chicago, R-13/uninsulated steel door) run through the
  // real planner -- costsForSeasonalLoad() computes all six systems for the same seasonal load, not six
  // separate invented numbers.
  const result = plan(EXAMPLE_A_INPUT);

  const dr975 = findProduct("dr975-7k5-shop")!;
  const bigMaxx = findProduct("gas-unit-heater-big-maxx-50")!;
  const torpedoClass = heaterClass("torpedo");

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        In Illinois, electric resistance heat runs about <Cost amount={il.electric} per="MMBtu" /> delivered; a
        vented propane unit heater runs about <Cost amount={il.propane} per="MMBtu" />; natural gas about{" "}
        <Cost amount={il.ng} per="MMBtu" />; a diesel air heater about <Cost amount={il.diesel} per="MMBtu" />. None
        of those rankings hold in every state — your own electricity and fuel prices decide the order, not a
        national rule of thumb.
      </AnswerBlock>

      <h2>The Fuel Cost Meter: $/MMBtu delivered, by state</h2>
      <p>
        This is the delivered cost of one million BTU of actual heat in the garage — the fuel&apos;s price per
        gallon, therm or kWh, divided by how much of that energy the equipment class actually turns into heat.
        Electric resistance runs at{" "}
        <Num v={ETA.electricResistance * 100} unit="%" ev="S" src="lib/planner/fuels.ts ETA.electricResistance" />{" "}
        efficiency because every watt becomes heat in the room; a vented gas or propane unit heater runs about{" "}
        <Num v={ETA.ventedGas80 * 100} unit="%" ev="S" src="lib/planner/fuels.ts ETA.ventedGas80" /> because some
        heat leaves with the flue gas; a diesel air heater runs about{" "}
        <Num v={ETA.dieselAir * 100} unit="%" ev="S" src="lib/planner/fuels.ts ETA.dieselAir" />.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">State</th>
              <th className="py-2 pr-3 text-right font-normal">Electric</th>
              <th className="py-2 pr-3 text-right font-normal">Propane (vented)</th>
              <th className="py-2 pr-3 text-right font-normal">Natural gas</th>
              <th className="py-2 text-right font-normal">Diesel</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-(--color-line)/50">
                <td className="py-2 pr-3 text-(--color-fg)">{r.label}</td>
                <td className="py-2 pr-3 text-right font-mono">
                  <Cost amount={r.electric} />
                </td>
                <td className="py-2 pr-3 text-right font-mono">
                  <Cost amount={r.propane} />
                </td>
                <td className="py-2 pr-3 text-right font-mono">
                  <Cost amount={r.ng} />
                </td>
                <td className="py-2 text-right font-mono">
                  <Cost amount={r.diesel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-(--color-fg-2)">
        Per million BTU delivered, computed live from each state&apos;s EIA price and the efficiency figures
        above — not a flat national average stretched across every state.
      </p>

      <h2>What that looks like for a real garage</h2>
      <p>
        For BayHeat&apos;s standard worked example — a 24×24 ft attached two-car garage in Chicago, needing about{" "}
        <Num v={result.heating.qSize} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).heating.qSize" /> —
        here&apos;s the season cost of covering that same load on each system, at Illinois prices:
      </p>
      <FuelCostBars rows={result.costs} />
      <p>
        Natural gas is cheapest per MMBtu almost everywhere it&apos;s piped to the garage — but that&apos;s the
        catch: most detached garages don&apos;t have a gas line, and running one plus a B-vent through the roof is
        its own project. Propane trades a cylinder or bulk tank for that piping. Electric needs neither, at the
        cost of the highest rate per MMBtu in most states.
      </p>

      <Callout variant="note">
        A heat pump mini-split moves heat instead of making it, so its effective efficiency runs well over{" "}
        <Num v={100} unit="%" ev="S" src="lib/planner/seasonal.ts HP_CURVE (COP > 1)" /> — see{" "}
        <a href="/heat-pump-mini-split-for-garage">the mini-split page</a> for a real seasonal-COP worked
        example before assuming electric always means resistance heat.
      </Callout>

      <h2>Don&apos;t pick by rate alone</h2>
      <WhyNot
        rows={[
          {
            classId: "torpedo",
            text: `A forced-air torpedo heater burns cylinder propane unvented at up to ${torpedoClass.outputBtuh[1].toLocaleString()} BTU/h. It's a construction/outdoor tool — running one indoors, vented or not, isn't part of this comparison.`,
          },
          {
            classId: "diesel_air",
            text: "A diesel air heater isn't UL-listed for permanent building heat. Its low rate above only makes sense for occasional or outdoor use, with the exhaust run outside every time — not as a year-round system.",
          },
        ]}
      />

      <h2>Where to look</h2>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">ELECTRIC · 240V SHOP · 7.5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Dr. Infrared DR-975</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            No fuel line, no venting — plug into the numbers on the <a href="/electric-garage-heater">electric page</a> and
            size the circuit first.
          </p>
          <div className="mt-3">
            <BuyButton href={route(dr975, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {dr975.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">VENTED GAS UNIT HEATER</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Mr. Heater Big Maxx (NG/propane)</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            Cheapest rate above, on either fuel — but budget for the gas line, regulator and vent run before
            comparing it to a plug-and-go electric unit. See{" "}
            <a href="/propane-heater-for-garage">the propane page</a> for the safety conditions.
          </p>
          <div className="mt-3">
            <BuyButton href={route(bigMaxx, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {bigMaxx.priceClass}</p>
        </div>
      </div>

      <h2>Safety, whichever fuel wins on price</h2>
      <SafetyCallout>
        <p>
          Any fuel-fired heater with a pilot, burner or spark needs its ignition source at least{" "}
          <Num f="code.ifgc.305_3" /> — an unvented cylinder heater and a vented unit heater both count. A diesel
          or gas unit heater&apos;s exhaust has to leave the building, not just the garage bay. None of that
          changes based on which fuel is cheapest this month. {SAFETY_SCOPE}
        </p>
      </SafetyCallout>
    </ReportPage>
  );
}
