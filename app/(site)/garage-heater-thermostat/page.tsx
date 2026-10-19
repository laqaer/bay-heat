import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import type { Source } from "@/lib/types/evidence";

const entry = findPage("/garage-heater-thermostat")!;
export const metadata: Metadata = pageMetadata({ path: entry.href, title: entry.title, description: entry.description });

const extraSources: Source[] = [
  { id: "king-kbp-controls", title: "King KBP: built-in, line-voltage and 24 V control variants", publisher: "King Electric", url: "https://king-electric.com/product/model-kbp/", retrieved: "2026-10-19" },
  { id: "stelpro-swt-install", title: "Stelpro SWT1/SWT2 installation guide", publisher: "Stelpro", url: "https://www.stelpro.com/wp-content/uploads/produits/documents/INS/INS_SWT_I_EN.pdf", retrieved: "2026-10-19" },
  { id: "inkbird-c226t-manual", title: "C216T/C226T manual (specifications on printed page 5)", publisher: "INKBIRD", url: "https://www.inkbird.com/pages/c216t-c226t-manual", retrieved: "2026-10-19" },
  { id: "bnlink-t9-manual", title: "T9 manual (Ratings and Warning, PDF page 3)", publisher: "BN-LINK", url: "https://cdn.shopify.com/s/files/1/0018/2521/0421/files/T9_6ec17827-57c8-44d1-bae3-46a0148af64d.pdf?v=10084942878889316384", retrieved: "2026-10-19" },
  { id: "cpsc-portable-heat", title: "Winter safety: portable heaters", publisher: "U.S. Consumer Product Safety Commission", url: "https://www.cpsc.gov/Newsroom/News-Releases/2026/Keep-Warm-and-Safe-This-Winter-Tips-for-Using-Generators-Furnaces-and-Space-Heaters", retrieved: "2026-10-19" },
];
const sources = ["stelpro-swt", "cadet-t522-guide", "ct410b-manual"].map(id => getSource(id)!).concat(extraSources);

export default function Page() {
  return (
    <ReportPage entry={entry} sources={sources}>
      <Callout variant="safety">Review draft. Human editorial and qualified electrical sign-off remain pending. These controls are not approved pairings for your heater.</Callout>
      <AnswerBlock>
        Many hardwired garage heaters already have a built-in thermostat. Check the exact heater manual before
        buying an external control: it may call for direct line-voltage switching, a specified control circuit,
        or a manufacturer-approved low-voltage interface. A current rating alone does not establish compatibility.
      </AnswerBlock>

      <h2>Check the heater&apos;s control arrangement first</h2>
      <p>
        A 24 V thermostat must never carry the heater&apos;s 120 V or 240 V supply load. That does not exclude
        low-voltage control of an electric heater: King&apos;s KBP range includes models with a 24 V remote
        thermostat provision. Other models use line-voltage controls. A smart thermostat is suitable only when
        the exact heater and interface instructions support it. Do not add a relay or interrupt the heater&apos;s
        supply based on a generic diagram; the specified controls may need to preserve fan operation and safety functions.
      </p>
      <p>
        A properly rated single-pole control can regulate temperature when the heater instructions permit it.
        A double-pole control with a positive-off position can open both supply legs at that position. Do not
        assume both poles open during every temperature cycle, or use the thermostat knob as proof that wiring
        is safe to touch. The thermostat&apos;s supply side can remain live. Have the electrician isolate the circuit
        at the required disconnect and verify absence of voltage before work.
      </p>

      <h2>What the published ratings establish</h2>
      <p>
        For a purely resistive load at its stated voltage, current is watts divided by volts. At 240 V,
        4,000 W is <Num v={4000 / 240} unit="A" ev="C" src="4000 W / 240 V, resistive-load illustration" />,
        5,000 W is <Num v={5000 / 240} unit="A" ev="C" src="5000 W / 240 V, resistive-load illustration" />,
        and 7,500 W is <Num v={7500 / 240} unit="A" ev="C" src="7500 W / 240 V, resistive-load illustration" />.
        A 22 A resistive rating at 240 V corresponds to <Num v={5280} unit="W" ev="C" src="22 A × 240 V" />.
        These are arithmetic comparisons, not installation approvals. Use the complete heater nameplate load
        and the thermostat&apos;s voltage, load-type and motor ratings; element wattage alone may omit a fan motor.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead><tr><th className="p-2">Control</th><th className="p-2">Manufacturer rating</th><th className="p-2">Limits to check</th></tr></thead>
          <tbody>
            <tr className="border-t border-(--color-line)"><td className="p-2">Stelpro SWT2F</td><td className="p-2">22 A, 120–277 V AC; 1/2 hp</td><td className="p-2">Double-pole, off position; published Fahrenheit dial 50–90°F. Confirm the exact heater permits this control.</td></tr>
            <tr className="border-t border-(--color-line)"><td className="p-2">Cadet T522-W</td><td className="p-2">22 A at 120 V or 208–240 V AC; 18 A at 277 V; 1/6 hp</td><td className="p-2">Left stop is off. Copper conductors only. Not where gasoline, paint or flammable liquids are stored.</td></tr>
            <tr className="border-t border-(--color-line)"><td className="p-2">Honeywell CT410B, reference only</td><td className="p-2">22 A at 120–240 V AC; 19 A at 277 V; noninductive rating</td><td className="p-2">Double-line break; 40–80°F range. Its rating is not interchangeable with an unrestricted motor-load rating.</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The Stelpro and Cadet ratings were confirmed in their own documents. Neither is a universal
        recommendation for a 5,000 W garage heater. A 7,500 W resistive load at 240 V exceeds a 22 A direct-switching
        rating; a manufacturer-approved control circuit may carry a different current. This guide does not choose
        a breaker, conductor size or contactor. The installer must check the nameplate, instructions, applicable
        local code edition, load duration and required circuit protection.
      </p>

      <h2>Installation and sensor placement</h2>
      <p>
        Use a licensed electrician for hardwired work. Stelpro calls for qualified installation under applicable
        codes; Cadet requires an electrical box, correct connections and copper conductors. Obtain any required
        local permit. Cadet warns that the thermostat has arcing parts and must not be used where gasoline,
        paint or flammable liquids are stored. Garage suitability is not established by the word “garage” on a shopping page.
      </p>
      <p>
        Honeywell&apos;s CT410 instructions describe an inside-wall location about 5 ft above the floor and
        warn that drafts or radiant heat affect readings. Follow the placement instructions for the control
        actually installed, away from the heater&apos;s discharge, direct sun and misleading drafts. That CT410
        placement is not a universal mounting rule for every sensor.
      </p>

      <h2>A thermostat is not a freeze-protection guarantee</h2>
      <p>
        Water&apos;s ordinary freezing point is 32°F, but the thermostat senses its own location, not the coldest
        pipe. The CT410B&apos;s published range begins at 40°F; the SWT2F specification lists 50–90°F. Cadet&apos;s
        T522 left stop is off, whereas the different single-pole T521 has an approximately 41°F left-stop setting.
        None of those facts guarantees that every part of a garage stays above freezing. Check cold locations,
        account for power loss and heater failure, and use a suitable monitored freeze-protection plan.
      </p>

      <h2>Why the plug-in shopping picks were removed</h2>
      <p>
        A controller&apos;s advertised wattage does not establish that a portable heater may be connected to it.
        CPSC advises plugging portable electric heaters directly into a wall outlet and turning them off while
        sleeping. An intermediate controller is not an exception to the heater&apos;s instructions, its attended-use
        restrictions, or circuit limits. Do not use an extension cord, power strip or plug adapter to make a pairing fit.
      </p>
      <p>
        INKBIRD&apos;s C226T documentation specifies 1,800 W at 120 V and combines multiple regional versions;
        the generic manual also lists a maximum 16 A while the checked U.S. listing says 15 A. BN-LINK&apos;s T9
        manual specifies 125 V AC, 15 A/1,875 W resistive or general-purpose load, with separate load limits.
        Its waterproof probe does not make its controller waterproof; the manual restricts it to indoor use
        away from wet locations. The controller listing and manual are not evidence of an approved pairing
        with a particular garage heater. No plug-in heater/controller pairing is recommended here.
      </p>
      <p>
        At 120 V, a 1,500 W resistive load draws 12.5 A. This calculation alone does not authorize use on a
        particular branch circuit; removing other plugged-in loads does not turn a multi-outlet circuit into
        an individual branch circuit. Have the circuit and the exact equipment checked before relying on it.
      </p>
      <p>These are document checks, not hands-on testing, product certifications or installation approval. The heater manual, control instructions and applicable local requirements govern.</p>
    </ReportPage>
  );
}
