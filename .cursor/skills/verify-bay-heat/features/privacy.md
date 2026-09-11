# Privacy

Privacy explains what a content and affiliate comparison site may collect. There are no user accounts and no first-party account cookie on the launch site.

## Sub-features

- `privacy-open` reaches `/privacy` from the footer and from About.
- `privacy-identity` shows `Privacy policy`, `Last updated 2026-09-05`, and BayHeat Guide / Laqaer Products.
- `privacy-sections` covers collection, cookies, what we do not do, and requests.
- `privacy-ads-pointer` names `/ads.txt` as a placeholder until ads exist.

## How to get to it (user POV)

- Choose `Privacy` in the footer Site list.
- Choose `privacy policy` on the About page.
- Open `/privacy` directly.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.

- **Footer entry.** From the hub, choose `Privacy`. Run `bay-heat follow --from / --name "Privacy" --expect "Privacy policy" --expect "Last updated 2026-09-05"`. Status is `200` and the path is `/privacy`.
- **About entry.** From About, choose `privacy policy`. Run `bay-heat follow --from /about --name "privacy policy" --expect "This policy describes how BayHeat Guide"`.
- **No-account claims.** Run `bay-heat get /privacy --expect "We do not run user accounts" --expect "We do not sell your email address." --expect "We do not require an account to read guides."`.
- **Cookies.** Run `bay-heat get /privacy --expect "We do not set a first-party account cookie" --expect "the guides will still read"`.
- **Ads placeholder mention.** Run `bay-heat get /privacy --expect "/ads.txt" --expect "placeholder"`.
- **Publisher escape.** Choose `about page`. Run `bay-heat follow --from /privacy --name "about page" --expect "About BayHeat Guide"`.
- **Proof.** Run `bay-heat snapshot /privacy --dir .cursor/skills/verify-bay-heat/evidence/privacy --screenshot` after the footer follow. Artifacts show `Privacy policy` and `Information we may collect`. Write `PROOF.txt` with feature id `privacy` and entry footer `Privacy`.

## Gotchas

- There is no header `Privacy` link. A `Primary` nav snapshot without Privacy is expected.
- `Last updated` is `legalPages` `updated` (`2026-09-05` as of this map). If the date in `lib/site.ts` changes, update this file; do not treat a new honest date as a product bug without reading the source.
- Mentioning `/ads.txt` is not proof the seller file is correct. That is the `seo-surfaces` feature.
- Do not enable or call analytics/ad networks to “prove” those later clauses.
