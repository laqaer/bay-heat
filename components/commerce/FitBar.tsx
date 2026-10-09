// "Won't keep up" is a dashed bar, never red (BLUEPRINT.md §0.3) -- color is never the only safety signal.
// `label` finishes the sentence "N% ...": the planner's own result card says "of your load"; a page that runs a
// worked-example garage passes "of this garage's load" so the bar never claims to know the reader's garage.
export function FitBar({ pct, label = "of your load" }: { pct: number; label?: string }) {
  const short = pct < 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 border border-(--color-fg-2)/40">
        <div
          className={short ? "h-2 border-r-2 border-dashed border-(--color-fg-2) bg-(--color-surface-2)" : "h-2 bg-(--color-ember)"}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-(--color-fg-2)">
        {Math.round(pct)}% {label}
      </span>
    </div>
  );
}
