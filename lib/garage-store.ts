"use client";

// The visitor's last-completed garage, read via useSyncExternalStore (never read localStorage in render --
// the React Compiler's `purity` lint rule fails the build on that, per company/research/nextjs16-cheatsheet.md).
// This is a *summary* only (feasibility red-team finding #12): hub and money pages must not import the full
// planner engine just to show a "Your garage: 13.0k BTU/h - B" chip, so the planner writes this small object
// on completion instead of a full PlannerResult.
import { useSyncExternalStore } from "react";
import type { Grade } from "@/lib/planner/types";

const KEY = "bayheat:garage";

export type GarageSummary = {
  code: string; // the codec string, so "Fit to my garage ->" can deep-link back into the planner
  qSize: number;
  grade: Grade;
  kw: number;
  breakerA: number;
};

// useSyncExternalStore requires getSnapshot() to return a referentially stable value when nothing changed --
// JSON.parse(raw) allocates a new object every call, which reads as "changed" on every render and loops
// (React warns "getSnapshot should be cached" and then blows the update-depth limit). Cache the last parse
// keyed by the raw string so an unchanged localStorage value returns the same object reference.
let cachedRaw: string | null = null;
let cachedValue: GarageSummary | null = null;

function safeGet(): GarageSummary | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as GarageSummary) : null;
    return cachedValue;
  } catch {
    return null;
  }
}

export function saveGarageSummary(summary: GarageSummary): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(summary));
    window.dispatchEvent(new Event("bh:garage"));
  } catch {
    // localStorage can throw (private browsing, quota, disabled); absence is normal
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("bh:garage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("bh:garage", callback);
  };
}

function getServerSnapshot(): GarageSummary | null {
  return null;
}

export function useGarage(): GarageSummary | null {
  return useSyncExternalStore(subscribe, safeGet, getServerSnapshot);
}
