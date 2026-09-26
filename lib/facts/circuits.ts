import type { Fact } from "../types/evidence.ts";
type AnyFact = Fact<number | string>;

// The circuit table (planner-engineering.md §11.2), as facts so prose never retypes a number by hand.
// The drift-lint (scripts/evidence-lint.ts) fails the build if these literals appear outside lib/ in
// app/**/page.tsx JSX text -- they must render through <Num> reading these facts, or lib/planner/electrical.ts.
export const FACTS: AnyFact[] = [
  { id: "circuit.120v15a.continuous_w", value: 1440, unit: "W", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "80% of 15A branch, NEC 210.23(A)(1)" },
  { id: "circuit.120v15a.continuous_a", value: 12, unit: "A", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.120v20a.continuous_w", value: 1920, unit: "W", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.240v30a.continuous_w", value: 5760, unit: "W", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.240v40a.continuous_w", value: 7680, unit: "W", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.240v60a.continuous_w", value: 11520, unit: "W", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.1500w120v.amps", value: 12.5, unit: "A", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.5000w240v.amps", value: 20.8, unit: "A", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.5000w240v.breaker", value: "30 A, 10 AWG Cu", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "20.8A x 1.25 = 26.0A -> next standard size 30A; NEC 424.4(B)" },
  { id: "circuit.4000w240v.breaker", value: "25 A, 10 AWG Cu (does not fit a 20 A circuit)", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.7500w240v.breaker", value: "40 A, 8 AWG Cu", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.10000w240v.breaker", value: "60 A, 6 AWG THHN (75°C) or 4 AWG NM", ev: "C", sourceId: "nec-2023", checked: "2026-09-25", status: "verified" },
  { id: "circuit.gfci_garage", value: "GFCI required on 125-250V receptacles in dwelling garages", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 210.8(A)(2)" },
  { id: "circuit.dedicated_20a_receptacle", value: "A dedicated 20A 120V garage receptacle circuit is required", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 210.11(C)(4)" },
  { id: "circuit.load_calc_threshold", value: "Adding 30A+ of 240V load to a 100A panel needs a load calculation", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 220.83" },
];
