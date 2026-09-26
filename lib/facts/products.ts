import type { Fact } from "../types/evidence.ts";
type AnyFact = Fact<number | string>;

// Nameplate and manual facts for the 5 Amazon-verified heaters (current-site-audit.md §2.1, checked
// 2026-09-25). These are the ONLY facts that may set a Product.asin in lib/commerce/products/core.ts
// VERIFIED_ASINS -- commerce.test.ts checks that every asin there has a matching fact set here.
export const FACTS: AnyFact[] = [
  // Comfort Zone CZ220 (ASIN B009F1SWH8) -- 240V ceiling, switch III/II/I
  { id: "cz220.watts.high", value: 5000, unit: "W", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.watts.mid", value: 4000, unit: "W", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.watts.low", value: 3000, unit: "W", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.amps.high", value: 20.9, unit: "A", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.btuh.high", value: 17060, unit: "BTU/h", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.breaker", value: "30 A or larger", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.wire", value: "10 AWG copper only, 75°C", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.throw_ft", value: 18, unit: "ft", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified", note: "manual says approximate" },
  { id: "cz220.weight_lb", value: "25-30", unit: "lb", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.clearance_wall_in", value: 8, unit: "in", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.clearance_floor_ft", value: 6, unit: "ft", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz220.max_ceiling_ft", value: 8, unit: "ft", ev: "S", sourceId: "cz220-manual", checked: "2026-09-25", status: "verified" },
  {
    id: "cz220.no_flammables",
    value: "Not for hazardous locations. Do not use where gasoline, paint, or flammable liquids are used or stored.",
    ev: "S",
    sourceId: "cz220-manual",
    checked: "2026-09-25",
    status: "verified",
  },
  // Fahrenheat FUH54 / FUH54C (ASIN B00PX0T37I)
  { id: "fuh54.watts.high", value: 5000, unit: "W", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.amps.high", value: 20.9, unit: "A", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.btuh.high", value: 17065, unit: "BTU/h", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.fuse_max", value: 30, unit: "A", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.wire", value: "10 AWG Cu minimum, no aluminum", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.watts_208v", value: 3755, unit: "W", ev: "C", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified", note: "(208/240)^2 x 5000" },
  { id: "fuh54.clearance_floor_ft", value: 6, unit: "ft", ev: "S", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified" },
  { id: "fuh54.price_class", value: "$300-1,000 street price Sept 2026 ($468-500 typical)", ev: "E", sourceId: "fuh54-manual", checked: "2026-09-25", status: "verified", note: "audit E1: not under $200" },
  // Dr. Infrared DR-975 (ASIN B01M8KXXAB)
  { id: "dr975.watts", value: 7500, unit: "W", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.btuh", value: 25597, unit: "BTU/h", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.breaker", value: "40 A individual branch circuit only", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.wire", value: "8 AWG copper", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.clearance_floor_ft", value: 6, unit: "ft", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.clearance_side_ft", value: 1, unit: "ft", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified" },
  { id: "dr975.clearance_back_in", value: 4.5, unit: "in", ev: "S", sourceId: "dr975-manual", checked: "2026-09-25", status: "verified", note: "corrects the 1 ft back-wall figure on the old site (audit E2)" },
  // Heat Storm HS-1500-TT (ASIN B07JQPCFJ3)
  { id: "hs1500tt.watts", value: 1500, unit: "W", ev: "S", sourceId: "hs1500tt-manual", checked: "2026-09-25", status: "verified" },
  { id: "hs1500tt.mount_height_in_us", value: 72, unit: "in", ev: "S", sourceId: "hs1500tt-manual", checked: "2026-09-25", status: "verified" },
  { id: "hs1500tt.clearance_side_in", value: 18, unit: "in", ev: "S", sourceId: "hs1500tt-manual", checked: "2026-09-25", status: "verified" },
  { id: "hs1500tt.clearance_top_in", value: 24, unit: "in", ev: "S", sourceId: "hs1500tt-manual", checked: "2026-09-25", status: "verified" },
  // Comfort Zone CZ798 (ASIN B004VVJANC)
  { id: "cz798.watts", value: 1500, unit: "W", ev: "S", sourceId: "cz798-manual", checked: "2026-09-25", status: "verified" },
  { id: "cz798.amps", value: 12.5, unit: "A", ev: "C", sourceId: "cz798-manual", checked: "2026-09-25", status: "verified", note: "1500W / 120V" },
];
