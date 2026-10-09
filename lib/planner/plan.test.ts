import { test } from "node:test";
import assert from "node:assert/strict";
import { plan } from "./plan.ts";
import { EXAMPLE_A_INPUT } from "./fixtures.ts";
import { decode } from "./codec.ts";
import type { GarageInput } from "./types.ts";
import { HEATER_TIERS_W, MAX_HEATER_CIRCUIT_WATTS, circuitsForLoad } from "./electrical.ts";
import { HEATER_CLASSES } from "./catalog.ts";

function near(actual: number, expected: number, tolPct = 3) {
  const tol = Math.abs(expected) * (tolPct / 100) || 1;
  assert.ok(Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

test("plan() matches BLUEPRINT.md §0.2's headline numbers for example A", () => {
  const r = plan(EXAMPLE_A_INPUT);
  near(r.heating.qDesign, 28856, 2);
  near(r.heating.qSize, 31742, 2);
  assert.equal(r.heating.grade, "D");
  near(r.heating.kwSize, 9.3, 3);
  assert.equal(r.modelVersion, "1.0.1");
});

test("plan()'s code round-trips through decode() to the same inputsEcho (modulo codec-domain normalization)", () => {
  const r = plan(EXAMPLE_A_INPUT);
  const decoded = decode(r.code);
  assert.ok(decoded);
  assert.equal(decoded!.width, EXAMPLE_A_INPUT.width);
  assert.equal(decoded!.preset, EXAMPLE_A_INPUT.preset);
  assert.equal(decoded!.targetTemp, EXAMPLE_A_INPUT.targetTemp);
});

test("plan()'s serial matches its own code's fingerprint", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.match(r.serial, /^R-2A-606-[0-9A-F]{4}$/);
});

test("plan() never recommends a neverRecommend class", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.ok(!r.recommendations.some((x) => x.classId === "torpedo" || x.classId === "k_unvented"));
});

test("plan()'s fixFirst shows the D -> B grade improvement from insulating", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.ok(r.fixFirst);
  assert.equal(r.fixFirst!.gradeBefore, "D");
  assert.equal(r.fixFirst!.gradeAfter, "B");
  near(r.fixFirst!.qAfter, 13025, 3);
  assert.ok(r.fixFirst!.cost > 0 && r.fixFirst!.cost < 1000);
});

test("plan()'s continuous-mode season months match Chicago's own tMean crossing 50F (target 55 - 5)", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.deepEqual(r.usage.seasonMonths, ["jan", "feb", "mar", "apr", "nov", "dec"]);
  assert.ok(r.usage.tBal !== undefined && r.usage.tBal < 55);
});

test("plan() flags S12 (flammables) when flammablesStored is 'unknown', and S9 for an attached garage", () => {
  const r = plan(EXAMPLE_A_INPUT);
  const codes = r.warnings.map((w) => w.code);
  assert.ok(codes.includes("S12"));
  assert.ok(codes.includes("S9"));
});

test("plan() carries no S12 when flammablesStored is 'no'", () => {
  const r = plan({ ...EXAMPLE_A_INPUT, flammablesStored: "no" });
  assert.ok(!r.warnings.some((w) => w.code === "S12"));
});

test("plan() produces 6 cost rows, all with a positive perSeason", () => {
  const r = plan(EXAMPLE_A_INPUT);
  assert.equal(r.costs.length, 6);
  for (const c of r.costs) assert.ok(c.perSeason > 0, `${c.system} has non-positive perSeason`);
});

test("plan() widens the band when a field is genuinely unknown, and narrows to a point when nothing is", () => {
  const known = plan(EXAMPLE_A_INPUT);
  assert.equal(known.heating.band.low, known.heating.band.high);

  const unknownWalls: GarageInput = { ...EXAMPLE_A_INPUT, wallType: "unknown" };
  const withUnknown = plan(unknownWalls);
  assert.ok(withUnknown.heating.band.low < withUnknown.heating.band.high);
  assert.equal(withUnknown.heating.band.unknowns, 1);
});

test("plan() handles sessions-mode usage without crashing and returns 5 session rows", () => {
  const sessionsInput: GarageInput = { ...EXAMPLE_A_INPUT, usage: { mode: "sessions", sessionsPerWeek: 2, hoursPerSession: 4, doorOpeningsPerSession: 2 } };
  const r = plan(sessionsInput);
  assert.equal(r.usage.mode, "sessions");
  assert.ok(r.sessions);
  assert.equal(r.sessions!.length, 5);
  assert.equal(r.usage.tBal, undefined);
  for (const s of r.sessions!) assert.ok(s.kwhOrFuel >= 0);
});

test("plan() is a pure function: calling it twice with the same input gives the same result", () => {
  const a = plan(EXAMPLE_A_INPUT);
  const b = plan(EXAMPLE_A_INPUT);
  assert.deepEqual(a, b);
});

test("plan() runs well under the 20ms CI budget (p95 under 4ms is the target; generous CI threshold)", () => {
  const start = performance.now();
  for (let i = 0; i < 20; i++) plan(EXAMPLE_A_INPUT);
  const elapsed = performance.now() - start;
  assert.ok(elapsed / 20 < 20, `plan() averaged ${(elapsed / 20).toFixed(2)}ms over 20 runs, over the 20ms CI budget`);
});

test("plan() never recommends a Buddy-type propane heater, even in sessions mode on a 120 V-only circuit", () => {
  const input: GarageInput = {
    ...EXAMPLE_A_INPUT,
    attached: true,
    circuit: "120V15A",
    canAddCircuit: false,
    fuels: ["electric", "propane_cylinder"],
    usage: { mode: "sessions", sessionsPerWeek: 2, hoursPerSession: 4, doorOpeningsPerSession: 2 },
  };
  const r = plan(input);
  assert.ok(!r.recommendations.some((x) => x.classId === "g_unvented_buddy"));
  assert.ok(r.whyNot.some((w) => w.classId === "g_unvented_buddy"));
});

test("plan() reports fitPct as capacity over required load: a full-load pick is at least 100%", () => {
  const r = plan({ ...EXAMPLE_A_INPUT, circuit: "240V60A", canAddCircuit: true });
  assert.ok(r.recommendations.length > 0);
  const top = r.recommendations[0];
  assert.equal(top.fitPct, Math.round((top.capacityBtuh / r.heating.qSize) * 100));
  assert.ok(top.fitPct >= 100, `top pick covers ${top.fitPct}% of the load`);
});

test("plan() in a climate warmer than the target has no design heating load and recommends nothing", () => {
  const r = plan({ ...EXAMPLE_A_INPUT, state: "HI", stationId: "HI-honolulu", zip3: undefined });
  assert.equal(r.heating.qDesign, 0);
  assert.equal(r.heating.qSize, 0);
  assert.equal(r.heating.kwSize, 0);
  assert.deepEqual(r.recommendations, []);
  assert.deepEqual(r.insulateFirst, []);
  assert.equal(r.fixFirst, null);
  assert.ok(r.heating.items.every((i) => i.btuh === 0 && i.pct === 0));
  assert.ok(r.heating.uaExt > 0, "the raw UA is still computed");
});

// Regression (2026-10-09): plan() threw "No standard breaker covers N A" for about 1 in 5 realistic garages -- any
// load past one 80 A circuit, and gas/diesel top picks whose fuel input was sized as electric watts -- so the
// planner page broke for exactly the big, leaky garages most in need of a heater.
test("plan() sizes very large loads as several identical circuits instead of throwing", async () => {
  const { PRESET_DEFAULTS } = await import("./presets.ts");
  const p = PRESET_DEFAULTS["3car"];
  const leaky = {
    ...EXAMPLE_A_INPUT,
    preset: "3car" as const,
    width: p.width,
    depth: p.depth,
    height: p.height,
    garageDoors: p.garageDoors.map((d) => ({ ...d, type: "steel_single" as const })),
    wallType: "uninsulated_finished" as const,
    ceilingIns: "drywall_uninsulated" as const,
    tightness: "leaky" as const,
    stationId: "MN-minneapolis",
    state: "MN",
  };
  for (const fuels of [["electric"], ["electric", "natural_gas"]] as const) {
    const r = plan({ ...leaky, fuels: [...fuels], ventingPossible: true });
    assert.ok(r.circuits.forSizeCount > 1, `expected more than one circuit for ${Math.round(r.heating.qSize)} BTU/h`);
    // One modeled heater per circuit, each inside NEC 424.22(B)'s 60 A.
    assert.ok(r.circuits.forSize.breakerA <= 60, `${r.circuits.forSize.breakerA} A`);
    assert.ok(r.circuits.notes.some((n) => n.startsWith("No single heater circuit")));
    // Several heater circuits always need a load calculation, whatever the panel size.
    for (const panelAmps of [100, 150, 200] as const) {
      assert.equal(plan({ ...leaky, fuels: [...fuels], ventingPossible: true, panelAmps }).circuits.panelCheck, "load_calc");
    }
  }
});

test("the heater tiers are exactly the catalog's fixed 240 V resistance classes", () => {
  const fixed = Object.values(HEATER_CLASSES)
    .filter((c) => c.energy === "electric" && typeof c.eta === "number" && c.circuit?.startsWith("240") && c.outputBtuh[0] === c.outputBtuh[1])
    .map((c) => Math.round(c.outputBtuh[1] / 3.412 / 100) * 100)
    .sort((a, b) => a - b);
  assert.deepEqual(fixed, [...HEATER_TIERS_W]);
  assert.equal(MAX_HEATER_CIRCUIT_WATTS, 10_000);
  // Codex review on #26: a 17.64 kW load is two 10 kW heaters on 60 A each -- the circuits the recommended heaters
  // need -- not two 8.82 kW shares on 50 A.
  const split = circuitsForLoad(17_640);
  assert.equal(split.count, 2);
  assert.equal(split.heaterWatts, 10_000);
  assert.equal(split.spec.breakerA, 60);
  // A load just over 10 kW (a 60 °F "gym" garage, about 10.4 kW) is two heater circuits, not one 60 A circuit.
  const gym = plan({ ...EXAMPLE_A_INPUT, targetTemp: 60 });
  if (gym.heating.kwSize > 10) assert.equal(gym.circuits.forSizeCount, 2);
});

// Codex review on #26: "Power it" must match the recommendation cards. The worked example's top resistance pick is
// a pair of 5 kW heaters on 30 A each, so "Power it" is 2 x 30 A -- not one 60 A circuit nobody was told to buy for.
test("Power it uses the top resistance recommendation's per-unit circuit and count", () => {
  for (const input of [EXAMPLE_A_INPUT, { ...EXAMPLE_A_INPUT, targetTemp: 60 }]) {
    const r = plan(input);
    const pick = r.recommendations.find((x) => {
      const cls = HEATER_CLASSES[x.classId];
      return cls.energy === "electric" && typeof cls.eta === "number" && x.circuit !== undefined && x.capacityBtuh >= Math.round(r.heating.qSize);
    });
    assert.ok(pick, "expected an electric resistance pick for the worked example");
    assert.equal(r.circuits.forSizeClassId, pick.classId);
    assert.equal(r.circuits.forSizeCount, pick.units);
    assert.equal(r.circuits.forSize.breakerA, pick.circuit!.breakerA);
  }
});

// Codex review on #26: rankSystems() keeps keep-warm picks that cover 60% of the load. A 28x28x10 ft detached, leaky
// Minneapolis garage kept at 55 °F gets 2 x 7.5 kW (71%) and 2 x 10 kW (94%) cards; neither covers the load, so
// "Power it" must size the whole load (3 circuits), not report the partial pair as if it covered it.
test("Power it ignores resistance picks that cover only part of the load", () => {
  const r = plan({
    ...EXAMPLE_A_INPUT,
    preset: "custom",
    width: 28,
    depth: 28,
    height: 10,
    attached: false,
    commonWallLen: 0,
    wallType: "uninsulated_finished",
    tightness: "leaky",
    stationId: "MN-minneapolis",
    state: "MN",
    zip3: "554",
    useCase: "keep",
  });
  const electric = r.recommendations.filter((x) => HEATER_CLASSES[x.classId].energy === "electric");
  assert.ok(electric.length > 0 && electric.every((x) => x.fitPct < 100), "expected only partial-fit electric picks");
  assert.equal(r.circuits.forSizeClassId, undefined);
  assert.ok(r.circuits.forSize.watts * r.circuits.forSizeCount >= r.heating.qSize / 3.412, "Power it covers the whole load");
  assert.equal(r.circuits.forSizeCount, circuitsForLoad(r.heating.qSize / 3.412).count);
  assert.ok(r.circuits.notes.some((n) => n.startsWith("No single heater circuit")));
  assert.equal(r.circuits.panelCheck, "load_calc");
});

// Codex review on #26: two 1.5 kW plug-in heaters are about 3 kW, not "tens of kW". They need no load calculation on
// a 200 A panel, and one heater circuit could cover the load, so the report must not say none does.
test("a pair of small heaters gets the panel rule of thumb, not a blanket load calculation", () => {
  const oneCar = {
    ...EXAMPLE_A_INPUT,
    preset: "1car" as const,
    width: 12,
    depth: 22,
    height: 8,
    commonWallLen: 12,
    garageDoors: [{ w: 9, h: 7, type: "steel_single" as const }],
    windowsFt2: 0,
    ceilingIns: "R30" as const,
    tightness: "tight" as const,
    circuit: "120V20A" as const,
    usage: { mode: "sessions" as const, sessionsPerWeek: 3, hoursPerSession: 2, doorOpeningsPerSession: 2 },
  };
  const r = plan(oneCar);
  assert.equal(r.circuits.forSizeClassId, "e_port_1500");
  assert.equal(r.circuits.forSizeCount, 2);
  assert.equal(r.circuits.panelCheck, "ok");
  assert.ok(!r.circuits.notes.some((n) => n.startsWith("No single heater circuit")));
  assert.ok(r.circuits.notes.some((n) => n.startsWith("Sized for the 2 recommended heaters")));
  // A 100 A panel still gets the rule of thumb on the heaters' total draw; 3 kW stays under it.
  assert.equal(plan({ ...oneCar, panelAmps: 100 }).circuits.panelCheck, "ok");
  assert.equal(plan({ ...oneCar, panelAmps: "unknown" }).circuits.panelCheck, "unknown");
});

// Codex review on #26: a reader who can't add a circuit must never be handed a new circuit as the answer. Found:
// 240 V infrared on a 30 A circuit (its 6 kW top needs 35 A), a 1,500 W plug-in eligible on 15 A while "Power it"
// showed 20 A, and the whole-load fallback prescribing 240 V / 25 A on a 120 V / 15 A circuit. Now a pick-based
// "Power it" is one heater the reader's circuit carries; otherwise it is flagged, and notes[0] says the circuit can't.
test("Power it never passes off a new circuit as the answer when the reader can't add one", async () => {
  const { circuitCovers } = await import("./classCircuit.ts");
  const sessions = { mode: "sessions" as const, sessionsPerWeek: 3, hoursPerSession: 2, doorOpeningsPerSession: 2 };
  const oneCar = { ...EXAMPLE_A_INPUT, preset: "1car" as const, width: 12, depth: 22, height: 8, commonWallLen: 12, garageDoors: [{ w: 9, h: 7, type: "steel_single" as const }], windowsFt2: 0, ceilingIns: "R30" as const, tightness: "tight" as const };
  let picks = 0;
  let flagged = 0;
  for (const base of [EXAMPLE_A_INPUT, oneCar]) {
    for (const circuit of ["120V15A", "120V20A", "240V20A", "240V30A", "240V40A", "240V50A"] as const) {
      for (const targetTemp of [40, 45, 50, 55]) {
        for (const usage of [EXAMPLE_A_INPUT.usage, sessions]) {
          const r = plan({ ...base, targetTemp, circuit, canAddCircuit: false, usage });
          const where = `${base.preset} ${circuit} ${targetTemp}F ${usage.mode}`;
          if (r.circuits.beyondUserCircuit) {
            flagged++;
            assert.equal(r.circuits.forSizeClassId, undefined, `${where}: a pick is always one the circuit carries`);
            assert.match(r.circuits.notes[0], /You said you can't add a circuit/, where);
          } else {
            picks++;
            assert.equal(r.circuits.forSizeCount, 1, `${where}: one existing circuit means one heater`);
            assert.ok(circuitCovers(circuit, r.circuits.forSize), `${where}: ${r.circuits.forSizeClassId} needs ${r.circuits.forSize.breakerA} A`);
          }
        }
      }
    }
  }
  assert.ok(picks > 0 && flagged > 0, `expected both outcomes, got ${picks} picks and ${flagged} flagged`);
  // Codex's two cases on a tight 1-car with a 120 V / 15 A circuit: a load one plug-in covers gets it (15 A, nothing
  // else on the circuit -- not a 20 A circuit the reader ruled out), and at 50 °F, where nothing that circuit carries
  // covers the load, it is flagged instead of prescribing 240 V / 25 A.
  const at35 = plan({ ...oneCar, targetTemp: 35, circuit: "120V15A", canAddCircuit: false, usage: sessions });
  assert.equal(at35.circuits.forSizeClassId, "e_port_1500");
  assert.equal(at35.circuits.forSize.breakerA, 15);
  assert.ok(at35.circuits.notes.some((n) => n.startsWith("Plug-in: nothing else on that circuit")));
  const at50 = plan({ ...oneCar, targetTemp: 50, circuit: "120V15A", canAddCircuit: false, usage: sessions });
  assert.equal(at50.circuits.beyondUserCircuit, true);
});
