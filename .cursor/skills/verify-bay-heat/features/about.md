# About

About states who publishes BayHeat and how to reach `hello@bayheatguide.com`.

## Sub-features

- `about-open` reaches `/about` from the footer.
- `about-identity` shows `About BayHeat`, Laqaer Products, and the contact address.
- `about-contact` exposes the mailto and the privacy escape.

## How to get to it (user POV)

- Choose `About` in the footer Company list.
- Open `/about` directly.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.

- **Footer entry.** From the hub, choose `About`. Run `bay-heat follow --from / --name "About" --expect "About BayHeat" --expect "Laqaer Products" --expect "hello@bayheatguide.com"`. Status is `200` and the path is `/about`.
- **Standards escape.** On About, choose `How we work`. Run `bay-heat follow --from /about --name "How we work" --expect "How we work"`.
- **Contact and privacy.** Run `bay-heat get /about --expect "hello@bayheatguide.com"` then `bay-heat follow --from /about --name "privacy page" --expect "Privacy policy"`.
- **JSON-LD.** Run `bay-heat get /about`. Printed `json-ld` includes `WebSite` and `Organization`.
- **Proof.** Run `bay-heat snapshot /about --dir .cursor/skills/verify-bay-heat/evidence/about --screenshot` after the footer follow. The artifacts show `About BayHeat`. Write `PROOF.txt` with feature id `about` and entry `About`.

## Gotchas

- There is no header `About` link. The footer link is the reader path.
- Mailto `hello@bayheatguide.com` is a link. Do not send mail as part of verification.
- `Organization` JSON-LD is in the root layout, so it appears on every page. Missing `Article` here is expected.
