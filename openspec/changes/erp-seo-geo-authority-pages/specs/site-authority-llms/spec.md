# Site Authority for LLMs Specification

## Purpose

Expose site structure and capabilities to AI crawlers via `llms.txt`, enabling discoverability and citation in generative engine responses.

## Requirements

### Requirement: llms.txt File

The system MUST serve an `llms.txt` file at the site root conforming to the `llms.txt` community standard.

| Property | Value |
|----------|-------|
| Path | `/llms.txt` |
| Format | Plain text, UTF-8 |
| Content-Type | `text/plain` in production; local static file MUST be UTF-8 plain text |
| HTTP status | MUST return 200 in production |

#### Scenario: Root-level resolution

- GIVEN an AI crawler requests `https://octopustrack.shop/llms.txt`
- WHEN the file resolves
- THEN it MUST return HTTP 200 with `Content-Type: text/plain`
- AND this production HTTP header check MUST be verified after deployment

#### Scenario: Site structure disclosure

- GIVEN the `llms.txt` file is read
- WHEN parsed
- THEN it MUST include a one-line summary of the product
- AND it MUST list the absolute URL of the hub page (`/industrias/`)
- AND it MUST list the absolute URL of every vertical page (`/industrias/ferreterias/`, `/industrias/sanitarios/`, `/industrias/electricidad/`)

#### Scenario: Summary accuracy

- GIVEN the product summary in `llms.txt`
- WHEN extracted
- THEN it SHALL accurately describe what OctopusTrack does in 2-3 sentences
- AND it MUST NOT include promotional filler or keyword stuffing

### Requirement: Crawlable Entry Points

Every URL listed in `llms.txt` MUST resolve to a valid, indexable page.

- GIVEN a crawler fetches each URL listed in `llms.txt`
- WHEN the page is requested
- THEN it MUST return HTTP 200
- AND the page MUST NOT be blocked by `robots.txt` or `noindex`
