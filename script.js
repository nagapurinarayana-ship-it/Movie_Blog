/* Main JS for Movie Hub
   Features: fetch local JSON data, render, search, suggestions, infinite scroll, favorites, lazy loading, PWA registration
*/
(() => {
  const DATA_URL = '/data/movies.json';
  const GENRE_URL = '/data/genres.json';
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
    return `${m.releaseDate} • ${m.runtime} min • ⭐ ${m.rating}`;
  }

  function createCard(movie){
    const tpl = cardTemplate.content.cloneNode(true);
    const article = tpl.querySelector('article');
    article.setAttribute('data-id', movie.id);
    const img = tpl.querySelector('.poster');
    img.src = movie.poster;
    img.alt = `${movie.title} poster`;
    const t = tpl.querySelector('.title'); t.textContent = movie.title;
    const meta = tpl.querySelector('.meta'); meta.textContent = formatMeta(movie);
    const overview = tpl.querySelector('.overview'); overview.textContent = movie.overview;
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
    const matches = movies.filter(m => (m.title+ ' ' + m.cast.join(' ') + ' ' + m.genres.join(' ')).toLowerCase().includes(q)).slice(0,8);
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
    filtered = movies.filter(m => (m.title + ' ' + m.overview + ' ' + m.cast.join(' ')).toLowerCase().includes(q));
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
    if(g !== 'all') filtered = filtered.filter(m => m.genres.includes(g));
    if(s === 'latest') filtered.sort((a,b)=> b.releaseDate - a.releaseDate);
    if(s === 'rating') filtered.sort((a,b)=> b.rating - a.rating);
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
      const [dres, gres] = await Promise.all([fetch(DATA_URL), fetch(GENRE_URL)]);
      if(!dres.ok) throw new Error('Movies data not available');
      movies = await dres.json();
      genres = await gres.json();
      // normalize types
      movies.forEach(m => { m.rating = Number(m.rating); m.releaseDate = String(m.releaseDate); });
      populateGenres();
      featuredMovie();
      filtered = movies.slice();
      renderPage();
    }catch(err){
      loadingEl.textContent = 'Unable to load movies. Try again offline?';
      console.error(err);
    }
  }

  function populateGenres(){
    genres.forEach(g => {
      const opt = document.createElement('option'); opt.value = g; opt.textContent = g; filterGenre.appendChild(opt);
    });
  }

  function featuredMovie(){
    const el = document.getElementById('featured');
    const pick = movies[Math.floor(Math.random()*movies.length)];
    el.innerHTML = '';
    const hero = document.createElement('div');
    hero.className = 'hero-card';
    hero.innerHTML = `
      <picture>
        <img src="${pick.poster}" alt="${pick.title} poster" style="width:100%;height:100%;object-fit:cover">
      </picture>
      <div class="hero-card-body">
        <h3>${pick.title} <span class="muted">(${pick.releaseDate})</span></h3>
        <p class="muted">⭐ ${pick.rating} • ${pick.genres.join(', ')}</p>
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
