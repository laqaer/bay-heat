import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { fitsCordAndPlug } from "@/lib/planner/electrical";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/portable-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["nec-2023", "cz798-manual", "hs1500tt-manual"];

export default function Page() {
  // Live calls against the same fitsCordAndPlug() the calculator uses -- not a hand-typed yes/no.
  const fitsShared15 = fitsCordAndPlug(1500, 120, 15);
  const fitsShared20 = fitsCordAndPlug(1500, 120, 20);

  const cz798 = findProduct("cz798-1500w-milkhouse")!;
  const hs1500tt = findProduct("hs1500tt-wall-infrared")!;
  const generic = findProduct("e-port-1500-generic")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A 1,500W portable heater draws <Num f="circuit.1500w120v.amps" /> — above the{" "}
        <Num f="circuit.120v15a.continuous_a" /> cord-and-plug limit on a 15A circuit shared with other outlets (
        <Num f="code.nec.210_23_a_1" />). As the only thing plugged into that circuit it&apos;s fine; on a dedicated
        20A garage circuit it&apos;s comfortable either way.
      </AnswerBlock>

      <Disclosure />

      <h2>What your garage&apos;s circuit can actually carry</h2>
      <p>
        A 1,500W heater at 120V draws <Num f="circuit.1500w120v.amps" />. Run through the same{" "}
        <code>fitsCordAndPlug()</code> check the calculator uses, that current comes out{" "}
        {fitsShared15 ? "under" : "over"} the 80% cord-and-plug cap on a 15A circuit that also feeds other outlets —{" "}
        {fitsShared15 ? "it fits." : "it doesn't fit."}
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Circuit</th>
              <th className="py-2 pr-3 font-normal">Cord-and-plug limit</th>
              <th className="py-2 font-normal">1,500W heater fits?</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3 text-(--color-fg)">15A, shared with other outlets</td>
              <td className="py-3 pr-3 font-mono">
                <Num f="circuit.120v15a.continuous_a" />
              </td>
              <td className="py-3 font-mono">{fitsShared15 ? "Yes" : "No"}</td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3 text-(--color-fg)">15A, heater is the sole load</td>
              <td className="py-3 pr-3 font-mono">—</td>
              <td className="py-3 font-mono">Yes, per the heater&apos;s own manual</td>
            </tr>
            <tr>
              <td className="py-3 pr-3 text-(--color-fg)">20A, dedicated garage circuit</td>
              <td className="py-3 pr-3 font-mono">
                <Num v={16} unit="A" ev="C" src="20A x 0.8 cord-and-plug cap, NEC 210.23(A)(1) — 1,920W / 120V" />
              </td>
              <td className="py-3 font-mono">{fitsShared20 ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Most garages already have the third row: <Num f="code.nec.210_11_c_4" />. If yours does, a 1,500W portable
        heater has plenty of headroom on it.
      </p>

      <Callout variant="safety">
        Every heater on this page ships with a manual instruction to be the <strong>only</strong> thing plugged into
        its circuit — {cz798.safetyLine?.text} That instruction is what makes the 15A sole-load row above hold; skip
        it and you&apos;re back to the shared-circuit math, which doesn&apos;t fit.
      </Callout>

      <h2>Three 1,500W portables, side by side</h2>
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">120V · MILKHOUSE · 1,500W</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Comfort Zone CZ798</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="cz798.watts" /> at <Num f="cz798.amps" />. Floor-standing, fan-forced.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{cz798.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(cz798, "site")[0].href}>Check CZ798 price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {cz798.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">120V · WALL INFRARED · 1,500W</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Heat Storm HS-1500-TT</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="hs1500tt.watts" />, wall-mounted at <Num f="hs1500tt.mount_height_in_us" /> minimum, with{" "}
            <Num f="hs1500tt.clearance_side_in" /> side clearance.
          </p>
          <div className="mt-3">
            <BuyButton href={route(hs1500tt, "site")[0].href}>Check HS-1500-TT price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {hs1500tt.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4 sm:col-span-2">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">120V · GENERIC · 1,500W</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Any UL-listed 1,500W portable utility heater</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            No verified nameplate on file for a specific model here — the 12.5A figure above comes from{" "}
            <Num f="circuit.1500w120v.amps" />, the standard 1,500W/120V draw, not a manual.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{generic.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(generic, "site")[0].href}>Search 1,500W portable heaters ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {generic.priceClass}</p>
        </div>
      </div>

      <h2>Two things not to do</h2>
      <p>
        <strong>Don&apos;t run it on an extension cord.</strong> A 1,500W load pulls <Num f="circuit.1500w120v.amps" />{" "}
        continuously through a cord rated for far less than a fixed receptacle, and the connection heats up at every
        plug and splice — the failure mode is a melted cord or an arcing connection, not just a tripped breaker.
        Plug directly into a wall receptacle every time.
      </p>
      <p>
        <strong>Don&apos;t run two heaters off one 15A circuit.</strong> Two 1,500W heaters together draw{" "}
        <Num v={25} unit="A" ev="C" src="2 x circuit.1500w120v.amps (two 1,500W/120V loads on one circuit)" /> —
        already over a 20A breaker&apos;s rating, let alone a 15A one. If you need more heat than one portable
        unit gives you, that&apos;s a sign to move up a class, not add a second cord to the same outlet. See{" "}
        <Link href="/240v-garage-heater">240V garage heaters →</Link> for the hardwired classes built for that.
      </p>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          <Num f="code.nec.210_8_a" /> requires GFCI protection on the receptacle any of these heaters plugs into.
          Keep the heater a safe distance from anything flammable, per its own manual, and never leave it running
          unattended overnight. Your electrician and your local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
    </ReportPage>
  );
}
