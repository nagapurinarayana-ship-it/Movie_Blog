# MovieBlog

MovieBlog is a fast, mobile-first entertainment platform built with modern HTML, CSS and vanilla JavaScript.

## Current capabilities

- Movie discovery, search and favorites
- Movie, actor and director entity pages
- Box-office and OTT data models
- Server-side TMDB provider integration with client-side key protection
- India Trending Radar using Google Trends signals
- News/article pages with entity linking and `NewsArticle` structured data
- Controlled monetization hooks with ads disabled by default
- PWA/offline support
- Sitemap, robots.txt, canonical metadata and SEO validation
- Automated daily data/schema and SEO quality checks through GitHub Actions

## Operating principle

MovieBlog separates discovery from publication. Trend signals and provider data are inputs; editorial content and sensitive figures are published only after source verification.

## Zero-budget direction

The initial architecture avoids paid SEO subscriptions and premium infrastructure. External providers must be used within their current terms and licensing requirements.

## Deployment

The project is designed for GitHub Pages/project-site deployment under `/Movie_Blog/` and can also be hosted on another static platform that supports the configured server-side functions.

See `docs/MOVIEBLOG_OPERATIONS.md` for publishing and maintenance rules.
