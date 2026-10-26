# Privacy

Privacy names what this deployment collects. There is no account and BayHeat sets no first-party cookie.

## Sub-features

- `privacy-open` reaches `/privacy` from the footer and from About.
- `privacy-identity` shows `Privacy policy`.
- `privacy-sections` covers collection and what the site does not do.

## How to get to it (user POV)

- Choose `Privacy` in the footer Company list.
- Choose `privacy page` on the About page.
- Open `/privacy` directly.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.

- **Footer entry.** From the hub, choose `Privacy`. Run `bay-heat follow --from / --name "Privacy" --expect "Privacy policy" --expect "BayHeat collects very little"`. Status is `200` and the path is `/privacy`.
- **About entry.** From About, choose `privacy page`. Run `bay-heat follow --from /about --name "privacy page" --expect "Privacy policy"`.
- **No-account claims.** Run `bay-heat get /privacy --expect "No account creation." --expect "No cookies set by BayHeat."`.
- **Publisher escape.** Choose `how we work page`. Run `bay-heat follow --from /privacy --name "how we work page" --expect "How we work"`.
- **Proof.** Run `bay-heat snapshot /privacy --dir .cursor/skills/verify-bay-heat/evidence/privacy --screenshot` after the footer follow. Artifacts show `Privacy policy`. Write `PROOF.txt` with feature id `privacy` and entry footer `Privacy`.

## Gotchas

- There is no header `Privacy` link. A `Primary` nav snapshot without Privacy is expected.
- The live policy does not print a `Last updated` date and does not mention `/ads.txt`. Do not require those strings.
- Do not enable or call analytics to prove the analytics clauses.
