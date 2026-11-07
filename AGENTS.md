<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Documentation hub

Read [docs/HUB.md](docs/HUB.md) before material changes. Update the affected canonical documentation in the same PR/commit and link the issue, exact revision, tests and deployment boundary. Automatic `docs/updates/` receipts prove only source pushes. Follow the [shared standard](https://github.com/laqaer/agent-config/blob/main/docs/documentation-hub.md); never copy secrets or customer data into documentation.

## E2E and checks

E2E: HTTP smoke of the built site. Run `npm run build && npm run qa`. It serves `out/` with the pinned `wrangler dev` and requests every sitemap URL over HTTP. To check a deployed site, run `node scripts/smoke.mjs --base https://bayheatguide.com`.

Affiliate rule: run `npm run check:affiliates` and then `npm run check:affiliates:control` on the same `out/`. The control runs the CLI on a page copy with `$129` in a buy plate; it must fail there. CI runs all three after the build. README "Checks" lists their limits.

Do not run `npm run indexnow` as a check. It posts to the IndexNow API. The production healthcheck (`node scripts/healthcheck.mjs`) is read-only.
