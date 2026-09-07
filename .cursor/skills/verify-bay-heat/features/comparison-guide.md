# Comparison guide

A comparison guide is a single bookmarkable article: circuit-honest headings, a spec table where the page has one, safety and affiliate callouts, a table of contents, and related-guide escapes. The recipe below drives `/120v-vs-240v-garage-heater`. The same chrome applies to every path in `lib/site.ts` `guides`.

## Sub-features

- `guide-open` reaches the voltage guide from home, header, and breadcrumb.
- `guide-identity` shows the voltage `h1`, decision kicker, and updated date.
- `guide-toc` jumps to on-page sections from `On this page`.
- `guide-table` exposes the continuous-wattage circuit table.
- `guide-callouts` repeats electrical/fire safety and affiliate disclosure above the prose.
- `guide-related` lists the other comparison guides after the article.
- `guide-family` (optional extra) opens any other `guides[]` href and checks that page's `h1` from the SKILL route table.

## How to get to it (user POV)

- Choose `Start with voltage` or `120V vs 240V` on the homepage.
- Choose `120V vs 240V` in the desktop `Primary` nav.
- Open `Guides` on a narrow viewport and choose `120V vs 240V`.
- Choose `120V vs 240V` in the footer Guides list.
- Open `/120v-vs-240v-garage-heater` directly.
- From another guide, choose the related-guide card whose label is `120V vs 240V`.

Other comparison paths a reader can open the same way: `/best-electric-garage-heaters-by-size`, `/forced-air-vs-infrared-garage-heater`, `/best-ceiling-mount-garage-heaters-under-200`, `/portable-garage-heaters-15a-circuit`, `/wall-mount-vs-ceiling-garage-heater`, `/insulate-garage-before-heater-upgrade`.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- Home `get /` still lists the `120V vs 240V` link.

- **Home entry.** From the hub, choose `Start with voltage`. Run `bay-heat follow --from / --name "Start with voltage" --expect "120V vs 240V garage heaters: what your circuit can actually run" --expect "The 80% continuous-load rule"`. Status is `200`.
- **Header entry.** From `/`, choose the primary-nav name. Run `bay-heat follow --from / --name "120V vs 240V" --expect "what your circuit can actually run"`. Same path as the CTA.
- **Breadcrumb.** On the guide, choose `Home`. Run `bay-heat follow --from /120v-vs-240v-garage-heater --name "Home" --expect "Decision tree"`. The hub `h1` returns.
- **TOC.** On the guide, choose `1. The 80% continuous-load rule`. Run `bay-heat follow --from /120v-vs-240v-garage-heater --name "1. The 80% continuous-load rule"`. The request may include `#continuous`; the HTML still contains `id="continuous"` and `15 A × 120 V × 0.8 = 1,440 W.`
- **Table.** Stay on the voltage guide. Run `bay-heat get /120v-vs-240v-garage-heater --expect "Approximate continuous wattage ceilings by common residential circuits" --expect "15 A general receptacle" --expect "30 A two-pole dedicated"`.
- **Callouts.** Run `bay-heat get /120v-vs-240v-garage-heater --expect "Electrical and fire safety" --expect "Affiliate disclosure" --expect "Hire a licensed electrician"`.
- **JSON-LD.** Run `bay-heat get /120v-vs-240v-garage-heater`. Printed `json-ld` includes `WebSite`, `Article`, and `BreadcrumbList`.
- **Related.** Choose another guide from the article footer. Run `bay-heat follow --from /120v-vs-240v-garage-heater --name "15 A portable" --expect "Portable garage heaters on a 15 A circuit: milkhouse and utility units"`.
- **Proof.** Snapshot the voltage guide after the home follow. Run `bay-heat snapshot /120v-vs-240v-garage-heater --dir .cursor/skills/verify-bay-heat/evidence/comparison-guide --screenshot`. The png and `*.txt` show the voltage `h1`, `On this page`, and `Related guides`. Write `PROOF.txt` with feature id `comparison-guide` and entry `Start with voltage`.

## Gotchas

- Several links share the name `120V vs 240V` (tree, nav, footer). `follow` uses the first match. To prove footer vs header, snapshot the source `*.txt` and record which `NAV[…]` you intended; do not claim three entry points from one follow.
- In-page TOC hrefs are hashes. A follow that only re-GETs the same HTML does not prove the browser scrolled. For scroll proof, use a headed browser or Chrome screenshot after clicking the TOC link; the HTTP helper proves the target `id` exists.
- Guide `h1` text is `guides[].h1`, not `guides[].title`. Assert the `h1` string from the SKILL table.
- Related cards use `navLabel` as the visible title (`15 A portable`), not the long `title`.
- Comfort Zone / Fahrenheat names are product classes, not live prices. Do not open placeholder retailer hrefs.
- Proving only the voltage guide does not prove every sibling. Say `guide-family` was skipped, or follow one more `guides[]` path and check its `h1`.
