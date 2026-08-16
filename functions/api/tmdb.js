export async function onRequestGet(context) {
  const apiKey = context.env.TMDB_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'TMDB provider not configured', code: 'TMDB_API_KEY_MISSING' }), { status: 503, headers: { 'Content-Type': 'application/json' } });

  const url = new URL(context.request.url);
  const mode = url.searchParams.get('mode') || 'popular';
  const page = Math.min(Math.max(Number(url.searchParams.get('page') || 1), 1), 20);
  const language = url.searchParams.get('language') || 'en-US';
  const region = url.searchParams.get('region') || 'IN';
  const originalLanguage = url.searchParams.get('original_language') || '';
  const base = 'https://api.themoviedb.org/3';
  let endpoint;
  const params = new URLSearchParams({ api_key: apiKey, language });

  if (mode === 'search') {
    const query = (url.searchParams.get('query') || '').trim();
    if (!query || query.length > 100) return new Response(JSON.stringify({ error: 'A valid search query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    endpoint = '/search/movie'; params.set('query', query); params.set('page', String(page)); params.set('include_adult', 'false');
  } else if (mode === 'movie') {
    const id = (url.searchParams.get('id') || '').trim();
    if (!/^\d+$/.test(id)) return new Response(JSON.stringify({ error: 'A valid TMDB movie id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    endpoint = `/movie/${id}`; params.set('append_to_response', 'credits,videos,release_dates,watch/providers');
  } else if (mode === 'person') {
    const id = (url.searchParams.get('id') || '').trim();
    if (!/^\d+$/.test(id)) return new Response(JSON.stringify({ error: 'A valid TMDB person id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    endpoint = `/person/${id}`; params.set('append_to_response', 'combined_credits,images');
  } else if (mode === 'person_search') {
    const query = (url.searchParams.get('query') || '').trim();
    if (!query || query.length > 100) return new Response(JSON.stringify({ error: 'A valid person search query is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    endpoint = '/search/person'; params.set('query', query); params.set('page', String(page)); params.set('include_adult', 'false');
  } else if (mode === 'trending') {
    endpoint = '/trending/movie/week';
  } else if (mode === 'regional') {
    endpoint = '/discover/movie';
    params.set('page', String(page)); params.set('region', region); params.set('sort_by', 'popularity.desc'); params.set('include_adult', 'false'); params.set('include_video', 'false');
    if (originalLanguage) params.set('with_original_language', originalLanguage);
  } else if (mode === 'streaming') {
    endpoint = '/discover/movie';
    params.set('page', String(page)); params.set('region', region); params.set('watch_region', 'IN'); params.set('with_watch_monetization_types', 'flatrate'); params.set('sort_by', 'popularity.desc'); params.set('include_adult', 'false'); params.set('include_video', 'false');
  } else if (mode === 'now_playing') { endpoint = '/movie/now_playing'; params.set('page', String(page)); params.set('region', region); }
  else if (mode === 'upcoming') { endpoint = '/movie/upcoming'; params.set('page', String(page)); params.set('region', region); }
  else if (mode === 'top_rated') { endpoint = '/movie/top_rated'; params.set('page', String(page)); params.set('region', region); }
  else { endpoint = '/movie/popular'; params.set('page', String(page)); params.set('region', region); }

  try {
    const response = await fetch(`${base}${endpoint}?${params.toString()}`, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    return new Response(text, { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'TMDB request failed', details: String(error) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}
