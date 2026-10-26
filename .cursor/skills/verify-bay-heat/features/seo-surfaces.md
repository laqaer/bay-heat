# SEO surfaces

Crawlers, not readers, consume `/robots.txt`, `/sitemap.xml`, and `/ads.txt`. These files must exist on the local instance and name the production host `bayheatguide.com`.

## Sub-features

- `seo-robots` allows `/`, disallows `/api/`, and points sitemap at `https://bayheatguide.com/sitemap.xml`.
- `seo-sitemap` lists the indexed routes. `indexable` pages are included. `humanReview: "pending"` and `indexable: false` stay out. The thermostat guide is the hold.
- `seo-ads` serves the placeholder seller file. It names the host and says no sellers are authorized yet.

## How to get to it (user POV)

- Request `/robots.txt` in a browser or crawler.
- Request `/sitemap.xml`.
- Request `/ads.txt`.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- You are driving the local instance, not `https://bayheatguide.com`.

- **Robots.** Run `bay-heat get /robots.txt --expect "Allow: /" --expect "Disallow: /api/" --expect "https://bayheatguide.com/sitemap.xml"`. Status is `200`.
- **Sitemap.** Run `bay-heat get /sitemap.xml --expect "https://bayheatguide.com/" --expect "https://bayheatguide.com/about" --expect "https://bayheatguide.com/privacy" --expect "https://bayheatguide.com/garage-heater-calculator" --expect "https://bayheatguide.com/how-we-work" --expect "https://bayheatguide.com/cost-to-heat-a-garage" --expect "https://bayheatguide.com/best-garage-heater" --expect "https://bayheatguide.com/natural-gas-garage-heater" --expect "https://bayheatguide.com/240v-garage-heater" --expect "https://bayheatguide.com/best-wall-mount-garage-heaters" --expect "https://bayheatguide.com/electric-garage-heater"`. Status is `200`. The body must not contain `https://bayheatguide.com/garage-heater-thermostat`.
- **Ads placeholder.** Run `bay-heat get /ads.txt --expect "bayheatguide.com" --expect "No authorized digital sellers yet"`. Status is `200`.
- **Bundle.** Run `bay-heat seo --dir .cursor/skills/verify-bay-heat/evidence/seo-surfaces`. Every printed line starts with `pass`.
- **Proof.** Keep the saved `robots.txt`, `sitemap.xml`, `ads.txt`, and `seo.meta.json`. Write `PROOF.txt` with feature id `seo-surfaces` and entry `bay-heat seo`. Screenshots are optional. The bodies are the proof.

## Gotchas

- Locs use the production origin `https://bayheatguide.com`, not `http://127.0.0.1:4317`. That is `lib/site.ts` `SITE_URL`. Do not “fix” the sitemap by fetching production.
- Homepage loc is `https://bayheatguide.com/` with a trailing slash.
- `/240v-garage-heater` and `/infrared-garage-heater` are indexed money pages. A sitemap that omits them is the PR #37 regression. `/garage-heater-thermostat` stays out while `humanReview` is `pending` and `indexable` is false.
- `ads.txt` is a comment-only placeholder. It does not contain the words `ads.txt placeholder`. A missing live `DIRECT` row is not a failure until ads are wired.
- `next dev` and `next start` both serve these App Router files. If a check 404s, doctor the HTML origin first. You may be on a foreign port.
- Do not submit the sitemap to Search Console or otherwise create crawler traffic as part of verification.
