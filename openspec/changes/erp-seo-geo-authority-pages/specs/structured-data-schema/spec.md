# Structured Data Schema Specification

## Purpose

Inject machine-readable schema.org markup on industry pages to qualify for rich results and improve entity understanding.

## Requirements

### Requirement: Per-Page @graph Bundle

Every hub and vertical page MUST embed a JSON-LD `@graph` block. Vertical pages MUST include `SoftwareApplication`, `Organization`, `BreadcrumbList`, and `FAQPage` types. Hub pages MUST include `SoftwareApplication`, `Organization`, and `BreadcrumbList`, and MAY include `FAQPage` only when visible hub FAQs exist on the page.

| Property | Value |
|----------|-------|
| Format | JSON-LD in `<script type="application/ld+json">` |
| Structure | Single `@graph` array with 3–4 items depending on page type |
| Placement | `<head>` or end of `<body>` |
| Validation | MUST pass local JSON-LD structural validation; production URLs SHOULD pass Google Rich Results Test with zero errors post-deploy |

#### Scenario: SoftwareApplication schema

- GIVEN the `@graph` is parsed
- WHEN the `SoftwareApplication` entry is inspected
- THEN it MUST include `name`, `applicationCategory` (e.g. `"BusinessApplication"`), and `operatingSystem`
- AND it MUST NOT include `offers` unless a matching visible offer is present on the page
- AND `applicationCategory` MAY vary per industry context if applicable

#### Scenario: Organization schema

- GIVEN the `@graph` is parsed
- WHEN the `Organization` entry is inspected
- THEN it MUST include `name`, `url`, and `logo`
- AND it SHOULD include `sameAs` links to verified social profiles

#### Scenario: BreadcrumbList schema

- GIVEN the `@graph` is parsed
- WHEN the `BreadcrumbList` entry is inspected
- THEN it MUST include `itemListElement` with at least 2 items
- AND each list item MUST have `position`, `name`, and `item` properties
- AND `item` values MUST be absolute URLs

#### Scenario: FAQPage schema

- GIVEN a vertical page's `@graph` is parsed
- WHEN the `FAQPage` entry is inspected
- THEN it MUST include `mainEntity` as an array of `Question` objects
- AND each `Question` MUST have `name` and `acceptedAnswer` with `text`
- AND the number of FAQ items MUST match the visible FAQ section on the page

#### Scenario: Hub page FAQ exclusion

- GIVEN the hub page at `/industrias/`
- WHEN its `@graph` is parsed
- THEN the hub page MUST include `SoftwareApplication`, `Organization`, and `BreadcrumbList`
- AND it MAY omit `FAQPage`
- AND it SHALL NOT reference FAQ items that do not appear on the page

### Requirement: Schema-Page Content Consistency

The schema MUST NOT reference content absent from the rendered page.

- GIVEN the page is rendered in a browser
- WHEN comparing schema content to visible page content
- THEN every FAQ question in the schema MUST appear as visible text
- AND every breadcrumb label MUST match visible navigation text
