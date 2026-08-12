(() => {
  const root = document.getElementById('queue');
  if (!root) return;

  const esc = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));

  fetch('../data/content-opportunities.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Could not load queue')))
    .then(data => {
      const items = Array.isArray(data.opportunities) ? data.opportunities : [];
      if (!items.length) {
        root.innerHTML = '<p class="muted">No opportunities queued.</p>';
        return;
      }
      root.innerHTML = items
        .sort((a,b) => Number(b.priority || 0) - Number(a.priority || 0))
        .map(item => `
          <article class="card news-card">
            <div class="card-body">
              <p class="eyebrow">${esc(item.cluster || 'content')}</p>
              <h2>${esc(item.topic)}</h2>
              <p class="meta">Priority ${esc(item.priority)} • ${esc(item.status || 'research')}</p>
              <p class="overview">${esc(item.whyNow || '')}</p>
              <p class="source-note"><strong>Search intent:</strong> ${esc((item.intent || []).join(' • '))}</p>
              <p class="source-note"><strong>Gate:</strong> ${esc(item.publishGate || 'Verify before publishing.')}</p>
            </div>
          </article>`)
        .join('');
    })
    .catch(error => {
      root.innerHTML = `<p class="muted">${esc(error.message)}</p>`;
    });
})();
