import Link from "next/link";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { SiteFooter } from "@/components/shell/SiteFooter";

export default function NotFound() {
  return (
    <div data-surface="report" className="flex min-h-full flex-1 flex-col bg-(--color-bg) text-(--color-fg)">
      <SiteHeader />
      <main className="mx-auto max-w-xl flex-1 px-4 py-20 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">404</p>
        <h1 className="wdth-112 mt-3 text-4xl font-bold text-(--color-fg)">This page moved or never existed.</h1>
        <p className="mt-4 text-(--color-fg-2)">Size your garage instead — it takes about 60 seconds.</p>
        <p className="mt-6">
          <Link href="/garage-heater-calculator" className="inline-flex h-12 items-center bg-(--color-ember) px-5 text-[15px] font-medium text-black">
            Size my garage
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
