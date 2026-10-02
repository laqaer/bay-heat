// Frozen types for the Can I Run It? verdict engine (lib/safety/verdict.ts). Independent of the planner --
// this is a direct-question tool, not a garage model. Matches BLUEPRINT.md's final frozen block verbatim.

export type HeaterKind = "e120" | "e240" | "buddy" | "torpedo" | "kerosene" | "diesel" | "vented_gas" | "minisplit";
export type YesNoUnknown = "yes" | "no" | "unknown"; // unknown is always treated as "yes" by safety rules (§2.5 S12, §2.8)
export type Situation = {
  attached: boolean;
  flammablesStored: YesNoUnknown;
  livingAbove: boolean;
  unattended: boolean;
  freshAir: boolean;
  circuit?: "120V15A_shared" | "120V20A_dedicated" | "extension_cord" | "240V20A" | "240V30A";
  plugAdapterInUse?: boolean;
  outletGrounded?: boolean;
  heaterKw?: number;
  heaterBtuh?: number;
  ulListed: YesNoUnknown;
  cylinder?: "1lb" | "20lb";
  cylinderStoredWhere?: "outdoors" | "garage" | "house";
  exhaustOutdoors?: boolean;
  coAlarmHouse: boolean;
  coMonitorGarageRated: boolean;
  preset: "1car" | "2car" | "3car";
  zip3?: string;
  state?: string;
  manualAllowsUnattendedThermostat?: boolean; // [S]
};
export type Condition = { text: string; cite: string; edition?: string; ev: "R" | "S" | "C"; severity: "must" | "should" };
export type Verdict = { verdict: "GO" | "GO_IF" | "NO_GO"; stamp: "GO · PER MANUAL" | "ONLY IF" | "NO-GO"; conditions: Condition[]; saferAlternatives: HeaterKind[]; reasons: string[] };

// SIGNATURE (implemented in the named module, not here): function verdictFor(h: HeaterKind, s: Situation): Verdict; // lib/safety/verdict.ts -- every result carries >= 2 conditions, enforced by a unit test
