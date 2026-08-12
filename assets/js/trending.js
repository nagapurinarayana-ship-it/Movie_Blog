(() => {
  const list = document.getElementById('trendList');
  const status = document.getElementById('trendStatus');
  const refresh = document.getElementById('trendRefresh');
  const filter = document.getElementById('trendFilter');
  if (!list || !status) return;

  let trends = [];

  function showStatus(message) { status.textContent = message; }

  function badge(value) {
    const el = document.createElement('span');
    el.className = `trend-badge trend-${value}`;
    el.textContent = value === 'high' ? 'High opportunity' : value === 'medium' ? 'Possible opportunity' : 'Not entertainment focused';
    return el;
  }

  function render() {
    const selected = filter?.value || 'all';
    const rows = selected === 'all' ? trends : trends.filter(item => item.relevance === selected);
    list.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'trend-empty';
      empty.textContent = 'No matching trend opportunities right now.';
      list.appendChild(empty);
      return;
    }

    rows.slice(0, 50).forEach(item => {
      const card = document.createElement('article');
      card.className = 'trend-card';
      const top = document.createElement('div');
      top.className = 'trend-top';
      const title = document.createElement('h2');
      title.textContent = item.title;
      const score = document.createElement('strong');
      score.className = 'trend-score';
      score.textContent = String(item.score);
      top.append(title, score);
      const meta = document.createElement('p');
      meta.className = 'trend-meta';
      meta.textContent = [item.traffic || 'Search volume unavailable', item.pubDate ? new Date(item.pubDate).toLocaleString() : ''].filter(Boolean).join(' • ');
      const description = document.createElement('p');
      description.className = 'trend-description';
      description.textContent = item.description || 'Google Trends related-search details are available from the source feed.';
      const actions = document.createElement('div');
      actions.className = 'trend-actions';
      actions.appendChild(badge(item.relevance));
      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'secondary-btn';
        link.textContent = 'Open Trend';
        actions.appendChild(link);
      }
      card.append(top, meta, description, actions);
      list.appendChild(card);
    });
  }

  async function load() {
    showStatus('Loading India trends…');
    refresh?.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('../api/trends', { cache: 'no-store' });
      const data = await response.json();
      trends = Array.isArray(data.trends) ? data.trends : [];
      render();
      const live = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : 'now';
      showStatus(`${trends.length} trend signals • source refreshed ${live}.`);
      if (data.error) showStatus(`${data.error} The dashboard will recover automatically on the next refresh.`);
    } catch (_) {
      trends = [];
      render();
      showStatus('Trending data is temporarily unavailable. Try again shortly.');
    } finally {
      refresh?.removeAttribute('aria-busy');
    }
  }

  refresh?.addEventListener('click', load);
  filter?.addEventListener('change', render);
  load();
})();
