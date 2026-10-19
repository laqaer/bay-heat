import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { SourceLink } from "@/components/evidence/SourceLink";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { QuickPick } from "@/components/commerce/QuickPick";
import { BuyButton } from "@/components/ui/ButtonLink";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getFact, getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { circuitFor } from "@/lib/planner/electrical";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/garage-heater-thermostat")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const BUY_IDS = ["stelpro-swt2f", "cadet-t522-w", "inkbird-c226t-plugin", "bnlink-t9-plugin"] as const;

const SOURCE_IDS = ["nec-2023", "stelpro-swt", "cadet-t522-guide", "ct410b-manual"];

export default function Page() {
  const lineA = Number(getFact("t522.amps")!.value);
  const lineW = lineA * 240;
  const c4 = circuitFor(4000, 240, 240);
  const c5 = circuitFor(5000, 240, 240);
  const c75 = circuitFor(7500, 240, 240);
  const c15 = circuitFor(1500, 120, 120);
  const plugA = 15;
  const plugW120 = plugA * 120;
  const plugW125 = plugA * 125;

  const products = BUY_IDS.map((id) => {
    const product = findProduct(id)!;
    const links = route(product, "site", entry.href);
    const primary = links.find((l) => l.slot === "primary") ?? links[0];
    return { product, primary };
  });

  const rows = [
    { label: "4,000W at 240V", spec: c4, note: "under a 22A control" },
    { label: "5,000W at 240V", spec: c5, note: "under a 22A control" },
    { label: "7,500W at 240V", spec: c75, note: "over a 22A control" },
  ];

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A hardwired 240V garage heater needs a line-voltage thermostat. A 24V furnace thermostat cannot carry
        this load. A 5,000W heater draws <Num f="circuit.5000w240v.amps" /> at 240V. A{" "}
        <Num f="t522.amps" /> double-pole control covers that draw. It does not cover a 7,500W heater.
      </AnswerBlock>

      <QuickPick
        productId="stelpro-swt2f"
        page={entry.href}
        headline="Double-pole line voltage, rated 22 A. Match it to the heater's running current, then have a licensed electrician wire it."
        compareHref="#buy"
        compareLabel="See line-voltage and plug-in picks"
      />

      <Disclosure />

      <h2>Line voltage, not a 24V stat</h2>
      <p>
        A low-voltage thermostat switches a control signal. The gas unit heater on the{" "}
        <Link href="/natural-gas-garage-heater">natural gas page</Link> uses 24V terminals for that. A hardwired
        electric heater has no control board waiting for that signal. The thermostat is in the power wires, so it
        has to be rated for the heater&apos;s voltage and its running amps.
      </p>
      <p>
        Double-pole means the control opens both hot legs. A single-pole control opens one. On a 240V circuit both
        legs are hot, so the wall control for that heater is the double-pole model, the one with a real off stop.
        The Honeywell CT410B manual is the plain version of that split: CT410A is single-line break, CT410B is
        double-line break, and both are rated <Num f="ct410b.amps" /> at 120–240V. Honeywell&apos;s store lists
        CT410B1017 as discontinued, and the Amazon listings checked on 2026-10-19 were unavailable, so it is not a
        buy link here. The Stelpro and Cadet picks below are the same 22A class.
      </p>

      <h2>Match the amps, not the breaker</h2>
      <p>
        NEC 2023 treats a fixed electric heater as a continuous load (<Num f="code.nec.424_4_b" />). The breaker
        and the wire are sized at 125% of the running current. That is why a 5,000W heater lands on a 30A breaker
        on the <Link href="/240v-garage-heater">240V garage heater page</Link>. The thermostat is matched to the
        running current, not to that breaker.
      </p>
      <p>
        <Num f="t522.amps" /> at 240V is <Num v={lineW} unit="W" ev="C" src="t522.amps × 240 V" />. The Stelpro SWT
        is the same <Num f="swt2f.amps" />. A 5,000W heater draws <Num v={c5.amps} unit="A" ev="C" src="circuitFor(5000, 240, 240).amps" />,
        which is under 22A. A 7,500W heater draws <Num v={c75.amps} unit="A" ev="C" src="circuitFor(7500, 240, 240).amps" />,
        which is over 22A. Read the heater nameplate before you buy the control.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Heater</th>
              <th className="py-2 pr-3 font-normal">Running current</th>
              <th className="py-2 font-normal">22A double-pole control</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-(--color-line)/50">
                <td className="py-3 pr-3 text-(--color-fg)">{row.label}</td>
                <td className="py-3 pr-3 font-mono">
                  <Num v={row.spec.amps} unit="A" ev="C" src={`circuitFor running current for ${row.label}`} />
                </td>
                <td className="py-3 text-(--color-fg)">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout variant="safety">
        Hardwired line voltage is electrical work. Hire a licensed electrician. Cadet&apos;s guide says the work has
        to meet the NEC and state and local codes, and to call an electrician if you are not comfortable doing it.
        The Honeywell manual says not to install the control unless you are completely familiar with house wiring.
        Whether your city wants a permit is a local question. Ask before anyone opens the wall. This page has no
        wiring diagram. The heater manual and the thermostat instructions differ by model, and those are the ones
        that apply.
      </Callout>

      <h2>Keep it out of the heater&apos;s air</h2>
      <p>
        The CT410B manual says to mount the thermostat about <Num f="ct410b.mount_height_ft" /> above the floor, on
        an inside wall. Drafts or radiant heat throw the reading off, and the fix in that manual is to move it. A
        garage heater&apos;s discharge is both moving air and radiant heat. If the sensor sits in that blast, it
        reaches its setpoint while the rest of the garage is still cold, and the heater short-cycles. Put the
        wall control where the heater does not blow on it, off the door, and out of the sun.
      </p>

      <h2>Freeze protection is not 32°F on the dial</h2>
      <p>
        Water freezes at <Num v={32} unit="°F" ev="R" src="Freezing point of water" />. The sensor reads the air
        where it hangs, not the pipe in the corner, so a setpoint at freezing can leave a colder spot below
        freezing. The CT410B dial runs from <Num f="ct410b.temp_low_f" /> to <Num f="ct410b.temp_high_f" />, so
        40°F is a mark on that control. The Stelpro SWT dial runs from <Num f="swt2f.temp_low_f" /> to{" "}
        <Num f="swt2f.temp_high_f" />, so 40°F is not a setting on it. Its coldest hold is 50°F.
      </p>
      <p>
        On the Cadet double-pole T522, the left stop turns the heater off. It is not a published 40°F hold. The
        single-pole T521&apos;s left stop is about{" "}
        <Num v={41} unit="°F" ev="S" src="Cadet T521/T522 owner's guide: T521 leftmost is about 41°F; T522 leftmost is off" />.
        That is a different model from the T522 linked below. Set the dial, then check a thermometer out of the
        heater&apos;s air before you trust the garage to stay above freezing.
      </p>

      <h2>Plug-in controllers stop at 15A</h2>
      <p>
        A plug-in thermostat is an outlet controller for a 120V cord, not a substitute for the wall control above.
        A 15A rating at 120V is <Num v={plugW120} unit="W" ev="C" src="15 A × 120 V" />. The same 15A at 125V is{" "}
        <Num v={plugW125} unit="W" ev="C" src="15 A × 125 V" />. The Inkbird listing title is 15A / 1,800W. The
        BN-LINK listing title is 15A / 1,875W at 125V. Neither number is a lab result from this site.
      </p>
      <p>
        A 1,500W portable draws <Num v={c15.amps} unit="A" ev="C" src="circuitFor(1500, 120, 120).amps" />, which
        is under 15A. It is still over the <Num f="circuit.120v15a.continuous_a" /> continuous cord-and-plug cap
        on a 15A circuit shared with other outlets (<Num f="code.nec.210_23_a_1" />,{" "}
        <Num f="circuit.120v15a.continuous_w" />). The controller does not raise that cap. On the{" "}
        <Link href="/portable-garage-heater">portable garage heater page</Link>, a 1,500W heater has to be the only
        load, plugged straight into the receptacle when the manual says so. A controller in the cord is allowed
        only when that heater&apos;s manual allows it. It does not make an attended-use portable safe to leave
        running overnight. For heat you can leave on, use a hardwired heater and the line-voltage control above.
        The classes live on the <Link href="/electric-garage-heater">electric garage heater page</Link>.
      </p>

      <h2 id="buy">Picks</h2>
      <p>
        Two double-pole line-voltage stats, then two plug-in outlet controllers. Price is a class, not a live
        number. Check the retailer&apos;s page before you buy.
      </p>
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        {products.map(({ product, primary }) => (
          <div key={product.id} className="border border-(--color-line) bg-(--color-surface) p-4">
            <p className="font-medium text-(--color-fg)">{product.name}</p>
            {product.safetyLine ? (
              <p className="mt-2 text-xs text-(--color-alarm)" data-source={product.safetyLine.sourceId}>
                {product.safetyLine.text}
                <SourceLink sourceId={product.safetyLine.sourceId} />
              </p>
            ) : null}
            <div className="mt-3">{primary ? <BuyButton href={primary.href}>{primary.label}</BuyButton> : null}</div>
            <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {product.priceClass}</p>
          </div>
        ))}
      </div>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          A line-voltage thermostat is part of the heater circuit. The amp rating has to cover the heater&apos;s
          running current, and a licensed electrician does the hardwired work. A plug-in controller stays inside
          its own amp rating and inside the circuit rules on the portable page. Cadet&apos;s guide also says not to
          use the thermostat where gasoline, paint, or flammable liquids are stored.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
    </ReportPage>
  );
}
