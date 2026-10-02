import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import type { ButtonVariant } from "./Button";
import { buttonBase as base, buttonVariants as variants } from "./buttonStyles";

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

export { BuyButton, BuyTextLink } from "./BuyButton";
