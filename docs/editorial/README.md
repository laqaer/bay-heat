# Recorded editorial review

PR #35 showed that prose saying “review before merge” and `reviewed: "electrical"` do not enforce approval. Omitted `humanReview` now means pending; safety/verdict pages require explicit `full` to enter the sitemap. A site-wide reviewer environment variable never proves a page-specific review.

## Gates

`next.config.ts` calls `enforceEditorialReview` during every production build, including direct `next build` and Vercel Git builds. CI also runs it. The `editorial-review` workflow runs the **base branch's** gate and reviewer policy, reads candidate files as data, never installs or executes candidate code, and uses only a read-only token. The trusted check also reruns when reviews are submitted, edited or dismissed. Changing the gate script in a PR cannot change the base-branch script it executes; provider protection for workflow changes remains required. No “pending,” noindex, draft PR, or omitted metadata bypass exists for changed article content.

The baseline is a frozen inventory of existing files when enforcement was introduced after the thermostat withdrawal, plus review-label corrections in this PR. **It is not an approval or a finding that legacy advice is safe.** Its bytes are pinned in the gate; do not refresh it to clear a failure. All articles, page registry files, shared facts, planner/safety logic, product facts, commerce routing, and safety/result/commerce/planner/evidence/page rendering components are covered. Additions, edits and deletions are compared by Git blob hash, so changing content without changing `rev` still requires review. Exact approved content remains usable across later metadata-only approval commits and squash merges.

An editorial reviewer is required for all changed articles. Electrical/gas scopes follow the page's current and baseline classification. Shared ambiguous safety inputs and unregistered new routes conservatively require both domains. A trusted check sees base-branch classification: register a new route in a separately reviewed metadata PR before adding its body if this would otherwise require an irrelevant second domain. This is a conservative scope limit, not an assertion that both trades are always necessary.

## Reviewer onboarding

`reviewers.json` is deliberately empty: no human identity, qualification or approval was verified during this audit. A maintainer must verify a real reviewer's identity and add their GitHub login, display name and allowed roles in a separate policy PR. For a technical role, also record credential/license, jurisdiction, official verification URL, who checked it, verification date and a valid-through date. Never put private identification documents here. A site owner approval does not establish electrical qualifications. An agent must never submit an APPROVE review pretending to be a human reviewer.

The owner must review policy changes to `reviewers.json`, this baseline, the gate, workflows and Next config. Before treating this as a merge-enforcement guarantee, an administrator must require `editorial-review` and `check` on `main`, dismiss stale approvals, require the latest push to be approved, and restrict bypass/direct pushes and changes to these policy files. The connected GitHub App cannot administer protection (read returned 403); `main` reported unprotected and repository rulesets were empty. Production-build enforcement is implemented here, but repository administrators can still remove code gates. That limitation must not be described as solved.

## Recording approval

1. Push the final content for review. Run local development preview if needed; a production build is expected to fail until approval exists. Keep correction PRs draft.
2. The named editor reads the complete article, citations, disclosures and recommendations. The qualified technical reviewer checks manufacturer instructions, applicable load types, limits and local-code qualifications. They submit GitHub **APPROVE** reviews on that content commit, including `BAYHEAT-EDITORIAL-APPROVED`, `BAYHEAT-ELECTRICAL-APPROVED`, or `BAYHEAT-GAS-APPROVED` for their respective roles. One qualified person may fill multiple roles if verified for them.
3. Add an entry to `approvals.json`: `{"commit":"<40-character reviewed content SHA>","pr":123,"reviews":{"editorial":123456,"electrical":123457}}`. IDs are actual GitHub review IDs, not comments. Include the roles requested by the gate. Do not invent example identities or IDs as real records.
4. The gate reads the reviewed commit tree and live reviews. It rejects missing, bot, dismissed, superseded change-request, mismatched-content and mismatched-commit approvals, expired or incomplete qualification records, truncated evidence, and unavailable GitHub evidence. A changed page classification cannot erase its prior technical scope. A renewed review or new content change needs a new receipt.
5. For indexing, explicitly set the intended `humanReview: "full"` and `indexable: true` as part of the reviewed content commit; that change itself needs a receipt. Verify the live HTML, sitemap and deployment SHA after merge. Sitemap membership is eligibility, not proof of Google/Bing indexing.

This gate does not verify licenses against a registry automatically, replace the named human, audit unchanged legacy content, or make a generic thermostat rating prove compatibility.

Validation note: Next 16 typegen loads the production configuration too, so it also rejects unapproved content. For an existing route, `tsc --noEmit`, lint and tests can run against previously generated route types; use local `next dev` for visual review. Neither is production acceptance.
