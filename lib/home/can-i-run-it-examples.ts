import type { Situation, Verdict } from "@/lib/safety/types";
import { verdictFor } from "@/lib/safety/verdict";

// Three real, live verdictFor() calls for the home "03 / CAN I RUN IT?" section (BLUEPRINT.md §4.9 #3).
// Each Situation is fully specified (no field left at a permissive default) -- the same discipline
// lib/safety/verdict.test.ts uses -- so the verdict shown is exactly what the tool itself would say.
const FULLY_SPECIFIED: Situation = {
  attached: false,
  flammablesStored: "no",
  livingAbove: false,
  unattended: false,
  freshAir: true,
  circuit: undefined,
  plugAdapterInUse: false,
  outletGrounded: true,
  heaterKw: undefined,
  heaterBtuh: undefined,
  ulListed: "yes",
  cylinder: undefined,
  cylinderStoredWhere: undefined,
  exhaustOutdoors: true,
  coAlarmHouse: true,
  coMonitorGarageRated: true,
  preset: "2car",
  zip3: "606",
  state: "IL",
  manualAllowsUnattendedThermostat: undefined,
};

export type HomeCanIRunItExample = { question: string; verdict: Verdict };

export const HOME_CAN_I_RUN_IT_EXAMPLES: HomeCanIRunItExample[] = [
  {
    question: "Big Buddy propane heater, attached garage, running overnight?",
    verdict: verdictFor("buddy", { ...FULLY_SPECIFIED, attached: true, unattended: true, cylinder: "1lb" }),
  },
  {
    question: "5 kW electric heater, a spare 240 V/30 A circuit, no gasoline stored?",
    verdict: verdictFor("e240", {
      ...FULLY_SPECIFIED,
      circuit: "240V30A",
      heaterKw: 5,
      outletGrounded: true,
      plugAdapterInUse: false,
      flammablesStored: "no",
      ulListed: "yes",
    }),
  },
  {
    question: "Diesel air heater, exhaust routed outdoors, CO alarm in the house?",
    verdict: verdictFor("diesel", { ...FULLY_SPECIFIED, attached: false, exhaustOutdoors: true, unattended: false }),
  },
];
