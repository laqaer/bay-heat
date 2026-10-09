import type { Circuit, CircuitSpec, HeaterClass, HeaterClassId } from "./types.ts";
import { circuitFor, circuitSpecForNameplate } from "./electrical.ts";

export const CIRCUIT_VOLTS: Record<Circuit, 120 | 240> = { "120V15A": 120, "120V20A": 120, "240V20A": 240, "240V30A": 240, "240V40A": 240, "240V50A": 240, "240V60A": 240 };
export const CIRCUIT_AMPS: Record<Circuit, number> = { "120V15A": 15, "120V20A": 20, "240V20A": 20, "240V30A": 30, "240V40A": 40, "240V50A": 50, "240V60A": 60 };

// The electric classes that plug into an existing 120 V outlet instead of being wired in.
export const PLUG_IN_CLASSES: readonly HeaterClassId[] = ["e_port_1500", "e_ir_wall_1500"];

export const PLUG_IN_NOTE =
  "Plug-in: nothing else on that circuit while it runs, plugged straight into the wall. A dedicated 20 A circuit is the code-clean option (NEC 210.23(A)(1)).";
export const HEAT_PUMP_NOTE = "Class nameplate circuit: use the breaker size (MOCP) on your unit's nameplate.";

// One circuit requirement per heater class. Eligibility (rankSystems), the recommendation cards, "Power it" and every
// page that names a class's circuit read this, so they can't disagree (Codex review on #26: the catalog string drove
// eligibility while a circuit computed from wattage was shown to readers).
// - Hardwired resistance: NEC 424.4(B), 125% of the class's top wattage (4 kW -> 25 A, 6 kW infrared -> 35 A).
// - Plug-in 1,500 W: BayHeat's Can I Run It? rule (lib/safety/verdict.ts): a listed heater may run on a 15 A circuit
//   only with nothing else on it; that condition rides along as the spec's note.
// - Heat pumps and fuel-fired heaters: the class's nameplate circuit. A heat pump draws about output / COP, and a gas
//   unit's circuit feeds only its blower and controls, so neither is sized from BTU output.
export function classCircuit(cls: HeaterClass): CircuitSpec | undefined {
  if (!cls.circuit) return undefined;
  const volts = CIRCUIT_VOLTS[cls.circuit];
  if (cls.energy === "electric" && typeof cls.eta === "number") {
    const spec = circuitFor(cls.outputBtuh[1] / cls.eta / 3.412, volts, volts);
    if (!PLUG_IN_CLASSES.includes(cls.id)) return spec;
    return { ...spec, minAmps: spec.amps, breakerA: 15, wireNM: "14 AWG", wireTHHN: "14 AWG", gfciReceptacle: true, notes: [PLUG_IN_NOTE] };
  }
  return circuitSpecForNameplate(cls.circuit, cls.energy === "electric" ? HEAT_PUMP_NOTE : undefined);
}

// Whether the reader's circuit can carry a class's requirement as it stands: same voltage, breaker at least as big.
export function circuitCovers(user: Circuit, spec: CircuitSpec): boolean {
  return CIRCUIT_VOLTS[user] === spec.volts && CIRCUIT_AMPS[user] >= spec.breakerA;
}

// "240 V / 30 A", for a spec or for one of the reader's circuits.
export function circuitLabel(c: Circuit | { volts: number; breakerA: number }): string {
  return typeof c === "string" ? `${CIRCUIT_VOLTS[c]} V / ${CIRCUIT_AMPS[c]} A` : `${c.volts} V / ${c.breakerA} A`;
}
