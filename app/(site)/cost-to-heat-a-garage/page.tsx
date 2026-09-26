import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Cost } from "@/components/commerce/Cost";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Num } from "@/components/evidence/Num";
import { heatLossDesign } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { balancePoint, seasonalLoadContinuous } from "@/lib/planner/seasonal";
import { costsForSeasonalLoad, type SystemKey } from "@/lib/planner/fuels";
import { primaryStationForState } from "@/lib/planner/stations";
import { PRICES } from "@/lib/planner/prices";
import { WALL_U, HOUSE_COUPLING_UA } from "@/lib/planner/constants";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import { getSource } from "@/lib/facts";

const entry = findPage("/cost-to-heat-a-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

// The standard garage this index holds constant across every state: a 24x24 ft attached 2-car garage, R-13
// walls, uninsulated steel door, average drafts (the same envelope as BayHeat's worked example A), held
// continuously at 50°F -- only the station (climate) and the state's own prices vary row to row.
const TARGET_TEMP = 50;
const DISPLAY_SYSTEMS: SystemKey[] = ["electric_resistance", "heat_pump_cc", "ng_vented_80", "propane_bulk_80"];
const SYSTEM_LABEL: Record<SystemKey, string> = {
  electric_resistance: "Electric resistance",
  heat_pump_cc: "Heat pump (COP 2.5 ref.)",
  ng_vented_80: "Natural gas (vented, 80% AFUE)",
  propane_bulk_80: "Propane (bulk, vented)",
  propane_cyl_92: "Propane (cylinder)",
  diesel_78: "Diesel air heater",
};

type IndexRow = {
  state: string;
  city: string;
  perSeason: Record<SystemKey, number>;
  cheapest: SystemKey;
};

function buildGarageHeatIndex(): IndexRow[] {
  const rows: IndexRow[] = [];
  for (const [state, prices] of Object.entries(PRICES)) {
    const station = primaryStationForState(state);
    if (!station) continue; // no station data for this state -- left out rather than guessed
    const input = { ...EXAMPLE_A_INPUT, state, stationId: station.id, targetTemp: TARGET_TEMP };
    const envelope = resolveEnvelope(input);
    const design = heatLossDesign(input, envelope, station.h99, station.elevFt);
    const uaOut = design.uaExt;
    const uaHouse = input.attached ? WALL_U[envelope.wallType] * input.commonWallLen * input.height + HOUSE_COUPLING_UA : 0;
    const tBal = balancePoint(TARGET_TEMP, uaHouse, input.tHouse, uaOut);
    const seasonalMMBtu = seasonalLoadContinuous(station, tBal, uaOut) / 1e6;
    const monthsInSeason = Math.max(1, station.tMean.filter((t) => t < tBal).length);
    const costs = costsForSeasonalLoad(seasonalMMBtu, design.qSize, monthsInSeason, prices);
    const bySystem = Object.fromEntries(costs.map((c) => [c.system, c.perSeason])) as Record<SystemKey, number>;
    const cheapest = DISPLAY_SYSTEMS.reduce((best, sys) => (bySystem[sys] < bySystem[best] ? sys : best), DISPLAY_SYSTEMS[0]);
    rows.push({ state, city: station.city, perSeason: bySystem, cheapest });
  }
  return rows.sort((a, b) => a.state.localeCompare(b.state));
}

export default function Page() {
  const rows = buildGarageHeatIndex();
  const sources = ["eia-electric-power-monthly", "eia-ng-annual", "eia-propane-weekly"]
    .map((id) => getSource(id))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <p>
        Every row below is the same garage — a 24×24 ft attached two-car garage, R-13 walls, one uninsulated steel
        door, average drafts — held at 50°F all winter, priced at each state&apos;s own current electricity, natural
        gas and propane rates. Only the climate (the state&apos;s population-primary weather station) and the fuel
        prices change from row to row. See the <Link href="/garage-heater-calculator/methodology">methodology page</Link>{" "}
        for the load, balance-point and cost formulas behind every figure here.
      </p>
      <div className="not-prose my-6 flex flex-wrap gap-3">
        <ButtonLink href="/garage-heater-calculator">Size my garage →</ButtonLink>
        {/* TODO(W7 data desk): app/data/garage-heat-index.csv/route.ts is still the W0 header-only stub --
            swap in the real 51-row export once scripts/build-index.ts ships, per that route's own comment. */}
        <ButtonLink href="/data/garage-heat-index.csv" variant="secondary">
          Download CSV
        </ButtonLink>
      </div>

      <h2>The Garage Heat Index</h2>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">State</th>
              <th className="py-2 pr-3 font-normal">Station city</th>
              {DISPLAY_SYSTEMS.map((sys) => (
                <th key={sys} className="py-2 pr-3 font-normal">
                  {SYSTEM_LABEL[sys]}
                </th>
              ))}
              <th className="py-2 font-normal">Cheapest</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.state} className="border-b border-(--color-line)/50 align-top">
                <td className="py-2 pr-3 font-mono text-(--color-fg)">{r.state}</td>
                <td className="py-2 pr-3">{r.city}</td>
                {DISPLAY_SYSTEMS.map((sys) => (
                  <td key={sys} className="py-2 pr-3 font-mono whitespace-nowrap">
                    <Cost amount={r.perSeason[sys]} />
                  </td>
                ))}
                <td className="py-2 font-mono whitespace-nowrap">{SYSTEM_LABEL[r.cheapest]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-5 text-(--color-fg-2)">
        Electric and heat-pump prices are each state&apos;s current EIA residential rate; the heat pump column uses a
        reference <Num v={2.5} ev="C" src="costsForSeasonalLoad() default heatPumpSeasonalCop — lib/planner/fuels.ts" /> seasonal
        COP, not a bin-by-bin simulation for a specific unit. Natural gas and propane assume a vented, 80% AFUE unit
        heater. A season here runs from whichever month the garage first needs continuous heat through whichever
        month it stops, computed from each station&apos;s own balance-point temperature — not a fixed calendar
        window, so it&apos;s longer in cold states and shorter in warm ones.
      </p>

      <h2>Why the same garage costs so differently by state</h2>
      <p>
        Two things move independently here: how cold it gets (the station&apos;s own design temperature and monthly
        averages) and what a kWh, therm or gallon costs locally. A mild state with expensive electricity and a cold
        state with cheap electricity can land on a similar number for very different reasons — the table separates
        the two so neither one hides in a single blended figure.
      </p>
    </ReportPage>
  );
}
