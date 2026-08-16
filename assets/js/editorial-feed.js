(() => {
  const root = document.getElementById('editorialFeed');
  if (!root) return;
  const labels = {confirmed:'CONFIRMED',buzz:'BUZZ',rumour:'RUMOUR',viral:'VIRAL',explained:'EXPLAINED'};
  const esc = value => String(value || '');
  async function load(){
    try {
      const response = await fetch('../data/editorial.json', {cache:'no-store'});
      if (!response.ok) throw new Error('editorial unavailable');
      const data = await response.json();
      const stories = Array.isArray(data.stories) ? data.stories : [];
      root.replaceChildren();
      if (!stories.length) {
        const p=document.createElement('p'); p.className='muted'; p.textContent='Fresh cinema stories will appear here as MovieBlog publishes original coverage.'; root.appendChild(p); return;
      }
      stories.slice(0,12).forEach(story=>{
        const article=document.createElement('article'); article.className='story-item';
        const meta=document.createElement('div'); meta.className='story-meta';
        const badge=document.createElement('span'); badge.className=`status-badge status-${story.status||'explained'}`; badge.textContent=labels[story.status]||'UPDATE'; meta.appendChild(badge);
        if(story.publishedAt){const time=document.createElement('time'); time.dateTime=story.publishedAt; time.textContent=new Date(story.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}); meta.appendChild(time);}
        const h=document.createElement('h3'); h.textContent=esc(story.title);
        const p=document.createElement('p'); p.textContent=esc(story.excerpt||story.whyTrending);
        article.append(meta,h,p);
        if(story.url){const a=document.createElement('a');a.href=story.url;a.textContent='Read more →';a.className='text-link';article.appendChild(a);}
        root.appendChild(article);
      });
    } catch (_) { root.innerHTML='<p class="muted">Editorial feed is being refreshed.</p>'; }
  }
  load();
})();
