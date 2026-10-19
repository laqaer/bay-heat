import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { Callout } from "@/components/ui/Callout";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";

const entry = findPage("/garage-heater-thermostat")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

// PR #35 required human review, but no page-specific approval was found.
// The reviewed draft remains in Git history; do not restore shopping advice until
// the editorial and qualified electrical approvals are recorded for that revision.
export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <Callout variant="safety">
        This guide is temporarily unavailable while its electrical guidance and product
        recommendations undergo review. Its earlier recommendations have been withdrawn.
      </Callout>
      <p>Human editorial and qualified electrical sign-off have not been recorded for this guide.</p>
    </ReportPage>
  );
}
