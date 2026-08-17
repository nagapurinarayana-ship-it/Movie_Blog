/* MovieBlog live-content safety net. Last in the homepage script order so a slow/empty API can never leave core sections blank. */
(() => {
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const FALLBACK_BOX = [
    {title:'Vishwanath and Sons',amount:'₹100+ Cr worldwide (Day 2)',label:'Source-reported: Success',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms'},
    {title:'Awarapan 2',amount:'₹50+ Cr India (Day 2)',label:'Source-reported: Strong opening',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms'},
    {title:'Vishwanath and Sons',amount:'₹22.25 Cr India (Day 2)',label:'Source-reported: 45% growth',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/vishwanath-and-sons-vs-jana-nayagan-box-office-collections-suriyas-film-grows-45-on-day-2-vijays-film-earns-rs-196-15-crore-in-24-days/articleshow/133268575.cms'},
    {title:'Korean Kanakaraju',amount:'₹25+ Cr worldwide (Day 6)',label:'Source-reported: Steady run',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/telugu/movies/box-office/korean-kanakaraju-box-office-collection-day-6-varun-tejs-horror-comedy-maintains-pace-surpasses-rs-25-crore-worldwide/articleshow/133195957.cms'},
    {title:'Spider-Man: Brand New Day',amount:'Day 17 collection report',label:'Source-reported: Steady theatrical run',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/box-office/spider-man-brand-new-day-box-office-collection-day-17-tom-holland-starrer-sees-big-jump-on-third-saturday-still-lags-behind-massive-awarapan-2-earnings/articleshow/133268642.cms'}
  ];
  const FALLBACK_OTT = [
    {title:'Cocktail 2',meta:'14 Aug 2026 · Netflix',source:'India OTT release report'},
    {title:'Aakhri Sawaal',meta:'14 Aug 2026 · Lionsgate Play',source:'India OTT release report'},
    {title:'A Child of My Own',meta:'13 Aug 2026 · Netflix',source:'India OTT release report'},
    {title:'Reacher Season 4',meta:'12 Aug 2026 · Prime Video',source:'India streaming report'},
    {title:"Don't Say Good Luck",meta:'14 Aug 2026 · Netflix',source:'India OTT release report'}
  ];
  const FALLBACK_NEWS = [
    {title:'Vishwanath and Sons crosses ₹100 crore worldwide in two days',description:'Suriya and Mamitha Baiju starrer crosses the ₹100 crore worldwide milestone in two days.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/tamil/movies/news/suriya-and-mamitha-baiju-starrer-vishwanath-and-sons-crosses-rs-100-crore-worldwide-in-just-two-days/articleshow/133274258.cms'},
    {title:'Awarapan 2 enters the ₹50 crore India club in two days',description:'Awarapan 2 posts a strong opening and crosses ₹50 crore in India in two days.',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms'},
    {title:'I, Nobody OTT release date announced for JioHotstar',description:'Prithviraj Sukumaran starrer I, Nobody is set to stream on JioHotstar from August 25.',source:'Indian Express Malayalam',url:'https://malayalam.indianexpress.com/entertainment/i-nobody-ott-release-date-prithviraj-movie-jio-hotstar-12265448'},
    {title:'Cocktail 2 OTT release sparks fresh online debate',description:'Cocktail 2 is generating renewed online discussion after its OTT release.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/cocktail-2-ott-release-sparks-debate-and-garners-mixed-reviews-netizens-call-shahid-kapoor-kriti-sanon-and-rashmika-mandanna-starrer-a-rage-bait/articleshow/133267514.cms'}
  ];
  const FALLBACK_BUZZ = [
    {title:'Govinda responds to ongoing Sunita Ahuja controversy',description:'Govinda has publicly responded to the ongoing controversy involving Sunita Ahuja and Lock Upp.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/govinda-says-sunita-ahuja-wanted-him-on-lock-upp-not-leaving-any-chance-to-get-me-defamed/articleshow/133277810.cms',label:'Confirmed / reported'},
    {title:'Saif Ali Khan and Kareena Kapoor Khan spotted with family after birthday getaway',description:'The couple were spotted with their sons after returning from Saif Ali Khan’s birthday getaway.',source:'Times of India',url:'https://timesofindia.indiatimes.com/entertainment/hindi/bollywood/news/saif-ali-khan-spotted-with-kareena-kapoor-khan-and-sons-at-airport-back-from-haiwaan-acttors-birthday-getaway/articleshow/133272481.cms',label:'Public buzz'}
  ];
  const FALLBACK_VIRAL = [
    FALLBACK_NEWS[3],
    {title:'Fans and online audiences react to Awarapan 2 box-office surge',description:'The film’s rapid box-office growth is driving fresh fan and audience discussion.',source:'Economic Times',url:'https://m.economictimes.com/magazines/panache/awarapan-2-box-office-collection-day-2-emraan-hashmis-sequel-beats-batwara-1947-enters-rs-50-crore-club-in-india-awarapan-3-update/articleshow/133268852.cms'}
  ];
  const story = (item, i, label) => `<article class="story-item"><div class="story-number">${String(i + 1).padStart(2,'0')}</div><div><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><h3>${esc(item.title)}</h3></a><p><strong>${esc(label || item.label || 'Cinema update')}</strong> · ${esc(item.description || 'Latest entertainment report from the source.')}</p><small class="source-note">${esc(item.source || 'Indian entertainment source')}</small></div></article>`;
  const fill = () => {
    const box = document.getElementById('homeBoxOffice');
    if (box && (!box.querySelector('.content-row') || /temporarily unavailable|No verified live reports/i.test(box.textContent))) box.innerHTML = FALLBACK_BOX.map((x,i) => `<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x.title)}</h3><p><strong>${esc(x.amount)}</strong> · ${esc(x.label)}</p><small>${esc(x.source)}</small></div><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Read →</a></article>`).join('');
    const ott = document.getElementById('homeOtt');
    if (ott && (!ott.querySelector('.content-row') || /temporarily unavailable|No verified live reports/i.test(ott.textContent))) ott.innerHTML = FALLBACK_OTT.map((x,i) => `<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x.title)}</h3><p>${esc(x.meta)}</p><small>${esc(x.source)}</small></div><a href="./pages/search?q=${encodeURIComponent(x.title)}">Search →</a></article>`).join('');
    const editorial = document.getElementById('editorialFeed');
    if (editorial && !editorial.querySelector('.story-item')) editorial.innerHTML = FALLBACK_NEWS.map((x,i) => story(x,i,/announced|statement|official|confirmed/i.test(x.title) ? 'Confirmed / reported' : 'Cinema update')).join('');
    const buzz = document.getElementById('buzzFeed');
    if (buzz && !buzz.querySelector('.story-item')) buzz.innerHTML = FALLBACK_BUZZ.map((x,i) => story(x,i,x.label)).join('');
    const viral = document.getElementById('viralFeed');
    if (viral && !viral.querySelector('.story-item')) viral.innerHTML = FALLBACK_VIRAL.map((x,i) => story(x,i,'Viral cinema')).join('');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(fill, 900)); else setTimeout(fill, 900);
  setTimeout(fill, 3500);
  setTimeout(fill, 9000);
})();
