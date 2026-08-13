export async function onRequestGet(context) {
  const apiKey = context.env.TMDB_API_KEY;
  if (!apiKey) return json({ error: 'TMDB provider not configured', code: 'TMDB_API_KEY_MISSING' }, 503);

  const url = new URL(context.request.url);
  const mode = url.searchParams.get('mode') || 'popular';
  const page = Math.min(Math.max(Number(url.searchParams.get('page') || 1), 1), 20);
  const language = url.searchParams.get('language') || 'en-US';
  const region = url.searchParams.get('region') || 'IN';
  const base = 'https://api.themoviedb.org/3';
  const params = new URLSearchParams({ api_key: apiKey, language });
  let endpoint;

  if (mode === 'search') {
    const query = (url.searchParams.get('query') || '').trim();
    if (!query || query.length > 100) return json({ error: 'A valid search query is required' }, 400);
    endpoint = '/search/movie';
    params.set('query', query); params.set('page', String(page)); params.set('include_adult', 'false');
  } else if (mode === 'movie') {
    const id = (url.searchParams.get('id') || '').trim();
    if (!/^\d+$/.test(id)) return json({ error: 'A valid TMDB movie id is required' }, 400);
    endpoint = `/movie/${id}`;
    params.set('append_to_response', 'credits,videos,release_dates,watch/providers');
  } else if (mode === 'person') {
    const id = (url.searchParams.get('id') || '').trim();
    if (!/^\d+$/.test(id)) return json({ error: 'A valid TMDB person id is required' }, 400);
    endpoint = `/person/${id}`;
    params.set('append_to_response', 'combined_credits,external_ids');
  } else if (mode === 'person_search') {
    const query = (url.searchParams.get('query') || '').trim();
    if (!query || query.length > 100) return json({ error: 'A valid person search query is required' }, 400);
    endpoint = '/search/person';
    params.set('query', query); params.set('page', String(page)); params.set('include_adult', 'false');
  } else if (mode === 'trending') {
    endpoint = '/trending/movie/week';
  } else if (mode === 'now_playing') {
    endpoint = '/movie/now_playing'; params.set('page', String(page)); params.set('region', region);
  } else if (mode === 'upcoming') {
    endpoint = '/movie/upcoming'; params.set('page', String(page)); params.set('region', region);
  } else if (mode === 'top_rated') {
    endpoint = '/movie/top_rated'; params.set('page', String(page)); params.set('region', region);
  } else {
    endpoint = '/movie/popular'; params.set('page', String(page)); params.set('region', region);
  }

  try {
    const response = await fetch(`${base}${endpoint}?${params.toString()}`, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    return json({ error: 'TMDB request failed', details: String(error) }, 502);
  }
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
