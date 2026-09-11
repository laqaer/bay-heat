# Home decision hub

The homepage is the decision-tree hub: it tells a reader to start from the circuit they have, then links every comparison guide without inventing scores.

## Sub-features

- `home-identity` shows BayHeat Guide, the circuit-first `h1`, and the publisher line.
- `home-cta-voltage` follows `Start with voltage` into the 120 V vs 240 V guide.
- `home-cta-size` follows `Size by garage` into the size guide.
- `home-decision-tree` exposes the five ordered steps and their labeled links.
- `home-all-guides` lists every comparison guide card.
- `home-chrome` keeps primary nav, footer disclosures, and the About/Privacy escapes.

## How to get to it (user POV)

- Open `/` on the local instance.
- Choose the `BayHeat Guide` brand mark in the header from any page.
- Choose `Decision hub` in the footer Site list.
- Choose `Home` in a guide breadcrumb.
- Land on an unknown URL and choose `Back to BayHeat Guide`.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- The run owns that port (`instance.json` pid is alive).

- **Open hub.** Open `/`. Run `bay-heat get / --expect "Choose the electric garage heater that matches the circuit you have." --expect "Decision tree" --expect "All guides"`. Status is `200`, title contains `BayHeat Guide`, JSON-LD includes `WebSite`.
- **Voltage CTA.** Choose `Start with voltage`. Run `bay-heat follow --from / --name "Start with voltage" --expect "120V vs 240V garage heaters: what your circuit can actually run"`. The destination path is `/120v-vs-240v-garage-heater`.
- **Size CTA.** Return to `/` and choose `Size by garage` in the hero (not only the decision-tree card). Run `bay-heat follow --from / --name "Size by garage" --expect "Electric garage heater size: 1-car, 2-car, and 3-car wattage ranges"`. The destination path is `/best-electric-garage-heaters-by-size`.
- **Decision tree.** From `/`, follow each tree label. Run `bay-heat follow --from / --name "120V vs 240V"`, `… "Forced-air vs infrared"`, `… "Insulate first"`, `… "Wall vs ceiling"`. Each landing `h1` matches the route table in `SKILL.md`.
- **All guides.** From `/`, follow a card by its full title. Run `bay-heat follow --from / --name "120V vs 240V garage heaters: circuit and breaker reality" --expect "what your circuit can actually run"`.
- **Footer chrome.** From `/`, confirm disclosures. Run `bay-heat get / --expect "Affiliate disclosure." --expect "Safety." --expect "hello@bayheatguide.com"`.
- **Proof.** Capture the hub, then the page after the voltage CTA. Run `bay-heat snapshot / --dir .cursor/skills/verify-bay-heat/evidence/home --screenshot` and `bay-heat snapshot /120v-vs-240v-garage-heater --dir .cursor/skills/verify-bay-heat/evidence/home --screenshot`. Write `PROOF.txt` with feature id `home` and entry `Start with voltage`. Both screenshots show BayHeat Guide; the second `h1` is the voltage guide.

## Gotchas

- `Size by garage` appears as a hero CTA and as a decision-tree label. Both go to the same path. If you need to prove the hero, say so in `PROOF.txt`; `follow` matches the first equal name in document order (hero first).
- Desktop `Primary` nav is not in the layout below the `lg` breakpoint. A 390-wide screenshot that lacks those links is not a nav bug.
- `WebSite` JSON-LD is in the root layout, so it appears on every HTML page. That does not prove the homepage body rendered.
- A 404 still includes the site header. Prove the hub by the home `h1`, not by the word BayHeat alone.
- Do not treat a production curl of `https://bayheatguide.com/` as this feature. Canonicals in local HTML point at that host on purpose.
