#!/usr/bin/env node
/**
 * HTTP smoke test of the built site. This is the repo's E2E check (`npm run qa`).
 *
 *   npm run build && npm run qa                                 # serves out/ with wrangler dev, then checks it
 *   node scripts/smoke.mjs --base https://bayheatguide.com      # checks a running server; starts nothing
 *
 * Without --base it starts the same local server as `npm start` (wrangler dev on out/, with out/_redirects and
 * out/_headers) on a free port, and stops it at the end. It reads /sitemap.xml from the server and requests every
 * URL in it. Each page must answer 200 with text/html and no redirect, and its HTML must have:
 * - a <title> that names BayHeat, and an <h1>;
 * - a canonical link equal to the sitemap URL, and no noindex robots meta;
 * - the Amazon Associates line from the footer;
 * - the X-Content-Type-Options: nosniff header.
 * It also checks robots.txt, one old URL's 308, the trailing-slash 308 and the 404 page.
 * It requests only the server under test, never amazon.com or another host. Exit 1 lists every failed check.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";

const SITE = "https://bayheatguide.com";
const WRANGLER = "wrangler@4.135.0"; // the version `npm start`, CI and deploy.yml pin
const ASSOCIATE_LINE = "As an Amazon Associate, BayHeat earns from qualifying purchases.";
const READY_MS = 180_000;

function parseArgs(argv) {
  const out = { base: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") out.base = argv[++i] ?? "";
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (out.base !== null && !/^https?:\/\/[^/]+$/.test(out.base.replace(/\/$/, ""))) {
    throw new Error("--base needs an origin such as http://127.0.0.1:3000");
  }
  return out;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function get(base, path) {
  const response = await fetch(base + path, {
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    // A browser page load. The assets router serves the 404 page for a navigation request.
    headers: { "user-agent": "bayheat-smoke/1.0", accept: "text/html,application/xhtml+xml,*/*;q=0.8", "sec-fetch-mode": "navigate" },
  });
  const body = await response.text();
  // The RSC payload in <script> repeats every string on the page; only the markup a reader sees counts.
  return { status: response.status, headers: response.headers, body, markup: body.replace(/<script\b[\s\S]*?<\/script>/g, "") };
}

// One check. A request that throws (reset, timeout) fails this check only, so the run still reports every other one.
async function attempt(label, check) {
  try {
    return await check();
  } catch (error) {
    return { label, problems: [`request failed: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

// Stop wrangler dev on Ctrl-C or SIGTERM too. It runs in its own process group, so the signal does not reach it.
let stopServer = async () => {};
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    stopServer().finally(() => process.exit(signal === "SIGINT" ? 130 : 143));
  });
}

async function startServer() {
  if (!existsSync("out/index.html")) throw new Error("out/index.html not found; run npm run build first");
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn("npx", ["--yes", WRANGLER, "dev", "--port", String(port), "--ip", "127.0.0.1"], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
  let log = "";
  const keep = (chunk) => {
    log = (log + chunk).slice(-4000);
  };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  let exited = null;
  child.on("exit", (code) => {
    exited = code;
  });
  const stop = async () => {
    if (exited !== null) return;
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      return;
    }
    for (let i = 0; i < 50 && exited === null; i++) await new Promise((r) => setTimeout(r, 100));
    if (exited === null) {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        // already gone
      }
    }
  };
  stopServer = stop;
  const deadline = Date.now() + READY_MS;
  while (Date.now() < deadline) {
    if (exited !== null) throw new Error(`wrangler dev exited with code ${exited} before it was ready:\n${log}`);
    try {
      if ((await get(base, "/")).status === 200) return { base, stop };
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  await stop();
  throw new Error(`wrangler dev did not answer GET / with 200 within ${READY_MS / 1000} s:\n${log}`);
}

// The home page's canonical is the bare origin; every other canonical must equal its sitemap URL exactly.
const sameUrl = (a, b) => a === b || ([a, b].every((u) => u === SITE || u === `${SITE}/`));

async function checkPage(base, loc) {
  const path = new URL(loc).pathname;
  const r = await get(base, path);
  const problems = [];
  if (r.status !== 200) problems.push(`status ${r.status}${r.headers.get("location") ? ` -> ${r.headers.get("location")}` : ""}`);
  if (!(r.headers.get("content-type") ?? "").includes("text/html")) problems.push(`content-type ${r.headers.get("content-type")}`);
  if (r.headers.get("x-content-type-options") !== "nosniff") problems.push("no X-Content-Type-Options: nosniff");
  const title = /<title>([^<]*)<\/title>/.exec(r.markup)?.[1] ?? "";
  if (!title.includes("BayHeat")) problems.push(`title ${JSON.stringify(title)}`);
  if (!/<h1[\s>]/.test(r.markup)) problems.push("no <h1>");
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(r.markup)?.[1];
  if (!canonical || !sameUrl(canonical, loc)) problems.push(`canonical ${canonical ?? "(none)"}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(r.markup)) problems.push("noindex robots meta");
  if (!r.markup.includes(ASSOCIATE_LINE)) problems.push("no Amazon Associates line");
  return { label: `${r.status} ${path}`, problems };
}

async function checkRedirect(base, from, to) {
  const r = await get(base, from);
  const location = r.headers.get("location");
  const target = location ? new URL(location, base + from).pathname : null;
  const problems = r.status === 308 && target === to ? [] : [`expected 308 -> ${to}, got ${r.status} -> ${location ?? "(none)"}`];
  return { label: `${r.status} ${from} -> ${target ?? "(none)"}`, problems };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const server = args.base ? { base: args.base.replace(/\/$/, ""), stop: async () => {} } : await startServer();
  const results = [];
  let pages = 0;
  try {
    process.stdout.write(`smoke ${new Date().toISOString()} ${server.base}${args.base ? "" : ` (${WRANGLER} dev on out/)`}\n`);

    const sitemap = await get(server.base, "/sitemap.xml"); // nothing else can run without it, so a throw ends the run
    const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const sitemapProblems = [];
    if (sitemap.status !== 200) sitemapProblems.push(`status ${sitemap.status}`);
    if (!(sitemap.headers.get("content-type") ?? "").includes("xml")) sitemapProblems.push(`content-type ${sitemap.headers.get("content-type")}`);
    if (locs.length === 0) sitemapProblems.push("no <loc> entries");
    const offSite = locs.filter((l) => l !== SITE && !l.startsWith(`${SITE}/`));
    if (offSite.length) sitemapProblems.push(`URLs outside ${SITE}: ${offSite.join(" ")}`);
    if (new Set(locs).size !== locs.length) sitemapProblems.push("duplicate URLs");
    results.push({ label: `${sitemap.status} /sitemap.xml (${locs.length} URLs)`, problems: sitemapProblems });

    for (const loc of locs.filter((l) => !offSite.includes(l))) {
      results.push(await attempt(`ERR ${new URL(loc).pathname}`, () => checkPage(server.base, loc)));
      pages++;
    }

    results.push(
      await attempt("ERR /robots.txt", async () => {
        const robots = await get(server.base, "/robots.txt");
        const problems = [];
        if (robots.status !== 200) problems.push(`status ${robots.status}`);
        if (!robots.body.includes(`Sitemap: ${SITE}/sitemap.xml`)) problems.push(`no "Sitemap: ${SITE}/sitemap.xml" line`);
        return { label: `${robots.status} /robots.txt`, problems };
      }),
    );
    // One old URL from lib/redirects.ts (README "Routes"; the production healthcheck requests it too).
    results.push(await attempt("ERR /120v-vs-240v-garage-heater", () => checkRedirect(server.base, "/120v-vs-240v-garage-heater", "/240v-garage-heater")));
    results.push(await attempt("ERR /about/", () => checkRedirect(server.base, "/about/", "/about")));
    results.push(
      await attempt("ERR /bayheat-smoke-no-such-page", async () => {
        const missing = await get(server.base, "/bayheat-smoke-no-such-page");
        const ok = missing.status === 404 && /<meta name="robots" content="[^"]*noindex/.test(missing.markup);
        return { label: `${missing.status} /bayheat-smoke-no-such-page`, problems: ok ? [] : [`expected the noindex 404 page, got ${missing.status}`] };
      }),
    );
  } finally {
    await server.stop();
  }

  for (const r of results) process.stdout.write(`${r.problems.length ? "fail" : "ok"} ${r.label}${r.problems.length ? `: ${r.problems.join("; ")}` : ""}\n`);
  const failed = results.filter((r) => r.problems.length);
  if (failed.length) {
    process.stderr.write(`smoke: FAIL, ${failed.length} of ${results.length} checks failed on ${server.base}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`smoke: pass, ${results.length} checks (${pages} sitemap pages) on ${server.base}\n`);
}

main().catch((error) => {
  process.stderr.write(`smoke: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
