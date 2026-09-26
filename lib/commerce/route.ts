import type { BuyLink, PartnerId, Product, Surface } from "./types.ts";
import { AMAZON_TAG_CART, AMAZON_TAG_MAIL, AMAZON_TAG_PLANNER, AMAZON_TAG_SAFETY, AMAZON_TAG } from "../env.public.ts";
import { amazonDp, amazonSearch, awinLink, cjNorthernToolLink, homeDepotLink, hvacdirectLink, lowesLink, sylvaneLink, walmartLink } from "./partners.ts";
import { VERIFIED_ASINS } from "./products/core.ts";

function tagForSurface(surface: Surface): string {
  switch (surface) {
    case "planner":
      return AMAZON_TAG_PLANNER;
    case "cart":
      return AMAZON_TAG_CART;
    case "mail":
      return AMAZON_TAG_MAIL;
    case "safety":
      return AMAZON_TAG_SAFETY;
    default:
      return AMAZON_TAG;
  }
}

function amazonLinkFor(p: Product, surface: Surface): string {
  const tag = tagForSurface(surface);
  if (p.asin && (VERIFIED_ASINS as readonly string[]).includes(p.asin)) return amazonDp(p.asin, tag);
  return amazonSearch(p.searchQuery, tag);
}

// Awin MIDs for the fuel-partner classes (BLUEPRINT.md §6.2). Not env-configurable -- fixed per program.
const AWIN_MID_VEVOR = "28831";

const PARTNER_BUILDERS: Partial<Record<Exclude<PartnerId, "amazon">, (url: string) => string | null>> = {
  homedepot: homeDepotLink,
  walmart: walmartLink,
  lowes: lowesLink,
  northern_tool: cjNorthernToolLink,
  vevor: (url) => awinLink(AWIN_MID_VEVOR, url),
  hvacdirect: hvacdirectLink,
  sylvane: sylvaneLink,
};

// route(): the highest-EPC partner that stocks the class is primary when its env is present; Amazon is
// always present, either as primary (nothing else configured) or as the secondary button. A partner whose
// link builder returns null (missing env) drops out silently -- Amazon backfills it (BLUEPRINT.md §6.2).
export function route(p: Product, surface: Surface): BuyLink[] {
  const links: BuyLink[] = [];
  const partnerEntries = Object.entries(p.partnerUrls) as [Exclude<PartnerId, "amazon">, string][];
  for (const [partner, targetUrl] of partnerEntries) {
    const build = PARTNER_BUILDERS[partner];
    const href = build?.(targetUrl);
    if (href) links.push({ partner, href, label: `Check price at ${partnerLabel(partner)}`, slot: links.length === 0 ? "primary" : "also", surface });
  }
  const amazonHref = amazonLinkFor(p, surface);
  links.push({
    partner: "amazon",
    href: amazonHref,
    label: p.asin && (VERIFIED_ASINS as readonly string[]).includes(p.asin) ? "Check price on Amazon" : "Search on Amazon",
    slot: links.length === 0 ? "primary" : "secondary",
    surface,
  });
  return links;
}

function partnerLabel(id: Exclude<PartnerId, "amazon">): string {
  const labels: Record<Exclude<PartnerId, "amazon">, string> = {
    homedepot: "Home Depot",
    walmart: "Walmart",
    lowes: "Lowe's",
    northern_tool: "Northern Tool",
    vevor: "VEVOR",
    hcalory: "Hcalory",
    hvacdirect: "HVACDirect",
    gotductless: "Got Ductless",
    pioneer: "Pioneer",
    della: "Della",
    sylvane: "Sylvane",
  };
  return labels[id];
}
