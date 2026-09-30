import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { WhyNot } from "@/components/commerce/WhyNot";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { heaterClass } from "@/lib/planner/catalog";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";

const entry = findPage("/infrared-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["hs1500tt-manual", "nec-2023"];

export default function Page() {
  const result = plan(EXAMPLE_A_INPUT);
  const target = EXAMPLE_A_INPUT.targetTemp;
  const comfortEquivalent = target - 5;

  const hs1500tt = findProduct("hs1500tt-wall-infrared")!;
  const irTube = findProduct("e-ir-240-generic")!;
  const irWallClass = heaterClass("e_ir_wall_1500");
  const irTubeClass = heaterClass("e_ir_240");

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        Radiant (infrared/quartz) heat warms people and surfaces directly, so it still feels warm right where the
        door is open or a draft cuts across the floor. Forced-air heats the room&apos;s air, which a big door
        opening or a leaky envelope keeps flushing outside. A drafty shop or a bay with the door up often does
        better on radiant; a fully enclosed garage that needs even heat throughout does better on forced-air.
      </AnswerBlock>

      <h2>Why the door matters more than the wattage</h2>
      <p>
        A forced-air heater — a 240V fan-forced unit or a vented gas unit heater — raises the temperature of the
        air in the room, then relies on that warm air staying put. Open a{" "}
        <Num v={16} unit="ft" ev="C" src="EXAMPLE_A_INPUT.garageDoors[0].w — lib/planner/fixtures.ts" /> garage door
        and the air it just heated leaves in minutes; the heater keeps working against a load the planner&apos;s{" "}
        <Num v={result.heating.items.find((i) => i.key === "garage_doors")?.pct ?? 0} unit="%" round={1} ev="C" src="heatLossDesign() on EXAMPLE_A_INPUT — garage_doors share of design load" /> door-loss share
        already accounts for.
      </p>
      <p>
        A radiant heater skips that step. It heats the person, the workbench, and the slab under your feet by
        direct infrared, the same way sunlight warms your arm on a cold day before it warms the air around it. Cut
        the air moving and the heat still lands.
      </p>

      <h2>The comfort-equivalent assumption</h2>
      <p>
        BayHeat&apos;s planner models this as a labeled assumption, not a logged result: because radiant output
        reaches people and the slab directly, it treats radiant heat as feeling like forced-air heat run about{" "}
        <Num v={5} unit="°F" ev="E" src="planner-engineering.md §7, radiant comfort-equivalent assumption: target − 5°F for radiant, applied in lib/planner/heatLoss.ts" />{" "}
        warmer than the thermostat reading. On BayHeat&apos;s standard worked example — a 24×24 ft attached 2-car
        garage in Chicago — holding <Num v={target} unit="°F" ev="C" src="EXAMPLE_A_INPUT.targetTemp" /> by forced-air
        feels comparable to holding about{" "}
        <Num v={comfortEquivalent} unit="°F" ev="E" src="EXAMPLE_A_INPUT.targetTemp − 5°F comfort-equivalent assumption" />{" "}
        of radiant air temperature — nobody has logged this with a thermal-comfort survey in this garage, so treat
        it as a modeled estimate, not a measurement.
      </p>
      <Callout variant="note">
        This assumption only shows up in the planner&apos;s comfort framing — it never changes the BTU/h design
        load itself, which still has to cover the same wall, door, and air-leak losses either way.
      </Callout>

      <h2>The two radiant classes on the market</h2>
      <p>
        Both run on electric resistance, so neither needs venting — the tradeoff is coverage area, not combustion
        safety.
      </p>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">120V WALL INFRARED · 1.5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Heat Storm HS-1500-TT</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="hs1500tt.watts" /> (
            <Num v={irWallClass.outputBtuh[0]} unit="BTU/h" round={100} ev="C" src="HEATER_CLASSES.e_ir_wall_1500.outputBtuh — lib/planner/catalog.ts" />–
            <Num v={irWallClass.outputBtuh[1]} unit="BTU/h" round={100} ev="C" src="HEATER_CLASSES.e_ir_wall_1500.outputBtuh" />) on an existing
            120V outlet, mounted at <Num f="hs1500tt.mount_height_in_us" /> or higher. Sized for a workbench or one
            bay, not a whole garage.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{hs1500tt.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(hs1500tt, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {hs1500tt.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V QUARTZ/TUBE CEILING · 3–6 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">240V infrared ceiling heater</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num v={irTubeClass.outputBtuh[0]} unit="BTU/h" round={100} ev="C" src="HEATER_CLASSES.e_ir_240.outputBtuh — lib/planner/catalog.ts" />–
            <Num v={irTubeClass.outputBtuh[1]} unit="BTU/h" round={100} ev="C" src="HEATER_CLASSES.e_ir_240.outputBtuh" /> on a{" "}
            <Num v={240} unit="V" ev="C" src="HEATER_CLASSES.e_ir_240.circuit — lib/planner/catalog.ts" />,{" "}
            <Num v={30} unit="A" ev="C" src="HEATER_CLASSES.e_ir_240.circuit" /> circuit. Aimed down from a high
            ceiling, it&apos;s built for a drafty shop or a bay that runs with the door up, not a sealed, evenly
            heated room.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{irTube.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(irTube, "site")[0].href}>Search on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {irTube.priceClass}</p>
        </div>
      </div>

      <h2>Where radiant alone falls short</h2>
      <WhyNot
        rows={[
          {
            classId: "e_ir_240",
            text: "A fully enclosed, occupied garage that needs even heat throughout — a finished workshop you sit in for hours — is better served by forced-air or a mini-split. Radiant only warms what's in its direct line of sight; the far corner of a closed room stays cold under a spot infrared element.",
          },
        ]}
      />
      <p>
        Radiant panels also do nothing for the air itself, so a garage that needs to keep tools, paint, or stored
        goods above a minimum temperature — not just a person working in it — needs forced-air or a heat pump
        instead.
      </p>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          Both classes are electric resistance, not combustion, but a radiant element runs hot to the touch and
          aims heat outward on purpose. Keep the manual&apos;s clearance from anything flammable, and never aim
          one at a vehicle&apos;s fuel fill or a gasoline can. A 120V unit still needs GFCI protection on the
          outlet it plugs into (<Num f="code.nec.210_8_a" />). Your electrician and your local code edition
          govern.
        </p>
      </SafetyCallout>
      <p>
        For a garage sized from your own dimensions, run the{" "}
        <a href="/garage-heater-calculator">garage heater calculator →</a>. For every wall-listed electric class
        side by side, see <a href="/best-wall-mount-garage-heaters">wall-mount garage heaters →</a>.
      </p>
    </ReportPage>
  );
}
