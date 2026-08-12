(() => {
  const root = document.getElementById('article');
  const id = new URLSearchParams(location.search).get('id');
  if (!root || !id) { if (root) root.textContent = 'Missing story id.'; return; }

  function addText(parent, tag, value, className) { const el=document.createElement(tag); el.textContent=value || ''; if(className)el.className=className; parent.appendChild(el); return el; }
  function entityLinks(container, article, entities) {
    const names = new Set([...(article.entities?.actors || []), ...(article.entities?.directors || []), ...(article.entities?.movies || [])].map(x => String(x).toLowerCase()));
    if (!names.size) return;
    const wrap = document.createElement('div'); wrap.className='entity-list-inline';
    const actors = new Map((entities.actors || []).map(x => [String(x.name).toLowerCase(), x]));
    const directors = new Map((entities.directors || []).map(x => [String(x.name).toLowerCase(), x]));
    const movies = new Map((entities.movies || []).map(x => [String(x.title).toLowerCase(), x]));
    names.forEach(key => {
      const movie = movies.get(key); const actor = actors.get(key); const director = directors.get(key);
      if (movie) { const a=document.createElement('a'); a.className='entity-link'; a.href=`movie.html?id=${encodeURIComponent(movie.id)}`; a.textContent=movie.title; wrap.appendChild(a); }
      else if (actor) { const a=document.createElement('a'); a.className='entity-link'; a.href=`actor.html?id=${encodeURIComponent(actor.id)}`; a.textContent=actor.name; wrap.appendChild(a); }
      else if (director) { const a=document.createElement('a'); a.className='entity-link'; a.href=`director.html?id=${encodeURIComponent(director.id)}`; a.textContent=director.name; wrap.appendChild(a); }
    });
    if (wrap.children.length) { addText(container,'h2','Related Entities'); container.appendChild(wrap); }
  }

  Promise.all([
    fetch('../data/articles.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
    fetch('../data/entities.json',{cache:'no-store'}).then(r=>r.ok?r.json():{actors:[],directors:[],movies:[]})
  ]).then(([data, entities]) => {
    const article = (data.articles || []).find(x => String(x.id) === String(id));
    if (!article) { root.textContent='Story not found.'; return; }
    document.title = `${article.title} — MovieBlog`;
    document.querySelector('meta[name="description"]').setAttribute('content', String(article.excerpt || article.description || article.title).slice(0,155));
    root.replaceChildren();
    addText(root,'p',article.category || 'Entertainment','eyebrow');
    addText(root,'h1',article.title);
    addText(root,'p',`${article.publishedAt || ''}${article.author ? ` • ${article.author}` : ''}`,'meta');
    if (article.image) { const img=document.createElement('img'); img.className='article-image'; img.loading='eager'; img.src=article.image; img.alt=article.imageAlt || article.title; root.appendChild(img); }
    const content = document.createElement('div'); content.className='article-content';
    const paragraphs = Array.isArray(article.paragraphs) ? article.paragraphs : (article.body ? [article.body] : []);
    paragraphs.forEach(p => addText(content,'p',p));
    root.appendChild(content);
    entityLinks(root, article, entities);
    if (article.sourceName && article.sourceUrl) { const p=document.createElement('p'); p.className='muted'; p.textContent='Source: '; const a=document.createElement('a'); a.href=article.sourceUrl; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent=article.sourceName; p.appendChild(a); root.appendChild(p); }
    const schema = {'@context':'https://schema.org','@type':'NewsArticle','headline':article.title,'datePublished':article.publishedAt || undefined,'author':article.author ? {'@type':'Person','name':article.author} : undefined,'description':article.excerpt || article.description || undefined,'mainEntityOfPage':location.href};
    const script=document.createElement('script'); script.type='application/ld+json'; script.textContent=JSON.stringify(schema); document.head.appendChild(script);
  }).catch(() => { root.textContent='Story could not be loaded right now.'; });
})();
