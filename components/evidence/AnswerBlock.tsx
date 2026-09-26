import type { ReactNode } from "react";

// 40-70 words of computed specifics, with evidence chips on the decision numbers (BLUEPRINT.md §3.2). Has a
// stable anchor (#answer) so it can be cited or linked to directly, including by an AI answer engine.
export function AnswerBlock({ children }: { children: ReactNode }) {
  return (
    <p id="answer" className="my-6 border-l border-(--color-fg) py-1 pl-4 text-lg leading-8 text-(--color-fg-2)">
      {children}
    </p>
  );
}
