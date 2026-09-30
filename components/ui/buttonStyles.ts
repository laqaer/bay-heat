import type { ButtonVariant } from "./Button";

export const buttonBase =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ember) focus-visible:ring-offset-2";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "h-12 rounded-none bg-(--color-ember) px-5 text-[15px] text-black hover:bg-[var(--ember-hover)] active:translate-y-px sm:h-14 sm:text-base",
  secondary: "h-12 rounded-none border border-(--color-fg)/25 px-5 text-[15px] text-(--color-fg) hover:bg-(--color-surface-2)",
  text: "text-(--color-link) underline underline-offset-4 hover:decoration-2",
};
