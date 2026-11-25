export const PRICE_NOTE =
  "Black Friday and holiday prices change daily, so check today's price on Amazon.";

export const AMAZON_CTA = "Check today's price";

export const SEASONAL_UPDATED = "2026-11-24";

export function amazonCtaText(partner: string, label: string): string {
  return partner === "amazon" ? AMAZON_CTA : label;
}
