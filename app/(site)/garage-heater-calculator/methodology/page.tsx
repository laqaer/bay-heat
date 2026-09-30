import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Num } from "@/components/evidence/Num";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeatLossBars } from "@/components/figures/HeatLossBars";
import { GradeScale } from "@/components/figures/GradeScale";
import { WarmupCurve } from "@/components/figures/WarmupCurve";
import { heatLossDesign, freeFloatTemp } from "@/lib/planner/heatLoss";
import { geometry } from "@/lib/planner/geometry";
import { resolveEnvelope } from "@/lib/planner/defaults";
import { altitudeFactor, annualMeanTemp } from "@/lib/planner/climate";
import { lightCapacitance, simulateSession } from "@/lib/planner/warmup";
import { circuitFor } from "@/lib/planner/electrical";
import { heaterClass } from "@/lib/planner/catalog";
import { WALL_U, HOUSE_COUPLING_UA, INFILTRATION_K, SIZING_MARGIN, TIGHTNESS_ACH, ATTIC_VENT_ACH, SLAB_F } from "@/lib/planner/constants";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION } from "@/lib/planner/fixtures";
import { getSource } from "@/lib/facts";

const entry = findPage("/garage-heater-calculator/methodology")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["nec-2023"];

export default function Page() {
  const envelope = resolveEnvelope(EXAMPLE_A_INPUT);
  const geo = geometry(EXAMPLE_A_INPUT);
  const tOut = EXAMPLE_A_STATION.h99;
  const elevationFt = EXAMPLE_A_STATION.elevFt;
  const result = heatLossDesign(EXAMPLE_A_INPUT, envelope, tOut, elevationFt);
  const altitude = altitudeFactor(elevationFt);

  const heaterWatts = heaterClass("e_240_10k").outputBtuh[0] / 3.412;
  const circuit = circuitFor(Math.round(heaterWatts), 240, 240);

  const uaHouse = EXAMPLE_A_INPUT.attached
    ? WALL_U[envelope.wallType] * EXAMPLE_A_INPUT.commonWallLen * EXAMPLE_A_INPUT.height + HOUSE_COUPLING_UA
    : 0;
  const tJan = EXAMPLE_A_STATION.tMean[0];
  const tStart = freeFloatTemp(EXAMPLE_A_INPUT, envelope, tJan, elevationFt, EXAMPLE_A_STATION);
  const cLight = lightCapacitance(EXAMPLE_A_INPUT, elevationFt);
  const sessionSim = simulateSession({
    uaOut: result.uaExt,
    uaHouse,
    tOut: tJan,
    tHouse: EXAMPLE_A_INPUT.tHouse,
    tStart,
    tGnd: annualMeanTemp(EXAMPLE_A_STATION),
    tTarget: EXAMPLE_A_INPUT.targetTemp,
    capacityBtuh: heaterClass("e_240_10k").outputBtuh[0],
    hours: 2,
    cLight,
    aFloor: geo.aFloor,
  });

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <p>
        Every number the planner shows traces back to one of the formulas on this page. There&apos;s no sales
        pressure here — no buy links, no product picks — just the load calculation, the warm-up model, the grade
        formula and the circuit-sizing rule, worked on BayHeat&apos;s standard example: a 24×24 ft attached two-car
        garage in Chicago, R-13 walls, one uninsulated steel door, average drafts, held at 55°F.
      </p>

      <h2>The load calculation: conduction</h2>
      <p>
        Walls, garage doors, windows and the service door each lose heat by conduction: assembly U-value (BTU/h per
        ft² per °F) times area times the indoor/outdoor temperature difference (ΔT). At Chicago&apos;s{" "}
        <Num v={tOut} unit="°F" ev="C" src="EXAMPLE_A_STATION.h99" /> 99%-design temperature and a 55°F target, ΔT is{" "}
        <Num v={result.deltaT} unit="°F" ev="C" src="heatLossDesign(EXAMPLE_A_INPUT) — lib/planner/heatLoss.ts" />. The
        garage door alone, at U-1.15 for an uninsulated steel door, accounts for{" "}
        <Num
          v={result.items.find((i) => i.key === "garage_doors")!.btuh}
          unit="BTU/h"
          round={100}
          ev="C"
          src="heatLossDesign(EXAMPLE_A_INPUT).items — lib/planner/heatLoss.ts"
        />{" "}
        of the design load.
      </p>
      <HeatLossBars items={result.items} fig={1} />

      <h2>Infiltration</h2>
      <p>
        Air leaking through gaps around doors, windows and the building envelope follows{" "}
        <code>Q = {INFILTRATION_K} × V × ACH × ΔT</code>, where V is the garage&apos;s volume in ft³ and ACH is the
        design-condition air changes per hour for its tightness class (
        <Num v={TIGHTNESS_ACH.tight} ev="C" src="TIGHTNESS_ACH.tight — lib/planner/constants.ts" /> tight to{" "}
        <Num v={TIGHTNESS_ACH.very_leaky} ev="C" src="TIGHTNESS_ACH.very_leaky — lib/planner/constants.ts" /> very
        leaky). The constant
        also carries an altitude correction, since colder, denser air at sea level infiltrates at a different rate
        than the same volumetric flow at elevation — Chicago&apos;s{" "}
        <Num v={elevationFt} unit="ft" ev="C" src="EXAMPLE_A_STATION.elevFt" /> gives a factor of{" "}
        <Num v={altitude} ev="C" src="altitudeFactor(elevationFt) — lib/planner/climate.ts" format={(v) => Number(v).toFixed(3)} />{" "}
        (1.0 at sea level; Denver&apos;s 5,414 ft works out to about 0.82). At &quot;average&quot; tightness, this
        garage&apos;s infiltration load comes to{" "}
        <Num
          v={result.items.find((i) => i.key === "infiltration")!.btuh}
          unit="BTU/h"
          round={100}
          ev="C"
          src="heatLossDesign(EXAMPLE_A_INPUT).items"
        />
        .
      </p>

      <h2>The ceiling: attic as a series resistance</h2>
      <p>
        A vented attic doesn&apos;t sit at either the indoor or the outdoor temperature. It floats in between,
        set by the ceiling&apos;s insulation on one side and the roof deck plus attic ventilation on the other. The
        model treats this as two resistances in series: the ceiling&apos;s own UA (insulation) and the attic-to-
        outdoors UA (roof deck conduction plus{" "}
        <Num v={ATTIC_VENT_ACH} unit="ACH" ev="C" src="ATTIC_VENT_ACH — lib/planner/constants.ts" /> of attic air
        changes per hour), combined as{" "}
        <code>UA_ceiling_eff = 1 / (1/UA_ceiling + 1/UA_attic-out)</code>. That combined UA times ΔT gives the
        ceiling load — for this garage,{" "}
        <Num
          v={result.items.find((i) => i.key === "ceiling_roof")!.btuh}
          unit="BTU/h"
          round={100}
          ev="C"
          src="heatLossDesign(EXAMPLE_A_INPUT).items"
        />
        , the single largest line on the chart above. The same calculation yields an intermediate attic temperature —{" "}
        <Num
          v={result.atticTempF ?? 0}
          unit="°F"
          ev="C"
          src="heatLossDesign(EXAMPLE_A_INPUT).atticTempF"
          format={(v) => Number(v).toFixed(1)}
        />{" "}
        on this garage&apos;s design day — that a flat, non-series model can&apos;t produce, and that a{" "}
        <Link href="/how-to-insulate-a-garage">blown-in ceiling upgrade</Link> changes directly.
      </p>

      <h2>Slab-edge loss</h2>
      <p>
        Heat leaving through an uninsulated slab doesn&apos;t scale with floor area. It scales with the exposed
        perimeter, because the loss concentrates at the edge where the slab meets outdoor air. The model uses an
        F-factor (BTU/h per linear ft of edge per °F), not a U-value times area: <code>Q = F × L_ext × ΔT</code>.
        L_ext is the exterior perimeter, with any common (house) wall excluded. An uninsulated edge runs about F ={" "}
        <Num v={SLAB_F.none} ev="C" src="SLAB_F.none — lib/planner/constants.ts" />; edge insulation (R-10 to R-20,
        24-48 in deep) roughly cuts that F-factor in half or better.
      </p>

      <h2>Warm-up: thermal capacitance and a 1-minute simulation</h2>
      <p>
        &quot;How long until it hits 55°F&quot; is a different question from the design load. It needs a different
        model: a lightweight thermal-capacitance simulation, not a steady-state formula. The garage&apos;s light
        mass — framing, drywall, the air itself, plus whatever&apos;s stored inside — is lumped into one capacitance
        figure —{" "}
        <Num v={cLight} unit="BTU/°F" round={100} ev="C" src="lightCapacitance(EXAMPLE_A_INPUT, elevationFt) — lib/planner/warmup.ts" />{" "}
        for this garage — and the slab is modeled separately as a semi-infinite solid that only slowly gives up or
        absorbs heat at its exposed surface. The simulation steps forward in 1-minute increments (an explicit Euler
        step), each minute adding the heater&apos;s output and subtracting the current heat loss, divided by the
        capacitance, to get the next minute&apos;s temperature. Starting from this garage&apos;s free-float
        temperature on an average January day —{" "}
        <Num v={tStart} unit="°F" ev="C" src="freeFloatTemp(EXAMPLE_A_INPUT, envelope, tJan, ...) — lib/planner/heatLoss.ts" format={(v) => Number(v).toFixed(1)} />{" "}
        — a 10 kW class heater reaches 55°F in about{" "}
        {sessionSim.minutesToTarget != null ? (
          <Num v={sessionSim.minutesToTarget} unit="min" ev="C" src="simulateSession() — lib/planner/warmup.ts" />
        ) : (
          "—"
        )}
        .
      </p>
      <WarmupCurve curve={sessionSim.curve} minutesToTarget={sessionSim.minutesToTarget} fig={2} />

      <h2>BayGrade: a climate-independent envelope score</h2>
      <p>
        BayGrade answers a different question than the design load does: not &quot;how much heat does this garage
        lose in Chicago,&quot; but &quot;how leaky is this envelope, independent of climate.&quot; It&apos;s the
        exterior-coupled UA (every term except the house-wall coupling) divided by floor area —{" "}
        <code>UA_ext / A_floor</code> — evaluated at any single ΔT, since UA itself doesn&apos;t depend on
        temperature. This garage comes out to{" "}
        <Num
          v={result.uaExtPerFt2}
          ev="C"
          src="heatLossDesign(EXAMPLE_A_INPUT).uaExtPerFt2 — gradeFor() in lib/planner/heatLoss.ts"
          format={(v) => Number(v).toFixed(3)}
        />
        , which lands in grade <Num v={result.grade} ev="C" src="gradeFor(uaExtPerFt2)" />.
      </p>
      <GradeScale current={result.grade} />
      <ul>
        <li>Grade A: UA_ext/A_floor ≤ 0.38</li>
        <li>Grade B: ≤ 0.62</li>
        <li>Grade C: ≤ 0.90</li>
        <li>Grade D: ≤ 1.25</li>
        <li>Grade F: above 1.25</li>
      </ul>

      <h2>Sizing margin</h2>
      <p>
        The recommended capacity (qSize) is the design load (qDesign) times a{" "}
        <Num v={SIZING_MARGIN} ev="C" src="SIZING_MARGIN — lib/planner/constants.ts" format={(v) => `${Math.round((Number(v) - 1) * 100)}%`} />{" "}
        margin — <Num v={result.qDesign} unit="BTU/h" round={100} ev="C" src="heatLossDesign(EXAMPLE_A_INPUT).qDesign" /> becomes{" "}
        <Num v={result.qSize} unit="BTU/h" round={100} ev="C" src="heatLossDesign(EXAMPLE_A_INPUT).qSize" /> (
        <Num v={result.kwSize} unit="kW" round={0.1} ev="C" src="heatLossDesign(EXAMPLE_A_INPUT).kwSize" />) — so the
        heater isn&apos;t sized to its exact worst-case load with zero headroom.
      </p>

      <h2>Circuit sizing (NEC)</h2>
      <p>
        A fixed electric heater is a continuous load under <Num f="code.nec.424_4_b" />, so the conductors and
        breaker are sized at 125% of the heater&apos;s running current, not the bare nameplate current. A 10 kW class
        heater at 240V draws about{" "}
        <Num v={circuit.amps} unit="A" ev="C" src="circuitFor(watts, 240, 240) — lib/planner/electrical.ts" /> running,{" "}
        <Num v={circuit.minAmps} unit="A" ev="C" src="circuitFor(watts, 240, 240)" /> at 125%, which rounds up to the
        next standard breaker: <Num v={circuit.breakerA} unit="A" ev="C" src="circuitFor(watts, 240, 240)" /> with{" "}
        {circuit.wireNM} copper (NM) or {circuit.wireTHHN} copper (THHN in conduit). A cord-and-plug heater on a
        shared receptacle circuit follows a different rule instead — <Num f="code.nec.210_23_a_1" /> caps it at 80%
        of the branch rating. Your electrician and your local code edition govern.
      </p>

      <h2>Try it on your garage</h2>
      <p>
        Every formula above runs the same way on your own dimensions, insulation and local design temperature — not
        just the worked example on this page.
      </p>
      <div className="not-prose my-6">
        <ButtonLink href="/garage-heater-calculator">Try it on your garage →</ButtonLink>
      </div>
    </ReportPage>
  );
}
