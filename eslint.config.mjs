import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Workflow orchestration scripts (.claude/workflows/*.mjs): plain JS run by the Workflow tool's own
    // runner, using syntax (top-level await outside a module the TS/Next parser expects, etc.) this
    // project's lint config isn't set up to parse -- not application code, not part of the Next.js build.
    ".claude/workflows/**",
  ]),
]);

export default eslintConfig;
