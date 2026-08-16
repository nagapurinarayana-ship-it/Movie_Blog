/* MovieBlog homepage — daily trends + regional movie discovery + OTT picks */
(() => {
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const grid = document.getElementById('movieGrid');
  const loading = document.getElementById('loading');
  const cardTemplate = document.getElementById('cardTemplate');
  const trendFeed = document.getElementById('trendFeed');
  const viralFeed = document.getElementById('viralFeed');
  const buzzFeed = document.getElementById('buzzFeed');
  const watchFeed = document.getElementById('watchFeed');
  const dailyDate = document.getElementById('dailyDate');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const themeToggle = document.getElementById('themeToggle');
  const favoritesKey = 'movieblog:favorites:v3';
  let favorites = new Set();
  try { favorites = new Set(JSON.parse(localStorage.getItem(favoritesKey) || '[]')); } catch (_) {}

  const normalize = movie => ({...movie,id:movie.id || `${movie.title || 'movie'}-${movie.release_date || ''}`,title:movie.title || movie.name || 'Untitled',poster:movie.poster || (movie.poster_path ? IMAGE_BASE + movie.poster_path : ''),overview:movie.overview || '',releaseDate:String(movie.releaseDate || movie.release_date || ''),rating:Number(movie.rating || movie.vote_average || 0)});
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const movieUrl = id => `./pages/movie?id=${encodeURIComponent(id)}`;
  async function api(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`Request failed: ${response.status}`);return response.json();}

  function renderMovieCards(items){
    if(!grid||!cardTemplate)return;
    grid.querySelectorAll('.card').forEach(node=>node.remove());
    loading.style.display=items.length?'none':'block';
    if(!items.length){loading.textContent='No movies available right now.';return;}
    const fragment=document.createDocumentFragment();
    items.slice(0,5).map(normalize).forEach(movie=>{
      const tpl=cardTemplate.content.cloneNode(true),article=tpl.querySelector('article'),img=tpl.querySelector('.poster'),title=tpl.querySelector('.title'),meta=tpl.querySelector('.meta'),overview=tpl.querySelector('.overview'),fav=tpl.querySelector('.fav-toggle');
      article.dataset.id=movie.id;img.src=movie.poster||'./assets/placeholder.png';img.alt=`${movie.title} poster`;title.textContent=movie.title;meta.textContent=`${movie.releaseDate?movie.releaseDate.slice(0,4):'TBA'} · ⭐ ${movie.rating?movie.rating.toFixed(1):'—'}`;overview.textContent=movie.overview;
      if(favorites.has(String(movie.id))){fav.textContent='♥';fav.setAttribute('aria-pressed','true');}
      fav.addEventListener('click',event=>{event.stopPropagation();const id=String(movie.id);if(favorites.has(id)){favorites.delete(id);fav.textContent='♡';fav.setAttribute('aria-pressed','false');}else{favorites.add(id);fav.textContent='♥';fav.setAttribute('aria-pressed','true');}localStorage.setItem(favoritesKey,JSON.stringify([...favorites]));});
      const open=()=>{window.location.href=movieUrl(movie.id);};article.addEventListener('click',open);article.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});fragment.appendChild(tpl);
    });
    grid.insertBefore(fragment,loading);
  }

  async function loadRegional(language){try{const data=await api(`./api/tmdb?mode=regional&original_language=${encodeURIComponent(language)}&region=IN&language=en-US&page=1`);renderMovieCards(Array.isArray(data.results)?data.results:[]);}catch(_){loading.style.display='block';loading.textContent='Movie data is temporarily unavailable.';}}
  function trendItem(item,index){return `<article class="trend-item"><div class="trend-rank">${String(index+1).padStart(2,'0')}</div><a href="./pages/trending?topic=${encodeURIComponent(item.title||'')}"><div class="trend-title">${esc(item.title)}</div><div class="trend-meta">${esc(item.newsSources?.[0]||'Trending in India')} · ${esc(item.traffic||'rising interest')}</div></a><div class="trend-score">${Number(item.score||0)} Pulse</div></article>`;}
  function isBuzz(item){return /rumou?r|dating|relationship|wedding|marriage|breakup|spotted|fans think|reportedly|joins|cast as|linked to/i.test(`${item.title||''} ${item.description||''}`);}
  function storyItem(item,index,label){return `<article class="story-item"><div class="story-number">${String(index+1).padStart(2,'0')}</div><div><a href="./pages/trending?topic=${encodeURIComponent(item.title||'')}"><h3>${esc(item.title)}</h3></a><p><strong>${label}</strong> · ${esc(item.description||'A fast-moving entertainment topic worth watching.')}</p></div></article>`;}

  async function loadTrends(){
    try{
      const data=await api('./api/trends'),all=Array.isArray(data.trends)?data.trends:[],entertainment=all.filter(item=>item.relevance!=='low'),trends=(entertainment.length?entertainment:all).slice(0,8);
      trendFeed.innerHTML=trends.length?trends.map(trendItem).join(''):'<div class="loading">No strong entertainment trend is available right now.</div>';
      const buzz=all.filter(isBuzz).slice(0,4);buzzFeed.innerHTML=buzz.length?buzz.map(item=>`<div class="mini-item"><span>Rumour / buzz</span><h3><a href="./pages/trending?topic=${encodeURIComponent(item.title||'')}">${esc(item.title)}</a></h3></div>`).join(''):'<div class="mini-item"><span>Public buzz</span><h3>Fresh celebrity and movie rumours will appear here as they start trending.</h3></div>';
      const viral=all.filter(item=>!isBuzz(item)).slice(3,8);viralFeed.innerHTML=viral.length?viral.map((item,i)=>storyItem(item,i,'Viral')).join(''):'<div class="loading">Viral cinema stories will appear as new signals emerge.</div>';
    }catch(_){trendFeed.innerHTML='<div class="loading">Trending data is temporarily unavailable.</div>';viralFeed.innerHTML='<div class="loading">Viral cinema data is temporarily unavailable.</div>';buzzFeed.innerHTML='<div class="mini-item"><span>Public buzz</span><h3>Entertainment buzz will refresh when trend data is available.</h3></div>';}
  }

  function renderWatch(items){
    const movies=items.slice(0,5).map(normalize);
    if(!movies.length){watchFeed.innerHTML='<div class="loading">OTT picks are being refreshed.</div>';return;}
    watchFeed.innerHTML=movies.map(movie=>{const providers=Array.isArray(movie.providers)&&movie.providers.length?movie.providers.join(' · '):'Streaming availability in India';return `<article class="watch-card"><a href="${movieUrl(movie.id)}"><img loading="lazy" src="${movie.poster||'./assets/placeholder.png'}" alt="${esc(movie.title)} poster"></a><div class="watch-body"><span class="watch-tag">Worth watching</span><h3><a href="${movieUrl(movie.id)}">${esc(movie.title)}</a></h3><p>⭐ ${movie.rating?movie.rating.toFixed(1):'—'} · ${esc(providers)}</p></div></article>`;}).join('');
  }
  async function loadWatch(){try{const data=await api('./api/tmdb?mode=streaming&region=IN&language=en-US&page=1');renderWatch(Array.isArray(data.results)?data.results:[]);}catch(_){watchFeed.innerHTML='<div class="loading">OTT recommendations are temporarily unavailable.</div>';}}
  function setDate(){if(dailyDate)dailyDate.textContent=new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date());}

  document.querySelectorAll('.region-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.region-tab').forEach(other=>{other.classList.remove('is-active');other.setAttribute('aria-selected','false');});tab.classList.add('is-active');tab.setAttribute('aria-selected','true');loadRegional(tab.dataset.region);}));
  menuToggle?.addEventListener('click',()=>{const open=mainNav.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(open));});
  themeToggle?.addEventListener('click',()=>document.body.classList.toggle('night'));
  setDate();loadRegional('te');loadTrends();loadWatch();
})();
