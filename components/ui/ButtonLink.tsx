import Link from "next/link";
import type { AnchorHTMLAttributes, ComponentProps, ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import type { ButtonVariant } from "./Button";

const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ember) focus-visible:ring-offset-2";
const variants: Record<ButtonVariant, string> = {
  primary: "h-12 rounded-none bg-(--color-ember) px-5 text-[15px] text-black hover:bg-[var(--ember-hover)] active:translate-y-px sm:h-14 sm:text-base",
  secondary: "h-12 rounded-none border border-(--color-fg)/25 px-5 text-[15px] text-(--color-fg) hover:bg-(--color-surface-2)",
  text: "text-(--color-link) underline underline-offset-4 hover:decoration-2",
};

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; className?: string; children: ReactNode }) {
  return (
    <Link className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

// An outbound "buy" button: primary styling plus the required rel/target and an arrow, per BLUEPRINT.md §4.5.
// Never used for an internal Link -- this is a plain <a>, since Next's <Link> is for internal routes only.
export function BuyButton({
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      {...rest}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={clsx(base, variants.primary, "no-underline", className)}
    >
      {children}
      <span aria-hidden>&#8599;</span>
    </a>
  );
}
