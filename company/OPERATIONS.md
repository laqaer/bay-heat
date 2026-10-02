# Running BayHeat: the agent team

This is the handoff doc for whoever (human or agent) picks up BayHeat after the initial build. It ties
together three things that now exist in this repo: the 14 subagents under `.claude/agents/`, the playbooks
under `.claude/skills/`, and the intended recurring-routine schedule below (not yet activated — see
"Activating the routines").

## The team

Each file under `.claude/agents/*.md` is a Claude Code subagent with its own mandate, tool access, and
guardrails, matching the roster in `company/BLUEPRINT.md` §8.2:

| Agent | Owns |
|---|---|
| `chief-of-staff` | The weekly plan, issue assignment, the traffic decision rules |
| `report-writer` | Drafting content pages |
| `fact-checker` | Adversarially re-deriving every number on a content PR |
| `standards-editor` | Editorial/compliance gate (banned words, disclosure, evidence marks) |
| `model-steward` | `lib/planner` and `lib/safety/verdict.ts` — the physics/decisions/safety engine |
| `data-desk` | Energy prices (EIA), the Garage Heat Index, the Cold Snap check |
| `safety-desk` | The Can I Run It? tool, recall watch, code-edition tracking |
| `lab-analyst` | Test protocols and processing real logger data into Lab reports |
| `commerce-desk` | `lib/commerce/*` — products, partners, the affiliate link audit |
| `search-desk` | Per-page and site-wide SEO review |
| `distribution-desk` | Drafting (never sending) PR pitches and social copy |
| `email-desk` | Drafting (never sending) the email program |
| `design-qa` | Screenshot/axe/Lighthouse checks, the "stunning" rubric |
| `ops-analyst` | The weekly dashboard and mechanical application of the spend/traffic gates |

Invoke one directly (`Use the safety-desk agent to...`) or let the `weekly-content-sprint` skill chain the
content-pipeline agents in order.

## The skills (playbooks)

- `weekly-content-sprint` — the full loop from brief to merge (BLUEPRINT.md §8.3 loop A).
- `affiliate-link-audit` — the weekly commerce link sweep (loop B).
- `new-content-page` — how to add a page that doesn't exist yet (register → typegen → write → link in).
- `model-release` — checklist for any change to the physics/decisions/safety engine.

Two more loops from BLUEPRINT.md §8.3 (the SEO crawl, loop C; the full design-QA screenshot pass, loop D) are
folded into `search-desk.md` and `design-qa.md`'s own agent instructions rather than separate skill files,
since they're single-agent, single-purpose checks rather than multi-agent pipelines.

## Standing invariants, whoever's running this

These hold regardless of which agent or human is doing the work:

- `node --test 'lib/**/*.test.ts'`, `npx tsc --noEmit -p .`, and `npx eslint .` all clean before anything merges.
- No unit-bearing number on a content page without a `<Num>`/fact/live-computed trail back to `lib/planner` or `lib/facts`.
- Buddy-type propane, torpedo, and kerosene classes never get a buy button, anywhere.
- Every `Verdict` from `lib/safety/verdict.ts` carries ≥2 conditions; every heater `Product` carries a `safetyLine`.
- A licensed reviewer approves every electrical/gas rule change; a human approves every physics/price constant change; a human approves every spend release.
- 100% human review on verdict-first (money) and safety pages before publish; a 10% sample plus 100% of Lab Reports on everything else.
- Humans alone: create accounts, sign agreements, post to social/community, send press pitches, run physical tests.

## The intended routine schedule (BLUEPRINT.md §8.2's cadence column)

| Cadence (UTC) | What fires |
|---|---|
| Daily `11:41` | `safety-desk`: CPSC recall check |
| Daily `08:36` | `search-desk`: GSC pull (only with an approved OpenSEO credit budget) |
| Daily `11:05` | `data-desk`: NWS Cold Snap check (Oct-Mar) |
| Weekly, Mon `07:14` | `chief-of-staff`: open this week's page issues |
| Weekly, Mon `10:27` | `commerce-desk` / `affiliate-link-audit` skill |
| Weekly, Mon `13:03` | `ops-analyst`: the dashboard |
| Weekly, Tue `09:44` | `search-desk`: orphan crawl + sitemap parity |
| Weekly, Wed `15:33` (Oct-Mar) | `data-desk`: propane price refresh |
| Weekly, Wed `15:18` | `model-steward`: calibration review |
| Weekly, Thu `11:31` | `design-qa`: full screenshot pass |
| Monthly, 1st `16:14` | `commerce-desk`: EPC re-rank |
| Monthly, 5th `14:19` | `search-desk`: the 25-prompt AI-citation panel |
| Monthly, 2nd `15:23` | `safety-desk`: code-adoption watch |
| Within 48h of an EIA 5.6.B release (~24th monthly) | `data-desk`: electricity price refresh |

### Activating the routines

None of these are live yet. Turning one on is a `create_trigger` call (Claude Code Remote Routines) naming
the cron expression above and a prompt that names the agent/skill to invoke. That's an explicit, ongoing
commitment — a Routine keeps firing on its own until someone disables it — so activate them deliberately, a
few at a time, rather than all at once, and confirm the first firing of each actually does the right thing
before trusting it to run unattended.
