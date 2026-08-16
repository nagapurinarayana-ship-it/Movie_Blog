(() => {
  if (!document.getElementById('editorialFeed')) return;
  const esc=s=>String(s||'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const date=s=>s?new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'';
  const story=(x,i,label)=>`<article class="story-item"><div class="story-number">${String(i+1).padStart(2,'0')}</div><div><div class="story-meta"><span class="status-badge status-${label==='RUMOUR'?'rumour':label==='VIRAL'?'viral':'confirmed'}">${label}</span>${x.pubDate?`<time>${date(x.pubDate)}</time>`:''}</div><h3><a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></h3><p>${esc(x.description||'Latest entertainment report from the source.')}</p><small class="source-note">${esc(x.source||'Source report')}</small></div></article>`;
  async function get(type){const r=await fetch(`./api/editorial?type=${type}`,{cache:'no-store'});if(!r.ok)throw Error('feed');return r.json()}
  async function load(){
    const [news,gossip,ott]=await Promise.allSettled([get('news'),get('gossip'),get('ott')]);
    const newsItems=news.status==='fulfilled'?(news.value.items||[]):[];
    const gossipItems=gossip.status==='fulfilled'?(gossip.value.items||[]):[];
    const ottItems=ott.status==='fulfilled'?(ott.value.items||[]):[];
    const editorial=document.getElementById('editorialFeed'); editorial.replaceChildren();
    if(newsItems.length) editorial.innerHTML=newsItems.slice(0,6).map((x,i)=>story(x,i,/official|confirmed|announced|statement|revealed/i.test(`${x.title} ${x.description}`)?'CONFIRMED / REPORTED':'UPDATE')).join('');
    else editorial.innerHTML='<p class="muted">No fresh cinema reports are available right now.</p>';
    const buzz=document.getElementById('buzzFeed');
    if(buzz){buzz.replaceChildren();if(gossipItems.length)buzz.innerHTML=gossipItems.slice(0,4).map((x,i)=>story(x,i,'RUMOUR')).join('');else buzz.innerHTML='<p class="muted">No current celebrity or movie rumour passed the source check.</p>';}
    const viral=document.getElementById('viralFeed');
    if(viral){const viralItems=newsItems.filter(x=>/viral|meme|internet|social media|instagram|youtube|reaction|views|fans/i.test(`${x.title} ${x.description}`));viral.replaceChildren();if(viralItems.length)viral.innerHTML=viralItems.slice(0,5).map((x,i)=>story(x,i,'VIRAL')).join('');else viral.innerHTML='<p class="muted">No strong entertainment viral signal is available right now.</p>';}
    const utility=document.querySelector('.utility-strip');
    if(utility){utility.replaceChildren();const items=ottItems.slice(0,3);if(items.length)items.forEach(x=>{const d=document.createElement('div');d.innerHTML=`<strong><a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></strong><span>${esc(x.source||'OTT report')} · ${date(x.pubDate)}</span>`;utility.appendChild(d)});else utility.innerHTML='<div><strong>No fresh OTT releases found</strong><span>We will refresh the India streaming scan shortly.</span></div><div><strong>Watch Tonight</strong><span>See our current recommendations above.</span></div><div><strong>Indian cinema</strong><span>Regional streaming picks.</span></div>';}
  }
  load().catch(()=>{});
})();
