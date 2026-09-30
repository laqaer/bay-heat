// Public (NEXT_PUBLIC_*) environment access. Next.js only inlines *literal* `process.env.NEXT_PUBLIC_X`
// expressions at build time -- a generic `process.env[key]` lookup is NOT inlined and returns undefined in
// the browser bundle (see company/research/nextjs16-cheatsheet.md and
// scratchpad/redteam/feasibility.md finding #10). Every NEXT_PUBLIC_* variable is therefore read here, once,
// as a literal expression. Client and server components may both import this module.
//
// With zero env vars set, every export below still has an honest fallback (BLUEPRINT.md §6.3): no dead
// buttons, no broken links.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bayheatguide.com";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@bayheatguide.com";
export const POSTAL_ADDRESS = process.env.NEXT_PUBLIC_POSTAL_ADDRESS ?? null;
export const EDITOR_NAME = process.env.NEXT_PUBLIC_EDITOR_NAME ?? null;
export const EDITOR_URL = process.env.NEXT_PUBLIC_EDITOR_URL ?? null;
export const REVIEWERS_JSON = process.env.NEXT_PUBLIC_REVIEWERS ?? null;

export const SOCIAL = {
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? null,
  pinterest: process.env.NEXT_PUBLIC_SOCIAL_PINTEREST ?? null,
  reddit: process.env.NEXT_PUBLIC_SOCIAL_REDDIT ?? null,
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? null,
  tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK ?? null,
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? null,
};

// Amazon Associates. laqaer-20 is the confirmed, live default tag; per-surface tracking IDs fall back to it.
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "laqaer-20";
export const AMAZON_TAG_PLANNER = process.env.NEXT_PUBLIC_AMAZON_TAG_PLANNER ?? AMAZON_TAG;
export const AMAZON_TAG_CART = process.env.NEXT_PUBLIC_AMAZON_TAG_CART ?? AMAZON_TAG;
export const AMAZON_TAG_MAIL = process.env.NEXT_PUBLIC_AMAZON_TAG_MAIL ?? AMAZON_TAG;
export const AMAZON_TAG_SAFETY = process.env.NEXT_PUBLIC_AMAZON_TAG_SAFETY ?? AMAZON_TAG;

// Retailer deep-link bases (Impact). A missing base hides that partner's button; Amazon remains.
export const HOMEDEPOT_LINK_BASE = process.env.NEXT_PUBLIC_HOMEDEPOT_LINK_BASE ?? null;
export const WALMART_LINK_BASE = process.env.NEXT_PUBLIC_WALMART_LINK_BASE ?? null;
export const LOWES_LINK_BASE = process.env.NEXT_PUBLIC_LOWES_LINK_BASE ?? null;

// Northern Tool via CJ.
export const CJ_PID = process.env.NEXT_PUBLIC_CJ_PID ?? null;
export const CJ_AID_NORTHERNTOOL = process.env.NEXT_PUBLIC_CJ_AID_NORTHERNTOOL ?? null;

// Diesel-heater programs (Awin).
export const AWIN_AFFID = process.env.NEXT_PUBLIC_AWIN_AFFID ?? null;
export const HCALORY_REF = process.env.NEXT_PUBLIC_HCALORY_REF ?? null;

// Direct-program referral params.
export const HVACDIRECT_REF = process.env.NEXT_PUBLIC_HVACDIRECT_REF ?? null;
export const GOTDUCTLESS_REF = process.env.NEXT_PUBLIC_GOTDUCTLESS_REF ?? null;
export const PIONEER_REF = process.env.NEXT_PUBLIC_PIONEER_REF ?? null;
export const DELLA_REF = process.env.NEXT_PUBLIC_DELLA_REF ?? null;
export const SYLVANE_LINK_BASE = process.env.NEXT_PUBLIC_SYLVANE_LINK_BASE ?? null;

// Heat Report Pro checkout (v1.1). Unset in v1 -- the "Keep it" card shows "Notify me" instead.
export const CHECKOUT_URL_PRO = process.env.NEXT_PUBLIC_CHECKOUT_URL_PRO ?? null;

// Installer leads. Unset -> the free Electrician Brief is the only CTA on the circuit card.
export const LEADS_PROVIDER = (process.env.NEXT_PUBLIC_LEADS_PROVIDER ?? null) as
  | "networx"
  | "modernize"
  | "hdservices"
  | null;
export const NETWORX_FORM_URL = process.env.NEXT_PUBLIC_NETWORX_FORM_URL ?? null;
export const HDSERVICES_LINK_BASE = process.env.NEXT_PUBLIC_HDSERVICES_LINK_BASE ?? null;
export const CALL_NUMBER_ELECTRICAL = process.env.NEXT_PUBLIC_CALL_NUMBER_ELECTRICAL ?? null;
export const CALL_NUMBER_HVAC = process.env.NEXT_PUBLIC_CALL_NUMBER_HVAC ?? null;

// Analytics. track() (lib/track.ts) is a no-op unless one of these is set.
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? null;
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? null;
