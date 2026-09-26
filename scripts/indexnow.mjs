#!/usr/bin/env node
/**
 * One-shot IndexNow submit for BayHeat Guide.
 *
 *   npm run indexnow
 *   npm run indexnow -- --dry-run
 *
 * Run after production deploy. api.indexnow.org fetches
 * https://bayheatguide.com/<key>.txt and rejects the submit until that file is live.
 * Not part of `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "bayheatguide.com";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Pages with Associates links or a recent change worth recrawl. */
const PATHS = [
  "/",
  "/120v-vs-240v-garage-heater",
  "/forced-air-vs-infrared-garage-heater",
  "/hardwired-vs-plugin-garage-heater",
  "/best-wall-mount-garage-heaters",
  "/best-ceiling-mount-garage-heaters-under-200",
  "/portable-garage-heaters-15a-circuit",
  "/best-electric-garage-heaters-by-size",
  "/wall-mount-vs-ceiling-garage-heater",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function die(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function loadKey() {
  const dir = path.join(root, "public");
  const names = fs.readdirSync(dir).filter((name) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(name));
  const keys = names.flatMap((name) => {
    const key = name.slice(0, -".txt".length);
    const raw = fs.readFileSync(path.join(dir, name), "utf8").replace(/^\uFEFF/, "");
    if (raw !== key && raw !== `${key}\n`) return [];
    return [key];
  });
  if (keys.length !== 1) {
    die(`Expected one public/<key>.txt whose body is the key. Found ${keys.length}.`);
  }
  return keys[0];
}

function payload(key) {
  return {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: PATHS.map((pathname) => `${ORIGIN}${pathname}`),
  };
}

async function keyIsLive(key) {
  const url = `${ORIGIN}/${key}.txt`;
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await response.text()).replace(/^\uFEFF/, "");
  const ok = response.status === 200 && (body === key || body === `${key}\n`);
  return { url, ok, status: response.status };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/indexnow.mjs [--dry-run]\nSubmits affiliate guide URLs after the production IndexNow key file is live.\n",
    );
    return;
  }
  const unknown = args.filter((arg) => arg !== "--dry-run");
  if (unknown.length > 0) die(`Unknown argument: ${unknown.join(" ")}`);

  const body = payload(loadKey());
  process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);

  if (args.includes("--dry-run")) {
    process.stdout.write("dry-run: not submitted\n");
    return;
  }

  const live = await keyIsLive(body.key);
  if (!live.ok) {
    die(
      `IndexNow key file is not live at ${live.url} (HTTP ${live.status}). Deploy production, then run: npm run indexnow`,
    );
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  process.stdout.write(`indexnow HTTP ${response.status}\n${text}\n`);
  if (response.status !== 200 && response.status !== 202) process.exit(1);
}

main().catch((error) => {
  die(error instanceof Error ? error.message : String(error));
});
