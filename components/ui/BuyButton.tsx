"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import { track } from "@/lib/track";
import { buttonBase, buttonVariants } from "./buttonStyles";

// What an outbound href points at, for the click event and the data-* attributes only. Never sent anywhere the
// Associates tag isn't already going: no PII, no full URL, just the partner host and the ASIN / link kind.
function describe(href: string | undefined): { partner: string; target: string } {
  if (!href) return { partner: "unknown", target: "" };
  try {
    const u = new URL(href);
    const partner = u.hostname.replace(/^www\./, "");
    const dp = /\/dp\/([A-Z0-9]{10})/.exec(u.pathname);
    if (dp) return { partner, target: dp[1] };
    if (u.pathname.startsWith("/s")) return { partner, target: "search" };
    if (u.pathname.includes("/cart/add")) return { partner, target: "cart" };
    return { partner, target: "other" };
  } catch {
    return { partner: "unknown", target: "" };
  }
}

// An outbound "buy" button: primary styling plus the required rel/target and an arrow, per BLUEPRINT.md §4.5.
// A client component only so it can fire `affiliate_click` (lib/track.ts -- a no-op until analytics is configured);
// the anchor itself is a plain <a> with the real href, so it works with JS off. Never used for an internal Link.
export function BuyButton({
  className,
  children,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  const { partner, target } = describe(rest.href);
  return (
    <a
      {...rest}
      data-partner={partner}
      data-target={target}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={clsx(buttonBase, buttonVariants.primary, "no-underline", className)}
      onClick={(e) => {
        onClick?.(e);
        track(target === "cart" ? "cart_click" : "affiliate_click", { page: window.location.pathname, partner, target });
      }}
    >
      {children}
      <span aria-hidden>&#8599;</span>
    </a>
  );
}

// The quiet secondary form: a tracked text link for a second store or a "compare" alternative. Same rel/target and
// the same `affiliate_click` event as BuyButton, so every paid link on the site is countable.
export function BuyTextLink({
  className,
  children,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  const { partner, target } = describe(rest.href);
  return (
    <a
      {...rest}
      data-partner={partner}
      data-target={target}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={clsx("text-sm text-(--color-link) underline underline-offset-4", className)}
      onClick={(e) => {
        onClick?.(e);
        track(target === "cart" ? "cart_click" : "affiliate_click", { page: window.location.pathname, partner, target });
      }}
    >
      {children}
    </a>
  );
}
