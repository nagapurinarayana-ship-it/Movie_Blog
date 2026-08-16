(() => {
  const root=document.getElementById('trendFeed');
  if(!root)return;
  const safe=v=>String(v||'').replace(/\s+/g,' ').trim();
  async function load(){
    try{
      const r=await fetch('./api/trends',{cache:'no-store'}); if(!r.ok)throw Error('trend api');
      const d=await r.json(); const rows=Array.isArray(d.trends)?d.trends.slice(0,6):[];
      root.replaceChildren();
      if(!rows.length){root.innerHTML='<p class="muted">No strong entertainment signals are available right now.</p>';return;}
      rows.forEach((x,i)=>{
        const a=document.createElement('a');a.className='trend-item';a.href=x.openUrl||'./pages/trending';
        const rank=document.createElement('span');rank.className='trend-rank';rank.textContent=String(i+1).padStart(2,'0');
        const body=document.createElement('span');body.className='trend-item-body';
        const h=document.createElement('strong');h.textContent=safe(x.title)||'Entertainment trend';
        const p=document.createElement('small');p.textContent=`${x.traffic||'Trending'} · ${x.relevance==='high'?'High entertainment relevance':'Entertainment signal'}`;
        body.append(h,p);a.append(rank,body);root.appendChild(a);
      });
    }catch(_){root.innerHTML='<p class="muted">Trending signals are temporarily unavailable.</p>';}
  }
  load();
})();
