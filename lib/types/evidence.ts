// Evidence marks: every decision-driving number on the site carries one of these.
// M = measured (a published log exists). C = computed (by our engine). S = spec (a manual or code section).
// R = reference (a code citation). E = estimate (a labeled assumption).
export type Ev = "M" | "C" | "S" | "R" | "E";

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  retrieved: string; // YYYY-MM-DD
  quote?: string;
};

export type Fact<T extends number | string = number> = {
  id: string; // 'cz220.watts.high'
  value: T;
  unit?: string; // 5000, 'W'
  ev: Ev;
  sourceId: string; // key into SOURCES
  checked: string; // YYYY-MM-DD
  status: "verified" | "verify"; // 'verify' facts never render in production
  note?: string;
};
