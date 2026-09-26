import type { IndexRow } from "@/lib/index/types";

// STUB(W0) -- owned by W7 (data desk). An accessible SVG tile map for the Garage Heat Index (51 equal
// squares); the sortable table is the accessible fallback and ships alongside it, never instead of it.
export function UsTileMap({ rows }: { rows: IndexRow[] }) {
  const max = Math.max(...rows.map((r) => r.season.electric));
  return (
    <div className="not-prose my-6 grid grid-cols-10 gap-1 bg-(--color-surface) p-4 sm:grid-cols-13" role="img" aria-label="Season electric heating cost by state, Frost to Forge scale">
      {rows.map((r) => {
        const t = r.season.electric / max;
        return (
          <div
            key={r.state}
            title={`${r.state}: $${Math.round(r.season.electric)}/season`}
            className="flex aspect-square items-center justify-center font-mono text-[9px] text-white"
            style={{ background: `color-mix(in oklab, var(--frost-2) ${(1 - t) * 100}%, var(--forge-2) ${t * 100}%)` }}
          >
            {r.state}
          </div>
        );
      })}
    </div>
  );
}
