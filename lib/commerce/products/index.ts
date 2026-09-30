import type { Product } from "../types.ts";
import { PRODUCTS as CORE } from "./core.ts";
import { PRODUCTS as SEAL } from "./seal.ts";
import { PRODUCTS as ELECTRIC } from "./electric.ts";
import { PRODUCTS as FUEL } from "./fuel.ts";
import { PRODUCTS as SAFETY } from "./safety.ts";

export const ALL_PRODUCTS: Product[] = [...CORE, ...SEAL, ...ELECTRIC, ...FUEL, ...SAFETY];

export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

// The product to put on a plate for a heater class: the first one with a verified Amazon listing (a direct
// /dp/ link earns; a search link is the fallback), else the first listed.
export function primaryProduct(ids: readonly string[]): Product | undefined {
  const products = ids.map((id) => findProduct(id)).filter((p): p is Product => p !== undefined);
  return products.find((p) => p.asin) ?? products[0];
}
