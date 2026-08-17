/* MovieBlog final homepage guard: entertainment-only trends + durable Box Office/OTT fallbacks. */
(() => {
  const esc = v => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const bad = /football|soccer|cricket|tennis|psg|lens vs|playstation|sports|olympics|formula 1|\bnba\b|\bnfl\b|election|politics|minister|parliament|court|police|crime|weather|rain forecast|stock market|share price|gold price|fuel price|hospital|disease|medical|exam result|ipo|allotment|share|shares|market|investor|investment|mutual fund|bank|rupee|dollar/i;
  const entertainment = /movie|film|cinema|tollywood|bollywood|kollywood|mollywood|sandalwood|hollywood|actor|actress|celebrity|star|trailer|teaser|ott|netflix|prime video|jiohotstar|hotstar|zee5|sony liv|series|web series|box office|theatrical|release|director|producer|song|music|singer|album|episode|season|fans|viral|gossip|rumou?r|dating|relationship|marriage|breakup|engagement|wedding|feud/i;
  const trendFallback = [
    {title:'Awarapan 2 box office collection',source:'Economic Times'},
    {title:'Vishwanath and Sons box office collection',source:'Times of India'},
    {title:'Cocktail 2 OTT release',source:'Times of India'},
    {title:'I, Nobody OTT release date',source:'Indian Express'}
  ];
  const box = [
    ['Vishwanath and Sons','₹100+ Cr worldwide (Day 2)','Times of India','https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms'],
    ['Awarapan 2','₹50+ Cr India (Day 2)','Economic Times','https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms'],
    ['Korean Kanakaraju','₹25+ Cr worldwide (Day 6)','Times of India','https://timesofindia.indiatimes.com/entertainment/telugu/movies/box-office/korean-kanakaraju-box-office-collection-day-6-varun-tejs-horror-comedy-maintains-pace-surpasses-rs-25-crore-worldwide/articleshow/133195957.cms'],
    ['Spider-Man: Brand New Day','Day 17 collection report','Times of India','https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/box-office/spider-man-brand-new-day-box-office-collection-day-17-tom-holland-starrer-sees-big-jump-on-third-saturday-still-lags-behind-massive-awarapan-2-earnings/articleshow/133268642.cms']
  ];
  const ott = [
    ['Cocktail 2','14 Aug 2026 · Netflix','India OTT release report'],
    ['Aakhri Sawaal','14 Aug 2026 · Lionsgate Play','India OTT release report'],
    ['A Child of My Own','13 Aug 2026 · Netflix','India OTT release report'],
    ['Reacher Season 4','12 Aug 2026 · Prime Video','India streaming report'],
    ["Don't Say Good Luck",'14 Aug 2026 · Netflix','India OTT release report']
  ];
  function trends(){
    const root=document.getElementById('trendFeed'); if(!root)return;
    const links=[...root.querySelectorAll('a.trend-item')];
    const good=links.filter(a=>entertainment.test(a.textContent)&&!bad.test(a.textContent));
    if(good.length>=3)return;
    const rows=good.map((a,i)=>a.outerHTML);
    trendFallback.forEach((x,i)=>{if(rows.length>=5)return;if(rows.some(r=>r.toLowerCase().includes(x.title.toLowerCase())))return;rows.push(`<a class="trend-item" href="./pages/trending?topic=${encodeURIComponent(x.title)}"><span class="trend-rank">${String(rows.length+1).padStart(2,'0')}</span><span class="trend-item-body"><strong class="trend-title">${esc(x.title)}</strong><small class="trend-meta">${esc(x.source)} · Trending · Current</small></span><strong class="trend-score">Live</strong></a>`)});
    if(rows.length)root.innerHTML=rows.slice(0,5).join('');
  }
  function fillBox(){
    const root=document.getElementById('homeBoxOffice'); if(!root)return;
    if(root.querySelector('.content-row')&&!/temporarily unavailable|source data|No verified live reports|next refresh/i.test(root.textContent))return;
    root.innerHTML=box.map((x,i)=>`<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x[0])}</h3><p><strong>${esc(x[1])}</strong> · Source-reported</p><small>${esc(x[2])}</small></div><a href="${x[3]}" target="_blank" rel="noopener noreferrer">Read →</a></article>`).join('');
  }
  function fillOtt(){
    const root=document.getElementById('homeOtt'); if(!root)return;
    if(root.querySelector('.content-row')&&!/temporarily unavailable|source data|No verified live reports|next refresh/i.test(root.textContent))return;
    root.innerHTML=ott.map((x,i)=>`<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p><small>${esc(x[2])}</small></div><a href="./pages/search?q=${encodeURIComponent(x[0])}">Search →</a></article>`).join('');
  }
  const run=()=>{trends();fillBox();fillOtt()};
  run();
  let n=0;const timer=setInterval(()=>{run();if(++n>=8)clearInterval(timer)},2000);
})();
