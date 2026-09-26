import type { ReactNode } from "react";
import type { Ev } from "@/lib/types/evidence";
import type { Source } from "@/lib/types/evidence";
import { CORRECTIONS_ENDPOINT } from "@/lib/env.server";

const CHIP_LABEL: Record<Ev, string> = { M: "M", C: "C", S: "S", R: "R", E: "E" };
const CHIP_MEANING: Record<Ev, string> = {
  M: "Measured — a published log exists",
  C: "Computed by our engine",
  S: "From a manual or spec sheet",
  R: "A code or reference citation",
  E: "An estimate, labeled as an assumption",
};
const CHIP_STYLE: Record<Ev, string> = {
  M: "bg-(--color-ember) text-black",
  C: "bg-(--color-frost) text-white",
  S: "border border-current text-(--color-fg)",
  R: "bg-(--color-fg) text-(--color-bg)",
  E: "border border-dashed border-(--color-fg-2) text-(--color-fg-2)",
};

// A zero-JS evidence popover: a server component using a native <details> disclosure (feasibility red-team
// finding #12 -- <Num> must stay a server component with no client island per number rendered).
export function EvidencePopover({
  ev,
  source,
  checked,
  computedFrom,
  factId,
  chip = true,
  children,
}: {
  ev: Ev;
  source?: Source | null;
  checked?: string;
  computedFrom?: string;
  factId?: string;
  chip?: boolean;
  children: ReactNode;
}) {
  if (!chip) return <span className="font-mono tabular-nums">{children}</span>;
  return (
    <details className="not-prose tap-24 inline-block align-baseline [&_summary::-webkit-details-marker]:hidden">
      <summary className="inline-flex cursor-pointer list-none items-baseline gap-1 font-mono tabular-nums marker:content-none">
        <span>{children}</span>
        <span className={`inline-block rounded-[2px] px-[3px] py-px font-mono text-[10px] font-semibold leading-none ${CHIP_STYLE[ev]}`}>
          {CHIP_LABEL[ev]}
        </span>
      </summary>
      <div className="mt-1 max-w-xs border border-(--color-line) bg-(--color-surface) p-3 text-xs leading-5 text-(--color-fg-2) shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        <p className="font-medium text-(--color-fg)">{CHIP_MEANING[ev]}</p>
        {source ? (
          <p className="mt-1">
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-(--color-link) underline">
              {source.title}
            </a>
            {checked ? ` · checked ${checked}` : ""}
          </p>
        ) : computedFrom ? (
          <p className="mt-1 font-mono">{computedFrom}</p>
        ) : null}
        {CORRECTIONS_ENDPOINT ? (
          <p className="mt-2">
            <a href={CORRECTIONS_ENDPOINT} className="text-(--color-link) underline">
              Report a problem
            </a>
          </p>
        ) : (
          <p className="mt-2">
            <a href={`mailto:hello@bayheatguide.com?subject=Correction:%20${factId ?? ""}`} className="text-(--color-link) underline">
              Report a problem
            </a>
          </p>
        )}
      </div>
    </details>
  );
}
