import type { Metadata } from "next";
import Link from "next/link";
import { AmazonAffiliateLink } from "@/components/amazon-link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import {
  AMAZON_DR_INFRARED_DR975,
  AMAZON_FAHRENHEAT_FUH54,
  AMAZON_HEAT_STORM_TRADESMAN,
} from "@/lib/affiliates";
import { findGuide } from "@/lib/site";

const guide = findGuide("/best-wall-mount-garage-heaters")!;

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
  { id: "bracket-not-btu", label: "Wall-mount is a bracket, not a BTU" },
  { id: "matrix", label: "Comparison matrix" },
  { id: "fuh54", label: "Fahrenheat FUH54-class" },
  { id: "dr975", label: "Dr. Infrared DR-975-class" },
  { id: "tradesman", label: "15 A wall infrared" },
  { id: "clearance", label: "Clearance and install" },
  { id: "not-this", label: "What this aisle is not" },
  { id: "retailers", label: "Retailer / Amazon links" },
];

export default function WallMountGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="bracket-not-btu">Wall-mount is a bracket, not a BTU</h2>
      <p>
        Search treats “wall mount garage heater” as a product type. For the
        electric utility units this site covers, it is usually the same
        fan-forced box you already know, hung on studs instead of joists. The
        watts, amps, and breaker do not change because you rotated the bracket.
        Mount vs ceiling is the{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          joist-load and throw
        </Link>{" "}
        page. This page is the shopping class: units whose product page or
        installation sheet actually lists a wall path.
      </p>
      <p>
        We do not publish star ratings, “editor scores,” or invented square-foot
        coverage. Comfort Zone CZ220-class is a ceiling sheet. The milkhouse
        portable is a floor unit. Neither belongs here. Confirm the revision you
        buy. Suffixes change.
      </p>
      <Callout title="Install reality">
        <p>
          Hardwired 240 V wall units are not plug-and-play. Plan a dedicated
          two-pole circuit, the copper and breaker the sheet names, fasteners
          into structure, and the clearances in the manual. Hire a licensed
          electrician if that work is not already familiar. A 15 A wall infrared
          is still a 120 V receptacle load. It is not a substitute for a 5 kW
          homerun.
        </p>
      </Callout>

      <h2 id="matrix">Comparison matrix</h2>
      <p>
        Figures below come from current-generation installation literature for
        these classes (Fahrenheat FUH series sheet; Dr. Infrared DR-975 owner’s
        manual; Heat Storm Tradesman HS-1500-TT sheet). Confirm the copy that
        ships with the unit.
      </p>

      <SpecTable
        caption="Wall-listed electric garage and workshop heater classes"
        columns={[
          "Class",
          "Typical models",
          "Voltage / install",
          "Nameplate watts",
          "Circuit the sheet talks about",
          "Mount the sheet lists",
        ]}
        rows={[
          [
            "5 kW hardwired utility",
            "Fahrenheat FUH54 / FUH54C",
            "240 / 208 V, 1Ø, hardwired",
            "5,000 W at 240 V (jumper table steps down)",
            "30 A max fuse at 5 kW / 240 V; 10 AWG Cu, no aluminum",
            "Wall or ceiling. Family sheet: 6–11 ft vertical, 6–8 ft horizontal",
          ],
          [
            "7.5 kW hardwired shop",
            "Dr. Infrared DR-975",
            "240 V, hardwired (no cord)",
            "7,500 W at 240 V (~31 A)",
            "Dedicated 40 A two-pole. Common sheet: 8 AWG Cu. Confirm the revision",
            "Wall or ceiling. Family sheet: ≥6 ft off the floor; ≥1 ft to adjacent surfaces",
          ],
          [
            "15 A wall infrared",
            "Heat Storm Tradesman HS-1500-TT",
            "120 V plug-in",
            "1,500 W (12.5 A)",
            "A 15 A / 120 V receptacle. Treat ~12 A as the continuous ceiling",
            "Wall or tripod. Listing: black housing must sit vertical. Not a ceiling default",
          ],
        ]}
      />

      <h2 id="fuh54">Fahrenheat FUH54-class</h2>
      <p>
        Fahrenheat (Marley Engineered Products) FUH54 / FUH54C is the 5 kW
        utility cabinet this site already covers on{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount heaters under $200
        </Link>
        . The FUH family manual is the reason it is on this page: it says the
        heater may be wall or ceiling mounted if the anchoring can hold the
        cabinet plus the bracket. Factory default is 5,000 W at 240 V (17,065
        BTU/h, 20.9 A, 30 A max fuse). The jumper table steps down to 4,165 /
        3,332 / 2,500 W at 240 V. 208 V taps are listed separately and produce
        less heat.
      </p>
      <p>
        The same family sheet wants 10 AWG copper minimum for 5 kW, copper only,
        75 °C insulation, no aluminum. Horizontal throw in this class is on the
        order of 18 ft. That is air movement, not a promise the far stall sits
        at 68 °F. Aim the louvers down the occupied wall, not at a parked
        bumper’s plastic.
      </p>
      <p>
        Why people hang it on a wall: low ceiling, weak joists, or one work
        zone. It is still 5 kW of fan-forced air. In an uninsulated two-car with
        the door open it will feel weak. That is the{" "}
        <Link href="/best-electric-garage-heaters-by-size">size and envelope</Link>{" "}
        problem, not a defect unique to Fahrenheat.
      </p>

      <h2 id="dr975">Dr. Infrared DR-975-class</h2>
      <p>
        The brand says infrared. The DR-975 is a fan-forced shop heater with
        metal-sheath elements and a large fan. Read{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>{" "}
        before you buy it for an open-door stall. It is a different wattage
        class from the FUH54, not a different heat technology.
      </p>
      <p>
        The owner’s manual titles it a 7,500 W / 240 V / 60 Hz wall / ceiling
        garage heater (25,597 BTU/h on that sheet). There is no power cord. The
        common family sheet calls for a dedicated 40 A two-pole breaker and 8
        AWG copper. Other retailer copy says 6 AWG. Use the revision in the box.
        Do not land this cabinet on a 5 kW / 30 A / 10 AWG circuit.
      </p>
      <p>
        The same sheet wants the unit at least 6 ft off the floor and no closer
        than 1 ft to adjacent surfaces, including the back wall whether or not
        you use the wall bracket. That 1 ft back-clearance is easy to miss when
        the cabinet looks like it wants to sit flat on the studs. The bracket
        is in the box. Fasten into structure, not finish.
      </p>

      <h2 id="tradesman">15 A wall infrared (Heat Storm Tradesman)</h2>
      <p>
        Heat Storm HS-1500-TT is a 1,500 W / 120 V carbon-fiber infrared with a
        plug, a tripod in many listings, and a wall bracket on the sheet. Amazon
        titles often lead with the tripod. The install sheet still lists wall
        mounting. The listing also says the black housing must sit vertical or
        the tip-over switch will not let the unit run, and that ceiling mount is
        not the default path. Follow that, not a blog height.
      </p>
      <p>
        1,500 W is 12.5 A. On a 15 A circuit, treat ~12 A as the continuous
        ceiling. Same rule as a{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          milkhouse portable
        </Link>
        . The heater should be the only significant load. Plug into the wall,
        not a daisy-chained strip. It heats a person and the objects in the
        beam. It will not heat a two-car bay. Ceiling quartz and the other
        carbon classes are on{" "}
        <Link href="/best-infrared-garage-heaters">infrared garage heaters</Link>.
      </p>
      <p>
        The US sheet wants the bottom of the heater at least 72 in. off the
        floor and clearance to combustibles on the order of 18 in. at the sides
        (some copies also call 18–24 in. above). IP-rating and outdoor language
        vary by revision. Use the label on the unit you hold, not a patio ad.
      </p>

      <h2 id="clearance">Clearance and install</h2>
      <p>
        National Electrical Code rules for fixed electric space-heating
        equipment are about listing, branch circuits, and not burying a heat
        source. They do not hand you a universal “mount it at 8 ft” number.
        Height, side clearance, and clearance to combustibles come from the
        listing and the installation manual for that cabinet.
      </p>
      <Callout title="Read the sheet on the unit you buy">
        <p>
          If the manual and a retailer title disagree, the manual wins. If the
          label and a forum post disagree, the label wins. Hire a licensed
          electrician for a 240 V homerun. This site is not an inspection.
        </p>
      </Callout>
      <ul>
        <li>
          Fasten into studs, blocking, or masonry. Drywall, a metal liner, and
          a picture hook are not structure.
        </li>
        <li>
          Keep the walking path, the door swing, and stored solvents out of the
          listed distances. A heater over a paper-towel roll is still a
          clearance failure.
        </li>
        <li>
          Two wall units on a long two-car are two circuits, not a daisy-chain
          off the first tap. See{" "}
          <Link href="/120v-vs-240v-garage-heater">breaker and panel limits</Link>
          .
        </li>
        <li>
          Cord versus a landed circuit is the{" "}
          <Link href="/hardwired-vs-plugin-garage-heater">
            hardwired vs plug-in
          </Link>{" "}
          fork. Do not hang a portable by its handle and call it a wall heater.
        </li>
      </ul>

      <h2 id="not-this">What this aisle is not</h2>
      <ul>
        <li>
          <strong>Not a Comfort Zone CZ220 on a wall.</strong> That class is a
          ceiling sheet. Use it overhead, or pick a cabinet whose manual lists
          wall.
        </li>
        <li>
          <strong>Not a scored “best of 12.”</strong> We will not invent a #1.
          Pick on circuit, listing, mount the sheet actually allows, and
          whether you are heating a bay or a person.
        </li>
        <li>
          <strong>Not a 7.5 kW unit on a 5 kW circuit.</strong> The DR-975-class
          needs the larger copper and breaker the manual calls for.
        </li>
        <li>
          <strong>Not a 15 A infrared for whole-bay heat.</strong> Same watts as
          a milkhouse heater. Same{" "}
          <Link href="/electric-garage-heater-operating-cost">
            cost-to-run math
          </Link>
          . Fewer watts, not a 120 V discount.
        </li>
      </ul>

      <h2 id="retailers">Retailer and Amazon Associates links</h2>
      <p>
        The three rows below are labeled Amazon Associates text links (tag{" "}
        <code className="font-mono text-[0.9em]">laqaer-20</code>). Street prices
        move, and a listing may be a class sibling. Confirm wall (or wall-or-ceiling)
        language on the page you open, plus the nameplate. We did not reuse the
        CZ220-class or milkhouse ASINs. Those form factors are wrong for this
        aisle.
      </p>

      <SpecTable
        caption="Amazon Associates listings for wall-listed electric garage heater classes"
        columns={["Class", "What to verify on the listing", "Affiliate / retailer link"]}
        rows={[
          [
            "Fahrenheat FUH54-class",
            "FUH54 / FUH54C, 5000 W @ 240 V, jumper derate table, copper-only warning, wall or ceiling in the sheet, listing mark",
            <AmazonAffiliateLink key="fuh54" href={AMAZON_FAHRENHEAT_FUH54}>
              Amazon: Fahrenheat FUH5-4 5000W (FUH54-class)
            </AmazonAffiliateLink>,
          ],
          [
            "Dr. Infrared DR-975-class",
            "DR-975, 7500 W / 240 V, hardwired, wall/ceiling bracket, 40 A guidance, listed mark. Fan-forced despite the brand name",
            <AmazonAffiliateLink key="dr975" href={AMAZON_DR_INFRARED_DR975}>
              Amazon: Dr. Infrared DR-975 7500W wall/ceiling
            </AmazonAffiliateLink>,
          ],
          [
            "Heat Storm Tradesman 1500 W",
            "HS-1500-TT, 1500 W / 120 V, wall bracket on the sheet, tip-over / housing-vertical note, listed mark. Do not treat tripod-only copy as a wall listing",
            <AmazonAffiliateLink key="hs1500tt" href={AMAZON_HEAT_STORM_TRADESMAN}>
              Amazon: Heat Storm HS-1500-TT 1500W (Tradesman)
            </AmazonAffiliateLink>,
          ],
        ]}
      />
      <p>
        If the building is the real load, read{" "}
        <Link href="/insulate-garage-before-heater-upgrade">
          seal and insulate first
        </Link>{" "}
        before you hang a second cabinet.
      </p>
    </GuideChrome>
  );
}
