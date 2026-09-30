import { Figure } from "./Figure";

// STUB(W0) -- owned by W5 (result). Model line is dotted; once BH-004 publishes a measured curve, it overlays
// as a solid line with an M chip (BLUEPRINT.md §2.2 row 8).
export function WarmupCurve({ curve, minutesToTarget, fig = 3 }: { curve: [number, number][]; minutesToTarget: number | null; fig?: number }) {
  const width = 560;
  const height = 180;
  const maxMin = curve.length ? curve[curve.length - 1][0] : 1;
  const minT = Math.min(...curve.map((p) => p[1]));
  const maxT = Math.max(...curve.map((p) => p[1]));
  const points = curve
    .map(([m, t]) => {
      const x = (m / maxMin) * (width - 40) + 20;
      const y = height - 20 - ((t - minT) / (maxT - minT || 1)) * (height - 40);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <Figure n={fig} caption={minutesToTarget != null ? `Modeled warm-up, an average January day (${minutesToTarget} min to target).` : "Modeled warm-up."}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-(--color-surface)">
        <polyline points={points} fill="none" stroke="var(--color-frost)" strokeWidth={2} strokeDasharray="4 3" />
      </svg>
    </Figure>
  );
}
