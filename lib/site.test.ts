import { test } from "node:test";
import assert from "node:assert/strict";
import { aiLine } from "./site.ts";

// A page published before the editor signs off must say so, never "full" (BLUEPRINT.md §5.2).
test("aiLine never claims a human review that is still pending", () => {
  const pending = aiLine("gas", "pending");
  assert.match(pending, /Human review: pending/);
  assert.doesNotMatch(pending, /Human review: full/);
  assert.match(aiLine(null, "full"), /Human review: full by /);
});
