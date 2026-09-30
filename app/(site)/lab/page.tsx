import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";
import type { GarageInput } from "@/lib/planner/types";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/lab")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

// The BH-004 scenario: our standard 24x24 example after the three cheap fix-first measures (weatherstrip,
// door kit, ceiling insulation) -- this is the garage BH-004 will actually test a 5 kW class against, so its
// predicted warm-up curve comes from plan() run on this envelope, not the as-is one.
const SEALED_INPUT: GarageInput = {
  ...EXAMPLE_A_INPUT,
  ceilingIns: "R30",
  garageDoors: [{ w: 16, h: 7, type: "steel_eps_1_375" }],
  tightness: "tight",
};

export default function Page() {
  const asIs = plan(EXAMPLE_A_INPUT);
  const sealed = plan(SEALED_INPUT);
  const doorKit = asIs.insulateFirst.find((r) => r.measure === "door_kit_eps");
  const weatherstrip = asIs.insulateFirst.find((r) => r.measure === "weatherstrip");
  const dieselCost = asIs.costs.find((c) => c.system === "diesel_78");
  const electricCost = asIs.costs.find((c) => c.system === "electric_resistance");

  return (
    <ReportPage entry={entry} sources={[]}>
      <p>
        The Lab is where a hypothesis gets a published prediction before anyone measures anything. Every test
        below is <strong>pre-registered</strong>: the model&apos;s number goes up first, so a later physical
        result can be checked against it instead of quietly matched to it.
      </p>
      <p>
        <strong>No physical test has run yet.</strong> Nothing on this page carries an M (measured) evidence
        mark. Everything below is R (a published rule, quoted) or C (computed by our model) — a prediction,
        not a result.
      </p>

      <h2>Test board</h2>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Protocol</th>
              <th className="py-2 pr-3 font-normal">Hypothesis</th>
              <th className="py-2 pr-3 font-normal">Model&apos;s prediction</th>
              <th className="py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 font-mono whitespace-nowrap text-(--color-fg)">P-002</td>
              <td className="py-3 pr-3">A door kit plus weatherstrip, sealed together, cut heat loss enough to matter on their own.</td>
              <td className="py-3 pr-3">
                {doorKit ? (
                  <>
                    Door kit: <Num v={doorKit.dQDesign} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).insulateFirst — door_kit_eps — lib/planner/roi.ts" /> (
                    <Num v={doorKit.pctOfLoad} unit="%" ev="C" src="plan(EXAMPLE_A_INPUT).insulateFirst — door_kit_eps.pctOfLoad" />
                    ).{" "}
                  </>
                ) : null}
                {weatherstrip ? (
                  <>
                    Weatherstrip: <Num v={weatherstrip.dQDesign} unit="BTU/h" round={100} ev="C" src="plan(EXAMPLE_A_INPUT).insulateFirst — weatherstrip — lib/planner/roi.ts" /> (
                    <Num v={weatherstrip.pctOfLoad} unit="%" ev="C" src="plan(EXAMPLE_A_INPUT).insulateFirst — weatherstrip.pctOfLoad" />
                    ). Predicted independently — not a sum, since sealing both at once changes each other&apos;s draft path.
                  </>
                ) : null}
              </td>
              <td className="py-3 font-mono whitespace-nowrap">PRE-REGISTERED</td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 font-mono whitespace-nowrap text-(--color-fg)">P-003</td>
              <td className="py-3 pr-3">A small diesel air heater isn&apos;t cheaper to run than electric resistance at typical prices, and it puts combustion byproducts into the garage.</td>
              <td className="py-3 pr-3">
                {dieselCost && electricCost ? (
                  <>
                    On this garage&apos;s design load: diesel about{" "}
                    <Num v={dieselCost.perHour} unit="$/h" round={0.01} ev="C" src="plan(EXAMPLE_A_INPUT).costs — diesel_78.perHour — lib/planner/fuels.ts" />, electric resistance about{" "}
                    <Num v={electricCost.perHour} unit="$/h" round={0.01} ev="C" src="plan(EXAMPLE_A_INPUT).costs — electric_resistance.perHour" />, at this week&apos;s prices. CO output isn&apos;t modeled — that&apos;s what the test measures.
                  </>
                ) : null}
              </td>
              <td className="py-3 font-mono whitespace-nowrap">PRE-REGISTERED</td>
            </tr>
            <tr className="border-b border-(--color-line)/50 align-top">
              <td className="py-3 pr-3 font-mono whitespace-nowrap text-(--color-fg)">P-004</td>
              <td className="py-3 pr-3">A measured warm-up curve tracks the model&apos;s predicted curve within its stated error budget.</td>
              <td className="py-3 pr-3">
                For the sealed version of our standard example (door kit, weatherstrip and ceiling insulation applied), the model sizes a{" "}
                <Num v={sealed.warmup.kw} unit="kW" round={0.1} ev="C" src="plan(SEALED_INPUT).warmup.kw — lib/planner/warmup.ts" /> class and predicts{" "}
                <Num v={sealed.warmup.janMinutes ?? 0} unit="min" ev="C" src="plan(SEALED_INPUT).warmup.janMinutes" /> to reach{" "}
                {SEALED_INPUT.targetTemp}°F from a January cold start.
              </td>
              <td className="py-3 font-mono whitespace-nowrap">PRE-REGISTERED</td>
            </tr>
            <tr className="align-top">
              <td className="py-3 pr-3 font-mono whitespace-nowrap text-(--color-fg)">P-005</td>
              <td className="py-3 pr-3">An unvented propane heater (Big Buddy class) raises indoor humidity measurably compared to electric heat, since burning propane releases water vapor as a byproduct.</td>
              <td className="py-3 pr-3">
                No number predicted — our model doesn&apos;t compute humidity. This test sets the baseline instead of checking one.
              </td>
              <td className="py-3 font-mono whitespace-nowrap">PRE-REGISTERED</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">Nothing running right now. Every row above is a prediction, waiting on an instrument.</p>

      <h2>Published so far</h2>
      <p>
        <Link href="/lab/reports/bh-001-the-4x-problem">BH-001, &quot;The 4× problem&quot;</Link> is a computed report, not a physical
        test — it compares published sizing rules to our own model&apos;s spread across four real envelopes of
        the same garage. Every model release, price refresh and correction is dated in the{" "}
        <Link href="/lab/notebook">Lab notebook</Link>.
      </p>

      <h2>Instruments on hand</h2>
      <p>
        None yet. This list grows the day a purchase receipt is posted, with its address redacted — not
        before. A phase-1 kit (thermal camera, a clamp meter, CO/CO₂ monitors) is planned but not yet bought.
      </p>

      <h2>Evidence marks</h2>
      <p>
        Every number on this site carries a mark: <strong>M</strong> measured (a published log exists),{" "}
        <strong>C</strong> computed by our model, <strong>S</strong> from a manufacturer spec, <strong>R</strong> a
        published reference or code citation, <strong>E</strong> a labeled estimate. Nothing on this page is
        marked M.
      </p>

      <h2>Safety, before any physical test runs</h2>
      <SafetyCallout>
        <p>
          A combustion test (diesel, propane) runs only in a detached garage, with CO alarms placed in any
          adjoining building, and is logged remotely with the tester outside. Any detectable carbon monoxide
          ends the test immediately. No torpedo heater runs indoors, ever, on this site or off it. A protocol
          is reviewed before it&apos;s run, not after.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>

      <Callout variant="note">
        Report a problem with anything on this page — a wrong number, a broken link, a claim we should
        walk back — and it goes in the notebook within 72 hours, or 24 for a safety issue.
      </Callout>
    </ReportPage>
  );
}
