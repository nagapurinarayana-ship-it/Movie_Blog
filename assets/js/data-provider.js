(() => {
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const GENRES = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'};

  function normalize(movie) {
    return {...movie,id:movie.id||movie.imdbID||`${movie.title||movie.name||'movie'}-${movie.year||''}`,title:movie.title||movie.name||'Untitled',poster:movie.poster||(movie.poster_path?IMAGE_BASE+movie.poster_path:''),overview:movie.overview||movie.plot||movie.description||'',releaseDate:String(movie.releaseDate||movie.release_date||movie.year||''),rating:Number(movie.rating||movie.vote_average||movie.imdbRating||0),runtime:Number(movie.runtime||movie.runtimeMinutes||0),cast:Array.isArray(movie.cast)?movie.cast:[],genres:Array.isArray(movie.genres)?movie.genres:[]};
  }
  async function request(path){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error(`Provider returned ${response.status}`);return response.json();}
  async function popular(page=1){const data=await request(`./api/tmdb?mode=popular&page=${encodeURIComponent(page)}&language=en-US`);return Array.isArray(data.results)?data.results.map(normalize):[];}
  async function search(query,page=1){const data=await request(`./api/tmdb?mode=search&query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}&language=en-US`);return Array.isArray(data.results)?data.results.map(normalize):[];}
  async function mode(name,page=1){const data=await request(`./api/tmdb?mode=${encodeURIComponent(name)}&page=${encodeURIComponent(page)}&region=IN&language=en-US`);return Array.isArray(data.results)?data.results.map(normalize):[];}
  window.MovieBlogDataProvider={normalize,popular,search,mode};

  const originalFetch=window.fetch.bind(window);
  async function enrichMoviePosters(movies){return Promise.all(movies.map(async movie=>{if(movie.poster||movie.poster_path)return movie;try{const data=await search(movie.title,1);const match=data.find(item=>String(item.title).toLowerCase()===String(movie.title).toLowerCase())||data[0];if(match?.poster)return {...movie,poster:match.poster,poster_path:match.poster_path||''};}catch(_){}return movie;}));}

  function createLiveCard(movie){const article=document.createElement('article');article.className='card';article.tabIndex=0;article.style.cursor='pointer';const wrap=document.createElement('div');wrap.className='poster-wrap';const img=document.createElement('img');img.className='poster';img.loading='lazy';img.decoding='async';img.alt=`${movie.title} poster`;img.src=movie.poster||'./assets/placeholder.png';wrap.appendChild(img);const body=document.createElement('div');body.className='card-body';const h=document.createElement('h3');h.className='title';h.textContent=movie.title;const p=document.createElement('p');p.className='meta';const year=movie.releaseDate?String(movie.releaseDate).slice(0,4):'TBA';p.textContent=`${year} • ⭐ ${movie.rating?Number(movie.rating).toFixed(1):'—'}`;const o=document.createElement('p');o.className='overview';o.textContent=movie.overview||'TMDB details available.';body.append(h,p,o);article.append(wrap,body);const open=()=>{location.href=`./pages/movie?id=${encodeURIComponent(movie.id)}`;};article.addEventListener('click',open);article.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});return article;}

  async function renderHomeSections(){
    if(!document.getElementById('movieGrid')||document.getElementById('liveMovieSections'))return;
    const anchor=document.querySelector('.content-note');if(!anchor)return;
    const shell=document.createElement('div');shell.id='liveMovieSections';
    const sections=[['now_playing','Now Playing','In cinemas and currently drawing attention'],['upcoming','Coming Soon','Upcoming releases worth watching'],['top_rated','Top Rated','Highly rated movies from TMDB']];
    sections.forEach(([id,title,subtitle])=>{const section=document.createElement('section');section.className='container section';const row=document.createElement('div');row.className='title-row';row.innerHTML=`<div><p class="eyebrow">LIVE FROM TMDB</p><h2>${title}</h2><p class="muted">${subtitle}</p></div><a class="secondary-btn" href="./pages/search">Explore all</a>`;const grid=document.createElement('div');grid.className='movies';grid.dataset.section=id;grid.innerHTML='<div class="loading">Loading…</div>';section.append(row,grid);shell.appendChild(section);});
    anchor.parentNode.insertBefore(shell,anchor);
    await Promise.all(sections.map(async([id])=>{const grid=shell.querySelector(`[data-section="${id}"]`);try{const movies=await mode(id,1);grid.replaceChildren(...movies.slice(0,10).map(createLiveCard));}catch(_){grid.innerHTML='<div class="loading">This section is temporarily unavailable.</div>';}}));
  }

  window.fetch=async(input,init)=>{const requestUrl=typeof input==='string'?input:input?.url||'';if(requestUrl.includes('/data/movies.json')){const response=await originalFetch(input,init);if(!response.ok)return response;try{const data=await response.clone().json();const movies=Array.isArray(data)?data:[];const enriched=await enrichMoviePosters(movies);return new Response(JSON.stringify(enriched),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}catch(_){return response;}}
    if(requestUrl.includes('api.sampleapis.com/movies/')){try{return new Response(JSON.stringify(await popular(1)),{status:200,headers:{'Content-Type':'application/json'}});}catch(_){return new Response('[]',{status:200,headers:{'Content-Type':'application/json'}});}}
    return originalFetch(input,init);
  };
  document.addEventListener('DOMContentLoaded',()=>{renderHomeSections().catch(()=>{});});
})();
