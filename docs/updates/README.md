# Source update receipts — laqaer/bay-heat

**Retired on 2026-10-30.** [#46](https://github.com/laqaer/bay-heat/pull/46) removed the workflow ([portfolio-ops D28](https://github.com/laqaer/portfolio-ops/issues/32)). Nothing writes new receipts. The receipts below stay unchanged. The text after this note describes the workflow as it was.

The repository-scoped `.github/workflows/documentation-receipts.yml` writes an immutable receipt after each default-branch push when Actions and token permissions allow it. Receipts link the Git revision and changed paths; they do **not** prove CI, deployment, customer acceptance or commercial outcomes. Browse dated folders and [docs/HUB.md](../HUB.md). Report workflow failures instead of bypassing branch protection.
