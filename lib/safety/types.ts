// Frozen types for the Can I Run It? verdict engine (lib/safety/verdict.ts). Independent of the planner --
// this is a direct-question tool, not a garage model.

export type HeaterKind = "e120" | "e240" | "buddy" | "torpedo" | "kerosene" | "diesel" | "vented_gas" | "minisplit";
export type Situation = {
  attached: boolean;
  flammablesStored: boolean;
  livingAbove: boolean;
  unattended: boolean;
  freshAir: boolean;
  circuit?: "120V15A_shared" | "120V20A_dedicated" | "extension_cord" | "240V20A" | "240V30A";
  heaterKw?: number;
  heaterBtuh?: number;
  cylinder?: "1lb" | "20lb";
  exhaustOutdoors?: boolean;
  coAlarm: boolean;
  preset: "1car" | "2car" | "3car";
};
export type Condition = { text: string; cite: string; ev: "R" | "S" | "C"; severity: "must" | "should" };
export type Verdict = { verdict: "GO" | "GO_IF" | "NO_GO"; stamp: string; conditions: Condition[]; saferAlternatives: HeaterKind[]; reasons: string[] };

// SIGNATURE (implemented in the named module, not here): function verdictFor(h: HeaterKind, s: Situation): Verdict; // lib/safety/verdict.ts
