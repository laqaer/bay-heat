import { test } from "node:test";
import assert from "node:assert/strict";
import { serialFor, fnv1a } from "./serial.ts";
import { EXAMPLE_A_INPUT } from "./fixtures.ts";
import { encode } from "./codec.ts";

test("serialFor matches the R-{preset}{attach}-{zip3}-{hash4} format", () => {
  const code = encode(EXAMPLE_A_INPUT);
  const serial = serialFor(EXAMPLE_A_INPUT, code);
  assert.match(serial, /^R-2A-606-[0-9A-F]{4}$/);
});

test("serialFor is deterministic for the same input/code", () => {
  const code = encode(EXAMPLE_A_INPUT);
  assert.equal(serialFor(EXAMPLE_A_INPUT, code), serialFor(EXAMPLE_A_INPUT, code));
});

test("serialFor differs when the code differs", () => {
  const codeA = encode(EXAMPLE_A_INPUT);
  const codeB = encode({ ...EXAMPLE_A_INPUT, targetTemp: 60 });
  assert.notEqual(serialFor(EXAMPLE_A_INPUT, codeA), serialFor(EXAMPLE_A_INPUT, codeB));
});

test("serialFor uses D for a detached garage and the state for a state-fallback location", () => {
  const input = { ...EXAMPLE_A_INPUT, attached: false, zip3: undefined, state: "IL" };
  const serial = serialFor(input, encode(input));
  assert.match(serial, /^R-2D-IL-[0-9A-F]{4}$/);
});

test("fnv1a is a pure deterministic hash", () => {
  assert.equal(fnv1a("hello"), fnv1a("hello"));
  assert.notEqual(fnv1a("hello"), fnv1a("hellp"));
});
