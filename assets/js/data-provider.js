(() => {
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const API_BASE = './api/tmdb';

  function normalize(movie) {
    return {
      ...movie,
      id: movie?.id || movie?.imdbID || `${movie?.title || movie?.name || 'movie'}-${movie?.year || ''}`,
      title: movie?.title || movie?.name || 'Untitled',
      poster: movie?.poster || (movie?.poster_path ? IMAGE_BASE + movie.poster_path : ''),
      overview: movie?.overview || movie?.plot || movie?.description || movie?.biography || '',
      releaseDate: String(movie?.releaseDate || movie?.release_date || movie?.first_air_date || movie?.year || ''),
      rating: Number(movie?.rating || movie?.vote_average || movie?.imdbRating || 0),
      runtime: Number(movie?.runtime || movie?.runtimeMinutes || 0),
      genres: Array.isArray(movie?.genres) ? movie.genres : [],
      backdrop: movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : ''
    };
  }

  async function request(params) {
    const query = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return response.json();
  }

  async function popular(page = 1) {
    const data = await request({ mode: 'popular', page, language: 'en-US', region: 'IN' });
    return Array.isArray(data.results) ? data.results.map(normalize) : [];
  }

  async function trending() {
    const data = await request({ mode: 'trending', language: 'en-US' });
    return Array.isArray(data.results) ? data.results.map(normalize) : [];
  }

  async function search(query, page = 1) {
    const data = await request({ mode: 'search', query, page, language: 'en-US' });
    return Array.isArray(data.results) ? data.results.map(normalize) : [];
  }

  async function movie(id) {
    const data = await request({ mode: 'movie', id, language: 'en-US' });
    const normalized = normalize(data);
    normalized.cast = Array.isArray(data.credits?.cast) ? data.credits.cast.slice(0, 24).map(person => ({ id: person.id, name: person.name, character: person.character, profile: person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '' })) : [];
    normalized.directors = Array.isArray(data.credits?.crew) ? data.credits.crew.filter(person => person.job === 'Director').map(person => ({ id: person.id, name: person.name })) : [];
    normalized.videos = Array.isArray(data.videos?.results) ? data.videos.results : [];
    normalized.providers = data['watch/providers']?.results?.IN || null;
    return normalized;
  }

  async function person(id) {
    const data = await request({ mode: 'person', id, language: 'en-US' });
    return {
      ...data,
      id: data.id,
      name: data.name || 'Unknown',
      biography: data.biography || '',
      profile: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : '',
      knownFor: Array.isArray(data.combined_credits?.cast) ? data.combined_credits.cast.slice(0, 30).map(normalize) : [],
      crew: Array.isArray(data.combined_credits?.crew) ? data.combined_credits.crew.slice(0, 30).map(normalize) : []
    };
  }

  window.MovieBlogDataProvider = { normalize, popular, trending, search, movie, person };
})();
