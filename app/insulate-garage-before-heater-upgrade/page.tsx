import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/insulate-garage-before-heater-upgrade")!;

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
  { id: "leaking", label: "The heater that “doesn’t work”" },
  { id: "checklist", label: "Seal-first checklist" },
  { id: "door", label: "Door and weatherstrip vs more kW" },
  { id: "infiltration", label: "Infiltration is the load" },
  { id: "slab", label: "Slab and thermal mass" },
  { id: "more-watts", label: "When more watts are still required" },
  { id: "wrong-path", label: "When resistance heat is the wrong path" },
  { id: "after-seal", label: "Forced-air once the door holds" },
];

export default function InsulateFirstGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="leaking">The heater that “doesn’t work”</h2>
      <p>
        The usual complaint is a 5 kW ceiling unit on a 30 A / 240 V circuit
        that runs all morning and the two-car still feels like a carport. The
        element is doing its job. The building is exchanging the air you paid
        to heat. Buying a 7.5 kW cabinet, or a second 5 kW unit, is how people
        turn a sealing problem into a panel problem.
      </p>
      <p>
        This page is the envelope conversation that belongs after you know the
        circuit and the heat type, and after you have a wattage bracket from{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          wattage by garage size
        </Link>
        . The size brackets already split insulated versus drafty. Seal-first
        here is the still-cold / upgrade path: when the bay stays cold, or you
        are about to jump from 5 kW to 7.5 kW, fix the envelope before you buy
        more watts. Then pick the mount.
      </p>
      <p>
        We are not going to invent a payback year, an R-value that “pays for
        itself in one winter,” or a coverage claim for a door kit. Door
        insulation and weatherstrip are cheap relative to a new 240 V circuit
        and a larger unit heater. That is the comparison. Street prices for
        kits and doors move; treat any retailer row as a class, not a live
        price.
      </p>

      <h2 id="checklist">Seal-first checklist</h2>
      <p>
        Do these in order before you upsize the heater. None of them replace a
        load calculation. All of them change whether a 5 kW forced-air unit has
        a chance.
      </p>

      <SpecTable
        caption="Seal-first steps before buying more electric watts"
        columns={["Step", "What you are fixing", "Good enough signal", "Not a substitute for"]}
        rows={[
          [
            "1. Weatherstrip the overhead door",
            "Side and top seals, plus the worn rubber at the jambs",
            "Daylight around the panel is gone; you cannot feel a knife of air at the sides",
            "A new heater",
          ],
          [
            "2. Fix the threshold / bottom seal",
            "The sill is often the largest hole in a two-car",
            "The bulb or flap meets the floor along the full width; water and leaves stay out",
            "A second 5 kW unit",
          ],
          [
            "3. Insulate or replace the door",
            "A single-layer steel or wood door is a giant uninsulated wall that also moves",
            "An insulated door or a listed retrofit kit is on the panel, not a moving blanket taped up",
            "Manufacturer “up to X sq ft” copy",
          ],
          [
            "4. Man-door, vents, and obvious holes",
            "The pedestrian door, broken glass, and the gap at the house wall",
            "Sweep and weatherstrip on the man-door; foam or gasket on the ugly penetrations",
            "Sealing combustion-air vents you actually need",
          ],
          [
            "5. Ceiling and walls you can reach",
            "Open rafters and bare studs dump heat into the attic or the outdoors",
            "You have a plan for the planes you can insulate without burying junction boxes or dampers",
            "A finished house-grade remodel as a prerequisite for any heat",
          ],
          [
            "6. Then re-read the wattage bracket",
            "The same square footage is a different load after the door stops leaking",
            "The insulated column on the size page is no longer a fantasy",
            "Skipping the circuit and panel check",
          ],
        ]}
      />

      <Callout title="Do not seal a combustion appliance into a box">
        <p>
          If a gas water heater, furnace, or other fuel appliance lives in the
          garage, combustion air and clearances are not optional. This site
          stays on electric resistance. We will not walk you through closing
          every hole in a room that still burns fuel. That is a different
          inspection.
        </p>
      </Callout>

      <h2 id="door">Door insulation and weatherstrip versus a 5 kW to 7.5 kW jump</h2>
      <p>
        On a typical two-car, the overhead door is the largest single surface
        that is also a moving gap. An uninsulated door plus a crushed bottom
        seal will undo a correctly sized 5 kW unit. The{" "}
        <Link href="/best-electric-garage-heaters-by-size">size guide</Link>{" "}
        already says the quiet part: weatherstrip and an insulated door often
        beat a jump from 5 kW to 7.5 kW.
      </p>
      <p>
        That jump is not a bigger plug. A 7.5 kW FUH-class unit is about 31 A
        at 240 V and wants 8 AWG copper in the same manual family that puts 5
        kW on 10 AWG and a 30 A fuse. You are buying a different circuit, not
        a software setting. Two 5 kW cabinets are two 30 A two-pole breakers.
        See{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link> for the
        continuous-load arithmetic.
      </p>
      <p>
        Weatherstrip and a door kit stay on the building. They cut infiltration
        every hour the heater runs, and every hour it does not. A larger
        element only helps while you pay for the extra watts, and only if the
        air stays in the room. If the door is open for a bay that is also a
        driveway, neither the kit nor the 7.5 kW unit will make the cubic feet
        behave. That is the{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>{" "}
        problem: heat the person, or close the door.
      </p>
      <p>
        We will not quote a dollar-per-therm comparison we did not measure. Fix
        the seals you can see. Insulate the door if it is a single skin. Then
        decide whether the insulated column on the size page still asks for
        more than 5 kW. Many attached two-cars land on one 5 kW unit after that
        work. Many detached shops still do not.
      </p>

      <h2 id="infiltration">Infiltration is the load</h2>
      <p>
        Forced-air electric heat warms air. Every cubic foot that leaves under
        the door, through a missing threshold, or up an open rafter bay is a
        cubic foot you heat again. That is why a shop with the overhead door
        cracked “just a foot” feels like the heater is broken. The heater is a
        very expensive fan pointed at a hole.
      </p>
      <p>
        Infiltration also explains the “it was fine until January” reports.
        Stack effect and wind get worse as the delta-T grows. A door that is
        merely mediocre at 40 °F outside is a gale at 10 °F. Adding watts
        without touching the sill scales the electric bill faster than it
        scales comfort. Hours-on is the bill; see{" "}
        <Link href="/electric-garage-heater-operating-cost">
          operating cost
        </Link>
        .
      </p>
      <p>
        Infrared changes the failure mode, it does not repeal infiltration.
        You can stand in a radiant beam with the door up and feel warm. The
        far corner and the slab still dump heat. If the job is whole-bay air
        temperature, you need the envelope. If the job is one person at a
        bench, spend the watts on the person and stop pretending the volume
        will catch up. That split is written out on{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>
        .
      </p>
      <p>
        Do not tape over dryer vents, water-heater air, or a carbon-monoxide
        path to “gain R-value.” Seal the junk gaps. Leave the intentional
        ones.
      </p>

      <h2 id="slab">Slab and thermal mass</h2>
      <p>
        Concrete and two parked cars will drink the first hour of heat even
        when the wattage matches the air load. The slab is a sink. It is also
        why first-start on a Monday feels weak and Saturday afternoon, after
        the heater has been on, feels fine. That is not proof you need 7.5 kW.
        It is proof you asked a resistance coil to warm a few tons of mass in
        forty minutes.
      </p>
      <p>
        Practical responses that are not a larger breaker:
      </p>
      <ul>
        <li>Start the heater before you occupy the space, on a thermostat or a timer you trust.</li>
        <li>Put a listed mat or a throw rug at the standing zone if you only need the feet.</li>
        <li>
          Use infrared at the bench so the first watts hit you instead of the
          slab. Same 1.5 kW portable limit if you are on 15 A.
        </li>
        <li>Park the second car outside if this is a shop day and you can. Two engines are two sinks.</li>
      </ul>
      <p>
        Insulating under an existing slab is reconstruction, not a weekend kit.
        Edge insulation and a closed door help. They do not turn the slab into
        a wood floor.
      </p>
      <p>
        If you only occupy a 6×8 ft patch, stop heating the slab you are not
        standing on. That is a heat-type decision, not an insulation failure.
      </p>

      <h2 id="more-watts">When more watts are still required</h2>
      <p>
        Sealing before more watts is not a slogan that forbids a larger heater.
        After the door and the obvious leaks, you still need more watts when:
      </p>
      <ul>
        <li>
          The footprint is a three-car or a “2-car plus shop” in the 600–900+
          ft² band. The insulated column on the size page is already 6–10 kW.
        </li>
        <li>
          Ceilings are high. Ten-foot or open-rafter volume is more air, and
          forced-air stratifies. You can insulate the plane and still be short.
        </li>
        <li>
          The climate and the setpoint are the house, not “take the edge off.”
          Shirt-sleeve shop temperature in a cold climate is a different load
          than keeping tools above freezing.
        </li>
        <li>
          The building is detached, uninsulated, and you have decided not to
          insulate the walls. Honest path: size to the drafty column, or
          abandon whole-bay air heat.
        </li>
      </ul>
      <p>
        A 1,500 W milkhouse heater does not become a two-car heater because
        you weatherstripped. Circuit limits do not move when the door gets a
        kit. If you are still on a 15 A outlet, the next adult step is{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          staying on portables
        </Link>{" "}
        or installing 240 V, not stacking two 1,500 W units on one run.
      </p>

      <h2 id="wrong-path">When electric resistance is the wrong path</h2>
      <p>
        This site compares electric resistance heaters. That is a scope
        choice, not a claim that resistance is always the adult answer. The
        hard stop is the panel.
      </p>
      <p>
        A 5 kW heater is about 20.9 A at 240 V. A 7.5 kW unit is about 31 A.
        Two 5 kW units are two 30 A two-pole breakers. On a 100 A service that
        already feeds a range, dryer, HVAC, and an EV charger, that load may
        not fit without a calculation, a panel upgrade, or a service upgrade.
        We will not pretend every suburban garage has a free 40–60 A of 240 V
        waiting.
      </p>
      <p>
        If the panel cannot take the circuit, the useful electric options
        shrink to: keep the smaller heater and finish the envelope, or spend
        the same 1.5 kW on infrared at the bench. Propane is the common fuel
        fork when you need more BTU than the panel will feed — that comparison
        is{" "}
        <Link href="/electric-vs-propane-garage-heater">
          electric vs propane
        </Link>
        , with the CO, moisture, and listing caveats. Mini-splits and wood
        exist; they stay outside this site. Do not bolt a 5 kW cabinet onto
        a lighting circuit as a protest.
      </p>
      <p>
        Undersized service plus an uninsulated door is the expensive way to
        skip the hub order. Name the circuit, pick heat type, then size the
        watts. If the bay is still cold or you are about to jump from 5 kW to
        7.5 kW, seal the envelope before more watts. Then decide wall versus
        ceiling. See{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall-mount vs ceiling-mount
        </Link>{" "}
        when you are actually hanging steel.
      </p>

      <h2 id="after-seal">Forced-air once the door holds</h2>
      <p>
        Heat type is already decided by this point. Sealing does not reopen
        that fork. It is what makes a forced-air choice actually hold air. Once
        the door stops leaking, whole-bay fan-forced heat can make the space
        itself less miserable. That is the closed-door, some insulation case
        on{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>
        . A 5 kW Comfort Zone / Fahrenheat-class ceiling unit is the common
        hardware for an attached two-car in that condition. Details live on{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount units under $200
        </Link>
        .
      </p>
      <p>
        If you sealed what you could and you still work with the door up,
        insulation does not convert a driveway into a room. Infrared at the
        occupied zone remains the honest spend of limited watts. Sealing still
        helps the hours the door is down. It does not make fan-forced air stay
        in an open bay.
      </p>
      <p>
        Affiliate buy links for doors, kits, and heaters are not live. When
        they are, they will be labeled. Do not treat a listing that says a
        weatherstrip “adds 10 degrees” as a measurement we will repeat.
      </p>
      <p>
        Next: if the envelope now matches the insulated column and you are
        hanging a hardwired unit, pick the mount on{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall vs ceiling
        </Link>
        . If the insulated column still asks for more watts than the circuit
        can feed, that is a{" "}
        <Link href="/120v-vs-240v-garage-heater">panel conversation</Link>,
        not a second milkhouse heater. If you only occupy a bench, stay on{" "}
        <Link href="/portable-garage-heaters-15a-circuit">15 A portables</Link>{" "}
        or directed radiant, and stop shopping for more fan.
      </p>
    </GuideChrome>
  );
}
