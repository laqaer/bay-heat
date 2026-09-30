import { test } from "node:test";
import assert from "node:assert/strict";
import { epc, monthlyRevenue, sessionsNeeded, BLUEPRINT_SESSIONS } from "../../scripts/revenue-model.mjs";

test("EPC is order rate x order value x commission x (1 + halo)", () => {
  assert.ok(Math.abs(epc({ orderRate: 0.08, orderValue: 250, commission: 0.03, halo: 0.1 }) - 0.66) < 1e-9);
  assert.equal(epc({ orderRate: 0, orderValue: 250, commission: 0.03 }), 0, "a listing nobody can buy earns nothing");
});

test("sessionsNeeded inverts monthlyRevenue", () => {
  const perClick = 0.25;
  const need = sessionsNeeded({ target: 300, ctr: 0.06, epc: perClick });
  assert.ok(Math.abs(monthlyRevenue({ sessions: need, ctr: 0.06, epc: perClick }) - 300) < 1e-9);
  assert.equal(Math.round(need), 20000);
});

test("the blueprint base-case ramp is 12 months summing to 49,500 sessions", () => {
  assert.equal(BLUEPRINT_SESSIONS.length, 12);
  assert.equal(BLUEPRINT_SESSIONS.reduce((s: number, x: number) => s + x, 0), 49500);
});
