import type { GarageInput, Grade } from "@/lib/planner/types";
import { plan } from "@/lib/planner/plan";
import { EXAMPLE_A_INPUT } from "@/lib/planner/fixtures";

// FIG. 1 of the home hero (BLUEPRINT.md §4.9 #1, §0.2's "worked example A"): the same 24x24x9 attached
// 2-car garage in Chicago, run through the real plan() four times as the envelope gets better or worse.
// Every number here is computed at request time, never retyped -- that's what the chips drive on the
// Disagreement Strip and on FIG. 1's own morph states (BLUEPRINT.md §4.10 rule 14: no placeholder numbers).
export type HeroState = {
  key: "bare" | "asIs" | "seals" | "ceiling";
  label: string;
  qSize: number;
  grade: Grade;
  kw: number;
  breakerA: number;
  wireAwg: string;
};

const AS_IS: GarageInput = { ...EXAMPLE_A_INPUT };

const SEALS: GarageInput = {
  ...AS_IS,
  tightness: "tight",
  garageDoors: AS_IS.garageDoors.map((d) => ({ ...d, type: "kit_eps_or_batt" })),
};

const CEILING: GarageInput = { ...SEALS, ceilingIns: "R30" };

const BARE: GarageInput = {
  ...AS_IS,
  wallType: "open_studs",
  tightness: "very_leaky",
  garageDoors: AS_IS.garageDoors.map((d) => ({ ...d, type: "wood_uninsulated" })),
};

function stateFor(key: HeroState["key"], input: GarageInput): HeroState {
  const r = plan(input);
  return {
    key,
    label: LABEL[key],
    qSize: r.heating.qSize,
    grade: r.heating.grade,
    kw: r.heating.kwSize,
    breakerA: r.circuits.forSize.breakerA,
    wireAwg: r.circuits.forSize.wireNM,
  };
}

const LABEL: Record<HeroState["key"], string> = {
  bare: "Bare & leaky",
  asIs: "As-is",
  seals: "+ Seals & door kit",
  ceiling: "+ R-30 ceiling",
};

export const HERO_PLAN = plan(AS_IS);

// Ordered worst-to-best for the strip's Ember band; the hero chips reorder these as-is/seals/ceiling/bare.
export const HERO_STATES: HeroState[] = [
  stateFor("bare", BARE),
  stateFor("asIs", AS_IS),
  stateFor("seals", SEALS),
  stateFor("ceiling", CEILING),
];

export function heroState(key: HeroState["key"]): HeroState {
  return HERO_STATES.find((s) => s.key === key)!;
}

export const HERO_QSIZE_RANGE: [number, number] = [
  Math.min(...HERO_STATES.map((s) => s.qSize)),
  Math.max(...HERO_STATES.map((s) => s.qSize)),
];
