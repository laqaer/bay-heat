import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { QuickPick } from "@/components/commerce/QuickPick";
import { findProduct } from "@/lib/commerce/products";
import { getFact } from "@/lib/facts";
import { GradeScale } from "@/components/figures/GradeScale";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { PRESET_DEFAULTS } from "@/lib/planner/presets";
import { heatLossDesign, type HeatLossResult } from "@/lib/planner/heatLoss";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { designTempFor } from "@/lib/planner/uncertainty";
import { stationById } from "@/lib/planner/stations";
import { SIZING_MARGIN } from "@/lib/planner/constants";
import type { CeilingIns, GarageDoorType, GarageInput, Preset, Tightness, WallType } from "@/lib/planner/types";

const entry = findPage("/garage-heater-size")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const PRESET_ORDER: Exclude<Preset, "custom">[] = ["1car", "2car", "3car", "4car"];
const PRESET_LABEL: Record<Exclude<Preset, "custom">, string> = {
  "1car": "1-car",
  "2car": "2-car",
  "3car": "3-car",
  "4car": "4-car",
};

const REP_STATIONS = [
  { id: "IL-chicago", label: "Cold climate — Chicago, IL" },
  { id: "GA-atlanta", label: "Mild climate — Atlanta, GA" },
];

type TierName = "tight" | "leaky";
const TIERS: Record<TierName, { wallType: WallType; ceilingIns: CeilingIns; doorType: GarageDoorType; tightness: Tightness; label: string }> = {
  tight: { wallType: "R13", ceilingIns: "R30", doorType: "kit_eps_or_batt", tightness: "tight", label: "Tight (R-13 walls, R-30 ceiling, insulated door kit)" },
  leaky: { wallType: "uninsulated_finished", ceilingIns: "drywall_uninsulated", doorType: "steel_single", tightness: "leaky", label: "Leaky (uninsulated walls, bare ceiling, steel door)" },
};

// A detached garage, so every number here is envelope and climate only -- no shared house wall to net out.
// An attached garage needs somewhat less than the leaky/tight brackets below because of that coupling.
function buildInput(presetKey: Exclude<Preset, "custom">, tier: TierName, stationId: string): GarageInput {
  const p = PRESET_DEFAULTS[presetKey];
  const t = TIERS[tier];
  return {
    v: 1,
    state: stationId.split("-")[0],
    stationId,
    preset: presetKey,
    width: p.width,
    depth: p.depth,
    height: p.height,
    roofPitch: 6,
    attached: false,
    commonWallLen: 0,
    wallType: t.wallType,
    ceilingType: "attic",
    ceilingIns: t.ceilingIns,
    roofType: "shingle_deck_uninsulated",
    garageDoors: p.garageDoors.map((d) => ({ w: d.w, h: d.h, type: t.doorType })),
    windowsFt2: p.windowsFt2,
    windowType: "single_metal",
    serviceDoorFt2: p.serviceDoorFt2,
    serviceDoorType: "hollow_wood",
    slabEdge: "none",
    tightness: t.tightness,
    flammablesStored: "unknown",
    tHouse: 68,
    targetTemp: 55,
    useCase: "shop",
    usage: { mode: "continuous", sessionsPerWeek: 0, hoursPerSession: 0, doorOpeningsPerSession: 0 },
    warmupGoalMin: 60,
    circuit: "unknown",
    canAddCircuit: true,
    panelAmps: 200,
    fuels: ["electric"],
    ventingPossible: false,
    priority: "balanced",
    wantsCooling: false,
  };
}

function runTier(presetKey: Exclude<Preset, "custom">, tier: TierName, stationId: string): HeatLossResult {
  const station = stationById(stationId)!;
  const input = buildInput(presetKey, tier, stationId);
  const envelope = resolveEnvelope(input);
  const tOut = designTempFor(input, station);
  return heatLossDesign(input, envelope, tOut, station.elevFt);
}

// Heaters that can be bought in one click for the brackets most garages land in. Which rows each one covers is
// computed from the table, never typed, and only at the tight end: a single heater that covers a leaky garage on
// paper is the purchase this page tells readers not to make. Every row models holding the garage warm
// continuously, so only hardwired, thermostat-controlled heaters qualify: a 120 V portable is attended-use only
// (lib/safety/verdict.ts rule 21). A pick with a manual mounting limit (`maxCeilingFact`) never lists a preset
// taller than that limit, which is why the 5 kW pick is the wall-or-ceiling FUH54: the CZ220's manual caps ceiling
// mounting at 8 ft, below the 2-4 car presets.
const PICKS: { productId: string; label: string; maxCeilingFact?: string }[] = [
  { productId: "fuh54-5kw", label: "5 kW on a 240 V, 30 A circuit, wall or ceiling" },
];

type Row = { presetKey: Exclude<Preset, "custom">; presetLabel: string; stationId: string; stationLabel: string; tight: HeatLossResult; leaky: HeatLossResult };

export default function Page() {
  const rows: Row[] = PRESET_ORDER.flatMap((presetKey) =>
    REP_STATIONS.map((station) => ({
      presetKey,
      presetLabel: PRESET_LABEL[presetKey],
      stationId: station.id,
      stationLabel: station.label,
      tight: runTier(presetKey, "tight", station.id),
      leaky: runTier(presetKey, "leaky", station.id),
    })),
  );

  const twoCarCold = rows.find((r) => r.presetKey === "2car" && r.stationId === "IL-chicago")!;
  const twoCarMild = rows.find((r) => r.presetKey === "2car" && r.stationId === "GA-atlanta")!;
  const short = (r: Row) => `${r.presetLabel} ${r.stationId === "IL-chicago" ? "Chicago" : "Atlanta"}`;
  const picks = PICKS.map((pick) => {
    const output = findProduct(pick.productId)?.outputBtuh ?? 0;
    const maxCeiling = pick.maxCeilingFact ? Number(getFact(pick.maxCeilingFact)?.value ?? 0) : Infinity;
    const fits = (r: Row) => r.tight.qSize <= output && PRESET_DEFAULTS[r.presetKey].height <= maxCeiling;
    return { ...pick, covers: rows.filter(fits).map(short) };
  }).filter((pick) => pick.covers.length > 0);
  const largest = Math.max(...PICKS.map((pick) => findProduct(pick.productId)?.outputBtuh ?? 0));
  const beyond = rows.filter((r) => r.tight.qSize > largest).map(short);

  return (
    <ReportPage entry={entry} sources={[]}>
      <AnswerBlock>
        A tight, insulated 2-car garage in Chicago needs about{" "}
        <Num v={twoCarCold.tight.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign(), tight envelope, IL-chicago h99" /> to{" "}
        <Num v={twoCarCold.leaky.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign(), leaky envelope, IL-chicago h99" /> if
        it&apos;s left bare and uninsulated. The same size garage in Atlanta only needs{" "}
        <Num v={twoCarMild.tight.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign(), tight envelope, GA-atlanta h99" /> to{" "}
        <Num v={twoCarMild.leaky.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign(), leaky envelope, GA-atlanta h99" />. This
        is a planning bracket built from size, insulation and climate alone — not a load calculation for your
        actual garage.
      </AnswerBlock>

      <Callout variant="note">
        This chart only varies four things: floor size, wall/ceiling/door insulation, tightness, and climate.
        Your real garage also depends on door count and size, whether it shares a wall with the house, and how
        drafty it actually is — none of which this bracket can see.{" "}
        <ButtonLink href="/garage-heater-calculator" variant="text">
          Run your exact garage through the calculator →
        </ButtonLink>
      </Callout>

      <h2>Wattage brackets by size and climate</h2>
      <p>
        Each row is the same detached garage size, computed twice: once at a tight envelope (R-13 walls, R-30
        ceiling, an insulated door kit, tight construction) and once at a leaky one (uninsulated walls, a bare
        drywall ceiling, a plain steel door, leaky construction). The bracket between them is the planning
        range — an attached garage sharing a house wall needs somewhat less than either end.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Size</th>
              <th className="py-2 pr-3 font-normal">Climate</th>
              <th className="py-2 pr-3 text-right font-normal">Tight envelope</th>
              <th className="py-2 pr-3 text-right font-normal">Leaky envelope</th>
              <th className="py-2 text-right font-normal">Planning bracket (W)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.presetKey}-${r.stationId}`} className="border-b border-(--color-line)/50">
                <td className="py-2 pr-3 text-(--color-fg)">{r.presetLabel}</td>
                <td className="py-2 pr-3 text-(--color-fg-2)">{r.stationLabel}</td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Num v={r.tight.qSize} unit="BTU/h" round={100} ev="C" src={`heatLossDesign() tight, ${r.presetLabel}, ${r.stationId}`} />
                </td>
                <td className="py-2 pr-3 text-right font-mono whitespace-nowrap">
                  <Num v={r.leaky.qSize} unit="BTU/h" round={100} ev="C" src={`heatLossDesign() leaky, ${r.presetLabel}, ${r.stationId}`} />
                </td>
                <td className="py-2 text-right font-mono whitespace-nowrap">
                  <Num v={r.tight.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign().kwSize * 1000, tight" />
                  {"–"}
                  <Num v={r.leaky.kwSize * 1000} unit="W" round={100} ev="C" src="heatLossDesign().kwSize * 1000, leaky" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-(--color-fg-2)">
        BTU/h and watts are the same load — watts is what a breaker and a heater&apos;s nameplate are actually
        rated in. Every figure above comes from the same physics engine behind the calculator, run at each
        preset&apos;s default dimensions with a{" "}
        <Num
          v={SIZING_MARGIN}
          ev="C"
          src="SIZING_MARGIN — lib/planner/constants.ts"
          format={(v) => `${Math.round((Number(v) - 1) * 100)}%`}
        />{" "}
        sizing margin already applied.
      </p>

      <h2>Heaters that match the tight end of a bracket</h2>
      <p>
        If your garage is insulated and sealed like the tight column, check whether its row is listed below. If
        it&apos;s closer to the leaky column, fix the door and ceiling first: the leaky column needs a much bigger
        heater, and it loses that extra heat every hour the heater runs. Your garage&apos;s own number from the{" "}
        <a href="/garage-heater-calculator">calculator</a> beats either column.
      </p>
      <p>
        No 1,500 W plug-in heater is on this list. Every row here holds the garage warm all day, and a cord-and-plug
        portable is for attended use only: unplug it when you leave. It suits spot heat while you work; the{" "}
        <a href="/portable-garage-heater">portable heater guide</a> covers that.
      </p>
      {picks.map((pick) => (
        <QuickPick
          key={pick.productId}
          productId={pick.productId}
          page={entry.href}
          eyebrow={`Model pick · ${pick.label}`}
          headline={`Covers the tight end of: ${pick.covers.join(", ")}.`}
        />
      ))}
      {beyond.length > 0 ? (
        <p>
          Above 5 kW ({beyond.join(", ")} even when tight), one 5 kW unit won&apos;t carry it. Compare a
          bigger 240 V unit on the <a href="/240v-garage-heater">240 V page</a> with gas, propane and heat-pump options
          on the <a href="/garage-heaters">fuel comparison</a>.
        </p>
      ) : null}

      <h2>Why the same size garage needs 3x more heater</h2>
      <p>
        Take the 2-car Chicago row above. Tight, it grades{" "}
        <strong>{twoCarCold.tight.grade}</strong> on the envelope scale; leaky, the exact same footprint grades{" "}
        <strong>{twoCarCold.leaky.grade}</strong>:
      </p>
      <GradeScale current={twoCarCold.tight.grade} />
      <GradeScale current={twoCarCold.leaky.grade} />
      <p>Here&apos;s where the leaky version&apos;s heat actually goes:</p>
      <HeatLossBars items={twoCarCold.leaky.items} fig={1} />

      <h2>How to read this, and when it&apos;s wrong for you</h2>
      <ul>
        <li>Every row assumes a detached garage. Attached to a heated house, the shared wall gives some of that heat back — your real number is usually lower.</li>
        <li>The design temperature is each station&apos;s ASHRAE 99% figure — the outdoor temperature it&apos;s colder than only about 1% of winter hours, not the coldest night on record.</li>
        <li>Door count and size vary by garage, even within one preset size — two 9 ft doors lose heat differently than one 16 ft door.</li>
        <li>This bracket doesn&apos;t know your actual wall type, ceiling insulation or how drafty your garage really is — it only shows the tight and leaky corners.</li>
      </ul>
      <p>
        For a bracket, that&apos;s the point — it tells you the shape of the problem before you measure anything.
        For a heater purchase, run the <a href="/garage-heater-calculator">garage heater calculator</a> with your
        actual dimensions, and see every class side by side on the{" "}
        <a href="/electric-garage-heater">electric heater page</a>. Don&apos;t buy by wattage alone off this chart.
      </p>
    </ReportPage>
  );
}
