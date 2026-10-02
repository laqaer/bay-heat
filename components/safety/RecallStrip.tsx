// STUB(W0) -- owned by W6 (safety and lab). Final shape: the last 3 relevant CPSC recalls from a committed
// snapshot (lib/safety/recalls.snapshot.ts), e.g. "2026-06-04 · Vornado SRTH tower heaters · ~255,000 units".
export type Recall = { date: string; product: string; units: string; hazard: string; url: string };

export function RecallStrip({ recalls }: { recalls: Recall[] }) {
  if (recalls.length === 0) return null;
  return (
    <div className="my-6 border border-(--color-alarm)/40 bg-(--color-surface) p-4 text-sm text-(--color-fg-2)">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-(--color-alarm)">Recall watch</p>
      <ul className="mt-2 space-y-1">
        {recalls.map((r) => (
          <li key={r.url}>
            {r.date} · {r.product} · {r.units} · {r.hazard}
          </li>
        ))}
      </ul>
    </div>
  );
}
