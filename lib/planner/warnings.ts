import type { GarageInput, HeaterClassId, RankedSystem, Warning, WhyNot } from "./types.ts";
import { isFlammablesYes } from "./defaults.ts";

// The planner's own S1-S12 warnings (planner-engineering.md §13, S12 added per BLUEPRINT.md §2.5). Distinct
// from lib/safety/verdict.ts's Can I Run It? engine: these attach to a plan() RESULT given whichever classes
// actually got recommended or excluded, not to a single direct heater-and-situation question.

const COMBUSTION_CLASSES: HeaterClassId[] = ["g_unvented_buddy", "g_vented_unit", "diesel_air", "k_unvented", "torpedo"];
const UNVENTED_CLASSES: HeaterClassId[] = ["g_unvented_buddy", "k_unvented", "torpedo"];

function hasClass(recommendations: RankedSystem[], whyNot: WhyNot[], id: HeaterClassId): boolean {
  return recommendations.some((r) => r.classId === id) || whyNot.some((w) => w.classId === id);
}

export function planWarnings(input: GarageInput, recommendations: RankedSystem[], whyNot: WhyNot[]): Warning[] {
  const warnings: Warning[] = [];
  const recommendedIds = new Set(recommendations.map((r) => r.classId));
  const anyCombustionRecommended = COMBUSTION_CLASSES.some((id) => recommendedIds.has(id));
  const anyUnventedRecommended = UNVENTED_CLASSES.some((id) => recommendedIds.has(id));

  if (anyCombustionRecommended) {
    warnings.push({
      code: "S1",
      severity: "warn",
      text: "Ignition source at least 18 in above the garage floor for any fuel-fired appliance, unless it's FVIR-listed. Keep it away from gasoline and solvent storage.",
      cite: "IFGC 305.3 / IRC G2408.2",
      ev: "R",
    });
    warnings.push({
      code: "S2",
      severity: "warn",
      text: "A combustion heater needs a UL 2034 CO alarm in the house near the garage door, and a garage-rated low-level CO monitor while it runs.",
      cite: "IRC R315",
      ev: "R",
    });
  }

  if (anyUnventedRecommended) {
    warnings.push({
      code: "S3",
      severity: "warn",
      text: "Attended use only, with a fresh-air opening. Aggregate unvented input is capped near 20 BTU/h per ft³ of room volume -- some jurisdictions restrict unvented room heaters outright.",
      cite: "IFGC 621",
      ev: "C",
    });
  }

  if (hasClass(recommendations, whyNot, "torpedo")) {
    warnings.push({ code: "S4", severity: "info", text: "Forced-air \"torpedo\" construction heaters are excluded from every recommendation here.", cite: "BayHeat", ev: "C" });
  }

  if (recommendedIds.has("diesel_air")) {
    warnings.push({
      code: "S5",
      severity: "warn",
      text: "Diesel air heater exhaust and intake must both be routed outdoors. These units carry no UL/CSA listing for building heat -- a CO alarm is required.",
      cite: "Manufacturer manual",
      ev: "S",
    });
  }

  if (recommendedIds.has("e_port_1500") || recommendedIds.has("e_ir_wall_1500")) {
    warnings.push({
      code: "S6",
      severity: "warn",
      text: "A 120V portable heater must be the sole load on its circuit -- no extension cords or power strips, at least 3 ft from anything flammable.",
      cite: "NEC 210.23(A)(1)",
      ev: "R",
    });
  }

  const needsBigCircuit = recommendations.some((r) => r.circuit && r.circuit.breakerA >= 30);
  if (input.panelAmps === 100 && needsBigCircuit) {
    warnings.push({
      code: "S7",
      severity: "warn",
      text: "Adding a 30A+ 240V circuit to a 100A panel calls for an electrician's load calculation before you buy.",
      cite: "NEC 220.83 / NEC 2026 120.83",
      ev: "R",
    });
  }

  if (input.attached) {
    warnings.push({
      code: "S9",
      severity: "info",
      text: "Never tie house HVAC ducts into the garage, and keep the fire-separation drywall intact.",
      cite: "IRC R302.5.2",
      ev: "R",
    });
  }

  if (anyCombustionRecommended && input.useCase === "shop") {
    warnings.push({
      code: "S10",
      severity: "warn",
      text: "A shop with sawdust or solvent vapor should prefer a separated-combustion unit heater over a standard atmospheric burner.",
      cite: "BayHeat",
      ev: "C",
    });
  }

  if (recommendedIds.has("e_ir_240")) {
    warnings.push({
      code: "S11",
      severity: "warn",
      text: "Keep a radiant/infrared heater's clearance per its manual, and never aim it at a vehicle's fuel fill or a gasoline can.",
      cite: "Manufacturer manual",
      ev: "S",
    });
  }

  if (isFlammablesYes(input.flammablesStored) && recommendations.length > 0) {
    warnings.push({
      code: "S12",
      severity: "block",
      text: "Manual: not where gasoline, paint or flammable liquids are used or stored. Move them to an outdoor shed or cabinet first.",
      cite: "Manufacturer manual",
      ev: "S",
    });
  }

  return warnings;
}
