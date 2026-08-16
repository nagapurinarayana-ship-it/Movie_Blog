(() => {
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const main=document.getElementById('main'),movies=document.querySelector('section[aria-labelledby="movies-title"]');
  if(!main||!movies)return;
  const make=(html)=>{const e=document.createElement('section');e.className='container section content-priority';e.innerHTML=html;return e};
  const box=make('<div class="section-head"><div><p class="kicker">BOX OFFICE · INDIA</p><h2>💰 Box Office: numbers & crowd pull</h2><p class="muted">Current reported collections and source-reported verdict signals. No posters — just the numbers people are looking for.</p></div><a href="./pages/box-office-live">See full box office →</a></div><div id="homeBoxOffice" class="content-table"><div class="loading">Loading current box-office numbers…</div></div>');
  const ott=make('<div class="section-head"><div><p class="kicker">OTT · INDIA</p><h2>📺 New on OTT & what people are watching</h2><p class="muted">Fresh streaming reports, platforms and watch-worthy picks — text first, no poster clutter.</p></div><a href="./pages/ott">Explore OTT →</a></div><div id="homeOtt" class="content-table"><div class="loading">Checking current OTT releases…</div></div>');
  main.insertBefore(box,movies);main.insertBefore(ott,movies);
  const render=(root,items,type)=>{if(!root)return;if(!items.length){root.innerHTML='<p class="muted">No verified live reports are available right now. The source scan will refresh automatically.</p>';return}root.innerHTML=items.slice(0,8).map((x,i)=>`<article class="content-row"><span class="content-rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(x.movieTitle||x.title)}</h3><p>${type==='box'?`<strong>${esc(x.amount||'Collection report available')}</strong> · ${esc(x.verdict||'Current report')}`:esc(x.title)}</p><small>${esc(x.source||'Indian entertainment source')} · ${x.pubDate?esc(new Date(x.pubDate).toLocaleDateString('en-IN')):''}</small></div><a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer">Read →</a></article>`).join('')};
  const story=(x,i,label)=>`<article class="story-item"><div class="story-number">${String(i+1).padStart(2,'0')}</div><div><a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer"><h3>${esc(x.title)}</h3></a><p><strong>${esc(label)}</strong> · ${esc(x.description||'Latest entertainment report from the source.')}</p><small class="source-note">${esc(x.source||'Entertainment source')} · ${x.pubDate?esc(new Date(x.pubDate).toLocaleDateString('en-IN')):''}</small></div></article>`;
  const fillLiveSections=(feed)=>{
    const news=Array.isArray(feed.news)?feed.news:[],buzz=Array.isArray(feed.buzz)?feed.buzz:[],viral=Array.isArray(feed.viral)?feed.viral:[];
    const editorial=document.getElementById('editorialFeed');
    if(editorial && !editorial.querySelector('.story-item')) editorial.innerHTML=news.slice(0,6).map((x,i)=>story(x,i,/confirmed|official|announced|statement|revealed/i.test(`${x.title} ${x.description}`)?'Confirmed / reported':'Cinema update')).join('')||'<p class="muted">No fresh cinema reports passed the source check.</p>';
    const buzzRoot=document.getElementById('buzzFeed');
    if(buzzRoot && !buzzRoot.querySelector('.story-item')) buzzRoot.innerHTML=buzz.slice(0,4).map((x,i)=>story(x,i,/confirmed|official|announced|statement/i.test(`${x.title} ${x.description}`)?'Confirmed / reported':'Rumour / buzz')).join('')||'<div class="mini-item"><span>Public buzz</span><h3>No current celebrity or movie rumour passed the source check.</h3></div>';
    const viralRoot=document.getElementById('viralFeed');
    if(viralRoot && !viralRoot.querySelector('.story-item')) viralRoot.innerHTML=viral.slice(0,5).map((x,i)=>story(x,i,'Viral cinema')).join('')||'<p class="muted">No strong entertainment viral signal is available from the latest source scan.</p>';
  };
  const json=async(url)=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`${r.status}`);return r.json()};
  Promise.allSettled([json('./api/box-office-feed'),json('./api/home-feed')]).then(([b,h])=>{
    render(document.getElementById('homeBoxOffice'),b.status==='fulfilled'?(b.value.items||[]):[],'box');
    const feed=h.status==='fulfilled'?h.value:{};
    fillLiveSections(feed);
    const ott=(feed.news||[]).filter(x=>/ott|netflix|prime|jiohotstar|zee5|streaming|release/i.test(`${x.title} ${x.description}`));
    render(document.getElementById('homeOtt'),ott,'ott');
  });
  setTimeout(()=>{
    ['homeBoxOffice','homeOtt'].forEach(id=>{const root=document.getElementById(id);if(root&&root.querySelector('.loading'))root.innerHTML='<p class="muted">Live source data is temporarily unavailable; the next refresh will retry automatically.</p>'});
  },10000);
  main.appendChild(movies);
})();
