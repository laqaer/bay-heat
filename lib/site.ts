// Brand constants and the exact compliance/disclosure strings (BLUEPRINT.md §5.3). These strings live here
// and nowhere else -- every disclosure, safety-scope and AI-assistance line on the site renders one of these
// exports, verbatim, so there is exactly one place to fix the wording.
import { SITE_URL, CONTACT_EMAIL, EDITOR_NAME, REVIEWERS_JSON } from "@/lib/env.public";

export { SITE_URL, CONTACT_EMAIL };

export const BRAND = "BayHeat";
export const DESCRIPTOR = "Garage Climate Lab";
export const TAGLINE = "Every number shows its work.";
export const PUBLISHER = "Laqaer Products";
export const LOCALE = "en-US";
export const MODEL_VERSION = "1.0.0";
export const PRICES_AS_OF = "2026-09";

export const DESCRIPTION =
  "BayHeat is the independent garage climate lab. Our open model sizes the heater for your garage, grades every number by where it came from, and tells you plainly when a heater will trip your breaker or fill your garage with carbon monoxide.";

export const DISCLOSURE_INLINE =
  "Paid links: we earn a commission if you buy through links on this page, at no cost to you. As an Amazon Associate, BayHeat earns from qualifying purchases.";

export const DISCLOSURE_FOOTER =
  "BayHeat is published by Laqaer Products. As an Amazon Associate, BayHeat earns from qualifying purchases. Links to other retailers may also pay us. Money never changes our math, our picks or a verdict. How we make money →";

export const SAFETY_SCOPE =
  "General information. Your electrician, gas fitter, local code and the heater's manual govern.";

export const PAID_LINK_LABEL = "Paid link";
export const SPONSORED_LABEL = "Sponsored: quotes from a partner network";

// FTC R-value Rule line (16 CFR 460.3/460.19), BLUEPRINT.md §5.2: renders under every savings, payback or
// percentage-cut claim -- a kit's R-value comes only from the manufacturer fact sheet, never our own estimate.
export const SAVINGS_VARY = "Savings vary. Find out why in the seller's fact sheet on R-values. Higher R-values mean greater insulating power.";

type Reviewer = { name: string; license: string; state: string; date: string; kind: "electrical" | "gas" };

function reviewers(): Reviewer[] {
  if (!REVIEWERS_JSON) return [];
  try {
    const parsed = JSON.parse(REVIEWERS_JSON) as unknown;
    return Array.isArray(parsed) ? (parsed as Reviewer[]) : [];
  } catch {
    return [];
  }
}

// AI_LINE is built per page, not a single fixed sentence (BLUEPRINT.md §5.2 -- a compliance finding: the
// fixed sentence claimed a named editor and licensed reviewers before either existed). `reviewedKind` is a
// PageEntry's own `reviewed` field ("electrical" | "gas" | null); `humanReview` defaults to "sample" (the
// baseline before 100%-review pages are marked otherwise) -- pass "full" for verdict-first/safety pages per
// the §5.2 100%-review-gate rule.
export function aiLine(reviewedKind: "electrical" | "gas" | null, humanReview: "full" | "sample" = "sample"): string {
  const editor = EDITOR_NAME ?? "BayHeat editorial desk";
  const reviewClause = `Human review: ${humanReview} by ${editor}.`;
  if (!reviewedKind) {
    return `Drafted with AI assistance. Numbers computed by model v${MODEL_VERSION} or sourced. ${reviewClause} Licensed review: not applicable.`;
  }
  const match = reviewers().find((r) => r.kind === reviewedKind);
  const licensedClause = match
    ? `Licensed review: ${match.name}, license ${match.license}, ${match.state}, verified ${match.date}.`
    : "Licensed review: not yet reviewed.";
  return `Drafted with AI assistance. Numbers computed by model v${MODEL_VERSION} or sourced. ${reviewClause} ${licensedClause}`;
}
