"use client";

// track(): fires a client-side analytics event. A no-op unless PLAUSIBLE_DOMAIN or GA4_ID is set (BLUEPRINT.md
// §6.4). No PII: callers pass ZIP3, never a full ZIP or email. Never blocks the UI -- uses sendBeacon where
// available and swallows all errors.

import { PLAUSIBLE_DOMAIN, GA4_ID } from "@/lib/env.public";

export type TrackEvent =
  | "planner_start"
  | "planner_step"
  | "planner_complete"
  | "fix_toggle"
  | "share"
  | "affiliate_click"
  | "cart_click"
  | "email_submit"
  | "pro_click"
  | "pro_unlock"
  | "verdict_view"
  | "safety_card_print"
  | "brief_print"
  | "csv_download"
  | "embed_view"
  | "warmup_report"
  | "lead_click";

export function track(event: TrackEvent, props: Record<string, string | number | boolean> = {}): void {
  if (typeof window === "undefined") return;
  const enabled = Boolean(PLAUSIBLE_DOMAIN || GA4_ID);
  if (!enabled) return;
  try {
    if (PLAUSIBLE_DOMAIN && typeof (window as { plausible?: (e: string, o?: object) => void }).plausible === "function") {
      (window as unknown as { plausible: (e: string, o?: object) => void }).plausible(event, { props });
      return;
    }
    if (GA4_ID) {
      const body = new URLSearchParams({ event, ...Object.fromEntries(Object.entries(props).map(([k, v]) => [k, String(v)])) });
      const url = `https://www.google-analytics.com/g/collect?v=2&tid=${encodeURIComponent(GA4_ID)}`;
      if (navigator.sendBeacon) navigator.sendBeacon(url, body);
    }
  } catch {
    // analytics must never throw into the UI
  }
}
