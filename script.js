/* Main JS for Movie Hub
   Features: fetch external API data (TMDb or sampleapis) or fallback to local JSON, render, search, suggestions, infinite scroll, favorites, lazy loading, PWA registration
*/
(() => {
  // If you want TMDb integration, add your API key to /data/config.json under "tmdbApiKey".
  const LOCAL_DATA_URL = '/data/movies.json';
  const LOCAL_GENRE_URL = '/data/genres.json';
  const CONFIG_URL = '/data/config.json';
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const pageSize = 20; // items per page for infinite scroll

  // state
  let movies = [];
  let genres = [];
  let filtered = [];
  let page = 0;
  let loading = false;

  // elements
  const grid = document.getElementById('movieGrid');
  const loadingEl = document.getElementById('loading');
  const searchBox = document.getElementById('searchBox');
  const suggestions = document.getElementById('suggestions');
  const filterGenre = document.getElementById('filterGenre');
  const sortBy = document.getElementById('sortBy');
  const scrollTop = document.getElementById('scrollTop');
  const favBtn = document.getElementById('favBtn');
  const cardTemplate = document.getElementById('cardTemplate');

  // localStorage keys
  const LS_FAV = 'mh:favorites:v1';

  const favorites = new Set(JSON.parse(localStorage.getItem(LS_FAV) || '[]'));

  function saveFavs(){
    localStorage.setItem(LS_FAV, JSON.stringify([...favorites]));
  }

  function formatMeta(m){
    return `${m.releaseDate} • ${m.runtime || 0} min • ⭐ ${m.rating}`;
  }

  function createCard(movie){
    const tpl = cardTemplate.content.cloneNode(true);
    const article = tpl.querySelector('article');
    article.setAttribute('data-id', movie.id);
    const img = tpl.querySelector('.poster');
    // support TMDb style image urls
    img.src = movie.poster || (movie.poster_path? (TMDB_IMAGE_BASE + movie.poster_path) : '/assets/placeholder.png');
    img.alt = `${movie.title} poster`;
    const t = tpl.querySelector('.title'); t.textContent = movie.title;
    const meta = tpl.querySelector('.meta'); meta.textContent = formatMeta(movie);
    const overview = tpl.querySelector('.overview'); overview.textContent = movie.overview || '';
    const fav = tpl.querySelector('.fav-toggle');
    fav.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(movie.id, fav);
    });
    if(favorites.has(movie.id)){
      fav.textContent = '❤️';
      fav.setAttribute('aria-pressed','true');
    }

    article.addEventListener('click', () => {
      // navigate to movie page
      window.location.href = `/pages/movie.html?id=${movie.id}`;
    });

    return tpl;
  }

  function toggleFavorite(id, btn){
    if(favorites.has(id)){
      favorites.delete(id);
      btn.textContent = '♡';
      btn.setAttribute('aria-pressed','false');
    } else {
      favorites.add(id);
      btn.textContent = '❤️';
      btn.setAttribute('aria-pressed','true');
    }
    saveFavs();
  }

  function renderPage(){
    if(loading) return;
    loading = true;
    loadingEl.style.display = 'block';
    const start = page * pageSize;
    const end = start + pageSize;
    const slice = filtered.slice(start,end);
    // append cards
    const frag = document.createDocumentFragment();
    slice.forEach(m => {
      frag.appendChild(createCard(m));
    });
    // remove loading placeholder to keep ARIA clear
    grid.insertBefore(frag, loadingEl);
    page++;
    loading = false;
    if(end >= filtered.length) {
      loadingEl.style.display = 'none';
    }
    observeImages();
  }

  // lazy load using IntersectionObserver
  let io;
  function observeImages(){
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    if('IntersectionObserver' in window){
      if(!io){
        io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if(entry.isIntersecting){
              const img = entry.target;
              if(img.dataset.src){ img.src = img.dataset.src; }
              io.unobserve(img);
            }
          });
        },{rootMargin:'200px'});
      }
      imgs.forEach(img => {
        if(img.dataset.src) io.observe(img);
      });
    }
  }

  // infinite scroll
  window.addEventListener('scroll', () => {
    if((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 600)){
      renderPage();
    }
    // show scroll top
    scrollTop.style.display = (window.scrollY>600)?'block':'none';
  }, {passive:true});

  scrollTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // search
  let suggestTimeout;
  searchBox.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if(q.length===0){ suggestions.style.display='none'; suggestions.innerHTML=''; resetFilter(); return; }
    const matches = movies.filter(m => ((m.title||'')+ ' ' + (m.cast||[]).join(' ') + ' ' + (m.genres||[]).join(' ')).toLowerCase().includes(q)).slice(0,8);
    suggestions.innerHTML = '';
    matches.forEach(m => {
      const li = document.createElement('li'); li.textContent = `${m.title} (${m.releaseDate})`; li.tabIndex=0;
      li.addEventListener('click', ()=>{ window.location.href = `/pages/movie.html?id=${m.id}` });
      suggestions.appendChild(li);
    });
    suggestions.style.display = matches.length? 'block':'none';

    clearTimeout(suggestTimeout);
    suggestTimeout = setTimeout(()=>{
      applyTextFilter(q);
    }, 250);
  });

  function applyTextFilter(q){
    filtered = movies.filter(m => ((m.title||'') + ' ' + (m.overview||'') + ' ' + (m.cast||[]).join(' ')).toLowerCase().includes(q));
    resetPagination();
  }

  suggestions.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ suggestions.style.display='none'; searchBox.focus(); }
  });

  // filtering and sorting
  filterGenre.addEventListener('change', ()=>{
    applyFilters();
  });
  sortBy.addEventListener('change', ()=>{
    applyFilters();
  });

  function applyFilters(){
    const g = filterGenre.value;
    const s = sortBy.value;
    filtered = movies.slice();
    if(g !== 'all') filtered = filtered.filter(m => (m.genres||[]).includes(g));
    if(s === 'latest') filtered.sort((a,b)=> (b.releaseDate||'').localeCompare(a.releaseDate||''));
    if(s === 'rating') filtered.sort((a,b)=> (b.rating||0) - (a.rating||0));
    // trending - default might be popularity
    resetPagination();
  }

  function resetPagination(){
    page = 0; grid.innerHTML = '';
    grid.appendChild(loadingEl);
    renderPage();
  }

  // load data
  async function load(){
    try{
      const cfg = await fetchConfig();
      if(cfg && cfg.tmdbApiKey){
        await loadFromTMDb(cfg.tmdbApiKey);
      } else {
        // try sampleapis as a quick free source
        const sample = await fetchFromSampleAPIs();
        if(sample && sample.length){
          movies = sample;
          // try to derive genres from movies
          const genSet = new Set();
          movies.forEach(m => (m.genres||[]).forEach(g=> genSet.add(g)));
          genres = Array.from(genSet).sort();
        } else {
          // fallback to local files bundled with the project
          const [dres, gres] = await Promise.all([fetch(LOCAL_DATA_URL), fetch(LOCAL_GENRE_URL)]);
          if(!dres.ok) throw new Error('Movies data not available');
          movies = await dres.json();
          genres = await gres.json();
        }
      }

      // normalize types
      movies.forEach(m => { m.rating = Number(m.rating || m.vote_average || 0); m.releaseDate = String(m.releaseDate || m.release_date || ''); m.runtime = m.runtime || m.runtimeMinutes || 0; m.cast = m.cast || []; m.genres = m.genres || m.genre_names || m.genre || mapGenreIds(m.genre_ids || []); });
      populateGenres();
      featuredMovie();
      filtered = movies.slice();
      renderPage();
    }catch(err){
      loadingEl.textContent = 'Unable to load movies. Try again offline?';
      console.error(err);
    }
  }

  async function fetchConfig(){
    try{
      const r = await fetch(CONFIG_URL);
      if(!r.ok) return null;
      return await r.json();
    }catch(e){ return null; }
  }

  function mapGenreIds(ids){
    if(!Array.isArray(ids) || !genres.length) return [];
    return ids.map(id => {
      const g = genres.find(x=> x.id === id || x === id || x.name === id);
      return g ? (g.name || g) : String(id);
    }).filter(Boolean);
  }

  async function loadFromTMDb(key){
    // fetch genres
    try{
      const gres = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${key}&language=en-US`);
      if(gres.ok){
        const gd = await gres.json();
        genres = gd.genres || [];
      }
      // fetch a few pages of popular movies (3 pages ~60 items)
      const pagesToFetch = 3;
      let results = [];
      for(let p=1;p<=pagesToFetch;p++){
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=${p}`);
        if(!res.ok) break;
        const data = await res.json();
        results = results.concat(data.results || []);
      }
      // map fields
      movies = results.map(m => ({
        id: m.id,
        title: m.title || m.original_title,
        poster: m.poster_path? (TMDB_IMAGE_BASE + m.poster_path) : m.backdrop_path? (TMDB_IMAGE_BASE + m.backdrop_path) : '/assets/placeholder.png',
        poster_path: m.poster_path,
        overview: m.overview,
        releaseDate: m.release_date,
        rating: m.vote_average,
        genre_ids: m.genre_ids || [],
        popularity: m.popularity || 0,
        cast: []
      }));
      // optional: fetch credits for first 20 movies to populate cast (best-effort)
      const creditFetchCount = Math.min(20, movies.length);
      await Promise.all(movies.slice(0, creditFetchCount).map(async (mv, idx) => {
        try{
          const r = await fetch(`https://api.themoviedb.org/3/movie/${mv.id}/credits?api_key=${key}`);
          if(!r.ok) return;
          const cd = await r.json();
          mv.cast = (cd.cast || []).slice(0,6).map(c=> c.name);
        }catch(e){/*ignore*/}
      }));

    }catch(e){
      console.error('TMDb load failed', e);
      throw e;
    }
  }

  async function fetchFromSampleAPIs(){
    try{
      // sampleapis doesn't provide a single combined list; combine a few categories
      const endpoints = [
        'https://api.sampleapis.com/movies/action',
        'https://api.sampleapis.com/movies/drama',
        'https://api.sampleapis.com/movies/comedy'
      ];
      const all = [];
      await Promise.all(endpoints.map(async ep => {
        try{
          const r = await fetch(ep);
          if(!r.ok) return;
          const data = await r.json();
          // normalize entries where possible
          data.forEach(item => {
            all.push({
              id: item.id || item.imdbID || (item.title + '::' + (item.year||'')),
              title: item.title || item.name,
              poster: item.posterURL || item.poster || (item.imageUrl || ''),
              overview: item.plot || item.description || item.storyline || '',
              releaseDate: item.year || item.releaseDate || '',
              rating: Number(item.rating || item.imdbRating || 0),
              runtime: item.runtime || 0,
              cast: item.actors || item.cast || [],
              genres: item.genre || item.genres || []
            });
          });
        }catch(e){/*ignore*/}
      }));
      return all;
    }catch(e){
      return [];
    }
  }

  function populateGenres(){
    // clear existing options except 'all'
    filterGenre.innerHTML = '<option value="all">All Genres</option>';
    // genres may be array of strings or objects {id,name}
    const list = genres.map(g => typeof g === 'string'? g : (g.name || g));
    const uniq = Array.from(new Set(list)).sort();
    uniq.forEach(g => {
      const opt = document.createElement('option'); opt.value = g; opt.textContent = g; filterGenre.appendChild(opt);
    });
  }

  function featuredMovie(){
    const el = document.getElementById('featured');
    const pick = movies[Math.floor(Math.random()*movies.length)];
    if(!pick) return;
    el.innerHTML = '';
    const hero = document.createElement('div');
    hero.className = 'hero-card';
    hero.innerHTML = `
      <picture>
        <img src="${pick.poster}" alt="${pick.title} poster" style="width:100%;height:100%;object-fit:cover">
      </picture>
      <div class="hero-card-body">
        <h3>${pick.title} <span class="muted">(${pick.releaseDate})</span></h3>
        <p class="muted">⭐ ${pick.rating} • ${(pick.genres||[]).join(', ')}</p>
        <p>${pick.overview}</p>
        <div style="margin-top:12px">
          <a class="icon-btn" href="/pages/movie.html?id=${pick.id}">View Details</a>
        </div>
      </div>
    `;
    el.appendChild(hero);
  }

  // favorites quick nav
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/pages/search.html?fav=1';
  });

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', ()=>{
    const isDark = document.body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('mh:theme', isDark? 'light':'dark');
  });

  // restore theme
  (function(){
    const t = localStorage.getItem('mh:theme');
    if(t==='light') document.body.classList.add('light');
  })();

  // register service worker
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').catch(()=>{/*fail silently*/});
  }

  // init
  document.addEventListener('DOMContentLoaded', load);

})();
