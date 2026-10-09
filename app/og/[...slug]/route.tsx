import { PAGES, findPage } from "@/lib/pages";
import type { PageEntry } from "@/lib/pages/types";
import { card } from "@/lib/og/card";

// One 1200x630 share image per page, written as a real .png file at build time (/og/240v-garage-heater.png).
// Before this, every page's og:image pointed at /<page>/opengraph-image, a route that never existed, so links shared
// on Facebook, X, Reddit or Pinterest showed no picture. A static export needs a file extension for the host to send
// image/png, hence the ".png" in the last segment.
export const dynamic = "force-static";
export const dynamicParams = false;

const EYEBROW: Record<PageEntry["kind"], string> = {
  home: "Garage climate lab",
  tool: "Free tool",
  money: "Spec-based picks",
  guide: "Garage guide",
  data: "Data",
  safety: "Safety check",
  lab: "The Lab",
  trust: "BayHeat",
  legal: "BayHeat",
  product: "BayHeat",
};

// The card's second line is the page's answer, so a shared link previews what the page settles: the part of the SEO
// title after its ": " or "? " ("5 kW needs a 30A breaker and 10 AWG, ..."), or a long title that isn't just the H1.
function cardLine(page: Pick<PageEntry, "title" | "h1">): string {
  const m = /^.+?(?::|\?) (.+)$/.exec(page.title);
  const line = m ? m[1] : page.title !== page.h1 && page.title.length > 40 ? page.title : null;
  return line ? line.charAt(0).toUpperCase() + line.slice(1) : "Every number shows its work.";
}

export function generateStaticParams() {
  return PAGES.filter((p) => p.href !== "/").map((p) => {
    const parts = p.href.slice(1).split("/");
    parts[parts.length - 1] = `${parts[parts.length - 1]}.png`;
    return { slug: parts };
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const href = `/${slug.join("/").replace(/\.png$/, "")}`;
  const page = findPage(href);
  if (!page) return new Response("Not found", { status: 404 });
  return card({ variant: "page", eyebrow: EYEBROW[page.kind], title: page.h1, sub: cardLine(page) });
}
