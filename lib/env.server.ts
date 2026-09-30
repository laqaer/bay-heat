// Server-only environment access (Kit, Polar, webhooks, agent-team credentials). NEVER import this from a
// 'use client' file or a client component -- scripts/check-imports.mjs fails the build if it detects that.
// These values are read at request/build time on the server only and are never sent to the browser.

export const KIT_API_KEY = process.env.KIT_API_KEY ?? null;
export const KIT_FORM_ID = process.env.KIT_FORM_ID ?? null;
export const KIT_TAG_IDS: Record<string, string> = (() => {
  try {
    return process.env.KIT_TAG_IDS ? JSON.parse(process.env.KIT_TAG_IDS) : {};
  } catch {
    return {};
  }
})();
export const kitEnabled = Boolean(KIT_API_KEY && KIT_FORM_ID);

export const CENSUS_ENDPOINT = process.env.CENSUS_ENDPOINT ?? null;
export const CORRECTIONS_ENDPOINT = process.env.CORRECTIONS_ENDPOINT ?? null;

export const EIA_API_KEY = process.env.EIA_API_KEY ?? null;
export const NWS_USER_AGENT = process.env.NWS_USER_AGENT ?? null;
export const CRON_SECRET = process.env.CRON_SECRET ?? null;

export const GSC_SITE_URL = process.env.GSC_SITE_URL ?? null;
export const GSC_SERVICE_ACCOUNT_JSON_B64 = process.env.GSC_SERVICE_ACCOUNT_JSON_B64 ?? null;
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? null;

export const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN ?? null;
export const PINTEREST_BOARD_IDS = process.env.PINTEREST_BOARD_IDS ?? null;
