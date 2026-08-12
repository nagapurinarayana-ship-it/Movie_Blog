# MovieBlog V2 — Phase 4: Trending Radar

## Goal
Turn fresh India search spikes into a ranked entertainment-content opportunity queue without paying for a keyword platform and without auto-publishing.

## Implementation
- Server-side Google Trends Trending Now RSS adapter at `/api/trends`.
- India (`IN`) is the initial region.
- Cached responses reduce repeated upstream requests.
- Client dashboard at `/pages/trending.html`.
- Entertainment relevance classifier and 0–100 opportunity score.
- Filters for high-opportunity and possible-opportunity trends.
- Direct link back to the Google Trends source.
- No automatic article generation or publishing.

## Why RSS
Google Trends Trending Now supports exporting filtered trend data as RSS. Google documents that Trending Now data is refreshed on average every ten minutes and supports recent windows such as 4 hours, 24 hours, 48 hours and 7 days.

## Guardrails
- Trend signals are discovery inputs, not verified facts.
- MovieBlog should research and verify a topic before publishing.
- Do not infer causality from a search spike alone.
- Do not scrape competitor sites as a data source.
- Keep the dashboard useful even when the upstream feed is unavailable.
