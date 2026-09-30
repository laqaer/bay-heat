// Frozen list of every product id the site can reference. Each lane's products file
// (lib/commerce/products/{core,seal,electric,fuel,safety}.ts) must draw its Product.id values from here, and
// commerce.test.ts asserts every catalog.ts HeaterClass.productIds and every ProductKind reference resolves to
// one of these. Adding an id needs an integrator-approved PR (it is frozen, per BLUEPRINT.md §9.1).

export const PRODUCT_IDS = [
  // core / electric (verified ASINs; see lib/commerce/products/core.ts VERIFIED_ASINS)
  "cz220-5kw-ceiling",
  "fuh54-5kw",
  "cz798-1500w-milkhouse",
  "dr975-7k5-shop",
  "hs1500tt-wall-infrared",
  // electric, unverified (tagged search links)
  "e-240-4k-generic",
  "e-240-10k-generic",
  "e-ir-240-generic",
  "e-port-1500-generic",
  // seal / insulate
  "seal-bottom-t-8ft",
  "seal-bottom-t-16ft",
  "seal-bottom-bulb-16ft",
  "seal-retainer-kit",
  "seal-perimeter-stop",
  "seal-service-door-kit",
  "attic-hatch-gasket",
  "door-kit-eps-matador",
  "door-kit-eps-cellofoam",
  "door-kit-reflective-owens-corning",
  "door-kit-reflective-reach-barrier",
  // safety
  "co-alarm-plugin-display",
  "co-alarm-battery-10yr",
  "extinguisher-abc",
  "thermostat-line-voltage-dp",
  "fridge-heater-kit",
  "freeze-alarm-wifi",
  // fuel
  "diesel-heater-5kw",
  "diesel-heater-8kw",
  "diesel-exhaust-kit",
  "propane-buddy-9k",
  "propane-big-buddy-18k",
  "gas-unit-heater-big-maxx-50",
  "gas-unit-heater-hot-dawg-45",
  // cooling (cross-sell only; see GarageInput.wantsCooling)
  "minisplit-12k-230v",
] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];
