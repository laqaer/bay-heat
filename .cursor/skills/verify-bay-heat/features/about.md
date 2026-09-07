# About

About states who publishes BayHeat Guide, the editorial rules (no invented scores), and how to reach `hello@bayheatguide.com`.

## Sub-features

- `about-open` reaches `/about` from header, footer, and in-body home link.
- `about-identity` shows `About BayHeat Guide`, Laqaer Products, and `bayheatguide.com`.
- `about-standards` lists the no-scores / nameplate-only rules.
- `about-contact` exposes the mailto and the privacy escape.

## How to get to it (user POV)

- Choose `About` in the desktop `Primary` nav.
- Open `Guides` on a narrow viewport and choose `About`.
- Choose `About & editorial standards` in the footer Site list.
- Choose `editorial standards` in the homepage “How these pages are written” section.
- Open `/about` directly.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.

- **Footer entry.** From the hub, choose `About & editorial standards`. Run `bay-heat follow --from / --name "About & editorial standards" --expect "About BayHeat Guide" --expect "Laqaer Products" --expect "bayheatguide.com"`. Status is `200` and the path is `/about`.
- **Header entry.** From `/`, choose `About`. Run `bay-heat follow --from / --name "About" --expect "About BayHeat Guide"`. Same path. If more than one `About` link exists, the first document-order match is enough when its href is `/about`.
- **Home prose entry.** From `/`, choose `editorial standards`. Run `bay-heat follow --from / --name "editorial standards" --expect "Editorial standards"`.
- **Standards.** On About, assert the rules. Run `bay-heat get /about --expect "We do not invent composite review scores" --expect "Under $200" --expect "not an astrology, horoscope, or other"`.
- **Guide list.** About lists each comparison by long title. Run `bay-heat follow --from /about --name "120V vs 240V garage heaters: circuit and breaker reality" --expect "what your circuit can actually run"`.
- **Contact and privacy.** Run `bay-heat get /about --expect "hello@bayheatguide.com"` then `bay-heat follow --from /about --name "privacy policy" --expect "Privacy policy"`.
- **JSON-LD.** Run `bay-heat get /about`. Printed `json-ld` includes `WebSite` and `Organization`.
- **Proof.** Run `bay-heat snapshot /about --dir .cursor/skills/verify-bay-heat/evidence/about --screenshot` after the footer follow. The artifacts show `About BayHeat Guide` and `Editorial standards`. Write `PROOF.txt` with feature id `about` and entry `About & editorial standards`.

## Gotchas

- Footer name is `About & editorial standards` (ampersand). Header name is `About`. Do not search for `About and editorial standards`.
- Mailto `hello@bayheatguide.com` is a link. Do not send mail as part of verification.
- About says outbound buy links may be placeholders. That is not a broken-page failure.
- `Organization` JSON-LD is only added on this page (plus layout `WebSite`). Missing `Article` here is expected.
