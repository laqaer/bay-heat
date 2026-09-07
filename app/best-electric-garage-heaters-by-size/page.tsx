import type { Metadata } from "next";
import Link from "next/link";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/best-electric-garage-heaters-by-size")!;

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
  { id: "how-to-read-ranges", label: "How to read these ranges" },
  { id: "one-car", label: "1-car garages" },
  { id: "two-car", label: "2-car garages" },
  { id: "three-car", label: "3-car garages" },
  { id: "insulation", label: "Insulation caveats" },
  { id: "what-to-read-next", label: "What to read next" },
];

export default function SizeGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="how-to-read-ranges">How to read these ranges</h2>
      <p>
        People quote “10 watts per square foot” as if it were a code table. It is
        a rough starting point for a reasonably insulated garage with an 8-foot
        ceiling in a moderate climate. It is not a Manual J load calculation, and
        it is not a manufacturer guarantee.
      </p>
      <p>Use it as a bracket, then move the number for the building you actually have:</p>
      <ul>
        <li>
          <strong>Insulated walls, ceiling, and door, decent weatherstrip:</strong>{" "}
          about 8–10 W/ft² to take the edge off, more if you want shirt-sleeve
          shop temperatures in a cold climate.
        </li>
        <li>
          <strong>Partial insulation or a leaky door:</strong> about 12–15 W/ft²,
          and you may still lose the battle when the door is open.
        </li>
        <li>
          <strong>Uninsulated walls, open rafters, single-layer door:</strong>{" "}
          15–20+ W/ft² is common, and buying more watts is often worse value than
          insulating the door and sealing the sill.
        </li>
        <li>
          <strong>Ceilings over ~10 ft, or a shop that is more cube than room:</strong>{" "}
          add load. Forced-air stratifies; infrared cares less about the cubic
          feet above your head.
        </li>
      </ul>
      <p>
        A 1,500 W / 120 V heater is a workbench or 1-car spot heater. It is not
        sized for a two-car bay. That limit is{" "}
        <Link href="/120v-vs-240v-garage-heater">the circuit</Link>, not the
        marketing copy.
      </p>

      <SpecTable
        caption="Typical garage footprints and electric wattage brackets"
        columns={["Bay", "Typical footprint", "Insulated bracket", "Drafty / uninsulated", "Usual voltage"]}
        rows={[
          [
            "1-car",
            "200–300 ft² (about 12×20 to 14×22)",
            "2–4 kW",
            "4–6+ kW, or heat the bench instead",
            "120 V only for spot heat; 240 V for the whole bay",
          ],
          [
            "2-car",
            "400–600 ft² (about 20×20 to 24×24)",
            "4–6 kW",
            "6–10+ kW, often two units or a 7.5 kW class",
            "Dedicated 240 V",
          ],
          [
            "3-car",
            "600–900+ ft²",
            "6–10 kW",
            "Often beyond one cheap ceiling unit",
            "240 V; plan the panel, not just the heater",
          ],
        ]}
      />

      <h2 id="one-car">1-car garages</h2>
      <p>
        A typical one-car bay is 200–300 ft². If the walls and door are insulated
        and you are taking the chill off — not trying to match the house
        thermostat — a 2–4 kW electric unit is the usual conversation. That
        already exceeds a 15 A / 120 V receptacle on a continuous basis.
      </p>
      <p>
        Practical paths:
      </p>
      <ul>
        <li>
          <strong>Spot heat only:</strong> a portable or milkhouse heater on a
          15 A or 20 A / 120 V circuit. See{" "}
          <Link href="/portable-garage-heaters-15a-circuit">
            portable heaters on 15 A
          </Link>
          .
        </li>
        <li>
          <strong>Whole-bay heat:</strong> a hardwired 240 V ceiling or wall unit
          in the 3–5 kW class, which is the same hardware discussed in{" "}
          <Link href="/best-ceiling-mount-garage-heaters-under-200">
            ceiling-mount units under $200
          </Link>
          . Ceiling versus wall is{" "}
          <Link href="/wall-mount-vs-ceiling-garage-heater">
            joist load, throw, and headroom
          </Link>
          .
        </li>
      </ul>
      <p>
        If the one-car garage is a converted workspace with finished walls, you
        can often land on the low end of the range. If it is a detached shed with
        a thin door, treat it as the uninsulated column even if the floor plan
        says “1-car.”
      </p>

      <h2 id="two-car">2-car garages</h2>
      <p>
        Most attached two-car garages are about 400–600 ft². The internet’s
        favorite 5,000 W / 240 V ceiling heater is aimed at this box —{" "}
        <em>if</em> the envelope is not a sieve. 400 ft² × 10 W/ft² is 4 kW;
        500 ft² × 12 W/ft² is 6 kW. That is why the Comfort Zone / Fahrenheat
        5 kW class shows up in every aisle and still disappoints in an
        uninsulated Midwest garage with the door cracked for a car.
      </p>
      <p>
        If the bay is insulated and you work with the door closed, one 5 kW
        forced-air unit on a 30 A / 240 V circuit is a common, honest match. If
        the door is open a lot, or the walls are bare studs, either add
        insulation or switch the problem to{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          infrared spot heat
        </Link>{" "}
        at the bench. A second 5 kW unit is possible; it is also a second 30 A
        two-pole breaker and a panel conversation.
      </p>

      <h2 id="three-car">3-car garages</h2>
      <p>
        Three-car and “2-car plus shop” spaces are 600–900+ ft². An insulated
        version can still be a 7.5–10 kW electric job (often two 5 kW units or a
        larger commercial unit heater). An uninsulated version is where people
        buy a 5 kW ceiling heater, run it all winter, and conclude electricity
        “doesn’t work.” The heater is working. The building is leaking.
      </p>
      <p>
        Before you size a 10 kW electric load, look at the panel: that is on the
        order of 40 A at 240 V before diversity and continuous-load derating.
        Many houses do not have a spare 40–60 A of 240 V capacity sitting unused.
        Gas or a mini-split is sometimes the adult answer; this site stays on
        electric resistance so the comparison stays honest.
      </p>

      <h2 id="insulation">Insulation caveats that change the wattage more than brand</h2>
      <ul>
        <li>
          <strong>The garage door is usually the largest hole.</strong> An
          uninsulated door can undo a correctly sized heater. Weatherstrip and an
          insulated door often beat a jump from 5 kW to 7.5 kW. The sequence is
          on{" "}
          <Link href="/insulate-garage-before-heater-upgrade">
            seal and insulate first
          </Link>
          .
        </li>
        <li>
          <strong>Concrete and vehicles are thermal mass.</strong> A cold slab
          and two parked cars will drink the first hour of heat. That is why
          first-start feels weak even when the wattage is right.
        </li>
        <li>
          <strong>Infiltration beats BTUs.</strong> An open door, a missing
          threshold, or a leaky man-door turns a forced-air heater into a very
          expensive fan. See{" "}
          <Link href="/forced-air-vs-infrared-garage-heater">
            forced-air vs infrared
          </Link>
          .
        </li>
        <li>
          <strong>Manufacturer “up to X sq ft” claims assume a sealed, insulated
          room.</strong> We do not repeat those as facts. Use the wattage
          brackets above, then read the nameplate and the manual.
        </li>
      </ul>

      <h2 id="what-to-read-next">What to read next</h2>
      <p>
        If the math points at 5 kW, you are in{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          hardwired ceiling-mount
        </Link>{" "}
        territory. If you only have a regular outlet, stay on{" "}
        <Link href="/portable-garage-heaters-15a-circuit">15 A portables</Link>.
        If you have not checked the panel yet, start with{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>. If you
        want the bill math after you pick a nameplate, use{" "}
        <Link href="/electric-garage-heater-operating-cost">
          cost to run
        </Link>
        .
      </p>
    </GuideChrome>
  );
}
