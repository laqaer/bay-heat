import { Figure } from "./Figure";

export type DisagreementMark = { label: string; btuh: number };

// STUB(W0) -- owned by W3. Source marks (competitor rules of thumb) drop onto a 0-max BTU/h axis; our band
// draws last. BLUEPRINT.md §4.8 row 4.
export function DisagreementStrip({ marks, ourBand, fig = 1 }: { marks: DisagreementMark[]; ourBand: [number, number]; fig?: number }) {
  const max = Math.max(ourBand[1], ...marks.map((m) => m.btuh)) * 1.05;
  return (
    <Figure n={fig} caption="Published rules of thumb for the same garage, and our modeled band.">
      <div className="relative h-24 bg-(--color-surface) px-4 py-6">
        <div className="absolute inset-x-4 top-1/2 h-px bg-(--color-line)" />
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 bg-(--color-ember)/40"
          style={{ left: `${(ourBand[0] / max) * 100}%`, width: `${((ourBand[1] - ourBand[0]) / max) * 100}%` }}
        />
        {marks.map((m) => (
          <div
            key={m.label}
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--color-fg)"
            style={{ left: `${(m.btuh / max) * 100}%` }}
            title={`${m.label}: ${m.btuh.toLocaleString()} BTU/h`}
          />
        ))}
      </div>
    </Figure>
  );
}
