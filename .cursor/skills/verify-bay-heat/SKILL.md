---
name: verify-bay-heat
description: Drive the BayHeat Guide web site (electric garage/workshop heater comparison pages) locally and prove content, navigation, and SEO surfaces the way a reader or crawler would. Use when verifying the homepage, a comparison guide, About, Privacy, sitemap/robots/ads.txt, or after editorial or route changes.
---

# Verify BayHeat Guide

BayHeat Guide is a static editorial Next.js App Router site. A user reads comparison pages and follows links. There is no account, search box, form, or checkout. Drive the **local** instance this run started. Do not generate traffic against production, do not use paid SEO/crawl tools, and do not touch Charting Stars, Seraph, or outreach.

Read `features/README.md`, then the feature file you are proving. One convenient deep-link is not coverage when the map lists other entry points.

## Interview (what this skill is built on)

- **Surface:** browser web UI. Secondary crawler files: `/robots.txt`, `/sitemap.xml`, `/ads.txt`.
- **Run:** `npm install` then `next dev` (README). No app env vars. Node 20+.
- **Drive:** no Playwright/Cypress/expect harness in this repo. Use `helpers/bay-heat` (HTTP of real routes + Chrome headless screenshots). Follow named links; do not only GET the destination.
- **Observe:** status, `<title>`, `h1`, nav link names, JSON-LD `@type`, sitemap locs, screenshots, extracted text.
- **Isolate:** bind `127.0.0.1:4317` by default. Two runs need two `BAYHEAT_PORT` values. No database. Never drive `:3000` unless this run's `instance.json` owns it. Refusing a shared/foreign instance beats corrupting a human `npm run dev`.

## Launch

From the repo root, after `npm install`:

```bash
chmod +x .cursor/skills/verify-bay-heat/helpers/bay-heat
BAYHEAT_PORT=4317 BAYHEAT_HOST=127.0.0.1 \
  .cursor/skills/verify-bay-heat/helpers/bay-heat launch
```

Ready when the helper prints `launched pid=… http://127.0.0.1:4317` and `GET /` is HTTP 200 with the strings `BayHeat` and `One garage. Seven answers.`. The Next log is `/tmp/bay-heat-verify-4317/next.log`. Instance metadata is `/tmp/bay-heat-verify-4317/instance.json`.

Production-like (optional): `npm run build` then `BAYHEAT_MODE=start` with the same launch command. `next start` also accepts `--hostname` and `--port`. Default verification uses `dev` because that is the documented local command.

Teardown is `bay-heat cleanup` (see Cleanup). Do not `pkill next`.

If `npm install` or launch fails, stop and report that blocker. Do not invent a different stack.

## Doctor

Read-only. Run this first whenever anything looks off:

```bash
BAYHEAT_PORT=4317 BAYHEAT_HOST=127.0.0.1 \
  .cursor/skills/verify-bay-heat/helpers/bay-heat doctor
```

Pass means all of:

- `/tmp/bay-heat-verify-$PORT/instance.json` exists and its `pid` is alive
- that file's host/port match `BAYHEAT_HOST` / `BAYHEAT_PORT`
- `GET /` is 200 (this is the listen check; `next-server` is often a child of the recorded pid)
- `<title>` contains `BayHeat`
- `h1` is `One garage. Seven answers.`
- if a listener pid is visible, it is in that launch pid's process tree

If doctor fails, do not drive. Launch this run's instance, or stop. A page that looks like BayHeat on a port you did not start is a foreign instance.

## Drive

Harness: `helpers/bay-heat`. Stable handles are **accessible names and routes**, not CSS or coordinates.

| Handle | What it is |
| --- | --- |
| Brand link `BAYHEAT` | header wordmark → `/` |
| `nav` named `Primary` | `Planner`, `Can I Run It?`, `The Lab`, plus Heater and Seal menus (hidden below `lg`) |
| `Size my garage` | header CTA → `/garage-heater-calculator` |
| `Check my heater →` | home section → `/can-i-run-it` |
| `240V` | Heaters menu → `/240v-garage-heater` |
| `Infrared` | Heaters menu → `/infrared-garage-heater` |
| `nav` named `Breadcrumb` | `Home` plus the page nav label |
| Footer `Power it` | → `/240v-garage-heater` |
| Footer `About` | → `/about` |
| Footer `Privacy` | → `/privacy` |
| Footer `How we work` | → `/how-we-work` |

Routes a reader can open:

| Path | Identity `h1` |
| --- | --- |
| `/` | One garage. Seven answers. |
| `/garage-heater-calculator` | Garage heater calculator |
| `/can-i-run-it` | Can I run it? |
| `/240v-garage-heater` | 240V garage heaters |
| `/infrared-garage-heater` | Infrared garage heaters |
| `/electric-vs-propane-garage-heater` | Electric vs propane garage heaters |
| `/about` | About BayHeat |
| `/privacy` | Privacy policy |
| `/how-we-work` | How we work |

Unknown paths render `This page moved or never existed.` with link `Size my garage`.

Commands (always pass the same `BAYHEAT_PORT` / `BAYHEAT_HOST` as launch):

```bash
H=.cursor/skills/verify-bay-heat/helpers/bay-heat

$H get /
$H get / --expect "One garage. Seven answers." --expect "As an Amazon Associate"

$H follow --from / --name "Size my garage" \
  --expect "Garage heater calculator"

$H follow --from / --name "About" \
  --expect "About BayHeat"

$H screenshot / --out .cursor/skills/verify-bay-heat/evidence/home/hub.png
$H snapshot / --dir .cursor/skills/verify-bay-heat/evidence/home --screenshot
```

Every feature file repeats this pairing: user action → exact `bay-heat` command → observable result.

## Evidence

Proof directory (never deleted by cleanup):

`.cursor/skills/verify-bay-heat/evidence/<feature-id>/`

Minimum for a UI feature:

- action: the `follow` or click that left the previous page (stdout + destination snapshot)
- result: snapshot of the arrived page (`*.txt` headings/nav, `*.html`, `*.meta.json`, `*.png`)
- identity: visible `BayHeat` plus the page `h1` from the table above

Minimum for SEO files: `bay-heat seo --dir .cursor/skills/verify-bay-heat/evidence/seo-surfaces` and the saved bodies.

Standards:

- Exercise the real reader path (named link or header/footer). A raw `get` of the destination is a skip of the entry point, not a pass.
- Capture the action and the resulting page, not only the final screenshot.
- Confirm on-page side effects that exist: JSON-LD `@type` (`WebSite` and `Organization` on every page via the root layout; `BreadcrumbList` on report pages), footer disclosure `As an Amazon Associate`, canonical host `https://bayheatguide.com`.
- Do not mock Next, and do not hit retailer/affiliate networks. Some Amazon Associates text links are live; do not follow them during verification.
- Do not call this a dry-run of production. Local HTML still embeds production canonicals and JSON-LD URLs from `lib/site.ts`; that is expected and is not proof that production was requested.

Record the feature id and entry point on every artifact (`*.meta.json` already stores `url` and `capturedAt`; add a one-line `PROOF.txt` naming the feature id and the command used).

## Cleanup

```bash
BAYHEAT_PORT=4317 BAYHEAT_HOST=127.0.0.1 \
  .cursor/skills/verify-bay-heat/helpers/bay-heat cleanup
```

Kills only the pid in this run's `instance.json` (and a listener on that port whose cmdline is this repo's `next` with that port). Removes `/tmp/bay-heat-verify-$PORT/`. Does **not** delete `.cursor/skills/verify-bay-heat/evidence/`. After cleanup, confirm the evidence files still exist before reporting a pass.

If a drive fails, run cleanup before the next launch so port 4317 is not stranded.

## Helpers

`helpers/bay-heat` is executable. Invocation is always from the repo root with the env vars above.

| Command | Purpose |
| --- | --- |
| `bay-heat launch` | Start `next dev` (or `next start` if `BAYHEAT_MODE=start`) on `BAYHEAT_HOST:BAYHEAT_PORT` |
| `bay-heat doctor` | Read-only health + identity |
| `bay-heat url` | Print `http://host:port` |
| `bay-heat get <path> [--expect text]...` | GET a path; print status/title/h1; assert substrings |
| `bay-heat follow --from <path> --name <text>` | Find that link on the source page, GET its href |
| `bay-heat snapshot <path> --dir <dir> [--screenshot]` | Save html/txt/meta (and optional png) |
| `bay-heat screenshot <path> --out <file>` | Chrome headless 1280×900 png |
| `bay-heat seo [--dir <dir>]` | Assert robots/sitemap/ads.txt |
| `bay-heat cleanup` | Tear down this instance; keep evidence |

Chrome is `/usr/local/bin/google-chrome` or `BAYHEAT_CHROME`. Screenshots use `--headless=new --no-sandbox` and a disposable `--user-data-dir` under `/tmp/bay-heat-chrome-*`. If Chrome exits slowly after writing the PNG, the helper still accepts the file. If Chrome is missing, HTTP snapshots still prove content; say the screenshot step was blocked.

## Isolate and concurrency

- Default verification URL: `http://127.0.0.1:4317`
- Second instance: `BAYHEAT_PORT=4318` (run dir becomes `/tmp/bay-heat-verify-4318`)
- Bind `127.0.0.1` so a leftover `next dev` on `0.0.0.0:3000` is a different server
- No seed data, no auth cookies, no writable content store

## Anti-jobs

Do not change Charting Stars or Seraph. Do not buy tools. Do not send email or social posts. Do not crawl or “warm” `bayheatguide.com` as a traffic trick. Local proof is enough.
