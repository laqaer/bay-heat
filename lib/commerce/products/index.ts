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
