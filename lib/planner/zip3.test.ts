import { test } from "node:test";
import assert from "node:assert/strict";
import { zip3ToState, zip3ToStation, resolveZip3 } from "./zip3.ts";
import { ZIP3_STATE_RANGES, ZIP3_STATION_OVERRIDES } from "./zip3.data.ts";
import { STATIONS, stationById } from "./stations.ts";

test("every station's state is covered by at least one ZIP3 range", () => {
  const coveredStates = new Set(ZIP3_STATE_RANGES.map(([, , st]) => st));
  for (const s of STATIONS) {
    assert.ok(coveredStates.has(s.st), `${s.id} (${s.st}) has no ZIP3 range`);
  }
});

test("ZIP3 ranges don't overlap", () => {
  const sorted = [...ZIP3_STATE_RANGES].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(sorted[i][0] > sorted[i - 1][1], `overlap: [${sorted[i - 1]}] and [${sorted[i]}]`);
  }
});

test("every override points to a real station id", () => {
  for (const [zip3, id] of Object.entries(ZIP3_STATION_OVERRIDES)) {
    assert.ok(stationById(id), `override ${zip3} -> ${id} is not a real station id`);
  }
});

test("every override's zip3 falls inside that station's own state range", () => {
  for (const [zip3, id] of Object.entries(ZIP3_STATION_OVERRIDES)) {
    const station = stationById(id)!;
    assert.equal(zip3ToState(zip3), station.st, `override ${zip3} -> ${id} but ${zip3} resolves to a different state`);
  }
});

test("known ZIP3 lookups resolve to the expected station", () => {
  assert.equal(zip3ToStation("606")!.id, "IL-chicago");
  assert.equal(zip3ToStation("100")!.id, "NY-new-york-city");
  assert.equal(zip3ToStation("941")!.id, "CA-san-francisco");
  assert.equal(zip3ToStation("770")!.id, "TX-houston");
  assert.equal(zip3ToStation("331")!.id, "FL-miami"); // no override -> state primary
  assert.equal(zip3ToStation("152")!.id, "PA-pittsburgh");
});

test("resolveZip3 returns state, station and prices together", () => {
  const r = resolveZip3("606");
  assert.ok(r);
  assert.equal(r!.state, "IL");
  assert.equal(r!.station.id, "IL-chicago");
  assert.equal(r!.prices.state, "IL");
});

test("resolveZip3 returns null for an unresolvable ZIP3 (territories, malformed)", () => {
  assert.equal(resolveZip3("007"), null); // Puerto Rico range, no station
  assert.equal(resolveZip3("ab6"), null);
  assert.equal(resolveZip3("60"), null);
});
