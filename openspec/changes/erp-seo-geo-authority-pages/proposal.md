# Proposal: ERP SEO/GEO Authority Pages

## Intent

OctopusTrack has a single homepage with thin authority signals for vertical searches like "ERP para ferreterías" or "sistema de gestión para sanitarios". We need crawlable, answer-ready pages to demonstrate topical relevance in both Google and AI answer engines (ChatGPT, Perplexity, Claude).

## Scope

### In Scope
- 1 hub page (`/industrias/`) — index of all verticals with cross-links
- 3 vertical pages (`/industrias/ferreterias/`, `/industrias/sanitarios/`, `/industrias/electricidad/`) — GEO/AEO answer blocks, FAQ with schema, internal linking
- Schema: `SoftwareApplication` + `Organization` + `BreadcrumbList` + `FAQPage` per page
- `public/llms.txt` for AI crawler discoverability

### Out of Scope
- Blog / content cluster and function/feature pages (deferred)
- Off-site link building or off-page authority
- Guaranteed ranking — on-site crawlability and quotability only

## Capabilities

> No existing specs. All capabilities new.

### New Capabilities
- `vertical-landing-pages`: Industry-specific landing pages with AEO/GEO content blocks, FAQ schema, and internal linking per target vertical
- `site-authority-llms`: `llms.txt` exposing site structure and capabilities for AI crawlers
- `structured-data-schema`: Schema.org `SoftwareApplication`, `Organization`, `BreadcrumbList`, and per-page `FAQPage` markup

### Modified Capabilities
None.

## Approach

1. Hub page at `/industrias/` with linked vertical cards and breadcrumbs
2. 3 vertical pages — shared layout but unique FAQ, feature comparison, and geo-stat blocks per industry
3. Per-page `@graph` schema combining SoftwareApplication, Organization, BreadcrumbList, FAQPage
4. `llms.txt` at root linking to hub + vertical pages + product summary
5. Astro sitemap auto-discovers new `.astro` files — no config change needed

## Affected Areas

| Area | Impact |
|------|--------|
| `src/pages/industrias/index.astro` | New |
| `src/pages/industrias/ferreterias.astro` | New |
| `src/pages/industrias/sanitarios.astro` | New |
| `src/pages/industrias/electricidad.astro` | New |
| `public/llms.txt` | New |
| `src/components/vertical-layout.astro` | New |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Thin/doorway penalty | Medium | Unique FAQ, features, and geo-stats per page. No templated filler |
| No rank improvement | High | Out of scope — success = indexation + valid schema + crawlable structure |
| Duplicate content | Low | Template pattern with differentiated blocks per industry |

## Rollback Plan

`git revert` the commit. Remove `src/pages/industrias/` and `public/llms.txt`. Astro SSG — no runtime toggles.

## Dependencies

- Astro sitemap integration (already configured)
- No external services

## Success Criteria

- [ ] All pages indexed after deployment (verify via `site:octopustrack.shop/industrias/`)
- [ ] Schema passes local JSON-LD structural validation; production URLs validate in Google Rich Results Test with zero errors post-deploy
- [ ] Hub page linked from homepage footer/nav; all vertical pages linked from hub
- [ ] `llms.txt` exists in the static build; production `https://octopustrack.shop/llms.txt` resolves with HTTP 200 and `Content-Type: text/plain` post-deploy
- [ ] Each vertical page has: definition block, FAQ with schema, feature comparison, geo-stat block, breadcrumbs
