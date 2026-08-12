/* MovieBlog V2 — Phase 1 client behavior */
(() => {
  const LOCAL_DATA_URL = './data/movies.json';
  const LOCAL_GENRE_URL = './data/genres.json';
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const pageSize = 20;

  let movies = [];
  let genres = [];
  let filtered = [];
  let page = 0;
  let loading = false;
  let sentinel = null;
  let observer = null;

  const grid = document.getElementById('movieGrid');
  const loadingEl = document.getElementById('loading');
  const searchBox = document.getElementById('searchBox');
  const suggestions = document.getElementById('suggestions');
  const filterGenre = document.getElementById('filterGenre');
  const sortBy = document.getElementById('sortBy');
  const scrollTop = document.getElementById('scrollTop');
  const favBtn = document.getElementById('favBtn');
  const cardTemplate = document.getElementById('cardTemplate');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  const LS_FAV = 'movieblog:favorites:v2';
  const LS_THEME = 'movieblog:theme:v2';
  let favorites = new Set();
  try { favorites = new Set(JSON.parse(localStorage.getItem(LS_FAV) || '[]')); } catch (_) {}

  function saveFavs() { localStorage.setItem(LS_FAV, JSON.stringify([...favorites])); }
  function movieUrl(id) { return `./pages/movie.html?id=${encodeURIComponent(id)}`; }
  function formatMeta(m) { return `${m.releaseDate || 'Release TBA'} • ${m.runtime || 0} min • ⭐ ${m.rating || 0}`; }

  function createCard(movie) {
    const tpl = cardTemplate.content.cloneNode(true);
    const article = tpl.querySelector('article');
    const img = tpl.querySelector('.poster');
    const title = tpl.querySelector('.title');
    const meta = tpl.querySelector('.meta');
    const overview = tpl.querySelector('.overview');
    const fav = tpl.querySelector('.fav-toggle');

    article.dataset.id = movie.id;
    article.setAttribute('aria-label', `Open ${movie.title}`);
    img.src = movie.poster || (movie.poster_path ? TMDB_IMAGE_BASE + movie.poster_path : './assets/placeholder.png');
    img.alt = `${movie.title} poster`;
    title.textContent = movie.title || 'Untitled';
    meta.textContent = formatMeta(movie);
    overview.textContent = movie.overview || 'Movie information will be added soon.';

    if (favorites.has(movie.id)) {
      fav.textContent = '❤️';
      fav.setAttribute('aria-pressed', 'true');
    }
    fav.addEventListener('click', (event) => {
      event.stopPropagation();
      if (favorites.has(movie.id)) {
        favorites.delete(movie.id);
        fav.textContent = '♡';
        fav.setAttribute('aria-pressed', 'false');
      } else {
        favorites.add(movie.id);
        fav.textContent = '❤️';
        fav.setAttribute('aria-pressed', 'true');
      }
      saveFavs();
    });

    const open = () => { window.location.href = movieUrl(movie.id); };
    article.addEventListener('click', open);
    article.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
    return tpl;
  }

  function ensureSentinel() {
    if (sentinel && sentinel.isConnected) return;
    sentinel = document.createElement('div');
    sentinel.id = 'loadMoreSentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    grid.appendChild(sentinel);
    if ('IntersectionObserver' in window) {
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) renderPage();
      }, { rootMargin: '500px' });
      observer.observe(sentinel);
    }
  }

  function renderPage() {
    if (loading) return;
    const start = page * pageSize;
    const slice = filtered.slice(start, start + pageSize);
    if (!slice.length) {
      loadingEl.style.display = page === 0 ? 'block' : 'none';
      if (page === 0) loadingEl.textContent = movies.length ? 'No movies match this search.' : 'No movies are available yet.';
      return;
    }

    loading = true;
    loadingEl.style.display = 'block';
    const frag = document.createDocumentFragment();
    slice.forEach(movie => frag.appendChild(createCard(movie)));
    grid.insertBefore(frag, loadingEl);
    page += 1;
    loading = false;

    if (page * pageSize >= filtered.length) {
      loadingEl.style.display = 'none';
      observer?.disconnect();
    } else {
      loadingEl.style.display = 'block';
      loadingEl.textContent = 'Loading more…';
      ensureSentinel();
    }
  }

  function resetPagination() {
    observer?.disconnect();
    sentinel = null;
    page = 0;
    grid.innerHTML = '';
    grid.appendChild(loadingEl);
    loadingEl.textContent = 'Loading movies…';
    renderPage();
    if (filtered.length > pageSize) ensureSentinel();
  }

  function applyFilters() {
    const genre = filterGenre.value;
    const sort = sortBy.value;
    filtered = movies.slice();
    if (genre !== 'all') filtered = filtered.filter(movie => (movie.genres || []).includes(genre));
    if (sort === 'latest') filtered.sort((a, b) => String(b.releaseDate || '').localeCompare(String(a.releaseDate || '')));
    if (sort === 'rating') filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    resetPagination();
  }

  function applyTextFilter(query) {
    const q = query.toLowerCase();
    filtered = movies.filter(movie => [movie.title, movie.overview, ...(movie.cast || []), ...(movie.genres || [])].join(' ').toLowerCase().includes(q));
    resetPagination();
  }

  function populateGenres() {
    filterGenre.innerHTML = '<option value="all">All Genres</option>';
    const values = genres.map(g => typeof g === 'string' ? g : g?.name).filter(Boolean);
    [...new Set(values)].sort().forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      filterGenre.appendChild(option);
    });
  }

  function normalizeMovie(movie) {
    return {
      ...movie,
      id: movie.id || movie.imdbID || `${movie.title || 'movie'}-${movie.year || ''}`,
      title: movie.title || movie.name || 'Untitled',
      poster: movie.poster || movie.posterURL || movie.poster_path || movie.imageUrl || '',
      overview: movie.overview || movie.plot || movie.description || movie.storyline || '',
      releaseDate: String(movie.releaseDate || movie.release_date || movie.year || ''),
      rating: Number(movie.rating || movie.vote_average || movie.imdbRating || 0),
      runtime: Number(movie.runtime || movie.runtimeMinutes || 0),
      cast: Array.isArray(movie.cast) ? movie.cast : (Array.isArray(movie.actors) ? movie.actors : []),
      genres: Array.isArray(movie.genres) ? movie.genres : (Array.isArray(movie.genre) ? movie.genre : [])
    };
  }

  async function loadLocalData() {
    const [dataResponse, genreResponse] = await Promise.all([fetch(LOCAL_DATA_URL, { cache: 'no-store' }), fetch(LOCAL_GENRE_URL, { cache: 'no-store' })]);
    if (!dataResponse.ok) throw new Error('Local movie data unavailable');
    const data = await dataResponse.json();
    const genreData = genreResponse.ok ? await genreResponse.json() : [];
    return { data: Array.isArray(data) ? data : [], genres: Array.isArray(genreData) ? genreData : [] };
  }

  async function fetchFromSampleAPIs() {
    const endpoints = ['https://api.sampleapis.com/movies/action','https://api.sampleapis.com/movies/drama','https://api.sampleapis.com/movies/comedy'];
    const responses = await Promise.allSettled(endpoints.map(url => fetch(url)));
    const all = [];
    for (const result of responses) {
      if (result.status !== 'fulfilled' || !result.value.ok) continue;
      try {
        const data = await result.value.json();
        if (Array.isArray(data)) all.push(...data.map(normalizeMovie));
      } catch (_) {}
    }
    const seen = new Set();
    return all.filter(movie => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });
  }

  function featuredMovie() {
    const target = document.getElementById('featured');
    const pick = movies[0];
    if (!target || !pick) return;
    target.innerHTML = '';
    const hero = document.createElement('div');
    hero.className = 'hero-card';
    const img = document.createElement('img');
    img.src = pick.poster || './assets/placeholder.png';
    img.alt = `${pick.title} poster`;
    img.loading = 'eager';
    const body = document.createElement('div');
    body.className = 'hero-card-body';
    const heading = document.createElement('h3');
    heading.textContent = pick.title;
    const meta = document.createElement('p');
    meta.textContent = `⭐ ${pick.rating || 0} • ${pick.releaseDate || 'Release TBA'}`;
    const text = document.createElement('p');
    text.textContent = pick.overview || 'Explore the movie details on MovieBlog.';
    const link = document.createElement('a');
    link.className = 'icon-btn';
    link.href = movieUrl(pick.id);
    link.textContent = 'View details';
    body.append(heading, meta, text, link);
    hero.append(img, body);
    target.appendChild(hero);
  }

  async function load() {
    try {
      let local = { data: [], genres: [] };
      try { local = await loadLocalData(); } catch (_) {}
      if (local.data.length) {
        movies = local.data.map(normalizeMovie);
        genres = local.genres;
      } else {
        movies = await fetchFromSampleAPIs();
        genres = [...new Set(movies.flatMap(movie => movie.genres || []))].sort();
      }
      populateGenres();
      filtered = movies.slice();
      featuredMovie();
      resetPagination();
    } catch (error) {
      loadingEl.textContent = 'Movies could not be loaded. Please try again.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Try again';
      retry.className = 'icon-btn';
      retry.addEventListener('click', () => load());
      loadingEl.appendChild(retry);
      console.error(error);
    }
  }

  searchBox?.addEventListener('input', (event) => {
    const q = event.target.value.trim().toLowerCase();
    if (!q) {
      suggestions.style.display = 'none';
      suggestions.innerHTML = '';
      applyFilters();
      return;
    }
    const matches = movies.filter(movie => [movie.title, ...(movie.cast || []), ...(movie.genres || [])].join(' ').toLowerCase().includes(q)).slice(0, 8);
    suggestions.innerHTML = '';
    matches.forEach(movie => {
      const item = document.createElement('li');
      item.textContent = `${movie.title}${movie.releaseDate ? ` (${movie.releaseDate})` : ''}`;
      item.tabIndex = 0;
      item.addEventListener('click', () => { window.location.href = movieUrl(movie.id); });
      item.addEventListener('keydown', event => { if (event.key === 'Enter') window.location.href = movieUrl(movie.id); });
      suggestions.appendChild(item);
    });
    suggestions.style.display = matches.length ? 'block' : 'none';
    applyTextFilter(q);
  });

  suggestions?.addEventListener('keydown', event => { if (event.key === 'Escape') { suggestions.style.display = 'none'; searchBox?.focus(); } });
  filterGenre?.addEventListener('change', applyFilters);
  sortBy?.addEventListener('change', applyFilters);

  menuToggle?.addEventListener('click', () => {
    const open = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  themeToggle?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', String(light));
    localStorage.setItem(LS_THEME, light ? 'light' : 'dark');
  });
  if (localStorage.getItem(LS_THEME) === 'light') {
    document.body.classList.add('light');
    themeToggle?.setAttribute('aria-pressed', 'true');
  }

  window.addEventListener('scroll', () => { if (scrollTop) scrollTop.style.display = window.scrollY > 500 ? 'block' : 'none'; }, { passive: true });
  scrollTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  favBtn?.addEventListener('click', event => { event.preventDefault(); window.location.href = './pages/search.html?fav=1'; });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  document.addEventListener('DOMContentLoaded', load);
})();
