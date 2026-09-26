// STUB(W0) -- owned by W3. A side-section line drawing (roof, joists, door, window, slab), meant to be
// composited as an overlay on the thermal exhibit so the field reads as a temperature map, not a color blob
// (taste red-team finding #3).
export function GarageSection({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth={1} />
      <polyline points="10,100 10,40 100,10 190,40 190,100" fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x="70" y="60" width="40" height="40" fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x="150" y="70" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={0.75} />
    </svg>
  );
}
