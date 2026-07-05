# Tasks: ERP SEO/GEO Authority Pages

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500 (497 new + ~3 modified) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation (~203 lines) → PR 2: Content Pages (~297 lines) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema helper + IndustryLayout + Footer link + Hub page | PR 1 | ~203 lines — foundation. Pages depend on layout/schema |
| 2 | 3 vertical pages + llms.txt | PR 2 | ~297 lines — content layer. Depends on PR 1 layout |

## Phase 1: Schema Helper

- [x] 1.1 Create `src/lib/schema.ts` — export types (`BreadcrumbItem`, `FaqItem`) + functions: `softwareApplication()`, `organization()`, `breadcrumbList(items)`, `faqPage(items)`, `buildGraph(types)` with hardcoded OctopusTrack brand values

## Phase 2: Layout

- [x] 2.1 Create `src/layouts/IndustryLayout.astro` — wraps BaseLayout, accepts `title`, `description`, `canonicalUrl`, `breadcrumbs`, `faqItems?` props, renders `<nav aria-label="Breadcrumb">` visually, calls schema helpers and passes `@graph` as `structuredData` to BaseLayout, includes `<slot />`

## Phase 3: Hub Page

- [x] 3.1 Create `src/pages/industrias/index.astro` — H1 describing industry verticals, card grid linking to each vertical with `<a>` tags, uses IndustryLayout with SoftwareApplication + Organization + BreadcrumbList schema

## Phase 4: Vertical Content Pages

- [x] 4.1 Create `src/pages/industrias/ferreterias.astro` — definition block answering "ERP para ferreterías", 4+ unique FAQ items, feature comparison, geo-stat for Argentine hardware market, cross-links to hub + other verticals, full @graph (incl. FAQPage)
- [x] 4.2 Create `src/pages/industrias/sanitarios.astro` — plumbing-specific content, 60%+ unique body text vs ferreterias, different FAQ and geo-stat for Argentine sanitary market
- [x] 4.3 Create `src/pages/industrias/electricidad.astro` — electrical-specific content, 60%+ unique body text, differentiated FAQ and geo-stat for Argentine electrical market

## Phase 5: Navigation & AI Discovery

- [x] 5.1 Modify `src/components/Footer.astro` — add `<a href="/industrias/">Industrias</a>` to the legal nav block
- [x] 5.2 Create `public/llms.txt` — 2–3 sentence product summary + absolute URLs for hub and all 3 vertical pages, plain text UTF-8

## Phase 6: Verification

- [x] 6.1 Run `npm run build` — verify all pages compile without errors
- [x] 6.2 Run `npm run check` — verify Astro type-checking passes
- [x] 6.3 Inspect rendered HTML for each vertical — verify visible breadcrumbs, FAQ items match schema content, all cross-links present
- [x] 6.4 Validate each page's JSON-LD — local @graph structural inspection passed; external Google Rich Results Test remains pending post-deploy
- [x] 6.5 Verify `public/llms.txt` local static file is UTF-8 plain text; production `/llms.txt` HTTP 200 + `Content-Type: text/plain` remains pending post-deploy
