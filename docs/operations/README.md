# BayHeat Guide operating record

Updated: 2026-09-26. Another agent should start here, then read `LEDGER.md` and `EXPERIMENT-001.md`.

## Mission and offer

BayHeat Guide (`https://bayheatguide.com`) helps a US garage or workshop owner choose an electric heater from the circuit, heat type, and bay they actually have, then reach a named Amazon listing.

Primary offer: circuit-honest comparison pages that earn Amazon Associates commission on tag `laqaer-20` when a reader buys. There is no direct checkout, account, or subscription.

Buyer: a homeowner or shop user who is about to purchase a heater and can be harmed by the wrong voltage or mount.

Why this offer: the pages, domain, and tagged listings already exist. Hosting is the Vercel Hobby plan. Direct checkout would need a merchant account that is not connected, and there is no evidence someone wants to pay this site instead of Amazon.

Primary channel: organic search. Paid acquisition is not authorized.

## What exists

- Public repo `laqaer/bay-heat`, production on Vercel (apex 200, `www` 308 to apex, trailing slash 308 to the canonical path). Public DNS is still Vercel (`ns1.vercel-dns.com`). A pending Cloudflare Free Website zone exists for `bayheatguide.com` and is not authoritative until Name.com nameservers change. See `docs/cloudflare-migration.md`.
- Static Next.js export. No database, auth, or payment webhook.
- Associates text links on the product guides. As of this change, the homepage, 120 V vs 240 V guide, and forced-air vs infrared guide also link the same listings.
- IndexNow key file is live at `/96098d06c16790aabec2db1a232fee8f.txt`.
- Search Console mail for the domain arrives at `add461977@gmail.com`. The OpenSEO project `017c97c0-1bce-4fed-ab1c-c17b8047cf6c` does not have Search Console or Google Analytics connected. OpenSEO credits: 0.
- `laqaer/agent-prompts` was not found. `laqaer/junction` is a local coding-agent control plane, not this site’s ledger. It is not a dependency.

## Authority and budgets

New discretionary spend: **$0**. Do not buy ads, credits, domains, or plan upgrades. Do not enable Vercel excess billing. Do not subscribe the Cloudflare zone to a paid plan, transfer `bayheatguide.com` onto Cloudflare Registrar, or enable Email Sending.

Ordinary work that stays inside that cap: edit this repo, open and merge pull requests that pass checks, let the existing Git integration deploy `main`, run IndexNow after a production change, and run the operating watchdog.

Do not change the Associates payout destination. The pending Cloudflare zone may become authoritative only by the Name.com nameserver change recorded in `docs/cloudflare-migration.md`.

## Product decisions

- Nameplate and manual figures only. No invented scores, coverage, or prices.
- Hardwired vs plug-in, operating cost, and electric vs propane do not carry affiliate buttons. They say so on the page.
- The wall-mount card does not deep-link one ASIN. Those listings are not interchangeable.
- `ads.txt` stays a placeholder until there is a real ad seller. This business is Associates, not display ads.

## Integrations (no secret values)

| System | State | Used for |
| --- | --- | --- |
| GitHub `laqaer/bay-heat` | Working. Public. Actions workflow list is readable. Branch-protection API returned 403. | Source, CI, watchdog |
| Vercel project `bay-heat` (`prj_XXDzm2duli1HeXU3va0Eaba84DUD`) | List works. Project, domain, and deployment reads return 403 for team `laqaers-projects`. Production HTTP shows Vercel serving current `main`. | Hosting |
| Cloudflare account Laqaer Products | API works. `bayheatguide.com` is a pending Free Website zone ($0). Production nameservers are still Vercel. | Prepared DNS and Google MX, not yet authoritative |
| Amazon Associates `laqaer-20` | Tag is in the HTML. No earnings mail and no dashboard in this environment. | Revenue |
| Gmail `add461977@gmail.com` | Connected. Search Console notices for this domain. No `hello@bayheatguide.com` mail. | Monitoring mail only |
| OpenSEO BayHeat project | Account connected. Search Console, Analytics, and credits are not. | Not a measurement source yet |
| Stripe | MCP needs auth. Not used. | Not the business model |
| Linear Myrmitis | Connected. No open BayHeat issue. | Not the operating queue |

## Support and incidents

- Published contact `hello@bayheatguide.com` still has **no public MX**. The pending Cloudflare zone has `MX 1 smtp.google.com`, which is not being served yet. Do not promise a reply to that address until the nameservers are Cloudflare’s and the Workspace accepts the domain.
- Electrical and fire guidance stays general information. Do not give a job-specific wiring instruction.
- If the watchdog fails, it opens or comments on one GitHub issue titled `BayHeat production health check failed`. Disable the `Operating watchdog` workflow to stop it. Rollback is the previous Vercel production deployment; this repo has no database to restore.
- Do not request `amazon.com` URLs from the health check. That would create affiliate clicks.

## Handoff

Done on 2026-09-26: production serves the retailer module (health check passed 2026-09-26T05:01:39Z) and IndexNow returned HTTP 202. Do not submit IndexNow again until the next content change.

Watchdog state, same day:

- The workflow is active on `main`.
- GitHub-hosted run [36219630569](https://github.com/laqaer/bay-heat/actions/runs/36219630569) passed in 8 seconds and printed `healthcheck pass`. That run was a `pull_request` event, so it is manually tested.
- `workflow_dispatch` returned HTTP 403 for this operator token.
- A 10-minute schedule was on `main` from 05:03 UTC to the follow-up that removed it. No `schedule` event appeared through 05:22 UTC. The daily cron is `17 13 * * *`. Do not call the business unattended or 24/7 until a `schedule` run succeeds.
- The 28-day read of experiment 001 waits on Search Console.

Owner-only gaps are listed in the pull request that introduced this record.
