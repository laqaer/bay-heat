import type { ThermalExhibitProps } from "@/components/contracts";
import { Figure } from "./Figure";

// STUB(W0) -- owned by W3 (thermal/figures/home). v1 ships a static baked poster (scripts/bake-posters.ts),
// never a live canvas simulation (deferred to v1.1 per feasibility red-team finding #13). This stub renders
// the HUD chrome without a poster image so every page that uses it compiles and looks intentional.
export function ThermalExhibit({ hud, caption, fig }: ThermalExhibitProps) {
  return (
    <Figure n={fig} caption={caption}>
      <div data-surface="camera" className="relative aspect-[4/3] w-full overflow-hidden bg-(--color-bg) text-(--color-fg)">
        <div className="absolute inset-3 border border-(--color-line)" />
        <div className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-fg-2)">
          BayHeat IR · Modeled — not a photograph
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-(--color-fg-2)">
          <span>
            {hud.dims} · out {hud.out}°F · in {hud.in}°F
          </span>
          <span>71°F / 0°F</span>
        </div>
      </div>
    </Figure>
  );
}
