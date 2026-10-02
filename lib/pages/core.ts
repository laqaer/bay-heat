import type { PageEntry } from "./types.ts";

export const PAGES: PageEntry[] = [
  {
    href: "/",
    id: "G-001",
    title: "BayHeat — Garage Climate Lab",
    h1: "One garage. Seven answers.",
    description:
      "BayHeat is the independent garage climate lab. An open model sizes the heater for your garage, grades every number by where it came from, and tells you plainly when a heater will trip your breaker or gas you.",
    kind: "home",
    layout: "report-first",
    reviewed: null,
    indexable: true,
    published: "2026-10-02",
    updated: "2026-10-02",
    rev: 1,
  },
  {
    href: "/garage-heater-calculator",
    id: "G-002",
    title: "Garage heater calculator: the BTU/h, breaker and cost per hour for your garage",
    h1: "Garage heater calculator",
    description:
      "A ZIP code and five taps give you the heat load, the heater that fits, the breaker it needs, the cost per hour and the warm-up time — with every formula shown.",
    kind: "tool",
    layout: "report-first",
    nav: { group: "planner", label: "Planner" },
    primaryKeyword: "garage heater calculator",
    volume: 880,
    reviewed: null,
    indexable: true,
    published: "2026-10-02",
    updated: "2026-10-02",
    rev: 1,
  },
];
