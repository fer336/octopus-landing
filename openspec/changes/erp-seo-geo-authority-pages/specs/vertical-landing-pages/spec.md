# Vertical Landing Pages Specification

## Purpose

Industry-specific landing pages that demonstrate topical relevance for vertical ERP searches in both traditional search engines and AI answer engines.

## Requirements

### Requirement: Hub Index Page

The system MUST expose a hub page at `/industrias/` that lists all industry verticals.

| Property | Value |
|----------|-------|
| URL | `/industrias/` |
| Pages linked | All vertical industry pages |
| Breadcrumbs | MUST include `BreadcrumbList` schema via structured data |
| Crawlable | MUST reachable from site navigation or homepage |

#### Scenario: Hub lists all verticals

- GIVEN a visitor navigates to `/industrias/`
- WHEN the page renders
- THEN it MUST display a card or link for every published vertical page
- AND each card MUST contain a crawlable `<a>` tag with descriptive anchor text

### Requirement: Vertical Detail Page

Each industry vertical MUST have its own page at `/industrias/{vertical}/` with unique, non-doorway content.

| Property | Value |
|----------|-------|
| Pages | `/industrias/ferreterias/`, `/industrias/sanitarios/`, `/industrias/electricidad/` |
| Content MUST include | Definition block, FAQ section, feature comparison, geo-stat block |
| Content MUST NOT | Be templated filler — each page SHALL have differentiated text per vertical |

#### Scenario: Unique definition block

- GIVEN a search engine or AI crawler visits a vertical page
- WHEN the page content is evaluated
- THEN it MUST contain a definition block answering "What is ERP for [industry]?" in one sentence with supporting context

#### Scenario: FAQ with schema support

- GIVEN the vertical page renders
- WHEN a user views the FAQ section
- THEN the FAQ MUST contain at least 3 questions phrased as natural language queries
- AND each FAQ answer MUST be unique to that industry

#### Scenario: Crawlable internal links

- GIVEN the vertical page
- WHEN rendered
- THEN it MUST link back to the hub page
- AND it MUST link to at least one other vertical page
- AND all links MUST be plain `<a>` elements (not JS-only navigation)

#### Scenario: Non-doorway content validation

- GIVEN two different vertical pages are compared
- WHEN their content is extracted
- THEN each page SHALL have at least 60% unique body text
- AND no block of text exceeding 50 words SHALL be identical between pages
