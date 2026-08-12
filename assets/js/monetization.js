(() => {
  async function loadConfig() {
    try {
      const response = await fetch('./config/monetization.json', { cache: 'no-store' });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function mountPlaceholder(placement, label) {
    const host = document.querySelector(`[data-ad-slot="${placement}"]`);
    if (!host) return;
    host.replaceChildren();
    host.classList.add('ad-slot-disabled');
    const text = document.createElement('span');
    text.textContent = label;
    host.appendChild(text);
  }

  loadConfig().then(config => {
    const enabled = Boolean(config?.enabled && config?.provider);
    document.querySelectorAll('[data-ad-slot]').forEach(host => {
      if (!enabled) host.setAttribute('aria-hidden', 'true');
    });
    if (!enabled) {
      ['homeTop', 'homeMid', 'articleTop', 'articleMid', 'articleEnd', 'sidebar'].forEach(key => mountPlaceholder(key, ''));
      return;
    }
    // Provider-specific script loading intentionally lives behind the feature flag.
    // No third-party advertising code is loaded until the provider and placements are configured.
  });
})();
