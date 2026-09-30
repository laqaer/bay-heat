import type { PageEntry } from "@/lib/pages/types";
import { aiLine, MODEL_VERSION, reviewers } from "@/lib/site";

const REVIEW_LABEL: Record<"electrical" | "gas", string> = {
  electrical: "electrician",
  gas: "gas/HVAC technician",
};

// The Lab stamp: one 28px line, expandable. Per feasibility red-team finding #22, it shows only
// ID · REV · CHECKED · MODEL -- an RSC has no way to count the <Num> elements rendered below it, so the
// original "C 22 S 9 R 6" per-page evidence tally is dropped. Review status appears only in the expansion.
export function LabLabel({ entry }: { entry: PageEntry }) {
  // Claim a licensed review only when a real, verified reviewer is configured for this page's kind. Marking a
  // page `reviewed` in the registry is a plan, not a fact; the line above already says "not yet reviewed".
  const signed = entry.reviewed ? reviewers().some((r) => r.kind === entry.reviewed) : false;
  return (
    <details className="my-3 border border-(--color-line) bg-(--color-surface) text-[11px] leading-[28px] text-(--color-fg-2) [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer list-none px-3 font-mono marker:content-none">
        {entry.id} · REV {entry.rev} · CHECKED {entry.updated} · MODEL v{MODEL_VERSION} &#9662;
      </summary>
      <div className="space-y-2 border-t border-(--color-line) px-3 py-3 font-sans text-xs leading-5">
        <p>{aiLine(entry.reviewed, entry.layout === "verdict-first" || entry.kind === "safety" ? "full" : "sample")}</p>
        <p>
          {entry.reviewed && signed
            ? `Technical review: checked by a licensed ${REVIEW_LABEL[entry.reviewed]}.`
            : "Technical review: not yet reviewed by a licensed electrician or gas technician (scheduled)."}
        </p>
        <p className="font-mono uppercase tracking-[0.08em] text-(--color-fg-2)">
          M measured · C computed · S spec · R reference · E estimate
        </p>
      </div>
    </details>
  );
}
