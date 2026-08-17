(() => {
  const list = document.getElementById('trendList');
  const status = document.getElementById('trendStatus');
  const refresh = document.getElementById('trendRefresh');
  const filter = document.getElementById('trendFilter');
  const requestedTopic = (new URLSearchParams(location.search).get('topic') || '').trim();
  const heading = document.querySelector('main h1');

  if (!list || !status) return;

  let trends = [];

  if (requestedTopic && heading) {
    heading.textContent = `Trending topic: ${requestedTopic}`;
  }

  const showStatus = message => {
    status.textContent = message;
  };

  const normalize = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function badge(value) {
    const element = document.createElement('span');
    element.className = `trend-badge trend-${value}`;
    element.textContent = value === 'high'
      ? 'High opportunity'
      : value === 'medium'
        ? 'Possible opportunity'
        : 'Entertainment topic';
    return element;
  }

  function selectedRows() {
    const selected = filter?.value || 'all';
    let rows = selected === 'all'
      ? trends
      : trends.filter(item => item.relevance === selected);

    if (!requestedTopic) return rows;

    const wanted = normalize(requestedTopic);
    const match = trends.find(item => {
      const title = normalize(item.headline || item.title);
      return title === wanted || title.includes(wanted) || wanted.includes(title);
    });

    if (match) return [match];

    return [{
      title: requestedTopic,
      headline: requestedTopic,
      score: null,
      relevance: 'medium',
      bucket: 'trending',
      explanation: 'This topic was selected from MovieBlog’s latest homepage feed. Open MovieBlog Search for related movies, cast details and current entertainment information.',
      openUrl: `./search?q=${encodeURIComponent(requestedTopic)}`,
      synthetic: true
    }];
  }

  function render() {
    const rows = selectedRows();
    list.replaceChildren();

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'trend-empty';
      empty.textContent = 'No matching entertainment signals right now.';
      list.appendChild(empty);
      return;
    }

    rows.slice(0, 50).forEach(item => {
      const card = document.createElement('article');
      card.className = 'trend-card';

      const top = document.createElement('div');
      top.className = 'trend-top';

      const title = document.createElement('h2');
      title.textContent = item.headline || item.title;

      const score = document.createElement('strong');
      score.className = 'trend-score';
      score.textContent = item.score == null ? 'Live' : String(item.score);
      top.append(title, score);

      const meta = document.createElement('p');
      meta.className = 'trend-meta';
      meta.textContent = [
        item.traffic || (item.synthetic ? 'Selected from the MovieBlog homepage' : 'Search volume unavailable'),
        item.pubDate ? new Date(item.pubDate).toLocaleString() : ''
      ].filter(Boolean).join(' • ');

      const description = document.createElement('p');
      description.className = 'trend-description';
      description.textContent = item.explanation || item.description || 'Search interest is rising around this topic.';

      const actions = document.createElement('div');
      actions.className = 'trend-actions';
      actions.appendChild(badge(item.relevance || 'medium'));

      if (item.bucket) {
        const bucket = document.createElement('span');
        bucket.className = 'trend-badge';
        bucket.textContent = item.bucket === 'buzz' ? 'BUZZ' : item.bucket === 'viral' ? 'VIRAL' : 'TRENDING';
        actions.appendChild(bucket);
      }

      if (item.caution) {
        const caution = document.createElement('small');
        caution.className = 'trend-caution';
        caution.textContent = item.caution;
        actions.appendChild(caution);
      }

      const target = item.openUrl || (Array.isArray(item.newsUrls) && item.newsUrls[0]) || './search';
      const link = document.createElement('a');
      link.href = target;
      link.className = 'secondary-btn';
      link.textContent = item.synthetic
        ? 'Search MovieBlog'
        : item.newsUrls?.length
          ? 'Read Related Story'
          : 'Explore Topic';

      if (/^https?:\/\//i.test(target) && !target.startsWith(location.origin)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      actions.appendChild(link);
      card.append(top, meta, description, actions);
      list.appendChild(card);
    });
  }

  async function load() {
    showStatus(requestedTopic ? `Loading “${requestedTopic}”…` : 'Loading India entertainment pulse…');
    refresh?.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch('../api/trends', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      trends = Array.isArray(data.trends) ? data.trends : [];
      if (window.MovieBlogTrendEngine) {
        trends = window.MovieBlogTrendEngine.transform(trends);
      }

      render();
      const live = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : 'now';
      showStatus(requestedTopic
        ? `Showing the selected topic • trends refreshed ${live}.`
        : `${trends.length} entertainment signals • refreshed ${live}.`);

      if (data.error && !requestedTopic) {
        showStatus(`${data.error} The dashboard will recover automatically.`);
      }
    } catch (_) {
      trends = [];
      render();
      showStatus(requestedTopic
        ? 'Showing the selected topic while live trend data reconnects.'
        : 'Trending data is temporarily unavailable. Try again shortly.');
    } finally {
      refresh?.removeAttribute('aria-busy');
    }
  }

  refresh?.addEventListener('click', load);
  filter?.addEventListener('change', render);
  load();
})();
