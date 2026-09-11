import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/hardwired-vs-plugin-garage-heater")!;

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
  { id: "fork", label: "The install fork" },
  { id: "circuit", label: "Circuit reality" },
  { id: "corded", label: "Corded 240 V vs hardwire" },
  { id: "listing", label: "Listing and hanging" },
  { id: "cost", label: "Cost and effort" },
  { id: "picks", label: "Pick rules" },
  { id: "caveats", label: "What this page will not claim" },
];

export default function HardwiredVsPluginGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="fork">The install fork</h2>
      <p>
        Voltage is what the circuit can deliver. That page is{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>. This
        page is how the heater attaches to that circuit: a cord and a
        receptacle you already have, versus conductors landed on a terminal
        block. Readers who land on the portable aisle or the ceiling-mount
        aisle are often choosing this fork, not a brand.
      </p>
      <p>Three facts about the job matter before you pick a cord:</p>
      <ul>
        <li>
          <strong>Temporary or portable versus permanent.</strong> Saturday
          bench heat, a milkhouse you put away, or a unit that moves with
          the work is a plug-in job. Whole-bay heat you want every winter
          is almost always a dedicated circuit and a hardwired cabinet.
        </li>
        <li>
          <strong>What receptacle actually exists.</strong> A 15 A / 120 V
          garage outlet is a ~1.5 kW portable. It is not a feed for a 5 kW
          ceiling unit. If the outlet is not there, “plug-in” still means
          hiring the circuit first.
        </li>
        <li>
          <strong>What the listing allows.</strong> A unit that ships with a
          cord and a NEMA plug is listed as a cord-and-plug appliance. A
          unit that ships with a knockout and a terminal block is listed as
          hardwired. Those are not interchangeable because you prefer one
          Saturday over the other.
        </li>
      </ul>
      <p>
        Size the watts on{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          wattage by garage size
        </Link>
        . If the bracket is 1,500 W at a bench, stay on the cord you have.
        If the bracket is a 5 kW bay heater, you are shopping install type
        and a circuit, not a longer extension cord.
      </p>

      <Callout title="This is not a second voltage page">
        <p>
          120 V versus 240 V is the continuous-load and breaker math. Plug-in
          versus hardwired is the connection and the listing. A corded 240 V
          heater is still 240 V. A hardwired 120 V heater is rare in this
          aisle and still needs the manual’s circuit. Do not collapse the
          two forks.
        </p>
      </Callout>

      <h2 id="circuit">Circuit reality: 120 V plug-in versus dedicated 240 V</h2>
      <p>
        A space heater that runs for three hours or more is treated as a
        continuous load in ordinary electrical practice. Branch-circuit
        conductors and overcurrent devices for continuous loads are typically
        sized so the load is not more than 80% of the circuit rating. The
        planning numbers on the voltage page still apply here:
      </p>
      <ul>
        <li>
          <strong>15 A × 120 V × 0.8 = 1,440 W.</strong> A 1,500 W plug-in
          draws 12.5 A — over that continuous ceiling — and wants to be the
          only load. Details:{" "}
          <Link href="/portable-garage-heaters-15a-circuit">
            portables on a 15 A circuit
          </Link>
          .
        </li>
        <li>
          <strong>20 A × 120 V × 0.8 = 1,920 W.</strong> Still spot heat. Confirm
          the receptacle and breaker actually are 20 A.
        </li>
        <li>
          <strong>30 A × 240 V × 0.8 = 5,760 W.</strong> Why the common 5 kW
          ceiling class (about 20.9 A at 240 V) is specified with a 30 A
          two-pole breaker and 10 AWG copper.
        </li>
      </ul>
      <p>
        Those are planning numbers, not a load calculation and not permission
        to feed a ceiling unit from a lighting circuit. This site is general
        information. The heater’s installation sheet and a licensed
        electrician own the job.
      </p>

      <SpecTable
        caption="Install path versus the circuit it usually needs"
        columns={["Path", "Typical circuit", "Continuous ceiling (80%)", "Usual job"]}
        rows={[
          [
            "120 V plug-in",
            "15 A general receptacle",
            "~1,440 W",
            "Milkhouse / utility / ceramic at a bench",
          ],
          [
            "120 V plug-in on 20 A",
            "20 A garage receptacle",
            "~1,920 W",
            "Larger portable; still not whole-bay air",
          ],
          [
            "Corded 240 V",
            "Dedicated receptacle (NEMA 6-30 and similar)",
            "Set by that circuit — often a 30 A two-pole",
            "Movable 240 V only if the manual lists the plug",
          ],
          [
            "Hardwired 240 V",
            "Dedicated two-pole; often 30 A / 10 AWG at 5 kW",
            "~5,760 W on 30 A",
            "Ceiling or wall whole-bay in a sealed garage",
          ],
        ]}
      />

      <p>
        Whole-bay electric heat is almost always the last row. The 5 kW
        Comfort Zone CZ220-class and Fahrenheat FUH54-class cabinets are
        specified that way — see{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount units under $200
        </Link>
        . A 1,500 W cord does not become a bay heater because the box says
        “garage.”
      </p>

      <h2 id="corded">Corded 240 V is not the same as hardwire</h2>
      <p>
        Plug-in 240 V garage heaters exist. Common plugs in this aisle are
        NEMA 6-30 and similar 250 V devices (two hots and a ground; some
        units use a different 6-series configuration). They still need a
        correctly rated receptacle on a dedicated circuit. The plug does not
        excuse a shared lighting run or an adapter.
      </p>
      <p>
        Most of the sub-$200 ceiling units are <strong>direct-wired</strong>:
        no cord, no plug, no extension cord, no relocatable power tap. The
        Comfort Zone CZ220-class installation sheet says that in those words.
        Fahrenheat FUH-class sheets are the same idea: land copper on the
        block. Adding a dryer cord to a hardwired-only cabinet is not a
        listed connection.
      </p>
      <p>When the manual allows which:</p>
      <ul>
        <li>
          <strong>Ships with a cord and a NEMA plug.</strong> That plug is
          the listed connection. Match the receptacle. Do not cut the plug
          off and land the conductors unless the same sheet describes a
          hardwire conversion — most portable sheets do not.
        </li>
        <li>
          <strong>Ships with a knockout and a terminal block.</strong> That
          is a hardwire. Hire a licensed electrician if you are not
          qualified to land the gauge the sheet names (often 10 AWG copper
          at 5 kW).
        </li>
        <li>
          <strong>Sheet says no cord, no plug, no extension cord.</strong>{" "}
          Believe it. A “temporary” cord is still an unlisted connection.
        </li>
      </ul>
      <p>
        Dryer, range, EVSE, welder, and heater circuits are not
        interchangeable because they are all “240.” Receptacle type, load,
        and the code path have to match. Do not treat an existing 30 A dryer
        outlet as a free heater feed without checking those three.
      </p>

      <h2 id="listing">Clearance, listing, and why a hanging portable is wrong</h2>
      <p>
        Listing follows the use the lab tested. A portable is tested as a
        portable: tip-over switch, cord, floor or bench clearance. A
        ceiling or wall cabinet is tested with its bracket, its weight on a
        structure, and a clearance diagram that assumes that mount. Those
        are different appliances even when both say 5,000 W on a box.
      </p>
      <p>
        Hanging a milkhouse or ceramic tower from a joist, a chain, or a
        screw hook does not make it a ceiling heater. It defeats the
        tip-over switch, puts the grille where the portable clearance
        diagram never was, and overloads a mount the listing never rated.
        Cutting the plug and hardwiring that same portable is the same
        class of mistake.
      </p>
      <p>
        The other direction is also wrong: adding a cord to a hardwired
        ceiling unit so you can “just plug it in,” or sitting that cabinet
        on a shelf like a space heater. The CZ220-class and FUH54-class
        sheets specify hardwire and a rated bracket. Joist load, throw, and
        the manual’s mounting height live on{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall-mount vs ceiling-mount
        </Link>
        . Combustible clearance is often a 3 ft conversation; the sheet you
        buy wins over a blog height.
      </p>

      <Callout title="Do not convert listing classes" tone="safety">
        <p>
          Keep the heater in the class it was listed for. Do not hang a
          portable as a ceiling unit. Do not cord a hardwired-only cabinet.
          Do not defeat a tip-over or overheat switch. Keep rags, cardboard,
          solvents, and paper at the clearance the manual prints. Hire a
          licensed electrician for new 240 V work and any landing you are
          not qualified to do. This is not an inspection.
        </p>
      </Callout>

      <h2 id="cost">Cost and effort: outlet already there versus a new circuit</h2>
      <p>
        The Saturday difference is labor and whether a circuit already
        exists. It is not a different dollars-per-kWh. Resistance heat is
        the same kWh math on a cord or a landed pair —{" "}
        <Link href="/electric-garage-heater-operating-cost">
          watts × hours × your rate
        </Link>
        . Voltage and plug type do not change the rate on the bill.
      </p>

      <SpecTable
        caption="Effort comparison. We will not invent a bid or a street price."
        columns={["", "120 V plug-in", "Corded 240 V", "Hardwired 240 V"]}
        rows={[
          [
            "What has to exist",
            "A known 15 A or 20 A receptacle; one heater per circuit",
            "The matching NEMA receptacle on a dedicated circuit",
            "Dedicated two-pole, copper size from the sheet, rated mount",
          ],
          [
            "Who you hire",
            "Usually nobody if the outlet is already there",
            "Electrician if that receptacle does not exist",
            "Licensed electrician for the circuit and the landing",
          ],
          [
            "Move it later",
            "Yes — unplug and store it",
            "Yes, if you unplug the listed cord",
            "No. It is part of the building",
          ],
          [
            "Hard stops",
            "Continuous 80% rule, GFCI, no extension cords",
            "Receptacle type, dedicated circuit, manual allows a cord",
            "Panel slots, joist or wall structure, manual says direct-wire",
          ],
        ]}
      />

      <p>
        If the 120 V outlet is already in the bay, the unit is the cost.
        Street prices move; we will not print one. If you need a new 240 V
        receptacle or a hardwired homerun, the honest cost is the unit plus
        the electrician plus whatever the panel needs. We will not invent
        that bid. A full panel is a service conversation, not a longer cord.
      </p>
      <p>
        If the building leaks, seal it before you pay for either path. That
        is{" "}
        <Link href="/insulate-garage-before-heater-upgrade">
          insulate before a heater upgrade
        </Link>
        . More watts into a crushed threshold is still a sealing problem.
      </p>

      <h2 id="picks">Pick rules</h2>
      <p>
        Short rules. They assume you already know the circuit and have
        looked at the envelope.
      </p>
      <p>
        <strong>Prefer a 120 V plug-in when:</strong>
      </p>
      <ul>
        <li>The job is temporary, occasional, or a single bench.</li>
        <li>
          A 15 A or 20 A receptacle already exists and can be the only
          significant load.
        </li>
        <li>You will not pull a new circuit this season.</li>
        <li>
          Spot heat or an infrared beam is actually enough — see{" "}
          <Link href="/forced-air-vs-infrared-garage-heater">
            forced-air vs infrared
          </Link>
          .
        </li>
      </ul>
      <p>
        <strong>Prefer corded 240 V when:</strong>
      </p>
      <ul>
        <li>The unit ships with a cord and the sheet lists that NEMA plug.</li>
        <li>
          You have — or will install — that exact receptacle on a dedicated
          circuit.
        </li>
        <li>You want to unplug and store the heater in the off season.</li>
      </ul>
      <p>
        <strong>Prefer hardwired 240 V when:</strong>
      </p>
      <ul>
        <li>The job is permanent whole-bay heat in a reasonably sealed garage.</li>
        <li>
          The aisle is the 5 kW ceiling / wall class that the manuals call
          direct-wire.
        </li>
        <li>
          The structure can take the cabinet (often 25–30 lb) and the
          manual’s clearance.
        </li>
        <li>The panel can take the two-pole breaker that sheet names.</li>
      </ul>
      <p>
        If you only have a 15 A outlet and you want whole-bay heat, the next
        step is a circuit — not a second milkhouse on the same run, and not
        a ceiling unit with the plug cut off.
      </p>

      <h2 id="caveats">What this page will not claim</h2>
      <ul>
        <li>
          <strong>No invented SKUs or scores.</strong> We will not rank a
          “best hardwired heater” or a “best plug-in.” Listing, circuit, and
          whether you need whole-bay air are the comparison.
        </li>
        <li>
          <strong>No wattage or coverage inventions.</strong> 1,440 W, 1,500 W
          / 12.5 A, and 5 kW / ~20.9 A are the same planning figures used on
          the voltage and product-class pages. They are not “heats a 2-car
          to 70 °F.”
        </li>
        <li>
          <strong>No live prices or electrician bids.</strong> Street prices
          move. Labor and panel work vary. “Under $200” on the ceiling page
          is a shopping class, not a quote.
        </li>
        <li>
          <strong>No live affiliate buy buttons.</strong> Retailer links
          elsewhere on the site are still placeholders until programs are
          live. We are not tagging a milkhouse or a 5 kW cabinet to “prove”
          an install path.
        </li>
      </ul>
      <p>
        Next: if you do not know the circuit, start at{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>. If
        you are staying on 15 A, use{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          portables on a 15 A circuit
        </Link>
        . If you are hanging a 5 kW cabinet, use{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount under $200
        </Link>{" "}
        and{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall vs ceiling
        </Link>
        . Price the watts on{" "}
        <Link href="/electric-garage-heater-operating-cost">
          operating cost
        </Link>
        .
      </p>
    </GuideChrome>
  );
}
