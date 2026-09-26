"use client";

import { useState } from "react";
import type { HeroState } from "@/lib/home/hero-states";
import { GarageSection } from "@/components/figures/GarageSection";
import { GradeScale } from "@/components/figures/GradeScale";
import { btuh, kw, amps } from "@/lib/format";
import { clsx } from "@/lib/clsx";

const ORDER: HeroState["key"][] = ["asIs", "seals", "ceiling", "bare"];
const GRADE_TINT: Record<HeroState["grade"], number> = { F: 0, D: 25, C: 50, B: 75, A: 100 };

// FIG. 1, the home hero's thermal exhibit (BLUEPRINT.md §4.9 #1). No baked poster in v1 (deferred, same call
// as ThermalExhibit's own STUB) -- instead a Frost->Forge tint keyed to the selected envelope's grade, with
// the real GarageSection line-art overlay so it still reads as a labeled section, not a color field. The
// chips are real plan() output for the same 24x24x9 Chicago garage; clicking one morphs the tint and the
// pinned spec plate, live.
export function HeroFrame({ states, station }: { states: HeroState[]; station: { city: string; st: string; h99: number } }) {
  const ordered = ORDER.map((k) => states.find((s) => s.key === k)!);
  const [active, setActive] = useState<HeroState["key"]>("asIs");
  const current = states.find((s) => s.key === active)!;
  const t = GRADE_TINT[current.grade];

  return (
    <div>
      <div
        className="relative aspect-[4/3] w-full overflow-hidden border border-(--color-line) bg-(--color-bg) text-(--color-fg) transition-colors duration-500"
        style={{ background: `color-mix(in oklab, var(--frost-2) ${100 - t}%, var(--forge-2) ${t}%)` }}
      >
        <div className="absolute inset-3 border border-white/20" />
        <GarageSection className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] text-white/70" />
        <div className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/80">
          BayHeat IR · Modeled · 160×120
        </div>
        <div className="absolute left-4 top-8 font-mono text-[10px] text-white/70">
          24×24×9 ft · attached · out {station.h99}°F · in 55°F
        </div>
        <div className="absolute bottom-3 left-4 font-mono text-[10px] text-white/70">71°F / 0°F</div>

        <div className="absolute bottom-3 right-3 border border-white/30 bg-black/60 px-3 py-2 font-mono text-white">
          <div className="text-[9px] uppercase tracking-[0.1em] text-white/60">{current.label}</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">{kw(current.kw)} kW</div>
          <div className="text-[10px] text-white/70">
            {amps(current.breakerA)} · {current.wireAwg}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Envelope scenario">
        {ordered.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={clsx(
              "border px-3 py-2 text-left font-mono text-[11px] transition-colors",
              s.key === active ? "border-(--color-ember) bg-(--color-ember)/10 text-(--color-fg)" : "border-(--color-fg)/20 text-(--color-fg-2) hover:border-(--color-fg)/50",
            )}
          >
            <div className="uppercase tracking-[0.06em]">{s.label}</div>
            <div className="mt-1 text-sm font-bold text-(--color-fg)">
              {btuh(s.qSize)} <span className="font-normal text-(--color-fg-2)">BTU/h</span> · {s.grade}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-2">
        <GradeScale current={current.grade} />
      </div>
    </div>
  );
}
