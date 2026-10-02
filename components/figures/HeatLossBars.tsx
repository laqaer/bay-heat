import type { LoadKey } from "@/lib/planner/types";
import { Figure } from "./Figure";

// STUB(W0) -- owned by W5 (result), not W3, per the feasibility red-team's component-ownership fix (finding
// #3): this renders inside the Garage Heat Report, so the lane that owns the report owns its figures.
const LABEL: Record<LoadKey, string> = {
  walls: "Walls",
  garage_doors: "Big door",
  windows: "Windows",
  service_door: "Service door",
  ceiling_roof: "Ceiling",
  slab_edge: "Slab edge",
  infiltration: "Air leaks",
  house_coupling: "House wall",
};

export function HeatLossBars({ items, fig = 2 }: { items: { key: LoadKey; btuh: number; pct: number }[]; fig?: number }) {
  const sorted = [...items].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const max = Math.max(...sorted.map((i) => Math.abs(i.pct)));
  return (
    <Figure n={fig} caption="Where your heat goes, sorted largest first.">
      <div className="space-y-2 bg-(--color-surface) p-4">
        {sorted.map((item) => (
          <div key={item.key} className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-(--color-fg-2)">{LABEL[item.key]}</span>
            <div className="h-3 flex-1 bg-(--color-surface-2)">
              <div
                className={item.pct < 0 ? "h-3 bg-(--color-frost)" : "h-3 bg-(--color-heat)"}
                style={{ width: `${(Math.abs(item.pct) / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-xs">{item.pct}%</span>
          </div>
        ))}
      </div>
    </Figure>
  );
}
