import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/electric-garage-heater-operating-cost")!;

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
  { id: "formula", label: "The kWh formula" },
  { id: "examples", label: "Nameplate examples" },
  { id: "duty-cycle", label: "Duty cycle and the thermostat" },
  { id: "portable-vs-bay", label: "1,500 W portable vs 5 kW bay" },
  { id: "forced-air-vs-ir", label: "Forced-air vs infrared" },
  { id: "bill", label: "Read the rate on your bill" },
  { id: "session", label: "A worked Saturday session" },
  { id: "caveats", label: "What this page will not claim" },
];

export default function OperatingCostGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="formula">The kWh formula</h2>
      <p>
        Electric resistance heat is a watt-hour problem. The nameplate tells
        you watts. Your clock (or the thermostat) tells you hours. Your utility
        bill tells you dollars per kilowatt-hour. That is the whole machine:
      </p>
      <ul>
        <li>
          <strong>kWh = (watts ÷ 1,000) × hours the element is on.</strong> A
          5,000 W heater running one full hour is 5 kWh. A 1,500 W portable
          running one full hour is 1.5 kWh.
        </li>
        <li>
          <strong>Cost = kWh × $/kWh.</strong> At an example $0.20/kWh, that
          hour is $1.00 on the 5 kW unit and $0.30 on the 1,500 W portable.
        </li>
      </ul>
      <p>
        Resistance heat is essentially 100% efficient at the point of use. The
        element turns nearly all of its watts into heat in the room. 240 V is
        not “cheaper electricity” than 120 V. Voltage does not change $/kWh. It
        only changes how many watts you can deliver without melting a 15 A
        receptacle. That circuit limit is{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>, not a
        rate discount.
      </p>
      <p>
        If a listing promises a monthly bill or a “saves $X versus propane”
        figure without your hours and your rate, it invented the inputs. We
        will not invent them either.
      </p>

      <Callout title="Example rates — use your bill">
        <p>
          The tables below use $0.12, $0.20, and $0.30 per kWh as brackets so
          you can see the arithmetic move. They are not a U.S. average, not
          your utility’s winter rate, and not a time-of-use schedule. Pull the
          supply + delivery number from a recent bill (or the online usage
          portal) and substitute it. If you are on time-of-use, use the period
          you actually heat in.
        </p>
      </Callout>

      <h2 id="examples">Nameplate examples at three example rates</h2>
      <p>
        These rows are common garage-heater nameplates, not a shopping list.
        The 3 / 4 / 5 kW steps match the jumper taps on Comfort Zone
        CZ220-class and Fahrenheat FUH54-class ceiling units. The 7.5 kW row
        is the next cabinet class — a different circuit, usually 8 AWG copper
        in that manual family. Costs are for <em>one hour at full nameplate</em>,
        which is the honest starting point before duty cycle.
      </p>

      <SpecTable
        caption="Example operating cost per hour at full nameplate. Rates are examples, not national averages."
        columns={[
          "Nameplate",
          "kWh per hour",
          "$0.12 / kWh",
          "$0.20 / kWh",
          "$0.30 / kWh",
        ]}
        rows={[
          ["1,500 W portable (120 V)", "1.5", "$0.18", "$0.30", "$0.45"],
          ["3,000 W ceiling tap", "3.0", "$0.36", "$0.60", "$0.90"],
          ["4,000 W ceiling tap", "4.0", "$0.48", "$0.80", "$1.20"],
          ["5,000 W ceiling / 5 kW class", "5.0", "$0.60", "$1.00", "$1.50"],
          ["7,500 W / 7.5 kW class", "7.5", "$0.90", "$1.50", "$2.25"],
        ]}
      />

      <p>
        Read the table left to right, then stop. A 5 kW unit at $0.30/kWh is
        $1.50 an hour <em>while the element is on</em>. It is not $1.50 for
        every clock hour you are in the garage. That is the next section.
        Wattage brackets for the bay itself live on{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          electric garage heater size
        </Link>
        .
      </p>

      <h2 id="duty-cycle">Duty cycle and the thermostat</h2>
      <p>
        Heaters do not run 100% once the bay is up to the setpoint. A
        thermostat (built-in or wall) cycles the element. Hours-on is a
        fraction of hours-occupied. That fraction is the duty cycle. Insulation
        and infiltration dominate it. A tight attached two-car with an
        insulated door and a 5 kW unit may sit at a modest duty cycle after
        warmup. The same 5 kW cabinet under a single-skin door with a crushed
        sill will stay closer to 100% and still feel like a carport.
      </p>
      <p>
        Two loads hide inside “it ran all morning”:
      </p>
      <ul>
        <li>
          <strong>First-hour / warmup.</strong> The slab, the cars, and the
          air start cold. The element is often on continuously until the air
          (or the bulb) catches up. That hour is close to the full-nameplate
          row in the table.
        </li>
        <li>
          <strong>Hold.</strong> After that, the thermostat is fighting
          envelope loss: door leaks, uninsulated planes, stack effect, and
          whatever you left open. Hours-on collapse if you sealed the
          building. They do not collapse if you bought more watts and left
          the threshold crushed. See{" "}
          <Link href="/insulate-garage-before-heater-upgrade">
            seal and insulate first
          </Link>
          .
        </li>
      </ul>
      <p>
        A worked hold, not a promise: if a 5 kW unit is on 40% of the time
        after warmup, you are paying for 2 kWh per clock hour (5 × 0.4), not
        5. At the example $0.20/kWh that is $0.40 per occupied hour to hold,
        plus whatever the warmup already used. Change the 40% and the dollar
        figure moves with it. We did not measure your garage. Weatherstrip
        and an insulated door change the 40% more reliably than a jumper tap.
      </p>
      <p>
        Setpoint matters the same way. Shirt-sleeve shop temperature against
        a 10 °F night is a different hours-on problem than “take the edge
        off” at 50 °F. We will not convert that into a fake monthly bill.
      </p>

      <h2 id="portable-vs-bay">1,500 W portable vs 5 kW 240 V</h2>
      <p>
        A 1,500 W milkhouse heater is cheaper per hour than a 5 kW ceiling
        unit because it is one-third the watts. At the example $0.20/kWh that
        is $0.30 versus $1.00 per full hour. That is not a bargain on bay
        heat. It is spot heat. The portable cannot deliver the{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          two-car wattage bracket
        </Link>
        . It warms a person and a small radius of air. The 5 kW hardwired
        unit is the common whole-bay tool — and it costs more to run because
        it is doing a bigger job.
      </p>
      <p>
        The 15 A / 120 V receptacle is the hard ceiling, not a pricing
        feature. Continuous-load practice puts that circuit near 1,440 W;
        1,500 W is 12.5 A and wants to be the only load. Details:{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          portable heaters on a 15 A circuit
        </Link>
        . The 5 kW class is typically 240 V, hardwired, 30 A two-pole, 10 AWG
        copper — see{" "}
        <Link href="/120v-vs-240v-garage-heater">voltage and breakers</Link>{" "}
        and{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount units under $200
        </Link>
        .
      </p>
      <p>
        Stacking two 1,500 W portables on one run does not give you 3 kW of
        honest bay heat. It gives you a tripped breaker and a fire risk. If
        the job is the bay, the next adult step is a dedicated 240 V circuit
        (if the panel can take it), not a second milkhouse heater.
      </p>

      <h2 id="forced-air-vs-ir">Forced-air vs infrared: same watts, different hours</h2>
      <p>
        A watt is a watt at the meter. Forced-air and infrared convert nearly
        all of their nameplate watts into heat. Same watts, same $/kWh, same
        cost <em>while the element is on</em>. The fork is whether you need
        those watts for fewer hours because you only occupy a beam.
      </p>
      <p>
        Infrared can feel warmer with fewer hours-on if the job is one person
        at a bench, a detail bay with the door up, or a high leaky shop where
        heating the cubic feet is a losing war. You still pay for every watt
        the quartz or panel draws. You may pay for fewer clock hours because
        you stop trying to hold 60 °F air in an open volume. Forced-air is
        the better default when the door is closed and you want the space
        itself less miserable — and then duty cycle is an envelope problem
        again.
      </p>
      <p>
        That split is the whole of{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>
        . Do not buy IR because a listing implied it “uses less electricity”
        at the same nameplate. Buy it if you are heating a person instead of
        a room.
      </p>

      <h2 id="bill">Read the rate on your bill</h2>
      <p>
        “The” U.S. residential rate does not exist on this page. Bills bundle
        generation, transmission, distribution, riders, and sometimes a
        fixed customer charge that does not move with kWh. For this math you
        want the <strong>volumetric</strong> number: what one extra kWh costs
        you this month, all-in. Ways that go wrong:
      </p>
      <ul>
        <li>
          Using only the generation line and ignoring delivery. Delivery is
          often as large as supply.
        </li>
        <li>
          Using a summer bill to price a January heater, or the reverse, on
          a utility with seasonal rates.
        </li>
        <li>
          Ignoring time-of-use. A 5 kW unit on a 4–9 p.m. peak is a
          different dollar figure than the same unit at 10 a.m. Saturday.
        </li>
        <li>
          Treating the fixed monthly charge as part of $/kWh. The heater
          does not change that line.
        </li>
      </ul>
      <p>
        Crude but usable: take the variable charges on the bill, divide by
        kWh used, and use that as your example rate. Then multiply by the
        kWh you actually attribute to the heater (nameplate × hours-on). If
        your utility publishes an “all-in” ¢/kWh on the statement, use that
        and skip the division.
      </p>

      <h2 id="session">A worked Saturday session</h2>
      <p>
        Assumptions, labeled as assumptions: 5 kW ceiling unit, example
        $0.20/kWh, one warmup hour at 100% on, then three occupied hours at
        40% duty cycle, door closed. That is 5 + (5 × 3 × 0.4) = 11 kWh, or
        $2.20 for the session. Change any input and the dollar figure is
        yours, not ours.
      </p>

      <SpecTable
        caption="Example Saturday session at $0.20/kWh. Duty cycle and hours are assumptions, not measurements."
        columns={["Segment", "Hours on (assumed)", "kWh", "Cost at $0.20"]}
        rows={[
          ["Warmup at 5 kW, 100% on", "1.0", "5.0", "$1.00"],
          ["Hold, 3 clock hours at 40% duty", "1.2", "6.0", "$1.20"],
          ["Session total (example)", "2.2", "11.0", "$2.20"],
          ["Same session on a 1,500 W portable at 100%", "4.0", "6.0", "$1.20"],
        ]}
      />

      <p>
        The portable row is cheaper because it is 1.5 kW, not because it
        heated the bay. If you only needed the bench, $1.20 for four hours
        of spot heat may be the honest spend. If you needed the two-car to
        feel like a room, the $2.20 session is the 5 kW job — and only if
        the 40% hold is real. A drafty door can push the hold toward the
        full $1.00/hour row for all three hours. That is infiltration, not
        a defective heater. Fix the envelope before you treat $4–$5 as
        “what 5 kW costs.”
      </p>
      <p>
        Scale that session across a month and you still do not have a
        national average. Twenty such Saturdays at $2.20 is $44 at this
        example rate and this example duty cycle. Ten evenings of
        warmup-only (one hour, 5 kWh) is $20. We will not pick one of
        those and call it “typical.” Multiply your hours by your rate.
      </p>

      <h2 id="caveats">What this page will not claim</h2>
      <ul>
        <li>
          <strong>No “saves $X/month.”</strong> We do not know your hours,
          setpoint, climate, or rate. Anyone who states a monthly savings
          without those inputs is writing fiction.
        </li>
        <li>
          <strong>No coverage claims.</strong> Cost-per-hour is not “heats
          up to X sq ft.” Size the bay on the{" "}
          <Link href="/best-electric-garage-heaters-by-size">size guide</Link>
          . Do not repeat manufacturer square-foot copy as a bill estimate.
        </li>
        <li>
          <strong>The panel still gates the install.</strong> A cheap-to-run
          1,500 W portable is still a 15 A problem. A 5 kW unit is still
          about 20.9 A at 240 V on a 30 A two-pole. A 7.5 kW unit is about
          31 A. Operating cost does not create spare slots in a 100 A
          service that already feeds a range, dryer, HVAC, and an EV
          charger. Hire a licensed electrician for new 240 V work.
        </li>
        <li>
          <strong>No affiliate buy buttons on this page.</strong> Retailer
          links elsewhere on the site are still placeholders until programs
          are live. We are not tagging a heater SKU to “prove” a kWh
          number.
        </li>
      </ul>
      <p>
        Next: if you do not know the circuit, start at{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>. If
        the bay stays cold after you can do the kWh math, the hours-on
        problem is usually{" "}
        <Link href="/insulate-garage-before-heater-upgrade">
          the envelope
        </Link>
        , not a missing review score. If you only occupy a bench, stay on{" "}
        <Link href="/portable-garage-heaters-15a-circuit">15 A portables</Link>{" "}
        or{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          directed radiant
        </Link>{" "}
        and stop paying to heat cubic feet you are not standing in.
      </p>
    </GuideChrome>
  );
}
