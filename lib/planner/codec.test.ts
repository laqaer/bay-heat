import { test } from "node:test";
import assert from "node:assert/strict";
import { encode, decode, normalize } from "./codec.ts";
import { EXAMPLE_A_INPUT } from "./fixtures.ts";
import type { GarageInput, Preset, WallType, GarageDoorType, Tightness, Fuel, Priority, UseCase } from "./types.ts";

// BLUEPRINT.md §2.3's own worked example string for a 24x24x9 attached 2-car, R-13 walls, drywall/uninsulated
// attic ceiling, steel door, average tightness, 55F target, 2 sessions/week x 4h, warmup goal 60 min, a spare
// 240V/30A circuit (can add), 200A panel, electric only, balanced priority, no flammables, shop use case.
const SPEC_EXAMPLE = "1.606.2A.24x24x9n1.w13.cd0.ds.ta.55s2x4g60.cb30+p200.fE.pb.z0.xshop";

test("decode() parses the blueprint's own worked codec string correctly", () => {
  const input = decode(SPEC_EXAMPLE);
  assert.ok(input);
  assert.equal(input!.zip3, "606");
  assert.equal(input!.state, "IL");
  assert.equal(input!.preset, "2car");
  assert.equal(input!.attached, true);
  assert.equal(input!.width, 24);
  assert.equal(input!.depth, 24);
  assert.equal(input!.height, 9);
  assert.equal(input!.windowsFt2, 12); // n1 -> 1 window x 12 ft2
  assert.equal(input!.wallType, "R13");
  assert.equal(input!.ceilingType, "attic");
  assert.equal(input!.ceilingIns, "drywall_uninsulated");
  assert.equal(input!.garageDoors[0].type, "steel_single");
  assert.equal(input!.tightness, "average");
  assert.equal(input!.targetTemp, 55);
  assert.equal(input!.usage.mode, "sessions");
  assert.equal(input!.usage.sessionsPerWeek, 2);
  assert.equal(input!.usage.hoursPerSession, 4);
  assert.equal(input!.warmupGoalMin, 60);
  assert.equal(input!.circuit, "240V30A");
  assert.equal(input!.canAddCircuit, true);
  assert.equal(input!.panelAmps, 200);
  assert.deepEqual(input!.fuels, ["electric"]);
  assert.equal(input!.ventingPossible, false);
  assert.equal(input!.priority, "balanced");
  assert.equal(input!.wantsCooling, false);
  assert.equal(input!.flammablesStored, "no");
  assert.equal(input!.useCase, "shop");
});

test("encode(decode(SPEC_EXAMPLE)) reproduces the exact string", () => {
  const input = decode(SPEC_EXAMPLE);
  assert.ok(input);
  assert.equal(encode(input!), SPEC_EXAMPLE);
});

test("decode() rejects a future/unknown version token", () => {
  assert.equal(decode("99.606.2A.24x24x9n1.w13.cd0.ds.ta.55cg60.cb30p200.fE.pb.z0"), null);
});

test("decode() rejects garbage input without throwing", () => {
  assert.equal(decode("not a valid code"), null);
  assert.equal(decode(""), null);
});

test("decode(encode(x)) === normalize(x) for example A", () => {
  const roundTripped = decode(encode(EXAMPLE_A_INPUT));
  assert.deepEqual(roundTripped, normalize(EXAMPLE_A_INPUT));
});

test("encode(decode(s)) === s for several canonical strings", () => {
  const strings = [
    SPEC_EXAMPLE,
    "1.IL.1D.12x22x8n0.wos.cu.dw.tv.40cg30.cupu.fE.pu.zu",
    "1.941.3A.32x24x10n2.w19.cr19.dp2.tt.65s5x2g120.ca20p150.fENv.pf.z1.xgym",
    "1.770.4D.40x26x10n2.wm10.cm0.dk.tl.35cg30.cb60p200.fEND.pr.z0",
  ];
  for (const s of strings) {
    const input = decode(s);
    assert.ok(input, `failed to decode ${s}`);
    assert.equal(encode(input!), s, `round trip mismatch for ${s}`);
  }
});

test("decode(encode(x)) === normalize(x) for a fuzz of randomized GarageInputs", () => {
  const wallTypes: WallType[] = ["open_studs", "uninsulated_finished", "R11", "R13", "R15", "R19", "R21", "metal_uninsulated", "metal_R10", "metal_R13", "metal_R19", "cmu8_uninsulated", "cmu8_R10"];
  const doorTypes: GarageDoorType[] = ["steel_single", "wood_uninsulated", "steel_eps_1_375", "steel_eps_2", "steel_pu_1_375", "steel_pu_2", "kit_eps_or_batt", "kit_reflective"];
  const tightnesses: Tightness[] = ["tight", "average", "leaky", "very_leaky"];
  const presets: Preset[] = ["1car", "2car", "3car", "4car"];
  const priorities: Priority[] = ["upfront", "running", "fast", "balanced"];
  const useCases: (UseCase | undefined)[] = ["shop", "gym", "hangout", "car", "keep", undefined];
  const fuelSets: Fuel[][] = [["electric"], ["electric", "natural_gas"], ["electric", "propane_bulk", "diesel"], ["electric", "kerosene"]];

  let seed = 42;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function pick<T>(arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
  }

  for (let i = 0; i < 200; i++) {
    const preset = pick(presets);
    const attached = rand() > 0.5;
    const windowCount = Math.floor(rand() * 4);
    const input: GarageInput = {
      ...EXAMPLE_A_INPUT,
      preset,
      attached,
      commonWallLen: attached ? 24 : 0,
      width: 10 + Math.floor(rand() * 30),
      depth: 10 + Math.floor(rand() * 30),
      height: 7 + Math.floor(rand() * 8),
      windowsFt2: windowCount * 12,
      wallType: pick(wallTypes),
      garageDoors: [{ w: 9, h: 7, type: pick(doorTypes) }],
      tightness: pick(tightnesses),
      targetTemp: 40 + Math.floor(rand() * 30),
      warmupGoalMin: pick([30, 60, 120] as const),
      circuit: pick(["120V15A", "120V20A", "240V20A", "240V30A", "240V40A", "240V50A", "240V60A"] as const),
      canAddCircuit: rand() > 0.5,
      panelAmps: pick([100, 150, 200] as const),
      fuels: pick(fuelSets),
      ventingPossible: rand() > 0.5,
      priority: pick(priorities),
      wantsCooling: rand() > 0.5,
      flammablesStored: pick(["yes", "no", "unknown"] as const),
      useCase: pick(useCases),
      usage: rand() > 0.5 ? { mode: "sessions", sessionsPerWeek: Math.floor(rand() * 7), hoursPerSession: 1 + Math.floor(rand() * 8), doorOpeningsPerSession: 2 } : { mode: "continuous", sessionsPerWeek: 0, hoursPerSession: 0, doorOpeningsPerSession: 0 },
    };
    const roundTripped = decode(encode(input));
    assert.deepEqual(roundTripped, normalize(input), `round-trip mismatch at seed iteration ${i}: ${encode(input)}`);
  }
});
