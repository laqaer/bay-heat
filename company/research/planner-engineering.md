# Garage Climate Planner: engineering spec (heat load, cooling load, operating cost, equipment and circuit)

Status: implementation-ready spec, v1.0 (2026-09-25). Owner: planner build team. Audience: build team (TypeScript), content team, and the agent team that runs the company.
Reference implementation used to produce every number in this document: `scratchpad/ref/planner.py` + `examples.py` (Python mirror of the functions below). The TS port must reproduce the §17 test vectors within ±1%.

Every constant carries a provenance tag:
- **[V]**: verified this session from a primary source (URL in §19).
- **[D]**: derived here from primary data with the arithmetic shown.
- **[A]**: an engineering assumption or placeholder that we chose. Each one is listed in §18. Recalibrate from user feedback.

---

## 0. What the planner answers, and why this approach wins

Competitors are pickhvac, acdirect's blog, "10 W/ft²" calculators and Reddit threads. None of them does all of the following, and we do:
1. **Per-surface load** at the user's ASHRAE 2021 99% design temperature. It covers the attached vs detached common wall, the attic buffer, slab edge, infiltration adjusted for altitude, and door-open events.
2. **Warm-up time.** A 1-minute simulation that includes the cold slab answers "how long until my garage hits 55°F with a 5 kW heater?". This is the #1 real-world complaint and nobody answers it.
3. **Seasonal and per-session cost** for every fuel, using state prices from EIA. HDD is computed at *any* balance-point base from ASHRAE monthly statistics. We do not use a fixed HDD65.
4. **Heat pump realism.** Capacity and COP are derated for every daily temperature bin, so unmet load is shown explicitly.
5. **Circuit truth.** NEC 125% continuous-load sizing, breaker, copper gauge, GFCI rule, and 208 V derate.
6. **Insulate-first ROI.** Each measure gets its ΔBTU/h, $/yr and payback. This is where most of the affiliate money is: door kits, seals, insulation.
7. **Cooling (RLF method) plus dehumidification**, for the summer counter-season: garage AC 12,100/mo searches, peak 33k in July.

Headline finding from the worked example (§6): a 24×24 attached 2-car in Chicago with R-13 walls, an uninsulated steel door and an uninsulated ceiling needs **≈31,700 BTU/h (9.3 kW)** to hold 55°F at design. Three cheap measures totalling ≈$675 (R-30 blown ceiling, EPS door kit, weatherstrip) cut that to **≈13,000 BTU/h (3.8 kW)**. That lets one $170 5 kW / 240 V / 30 A ceiling heater do the job instead of a 10 kW heater on a 60 A circuit. When the garage is heated continuously, the measures pay back in about 0.4 years on electric resistance and 1.6 years on natural gas.

---

## 1. Module layout (pure TypeScript functions)

```
lib/planner/
  constants.ts      // U-values, ACH classes, fuel heat contents, efficiencies, NEC tables (§4, §5, §9, §11)
  climate.ts        // STATIONS dataset (Appendix B), hddAtBase(), cddAtBase(), nearestStation()
  prices.ts         // PRICES by state (Appendix C), costPerMMBtu()
  geometry.ts       // presets + deriveGeometry()
  heatLoss.ts       // heatLossDesign(), uaBreakdown(), freeFloatTemp()
  warmup.ts         // simulateSession()
  seasonal.ts       // seasonalContinuous(), seasonalSessions(), heatPumpAt()
  cooling.ts        // coolingLoadRLF(), dehumidifierPints()
  electrical.ts     // circuitFor(), breakerAndWire(), voltageDerate()
  catalog.ts        // HEATER_CLASSES, COOLING_CLASSES
  recommend.ts      // rankSystems()
  roi.ts            // insulateFirst()
  plan.ts           // plan(input): PlannerResult   (orchestrator)
```

Rules: no I/O inside the functions and no `Date.now()`. Every function is deterministic and returns plain objects. Units are IP throughout (°F, ft, BTU/h). kW appears only at display time (`kW = BTU/h ÷ 3412`).

Key signatures:

```ts
export function deriveGeometry(g: GarageInput): Geometry
export function heatLossDesign(g: GarageInput, tIn: number, tOut: number, site: Site): HeatLoss   // line items + total
export function hddAtBase(st: ClimateStation, tBase: number): number                              // annual °F-day
export function simulateSession(p: SessionParams): SessionResult                                  // minutes to target, BTU used
export function seasonalContinuous(st, uaOut, tBal, system: SystemPerf): SeasonalResult
export function coolingLoadRLF(g, st, opts): CoolingLoad
export function circuitFor(watts: number, volts: 120|208|240): CircuitSpec
export function rankSystems(load: PlannerLoads, constraints: UserConstraints): RankedSystem[]
export function insulateFirst(g, st, prices, usage): RoiRow[]
```

---

## 2. Inputs, defaults and validation

### 2.1 Garage presets [A] (user can override every field)

| Preset | W × D (ft) | Floor ft² | Ceiling H (ft) | Garage doors (W×H ft) | Windows ft² | Service door ft² | Volume ft³ |
|---|---|---|---|---|---|---|---|
| 1-car | 12 × 22 | 264 | 8 | 1 × (9×7) | 0 | 20 (36"×80") | 2,112 |
| 2-car | 24 × 24 | 576 | 9 | 1 × (16×7) | 12 | 20 | 5,184 |
| 3-car | 32 × 24 | 768 | 10 | (16×7) + (9×7) | 24 | 20 | 7,680 |
| 4-car | 40 × 26 | 1,040 | 10 | 2 × (16×7) | 24 | 20 | 10,400 |

Other choices: door height 8 ft (truck/RV option). Tandem 2-car 12×40, flagged "custom". The "W" side is the door wall. Roof: gable spanning W, pitch 6/12 default. Common sizes for context: 2-car garages run 20×20 to 24×24; 3-car 30–36 × 22–26.

**Attached garage** (default for the "attached" answer): the side wall along depth D adjoins the house. That wall does not face outdoors and has no exterior slab edge. The garage→house door is part of the house coupling (§4.3).

### 2.2 Input schema (validation ranges; reject outside, warn inside the "soft" band)

| Field | Unit | Hard range | Default | Notes |
|---|---|---|---|---|
| width, depth | ft | 8–80 | preset | warn if > 60 ("shop building; results still valid") |
| height (wall/ceiling) | ft | 7–24 | preset | warn > 14 (stratification §4.9) |
| roofPitch | x/12 | 0–12 | 6 | used for attic volume and roof area |
| attached | bool | – | true | |
| commonWallLen | ft | 0–width+depth | depth if attached | |
| wallType | enum §5.1 | – | `R13` | |
| ceilingType | `attic` \| `open_rafters` \| `conditioned_above` | – | `attic` | "bonus room above" = conditioned_above |
| ceilingIns | enum §5.2 | – | `drywall_uninsulated` | |
| garageDoors[] | {w,h,type} | w 6–24, h 6–16, 0–6 doors | preset | type enum §5.3 |
| windows ft², type | ft² | 0–400 | preset | |
| serviceDoor ft², type | ft² | 0–80 | 20, `hollow_wood` | |
| slabEdge | enum §5.5 | – | `none` | |
| tightness | enum §5.6 | – | suggested (§5.6.1) | |
| tHouse | °F | 55–80 | 68 heating / 75 cooling | |
| targetTemp | °F | 35–75 heat; 65–90 cool | preset §3.4 | |
| designTempOverride | °F | −50 to 70 | station h99 | |
| sessions/week | – | 0–21 | 2 | |
| hours/session | h | 0.5–24 | 4 | |
| season months | set | – | months with mean < target − 5°F | |
| doorOpenings/session | – | 0–30 | 2 | each ~1 min (§4.8) |
| availableCircuit | enum §11 | – | `120V15A` | |
| fuelsAvailable | set | – | {electric} | NG, propane bulk, propane cylinder, diesel, kerosene |
| budgetUpfront | $ | 0–20,000 | none | |
| prices | per unit | elec 0.05–0.70 $/kWh; NG 0.40–6 $/therm; propane 1–40 $/gal; diesel 2–12 $/gal | state table (Appendix C) | |
| elevation | ft | −300–11,000 | station elev | |

Output sanity guard: design load / floor area must be 5–150 BTU/h·ft². Values above 90 get the banner "check inputs: this looks like an open or very leaky building".

---

## 3. Climate data

### 3.1 Source and coverage [V]
ASHRAE 2021 Climatic Design Conditions, pulled from ashrae-meteo.info v3.0 (`POST request_meteo_parametres.php`, `wmo=<id>&ashrae_version=2021&si_ip=IP`). The pull covers **113 airport stations: at least one representative city for all 50 states + DC, plus second, colder or climatically different cities for big states.** Each station carries:
- `h996`, `h99`: 99.6% and 99% heating dry-bulb, in °F
- `c1`, `c1mcwb`: 1% cooling dry-bulb and mean coincident wet-bulb
- `dr`: hottest-month daily range
- `hr1`: 1% dehumidification humidity ratio, grains/lb
- `hdd50` / `hdd65`, `cdd65`: ASHRAE's published degree-day values (base 10 °C = 50 °F, base 18.3 °C = 65 °F; IP values are °F-days)
- `tMean[12]`, `tSd[12]`: monthly mean of daily-average temperature and its standard deviation. **This is the key to HDD at any base.**

Appendix A has the human-readable table. Appendix B has the TS dataset.

**Design basis [A]:** use the **99% heating dry-bulb** (`h99`) for sizing, per ACCA Manual J and residential practice. `h996` is shown as "extreme-cold check". For "keep above freezing" (pipes, paint, batteries), recommend sizing to `h996` because failure there is costly.

Daytime-only workshops: the 99% value includes night hours. Offer "daytime use" sizing at `h99 + 5°F` [A]. Label it "may not hold temperature on the coldest nights".

### 3.2 HDD/CDD at any base: the formula [V method, D validation]
Daily mean temperatures within a month are modeled as Normal(Tm, σ). Expected degree-days for month m (n days):

```
z   = (Tb − Tm) / σ
HDD_m(Tb) = n · σ · [ z·Φ(z) + φ(z) ]
CDD_m(Tb) = n · σ · [ φ(z) − z·(1 − Φ(z)) ]
φ(z) = exp(−z²/2)/√(2π);  Φ(z) = 0.5·(1 + erf(z/√2))
```
(TS has no `Math.erf`. Use Abramowitz–Stegun 7.1.26, |error| < 1.5e-7.)

Validation against ASHRAE's published values (annual HDD50 / HDD65):

| Station | Computed HDD50 | ASHRAE HDD50 | Computed HDD65 | ASHRAE HDD65 |
|---|---|---|---|---|
| Chicago O'Hare | 2,965 | 2,961 | 6,143 | 6,157 |
| Minneapolis | 4,070 | 4,064 | 7,389 | 7,396 |
| Atlanta | 630 | 648 | 2,583 | 2,578 |
| Phoenix | 25 | 27 | 863 | 874 |

Error is ≤ 3% everywhere tested. The logistic Schoenau–Kehrig variant under-predicted by 5–90% in warm climates, so we use the Normal-distribution form above.

### 3.3 Climate zone
Show the ASHRAE station zone label (ASHRAE 169-2020 basis) and fall back to the IECC 2021 county zone where the station label is blank or implausible (marked `*` in Appendix A). The zone is **display and insulation advice only** and never enters the math. Some station labels are one zone warmer than the IECC 2021 county map because the underlying data period is newer (St. Louis station 3A vs county 4A). UI copy: "Your code official's zone may differ by one."

### 3.4 Target temperature presets

| Preset | Heating target | Cooling target | Use |
|---|---|---|---|
| Keep above freezing | 40°F | – | pipes, paint, water, batteries; continuous; size to `h996` |
| Storage / take the edge off | 45°F | 85°F | |
| Workshop | 55°F | 78°F | default |
| Gym | 60°F | 72°F | high internal gains, see §10.4 |
| Comfort / hobby room | 65°F | 75°F | treat as near-conditioned space; recommend insulation first |

---

## 4. Heating design load method

All terms are in BTU/h. ΔT = T_in − T_out,design.

### 4.1 Geometry
```
A_floor      = W·D
L_ext        = 2W + 2D − L_common                    (exterior perimeter)
A_gdoor      = Σ w_i·h_i
A_wall,net   = L_ext·H − A_gdoor − A_window − A_serviceDoor
rise         = (W/2)·pitch/12                         (gable spans W)
pitchFactor  = √(1 + (pitch/12)²)                     (6/12 → 1.118)
V            = A_floor·H  (+ A_floor·rise/2 when ceilingType = open_rafters)
```

### 4.2 Conduction through exterior surfaces
```
q_wall     = U_wall · A_wall,net · ΔT
q_gdoor    = Σ U_gdoor,i · A_i · ΔT
q_window   = U_win · A_win · ΔT
q_svcdoor  = U_door · A_svc · ΔT
```

### 4.3 Surfaces adjoining the house (attached garage)
```
UA_house = U_commonWall · L_common · H  +  40  [A: garage→house door + interface air leakage, BTU/h·°F]
q_house  = UA_house · (T_in − T_house)            (negative = heat gain from house)
```
When `ceilingType = conditioned_above` (bonus room): `q_ceiling = U_ceilingIns · A_floor · (T_in − T_house)` and there is no attic buffer.

### 4.4 Ceiling under a vented attic: series with attic-to-outdoor [D]
Attic temperature is solved, not assumed:
```
UA_c    = U_ceilingIns · A_floor
V_attic = A_floor · rise/2
UA_ao   = U_roofDeck · A_floor · pitchFactor + 0.018·f_alt·V_attic·ACH_attic      (ACH_attic = 3.0 [A], U_roofDeck = 0.50)
UA_ceil,eff = 1 / (1/UA_c + 1/UA_ao)
q_ceiling   = UA_ceil,eff · ΔT
T_attic     = T_out + UA_c/(UA_c+UA_ao) · ΔT     (display: "your attic sits ≈ X°F")
```
This matters. For an uninsulated drywall ceiling, the attic buffer cuts the ceiling loss by about 40% compared with naive U·A·ΔT: 9,729 vs 17,900 BTU/h in the worked example. With R-30 it changes almost nothing.

**Open rafters / no ceiling:** `q_roof = U_roof · A_floor · pitchFactor · ΔT`, with V including the rafter volume. Auto-bump tightness one class if soffit or ridge vents open into the space (§5.6.1).

### 4.5 Slab on grade: perimeter F-factor
```
q_slab = F · L_ext · ΔT          (L_ext excludes the common wall; the door opening counts as perimeter)
```
F values in §5.5. The ASHRAE ground-temperature alternative (e.g., ADP UHSG-03 Table 3: "use ground temp 60°F if design > 0°F") is **not** used. The F-factor method is the ASHRAE 90.1 / Fundamentals basis and gives consistent ROI for edge insulation.

### 4.6 Infiltration
```
f_alt   = (1 − 6.8754e-6 · elevation_ft)^5.2559      (standard atmosphere: Denver 5,414 ft → 0.822)
q_inf   = 0.018 · f_alt · V · ACH · ΔT               (0.018 = 0.075 lb/ft³ × 0.24 BTU/lb·°F)
```
The same term is sometimes written `1.08 · CFM · ΔT` with CFM = V·ACH/60.

### 4.7 Total design load and recommended capacity
```
Q_design = q_wall + q_gdoor + q_window + q_svcdoor + q_ceiling + q_slab + q_inf + q_house
Q_size   = 1.10 · Q_design          [A: 10% margin, same as ADP UHSG-03 and common unit-heater practice]
kW_size  = Q_size / 3412
```
Also report `Q_fastWarmup`, the capacity that reaches the target within `warmupGoalMin` (default 60 min) on a typical coldest-month session day (§7). This is found by bisection on capacity using `simulateSession`. When `Q_fastWarmup > Q_size`, show both numbers: "Holds 55°F at design: 3.8 kW. Gets there in under an hour on a January Saturday: 6.2 kW."

### 4.8 Door-opening losses (sessions only; not in design load) [D]
Buoyancy exchange through a large opening (ASHRAE Fundamentals ch.16 large-opening flow, C_d = 0.6):
```
Q_open,cfm = 60 · (C_d/3) · w · h · √( g · h · ΔT / T_avg,R )      g = 32.17 ft/s²; T_avg,R = (T_in+T_out)/2 + 459.67
E_open     = 0.018·f_alt · V · ΔT · (1 − exp(−Q_open,cfm·t_open,min / V))      BTU per opening
```
Example: a 16×7 door, ΔT 50°F, gives Q ≈ 6,450 cfm. Over one minute in a 5,184 ft³ garage it replaces 71% of the air, about 3,300 BTU per opening, plus the re-heating of chilled surfaces that is already captured by the slab and mass model.

### 4.9 Stratification (optional v1.1) [A]
For forced-air units with ceilings over 10 ft, raise the ceiling and upper-wall ΔT by `0.6°F/ft × (H − 6)`. Use 0.2°F/ft for radiant or destratification fans. Display only a warning in v1.

### 4.10 Unheated (free-float) garage temperature (display; also the session start state) [A]
```
UA_gnd  = 0.10 · A_floor                    [A]   T_gnd = annual mean air temp of station (≈ Σ tMean/12)
T_free  = (UA_out·(T_out + 7) + UA_house·T_house + UA_gnd·T_gnd + gains) / (UA_out + UA_house + UA_gnd)
```
The +7°F is thermal-mass damping on a design day [A]. Use `+0` when T_out is already a monthly-mean session temperature. `UA_out` = total outdoor-coupled UA from §4.2–4.6. UI: "Unheated, your garage probably sits around X°F on a design night." This is a hook: people are curious about it.

---

## 5. Constants: U-values, F-factors and air leakage

All U-values are whole-assembly values including air films, in BTU/h·ft²·°F.

### 5.1 Walls

| key | Description | U | Tag / basis |
|---|---|---|---|
| `open_studs` | exposed studs, no interior finish (siding + 7/16" OSB) | 0.48 | [D] R = 0.17+0.61+0.62+0.68 = 2.08 |
| `uninsulated_finished` | 2×4, drywall, empty cavity | 0.25 | [D] parallel path 75/25; ADP guide lists 0.23 |
| `R11` | 2×4 R-11 batt, drywall | 0.096 | [V-ish] ASHRAE 90.1 App. A wood-frame 16" o.c. (±10%) |
| `R13` | 2×4 R-13 | 0.089 | same |
| `R15` | 2×4 R-15 HD batt | 0.083 | same |
| `R19` | 2×6 R-19 (compressed) | 0.064 | same |
| `R21` | 2×6 R-21 | 0.060 | same |
| `cmu8_uninsulated` | 8" hollow block | 0.51 | [V] ADP UHSG-03 (gravel aggregate 0.52) |
| `cmu8_R10` | 8" block + R-10 rigid/furring | 0.09 | [A] |
| `metal_uninsulated` | single-skin steel building | 1.18 | [D] 1/0.85 films; ADP 1.17 |
| `metal_R10` / `metal_R13` / `metal_R19` | faced blanket compressed at girts | 0.133 / 0.113 / 0.084 | [A] ASHRAE 90.1 App. A metal-building ranges, verify |

### 5.2 Ceilings (below vented attic) and roofs

| key | U | Tag |
|---|---|---|
| `drywall_uninsulated` (ceiling) | 0.60 | [D] ½" gypsum + two heat-flow-up films |
| `R11` / `R19` / `R30` / `R38` / `R49` (attic floor) | 0.083 / 0.052 / 0.035 / 0.027 / 0.021 | [A] 90.1 App. A attic values, rounded |
| `shingle_deck_uninsulated` (roof deck, per roof area) | 0.50 | [D] ADP "framed roof uninsulated 0.48" |
| `metal_uninsulated` (roof) | 1.50 | [V] ADP UHSG-03 |
| `metal_R10` / `metal_R19` (roof) | 0.10 / 0.065 | [A] |
| `rafters_R19` / `rafters_R30` (insulated between rafters, cathedral) | 0.052 / 0.035 | [A] |

### 5.3 Garage doors: whole-door *installed* U, not the marketing "R-value" [V method; A values]
DASMA TDS-163 and TDS-196 state that the advertised R-value is a **center-of-section calculation** and is *not* the reciprocal of the tested whole-door U-factor (ANSI/DASMA 105). Joints, stiles, hardware and perimeter leak heat. The IECC's garage-door requirement is U ≤ 0.37 with air leakage ≤ 0.40 cfm/ft² for commercial doors. Clopay's commercial 2" polyurethane door tests at U = 0.16 (DASMA 105). The planner therefore uses installed U:

| key | Door | Marketing R | **Installed U used** | Tag |
|---|---|---|---|---|
| `steel_single` | single-layer steel, uninsulated | "R-0" | **1.15** | [D] films only 1/0.85 = 1.18; ADP "metal single sheet 1.20" |
| `wood_uninsulated` | raised-panel / carriage wood | ~R-1–2 | 0.60 | [V/A] ADP wood 1" 0.64, 2" 0.43 |
| `steel_eps_1_375` | 2-layer steel + 1-3/8" EPS | R-6.3–9 | 0.40 | [A] |
| `steel_eps_2` | 3-layer 2" EPS | R-9–13 | 0.33 | [A] |
| `steel_pu_1_375` | polyurethane 1-3/8" (e.g. "R-18.4") | R-12–18.4 | 0.24 | [A] |
| `steel_pu_2` | polyurethane 2" commercial-grade | R-17–20 | 0.18 | [V] Clopay Energy Series tested 0.16 |
| `kit_eps_or_batt` | retrofit EPS/fiberglass panel kit on single-layer steel | kit claims R-8 | **0.33** | [D/A] ~85% coverage at R≈6.9 (U 0.146) + 15% bare at 1.15 → 0.30; +10% gaps |
| `kit_reflective` | foil/bubble "R-8" kit | "R-8" claim | **0.50** | [D/A] bubble R≈1 + low-e interior film R≈1.70 (ε = 0.05) → covered U≈0.35; 15% bare → 0.47; degrades with dust |

UI copy rule: never show a kit's box R-value as its performance. Say: "Box says R-8. Installed on a real door, it behaves like about R-3, which still cuts that door's heat loss by roughly 70%."
Door kits do **not** fix air leakage at section joints or the perimeter. The weatherstrip measure (§5.6) is separate.

### 5.4 Windows and service doors

| key | U | SHGC (cooling) | Tag |
|---|---|---|---|
| `single_metal` | 1.20 | 0.75 | [V] ADP single glass 1.13 + frame |
| `single_wood_vinyl` | 1.00 | 0.70 | [A] |
| `double_clear` | 0.50 | 0.60 | [A] |
| `double_lowe` | 0.32 | 0.30 | [A] |
| service door `uninsulated_metal` / `hollow_wood` / `solid_wood` / `insulated` | 0.60 / 0.50 / 0.40 / 0.20 | – | [A] ASHRAE ch.15 door tables (ranges) |

Glass panels inside garage doors are covered by the door's U when ≤ 16% of door area (DASMA TDS-196 program rule) [V].

### 5.5 Slab-edge F-factor (BTU/h·ft·°F)

| key | F | Tag |
|---|---|---|
| `none` (typical garage) | 0.73 | [V-ish] ASHRAE 90.1 App. A Table A6.3 unheated slab, uninsulated |
| `R10_24in` vertical | 0.54 | same (90.1 prescriptive value) |
| `R15_24in` | 0.52 | same |
| `R20_48in` | 0.43 | [A] verify |

### 5.6 Infiltration classes (design-condition natural ACH) [V anchors, A values]
Anchors:
- NIST (Emmerich et al., NISTIR 7072): measured attached garages averaged **ACH50 = 48.4, range 20.8–106**, against houses' 9.6.
- Industry unit-heater guide ADP UHSG-03 Table 4: 0.75–1 (good insulation, little door opening) up to 2.5–4 (poor insulation, doors left open).
- Conversion used: ACH_design ≈ ACH50 / (12–20).

| class | ACH (heating design) | Typical ACH50 | Description shown to user |
|---|---|---|---|
| `tight` | 0.75 | 10–15 | drywalled and taped, insulated door with intact bottom and perimeter seals, sealed attic hatch |
| `average` | 1.5 | 20–35 | finished walls; door seals present but worn; some gaps |
| `leaky` | 2.5 | 40–70 (NIST average garage) | light visible at door edges, missing bottom seal, open studs |
| `very_leaky` | 4.0 | 80–110+ | open soffits or rafters, gaps, broken seals, big penetrations |

Cooling uses `ACH_cool = 0.5 × ACH_heat` [D]. The RLF infiltration coefficient I0 is 343 (cooling, 7.5 mph wind) vs 698 (heating, 15 mph), a ratio of about 0.5.

#### 5.6.1 Suggest a class from answers [A]
Start at `average`. Then:
- exposed studs → +1
- open rafters with vented soffits → +1
- garage-door bottom seal missing or torn → +1
- light visible at the door jambs → +1
- attic hatch without a gasket → +0.5 (rounded)
- all seals new and door insulated → −1
- clamp to [`tight`, `very_leaky`]

---

## 6. Worked example A: 24×24 attached 2-car, R-13 walls, uninsulated steel door, Chicago, 55°F target

Inputs:
- Chicago O'Hare (WMO 725300): `h99` 3.3°F, elevation 662 ft, f_alt 0.977.
- Geometry: 24×24×9 ft; one 16×7 steel single-layer door (U 1.15); 12 ft² single-pane vinyl window (U 1.00); 20 ft² hollow-core service door (U 0.50).
- Attached along a 24 ft side, with an R-13 common wall and house at 68°F.
- Drywall ceiling, **uninsulated**, under a vented 6/12 attic.
- No slab insulation; `average` tightness (1.5 ACH).
- ΔT = 55 − 3.3 = **51.7°F**.

Geometry: A_floor 576; L_ext = 96 − 24 = 72 ft; wall gross 648 → net 648 − 112 − 12 − 20 = **504 ft²**; V = **5,184 ft³**; rise 6 ft; attic volume 1,728 ft³.

| Line item | Formula | BTU/h |
|---|---|---|
| Walls (R-13) | 0.089 × 504 × 51.7 | 2,319 |
| Garage door (steel, uninsulated) | 1.15 × 112 × 51.7 | **6,659** |
| Window | 1.00 × 12 × 51.7 | 620 |
| Service door | 0.50 × 20 × 51.7 | 517 |
| Ceiling + attic in series | UA_c = 346; UA_ao = 0.50×576×1.118 + 0.018×0.977×1,728×3 = 413; UA_eff = 188.2 → ×51.7 (attic sits at ≈27°F) | **9,729** |
| Slab edge | 0.73 × 72 × 51.7 | 2,717 |
| Infiltration | 0.018 × 0.977 × 5,184 × 1.5 × 51.7 | **7,065** |
| Common wall to house | 0.089 × 216 × (55 − 68) | −250 |
| Garage→house door and leakage | 40 × (55 − 68) | −520 |
| **Q_design** | | **28,856** |
| **Q_size = ×1.10** | | **31,742 BTU/h = 9.30 kW** (55 BTU/h per ft², 16 W/ft²) |

Where the load comes from: ceiling 34%, infiltration 24%, garage door 23%. That ranking is the insulate-first sales pitch, and it is automatic.

Variants (same garage; Q_design before the ×1.10 margin):

| Variant | Q_design | Δ vs base |
|---|---|---|
| Base | 28,856 | – |
| + R-30 blown into the attic floor | 20,121 | −8,735 (−30%) |
| + EPS/batt door kit | 24,108 | −4,748 (−16%) |
| + reflective door kit | 25,092 | −3,764 (−13%) |
| weatherstrip package (average → tight) | 25,324 | −3,532 (−12%) |
| new R-18.4 polyurethane door instead of a kit | 23,587 | −5,269 (−18%) |
| **all three cheap measures** (R-30 + EPS kit + weatherstrip) | **11,841** → Q_size **13,025 BTU/h = 3.82 kW** | −59% |
| leaky instead of average | 33,566 | +4,710 |

### 6.1 Load matrix (detached; T_in = 55°F; ×1.10 margin included) [D]

| Size (W×D×H) | Envelope | UA (BTU/h·°F) | Atlanta 26.4°F | Chicago 3.3°F | Minneapolis −6.0°F | W/ft² at Chicago |
|---|---|---|---|---|---|---|
| 1-car (12×22×8) | bare | 616 | 19.2k (5.6 kW) | 34.9k (10.2 kW) | 41.1k (12.0 kW) | 38.7 |
| 1-car | basic | 312 | 9.7k (2.9 kW) | 17.7k (5.2 kW) | 20.8k (6.1 kW) | 19.6 |
| 1-car | insulated | 190 | 5.9k (1.7 kW) | 10.7k (3.1 kW) | 12.6k (3.7 kW) | 11.9 |
| 1-car | tight | 132 | 4.1k (1.2 kW) | 7.5k (2.2 kW) | 8.8k (2.6 kW) | 8.3 |
| 2-car (24×24×9) | bare | 1,204 | 37.5k (11.0 kW) | 68.0k (19.9 kW) | 80.1k (23.5 kW) | 34.6 |
| 2-car | basic | 614 | 19.1k (5.6 kW) | 34.7k (10.2 kW) | 40.8k (12.0 kW) | 17.6 |
| 2-car | insulated | 352 | 10.9k (3.2 kW) | 19.8k (5.8 kW) | 23.3k (6.8 kW) | 10.1 |
| 2-car | tight | 233 | 7.3k (2.1 kW) | 13.2k (3.9 kW) | 15.5k (4.5 kW) | 6.7 |
| 3-car (32×24×10) | bare | 1,669 | 52.0k (15.2 kW) | 94.3k (27.6 kW) | 111.0k (32.5 kW) | 36.0 |
| 3-car | basic | 864 | 26.9k (7.9 kW) | 48.8k (14.3 kW) | 57.5k (16.9 kW) | 18.6 |
| 3-car | insulated | 485 | 15.0k (4.4 kW) | 27.3k (8.0 kW) | 32.1k (9.4 kW) | 10.4 |
| 3-car | tight | 313 | 9.7k (2.9 kW) | 17.7k (5.2 kW) | 20.8k (6.1 kW) | 6.7 |
| 4-car (40×26×10) | bare | 2,183 | 67.9k (19.9 kW) | 123.2k (36.1 kW) | 145.0k (42.5 kW) | 34.7 |
| 4-car | basic | 1,124 | 35.0k (10.3 kW) | 63.5k (18.6 kW) | 74.8k (21.9 kW) | 17.9 |
| 4-car | insulated | 615 | 19.0k (5.6 kW) | 34.6k (10.1 kW) | 40.7k (11.9 kW) | 9.8 |
| 4-car | tight | 393 | 12.2k (3.6 kW) | 22.1k (6.5 kW) | 26.0k (7.6 kW) | 6.2 |

Envelope definitions:
- **bare**: open studs, open rafters, uninsulated shingle deck, steel door, single-pane metal window, leaky.
- **basic**: R-13 finished walls, uninsulated drywall ceiling, steel door, average.
- **insulated**: R-13, R-30, EPS door, double-pane, average.
- **tight**: R-21, R-38, polyurethane door, low-e, tight.

Cross-check: the site's existing brackets ("insulated 8–10 W/ft²; drafty 15–20+ W/ft²") agree with the insulated and basic rows. The "bare" row explains why cold-climate owners of shells end up with 60–80k BTU/h gas unit heaters.

---

## 7. Warm-up and session model

The question it answers: "I heat only when I'm out there. How long until it's 55°F, and what does a Saturday cost?"

### 7.1 Thermal capacitances
```
C_light = 0.018·f_alt·V                          (air)
        + 0.5 · A_finishedInterior                 (½" drywall ≈ 2.1 lb/ft² × 0.26 BTU/lb·°F; walls + ceiling if finished)
        + 1.0 · A_floor                            (shelving, tools, stored stuff) [A]
        + 480 · carsInside                         (≈4,000 lb vehicle × 0.12 BTU/lb·°F) [A]
```

### 7.2 Slab as a semi-infinite solid behind a surface film [D]
Concrete: k = 1.0 BTU/h·ft·°F, ρc ≈ 30.8 BTU/ft³·°F, effusivity `e = √(kρc) = 5.55 BTU/(ft²·°F·h^½)`. The floor film for heat flowing down is `R_film = 0.92` (ASHRAE, still air). Exposed fraction `SLAB_EXPOSED = 0.7` [A]: cars and cabinets shade the rest; use 0.5 with two cars inside.
```
q_slab(t) = SLAB_EXPOSED · A_floor · (T_air − T_slab0) / (R_film + √(π·t)/e)        t in hours since start
T_slab0   = T_free + 0.5·(T_gnd − T_free)          [A]
```

### 7.3 Simulation (1-minute explicit Euler; stable because C_light/UA ≫ 1 min)
```
T = T_start (= T_free with mass_damp 0 at the session's outdoor temp); E = 0
for each minute i < hours·60:
    t = (i+0.5)/60
    loss = UA_out·(T − T_out) + UA_house·(T − T_house) + q_slab(t) + doorOpenEvents(i)
    q = (T ≥ T_target − 0.05) ? min(Q_cap, max(0, loss)) : Q_cap          // thermostat hold
    T += (q − loss)·(1/60)/C_light;  if (q < Q_cap) T = min(T, T_target)
    E += q/60
return { minutesToTarget, energyBTU: E, tEnd: T }
```
Session outdoor temperature = monthly `tMean + 4°F` for daytime sessions or `tMean − 2°F` for evenings [A].
Energy input per fuel = E / η (§9). Heat pump: q is capped by `capacity(T_out)`, and E_input = E/COP(T_out).

### 7.4 Results: worked example, 2 sessions/week × 4 h, Nov–Mar, daytime

| Garage | Heater | Jan: start → minutes to 55°F | Jan kWh/session | Nov kWh/session | Season kWh | Season $ at IL 19.22¢ |
|---|---|---|---|---|---|---|
| A (base) | 7.5 kW | 33.4°F → 116 min | 25.6 | 10.9 | 808 | $155 |
| A (base) | 10 kW | 33.4°F → 72 min | 27.0 | 11.0 | 840 | $161 |
| B (insulated) | 4 kW | 38.1°F → 152 min | 13.9 | 5.8 | 437 | $84 |
| B (insulated) | 5 kW | 38.1°F → 108 min | 14.6 | 5.8 | 454 | $87 |

On the design day, garage B with 5 kW starts at 26°F and reaches only 51°F after 4 h, because the cold slab absorbs most of the output in the first hours.

Interpretation for UI copy:
- For **occasional use**, insulation pays back through **smaller equipment and a cheaper circuit**, not through the energy bill: $68/yr here.
- For **continuous heating** (§8), insulation pays back in months.
- The slab dominates warm-up. Radiant/infrared heaters heat people and the floor directly, so they feel warm sooner at a lower air temperature. Model comfort-equivalent air temperature as `target − 5°F` for radiant [A].

---

## 8. Seasonal energy and cost

### 8.1 Continuous heating (e.g., "keep above 40°F" or "hold 55°F all winter")
Balance point accounts for house gains and internal gains:
```
T_bal = T_target − (UA_house·(T_house − T_target) + gains_BTUh) / UA_out
Load_season (BTU) = UA_out · 24 · Σ_m HDD_m(T_bal)          (§3.2)
Input energy      = Load / η  (combustion/resistance)  or per-bin / COP(T) for heat pumps (§8.3)
```
**Adjusting the HDD base is the whole point.** A 40°F keep-from-freezing garage in Chicago sees HDD40 ≈ 1,525, not HDD65 = 6,157. Using HDD65 would overstate cost roughly 4×. Defaults: gains 0 [A]. A garage fridge adds 250 BTU/h. A water heater or furnace in the garage adds 1,000–3,000 BTU/h standby [A, user toggle].

### 8.2 Session heating
```
Season = Σ_{m ∈ season} sessionsPerWeek · (days_m/7) · simulateSession(m).E / η
```

### 8.3 Heat pumps: bin integration over daily-mean temperatures [D]
For each month, integrate over the Normal(Tm, σ) distribution of daily-mean temperature in 0.5°F bins from Tm−4σ to Tm+4σ:
```
w(T)     = φ((T−Tm)/σ)/σ · 0.5 · n_days                 (days in bin)
load(T)  = UA_out·(T_bal − T)·24·w(T)       for T < T_bal
cap(T)   = capRatio(T) · Q_rated47 · 24 · w(T)
hpOut    = min(load, cap);  input += hpOut/COP(T) + (load − hpOut)/1.0 (resistance backup or unmet)
```
Curves are relative to AHRI-rated heating capacity at 47°F, with COP at 70°F indoor. Interpolate linearly [A, anchored to V points]:

| T_out °F | standard inverter mini-split: cap / COP | cold-climate (NEEP ccASHP): cap / COP | hyper-heat class: cap / COP |
|---|---|---|---|
| 62 | 1.05 / 4.30 | 1.05 / 4.40 | 1.05 / 4.50 |
| 47 | 1.00 / 3.70 | 1.00 / 3.80 | 1.00 / 3.90 |
| 35 | 0.88 / 2.90 | 0.95 / 3.00 | 1.00 / 3.10 |
| 17 | 0.75 / 2.30 | 0.92 / 2.40 | 1.00 / 2.45 |
| 5 | 0.60 / 1.75 | 0.80 / 1.90 | 1.00 / 1.90 |
| −4 | 0.50 / 1.45 | 0.70 / 1.60 | – |
| −13 | 0 (cut-out) / – | 0.60 / 1.35 | 0.76 / 1.45 |
| −22 | 0 | 0 (cut-out below −13 unless spec says) | 0.65 / 1.25 |

Anchors:
- NEEP ccASHP spec v4.0 requires COP ≥ 1.75 at 5°F at maximum capacity, and (per spec) max capacity at 5°F ≥ 70% of rated capacity at 47°F [V].
- Mitsubishi MSZ-FS12NA/MUZ-FS12NAH (hyper-heat): rated 12,300 BTU/h at 47°F on 850 W, i.e. COP 4.24. Maximum 21,000. Mitsubishi literature claims 100% of rated capacity at 5°F (−5°F for the "H2i plus" line) and 70–81% at −13°F [V].
- Defrost losses are folded into the 17–40°F points.
- Heating at a 55°F setpoint instead of 70°F raises COP by roughly 5–10%. We do **not** credit this in v1; it stays a conservative choice [A].

Nominal "12k" means cooling capacity. Default rated heating at 47°F = 1.1 × nominal [A]; the user can override it with the nameplate. **Sizing rule for heat pumps:** choose the smallest nominal (9k/12k/18k/24k/36k) where `cap(h99) ≥ Q_design`, or where unmet load < 3% of seasonal load if the user accepts backup.

Worked example, continuous 55°F in Chicago (T_bal 53.7°F):

| Garage | Seasonal load | Resistance kWh | Heat pump | Seasonal COP | Unmet (backup) |
|---|---|---|---|---|---|
| A (base), UA_out 573 | 49.9 MMBtu | 14,617 kWh | cold-climate 24k | **2.56** | 1.8 MMBtu |
| B (insulated), UA_out 244 | 19.3 MMBtu | 5,644 kWh | cold-climate 12k | **2.60** | 0.3 MMBtu |

### 8.4 Cost per fuel for the example (continuous 55°F, Chicago, Illinois prices from Appendix C)

| System | η / COP | Garage A $/yr | Garage B $/yr |
|---|---|---|---|
| Electric resistance (any electric heater) | 1.00 | **$2,809** | $1,085 |
| Cold-climate mini-split | seasonal 2.56–2.60 | $1,100 | $418 |
| NG vented unit heater | 0.80 | $677 | $261 |
| Propane vented unit heater, bulk ($2.19/gal incl. ~8%) | 0.80 | $1,492 | $576 |
| Propane unvented radiant, bulk price | 0.92 (sensible) | $1,297 | $501 |
| Diesel air heater ($6.68/gal Midwest, 21-Sep-2026) | 0.78 | $3,109 | $1,200 |
| Keep above 40°F instead (resistance) | – | $936 | $281 |

**Finding: diesel is no longer cheap.** At September 2026 diesel ($6.53 US, $8.25 CA, $6.68 Midwest), a diesel air heater costs *more* per delivered BTU than resistance electric in most states. Break-even: `elec $/kWh ≈ diesel $/gal × 3412 / (137,381 × 0.78)` = diesel ÷ 31.4, i.e. $6.68 diesel ≈ 21.3¢/kWh electric. Content and "diesel heater for garage" SEO pages (6.6k/mo, 22–27k in Dec/Jan) should say this plainly.

---

## 9. Fuels, conversions, efficiencies and prices

### 9.1 Heat contents [V EIA]
| Energy | Value |
|---|---|
| Electricity | 1 kWh = 3,412 BTU; 1 W = 3.412 BTU/h |
| Natural gas | 1 ft³ = 1,036 BTU (EIA); 1 therm = 100,000 BTU; 1 Mcf = 10.36 therms |
| Propane | 91,452 BTU/gal (EIA). Round to 91,500 in copy. 1 lb = 21,548 BTU; 4.24 lb/gal. 20-lb tank holds 20 lb (4.7 gal) nominal; exchange tanks are usually filled to **15 lb = 3.54 gal**. 1-lb cylinder = 0.236 gal. |
| Heating oil | 138,500 BTU/gal |
| Diesel | 137,381 BTU/gal |
| Kerosene | 135,000 BTU/gal (EIA MER) |

### 9.2 Delivered-heat efficiency (η on HHV basis)

| System class | η used | Basis |
|---|---|---|
| Electric resistance (fan, ceiling, milkhouse, infrared/quartz) | 1.00 | all input becomes heat in the space |
| Heat pump | COP(T) curve §8.3 | |
| Vented gas unit heater, power-vented (Modine Hot Dawg HD, Mr. Heater Big Maxx) | 0.80 | [V] Big Maxx manual "80% efficient"; Hot Dawg "up to 83%" |
| Separated-combustion unit heater (Hot Dawg HDS) | 0.80 | [V] |
| Condensing unit heater (≈93% class) | 0.92 | [A] |
| Unvented propane/NG radiant (Buddy class) | **0.92 propane / 0.90 NG / 0.93 kerosene** sensible | [D] "99.9% efficient" is marketing. The latent heat of the water vapor stays in the air as moisture (LHV/HHV). |
| Diesel air heater (Webasto/Espar/clones) | **0.78** | [D] Webasto Air Top 2000 STC: 2.0 kW out on 0.24 L/h = 0.0634 gal/h × 137,381 = 8,710 BTU/h in → 78%. Clone "8 kW" units deliver ≈5 kW on up to 0.64 L/h (~73%). |
| Forced-air "torpedo" propane/kerosene | 1.00 sensible, but **excluded** | never recommended for enclosed occupied garages (§13) |

The brief suggested 85–90% for diesel heaters. Manufacturer fuel-rate data does not support that. Use 0.78.

### 9.3 Cost per delivered million BTU (the comparison chart)
```
$/MMBtu_delivered = price_per_unit / (BTU_per_unit × η) × 1e6
```
US examples:

| Fuel | Price | $/MMBtu delivered |
|---|---|---|
| Electric resistance | 18.19¢ | $53.3 |
| Heat pump, seasonal COP 2.5 | 18.19¢ | $21.3 |
| NG, 80% vented | $1.48/therm | $18.5 |
| Propane bulk, 80% vented | $2.67 | $36.5 |
| Propane 20-lb exchange, unvented 92% | ≈$7.00/gal [A] | **$83** |
| Propane 1-lb cylinders | ≈$25–34/gal equivalent [A] | $300+ |
| Diesel, 78% | $6.53 | $60.9 |
| Kerosene, unvented 93% | ≈ heating oil + $1.00 ≈ $6.50 [A] | $51.8 |

**UI rule:** a propane user must pick "bulk tank / 100-lb refill / 20-lb refill (≈$4/gal [A]) / 20-lb exchange (≈$7/gal [A]) / 1-lb cylinders". The price gap is 10×, and "exchange tank" users are the Buddy-heater audience.

### 9.4 Price table and refresh
Appendix C (TS constant) and §9.5 hold per-state prices:
- Electricity: EIA Electric Power Monthly Table 5.6.B, residential, YTD through July 2026 (US 18.19¢).
- Natural gas: EIA annual residential price 2025 (2024 where 2025 is NA), $/Mcf ÷ 10.36.
- Propane: EIA weekly residential **excluding taxes**, 30-Mar-2026, by state or PADD. EIA does not survey West Coast states for propane; those get US + $0.50 as a flagged placeholder.
- Heating oil: EIA 30-Mar-2026.
- Diesel: EIA on-highway retail by PADD, 21-Sep-2026.

**Agent-team job (monthly, plus weekly Oct–Mar for propane):** refresh from the EIA API v2 routes `electricity/retail-sales` (sectorid=RES, price), `natural-gas/pri/sum` (residential), `petroleum/pri/wfr` (propane & heating oil weekly; resumes 2026-10-07), `petroleum/pri/gnd` (diesel weekly). Stamp `pricesAsOf` in the UI and never hard-code a date string into copy.

### 9.5 Energy prices by state

(Generated table. The TS constant is in Appendix C.)

| State | Elec ¢/kWh (EIA YTD Jul-2026) | $/MMBtu resistance | Nat. gas $/Mcf (EIA annual) | NG $/therm | Propane $/gal bulk (EIA 30-Mar-2026, ex-tax) | Heating oil $/gal (EIA 30-Mar-2026) | Diesel $/gal (EIA 21-Sep-2026, region) |
|---|---|---|---|---|---|---|---|
| AK | 27.09 | 79.40 | 12.96 | 1.251 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| AL | 16.54 | 48.48 | 17.56 | 1.695 | 3.516 | 5.535 (US) | 6.177 (Gulf Coast) |
| AR | 13.61 | 39.89 | 19.25 | 1.858 | 2.367 | 5.535 (US) | 6.177 (Gulf Coast) |
| AZ | 15.44 | 45.25 | 18.58 | 1.793 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| CA | 33.25 | 97.45 | 22.01 | 2.125 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 8.246 (California) |
| CO | 16.72 | 49.00 | 11.17 | 1.078 | 2.302 | 5.535 (US) | 6.340 (Rocky Mountain) |
| CT | 27.97 | 81.98 | 16.83 (2024) | 1.625 | 4.116 | 5.546 | 6.517 (New England) |
| DC | 24.66 | 72.27 | 16.68 | 1.610 | 3.539 (PADD 1B) | 5.535 (US) | 6.546 (Central Atlantic) |
| DE | 17.86 | 52.34 | 15.97 | 1.542 | 3.731 | 5.913 | 6.546 (Central Atlantic) |
| FL | 15.30 | 44.84 | 25.48 | 2.459 | 4.706 | 5.535 (US) | 6.139 (Lower Atlantic) |
| GA | 15.40 | 45.13 | 20.42 | 1.971 | 3.164 | 5.535 (US) | 6.139 (Lower Atlantic) |
| HI | 46.28 | 135.64 | 52.38 | 5.056 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| IA | 14.20 | 41.62 | 10.61 | 1.024 | 1.660 | 4.224 | 6.680 (Midwest) |
| ID | 12.96 | 37.98 | 7.69 | 0.742 | 2.397 | 5.535 (US) | 6.340 (Rocky Mountain) |
| IL | 19.22 | 56.33 | 11.25 | 1.086 | 2.026 | 5.535 (US) | 6.680 (Midwest) |
| IN | 17.04 | 49.94 | 11.49 | 1.109 | 2.634 | 4.680 | 6.680 (Midwest) |
| KS | 15.21 | 44.58 | 14.81 | 1.430 | 1.977 | 5.535 (US) | 6.680 (Midwest) |
| KY | 14.27 | 41.82 | 14.23 | 1.374 | 2.936 | 4.872 | 6.680 (Midwest) |
| LA | 13.35 | 39.13 | 17.38 | 1.678 | 2.929 (PADD 3) | 5.535 (US) | 6.177 (Gulf Coast) |
| MA | 30.14 | 88.34 | 25.06 | 2.419 | 3.649 | 5.742 | 6.517 (New England) |
| MD | 21.30 | 62.43 | 16.14 (2024) | 1.558 | 3.741 | 5.276 | 6.546 (Central Atlantic) |
| ME | 29.99 | 87.90 | 18.95 (2024) | 1.829 | 3.523 | 5.371 | 6.517 (New England) |
| MI | 21.53 | 63.10 | 10.92 | 1.054 | 2.370 | 4.499 | 6.680 (Midwest) |
| MN | 16.25 | 47.63 | 10.98 | 1.060 | 2.056 | 4.245 | 6.680 (Midwest) |
| MO | 13.96 | 40.91 | 14.94 | 1.442 | 2.209 | 5.535 (US) | 6.680 (Midwest) |
| MS | 15.19 | 44.52 | 16.64 | 1.606 | 3.052 | 5.535 (US) | 6.177 (Gulf Coast) |
| MT | 13.95 | 40.89 | 8.99 | 0.868 | 2.121 | 5.535 (US) | 6.340 (Rocky Mountain) |
| NC | 14.94 | 43.79 | 16.42 (2024) | 1.585 | 3.450 | 4.998 | 6.139 (Lower Atlantic) |
| ND | 12.36 | 36.23 | 9.50 | 0.917 | 1.700 | 5.535 (US) | 6.680 (Midwest) |
| NE | 12.90 | 37.81 | 11.40 | 1.100 | 1.642 | 3.972 | 6.680 (Midwest) |
| NH | 26.79 | 78.52 | 18.61 | 1.796 | 3.780 | 5.407 | 6.517 (New England) |
| NJ | 23.98 | 70.28 | 14.21 | 1.372 | 3.821 | 5.838 | 6.546 (Central Atlantic) |
| NM | 15.08 | 44.20 | 9.83 | 0.949 | 2.929 (PADD 3) | 5.535 (US) | 6.177 (Gulf Coast) |
| NV | 13.53 | 39.65 | 13.14 | 1.268 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| NY | 29.38 | 86.11 | 17.58 | 1.697 | 3.747 | 5.874 | 6.546 (Central Atlantic) |
| OH | 18.70 | 54.81 | 13.85 | 1.337 | 2.695 | 4.726 | 6.680 (Midwest) |
| OK | 13.58 | 39.80 | 13.99 (2024) | 1.350 | 2.272 | 5.535 (US) | 6.680 (Midwest) |
| OR | 15.40 | 45.13 | 16.71 | 1.613 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| PA | 21.04 | 61.66 | 15.04 | 1.452 | 3.083 | 5.160 | 6.546 (Central Atlantic) |
| RI | 29.22 | 85.64 | 21.66 (2024) | 2.091 | 3.757 | 5.802 | 6.517 (New England) |
| SC | 15.93 | 46.69 | 16.91 (2024) | 1.632 | 3.512 (PADD 1C) | 5.535 (US) | 6.139 (Lower Atlantic) |
| SD | 14.50 | 42.50 | 9.86 | 0.952 | 1.840 | 5.535 (US) | 6.680 (Midwest) |
| TN | 13.87 | 40.65 | 11.84 | 1.143 | 3.248 | 5.535 (US) | 6.680 (Midwest) |
| TX | 16.06 | 47.07 | 19.42 | 1.875 | 2.989 | 5.535 (US) | 6.177 (Gulf Coast) |
| UT | 13.16 | 38.57 | 10.19 | 0.984 | 2.337 | 5.535 (US) | 6.340 (Rocky Mountain) |
| VA | 16.83 | 49.33 | 16.79 | 1.621 | 3.565 | 5.277 | 6.139 (Lower Atlantic) |
| VT | 23.95 | 70.19 | 18.00 | 1.737 | 3.733 | 5.558 | 6.517 (New England) |
| WA | 14.40 | 42.20 | 17.62 | 1.701 | 3.17 (US avg +$0.50, placeholder) | 5.535 (US) | 6.791 (West Coast ex-CA) |
| WI | 19.00 | 55.69 | 10.74 | 1.037 | 2.066 | 4.323 | 6.680 (Midwest) |
| WV | 15.47 | 45.34 | 13.80 | 1.332 | 3.512 (PADD 1C) | 5.535 (US) | 6.139 (Lower Atlantic) |
| WY | 13.95 | 40.89 | 11.74 | 1.133 | 2.266 (PADD 4) | 5.535 (US) | 6.340 (Rocky Mountain) |



Propane "bulk" is EIA's residential average **excluding taxes**. Small-volume customers often pay $0.50–1.00/gal more [A]. Cylinder users should use the cylinder options in §9.3.

---

## 10. Cooling load (summer counter-season)

### 10.1 Method: ASHRAE Residential Load Factor (RLF)
Sources: Barnaby & Spitler 2005 (ASHRAE RP-1199), adopted in ASHRAE Fundamentals ch.17 [V]. Design conditions:
- T_o = `c1` (1% cooling DB)
- DR = `dr` (hottest-month daily range)
- ΔT = T_o − T_in
- W_o = `hr1` (1% dehumidification humidity ratio, gr/lb)
- W_i from T_in at 50% RH, using the psychrometric formula below

**Opaque surfaces:** `q = U·A·(OF_t·ΔT + OF_b + OF_r·DR)` (IP coefficients, °F)

| Surface | OF_t | OF_b (°F) | OF_r |
|---|---|---|---|
| Ceiling below vented attic | 0.62 | 25.4·α_roof − 7.7 | −0.23 |
| Roof/ceiling assembly (open rafters, cathedral) | 1.00 | 70.2·α_roof − 12.2 | −0.42 |
| Wall, service door | 1.00 | 14.2 | −0.34 |
| **Garage door** [A extension] | 1.00 | 14.2 × orientFactor × (α_door/0.6) | −0.34 |

- α_roof defaults: 0.85 for dark or weathered asphalt, 0.75 for light shingle, 0.45 for white metal [A].
- α_door: 0.9 for dark (brown/black), 0.6 for mid/wood tone, 0.3 for white [A].
- orientFactor, derived from RLF Table 3 peak irradiance at 40°N relative to the 4-orientation mean, with a west afternoon-coincidence bump [A]: N 0.33 · NE 0.95 · E 1.30 · SE 1.05 · S 0.80 · SW 1.25 · **W 1.55** · NW 1.00.

A dark west-facing uninsulated door is the single largest summer load in most garages.

**Windows:** `q = A·[U·(ΔT − 0.49·DR) + PXI·SHGC·IAC·FF_s]`
- PXI = RLF Table 3 total irradiance E_t (W/m² × 0.317 → BTU/h·ft²), interpolated by latitude. E/W: 800–824 W/m²; S at 40°N: 482; N: 190; horizontal: 962.
- FF_s: N 0.17, NE 0.09, E 0.17, SE 0.25, S 0.45, SW 0.54, W 0.48, NW 0.34, horizontal 0.66 [V].
- IAC = 1.0 with no blinds, 0.7 with blinds [A].

**Slab:** `q = A_floor · (0.51 − 2.5·h_srf)`, h_srf = 1/(R_cover + 0.68). Bare concrete gives **−3.17 BTU/h·ft²**, i.e. the slab helps [V RLF].

**Infiltration:**
```
cfm   = V·ACH_cool/60
q_s   = 1.1·f_alt·cfm·ΔT
q_lat = 0.68·f_alt·cfm·(W_o − W_i)          (grains/lb)
W(T,RH) = 0.621945·p_w/(101.325 − p_w)·7000
p_w  = RH·0.61094·exp(17.625·Tc/(Tc+243.04)) kPa
```

**Internal gains** (sensible / latent, BTU/h, ASHRAE Fundamentals ch.18 Table 1) [V]:
- light bench work: 275 / 475
- heavy work or lifting: 580 / 870
- athletics / gym: 710 / 1,090 per person
- equipment: W × 3.412
- garage fridge: 250 [A]
- hot car just parked: +4,000 for the first hour [A]
- door-opening events: §4.8 formula with cooling ΔT; latent via Δgr

**Total:** Q_s = Σ; Q_l = infiltration latent + people latent. **Equipment size:** nominal cooling ≥ (Q_s + Q_l) × 1.0–1.15. At 105°F+ design, derate mini-split capacity 5–10% [A].

### 10.2 Worked cooling examples (same 24×24 attached garage; T_in 78°F; 1 person light work; 300 W tools; fridge)

| Case | T_o / DR | Door | Sensible | Latent | Total | Suggest |
|---|---|---|---|---|---|---|
| Dallas–Fort Worth, west-facing dark door | 99.1 / 19 | U 1.15 | 17,240 | 3,050 | **20,290** | 24k mini-split, or insulate first |
| Dallas, north-facing white door | same | U 1.15 | 13,290 | 3,050 | 16,340 | 18k |
| Phoenix, west dark | 108.5 / 21 | U 1.15 | 21,497 | 2,246 | 23,743 | 24k (derated at 108°F → consider 30k or insulate) |
| Chicago, south mid-tone | 88.5 / 18 | U 1.15 | 9,757 | 2,740 | 12,496 | 12k |
| **Dallas, upgraded** (PU door, R-30 ceiling, tight) | 99.1 / 19 | U 0.24 | 4,302 | 1,763 | **6,065** | 9k (≈$1,000 less equipment; ≈70% lower run cost) |

Dallas west-dark line items: walls 1,292; door **6,134**; window 582; service door 288; ceiling (uninsulated, attic) **7,803**; slab −1,824; infiltration 1,474; internal 1,549; common wall −58.

### 10.3 Cooling energy
```
Per-session:  Q_m = UA_c·(T_session,m − T_in) + S_design·(radavg_m / radavg_peak) + gains + q_lat,m
              where UA_c = Σ U·A·OF_t + 1.1·cfm   and   S_design = Σ U·A·(OF_b + OF_r·DR) + window solar + slab term
              T_session,m = tMean_m + DR/2 − 2   (afternoon) [A]
kWh = Q_m · hours / (SEER2 · 1000)          (SEER2 as a BTU/Wh proxy; mini-split 17–26, window AC ~ CEER 10–12, portable ≈ 8 on SACC basis)
Continuous (e.g. keep ≤ 85°F for storage/gym): kWh ≈ [UA_c·24·Σ CDD_m(T_bal,c) + (S_avg + gains)·hours_above] / (SEER2·1000),  T_bal,c = T_in − (S_avg+gains)/UA_c
```
Example (Dallas upgraded, July afternoon session): Q ≈ 142 × (95.5 − 78) + 1,772 − 1,824 + 1,549 + ≈1,500 latent ≈ **5,500 BTU/h**. At SEER2 20 that is ≈275 W, or ≈$0.13 for a 3-hour session at 16¢ [D, approximate].

**Portable AC caution:** single-hose units depressurize the garage and pull in hot air. Rate them by SACC (DOE 2017), not by the "ASHRAE BTU" box number, which is 30–40% higher. The planner divides box BTU by 1.5 when SACC is missing [A].

### 10.4 Dehumidification
- Moisture load: `lb/day = 4.5·cfm·(W_o − W_i)/7000·24 + people_latent/1,060·hours`. Pints/day ≈ lb/day ÷ 1.04.
- Dallas upgraded at design: ≈30 lb/day infiltration moisture → recommend a **50-pint (DOE 2019 test basis)** dehumidifier for humid climates. A 35-pint unit suits tight garages of 500 ft² or less.
- Target RH below 60%: rust and mold risk rises above that [A].
- A mini-split's "dry" mode handles latent only while the unit runs.
- A dehumidifier adds heat: electrical input plus 1,060 BTU per lb removed.
- **Unvented combustion heaters add water:** propane produces 0.83 gal water per gal burned (1.63 lb/lb). A Big Buddy at 18,000 BTU/h adds ≈1.4 lb/h, which condenses on cold tools and cars. Flag this whenever an unvented heater is chosen for a humid-climate or tool-heavy garage.

---

## 11. Electrical

### 11.1 Rules [V: NEC 2023 text as widely published; the electrician and local amendments govern]
- **NEC 424.4(B):** fixed electric space-heating is a **continuous load**. Branch-circuit conductors and overcurrent device are ≥ **125%** of the load. NEC 210.19(A)(1) and 210.20(A) say the same in general form.
- **Cord-and-plug heaters, NEC 210.23(A)(1):** one cord-and-plug item ≤ 80% of branch rating (12 A on 15 A; 16 A on 20 A). A 1,500 W / 120 V heater draws **12.5 A**, marginally over 12 A. It is listed for a 15 A receptacle, but it must be the only load on the circuit. A 20 A circuit gives honest headroom (this matches the existing site copy).
- **NEC 240.4(D)** small-conductor limits: 14 AWG Cu = 15 A, 12 AWG = 20 A, 10 AWG = 30 A.
- **NEC 310.16 Cu:** 8 AWG = 40 A (60°C) / 50 A (75°C); 6 AWG = 55 / 65 A; 4 AWG = 70 / 85 A.
- **NM (Romex), NEC 334.80:** use the 60°C column.
- **Standard breakers, NEC 240.6(A):** 15, 20, 25, 30, 35, 40, 45, 50, 60.
- **GFCI, NEC 210.8(A)(2), 2020 and 2023:** every **125–250 V** receptacle in a dwelling garage (single-phase, ≤150 V to ground) needs GFCI. That **includes the NEMA 6-20R/6-30R/14-30R** for a plug-in 240 V heater. Hardwired heaters are not receptacles.
- **Outdoor HVAC GFCI, NEC 2023 210.8(F):** covers outdoor outlets, including mini-split condensers. The temporary exception for listed HVAC equipment carried a sunset date of **2026-09-01**. Planner copy says "your electrician will confirm GFCI requirements for the outdoor unit under your local code edition" [A, verify local adoption].
- **Garage receptacle circuit, NEC 210.11(C)(4), 2020+:** a dedicated 20 A 120 V garage receptacle circuit is required. A 1,500 W heater plus a compressor or shop vac on it will trip it.
- **Service capacity:** adding ≥30 A of 240 V load to a **100 A** service requires an NEC 220.83 existing-dwelling load calculation. Planner warning: "Ask for a load calculation before buying a 7.5 kW+ heater on a 100 A panel."
- **Ducts, IRC R302.5.2:** never tie house HVAC ducts into the garage. Ducts in the garage must have no openings into it.

### 11.2 Circuit → what fits

| Circuit | Breaker | Min Cu conductor | Max continuous (80%) | What fits |
|---|---|---|---|---|
| 120 V / 15 A | 15 A | 14 AWG | **1,440 W** (12 A) | one 1,500 W portable as the sole load (12.5 A); nothing else |
| 120 V / 20 A | 20 A | 12 AWG | **1,920 W** (16 A) | 1,500 W heater with headroom; 115 V 9–12k DIY mini-split (per nameplate MOCP) |
| 240 V / 20 A | 20 A | 12 AWG | **3,840 W** | heaters ≤ 3.8 kW (3 kW tap); most 9–18k 230 V mini-splits |
| 240 V / 30 A | 30 A | 10 AWG (NM ok) | **5,760 W** | **4–5 kW** ceiling/wall (CZ220, FUH54); 24k mini-split |
| 240 V / 40 A | 40 A | 8 AWG (NM 60°C = 40 A) | **7,680 W** | **7.5 kW** (Dr. Infrared DR-975) |
| 240 V / 50 A | 50 A | 6 AWG NM, or 8 AWG THHN at 75°C terminations | **9,600 W** | 9 kW; two 4 kW on one feeder via sub-panel |
| 240 V / 60 A | 60 A | 6 AWG THHN (75°C, 65 A) or 4 AWG NM | **11,520 W** | **10 kW** class |

### 11.3 `circuitFor(watts, voltsSupply, voltsRated = 240)`
```
P_actual = P_rated × (V_supply/V_rated)²            (240 V heater on 208 V → ×0.751: a 5 kW unit gives 3,756 W)
I        = P_actual / V_supply
I_min    = 1.25 × I
breaker  = smallest standard size ≥ I_min           (never above the manufacturer's max OCPD)
conductor= smallest Cu gauge with ampacity ≥ breaker (NM: 60°C column; THHN in conduit with 75°C terminations: 75°C column; respect 240.4(D))
```
Test values:
- 5,000 W / 240 V: 20.8 A → 26.0 A → **30 A, 10 AWG**
- 4,000 W / 240 V: 16.7 A → 20.8 A → **25 A breaker, 10 AWG**. It is *not* a 20 A circuit, so the UI must say that 4 kW does not fit 240 V/20 A.
- 7,500 W: 31.3 → 39.1 A → **40 A, 8 AWG**
- 10,000 W: 41.7 → 52.1 A → **60 A, 6 AWG THHN / 4 AWG NM**
- 1,500 W / 120 V: 12.5 A → 15.6 A. For a *fixed* heater that means a 20 A circuit. A portable follows the 210.23 note above.
- **Heat pumps:** use nameplate MCA (wire) and MOCP (breaker), never the 125% formula. Defaults when unknown [A]: 115 V 9–12k: 20 A/12 AWG; 230 V 9–18k: 15–20 A/12–14 AWG; 24k: 25–30 A/10 AWG.
- **Gas unit heaters** need 115 V / 15 A for the inducer and fan. Diesel heaters need 12 V at ~2–8 A running, and **8–10 A for glow-plug start** with 12 V clones [A]. Use a proper PSU.

---

## 12. Heater and cooler class catalog (catalog.ts)

Amazon: only these ASINs are verified: CZ220 `B009F1SWH8`, FUH54 `B00PX0T37I`, CZ798 `B004VVJANC`, DR-975 `B01M8KXXAB`, HS-1500-TT `B07JQPCFJ3`. Everything else uses `https://www.amazon.com/s?k=<query>&tag=laqaer-20`. Prices are Sept-2026 street ranges [A]; the agent team re-checks them quarterly.

| id | Class | Output (BTU/h) | Energy / circuit | η | Venting / air | Equip $ | Install $ [A] | Fit | Hard safety notes |
|---|---|---|---|---|---|---|---|---|---|
| `e_port_1500` | 120 V milkhouse/utility fan (CZ798) | 5,118 (1.5 kW); low 2,500 | 120 V/15 A receptacle, sole load | 1.0 | – | 30–60 | 0 | spot heat, ≤ 1-car basic | UL 1278; 3 ft from combustibles; no extension cords/power strips; not near gasoline/solvent vapors; never unattended |
| `e_ir_wall_1500` | 120 V infrared/quartz wall (Heat Storm HS-1500-TT) | 5,118 | 120 V receptacle | 1.0 | – | 90–140 | 0 | bench radiant | same |
| `e_240_4k` | 240 V 4 kW (CZ220/FUH54 on 4 kW tap) | 13,648 | 240 V/25–30 A hardwired | 1.0 | – | 150–260 | 300–900 new circuit | insulated 1-car, tight 2-car | hardwire per manual; mount height/clearances per manual |
| `e_240_5k` | 240 V 5 kW ceiling fan-forced (CZ220 `B009F1SWH8`, FUH54 `B00PX0T37I`) | 17,060 | 240 V/30 A, 10 AWG | 1.0 | – | 150–260 | 300–900 | insulated 2-car (≤ 15.5k design) | same; 208 V → 3.76 kW |
| `e_240_7k5` | 240 V 7.5 kW (DR-975 `B01M8KXXAB`) | 25,590 | 240 V/40 A, 8 AWG | 1.0 | – | 350–500 | 400–1,200 | 2–3-car insulated; basic 2-car mild climate | panel load calc on 100 A service |
| `e_240_10k` | 240 V 10 kW unit heater class | 34,120 | 240 V/60 A, 6 AWG | 1.0 | – | 450–900 | 600–1,500 | 3–4-car | same |
| `e_ir_240` | 240 V quartz/tube infrared ceiling 3–6 kW | 10–20k | 240 V/20–30 A | 1.0 (radiant comfort bonus −5°F) | – | 200–600 | 300–900 | drafty, high ceiling, doors open | clearances below the element per manual |
| `hp_diy_12k_115` | DIY pre-charged mini-split 12k 115 V class | cap curve §8.3 (standard or cold-climate by model) | 120 V/20 A | COP curve | outdoor unit on exterior wall | 1,200–2,000 | 0–400 (DIY) | tight/insulated 1–2-car; also cools | A2L refrigerant (R-32/R-454B) on new units: install per manual; keep the head high, away from vehicle exhaust |
| `hp_12_24k_230` | Mini-split 12–24k 230 V (standard / cold-climate / hyper-heat) | curve | 230 V/15–30 A (nameplate) | curve | exterior pad or wall | 1,500–3,500 | pro 1,500–3,500 (total $2.5–7k installed) | any climate if sized to `cap(h99)`; best TCO for heat + cool | pro vacuum/charge unless DIY line-set |
| `g_unvented_buddy` | Portable propane radiant with ODS: Mr. Heater Buddy (4k/9k), Big Buddy (4/9/18k) | 4,000–18,000 | propane 1-lb or 20-lb (hose + filter) | 0.92 sensible | **fresh-air opening ≥ 18 in² for Big Buddy** [V manual] | 90–220 | 0 | spot heat, ≤ 450 ft² per maker, **attended use only** | ODS is not a CO alarm: require a UL 2034 CO alarm; adds moisture; unvented-heater limits apply (§13); **not** for continuous or unattended heating |
| `g_vented_unit` | Vented gas unit heater: Modine Hot Dawg HD30–HD125 (power-vented, up to 83%), HDS separated combustion (dusty shops); Mr. Heater Big Maxx MHU50/80 (and 125), 80%, 4" vent, 1" vent clearance | 30,000–125,000 input (×0.80 output) | NG or LP (kit); 115 V/15 A | 0.80 | vent to outdoors (Category I/III per model) | 500–1,500 | 1,000–3,000 (gas line + vent) | cold climates, basic/bare envelopes, 2–4-car | **burners and ignition ≥ 18 in. above floor in residential garages (IFGC 305.3 / IRC G2408.2; Big Maxx manual)**; protect from vehicle impact; licensed gas fitter; separated combustion if sawdust/solvents |
| `diesel_air` | Diesel air heater: Webasto Air Top 2000 STC 0.9–2.0 kW certified; clone "5–8 kW" (≈5 kW real) | 3,100–17,000 | diesel/kerosene tank; 12 V PSU | 0.78 | **combustion intake and exhaust outdoors**, sealed; hot-air loop indoor | clone 110–250; Webasto/Espar 1,200–2,000 | 50–300 | detached shops without power or gas | clones carry no UL/CSA listing for building heat; CO alarm mandatory; exhaust away from openings; fuel tank outside living areas; not for attached garages without CO alarm. Cost note §8.4 |
| `k_unvented` | Kerosene convection heater (10–23k) | 10–23k | K-1 kerosene | 0.93 | unvented | 150–250 | 0 | **not recommended** | same unvented rules; odor; some jurisdictions prohibit |
| `torpedo` | Forced-air propane/kerosene "torpedo" 30k–200k | – | – | – | – | – | – | **never recommended** | manufacturers restrict to ventilated construction/outdoor use; CO and fire risk in an enclosed or occupied garage. Show only as "Why not a torpedo heater?" |

Cooling classes: `hp_*` (above), window AC in a wall sleeve (5–12k, CEER 10–12), portable AC (SACC 5–10k), dehumidifier 35/50 pint (DOE 2019), garage ceiling fan / exhaust fan (≥ 0.5 ACH summer purge; `kWh = W × h`).

---

## 13. Safety rules engine (hard blocks and warnings)

| Rule | Condition | Action |
|---|---|---|
| S1 | fuel-fired appliance (gas, propane, diesel burner) in a residential garage | require "ignition source ≥ 18 in. above floor" (IFGC 305.3 / IRC G2408.2 / NFPA 54) unless listed FVIR; portable Buddy class: warn to keep away from gasoline and solvent storage |
| S2 | any combustion heater | require CO alarm (UL 2034) in garage **and** in the house near the garage door (IRC R315 applies to homes with attached garages) |
| S3 | unvented heater (propane/NG/kerosene) | attended use only; show fresh-air opening; aggregate input ≤ 20 BTU/h per ft³ of room volume and ≤ 40,000 BTU/h per unit (IFGC 621 unvented room heater limits); ODS required; warn: California and other jurisdictions restrict unvented room heaters [A]; moisture warning §10.4 |
| S4 | torpedo / forced-air construction heater | exclude from recommendations |
| S5 | diesel air heater | exhaust and intake outside; clone = unlisted warning; CO alarm |
| S6 | 120 V portable electric | sole load on circuit; no extension cords or power strips; 3 ft clearance; not near flammable vapors (UL 1278 labeling) |
| S7 | circuit insufficient | block the class unless user opts into a new circuit; show breaker/wire; warn 100 A panel |
| S8 | 240 V heater on 208 V supply | show derated output |
| S9 | attached garage | never duct house HVAC into the garage (IRC R302.5.2); keep the fire-separation drywall intact |
| S10 | combustion appliance in a garage with sawdust/solvents | prefer separated-combustion (Hot Dawg HDS) |
| S11 | radiant/fan heater near vehicles or storage | clearance per manual; never aim at gasoline cans or car fuel fill |

---

## 14. Recommendation ranking (`rankSystems`)

Inputs:
- `Q_req`: `Q_size`, or `Q_fastWarmup` when the priority is "fast heat"; the "take the edge off" mode accepts ≥ 60% of `Q_size`
- usage (continuous or sessions)
- constraints: circuit, `canAddCircuit`, fuels, `ventingPossible`, attached, `budgetUpfront`, climate humidity, `wantsCooling`, `userPriority ∈ {upfront, running, fast, balanced}`

Algorithm:
1. **Candidates** = each class × units n ∈ {1, 2} (up to 3 for 120 V spot heaters). Capacity at design:
   - electric: nameplate
   - heat pump: `cap(h99) × rated47`
   - gas: input × η
2. **Hard filters:** fuel availability; safety S3/S4/S5 exclusions (unvented excluded for continuous or unattended use; torpedo always); `ventingPossible` for vented gas; circuit, unless `canAddCircuit` (then add circuit cost: new 240 V circuit $300–900; sub-panel $1,000–2,500 [A]); capacity ≥ `Q_req` (≥ 60% in edge-off mode).
3. **Safety tier:**
   - Tier 1: electric, heat pump, vented or separated-combustion gas
   - Tier 2: diesel with outdoor exhaust
   - Tier 3: unvented (spot use only)
   Tier-3 options appear only under "spot heat" or when nothing else passes.
4. **Score (lower is better)**
   - `TCO_5 = equip_mid + install_mid + circuitCost + 5 × annualCost(usage) + warmupPenalty + coolingCredit`
   - `warmupPenalty = $2 × max(0, minutesToTarget(Jan) − warmupGoal)` × sessions per season / 10 [A]
   - `coolingCredit = −(cost of the cheapest separate cooling solution)` when `wantsCooling` and the class is a heat pump
   - Priority weights multiply the terms. upfront → (equip + install + circuit) × 2; running → annual × 2; fast → warmupPenalty × 3.
5. **Output** the top 3, plus a "why not X" line for the notable exclusions: diesel, torpedo, 120 V heater when undersized.
6. **Insulate-first injection:** if `Σ ROI measures with payback < 3 yr` reduces `Q_req` enough to drop a circuit tier or equipment class, put the card "Do these $X of fixes first and you can buy Y instead of Z" at the top.

Worked result, example A (continuous 55°F, electric only, has 240 V/30 A, can add a circuit, Illinois):
1. **Insulate first** (≈$675), then a 5 kW ceiling heater on the existing 30 A circuit (Q_size 13.0k ≤ 17.06k). 5-yr TCO ≈ $675 + $200 + 5 × $1,085 ≈ **$6.3k**.
2. Cold-climate 12k mini-split after insulation: ≈ $4,500 installed + 5 × $418 ≈ **$6.6k**. It also gives cooling, so it ranks #1 if `wantsCooling`.
3. No insulation, 10 kW on a new 60 A circuit: $700 + $1,000 + 5 × $2,809 ≈ **$15.7k**.

---

## 15. Insulate-first ROI (`insulateFirst`)

Per measure: recompute `heatLossDesign` and `seasonal*` with that measure only.
```
ΔQ_design = Q_base − Q_measure
ΔE_season = E_base − E_measure              (continuous or session basis per user)
$/yr      = ΔE_season / η × price
payback   = cost / ($/yr)
```
Measure costs, DIY mid-points [A]:

| Measure | Cost |
|---|---|
| Blown cellulose/fiberglass to R-30/R-38 on an existing drywall ceiling | $0.60–1.00/ft² → 576 ft² ≈ $430 |
| EPS/fiberglass door kit | $100–150 per 16×7 door |
| Reflective kit | $60–100 |
| Weatherstrip package: bottom seal + retainer ($30–60), perimeter stop seal ($40–80), service-door kit ($25) | ≈ $125 |
| Attic hatch gasket | $20 |
| Wall batts + drywall | $2.50–4.00/ft² |
| New polyurethane door installed | $1,800–3,500 |
| Slab-edge foam (exterior dig) | $8–15/ft |

Example A, continuous 55°F in Chicago, IL prices:

| Measure | Cost | ΔQ_design BTU/h | % of load | ΔSeason MMBtu | Electric savings/yr | Gas (80%) savings/yr | Payback, electric | Payback, gas |
|---|---|---|---|---|---|---|---|---|
| R-30 blown ceiling | $430 | 8,735 | 30% | 15.7 | 4,612 kWh → $886 | $214 | 0.5 yr | 2.0 yr |
| EPS door kit | $120 | 4,748 | 16% | 8.6 | 2,508 kWh → $482 | $116 | 0.2 yr | 1.0 yr |
| Reflective door kit | $80 | 3,764 | 13% | 6.8 | 1,988 kWh → $382 | $92 | 0.2 yr | 0.9 yr |
| Weatherstrip package (average → tight) | $125 | 3,532 | 12% | 6.4 | 1,866 kWh → $359 | $86 | 0.3 yr | 1.4 yr |
| New R-18.4 polyurethane door | $2,200 | 5,269 | 18% | 9.5 | 2,783 kWh → $535 | $129 | 4.1 yr | 17.1 yr |
| **All three cheap measures** | **$675** | **17,015** | **59%** | **30.6** | **8,974 kWh → $1,725** | **$416** | **0.4 yr** | **1.6 yr** |

Session users (2 × 4 h/week) save far less per year: $68 in the example. The honest message is **capacity**. Insulating moves the garage from a 10 kW / 60 A heater to a 5 kW / 30 A one, saving ≈$1,000–1,500 upfront. UI must show both framings. This table is the commercial core: door kits (22.2k/mo searches), bottom seals (27.1k), weather stripping (22.2k).

---

## 16. Planner output (`PlannerResult`)

```ts
type PlannerResult = {
  station: { id; city; st; h99; h996; c1; dr; zone; distanceMi };
  inputsEcho: GarageInput;                    // normalized, with defaults and assumption flags applied
  heating: {
    tIn; tOutDesign; deltaT;
    items: { key: 'walls'|'garage_doors'|'windows'|'service_door'|'ceiling_roof'|'slab_edge'|'infiltration'|'house_coupling'; btuh: number; pct: number }[];
    qDesign; qSize; kwSize; btuhPerFt2;
    qFastWarmup?: number; warmupGoalMin: number;
    atticTempF?: number; freeFloatDesignF: number;
  };
  cooling?: { tOut; dr; sensible; latent; total; items: {...}[]; nominalSuggestion: 9000|12000|18000|24000|30000|36000; dehumidifierPints: number };
  circuits: { forSize: CircuitSpec; userCircuit: CircuitSpec; fits: boolean; notes: string[] };
  usage: { mode: 'continuous'|'sessions'; seasonMonths: string[]; tBal?: number; hddAtBal?: number };
  costs: { system: string; eta: number | 'curve'; unitPrice: number; unit: string; perSession?: number; perSeason: number; perMMBtu: number }[];
  session?: { month: string; tOut; tStart; minutesToTarget: number|null; kwhOrFuel: number; cost: number }[];
  recommendations: RankedSystem[];            // top 3 + whyNot[]
  insulateFirst: RoiRow[];
  warnings: { code: 'S1'|'S2'|...; severity: 'block'|'warn'|'info'; text: string }[];
  assumptions: string[];                      // every [A] value actually used, human-readable
  pricesAsOf: string;                         // from PRICES metadata
};
```
Display rules:
- Round BTU/h to the nearest 100 and kW to 0.1.
- Costs: whole dollars, or cents under $10.
- Show ranges when an [A] input dominates the result, e.g. tightness: show ±1 class as a band.
- The per-item bar chart is the hero visual ("where your heat goes"), sorted descending.
- Each bar that has a fix links to the product and ROI card.

---

## 17. Test vectors (TS must match within ±1% unless stated)

| # | Call | Expected |
|---|---|---|
| T1 | `hddAtBase(Chicago, 50)` / `(…,65)` / `(…,40)` / `(…,55)` | 2,965 / 6,143 / 1,525 / 3,888 |
| T2 | `hddAtBase(Minneapolis, 65)`; `(Phoenix, 65)`; `(Atlanta, 50)` | 7,389; 863; 630 |
| T3 | example A `heatLossDesign` (§6) | total 28,856; walls 2,319; door 6,659; ceiling 9,729 (attic 26.8°F); slab 2,717; inf 7,065; house −770 |
| T4 | example A with R-30 + EPS kit + tight | 11,841; Q_size 13,025 |
| T5 | detached 1-car "basic" Chicago Q_size | 17.7k BTU/h (5.2 kW) |
| T6 | `seasonalContinuous` A, resistance, 55°F | T_bal 53.66; 49.87 MMBtu; 14,617 kWh |
| T7 | same, cold-climate 24k | seasonal COP 2.56 ± 0.03; unmet 1.8 MMBtu |
| T8 | `simulateSession` A, Jan, 7.5 kW, 4 h, daytime | start 33.4°F; 116 min ± 3; 25.6 kWh |
| T9 | `simulateSession` B, Jan, 5 kW | start 38.1°F; 108 min ± 3; 14.6 kWh |
| T10 | `coolingLoadRLF` Dallas, west, α 0.9 | sensible 17,240; latent 3,050 |
| T11 | `circuitFor(5000,240)`, `(4000,240)`, `(7500,240)`, `(10000,240)`, `(5000 rated240, 208)` | 30 A/10 AWG; 25 A/10 AWG; 40 A/8 AWG; 60 A/6 AWG THHN; 3,756 W |
| T12 | door opening 16×7, ΔT 50, T_avg 30°F | 6,455 cfm |
| T13 | $/MMBtu: elec 18.19¢, propane $2.674 @0.80, diesel $6.529 @0.78 | 53.3; 36.5; 60.9 |

---

## 18. Assumptions register (everything tagged [A])

1. Garage presets (dimensions, doors, windows). Attached along a depth wall.
2. House coupling of +40 BTU/h·°F for the garage→house door and interface leakage.
3. Attic ventilation of 3 ACH in winter; roof deck U 0.50.
4. U-values for kits (0.33 EPS/batt, 0.50 reflective) and insulated doors (0.40/0.33/0.24). Tested DASMA U-factors vary by model: prefer a manufacturer-published installed U when the user enters one.
5. Wall/ceiling U-values rounded from ASHRAE 90.1 Appendix A (±10%). Metal-building and cathedral values should be verified.
6. ACH class values (0.75/1.5/2.5/4.0) and the class-suggestion rules. Cooling ACH = 0.5 × heating.
7. 10% sizing margin.
8. "Daytime use" design = h99 + 5°F. Session temperature = monthly mean +4°F by day, −2°F by evening.
9. Free-float: UA_gnd = 0.10 × floor area; +7°F mass damping at design; T_slab0 halfway to ground temperature.
10. Warm-up: light-mass capacitance terms; `SLAB_EXPOSED` 0.7; slab film R 0.92; instantaneous-air-temperature approximation to the semi-infinite solid. **Calibrate with user-reported warm-up times** (add an optional "how long does yours take?" field and log it).
11. Radiant comfort equivalence of −5°F.
12. Heat pump curves (anchored to NEEP v4.0 and Mitsubishi data; generic otherwise). Rated heating = 1.1 × nominal. No setpoint COP bonus.
13. Efficiencies: unvented 0.92/0.90/0.93 sensible; diesel 0.78; condensing 0.92.
14. Prices: propane West Coast placeholder (US + $0.50); cylinder prices ($4 refill, $7 exchange, $25–34 per gallon for 1-lb); kerosene = heating oil + $1.00; small-customer bulk premium.
15. Cooling: orientation factors, door and roof absorptances, afternoon session temperature, portable-AC SACC conversion (÷1.5), hot-car gain 4,000 BTU/h.
16. Equipment and install cost ranges (Sept 2026). Circuit install $300–900; sub-panel $1,000–2,500.
17. Insulation measure costs.
18. The 2023 NEC 210.8(F) HVAC GFCI exception sunset (2026-09-01) and local adoption must be verified; the unvented-heater jurisdiction list is not exhaustive.
19. Climate-zone fallback labels marked `*`.

---

## 19. Sources

- ASHRAE Climatic Design Conditions 2021, via ashrae-meteo.info v3.0 (station JSON pulled 2026-09-25): https://ashrae-meteo.info/v3.0/
- ENERGY STAR County-Level Design Temperature Reference Guide (ASHRAE 2013 / Manual J 8th, used for cross-check): https://www.energystar.gov/ia/partners/bldrs_lenders_raters/downloads/County%20Level%20Design%20Temperature%20Reference%20Guide%20-%202015-06-24.pdf
- Barnaby & Spitler 2005, "Development of the Residential Load Factor Method" (ASHRAE RP-1199), basis of ASHRAE Fundamentals ch.17: https://static1.squarespace.com/static/61718e5c0ba09e66de8b077e/t/662bb0902a66f708cd6ede40/1714139281127/Barnaby_and_Spitler_2005.pdf and https://handbook.ashrae.org/Handbooks/F17/IP/f17_ch17/f17_ch17_ip.aspx
- ADP "UHSG-03 Unit Heater Sizing Guide" (U-values, ACH, 10% safety factor, winter design table): https://www.wbmemphis.com/customer/docs/skudocs/unit-heater-size-guide.pdf
- NIST, Emmerich et al., "Air and Pollutant Transport from Attached Garages to Residential Living Spaces" (NISTIR 7072), garage ACH50 48.4 (20.8–106): https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=916606
- DASMA TDS-163 (R-value vs U-factor): https://www.dasma.com/wp-content/uploads/2022/09/TDS163..pdf ; DASMA TDS-196 (U-factor program, IECC reference, ≤ 16% glazing): https://www.dasma.com/wp-content/uploads/2025/01/TDS-196.pdf
- Clopay Energy Series with Intellicore (tested U 0.16, IECC U ≤ 0.37, ≤ 0.40 cfm/ft²): https://www.clopaydoor.com/insulated-polyurethane-doors
- EIA Electric Power Monthly Table 5.6.B (YTD Jul 2026): https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b ; Table 5.6.A (Jul 2026)
- EIA natural gas residential prices by state (annual): https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_a.htm
- EIA weekly heating oil and propane (residential, excluding taxes), release 2026-04-01, next 2026-10-07: https://www.eia.gov/dnav/pet/pet_pri_wfr_a_EPLLPA_PRS_dpgal_w.htm and https://www.eia.gov/dnav/pet/pet_pri_wfr_a_EPD2F_PRS_dpgal_w.htm
- EIA on-highway diesel by PADD (2026-09-21): https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epd2d_pte_dpgal_w.htm
- EIA Btu conversion factors: https://www.eia.gov/energyexplained/units-and-calculators/british-thermal-units.php
- NEEP Cold Climate ASHP Specification v4.0: https://neep.org/sites/default/files/media-files/cold_climate_air_source_heat_pump_specification_-_version_4.0_final.pdf
- Mitsubishi MSZ-FS12NA/MUZ-FS12NAH submittal: https://static.johnsonsupply.com/images/560321/msz-fs12na_muz-fs12nah_specifications.pdf
- Mr. Heater Big Maxx MHU50/80 manual (80%, 4" vent, 1" clearance, 18" above garage floor): https://www.manualslib.com/manual/3660181/Mr-Heater-Big-Maxx-Mhu50.html
- Mr. Heater Big Buddy MH18B manual (18 in² vent area): https://images.thdstatic.com/catalog/pdfImages/53/53c06813-2588-49a2-ad28-8bf3eb3a9ae7.pdf
- Modine Hot Dawg HD/HDS: https://www.modinehvac.com/all-products/gas-fired-unit-heaters/hot-dawg-power-vented-gas-fired-unit-heater-hd-hdb/ and https://www.modinehvac.com/all-products/gas-fired-unit-heaters/hot-dawg-separated-combustion-gas-fired-unit-heater-hds-hdc/
- Webasto Air Top 2000 STC (0.9–2.0 kW, 0.12–0.24 L/h): https://www.webasto.com/en-us/heating/air-heaters/air-top-2000-stc.html
- Codes (cite section numbers; the text is copyrighted, so link to ICC/NFPA free-access pages): NEC (NFPA 70) 2023 §§210.8, 210.11(C)(4), 210.19, 210.20, 210.23, 220.83, 240.4(D), 240.6, 310.16, 334.80, 424.4; IFGC 305.3 and 621; IRC G2408.2, R302.5.2, R315; NFPA 54.
- ASHRAE Handbook, Fundamentals (2021) ch.16 (large-opening airflow), ch.18 (occupant gains, slab F_p), ch.26 (surface resistances); ASHRAE 90.1-2019 Appendix A (assembly U and F-factors).

---

## Appendix A: ASHRAE 2021 design conditions, 113 stations (bold = primary city per state)

Columns: 99.6% and 99% heating DB; 1% cooling DB with mean coincident WB; hottest-month daily range; HDD40 and HDD55 computed with §3.2; HDD50, HDD65, CDD65 as published by ASHRAE. Zone = ASHRAE station label; `*` = IECC 2021 county fallback.

| State | City (ASHRAE station, WMO) | Elev ft | 99.6% htg °F | 99% htg °F | 1% clg DB °F | 1% MCWB °F | Summer DR °F | HDD40 | HDD50 | HDD55 | HDD65 | CDD65 | Zone |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AL | **Birmingham** (Birmingham Shuttlesworth, 722280) | 615 | 20.7 | 24.9 | 93.2 | 74.5 | 17.7 | 159 | 667 | 1103 | 2540 | 2143 | 3A |
| AK | **Anchorage** (Anchorage Intl, 702730) | 144 | -7.4 | -2.8 | 69.2 | 57.9 | 11.8 | 3038 | 5187 | 6532 | 9859 | 10 | 7 |
| AK | Fairbanks (Fairbanks, 702610) | 432 | -42.2 | -37.6 | 77.7 | 59.9 | 17.7 | 6657 | 8917 | 10248 | 13366 | 67 | 8 |
| AK | Juneau (Juneau, 703810) | 16 | 5.6 | 9.8 | 70.5 | 58.4 | 12.3 | 1497 | 3485 | 4863 | 8295 | 5 | 7* |
| AZ | **Phoenix** (Phoenix Sky Harbor, 722780) | 1107 | 39.3 | 41.9 | 108.5 | 69.0 | 20.6 | 0 | 27 | 125 | 874 | 4698 | 2B |
| AZ | Tucson (Tucson, 722740) | 2452 | 32.0 | 34.7 | 103.6 | 65.7 | 22.8 | 3 | 116 | 313 | 1328 | 3373 | 2B |
| AZ | Flagstaff (Flagstaff Pulliam, 723750) | 7003 | 4.4 | 9.9 | 83.6 | 54.8 | 28.1 | 1111 | 2832 | 3972 | 6744 | 135 | 5B* |
| AR | **Little Rock** (Little Rock Clinton, 723403) | 258 | 20.1 | 24.0 | 95.6 | 77.1 | 18.4 | 225 | 837 | 1350 | 2881 | 2249 | 3A |
| CA | **Los Angeles** (Los Angeles Intl, 722950) | 97 | 45.0 | 47.0 | 81.3 | 64.2 | 10.3 | 0 | 4 | 95 | 1256 | 672 | 3B |
| CA | San Diego (San Diego Intl, 722900) | 15 | 45.3 | 47.2 | 81.6 | 65.6 | 8.6 | 0 | 1 | 54 | 1101 | 784 | 3B |
| CA | San Francisco (San Francisco Intl, 724940) | 8 | 40.3 | 42.2 | 78.1 | 62.0 | 16.0 | 0 | 84 | 458 | 2606 | 173 | 3C |
| CA | Sacramento (Sacramento Intl, 724839) | 23 | 30.8 | 33.6 | 97.5 | 69.1 | 32.6 | 11 | 309 | 791 | 2475 | 1348 | 3B |
| CA | Fresno (Fresno Yosemite, 723890) | 333 | 32.5 | 34.8 | 101.3 | 68.6 | 29.1 | 8 | 246 | 656 | 2138 | 2223 | 3B |
| CA | Truckee-Tahoe (Truckee-Tahoe, 725846) | 5900 | 0.5 | 6.7 | 84.5 | 56.8 | 40.8 | 1434 | 3349 | 4607 | 7709 | 48 | 5B |
| CO | **Denver** (Denver Intl, 725650) | 5414 | -0.2 | 5.8 | 92.3 | 59.7 | 27.5 | 1179 | 2579 | 3552 | 5874 | 827 | 5B* |
| CO | Colorado Springs (Colorado Springs, 724660) | 6181 | 2.3 | 7.4 | 88.7 | 58.4 | 26.0 | 1150 | 2613 | 3602 | 6013 | 551 | 5B |
| CO | Grand Junction (Grand Junction, 724760) | 4833 | 4.9 | 10.9 | 95.5 | 60.3 | 27.9 | 1014 | 2347 | 3232 | 5416 | 1266 | 5B |
| CT | **Hartford** (Hartford Bradley, 725080) | 175 | 3.9 | 9.1 | 88.7 | 71.9 | 20.2 | 1212 | 2617 | 3541 | 5828 | 827 | 5A |
| DE | **Wilmington** (New Castle, 724180) | 79 | 12.8 | 16.9 | 89.5 | 74.1 | 17.1 | 682 | 1814 | 2613 | 4677 | 1202 | 4A |
| DC | **Washington** (Washington Ronald Reagan, 724050) | 10 | 17.1 | 20.7 | 92.0 | 74.7 | 15.7 | 421 | 1327 | 2009 | 3856 | 1660 | 4A |
| FL | **Miami** (Miami Nhc, 722020) | 29 | 49.0 | 52.7 | 90.9 | 77.7 | 11.6 | 0 | 1 | 3 | 112 | 4660 | 1A |
| FL | Orlando (Orlando Intl, 722050) | 90 | 38.4 | 42.4 | 92.4 | 76.3 | 15.9 | 1 | 27 | 71 | 512 | 3480 | 2A |
| FL | Tampa (Tampa Intl, 722110) | 19 | 39.8 | 43.7 | 91.3 | 77.0 | 12.9 | 1 | 23 | 64 | 481 | 3733 | 2A |
| FL | Jacksonville (Jacksonville Intl, 722060) | 36 | 29.6 | 32.8 | 92.6 | 76.8 | 17.8 | 16 | 157 | 351 | 1268 | 2676 | 2A |
| FL | Tallahassee (Tallahassee Nws, 722140) | 173 | 26.5 | 30.0 | 94.3 | 75.8 | 18.3 | 25 | 208 | 440 | 1441 | 2768 | 2A |
| GA | **Atlanta** (Atlanta Hartsfield-Jackson, 722190) | 1010 | 21.7 | 26.4 | 91.6 | 73.6 | 16.5 | 141 | 648 | 1104 | 2578 | 1969 | 3A |
| HI | **Honolulu** (Honolulu Intl, 911820) | 7 | 63.5 | 65.1 | 88.7 | 73.7 | 11.8 | 0 | 0 | 0 | 0 | 4721 | 1A |
| ID | **Boise** (Boise, 726810) | 2814 | 11.4 | 16.4 | 95.9 | 62.9 | 29.4 | 769 | 2071 | 2999 | 5311 | 1062 | 5B |
| ID | Idaho Falls (Idaho Falls, 725785) | 4733 | -5.5 | 0.4 | 89.7 | 60.5 | 35.8 | 2025 | 3796 | 4920 | 7621 | 295 | 6B |
| IL | **Chicago** (Chicago O'Hare, 725300) | 662 | -1.7 | 3.3 | 88.5 | 72.8 | 17.6 | 1525 | 2961 | 3888 | 6157 | 919 | 5A |
| IL | Rockford (Chicago Rockford, 725430) | 730 | -6.2 | -0.5 | 88.0 | 73.0 | 19.5 | 1807 | 3300 | 4245 | 6531 | 813 | 5A |
| IL | Springfield (Springfield Lincoln, 724390) | 594 | 0.5 | 6.2 | 90.6 | 75.9 | 19.4 | 1174 | 2414 | 3232 | 5284 | 1208 | 5A |
| IN | **Indianapolis** (Indianapolis Intl, 724380) | 791 | 1.8 | 7.5 | 88.9 | 73.9 | 17.6 | 1112 | 2346 | 3163 | 5224 | 1160 | 4A |
| IN | South Bend (South Bend, 725350) | 773 | -0.4 | 5.0 | 87.5 | 72.4 | 18.8 | 1511 | 2975 | 3896 | 6187 | 804 | 5A* |
| IA | **Des Moines** (Des Moines, 725460) | 957 | -4.4 | 0.4 | 90.1 | 75.0 | 17.8 | 1653 | 3040 | 3923 | 6065 | 1127 | 5A |
| IA | Waterloo (Waterloo, 725480) | 868 | -9.9 | -4.7 | 88.1 | 73.8 | 19.9 | 2158 | 3708 | 4674 | 6977 | 781 | 6A |
| KS | **Wichita** (Wichita Eisenhower, 724500) | 1321 | 7.9 | 12.4 | 97.3 | 74.2 | 21.0 | 726 | 1763 | 2503 | 4370 | 1788 | 4A |
| KS | Topeka (Topeka Billard, 724560) | 881 | 4.0 | 8.9 | 94.9 | 76.1 | 19.9 | 944 | 2081 | 2861 | 4823 | 1557 | 4A |
| KY | **Louisville** (Louisville Intl, 724230) | 488 | 10.2 | 15.7 | 91.7 | 74.8 | 16.8 | 595 | 1535 | 2205 | 4010 | 1678 | 4A |
| KY | Lexington (Lexington Blue Grass, 724220) | 980 | 7.7 | 13.3 | 89.4 | 73.4 | 18.0 | 749 | 1809 | 2544 | 4483 | 1261 | 4A |
| LA | **New Orleans** (New Orleans Intl, 722310) | 4 | 33.1 | 36.6 | 92.8 | 77.7 | 14.0 | 17 | 149 | 335 | 1193 | 3143 | 3A |
| LA | Shreveport (Shreveport Regional, 722480) | 280 | 25.9 | 29.0 | 96.9 | 75.9 | 19.8 | 87 | 446 | 801 | 2043 | 2694 | 3A |
| ME | **Portland** (Portland Intl Jetport, 726060) | 45 | 0.1 | 5.0 | 83.3 | 69.9 | 17.1 | 1620 | 3254 | 4309 | 6891 | 402 | 6A |
| ME | Caribou (Caribou, 727120) | 624 | -13.7 | -8.9 | 81.4 | 66.9 | 19.4 | 3138 | 5083 | 6263 | 9092 | 212 | 7 |
| MD | **Baltimore** (Baltimore-Washington, 724060) | 156 | 13.5 | 17.5 | 91.3 | 74.2 | 18.6 | 619 | 1698 | 2465 | 4475 | 1314 | 4A |
| MA | **Boston** (Boston Logan, 725090) | 12 | 7.7 | 12.8 | 87.7 | 71.6 | 14.7 | 957 | 2284 | 3198 | 5498 | 812 | 5A |
| MA | Worcester (Worcester, 725100) | 1000 | 1.7 | 6.8 | 83.4 | 69.7 | 15.9 | 1536 | 3096 | 4095 | 6561 | 523 | 5A |
| MI | **Detroit** (Detroit Wayne County Ap, 725370) | 631 | 2.1 | 7.3 | 87.5 | 72.4 | 18.1 | 1404 | 2848 | 3773 | 6036 | 868 | 5A |
| MI | Grand Rapids (Grand Rapids Ford, 726350) | 803 | 2.0 | 6.8 | 86.7 | 71.7 | 19.3 | 1603 | 3151 | 4118 | 6486 | 698 | 5A |
| MI | Marquette (Marquette County Ap, 727430) | 1415 | -15.1 | -8.9 | 80.7 | 65.7 | 20.5 | 3259 | 5360 | 6595 | 9606 | 171 | 7 |
| MN | **Minneapolis** (Minneapolis-St Paul, 726580) | 872 | -10.6 | -6.0 | 87.9 | 72.0 | 17.4 | 2444 | 4064 | 5055 | 7396 | 834 | 6A |
| MN | Duluth (Duluth Intl, 727450) | 1433 | -17.3 | -12.1 | 81.4 | 67.5 | 19.0 | 3276 | 5212 | 6374 | 9173 | 242 | 7* |
| MN | International Falls (International Falls, 727470) | 1183 | -26.2 | -20.8 | 82.2 | 67.7 | 23.3 | 3935 | 5925 | 7120 | 9984 | 195 | 7 |
| MS | **Jackson** (Jackson Intl, 722350) | 330 | 23.3 | 26.8 | 94.3 | 75.9 | 18.9 | 112 | 519 | 897 | 2210 | 2381 | 3A |
| MO | **St. Louis** (St Louis Lambert, 724340) | 531 | 6.8 | 12.2 | 93.5 | 76.2 | 16.8 | 773 | 1804 | 2524 | 4379 | 1736 | 3A |
| MO | Kansas City (Kansas City Intl, 724460) | 1005 | 2.4 | 7.2 | 92.4 | 76.3 | 18.5 | 1043 | 2207 | 2999 | 4977 | 1409 | 4A |
| MT | **Billings** (Billings Logan, 726770) | 3581 | -8.6 | -2.7 | 91.7 | 61.9 | 26.6 | 1700 | 3210 | 4272 | 6746 | 687 | 6B |
| MT | Great Falls (Great Falls, 727760) | 3711 | -15.1 | -8.9 | 89.5 | 60.1 | 30.7 | 2073 | 3711 | 4885 | 7593 | 350 | 6B |
| MT | Missoula (Missoula, 727730) | 3192 | -1.7 | 4.3 | 90.0 | 61.1 | 32.7 | 1673 | 3450 | 4589 | 7331 | 352 | 6B |
| NE | **Omaha** (Eppley Field, 725500) | 982 | -2.8 | 1.6 | 92.1 | 75.3 | 19.0 | 1567 | 2940 | 3819 | 5947 | 1233 | 5A |
| NE | North Platte (North Platte, 725620) | 2783 | -3.7 | 1.3 | 93.0 | 70.7 | 25.8 | 1584 | 3108 | 4108 | 6463 | 877 | 5A |
| NV | **Las Vegas** (Las Vegas Mccarran, 723860) | 2180 | 32.8 | 35.4 | 106.7 | 66.4 | 21.5 | 9 | 232 | 582 | 1841 | 3681 | 3B |
| NV | Reno (Reno-Tahoe, 724880) | 4410 | 15.9 | 19.5 | 94.4 | 60.4 | 31.7 | 480 | 1663 | 2552 | 4817 | 973 | 5B |
| NH | **Manchester** (Manchester-Boston, 743945) | 221 | 1.8 | 7.0 | 88.4 | 70.4 | 19.0 | 1393 | 2880 | 3835 | 6191 | 761 | 5A |
| NH | Concord (Concord, 726050) | 343 | -3.1 | 1.9 | 87.2 | 69.9 | 22.6 | 1807 | 3458 | 4491 | 7010 | 503 | 5A |
| NJ | **Newark** (Newark Intl, 725020) | 7 | 12.1 | 16.2 | 91.1 | 72.8 | 16.1 | 694 | 1810 | 2606 | 4646 | 1285 | 4A |
| NM | **Albuquerque** (Albuquerque Intl, 723650) | 5312 | 19.0 | 22.4 | 93.4 | 59.6 | 22.9 | 316 | 1253 | 1974 | 3873 | 1488 | 4B |
| NM | Santa Fe (Santa Fe, 723656) | 6344 | 10.2 | 14.7 | 90.3 | 57.8 | 28.0 | 772 | 2105 | 3018 | 5275 | 710 | 5B |
| NY | **New York City** (New York La Guardia, 725030) | 11 | 13.6 | 17.9 | 89.8 | 72.5 | 13.4 | 607 | 1675 | 2458 | 4476 | 1332 | 4A* |
| NY | Albany (Albany Intl, 725180) | 280 | -0.7 | 4.3 | 86.3 | 71.1 | 18.9 | 1564 | 3085 | 4054 | 6418 | 686 | 5A |
| NY | Buffalo (Buffalo Niagara, 725280) | 715 | 2.5 | 6.8 | 83.9 | 70.0 | 16.0 | 1544 | 3092 | 4061 | 6449 | 606 | 5A |
| NY | Syracuse (Syracuse Hancock, 725190) | 413 | -1.5 | 4.1 | 86.4 | 71.4 | 18.8 | 1617 | 3149 | 4121 | 6504 | 644 | 5A |
| NC | **Charlotte** (Charlotte Douglas, 723140) | 728 | 21.0 | 24.8 | 91.9 | 74.0 | 18.6 | 203 | 843 | 1383 | 3030 | 1742 | 3A |
| NC | Raleigh (Raleigh-Durham, 723060) | 416 | 19.7 | 23.6 | 92.6 | 75.1 | 19.1 | 250 | 940 | 1500 | 3188 | 1745 | 3A |
| NC | Asheville (Asheville, 723150) | 2117 | 14.9 | 19.4 | 85.9 | 70.2 | 18.4 | 398 | 1316 | 2033 | 4000 | 912 | 4A |
| ND | **Fargo** (Fargo Hector, 727530) | 900 | -18.7 | -13.9 | 87.0 | 70.4 | 20.9 | 3335 | 5119 | 6183 | 8685 | 571 | 6A |
| ND | Bismarck (Bismarck, 727640) | 1651 | -17.5 | -11.8 | 89.4 | 69.3 | 24.9 | 3014 | 4784 | 5876 | 8414 | 555 | 6A |
| OH | **Columbus** (Columbus Glenn, 724280) | 816 | 4.5 | 9.8 | 88.9 | 72.5 | 18.0 | 1031 | 2268 | 3081 | 5161 | 1098 | 4A |
| OH | Cleveland (Cleveland Hopkins, 725240) | 781 | 3.6 | 9.0 | 87.2 | 72.4 | 16.8 | 1242 | 2616 | 3502 | 5737 | 853 | 5A |
| OH | Cincinnati (Cincinnati Northern Kentucky, 724210) | 883 | 5.3 | 11.0 | 89.0 | 73.4 | 18.0 | 914 | 2076 | 2856 | 4879 | 1167 | 4A |
| OK | **Oklahoma City** (Oklahoma City Rogers, 723530) | 1285 | 14.6 | 19.0 | 97.6 | 74.2 | 21.6 | 368 | 1133 | 1740 | 3398 | 2038 | 3A |
| OK | Tulsa (Tulsa Intl, 723560) | 650 | 13.6 | 18.2 | 97.2 | 76.2 | 19.0 | 403 | 1172 | 1769 | 3411 | 2152 | 3A |
| OR | **Portland** (Portland Intl, 726980) | 19 | 25.9 | 29.4 | 87.5 | 66.3 | 21.6 | 136 | 983 | 1825 | 4179 | 484 | 4C |
| OR | Pendleton (E. Oregon) (Pendleton Eastern Oregon, 726880) | 1486 | 8.6 | 15.7 | 93.8 | 63.7 | 30.4 | 665 | 1872 | 2825 | 5233 | 687 | 5B |
| PA | **Philadelphia** (Philadelphia Intl, 724080) | 10 | 13.8 | 17.8 | 90.8 | 73.9 | 16.1 | 612 | 1672 | 2434 | 4410 | 1403 | 4A |
| PA | Pittsburgh (Pittsburgh Intl, 725200) | 1203 | 4.3 | 9.2 | 86.4 | 70.8 | 18.0 | 1145 | 2467 | 3324 | 5518 | 816 | 5A |
| PA | Harrisburg (Capital City, 725118) | 340 | 11.0 | 15.5 | 89.7 | 72.8 | 18.6 | 834 | 2061 | 2890 | 4974 | 1136 | 4A |
| PA | Erie (Erie, 725260) | 729 | 4.8 | 9.7 | 84.4 | 71.8 | 14.6 | 1322 | 2773 | 3700 | 6021 | 700 | 5A |
| RI | **Providence** (Providence Green, 725070) | 55 | 8.1 | 12.8 | 86.8 | 72.1 | 16.8 | 953 | 2276 | 3188 | 5477 | 798 | 5A |
| SC | **Columbia** (Columbia Metro, 723100) | 225 | 23.5 | 27.0 | 94.8 | 74.9 | 19.1 | 106 | 544 | 966 | 2374 | 2297 | 3A |
| SD | **Sioux Falls** (Sioux Falls, 726510) | 1428 | -11.1 | -6.3 | 88.3 | 73.1 | 20.3 | 2426 | 4056 | 5061 | 7442 | 762 | 6A |
| SD | Rapid City (Rapid City, 726620) | 3160 | -8.4 | -3.0 | 92.4 | 65.9 | 26.8 | 1948 | 3553 | 4621 | 7113 | 660 | 6A |
| TN | **Nashville** (Nashville Intl, 723270) | 600 | 14.9 | 19.5 | 92.3 | 74.5 | 18.0 | 378 | 1149 | 1741 | 3430 | 1800 | 3A |
| TN | Memphis (Memphis Intl, 723340) | 254 | 19.0 | 23.2 | 94.3 | 76.5 | 16.4 | 247 | 863 | 1360 | 2856 | 2321 | 3A |
| TX | **Dallas-Fort Worth** (Dallas Fort Worth, 722590) | 560 | 23.4 | 27.4 | 99.1 | 74.6 | 19.1 | 104 | 499 | 870 | 2113 | 2956 | 2A |
| TX | Houston (Houston Bush, 722430) | 95 | 31.4 | 34.3 | 95.7 | 76.8 | 18.2 | 23 | 182 | 390 | 1297 | 3200 | 2A |
| TX | San Antonio (San Antonio Intl, 722530) | 789 | 30.0 | 33.1 | 97.7 | 73.6 | 19.7 | 22 | 196 | 415 | 1352 | 3270 | 2A |
| TX | Austin (Austin-Bergstrom, 722540) | 480 | 26.6 | 29.9 | 98.4 | 74.6 | 22.4 | 46 | 297 | 576 | 1648 | 3030 | 2A |
| TX | El Paso (El Paso, 722700) | 3918 | 25.7 | 28.8 | 99.1 | 63.4 | 24.9 | 48 | 422 | 843 | 2203 | 2631 | 3B |
| TX | Amarillo (Amarillo Nws, 723630) | 3593 | 10.8 | 16.0 | 96.1 | 65.9 | 24.9 | 473 | 1388 | 2092 | 3952 | 1526 | 4B |
| UT | **Salt Lake City** (Salt Lake City Intl, 725720) | 4225 | 11.4 | 15.6 | 95.9 | 61.9 | 24.9 | 879 | 2189 | 3092 | 5329 | 1350 | 5B |
| VT | **Burlington** (Burlington Intl, 726170) | 330 | -7.1 | -1.7 | 85.7 | 69.9 | 18.8 | 2038 | 3676 | 4690 | 7145 | 573 | 6A |
| VA | **Richmond** (Richmond, 724010) | 164 | 17.4 | 21.2 | 92.4 | 75.0 | 18.6 | 372 | 1202 | 1839 | 3635 | 1609 | 4A |
| VA | Dulles (N. Virginia) (Washington Dulles, 724030) | 290 | 12.3 | 16.6 | 90.7 | 73.7 | 19.4 | 658 | 1763 | 2529 | 4557 | 1238 | 4A |
| VA | Roanoke (Roanoke-Blacksburg, 724110) | 1175 | 15.5 | 19.8 | 89.7 | 71.9 | 18.2 | 434 | 1347 | 2037 | 3927 | 1300 | 4A* |
| WA | **Seattle** (Seattle Tacoma, 727930) | 370 | 26.6 | 30.0 | 82.2 | 63.9 | 19.0 | 135 | 1067 | 2008 | 4621 | 226 | 4C |
| WA | Spokane (Spokane Intl, 727850) | 2353 | 6.1 | 11.8 | 90.1 | 61.6 | 26.2 | 1211 | 2837 | 3919 | 6539 | 505 | 5B |
| WV | **Charleston** (Yeager, 724140) | 910 | 9.6 | 14.8 | 88.8 | 72.4 | 18.9 | 662 | 1699 | 2427 | 4385 | 1108 | 4A |
| WI | **Milwaukee** (Milwaukee Mitchell, 726400) | 670 | -1.7 | 2.8 | 86.4 | 72.3 | 15.4 | 1683 | 3241 | 4234 | 6647 | 715 | 5A |
| WI | Madison (Dane County Regional, 726410) | 866 | -6.8 | -1.9 | 86.4 | 72.4 | 19.3 | 2059 | 3653 | 4649 | 7053 | 653 | 5A |
| WI | Green Bay (Green Bay Straubel, 726450) | 687 | -8.2 | -3.2 | 85.0 | 71.9 | 20.3 | 2270 | 3959 | 5004 | 7519 | 500 | 6A |
| WY | **Cheyenne** (Cheyenne, 725640) | 6113 | -3.1 | 3.1 | 87.3 | 57.6 | 26.5 | 1572 | 3250 | 4361 | 6972 | 387 | 5B |
| WY | Casper (Casper Natrona County Intl, 725690) | 5318 | -7.9 | -1.0 | 91.4 | 58.9 | 33.7 | 1885 | 3607 | 4726 | 7336 | 472 | 6B |

## Appendix B: `climate.ts` STATIONS dataset

```ts
// ASHRAE 2021 climatic design conditions (ashrae-meteo.info v3.0, IP units). tMean/tSd = monthly mean of daily-average dry-bulb and its std dev (°F), Jan..Dec.
export type ClimateStation = { id: string; st: string; city: string; wmo: string; lat: number; lon: number; elevFt: number; h996: number; h99: number; c1: number; c1mcwb: number; dr: number; hr1: number; hdd50: number; hdd65: number; cdd65: number; zone: string; primary: boolean; tMean: number[]; tSd: number[] };
export const STATIONS: ClimateStation[] = [
  {id:'AL-birmingham',st:'AL',city:'Birmingham',wmo:'722280',lat:33.566,lon:-86.745,elevFt:615,h996:20.7,h99:24.9,c1:93.2,c1mcwb:74.5,dr:17.7,hr1:133.6,hdd50:667,hdd65:2540,cdd65:2143,zone:'3A',primary:true,tMean:[44.4,48.7,55.9,63.7,71.5,78.2,81.0,80.7,75.5,64.8,54.1,47.4],tSd:[10.91,10.13,9.45,7.51,6.33,4.18,3.29,3.94,5.81,8.10,8.67,9.77]},
  {id:'AK-anchorage',st:'AK',city:'Anchorage',wmo:'702730',lat:61.1567,lon:-149.9864,elevFt:144,h996:-7.4,h99:-2.8,c1:69.2,c1mcwb:57.9,dr:11.8,hr1:66.2,hdd50:5187,hdd65:9859,cdd65:10,zone:'7',primary:true,tMean:[17.7,22.0,26.2,37.8,48.3,56.0,59.6,57.6,49.7,36.8,23.9,19.5],tSd:[12.13,10.03,8.56,6.09,5.10,4.21,3.70,3.64,5.02,7.95,10.06,10.32]},
  {id:'AK-fairbanks',st:'AK',city:'Fairbanks',wmo:'702610',lat:64.804,lon:-147.876,elevFt:432,h996:-42.2,h99:-37.6,c1:77.7,c1mcwb:59.9,dr:17.7,hr1:70.5,hdd50:8917,hdd65:13366,cdd65:67,zone:'8',primary:false,tMean:[-8.1,1.0,10.8,33.9,50.4,60.9,62.8,57.0,46.3,26.6,4.1,-4.5],tSd:[17.97,14.99,13.26,10.67,7.87,5.69,4.95,5.90,7.19,11.28,13.92,14.99]},
  {id:'AK-juneau',st:'AK',city:'Juneau',wmo:'703810',lat:58.357,lon:-134.564,elevFt:16,h996:5.6,h99:9.8,c1:70.5,c1mcwb:58.4,dr:12.3,hr1:67.4,hdd50:3485,hdd65:8295,cdd65:5,zone:'7',primary:false,tMean:[28.8,30.0,33.0,40.9,49.1,54.8,57.1,56.3,50.3,42.4,33.7,30.2],tSd:[9.27,7.97,7.00,4.66,5.09,4.54,3.83,3.81,3.52,4.62,7.39,8.65]},
  {id:'AZ-phoenix',st:'AZ',city:'Phoenix',wmo:'722780',lat:33.428,lon:-112.004,elevFt:1107,h996:39.3,h99:41.9,c1:108.5,c1mcwb:69.0,dr:20.6,hr1:113.2,hdd50:27,hdd65:874,cdd65:4698,zone:'2B',primary:true,tMean:[56.9,59.7,66.4,72.7,81.5,91.4,95.3,94.0,88.9,76.9,65.2,55.9],tSd:[5.44,5.98,6.60,6.95,6.55,5.38,4.41,4.37,5.06,6.76,6.67,5.38]},
  {id:'AZ-tucson',st:'AZ',city:'Tucson',wmo:'722740',lat:32.228,lon:-110.956,elevFt:2452,h996:32.0,h99:34.7,c1:103.6,c1mcwb:65.7,dr:22.8,hr1:113.3,hdd50:116,hdd65:1328,cdd65:3373,zone:'2B',primary:false,tMean:[53.7,56.1,62.3,67.9,76.5,86.3,87.9,86.4,82.5,72.2,61.7,52.9],tSd:[6.28,6.61,6.77,6.93,6.04,4.91,4.34,3.97,4.23,6.65,7.18,6.42]},
  {id:'AZ-flagstaff',st:'AZ',city:'Flagstaff',wmo:'723750',lat:35.144,lon:-111.666,elevFt:7003,h996:4.4,h99:9.9,c1:83.6,c1mcwb:54.8,dr:28.1,hr1:90.3,hdd50:2832,hdd65:6744,cdd65:135,zone:'5B',primary:false,tMean:[30.7,32.5,38.3,43.3,51.3,61.3,66.6,64.5,58.0,47.2,37.8,30.3],tSd:[7.06,7.24,6.39,6.38,6.42,5.85,3.57,3.34,4.68,6.03,6.68,7.41]},
  {id:'AR-little-rock',st:'AR',city:'Little Rock',wmo:'723403',lat:34.727,lon:-92.239,elevFt:258,h996:20.1,h99:24.0,c1:95.6,c1mcwb:77.1,dr:18.4,hr1:138.4,hdd50:837,hdd65:2881,cdd65:2249,zone:'3A',primary:true,tMean:[42.2,45.9,54.1,63.1,71.5,79.5,82.6,82.3,75.6,64.2,52.8,44.4],tSd:[10.43,10.13,9.59,7.67,6.50,4.59,4.36,4.58,6.16,7.98,8.63,9.39]},
  {id:'CA-los-angeles',st:'CA',city:'Los Angeles',wmo:'722950',lat:33.938,lon:-118.389,elevFt:97,h996:45.0,h99:47.0,c1:81.3,c1mcwb:64.2,dr:10.3,hr1:97.7,hdd50:4,hdd65:1256,cdd65:672,zone:'3B',primary:true,tMean:[57.9,57.6,59.1,60.6,63.2,66.1,69.3,70.2,69.8,66.8,62.1,57.6],tSd:[4.89,4.73,4.12,4.35,3.52,2.67,3.07,3.35,4.13,4.92,5.08,4.20]},
  {id:'CA-san-diego',st:'CA',city:'San Diego',wmo:'722900',lat:32.734,lon:-117.183,elevFt:15,h996:45.3,h99:47.2,c1:81.6,c1mcwb:65.6,dr:8.6,hr1:102.0,hdd50:1,hdd65:1101,cdd65:784,zone:'3B',primary:false,tMean:[58.0,58.3,60.2,61.9,64.0,66.4,70.1,71.8,71.1,67.4,62.2,57.5],tSd:[4.08,3.91,3.72,3.94,3.43,2.92,3.21,3.27,3.97,4.06,4.29,3.62]},
  {id:'CA-san-francisco',st:'CA',city:'San Francisco',wmo:'724940',lat:37.62,lon:-122.365,elevFt:8,h996:40.3,h99:42.2,c1:78.1,c1mcwb:62.0,dr:16.0,hr1:77.9,hdd50:84,hdd65:2606,cdd65:173,zone:'3C',primary:false,tMean:[51.3,53.0,55.2,56.8,59.2,62.0,63.3,64.2,64.8,62.2,56.2,51.4],tSd:[3.78,3.99,4.17,4.34,4.25,4.22,3.29,3.44,4.65,4.55,4.20,4.11]},
  {id:'CA-sacramento',st:'CA',city:'Sacramento',wmo:'724839',lat:38.696,lon:-121.59,elevFt:23,h996:30.8,h99:33.6,c1:97.5,c1mcwb:69.1,dr:32.6,hr1:84.5,hdd50:309,hdd65:2475,cdd65:1348,zone:'3B',primary:false,tMean:[47.5,50.8,55.3,59.4,66.5,73.1,76.8,75.8,72.4,63.9,53.6,47.3],tSd:[4.74,4.61,5.21,6.01,6.28,5.95,4.91,4.61,5.09,5.36,5.57,5.38]},
  {id:'CA-fresno',st:'CA',city:'Fresno',wmo:'723890',lat:36.78,lon:-119.719,elevFt:333,h996:32.5,h99:34.8,c1:101.3,c1mcwb:68.6,dr:29.1,hr1:86.6,hdd50:246,hdd65:2138,cdd65:2223,zone:'3B',primary:false,tMean:[48.6,52.2,57.7,62.4,70.0,77.8,83.8,82.4,77.1,66.5,55.5,47.9],tSd:[5.00,4.92,5.93,7.01,7.11,6.80,5.11,4.68,6.06,6.04,5.87,5.11]},
  {id:'CA-truckee-tahoe',st:'CA',city:'Truckee-Tahoe',wmo:'725846',lat:39.32,lon:-120.139,elevFt:5900,h996:0.5,h99:6.7,c1:84.5,c1mcwb:56.8,dr:40.8,hr1:76.1,hdd50:3349,hdd65:7709,cdd65:48,zone:'5B',primary:false,tMean:[28.5,30.3,35.7,39.8,48.4,55.1,62.5,61.5,54.2,45.2,36.2,29.8],tSd:[8.23,7.06,6.89,7.00,6.81,6.04,5.12,4.22,5.43,6.93,8.03,8.40]},
  {id:'CO-denver',st:'CO',city:'Denver',wmo:'725650',lat:39.833,lon:-104.658,elevFt:5414,h996:-0.2,h99:5.8,c1:92.3,c1mcwb:59.7,dr:27.5,hr1:91.3,hdd50:2579,hdd65:5874,cdd65:827,zone:'5B',primary:true,tMean:[31.9,32.7,41.3,47.5,56.7,67.9,75.0,72.8,64.6,51.1,40.2,31.0],tSd:[11.11,11.55,10.65,9.47,8.82,7.36,5.22,5.15,8.47,10.29,11.06,11.45]},
  {id:'CO-colorado-springs',st:'CO',city:'Colorado Springs',wmo:'724660',lat:38.81,lon:-104.688,elevFt:6181,h996:2.3,h99:7.4,c1:88.7,c1mcwb:58.4,dr:26.0,hr1:92.0,hdd50:2613,hdd65:6013,cdd65:551,zone:'5B',primary:false,tMean:[31.6,32.8,40.5,46.8,56.1,66.7,71.8,69.5,62.6,50.1,39.7,31.2],tSd:[10.26,10.64,9.89,9.23,8.13,6.64,4.73,4.61,7.51,9.31,9.94,10.41]},
  {id:'CO-grand-junction',st:'CO',city:'Grand Junction',wmo:'724760',lat:39.12,lon:-108.525,elevFt:4833,h996:4.9,h99:10.9,c1:95.5,c1mcwb:60.3,dr:27.9,hr1:88.7,hdd50:2347,hdd65:5416,cdd65:1266,zone:'5B',primary:false,tMean:[28.6,35.6,45.2,52.0,61.9,73.4,79.7,76.4,67.3,53.3,40.2,28.9],tSd:[8.25,7.54,7.53,7.80,8.00,6.75,4.44,4.18,7.05,7.77,7.79,8.52]},
  {id:'CT-hartford',st:'CT',city:'Hartford',wmo:'725080',lat:41.938,lon:-72.682,elevFt:175,h996:3.9,h99:9.1,c1:88.7,c1mcwb:71.9,dr:20.2,hr1:119.6,hdd50:2617,hdd65:5828,cdd65:827,zone:'5A',primary:true,tMean:[27.0,29.7,37.9,49.7,60.0,68.9,74.4,72.5,65.2,53.4,42.5,33.0],tSd:[10.38,9.50,9.15,8.30,7.59,6.55,5.32,5.45,6.87,7.81,8.36,8.84]},
  {id:'DE-wilmington',st:'DE',city:'Wilmington',wmo:'724180',lat:39.674,lon:-75.606,elevFt:79,h996:12.8,h99:16.9,c1:89.5,c1mcwb:74.1,dr:17.1,hr1:129.0,hdd50:1814,hdd65:4677,cdd65:1202,zone:'4A',primary:true,tMean:[33.0,35.3,43.0,54.0,63.2,72.5,77.2,75.5,69.0,57.3,46.5,38.2],tSd:[9.91,9.11,9.01,8.15,7.47,6.14,4.90,4.83,6.48,7.93,7.98,8.58]},
  {id:'DC-washington',st:'DC',city:'Washington',wmo:'724050',lat:38.847,lon:-77.035,elevFt:10,h996:17.1,h99:20.7,c1:92.0,c1mcwb:74.7,dr:15.7,hr1:129.0,hdd50:1327,hdd65:3856,cdd65:1660,zone:'4A',primary:true,tMean:[36.7,39.5,47.2,57.9,66.8,75.8,80.2,78.9,72.2,60.5,49.5,41.4],tSd:[9.83,9.20,9.13,8.18,7.44,5.86,4.77,4.56,6.28,7.76,7.94,8.26]},
  {id:'FL-miami',st:'FL',city:'Miami',wmo:'722020',lat:25.7552,lon:-80.3836,elevFt:29,h996:49.0,h99:52.7,c1:90.9,c1mcwb:77.7,dr:11.6,hr1:145.3,hdd50:1,hdd65:112,cdd65:4660,zone:'1A',primary:true,tMean:[68.4,70.7,73.0,76.7,80.2,82.7,84.0,84.1,83.0,80.0,74.7,71.4],tSd:[6.91,6.18,5.34,3.74,2.69,2.43,2.10,2.07,2.17,3.50,4.58,6.46]},
  {id:'FL-orlando',st:'FL',city:'Orlando',wmo:'722050',lat:28.434,lon:-81.325,elevFt:90,h996:38.4,h99:42.4,c1:92.4,c1mcwb:76.3,dr:15.9,hr1:142.1,hdd50:27,hdd65:512,cdd65:3480,zone:'2A',primary:false,tMean:[60.5,63.9,67.5,72.4,77.6,81.2,82.5,82.6,81.0,75.6,68.3,63.9],tSd:[8.16,7.69,6.63,4.94,3.52,2.58,2.04,1.99,2.21,5.15,6.17,7.96]},
  {id:'FL-tampa',st:'FL',city:'Tampa',wmo:'722110',lat:27.962,lon:-82.54,elevFt:19,h996:39.8,h99:43.7,c1:91.3,c1mcwb:77.0,dr:12.9,hr1:143.0,hdd50:23,hdd65:481,cdd65:3733,zone:'2A',primary:false,tMean:[60.9,64.2,67.9,73.4,79.0,82.2,83.0,83.3,82.0,76.7,69.1,64.6],tSd:[8.21,7.65,6.69,4.86,3.48,2.58,2.17,2.13,2.49,5.14,6.31,8.03]},
  {id:'FL-jacksonville',st:'FL',city:'Jacksonville',wmo:'722060',lat:30.4839,lon:-81.7011,elevFt:36,h996:29.6,h99:32.8,c1:92.6,c1mcwb:76.8,dr:17.8,hr1:140.4,hdd50:157,hdd65:1268,cdd65:2676,zone:'2A',primary:false,tMean:[53.6,57.2,61.8,67.8,74.4,79.8,81.8,81.5,78.2,70.9,61.8,56.7],tSd:[9.35,8.77,7.92,6.30,4.97,3.36,2.43,2.41,3.40,6.54,7.79,9.19]},
  {id:'FL-tallahassee',st:'FL',city:'Tallahassee',wmo:'722140',lat:30.4459,lon:-84.3007,elevFt:173,h996:26.5,h99:30.0,c1:94.3,c1mcwb:75.8,dr:18.3,hr1:141.6,hdd50:208,hdd65:1441,cdd65:2768,zone:'2A',primary:false,tMean:[52.1,55.9,61.4,67.6,75.3,80.8,82.4,82.4,79.1,70.5,60.4,54.9],tSd:[9.37,8.76,7.99,6.31,4.96,3.36,2.66,2.68,3.98,7.27,8.12,9.41]},
  {id:'GA-atlanta',st:'GA',city:'Atlanta',wmo:'722190',lat:33.63,lon:-84.442,elevFt:1010,h996:21.7,h99:26.4,c1:91.6,c1mcwb:73.6,dr:16.5,hr1:128.5,hdd50:648,hdd65:2578,cdd65:1969,zone:'3A',primary:true,tMean:[44.2,48.3,55.2,63.1,71.0,77.6,80.2,79.7,74.5,64.2,53.9,47.1],tSd:[10.07,9.32,8.97,7.22,6.17,4.38,3.34,3.73,5.46,7.37,8.12,9.06]},
  {id:'HI-honolulu',st:'HI',city:'Honolulu',wmo:'911820',lat:21.324,lon:-157.929,elevFt:7,h996:63.5,h99:65.1,c1:88.7,c1mcwb:73.7,dr:11.8,hr1:127.6,hdd50:0,hdd65:0,cdd65:4721,zone:'1A',primary:true,tMean:[73.7,73.9,74.6,76.5,78.0,80.1,81.4,82.0,81.5,80.2,77.8,75.3],tSd:[2.46,2.41,2.33,2.27,2.31,1.69,1.69,1.63,1.81,2.00,2.25,2.38]},
  {id:'ID-boise',st:'ID',city:'Boise',wmo:'726810',lat:43.567,lon:-116.241,elevFt:2814,h996:11.4,h99:16.4,c1:95.9,c1mcwb:62.9,dr:29.4,hr1:71.6,hdd50:2071,hdd65:5311,cdd65:1062,zone:'5B',primary:true,tMean:[32.4,37.4,45.1,50.7,59.4,68.0,77.9,76.0,66.3,53.0,40.9,32.1],tSd:[7.90,6.91,6.67,7.12,8.01,7.81,6.10,6.17,7.85,7.92,8.20,8.36]},
  {id:'ID-idaho-falls',st:'ID',city:'Idaho Falls',wmo:'725785',lat:43.519,lon:-112.064,elevFt:4733,h996:-5.5,h99:0.4,c1:89.7,c1mcwb:60.5,dr:35.8,hr1:81.1,hdd50:3796,hdd65:7621,cdd65:295,zone:'6B',primary:false,tMean:[20.9,25.3,36.6,44.9,53.1,61.0,69.4,67.1,58.2,45.4,33.5,22.4],tSd:[10.02,9.84,8.24,6.67,7.02,6.73,4.14,4.61,7.05,7.72,9.00,10.05]},
  {id:'IL-chicago',st:'IL',city:'Chicago',wmo:'725300',lat:41.96,lon:-87.932,elevFt:662,h996:-1.7,h99:3.3,c1:88.5,c1mcwb:72.8,dr:17.6,hr1:124.0,hdd50:2961,hdd65:6157,cdd65:919,zone:'5A',primary:true,tMean:[24.1,27.8,38.1,49.1,59.7,69.8,74.6,73.1,66.0,53.7,40.7,29.7],tSd:[11.77,11.35,10.98,9.11,8.89,7.41,5.85,5.27,7.53,8.81,9.63,10.71]},
  {id:'IL-rockford',st:'IL',city:'Rockford',wmo:'725430',lat:42.193,lon:-89.093,elevFt:730,h996:-6.2,h99:-0.5,c1:88.0,c1mcwb:73.0,dr:19.5,hr1:126.8,hdd50:3300,hdd65:6531,cdd65:813,zone:'5A',primary:false,tMean:[21.3,25.2,37.0,49.1,60.0,69.9,73.5,71.7,64.7,52.2,38.7,27.1],tSd:[12.36,11.90,11.26,9.17,8.48,6.62,5.59,5.12,7.70,9.07,9.78,11.17]},
  {id:'IL-springfield',st:'IL',city:'Springfield',wmo:'724390',lat:39.845,lon:-89.684,elevFt:594,h996:0.5,h99:6.2,c1:90.6,c1mcwb:75.9,dr:19.4,hr1:135.8,hdd50:2414,hdd65:5284,cdd65:1208,zone:'5A',primary:false,tMean:[27.3,32.0,42.7,54.3,64.7,73.2,76.1,74.6,67.8,55.9,43.4,32.6],tSd:[12.41,11.88,11.35,9.48,8.58,6.46,5.66,5.39,7.91,9.66,10.25,11.00]},
  {id:'IN-indianapolis',st:'IN',city:'Indianapolis',wmo:'724380',lat:39.725,lon:-86.282,elevFt:791,h996:1.8,h99:7.5,c1:88.9,c1mcwb:73.9,dr:17.6,hr1:129.6,hdd50:2346,hdd65:5224,cdd65:1160,zone:'4A',primary:true,tMean:[28.2,32.5,42.4,53.9,63.7,72.6,75.7,74.9,68.2,55.9,43.5,33.4],tSd:[12.55,11.65,11.23,9.32,8.32,5.97,5.27,4.84,7.26,8.95,9.77,10.70]},
  {id:'IN-south-bend',st:'IN',city:'South Bend',wmo:'725350',lat:41.707,lon:-86.316,elevFt:773,h996:-0.4,h99:5.0,c1:87.5,c1mcwb:72.4,dr:18.8,hr1:124.5,hdd50:2975,hdd65:6187,cdd65:804,zone:'5A',primary:false,tMean:[24.5,27.8,37.5,49.2,59.8,69.6,73.0,71.4,64.9,53.0,40.5,30.4],tSd:[11.67,10.98,11.28,9.67,9.01,7.10,5.74,5.30,7.60,8.79,9.52,10.33]},
  {id:'IA-des-moines',st:'IA',city:'Des Moines',wmo:'725460',lat:41.534,lon:-93.653,elevFt:957,h996:-4.4,h99:0.4,c1:90.1,c1mcwb:75.0,dr:17.8,hr1:132.9,hdd50:3040,hdd65:6065,cdd65:1127,zone:'5A',primary:true,tMean:[22.6,27.0,39.5,51.9,62.6,72.4,76.6,74.4,67.0,53.9,40.2,28.0],tSd:[12.57,12.57,12.15,9.91,8.39,6.30,5.60,5.37,8.02,9.53,10.57,11.55]},
  {id:'IA-waterloo',st:'IA',city:'Waterloo',wmo:'725480',lat:42.554,lon:-92.401,elevFt:868,h996:-9.9,h99:-4.7,c1:88.1,c1mcwb:73.8,dr:19.9,hr1:131.2,hdd50:3708,hdd65:6977,cdd65:781,zone:'6A',primary:false,tMean:[18.2,22.6,35.4,48.4,60.2,70.2,73.2,70.8,63.9,50.7,36.7,24.2],tSd:[13.01,12.83,12.16,9.78,8.42,6.27,5.71,5.43,8.18,9.55,10.58,12.06]},
  {id:'KS-wichita',st:'KS',city:'Wichita',wmo:'724500',lat:37.648,lon:-97.43,elevFt:1321,h996:7.9,h99:12.4,c1:97.3,c1mcwb:74.2,dr:21.0,hr1:129.5,hdd50:1763,hdd65:4370,cdd65:1788,zone:'4A',primary:true,tMean:[33.4,37.5,47.4,56.7,66.9,76.9,81.4,80.0,72.1,59.3,46.5,35.4],tSd:[10.51,11.33,10.97,9.17,7.93,6.19,5.70,5.61,7.82,9.16,9.50,9.86]},
  {id:'KS-topeka',st:'KS',city:'Topeka',wmo:'724560',lat:39.0722,lon:-95.6306,elevFt:881,h996:4.0,h99:8.9,c1:94.9,c1mcwb:76.1,dr:19.9,hr1:133.2,hdd50:2081,hdd65:4823,cdd65:1557,zone:'4A',primary:false,tMean:[30.3,34.8,45.5,55.7,65.9,75.6,79.9,78.1,69.6,57.4,44.8,33.8],tSd:[11.32,11.74,11.47,9.43,8.21,6.24,5.97,6.11,8.07,9.32,9.80,10.43]},
  {id:'KY-louisville',st:'KY',city:'Louisville',wmo:'724230',lat:38.181,lon:-85.739,elevFt:488,h996:10.2,h99:15.7,c1:91.7,c1mcwb:74.8,dr:16.8,hr1:130.4,hdd50:1535,hdd65:4010,cdd65:1678,zone:'4A',primary:true,tMean:[35.0,39.1,47.9,58.9,67.9,76.1,79.2,78.6,71.8,60.1,48.2,39.4],tSd:[12.03,11.33,10.69,9.20,7.73,5.54,4.68,4.68,7.11,8.72,9.46,10.47]},
  {id:'KY-lexington',st:'KY',city:'Lexington',wmo:'724220',lat:38.041,lon:-84.606,elevFt:980,h996:7.7,h99:13.3,c1:89.4,c1mcwb:73.4,dr:18.0,hr1:127.4,hdd50:1809,hdd65:4483,cdd65:1261,zone:'4A',primary:false,tMean:[33.1,37.2,45.5,56.2,65.2,73.1,76.2,75.6,69.3,57.7,46.0,37.7],tSd:[12.49,11.70,10.97,9.30,7.82,5.46,4.46,4.67,7.11,8.93,9.60,10.62]},
  {id:'LA-new-orleans',st:'LA',city:'New Orleans',wmo:'722310',lat:29.997,lon:-90.278,elevFt:4,h996:33.1,h99:36.6,c1:92.8,c1mcwb:77.7,dr:14.0,hr1:146.1,hdd50:149,hdd65:1193,cdd65:3143,zone:'3A',primary:true,tMean:[54.0,57.8,63.5,69.9,77.1,82.0,83.4,83.7,80.6,72.3,62.6,56.5],tSd:[9.71,9.28,7.83,6.05,4.44,2.93,2.49,2.66,3.88,6.78,7.75,9.19]},
  {id:'LA-shreveport',st:'LA',city:'Shreveport',wmo:'722480',lat:32.4511,lon:-93.8414,elevFt:280,h996:25.9,h99:29.0,c1:96.9,c1mcwb:75.9,dr:19.8,hr1:138.0,hdd50:446,hdd65:2043,cdd65:2694,zone:'3A',primary:false,tMean:[48.1,51.9,58.9,66.1,74.2,80.9,83.8,84.1,78.4,67.6,57.0,49.5],tSd:[10.25,10.23,9.13,7.27,5.77,3.84,3.40,4.15,5.66,7.78,8.89,9.63]},
  {id:'ME-portland',st:'ME',city:'Portland',wmo:'726060',lat:43.65,lon:-70.317,elevFt:45,h996:0.1,h99:5.0,c1:83.3,c1mcwb:69.9,dr:17.1,hr1:109.1,hdd50:3254,hdd65:6891,cdd65:402,zone:'6A',primary:true,tMean:[23.5,25.9,33.7,44.4,54.3,63.6,69.8,68.6,61.4,50.2,39.7,30.2],tSd:[10.49,9.45,8.61,6.94,6.62,6.56,5.03,4.89,6.60,7.17,8.09,8.93]},
  {id:'ME-caribou',st:'ME',city:'Caribou',wmo:'727120',lat:46.871,lon:-68.017,elevFt:624,h996:-13.7,h99:-8.9,c1:81.4,c1mcwb:66.9,dr:19.4,hr1:101.5,hdd50:5083,hdd65:9092,cdd65:212,zone:'7',primary:false,tMean:[11.7,14.4,24.8,38.2,51.8,61.0,66.6,64.5,56.6,44.6,32.4,19.7],tSd:[12.50,11.40,10.40,7.66,7.31,6.70,5.27,5.56,7.26,7.68,9.06,10.88]},
  {id:'MD-baltimore',st:'MD',city:'Baltimore',wmo:'724060',lat:39.173,lon:-76.684,elevFt:156,h996:13.5,h99:17.5,c1:91.3,c1mcwb:74.2,dr:18.6,hr1:127.8,hdd50:1698,hdd65:4475,cdd65:1314,zone:'4A',primary:true,tMean:[34.0,36.5,44.4,55.3,64.4,73.5,77.9,76.1,69.4,57.7,46.9,38.8],tSd:[10.14,9.30,9.40,8.49,7.75,6.22,5.02,4.89,6.53,8.03,8.21,8.61]},
  {id:'MA-boston',st:'MA',city:'Boston',wmo:'725090',lat:42.361,lon:-71.01,elevFt:12,h996:7.7,h99:12.8,c1:87.7,c1mcwb:71.6,dr:14.7,hr1:116.1,hdd50:2284,hdd65:5498,cdd65:812,zone:'5A',primary:true,tMean:[29.9,32.0,38.4,48.8,58.3,67.9,74.3,72.8,66.0,55.2,45.0,36.1],tSd:[10.16,9.04,8.65,7.78,7.59,7.36,5.81,5.48,6.35,7.14,8.05,8.60]},
  {id:'MA-worcester',st:'MA',city:'Worcester',wmo:'725100',lat:42.271,lon:-71.873,elevFt:1000,h996:1.7,h99:6.8,c1:83.4,c1mcwb:69.7,dr:15.9,hr1:115.9,hdd50:3096,hdd65:6561,cdd65:523,zone:'5A',primary:false,tMean:[24.7,27.2,34.6,46.4,56.6,65.4,70.9,69.4,62.5,51.0,40.4,30.8],tSd:[10.81,9.91,9.63,8.81,7.99,6.87,5.23,5.16,6.80,7.85,8.90,9.30]},
  {id:'MI-detroit',st:'MI',city:'Detroit',wmo:'725370',lat:42.231,lon:-83.331,elevFt:631,h996:2.1,h99:7.3,c1:87.5,c1mcwb:72.4,dr:18.1,hr1:121.8,hdd50:2848,hdd65:6036,cdd65:868,zone:'5A',primary:true,tMean:[25.5,28.1,37.2,49.1,60.3,70.1,74.1,72.5,65.5,53.4,41.4,31.3],tSd:[11.04,10.22,10.47,8.88,8.35,6.62,5.41,5.04,7.19,8.35,8.88,9.35]},
  {id:'MI-grand-rapids',st:'MI',city:'Grand Rapids',wmo:'726350',lat:42.883,lon:-85.524,elevFt:803,h996:2.0,h99:6.8,c1:86.7,c1mcwb:71.7,dr:19.3,hr1:120.4,hdd50:3151,hdd65:6486,cdd65:698,zone:'5A',primary:false,tMean:[24.2,26.2,35.3,47.4,58.8,68.6,72.4,70.7,63.6,51.4,39.7,30.0],tSd:[10.43,10.22,11.07,9.16,8.59,6.71,5.64,5.34,7.46,8.44,8.80,9.09]},
  {id:'MI-marquette',st:'MI',city:'Marquette',wmo:'727430',lat:46.531,lon:-87.549,elevFt:1415,h996:-15.1,h99:-8.9,c1:80.7,c1mcwb:65.7,dr:20.5,hr1:99.9,hdd50:5360,hdd65:9606,cdd65:171,zone:'7',primary:false,tMean:[13.4,16.4,23.9,36.0,49.1,59.6,62.6,61.8,53.7,42.9,28.7,20.5],tSd:[11.29,12.42,11.47,10.52,9.88,8.92,6.60,7.05,8.69,8.35,8.57,10.95]},
  {id:'MN-minneapolis',st:'MN',city:'Minneapolis',wmo:'726580',lat:44.883,lon:-93.229,elevFt:872,h996:-10.6,h99:-6.0,c1:87.9,c1mcwb:72.0,dr:17.4,hr1:121.0,hdd50:4064,hdd65:7396,cdd65:834,zone:'6A',primary:true,tMean:[15.9,20.2,33.1,47.1,59.3,69.6,74.5,71.8,64.1,49.9,35.2,21.8],tSd:[12.75,12.15,12.17,10.07,8.62,6.84,5.70,5.45,8.33,9.22,10.66,11.55]},
  {id:'MN-duluth',st:'MN',city:'Duluth',wmo:'727450',lat:46.837,lon:-92.183,elevFt:1433,h996:-17.3,h99:-12.1,c1:81.4,c1mcwb:67.5,dr:19.0,hr1:105.5,hdd50:5212,hdd65:9173,cdd65:242,zone:'7',primary:false,tMean:[10.8,14.9,26.7,39.2,51.4,60.9,66.9,65.2,57.4,44.4,30.1,16.9],tSd:[13.35,12.38,11.84,9.01,7.97,6.85,5.98,5.64,7.88,8.41,10.62,12.02]},
  {id:'MN-international-falls',st:'MN',city:'International Falls',wmo:'727470',lat:48.561,lon:-93.398,elevFt:1183,h996:-26.2,h99:-20.8,c1:82.2,c1mcwb:67.7,dr:23.3,hr1:106.0,hdd50:5925,hdd65:9984,cdd65:195,zone:'7',primary:false,tMean:[5.5,10.1,24.1,38.6,51.3,61.3,65.6,63.2,55.2,42.2,27.0,12.3],tSd:[15.04,14.08,13.63,9.74,8.61,6.97,5.75,6.06,8.34,8.75,11.42,13.76]},
  {id:'MS-jackson',st:'MS',city:'Jackson',wmo:'722350',lat:32.321,lon:-90.078,elevFt:330,h996:23.3,h99:26.8,c1:94.3,c1mcwb:75.9,dr:18.9,hr1:136.8,hdd50:519,hdd65:2210,cdd65:2381,zone:'3A',primary:true,tMean:[47.0,50.9,57.8,65.0,73.0,79.5,81.8,81.7,76.8,66.3,55.7,49.2],tSd:[10.79,10.32,9.20,7.32,5.76,3.77,3.07,3.48,5.35,7.95,8.76,10.17]},
  {id:'MO-st-louis',st:'MO',city:'St. Louis',wmo:'724340',lat:38.753,lon:-90.374,elevFt:531,h996:6.8,h99:12.2,c1:93.5,c1mcwb:76.2,dr:16.8,hr1:133.3,hdd50:1804,hdd65:4379,cdd65:1736,zone:'3A',primary:true,tMean:[32.3,36.7,46.8,57.9,67.7,76.6,80.3,79.0,71.4,59.5,46.9,36.7],tSd:[11.89,11.64,11.24,9.61,8.20,6.35,5.76,5.44,7.53,9.30,10.03,10.51]},
  {id:'MO-kansas-city',st:'MO',city:'Kansas City',wmo:'724460',lat:39.297,lon:-94.731,elevFt:1005,h996:2.4,h99:7.2,c1:92.4,c1mcwb:76.3,dr:18.5,hr1:137.8,hdd50:2207,hdd65:4977,cdd65:1409,zone:'4A',primary:false,tMean:[29.3,33.7,44.6,55.2,65.0,74.3,78.5,77.1,69.0,56.9,44.4,33.2],tSd:[12.12,12.14,11.76,9.70,8.04,6.00,5.64,5.67,7.81,9.28,10.26,11.02]},
  {id:'MT-billings',st:'MT',city:'Billings',wmo:'726770',lat:45.807,lon:-108.542,elevFt:3581,h996:-8.6,h99:-2.7,c1:91.7,c1mcwb:61.9,dr:26.6,hr1:82.6,hdd50:3210,hdd65:6746,cdd65:687,zone:'6B',primary:true,tMean:[27.2,28.9,37.8,45.9,55.1,64.7,74.1,71.9,61.7,48.3,36.6,27.3],tSd:[13.32,13.94,12.59,9.47,8.34,7.34,5.93,6.32,9.11,9.86,12.23,12.92]},
  {id:'MT-great-falls',st:'MT',city:'Great Falls',wmo:'727760',lat:47.4614,lon:-111.3847,elevFt:3711,h996:-15.1,h99:-8.9,c1:89.5,c1mcwb:60.1,dr:30.7,hr1:75.2,hdd50:3711,hdd65:7593,cdd65:350,zone:'6B',primary:false,tMean:[25.9,26.1,34.3,42.7,51.7,59.8,69.1,67.3,57.9,45.4,34.3,25.9],tSd:[15.58,15.22,13.35,9.36,8.14,6.96,6.40,6.61,9.00,10.13,13.69,14.80]},
  {id:'MT-missoula',st:'MT',city:'Missoula',wmo:'727730',lat:46.921,lon:-114.093,elevFt:3192,h996:-1.7,h99:4.3,c1:90.0,c1mcwb:61.1,dr:32.7,hr1:75.4,hdd50:3450,hdd65:7331,cdd65:352,zone:'6B',primary:false,tMean:[25.7,29.1,37.7,44.7,53.3,60.4,69.7,67.9,58.2,44.6,33.1,25.1],tSd:[9.70,9.28,7.39,6.36,7.02,7.01,5.89,5.56,7.28,7.26,8.25,9.35]},
  {id:'NE-omaha',st:'NE',city:'Omaha',wmo:'725500',lat:41.31,lon:-95.899,elevFt:982,h996:-2.8,h99:1.6,c1:92.1,c1mcwb:75.3,dr:19.0,hr1:134.5,hdd50:2940,hdd65:5947,cdd65:1233,zone:'5A',primary:true,tMean:[23.8,28.0,40.3,52.2,63.1,73.3,77.6,75.1,67.5,54.2,40.3,28.0],tSd:[12.12,12.24,12.18,9.98,8.58,6.73,5.99,5.66,8.28,9.48,10.10,10.99]},
  {id:'NE-north-platte',st:'NE',city:'North Platte',wmo:'725620',lat:41.1328,lon:-100.7,elevFt:2783,h996:-3.7,h99:1.3,c1:93.0,c1mcwb:70.7,dr:25.8,hr1:121.5,hdd50:3108,hdd65:6463,cdd65:877,zone:'5A',primary:false,tMean:[26.1,28.7,39.0,47.8,58.0,69.3,75.3,72.9,64.1,49.8,37.0,26.9],tSd:[10.95,11.41,10.90,9.40,8.57,7.20,5.70,5.73,8.76,9.19,9.69,10.16]},
  {id:'NV-las-vegas',st:'NV',city:'Las Vegas',wmo:'723860',lat:36.072,lon:-115.163,elevFt:2180,h996:32.8,h99:35.4,c1:106.7,c1mcwb:66.4,dr:21.5,hr1:94.7,hdd50:232,hdd65:1841,cdd65:3681,zone:'3B',primary:true,tMean:[49.6,53.1,61.0,67.4,77.0,87.8,93.2,91.4,83.3,69.9,57.3,48.3],tSd:[5.45,6.38,6.97,7.65,7.91,6.82,4.69,4.30,6.02,7.05,6.88,5.47]},
  {id:'NV-reno',st:'NV',city:'Reno',wmo:'724880',lat:39.484,lon:-119.771,elevFt:4410,h996:15.9,h99:19.5,c1:94.4,c1mcwb:60.4,dr:31.7,hr1:67.0,hdd50:1663,hdd65:4817,cdd65:973,zone:'5B',primary:false,tMean:[36.7,39.8,46.0,50.8,59.5,68.9,76.9,74.5,66.2,54.2,43.4,35.7],tSd:[6.87,6.71,6.94,7.59,7.75,7.46,5.06,4.67,6.62,7.14,7.37,7.75]},
  {id:'NH-manchester',st:'NH',city:'Manchester',wmo:'743945',lat:42.93,lon:-71.436,elevFt:221,h996:1.8,h99:7.0,c1:88.4,c1mcwb:70.4,dr:19.0,hr1:114.8,hdd50:2880,hdd65:6191,cdd65:761,zone:'5A',primary:true,tMean:[25.4,28.2,36.1,48.1,58.9,68.0,73.8,72.0,64.4,52.3,41.4,31.5],tSd:[10.56,9.59,9.26,8.33,7.75,7.17,5.47,5.30,6.95,7.57,8.52,8.82]},
  {id:'NH-concord',st:'NH',city:'Concord',wmo:'726050',lat:43.205,lon:-71.503,elevFt:343,h996:-3.1,h99:1.9,c1:87.2,c1mcwb:69.9,dr:22.6,hr1:112.6,hdd50:3458,hdd65:7010,cdd65:503,zone:'5A',primary:false,tMean:[22.0,24.8,33.2,45.3,56.3,65.5,70.8,69.2,61.4,49.3,38.5,28.3],tSd:[11.06,10.01,9.49,8.30,7.59,6.84,5.38,5.55,7.33,7.82,8.53,9.10]},
  {id:'NJ-newark',st:'NJ',city:'Newark',wmo:'725020',lat:40.683,lon:-74.169,elevFt:7,h996:12.1,h99:16.2,c1:91.1,c1mcwb:72.8,dr:16.1,hr1:123.8,hdd50:1810,hdd65:4646,cdd65:1285,zone:'4A',primary:true,tMean:[32.6,35.3,42.7,53.7,63.3,72.8,78.1,76.5,69.5,58.0,47.2,38.4],tSd:[10.06,9.25,8.99,8.25,7.50,6.61,5.30,5.01,6.33,7.60,8.18,8.73]},
  {id:'NM-albuquerque',st:'NM',city:'Albuquerque',wmo:'723650',lat:35.038,lon:-106.622,elevFt:5312,h996:19.0,h99:22.4,c1:93.4,c1mcwb:59.6,dr:22.9,hr1:94.8,hdd50:1253,hdd65:3873,cdd65:1488,zone:'4B',primary:true,tMean:[38.0,42.5,50.0,57.0,66.4,76.8,79.2,77.1,70.7,58.6,46.6,37.6],tSd:[6.37,7.01,7.05,7.11,6.79,4.83,3.83,3.71,5.33,7.01,7.06,6.69]},
  {id:'NM-santa-fe',st:'NM',city:'Santa Fe',wmo:'723656',lat:35.617,lon:-106.089,elevFt:6344,h996:10.2,h99:14.7,c1:90.3,c1mcwb:57.8,dr:28.0,hr1:91.2,hdd50:2105,hdd65:5275,cdd65:710,zone:'5B',primary:false,tMean:[32.8,36.5,43.9,50.6,59.7,70.3,73.5,71.1,65.0,52.9,40.9,31.8],tSd:[6.89,7.40,7.07,6.79,6.81,5.05,3.64,3.56,5.04,6.85,7.37,7.23]},
  {id:'NY-new-york-city',st:'NY',city:'New York City',wmo:'725030',lat:40.779,lon:-73.88,elevFt:11,h996:13.6,h99:17.9,c1:89.8,c1mcwb:72.5,dr:13.4,hr1:121.7,hdd50:1675,hdd65:4476,cdd65:1332,zone:'4A',primary:true,tMean:[33.7,35.9,42.6,53.3,63.0,72.6,78.5,77.2,70.5,59.4,48.6,39.8],tSd:[9.81,8.83,8.47,7.63,7.29,6.59,5.19,5.00,6.03,7.32,7.83,8.43]},
  {id:'NY-albany',st:'NY',city:'Albany',wmo:'725180',lat:42.747,lon:-73.799,elevFt:280,h996:-0.7,h99:4.3,c1:86.3,c1mcwb:71.1,dr:18.9,hr1:115.6,hdd50:3085,hdd65:6418,cdd65:686,zone:'5A',primary:false,tMean:[23.8,26.7,35.4,47.7,59.1,68.0,72.8,71.1,63.6,51.3,40.3,30.3],tSd:[11.66,10.13,9.91,8.71,7.76,6.37,5.14,5.23,7.09,7.84,8.66,9.09]},
  {id:'NY-buffalo',st:'NY',city:'Buffalo',wmo:'725280',lat:42.9411,lon:-78.7189,elevFt:715,h996:2.5,h99:6.8,c1:83.9,c1mcwb:70.0,dr:16.0,hr1:116.0,hdd50:3092,hdd65:6449,cdd65:606,zone:'5A',primary:false,tMean:[25.2,26.5,34.0,45.6,57.8,67.0,71.6,70.3,63.8,52.1,41.1,31.5],tSd:[11.35,10.52,10.48,8.97,8.30,6.50,5.07,4.94,6.96,8.17,8.81,9.26]},
  {id:'NY-syracuse',st:'NY',city:'Syracuse',wmo:'725190',lat:43.111,lon:-76.104,elevFt:413,h996:-1.5,h99:4.1,c1:86.4,c1mcwb:71.4,dr:18.8,hr1:115.1,hdd50:3149,hdd65:6504,cdd65:644,zone:'5A',primary:false,tMean:[24.1,26.0,34.0,46.5,58.5,67.4,72.1,70.6,63.5,51.9,40.7,30.7],tSd:[12.31,10.60,10.63,9.10,8.27,6.72,5.43,5.29,7.15,8.01,8.88,9.50]},
  {id:'NC-charlotte',st:'NC',city:'Charlotte',wmo:'723140',lat:35.224,lon:-80.955,elevFt:728,h996:21.0,h99:24.8,c1:91.9,c1mcwb:74.0,dr:18.6,hr1:127.9,hdd50:843,hdd65:3030,cdd65:1742,zone:'3A',primary:true,tMean:[42.0,45.8,52.7,61.4,69.2,76.6,79.5,78.5,72.6,61.9,51.4,45.1],tSd:[9.88,9.21,9.12,7.60,6.41,4.85,3.73,3.92,5.69,7.60,8.14,8.84]},
  {id:'NC-raleigh',st:'NC',city:'Raleigh',wmo:'723060',lat:35.892,lon:-78.782,elevFt:416,h996:19.7,h99:23.6,c1:92.6,c1mcwb:75.1,dr:19.1,hr1:130.5,hdd50:940,hdd65:3188,cdd65:1745,zone:'3A',primary:false,tMean:[41.4,44.7,51.5,60.8,68.7,76.5,79.9,78.5,72.3,61.5,51.2,44.7],tSd:[10.50,9.67,9.53,8.32,7.02,5.37,4.15,4.54,5.96,7.97,8.54,9.38]},
  {id:'NC-asheville',st:'NC',city:'Asheville',wmo:'723150',lat:35.432,lon:-82.538,elevFt:2117,h996:14.9,h99:19.4,c1:85.9,c1mcwb:70.2,dr:18.4,hr1:120.1,hdd50:1316,hdd65:4000,cdd65:912,zone:'4A',primary:false,tMean:[37.5,41.2,47.6,56.4,64.1,71.0,73.8,73.1,67.4,57.2,47.2,40.9],tSd:[9.88,9.00,8.81,7.39,6.17,4.25,3.46,3.41,5.32,7.25,7.94,8.71]},
  {id:'ND-fargo',st:'ND',city:'Fargo',wmo:'727530',lat:46.925,lon:-96.811,elevFt:900,h996:-18.7,h99:-13.9,c1:87.0,c1mcwb:70.4,dr:20.9,hr1:114.3,hdd50:5119,hdd65:8685,cdd65:571,zone:'6A',primary:true,tMean:[9.3,13.5,27.4,43.4,56.7,67.0,71.4,69.1,60.9,46.4,30.3,16.1],tSd:[14.37,13.69,13.46,10.52,9.18,6.85,5.75,5.90,8.67,9.49,11.52,12.84]},
  {id:'ND-bismarck',st:'ND',city:'Bismarck',wmo:'727640',lat:46.783,lon:-100.757,elevFt:1651,h996:-17.5,h99:-11.8,c1:89.4,c1mcwb:69.3,dr:24.9,hr1:111.8,hdd50:4784,hdd65:8414,cdd65:555,zone:'6A',primary:false,tMean:[13.0,17.1,29.6,43.4,55.4,65.6,71.9,69.8,60.3,45.5,30.4,17.9],tSd:[14.53,13.82,13.51,10.25,8.42,6.86,5.93,6.29,8.49,9.17,11.26,12.81]},
  {id:'OH-columbus',st:'OH',city:'Columbus',wmo:'724280',lat:39.991,lon:-82.877,elevFt:816,h996:4.5,h99:9.8,c1:88.9,c1mcwb:72.5,dr:18.0,hr1:123.0,hdd50:2268,hdd65:5161,cdd65:1098,zone:'4A',primary:true,tMean:[29.4,32.7,41.8,53.7,63.5,72.3,75.4,74.3,67.7,55.8,43.9,34.8],tSd:[12.38,11.33,11.00,9.26,8.31,6.10,4.93,4.83,6.96,8.73,9.37,10.06]},
  {id:'OH-cleveland',st:'OH',city:'Cleveland',wmo:'725240',lat:41.406,lon:-81.852,elevFt:781,h996:3.6,h99:9.0,c1:87.2,c1mcwb:72.4,dr:16.8,hr1:121.1,hdd50:2616,hdd65:5737,cdd65:853,zone:'5A',primary:false,tMean:[27.7,30.1,37.9,49.7,60.4,69.8,73.5,72.2,65.8,54.5,43.2,33.4],tSd:[11.83,11.31,11.05,9.67,8.81,6.95,5.47,5.21,7.14,8.50,9.29,9.88]},
  {id:'OH-cincinnati',st:'OH',city:'Cincinnati',wmo:'724210',lat:39.044,lon:-84.672,elevFt:883,h996:5.3,h99:11.0,c1:89.0,c1mcwb:73.4,dr:18.0,hr1:128.7,hdd50:2076,hdd65:4879,cdd65:1167,zone:'4A',primary:false,tMean:[30.9,34.7,43.6,54.9,64.2,72.4,75.7,75.1,68.4,56.5,44.6,35.8],tSd:[12.45,11.58,11.02,9.31,7.94,5.65,4.80,4.77,7.13,8.92,9.66,10.53]},
  {id:'OK-oklahoma-city',st:'OK',city:'Oklahoma City',wmo:'723530',lat:35.389,lon:-97.601,elevFt:1285,h996:14.6,h99:19.0,c1:97.6,c1mcwb:74.2,dr:21.6,hr1:130.2,hdd50:1133,hdd65:3398,cdd65:2038,zone:'3A',primary:true,tMean:[39.2,43.2,52.0,60.4,69.3,77.9,82.5,81.8,74.0,62.3,50.7,40.8],tSd:[10.22,11.17,10.57,8.29,7.30,5.05,4.70,5.05,7.09,8.53,9.27,9.46]},
  {id:'OK-tulsa',st:'OK',city:'Tulsa',wmo:'723560',lat:36.199,lon:-95.887,elevFt:650,h996:13.6,h99:18.2,c1:97.2,c1mcwb:76.2,dr:19.0,hr1:134.3,hdd50:1172,hdd65:3411,cdd65:2152,zone:'3A',primary:false,tMean:[38.6,42.8,51.9,61.0,69.8,78.6,83.3,82.4,74.2,62.6,51.1,41.0],tSd:[11.02,11.43,10.86,8.67,7.45,5.58,5.45,5.62,7.53,8.80,9.57,10.05]},
  {id:'OR-portland',st:'OR',city:'Portland',wmo:'726980',lat:45.596,lon:-122.609,elevFt:19,h996:25.9,h99:29.4,c1:87.5,c1mcwb:66.3,dr:21.6,hr1:81.4,hdd50:983,hdd65:4179,cdd65:484,zone:'4C',primary:true,tMean:[41.7,43.7,48.0,52.4,59.0,63.9,70.0,70.4,65.1,55.3,47.1,41.3],tSd:[5.74,5.37,4.89,5.38,6.08,5.80,5.31,4.79,5.34,4.98,5.74,5.85]},
  {id:'OR-pendleton-e-oregon',st:'OR',city:'Pendleton (E. Oregon)',wmo:'726880',lat:45.698,lon:-118.855,elevFt:1486,h996:8.6,h99:15.7,c1:93.8,c1mcwb:63.7,dr:30.4,hr1:71.3,hdd50:1872,hdd65:5233,cdd65:687,zone:'5B',primary:false,tMean:[35.3,38.3,44.9,50.3,58.1,64.9,73.8,72.4,64.0,51.6,41.4,34.4],tSd:[9.61,8.29,6.46,5.98,6.90,6.65,6.13,5.91,6.63,6.75,8.65,9.47]},
  {id:'PA-philadelphia',st:'PA',city:'Philadelphia',wmo:'724080',lat:39.873,lon:-75.227,elevFt:10,h996:13.8,h99:17.8,c1:90.8,c1mcwb:73.9,dr:16.1,hr1:126.9,hdd50:1672,hdd65:4410,cdd65:1403,zone:'4A',primary:true,tMean:[33.8,36.2,44.0,55.1,64.6,73.8,78.9,77.2,70.4,58.8,47.8,39.1],tSd:[9.96,9.12,8.92,8.16,7.33,6.15,4.87,4.83,6.28,7.64,8.11,8.60]},
  {id:'PA-pittsburgh',st:'PA',city:'Pittsburgh',wmo:'725200',lat:40.5317,lon:-80.2172,elevFt:1203,h996:4.3,h99:9.2,c1:86.4,c1mcwb:70.8,dr:18.0,hr1:119.1,hdd50:2467,hdd65:5518,cdd65:816,zone:'5A',primary:false,tMean:[28.6,31.5,39.9,52.0,61.4,69.7,73.1,71.9,65.4,53.8,42.8,34.0],tSd:[12.30,11.36,11.23,9.59,8.11,6.14,4.91,4.89,6.84,8.61,9.36,10.10]},
  {id:'PA-harrisburg',st:'PA',city:'Harrisburg',wmo:'725118',lat:40.217,lon:-76.851,elevFt:340,h996:11.0,h99:15.5,c1:89.7,c1mcwb:72.8,dr:18.6,hr1:121.3,hdd50:2061,hdd65:4974,cdd65:1136,zone:'4A',primary:false,tMean:[31.1,33.3,41.8,53.7,63.4,71.9,76.5,74.9,68.1,56.3,45.3,36.0],tSd:[9.51,8.95,9.31,8.62,7.77,5.97,5.00,5.03,6.58,8.33,7.90,8.30]},
  {id:'PA-erie',st:'PA',city:'Erie',wmo:'725260',lat:42.08,lon:-80.182,elevFt:729,h996:4.8,h99:9.7,c1:84.4,c1mcwb:71.8,dr:14.6,hr1:118.1,hdd50:2773,hdd65:6021,cdd65:700,zone:'5A',primary:false,tMean:[27.4,28.5,35.6,46.9,58.3,67.8,72.1,71.1,64.9,54.1,43.1,33.7],tSd:[11.27,11.22,10.98,9.49,8.88,6.96,5.30,5.02,6.94,8.13,8.82,9.07]},
  {id:'RI-providence',st:'RI',city:'Providence',wmo:'725070',lat:41.723,lon:-71.433,elevFt:55,h996:8.1,h99:12.8,c1:86.8,c1mcwb:72.1,dr:16.8,hr1:121.7,hdd50:2276,hdd65:5477,cdd65:798,zone:'5A',primary:true,tMean:[30.0,32.0,38.8,49.3,58.8,68.0,74.3,72.9,65.8,54.6,44.5,35.8],tSd:[10.03,9.05,8.47,7.20,7.04,6.53,5.12,5.14,6.15,7.32,8.17,8.70]},
  {id:'SC-columbia',st:'SC',city:'Columbia',wmo:'723100',lat:33.942,lon:-81.118,elevFt:225,h996:23.5,h99:27.0,c1:94.8,c1mcwb:74.9,dr:19.1,hr1:132.2,hdd50:544,hdd65:2374,cdd65:2297,zone:'3A',primary:true,tMean:[46.0,49.6,56.4,64.8,72.7,79.5,82.3,81.3,75.8,65.1,54.4,48.4],tSd:[9.89,9.11,8.89,7.45,6.27,4.50,3.53,3.86,5.48,7.73,8.26,9.16]},
  {id:'SD-sioux-falls',st:'SD',city:'Sioux Falls',wmo:'726510',lat:43.578,lon:-96.754,elevFt:1428,h996:-11.1,h99:-6.3,c1:88.3,c1mcwb:73.1,dr:20.3,hr1:128.5,hdd50:4056,hdd65:7442,cdd65:762,zone:'6A',primary:true,tMean:[16.9,21.2,33.7,46.5,58.2,68.9,73.8,71.0,63.3,49.2,34.5,21.6],tSd:[13.02,12.88,13.03,10.33,8.67,6.98,6.09,5.69,8.53,9.59,10.99,11.76]},
  {id:'SD-rapid-city',st:'SD',city:'Rapid City',wmo:'726620',lat:44.046,lon:-103.054,elevFt:3160,h996:-8.4,h99:-3.0,c1:92.4,c1mcwb:65.9,dr:26.8,hr1:104.4,hdd50:3553,hdd65:7113,cdd65:660,zone:'6A',primary:false,tMean:[24.9,26.4,35.5,44.4,54.4,65.1,73.3,71.5,62.0,47.9,35.4,25.7],tSd:[13.32,14.04,12.98,10.03,8.49,7.49,6.30,6.17,9.03,9.89,11.74,12.79]},
  {id:'TN-nashville',st:'TN',city:'Nashville',wmo:'723270',lat:36.119,lon:-86.689,elevFt:600,h996:14.9,h99:19.5,c1:92.3,c1mcwb:74.5,dr:18.0,hr1:129.6,hdd50:1149,hdd65:3430,cdd65:1800,zone:'3A',primary:true,tMean:[38.9,43.0,51.0,60.5,68.9,76.7,79.9,79.3,72.9,61.5,50.1,42.5],tSd:[11.70,10.90,10.01,8.56,7.07,4.83,3.85,4.17,6.39,8.24,9.05,10.16]},
  {id:'TN-memphis',st:'TN',city:'Memphis',wmo:'723340',lat:35.056,lon:-89.987,elevFt:254,h996:19.0,h99:23.2,c1:94.3,c1mcwb:76.5,dr:16.4,hr1:137.0,hdd50:863,hdd65:2856,cdd65:2321,zone:'3A',primary:false,tMean:[42.0,46.1,54.2,63.5,72.2,79.9,82.4,82.2,76.2,64.8,53.0,44.9],tSd:[11.27,10.72,10.05,8.09,6.70,4.67,3.94,4.34,6.34,8.45,9.10,10.00]},
  {id:'TX-dallas-fort-worth',st:'TX',city:'Dallas-Fort Worth',wmo:'722590',lat:32.898,lon:-97.019,elevFt:560,h996:23.4,h99:27.4,c1:99.1,c1mcwb:74.6,dr:19.1,hr1:131.0,hdd50:499,hdd65:2113,cdd65:2956,zone:'2A',primary:true,tMean:[47.1,51.0,58.6,66.2,74.6,82.5,86.2,86.4,79.4,68.5,57.5,48.6],tSd:[10.10,10.71,9.57,7.38,6.43,4.39,3.95,4.54,6.34,8.12,9.28,9.53]},
  {id:'TX-houston',st:'TX',city:'Houston',wmo:'722430',lat:29.98,lon:-95.36,elevFt:95,h996:31.4,h99:34.3,c1:95.7,c1mcwb:76.8,dr:18.2,hr1:143.3,hdd50:182,hdd65:1297,cdd65:3200,zone:'2A',primary:false,tMean:[53.6,57.5,63.3,69.7,77.2,82.5,84.4,84.7,80.1,71.6,62.1,55.1],tSd:[9.66,9.73,8.40,6.67,5.01,3.47,2.83,3.27,4.61,7.17,8.69,9.54]},
  {id:'TX-san-antonio',st:'TX',city:'San Antonio',wmo:'722530',lat:29.544,lon:-98.484,elevFt:789,h996:30.0,h99:33.1,c1:97.7,c1mcwb:73.6,dr:19.7,hr1:136.1,hdd50:196,hdd65:1352,cdd65:3270,zone:'2A',primary:false,tMean:[52.9,57.1,63.1,70.1,77.3,82.9,85.0,85.8,80.4,71.7,61.7,54.1],tSd:[8.99,9.84,8.52,6.84,5.42,3.63,3.06,3.28,5.17,7.66,8.82,8.93]},
  {id:'TX-austin',st:'TX',city:'Austin',wmo:'722540',lat:30.183,lon:-97.68,elevFt:480,h996:26.6,h99:29.9,c1:98.4,c1mcwb:74.6,dr:22.4,hr1:137.4,hdd50:297,hdd65:1648,cdd65:3030,zone:'2A',primary:false,tMean:[50.9,54.9,61.2,68.5,76.2,82.2,84.4,84.9,79.5,70.1,59.9,52.1],tSd:[9.69,10.32,8.98,7.23,5.81,3.72,3.13,3.28,5.44,7.74,9.27,9.44]},
  {id:'TX-el-paso',st:'TX',city:'El Paso',wmo:'722700',lat:31.811,lon:-106.376,elevFt:3918,h996:25.7,h99:28.8,c1:99.1,c1mcwb:63.4,dr:24.9,hr1:106.6,hdd50:422,hdd65:2203,cdd65:2631,zone:'3B',primary:false,tMean:[46.5,51.5,58.8,66.4,75.4,83.9,84.0,82.4,76.8,66.7,54.7,46.2],tSd:[6.54,7.58,7.41,7.07,6.00,4.92,4.26,4.15,4.96,6.98,7.13,7.06]},
  {id:'TX-amarillo',st:'TX',city:'Amarillo',wmo:'723630',lat:35.2331,lon:-101.7092,elevFt:3593,h996:10.8,h99:16.0,c1:96.1,c1mcwb:65.9,dr:24.9,hr1:110.1,hdd50:1388,hdd65:3952,cdd65:1526,zone:'4B',primary:false,tMean:[38.3,41.2,49.2,56.9,66.2,75.6,79.0,77.6,70.5,58.8,47.5,38.5],tSd:[9.73,10.98,10.18,9.08,8.34,6.12,4.75,5.03,7.06,8.78,9.60,9.76]},
  {id:'UT-salt-lake-city',st:'UT',city:'Salt Lake City',wmo:'725720',lat:40.778,lon:-111.969,elevFt:4225,h996:11.4,h99:15.6,c1:95.9,c1mcwb:61.9,dr:24.9,hr1:83.3,hdd50:2189,hdd65:5329,cdd65:1350,zone:'5B',primary:true,tMean:[31.1,35.9,44.8,50.8,60.4,71.3,80.9,78.4,67.8,53.6,41.4,31.5],tSd:[8.34,8.32,7.86,7.86,8.50,8.54,5.01,5.16,8.09,8.17,8.64,8.29]},
  {id:'VT-burlington',st:'VT',city:'Burlington',wmo:'726170',lat:44.468,lon:-73.15,elevFt:330,h996:-7.1,h99:-1.7,c1:85.7,c1mcwb:69.9,dr:18.8,hr1:110.5,hdd50:3676,hdd65:7145,cdd65:573,zone:'6A',primary:true,tMean:[20.0,22.5,31.5,44.7,57.6,66.7,71.5,69.7,62.2,49.9,38.5,27.5],tSd:[13.05,11.26,10.81,8.82,7.93,6.74,5.42,5.59,7.51,8.32,9.20,10.24]},
  {id:'VA-richmond',st:'VA',city:'Richmond',wmo:'724010',lat:37.512,lon:-77.323,elevFt:164,h996:17.4,h99:21.2,c1:92.4,c1mcwb:75.0,dr:18.6,hr1:130.4,hdd50:1202,hdd65:3635,cdd65:1609,zone:'4A',primary:true,tMean:[38.5,41.4,48.8,59.1,67.2,75.6,79.3,77.8,71.6,60.6,49.9,42.5],tSd:[10.68,9.65,9.68,8.56,7.54,5.84,4.57,4.54,6.01,7.93,8.59,9.19]},
  {id:'VA-dulles-n-virginia',st:'VA',city:'Dulles (N. Virginia)',wmo:'724030',lat:38.9767,lon:-77.4858,elevFt:290,h996:12.3,h99:16.6,c1:90.7,c1mcwb:73.7,dr:19.4,hr1:125.4,hdd50:1763,hdd65:4557,cdd65:1238,zone:'4A',primary:false,tMean:[33.8,36.5,44.5,55.4,64.1,72.8,76.9,75.7,68.9,57.0,46.1,38.1],tSd:[10.52,9.69,9.69,8.75,7.79,5.90,4.81,4.92,6.70,8.19,8.53,8.86]},
  {id:'VA-roanoke',st:'VA',city:'Roanoke',wmo:'724110',lat:37.317,lon:-79.974,elevFt:1175,h996:15.5,h99:19.8,c1:89.7,c1mcwb:71.9,dr:18.2,hr1:120.6,hdd50:1347,hdd65:3927,cdd65:1300,zone:'4A',primary:false,tMean:[37.2,40.5,48.0,57.9,65.9,73.5,76.9,75.8,69.2,58.8,48.1,40.7],tSd:[10.33,9.59,9.74,8.47,7.35,5.37,4.58,4.59,6.21,7.80,8.62,8.66]},
  {id:'WA-seattle',st:'WA',city:'Seattle',wmo:'727930',lat:47.444,lon:-122.314,elevFt:370,h996:26.6,h99:30.0,c1:82.2,c1mcwb:63.9,dr:19.0,hr1:76.9,hdd50:1067,hdd65:4621,cdd65:226,zone:'4C',primary:true,tMean:[42.3,43.1,46.3,50.4,56.5,61.2,66.5,66.6,61.8,52.9,46.0,41.3],tSd:[5.79,5.05,4.91,5.00,5.58,5.40,5.17,4.48,4.65,4.38,5.54,5.53]},
  {id:'WA-spokane',st:'WA',city:'Spokane',wmo:'727850',lat:47.622,lon:-117.528,elevFt:2353,h996:6.1,h99:11.8,c1:90.1,c1mcwb:61.6,dr:26.2,hr1:71.6,hdd50:2837,hdd65:6539,cdd65:505,zone:'5B',primary:false,tMean:[29.5,32.3,39.7,46.6,55.6,62.0,71.2,70.1,60.9,47.5,36.3,28.7],tSd:[8.39,7.91,6.53,6.51,7.58,7.13,6.59,6.43,7.40,7.01,7.77,7.97]},
  {id:'WV-charleston',st:'WV',city:'Charleston',wmo:'724140',lat:38.379,lon:-81.59,elevFt:910,h996:9.6,h99:14.8,c1:88.8,c1mcwb:72.4,dr:18.9,hr1:125.4,hdd50:1699,hdd65:4385,cdd65:1108,zone:'4A',primary:true,tMean:[34.5,38.0,45.8,57.0,64.5,72.1,75.1,74.3,68.1,56.9,46.2,38.7],tSd:[12.17,11.09,10.87,9.36,7.54,5.24,4.38,4.38,6.48,8.49,9.23,10.15]},
  {id:'WI-milwaukee',st:'WI',city:'Milwaukee',wmo:'726400',lat:42.955,lon:-87.904,elevFt:670,h996:-1.7,h99:2.8,c1:86.4,c1mcwb:72.3,dr:15.4,hr1:120.7,hdd50:3241,hdd65:6647,cdd65:715,zone:'5A',primary:true,tMean:[23.0,26.2,35.6,45.7,56.2,66.9,72.6,71.6,64.6,52.6,39.7,28.8],tSd:[11.40,10.74,10.38,8.59,8.80,8.06,6.16,5.33,7.50,8.42,9.36,10.30]},
  {id:'WI-madison',st:'WI',city:'Madison',wmo:'726410',lat:43.141,lon:-89.345,elevFt:866,h996:-6.8,h99:-1.9,c1:86.4,c1mcwb:72.4,dr:19.3,hr1:122.5,hdd50:3653,hdd65:7053,cdd65:653,zone:'5A',primary:false,tMean:[19.4,23.1,34.6,46.8,58.2,68.3,72.1,70.0,62.7,50.3,37.2,25.4],tSd:[12.14,11.78,11.49,9.25,8.45,6.78,5.86,5.56,7.96,8.90,9.80,11.05]},
  {id:'WI-green-bay',st:'WI',city:'Green Bay',wmo:'726450',lat:44.479,lon:-88.137,elevFt:687,h996:-8.2,h99:-3.2,c1:85.0,c1mcwb:71.9,dr:20.3,hr1:120.2,hdd50:3959,hdd65:7519,cdd65:500,zone:'6A',primary:false,tMean:[17.9,21.0,32.0,44.4,56.3,66.4,70.4,68.3,61.2,49.0,36.3,24.3],tSd:[11.93,11.44,11.18,8.70,8.25,7.03,5.70,5.31,7.73,8.47,9.22,10.97]},
  {id:'WY-cheyenne',st:'WY',city:'Cheyenne',wmo:'725640',lat:41.158,lon:-104.807,elevFt:6113,h996:-3.1,h99:3.1,c1:87.3,c1mcwb:57.6,dr:26.5,hr1:87.6,hdd50:3250,hdd65:6972,cdd65:387,zone:'5B',primary:true,tMean:[29.4,29.3,37.0,42.6,51.7,63.0,70.1,68.0,59.6,46.5,36.6,28.6],tSd:[10.89,11.37,10.30,9.37,8.68,6.98,5.01,5.05,8.27,9.77,10.96,11.28]},
  {id:'WY-casper',st:'WY',city:'Casper',wmo:'725690',lat:42.898,lon:-106.474,elevFt:5318,h996:-7.9,h99:-1.0,c1:91.4,c1mcwb:58.9,dr:33.7,hr1:80.5,hdd50:3607,hdd65:7336,cdd65:472,zone:'6B',primary:false,tMean:[26.0,27.1,36.1,42.6,52.0,62.8,71.6,69.4,59.5,45.7,34.9,25.3],tSd:[11.27,11.84,10.82,9.09,8.33,7.20,5.13,5.59,8.61,9.98,11.81,12.21]},
];
```

## Appendix C: `prices.ts` PRICES constant

```ts
// Energy prices, $ per unit. Sources in §9. Refresh monthly via EIA API v2 (see §9.4).
export const PRICES: Record<string, {elec:number; ngTherm:number; propaneGal:number; heatingOilGal:number; dieselGal:number; propaneSrc:string}> = {
  AK: {elec: 0.2709, ngTherm: 1.251, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  AL: {elec: 0.1654, ngTherm: 1.695, propaneGal: 3.516, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'state'},
  AR: {elec: 0.1361, ngTherm: 1.858, propaneGal: 2.367, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'state'},
  AZ: {elec: 0.1544, ngTherm: 1.793, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  CA: {elec: 0.3325, ngTherm: 2.125, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 8.246, propaneSrc: 'US+0.50'},
  CO: {elec: 0.1672, ngTherm: 1.078, propaneGal: 2.302, heatingOilGal: 5.535, dieselGal: 6.340, propaneSrc: 'state'},
  CT: {elec: 0.2797, ngTherm: 1.625, propaneGal: 4.116, heatingOilGal: 5.546, dieselGal: 6.517, propaneSrc: 'state'},
  DC: {elec: 0.2466, ngTherm: 1.610, propaneGal: 3.539, heatingOilGal: 5.535, dieselGal: 6.546, propaneSrc: 'PADD 1B'},
  DE: {elec: 0.1786, ngTherm: 1.542, propaneGal: 3.731, heatingOilGal: 5.913, dieselGal: 6.546, propaneSrc: 'state'},
  FL: {elec: 0.1530, ngTherm: 2.459, propaneGal: 4.706, heatingOilGal: 5.535, dieselGal: 6.139, propaneSrc: 'state'},
  GA: {elec: 0.1540, ngTherm: 1.971, propaneGal: 3.164, heatingOilGal: 5.535, dieselGal: 6.139, propaneSrc: 'state'},
  HI: {elec: 0.4628, ngTherm: 5.056, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  IA: {elec: 0.1420, ngTherm: 1.024, propaneGal: 1.660, heatingOilGal: 4.224, dieselGal: 6.680, propaneSrc: 'state'},
  ID: {elec: 0.1296, ngTherm: 0.742, propaneGal: 2.397, heatingOilGal: 5.535, dieselGal: 6.340, propaneSrc: 'state'},
  IL: {elec: 0.1922, ngTherm: 1.086, propaneGal: 2.026, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  IN: {elec: 0.1704, ngTherm: 1.109, propaneGal: 2.634, heatingOilGal: 4.68, dieselGal: 6.680, propaneSrc: 'state'},
  KS: {elec: 0.1521, ngTherm: 1.430, propaneGal: 1.977, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  KY: {elec: 0.1427, ngTherm: 1.374, propaneGal: 2.936, heatingOilGal: 4.872, dieselGal: 6.680, propaneSrc: 'state'},
  LA: {elec: 0.1335, ngTherm: 1.678, propaneGal: 2.929, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'PADD 3'},
  MA: {elec: 0.3014, ngTherm: 2.419, propaneGal: 3.649, heatingOilGal: 5.742, dieselGal: 6.517, propaneSrc: 'state'},
  MD: {elec: 0.2130, ngTherm: 1.558, propaneGal: 3.741, heatingOilGal: 5.276, dieselGal: 6.546, propaneSrc: 'state'},
  ME: {elec: 0.2999, ngTherm: 1.829, propaneGal: 3.523, heatingOilGal: 5.371, dieselGal: 6.517, propaneSrc: 'state'},
  MI: {elec: 0.2153, ngTherm: 1.054, propaneGal: 2.370, heatingOilGal: 4.499, dieselGal: 6.680, propaneSrc: 'state'},
  MN: {elec: 0.1625, ngTherm: 1.060, propaneGal: 2.056, heatingOilGal: 4.245, dieselGal: 6.680, propaneSrc: 'state'},
  MO: {elec: 0.1396, ngTherm: 1.442, propaneGal: 2.209, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  MS: {elec: 0.1519, ngTherm: 1.606, propaneGal: 3.052, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'state'},
  MT: {elec: 0.1395, ngTherm: 0.868, propaneGal: 2.121, heatingOilGal: 5.535, dieselGal: 6.340, propaneSrc: 'state'},
  NC: {elec: 0.1494, ngTherm: 1.585, propaneGal: 3.450, heatingOilGal: 4.998, dieselGal: 6.139, propaneSrc: 'state'},
  ND: {elec: 0.1236, ngTherm: 0.917, propaneGal: 1.700, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  NE: {elec: 0.1290, ngTherm: 1.100, propaneGal: 1.642, heatingOilGal: 3.972, dieselGal: 6.680, propaneSrc: 'state'},
  NH: {elec: 0.2679, ngTherm: 1.796, propaneGal: 3.780, heatingOilGal: 5.407, dieselGal: 6.517, propaneSrc: 'state'},
  NJ: {elec: 0.2398, ngTherm: 1.372, propaneGal: 3.821, heatingOilGal: 5.838, dieselGal: 6.546, propaneSrc: 'state'},
  NM: {elec: 0.1508, ngTherm: 0.949, propaneGal: 2.929, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'PADD 3'},
  NV: {elec: 0.1353, ngTherm: 1.268, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  NY: {elec: 0.2938, ngTherm: 1.697, propaneGal: 3.747, heatingOilGal: 5.874, dieselGal: 6.546, propaneSrc: 'state'},
  OH: {elec: 0.1870, ngTherm: 1.337, propaneGal: 2.695, heatingOilGal: 4.726, dieselGal: 6.680, propaneSrc: 'state'},
  OK: {elec: 0.1358, ngTherm: 1.350, propaneGal: 2.272, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  OR: {elec: 0.1540, ngTherm: 1.613, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  PA: {elec: 0.2104, ngTherm: 1.452, propaneGal: 3.083, heatingOilGal: 5.16, dieselGal: 6.546, propaneSrc: 'state'},
  RI: {elec: 0.2922, ngTherm: 2.091, propaneGal: 3.757, heatingOilGal: 5.802, dieselGal: 6.517, propaneSrc: 'state'},
  SC: {elec: 0.1593, ngTherm: 1.632, propaneGal: 3.512, heatingOilGal: 5.535, dieselGal: 6.139, propaneSrc: 'PADD 1C'},
  SD: {elec: 0.1450, ngTherm: 0.952, propaneGal: 1.840, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  TN: {elec: 0.1387, ngTherm: 1.143, propaneGal: 3.248, heatingOilGal: 5.535, dieselGal: 6.680, propaneSrc: 'state'},
  TX: {elec: 0.1606, ngTherm: 1.875, propaneGal: 2.989, heatingOilGal: 5.535, dieselGal: 6.177, propaneSrc: 'state'},
  UT: {elec: 0.1316, ngTherm: 0.984, propaneGal: 2.337, heatingOilGal: 5.535, dieselGal: 6.340, propaneSrc: 'state'},
  VA: {elec: 0.1683, ngTherm: 1.621, propaneGal: 3.565, heatingOilGal: 5.277, dieselGal: 6.139, propaneSrc: 'state'},
  VT: {elec: 0.2395, ngTherm: 1.737, propaneGal: 3.733, heatingOilGal: 5.558, dieselGal: 6.517, propaneSrc: 'state'},
  WA: {elec: 0.1440, ngTherm: 1.701, propaneGal: 3.174, heatingOilGal: 5.535, dieselGal: 6.791, propaneSrc: 'US+0.50'},
  WI: {elec: 0.1900, ngTherm: 1.037, propaneGal: 2.066, heatingOilGal: 4.323, dieselGal: 6.680, propaneSrc: 'state'},
  WV: {elec: 0.1547, ngTherm: 1.332, propaneGal: 3.512, heatingOilGal: 5.535, dieselGal: 6.139, propaneSrc: 'PADD 1C'},
  WY: {elec: 0.1395, ngTherm: 1.133, propaneGal: 2.266, heatingOilGal: 5.535, dieselGal: 6.340, propaneSrc: 'PADD 4'},
};
export const US_AVG = {elec: 0.1819, ngTherm: 1.481, propaneGal: 2.674, heatingOilGal: 5.535, dieselGal: 6.529};
```
