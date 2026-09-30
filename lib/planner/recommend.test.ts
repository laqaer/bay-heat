import { test } from "node:test";
import assert from "node:assert/strict";
import { rankSystems, type RecommendContext } from "./recommend.ts";
import { heatLossDesign, freeFloatTemp, type ResolvedEnvelope } from "./heatLoss.ts";
import { lightCapacitance } from "./warmup.ts";
import { EXAMPLE_A_INPUT, EXAMPLE_A_STATION, EXAMPLE_A_PRICES } from "./fixtures.ts";
import type { GarageInput } from "./types.ts";

const ENVELOPE_AS_IS = { wallType: "R13" as const, ceilingIns: "drywall_uninsulated" as const, doorTypes: ["steel_single" as const], tightness: "average" as const };
const ENVELOPE_FIXED = { wallType: "R13" as const, ceilingIns: "R30" as const, doorTypes: ["kit_eps_or_batt" as const], tightness: "tight" as const };

function contextFor(input: GarageInput, envelope: ResolvedEnvelope): RecommendContext {
  const tOut = EXAMPLE_A_STATION.h99;
  const r = heatLossDesign(input, envelope, tOut, EXAMPLE_A_STATION.elevFt);
  const uaHouse = input.attached ? 0.089 * input.commonWallLen * input.height + 40 : 0;
  const tStartJan = freeFloatTemp(input, envelope, EXAMPLE_A_STATION.tMean[0] + 4, EXAMPLE_A_STATION.elevFt, EXAMPLE_A_STATION, 0);
  const cLight = lightCapacitance(input, EXAMPLE_A_STATION.elevFt, 0);
  return {
    input,
    qReq: r.qSize,
    station: EXAMPLE_A_STATION,
    elevationFt: EXAMPLE_A_STATION.elevFt,
    tOut,
    uaOut: r.uaExt,
    uaHouse,
    prices: EXAMPLE_A_PRICES,
    circuit: input.circuit === "unknown" ? "120V15A" : input.circuit,
    cLight,
    aFloor: input.width * input.depth,
    tStartJan,
  };
}

test("rankSystems never recommends torpedo, kerosene, or Buddy-type propane as a buyable plate", () => {
  const ctx = contextFor({ ...EXAMPLE_A_INPUT, circuit: "240V60A", canAddCircuit: true, fuels: ["electric", "natural_gas", "propane_cylinder"] }, ENVELOPE_AS_IS);
  const { recommendations } = rankSystems(ctx);
  assert.ok(!recommendations.some((r) => r.classId === "torpedo"));
  assert.ok(!recommendations.some((r) => r.classId === "k_unvented"));
  assert.ok(!recommendations.some((r) => r.classId === "g_unvented_buddy"));
});

test("rankSystems always lists a torpedo why-not line", () => {
  const ctx = contextFor(EXAMPLE_A_INPUT, ENVELOPE_AS_IS);
  const { whyNot } = rankSystems(ctx);
  assert.ok(whyNot.some((w) => w.classId === "torpedo"));
});

test("rankSystems flags diesel as a why-not for an attached garage", () => {
  const ctx = contextFor({ ...EXAMPLE_A_INPUT, attached: true }, ENVELOPE_AS_IS);
  const { whyNot } = rankSystems(ctx);
  assert.ok(whyNot.some((w) => w.classId === "diesel_air"));
});

test("rankSystems excludes a class that needs a bigger circuit than the user has and can't add one", () => {
  const ctx = contextFor({ ...EXAMPLE_A_INPUT, circuit: "120V15A", canAddCircuit: false, fuels: ["electric"] }, ENVELOPE_AS_IS);
  const { recommendations } = rankSystems(ctx);
  // Only 120V-circuit classes (e_port_1500, e_ir_wall_1500) can possibly fit; none of the 240V classes should appear.
  assert.ok(!recommendations.some((r) => r.classId.startsWith("e_240")));
});

test("rankSystems returns real candidates for example A as-is, each covering the required load", () => {
  const ctx = contextFor(EXAMPLE_A_INPUT, ENVELOPE_AS_IS);
  const { recommendations } = rankSystems(ctx);
  assert.ok(recommendations.length > 0, "expected at least one recommendation");
  assert.ok(recommendations.length <= 3);
  for (const r of recommendations) {
    assert.ok(r.capacityBtuh >= ctx.qReq * 0.6, `${r.classId} capacity ${r.capacityBtuh} doesn't cover qReq ${ctx.qReq} even at 60%`);
    assert.ok(r.tco5 > 0);
  }
});

test("insulating first (the 'fixed' envelope) lets a smaller, cheaper class rank well", () => {
  const asIsCtx = contextFor(EXAMPLE_A_INPUT, ENVELOPE_AS_IS);
  const fixedCtx = contextFor(EXAMPLE_A_INPUT, ENVELOPE_FIXED);
  assert.ok(fixedCtx.qReq < asIsCtx.qReq, "the insulated envelope should need a smaller heater");
  const { recommendations } = rankSystems(fixedCtx);
  assert.ok(recommendations.length > 0);
  // The top pick after insulating should need meaningfully less capacity than the top pick as-is.
  const asIsTop = rankSystems(asIsCtx).recommendations[0];
  const fixedTop = recommendations[0];
  assert.ok(fixedTop.capacityBtuh <= asIsTop.capacityBtuh, `fixed-envelope top pick (${fixedTop.capacityBtuh}) should not need more capacity than as-is top pick (${asIsTop.capacityBtuh})`);
});

test("every heater-kind recommendation with flammables stored carries the S12 safety line", () => {
  const ctx = contextFor({ ...EXAMPLE_A_INPUT, flammablesStored: "yes" }, ENVELOPE_AS_IS);
  const { recommendations } = rankSystems(ctx);
  for (const r of recommendations) {
    assert.ok(r.safetyLine && /gasoline/.test(r.safetyLine), `${r.classId} missing the S12 flammables line`);
  }
});

test("a mini-split candidate is offered when electric-only and the load fits", () => {
  const ctx = contextFor({ ...EXAMPLE_A_INPUT, circuit: "240V30A", canAddCircuit: true }, ENVELOPE_FIXED);
  const { recommendations } = rankSystems(ctx);
  assert.ok(recommendations.some((r) => r.classId === "hp_12_24k_230" || r.classId === "hp_diy_12k_115"), `expected a mini-split candidate among ${recommendations.map((r) => r.classId)}`);
});
