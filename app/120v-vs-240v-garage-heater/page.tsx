import type { Metadata } from "next";
import Link from "next/link";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/120v-vs-240v-garage-heater")!;

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
  { id: "continuous", label: "The 80% continuous-load rule" },
  { id: "what-120-can-do", label: "What 120 V can do" },
  { id: "what-240-means", label: "What 240 V actually means" },
  { id: "breaker-wire", label: "Breakers and wire" },
  { id: "hardwired", label: "Hardwired vs plug-in" },
  { id: "panel", label: "Panel capacity" },
];

export default function VoltageGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="continuous">The 80% continuous-load rule</h2>
      <p>
        A space heater that runs for three hours or more is a continuous load in
        ordinary electrical practice. Branch-circuit conductors and overcurrent
        devices for continuous loads are typically sized so the load is not more
        than 80% of the circuit rating (NEC 210.19 / 210.20 and related
        language; local code can be stricter).
      </p>
      <p>That single sentence is why garage-heater shopping goes wrong:</p>
      <ul>
        <li>
          <strong>15 A × 120 V × 0.8 = 1,440 W.</strong> A 1,500 W heater draws
          12.5 A — over the continuous ceiling — and wants to be the only load
          on that circuit.
        </li>
        <li>
          <strong>20 A × 120 V × 0.8 = 1,920 W.</strong> Still a portable /
          utility heater, not a bay heater. Confirm the receptacle and breaker
          actually are 20 A; many garage outlets are 15 A on a 15 A breaker.
        </li>
        <li>
          <strong>30 A × 240 V × 0.8 = 5,760 W.</strong> This is why the common
          5,000 W ceiling unit (about 20.9 A at 240 V) is specified with a 30 A
          two-pole breaker.
        </li>
      </ul>
      <p>
        These are planning numbers, not a substitute for the heater’s
        installation sheet or an electrician’s load calculation.
      </p>

      <SpecTable
        caption="Approximate continuous wattage ceilings by common residential circuits"
        columns={["Circuit", "Voltage", "Continuous ceiling (80%)", "What it usually buys"]}
        rows={[
          ["15 A general receptacle", "120 V", "~1,440 W", "Milkhouse / utility / ceramic portable"],
          ["20 A garage receptacle", "120 V", "~1,920 W", "Larger portable; still spot heat"],
          ["30 A two-pole dedicated", "240 V", "~5,760 W", "5 kW Comfort Zone / Fahrenheat-class ceiling"],
          ["40 A two-pole dedicated", "240 V", "~7,680 W", "7.5 kW class unit heater"],
          ["50–60 A two-pole", "240 V", "~9.6–11.5 kW", "Larger commercial unit heaters"],
        ]}
      />

      <h2 id="what-120-can-do">What 120 V can do</h2>
      <p>
        120 V is the outlet on the wall. It is excellent for a milkhouse heater
        at a bench, an oil-filled radiator in a small insulated 1-car, or
        keeping pipes from freezing in a mild climate. It is a poor way to heat
        400–600 ft² of air. Physics does not care that the box says “garage.”
      </p>
      <p>
        Garage receptacles on modern residential codes are GFCI-protected. A
        1,500 W heater is a common nuisance-trip source, especially on a shared
        circuit with a freezer, opener, or charger. If the heater trips the
        GFCI, that is the protection doing its job or a dirty/damp environment —
        do not defeat the GFCI.
      </p>
      <p>
        Details and product classes:{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          portable heaters on a 15 A circuit
        </Link>
        .
      </p>

      <h2 id="what-240-means">What 240 V actually means</h2>
      <p>
        240 V residential heat is two hots and a ground (and sometimes a
        neutral, depending on the unit). It is not “twice as efficient.”
        Resistance heat is essentially 100% efficient at the point of use on
        either voltage. 240 V is how you deliver more watts without doubling the
        current on a 120 V conductor. Dollars per kWh do not change with
        voltage — see{" "}
        <Link href="/electric-garage-heater-operating-cost">
          what those watts cost to run
        </Link>
        .
      </p>
      <p>
        A 5,000 W heater at 240 V is about 20.9 A. The same 5,000 W at 120 V
        would be about 41.7 A — not something you plug into a garage outlet.
        That is the entire reason the Comfort Zone CZ220-class and Fahrenheat
        FUH54-class units are hardwired 240 V appliances.
      </p>
      <p>
        If your panel has no spare two-pole slots, or the service is already
        tight, the heater conversation is a service/panel conversation first.
        See <Link href="/best-electric-garage-heaters-by-size">sizing by bay</Link>{" "}
        before you buy the unit.
      </p>

      <h2 id="breaker-wire">Breakers and wire, in the language of the manuals</h2>
      <p>
        Manufacturer sheets for the common 5 kW ceiling units are unusually
        consistent:
      </p>
      <ul>
        <li>
          Comfort Zone CZ220-class: 5,000 / 4,000 / 3,000 W at 208–240 V; 20.9 /
          16.7 / 12.5 A; recommended 30 A breaker; 10 AWG copper.
        </li>
        <li>
          Fahrenheat FUH54C-class: 5,000 W at 240 V is 20.9 A with a 30 A
          maximum fuse; 10 AWG copper minimum; aluminum wire prohibited in the
          manual. Jumpers can derate the element.
        </li>
        <li>
          7.5 kW FUH-class units call for 8 AWG copper in the same manual
          family. That is a different circuit than the 5 kW aisle unit.
        </li>
      </ul>
      <p>
        Wire size, insulation temperature rating, and run length are the
        electrician’s job. Do not upsize a heater onto an existing 20 A / 240 V
        dryer circuit “because it is 240.” Dryer circuits, EVSE, welders, and
        heaters are not interchangeable without checking the load, the
        receptacle type, and the code path.
      </p>

      <h2 id="hardwired">Hardwired vs plug-in</h2>
      <p>
        Plug-in 240 V garage heaters exist (NEMA 6-30 and similar). They still
        need a correctly rated receptacle on a dedicated circuit. Most of the
        sub-$200 ceiling units are{" "}
        <strong>direct-wired</strong>: no cord, no plug, no extension cord, no
        relocatable power tap. The Comfort Zone CZ220 manual says that in those
        words.
      </p>
      <p>
        If you are not comfortable landing 10 AWG copper on a terminal block and
        hanging 25–30 lb from a joist, this is a licensed electrician install.
        That is not a legal disclaimer for its own sake; it is how those units
        are designed.
      </p>
      <p>
        The longer install-type fork — Saturday 120 V plug-in, corded 240 V on
        a listed receptacle, versus true hardwire — is{" "}
        <Link href="/hardwired-vs-plugin-garage-heater">
          hardwired vs plug-in
        </Link>
        .
      </p>

      <h2 id="panel">Panel capacity is the hidden constraint</h2>
      <p>
        A 5 kW heater is a 20.9 A continuous-ish 240 V load. A 7.5 kW unit is
        about 31 A. Two 5 kW units are two 30 A two-pole breakers. On a 100 A
        service with a range, dryer, HVAC, and EV charger, that may not fit
        without a load calculation. We will not pretend every suburban panel has
        a free 30 A two-pole waiting.
      </p>
      <p>
        If the panel cannot take the load, the useful options are: a smaller
        heater plus{" "}
        <Link href="/insulate-garage-before-heater-upgrade">insulation</Link>,{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          infrared at the bench
        </Link>
        , or a different heat source. Buying a 5 kW unit and feeding it from a
        lighting circuit is how garages burn.
      </p>
    </GuideChrome>
  );
}
