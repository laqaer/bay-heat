import type { Grade } from "@/lib/planner/types";

const ORDER: Grade[] = ["F", "D", "C", "B", "A"];
const COLOR: Record<Grade, string> = {
  F: "var(--grade-f)",
  D: "var(--grade-d)",
  C: "var(--grade-c)",
  B: "var(--grade-b)",
  A: "var(--grade-a)",
};

// STUB(W0) -- owned by W5 (result). The only non-temperature ramp in the system; always labeled, never
// color-only (BLUEPRINT.md §4.2).
export function GradeScale({ current }: { current?: Grade }) {
  return (
    <div className="not-prose my-4">
      <div className="flex h-3 w-full overflow-hidden">
        {ORDER.map((g) => (
          <div key={g} className="flex-1" style={{ background: COLOR[g] }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-(--color-fg-2)">
        <span>Heat escapes</span>
        {current ? <span className="font-bold text-(--color-fg)">Your garage: {current}</span> : null}
        <span>Holds heat</span>
      </div>
    </div>
  );
}
