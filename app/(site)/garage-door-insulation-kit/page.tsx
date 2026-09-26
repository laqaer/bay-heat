import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { InBuild } from "@/components/page/InBuild";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";

const entry = findPage("/garage-door-insulation-kit")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <InBuild owner="W9 seal and insulate" />
    </ReportPage>
  );
}
