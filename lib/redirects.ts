// Redirect map for URLs that changed in the 2026-10 rebuild (BayHeat Guide -> BayHeat).
// Every destination must have a real page at app/(site)<destination>/page.tsx -- lib/redirects.test.ts asserts it.
// `permanent: true` is applied by next.config.ts (308).

export type RedirectRule = { source: string; destination: string };

export const REDIRECTS: RedirectRule[] = [
  { source: "/best-electric-garage-heaters-by-size", destination: "/garage-heater-size" },
  { source: "/electric-garage-heater-operating-cost", destination: "/cost-to-heat-a-garage" },
  { source: "/120v-vs-240v-garage-heater", destination: "/240v-garage-heater" },
  { source: "/hardwired-vs-plugin-garage-heater", destination: "/240v-garage-heater" },
  { source: "/portable-garage-heaters-15a-circuit", destination: "/portable-garage-heater" },
  { source: "/forced-air-vs-infrared-garage-heater", destination: "/infrared-garage-heater" },
  { source: "/best-ceiling-mount-garage-heaters-under-200", destination: "/ceiling-mount-garage-heater" },
  { source: "/wall-mount-vs-ceiling-garage-heater", destination: "/ceiling-mount-garage-heater" },
  { source: "/insulate-garage-before-heater-upgrade", destination: "/how-to-insulate-a-garage" },
];
