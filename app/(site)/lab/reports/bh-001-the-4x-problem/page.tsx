import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { heatLossDesign } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } from "@/lib/planner/fixtures";
import type { GarageInput } from "@/lib/planner/types";
import { getSource } from "@/lib/facts";

const entry = findPage("/lab/reports/bh-001-the-4x-problem")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = [
  "bob-vila-garage-heater-size",
  "filterbuy-how-to-heat-a-garage",
  "pickhvac-garage-heater-sizing",
  "thegarage-guide-heater-guide",
];

// Four real envelopes of the same 24x24x9 attached 2-car garage in Chicago (EXAMPLE_A_INPUT's footprint,
// climate and 55degF target held fixed) -- only the wall/ceiling/door/window/tightness change, bare-and-leaky
// through well-insulated-and-tight.
const ENVELOPES: { label: string; input: GarageInput }[] = [
  {
    label: "Bare, leaky",
    input: {
      ...EXAMPLE_A_INPUT,
      wallType: "open_studs",
      ceilingIns: "drywall_uninsulated",
      garageDoors: [{ w: 16, h: 7, type: "steel_single" }],
      windowType: "single_metal",
      serviceDoorType: "uninsulated_metal",
      tightness: "very_leaky",
    },
  },
  {
    label: "Code-minimum, average draftiness (our standard example)",
    input: EXAMPLE_A_INPUT,
  },
  {
    label: "Sealed with cheap fixes (door kit, weatherstrip)",
    input: {
      ...EXAMPLE_A_INPUT,
      garageDoors: [{ w: 16, h: 7, type: "steel_eps_1_375" }],
      tightness: "tight",
    },
  },
  {
    label: "Well-insulated, tight",
    input: {
      ...EXAMPLE_A_INPUT,
      wallType: "R21",
      ceilingIns: "R38",
      garageDoors: [{ w: 16, h: 7, type: "steel_pu_2" }],
      windowType: "double_lowe",
      serviceDoorType: "insulated",
      tightness: "tight",
    },
  },
];

export default function Page() {
  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);
  const tOut = designTempFor(EXAMPLE_A_INPUT, EXAMPLE_A_STATION);
  const rows = ENVELOPES.map(({ label, input }) => {
    const envelope = resolveEnvelope(input);
    const result = heatLossDesign(input, envelope, tOut, EXAMPLE_A_STATION.elevFt);
    return { label, result };
  });
  const low = rows[0].result.qSize;
  const high = rows[rows.length - 1].result.qSize;
  const spreadX = Math.round((high / low) * 10) / 10;
  const asIs = rows[1].result;
  const ceilingItem = asIs.items.find((i) => i.key === "ceiling_roof");
  const infilItem = asIs.items.find((i) => i.key === "infiltration");

  return (
    <ReportPage entry={entry} sources={sources}>
      <p>
        Search &quot;how many BTU to heat a 2-car garage&quot; and every published answer is a single number
        or a narrow range, with no envelope attached to it. Run the same 24×24 ft garage through a model that
        accounts for climate, the ceiling, air leaks and the attic, and the honest answer spans a wide range
        too — because it genuinely depends on the garage.
      </p>

      <h2>What publishers say</h2>
      <p>
        Four rules we could verify against a live page, quoted verbatim, each converted to the BTU/h a 24×24
        (576 ft²) garage implies:
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Publisher</th>
              <th className="py-2 font-normal">Implied BTU/h for 24×24</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3">Bob Vila</td>
              <td className="py-3">
                <Num f="rot.bob-vila.btuh" />
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3">Filterbuy</td>
              <td className="py-3">
                <Num f="rot.filterbuy.btuh" />
              </td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3">PickHVAC</td>
              <td className="py-3">
                <Num f="rot.pickhvac.btuh" />
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-3">thegarage.guide</td>
              <td className="py-3">
                <Num f="rot.thegarage-guide.btuh" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">
        Two more publishers that carry a garage-heater sizing rule could not be confirmed against a reachable
        page as of this report&apos;s retrieval date, so they&apos;re left out rather than guessed at.
      </p>

      <h2>Our model&apos;s answer: four real envelopes, one garage</h2>
      <p>
        None of the rules above ask what the garage is actually made of. Ours does. Same 24×24×9 ft footprint,
        same Chicago design day, same 55°F target — only the walls, ceiling, door, window and draftiness
        change:
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Envelope</th>
              <th className="py-2 pr-3 font-normal">Design load</th>
              <th className="py-2 font-normal">Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, result }) => (
              <tr key={label} className="border-b border-(--color-line)/50 align-top last:border-0">
                <td className="py-3 pr-3">{label}</td>
                <td className="py-3 pr-3 font-mono whitespace-nowrap">
                  <Num v={result.qSize} unit="BTU/h" round={100} ev="C" src={`heatLossDesign() — ${label} — lib/planner/heatLoss.ts`} />
                </td>
                <td className="py-3 font-mono">{result.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        That&apos;s a{" "}
        <Num v={spreadX} unit="×" round={0.1} ev="C" src="heatLossDesign() high/low across the four envelopes above" /> spread
        from bare-and-leaky to well-insulated-and-tight — on one garage, in one city, computed the same way
        each time. Every publisher figure above sits somewhere inside that range, because a bare garage and a
        sealed one are genuinely different heating problems, not the same problem with different opinions
        attached.
      </p>

      <h2>Why the rules disagree</h2>
      <p>
        A flat BTU-per-square-foot rule can only be right for one envelope. On our standard as-is example, the
        ceiling and attic alone account for{" "}
        {ceilingItem ? (
          <Num v={ceilingItem.pct} unit="%" ev="C" src="heatLossDesign(EXAMPLE_A_INPUT).items — ceiling_roof.pct" />
        ) : null}{" "}
        of the load, and air leaks another{" "}
        {infilItem ? (
          <Num v={infilItem.pct} unit="%" ev="C" src="heatLossDesign(EXAMPLE_A_INPUT).items — infiltration.pct" />
        ) : null}
        . A rule that only counts floor area treats a leaky attic and a tight, insulated one as the same
        garage. Climate matters too: the same envelope in a colder city needs a bigger heater, and no
        per-square-foot rule carries a design temperature with it.
      </p>

      <Callout variant="note">
        No physical test backs this report — every figure above is R (a publisher&apos;s own quoted number) or
        C (computed by our model), never M. A right-of-reply window goes to any publisher we name here before
        this page is updated with new figures.
      </Callout>
    </ReportPage>
  );
}
