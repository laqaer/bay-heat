"use client";

import { useMemo, useState } from "react";
import type { HeaterKind, Situation } from "@/lib/safety/types";
import { verdictFor } from "@/lib/safety/verdict";
import { VerdictStamp, HEATER_LABEL } from "./VerdictStamp";
import { clsx } from "@/lib/clsx";

const KIND_ORDER: HeaterKind[] = ["e120", "e240", "buddy", "torpedo", "kerosene", "diesel", "vented_gas", "minisplit"];
const KIND_SUBTITLE: Record<HeaterKind, string> = {
  e120: "Plugs into a regular outlet",
  e240: "Wired to its own 240V circuit",
  buddy: "Mr. Heater Buddy / Big Buddy class",
  torpedo: "Forced-air construction heater",
  kerosene: "Wick or pressure convection heater",
  diesel: "Parking-heater-style diesel burner",
  vented_gas: "Piped natural gas or bulk propane, vented outdoors",
  minisplit: "Ductless heat pump, heats and cools",
};

// Kinds whose verdict doesn't depend on the situation at all -- verdictFor() ignores Situation entirely for
// these (torpedo is always NO-GO, mini-split is always GO), so there's nothing to ask.
const UNCONDITIONAL: HeaterKind[] = ["torpedo", "minisplit"];

const DEFAULT_SITUATION: Situation = {
  attached: true,
  flammablesStored: "unknown",
  livingAbove: false,
  unattended: false,
  freshAir: false,
  ulListed: "unknown",
  coAlarmHouse: false,
  coMonitorGarageRated: false,
  preset: "2car",
};

function TileButton({ selected, onClick, title, subtitle }: { selected: boolean; onClick: () => void; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-1 border p-4 text-left transition-colors",
        selected ? "border-(--color-ember) bg-(--color-ember)/10" : "border-(--color-fg)/20 hover:border-(--color-fg)/50",
      )}
    >
      <span className="wdth-112 font-semibold text-(--color-fg)">{title}</span>
      <span className="text-sm text-(--color-fg-2)">{subtitle}</span>
    </button>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
      <span className="text-[15px] text-(--color-fg)">{label}</span>
      <div className="flex gap-2">
        {[
          { v: true, label: "Yes" },
          { v: false, label: "No" },
        ].map((opt) => (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            className={clsx("tap-24 border px-4 text-sm font-medium", value === opt.v ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TriState({ label, value, onChange }: { label: string; value: "yes" | "no" | "unknown"; onChange: (v: "yes" | "no" | "unknown") => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
      <span className="text-[15px] text-(--color-fg)">{label}</span>
      <div className="flex gap-2">
        {(["yes", "no", "unknown"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={clsx("tap-24 border px-3 text-sm font-medium capitalize", value === opt ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
          >
            {opt === "unknown" ? "Don't know" : opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CanIRunItForm() {
  const [kind, setKind] = useState<HeaterKind | null>(null);
  const [situation, setSituation] = useState<Situation>(DEFAULT_SITUATION);

  const verdict = useMemo(() => (kind ? verdictFor(kind, situation) : null), [kind, situation]);

  function set<K extends keyof Situation>(key: K, value: Situation[K]) {
    setSituation((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="not-prose">
      <div>
        <p className="wdth-100 font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Step 1</p>
        <h2 className="mt-1 text-xl font-bold text-(--color-fg)">Which heater?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {KIND_ORDER.map((k) => (
            <TileButton key={k} selected={kind === k} onClick={() => setKind(k)} title={HEATER_LABEL[k]} subtitle={KIND_SUBTITLE[k]} />
          ))}
        </div>
      </div>

      {kind && !UNCONDITIONAL.includes(kind) ? (
        <div className="mt-10 border-t border-(--color-fg)/10 pt-8">
          <p className="wdth-100 font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Step 2</p>
          <h2 className="mt-1 text-xl font-bold text-(--color-fg)">Your situation</h2>

          <div className="mt-4">
            <YesNo label="Is the garage attached to the house?" value={situation.attached} onChange={(v) => set("attached", v)} />
            <TriState label="Gasoline, paint or solvents stored here?" value={situation.flammablesStored} onChange={(v) => set("flammablesStored", v)} />
            {kind === "kerosene" ? <YesNo label="Living space above the garage?" value={situation.livingAbove} onChange={(v) => set("livingAbove", v)} /> : null}
            <YesNo label="Will it run unattended or overnight?" value={situation.unattended} onChange={(v) => set("unattended", v)} />
            {(kind === "buddy" || kind === "kerosene") ? <YesNo label="A fresh-air opening while it runs?" value={situation.freshAir} onChange={(v) => set("freshAir", v)} /> : null}

            {kind === "buddy" ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
                  <span className="text-[15px] text-(--color-fg)">Cylinder size</span>
                  <div className="flex gap-2">
                    {(["1lb", "20lb"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("cylinder", c)}
                        className={clsx("tap-24 border px-3 text-sm font-medium", situation.cylinder === c ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {situation.cylinder === "20lb" ? (
                  <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
                    <span className="text-[15px] text-(--color-fg)">Where is the 20-lb cylinder?</span>
                    <div className="flex gap-2">
                      {(["outdoors", "garage", "house"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("cylinderStoredWhere", c)}
                          className={clsx("tap-24 border px-3 text-sm font-medium capitalize", situation.cylinderStoredWhere === c ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {kind === "diesel" ? <YesNo label="Exhaust and intake both routed outdoors?" value={situation.exhaustOutdoors ?? false} onChange={(v) => set("exhaustOutdoors", v)} /> : null}

            {kind === "vented_gas" ? (
              <YesNo
                label="Fed by a piped natural gas line or a bulk propane tank (not small cylinders)?"
                value={situation.cylinder !== "20lb"}
                onChange={(v) => set("cylinder", v ? undefined : "20lb")}
              />
            ) : null}

            {(kind === "e120" || kind === "e240") ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
                  <span className="text-[15px] text-(--color-fg)">Circuit</span>
                  <select
                    value={situation.circuit ?? ""}
                    onChange={(e) => set("circuit", (e.target.value || undefined) as Situation["circuit"])}
                    className="border border-(--color-fg)/25 bg-(--color-surface) px-3 py-2 text-sm text-(--color-fg)"
                  >
                    <option value="">Don&apos;t know</option>
                    <option value="120V15A_shared">120V, 15A, shared</option>
                    <option value="120V20A_dedicated">120V, 20A, dedicated</option>
                    <option value="extension_cord">Extension cord</option>
                    <option value="240V20A">240V, 20A</option>
                    <option value="240V30A">240V, 30A</option>
                  </select>
                </div>
                {situation.circuit?.startsWith("240") ? (
                  <>
                    <YesNo label="A plug adapter in use (e.g. 14-50 to 6-30)?" value={situation.plugAdapterInUse ?? false} onChange={(v) => set("plugAdapterInUse", v)} />
                    <YesNo label="Is the outlet grounded?" value={situation.outletGrounded ?? true} onChange={(v) => set("outletGrounded", v)} />
                  </>
                ) : null}
                <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
                  <span className="text-[15px] text-(--color-fg)">Heater size (kW)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={situation.heaterKw ?? ""}
                    onChange={(e) => set("heaterKw", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-24 border border-(--color-fg)/25 bg-(--color-surface) px-3 py-2 text-sm text-(--color-fg)"
                  />
                </div>
              </>
            ) : null}

            {(kind === "e120" || kind === "e240" || kind === "kerosene") ? (
              <TriState label="UL, CSA or ETL mark on the heater?" value={situation.ulListed} onChange={(v) => set("ulListed", v)} />
            ) : null}

            <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
              <span className="text-[15px] text-(--color-fg)">Garage size</span>
              <div className="flex gap-2">
                {(["1car", "2car", "3car"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("preset", p)}
                    className={clsx("tap-24 border px-3 text-sm font-medium", situation.preset === p ? "border-(--color-ember) bg-(--color-ember) text-black" : "border-(--color-fg)/25 text-(--color-fg)")}
                  >
                    {p.replace("car", "-car")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-(--color-fg)/10 py-3">
              <span className="text-[15px] text-(--color-fg)">ZIP code (optional)</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={situation.zip3 ?? ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                  set("zip3", digits.length >= 3 ? digits.slice(0, 3) : undefined);
                }}
                placeholder="60601"
                className="w-28 border border-(--color-fg)/25 bg-(--color-surface) px-3 py-2 text-sm text-(--color-fg)"
              />
            </div>
          </div>
        </div>
      ) : null}

      {verdict ? (
        <div className="mt-10 border-t border-(--color-fg)/10 pt-8">
          <p className="wdth-100 font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Your verdict</p>
          <VerdictStamp verdict={verdict} />
        </div>
      ) : null}
    </div>
  );
}
