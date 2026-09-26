import { PAGES } from "@/lib/pages";
import { BRAND, DESCRIPTION, SITE_URL } from "@/lib/site";

// GET route handlers are dynamic by default in Next 16; force-static makes this build as a plain file
// (company/research/nextjs16-cheatsheet.md §9).
export const dynamic = "force-static";

export async function GET() {
  const lines = [
    `# ${BRAND}`,
    `> ${DESCRIPTION}`,
    "",
    "## Tools",
    ...PAGES.filter((p) => p.kind === "tool" || p.kind === "safety" || p.kind === "data").map((p) => `- [${p.title}](${SITE_URL}${p.href}): ${p.description}`),
    "",
    "## Guides",
    ...PAGES.filter((p) => p.kind === "money" || p.kind === "guide").map((p) => `- [${p.title}](${SITE_URL}${p.href}): ${p.description}`),
    "",
    "## The Lab",
    ...PAGES.filter((p) => p.kind === "lab" || p.kind === "trust").map((p) => `- [${p.title}](${SITE_URL}${p.href}): ${p.description}`),
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
