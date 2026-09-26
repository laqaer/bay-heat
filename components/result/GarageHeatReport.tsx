import type { PlannerResult } from "@/lib/planner/types";
import { findProduct } from "@/lib/commerce/products";
import { route } from "@/lib/commerce/route";
import { GradeScale } from "@/components/figures/GradeScale";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { WarmupCurve } from "@/components/figures/WarmupCurve";
import { FitBar } from "@/components/commerce/FitBar";
import { WhyNot } from "@/components/commerce/WhyNot";
import { Cost } from "@/components/commerce/Cost";
import { Disclosure } from "@/components/commerce/Disclosure";
import { Callout } from "@/components/ui/Callout";
import { BuyButton } from "@/components/ui/ButtonLink";
import { SAFETY_SCOPE } from "@/lib/site";
import { btuh, kw, amps, commas } from "@/lib/format";

const CLASS_LABEL: Record<string, string> = {
  e_port_1500: "120V portable heater",
  e_ir_wall_1500: "120V infrared wall heater",
  e_240_4k: "240V hardwired heater, 4 kW",
  e_240_5k: "240V ceiling heater, 5 kW",
  e_240_7k5: "240V shop heater, 7.5 kW",
  e_240_10k: "240V unit heater, 10 kW",
  e_ir_240: "240V infrared ceiling heater",
  hp_diy_12k_115: "DIY mini-split, 12k",
  hp_12_24k_230: "Mini-split heat pump",
  g_unvented_buddy: "Buddy-type propane heater",
  g_vented_unit: "Vented gas unit heater",
  diesel_air: "Diesel air heater",
  k_unvented: "Kerosene convection heater",
  torpedo: 'Forced-air "torpedo" heater',
};

const SYSTEM_LABEL: Record<string, string> = {
  electric_resistance: "Electric resistance",
  heat_pump_cc: "Heat pump (cold-climate)",
  ng_vented_80: "Natural gas, vented 80%",
  propane_bulk_80: "Propane, bulk tank, vented 80%",
  propane_cyl_92: "Propane, cylinders, unvented 92%",
  diesel_78: "Diesel, 78%",
};

export function GarageHeatReport({ result }: { result: PlannerResult }) {
  return (
    <div className="not-prose">
      {/* 1. Readout card */}
      <section className="border border-(--color-line) bg-(--color-surface) p-6 shadow-[var(--shadow-result)] sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">
          {result.serial} · MODEL v{result.modelVersion} · PRICES AS OF {result.prices.asOf.elec}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="wdth-125 text-6xl font-black leading-none text-(--color-fg)">{result.heating.grade}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-(--color-fg)">
              {btuh(result.heating.qSize)} BTU/h <span className="text-(--color-fg-2)">· {kw(result.heating.kwSize)} kW</span>
            </p>
            <p className="mt-1 font-mono text-sm text-(--color-fg-2)">
              Band {btuh(result.heating.band.low)}–{btuh(result.heating.band.high)}
              {result.heating.band.unknowns > 0 ? ` (±${result.heating.band.unknowns} unknown${result.heating.band.unknowns > 1 ? "s" : ""})` : ""}
            </p>
          </div>
        </div>
        <GradeScale current={result.heating.grade} />
        {result.warmup.janMinutes != null ? (
          <p className="mt-3 text-[15px] text-(--color-fg-2)">
            Warm-up to {result.heating.tIn}°F: <span className="font-medium text-(--color-fg)">{Math.floor(result.warmup.janMinutes / 60)}h {result.warmup.janMinutes % 60}min</span> on {kw(result.warmup.kw)} kW
            (average January day).
          </p>
        ) : null}
        {result.heating.sanity === "check_inputs" ? (
          <Callout variant="safety" className="mt-4">
            Check inputs: this looks like an open or very leaky building ({Math.round(result.heating.btuhPerFt2)} BTU/h·ft²).
          </Callout>
        ) : null}
      </section>

      {/* 2. Fix it first */}
      {result.fixFirst ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-(--color-fg)">Fix it first: the shrinking heater</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-(--color-fg-2)">
            {result.fixFirst.measures.length} measure{result.fixFirst.measures.length > 1 ? "s" : ""}, about{" "}
            <Cost amount={result.fixFirst.cost} />, and the load drops from {btuh(result.fixFirst.qBefore)} to{" "}
            {btuh(result.fixFirst.qAfter)} BTU/h — grade {result.fixFirst.gradeBefore} → {result.fixFirst.gradeAfter}.
          </p>
          <p className="wdth-118 mt-3 text-2xl font-bold text-(--color-fg)">
            <Cost amount={result.fixFirst.cost} /> of fixes. Half the heater.
          </p>
          <ul className="mt-4 space-y-2">
            {result.insulateFirst
              .filter((r) => result.fixFirst!.measures.includes(r.measure))
              .map((row) => (
                <li key={row.measure} className="flex items-center justify-between gap-4 border-b border-(--color-line) py-2 text-[15px]">
                  <span className="flex items-center gap-2 text-(--color-fg)">
                    <input type="checkbox" defaultChecked readOnly className="tap-24" />
                    {row.measure.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-(--color-fg-2)">
                    pays back in {row.paybackYears.electric < 1 ? `${Math.round(row.paybackYears.electric * 12)} mo` : `${row.paybackYears.electric.toFixed(1)} yr`}
                  </span>
                </li>
              ))}
          </ul>
          <p className="mt-3 text-xs text-(--color-fg-2)">
            BayHeat cost assumption: median of manufacturer list and Home Depot/Lowe&apos;s prices checked 2026-09; not a live or Amazon price.
          </p>
          <p className="mt-1 text-sm text-(--color-fg-2)">
            Circuit: {result.circuits.forSize.breakerA}A / {result.circuits.forSize.wireNM} today.
          </p>
        </section>
      ) : (
        <section className="mt-10">
          <Callout variant="note">Your garage is already tight — insulating first wouldn&apos;t drop a circuit or equipment tier here.</Callout>
        </section>
      )}

      {/* 3. What fits */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">What fits</h2>
        <Disclosure />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {result.recommendations.map((r) => {
            const productId = r.productIds[0];
            const product = productId ? findProduct(productId) : undefined;
            const links = product ? route(product, "planner") : [];
            const primary = links.find((l) => l.slot === "primary") ?? links[0];
            const secondary = links.find((l) => l.slot === "secondary" || l.slot === "also");
            return (
              <div key={r.classId} className="flex flex-col gap-3 border border-(--color-line) bg-(--color-surface) p-5">
                <p className="font-bold text-(--color-fg)">{CLASS_LABEL[r.classId] ?? r.classId}</p>
                <p className="font-mono text-sm text-(--color-fg-2)">
                  {btuh(r.capacityBtuh)} BTU/h · {r.circuit ? `${r.circuit.volts}V/${r.circuit.breakerA}A, ${r.circuit.wireNM}` : "no new circuit"}
                </p>
                <FitBar pct={r.fitPct} />
                <p className="text-sm text-(--color-fg-2)">
                  <Cost amount={r.costPerHour} per="hr" /> · <Cost amount={r.perSeason} per="season" />
                </p>
                {r.safetyLine ? <p className="border-l-2 border-(--color-alarm) pl-2 text-xs text-(--color-alarm)">{r.safetyLine}</p> : null}
                <p className="text-xs text-(--color-fg-2)">{r.why}</p>
                {primary ? (
                  <BuyButton href={primary.href} className="mt-1 h-10 text-sm">
                    {primary.label}
                  </BuyButton>
                ) : null}
                {secondary ? (
                  <a href={secondary.href} target="_blank" rel="sponsored nofollow noopener" className="text-center text-xs text-(--color-link) underline">
                    {secondary.label}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
        <WhyNot rows={result.whyNot} />
      </section>

      {/* 4. Safety */}
      {result.warnings.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-(--color-fg)">Safety</h2>
          <p className="mt-1 text-sm text-(--color-fg-2)">{SAFETY_SCOPE}</p>
          <ul className="mt-4 space-y-3">
            {result.warnings.map((w, i) => (
              <li key={i} className="border-l-[3px] border-(--color-alarm) bg-(--color-surface) py-2 pl-4 text-[15px] leading-6 text-(--color-fg)">
                {w.text}{" "}
                <span className="ml-1 inline-block rounded-[2px] bg-(--color-fg) px-[4px] py-px align-middle font-mono text-[10px] font-semibold leading-none text-(--color-bg)">
                  {w.ev}
                </span>{" "}
                <span className="text-xs text-(--color-fg-2)">{w.cite}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 5. Where your heat goes */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">Where your heat goes</h2>
        <HeatLossBars items={result.heating.items} fig={2} />
      </section>

      {/* 6. Power it */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">Power it</h2>
        <div className="mt-4 border border-(--color-line) bg-(--color-surface) p-5">
          <p className="font-mono text-sm text-(--color-fg)">
            {result.circuits.forSize.breakerA}A breaker · {result.circuits.forSize.wireNM} (NM) or {result.circuits.forSize.wireTHHN} (THHN) ·{" "}
            {amps(result.circuits.forSize.amps)}
          </p>
          {result.circuits.panelCheck === "load_calc" ? (
            <p className="mt-2 text-sm text-(--color-alarm)">100A panel + a 30A+ heater: ask for an NEC load calculation (§220.83 / §120.83 — your local adopted edition governs).</p>
          ) : null}
          {result.circuits.notes.map((n, i) => (
            <p key={i} className="mt-2 text-sm text-(--color-fg-2)">
              {n}
            </p>
          ))}
        </div>
      </section>

      {/* 7. Price it */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">Price it</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
                <th className="py-2 font-normal">System</th>
                <th className="py-2 text-right font-normal">Per hour</th>
                <th className="py-2 text-right font-normal">Per month</th>
                <th className="py-2 text-right font-normal">Per season</th>
                <th className="py-2 text-right font-normal">Per MMBtu</th>
              </tr>
            </thead>
            <tbody>
              {result.costs.map((c) => (
                <tr key={c.system} className="border-b border-(--color-line)/50">
                  <td className="py-2 text-(--color-fg)">{SYSTEM_LABEL[c.system] ?? c.system}</td>
                  <td className="py-2 text-right font-mono">
                    <Cost amount={c.perHour} />
                  </td>
                  <td className="py-2 text-right font-mono">
                    <Cost amount={c.perMonth} />
                  </td>
                  <td className="py-2 text-right font-mono">
                    <Cost amount={c.perSeason} />
                  </td>
                  <td className="py-2 text-right font-mono">
                    <Cost amount={c.perMMBtu} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-(--color-fg-2)">Savings vary by climate, house and use.</p>
      </section>

      {/* 8. Warm-up curve */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">Warm-up</h2>
        <WarmupCurve curve={result.warmup.curve} minutesToTarget={result.warmup.janMinutes} fig={3} />
      </section>

      {/* 10. What we assumed */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-(--color-fg)">What we assumed</h2>
        <ul className="mt-3 space-y-2 text-sm text-(--color-fg-2)">
          {result.assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-(--color-link) underline">Show the math</summary>
          <div className="mt-3 space-y-1 font-mono text-xs text-(--color-fg-2)">
            <p>UA_ext: {commas(result.heating.uaExt)} BTU/h·°F ({result.heating.uaExtPerFt2.toFixed(3)}/ft²)</p>
            <p>
              Design: {result.heating.tIn}°F in, {result.heating.tOutDesign}°F out, ΔT {result.heating.deltaT.toFixed(1)}°F
            </p>
            <p>Station: {result.station.city}, {result.station.st}</p>
            {result.usage.tBal != null ? <p>Balance point: {result.usage.tBal.toFixed(1)}°F, HDD {result.usage.hddAtBal?.toFixed(0)}</p> : null}
          </div>
        </details>
      </section>

      {/* 11. Keep it */}
      <section className="mt-10 border-t border-(--color-line) pt-8">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="h-11 border border-(--color-fg)/25 px-4 text-sm text-(--color-fg)">
            Email me this report
          </button>
          <button type="button" className="h-11 border border-(--color-fg)/25 px-4 text-sm text-(--color-fg)">
            Alert me before the next hard freeze
          </button>
        </div>
        <p className="mt-4 text-sm text-(--color-fg-2)">Heat Report Pro opens Oct 15 · Notify me</p>
      </section>
    </div>
  );
}
