# Design: ERP SEO/GEO Authority Pages

## Technical Approach

Pure Astro SSG pages under `/industrias/` using a shared schema helper module. One hub (index) + three vertical content pages. No React islands — these are content pages, not interactive UIs. `@graph` schema built programmatically from shared helpers ensures consistency. `llms.txt` served as a static file.

## Architecture Decisions

### Decision: Schema helper module vs per-page duplication

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Shared `src/lib/schema.ts` helpers | DRY; single source of truth for SoftwareApplication/Organization values | **Chosen** |
| Inline `@graph` per page | Error-prone; duplicated brand data when values change | Rejected |

**Rationale**: SoftwareApplication name, Organization logo, and sameAs urls are cross-cutting. A tiny helper eliminates copy-paste errors while each page still owns its FAQ content (schema-visibility requirement).

### Decision: Shared layout vs wrap BaseLayout directly per page

| Option | Tradeoff | Decision |
|--------|----------|----------|
| IndustryLayout.astro | Reduces breadcrumb/schema wiring boilerplate | **Chosen** |
| BaseLayout + inline per page | Duplicates breadcrumb markup 4× | Rejected |

**Rationale**: IndustryLayout wraps BaseLayout, adds visual breadcrumbs, accepts `breadcrumbs` + `faqItems` as props, builds the `@graph` schema internally, and passes clean `<nav>` + content slot. Keeps each vertical page focused on unique content.

### Decision: Footer link vs Header modification

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add link to Footer.astro | Simple Astro component change; no React rework | **Chosen** |
| Add link to Header.tsx | React component; nav overflow risk on mobile; higher blast radius | Rejected |

**Rationale**: The spec requires hub reachable from "site navigation or homepage." Footer already exists as a nav component. Adding one link here is minimal, low-risk, and satisfies the success criteria.

## Data Flow

```
Astro SSG build
  │
  ├─ src/lib/schema.ts  (shared SoftwareApplication, Organization, breadcrumb builders)
  │
  ├─ src/layouts/IndustryLayout.astro  (wraps BaseLayout, calls schema helpers, renders breadcrumb nav)
  │
  ├─ src/pages/industrias/index.astro
  │   └─ uses IndustryLayout → builds @graph [SoftwareApp + Org + BreadcrumbList]
  │   └─ renders card links to all 3 vertical pages
  │
  ├─ src/pages/industrias/{ferreterias,sanitarios, electricidad}.astro
  │   └─ uses IndustryLayout → builds @graph [SoftwareApp + Org + BreadcrumbList + FAQPage]
  │   └─ renders: definition block → features → geo-stat → FAQ → cross-links
  │
  ├─ public/llms.txt  (static — no build step)
  │
  └─ astro build → dist/ → sitemap auto-discovers all /industrias/*.html
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/schema.ts` | Create | Shared helpers: `softwareApplication()`, `organization()`, `breadcrumbList(items)`, `faqPage(items)`, `buildGraph(types)` |
| `src/layouts/IndustryLayout.astro` | Create | BaseLayout wrapper with breadcrumb nav + `@graph` schema rendering |
| `src/pages/industrias/index.astro` | Create | Hub page — H1, industry summary, card links to each vertical |
| `src/pages/industrias/ferreterias.astro` | Create | Vertical page — hardware store industry content |
| `src/pages/industrias/sanitarios.astro` | Create | Vertical page — plumbing supplies industry content |
| `src/pages/industrias/electricidad.astro` | Create | Vertical page — electrical supplies industry content |
| `public/llms.txt` | Create | AI crawler manifest: product summary + hub + 3 vertical URLs |
| `src/components/Footer.astro` | Modify | Add `<a href="/industrias/">Industrias</a>` to footer nav |

## Interfaces / Contracts

```typescript
// src/lib/schema.ts
interface BreadcrumbItem { name: string; path: string; }
interface FaqItem { question: string; answer: string; }

function softwareApplication(): object;
function organization(): object;
function breadcrumbList(items: BreadcrumbItem[]): object;
function faqPage(items: FaqItem[]): object;
function buildGraph(types: object[]): object;  // wraps in { @context, @graph }

// IndustryLayout props
interface IndustryLayoutProps {
  title: string;
  description: string;
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];   // e.g. [{ name: "Industrias", path: "/industrias/" }]
  faqItems?: FaqItem[];            // undefined for hub page → no FAQPage in schema
  ogImage?: string;
}
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | All pages compile | `npm run build` — exit 0 |
| Type check | `.astro` types valid | `npm run check` — exit 0 |
| Schema | Each page validates | Local JSON-LD structural inspection during build verification; Google Rich Results Test on production URLs post-deploy — 0 errors |
| Content | 60% unique text | Manual comparison of rendered body text across 3 verticals |
| Indexation | Hub reachable from footer | Verify `<a href="/industrias/">` exists in rendered footer HTML |
| AI discovery | `llms.txt` resolves | Local static file inspection before deploy; production `curl https://octopustrack.shop/llms.txt` returns 200 + text/plain post-deploy |

## Migration / Rollout

No migration required. All new static files. Deploy via existing CI (build → GHCR → Portainer). Rollback via `git revert`.

## Open Questions

None.
