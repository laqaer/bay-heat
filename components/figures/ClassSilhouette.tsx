import type { HeaterClassId } from "@/lib/planner/types";

// STUB(W0) -- owned by W3. 14 heater-class thermal glyphs, 64x48. v1 ships one generic silhouette per
// mount type; W3 replaces with the full set.
export function ClassSilhouette({ classId }: { classId: HeaterClassId }) {
  const ceiling = classId.startsWith("e_240") || classId === "e_ir_240";
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16 text-(--color-fg-2)" aria-hidden="true">
      <rect x="4" y={ceiling ? 6 : 30} width="56" height="10" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
