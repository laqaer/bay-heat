export const AMAZON_TAG = "laqaer-20" as const;

export function amazonDp(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

/** Comfort Zone 5000W ceiling (CZ220-class). Measured ASIN B009F1SWH8. */
export const AMAZON_COMFORT_ZONE_CZ220 = amazonDp("B009F1SWH8");

/** Fahrenheat FUH5-4 5000W (FUH54-class). Measured ASIN B00PX0T37I. */
export const AMAZON_FAHRENHEAT_FUH54 = amazonDp("B00PX0T37I");

/** Comfort Zone CZ798 1500W milkhouse. Measured ASIN B004VVJANC. */
export const AMAZON_MILKHOUSE_1500W = amazonDp("B004VVJANC");
