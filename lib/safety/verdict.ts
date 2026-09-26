import type { Condition, HeaterKind, Situation, Verdict } from "./types.ts";
import { circuitFor } from "../planner/electrical.ts";

// Can I Run It? verdict engine (BLUEPRINT.md §2.8, planner-engineering.md's safety appendix). Pure, no I/O.
// Every branch returns >= 2 conditions -- a bare GO with no conditions reads as a professional, unconditional
// assurance, and every real recommendation here rests on at least a listing check and a use condition
// (enforced by verdict.test.ts, not by a runtime assertion, since this stays a pure function with no throw
// path for a well-typed Situation).

// Approximate enclosed volumes for the IFGC 621.5 "extra check" (rule 19) -- the same three preset boxes used
// throughout the planner fixtures (12x22x8, 24x24x9, 36x24x9).
const PRESET_VOLUME_FT3: Record<Situation["preset"], number> = {
  "1car": 12 * 22 * 8,
  "2car": 24 * 24 * 9,
  "3car": 36 * 24 * 9,
};

function isYes(v: Situation["flammablesStored"] | Situation["ulListed"]): boolean {
  return v === "yes" || v === "unknown"; // "Don't know" is treated as "yes" (§2.8)
}

const CO_CONDITION: Condition = {
  text: "Put a UL 2034 CO alarm in the house, by the garage door and outside each sleeping area. While this heater runs, use a low-level CO monitor in the garage rated for its temperature range.",
  cite: "IRC R315",
  edition: "IRC 2021",
  ev: "R",
  severity: "must",
};

const UL_CONDITION: Condition = {
  text: "Use only a heater carrying a UL, CSA or ETL listing mark for this use -- an unlisted or unmarked heater hasn't been tested for it.",
  cite: "Manufacturer manual",
  ev: "S",
  severity: "must",
};

function flammablesCondition(citeUl1278: boolean): Condition {
  return {
    text: citeUl1278
      ? "Move gasoline, paint and solvents out of the garage first -- every UL 1278 electric heater we list prohibits use where they're stored."
      : "Move gasoline, paint and solvents out of the garage before running it -- the manual prohibits use where they're stored.",
    cite: "Manufacturer manual",
    ev: "S",
    severity: "must",
  };
}

function unventedAggregateNoGo(s: Situation): Verdict | null {
  const btuh = s.heaterBtuh ?? (s.heaterKw ? s.heaterKw * 3412 : undefined);
  if (btuh == null) return null;
  const volume = PRESET_VOLUME_FT3[s.preset];
  if (btuh / volume <= 20) return null;
  return noGo(
    [
      {
        text: `This heater's ${Math.round(btuh).toLocaleString()} BTU/h input is more than 20 BTU/h per ft³ of this garage's volume (${volume.toLocaleString()} ft³) -- too much unvented combustion for the space.`,
        cite: "IFGC 621.5",
        edition: "IFGC 2021",
        ev: "C", // borrowed: 621.5 governs installed room heaters, not a portable unvented heater
        severity: "must",
      },
      { text: "Use a smaller unvented unit, or switch to a vented or electric class sized for this garage.", cite: "BayHeat", ev: "C", severity: "must" },
    ],
    ["e240", "vented_gas", "minisplit"],
    ["Too much unvented combustion input for this garage's volume."],
  );
}

function isMassachusetts(s: Situation): boolean {
  return s.state === "MA";
}
function isNycZip3(zip3?: string): boolean {
  if (!zip3 || zip3.length !== 3) return false;
  const n = Number(zip3);
  if (!Number.isFinite(n)) return false;
  return (n >= 100 && n <= 104) || (n >= 111 && n <= 114) || n === 116;
}

function go(conditions: Condition[], saferAlternatives: HeaterKind[], reasons: string[]): Verdict {
  return { verdict: "GO", stamp: "GO · PER MANUAL", conditions, saferAlternatives, reasons };
}
function onlyIf(conditions: Condition[], saferAlternatives: HeaterKind[], reasons: string[]): Verdict {
  return { verdict: "GO_IF", stamp: "ONLY IF", conditions, saferAlternatives, reasons };
}
function noGo(conditions: Condition[], saferAlternatives: HeaterKind[], reasons: string[]): Verdict {
  return { verdict: "NO_GO", stamp: "NO-GO", conditions, saferAlternatives, reasons };
}

function buddyVerdict(s: Situation): Verdict {
  if (isYes(s.flammablesStored)) {
    // Rule 3: the manual's own prohibition -- no NFPA 58 citation, since it was never verified.
    return noGo(
      [
        { text: "The manual prohibits use where gasoline, paint or other flammable liquids are stored or used -- move them out first.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "This is a hard stop for this heater class, not a condition you can satisfy later while they're still in the garage.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "minisplit"],
      ["Flammables stored where this heater would run."],
    );
  }
  if (s.cylinder === "20lb" && s.cylinderStoredWhere !== "outdoors") {
    // Rule 20: a refillable cylinder stored or used in any garage, attached or detached.
    return noGo(
      [
        { text: "The manual says never bring a refillable (20-lb or larger) cylinder indoors, and never store one in a building, garage or other enclosed area.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "A 20-lb cylinder can only feed this heater from outdoors, on the maker's hose and fuel filter -- otherwise switch to 1-lb disposable cylinders.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      ],
      ["e240", "vented_gas"],
      ["A refillable cylinder can't be stored or used inside a garage."],
    );
  }
  if (s.attached) {
    // Rule 1 generalized: Buddy-type propane is never a safe recommendation for an attached garage (CO can
    // migrate through the shared wall into the house), overnight or not.
    return noGo(
      [
        { text: "An attached garage shares air paths with the house -- carbon monoxide from an unvented heater can migrate indoors even while you're awake.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Use this heater in a detached garage only, or switch to a vented or electric class for an attached one.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas", "minisplit"],
      ["Unvented propane heaters aren't a safe recommendation for an attached garage."],
    );
  }
  if (s.unattended) {
    // "Never while sleeping" / "spot heat only while attended" -- the manual's residential scope.
    return noGo(
      [
        { text: "The manual's scope is spot heat while attended only -- never while sleeping, and unplug or shut it off when you leave.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "For unattended or overnight heat, use a hardwired, thermostat-controlled heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "minisplit"],
      ["This heater's manual doesn't cover unattended or overnight use."],
    );
  }
  const aggregateNoGo = unventedAggregateNoGo(s);
  if (aggregateNoGo) return aggregateNoGo;
  // Rule 2: detached + attended + no flammables + cylinder OK -> ONLY IF, exactly 5 conditions.
  return onlyIf(
    [
      { text: "Spot heat only while attended -- unplug it when you leave, and never run it while sleeping.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      { text: "1-lb disposable cylinders, or a 20-lb cylinder kept outdoors and fed through the maker's hose and fuel filter -- never a 20-lb cylinder stored or used inside the garage.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      { text: "An 18 in² fresh-air opening (a cracked window or vent) the whole time it runs.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      { text: "The manual's own clearances (rev L1): top 30 in, front 24 in, sides 6 in -- and no gasoline or other fuel-burning appliance in the space.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      CO_CONDITION,
    ],
    ["e240", "minisplit"],
    ["Detached, attended, ventilated, and nothing flammable stored here -- safe within the manual's own limits."],
  );
}

function torpedoVerdict(): Verdict {
  // Rule 4: always NO-GO, regardless of situation -- "BayHeat rule, stricter than some manuals."
  return noGo(
    [
      { text: "Never run a forced-air \"torpedo\" (open-flame) heater in an enclosed garage -- this is a BayHeat rule, stricter than some manufacturer manuals.", cite: "BayHeat", ev: "C", severity: "must" },
      { text: "Use a listed hardwired electric heater, a vented gas unit heater, or a mini-split instead.", cite: "BayHeat", ev: "C", severity: "must" },
    ],
    ["e240", "vented_gas", "minisplit"],
    ["Open-flame forced-air heaters are excluded for any enclosed garage, full stop."],
  );
}

function keroseneVerdict(s: Situation): Verdict {
  if (s.ulListed !== "yes") {
    // Rule 22: no UL/CSA/ETL mark -> NO-GO for any combustion heater.
    return noGo(
      [UL_CONDITION, { text: "An unmarked kerosene heater has no tested tip-over or oxygen-depletion shutoff -- don't run it indoors.", cite: "BayHeat", ev: "C", severity: "must" }],
      ["e240", "minisplit"],
      ["No UL, CSA or ETL listing on the heater."],
    );
  }
  if (isMassachusetts(s)) {
    // Rule 23.
    return noGo(
      [
        { text: "Massachusetts bans unvented liquid-fired space heaters outright, wherever you'd run it.", cite: "M.G.L. c.148 §25B", ev: "R", severity: "must" },
        { text: "Use a vented gas unit heater, an electric heater, or a mini-split instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas", "minisplit"],
      ["Massachusetts bans this heater class statewide."],
    );
  }
  if (isNycZip3(s.zip3)) {
    // Rule 24.
    return noGo(
      [
        { text: "New York City prohibits kerosene heaters (and portable propane heaters) within the five boroughs.", cite: "FDNY rules", ev: "R", severity: "must" },
        { text: "Use a vented gas unit heater, an electric heater, or a mini-split instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas", "minisplit"],
      ["FDNY prohibits this heater class in NYC."],
    );
  }
  if (s.attached && s.livingAbove) {
    // Rule 5.
    return noGo(
      [
        { text: "Living space above an attached garage means combustion byproducts and moisture from this heater are one floor from someone sleeping.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Use a vented gas unit heater, an electric heater, or a mini-split instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas", "minisplit"],
      ["Living space above rules out an unvented heater here."],
    );
  }
  if (s.attached) {
    return noGo(
      [
        { text: "An attached garage shares air paths with the house -- combustion byproducts from an unvented kerosene heater can migrate indoors.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Use this heater in a detached garage only, or switch to a vented or electric class for an attached one.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas", "minisplit"],
      ["Unvented kerosene heaters aren't a safe recommendation for an attached garage."],
    );
  }
  if (s.unattended) {
    return noGo(
      [
        { text: "Kerosene convection heaters are for attended use only -- never run one while sleeping or after you've left.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "For unattended or overnight heat, use a hardwired, thermostat-controlled heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "minisplit"],
      ["Unattended or overnight use isn't within this heater's manual scope."],
    );
  }
  const aggregateNoGo = unventedAggregateNoGo(s);
  if (aggregateNoGo) return aggregateNoGo;
  const conditions: Condition[] = [
    { text: "1-K kerosene only, never gasoline or any other fuel -- refuel outdoors, only once the heater has cooled.", cite: "Manufacturer manual", ev: "S", severity: "must" },
    { text: "A fresh-air opening (at least 18 in²) the whole time it runs.", cite: "Manufacturer manual", ev: "S", severity: "must" },
    CO_CONDITION,
  ];
  if (isYes(s.flammablesStored)) conditions.push(flammablesCondition(false));
  // Rule 6: detached + attended + ventilation + no flammables -> ONLY IF.
  return onlyIf(conditions, ["e240", "minisplit"], ["Detached and attended -- safe within the manual's own limits."]);
}

function dieselVerdict(s: Situation): Verdict {
  if (s.exhaustOutdoors !== true) {
    // Rule 7.
    return noGo(
      [
        { text: "Diesel exhaust must be routed outdoors through the maker's own thimble kit -- never run it with the exhaust indoors.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "Have the exhaust routed outdoors before running it again, or switch to an electric or vented-gas heater.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas"],
      ["Exhaust isn't routed outdoors."],
    );
  }
  if (s.attached) {
    // Rule 9.
    return noGo(
      [
        { text: "This class carries no UL/CSA listing for building heat -- BayHeat doesn't recommend a permanent install of an unlisted diesel heater in an attached garage.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Use it in a detached garage only, or switch to a listed electric or vented-gas heater for an attached one.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas"],
      ["Unlisted diesel heaters aren't a safe permanent install for an attached garage."],
    );
  }
  if (s.unattended) {
    return noGo(
      [
        { text: "Never run it while sleeping or after you've left -- refuel outdoors only, once it's cooled.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "For unattended or overnight heat, use a listed hardwired electric or vented-gas heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "vented_gas"],
      ["Unattended or overnight use isn't within this heater's scope."],
    );
  }
  // Rule 8: detached + exhaust and intake outdoors -> ONLY IF, 5 conditions.
  return onlyIf(
    [
      { text: "Tell your insurer and code office before a permanent install.", cite: "IRC M1302.1", edition: "IRC 2021", ev: "R", severity: "must" },
      { text: "Exhaust passes through the maker's metal wall thimble, at the maker's clearance to combustibles.", cite: "Manufacturer manual", ev: "S", severity: "must" },
      { text: "The exhaust ends at least 4 ft from, and at least 1 ft above, any door, operable window or air inlet, and stays above the snow line.", cite: "IFGC 503.8", edition: "IFGC 2021 (borrowed -- written for a different appliance class)", ev: "C", severity: "must" },
      CO_CONDITION,
      { text: "Never run it while sleeping, and fill the tank outdoors.", cite: "Manufacturer manual", ev: "S", severity: "must" },
    ],
    ["e240", "vented_gas"],
    ["Detached, exhaust and intake both outdoors -- safe within the manual's own limits."],
  );
}

function ventedGasVerdict(s: Situation): Verdict {
  if (s.cylinder) {
    // Rule 16's fuel qualifier: propane cylinders alone don't run a vented unit heater.
    return noGo(
      [
        { text: "A vented gas unit heater needs a piped natural gas line or a bulk propane tank -- small cylinders alone can't feed it.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Have a licensed gas fitter connect it to natural gas or a bulk propane tank, or choose an electric class instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "minisplit"],
      ["No natural gas line or bulk propane tank -- cylinders alone don't qualify."],
    );
  }
  // Rules 16 & 17: attached (with qualifying fuel) or a solvent/sawdust shop -- both are ONLY IF, separated
  // combustion, licensed install.
  return onlyIf(
    [
      { text: "Installed and permitted by a licensed gas fitter -- this isn't a DIY connection.", cite: "BayHeat", ev: "C", severity: "must" },
      { text: "Burner at least 18 in above the garage floor, and at least 6 ft up or guarded against vehicle impact.", cite: "IFGC 305.3 / 305.5", edition: "IFGC 2021", ev: "R", severity: "must" },
      CO_CONDITION,
    ],
    [],
    ["Licensed install, correct clearances, and CO protection -- safe within code."],
  );
}

function minisplitVerdict(): Verdict {
  // Rule 18: always GO -- no combustion, no CO risk.
  return go(
    [
      { text: "Sized and installed by a licensed HVAC contractor -- refrigerant work needs EPA Section 608 certification.", cite: "40 CFR Part 82", ev: "R", severity: "must" },
      { text: "Check the manufacturer's low-ambient heating capacity curve against your design temperature -- the nameplate BTU rating is measured at 47°F, not at your coldest night.", cite: "Manufacturer manual", ev: "S", severity: "should" },
    ],
    [],
    ["No combustion, no CO risk -- a licensed install is the only real condition."],
  );
}

const CIRCUIT_BREAKER_A: Record<NonNullable<Situation["circuit"]>, number | null> = {
  "120V15A_shared": 15,
  "120V20A_dedicated": 20,
  extension_cord: null,
  "240V20A": 20,
  "240V30A": 30,
};
const CIRCUIT_VOLTS: Record<NonNullable<Situation["circuit"]>, 120 | 240> = {
  "120V15A_shared": 120,
  "120V20A_dedicated": 120,
  extension_cord: 120,
  "240V20A": 240,
  "240V30A": 240,
};

function wattsFor(s: Situation, fallback: number): number {
  if (s.heaterKw != null) return s.heaterKw * 1000;
  if (s.heaterBtuh != null) return s.heaterBtuh / 3.412;
  return fallback;
}

function baselineElectricConditions(breakerA: number, wireNM: string): Condition[] {
  return [
    { text: `Breaker and wire match this heater's nameplate: at least a ${breakerA} A breaker on ${wireNM} copper (or heavier).`, cite: "NEC 424.4(B)", edition: "NEC 2023", ev: "R", severity: "must" },
    { text: "Plugged straight into a properly grounded outlet rated for this heater -- no plug adapters, no extension cords.", cite: "NEC 250", edition: "NEC 2023", ev: "R", severity: "must" },
  ];
}

function electricVerdict(h: "e120" | "e240", s: Situation): Verdict {
  if (s.circuit === "extension_cord") {
    // Rule 11.
    return noGo(
      [
        { text: "Extension cords aren't rated for a continuous heater load and are a fire hazard -- plug the heater straight into a wall outlet.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "Have an electrician install a dedicated wall circuit sized for this heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240"],
      ["Extension cords don't fit this heater's manual."],
    );
  }
  if (s.plugAdapterInUse) {
    // Rule 14c.
    return noGo(
      [
        { text: "A plug adapter (for example, a 14-50-to-6-30 dryer-outlet adapter) changes what the receptacle is rated for -- neither the heater nor the outlet is listed for that use.", cite: "BayHeat", ev: "C", severity: "must" },
        { text: "Have an electrician install the correct dedicated receptacle for this heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240"],
      ["A plug adapter is in use on this circuit."],
    );
  }
  if ((s.circuit === "240V20A" || s.circuit === "240V30A") && s.outletGrounded === false) {
    // Rule 14d.
    return noGo(
      [
        { text: "An ungrounded outlet (for example, an old 3-prong NEMA 10-30 dryer outlet) has no equipment ground -- it isn't a safe circuit for a fixed space heater.", cite: "NEC 250", edition: "NEC 2023", ev: "R", severity: "must" },
        { text: "Have an electrician install a grounded 4-wire circuit sized for this heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240"],
      ["The outlet has no equipment ground."],
    );
  }
  if (h === "e120" && s.unattended && s.manualAllowsUnattendedThermostat !== true) {
    // Rule 21.
    return noGo(
      [
        { text: "Cord-and-plug portable heaters are for attended use only, unless the maker's own manual allows an unattended thermostat -- unplug it when you leave.", cite: "Manufacturer manual", ev: "S", severity: "must" },
        { text: "A hardwired, thermostat-controlled heater is built for unattended or continuous use instead.", cite: "BayHeat", ev: "C", severity: "must" },
      ],
      ["e240", "minisplit"],
      ["No verified fact allows this portable heater to run unattended."],
    );
  }

  const watts = wattsFor(s, h === "e120" ? 1500 : 5000);

  if (s.circuit === "120V15A_shared") {
    const amps = watts / 120;
    const conditions: Condition[] = [];
    if (amps > 12) {
      // Rule 10.
      conditions.push({
        text: `A ${Math.round(watts).toLocaleString()} W heater draws ${amps.toFixed(1)} A, above the 12 A limit NEC 210.23(A)(1) sets for one cord-and-plug appliance on a 15 A circuit. Listed heaters are built for these outlets, so: nothing else on that breaker, plug it straight into the wall, and stop if the plug or outlet feels hot.`,
        cite: "NEC 210.23(A)(1)",
        edition: "NEC 2023",
        ev: "R",
        severity: "must",
      });
    } else {
      conditions.push({ text: "Nothing else on that breaker while it runs, and plug it straight into the wall -- a shared 15 A circuit has little headroom.", cite: "NEC 210.23(A)(1)", edition: "NEC 2023", ev: "R", severity: "must" });
    }
    conditions.push(UL_CONDITION);
    if (isYes(s.flammablesStored)) conditions.push(flammablesCondition(true));
    return onlyIf(conditions, ["e240"], ["A shared 15 A circuit works with a listed heater and nothing else on that breaker; a dedicated 20 A circuit is the code-clean option."]);
  }

  if (s.circuit === "120V20A_dedicated") {
    const amps = watts / 120;
    if (amps > 16) {
      return noGo(
        [
          { text: `A ${Math.round(watts).toLocaleString()} W heater draws ${amps.toFixed(1)} A, above the 16 A limit (80% of a 20 A breaker) for one cord-and-plug appliance.`, cite: "NEC 210.23(A)(1)", edition: "NEC 2023", ev: "R", severity: "must" },
          { text: "Have an electrician install a larger dedicated circuit, or choose a smaller heater for this one.", cite: "BayHeat", ev: "C", severity: "must" },
        ],
        ["e240"],
        ["This heater draws more current than a 20 A dedicated circuit allows for a plug-in appliance."],
      );
    }
    const conditions: Condition[] = [
      { text: "Nothing else needed on this circuit -- it's dedicated to this outlet.", cite: "NEC 210.11(C)(4)", edition: "NEC 2023", ev: "R", severity: "must" },
      { text: "Plugged straight into the outlet -- no adapters, no extension cords.", cite: "Manufacturer manual", ev: "S", severity: "must" },
    ];
    if (s.ulListed !== "yes") conditions.push(UL_CONDITION);
    if (isYes(s.flammablesStored)) {
      // Rule 12b.
      conditions.push(flammablesCondition(true));
      return onlyIf(conditions, [], ["A dedicated 20 A circuit is fine -- move the flammables out first."]);
    }
    if (s.ulListed !== "yes") {
      // Rule 22, electric branch.
      return onlyIf(conditions, [], ["A dedicated 20 A circuit is fine, but the heater's listing couldn't be confirmed."]);
    }
    // Rule 12.
    return go(conditions, [], ["A dedicated 20 A circuit, a listed heater, and nothing flammable stored here."]);
  }

  if (s.circuit === "240V20A" || s.circuit === "240V30A") {
    const declaredBreaker = CIRCUIT_BREAKER_A[s.circuit]!;
    const req = circuitFor(watts, CIRCUIT_VOLTS[s.circuit], CIRCUIT_VOLTS[s.circuit]);
    if (req.breakerA > declaredBreaker) {
      // Rule 13.
      return noGo(
        [
          { text: `This heater needs at least a ${req.breakerA} A breaker on ${req.wireNM} copper (NEC 424.4(B), 125% of its continuous load) -- a ${declaredBreaker} A circuit is undersized.`, cite: "NEC 424.4(B)", edition: "NEC 2023", ev: "R", severity: "must" },
          { text: "Have an electrician install a correctly sized circuit for this heater instead.", cite: "BayHeat", ev: "C", severity: "must" },
        ],
        ["e240"],
        [`This circuit's breaker is undersized for the heater's actual draw.`],
      );
    }
    const conditions = baselineElectricConditions(req.breakerA, req.wireNM);
    if (isYes(s.flammablesStored)) {
      // Rules 14b / 15.
      conditions.push(flammablesCondition(true));
      return onlyIf(conditions, [], ["Fits the circuit -- move the flammables out first."]);
    }
    if (s.ulListed !== "yes") {
      conditions.push(UL_CONDITION);
      return onlyIf(conditions, [], ["Fits the circuit, but the heater's listing couldn't be confirmed."]);
    }
    // Rule 14.
    return go(conditions, [], [`Fits a ${declaredBreaker} A circuit with no other issues.`]);
  }

  // Circuit unknown or unspecified.
  return onlyIf(
    [
      { text: "Tell us the circuit (120 V shared, 120 V dedicated, or 240 V) for a specific verdict -- until then, have an electrician confirm the breaker and wire size before you plug in.", cite: "NEC 424.4(B)", edition: "NEC 2023", ev: "R", severity: "must" },
      UL_CONDITION,
    ],
    ["e240"],
    ["The circuit isn't known yet."],
  );
}

export function verdictFor(h: HeaterKind, s: Situation): Verdict {
  switch (h) {
    case "buddy":
      return buddyVerdict(s);
    case "torpedo":
      return torpedoVerdict();
    case "kerosene":
      return keroseneVerdict(s);
    case "diesel":
      return dieselVerdict(s);
    case "vented_gas":
      return ventedGasVerdict(s);
    case "minisplit":
      return minisplitVerdict();
    case "e120":
    case "e240":
      return electricVerdict(h, s);
  }
}
