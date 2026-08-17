/* MovieBlog production shell: one header, one navigation, every page. */
(() => {
  const header=document.querySelector('header.nav');
  if(!header)return;
  const base=location.pathname.includes('/pages/')?'../':'./';
  const links=[['Today',base],['Trending',base+'pages/trending'],['Movies',base+'pages/search'],['OTT',base+'pages/ott'],['News',base+'pages/news'],['Box Office',base+'pages/box-office-live']];
  const path=location.pathname.replace(/\/$/,'');
  const active=label=>label==='Today'?(path===''||path.endsWith('/index.html')):path.endsWith('/'+label.toLowerCase().replace(' ','-'))||(label==='Movies'&&path.endsWith('/search'))||(label==='Box Office'&&path.endsWith('/box-office-live'));
  header.innerHTML=`<div class="container nav-inner"><div class="brand"><button id="menuToggle" class="hamburger" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button><a href="${base}" class="logo" aria-label="MovieBlog home"><span class="logo-mark">M</span> MovieBlog</a></div><nav id="mainNav" class="main-nav" aria-label="Primary navigation"><ul>${links.map(([label,href])=>`<li><a href="${href}"${active(label)?' aria-current="page"':''}>${label}</a></li>`).join('')}</ul></nav><div class="nav-actions"><a href="${base}pages/search" class="search-link" aria-label="Search movies and entertainment">⌕</a></div></div>`;
  const toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});

  // Box Office safety net: never leave the results page stuck on a source scan.
  if(path.endsWith('/box-office-live')){
    const fallback=[
      {title:'Vishwanath and Sons',amount:'₹100+ Cr worldwide (Day 2)',label:'Source-reported: Success',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms'},
      {title:'Awarapan 2',amount:'₹50+ Cr India (Day 2)',label:'Source-reported: Strong opening',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms'},
      {title:'Vishwanath and Sons',amount:'₹22.25 Cr India (Day 2)',label:'Source-reported: 45% growth',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/vishwanath-and-sons-vs-jana-nayagan-box-office-collections-suriyas-film-grows-45-on-day-2-vijays-film-earns-rs-196-15-crore-in-24-days/articleshow/133268575.cms'},
      {title:'Korean Kanakaraju',amount:'₹25+ Cr worldwide (Day 6)',label:'Source-reported: Steady run',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/telugu/movies/box-office/korean-kanakaraju-box-office-collection-day-6-varun-tejs-horror-comedy-maintains-pace-surpasses-rs-25-crore-worldwide/articleshow/133195957.cms'}
    ];
    const paint=()=>{
      const root=document.getElementById('results');
      if(root && (/loading|scanning|temporarily unavailable/i.test(root.textContent)||!root.querySelector('article'))){
        root.innerHTML=fallback.map((x,i)=>`<article class="news-item"><div><p class="kicker">BOX OFFICE · INDIA</p><h2>${String(i+1).padStart(2,'0')} · ${x.title}</h2><p><strong>${x.amount}</strong> · ${x.label}</p><small>${x.source}</small></div><a href="${x.url}" target="_blank" rel="noopener noreferrer">Read report →</a></article>`).join('');
      }
      const trend=document.getElementById('trendMovies');
      if(trend && (/finding|loading|scanning/i.test(trend.textContent)||!trend.querySelector('a'))){
        trend.innerHTML=fallback.slice(0,4).map((x,i)=>`<a href="./box-office-live?q=${encodeURIComponent(x.title)}"><strong>${String(i+1).padStart(2,'0')}</strong> ${x.title} · ${x.amount}</a>`).join('');
      }
    };
    setTimeout(paint,3000);setTimeout(paint,8000);setTimeout(paint,12000);
  }
  if (!document.querySelector('script[data-movieblog-banners]')) {
    const ads = document.createElement('script');
    ads.src = base + 'assets/js/monetization.js?v=20260817-banner-only';
    ads.defer = true;
    ads.dataset.movieblogBanners = '1';
    document.body.appendChild(ads);
  }
})();
