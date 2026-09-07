# BayHeat Guide verification map

This directory is the maintained source for verifying reader-facing behavior of BayHeat Guide. Read this index before driving the site, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `BAYHEAT_PORT=4317 BAYHEAT_HOST=127.0.0.1` and `helpers/bay-heat launch`.
- Doctor must report `ok: yes` at `http://127.0.0.1:4317/` with title containing `BayHeat Guide` and the home `h1` about matching the circuit you have.
- `helpers/bay-heat` is executable and the same `BAYHEAT_*` values are used for every command.
- Never drive an instance this run did not start. A human `npm run dev` on port 3000 is off-limits unless `instance.json` owns that port.
- No login, seed database, or API key is required. Do not open retailer or affiliate URLs.

## Driving conventions

- Start every recipe from `/` unless the feature's preconditions say otherwise.
- Prefer link accessible names and `nav` aria-labels (`Primary`, `Breadcrumb`, `On this page`) over CSS or pixels.
- Treat commands as literal. Keep quoted names unchanged (`About & editorial standards`, `Start with voltage`).
- Run HTTP and screenshots through `helpers/bay-heat`. Do not substitute a production GET for a local follow.
- Desktop primary nav is `lg:flex` (visible at the helper's 1280×900 screenshot). Below that width the entry is the `Guides` summary.
- Cleanup may remove `/tmp/bay-heat-verify-*`. It must not remove `../evidence/`.

## Proof and skip reporting

- Capture the user action and the resulting page, not only the final screen.
- UI proof includes a text snapshot (`*.txt`) and a screenshot (`*.png`) that show BayHeat Guide and the page `h1`.
- HTTP-only proof is valid for `/robots.txt`, `/sitemap.xml`, and `/ads.txt`.
- Record the feature id and entry point in `PROOF.txt` next to the artifacts.
- An unreachable entry point is a skip: report the command and the missing link. Do not mark it verified via a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with bay-heat` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home decision hub](./home.md) covers the homepage tree, CTAs, and the all-guides index.
- [Comparison guide](./comparison-guide.md) covers a guide article (120 V vs 240 V) and the shared guide chrome used by every comparison page.
- [About](./about.md) covers publisher identity, editorial standards, and contact.
- [Privacy](./privacy.md) covers the privacy policy for a content and affiliate site.
- [SEO surfaces](./seo-surfaces.md) covers `/robots.txt`, `/sitemap.xml`, and `/ads.txt`.
