// W0 route placeholder body. Every v1 route ships one of these so typedRoutes, the sitemap, redirects and
// nav links all compile before the owning content lane replaces it. Overwritten by that lane, never left in
// an indexable page past the build window (BLUEPRINT.md §9.7 "slips").
export function InBuild({ owner }: { owner: string }) {
  return (
    <p className="text-(--color-fg-2)">
      This page is in build ({owner}). The route, title and target keyword are locked in the page registry;
      the content lands with the rest of v1.
    </p>
  );
}
