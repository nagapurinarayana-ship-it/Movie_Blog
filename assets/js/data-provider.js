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
})();
