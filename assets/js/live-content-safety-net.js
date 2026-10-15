/* MovieBlog live-content safety net.
   Empty provider responses must never resurrect stale box-office, OTT or news claims. */
(() => {
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const contentRow = (title, message) => `
    <article class="content-row empty-state">
      <div><h3>${esc(title)}</h3><p>${esc(message)}</p></div>
    </article>`;

  const storyState = (title, message) => `
    <article class="story-item empty-state">
      <div><h3>${esc(title)}</h3><p>${esc(message)}</p></div>
    </article>`;

  const fill = () => {
    const box = document.getElementById('homeBoxOffice');
    if (box && (!box.querySelector('.content-row') || /temporarily unavailable|No verified live reports/i.test(box.textContent))) {
      box.innerHTML = contentRow(
        'Box-office data temporarily unavailable',
        'We do not show old collection figures when a fresh, source-backed update is unavailable. Please check again later.'
      );
    }

    const ott = document.getElementById('homeOtt');
    if (ott && (!ott.querySelector('.content-row') || /temporarily unavailable|No verified live reports/i.test(ott.textContent))) {
      ott.innerHTML = contentRow(
        'OTT availability could not be verified',
        'Streaming dates and platform availability can change. We will show listings again when current source-backed data is available.'
      );
    }

    const editorial = document.getElementById('editorialFeed');
    if (editorial && !editorial.querySelector('.story-item')) {
      editorial.innerHTML = storyState(
        'No verified live reports available',
        'The live news feed did not return a verified story. We will not substitute an old headline or present an unverified claim as current.'
      );
    }

    const buzz = document.getElementById('buzzFeed');
    if (buzz && !buzz.querySelector('.story-item')) {
      buzz.innerHTML = storyState(
        'Public-buzz feed unavailable',
        'No current source-backed public-buzz items are available right now.'
      );
    }

    const viral = document.getElementById('viralFeed');
    if (viral && !viral.querySelector('.story-item')) {
      viral.innerHTML = storyState(
        'Viral cinema feed unavailable',
        'No current source-backed viral stories are available right now.'
      );
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(fill, 900));
  } else {
    setTimeout(fill, 900);
  }
  setTimeout(fill, 3500);
  setTimeout(fill, 9000);
})();
