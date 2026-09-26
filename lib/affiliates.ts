export const AMAZON_TAG = "laqaer-20" as const;

export function amazonDp(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

/** Comfort Zone 5000W ceiling (CZ220-class). Measured ASIN B009F1SWH8. */
export const AMAZON_COMFORT_ZONE_CZ220 = amazonDp("B009F1SWH8");

/** Fahrenheat FUH5-4 5000W (FUH54-class). Wall or ceiling per FUH series manual. Measured ASIN B00PX0T37I. */
export const AMAZON_FAHRENHEAT_FUH54 = amazonDp("B00PX0T37I");

/** Comfort Zone CZ798 1500W milkhouse. Measured ASIN B004VVJANC. */
export const AMAZON_MILKHOUSE_1500W = amazonDp("B004VVJANC");

/** Dr. Infrared DR-975 7500W wall/ceiling shop heater. Measured ASIN B01M8KXXAB. */
export const AMAZON_DR_INFRARED_DR975 = amazonDp("B01M8KXXAB");

/** Heat Storm Tradesman HS-1500-TT 1500W wall/tripod infrared. Measured ASIN B07JQPCFJ3. */
export const AMAZON_HEAT_STORM_TRADESMAN = amazonDp("B07JQPCFJ3");

/** Comfort Zone CZQTV5M 750/1500W ceiling dual-quartz infrared. Ceiling only per the manual. Measured ASIN B07YBH9XVG. */
export const AMAZON_COMFORT_ZONE_CZQTV5M = amazonDp("B07YBH9XVG");

/** Dr. Infrared DR-238 900/1200/1500W carbon infrared, wall or ceiling. Measured ASIN B077JM5PB9. */
export const AMAZON_DR_INFRARED_DR238 = amazonDp("B077JM5PB9");

/** M-D 3822 / 03822 vinyl garage-door top and sides seal, 30 ft, nail-on. Measured ASIN B0009F86SE. */
export const AMAZON_MD_DOOR_TOP_SIDES = amazonDp("B0009F86SE");

/** M-D nail-on garage-door bottom rubber, 16 ft (listing also titled 3749). Measured ASIN B016TQHG4G. */
export const AMAZON_MD_DOOR_BOTTOM = amazonDp("B016TQHG4G");
