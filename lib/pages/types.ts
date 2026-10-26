import type { Route } from "next";

export type PageEntry = {
  href: Route;
  id: string; // 'G-014', shown in the Lab stamp
  title: string;
  h1: string;
  description: string;
  kind: "home" | "tool" | "money" | "guide" | "data" | "safety" | "lab" | "trust" | "legal" | "product";
  layout: "verdict-first" | "report-first";
  nav?: { group: "planner" | "heaters" | "seal" | "safety" | "lab"; label: string };
  primaryKeyword?: string;
  volume?: number;
  reviewed: "electrical" | "gas" | null;
  // Not proof of approval. Absent is not the "pending" hold. The Lab stamp still
  // says pending when this field is omitted.
  humanReview?: "full" | "sample" | "pending";
  indexable: boolean;
  published: string; // YYYY-MM-DD
  updated: string; // YYYY-MM-DD
  rev: number;
};
