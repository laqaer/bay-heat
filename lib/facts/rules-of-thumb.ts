import type { Fact, Source } from "../types/evidence.ts";

// Lane stub (W3: thermal/figures/home). The competitor sizing rules quoted for the Disagreement Strip and
// BH-001 (company/research/competitors.md §3.1, "the 4x Problem"): each Fact below is the BTU/h figure a
// live publisher page implies for a 24x24 (576 sq ft) garage, computed from a rule fetched and quoted
// verbatim on 2026-09-26 (the verbatim quote itself lives on the matching Source's `quote` field in the
// shared lib/facts/sources.ts, not here -- this lane's own SOURCES stays empty, matching lib/facts/codes.ts).
//
// Of the seven rules in the original BLUEPRINT.md table, two could not be verified and are left out rather
// than guessed: Car and Driver (no reachable garage-heater sizing article was found across repeated web
// searches on caranddriver.com) and AC Direct (acdirect.com returned HTTP 403 to every fetch attempt, so no
// page content could be read to quote verbatim).
export const FACTS: Fact<number>[] = [
  {
    id: "rot.bob-vila.btuh",
    value: 10236,
    unit: "BTU/h",
    ev: "R",
    sourceId: "bob-vila-garage-heater-size",
    checked: "2026-09-26",
    status: "verified",
    note: "3,000 W x 3.412 BTU/W = 10,236 BTU/h",
  },
  {
    id: "rot.filterbuy.btuh",
    value: 24000,
    unit: "BTU/h",
    ev: "R",
    sourceId: "filterbuy-how-to-heat-a-garage",
    checked: "2026-09-26",
    status: "verified",
    note: "Filterbuy states 24,000 BTU/h directly as the top of its 2-car tier (covers up to 500-550 ft²), the closest listed figure to a 576 ft² 24x24 garage; no per-ft² rate is given to scale from",
  },
  {
    id: "rot.pickhvac.btuh",
    value: 26500,
    unit: "BTU/h",
    ev: "R",
    sourceId: "pickhvac-garage-heater-sizing",
    checked: "2026-09-26",
    status: "verified",
    note: "Midpoint of PickHVAC's own 600 sq ft row (nearest listed size to a 576 ft² 24x24 garage): (18,000 + 35,000) / 2 = 26,500 BTU/h",
  },
  {
    id: "rot.thegarage-guide.btuh",
    value: 25000,
    unit: "BTU/h",
    ev: "R",
    sourceId: "thegarage-guide-heater-guide",
    checked: "2026-09-26",
    status: "verified",
    note: "Midpoint of thegarage.guide's own 2-car (400-500 ft²), moderately-insulated tier: (20,000 + 30,000) / 2 = 25,000 BTU/h; their full well-insulated-to-uninsulated span for a 2-car garage is 12,000-60,000 BTU/h",
  },
];
export const SOURCES: Record<string, Source> = {};
