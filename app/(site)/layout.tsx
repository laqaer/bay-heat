import { SiteHeader } from "@/components/shell/SiteHeader";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { StickyCta } from "@/components/shell/StickyCta";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-surface="report" className="flex min-h-full flex-1 flex-col bg-(--color-bg) text-(--color-fg)">
      <SiteHeader />
      <main id="main" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
