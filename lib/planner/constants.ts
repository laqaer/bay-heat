import type { WallType, CeilingIns, RoofType, GarageDoorType, WindowType, EntryDoorType, SlabEdge, Tightness } from "./types.ts";

// Whole-assembly U-values (BTU/h.ft2.degF, including air films) and F-factors (BTU/h.ft.degF).
// Source: company/research/planner-engineering.md §5. [D] = derived/calculated here per the spec's own method,
// [V] = a directly verified anchor value, [A] = an ASHRAE-90.1-App.A-derived or otherwise labeled assumption.

export const WALL_U: Record<WallType, number> = {
  open_studs: 0.48,
  uninsulated_finished: 0.25,
  R11: 0.096,
  R13: 0.089,
  R15: 0.083,
  R19: 0.064,
  R21: 0.06,
  cmu8_uninsulated: 0.51,
  cmu8_R10: 0.09,
  metal_uninsulated: 1.18,
  metal_R10: 0.133,
  metal_R13: 0.113,
  metal_R19: 0.084,
};

export const CEILING_U: Record<CeilingIns, number> = {
  drywall_uninsulated: 0.6,
  R11: 0.083,
  R19: 0.052,
  R30: 0.035,
  R38: 0.027,
  R49: 0.021,
};

export const ROOF_U: Record<RoofType, number> = {
  shingle_deck_uninsulated: 0.5,
  metal_uninsulated: 1.5,
  metal_R10: 0.1,
  metal_R19: 0.065,
  rafters_R19: 0.052,
  rafters_R30: 0.035,
};

// Installed whole-door U, per §5.3 -- deliberately NOT the reciprocal of a marketing "R-value"
// (DASMA TDS-163/TDS-196: the advertised figure is a center-of-section calculation, not a tested whole-door
// U-factor). The planner always uses this table; a manufacturer-published tested U overrides it when supplied.
export const DOOR_U: Record<GarageDoorType, number> = {
  steel_single: 1.15,
  wood_uninsulated: 0.6,
  steel_eps_1_375: 0.4,
  steel_eps_2: 0.33,
  steel_pu_1_375: 0.24,
  steel_pu_2: 0.18,
  kit_eps_or_batt: 0.33,
  kit_reflective: 0.5,
};

export const WINDOW_U: Record<WindowType, number> = {
  single_metal: 1.2,
  single_wood_vinyl: 1.0,
  double_clear: 0.5,
  double_lowe: 0.32,
};
export const WINDOW_SHGC: Record<WindowType, number> = {
  single_metal: 0.75,
  single_wood_vinyl: 0.7,
  double_clear: 0.6,
  double_lowe: 0.3,
};

export const SERVICE_DOOR_U: Record<EntryDoorType, number> = {
  uninsulated_metal: 0.6,
  hollow_wood: 0.5,
  solid_wood: 0.4,
  insulated: 0.2,
};

export const SLAB_F: Record<SlabEdge, number> = {
  none: 0.73,
  R10_24in: 0.54,
  R15_24in: 0.52,
  R20_48in: 0.43,
};

// Design-condition natural ACH by tightness class (§5.6). Cooling ACH = 0.5 x heating ACH.
export const TIGHTNESS_ACH: Record<Tightness, number> = {
  tight: 0.75,
  average: 1.5,
  leaky: 2.5,
  very_leaky: 4.0,
};

export const TIGHTNESS_ORDER: Tightness[] = ["tight", "average", "leaky", "very_leaky"];

// House-coupling constant: the garage-to-house door and interface leakage add this many BTU/h per degF of
// (tHouse - tGarage), independent of the exterior-envelope calc (§18 assumption #2).
export const HOUSE_COUPLING_UA = 40;

// Attic ventilation rate assumed above a vented-attic ceiling assembly, ACH of the attic volume (§18 #3).
export const ATTIC_VENT_ACH = 3;
export const ATTIC_ROOF_DECK_U = 0.5;

// Sizing margin applied to the design load to get the recommended capacity (§4.7).
export const SIZING_MARGIN = 1.1;

// Infiltration formula constant: Q_inf = 0.018 x V x ACH x dT (BTU/h, V in ft3) (§4.6).
export const INFILTRATION_K = 0.018;

// BTU/h per watt (§9.1).
export const BTU_PER_W = 3.412;

// Output sanity guard (§2.2): design load / floor area outside 5-150 BTU/h.ft2 is implausible; above 90 shows
// the "check inputs" banner.
export const SANITY_MIN_BTUH_PER_FT2 = 5;
export const SANITY_MAX_BTUH_PER_FT2 = 150;
export const SANITY_WARN_BTUH_PER_FT2 = 90;
