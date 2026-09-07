# SEO surfaces

Crawlers, not readers, consume `/robots.txt`, `/sitemap.xml`, and `/ads.txt`. These files must exist on the local instance and name the production host `bayheatguide.com`.

## Sub-features

- `seo-robots` allows `/` and points sitemap at `https://bayheatguide.com/sitemap.xml`.
- `seo-sitemap` lists the homepage plus every guide, About, and Privacy.
- `seo-ads` serves the placeholder seller file (not a live ads.txt account).

## How to get to it (user POV)

- Request `/robots.txt` in a browser or crawler.
- Request `/sitemap.xml`.
- Request `/ads.txt`.
- Privacy copy tells a reader that `/ads.txt` is a placeholder; that sentence is not this feature's entry point.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- You are driving the local instance, not `https://bayheatguide.com`.

- **Robots.** Run `bay-heat get /robots.txt --expect "Allow: /" --expect "https://bayheatguide.com/sitemap.xml"`. Status is `200`.
- **Sitemap.** Run `bay-heat get /sitemap.xml --expect "https://bayheatguide.com</loc>" --expect "https://bayheatguide.com/120v-vs-240v-garage-heater" --expect "https://bayheatguide.com/about" --expect "https://bayheatguide.com/privacy"`. Status is `200`. Also expect locs for `/best-electric-garage-heaters-by-size`, `/forced-air-vs-infrared-garage-heater`, `/best-ceiling-mount-garage-heaters-under-200`, `/portable-garage-heaters-15a-circuit`, `/wall-mount-vs-ceiling-garage-heater`, and `/insulate-garage-before-heater-upgrade`.
- **Ads placeholder.** Run `bay-heat get /ads.txt --expect "ads.txt placeholder" --expect "bayheatguide.com"`. Status is `200`. A commented sample `google.com, pub-` line may be present; it is not a live seller row.
- **Bundle.** Run `bay-heat seo --dir .cursor/skills/verify-bay-heat/evidence/seo-surfaces`. Every printed line starts with `pass`.
- **Proof.** Keep the saved `robots.txt`, `sitemap.xml`, `ads.txt`, and `seo.meta.json`. Write `PROOF.txt` with feature id `seo-surfaces` and entry `bay-heat seo`. Screenshots are optional; the bodies are the proof.

## Gotchas

- Locs use the production origin `https://bayheatguide.com`, not `http://127.0.0.1:4317`. That is `lib/site.ts` `site.url`. Do not “fix” the sitemap by fetching production.
- Homepage loc is `https://bayheatguide.com` with no trailing path. A check for `https://bayheatguide.com/` may fail.
- `ads.txt` is intentionally a placeholder. A missing live `DIRECT` row is not a failure until ads are wired.
- `next dev` and `next start` both serve these App Router files. If a check 404s, doctor the HTML origin first; you may be on a foreign port.
- Do not submit the sitemap to Search Console or otherwise create crawler traffic as part of verification.
