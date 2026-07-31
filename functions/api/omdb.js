export async function onRequestGet(context) {
  const apiKey = context.env.OMDB_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OMDB API key not configured" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const incomingUrl = new URL(context.request.url);
    const params = new URLSearchParams(incomingUrl.searchParams);

    // Whitelist accepted parameters to avoid abuse
    const allowed = new Set(['s', 'i', 'page', 'type', 'y', 'plot']);

    // Validate and clean params
    for (const key of Array.from(params.keys())) {
      if (!allowed.has(key)) {
        params.delete(key);
      }
    }

    // Validate search length
    const s = params.get('s') || '';
    if (s && s.length > 100) {
      return new Response(JSON.stringify({ error: 'Search query too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Attach apikey from environment
    params.set('apikey', apiKey);

    const omdbUrl = `https://www.omdbapi.com/?${params.toString()}`;

    // Simple retry for transient failures (1 retry)
    let response;
    try {
      response = await fetch(omdbUrl);
    } catch (err) {
      // retry once
      try {
        response = await fetch(omdbUrl);
      } catch (err2) {
        return new Response(JSON.stringify({ error: 'Upstream request failed', details: String(err2) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (!response.ok) {
      // Propagate upstream status
      const text = await response.text();
      return new Response(JSON.stringify({ error: 'OMDb request failed', status: response.status, details: text }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
