import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/best-ceiling-mount-garage-heaters-under-200")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: guide.href },
  openGraph: {
    title: guide.h1,
    description: guide.description,
    url: guide.href,
    type: "article",
  },
};

const toc = [
  { id: "class", label: "What “under $200” actually is" },
  { id: "matrix", label: "Comparison matrix" },
  { id: "comfort-zone", label: "Comfort Zone CZ220-class" },
  { id: "fahrenheat", label: "Fahrenheat FUH54-class" },
  { id: "not-this", label: "What this aisle is not" },
  { id: "retailers", label: "Retailer / affiliate placeholders" },
];

export default function CeilingGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="class">What “under $200” actually is</h2>
      <p>
        The consumer ceiling-mount garage heater under $200 is a small club:
        hardwired, 240 V, fan-forced, roughly 5 kW, steel cabinet, tilt
        bracket, listed (ETL or UL family). Comfort Zone CZ220 / CZ220G and
        Fahrenheat FUH54 / FUH54C are the two names you will keep seeing. They
        are the same job. Street prices wander from well under $200 to a bit
        over, depending on season and seller. We treat “under $200” as a{" "}
        <strong>class</strong>, not a live price guarantee.
      </p>
      <p>
        We do not publish star ratings, “editor scores,” or invented square-foot
        coverage. The useful differences are on the nameplate and in the
        installation sheet: wattage taps, amps, breaker, copper size, mounting
        height, and whether heat is switched or jumpered.
      </p>
      <Callout title="Install reality">
        <p>
          These units are not plug-and-play. Plan a dedicated 240 V two-pole
          circuit, typically 30 A and 10 AWG copper for the 5 kW setting,
          joist-rated mounting, and the clearances in the manual (combustibles
          are often a 3 ft conversation). If that is not familiar work, hire a
          licensed electrician.
        </p>
      </Callout>

      <h2 id="matrix">Comparison matrix</h2>
      <p>
        Figures below are from current-generation installation literature for
        these classes (Comfort Zone CZ220 series sheet; Fahrenheat FUH54C /
        FUH series manual). Confirm the revision you buy — suffixes change.
      </p>

      <SpecTable
        caption="Hardwired ceiling utility heaters in the sub-$200 shopping class"
        columns={[
          "Class",
          "Typical models",
          "Voltage",
          "Wattage taps",
          "Amps at max / 240 V",
          "Overcurrent (manual)",
          "Copper",
          "Heat adjustment",
          "Mount / throw",
        ]}
        rows={[
          [
            "Comfort Zone 5 kW ceiling",
            "CZ220 / CZ220G and siblings",
            "208–240 V, 1Ø, hardwired",
            "3,000 / 4,000 / 5,000 W",
            "12.5 / 16.7 / 20.9 A",
            "30 A or larger recommended",
            "10 AWG Cu",
            "Front switch positions I / II / III plus dual-knob thermostat",
            "Ceiling bracket, tilt, louvers; ~18 ft horizontal throw",
          ],
          [
            "Fahrenheat 5 kW ceiling",
            "FUH54 / FUH54C",
            "240 / 208 V, 1Ø, hardwired",
            "5,000 / 4,165 / 3,332 / 2,500 W at 240 V (jumper table)",
            "20.9 A at 5,000 W",
            "30 A max fuse at 5 kW / 240 V; lower if derated",
            "10 AWG Cu min; no aluminum",
            "Element jumpers; mounting height 6–11 ft (see sheet)",
            "Ceiling or wall bracket; ~18 ft horizontal throw",
          ],
          [
            "7.5 kW step-up (usually not this aisle)",
            "FUH72-class and similar",
            "240 V hardwired",
            "7,500 W class",
            "~31 A",
            "Larger than 30 A; not a 5 kW circuit",
            "8 AWG Cu in the FUH family manual",
            "Same family of jumper / tap options",
            "Same mounting idea; more panel capacity required",
          ],
        ]}
      />

      <h2 id="comfort-zone">Comfort Zone CZ220-class</h2>
      <p>
        The CZ220 series is a heavy-gauge steel, fan-forced, ceiling-mount
        utility heater. The published switch table is clean: 5,000 W / 20.9 A,
        4,000 W / 16.7 A, 3,000 W / 12.5 A at 208–240 V, plus fan-only. The
        sheet recommends a 30 A (or larger) breaker, 10 AWG copper, and
        hardwired installation. Approximate product weight is 25–30 lb.
      </p>
      <p>
        Why people pick it: the wattage switch is on the unit, so you can
        derate without opening a jumper diagram. The thermostat is on the
        front. Louvers and a tilt bracket let you aim at a bay or a door.
        Whether that bracket belongs on joists or a wall is{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall-mount vs ceiling-mount
        </Link>
        .
      </p>
      <p>
        Why it still fails in the field: it is 5 kW of air. In an uninsulated
        two-car with the door open it will feel weak. That is the{" "}
        <Link href="/best-electric-garage-heaters-by-size">size and envelope</Link>{" "}
        problem, not a defect unique to Comfort Zone.
      </p>

      <h2 id="fahrenheat">Fahrenheat FUH54-class</h2>
      <p>
        Fahrenheat (Marley Engineered Products) FUH54C is the other standard
        5 kW ceiling / wall unit. Factory default is 5,000 W at 240 V (17,065
        BTU/h, 20.9 A, 30 A max fuse). The manual’s jumper table lets you step
        down to 4,165 / 3,332 / 2,500 W at 240 V, with matching fuse sizes. 208 V
        taps are listed separately and produce less heat — 208 V is not “the
        same 5 kW.”
      </p>
      <p>
        The same manual family tells you to use 10 AWG copper minimum for 5 kW
        and 8 AWG for 7.5 kW, copper only, 75 °C insulation, no aluminum. Mounting
        height and wall-clearance tables are in the sheet; do not invent a
        height from a blog post.
      </p>
      <p>
        Practical difference versus CZ220-class: more granular factory derate
        via jumpers, a longer commercial paper trail, and (depending on the
        exact revision) a less “consumer knob” control story. It is not a
        different heating technology.
      </p>

      <h2 id="not-this">What this aisle is not</h2>
      <ul>
        <li>
          <strong>Not a 120 V product.</strong> If you only have a 15 A outlet,
          you want{" "}
          <Link href="/portable-garage-heaters-15a-circuit">portables</Link>,
          not a ceiling unit with the plug cut off.
        </li>
        <li>
          <strong>Not infrared.</strong> These are fan-forced. Read{" "}
          <Link href="/forced-air-vs-infrared-garage-heater">
            forced-air vs infrared
          </Link>{" "}
          before you hang one in a door-open shop.
        </li>
        <li>
          <strong>Not a 7.5 kW unit on a 30 A / 10 AWG circuit.</strong> The
          FUH72-class needs the larger copper and breaker the manual calls for.
        </li>
        <li>
          <strong>Not a scored “best of 12.”</strong> We will not invent a #1.
          If two units share 5 kW / 20.9 A / 30 A / 10 AWG, pick on controls,
          listing, current street price, and whether you want a switch or
          jumpers.
        </li>
      </ul>

      <h2 id="retailers">Retailer and affiliate placeholders</h2>
      <p>
        Affiliate programs are not wired on this launch. When they are, outbound
        links will be labeled and will use tracked retailer URLs. Until then,
        treat the rows below as a shopping checklist, not a buy button.
      </p>

      <SpecTable
        caption="Placeholder retailer rows — no live affiliate URLs yet"
        columns={["Class", "What to verify on the listing", "Affiliate / retailer link"]}
        rows={[
          [
            "Comfort Zone CZ220-class",
            "Hardwired 240 V, 3000/4000/5000 W, 30 A guidance, ETL mark, included bracket",
            "Placeholder — retailer URL not live",
          ],
          [
            "Fahrenheat FUH54C-class",
            "FUH54 / FUH54C, 5000 W @ 240 V, jumper derate table, copper-only warning, listing mark",
            "Placeholder — retailer URL not live",
          ],
          [
            "7.5 kW step-up",
            "Confirm 8 AWG / larger breaker; do not assume it fits a 5 kW circuit or a $200 budget",
            "Placeholder — retailer URL not live",
          ],
        ]}
      />
      <p>
        Voltage and circuit recap:{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>.
        Cord versus a landed circuit is the{" "}
        <Link href="/hardwired-vs-plugin-garage-heater">
          hardwired vs plug-in
        </Link>{" "}
        fork — do not treat this aisle as a plug-in.
      </p>
    </GuideChrome>
  );
}
