# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from `company/BLUEPRINT.md` and the live pages, because the structured question tool is not in this session's tool surface (probe returned no question tool). A homeowner or shop owner in a cold garage, usually on a phone, deciding which electric heater the circuit they already have can run, and whether to seal the building before buying more watts.

## Product Purpose

BayHeat is an independent garage climate lab. An open model sizes a heater for one garage, shows the circuit and the cost, and says when a unit is unsafe. Success is a reader who can act on a number that shows its work, without a sign-up.

## Positioning

The mechanism is a published heat-loss model plus a safety verdict, not a roundup of affiliate winners. Neighboring heater blogs can list products. They cannot truthfully say every decision-driving number is computed by the same open model and graded by where it came from.

## Operating Context

The reader opens a guide or the planner, checks a ZIP or a circuit, and may follow a disclosed Amazon Associates link. There is no account, cart, or checkout on the site. Long guides are readable with JavaScript disabled. `/ads.txt` is a placeholder. Legacy BayHeat Guide URLs 308-redirect from `lib/redirects.ts` and `vercel.json`.

## Capabilities and Constraints

Confirmed by the task and the repo:

- Static Next.js site. Titles, meta, canonicals, and headings stay as they are.
- BH-BF-FRESH-001 is in source and is not deployed. `/best-infrared-garage-heaters` redirects to `/infrared-garage-heater`. That page, `/garage-door-bottom-seal`, and `/garage-heaters` show one note that Black Friday and holiday prices change daily. Amazon buttons on those pages read Check today's price. Article `dateModified` and the visible Updated line use `updated`, which is `2026-11-24`. Href, tag, and rel are unchanged. There are no new ASINs. `lib/pages/seasonal.test.ts` and verify-bay-heat cover the change.
- Amazon links keep `tag=laqaer-20`.
- No invented statistics.
- Visual work is CSS, SVG, or a tiny canvas. No new heavy dependencies. `$0`.
- `prefers-reduced-motion` is respected.
- LCP stays text or a static image. No CLS regression. Affiliate blocks do not shift layout.
- `/ads.txt` and the redirect map keep working.

## Brand Commitments

Name BayHeat. Descriptor Garage Climate Lab. Tagline "Every number shows its work." Publisher Laqaer Products. Domain bayheatguide.com. The task pins the replacement visual world as premium, warm, and editorial, with original garage, heater, radiant, and wiring drawings. The previous art direction in the blueprint is "Inspection Grade" (cool paper, dark thermal camera, Archivo, Martian Mono, ember `#FF8A1F`). This task replaces that look. It does not replace the name, tagline, or numbers.

## Evidence on Hand

Real plan output, EIA prices, code citations, and product manuals already render through `lib/planner` and `lib/facts`. No physical lab log is published yet. Do not draw a measurement the model did not compute, and do not add a testimonial.

## Product Principles

- The number is the product. Decoration never covers a figure or a verdict.
- Safety language stays next to the paid link, in the alarm color, and is never restyled into a marketing badge.
- A page must still make sense with JavaScript off and with motion reduced.
- Speed is part of the editorial tone. The first paint is the headline, not an effect.

## Accessibility & Inclusion

Body text and control labels meet WCAG AA contrast. Focus states stay visible. The mobile sticky bar must not cover focused controls. Motion is optional.
