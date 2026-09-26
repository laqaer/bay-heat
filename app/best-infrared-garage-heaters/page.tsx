import type { Metadata } from "next";
import Link from "next/link";
import { AmazonAffiliateLink } from "@/components/amazon-link";
import { Callout } from "@/components/callouts";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import {
  AMAZON_COMFORT_ZONE_CZQTV5M,
  AMAZON_DR_INFRARED_DR238,
  AMAZON_HEAT_STORM_TRADESMAN,
} from "@/lib/affiliates";
import { findGuide } from "@/lib/site";

const guide = findGuide("/best-infrared-garage-heaters")!;

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
  { id: "beam-not-bay", label: "A beam, not a bay" },
  { id: "when-ir", label: "When infrared beats forced-air" },
  { id: "matrix", label: "Comparison matrix" },
  { id: "czqtv5m", label: "Ceiling quartz" },
  { id: "dr238", label: "Wall or ceiling carbon" },
  { id: "tradesman", label: "15 A tripod / wall" },
  { id: "circuit", label: "Circuit notes" },
  { id: "clearance", label: "Mounting, clearance, fire" },
  { id: "not-this", label: "What this aisle is not" },
  { id: "retailers", label: "Retailer / Amazon links" },
];

export default function InfraredGarageHeatersPage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="beam-not-bay">A beam, not a bay</h2>
      <p>
        Search treats “best infrared garage heater” as a ranked shopping list.
        For electric workshop heat, infrared is a beam. It warms the person,
        the bench, and whatever else sits in front of the element. It does not
        warm the air you are leaking under the door. That distinction is the{" "}
        <Link href="/forced-air-vs-infrared-garage-heater">
          forced-air vs infrared
        </Link>{" "}
        page. This page is the shopping class: three radiant units whose
        listings actually name a garage or workshop, with the mount the sheet
        allows.
      </p>
      <p>
        We do not publish star ratings, “editor scores,” or invented
        square-foot coverage. All three picks below top out near 1,500 W at
        120 V. That is spot heat. A sealed two-car that needs the air itself
        warm is still a{" "}
        <Link href="/best-electric-garage-heaters-by-size">size</Link> and{" "}
        <Link href="/best-wall-mount-garage-heaters">wall-mount</Link> or
        ceiling forced-air problem. Confirm the revision you buy. Suffixes and
        bundle titles change.
      </p>
      <Callout title="Install reality">
        <p>
          These are not 5 kW homeruns. They are 120 V corded loads. A 1,500 W
          tap is 12.5 A, which sits over the usual continuous ceiling on a 15 A
          circuit. Mount only where the manual allows — ceiling, wall, or
          tripod are not interchangeable across these three — and keep the
          clearances in that sheet. Radiant elements ignite rags, cardboard,
          and solvents. Hire a licensed electrician if you are adding a
          circuit rather than plugging into one you already have.
        </p>
      </Callout>

      <h2 id="when-ir">When infrared beats forced-air</h2>
      <p>
        Forced-air wins when the door stays down and you want the bay to feel
        like a room. Infrared wins when you would be heating air that leaves:
      </p>
      <ul>
        <li>a bench or stall you actually stand in, with the rest of the garage allowed to stay cold,</li>
        <li>the overhead door up for loading, detailing, or a long repair,</li>
        <li>a high or leaky shop where a fan is only stirring the stack,</li>
        <li>finish or dusty work where you do not want a blower throwing debris.</li>
      </ul>
      <p>
        Standing out of the beam feels like the heater is off. That is the
        product working as designed. If the job is even temperature from stall
        to stall, leave this aisle and read{" "}
        <Link href="/wall-mount-vs-ceiling-garage-heater">
          wall vs ceiling
        </Link>{" "}
        for the fan-forced cabinets. Mount choice on this page is where the
        beam has to point, not how far a louver can throw air.
      </p>

      <h2 id="matrix">Comparison matrix</h2>
      <p>
        Figures below come from current listings and install literature for
        these models (Comfort Zone CZQTV5M sheet; Dr. Infrared DR-238 listing
        and family install sheet; Heat Storm Tradesman HS-1500-TT sheet).
        Confirm the copy that ships with the unit.
      </p>

      <SpecTable
        caption="Electric infrared heaters used as garage and workshop spot heat"
        columns={[
          "Class",
          "Model",
          "Voltage / install",
          "Nameplate watts",
          "Circuit the load implies",
          "Mount the sheet lists",
        ]}
        rows={[
          [
            "Ceiling quartz",
            "Comfort Zone CZQTV5M",
            "120 V, grounded plug, pull cord",
            "About 750–760 W low / 1,500 W high, plus a small halogen lamp",
            "12.5 A at 1,500 W. A 15 A / 120 V receptacle. Heater should be the only significant load",
            "Ceiling only. The sheet forbids wall and sloped-roof mounting",
          ],
          [
            "Wall or ceiling carbon",
            "Dr. Infrared DR-238",
            "120 V plug, remote, no thermostat on this listing",
            "900 / 1,200 / 1,500 W",
            "7.5 A / 10 A / 12.5 A. Same 15 A receptacle rule at the high tap",
            "Wall or ceiling brackets in the box. Family sheet: lowest edge about 94.5 in. off the floor",
          ],
          [
            "15 A tripod or wall",
            "Heat Storm Tradesman HS-1500-TT",
            "120 V plug-in",
            "1,500 W (12.5 A)",
            "A 15 A / 120 V receptacle. Treat ~12 A as the continuous ceiling",
            "Wall or tripod. Listing: black housing must sit vertical. Not a ceiling default",
          ],
        ]}
      />

      <h2 id="czqtv5m">Ceiling quartz (Comfort Zone CZQTV5M)</h2>
      <p>
        Comfort Zone CZQTV5M is the overhead quartz tube aimed at a bench. Dual
        quartz elements, a metal grille, overheat cutout, and a pull cord that
        also runs a small halogen work light (the sheet’s lamp is on the order
        of 25 W, type G9). The low heat tap is one tube. The high tap is both.
        The manual’s low figure is 760 W; some listings round it to 750 W. Use
        the label. High is 1,500 W at 120 V, 12.5 A. The manufacturer page
        calls the unit ETL listed. Confirm the mark on the carton you receive.
      </p>
      <p>
        The install sheet is blunt: this unit is a ceiling heater. Mounting it
        on a wall or on a sloped surface is called out as a fire risk, because
        the housing can overheat or light nearby combustibles. The bracket tilts
        about 90° so you can aim the beam. That tilt is not permission to hang
        it sideways on studs. Fasten into joists or blocking, keep the cord off
        the face of the tubes, and do not treat a picture hook as structure.
      </p>
      <p>
        Tradeoff: it frees the floor, and the light is useful over a bench. It
        is still a 15 A spot heater. It will not even out a two-car bay. Quartz
        tubes are glass; a crushed carton is a dead heater, not a “warm-up”
        period. The sheet’s BTU line (about 5,120 at 1,500 W) is the wattage
        converted, not a coverage promise.
      </p>

      <h2 id="dr238">Wall or ceiling carbon (Dr. Infrared DR-238)</h2>
      <p>
        DR-238 is a carbon infrared tube in an aluminum housing, with a cord, a
        remote, and brackets for wall or ceiling. The listing’s taps are 900 W,
        1,200 W, and 1,500 W at 120 V (7.5 A, 10 A, and 12.5 A). The product
        page says ETL listed and claims IP55. It also says there is no
        thermostat. The Amazon title leads with patio, restaurant, and garage
        in one breath. This page uses it as a garage beam. It is not a propane
        dining umbrella, and it is not whole-bay heat.
      </p>
      <p>
        A family install sheet wants the lowest part of the heater about 94.5
        in. (2.4 m) off the floor for both wall and ceiling mounts, about 19.7
        in. from an adjacent wall, and — on a wall — about 15.8 in. from the
        ceiling. Horizontal or ceiling aim is limited to a stated angle band
        (not steeper than the sheet allows). Solid structure only: concrete,
        wood, or metal, not drywall alone, and not a flammable surface. If your
        ceiling cannot keep the element that high, this model is the wrong
        pick. Use the sheet in the box if it disagrees with this summary.
      </p>
      <p>
        Tradeoff against the Comfort Zone: you can choose wall or ceiling, and
        the 900 W and 1,200 W taps sit under the 15 A continuous ceiling that
        1,500 W does not. Tradeoff against a real shop heater: it is still
        1,500 W. The IP claim is a listing line. If the label does not match,
        do not hang it in the rain. The{" "}
        <Link href="/best-wall-mount-garage-heaters">wall-mount guide</Link>{" "}
        covers a different Dr. Infrared cabinet, the DR-975, which is fan-forced
        7,500 W despite the brand name. Do not buy that one because this page
        said “infrared.”
      </p>

      <h2 id="tradesman">15 A tripod or wall (Heat Storm Tradesman)</h2>
      <p>
        Heat Storm HS-1500-TT is a 1,500 W / 120 V carbon infrared with a plug.
        Many listings lead with the tripod. The install sheet still lists a
        wall bracket. The same listing says the black housing must sit vertical
        or the tip-over switch will not let the unit run, and that ceiling mount
        is not the default path. Follow that. A tripod in the walkway is a trip
        hazard; a wall mount keeps the floor clear if the studs and the 72 in.
        bottom-height on the US sheet both work.
      </p>
      <p>
        The US sheet wants that bottom edge at least 72 in. off the floor and
        clearance to combustibles on the order of 18 in. at the sides (some
        copies also call 18–24 in. above). The Amazon listing claims IPX4 and
        disagrees with itself about cord length (7 ft in one line, 8 ft in
        another). Use the cord on the unit. One heat level means you cannot
        derate it the way the DR-238 taps allow. It heats a person in the beam.
        It will not heat a two-car bay. The longer write-up of the wall path is
        on the{" "}
        <Link href="/best-wall-mount-garage-heaters">wall-mount page</Link>.
      </p>

      <h2 id="circuit">Circuit notes</h2>
      <p>
        A heater that runs for hours is a continuous load. On a 15 A / 120 V
        circuit, 15 × 120 × 0.8 is about 1,440 W. All three high taps are 1,500
        W, which is 12.5 A. Same rule as a{" "}
        <Link href="/portable-garage-heaters-15a-circuit">
          milkhouse portable
        </Link>
        : the heater should be the only significant load, plugged into the
        receptacle, not a daisy-chained strip. Garage receptacles are often
        GFCI protected. A 1,500 W element is a frequent trip. Reset once,
        inspect the cord, and stop if it trips again.
      </p>
      <p>
        The DR-238 900 W tap is 7.5 A and the 1,200 W tap is 10 A. The CZQTV5M
        low tap is one tube, about 760 W. Those lower settings are how you stay
        under the continuous ceiling without pretending 1,500 W is a 12 A load.
        Two of these heaters on one 15 A circuit are two loads. They need two
        circuits. See{" "}
        <Link href="/120v-vs-240v-garage-heater">breaker and panel limits</Link>.
      </p>
      <p>
        None of these is a 240 V hardwired cabinet. Cord versus a landed
        circuit is the{" "}
        <Link href="/hardwired-vs-plugin-garage-heater">
          hardwired vs plug-in
        </Link>{" "}
        fork. Operating cost is still watts × hours the element is on × your
        rate — a lower tap costs less per hour because it is fewer watts, not
        because infrared is a discount. The arithmetic is on the{" "}
        <Link href="/electric-garage-heater-operating-cost">
          cost-to-run
        </Link>{" "}
        page.
      </p>

      <h2 id="clearance">Mounting, clearance, and fire</h2>
      <p>
        National Electrical Code rules for fixed electric space-heating
        equipment are about listing, branch circuits, and not burying a heat
        source. They do not hand you a universal mounting height. Height, aim,
        and clearance to combustibles come from the listing and the manual for
        that model. The three sheets do not match each other:
      </p>
      <ul>
        <li>
          CZQTV5M: ceiling only. Wall or a sloped roof is the failure the
          manual is trying to prevent.
        </li>
        <li>
          DR-238: wall or ceiling, with a high minimum distance from the floor
          on the family sheet. A low garage ceiling can make that unit illegal
          to install as written.
        </li>
        <li>
          HS-1500-TT: wall or tripod, housing vertical, not the ceiling path.
          The bottom-height figure is lower than the DR-238 sheet. Do not mix
          the two numbers.
        </li>
      </ul>
      <Callout title="Read the sheet on the unit you buy">
        <p>
          If the manual and a retailer title disagree, the manual wins. If the
          label and a forum post disagree, the label wins. This site is not an
          inspection.
        </p>
      </Callout>
      <ul>
        <li>
          Keep rags, cardboard, paper towels, gasoline, and solvents outside
          the listed distance. A heater aimed at a plastic bumper or a
          parts-washer lid is still a clearance failure.
        </li>
        <li>
          Do not leave an unattended radiant tube running in a shop full of
          fuel and overspray. Tip-over and overheat switches are backups, not
          permission to crowd the element.
        </li>
        <li>
          Fasten into structure. The cord stays out of the beam. An extension
          cord is a last resort only if that model’s sheet allows one, at the
          gauge it names. The CZQTV5M sheet says a cord is not recommended and,
          if used, wants at least 14 AWG and a 1,875 W rating.
        </li>
      </ul>

      <h2 id="not-this">What this aisle is not</h2>
      <ul>
        <li>
          <strong>Not a propane patio umbrella.</strong> Two of these listings
          also say patio. The garage job is a directed electric beam. A
          freestanding gas mushroom is a different appliance, with CO and
          clearance rules this page does not cover.
        </li>
        <li>
          <strong>Not the Dr. Infrared DR-975.</strong> That cabinet is
          fan-forced 7,500 W / 240 V. The brand name is not the heat type.
        </li>
        <li>
          <strong>Not a Comfort Zone CZ220 or Fahrenheat FUH54.</strong> Those
          are fan-forced ceiling units. Right tool when you are heating air.
          Wrong row in this matrix.
        </li>
        <li>
          <strong>Not a scored “best of 12.”</strong> Pick on mount the sheet
          allows, whether you can derate below 1,500 W, and whether the beam
          is actually the job.{" "}
          <Link href="/best-electric-garage-heaters-by-size">
            Size by garage
          </Link>{" "}
          if you still need the bay warm.
        </li>
        <li>
          <strong>Not two 1,500 W plugs on one 15 A breaker.</strong> And not a
          substitute for sealing the door. If the building is the load, read{" "}
          <Link href="/insulate-garage-before-heater-upgrade">
            seal and insulate first
          </Link>
          .
        </li>
      </ul>

      <h2 id="retailers">Retailer and Amazon Associates links</h2>
      <p>
        The three rows below are labeled Amazon Associates text links (tag{" "}
        <code className="font-mono text-[0.9em]">laqaer-20</code>). Street prices
        move, and a listing may be a class sibling or a patio bundle. Confirm
        the model number, the mount language, and the nameplate. We did not
        reuse the CZ220-class, FUH54-class, milkhouse, or DR-975 ASINs. Those
        are fan-forced, or they are not this radiant job.
      </p>

      <SpecTable
        caption="Amazon Associates listings for electric infrared garage and workshop heaters"
        columns={["Class", "What to verify on the listing", "Affiliate / retailer link"]}
        rows={[
          [
            "Comfort Zone CZQTV5M",
            "CZQTV5M, ceiling quartz, about 750–760 / 1,500 W, 120 V, pull cord, ceiling-only language, listing mark",
            <AmazonAffiliateLink key="czqtv5m" href={AMAZON_COMFORT_ZONE_CZQTV5M}>
              Amazon: Comfort Zone CZQTV5M ceiling quartz
            </AmazonAffiliateLink>,
          ],
          [
            "Dr. Infrared DR-238",
            "DR-238, 900 / 1,200 / 1,500 W, 120 V, wall and ceiling brackets, ETL claim, IP claim on the label. Not the DR-975",
            <AmazonAffiliateLink key="dr238" href={AMAZON_DR_INFRARED_DR238}>
              Amazon: Dr. Infrared DR-238 carbon infrared
            </AmazonAffiliateLink>,
          ],
          [
            "Heat Storm Tradesman 1500 W",
            "HS-1500-TT, 1,500 W / 120 V, wall or tripod, housing-vertical note, not a ceiling default, listed mark",
            <AmazonAffiliateLink key="hs1500tt" href={AMAZON_HEAT_STORM_TRADESMAN}>
              Amazon: Heat Storm HS-1500-TT 1500W (Tradesman)
            </AmazonAffiliateLink>,
          ],
        ]}
      />
    </GuideChrome>
  );
}
