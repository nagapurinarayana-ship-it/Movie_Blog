// Client helper to call the serverless OMDb proxy.
// By default it calls /api/omdb (Vercel). If you deploy to Netlify, change path to '/.netlify/functions/omdb-proxy'.

export async function fetchFromOmdb(params = {}) {
  const qs = new URLSearchParams(params).toString();
  // Default to Vercel-style route. Change if you deploy to Netlify: '/.netlify/functions/omdb-proxy'
  const base = '/api/omdb';
  const res = await fetch(`${base}?${qs}`);
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error('OMDb proxy request failed: ' + (text || res.status));
  }
  return res.json();
}
