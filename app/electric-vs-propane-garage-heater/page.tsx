import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/electric-vs-propane-garage-heater")!;

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
  { id: "fork", label: "The fuel fork" },
  { id: "safety", label: "CO, listing, and venting" },
  { id: "power", label: "Watts versus BTU" },
  { id: "cost", label: "Cost method" },
  { id: "install", label: "Two install paths" },
  { id: "moisture", label: "Water vapor and tools" },
  { id: "picks", label: "Pick rules" },
  { id: "caveats", label: "What this page will not claim" },
];

export default function ElectricVsPropaneGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="fork">The fuel fork</h2>
      <p>
        This site is electric-first. Circuit, heat type, size, envelope, and
        kWh math come before fuel. The common next question is propane: a
        30–60 k BTU shop heater can move more heat than a 5 kW ceiling unit.
        That is a different job with combustion products. The building and
        the panel decide more than the aisle.
      </p>
      <p>Three facts about the space matter before you pick a fuel:</p>
      <ul>
        <li>
          <strong>Attached or occupied-adjacent versus detached.</strong> An
          attached garage shares door leaks, sometimes an HVAC return, and
          living space on the other side of the wall. Combustion products
          that are “fine in a barn” are a carbon-monoxide problem next to a
          bedroom. A drafty detached shop with its own air is a different
          enclosure.
        </li>
        <li>
          <strong>How sealed the envelope is.</strong> A tight door,
          weatherstrip, and some wall/ceiling insulation let a 5 kW
          forced-air unit hold air. A single-skin door and a crushed sill
          leak the heat you paid for — electric or propane. Seal-first still
          belongs on{" "}
          <Link href="/insulate-garage-before-heater-upgrade">
            insulate before a heater upgrade
          </Link>
          . Propane does not repeal infiltration.
        </li>
        <li>
          <strong>Whether 240 V exists or will be installed.</strong> A 15 A
          / 120 V receptacle is a ~1.5 kW portable. Whole-bay electric heat
          is almost always a dedicated 240 V circuit. If the panel can take
          that circuit, electric is usually enough for an attached, sealed
          bay. If the panel is full, or the shop is a leaky detached volume
          you will not insulate, propane is how people buy BTU they cannot
          pull from the service. Voltage reality:{" "}
          <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>.
        </li>
      </ul>
      <p>
        Size the electric job first on{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          wattage by garage size
        </Link>
        . If that bracket fits the circuit and the building can hold air,
        stay electric. If the drafty column asks for more watts than the
        panel will feed, keep reading.
      </p>

      <Callout title="Electric stays the default on this site">
        <p>
          BayHeat is a comparison site for electric garage and workshop
          heaters. This page exists so the fuel fork is honest. It is not a
          propane catalog. We will not rank SKUs, invent a “best propane
          heater,” or send you to a buy button.
        </p>
      </Callout>

      <h2 id="safety">CO, oxygen, listing, and venting</h2>
      <p>
        Electric resistance heat makes no combustion products. The risks are
        overload, clearance to combustibles, and a heater used as a dryer
        rack. Those stay in the footer disclaimer. Propane adds carbon
        monoxide, oxygen depletion, and water vapor. A flame that looks
        clean still exhausts CO₂ and H₂O. Incomplete combustion adds CO.
      </p>
      <p>
        The listing and the installation manual are the rules, not a blog
        height or a YouTube shop tour. Three classes get sold into garages.
        They are not interchangeable.
      </p>

      <SpecTable
        caption="Propane heater classes by listing and where the exhaust goes"
        columns={["Class", "Typical input", "Where exhaust goes", "Garage use"]}
        rows={[
          [
            "Indoor-rated unvented (cabinet / radiant, ODS)",
            "About 4–18 k BTU/h listing band",
            "Into the room",
            "Only if the listing and manual allow the enclosure you have; still CO + moisture",
          ],
          [
            "Vented unit heater (flue / vent connector)",
            "Shop / commercial cabinets",
            "Out the vent",
            "The adult whole-bay propane path when the venting is installed to the listing",
          ],
          [
            "Outdoor / construction torpedo (salamander)",
            "About 30–125 k BTU/h",
            "Into whatever air is around it",
            "Outdoor or well-open work. Not a furnace for a sealed attached garage",
          ],
        ]}
      />

      <Callout title="Combustion safety" tone="safety">
        <p>
          Do not run an outdoor-rated or construction-only propane heater in
          a closed attached garage. Unvented indoor-rated units still consume
          oxygen and put CO, CO₂, and water into the air; an oxygen-depletion
          sensor is a last-resort shutoff, not a license to seal the room.
          A sealed attached garage without a listed vent path is the wrong
          enclosure for propane. Put a CO alarm in the garage and on the
          house side of the service door. Local code and the listing can
          forbid unvented heaters in dwellings and attached garages; the
          inspector wins.
        </p>
      </Callout>

      <p>
        Read the nameplate for indoor / outdoor / vented. “Works in my buddy’s
        barn” is not a listing. Patio heaters, turkey fryers, and grill
        burners are outdoor appliances. A 20 lb cylinder inside a closed bay
        is a leak-and-fire problem even before you light the burner. Follow
        the manual for cylinder location, hose, regulator, and leak check.
      </p>
      <p>
        Electric does not get a free pass on fire. Keep clearances. Do not
        daisy-chain 1,500 W portables. Hire a licensed electrician for new
        240 V work.
      </p>

      <h2 id="power">Watts versus BTU — convert, then stop pretending</h2>
      <p>
        Heat is heat at the conversion. <strong>1 kW ≈ 3,412 BTU/h.</strong>{" "}
        Use that to read both nameplates. Do not use it to claim a 5 kW
        ceiling unit matches a 60 k BTU torpedo in a leaky bay. Indoor-rated
        unvented heaters list across about 4–18 k BTU/h; the 4–9 k cabinet
        row is the common portable nameplate, not a second class.
      </p>

      <SpecTable
        caption="Nameplate heat rates. 1 kW ≈ 3,412 BTU/h. Classes, not a shopping list."
        columns={["Heater class", "Nameplate", "Equivalent", "Usual job"]}
        rows={[
          [
            "120 V plug-in electric",
            "1,500 W",
            "~5,100 BTU/h",
            "Bench / spot heat on a 15 A circuit",
          ],
          [
            "Hardwired 240 V electric",
            "5,000 W (5 kW class)",
            "~17,100 BTU/h",
            "Whole-bay air in a reasonably sealed garage",
          ],
          [
            "Hardwired 240 V electric",
            "7,500 W (7.5 kW class)",
            "~25,600 BTU/h",
            "Larger or colder bay; bigger circuit",
          ],
          [
            "Common indoor propane cabinet",
            "~4,000–9,000 BTU/h input",
            "~1.2–2.6 kW",
            "Usual portable nameplate. Still combustion in the room.",
          ],
          [
            "Propane torpedo / construction",
            "~30,000–60,000 BTU/h input",
            "~8.8–17.6 kW",
            "Open or drafty volume. Listing is usually outdoor / construction.",
          ],
        ]}
      />

      <p>
        A 5 kW electric unit is about 17,000 BTU/h at the element. A 30 k
        BTU propane torpedo is roughly twice that input; a 60 k unit is
        more than three times. In a leaky detached shop those extra BTU
        are why propane shows up. They are also why people drag a
        construction heater into an attached garage and create a CO
        incident. Matching the number on the box is not matching the
        listing.
      </p>
      <p>
        Electric 5 kW is the common hardwired ceiling class — Comfort Zone
        CZ220 and Fahrenheat FUH54 family, typically 240 V, 30 A two-pole,
        10 AWG copper. See{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount units under $200
        </Link>
        . A 1,500 W portable is 12.5 A and wants to be the only load; that
        ceiling is{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          portables on a 15 A circuit
        </Link>
        . Neither electric class becomes a 60 k BTU torch because you
        converted units.
      </p>
      <p>
        Heat type still matters on the electric side. Forced-air heats air.
        Infrared heats people and objects. Drafts punish the first. That
        split is{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>
        . Propane forced-air and propane radiant make the same split, plus
        exhaust.
      </p>

      <h2 id="cost">Cost method: your kWh and your gallons</h2>
      <p>
        Fuel cost is arithmetic with your prices. Electric:{" "}
        <strong>(watts ÷ 1,000) × hours the element is on × $/kWh</strong>{" "}
        from the bill. That page is{" "}
        <Link href="/electric-garage-heater-operating-cost">
          how much an electric garage heater costs to run
        </Link>
        . Propane:{" "}
        <strong>(BTU/h input ÷ BTU per gallon) × hours the burner is on ×
        $/gallon</strong> on your ticket or exchange receipt.
      </p>
      <p>
        Planning figure for the gallon: about <strong>91,500 BTU per
        gallon</strong> of propane. Your supplier’s ticket may print a
        slightly different number. Use theirs. Hours-on is duty cycle, same
        as electric. A thermostat or a hand valve that is open all morning
        is not the same as a 20-minute warmup.
      </p>

      <Callout title="Example rates — use your bill and your ticket">
        <p>
          Electric rows reuse $0.12, $0.20, and $0.30 per kWh so they match
          the operating-cost guide. Propane rows use $2.50, $3.50, and $4.50
          per gallon. Those are brackets so the arithmetic moves. They are
          not a U.S. average, not this winter’s rack price, and not a
          promise that propane is cheaper in your zip code. Substitute the
          volumetric $/kWh on your bill and the $/gallon you actually pay.
        </p>
      </Callout>

      <SpecTable
        caption="Example cost per hour at full nameplate / full input. Rates are examples, not national averages."
        columns={[
          "Heater (full on)",
          "Energy per hour",
          "Low example",
          "Mid example",
          "High example",
        ]}
        rows={[
          [
            "1,500 W electric",
            "1.5 kWh",
            "$0.18 at $0.12/kWh",
            "$0.30 at $0.20/kWh",
            "$0.45 at $0.30/kWh",
          ],
          [
            "5 kW electric",
            "5.0 kWh",
            "$0.60 at $0.12/kWh",
            "$1.00 at $0.20/kWh",
            "$1.50 at $0.30/kWh",
          ],
          [
            "9 k BTU propane",
            "~0.10 gal (91,500 BTU/gal)",
            "$0.25 at $2.50/gal",
            "$0.34 at $3.50/gal",
            "$0.44 at $4.50/gal",
          ],
          [
            "30 k BTU propane",
            "~0.33 gal",
            "$0.82 at $2.50/gal",
            "$1.15 at $3.50/gal",
            "$1.48 at $4.50/gal",
          ],
          [
            "60 k BTU propane",
            "~0.66 gal",
            "$1.64 at $2.50/gal",
            "$2.30 at $3.50/gal",
            "$2.95 at $4.50/gal",
          ],
        ]}
      />

      <p>
        Same-heat row, labeled as a conversion: 5 kW electric is about
        17,100 BTU/h. That is about 0.19 gal/h of propane at 91,500
        BTU/gal. At the example $3.50/gal that hour is about $0.65. At the
        example $0.20/kWh the electric hour is $1.00. Those two dollars
        describe the same heat rate, not the same Saturday in your building,
        and not a monthly bill. Change any rate and the winner of that
        one-hour row moves.
      </p>
      <p>
        A 30–60 k BTU torpedo can look cheap per delivered BTU and still
        cost more per clock hour because it is a bigger fire. It can also
        cost less per session if you only run it for twenty minutes and
        leave. We will not turn that into “propane saves $X/month.” Your
        hours, setpoint, infiltration, and prices are the inputs. Anyone
        who states a monthly savings without those inputs invented them.
      </p>
      <p>
        Vented propane sends some heat out the flue. Unvented puts the
        heat — and the moisture — in the room. We will not invent an AFUE
        for a heater we are not specifying from a current nameplate. Read
        the input and output figures on the listing if both are printed.
      </p>

      <h2 id="install">Two install paths</h2>
      <p>
        Electric is a circuit problem. Propane is a fuel-and-vent problem.
        Mixing the two in one Saturday is how people end up with a plugged-in
        1,500 W unit and a torpedo they should not have lit.
      </p>

      <SpecTable
        caption="Install path comparison. Manual and licensed trades win."
        columns={["", "Electric", "Propane"]}
        rows={[
          [
            "Small / portable",
            "Plug into a known 15 A or 20 A receptacle; one heater per circuit",
            "Listed indoor-rated cabinet, hose, regulator, cylinder placement per manual",
          ],
          [
            "Whole-bay hardware",
            "Hardwired 240 V, two-pole breaker, copper size from the sheet (often 30 A / 10 AWG at 5 kW)",
            "Vented unit heater: flue or vent connector, combustion air, gas piping or listed hose, regulator",
          ],
          [
            "Who you hire",
            "Licensed electrician for new 240 V, hardwired units, and any work you are not qualified to do",
            "Licensed gas / HVAC for piped or vented appliances. The listing still owns a portable cylinder setup.",
          ],
          [
            "Hard stops",
            "Panel capacity, continuous-load 80% rule, receptacle rating",
            "Listing (indoor vs outdoor vs vented), CO, clearances, cylinder indoors, local code",
          ],
        ]}
      />

      <p>
        The electric path is documented on{" "}
        <Link href="/120v-vs-240v-garage-heater">voltage and breakers</Link>{" "}
        and{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall vs ceiling
        </Link>
        : joist load, throw, and the manual’s clearance. Do not treat a
        lighting circuit as a 5 kW feed.
      </p>
      <p>
        The propane path is tank, hose or pipe, regulator, leak check, and
        — if the appliance is vented — a vent that actually terminates
        where the listing says. A 20 lb grill cylinder is a portable
        supply, not a buried tank. Larger cylinders and permanent tanks
        have their own setbacks. We will not sketch a gas-pipe diagram.
        If you need pipe and a flue, hire the trade that is licensed for
        it.
      </p>

      <h2 id="moisture">Water vapor, condensation, and tools</h2>
      <p>
        Burning propane makes water. Complete combustion of one gallon
        produces on the order of <strong>0.8 gallons of water vapor</strong>.
        That vapor hits cold slab, cold wrenches, bare steel, and an
        uninsulated door and condenses. Rust on tools and flash rust on
        a freshly ground weld are the usual shop complaint after a winter
        of unvented propane.
      </p>
      <p>
        Electric resistance adds no combustion moisture. You still get
        whatever humidity the air already held, and you still get
        condensation if you heat a cold bay fast and the door is a single
        skin. The extra tank of water is the propane increment.
      </p>
      <p>
        Unvented indoor-rated heaters put that water in the room on
        purpose. Vented unit heaters send most of it out the flue. Outdoor
        torpedoes dump it into whatever volume you opened. In a closed
        cold shop, more BTU from an unvented burner is more condensate on
        the toolbox. If you store bare steel, a blast cabinet, or a
        motorcycle through the week, count that as a real cost of
        unvented propane — even when the $/BTU row looks friendly.
      </p>

      <h2 id="picks">Pick rules</h2>
      <p>
        Short rules. They assume you already know the circuit and have
        looked at the envelope.
      </p>
      <p>
        <strong>Prefer electric when:</strong>
      </p>
      <ul>
        <li>
          The garage is attached or shares air with living space, and you
          want heat without combustion products on that side of the door.
        </li>
        <li>
          The bay is sealed enough that a 5 kW (or the{" "}
          <Link href="/best-electric-garage-heaters-by-size">
            size-guide
          </Link>{" "}
          bracket) can hold air after warmup.
        </li>
        <li>
          The panel can take a 240 V dedicated circuit, or a 1,500 W
          portable / infrared beam is actually enough for the bench.
        </li>
        <li>
          You store tools you do not want rusted by combustion moisture.
        </li>
      </ul>
      <p>
        <strong>Prefer propane when:</strong>
      </p>
      <ul>
        <li>
          The shop is detached and drafty, you are not going to insulate
          it to the electric column, and you need high BTU for a short
          session.
        </li>
        <li>
          The panel cannot take the 240 V load and spot-electric heat is
          not the job.
        </li>
        <li>
          You will use a heater that is listed for the enclosure, with
          real ventilation or a proper vent — not a construction torpedo
          in a sealed attached garage.
        </li>
      </ul>
      <p>
        If both lists feel true, seal the building and stay electric
        unless the panel is the hard stop. More watts into a crushed
        threshold is still a sealing problem on either fuel.
      </p>

      <h2 id="caveats">What this page will not claim</h2>
      <ul>
        <li>
          <strong>No “propane saves $X/month.”</strong> We do not know
          your hours, setpoint, climate, kWh rate, or propane ticket.
          The tables are a method with labeled example rates.
        </li>
        <li>
          <strong>No coverage claims.</strong> BTU/h and kW are nameplate
          rates. They are not “heats a 3-car to 70 °F.” Size the electric
          bay on the{" "}
          <Link href="/best-electric-garage-heaters-by-size">size guide</Link>
          . Do not repeat manufacturer square-foot copy as a fuel winner.
        </li>
        <li>
          <strong>No star ratings or composite scores.</strong> Listing,
          venting, and the circuit are the comparison. We will not invent
          a “best of” propane aisle.
        </li>
        <li>
          <strong>No affiliate buy buttons on this page.</strong> Retailer
          links elsewhere on the site are still placeholders until
          programs are live. We are not tagging a cylinder or a 5 kW
          cabinet to “prove” a dollar figure.
        </li>
      </ul>
      <p>
        Next: if you do not know the circuit, start at{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>.
        If the bay leaks, fix{" "}
        <Link href="/insulate-garage-before-heater-upgrade">
          the envelope
        </Link>{" "}
        before you buy a bigger fire. If you are staying electric and
        choosing air versus a beam, use{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
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
