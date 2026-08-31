/* MovieBlog production shell: one header, one navigation, every page. */
(() => {
  const header=document.querySelector('header.nav');
  if(!header)return;
  const base=location.pathname.includes('/pages/')?'../':'./';
  const links=[['Today',base],['Trending',base+'pages/trending'],['Movies',base+'pages/search'],['OTT',base+'pages/ott'],['Telugu OTT',base+'pages/telugu-ott'],['News',base+'pages/news'],['Box Office',base+'pages/box-office-live']];
  const path=location.pathname.replace(/\/$/,'');
  const active=label=>label==='Today'?(path===''||path.endsWith('/index.html')):path.endsWith('/'+label.toLowerCase().replace(' ','-'))||(label==='Movies'&&path.endsWith('/search'))||(label==='Box Office'&&path.endsWith('/box-office-live'));
  header.innerHTML=`<div class="container nav-inner"><div class="brand"><button id="menuToggle" class="hamburger" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button><a href="${base}" class="logo" aria-label="MovieBlog home"><span class="logo-mark">M</span> MovieBlog</a></div><nav id="mainNav" class="main-nav" aria-label="Primary navigation"><ul>${links.map(([label,href])=>`<li><a href="${href}"${active(label)?' aria-current="page"':''}>${label}</a></li>`).join('')}</ul></nav><div class="nav-actions"><a href="${base}pages/search" class="search-link" aria-label="Search movies and entertainment">⌕</a></div></div>`;
  const toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});

  function addPopularSearches(){
    if(document.querySelector('[data-movieblog-popular-searches]'))return;
    let title='Popular movie and OTT searches in India';
    let intro='Jump to current movie, streaming, box-office and entertainment pages using the same questions viewers commonly search.';
    let navLinks=[
      [base+'pages/trending','trending movies in India'],
      [base+'pages/ott','new OTT releases this week'],
      [base+'pages/telugu-ott','Telugu OTT releases this week'],
      [base+'pages/box-office-live','box office collection today'],
      [base+'pages/news','latest entertainment news'],
      [base+'pages/search?q=movie+reviews','movie reviews'],
      [base+'pages/search?q=web+series','new web series'],
      [base+'pages/search?q=Telugu+movies','new Telugu movies']
    ];
    let topics=['OTT release date','where to watch online','cast and crew','trailer','movie rating','theatrical release date','celebrity news','upcoming movies 2026'];
    if(path.endsWith('/telugu-ott')){
      title='Popular Telugu OTT searches';
      intro='Find current Telugu movies and series by release week, platform and title, with verified India streaming information where available.';
      navLinks=[[base+'pages/telugu-ott','Telugu OTT releases this week'],[base+'pages/ott','all OTT releases this week'],[base+'pages/search?q=Telugu','search Telugu movies and series'],[base+'pages/trending','trending Telugu and Indian movies']];
      topics=['new Telugu movies on OTT','Telugu web series','Telugu OTT release date','Netflix Telugu movies','Prime Video Telugu movies','JioHotstar Telugu releases','ZEE5 Telugu movies','where to watch Telugu movies'];
    }else if(path.endsWith('/box-office-live')){
      title='Popular box-office searches';
      intro='Use source-labelled reports for current collections rather than treating a single fast-moving number as permanent.';
      navLinks=[[base+'pages/box-office-live','box office collection today'],[base+'pages/trending','trending movies'],[base+'pages/search','search a movie'],[base+'pages/news','latest movie news']];
      topics=['India box office collection','worldwide box office','day 1 collection','opening weekend collection','movie budget and collection','hit or flop','Tollywood box office','Bollywood box office'];
    }else if(path.endsWith('/trending')){
      title='Popular trending-movie searches';
      topics=['trending movies today','viral movie news','new movie releases','upcoming movies','Tollywood trending','Bollywood trending','South Indian movies','what to watch tonight'];
    }else if(path.endsWith('/news')){
      title='Popular entertainment-news searches';
      topics=['latest movie news','celebrity news','Tollywood news','Bollywood news','OTT news','movie release updates','casting news','trailer updates'];
    }
    const section=document.createElement('section');
    section.dataset.movieblogPopularSearches='1';
    section.className='container section';
    section.setAttribute('aria-labelledby','movieblog-popular-searches-title');
    section.innerHTML=`<div style="border:1px solid #e2e2e8;border-radius:18px;padding:20px;background:#fff"><p class="kicker">POPULAR SEARCHES</p><h2 id="movieblog-popular-searches-title">${title}</h2><p class="muted">${intro}</p><nav aria-label="Popular MovieBlog searches" style="display:flex;flex-wrap:wrap;gap:9px;margin:16px 0">${navLinks.map(([href,label])=>`<a href="${href}" style="display:inline-block;padding:8px 12px;border:1px solid #dddde5;border-radius:999px;text-decoration:none;font-weight:700">${label}</a>`).join('')}</nav><div aria-label="Related movie search topics" style="display:flex;flex-wrap:wrap;gap:7px">${topics.map(topic=>`<span style="padding:6px 9px;border-radius:999px;background:#f5f5f7;font-size:13px">${topic}</span>`).join('')}</div></div>`;
    const footer=document.querySelector('footer');
    if(footer&&footer.parentNode)footer.parentNode.insertBefore(section,footer);else document.body.appendChild(section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addPopularSearches,{once:true});else addPopularSearches();

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