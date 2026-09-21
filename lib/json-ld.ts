import { site, type Guide } from "./site";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.locale,
    publisher: {
      "@type": "Organization",
      name: site.publisher,
      url: site.url,
      email: site.email,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.publisher,
    alternateName: site.name,
    url: site.url,
    email: site.email,
    description:
      "Laqaer Products publishes BayHeat Guide, a comparison site for electric garage and workshop heaters.",
  };
}

export function articleJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    dateModified: guide.updated,
    datePublished: guide.updated,
    inLanguage: site.locale,
    mainEntityOfPage: `${site.url}${guide.href}`,
    author: {
      "@type": "Organization",
      name: site.name,
    },
    publisher: {
      "@type": "Organization",
      name: site.publisher,
      url: site.url,
    },
  };
}

export type FaqEntry = {
  question: string;
  answer: string;
};

export function faqPageJsonLd(faqs: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: guide.navLabel,
        item: `${site.url}${guide.href}`,
      },
    ],
  };
}
