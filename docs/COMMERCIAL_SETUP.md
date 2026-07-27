# Movie Hub — Commercial / AdSense Setup

This branch adds a serverless OMDb proxy, AdSense placeholders, a privacy page, and a cookie-consent banner to prepare the site for commercial deployment.

Files added:
- functions/omdb-proxy.js  (Netlify-style)
- api/omdb.js               (Vercel-style)
- static/js/omdb-client.js  (client helper)
- static/js/cookie-consent.js
- pages/privacy.html
- pages/about.html (updated to include ad placeholder and consent loader)
- .env.example

Deployment notes:
- Set OMDB_API_KEY in your host environment (Netlify/Vercel/Render).
  - Netlify: set in Site settings > Build & deploy > Environment.
  - Vercel: set in Project Settings > Environment Variables.
- Set AdsSense publisher ID in pages/about.html or change the config block to supply it via a generated config at build time.

AdSense & policy notes:
- Replace ca-pub-XXXXXXXX and data-ad-slot values with your AdSense account values.
- Ensure your site complies with AdSense program policies and has sufficient content for approval.

If you'd like, I can open a PR from enhancement/commercial-adsense into your default branch with these changes.
