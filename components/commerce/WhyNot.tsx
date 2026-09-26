import type { WhyNot as WhyNotRow } from "@/lib/planner/types";

export function WhyNot({ rows }: { rows: WhyNotRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="not-prose my-4 space-y-1 text-sm text-(--color-fg-2)">
      {rows.map((r) => (
        <li key={r.classId}>
          <span className="font-medium text-(--color-fg)">Why not {r.classId.replace(/_/g, " ")}?</span> {r.text}
        </li>
      ))}
    </ul>
  );
}
