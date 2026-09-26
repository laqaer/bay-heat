import type { WhyNot as WhyNotRow } from "@/lib/planner/types";
import { HEATER_CLASSES } from "@/lib/planner/catalog";

export function WhyNot({ rows }: { rows: WhyNotRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="not-prose my-4 space-y-1 text-sm text-(--color-fg-2)">
      {rows.map((r) => (
        <li key={r.classId}>
          <span className="font-medium text-(--color-fg)">Why not a {HEATER_CLASSES[r.classId].label}?</span> {r.text}
        </li>
      ))}
    </ul>
  );
}
