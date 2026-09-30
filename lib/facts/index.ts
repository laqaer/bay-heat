import type { Fact, Source } from "../types/evidence.ts";
import { SOURCES as CORE_SOURCES } from "./sources.ts";
import { FACTS as PRODUCTS_FACTS } from "./products.ts";
import { FACTS as CIRCUITS_FACTS } from "./circuits.ts";
import { FACTS as CODES_FACTS } from "./codes.ts";
import { FACTS as FUELS_FACTS } from "./fuels.ts";
import { FACTS as SEAL_FACTS, SOURCES as SEAL_SOURCES } from "./seal.ts";
import { FACTS as ELECTRIC_FACTS, SOURCES as ELECTRIC_SOURCES } from "./electric.ts";
import { FACTS as FUEL_FACTS, SOURCES as FUEL_SOURCES } from "./fuel.ts";
import { FACTS as SAFETY_FACTS, SOURCES as SAFETY_SOURCES } from "./safety.ts";
import { FACTS as LAB_FACTS, SOURCES as LAB_SOURCES } from "./lab.ts";
import { FACTS as ROT_FACTS, SOURCES as ROT_SOURCES } from "./rules-of-thumb.ts";

// The site-wide facts registry: every lane's FACTS and SOURCES, merged. A page that needs a fact imports
// getFact()/getSource() from here, never a lane file directly, so the registry stays the single point of
// truth `scripts/evidence-lint.ts` and the facts test can check.
export const SOURCES: Record<string, Source> = {
  ...CORE_SOURCES,
  ...SEAL_SOURCES,
  ...ELECTRIC_SOURCES,
  ...FUEL_SOURCES,
  ...SAFETY_SOURCES,
  ...LAB_SOURCES,
  ...ROT_SOURCES,
};

export const ALL_FACTS: Fact<number | string>[] = [
  ...PRODUCTS_FACTS,
  ...CIRCUITS_FACTS,
  ...CODES_FACTS,
  ...FUELS_FACTS,
  ...SEAL_FACTS,
  ...ELECTRIC_FACTS,
  ...FUEL_FACTS,
  ...SAFETY_FACTS,
  ...LAB_FACTS,
  ...ROT_FACTS,
];

const BY_ID = new Map(ALL_FACTS.map((f) => [f.id, f]));

// getFact() throws in dev on a missing id or an un-rendered 'verify' fact, so a broken reference is caught
// while writing the page, not by a reader (feasibility red-team finding #22). In production it returns null
// for a 'verify' fact instead of throwing -- callers must use <IfVerified> (components/evidence/IfVerified.tsx)
// to drop the whole sentence/row rather than render a gap.
export function getFact(id: string): Fact<number | string> | null {
  const fact = BY_ID.get(id);
  if (!fact) {
    if (process.env.NODE_ENV !== "production") throw new Error(`Unknown fact id: ${id}`);
    return null;
  }
  if (fact.status === "verify") {
    if (process.env.NODE_ENV !== "production") return fact; // visible [VERIFY:id] marker in dev, see <Num>
    return null;
  }
  return fact;
}

export function getSource(id: string): Source | null {
  return SOURCES[id] ?? null;
}
