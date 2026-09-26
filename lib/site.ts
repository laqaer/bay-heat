// Brand constants and the exact compliance/disclosure strings (BLUEPRINT.md §5.3). These strings live here
// and nowhere else -- every disclosure, safety-scope and AI-assistance line on the site renders one of these
// exports, verbatim, so there is exactly one place to fix the wording.
import { SITE_URL, CONTACT_EMAIL } from "@/lib/env.public";

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

export const AI_LINE =
  "Drafted with AI assistance. Every number is computed or sourced; a named editor checks each page; licensed reviewers check electrical and gas rules.";

export const PAID_LINK_LABEL = "Paid link";
export const SPONSORED_LABEL = "Sponsored: quotes from a partner network";
