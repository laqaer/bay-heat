import { Archivo, Martian_Mono } from "next/font/google";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--ff-archivo",
  display: "swap",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--ff-martian",
  display: "swap",
});

export const metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${martian.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:m-2 focus:rounded focus:bg-(--color-ember) focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
