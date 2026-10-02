---
name: model-release
description: Checklist for cutting a new lib/planner model version — running the full test vector suite, bumping MODEL_VERSION, and logging the change in the Lab notebook. Use whenever a physics formula, constant, or price table changes.
---

# Cutting a model release

`lib/planner` and `lib/safety/verdict.ts` back every number on the site. A change here is silently wrong on every page at once if it isn't validated the same way the original build was.

## Before changing anything

Read the existing test file for the module you're about to touch (`lib/planner/*.test.ts`, `lib/safety/verdict.test.ts`) so you know the exact tolerance and test vectors your change must still satisfy. These trace back to `company/research/planner-engineering.md`'s own worked examples (T1-T13) and BLUEPRINT.md's §0.2 headline numbers for "example A" — don't loosen a tolerance to make a change pass; fix the change instead.

## Steps

1. Make the change.
2. `node --test 'lib/**/*.test.ts'` — 100% passing, no exceptions. If a test now fails, that's a real regression until proven otherwise, not a stale test to update casually.
3. `npx tsc --noEmit -p .` and `npx eslint .` clean.
4. If the change alters a published number's exact value (not just internal precision), grep `app/(site)/**/page.tsx` for any hardcoded reference to the old figure — there shouldn't be any (every page should compute live via `lib/planner`), but confirm.
5. **Get explicit human approval for the constant or formula change itself** before merging — this is a standing rule (see `model-steward.md`), not optional for a "small" change.
6. Bump `MODEL_VERSION` in `lib/planner/plan.ts` and `lib/site.ts` (semver: patch for a bug fix that doesn't change published numbers, minor for a new capability, major for a change that shifts previously-published figures).
7. Log the release in `app/(site)/lab/notebook/page.tsx`: the date, the version, and a one-line description of what changed and why.
8. If the change shifts a number materially, flag which live content pages quote the old figure so report-writer can refresh them in the same sprint — don't let pages silently disagree with the engine.

## Never

Never bump `MODEL_VERSION` without the test suite passing first. Never ship a constant change the human hasn't explicitly approved, no matter how confident the source.
