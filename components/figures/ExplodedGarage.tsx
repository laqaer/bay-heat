import { GarageIso } from "./GarageIso";

// STUB(W0) -- owned by W3 (home §02 "Where your heat goes"). v1 renders the finished exploded state
// statically (no scroll-driven animation) -- feasibility red-team finding #13.
export function ExplodedGarage() {
  return (
    <div className="not-prose aspect-video w-full bg-(--color-surface) p-6 text-(--color-fg)">
      <GarageIso bays={2} attached ceilingFt={9} doorType="steel_single" />
    </div>
  );
}
