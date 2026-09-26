import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export function Breadcrumbs({ label, href }: { label: string; href: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-(--color-fg-2)">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: label, url: `${SITE_URL}${href}` },
        ])}
      />
      <Link href="/" className="hover:text-(--color-fg)">
        Home
      </Link>
      <span aria-hidden className="px-2">
        /
      </span>
      <span className="text-(--color-fg)">{label}</span>
    </nav>
  );
}
