export const site = {
  name: "BayHeat Guide",
  shortName: "BayHeat",
  domain: "bayheatguide.com",
  url: "https://bayheatguide.com",
  email: "hello@bayheatguide.com",
  publisher: "Laqaer Products",
  tagline: "Boring, specific advice for electric garage and workshop heaters.",
  description:
    "BayHeat Guide helps you choose an electric garage or workshop heater by circuit, size, and heat type — 120V vs 240V, forced-air vs infrared, portable vs ceiling-mount.",
  locale: "en-US",
  updated: "2026-09-04",
} as const;

export const affiliateDisclosure =
  "BayHeat Guide is a comparison site. When retailer or manufacturer links are live, some will be affiliate links: we may earn a commission if you buy after clicking, at no extra cost to you. Until those programs are wired, outbound buy links are placeholders. We do not invent review scores, heat-coverage claims, or wattage figures.";

export const electricalDisclaimer =
  "This site is general information, not an electrical, fire-code, or building-code inspection. National Electrical Code (NEC) rules, local amendments, listing labels, and the heater’s installation manual control the job. Hire a licensed electrician for new 240V circuits, hardwired units, and any work you are not qualified to do. Space heaters start fires when they are overloaded, covered, or placed too close to combustibles.";

export type GuideKind = "guide" | "legal" | "about";

export type Guide = {
  href: string;
  title: string;
  h1: string;
  description: string;
  navLabel: string;
  kind: GuideKind;
  summary: string;
  decision: string;
  updated: string;
};

export const guides: Guide[] = [
  {
    href: "/best-electric-garage-heaters-by-size",
    title: "Best electric garage heaters by size (1-car, 2-car, 3-car)",
    h1: "Electric garage heater size: 1-car, 2-car, and 3-car wattage ranges",
    description:
      "Wattage ranges for 1-car, 2-car, and 3-car garages, with insulation, ceiling height, and infiltration caveats. Not a substitute for a load calculation.",
    navLabel: "By size",
    kind: "guide",
    summary:
      "Start with square footage and insulation. A 1,500 W plug-in unit is a workbench heater, not a two-car garage heater.",
    decision: "How big is the space, and is it insulated?",
    updated: "2026-09-04",
  },
  {
    href: "/120v-vs-240v-garage-heater",
    title: "120V vs 240V garage heaters: circuit and breaker reality",
    h1: "120V vs 240V garage heaters: what your circuit can actually run",
    description:
      "Why a 15 A / 120 V receptacle tops out near 1,440 W continuous, when you need a dedicated 240 V circuit, and what breakers and wire typically mean for garage heaters.",
    navLabel: "120V vs 240V",
    kind: "guide",
    summary:
      "Voltage is not a feature. It is the limit of the circuit you already have — or the one you are willing to install.",
    decision: "What circuit do you actually have?",
    updated: "2026-09-04",
  },
  {
    href: "/forced-air-vs-infrared-garage-heater",
    title: "Forced-air vs infrared garage heaters",
    h1: "Forced-air vs infrared garage heaters: drafty shops vs spot heat",
    description:
      "When a fan-forced unit makes sense in a reasonably sealed garage, and when radiant / infrared heat is the better match for open doors, high ceilings, and a single workbench.",
    navLabel: "Forced-air vs IR",
    kind: "guide",
    summary:
      "Forced-air heats the air. Infrared heats people and objects. Drafts punish the first; open-door work favors the second.",
    decision: "Whole bay, or just the person at the bench?",
    updated: "2026-09-04",
  },
  {
    href: "/best-ceiling-mount-garage-heaters-under-200",
    title: "Ceiling-mount garage heaters under $200",
    h1: "Ceiling-mount garage heaters under $200: Comfort Zone and Fahrenheat-class units",
    description:
      "A spec matrix of realistic hardwired 240 V ceiling utility heaters in the Comfort Zone CZ220 and Fahrenheat FUH54 class. No invented scores. Street prices move.",
    navLabel: "Ceiling under $200",
    kind: "guide",
    summary:
      "Most sub-$200 ceiling units are the same job: 5 kW, 240 V, hardwired, 30 A, 10 AWG copper. The differences are controls and jumpers, not magic BTUs.",
    decision: "Can you hardwire 240 V and hang a 25–30 lb unit from joists?",
    updated: "2026-09-04",
  },
  {
    href: "/portable-garage-heaters-15a-circuit",
    title: "Portable garage heaters on a 15 A circuit",
    h1: "Portable garage heaters on a 15 A circuit: milkhouse and utility units",
    description:
      "What a 15 A / 120 V garage receptacle can run continuously, why 1,500 W milkhouse heaters sit on the edge of the 80% rule, and how to pick a utility heater that will not trip the breaker.",
    navLabel: "15 A portable",
    kind: "guide",
    summary:
      "On a 15 A circuit, treat ~12 A as the continuous ceiling. A 1,500 W milkhouse heater is 12.5 A — it wants to be the only load.",
    decision: "Stuck with a regular 120 V outlet?",
    updated: "2026-09-04",
  },
];

export const legalPages: Guide[] = [
  {
    href: "/about",
    title: "About BayHeat Guide",
    h1: "About BayHeat Guide",
    description:
      "Who publishes BayHeat Guide, how we write comparisons, and how to reach Laqaer Products at hello@bayheatguide.com.",
    navLabel: "About",
    kind: "about",
    summary: "A Laqaer Products comparison site. Editorial standards, not star ratings.",
    decision: "",
    updated: "2026-09-04",
  },
  {
    href: "/privacy",
    title: "Privacy policy",
    h1: "Privacy policy",
    description:
      "Privacy policy for BayHeat Guide, a content and affiliate comparison site operated by Laqaer Products.",
    navLabel: "Privacy",
    kind: "legal",
    summary: "What we collect on a content and affiliate site.",
    decision: "",
    updated: "2026-09-04",
  },
];

export const allPages = [...guides, ...legalPages];

export function findGuide(href: string): Guide | undefined {
  return allPages.find((page) => page.href === href);
}

export function relatedGuides(href: string): Guide[] {
  return guides.filter((page) => page.href !== href);
}
