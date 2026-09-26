import type { CostRow } from "@/lib/planner/types";

const LABEL: Record<CostRow["system"], string> = {
  electric_resistance: "Electric",
  heat_pump_cc: "Heat pump",
  ng_vented_80: "Natural gas",
  propane_bulk_80: "Propane (bulk)",
  propane_cyl_92: "Propane (cylinder)",
  diesel_78: "Diesel",
};

// STUB(W0) -- owned by W7 (data desk). Cost-per-hour bars for the Fuel Cost Meter and the fuel hub pages.
export function FuelCostBars({ rows }: { rows: CostRow[] }) {
  const max = Math.max(...rows.map((r) => r.perHour));
  return (
    <div className="not-prose my-6 space-y-2 bg-(--color-surface) p-4">
      {rows.map((r) => (
        <div key={r.system} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-(--color-fg-2)">{LABEL[r.system]}</span>
          <div className="h-3 flex-1 bg-(--color-surface-2)">
            <div className="h-3 bg-(--color-heat)" style={{ width: `${(r.perHour / max) * 100}%` }} />
          </div>
          <span className="w-16 shrink-0 text-right font-mono text-xs">${r.perHour.toFixed(2)}/h</span>
        </div>
      ))}
    </div>
  );
}
