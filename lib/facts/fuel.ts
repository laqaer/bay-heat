import type { Fact, Source } from "../types/evidence.ts";
type AnyFact = Fact<number | string>;

// Lane (W11: fuel and hubs). Shared fuel-physics constants (heat contents, efficiencies) live in
// lib/facts/fuels.ts (plural, W0/frozen) -- this file is for diesel/propane/NG product-specific facts
// (e.g. a specific diesel heater's exhaust-kit spec, a Big Maxx's vent clearance).
//
// Mr. Heater Big Maxx MHU50 / MHU80 / MHU125 (the "bigmaxx.*" ids): every figure below was read from the English
// pages (1-22) of the maker's operating instructions and owner's manual, source "big-maxx-manual" (lib/facts/
// sources.ts), on 2026-10-09. `note` names the manual page and section so a reviewer can find the sentence. The
// manual's CSA-in-USA wording is used throughout; Canadian clearances differ and are not carried here.
const MANUAL = "big-maxx-manual";
const CHECKED = "2026-10-09";

export const FACTS: AnyFact[] = [
  // Rating table, manual p.2.
  { id: "bigmaxx.mhu50.input_btuh", value: 50000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 BTU input" },
  { id: "bigmaxx.mhu50.output_btuh", value: 40000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 BTU output, 80% efficiency" },
  { id: "bigmaxx.mhu80.input_btuh", value: 80000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU80 BTU input" },
  { id: "bigmaxx.mhu80.output_btuh", value: 64000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU80 BTU output" },
  { id: "bigmaxx.mhu125.input_btuh", value: 125000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU125 BTU input" },
  { id: "bigmaxx.mhu125.output_btuh", value: 100000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU125 BTU output" },
  { id: "bigmaxx.efficiency", value: 80, unit: "%", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: Efficiency % is 80% for MHU50, MHU80 and MHU125" },
  { id: "bigmaxx.mhu50.volts", value: 120, unit: "V", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: 120 V, 60 Hz, single phase" },
  { id: "bigmaxx.mhu50.amps", value: 2.3, unit: "A", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 2.3 A" },

  // Cabinet height, manual p.3 (Unit dimensions, back view). Dimension A is the cabinet's vertical dimension and the
  // hanging brackets add a 1 in (25 mm) strip above it, so the unit's stack above the "bottom of the heater" line is
  // A + 1 in. (Table 1's 1 in top clearance is not added on top; the page checks that counting it as extra changes no answer.)
  { id: "bigmaxx.mhu50.height_in", value: 12, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.3, back view: dimension A, the cabinet height, is 12 in (305 mm) for the MHU50" },
  { id: "bigmaxx.mhu80.height_in", value: 17, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.3, back view: dimension A, the cabinet height, is 17 in (432 mm) for the MHU80" },
  { id: "bigmaxx.mhu125.height_in", value: 24.67, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.3, back view: dimension A, the cabinet height, is 24.67 in (626.8 mm) for the MHU125" },
  { id: "bigmaxx.bracket_strip_in", value: 1, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.3, back view: the hanging brackets sit in a 1 in (25 mm) strip above the cabinet" },

  // Residential garage mounting height, manual p.4 (Requirements, CSA in the USA).
  { id: "bigmaxx.min_height_ft", value: 8, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.4: in a residential garage the bottom of the heater is no less than 8 ft above the floor" },

  // Vent connector and clearances, manual p.4-7.
  { id: "bigmaxx.vent_diameter_in", value: 4, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.5 (vertical) and p.7 (horizontal residential): 4 in vent connector" },
  { id: "bigmaxx.vent_single_wall_clearance_in", value: 6, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6: clearance to combustible material for single-wall vent, except where a listed clearance thimble is used" },
  { id: "bigmaxx.vent_horizontal_min_ft", value: 5, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section E.3: horizontal residential vent minimum length is 5 ft. Section C (p.6) and the notes under Figures 3 and 5 say 3 ft; a 5 ft run meets both" },
  { id: "bigmaxx.vent_horizontal_min_general_ft", value: 3, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6 section C ('The minimum horizontal vent length is 3 feet') and the notes under Figures 3 (p.7) and 5 (p.8): minimum horizontal length 3 ft, not including the cap" },
  { id: "bigmaxx.vent_horizontal_max_ft", value: 25, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section E.3: horizontal residential vent maximum length, plus one 90-degree elbow. Table 2 (p.6), which the notes under Figures 3 and 5 refer to, allows more elbows at shorter runs" },
  { id: "bigmaxx.vent_table2_max_elbows", value: 5, unit: "elbows", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, Table 2, maximum horizontal vent lengths: 1 elbow 25 ft, 2 elbows 20 ft, 3 elbows 15 ft, 4 elbows 10 ft, 5 elbows 5 ft; the vent connector may not exceed 30 ft" },
  { id: "bigmaxx.vent_single_wall_insulate_ft", value: 5, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section B.4: single-wall vent longer than 5 ft including elbows, or used in an unheated area, must be insulated along its entire length" },
  { id: "bigmaxx.vent_insulation_in", value: 0.5, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section B.4: minimum 1/2 in thick foil-faced fiberglass insulation, 1-1/2 lb density" },
  { id: "bigmaxx.vent_term_opening_ft", value: 4, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.4: horizontal termination at least 4 ft from any door, window, gravity air inlet, gas or electric meter, regulator or relief equipment (U.S.)" },
  { id: "bigmaxx.vent_term_grade_in", value: 12, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.2: horizontal termination at least 12 in above grade level and maximum snow height" },
  { id: "bigmaxx.vent_term_forced_air_ft", value: 10, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section C.7: horizontal termination at least 10 ft from any forced-air inlet" },
  { id: "bigmaxx.vent_term_soffit_ft", value: 4, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.5: horizontal termination at least 4 ft below or 4 ft horizontally from any soffit vent or under-eave vent" },
  { id: "bigmaxx.vent_term_inside_corner_ft", value: 6, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.6: horizontal vent at least 6 ft from an inside corner formed by two exterior walls (10 ft if possible)" },
  { id: "bigmaxx.clearance_top_sides_in", value: 1, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.4, Table 1: clearance to combustibles, top and sides" },
  { id: "bigmaxx.clearance_rear_in", value: 18, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.4, Table 1: clearance to combustibles, rear" },
  { id: "bigmaxx.clearance_access_in", value: 18, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.4, Table 1: clearance at the service access panel" },

  // Thermostat, manual p.9 and p.13 (wiring diagram).
  { id: "bigmaxx.thermostat_volts", value: 24, unit: "V", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.13: thermostat terminals are 24 VAC (R, W, G, C); max load 20 VA at 24 V, Class 2. Line power must never go to the thermostat terminal strip (p.9, p.13)" },
  { id: "bigmaxx.thermostat_wire_awg", value: 18, unit: "AWG", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.13: 18 AWG wire is recommended for the thermostat" },

  // Natural gas supply, manual p.10, p.12, p.17 (Table 6).
  { id: "bigmaxx.ng_line_pressure_inwc", value: 7, unit: "in. w.c.", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.10: a line pressure of 7 in. w.c. for natural gas should be maintained when sizing the piping" },
  { id: "bigmaxx.ng_inlet_min_inwc", value: 5, unit: "in. w.c.", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.17, Table 6: natural gas inlet pressure minimum" },
  { id: "bigmaxx.ng_inlet_max_inwc", value: 14, unit: "in. w.c.", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.17, Table 6: natural gas inlet pressure maximum" },
  { id: "bigmaxx.full_input_altitude_ft", value: 2000, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.12: full input up to 2,000 ft above sea level; above that, manifold pressure must be adjusted on some units" },
];
export const SOURCES: Record<string, Source> = {};
