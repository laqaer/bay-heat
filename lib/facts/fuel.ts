import type { Fact, Source } from "../types/evidence.ts";

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

export const FACTS: Fact[] = [
  // Rating table, manual p.2.
  { id: "bigmaxx.mhu50.input_btuh", value: 50000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 BTU input" },
  { id: "bigmaxx.mhu50.output_btuh", value: 40000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 BTU output, 80% efficiency" },
  { id: "bigmaxx.mhu80.input_btuh", value: 80000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU80 BTU input" },
  { id: "bigmaxx.mhu80.output_btuh", value: 64000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU80 BTU output" },
  { id: "bigmaxx.mhu125.input_btuh", value: 125000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU125 BTU input" },
  { id: "bigmaxx.mhu125.output_btuh", value: 100000, unit: "BTU/h", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU125 BTU output" },
  { id: "bigmaxx.mhu50.volts", value: 120, unit: "V", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: 120 V, 60 Hz, single phase" },
  { id: "bigmaxx.mhu50.amps", value: 2.3, unit: "A", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.2 rating table: MHU50 2.3 A" },

  // Residential garage mounting height, manual p.4 (Requirements, CSA in the USA).
  { id: "bigmaxx.min_height_ft", value: 8, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.4: in a residential garage the bottom of the heater is no less than 8 ft above the floor" },

  // Vent connector and clearances, manual p.4-7.
  { id: "bigmaxx.vent_diameter_in", value: 4, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.5 (vertical) and p.7 (horizontal residential): 4 in vent connector" },
  { id: "bigmaxx.vent_single_wall_clearance_in", value: 6, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6: clearance to combustible material for single-wall vent, except where a listed clearance thimble is used" },
  { id: "bigmaxx.vent_horizontal_min_ft", value: 5, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section E.3: horizontal residential vent minimum length (section C gives 3 ft; the stricter residential figure is used)" },
  { id: "bigmaxx.vent_horizontal_max_ft", value: 25, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section E.3: horizontal residential vent maximum length, plus one 90-degree elbow" },
  { id: "bigmaxx.vent_term_opening_ft", value: 4, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.4: horizontal termination at least 4 ft from any door, window, gravity air inlet, gas or electric meter, regulator or relief equipment (U.S.)" },
  { id: "bigmaxx.vent_term_grade_in", value: 12, unit: "in", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.6, section C.2: horizontal termination at least 12 in above grade level and maximum snow height" },
  { id: "bigmaxx.vent_term_forced_air_ft", value: 10, unit: "ft", ev: "S", sourceId: MANUAL, checked: CHECKED, status: "verified", note: "Manual p.7, section C.7: horizontal termination at least 10 ft from any forced-air inlet" },
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
