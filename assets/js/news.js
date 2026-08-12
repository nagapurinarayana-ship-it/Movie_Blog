(() => {
  const root = document.getElementById('newsList');
  if (!root) return;
  const source = '../data/articles.json';

  const esc = (value) => String(value ?? '');
  const card = (article) => {
    const el = document.createElement('article');
    el.className = 'card news-card';
    const body = document.createElement('div');
    body.className = 'card-body';
    const type = document.createElement('p'); type.className = 'eyebrow'; type.textContent = article.category || 'Entertainment';
    const h2 = document.createElement('h2'); h2.textContent = article.title || 'Untitled';
    const meta = document.createElement('p'); meta.className = 'meta'; meta.textContent = `${article.publishedAt || ''}${article.author ? ` • ${article.author}` : ''}`;
    const excerpt = document.createElement('p'); excerpt.className = 'overview'; excerpt.textContent = article.excerpt || article.description || '';
    const a = document.createElement('a'); a.className = 'secondary-btn'; a.href = `article.html?id=${encodeURIComponent(article.id)}`; a.textContent = 'Read story';
    body.append(type, h2, meta, excerpt, a);
    el.appendChild(body);
    return el;
  };

  fetch(source, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('News data unavailable')))
    .then(data => {
      const articles = Array.isArray(data?.articles) ? data.articles : [];
      root.replaceChildren();
      if (!articles.length) {
        const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No stories are published yet. Research opportunities can be reviewed in Trending Radar.'; root.appendChild(p); return;
      }
      articles.sort((a,b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))).forEach(article => root.appendChild(card(article)));
    })
    .catch(() => { root.textContent = 'News could not be loaded right now.'; });
})();
