import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { WhyNot } from "@/components/commerce/WhyNot";
import { FitBar } from "@/components/commerce/FitBar";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { GradeScale } from "@/components/figures/GradeScale";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { plan } from "@/lib/planner/plan";
import { heatLossDesign } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } from "@/lib/planner/fixtures";

const entry = findPage("/ceiling-mount-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["cz220-manual", "fuh54-manual", "dr975-manual", "irc-2021", "nec-2023"];

export default function Page() {
  const result = plan(EXAMPLE_A_INPUT);
  const qSize = result.heating.qSize;
  const grade = result.heating.grade;

  // A second, sealed-and-insulated pass on the same worked example (real heatLossDesign() call, not a guess):
  // R-30 ceiling insulation plus a tight envelope, used below to show what a 5 kW unit actually needs to work with.
  const tOut = designTempFor(EXAMPLE_A_INPUT, EXAMPLE_A_STATION);
  const sealedInput = { ...EXAMPLE_A_INPUT, ceilingIns: "R30" as const, tightness: "tight" as const };
  const sealed = heatLossDesign(sealedInput, resolveEnvelope(sealedInput), tOut, EXAMPLE_A_STATION.elevFt);

  const fitPct5kw = (17060 / qSize) * 100;
  const fitPct75kw = (25597 / qSize) * 100;

  const cz220 = findProduct("cz220-5kw-ceiling")!;
  const fuh54 = findProduct("fuh54-5kw")!;
  const dr975 = findProduct("dr975-7k5-shop")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A 5 kW ceiling class (<Num f="cz220.btuh.high" />) needs an <Num f="cz220.clearance_wall_in" /> wall clearance, a
        ceiling under <Num f="cz220.max_ceiling_ft" />, and at least <Num f="cz220.clearance_floor_ft" /> of headroom
        below it. A 7.5 kW shop unit adds a <Num f="dr975.clearance_side_ft" /> side and{" "}
        <Num f="dr975.clearance_back_in" /> back clearance. Both run on a dedicated 240 V circuit sized off the
        nameplate, not a guess.
      </AnswerBlock>

      <Disclosure />

      <h2>What a ceiling heater in this spot actually has to cover</h2>
      <p>
        For BayHeat&apos;s standard worked example — a 24×24 ft attached 2-car garage in Chicago, R-13 walls, one
        uninsulated steel door — the design load comes to{" "}
        <Num v={qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign() on EXAMPLE_A_INPUT, h99 design temp" /> (
        <Num v={result.heating.kwSize} unit="kW" round={0.1} ev="C" src="heatLossDesign().kwSize" />
        ), grade <strong>{grade}</strong>.
      </p>
      <HeatLossBars items={result.heating.items} fig={1} />
      <GradeScale current={grade} />
      <p>
        A single 5 kW ceiling unit (<Num f="cz220.btuh.high" />) covers about{" "}
        <Num v={fitPct5kw} unit="%" round={1} ev="C" src="cz220.btuh.high / heatLossDesign().qSize" /> of that load on
        its own — it won&apos;t keep up in the coldest week without a second unit or a lower-U ceiling. A 7.5 kW shop
        unit (<Num f="dr975.btuh" />) gets closer, at about{" "}
        <Num v={fitPct75kw} unit="%" round={1} ev="C" src="dr975.btuh / heatLossDesign().qSize" />.
      </p>
      <FitBar pct={fitPct5kw} />
      <FitBar pct={fitPct75kw} />
      <Callout variant="fix">
        Bringing the ceiling to R-30 and sealing the envelope drops this same garage to about{" "}
        <Num v={sealed.qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign() with ceilingIns: R30, tightness: tight" /> (
        <Num v={sealed.kwSize} unit="kW" round={0.1} ev="C" src="heatLossDesign().kwSize, sealed case" />
        ), grade {sealed.grade} — inside what a single 5 kW ceiling unit can hold. See{" "}
        <a href="/how-to-insulate-a-garage">how to insulate a garage in payback order →</a>
      </Callout>

      <h2>Mounting height, throw, and clearances from the manuals</h2>
      <p>
        A ceiling heater&apos;s numbers come from its own manual, not a rule of thumb. The two 5 kW units below use
        different clearance figures even though they put out nearly the same heat:
      </p>
      <table>
        <thead>
          <tr>
            <th>Spec</th>
            <th>CZ220 (5 kW)</th>
            <th>DR-975 (7.5 kW)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Output</td>
            <td>
              <Num f="cz220.btuh.high" />
            </td>
            <td>
              <Num f="dr975.btuh" />
            </td>
          </tr>
          <tr>
            <td>Rated throw</td>
            <td>
              <Num f="cz220.throw_ft" /> (manual says approximate)
            </td>
            <td>—</td>
          </tr>
          <tr>
            <td>Clearance from wall</td>
            <td>
              <Num f="cz220.clearance_wall_in" />
            </td>
            <td>—</td>
          </tr>
          <tr>
            <td>Clearance from floor</td>
            <td>
              <Num f="cz220.clearance_floor_ft" />
            </td>
            <td>
              <Num f="dr975.clearance_floor_ft" />
            </td>
          </tr>
          <tr>
            <td>Max ceiling height</td>
            <td>
              <Num f="cz220.max_ceiling_ft" />
            </td>
            <td>—</td>
          </tr>
          <tr>
            <td>Clearance, sides</td>
            <td>—</td>
            <td>
              <Num f="dr975.clearance_side_ft" />
            </td>
          </tr>
          <tr>
            <td>Clearance, back wall</td>
            <td>—</td>
            <td>
              <Num f="dr975.clearance_back_in" />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        A dash means the manufacturer&apos;s manual doesn&apos;t publish that figure for this unit — don&apos;t
        assume it matches the other row.
      </p>
      <p>
        Federal residential building code adds a floor: <Num f="code.irc.m1307_3" /> (<Num f="code.nec.424_4_b" /> also
        applies — a hardwired heater is a continuous load, so the breaker and wire are sized at 125% of the actual
        draw, not the nameplate amps alone). Your electrician and your local code edition govern.
      </p>

      <h2>The two ceiling classes, and what each is built for</h2>
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V CEILING · 5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Comfort Zone CZ220 / Fahrenheat FUH54</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="cz220.btuh.high" /> at <Num f="cz220.watts.high" />, on a{" "}
            <Num f="circuit.5000w240v.breaker" />. Best for an insulated 2-car garage, or a bare one once it&apos;s
            sealed.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{cz220.safetyLine?.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <BuyButton href={route(cz220, "site")[0].href}>Check CZ220 price on Amazon ↗</BuyButton>
            <a
              href={route(fuh54, "site")[0].href}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="text-sm text-(--color-link) underline underline-offset-4"
            >
              or the FUH54 ↗
            </a>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {cz220.priceClass} / {fuh54.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V CEILING/WALL SHOP · 7.5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Dr. Infrared DR-975</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="dr975.btuh" /> at <Num f="dr975.watts" />, on a <Num f="circuit.7500w240v.breaker" />. Fits a larger
            or leakier 2–3 car garage without doubling up units.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{dr975.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(dr975, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {dr975.priceClass}</p>
        </div>
      </div>

      <WhyNot
        rows={[
          ...result.whyNot.filter((r) => r.classId === "e_port_1500"),
          { classId: "g_unvented_buddy", text: "A propane radiant unit is never rated to hang from a ceiling — it's a floor-standing, attended-use tool, not a fixed installation." },
        ]}
      />

      <h2>Safety at the point of installation</h2>
      <SafetyCallout />
      <p>
        Both ceiling classes above are electric resistance, not combustion — but the 18 in ignition-source floor still
        matters for any garage that also has, or might later get, a fuel-fired appliance sharing the space. Check{" "}
        <a href="/can-i-run-it">Can I run this heater in my garage? →</a> for a verdict specific to your circuit and
        what&apos;s stored in the garage.
      </p>

      <h2>Next step</h2>
      <p>
        <a href="/garage-heater-calculator">Run your own garage through the planner →</a> for a load, grade and
        circuit sized to your dimensions, not the worked example above.
      </p>
    </ReportPage>
  );
}
