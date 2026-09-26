import type { Band, ClimateStation, GarageInput } from "./types.ts";
import { heatLossDesign, type ResolvedEnvelope } from "./heatLoss.ts";
import { stationById } from "./stations.ts";
import {
  MID_WALL_TYPE, MID_CEILING_INS, MID_DOOR_TYPE, MID_TIGHTNESS,
  WALL_TYPE_LOW, WALL_TYPE_HIGH, CEILING_INS_LOW, CEILING_INS_HIGH, DOOR_TYPE_LOW, DOOR_TYPE_HIGH,
  tightnessLow, tightnessHigh,
} from "./defaults.ts";

// The design temperature for sizing (planner-engineering.md §4.7): the station's 99% design dry-bulb, or
// h99+5degF when the usage is daytime-only sessions rather than continuous/overnight heating. An explicit
// override always wins.
export function designTempFor(input: GarageInput, station: ClimateStation): number {
  if (input.designTempOverride != null) return input.designTempOverride;
  return input.usage.mode === "sessions" ? station.h99 + 5 : station.h99;
}

type UnknownField = "walls" | "ceiling" | "door" | "tightness";

// band(): widens the point estimate into a low/high range by evaluating heatLossDesign() only at the corners
// of whichever fields are ACTUALLY still 'unknown' on this input (not the full 4-field cross product) --
// per types.ts's SIGNATURE comment, this never calls the full plan(). A field the user already answered stays
// fixed at their value in every corner; only genuine remaining uncertainty widens the band.
export function band(input: GarageInput): Band {
  const station = stationById(input.stationId);
  if (!station) return { low: 0, mid: 0, high: 0, unknowns: 0 };
  const tOut = designTempFor(input, station);

  const doorUnknown = input.garageDoors.some((d) => d.type === "unknown");
  const unknownFields: UnknownField[] = [];
  if (input.wallType === "unknown") unknownFields.push("walls");
  if (input.ceilingIns === "unknown") unknownFields.push("ceiling");
  if (doorUnknown) unknownFields.push("door");
  if (input.tightness === "unknown") unknownFields.push("tightness");

  function envelopeFor(pick: (f: UnknownField) => "low" | "high"): ResolvedEnvelope {
    const wallLowHigh = pick("walls") === "low" ? WALL_TYPE_LOW : WALL_TYPE_HIGH;
    const ceilingLowHigh = pick("ceiling") === "low" ? CEILING_INS_LOW : CEILING_INS_HIGH;
    const doorLowHigh = pick("door") === "low" ? DOOR_TYPE_LOW : DOOR_TYPE_HIGH;
    const tightnessMid = input.tightness === "unknown" ? MID_TIGHTNESS : input.tightness;
    const tightnessLowHigh = pick("tightness") === "low" ? tightnessLow(tightnessMid) : tightnessHigh(tightnessMid);
    return {
      wallType: input.wallType === "unknown" ? wallLowHigh : input.wallType,
      ceilingIns: input.ceilingIns === "unknown" ? ceilingLowHigh : input.ceilingIns,
      doorTypes: input.garageDoors.map((d) => (d.type === "unknown" ? doorLowHigh : d.type)),
      tightness: input.tightness === "unknown" ? tightnessLowHigh : input.tightness,
    };
  }

  const midEnvelope: ResolvedEnvelope = {
    wallType: input.wallType === "unknown" ? MID_WALL_TYPE : input.wallType,
    ceilingIns: input.ceilingIns === "unknown" ? MID_CEILING_INS : input.ceilingIns,
    doorTypes: input.garageDoors.map((d) => (d.type === "unknown" ? MID_DOOR_TYPE : d.type)),
    tightness: input.tightness === "unknown" ? MID_TIGHTNESS : input.tightness,
  };
  const mid = heatLossDesign(input, midEnvelope, tOut, station.elevFt).qSize;

  if (unknownFields.length === 0) {
    return { low: mid, mid, high: mid, unknowns: 0 };
  }

  // Every corner of the unknown fields (low/high each): the field's "least loss" pick isn't necessarily what
  // minimizes qSize once combined with the others, so we search all corners rather than assume monotonicity.
  const nCorners = 1 << unknownFields.length;
  let low = Infinity;
  let high = -Infinity;
  for (let mask = 0; mask < nCorners; mask++) {
    const pick = (f: UnknownField): "low" | "high" => {
      const idx = unknownFields.indexOf(f);
      if (idx === -1) return "low"; // fixed field; envelopeFor ignores this since it isn't 'unknown' on input
      return (mask >> idx) & 1 ? "high" : "low";
    };
    const q = heatLossDesign(input, envelopeFor(pick), tOut, station.elevFt).qSize;
    if (q < low) low = q;
    if (q > high) high = q;
  }

  // Which single field, if resolved (fixed at its mid value) while the others stay at their worst corners,
  // narrows the band the most -- the "answer this one thing" UI hint.
  let narrowBy: UnknownField | undefined;
  let narrowToPct: number | undefined;
  const fullSpread = high - low || 1;
  for (const field of unknownFields) {
    let lo2 = Infinity;
    let hi2 = -Infinity;
    for (let mask = 0; mask < nCorners; mask++) {
      const pick = (f: UnknownField): "low" | "high" => {
        if (f === field) return "low"; // pretend this one is answered (fixed at its mid, both corners equal)
        const idx = unknownFields.indexOf(f);
        return (mask >> idx) & 1 ? "high" : "low";
      };
      // Force the resolved field to its mid value on both sides by overriding envelopeFor's low/high with mid
      // for that one axis: build a custom envelope directly instead of reusing envelopeFor's low/high pick.
      const envelope: ResolvedEnvelope = {
        wallType: field === "walls" ? MID_WALL_TYPE : input.wallType === "unknown" ? (pick("walls") === "low" ? WALL_TYPE_LOW : WALL_TYPE_HIGH) : input.wallType,
        ceilingIns: field === "ceiling" ? MID_CEILING_INS : input.ceilingIns === "unknown" ? (pick("ceiling") === "low" ? CEILING_INS_LOW : CEILING_INS_HIGH) : input.ceilingIns,
        doorTypes: input.garageDoors.map((d) => (field === "door" ? MID_DOOR_TYPE : d.type === "unknown" ? (pick("door") === "low" ? DOOR_TYPE_LOW : DOOR_TYPE_HIGH) : d.type)),
        tightness: field === "tightness" ? MID_TIGHTNESS : input.tightness === "unknown" ? (pick("tightness") === "low" ? tightnessLow() : tightnessHigh()) : input.tightness,
      };
      const q = heatLossDesign(input, envelope, tOut, station.elevFt).qSize;
      if (q < lo2) lo2 = q;
      if (q > hi2) hi2 = q;
    }
    const spread2 = hi2 - lo2;
    const pct = Math.round((spread2 / fullSpread) * 100);
    if (narrowToPct === undefined || pct < narrowToPct) {
      narrowBy = field;
      narrowToPct = pct;
    }
  }

  return { low, mid, high, unknowns: unknownFields.length, narrowBy, narrowToPct };
}
