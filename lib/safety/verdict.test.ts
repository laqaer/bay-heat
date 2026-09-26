import { test } from "node:test";
import assert from "node:assert/strict";
import { verdictFor } from "./verdict.ts";
import type { Situation, Verdict } from "./types.ts";

// A fully-specified baseline: every optional field given, so each test only overrides what it's checking.
// This keeps every case an explicit, complete Situation -- no field is "accidentally" left at a permissive
// default that would let a real gap slip past a test unnoticed.
const BASE: Situation = {
  attached: false,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  circuit: undefined,
  plugAdapterInUse: false,
  outletGrounded: true,
  heaterKw: undefined,
  heaterBtuh: undefined,
  ulListed: "yes",
  cylinder: undefined,
  cylinderStoredWhere: undefined,
  exhaustOutdoors: true,
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
  zip3: "606",
  state: "IL",
  manualAllowsUnattendedThermostat: undefined,
};

function assertShape(v: Verdict, verdict: Verdict["verdict"], stamp: Verdict["stamp"], msg: string) {
  assert.equal(v.verdict, verdict, msg);
  assert.equal(v.stamp, stamp, msg);
  assert.ok(v.conditions.length >= 2, `${msg}: expected >= 2 conditions, got ${v.conditions.length}`);
  assert.ok(v.reasons.length >= 1, `${msg}: expected >= 1 reason`);
}

// 1. Big Buddy + attached + overnight -> NO-GO
test("1: Big Buddy, attached, overnight -> NO-GO", () => {
  const v = verdictFor("buddy", { ...BASE, attached: true, unattended: true, cylinder: "1lb" });
  assertShape(v, "NO_GO", "NO-GO", "T1");
});

// 2. Big Buddy + detached + attended + fresh air + CO alarm + no flammables -> ONLY IF, exactly 5 conditions
test("2: Big Buddy, detached, attended, ventilated, no flammables -> ONLY IF with exactly 5 conditions", () => {
  const v = verdictFor("buddy", { ...BASE, attached: false, unattended: false, freshAir: true, cylinder: "1lb", flammablesStored: "no" });
  assertShape(v, "GO_IF", "ONLY IF", "T2");
  assert.equal(v.conditions.length, 5, "T2 must carry exactly 5 conditions");
});

// 3. Buddy-type + flammables stored -> NO-GO
test("3: Buddy-type, flammables stored -> NO-GO", () => {
  const v = verdictFor("buddy", { ...BASE, attached: false, flammablesStored: "yes", cylinder: "1lb" });
  assertShape(v, "NO_GO", "NO-GO", "T3");
});

// 4. Torpedo heater + any enclosed garage -> NO-GO, always
test("4: Torpedo, any situation -> NO-GO always", () => {
  assertShape(verdictFor("torpedo", { ...BASE, attached: false }), "NO_GO", "NO-GO", "T4a");
  assertShape(verdictFor("torpedo", { ...BASE, attached: true, unattended: false, flammablesStored: "no" }), "NO_GO", "NO-GO", "T4b");
});

// 5. Kerosene + attached + sleeping above -> NO-GO
test("5: Kerosene, attached, living space above -> NO-GO", () => {
  const v = verdictFor("kerosene", { ...BASE, attached: true, livingAbove: true });
  assertShape(v, "NO_GO", "NO-GO", "T5");
});

// 6. Kerosene + detached + attended + ventilation + no flammables -> ONLY IF
test("6: Kerosene, detached, attended, ventilated, no flammables -> ONLY IF", () => {
  const v = verdictFor("kerosene", { ...BASE, attached: false, livingAbove: false, unattended: false, freshAir: true, flammablesStored: "no" });
  assertShape(v, "GO_IF", "ONLY IF", "T6");
  assert.match(v.conditions[0].text, /1-K kerosene/);
});

// 7. Diesel + exhaust indoors -> NO-GO
test("7: Diesel, exhaust indoors -> NO-GO", () => {
  const v = verdictFor("diesel", { ...BASE, attached: false, exhaustOutdoors: false });
  assertShape(v, "NO_GO", "NO-GO", "T7");
});

// 8. Diesel (unlisted) + detached + exhaust and intake outdoors + CO alarm -> ONLY IF, 5 conditions
test("8: Diesel, detached, exhaust outdoors, CO alarm -> ONLY IF with 5 conditions", () => {
  const v = verdictFor("diesel", { ...BASE, attached: false, exhaustOutdoors: true, unattended: false });
  assertShape(v, "GO_IF", "ONLY IF", "T8");
  assert.equal(v.conditions.length, 5, "T8 must carry exactly 5 conditions");
});

// 9. Diesel (unlisted) + attached garage, permanent install -> NO-GO
test("9: Diesel, attached garage -> NO-GO", () => {
  const v = verdictFor("diesel", { ...BASE, attached: true, exhaustOutdoors: true });
  assertShape(v, "NO_GO", "NO-GO", "T9");
});

// 10. 120 V 1,500 W + shared 15 A, sole load -> ONLY IF
test("10: 120V 1500W on a shared 15A circuit -> ONLY IF, citing the 12A/15A limit", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "120V15A_shared", heaterKw: 1.5, flammablesStored: "no" });
  assertShape(v, "GO_IF", "ONLY IF", "T10");
  assert.match(v.conditions[0].text, /12 A limit/);
  assert.match(v.conditions[0].text, /12\.5 A/);
});

// 11. 120 V + extension cord -> NO-GO
test("11: 120V on an extension cord -> NO-GO", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "extension_cord", heaterKw: 1.5 });
  assertShape(v, "NO_GO", "NO-GO", "T11");
});

// 12. 120 V + dedicated 20 A + no flammables -> GO
test("12: 120V dedicated 20A, no flammables -> GO", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "120V20A_dedicated", heaterKw: 1.5, flammablesStored: "no", ulListed: "yes" });
  assertShape(v, "GO", "GO · PER MANUAL", "T12");
});

// 12b. 120 V + dedicated 20 A + flammables stored -> ONLY IF
test("12b: 120V dedicated 20A, flammables stored -> ONLY IF", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "120V20A_dedicated", heaterKw: 1.5, flammablesStored: "yes", ulListed: "yes" });
  assertShape(v, "GO_IF", "ONLY IF", "T12b");
  assert.ok(v.conditions.some((c) => /gasoline/.test(c.text)));
});

// 13. 4 kW + 240 V/20 A -> NO-GO (needs 25A)
test("13: 4kW on a 240V/20A circuit -> NO-GO (needs 25A)", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V20A", heaterKw: 4, outletGrounded: true, plugAdapterInUse: false });
  assertShape(v, "NO_GO", "NO-GO", "T13");
  assert.match(v.conditions[0].text, /25 A/);
});

// 14. 5 kW + 240 V/30 A, breaker exactly 30A, grounded, no flammables -> GO
test("14: 5kW on a 240V/30A circuit, grounded, no flammables -> GO", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, outletGrounded: true, plugAdapterInUse: false, flammablesStored: "no", ulListed: "yes" });
  assertShape(v, "GO", "GO · PER MANUAL", "T14");
});

// 14b. 5 kW + 240 V/30 A + flammables stored -> ONLY IF
test("14b: 5kW on a 240V/30A circuit, flammables stored -> ONLY IF", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, outletGrounded: true, plugAdapterInUse: false, flammablesStored: "yes", ulListed: "yes" });
  assertShape(v, "GO_IF", "ONLY IF", "T14b");
});

// 14c. Any plug adapter -> NO-GO
test("14c: plug adapter in use -> NO-GO", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, plugAdapterInUse: true, outletGrounded: true });
  assertShape(v, "NO_GO", "NO-GO", "T14c");
});

// 14d. NEMA 10-30 dryer outlet (ungrounded) -> NO-GO
test("14d: ungrounded 240V outlet -> NO-GO", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, outletGrounded: false, plugAdapterInUse: false });
  assertShape(v, "NO_GO", "NO-GO", "T14d");
});

// 15. 5 kW CZ220-class + gasoline stored -> ONLY IF, citing UL 1278
test("15: 5kW CZ220-class heater, gasoline stored -> ONLY IF, citing UL 1278", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, outletGrounded: true, plugAdapterInUse: false, flammablesStored: "yes", ulListed: "yes" });
  assertShape(v, "GO_IF", "ONLY IF", "T15");
  assert.ok(v.conditions.some((c) => /UL 1278/.test(c.text)));
});

// 16. Vented gas unit heater + attached garage + piped fuel (no cylinder) -> ONLY IF
test("16: Vented gas unit heater, attached, piped fuel -> ONLY IF", () => {
  const v = verdictFor("vented_gas", { ...BASE, attached: true, cylinder: undefined });
  assertShape(v, "GO_IF", "ONLY IF", "T16");
});

// 16b (fuel hard filter): vented gas fed only by cylinders -> NO-GO
test("16b: Vented gas unit heater fed only by cylinders -> NO-GO", () => {
  const v = verdictFor("vented_gas", { ...BASE, attached: true, cylinder: "20lb" });
  assertShape(v, "NO_GO", "NO-GO", "T16b");
});

// 17. Vented gas + detached (e.g. solvent/sawdust shop) -> ONLY IF (separated combustion)
test("17: Vented gas unit heater, detached shop -> ONLY IF", () => {
  const v = verdictFor("vented_gas", { ...BASE, attached: false, cylinder: undefined });
  assertShape(v, "GO_IF", "ONLY IF", "T17");
});

// 18. Mini-split -> GO
test("18: Mini-split -> GO", () => {
  const v = verdictFor("minisplit", { ...BASE });
  assertShape(v, "GO", "GO · PER MANUAL", "T18");
});

// 19. Unvented aggregate input over 20 BTU/h per ft3 of room volume -> NO-GO
test("19: Unvented heater oversized for the garage's volume -> NO-GO", () => {
  // 1-car preset is 12*22*8 = 2,112 ft3; 20 BTU/h/ft3 -> 42,240 BTU/h threshold.
  const v = verdictFor("buddy", { ...BASE, preset: "1car", attached: false, unattended: false, flammablesStored: "no", cylinder: "1lb", heaterBtuh: 45000 });
  assertShape(v, "NO_GO", "NO-GO", "T19");
  assert.ok(v.conditions.some((c) => c.ev === "C" && /IFGC 621/.test(c.cite)));
});
test("19b: A right-sized unvented heater for the garage's volume clears the aggregate check", () => {
  const v = verdictFor("buddy", { ...BASE, preset: "3car", attached: false, unattended: false, flammablesStored: "no", cylinder: "1lb", heaterBtuh: 18000 });
  assertShape(v, "GO_IF", "ONLY IF", "T19b");
});

// 20. A refillable propane cylinder (20-lb+) stored or used in any garage -> NO-GO
test("20: 20-lb cylinder stored/used in the garage (not outdoors) -> NO-GO, attached or detached", () => {
  const v1 = verdictFor("buddy", { ...BASE, attached: false, cylinder: "20lb", cylinderStoredWhere: "garage", flammablesStored: "no" });
  assertShape(v1, "NO_GO", "NO-GO", "T20a");
  const v2 = verdictFor("buddy", { ...BASE, attached: false, cylinder: "20lb", cylinderStoredWhere: undefined, flammablesStored: "no" });
  assertShape(v2, "NO_GO", "NO-GO", "T20b");
});

// 21. 120 V portable + unattended, no verified manualAllowsUnattendedThermostat -> NO-GO
test("21: 120V portable, unattended, no verified fact -> NO-GO", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "120V20A_dedicated", heaterKw: 1.5, unattended: true, manualAllowsUnattendedThermostat: undefined });
  assertShape(v, "NO_GO", "NO-GO", "T21");
});
test("21b: 120V portable, unattended, WITH a verified manual fact -> not gated by rule 21", () => {
  const v = verdictFor("e120", { ...BASE, circuit: "120V20A_dedicated", heaterKw: 1.5, unattended: true, manualAllowsUnattendedThermostat: true, flammablesStored: "no", ulListed: "yes" });
  assert.notEqual(v.verdict, "NO_GO");
});

// 22. No UL/CSA/ETL mark -> NO-GO for combustion, ONLY IF for electric
test("22: No listing mark -> NO-GO for a combustion heater (kerosene)", () => {
  const v = verdictFor("kerosene", { ...BASE, attached: false, unattended: false, ulListed: "no" });
  assertShape(v, "NO_GO", "NO-GO", "T22a");
});
test("22b: No listing mark -> ONLY IF for an electric heater", () => {
  const v = verdictFor("e240", { ...BASE, circuit: "240V30A", heaterKw: 5, outletGrounded: true, ulListed: "no", flammablesStored: "no" });
  assertShape(v, "GO_IF", "ONLY IF", "T22b");
  assert.ok(v.conditions.some((c) => /UL, CSA or ETL/.test(c.text)));
});

// 23. ZIP in Massachusetts + kerosene -> NO-GO
test("23: Massachusetts + kerosene -> NO-GO regardless of situation", () => {
  const v = verdictFor("kerosene", { ...BASE, state: "MA", attached: false, unattended: false, livingAbove: false });
  assertShape(v, "NO_GO", "NO-GO", "T23");
});

// 24. ZIP in the NYC ranges + kerosene -> NO-GO
test("24: NYC ZIP3 + kerosene -> NO-GO regardless of situation", () => {
  for (const zip3 of ["100", "104", "111", "114", "116"]) {
    const v = verdictFor("kerosene", { ...BASE, state: "NY", zip3, attached: false, unattended: false, livingAbove: false });
    assertShape(v, "NO_GO", "NO-GO", `T24 zip3=${zip3}`);
  }
  // A non-NYC NY zip3 isn't caught by the overlay.
  const outside = verdictFor("kerosene", { ...BASE, state: "NY", zip3: "125", attached: false, unattended: false, livingAbove: false });
  assert.notEqual(outside.verdict, "NO_GO");
});

test("every verdict for every heater kind carries at least 2 conditions", () => {
  const kinds: Array<Parameters<typeof verdictFor>[0]> = ["e120", "e240", "buddy", "torpedo", "kerosene", "diesel", "vented_gas", "minisplit"];
  for (const k of kinds) {
    const v = verdictFor(k, { ...BASE, circuit: "240V30A", heaterKw: 5, cylinder: "1lb" });
    assert.ok(v.conditions.length >= 2, `${k} produced only ${v.conditions.length} conditions`);
  }
});
