(() => {
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  function normalize(movie) {
    return {
      ...movie,
      id: movie.id || movie.imdbID || `${movie.title || movie.name || 'movie'}-${movie.year || ''}`,
      title: movie.title || movie.name || 'Untitled',
      poster: movie.poster || (movie.poster_path ? IMAGE_BASE + movie.poster_path : ''),
      overview: movie.overview || movie.plot || movie.description || '',
      releaseDate: String(movie.releaseDate || movie.release_date || movie.year || ''),
      rating: Number(movie.rating || movie.vote_average || movie.imdbRating || 0),
      runtime: Number(movie.runtime || movie.runtimeMinutes || 0),
      cast: Array.isArray(movie.cast) ? movie.cast : [],
      genres: Array.isArray(movie.genres) ? movie.genres : []
    };
  }

  async function request(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return response.json();
  }

  async function popular(page = 1) {
    const data = await request(`./api/tmdb?mode=popular&page=${encodeURIComponent(page)}&language=en-US`);
    return Array.isArray(data.results) ? data.results.map(normalize) : [];
  }

  async function search(query, page = 1) {
    const data = await request(`./api/tmdb?mode=search&query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}&language=en-US`);
    return Array.isArray(data.results) ? data.results.map(normalize) : [];
  }

  window.MovieBlogDataProvider = { normalize, popular, search };

  const originalFetch = window.fetch.bind(window);

  async function enrichMoviePosters(movies) {
    return Promise.all(movies.map(async movie => {
      if (movie.poster || movie.poster_path) return movie;
      try {
        const data = await search(movie.title, 1);
        const match = data.find(item => String(item.title).toLowerCase() === String(movie.title).toLowerCase()) || data[0];
        if (match?.poster) return { ...movie, poster: match.poster, poster_path: match.poster_path || '' };
      } catch (_) {}
      return movie;
    }));
  }

  window.fetch = async (input, init) => {
    const requestUrl = typeof input === 'string' ? input : input?.url || '';

    if (requestUrl.includes('/data/movies.json')) {
      const response = await originalFetch(input, init);
      if (!response.ok) return response;
      try {
        const data = await response.clone().json();
        const movies = Array.isArray(data) ? data : [];
        const enriched = await enrichMoviePosters(movies);
        return new Response(JSON.stringify(enriched), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
      } catch (_) {
        return response;
      }
    }

    // Compatibility bridge for the old fallback loader.
    if (requestUrl.includes('api.sampleapis.com/movies/')) {
      try {
        const movies = await popular(1);
        return new Response(JSON.stringify(movies), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (_) {
        return new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return originalFetch(input, init);
  };
})();
