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
  // BLUEPRINT.md §5.2: verdict-first and safety pages are 100% human-reviewed before they publish, so LabLabel prints
  // "Human review: full" for them by default. A page published before the editor has signed off sets "pending",
  // which the label prints instead -- the line must never claim a review that hasn't happened.
  humanReview?: "full" | "sample" | "pending";
  indexable: boolean;
  published: string; // YYYY-MM-DD
  updated: string; // YYYY-MM-DD
  rev: number;
};
