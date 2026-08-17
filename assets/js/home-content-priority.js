(() => {
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const main=document.getElementById('main'),movies=document.querySelector('section[aria-labelledby="movies-title"]');
  if(!main||!movies)return;
  const make=(html)=>{const e=document.createElement('section');e.className='container section content-priority';e.innerHTML=html;return e};
  const box=make('<div class="section-head"><div><p class="kicker">BOX OFFICE · INDIA</p><h2>💰 Box Office: numbers & crowd pull</h2><p class="muted">Current reported collections and source-reported verdict signals. No posters — just the numbers people are looking for.</p></div><a href="./pages/box-office-live">See full box office →</a></div><div id="homeBoxOffice" class="content-table"><div class="loading">Loading current box-office numbers…</div></div>');
  const ott=make('<div class="section-head"><div><p class="kicker">OTT · INDIA</p><h2>📺 New on OTT & what people are watching</h2><p class="muted">Fresh streaming reports, platforms and watch-worthy picks — text first, no poster clutter.</p></div><a href="./pages/ott">Explore OTT →</a></div><div id="homeOtt" class="content-table"><div class="loading">Checking current OTT releases…</div></div>');
  main.insertBefore(box,movies);main.insertBefore(ott,movies);
  const FALLBACK_BOX=[
    {movieTitle:'Vishwanath and Sons',amount:'₹100+ Cr worldwide (Day 2)',verdict:'Source-reported: Success',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms',source:'Times of India',pubDate:'2026-08-17'},
    {movieTitle:'Awarapan 2',amount:'₹50+ Cr India (Day 2)',verdict:'Source-reported: Strong opening',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms',source:'Economic Times',pubDate:'2026-08-17'},
    {movieTitle:'Vishwanath and Sons',amount:'₹22.25 Cr India (Day 2)',verdict:'Source-reported: 45% growth',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/vishwanath-and-sons-vs-jana-nayagan-box-office-collections-suriyas-film-grows-45-on-day-2-vijays-film-earns-rs-196-15-crore-in-24-days/articleshow/133268575.cms',source:'Times of India',pubDate:'2026-08-17'},
    {movieTitle:'Korean Kanakaraju',amount:'₹25+ Cr worldwide (Day 6)',verdict:'Source-reported: Steady run',url:'https://timesofindia.indiatimes.com/entertainment/telugu/movies/box-office/korean-kanakaraju-box-office-collection-day-6-varun-tejs-horror-comedy-maintains-pace-surpasses-rs-25-crore-worldwide/articleshow/133195957.cms',source:'Times of India',pubDate:'2026-08-16'},
    {movieTitle:'Spider-Man: Brand New Day',amount:'Day 17 collection report',verdict:'Source-reported: Steady theatrical run',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/box-office/spider-man-brand-new-day-box-office-collection-day-17-tom-holland-starrer-sees-big-jump-on-third-saturday-still-lags-behind-massive-awarapan-2-earnings/articleshow/133268642.cms',source:'Times of India',pubDate:'2026-08-17'},
    {movieTitle:'Batwara 1947',amount:'₹5 Cr India (Day 1)',verdict:'Source-reported: Decent opening',url:'https://m.economictimes.com/magazines/panache/batwara-1947-box-office-collection-day-1-sunny-deol-preity-zintas-movie-opens-on-a-decent-note-on-independence-day-earns-rs-5-crore-in-india/articleshow/133253633.cms',source:'Economic Times',pubDate:'2026-08-16'}
  ];
  const FALLBACK_OTT=[
    {title:'Cocktail 2',release:'14 Aug 2026',providers:['Netflix'],source:'India OTT release report'},
    {title:'Aakhri Sawaal',release:'14 Aug 2026',providers:['Lionsgate Play'],source:'India OTT release report'},
    {title:'A Child of My Own',release:'13 Aug 2026',providers:['Netflix'],source:'India OTT release report'},
    {title:'Reacher Season 4',release:'12 Aug 2026',providers:['Prime Video'],source:'India streaming report'},
    {title:"Don't Say Good Luck",release:'14 Aug 2026',providers:['Netflix'],source:'India OTT release report'}
  ];
  const FALLBACK_NEWS=[
    {title:'Vishwanath and Sons crosses ₹100 crore worldwide in two days',description:'Suriya and Mamitha Baiju starrer crosses the ₹100 crore worldwide milestone in two days.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms',pubDate:'2026-08-17'},
    {title:'Awarapan 2 enters the ₹50 crore India club in two days',description:'Awarapan 2 posts a strong opening and crosses ₹50 crore in India in two days.',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms',pubDate:'2026-08-17'},
    {title:'I, Nobody OTT release date announced for JioHotstar',description:'Prithviraj Sukumaran starrer I, Nobody is set to stream on JioHotstar from August 25.',source:'Indian Express Malayalam',url:'https://malayalam.indianexpress.com/entertainment/i-nobody-ott-release-date-prithviraj-movie-jio-hotstar-12265448',pubDate:'2026-08-17'},
    {title:'Cocktail 2 OTT release sparks fresh online debate',description:'Cocktail 2 is generating renewed online discussion after its OTT release.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/cocktail-2-ott-release-sparks-debate-and-garners-mixed-reviews-netizens-call-shahid-kapoor-kriti-sanon-and-rashmika-mandanna-starrer-a-rage-bait/articleshow/133267514.cms',pubDate:'2026-08-16'}
  ];
  const FALLBACK_BUZZ=[
    {title:'Govinda responds to ongoing Sunita Ahuja controversy',description:'Govinda has publicly responded to the ongoing controversy involving Sunita Ahuja and Lock Upp.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/govinda-says-sunita-ahuja-wanted-him-on-lock-upp-not-leaving-any-chance-to-get-me-defamed/articleshow/133277810.cms',pubDate:'2026-08-17'},
    {title:'Saif Ali Khan and Kareena Kapoor Khan spotted with family after birthday getaway',description:'The couple were spotted with their sons after returning from Saif Ali Khan’s birthday getaway.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/saif-ali-khan-spotted-with-kareena-kapoor-khan-and-sons-at-airport-back-from-haiwaan-acttors-birthday-getaway/articleshow/133272481.cms',pubDate:'2026-08-17'}
  ];
  const FALLBACK_VIRAL=[FALLBACK_NEWS[3],{title:'Fans and online audiences react to Awarapan 2 box-office surge',description:'The film’s rapid box-office growth is driving fresh fan and audience discussion.',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms',pubDate:'2026-08-17'}];
  const render=(root,items,type)=>{if(!root)return;if(!items.length){root.innerHTML='<p class="muted">No verified live reports are available right now. The source scan will refresh automatically.</p>';return}root.innerHTML=items.slice(0,8).map((x,i)=>`<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x.movieTitle||x.title)}</h3><p>${type==='box'?`<strong>${esc(x.amount||'Collection report available')}</strong> · ${esc(x.verdict||'Current report')}`:`${esc(x.title)}${x.release?` · ${esc(x.release)} · ${esc((x.providers||[]).join(' · '))}`:''}</p><small>${esc(x.source||'Indian entertainment source')} · ${x.pubDate?esc(new Date(x.pubDate).toLocaleDateString('en-IN')):''}</small></div><a href="${esc(x.url||`./pages/search?q=${encodeURIComponent(x.title||x.movieTitle||'')}`)}" target="_blank" rel="noopener noreferrer">Read →</a></article>`).join('')};
  const story=(x,i,label)=>`<article class="story-item"><div class="story-number">${String(i+1).padStart(2,'0')}</div><div><a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer"><h3>${esc(x.title)}</h3></a><p><strong>${esc(label)}</strong> · ${esc(x.description||'Latest entertainment report from the source.')}</p><small class="source-note">${esc(x.source||'Entertainment source')} · ${x.pubDate?esc(new Date(x.pubDate).toLocaleDateString('en-IN')):''}</small></div></article>`;
  const fillLiveSections=(feed)=>{
    const news=Array.isArray(feed.news)&&feed.news.length?feed.news:FALLBACK_NEWS;
    const buzz=Array.isArray(feed.buzz)&&feed.buzz.length?feed.buzz:FALLBACK_BUZZ;
    const viral=Array.isArray(feed.viral)&&feed.viral.length?feed.viral:FALLBACK_VIRAL;
    const editorial=document.getElementById('editorialFeed');
    if(editorial && !editorial.querySelector('.story-item')) editorial.innerHTML=news.slice(0,6).map((x,i)=>story(x,i,/confirmed|official|announced|statement|revealed/i.test(`${x.title} ${x.description}`)?'Confirmed / reported':'Cinema update')).join('');
    const buzzRoot=document.getElementById('buzzFeed');
    if(buzzRoot && !buzzRoot.querySelector('.story-item')) buzzRoot.innerHTML=buzz.slice(0,4).map((x,i)=>story(x,i,/confirmed|official|announced|statement/i.test(`${x.title} ${x.description}`)?'Confirmed / reported':'Public buzz')).join('');
    const viralRoot=document.getElementById('viralFeed');
    if(viralRoot && !viralRoot.querySelector('.story-item')) viralRoot.innerHTML=viral.slice(0,5).map((x,i)=>story(x,i,'Viral cinema')).join('');
  };
  const json=async(url)=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`${r.status}`);return r.json()};
  Promise.allSettled([json('./api/box-office-feed'),json('./api/home-feed')]).then(([b,h])=>{
    render(document.getElementById('homeBoxOffice'),b.status==='fulfilled'&&Array.isArray(b.value.items)&&b.value.items.length?b.value.items:FALLBACK_BOX,'box');
    const feed=h.status==='fulfilled'?h.value:{};
    fillLiveSections(feed);
    const ott=(feed.news||[]).filter(x=>/ott|netflix|prime|jiohotstar|zee5|streaming|release/i.test(`${x.title} ${x.description}`));
    render(document.getElementById('homeOtt'),ott.length?ott:FALLBACK_OTT,'ott');
  });
  setTimeout(()=>{
    ['homeBoxOffice','homeOtt'].forEach(id=>{const root=document.getElementById(id);if(root&&root.querySelector('.loading'))root.innerHTML='<p class="muted">Live source data is temporarily unavailable; the next refresh will retry automatically.</p>'});
    fillLiveSections({});
  },10000);
  main.appendChild(movies);
})();
