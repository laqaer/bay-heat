import type { Metadata } from "next";
import Link from "next/link";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { findGuide } from "@/lib/site";

const guide = findGuide("/forced-air-vs-infrared-garage-heater")!;

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
  { id: "two-jobs", label: "Two different jobs" },
  { id: "forced-air", label: "When forced-air wins" },
  { id: "infrared", label: "When infrared wins" },
  { id: "drafty", label: "Drafty shops" },
  { id: "hybrids", label: "Hybrids and dead ends" },
];

export default function HeatTypeGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="two-jobs">Two different jobs</h2>
      <p>
        Forced-air (fan-forced) electric heaters warm air and throw it across
        the bay. Infrared / radiant heaters warm surfaces and people in the beam.
        Both convert nearly all of their watts into heat. Same watts at the
        meter are the same dollars — see{" "}
        <Link href="/electric-garage-heater-operating-cost">
          operating cost
        </Link>
        . They do not solve the same problem.
      </p>
      <p>
        If you want the whole garage to feel like a room, you are buying air
        changes, insulation, and enough watts to offset the envelope. If you
        want to stand at a bench with the door up, you are buying a beam of
        radiant heat and accepting that the far corner stays cold.
      </p>

      <SpecTable
        caption="Forced-air versus infrared for garage and workshop use"
        columns={["", "Forced-air", "Infrared / radiant"]}
        rows={[
          [
            "What it heats",
            "Air first, then objects",
            "People, slab, tools, and the car in the beam",
          ],
          [
            "Best envelope",
            "Door closed, some insulation, limited infiltration",
            "Drafty, high-ceiling, or door-open work",
          ],
          [
            "Typical cheap form",
            "Ceiling-mount 5 kW 240 V utility heater",
            "Quartz / halogen work light style, or a directed panel",
          ],
          [
            "Noise and dust",
            "Fan noise; stirs dust and fumes",
            "Usually quieter; less air mixing",
          ],
          [
            "Open door",
            "Heated air leaves; recovery is slow",
            "You still feel heat in the beam",
          ],
          [
            "Whole-bay evenness",
            "Better if the building holds air",
            "Uneven by design — that is the point",
          ],
        ]}
      />

      <h2 id="forced-air">When forced-air wins</h2>
      <p>
        Forced-air is the right default for an attached, reasonably sealed
        two-car garage where you park, putter, and want the space itself to be
        less miserable. A 5 kW ceiling unit with louvers and a tilt bracket can
        throw on the order of 18 ft of air (Comfort Zone CZ220 and Fahrenheat
        FUH54 manuals both use that approximate figure). That is a circulation
        tool, not a promise that a 24×24 uninsulated shop will sit at 68 °F.
      </p>
      <p>Forced-air is a poor fit when:</p>
      <ul>
        <li>the overhead door is open for long stretches,</li>
        <li>ceilings are high and uninsulated, so you heat a dead air stack,</li>
        <li>you are finishing or spraying and do not want a fan throwing overspray or dust,</li>
        <li>you only occupy a 6×8 ft patch of the floor.</li>
      </ul>
      <p>
        Sizing still comes first:{" "}
        <Link href="/best-electric-garage-heaters-by-size">
          wattage by garage size
        </Link>
        . A correctly typed heater that is 3 kW short is still a cold garage.
      </p>

      <h2 id="infrared">When infrared wins</h2>
      <p>
        Infrared (quartz tube, halogen, some carbon / panel radiants) is spot
        heat. It is the honest answer for:
      </p>
      <ul>
        <li>a workbench along one wall,</li>
        <li>a detail bay with the door up,</li>
        <li>a high, leaky shop where heating the cubic feet is a losing war,</li>
        <li>
          120 V portable use, where you only have ~1.5 kW and should spend it on
          the person, not the volume.
        </li>
      </ul>
      <p>
        It will not “even out” a three-car garage. Standing out of the beam
        feels like the heater is off. That is expected. Aim, mounting height,
        and clearance to combustibles matter more than brand. Follow the listing
        and the manual — radiant elements run hot enough to ignite nearby
        rags, solvents, and cardboard.
      </p>
      <p>
        Oil-filled radiators are a third category: they are convective, silent,
        and slow. They can take the chill off a small insulated 1-car. They are
        not infrared, and they are not a substitute for a 5 kW ceiling unit.
      </p>

      <h2 id="drafty">Drafty shops: do not buy more fan</h2>
      <p>
        The usual failure mode is a drafty two-car or three-car shop, a 5 kW
        forced-air unit on a 30 A / 240 V circuit, and an owner who concludes
        the heater is undersized. Sometimes it is undersized — see the
        uninsulated column on the{" "}
        <Link href="/best-electric-garage-heaters-by-size">size page</Link>.
        Often the air you paid to heat is leaving under the door.
      </p>
      <p>In that building, the ranked list is:</p>
      <ol>
        <li>
          weatherstrip, threshold, and an insulated door (see{" "}
          <Link href="/insulate-garage-before-heater-upgrade">
            seal first vs more watts
          </Link>
          ),
        </li>
        <li>infrared or directed radiant at the occupied zone,</li>
        <li>then more watts of forced-air, if the panel can take them.</li>
      </ol>
      <p>
        Two forced-air units in a barn with the door open will still feel like
        winter. That is infiltration, not a missing review score.
      </p>

      <h2 id="hybrids">Hybrids, “ceramic,” and dead ends</h2>
      <p>
        “Ceramic” on a 120 V box almost always means a portable fan-forced
        heater with a ceramic element. It is still forced-air. It is still ~12.5 A
        at 1,500 W. It is not a new physics package.
      </p>
      <p>
        Ceiling-mount infrared exists in the commercial catalog (often far above
        the $200 Comfort Zone / Fahrenheat aisle). We will not invent a
        consumer SKU matrix for products we cannot specify from a current
        nameplate. If you are hanging a 240 V radiant tube, treat it as a
        listed commercial fixture: mounting height, clearances, and a dedicated
        circuit.
      </p>
      <p>
        Next: if you have 240 V and a closed door, look at{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          ceiling-mount units under $200
        </Link>
        . If you have a 15 A outlet and a bench, stay on{" "}
        <Link href="/portable-garage-heaters-15a-circuit">portables</Link>.
      </p>
    </GuideChrome>
  );
}
