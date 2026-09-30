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

// A zero-JS evidence popover: every element here is phrasing content (span/button/a), never <details>,
// <summary> or <div> -- <Num> is used inline inside running <p> prose everywhere on the site, and flow
// content nested in a <p> isn't valid HTML. The browser's parser silently closes the <p> right there during
// initial parsing (splitting the sentence into sibling elements), which then doesn't match what React
// rendered server-side, and every page using it threw a real hydration error and re-rendered client-side on
// every load. Found by a design-QA pass across 22 content pages, all hitting the same shared component.
// The show/hide is CSS-only (:hover/:focus-within on a group), so this stays a server component either way.
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
    <span className="not-prose group tap-24 relative inline-block align-baseline">
      <button
        type="button"
        className="inline-flex cursor-pointer items-baseline gap-1 font-mono tabular-nums marker:content-none"
      >
        <span>{children}</span>
        <span className={`inline-block rounded-[2px] px-[3px] py-px font-mono text-[10px] font-semibold leading-none ${CHIP_STYLE[ev]}`}>
          {CHIP_LABEL[ev]}
        </span>
      </button>
      <span className="invisible absolute left-0 top-full z-10 mt-1 block w-max max-w-xs border border-(--color-line) bg-(--color-surface) p-3 text-xs leading-5 text-(--color-fg-2) opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <span className="block font-medium text-(--color-fg)">{CHIP_MEANING[ev]}</span>
        {source ? (
          <span className="mt-1 block">
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-(--color-link) underline">
              {source.title}
            </a>
            {checked ? ` · checked ${checked}` : ""}
          </span>
        ) : computedFrom ? (
          <span className="mt-1 block font-mono">{computedFrom}</span>
        ) : null}
        {CORRECTIONS_ENDPOINT ? (
          <span className="mt-2 block">
            <a href={CORRECTIONS_ENDPOINT} className="text-(--color-link) underline">
              Report a problem
            </a>
          </span>
        ) : (
          <span className="mt-2 block">
            <a href={`mailto:hello@bayheatguide.com?subject=Correction:%20${factId ?? ""}`} className="text-(--color-link) underline">
              Report a problem
            </a>
          </span>
        )}
      </span>
    </span>
  );
}
