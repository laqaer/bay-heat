// "Won't keep up" is a dashed bar, never red (BLUEPRINT.md §0.3) -- color is never the only safety signal.
export function FitBar({ pct }: { pct: number }) {
  const short = pct < 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 border border-(--color-fg-2)/40">
        <div
          className={short ? "h-2 border-r-2 border-dashed border-(--color-fg-2) bg-(--color-surface-2)" : "h-2 bg-(--color-ember)"}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-(--color-fg-2)">{Math.round(pct)}% of your load</span>
    </div>
  );
}
