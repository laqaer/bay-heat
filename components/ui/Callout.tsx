import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

export type CalloutVariant = "safety" | "note" | "fix";

const barColor: Record<CalloutVariant, string> = {
  safety: "border-(--color-alarm)",
  note: "border-(--color-frost)",
  fix: "border-(--color-fg)",
};

export function Callout({ variant, children, className }: { variant: CalloutVariant; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("my-6 border-l-[3px] bg-(--color-surface) py-3 pl-4 pr-4 text-[15px] leading-6 text-(--color-fg-2)", barColor[variant], className)}>
      {children}
    </div>
  );
}
