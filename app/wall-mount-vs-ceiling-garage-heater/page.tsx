import type { Metadata } from "next";
import Link from "next/link";
import { AmazonAffiliateLink } from "@/components/amazon-link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import {
  AMAZON_COMFORT_ZONE_CZ220,
  AMAZON_FAHRENHEAT_FUH54,
} from "@/lib/affiliates";
import { findGuide } from "@/lib/site";

const guide = findGuide("/wall-mount-vs-ceiling-garage-heater")!;

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
  { id: "not-style", label: "Mount is a load problem" },
  { id: "matrix", label: "Mount-type comparison" },
  { id: "joists", label: "Joist load and hanging weight" },
  { id: "clearance", label: "Clearance: NEC and the manual" },
  { id: "throw", label: "Throw direction and headroom" },
  { id: "product-class", label: "Ceiling class vs wall utility" },
  { id: "when-wall", label: "When wall wins" },
  { id: "dust", label: "Dust, fumes, and ceiling fans" },
  { id: "retailers", label: "Retailer links and next reads" },
];

export default function WallVsCeilingGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="not-style">The mount is a load and throw problem</h2>
      <p>
        People shop “wall heater” versus “ceiling heater” as if those were two
        heat technologies. For the electric utility units this site covers,
        they are usually the same fan-forced box with a different bracket. The
        decision is whether the structure can hold the weight, whether you have
        the headroom and clearance the listing requires, and whether you want
        air thrown across the bay or aimed at one wall.
      </p>
      <p>
        If you only have a 15 A / 120 V receptacle, this page is the wrong
        argument. That is a portable on the floor or a bench, covered in{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          portable heaters on a 15 A circuit
        </Link>
        . Hardwired 240 V is the conversation here. Read{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link> if the
        circuit is still a guess.
      </p>
      <p>
        Infrared and forced-air are a different fork. A radiant panel on a wall
        and a Comfort Zone / Fahrenheat-class ceiling fan are not substitutes.
        Pick heat type first on{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>
        , then come back here for where the fan-forced unit hangs.
      </p>

      <h2 id="matrix">Mount-type comparison</h2>
      <p>
        Figures below are planning language for the common hardwired 5 kW
        utility class (Comfort Zone CZ220-class, Fahrenheat FUH54-class) plus
        the smaller wall utility heaters people actually hang in a one-car or
        along a workbench wall. Confirm the sheet that ships with the unit.
        Suffixes change. We are not inventing coverage square footage.
      </p>

      <SpecTable
        caption="Ceiling-mount versus wall-mount for electric garage utility heaters"
        columns={["", "Ceiling-mount", "Wall-mount"]}
        rows={[
          [
            "Typical job",
            "Throw across a closed 1-car or 2-car bay",
            "Aim at a work wall, door, or a low-ceiling bay",
          ],
          [
            "Common hardware",
            "CZ220 / FUH54-class, 5 kW, 240 V, hardwired",
            "Same FUH-class on a wall bracket, or a smaller wall utility unit",
          ],
          [
            "Structure",
            "Joists or blocking that can take ~25–30 lb plus vibration",
            "Studs, blocking, or masonry; still a real fastener job",
          ],
          [
            "Headroom",
            "Needs mounting height and combustible clearance above occupied space",
            "Keeps the cabinet off a low ceiling; still needs side and front clearance",
          ],
          [
            "Throw",
            "Horizontal across the bay; manuals in this class cite ~18 ft",
            "Out from the wall; easy to overshoot a narrow bay or cook one stall",
          ],
          [
            "When it fails",
            "Low ceiling, weak joists, or a shop that only occupies one wall",
            "Cabinet in the walking path, or aimed at a parked car’s plastic",
          ],
        ]}
      />

      <h2 id="joists">Joist load and hanging 25–30 lb</h2>
      <p>
        Comfort Zone CZ220-class literature puts the cabinet in the 25–30 lb
        range. That is not a picture-hook load. The fan adds vibration. A
        heater that slowly walks off two drywall screws is a fire and a dented
        hood. The install sheet wants the bracket lagged into structure:
        joists, blocking, or a listed mounting kit. Sister a joist or add
        blocking if you are hanging between 24 in. centers and the bracket does
        not land on wood.
      </p>
      <p>
        Ceiling finish is not structure. A 1/2 in. drywall ceiling, a fiber
        tile, or a corrugated metal liner does not carry a utility heater.
        Reach the joist. If you cannot find wood or you are looking at an
        engineered truss you do not want to drill, that is a reason to put the
        same class of unit on a wall with studs you can hit, or to hire the
        person who will.
      </p>
      <p>
        If you cannot fasten into the building, stay on a listed portable and
        the circuit you already have. Temporary hooks are not a mount.
      </p>

      <h2 id="clearance">Clearance is the manual, not a blog height</h2>
      <p>
        National Electrical Code rules for space heaters and fixed electric
        space-heating equipment are about listing, branch circuits, and not
        burying a heat source. They do not hand you a universal “mount it at 8
        ft” number. Mounting height, side clearance, and clearance to
        combustibles come from the listing and the installation manual for that
        cabinet.
      </p>
      <p>
        For the Fahrenheat FUH54-class, the family manual is the document that
        states mounting height (the sheet you will keep seeing uses a 6–11 ft
        window) and the wall-clearance table. Comfort Zone CZ220-class sheets
        are equally specific about hardwiring, combustible clearance (often a 3
        ft conversation), and not using the unit as a plug-in. We will not
        invent a height that overrides those pages.
      </p>
      <Callout title="Read the sheet on the unit you buy">
        <p>
          If the manual and a forum post disagree, the manual wins. If the
          label and a retailer title disagree, the label wins. Hire a licensed
          electrician for the 240 V homerun. This site is not an inspection.
        </p>
      </Callout>
      <p>
        Clearance also kills a lot of “perfect” ceiling spots: a storage loft,
        a door track, an opener rail, a fluorescent strip, or a run of
        cardboard boxes on the joists. A wall location can be just as wrong if
        it sits over a solvent shelf or inside the swing of a man-door. Pick
        the surface that can keep the listed distances, then pick the bracket.
      </p>

      <h2 id="throw">Throw direction and headroom</h2>
      <p>
        The cheap 5 kW ceiling units advertise on the order of 18 ft of
        horizontal throw (both the CZ220-class and FUH54-class sheets use that
        approximate figure). That is air movement, not a promise the far stall
        sits at 68 °F. Louvers and a tilt bracket are how you keep the jet off
        the opener and off someone’s ear.
      </p>
      <p>
        Ceiling mount is the default when you want the cabinet out of the
        walking path and you have a reasonably even bay. Air leaves the grille
        and crosses the cars. You still have to size the watts to the envelope
        on the{" "}
        <Link href="/best-electric-garage-heaters-by-size">size guide</Link>.
        A well-aimed 5 kW unit in an uninsulated sieve is still 5 kW of
        departing air.
      </p>
      <p>
        Headroom is the usual ceiling veto. An 8 ft finished ceiling minus the
        cabinet, the tilt, and the combustible clearance can put the grille in
        your hair or in the path of a garage-door panel. Some two-car bays have
        7 ft or a dropped soffit over the man-door. That is a wall job, or a
        different heat type, not a dare.
      </p>
      <p>
        Wall mount flips the throw: the jet comes off a wall and has to be
        aimed down a stall, along a bench, or across the door. In a narrow
        one-car, a wall unit pointed at the overhead door can feel strong at
        the handle and useless at the bumper. In a two-car, a wall unit on the
        shared house wall can heat the first six feet and leave the overhead
        door as a cold plane. Aim is the product.
      </p>

      <h2 id="product-class">Comfort Zone / Fahrenheat-class ceiling units vs wall utility heaters</h2>
      <p>
        The consumer aisle most people mean is the hardwired 5 kW, 240 V,
        ~20.9 A, 30 A two-pole, 10 AWG copper box. Comfort Zone CZ220 / CZ220G
        and Fahrenheat FUH54 / FUH54C are the names that keep showing up. That
        class is specified as ceiling-mount hardware. The Fahrenheat FUH family
        manual also describes a wall-bracket path for the same cabinet. It is
        still a 5 kW fan-forced unit. It is not a different BTU package because
        you rotated the bracket.
      </p>
      <p>
        Details, wattage taps, and the “under $200” shopping class live on{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount heaters under $200
        </Link>
        . Use that page for nameplate rows. Use this page to decide whether
        that cabinet belongs overhead or on a wall.
      </p>
      <p>
        Separate from that aisle are smaller wall utility heaters: lower
        wattage, sometimes 120 V, sometimes a dedicated 240 V wall can. Those
        can be the right tool for a finished one-car or a mudroom-adjacent
        wall. They are not a secret 5 kW in a slimmer box. If the nameplate is
        1,500 W, you are back on a portable-class load no matter how
        permanently you screw it to a stud. If the nameplate is 3–4 kW, you
        still need the circuit the sheet calls for and the clearance to the
        floor and to stored junk.
      </p>
      <p>
        We will not invent a ranked list of wall cans. Listing mark, nameplate
        watts and amps, the breaker and copper the manual names, and whether
        the location can keep combustibles away: that is the comparison.
      </p>

      <h2 id="when-wall">When wall wins</h2>
      <p>Wall-mount is the better default when most of these are true:</p>
      <ul>
        <li>
          The ceiling is low, finished, or already crowded with an opener,
          tracks, lights, or a loft.
        </li>
        <li>
          You cannot land the ceiling bracket on a joist or add blocking
          without a larger carpentry job than you want.
        </li>
        <li>
          The occupied zone is one wall: a workbench, a lift arm, a detailing
          stall, a man-door you stand at.
        </li>
        <li>
          You want the grille where you can reach the thermostat or the
          wattage switch without a ladder every November.
        </li>
      </ul>
      <p>
        Wall-mount is a poor default when the walking path is the only free
        wall, when the jet will hit a parked bumper at headlight height, or
        when the only studs sit over a flammable storage run. A heater on the
        wall next to a hanging roll of paper towels is still a clearance
        failure.
      </p>
      <p>
        Two wall units can cover a long two-car better than one ceiling unit
        aimed badly. That is also two circuits and a panel conversation. Do not
        daisy-chain a second cabinet onto the first unit’s tap. See{" "}
        <Link href="/120v-vs-240v-garage-heater">breaker and panel limits</Link>
        {" "}before you shop a pair.
      </p>

      <h2 id="dust">Dust, fumes, and ceiling fan units</h2>
      <p>
        A ceiling-mounted fan-forced heater sits in the layer where overspray,
        grinding dust, and solvent vapor collect. The fan is a mixer. That is
        useful when you want the bay even. It is a problem when you are
        finishing, welding, or running a mower indoors for thirty seconds
        “just to get it out.”
      </p>
      <p>
        Ceiling units will blow settled dust onto a freshly painted panel. They
        will pull light fumes across a hot element. The listing is for a clean,
        dry utility space, not a spray booth. If the shop work is dusty or
        chemical, a wall unit aimed at the occupied zone (or infrared at the
        bench) keeps the fan out of the worst of the ceiling cloud. It does not
        make the heater approved for a hazardous location. If the space is
        classified or you store gasoline open, this aisle is the wrong
        equipment.
      </p>
      <p>
        Filters are not a feature of the cheap 5 kW class. There is no washable
        screen that turns a utility heater into HVAC. If the louvers are
        packed with insulation bits or sawdust, clean them with the power off
        and treat that as a reminder the fan is stirring the room.
      </p>

      <h2 id="retailers">Retailer links and what to read next</h2>
      <p>
        The 5 kW class has measured Amazon Associates listings (same CZ220-class
        and FUH54-class ASINs as the ceiling-mount guide). Street prices move;
        a listing may be a class sibling. Confirm the bracket is rated for the
        wall or ceiling you will use. We do not have a measured ASIN for a
        smaller wall-only utility heater, so that row stays a placeholder.
      </p>

      <SpecTable
        caption="Amazon Associates listings for the 5 kW mount class; smaller wall units stay a placeholder"
        columns={["Class", "What to verify on the listing", "Affiliate / retailer link"]}
        rows={[
          [
            "5 kW ceiling / wall utility (CZ220 / FUH54-class)",
            "Hardwired 240 V, 5 kW nameplate, 30 A / 10 AWG guidance, listed mark, bracket rated for ceiling or wall as you intend to hang it",
            <span key="cz220-fuh54">
              <AmazonAffiliateLink href={AMAZON_COMFORT_ZONE_CZ220}>
                Amazon: Comfort Zone 5000W ceiling (CZ220-class)
              </AmazonAffiliateLink>
              {"; "}
              <AmazonAffiliateLink href={AMAZON_FAHRENHEAT_FUH54}>
                Amazon: Fahrenheat FUH5-4 5000W (FUH54-class)
              </AmazonAffiliateLink>
            </span>,
          ],
          [
            "Smaller wall utility heater",
            "Nameplate watts and volts, required circuit, floor and side clearance, listed mark. Do not assume it is a 5 kW unit",
            "Placeholder: retailer URL not live",
          ],
        ]}
      />
      <p>
        If the watts are still a guess, start with{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          size by garage
        </Link>
        . If the building is the real load, read{" "}
        <Link href="/insulate-garage-before-heater-upgrade">
          seal and insulate first
        </Link>{" "}
        before you hang a second cabinet.
      </p>
    </GuideChrome>
  );
}
