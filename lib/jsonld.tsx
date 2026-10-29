// JSON-LD builders and the <JsonLd> renderer. A native <script> tag is used (not next/script) per the Next
// docs' own JSON-LD guide; `<` is escaped to < to prevent script-injection via embedded content.
import { BRAND, DESCRIPTION, LOCALE, PUBLISHER, SITE_URL } from "@/lib/site";
import { EDITOR_NAME, EDITOR_URL } from "@/lib/env.public";

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: PUBLISHER,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    description: DESCRIPTION,
    inLanguage: LOCALE,
    publisher: { "@type": "Organization", name: PUBLISHER, url: SITE_URL },
  };
}

export function personJsonLd() {
  if (!EDITOR_NAME) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: EDITOR_NAME,
    url: EDITOR_URL ?? undefined,
  };
}

export function webApplicationJsonLd(opts: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  citation?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: LOCALE,
    citation: opts.citation,
    author: EDITOR_NAME ? { "@type": "Person", name: EDITOR_NAME } : { "@type": "Organization", name: BRAND },
    publisher: { "@type": "Organization", name: PUBLISHER, url: SITE_URL },
  };
}

export function datasetJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  csvUrl: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: PUBLISHER },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: opts.csvUrl }],
  };
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
