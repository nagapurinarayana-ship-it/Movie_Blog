# MovieBlog Operations

## Data flow

MovieBlog separates data acquisition from publishing. Provider-backed movie metadata may be refreshed automatically, but editorial articles, box-office figures and OTT availability require an approved source before being added to the public datasets.

## Scheduled quality checks

`.github/workflows/movieblog-quality.yml` runs on pushes, pull requests, a daily schedule, and manual dispatch. It validates the JSON data contracts and checks that indexable routes contain title/description/canonical metadata and that the sitemap/robots files remain aligned.

## Publishing rules

- Do not scrape competitor sites or republish their articles verbatim.
- Do not invent box-office figures, release dates, cast information or OTT availability.
- Keep source provenance in the relevant dataset when a value comes from an external provider.
- Keep provider keys server-side only.
- Review trend signals before turning them into editorial content.
- Keep advertising disabled until a real provider/account is configured.

## Content workflow

Trending Radar → research → source verification → original article → entity linking → human review → publish.

## SEO operations

After significant launches, submit the sitemap in Google Search Console and inspect representative movie, actor, director, news and trending URLs. Recheck canonical URLs whenever the deployment domain or URL structure changes.
