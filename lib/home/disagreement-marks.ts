import type { DisagreementMark } from "@/components/figures/DisagreementStrip";
import { ALL_FACTS, getSource } from "@/lib/facts";

// The Disagreement Strip's marks (BLUEPRINT.md §4.5(c), Lab Report BH-001 "The 4x Problem"): every published
// competitor rule of thumb currently verified in lib/facts/rules-of-thumb.ts, degrading to an empty array
// (an axis with no dots, just our band) until that lane has at least one verified quote -- never a fabricated
// placeholder mark.
export const DISAGREEMENT_MARKS: DisagreementMark[] = ALL_FACTS.filter(
  (f): f is typeof f & { value: number } => f.id.startsWith("rot.") && typeof f.value === "number" && f.status === "verified",
).map((f) => {
  const source = getSource(f.sourceId);
  return { label: source?.publisher ?? f.id, btuh: f.value };
});
