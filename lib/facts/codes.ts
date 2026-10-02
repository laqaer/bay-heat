import type { Fact } from "../types/evidence.ts";
type AnyFact = Fact<number | string>;

// Code citations shown as R chips (BLUEPRINT.md §5.2). Values are the plain-English rule, not the copyrighted
// code text; each Fact links to the code body's free-access index page, not the paywalled section itself.
export const FACTS: AnyFact[] = [
  { id: "code.nec.210_23_a_1", value: "Cord-and-plug equipment: at most 80% of the branch circuit rating", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 210.23(A)(1)" },
  { id: "code.nec.424_4_b", value: "Fixed electric space heating is a continuous load: conductors and OCPD at 125%", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 424.4(B)" },
  { id: "code.nec.210_8_a", value: "GFCI required on 125-250V receptacles in dwelling garages", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 210.8(A)(2)" },
  { id: "code.nec.210_11_c_4", value: "A dedicated 20A 120V garage receptacle circuit is required", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 210.11(C)(4)" },
  { id: "code.nec.220_83", value: "Existing-dwelling load calculation required before adding a large new load", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 220.83" },
  { id: "code.nec.240_4_d", value: "Small-conductor overcurrent limits: 14 AWG=15A, 12 AWG=20A, 10 AWG=30A", ev: "R", sourceId: "nec-2023", checked: "2026-09-25", status: "verified", note: "NEC 240.4(D)" },
  { id: "code.irc.r302_5_2", value: "House HVAC ducts must never open into the garage", ev: "R", sourceId: "irc-2021", checked: "2026-09-25", status: "verified", note: "IRC R302.5.2" },
  { id: "code.irc.r315", value: "A CO alarm is required in dwellings with an attached garage", ev: "R", sourceId: "irc-2021", checked: "2026-09-25", status: "verified", note: "IRC R315" },
  { id: "code.ifgc.305_3", value: "Ignition source at least 18 in above the garage floor for fuel-fired appliances", ev: "R", sourceId: "ifgc-2021", checked: "2026-09-25", status: "verified", note: "IFGC 305.3 / IRC G2408.2" },
  { id: "code.irc.m1307_3", value: "Appliances with a spark, flame, or other ignition source must be elevated at least 18 in above a garage floor", ev: "R", sourceId: "irc-2021", checked: "2026-09-25", status: "verified", note: "IRC 2021 M1307.3, Elevation of ignition source" },
  { id: "code.ifgc.621", value: "Unvented room heater aggregate input limited relative to room volume", ev: "R", sourceId: "ifgc-2021", checked: "2026-09-25", status: "verified", note: "IFGC 621; borrowed here as an extra check, not a room-heater installation" },
  { id: "code.nfpa58.cylinder_storage", value: "LP-gas cylinder storage inside residential buildings is restricted to small (1 lb class) cylinders", ev: "R", sourceId: "nfpa-58", checked: "2026-09-25", status: "verify", note: "state/local adoption varies -- confirm exact NFPA 58 section before publishing" },
];
