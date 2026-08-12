# MovieBlog V2 — Phase 3

## Delivered
- Added a server-side TMDB adapter at `functions/api/tmdb.js`.
- Added a client-side provider adapter at `assets/js/data-provider.js`.
- Kept the local JSON catalog as the first data source.
- Routed the legacy empty-catalog fallback through MovieBlog's provider instead of a demo movie dataset.
- Added an explicit data-source/license registry in `data/data-sources.json`.
- Added Box Office and OTT hub pages.
- Added Box Office and OTT routes to the sitemap.
- Updated the PWA cache manifest for Phase 3 assets.
- Added TMDB attribution and a commercial-license warning to the homepage.

## Data rules
- No API keys are committed to Git.
- TMDB is only enabled for projects permitted under its applicable developer terms; its free API is not assumed to be valid for a revenue-generating deployment.
- Wikidata is planned for supplemental structured facts; its structured data is CC0.
- Box-office figures must be sourced/approved before publication and should be labeled when estimated or reported.

## Not included yet
- Automated Google Trends ingestion.
- Large-scale box-office historical ingestion.
- News/content publishing pipeline.
- Automated actor/director enrichment from external sources.
