#!/usr/bin/env node
/**
 * Read-only production health check for BayHeat Guide.
 * Does not request Amazon or any affiliate URL.
 *
 *   node scripts/healthcheck.mjs
 */
const ORIGIN = "https://bayheatguide.com";

const pages = [
  {
    path: "/",
    expect: [
      "BayHeat Guide",
      "Buy the class the circuit allows",
      "laqaer-20",
      "15 A portable guide",
      "Ceiling-mount guide",
      "Wall-mount guide",
    ],
  },
  {
    path: "/120v-vs-240v-garage-heater",
    expect: ["what your circuit can actually run", "laqaer-20", "Buy the class the circuit allows"],
  },
  {
    path: "/forced-air-vs-infrared-garage-heater",
    expect: ["drafty shops vs spot heat", "laqaer-20"],
  },
  {
    path: "/best-ceiling-mount-garage-heaters-under-200",
    expect: ["laqaer-20", "Comfort Zone"],
  },
  {
    path: "/sitemap.xml",
    expect: [
      "https://bayheatguide.com/best-ceiling-mount-garage-heaters-under-200",
      "https://bayheatguide.com/120v-vs-240v-garage-heater",
    ],
  },
  {
    path: "/96098d06c16790aabec2db1a232fee8f.txt",
    expect: ["96098d06c16790aabec2db1a232fee8f"],
  },
];

function die(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function get(url, { redirect = "manual" } = {}) {
  const response = await fetch(url, {
    redirect,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
    headers: { "user-agent": "bayheat-healthcheck/1.0" },
  });
  const body = await response.text();
  return { status: response.status, location: response.headers.get("location"), body };
}

async function main() {
  const failures = [];
  process.stdout.write(`healthcheck ${new Date().toISOString()}\n`);

  for (const page of pages) {
    const url = `${ORIGIN}${page.path}`;
    let result;
    try {
      result = await get(url);
    } catch (error) {
      failures.push(`${url} request failed: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    const missing = page.expect.filter((text) => !result.body.includes(text));
    const ok = result.status === 200 && missing.length === 0;
    process.stdout.write(`${ok ? "ok" : "fail"} ${result.status} ${url}\n`);
    if (!ok) {
      failures.push(
        `${url} status ${result.status}${missing.length ? ` missing ${missing.join(" | ")}` : ""}`,
      );
    }
  }

  let www;
  try {
    www = await get(`${ORIGIN.replace("bayheatguide.com", "www.bayheatguide.com")}/`);
  } catch (error) {
    failures.push(`www request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (www) {
    const location = www.location || "";
    const ok = www.status === 308 && location.includes("https://bayheatguide.com/");
    process.stdout.write(`${ok ? "ok" : "fail"} ${www.status} www -> ${location || "(no location)"}\n`);
    if (!ok) failures.push(`www redirect expected 308 to apex, got ${www.status} ${location}`);
  }

  process.stdout.write("amazon requests: 0\n");
  process.stdout.write("revenue: not observable from this check\n");

  if (failures.length > 0) {
    for (const failure of failures) die(failure);
    process.exit(1);
  }
  process.stdout.write("healthcheck pass\n");
}

main().catch((error) => {
  die(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
