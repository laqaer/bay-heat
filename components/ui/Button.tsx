import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export type ButtonVariant = "primary" | "secondary" | "text";

const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ember) focus-visible:ring-offset-2";
const variants: Record<ButtonVariant, string> = {
  primary: "h-12 rounded-none bg-(--color-ember) px-5 text-[15px] text-black hover:bg-[var(--ember-hover)] active:translate-y-px",
  secondary: "h-12 rounded-none border border-(--color-fg)/25 px-5 text-[15px] text-(--color-fg) hover:bg-(--color-surface-2)",
  text: "text-(--color-link) underline underline-offset-4 hover:decoration-2",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
