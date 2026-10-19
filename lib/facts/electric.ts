import type { Fact, Source } from "../types/evidence.ts";

// Lane stub (W10: electric heaters). Most nameplate facts for the 5 verified ASINs already live in
// lib/facts/products.ts (shared/frozen) -- this file is for electric-hub-specific facts (e.g. non-verified
// classes' typical specs) that don't belong in the frozen products registry.
export const FACTS: Fact<number | string>[] = [
  // /shop-heater cites this for the 10 kW wire size. It is 'verify' because the DR-910F PDF has no text layer
  // (it is page images), so nobody on the page's team could read the figure off the manual; a 'verify' fact never
  // renders in production, so the sentence that uses it sits inside <IfVerified>. Flip to 'verified' once someone
  // reads "60 A, 6 AWG copper" in the manual itself (the engine's own 60 A / 6 AWG THHN row agrees with it).
  {
    id: "dr910f.breaker_wire",
    value: "a 60 A circuit and 6 AWG copper",
    ev: "S",
    sourceId: "dr910f-manual",
    checked: "2026-10-09",
    status: "verify",
    note: "reported by the Round-2 fact-check; not yet read from the PDF",
  },
  {
    id: "swt2f.amps",
    value: 22,
    unit: "A",
    ev: "S",
    sourceId: "stelpro-swt",
    checked: "2026-10-19",
    status: "verified",
    note: "Stelpro SWT page: 22 A at 120-277 Vac. The double-pole model is the four-wire unit with an off position.",
  },
  {
    id: "swt2f.temp_low_f",
    value: 50,
    unit: "°F",
    ev: "S",
    sourceId: "stelpro-swt",
    checked: "2026-10-19",
    status: "verified",
    note: "Temperature range 50 to 90 °F",
  },
  {
    id: "swt2f.temp_high_f",
    value: 90,
    unit: "°F",
    ev: "S",
    sourceId: "stelpro-swt",
    checked: "2026-10-19",
    status: "verified",
  },
  {
    id: "t522.amps",
    value: 22,
    unit: "A",
    ev: "S",
    sourceId: "cadet-t522-guide",
    checked: "2026-10-19",
    status: "verified",
    note: "Owner's guide electrical ratings: 208-240 vac, 22 amps",
  },
  {
    id: "ct410b.amps",
    value: 22,
    unit: "A",
    ev: "S",
    sourceId: "ct410b-manual",
    checked: "2026-10-19",
    status: "verified",
    note: "69-1681EF-1: 22A at 120-240 Vac, noninductive. CT410B is the double-line-break model. Not a buy link.",
  },
  {
    id: "ct410b.temp_low_f",
    value: 40,
    unit: "°F",
    ev: "S",
    sourceId: "ct410b-manual",
    checked: "2026-10-19",
    status: "verified",
    note: "Temperature range 40°F to 80°F",
  },
  {
    id: "ct410b.temp_high_f",
    value: 80,
    unit: "°F",
    ev: "S",
    sourceId: "ct410b-manual",
    checked: "2026-10-19",
    status: "verified",
  },
  {
    id: "ct410b.mount_height_ft",
    value: 5,
    unit: "ft",
    ev: "S",
    sourceId: "ct410b-manual",
    checked: "2026-10-19",
    status: "verified",
    note: "Troubleshooting: about 5 ft (1.5 m) above the floor on an inside wall. Drafts or radiant heat throw the reading off.",
  },
];
export const SOURCES: Record<string, Source> = {
  "stelpro-swt": {
    id: "stelpro-swt",
    title: "Stelpro SWT line-voltage mechanical thermostat",
    publisher: "Stelpro",
    url: "https://www.stelpro.com/en/products/line-voltage-mechanical-thermostat-swt/",
    retrieved: "2026-10-19",
    quote: "22 A @ 120-277 Vac. Temperature range 50 to 90 °F. Off position on the double-pole model.",
  },
  "cadet-t522-guide": {
    id: "cadet-t522-guide",
    title: "Cadet T521/T522 wall thermostat owner's guide (720135, rev 08/01/17)",
    publisher: "Cadet",
    url: "https://www.cadetheat.com/sites/g/files/emiian441/files/2021-09/720135%20T521%20T522%20Owner%27s%20Guide%208-1-17.pdf",
    retrieved: "2026-10-19",
    quote: "208-240 vac - 22 amps. T522: turning the knob all the way to the left turns the heater off. Not where gasoline, paint, or flammable liquids are stored. Consult a licensed electrician if you are uncomfortable working with electricity.",
  },
  "ct410b-manual": {
    id: "ct410b-manual",
    title: "Honeywell CT410A,B line voltage electric heat thermostats, installation instructions 69-1681EF-1",
    publisher: "Honeywell",
    url: "https://pdf.lowes.com/useandcareguides/085267328326_use.pdf",
    retrieved: "2026-10-19",
    quote: "CT410B provides double-line break. Temperature range 40°F to 80°F. Electrical ratings: 22A at 120-240 Vac. Do not install unless you are completely familiar with house wiring. About 5 ft above the floor on an inside wall; drafts or radiant heat affect the reading.",
  },
};
