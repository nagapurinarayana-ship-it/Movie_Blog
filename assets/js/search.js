// assets/js/search.js
(() => {
  const MIN_CHARS = 3;
  const DEBOUNCE_MS = 500;
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const inputEl = document.querySelector('#searchBox');
  const suggestionsEl = document.querySelector('#suggestions');
  const gridEl = document.querySelector('#movieGrid');
  const template = document.querySelector('#cardTemplate');
  const loadingEl = document.querySelector('#loading');
  const loadMoreBtn = document.querySelector('#loadMore');
  const spinnerEl = document.querySelector('#spinner');
  const favCountEl = document.querySelector('#fav-count');

  if (!inputEl || !gridEl || !template) return;

  let currentQuery = '';
  let currentPage = 1;
  let inflight = null;

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function cacheKey(q, page = 1) {
    return `cache:${q}:p${page}`;
  }

  function getCached(q, page = 1) {
    try {
      const raw = sessionStorage.getItem(cacheKey(q, page));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL_MS) {
        sessionStorage.removeItem(cacheKey(q, page));
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function setCached(q, page, data) {
    try {
      sessionStorage.setItem(cacheKey(q, page), JSON.stringify({ ts: Date.now(), data }));
    } catch (e) { /* ignore */ }
  }

  const favoritesKey = 'movie_blog:favorites';

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    } catch (e) { return []; }
  }

  function saveFavorites(list) {
    localStorage.setItem(favoritesKey, JSON.stringify(list));
    renderFavCount();
  }

  function toggleFavorite(movie) {
    const favs = getFavorites();
    const idx = favs.findIndex(m => m.imdbID === movie.imdbID);
    if (idx === -1) {
      favs.unshift(movie);
    } else {
      favs.splice(idx, 1);
    }
    saveFavorites(favs);
  }

  function isFavorite(imdbID) {
    return getFavorites().some(f => f.imdbID === imdbID);
  }

  function renderFavCount() {
    if (!favCountEl) return;
    const count = getFavorites().length;
    favCountEl.textContent = count > 0 ? `(${count})` : '';
  }

  function createCard(movie) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('article');
    const img = node.querySelector('.poster');
    const favBtn = node.querySelector('.fav-toggle');
    const titleEl = node.querySelector('.title');
    const metaEl = node.querySelector('.meta');
    const overviewEl = node.querySelector('.overview');

    if (img) {
      img.src = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/assets/no-poster.png';
      img.alt = `${movie.Title} poster`;
    }
    if (titleEl) titleEl.textContent = movie.Title;
    if (metaEl) metaEl.textContent = `${movie.Year} • ${movie.Type}`;
    if (overviewEl) overviewEl.textContent = movie.Plot || '';
    if (favBtn) {
      favBtn.dataset.id = movie.imdbID;
      favBtn.setAttribute('aria-pressed', isFavorite(movie.imdbID) ? 'true' : 'false');
      favBtn.textContent = isFavorite(movie.imdbID) ? '♥' : '♡';
    }
    // store imdb id on article for details
    if (article) article.dataset.id = movie.imdbID;
    return node;
  }

  function showSpinner(show) {
    if (!spinnerEl) return;
    spinnerEl.style.display = show ? 'block' : 'none';
  }

  async function fetchOmdb(q, page = 1) {
    if (!q || q.length < MIN_CHARS) return null;
    const cached = getCached(q, page);
    if (cached) return cached;

    if (inflight && inflight.query === q && inflight.page === page) {
      return inflight.promise;
    }

    const url = `/api/omdb?s=${encodeURIComponent(q)}&page=${page}`;
    const promise = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('OMDb proxy error');
      const data = await res.json();
      setCached(q, page, data);
      return data;
    })();

    inflight = { query: q, page, promise };
    try {
      const data = await promise;
      return data;
    } finally {
      if (inflight && inflight.query === q && inflight.page === page) inflight = null;
    }
  }

  function clearGrid() {
    // remove all child nodes except the template
    Array.from(gridEl.querySelectorAll('.card-instance')).forEach(n => n.remove());
  }

  async function doSearch(q, append = false) {
    if (q.length < MIN_CHARS) {
      loadingEl.innerHTML = `<p>Type ${MIN_CHARS}+ characters to search.</p>`;
      loadMoreBtn.style.display = 'none';
      return;
    }
    showSpinner(true);
    try {
      const data = await fetchOmdb(q, currentPage);
      showSpinner(false);
      if (!data || data.Response === 'False') {
        if (!append) {
          clearGrid();
          loadingEl.innerHTML = `<p>${data?.Error || 'No results'}</p>`;
        }
        loadMoreBtn.style.display = 'none';
        return;
      }
      loadingEl.innerHTML = '';
      const movies = data.Search || [];
      if (!append) clearGrid();
      movies.forEach(m => {
        // for each movie we only have Title, Year, imdbID, Type, Poster
        // fetch details lazily when opening modal; but we can reuse short info
        const movieShort = { ...m };
        // create from template and mark as instance
        const frag = createCard(movieShort);
        // add wrapper class to track instances
        const article = frag.querySelector('article');
        if (article) article.classList.add('card-instance');
        gridEl.insertBefore(frag, loadingEl);
      });

      // show/hide load more
      const total = parseInt(data.totalResults || '0', 10);
      const shown = currentPage * 10;
      loadMoreBtn.style.display = shown < total ? 'block' : 'none';
    } catch (err) {
      showSpinner(false);
      loadingEl.innerHTML = `<p class="error">Error: ${err.message}</p>`;
      loadMoreBtn.style.display = 'none';
    }
  }

  const debouncedSearch = debounce((q) => {
    currentQuery = q;
    currentPage = 1;
    doSearch(q, false);
  }, DEBOUNCE_MS);

  inputEl.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    debouncedSearch(q);
  });

  loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;
    await doSearch(currentQuery, true);
  });

  // delegation for fav and details
  gridEl.addEventListener('click', async (ev) => {
    const favBtn = ev.target.closest('.fav-toggle');
    const card = ev.target.closest('article.card');
    if (favBtn) {
      const id = favBtn.dataset.id;
      // try to read minimal data from DOM
      const title = card ? card.querySelector('.title')?.textContent : '';
      const yearText = card ? card.querySelector('.meta')?.textContent : '';
      const poster = card ? card.querySelector('.poster')?.src : '';
      toggleFavorite({ imdbID: id, Title: title, Year: yearText, Poster: poster });
      favBtn.setAttribute('aria-pressed', isFavorite(id) ? 'true' : 'false');
      favBtn.textContent = isFavorite(id) ? '♥' : '♡';
      return;
    }
    if (card && ev.target.closest('article.card')) {
      const id = card.dataset.id;
      if (id) openDetails(id);
    }
  });

  // open details modal
  async function openDetails(imdbID) {
    showSpinner(true);
    try {
      const res = await fetch(`/api/omdb?i=${encodeURIComponent(imdbID)}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      showSpinner(false);
      if (!data || data.Response === 'False') {
        alert('Could not load details: ' + (data?.Error || 'Unknown'));
        return;
      }
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true" aria-label="${escapeHtml(data.Title)}">
          <button class="close" aria-label="Close details">×</button>
          <div class="modal-grid">
            <img src="${data.Poster && data.Poster !== 'N/A' ? data.Poster : '/assets/no-poster.png'}" alt="${escapeHtml(data.Title)} poster" />
            <div class="modal-body">
              <h2>${escapeHtml(data.Title)} <small>(${escapeHtml(data.Year)})</small></h2>
              <p><strong>Genre:</strong> ${escapeHtml(data.Genre)}</p>
              <p><strong>Runtime:</strong> ${escapeHtml(data.Runtime)}</p>
              <p><strong>Rating:</strong> ${escapeHtml(data.imdbRating)} / 10</p>
              <p>${escapeHtml(data.Plot)}</p>
              <p><strong>Director:</strong> ${escapeHtml(data.Director)}</p>
              <p><strong>Actors:</strong> ${escapeHtml(data.Actors)}</p>
              <div class="modal-actions">
                <button class="modal-fav">${isFavorite(data.imdbID) ? 'Unsave' : 'Save'}</button>
                <a class="imdb-link" href="https://www.imdb.com/title/${escapeHtml(data.imdbID)}/" target="_blank" rel="noopener">View on IMDb</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      // focus trap: focus close button
      const closeBtn = modal.querySelector('.close');
      closeBtn.focus();

      function close() {
        modal.remove();
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
      closeBtn.addEventListener('click', close);
      modal.querySelector('.modal-fav').addEventListener('click', (e) => {
        toggleFavorite({ imdbID: data.imdbID, Title: data.Title, Year: data.Year, Poster: data.Poster });
        e.target.textContent = isFavorite(data.imdbID) ? 'Unsave' : 'Save';
        renderFavCount();
      });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', esc);
        }
      });
    } catch (err) {
      showSpinner(false);
      alert('Failed to load details: ' + err.message);
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  // init
  renderFavCount();
  // initial placeholder
  loadingEl.innerHTML = '<p>Type to search movies.</p>';
})();
