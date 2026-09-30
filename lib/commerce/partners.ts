import {
  AMAZON_TAG,
  AWIN_AFFID,
  CJ_AID_NORTHERNTOOL,
  CJ_PID,
  HOMEDEPOT_LINK_BASE,
  HVACDIRECT_REF,
  LOWES_LINK_BASE,
  SYLVANE_LINK_BASE,
  WALMART_LINK_BASE,
} from "../env.public.ts";

// Link-format builders (BLUEPRINT.md §6.2). Every function here is pure and takes its env dependency as a
// parameter or reads the frozen env.public constants directly -- this file has no side effects.
export function amazonDp(asin: string, tag: string = AMAZON_TAG): string {
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
}
export function amazonSearch(query: string, tag: string = AMAZON_TAG): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${tag}`;
}
export function awinLink(mid: string, targetUrl: string): string | null {
  if (!AWIN_AFFID) return null;
  return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AWIN_AFFID}&ued=${encodeURIComponent(targetUrl)}`;
}
export function cjNorthernToolLink(targetUrl: string): string | null {
  if (!CJ_PID || !CJ_AID_NORTHERNTOOL) return null;
  return `https://www.anrdoezrs.net/click-${CJ_PID}-${CJ_AID_NORTHERNTOOL}?url=${encodeURIComponent(targetUrl)}`;
}
export function impactLink(base: string | null, targetUrl: string): string | null {
  if (!base) return null;
  return `${base}?u=${encodeURIComponent(targetUrl)}`;
}
export function homeDepotLink(targetUrl: string): string | null {
  return impactLink(HOMEDEPOT_LINK_BASE, targetUrl);
}
export function walmartLink(targetUrl: string): string | null {
  return impactLink(WALMART_LINK_BASE, targetUrl);
}
export function lowesLink(targetUrl: string): string | null {
  return impactLink(LOWES_LINK_BASE, targetUrl);
}
export function hvacdirectLink(targetUrl: string): string | null {
  if (!HVACDIRECT_REF) return null;
  const sep = targetUrl.includes("?") ? "&" : "?";
  return `${targetUrl}${sep}${HVACDIRECT_REF}`;
}
export function sylvaneLink(targetUrl: string): string | null {
  if (!SYLVANE_LINK_BASE) return null;
  return `${SYLVANE_LINK_BASE}${targetUrl}`;
}
