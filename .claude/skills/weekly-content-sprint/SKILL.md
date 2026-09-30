---
name: weekly-content-sprint
description: Run BayHeat's weekly content sprint and fact-check gauntlet (BLUEPRINT.md §8.3 loop A) — from opening a page issue through fact-check, standards review, design QA and merge. Use when starting a new week's content batch or resuming one already in progress.
---

# Weekly content sprint

This is BayHeat's standing content pipeline. It exists so no page ships without every step below — skipping one is how a wrong number or a compliance gap reaches production.

## Steps

1. **Open the brief** (chief-of-staff agent, or do this directly if running solo). For each page this week: target keyword cluster, the H1 formula (a real computed number, ≤60 chars on verdict-first pages), which planner deep-link state it should showcase, the required figure (rotate: heat-loss bars, warm-up curve, fuel-cost bars — don't repeat the same figure on consecutive pages), the commerce products involved, and the specific safety points that must appear.

2. **Draft** (report-writer agent). It must pass locally before opening a PR:
   - `npx tsc --noEmit -p .`
   - `npx eslint <touched files>`
   - `node --test 'lib/**/*.test.ts'` (confirms the draft didn't touch anything that broke the engine)
   - A claims table in the PR description: every number on the page → the fact id or `lib/planner` function that produced it.

3. **Fact-check** (fact-checker agent, run with NO context from the drafting session — spawn it fresh). It re-derives every number, re-fetches every source, and attacks safety-adjacent claims with edge cases. Result is `PASS` or a list of `FAIL` items. Two `FAIL` rounds on the same page escalates to the human editor instead of a third automatic pass.

4. **Standards review** (standards-editor agent). Banned words, disclosure placement, evidence marks, buy-link/dollar-figure adjacency, competitor-quote rules, reading level.

5. **Design QA** (design-qa agent), for any visual change. Screenshots at 390×844 and 1440×900, axe, Lighthouse budgets, and confirm the dark "camera" surface actually renders dark (inspect computed styles, not just the DOM attribute — see design-qa.md for why this specific check matters here).

6. **Human review gate.** 100% of verdict-first (money) pages and safety pages need the human editor's sign-off before merge — not a sample. Everything else gets a 10% sample, and 100% of Lab Reports always get reviewed. Electrical/gas pages additionally need the licensed reviewer's sign-off within 30 days of publishing (the reviewer stamp appears only once they've actually signed — never fake it in the meantime; `aiLine()` in `lib/site.ts` already renders "not yet reviewed" honestly until then).

7. **Merge and deploy**, then run the internal-linking check (search-desk agent or the relevant checks in search-desk.md) so the new page gets ≥3 inlinks from existing pages before its first crawl.

## Never skip

- Never mark a fact `status: 'verified'` to make a page "pass" faster — if you're not confident, it stays `'verify'` and the sentence using it is wrapped in `<IfVerified>`.
- Never let a page ship with a fabricated competitor quote, a "measured" claim with no log, or a Buddy-type-propane/torpedo/kerosene buy button.
- Never bypass the 100% human-review gate on a verdict-first or safety page because the sprint is running behind schedule.
