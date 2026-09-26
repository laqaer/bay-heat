import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { InBuild } from "@/components/page/InBuild";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";

const entry = findPage("/heat-pump-mini-split-for-garage")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <InBuild owner="W11 fuel and hubs" />
    </ReportPage>
  );
}
