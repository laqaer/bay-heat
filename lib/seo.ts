// Metadata helper that fixes the "OG merge gotcha" (company/research/nextjs16-cheatsheet.md §5.2): a page's
// `openGraph` object replaces the layout's whole object, including `images` and `url`. Every page calls
// pageMetadata() instead of hand-building a Metadata object, so canonical, og:url and og:image are always set.
import type { Metadata, Route } from "next";
import { BRAND, LOCALE, SITE_URL } from "@/lib/site";

export function pageMetadata(p: {
  path: Route;
  title: string;
  description: string;
  ogTitle?: string;
  type?: "website" | "article";
  image?: string;
  noindex?: boolean;
}): Metadata {
  const image = p.image ?? `${p.path === "/" ? "" : p.path}/opengraph-image`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: p.type ?? "article",
      url: p.path,
      siteName: BRAND,
      locale: LOCALE,
      title: p.ogTitle ?? p.title,
      description: p.description,
      images: [{ url: image, width: 1200, height: 630, alt: p.ogTitle ?? p.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: p.ogTitle ?? p.title,
      description: p.description,
      images: [image],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} — Garage Climate Lab`, template: `%s · ${BRAND}` },
  applicationName: BRAND,
  robots: { index: true, follow: true },
};
