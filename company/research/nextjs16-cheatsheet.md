# BayHeat builder cheatsheet: Next.js 16.3.4, React 19.2, Tailwind v4.3

Written 2026-09-25 for the build team and the operating agent team.

**Sources.** The bundled docs in `node_modules/next/dist/docs/01-app/` (paths are relative to that folder below). I also ran experiments in a scratch copy of the repo. Rows marked **[verified]** were built or run on this machine with `next build`, `tsc`, `eslint` or `node --test`, not just read in the docs.

Installed toolchain: Next 16.3.4 (Turbopack), React 19.2.8 (App Router actually runs Next's bundled React canary), Tailwind CSS 4.3.3 and `@tailwindcss/postcss` 4.3.3, TypeScript 5.9.3, ESLint 9.39.5 with `eslint-config-next` 16.3.4 (includes `eslint-plugin-react-hooks` 7.1.1), `@types/node` 20.19, Node v22.22.2. There is no test runner, Playwright or Prettier installed.

---

## 0. Twelve decisions

1. **Keep the site fully static. Do not turn on `cacheComponents`.** Every current route builds as `○ (Static)` [verified]. In this repo `use cache`, `cacheLife`, `cacheTag`, `partialPrefetching`, the `instant` export and the `prefetch` export are all Cache Components features. With the flag on, routes change: bots get a full dynamic render, `new Date()` in the footer becomes a prerender error, `dynamicParams` and `revalidate` are removed, and Cache Components requires the Node runtime. That buys nothing for a content and calculator site.
2. **Route params are Promises.** `params`, `searchParams`, `cookies()`, `headers()` and `draftMode()` are all async. In 16 the synchronous fallback is removed. Type pages with the global helpers `PageProps<'/route'>`, `LayoutProps<'/route'>` and `RouteContext<'/route'>`, which need no import.
3. **Anything that reads the query string makes the page dynamic.** Reading `searchParams` in a page or layout turns it into `ƒ` [verified]. For shareable calculator URLs, read the query in a client component with `useSearchParams()`, wrapped in `<Suspense>`. Without the Suspense boundary, **the build fails** [verified].
4. **A GET route handler is dynamic unless you say otherwise.** A GET handler that touches nothing request-specific still builds as `ƒ`. Add `export const dynamic = 'force-static'` to get `○` [verified]. Metadata routes (`sitemap`, `robots`, `icon`, `opengraph-image`) are static by default.
5. **A page's `openGraph` object replaces the layout's, including its images.** When a page exports `openGraph: {...}` without `images`, it loses the root `opengraph-image`. `/best-wall-mount-garage-heaters` has **no og:image today** [verified]. Pages that don't override inherit the layout's `og:url` (`https://bayheatguide.com`), so `/about` advertises the home URL [verified]. Fix both with one metadata helper (section 5.2).
6. **An OG image under a dynamic segment needs its own `generateStaticParams`.** Without it, `app/x/[slug]/opengraph-image.tsx` builds as `ƒ` even when the page is `●`. With it, it builds as `●` [verified].
7. **OG image fonts must be TTF, OTF or WOFF (not woff2).** Commit static-instance TTFs under `assets/fonts/`. Read them once at module scope. Fetching a TTF works with `curl` and no user agent against the Google Fonts CSS API [verified: Inter Tight 800 is a 304 KB TTF and renders in `ImageResponse`].
8. **`proxy.ts` replaces `middleware.ts`.** The function is named `proxy`, it runs only on the Node runtime, and there is one per project. BayHeat does not need it now. Use `next.config.ts` `redirects()` (308) for any URL moves.
9. **View transitions work with no config flag.** Use `import { ViewTransition } from 'react'`; it type-checks through Next's types [verified]. Add `<Link transitionTypes={[...]}>` (16.2+). Put the wrapper in each `page.tsx`, never the layout, and honor `prefers-reduced-motion`.
10. **Tailwind v4 is configured in CSS.** Tokens live in `@theme`, custom utilities in `@utility`, variants in `@custom-variant`. There is no `tailwind.config.js`. `bg-(--paper)` is shorthand for `bg-[var(--paper)]` [verified].
11. **`next lint` is gone, and the React Compiler lint rules are errors.** Run `eslint` directly. `set-state-in-effect`, `purity` (`Math.random()` or `Date.now()` in render) and `refs` (reading `ref.current` in render) all fail lint [verified]. Use `useSyncExternalStore` for localStorage and `matchMedia`.
12. **Unit tests: `node --test` works here, but quote the glob.** Node 22.22.2 strips TypeScript types natively. Unquoted, `lib/**/*.test.ts` is expanded by the shell without globstar and silently skips `lib/*.test.ts` [verified]. Use `node --test 'lib/**/*.test.ts'`. Tested modules need `.ts`-suffixed relative imports, `import type` for types, and no enums, JSX or `@/` alias (section 17).

---

## 1. Commands and what "green" means

| Purpose | Command | Notes |
|---|---|---|
| Dev server | `npm run dev` (`next dev`) | Turbopack is the default. Output goes to `.next/dev`, so dev and build can run at the same time. A lockfile blocks two dev or two build instances in one folder. |
| Production build | `npm run build` (`next build`) | About 23 s on this box [verified]. Uses Turbopack; a custom `webpack` key in the config makes the build **fail**. Build output no longer shows "First Load JS" sizes. Linting is **no longer** part of the build. |
| Generate route types | `npx next typegen` | Writes `.next/types/*` and `next-env.d.ts`. **Required before `tsc` on a fresh clone**, because `next-env.d.ts` imports `./.next/types/routes.d.ts`. |
| Type check | `npm run typecheck` (`tsc --noEmit`) | Passes today [verified]. On CI: `next typegen && tsc --noEmit`. |
| Lint | `npm run lint` (`eslint`) | ESLint 9 flat config. Passes today [verified]. |
| Unit tests | `node --test 'lib/**/*.test.ts'` | See section 17. |
| Debug a prerender error | `next build --debug-prerender` | Never deploy a build made with this flag. |
| Bundle analysis | `npx next experimental-analyze` | Added in 16.1. |

**What "static" looks like in the build legend:**

- `○ (Static)` is prerendered at build time.
- `● (SSG)` is prerendered from `generateStaticParams`.
- `ƒ (Dynamic)` is rendered on demand.

For a guide, tool or landing page, anything other than `○` or `●` is a bug unless it is a deliberate API route.

---

## 2. Existing repo conventions to keep, and bugs found

### Conventions

- **Imports.** The alias `@/*` maps to the repo root (`@/components/...`, `@/lib/...`).
- **Content registry.** `lib/site.ts` is the source of truth:
  - `site` holds name, url, email, publisher (`Laqaer Products`) and `updated`.
  - `guides: Guide[]` and `legalPages` are joined into `allPages`.
  - `findGuide(href)` and `relatedGuides(href)` look pages up.
  - Pages call `const guide = findGuide('/slug')!` and pass it to `<GuideChrome guide toc>`.
  - `app/sitemap.ts` maps `allPages`, so a new page **must** be added to `lib/site.ts` or it is missing from the sitemap.
- **Affiliate links** come from `lib/affiliates.ts`: `AMAZON_TAG = "laqaer-20"` and `amazonDp(asin)`, with one constant per verified ASIN. `<AmazonAffiliateLink>` renders `rel="sponsored noopener noreferrer" target="_blank"`. Unverified products must use tagged search URLs (`https://www.amazon.com/s?k=...&tag=laqaer-20`).
- **JSON-LD.** `components/json-ld.tsx` takes the output of `lib/json-ld.ts` builders (`websiteJsonLd`, `organizationJsonLd`, `articleJsonLd(guide)`, `breadcrumbJsonLd(guide)`).
- **Server Components by default.** The only client component is `components/mobile-nav.tsx` (`'use client'`, `usePathname`, a `<details>` that closes on route change).
- **Fonts** load in `app/layout.tsx` through `next/font/google`:
  - `Source_Serif_4` sets `--font-display`.
  - `Source_Sans_3` sets `--font-body`.
  - `IBM_Plex_Mono` at 400/500 sets `--font-ibm-plex-mono`.
  - All three variables are applied on `<html>` and used as `font-[family-name:var(--font-display)]`.
- **Colors** are raw CSS variables in `:root` in `app/globals.css`: `--paper #f3eee4`, `--ink #1c1916`, `--rust #b4532a`, `--moss #3d5a4c` and others. They are used as `bg-[var(--paper)]`. Only `--color-background`, `--color-foreground`, `--font-sans` and `--font-mono` are exposed through `@theme inline`.
- **Root layout** is typed `RootLayout({ children }: LayoutProps<"/">)`, the Next 16 helper, correctly.
- **`next.config.ts`** only sets `poweredByHeader: false`. `public/ads.txt` exists. `app/icon.svg` and `app/favicon.ico` provide the icons.
- **`.gitignore`** already covers `.next/`, `.env*`, `*.tsbuildinfo` and `.vercel`. The docs recommend also ignoring `next-env.d.ts`, which is currently tracked.

### Bugs and gaps to fix during the rebuild

| # | Where | Problem | Fix |
|---|---|---|---|
| B1 | Every page exporting `openGraph` (for example `best-wall-mount-garage-heaters/page.tsx`) | No `og:image`, because a child `openGraph` replaces the parent object [verified] | `pageMetadata()` helper (section 5.2) plus a root `app/opengraph-image.tsx` |
| B2 | `/about`, `/privacy` and any page without `openGraph` | Inherits `og:url=https://bayheatguide.com` and `og:title=BayHeat Guide` [verified] | Same helper: always set `openGraph.url` per page |
| B3 | `components/json-ld.tsx` | `JSON.stringify(data)` is not escaped. The docs say to replace `<` with `<` (XSS). | `JSON.stringify(data).replace(/</g, '\\u003c')` |
| B4 | `app/globals.css` `html { scroll-behavior: smooth }` | In Next 16 the router no longer turns smooth scrolling off during navigation, so each route change smooth-scrolls to the top | Add `data-scroll-behavior="smooth"` on `<html>` to restore the old behavior |
| B5 | `layout.tsx` metadata `twitter.card: "summary"` | Shows a small card | Use `summary_large_image` once OG images exist |
| B6 | `next-env.d.ts` tracked in git | The docs say to gitignore it. It is regenerated by dev, build and typegen. | Optional: `git rm --cached next-env.d.ts` and add it to `.gitignore` |

---

## 3. What changed from Next 13–15 to 16

| Area | Before (13–15) | Now (16.x) | Source |
|---|---|---|---|
| `params` and `searchParams` | Sync in 14. Promise in 15 with a sync fallback. | **Promise only.** Use `await` or `use()`. | upgrading/version-16.md |
| `cookies()`, `headers()`, `draftMode()` | Sync fallback in 15 | **Async only** | same |
| Image-generator props (`opengraph-image`, `twitter-image`, `icon`, `apple-icon`) | `params` object, `id` string | `params` **and** `id` are Promises. `generateImageMetadata` still gets sync `params`. | same |
| `sitemap({ id })` from `generateSitemaps` | `id: number` | `id: Promise<string>`, so use `Number(await id)` | same |
| Type helpers | Hand-written prop types | Global `PageProps<'/r'>`, `LayoutProps<'/r'>` and `RouteContext<'/r'>`, generated by dev, build or `next typegen` | file-conventions/page.md |
| Middleware | `middleware.ts`, `export function middleware`, Edge by default | `proxy.ts`, `export function proxy`. **Node runtime only; `runtime` cannot be set.** `skipMiddlewareUrlNormalize` became `skipProxyUrlNormalize`. | file-conventions/proxy.md |
| Bundler | Webpack by default, `--turbopack` to opt in | **Turbopack by default** for dev and build. `--webpack` opts out. `experimental.turbopack` became top-level `turbopack`. Filesystem cache on by default. | version-16.md |
| Lint | `next lint`, `eslint` key in next.config | **Both removed.** Use the ESLint CLI with a flat config. `next build` does not lint. | config/03-eslint.md |
| Caching and PPR | `experimental.ppr`, `dynamicIO`, `useCache`, `unstable_cacheLife` | All folded into **`cacheComponents: true`**. `cacheLife` and `cacheTag` are stable. `revalidateTag(tag, profile)` **requires a second argument**. New `updateTag()` and `refresh()` for Server Actions. | version-16.md, caching.md |
| Runtime config | `serverRuntimeConfig`, `publicRuntimeConfig` | **Removed.** Use `process.env`, plus `connection()` for values that must be read at runtime. | version-16.md |
| AMP | Supported | **Removed** | version-16.md |
| `next/image` | `priority` prop; `qualities` accepts any value; `minimumCacheTTL` 60 s; `imageSizes` includes 16 | `priority` is **deprecated in favor of `preload`** (prefer `loading="eager"` or `fetchPriority="high"`). `qualities` defaults to `[75]`. TTL defaults to 14400 s. 16 is dropped from `imageSizes`. Local images with `?query` need `localPatterns.search`. `images.domains` is deprecated in favor of `remotePatterns`. | version-16.md, components/image.md |
| Parallel routes | `default.js` optional | **Required.** The build fails without it. | version-16.md |
| Scroll | Next forced `scroll-behavior: auto` during navigation | Your CSS applies unless `<html data-scroll-behavior="smooth">` | version-16.md |
| `error.js` | `reset()` | New **`retry()`**, stable in 16.3, re-fetches and re-renders. `reset()` still exists. There is also `catchError()` from `next/error` for component-level boundaries. | file-conventions/error.md |
| `<Link>` | — | `onNavigate` (15.3), `prefetch="auto"` (15.4), **`transitionTypes`** (16.2). Layout dedupe and incremental prefetch need no code change. | components/link.md |
| Typed routes | `experimental.typedRoutes` | **`typedRoutes: true`**, stable and top-level | next-config-js/typedRoutes.md |
| React | 19.0 | 19.2 canary: `<ViewTransition>`, `<Activity>`, `useEffectEvent` | version-16.md |
| React Compiler | experimental | `reactCompiler: true` is stable but off by default. Needs `babel-plugin-react-compiler` and slows builds. **Not recommended here.** | version-16.md |
| Build output | Sizes and First Load JS shown | Removed. Measure with Lighthouse or Vercel Speed Insights. | version-16.md |
| Minimums | Node 18 | Node 20.9+, TypeScript 5.1+, Chrome/Edge/Firefox 111+, Safari 16.4+ | version-16.md |

---

## 4. Pages, layouts and route types

```tsx
// app/guides/[slug]/page.tsx  (server component, the default)
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export default async function Page(props: PageProps<'/guides/[slug]'>) {
  const { slug } = await props.params            // Promise: always await
  // const q = await props.searchParams          // makes the route dynamic (ƒ). Avoid on content pages.
  const guide = getGuide(slug)
  if (!guide) notFound()
  return <article>{guide.h1}</article>
}
```

```tsx
// layout with typed params and slots
export default function Layout({ children }: LayoutProps<'/guides'>) {
  return <section>{children}</section>
}
```

```tsx
// client component reading a params promise passed down from a server component
'use client'
import { use } from 'react'
export function Slug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <span>{slug}</span>
}
```

Rules:

- The helpers exist only after `next dev`, `next build` or `next typegen`, which write `.next/types/routes.d.ts`. Static routes resolve `params` to `{}`.
- Layouts do not re-render on navigation. They cannot read `searchParams` or the pathname. Use `usePathname()` or `useSearchParams()` in a client child.
- A page and a `route.ts` cannot live in the same segment.
- Pages are the leaf. The order is `layout > template > error > loading > not-found > page`.

---

## 5. Metadata, SEO and structured data

### 5.1 Basics

- Use `export const metadata: Metadata` or `export async function generateMetadata(props: PageProps<'/r'>, parent: ResolvingMetadata)`. Never hand-write `<head>` tags in layouts.
- **Streaming metadata (15.2+).** When `generateMetadata` does async work on a dynamic page, the tags can stream into `<body>`. HTML-limited bots (Twitterbot, Slackbot, Bingbot, facebookexternalhit and others; see `htmlLimitedBots`) get them blocking in `<head>`. On our static pages everything is in `<head>` at build time, so no action is needed.
- `themeColor`, `colorScheme` and `viewport` belong in `export const viewport: Viewport` or `generateViewport`, not in `metadata`.
- `metadataBase: new URL(site.url)` is already set in the root layout, so relative `alternates.canonical` and OG URLs resolve to absolute URLs [verified in the HTML: `<link rel="canonical" href="https://bayheatguide.com/about">`].
- Pages that return 404 get `<meta name="robots" content="noindex">` automatically.
- To dedupe data between `generateMetadata` and the page, wrap the loader in `React.cache` (`import { cache } from 'react'`).

### 5.2 The OG merge gotcha and the helper that fixes B1 and B2

Metadata merges **shallowly per top-level key**. A page's `openGraph` replaces the layout's whole `openGraph`, including `images` and `url`. File-based `opengraph-image` output is injected as `openGraph.images` only when nothing below overrides `openGraph`. Recommended helper:

```ts
// lib/seo.ts
import type { Metadata } from 'next'
import { site } from '@/lib/site'

export function pageMetadata(p: {
  path: `/${string}`; title: string; description: string;
  ogTitle?: string; type?: 'website' | 'article'; image?: string
}): Metadata {
  const image = p.image ?? `${p.path === '/' ? '' : p.path}/opengraph-image`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      type: p.type ?? 'article', url: p.path, siteName: site.name, locale: site.locale,
      title: p.ogTitle ?? p.title, description: p.description,
      images: [{ url: image, width: 1200, height: 630, alt: p.ogTitle ?? p.title }],
    },
    twitter: { card: 'summary_large_image', title: p.ogTitle ?? p.title, description: p.description, images: [image] },
  }
}
```

If a route has no colocated `opengraph-image`, point `image` at `/opengraph-image` (the root one). Generated image URLs get a hash query appended (`/opengraph-image?b3bce7b0f8fb5c2f`), and `metadataBase` makes them absolute.

### 5.3 JSON-LD

The docs recommend a native `<script type="application/ld+json">` (not `next/script`) rendered in the page or layout, and escaping `<`:

```tsx
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
```

For typing, the optional package is `schema-dts` (`WithContext<Product>`). Validate at https://search.google.com/test/rich-results and https://validator.schema.org/.

### 5.4 Sitemap and robots

`app/sitemap.ts` returns `MetadataRoute.Sitemap`: `url`, `lastModified`, `changeFrequency`, `priority`, `alternates.languages`, `images[]`, `videos[]`. It is static by default [verified `○ /sitemap.xml`].

When splitting sitemaps (not needed below 50k URLs), `id` is a Promise:

```ts
export async function generateSitemaps() { return [{ id: 0 }, { id: 1 }] }
export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id)   // served at /<segment>/sitemap/0.xml
  return []
}
```

`app/robots.ts` stays as it is. It is static [verified].

### 5.5 Icons

- `app/icon.(ico|jpg|png|svg)`, `app/apple-icon.(jpg|png)` and `app/favicon.ico` are file conventions. You can also generate icons in `icon.tsx` or `apple-icon.tsx` with `ImageResponse`; there `params` is a Promise and the function returns `Response`, `Blob` or `ArrayBuffer`.
- For an installable app, add `app/manifest.ts` (`MetadataRoute.Manifest`).

---

## 6. OG images with `next/og` `ImageResponse`

Verified recipe. It builds as `○ /opengraph-image` and the PNG is 1200×630.

```tsx
// app/opengraph-image.tsx   (also works in any segment, for example app/tools/planner/opengraph-image.tsx)
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'BayHeat: heat the bay'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Module scope: read once. Must be TTF, OTF or WOFF (NOT woff2). Static weight instance.
const display = await readFile(join(process.cwd(), 'assets/fonts/InterTight-800.ttf'))

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: 72, color: '#fff7ed', fontFamily: 'Inter Tight',
        background: 'linear-gradient(135deg,#0b0b0c 0%,#1a0f0a 60%,#ff5a1f 140%)' }}>
        <div style={{ fontSize: 96, lineHeight: 1, letterSpacing: -3 }}>Heat the bay.</div>
        <div style={{ fontSize: 32, marginTop: 24, color: '#fdba74' }}>bayheatguide.com</div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Inter Tight', data: display, weight: 800, style: 'normal' }] },
  )
}
```

Per-slug OG under a dynamic route: **export `generateStaticParams` in the image file too**, or it renders on demand (`ƒ`) [verified].

```tsx
// app/guides/[slug]/opengraph-image.tsx
export { generateStaticParams } from './page'   // or re-declare it
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params                  // Promise in 16
  /* ... */
}
```

Getting a TTF (Google serves TTF to a client with no user agent) [verified]:

```bash
mkdir -p assets/fonts
curl -sS "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800" \
  | grep -o 'https://[^)]*\.ttf' | xargs curl -sSo assets/fonts/InterTight-800.ttf
```

Commit the TTF so builds don't depend on the network. Inter Tight 800 is about 304 KB.

**Satori constraints.** Satori, with Resvg, renders these images.

- Layout is flexbox only; `display: grid` does not work. Every `<div>` with more than one child needs `display: 'flex'`.
- Use inline `style`. No Tailwind classes.
- The bundle limit is 500 KB, including fonts and images. Keep one or two font files per image.
- The default font is the bundled `Geist-Regular.ttf`.
- Emoji default to `twemoji`.
- Local images: embed a base64 data URL read at module scope (`readFile(join(process.cwd(),'public/x.png'),'base64')`).
- File limits: `opengraph-image` up to 8 MB, `twitter-image` up to 5 MB. Add alt text with an `alt` export or `opengraph-image.alt.txt`.
- If an OG image ever **must** be dynamic (`ƒ`) and reads files, add the file to `outputFileTracingIncludes` in `next.config.ts`, e.g. `{ '/guides/[slug]/opengraph-image': ['./assets/fonts/**/*'] }`, so the serverless bundle contains it. Better: keep OG images static.

---

## 7. Keeping pages static (the default caching model)

Without `cacheComponents` (our choice), a route is prerendered at build time unless it uses:

- a Request-time API (`cookies()`, `headers()`, `connection()`, `draftMode()`, the `searchParams` prop);
- `fetch(..., { cache: 'no-store' })`;
- `export const dynamic = 'force-dynamic'`;
- `export const revalidate = 0`.

`fetch` is **not cached by default** in 15 and later, but a fetch reached before any Request-time API still runs once during `next build` and is baked into the output.

Verified behavior table (scratch build of this repo):

| File | Build result |
|---|---|
| All 13 current pages, `/sitemap.xml`, `/robots.txt`, `/icon.svg` | `○` |
| Page that renders a client form wired to a Server Action (`useActionState`) | `○` (**Server Actions do not make a page dynamic**) |
| Page that awaits `props.searchParams` | `ƒ` |
| Static page containing a client component that calls `useSearchParams()` **without** `<Suspense>` | **Build error:** `useSearchParams() should be wrapped in a suspense boundary` |
| Same, wrapped in `<Suspense fallback={...}>` | `○`. The HTML ships the fallback and the client fills it in (`BAILOUT_TO_CLIENT_SIDE_RENDERING`). |
| `app/lab/[slug]/page.tsx` with `generateStaticParams` and `dynamicParams = false` | `●` for each slug |
| `route.ts` GET returning constant JSON | `ƒ`; with `export const dynamic = 'force-static'` it is `○` |
| `route.ts` GET or POST reading `request` | `ƒ` (expected) |
| `app/opengraph-image.tsx` reading a font from disk | `○` |
| `[slug]/opengraph-image.tsx` without or with its own `generateStaticParams` | `ƒ` / `●` |

Segment config that still applies without Cache Components: `dynamic` (`'auto' | 'force-dynamic' | 'error' | 'force-static'`), `dynamicParams`, `revalidate` (statically analyzable number or `false`), `fetchCache`, `runtime`, `preferredRegion`, `maxDuration`. On hub pages, **`export const dynamic = 'error'`** is a cheap guard: the build fails if anything makes the page dynamic.

**Pattern for a shareable calculator result** (`/tools/planner?w=24&l=24&zip=60601`) that keeps the page `○`:

```tsx
// app/tools/planner/page.tsx  (server, static)
import { Suspense } from 'react'
import { Planner } from './planner'           // 'use client'
export default function Page() {
  return (
    <Suspense fallback={<PlannerSkeleton />}>
      <Planner />
    </Suspense>
  )
}
```

```tsx
// app/tools/planner/planner.tsx
'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
export function Planner() {
  const sp = useSearchParams()
  const router = useRouter(); const pathname = usePathname()
  const width = Number(sp.get('w') ?? 24)
  // write state back without a navigation re-render storm:
  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp); next.set(k, v)
    router.replace(`${pathname}?${next}`, { scroll: false })
  }
  // ... pure lib/planner/* math runs client-side
}
```

`window.history.replaceState` also integrates with the router and `useSearchParams` (see getting-started/linking-and-navigating, "Native History API"). It avoids a server round trip and is best for slider-driven updates.

Dynamic routes:

```tsx
export const dynamicParams = false                 // unknown slugs → 404 instead of on-demand render
export function generateStaticParams() {           // must return an array, even if empty
  return guides.map((g) => ({ slug: g.slug }))
}
```

Child `generateStaticParams({ params })` receives the **synchronous** parent params. `fetch` is memoized across `generate*` functions, layouts and pages.

---

## 8. Cache Components, for reference (do not enable)

```ts
// next.config.ts, NOT recommended for BayHeat now
const nextConfig: NextConfig = { cacheComponents: true /*, partialPrefetching: true (16.3, needs cacheComponents) */ }
```

What it would change:

- Data is dynamic by default. `'use cache'` (async functions or components only) plus `cacheLife('hours' | 'days' | 'max' | ...)` and `cacheTag()` make data part of the static shell.
- Runtime data must sit inside `<Suspense>`, or dev and build raise a "blocking-route" error.
- `Math.random()`, `Date.now()` and `new Date()` in render become errors unless preceded by `await connection()` or cached.
- `dynamic`, `dynamicParams`, `revalidate` and `fetchCache` are removed.
- `generateStaticParams` must return at least one param.
- Routes are kept alive under `<Activity mode="hidden">`, so effects run again.
- Bots get a full dynamic render.
- It requires the Node runtime.

cacheLife profiles (stale / revalidate / expire):

| Profile | stale | revalidate | expire |
|---|---|---|---|
| `default` | 5m | 15m | never |
| `seconds` | 30s | 1s | 1m |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |
| `days` | 5m | 1d | 1w |
| `weeks` | 5m | 1w | 30d |
| `max` | 5m | 30d | 1y |

APIs that work **without** the flag, in Server Actions and Route Handlers:

- `revalidatePath('/x')`
- `revalidateTag('tag', 'max')` (the second argument is **required** in 16)
- `updateTag('tag')` (Server Actions only; read-your-writes)
- `refresh()` (re-renders the current route)
- `unstable_cache(fn, keys, { tags, revalidate })` for non-fetch data
- `fetch(url, { next: { revalidate: 3600, tags: ['prices'] } })`

For periodic data such as EIA electricity or propane prices, the cheapest robust option is to **commit the data as a TS module and redeploy**. The agent team's refresh job then becomes: update `lib/planner/prices.ts`, open a PR, merge, and Vercel rebuilds. No ISR is needed.

---

## 9. Route Handlers

```ts
// app/api/subscribe/route.ts
import type { NextRequest } from 'next/server'
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email) return Response.json({ error: 'email required' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return Response.json({ ok: true, queued: false }, { status: 202 }) // env-gated fallback
  // ...call provider
  return Response.json({ ok: true }, { status: 201 })
}
```

```ts
// static JSON, for example a machine-readable price table
export const dynamic = 'force-static'
export async function GET() { return Response.json(PRICES) }
```

```ts
// dynamic segment with the typed context helper
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/heaters/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
```

- Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. Unsupported methods return 405. `OPTIONS` is automatic if not exported.
- Only GET can be cached or prerendered. POST and the other methods never are.
- `redirect()` from `next/navigation` works inside handlers.
- `generateStaticParams` works in `route.ts` too.
- Don't call your own Route Handlers from Server Components; call the function directly.

---

## 10. Server Actions and forms (email capture, lead forms)

```ts
// app/actions/subscribe.ts
'use server'
export type SubscribeState = { ok: boolean; message: string }
export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: 'Enter a valid email.' }
  if (formData.get('company')) return { ok: true, message: 'Thanks!' }          // honeypot
  if (!process.env.RESEND_API_KEY) return { ok: true, message: 'Saved.' }      // env-gated, graceful
  // await resend.contacts.create(...)
  return { ok: true, message: 'Check your inbox.' }
}
```

```tsx
// components/subscribe-form.tsx
'use client'
import { useActionState } from 'react'
import { subscribe, type SubscribeState } from '@/app/actions/subscribe'
const initial: SubscribeState = { ok: false, message: '' }
export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, initial)
  return (
    <form action={action}>
      <input name="email" type="email" required autoComplete="email" />
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button disabled={pending}>{pending ? 'Sending…' : 'Get the plan'}</button>
      <p aria-live="polite">{state.message}</p>
    </form>
  )
}
```

**Facts from the docs:**

- **An action is a public POST endpoint.** Validate every input inside the action.
- **Framework protections:**
  - A CSRF Origin/Host check (configure `experimental.serverActions.allowedOrigins` if we put a proxy or CDN on another domain).
  - A **1 MB body limit** (`experimental.serverActions.bodySizeLimit`).
  - Action IDs are encrypted, and IDs rotate on deploy (up to every 14 days), so old tabs can get "Failed to find Server Action". Show a retry message.
- **Dispatch is sequential per client.** Don't `Promise.all` actions.
- **What re-renders the current route:** `redirect()`, `revalidatePath()`, `updateTag()` and `refresh()` return a fresh RSC payload in the same round trip. `revalidateTag(tag, 'max')` does not.
- **`bind` for extra arguments:** `action.bind(null, planId)` works with progressive enhancement. Hidden inputs are unencoded in the HTML.
- **Other hooks:** `useFormStatus` (from `react-dom`) for nested submit buttons and `useOptimistic` for optimistic UI.
- **Pages stay static.** A page with a form wired to a Server Action still builds as `○` [verified].

---

## 11. `proxy.ts`, formerly middleware

We don't need it now. Use `next.config.ts` redirects for URL changes (`permanent: true` gives 308, `false` gives 307). Use `redirect()` or `permanentRedirect()` from `next/navigation` inside components or actions.

```ts
// proxy.ts (project root, one per project; Node runtime only; `export const runtime` throws)
import { NextResponse, type NextRequest } from 'next/server'
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/old-guide') {
    return NextResponse.redirect(new URL('/guides/new', request.url), 308)
  }
  return NextResponse.next()
}
export const config = {
  // without a matcher, proxy runs on EVERY request, including _next/static and public files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
```

- `fetch` cache options have no effect in proxy.
- Proxy is not an auth boundary for Server Actions.
- Matchers must be static constants.

```ts
// next.config.ts: preferred for SEO moves
async redirects() {
  return [{ source: '/best-wall-mount-garage-heaters', destination: '/guides/wall-mount', permanent: true }]
}
```

Warning: two weeks of indexing exist on the current URLs. **Keep existing slugs** or 308 every one of them.

---

## 12. Fonts: `next/font/google`

```tsx
// app/layout.tsx
import { Inter_Tight, Fraunces, JetBrains_Mono } from 'next/font/google'
const sans = Inter_Tight({ subsets: ['latin'], variable: '--ff-sans', display: 'swap' })          // variable font: omit weight
const display = Fraunces({ subsets: ['latin'], variable: '--ff-display', axes: ['SOFT', 'WONK', 'opsz'] }) // extra axes opt-in
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--ff-mono' })
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* app/globals.css: map runtime next/font vars into Tailwind theme with `inline` */
@theme inline {
  --font-sans: var(--ff-sans);
  --font-display: var(--ff-display);
  --font-mono: var(--ff-mono);
}
```

**Loader options:**

- Variable fonts need no `weight`. Otherwise pass `weight: '400'` or `['400','700']`; a range such as `'100 900'` is only valid on variable fonts.
- `axes` works only on variable Google fonts and only for non-`wght` axes.
- `subsets` is needed when `preload` is on (the default). A missing subset triggers a warning.
- `display` defaults to `'swap'`.
- `adjustFontFallback` defaults to `true`, which generates a metric-matched fallback to limit CLS.
- `fallback: ['system-ui','arial']` sets fallback families.

The fonts are self-hosted at build time, so there is no request to Google at runtime. The build needs network access, which works here [verified].

**Naming rule:** don't give a next/font `variable` the same name as a Tailwind theme variable. The current `--font-display` plus a future `@theme { --font-display: var(--font-display) }` would be circular. Prefix loader variables with `--ff-*` and map them in `@theme inline`.

Variable-font data from `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json`:

| Family | Variable | Axes |
|---|---|---|
| Inter | yes | opsz, wght |
| Inter Tight | yes | wght |
| Fraunces | yes | SOFT, WONK, opsz, wght |
| Bricolage Grotesque | yes | opsz, wdth, wght |
| Archivo | yes | wdth, wght |
| Mona Sans / Hubot Sans | yes | wdth, wght |
| Instrument Sans | yes | wdth, wght |
| Big Shoulders | yes | opsz, wght |
| Space Grotesk | yes (300–700) | wght |
| Unbounded, Syne, Sora, Outfit, Onest, Geist, Geist Mono, JetBrains Mono, Chivo Mono, Manrope, Figtree, Schibsted Grotesk, Hanken Grotesk, Epilogue, Red Hat Display, Oswald | yes | wght |
| DM Sans | yes (up to 1000) | opsz, wght |
| Source Serif 4, Newsreader | yes | opsz, wght |
| Instrument Serif, Anton | **no** (400 only) | — |
| IBM Plex Mono, Barlow Condensed, Space Mono | **no** (static weights) | — |

The import name is the family with spaces turned into underscores, for example `Big_Shoulders` or `Bricolage_Grotesque`.

---

## 13. Tailwind CSS v4.3: CSS-first config

Setup already present:

- `postcss.config.mjs` with `{ plugins: { '@tailwindcss/postcss': {} } }`
- `app/globals.css` starting with `@import "tailwindcss";`
- **No `tailwind.config.js`.** Content sources are auto-detected. Add `@source "../some/dir";` only when classes live outside the project.

Verified in a scratch build (the generated CSS contained each utility):

```css
@import "tailwindcss";

@theme {
  --color-ember-500: #ff5a1f;            /* → bg-ember-500, text-ember-500, border-ember-500/50 (color-mix) */
  --color-coal-950: #0b0b0c;
  --text-mega: clamp(3rem, 9vw, 8rem);   /* → text-mega */
  --text-mega--line-height: 0.9;         /* paired line-height */
  --animate-glow: glow 2.4s ease-in-out infinite;   /* → animate-glow */
  @keyframes glow { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
}
@theme inline { --font-display: var(--ff-display); }  /* inline: utility uses var(--ff-display) directly */
@custom-variant dark (&:where(.dark, .dark *));        /* class-based dark mode (default is prefers-color-scheme) */
@utility heat-grid {                                   /* custom utility, works with variants: md:heat-grid */
  background-image: linear-gradient(to right, rgb(255 90 31 / .08) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

- The theme namespaces are `--color-*`, `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`, `--breakpoint-*`, `--container-*`, `--spacing`, `--radius-*`, `--shadow-*`, `--ease-*` and `--animate-*`. `--color-*: initial;` wipes the default palette.
- Arbitrary CSS variables have a shorthand: `bg-(--paper)` equals `bg-[var(--paper)]` [verified]. Existing `bg-[var(--paper)]` still works.
- Theme variables are emitted as real CSS custom properties, so use `var(--color-ember-500)` in plain CSS, inline styles and SVG.
- The docs recommend global CSS only for truly global styles, Tailwind for components and CSS Modules (`*.module.css`) for scoped leftovers. CSS order follows import order, so check `next build`, because dev order can differ.
- `experimental.inlineCss: true` inlines CSS into `<head>`. The docs say it improves FCP and LCP for first-time visitors with atomic CSS, at the cost of stylesheet caching. It is a reasonable A/B candidate for a mostly first-visit SEO site, but it is experimental.

---

## 14. View transitions (React 19.2 `<ViewTransition>`)

- **No config flag.** "View transitions work in the App Router with no configuration" (guides/view-transitions.md).
- The export exists only in Next's bundled React canary (`next/dist/compiled/react`), not in `node_modules/react` 19.2.8. The App Router uses the bundled copy. Types come in through Next's types, and `tsc` passes in the repo [verified].
- **Browser support:** the API needs Chromium 125+ and recent Safari or Firefox. Browsers without it just don't animate.

```tsx
import { ViewTransition } from 'react'
import Link from 'next/link'

// 1) shared-element morph: same `name` on both routes
<ViewTransition name={`heater-${id}`} share="morph" default="none"><img .../></ViewTransition>

// 2) directional nav: tag links, map types to CSS classes, wrapper in EACH page.tsx (not layout)
<Link href="/tools/planner" transitionTypes={['nav-forward']}>Plan my garage</Link>
<ViewTransition
  enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
  exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
  default="none">
  {/* page content */}
</ViewTransition>

// 3) Suspense reveal
<Suspense fallback={<ViewTransition exit="slide-down" default="none"><Skeleton/></ViewTransition>}>
  <ViewTransition enter="slide-up" default="none"><Results/></ViewTransition>
</Suspense>

// 4) same-route crossfade: key change → exit/enter pair
<ViewTransition key={tab} name="tab-panel" share="auto" enter="auto" default="none">...</ViewTransition>
```

```css
/* app/globals.css */
::view-transition { pointer-events: none; }                         /* keep page clickable mid-animation */
::view-transition-group(site-header) { animation: none; z-index: 100; }
::view-transition-old(site-header) { display: none; }
::view-transition-new(site-header) { animation: none; }
::view-transition-old(.nav-forward) { --slide-offset: -60px; animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-forward) { --slide-offset: 60px;  animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
::view-transition-old(.nav-back)    { --slide-offset: 60px;  animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-back)    { --slide-offset: -60px; animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
@keyframes fade  { from { filter: blur(3px); opacity: 0 } to { filter: blur(0); opacity: 1 } }
@keyframes slide { from { translate: var(--slide-offset) } to { translate: 0 } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
    animation-duration: 0s !important; animation-delay: 0s !important;
  }
}
```

The header gets `style={{ viewTransitionName: 'site-header' }}` so it doesn't slide.

**Rules from the docs:**

- Only Transitions, Suspense and `useDeferredValue` trigger animations. Plain `setState` does not; route navigations do.
- Use `default="none"` on named elements to avoid stray crossfades. When you use `default="none"` on a morph pair, keep an explicit `share`.
- A morph only plays if the destination renders in the same commit. Static prefetched pages do; a Suspense fallback breaks the pair.
- Browser back/forward carries no transition type, so there is no directional slide.
- `router.push(url, { transitionTypes: [...] })` is also supported.

---

## 15. `<Link>`, prefetching and navigation

- Prefetch runs **only in production**, when a link enters the viewport, and again on hover if the data is stale.
- **Default `prefetch` (`"auto"` / `null`):** static routes are prefetched fully; dynamic routes down to the nearest `loading.tsx`. Because all our routes are static, header and footer links prefetch whole pages.
- 16 adds layout dedupe and incremental prefetch automatically, which means more requests but fewer bytes.
- On very link-dense pages, `prefetch={false}` on long footer lists is fine.
- **`prefetch={true}`** without `partialPrefetching` (which needs Cache Components) prefetches the full route. With it enabled, a dev warning appears.
- **Other props:** `replace`, `scroll={false}`, `onNavigate={(e) => e.preventDefault()}` to block navigation (for example unsaved planner state), and `transitionTypes`.
- **Scroll:** Next keeps scroll position if the new page is in view, otherwise it scrolls to the top of the page. It skips sticky and fixed elements when choosing the target. **With our sticky header, add `html { scroll-padding-top: 72px }`** (or `scroll-margin-top` on headings; `.guide-prose h2` already uses `scroll-margin-top: 6rem`).
- **Typed routes** are opt-in (`typedRoutes: true`). Enabling them today **breaks the typecheck in 6 places** because `Guide.href` is `string` [verified]. The fix: `import type { Route } from 'next'` and `href: Route` in the `Guide` type (verified to clear the `lib/site.ts`-driven errors), plus `satisfies` or `as Route` for local arrays like `steps` in `app/page.tsx`. Generic wrapper: `function Card<T extends string>({ href }: { href: Route<T> | URL })`. This is worth enabling in the rebuild because it catches broken internal links at build time.

---

## 16. Images, scripts, analytics, env vars, lazy loading

- **`next/image`:**
  - Use `preload` (not the deprecated `priority`) only for the true LCP image. The docs prefer `loading="eager"` or `fetchPriority="high"`.
  - `qualities` defaults to `[75]`; add values to `images.qualities` if you need others.
  - Remote images need `images.remotePatterns: [{ protocol: 'https', hostname: 'm.media-amazon.com' }]`, and Amazon's hotlinking terms apply. Prefer our own photos or SVG illustrations.
  - The default `minimumCacheTTL` is 4 h.
- **`next/script`:** strategies are `beforeInteractive`, `afterInteractive` (default), `lazyOnload` and `worker` (experimental). Put site-wide scripts in the root layout; they load once per layout. Gate them on env vars: `{process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && <Script ... />}`.
- **Web Vitals:** a client component calls `useReportWebVitals((m) => ...)` from `next/web-vitals`, reporting TTFB, FCP, LCP, CLS and INP. `instrumentation-client.ts` at the root runs before hydration and suits analytics and error tracking.
- **Env vars:**
  - `NEXT_PUBLIC_*` are **inlined at `next build`**, so changing them requires a redeploy. Dynamic lookups like `process.env[name]` are not inlined.
  - Server-only env read in a **static** page is also frozen at build time.
  - Env read inside Server Actions, Route Handlers or after `await connection()` is read at runtime.
  - So every env-gated feature (Resend, Stripe, lead partner) should check env **inside the action or handler**, and fall back gracefully.
  - Load order: `process.env` > `.env.$(NODE_ENV).local` > `.env.local` (not in test) > `.env.$(NODE_ENV)` > `.env`.
- **Lazy loading:** `next/dynamic(() => import('./Chart'), { ssr: false })` is allowed **only inside Client Components**; it errors in Server Components. Use it for heavy client-only widgets (charts, 3D, maps). A `React.lazy` or `import()` on user input (for example loading `fuse.js` on first keystroke) is fine.
- **Static export (`output: 'export'`): do not use it.** It drops Server Actions, POST route handlers, dynamic OG images and redirects. Vercel serves our `○` pages from the CDN anyway.

---

## 17. Unit tests with `node --test`

Node **v22.22.2** has native type stripping on by default (22.18+), so `node --test` runs `.ts` files with no dependencies. All of the following was **verified** in the scratchpad and in a scratch copy of the repo.

| Test | Result |
|---|---|
| `node --test 'lib/**/*.test.ts'` (quoted: Node expands the glob) | Finds nested **and** top-level tests. Passes. |
| `node --test lib/**/*.test.ts` (unquoted: bash without globstar treats `**` as `*`) | **Silently ran 1 of 4 files.** Missed `lib/*.test.ts`. Always quote it. |
| `import { f } from './calc.ts'` | Works |
| `import { f } from './calc'` (no extension) | `ERR_MODULE_NOT_FOUND` |
| `import { f } from '@/lib/calc'` | `ERR_MODULE_NOT_FOUND`: Node ignores tsconfig `paths` |
| `import { Volts } from './electrical.ts'` where `Volts` is a type | `SyntaxError: ... does not provide an export named 'Volts'`. Use `import type` or `import { type Volts }`. |
| `enum` in a tested file | `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. The same applies to namespaces and constructor parameter properties. |
| `.tsx` / JSX | Not supported by type stripping. Test pure `.ts` logic only. |
| Warning `MODULE_TYPELESS_PACKAGE_JSON` | Harmless noise. Remove it with `"type": "module"` in package.json (verified: `next build` and `eslint` still pass) or `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`. |
| Importing today's `lib/json-ld.ts` directly | Fails, because it imports `./site` without an extension. |

**Recommended setup:** verified end to end. `node --test`, `tsc --noEmit` and `next build` are all green together.

1. In `tsconfig.json` `compilerOptions`, add:
   - `"allowImportingTsExtensions": true` (allowed because `noEmit` is already true)
   - `"erasableSyntaxOnly": true` (TS 5.8+; makes `tsc` reject enums and parameter properties the way Node would)
   - optionally `"verbatimModuleSyntax": true` (forces `import type`; the current code passes)
2. In `package.json`:
   - add `"type": "module"`
   - add the script `"test": "node --test 'lib/**/*.test.ts'"` (use `--test-reporter=spec` for readable output)
3. In the tested modules (`lib/planner/*.ts`): use relative imports **with `.ts`** (`import { CONTINUOUS_FACTOR } from './constants.ts'`). Don't use `@/` inside `lib/planner`. Keep data as TS modules rather than JSON, which would need `with { type: 'json' }`. Don't use `Date.now()`, which the planner spec already forbids.
4. App code keeps importing `@/lib/planner/plan` (or `.../plan.ts`; both build under Turbopack [verified]).

```ts
// lib/planner/electrical.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { maxContinuousWatts } from './electrical.ts'

test('15 A / 120 V → 1440 W continuous (NEC 80%)', () => {
  assert.equal(maxContinuousWatts(120, 15), 1440)
})
test('30 A / 240 V → 5760 W', () => assert.equal(maxContinuousWatts(240, 30), 5760))
```

**Alternative if you must keep `@/` and extensionless imports in tested code.** This was also verified (4 of 4 tests pass). Use a 20-line resolve hook with `module.registerHooks`, run as `node --import ./test/ts-resolve.mjs --test 'lib/**/*.test.ts'`. The hook maps `@/x` to `<root>/x` and tries `.ts`, `.tsx` and `/index.ts`. Prefer the tsconfig route above; it needs no extra file.

---

## 18. Lint rules that now fail builds in CI

`eslint.config.mjs` spreads `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. It is ESLint 9 flat config, and `next lint` no longer exists.

The React Compiler rules from react-hooks v7 are **errors**:

- `rules-of-hooks`, `set-state-in-effect`, `set-state-in-render`, `purity`, `refs`, `immutability`, `globals`, `static-components`, `use-memo`, `preserve-manual-memoization`, `error-boundaries`, `config`, `gating`
- `exhaustive-deps` stays a warning.

Probe results [verified]:

```tsx
useEffect(() => { setSaved(localStorage.getItem('k')) }, [])   // ✗ set-state-in-effect
const id = Math.random()                                        // ✗ purity (impure call in render)
return <p>{ref.current}</p>                                     // ✗ refs (ref read during render)
```

Patterns that pass:

```tsx
// browser-only value without effect+setState
const subscribe = (cb: () => void) => { addEventListener('storage', cb); return () => removeEventListener('storage', cb) }
const saved = useSyncExternalStore(subscribe, () => localStorage.getItem('k'), () => null)
// ids: useId(); randomness: generate in an event handler, not render
// reduced motion: useSyncExternalStore on matchMedia('(prefers-reduced-motion: reduce)')
```

Next rules that are errors: `no-html-link-for-pages` (use `<Link>` for internal links), `no-sync-scripts` and `inline-script-id` (an inline `<Script>` needs an `id`). `no-img-element` is a warning; use `next/image` or add an eslint-disable comment with a reason.

---

## 19. Error, not-found and loading files

```tsx
// app/error.tsx
'use client'
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert"><p>Something broke.</p><button onClick={() => retry()}>Try again</button></div>
}
```

- **`retry()`** is stable in 16.3. It re-fetches and re-renders. `reset()` only clears state.
- `app/global-error.tsx` must render its own `<html><body>`. It gets no global CSS or metadata, so use the React `<title>` element.
- **`catchError(Fallback)`** from `next/error` makes a component-level boundary that ignores `redirect()` and `notFound()` signals. Use it around a calculator widget so one bad input doesn't blank the page.
- **404s:** `not-found.tsx` takes no props. `notFound()` from `next/navigation` throws to it. `app/not-found.tsx` also handles unmatched URLs, and a 404 automatically gets `noindex`. `global-not-found.tsx` is experimental (`experimental.globalNotFound`); we don't need it.
- `loading.tsx` wraps the page in Suspense. It matters for dynamic routes only; our static pages don't need it.

---

## 20. Recommended `next.config.ts` for the rebuild

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,                 // after typing Guide.href as Route (section 15)
  // images: { remotePatterns: [{ protocol: 'https', hostname: 'example-cdn.com' }] },
  async redirects() {
    return [
      // { source: '/old-slug', destination: '/new-slug', permanent: true },  // 308, keep link equity
    ]
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
  // experimental: { inlineCss: true },   // optional LCP experiment (section 13)
}

export default nextConfig
```

Leave these out:

- `cacheComponents`, `partialPrefetching` (section 8)
- `reactCompiler` (slower Babel builds; the lint rules already give most of the discipline)
- `output: 'export'`
- `eslint`, which is no longer a valid key
- `webpack`, which breaks the Turbopack build

---

## 21. Removed or renamed: do not use

- `next lint`; the `eslint` config key; `.eslintrc*`
- `middleware.ts` and `export function middleware` (use `proxy`); `skipMiddlewareUrlNormalize`; the `runtime` export in proxy
- `experimental.ppr`, `experimental_ppr`, `experimental.dynamicIO`, `experimental.useCache`, `experimental.turbopack`, `experimental.typedRoutes`
- `unstable_cacheLife` and `unstable_cacheTag` (drop the prefix); `unstable_rootParams` (use `next/root-params`)
- `revalidateTag(tag)` with one argument
- `serverRuntimeConfig`, `publicRuntimeConfig`, `getConfig()` from `next/config`
- AMP, including `useAmp`
- `next/legacy/image`, `images.domains`, the `priority` prop on `Image`
- `devIndicators.appIsrStatus`, `buildActivity` and `buildActivityPosition`
- Synchronous `params`, `searchParams`, `cookies()` and `headers()`
- `ImageResponse` from `next/server` (it moved to `next/og` in v14)
- `--turbopack` flags in scripts (redundant)

---

## 22. Pre-merge checklist for any builder PR

1. Run `npx next typegen && npm run typecheck && npm run lint && npm test && npm run build`. Everything must be green.
2. In the build legend, every page is `○` or `●`. The only `ƒ` entries are deliberate API routes (for example `/api/subscribe` POST) or dynamic OG images you meant to make dynamic.
3. Each new page is registered in `lib/site.ts` so it appears in the sitemap, nav and related links, and uses `pageMetadata()` so it gets canonical, og:url, og:image and `summary_large_image`.
4. View the built HTML to check tags: `grep -o '<meta property="og:[^>]*>' .next/server/app/<slug>.html`.
5. The OG PNG exists at `.next/server/app/<slug>/opengraph-image.body`. Open it and look.
6. No `Math.random()`, `Date.now()`, `localStorage` or `window` in render. Use effects, event handlers or `useSyncExternalStore`.
7. Every env-dependent integration checks `process.env.X` inside its action or handler, has a graceful fallback, and is listed in the owner checklist.
8. Existing URLs are unchanged, or 308-redirected in `next.config.ts`.
9. Amazon links use `laqaer-20`. ASIN links are only for the five verified ASINs; everything else uses a tagged search URL.

The scratch experiment copy used for verification was at `/tmp/claude-0/-home-user-bay-heat/86f9864d-2467-50b2-b9be-d395dbfda8cb/scratchpad/buildcopy`. It is disposable and none of it is in the repo.
