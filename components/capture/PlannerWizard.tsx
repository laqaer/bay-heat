"use client";

import { useMemo, useState } from "react";
import type { GarageInput, GarageDoorType, WallType, Tightness, Circuit, Fuel, Priority, UseCase } from "@/lib/planner/types";
import { defaultGarageInput } from "@/lib/planner/wizard-defaults";
import { PRESET_DEFAULTS } from "@/lib/planner/presets";
import { resolveZip3 } from "@/lib/planner/zip3";
import { clsx } from "@/lib/clsx";
import { degF, cents } from "@/lib/format";

type Step = 1 | 2 | 3 | 4 | 5;

function Tile({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "tap-24 border px-4 py-3 text-left text-sm font-medium transition-colors",
        selected ? "border-(--color-ember) bg-(--color-ember)/10 text-(--color-fg)" : "border-(--color-fg)/20 text-(--color-fg-2) hover:border-(--color-fg)/50",
      )}
    >
      {children}
    </button>
  );
}

function StepHeader({ step, title }: { step: Step; title: string }) {
  const labels: Record<Step, string> = { 1: "Where", 2: "Garage", 3: "Skin", 4: "Use", 5: "Power & fuel" };
  return (
    <div>
      <p className="wdth-100 font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">
        Step {step} of 5 · {labels[step]}
      </p>
      <h2 className="mt-1 text-2xl font-bold text-(--color-fg) sm:text-3xl">{title}</h2>
    </div>
  );
}

export function PlannerWizard({ onComplete, initialZip3 }: { onComplete: (input: GarageInput) => void; initialZip3?: string }) {
  const [step, setStep] = useState<Step>(1);
  const [input, setInput] = useState<GarageInput>(() => {
    const base = defaultGarageInput();
    const r = initialZip3 ? resolveZip3(initialZip3) : null;
    return r ? { ...base, zip3: initialZip3, state: r.state, stationId: r.station.id } : base;
  });
  const [zipDigits, setZipDigits] = useState(() => (initialZip3 && resolveZip3(initialZip3) ? initialZip3 : ""));
  const [breakerA, setBreakerA] = useState<20 | 30 | 40 | 50>(30);
  const [outlet, setOutlet] = useState<"120" | "spare240" | "add" | "unsure">("add");
  const [draftAnswers, setDraftAnswers] = useState<[boolean | null, boolean | null, boolean | null]>([null, null, null]);

  function set<K extends keyof GarageInput>(key: K, value: GarageInput[K]) {
    setInput((s) => ({ ...s, [key]: value }));
  }

  const zipResolution = useMemo(() => (zipDigits.length >= 3 ? resolveZip3(zipDigits.slice(0, 3)) : null), [zipDigits]);

  function applyZip(digits: string) {
    setZipDigits(digits);
    if (digits.length >= 3) {
      const r = resolveZip3(digits.slice(0, 3));
      if (r) {
        setInput((s) => ({ ...s, zip3: digits.slice(0, 3), state: r.state, stationId: r.station.id }));
      }
    }
  }

  function applyPreset(preset: "1car" | "2car" | "3car" | "4car") {
    const p = PRESET_DEFAULTS[preset];
    setInput((s) => ({
      ...s,
      preset,
      width: p.width,
      depth: p.depth,
      height: p.height,
      garageDoors: p.garageDoors.map((d) => ({ ...d, type: s.garageDoors[0]?.type ?? d.type })),
      windowsFt2: p.windowsFt2,
      serviceDoorFt2: p.serviceDoorFt2,
      commonWallLen: s.attached ? p.depth : 0,
    }));
  }

  function applyUseCase(useCase: UseCase) {
    const TARGET: Record<UseCase, number> = { shop: 55, gym: 60, hangout: 65, car: 40, keep: 40 };
    const MODE: Record<UseCase, "sessions" | "continuous"> = { shop: "sessions", gym: "sessions", hangout: "sessions", car: "continuous", keep: "continuous" };
    setInput((s) => ({ ...s, useCase, targetTemp: TARGET[useCase], usage: { ...s.usage, mode: MODE[useCase] } }));
  }

  function setDraftAnswer(i: 0 | 1 | 2, v: boolean) {
    const next: [boolean | null, boolean | null, boolean | null] = [...draftAnswers];
    next[i] = v;
    setDraftAnswers(next);
    if (next.every((a) => a !== null)) {
      const yesCount = next.filter(Boolean).length;
      const TIGHTNESS: Tightness[] = ["tight", "average", "leaky", "very_leaky"];
      set("tightness", TIGHTNESS[yesCount]);
    }
  }

  const canAdvance = step !== 1 || Boolean(zipResolution) || input.state !== "";

  function next() {
    if (step < 5) setStep((s) => (s + 1) as Step);
    else onComplete(input);
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  return (
    <div className="not-prose">
      <div className="mb-6 h-1 w-full bg-(--color-surface-2)">
        <div className="h-1 bg-(--color-ember) transition-all" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      {step === 1 ? (
        <div>
          <StepHeader step={1} title="Where is the garage?" />
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={zipDigits}
            onChange={(e) => applyZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="ZIP code"
            className="mt-6 h-14 w-48 border border-(--color-fg)/25 bg-(--color-surface) px-4 text-xl tracking-widest text-(--color-fg)"
          />
          {zipResolution ? (
            <p className="mt-4 max-w-md font-mono text-sm text-(--color-fg-2)">
              {zipResolution.station.city.toUpperCase()} · 99% DESIGN {degF(zipResolution.station.h99)} · ELECTRIC{" "}
              {cents(zipResolution.prices.elecPerKwh)}/kWh ({zipResolution.state}) · GAS ${zipResolution.prices.ngPerTherm.toFixed(2)}/therm
            </p>
          ) : zipDigits.length >= 3 ? (
            <p className="mt-4 text-sm text-(--color-alarm)">
              That ZIP didn&apos;t resolve. <span className="text-(--color-fg-2)">Pick your state instead:</span>
            </p>
          ) : null}
          {!zipResolution ? (
            <select
              value={input.state}
              onChange={(e) => set("state", e.target.value)}
              className="mt-3 h-11 border border-(--color-fg)/25 bg-(--color-surface) px-3 text-sm text-(--color-fg)"
            >
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <StepHeader step={2} title="Which garage?" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(["1car", "2car", "3car", "4car"] as const).map((p) => (
              <Tile key={p} selected={input.preset === p} onClick={() => applyPreset(p)}>
                {p.replace("car", "-car")} {PRESET_DEFAULTS[p].width}×{PRESET_DEFAULTS[p].depth}
              </Tile>
            ))}
            <Tile selected={input.preset === "custom"} onClick={() => set("preset", "custom")}>
              Custom
            </Tile>
          </div>

          <div className="mt-6 flex gap-3">
            <Tile
              selected={input.attached}
              onClick={() => setInput((s) => ({ ...s, attached: true, commonWallLen: s.depth }))}
            >
              Attached to house
            </Tile>
            <Tile selected={!input.attached} onClick={() => setInput((s) => ({ ...s, attached: false, commonWallLen: 0 }))}>
              Detached
            </Tile>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-(--color-fg)">
              Ceiling height
              <select value={input.height} onChange={(e) => set("height", Number(e.target.value))} className="h-10 border border-(--color-fg)/25 bg-(--color-surface) px-3 text-(--color-fg)">
                {[8, 9, 10, 12].map((h) => (
                  <option key={h} value={h}>
                    {h} ft
                  </option>
                ))}
              </select>
            </label>
            {input.preset === "custom" ? (
              <>
                <NumberField label="Width" value={input.width} min={8} max={80} onChange={(v) => set("width", v)} unit="ft" />
                <NumberField label="Depth" value={input.depth} min={8} max={80} onChange={(v) => set("depth", v)} unit="ft" />
              </>
            ) : null}
            <label className="flex items-center gap-3 text-sm text-(--color-fg)">
              Windows
              <select
                value={Math.min(3, Math.round(input.windowsFt2 / 12))}
                onChange={(e) => set("windowsFt2", Number(e.target.value) * 12)}
                className="h-10 border border-(--color-fg)/25 bg-(--color-surface) px-3 text-(--color-fg)"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n === 3 ? "3+" : n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <StepHeader step={3} title="What's it made of?" />
          <QuestionGroup label="Walls">
            {WALL_OPTIONS.map((o) => (
              <Tile key={o.value} selected={input.wallType === o.value} onClick={() => set("wallType", o.value)}>
                {o.label} <span className="ml-1 font-mono text-xs text-(--color-fg-2)">{o.u}</span>
              </Tile>
            ))}
          </QuestionGroup>
          <QuestionGroup label="Ceiling">
            {CEILING_OPTIONS.map((o) => (
              <Tile
                key={o.label}
                selected={input.ceilingType === o.ceilingType && input.ceilingIns === o.ceilingIns}
                onClick={() => setInput((s) => ({ ...s, ceilingType: o.ceilingType, ceilingIns: o.ceilingIns }))}
              >
                {o.label}
              </Tile>
            ))}
          </QuestionGroup>
          <QuestionGroup label="Big door">
            {DOOR_OPTIONS.map((o) => (
              <Tile
                key={o.label}
                selected={input.garageDoors[0]?.type === o.value}
                onClick={() => setInput((s) => ({ ...s, garageDoors: s.garageDoors.map((d) => ({ ...d, type: o.value })) }))}
              >
                {o.label}
              </Tile>
            ))}
          </QuestionGroup>
          <QuestionGroup label="Drafts">
            {input.tightness === "unknown" ? (
              <p className="text-sm text-(--color-fg-2)">Answer the 3 questions, or:</p>
            ) : (
              <p className="text-sm text-(--color-fg-2)">Tightness: {input.tightness}</p>
            )}
            <div className="mt-2 space-y-2">
              {["Daylight under the closed door?", "Bottom seal cracked or missing?", "Feel air at the side stops?"].map((q, i) => (
                <div key={q} className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-2">
                  <span className="text-sm text-(--color-fg)">{q}</span>
                  <div className="flex gap-2">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        type="button"
                        onClick={() => setDraftAnswer(i as 0 | 1 | 2, v)}
                        className={clsx("tap-24 border px-3 text-xs font-medium", draftAnswers[i] === v ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => set("tightness", "unknown")} className="text-sm text-(--color-link) underline">
                Don&apos;t know
              </button>
            </div>
          </QuestionGroup>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <StepHeader step={4} title="What's the garage for?" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {USE_CASE_OPTIONS.map((o) => (
              <Tile key={o.value} selected={input.useCase === o.value} onClick={() => applyUseCase(o.value)}>
                {o.label}
              </Tile>
            ))}
          </div>

          {input.usage.mode === "sessions" ? (
            <div className="mt-6 flex flex-wrap gap-6">
              <NumberField label="Sessions/week" value={input.usage.sessionsPerWeek} min={1} max={7} onChange={(v) => setInput((s) => ({ ...s, usage: { ...s.usage, sessionsPerWeek: v } }))} />
              <NumberField label="Hours/session" value={input.usage.hoursPerSession} min={1} max={8} onChange={(v) => setInput((s) => ({ ...s, usage: { ...s.usage, hoursPerSession: v } }))} />
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-(--color-fg)">Warm-up goal</span>
            <div className="flex gap-2">
              {[30, 60, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("warmupGoalMin", m as 30 | 60 | 120)}
                  className={clsx("tap-24 border px-3 text-sm font-medium", input.warmupGoalMin === m ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-(--color-fg)/10 pt-6">
            <p className="text-sm font-medium text-(--color-fg)">Gasoline, a mower, paint or solvents kept in here?</p>
            <div className="mt-2 flex gap-2">
              {(["yes", "no", "unknown"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("flammablesStored", v)}
                  className={clsx("tap-24 border px-4 text-sm font-medium capitalize", input.flammablesStored === v ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                >
                  {v === "unknown" ? "Don't know" : v}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <StepHeader step={5} title="What power and fuel do you have?" />
          <QuestionGroup label="Outlets">
            <div className="flex flex-wrap gap-3">
              <Tile
                selected={outlet === "120"}
                onClick={() => {
                  setOutlet("120");
                  set("circuit", "120V20A");
                }}
              >
                Only regular outlets (120V)
              </Tile>
              <Tile
                selected={outlet === "spare240"}
                onClick={() => {
                  setOutlet("spare240");
                  set("circuit", `240V${breakerA}A` as Circuit);
                }}
              >
                Spare 240V circuit
              </Tile>
              <Tile
                selected={outlet === "add"}
                onClick={() => {
                  setOutlet("add");
                  set("circuit", "unknown");
                  set("canAddCircuit", true);
                }}
              >
                I can add a circuit
              </Tile>
              <Tile
                selected={outlet === "unsure"}
                onClick={() => {
                  setOutlet("unsure");
                  set("circuit", "unknown");
                }}
              >
                Not sure
              </Tile>
            </div>
            {outlet === "spare240" ? (
              <div className="mt-3 flex gap-2">
                {[20, 30, 40, 50].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setBreakerA(a as 20 | 30 | 40 | 50);
                      set("circuit", `240V${a}A` as Circuit);
                    }}
                    className={clsx("tap-24 border px-3 text-sm font-medium", breakerA === a ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                  >
                    {a}A
                  </button>
                ))}
              </div>
            ) : null}
          </QuestionGroup>

          <QuestionGroup label="Panel">
            <div className="flex gap-2">
              {[100, 150, 200].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set("panelAmps", a as 100 | 150 | 200)}
                  className={clsx("tap-24 border px-3 text-sm font-medium", input.panelAmps === a ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                >
                  {a}A
                </button>
              ))}
              <button
                type="button"
                onClick={() => set("panelAmps", "unknown")}
                className={clsx("tap-24 border px-3 text-sm font-medium", input.panelAmps === "unknown" ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
              >
                Don&apos;t know
              </button>
            </div>
          </QuestionGroup>

          <QuestionGroup label="Fuel at the house">
            <div className="flex flex-wrap gap-2">
              {FUEL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    setInput((s) => {
                      const has = s.fuels.includes(o.value);
                      const fuels = has ? s.fuels.filter((f) => f !== o.value) : [...s.fuels, o.value];
                      return { ...s, fuels: fuels.includes("electric") ? fuels : ["electric", ...fuels] };
                    })
                  }
                  className={clsx("tap-24 border px-3 text-sm font-medium", input.fuels.includes(o.value) ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </QuestionGroup>

          <QuestionGroup label="Can we vent through an exterior wall?">
            <div className="flex gap-2">
              <Tile selected={input.ventingPossible} onClick={() => set("ventingPossible", true)}>
                Yes
              </Tile>
              <Tile selected={!input.ventingPossible} onClick={() => set("ventingPossible", false)}>
                No
              </Tile>
            </div>
          </QuestionGroup>

          <QuestionGroup label="Priority">
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((o) => (
                <Tile key={o.value} selected={input.priority === o.value} onClick={() => set("priority", o.value)}>
                  {o.label}
                </Tile>
              ))}
            </div>
          </QuestionGroup>

          <QuestionGroup label="Cool it in summer too?">
            <div className="flex gap-2">
              <Tile selected={input.wantsCooling} onClick={() => set("wantsCooling", true)}>
                Yes
              </Tile>
              <Tile selected={!input.wantsCooling} onClick={() => set("wantsCooling", false)}>
                No
              </Tile>
            </div>
          </QuestionGroup>
        </div>
      ) : null}

      <div className="sticky bottom-0 mt-10 flex items-center justify-between border-t border-(--color-fg)/10 bg-(--color-bg)/95 py-4 backdrop-blur">
        <button type="button" onClick={back} disabled={step === 1} className="h-14 px-5 text-[15px] font-medium text-(--color-fg-2) disabled:opacity-30">
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="h-14 bg-(--color-ember) px-8 text-base font-medium text-black hover:bg-[var(--ember-hover)] disabled:opacity-40"
        >
          {step === 5 ? "Get my report" : "Next"}
        </button>
      </div>
    </div>
  );
}

function QuestionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-(--color-fg)">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-(--color-fg)">
      {label}
      <div className="flex items-center border border-(--color-fg)/25">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="tap-24 px-3 text-(--color-fg)">
          −
        </button>
        <span className="w-10 text-center font-mono">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="tap-24 px-3 text-(--color-fg)">
          +
        </button>
      </div>
      {unit ? <span className="text-(--color-fg-2)">{unit}</span> : null}
    </label>
  );
}

const WALL_OPTIONS: { value: WallType | "unknown"; label: string; u: string }[] = [
  { value: "open_studs", label: "Bare studs", u: "U 0.48" },
  { value: "uninsulated_finished", label: "Drywall, no insulation", u: "U 0.25" },
  { value: "R13", label: "Insulated (R-13)", u: "U 0.089" },
  { value: "R19", label: "Well insulated (R-19+)", u: "U 0.064" },
  { value: "metal_uninsulated", label: "Metal building", u: "U 1.18" },
  { value: "unknown", label: "Don't know", u: "" },
];

const CEILING_OPTIONS: { label: string; ceilingType: GarageInput["ceilingType"]; ceilingIns: GarageInput["ceilingIns"] }[] = [
  { label: "Attic, no insulation", ceilingType: "attic", ceilingIns: "drywall_uninsulated" },
  { label: "Attic, insulated (R-30)", ceilingType: "attic", ceilingIns: "R30" },
  { label: "Open rafters", ceilingType: "open_rafters", ceilingIns: "drywall_uninsulated" },
  { label: "Room above", ceilingType: "conditioned_above", ceilingIns: "R19" },
  { label: "Don't know", ceilingType: "unknown", ceilingIns: "unknown" },
];

const DOOR_OPTIONS: { value: GarageDoorType | "unknown"; label: string }[] = [
  { value: "steel_single", label: "Plain steel" },
  { value: "steel_eps_2", label: "Insulated door" },
  { value: "kit_eps_or_batt", label: "Kit added" },
  { value: "wood_uninsulated", label: "Wood" },
  { value: "unknown", label: "Don't know" },
];

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "shop", label: "Shop · 55°F, sessions" },
  { value: "gym", label: "Gym · 60°F, sessions" },
  { value: "hangout", label: "Hangout · 65°F, sessions" },
  { value: "car", label: "Car & storage · 40°F, all winter" },
  { value: "keep", label: "Keep above freezing · 40°F, all winter" },
];

const FUEL_OPTIONS: { value: Fuel; label: string }[] = [
  { value: "natural_gas", label: "Natural gas" },
  { value: "propane_bulk", label: "Propane tank (bulk)" },
  { value: "propane_cylinder", label: "Propane cylinders" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "upfront", label: "Lowest upfront" },
  { value: "running", label: "Lowest running cost" },
  { value: "fast", label: "Fastest heat" },
  { value: "balanced", label: "Balanced" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;
