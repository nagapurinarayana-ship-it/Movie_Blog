// Netlify-style serverless function
// Place under netlify/functions or deploy as-is to Netlify functions folder mapping
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async function(event) {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: 'OMDB API key not configured' }) };
  }

  const qs = event.queryStringParameters || {};
  const params = new URLSearchParams({ apikey: key, ...qs });
  const url = `http://www.omdbapi.com/?${params.toString()}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' },
      body: JSON.stringify(json),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream request failed', details: err.message }) };
  }
};
