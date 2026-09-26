import type { Verdict } from "@/lib/safety/types";
import { SAFETY_SCOPE } from "@/lib/site";
import { clsx } from "@/lib/clsx";

const STAMP_STYLE: Record<Verdict["verdict"], string> = {
  GO: "bg-(--color-ember) text-black",
  GO_IF: "border-2 border-(--color-fg) text-(--color-fg)",
  NO_GO: "bg-(--color-alarm) text-white",
};

const EV_LABEL: Record<"R" | "S" | "C", string> = { R: "R", S: "S", C: "C" };
const EV_STYLE: Record<"R" | "S" | "C", string> = {
  R: "bg-(--color-fg) text-(--color-bg)",
  S: "border border-current text-(--color-fg)",
  C: "bg-(--color-frost) text-white",
};

// The GO / ONLY IF / NO-GO stamp, in alarm-red-avoiding but never color-only style: the stamp word IS the
// signal, color reinforces it. Archivo wdth 125 wght 900 per BLUEPRINT.md §2.8's "UI" note.
export function VerdictStamp({ verdict }: { verdict: Verdict }) {
  return (
    <div className="not-prose my-6">
      <div className={clsx("wdth-125 inline-block px-6 py-3 text-3xl font-black tracking-tight sm:text-4xl", STAMP_STYLE[verdict.verdict])}>
        {verdict.stamp}
      </div>
      <p className="mt-3 max-w-prose text-sm text-(--color-fg-2)">{SAFETY_SCOPE}</p>

      {verdict.reasons.length > 0 ? (
        <p className="mt-4 max-w-prose text-[15px] leading-6 text-(--color-fg)">{verdict.reasons.join(" ")}</p>
      ) : null}

      {verdict.conditions.length > 0 ? (
        <ol className="mt-5 max-w-prose space-y-3">
          {verdict.conditions.map((c, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-6 text-(--color-fg)">
              <span className="mt-0.5 shrink-0 font-mono text-sm text-(--color-fg-2)">{i + 1}.</span>
              <span>
                {c.text}{" "}
                <span
                  className={clsx("ml-1 inline-block rounded-[2px] px-[4px] py-px align-middle font-mono text-[10px] font-semibold leading-none", EV_STYLE[c.ev])}
                  title={c.cite}
                >
                  {EV_LABEL[c.ev]}
                </span>{" "}
                <span className="text-xs text-(--color-fg-2)">
                  {c.cite}
                  {c.edition ? ` (${c.edition})` : ""}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {verdict.saferAlternatives.length > 0 ? (
        <p className="mt-5 text-sm text-(--color-fg-2)">
          <span className="font-medium text-(--color-fg)">Safer alternatives for your situation: </span>
          {verdict.saferAlternatives.map((a) => HEATER_LABEL[a]).join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

export const HEATER_LABEL: Record<string, string> = {
  e120: "120V portable electric",
  e240: "240V hardwired electric",
  buddy: "Buddy-type propane",
  torpedo: 'Forced-air "torpedo"',
  kerosene: "Kerosene convection",
  diesel: "Diesel air heater",
  vented_gas: "Vented gas unit heater",
  minisplit: "Mini-split heat pump",
};
