// Vercel-style serverless API route (api/omdb.js)
// Deploy to Vercel or any host that supports /api routes.
export default async function handler(req, res) {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'OMDB API key not configured' });
    return;
  }

  const qs = { ...(req.query || {}) };
  const params = new URLSearchParams({ apikey: key, ...qs });
  const url = `http://www.omdbapi.com/?${params.toString()}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'max-age=60');
    res.status(200).json(json);
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed', details: err.message });
  }
}
