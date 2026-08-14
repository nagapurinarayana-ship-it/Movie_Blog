(() => {
  const POPUNDER = 'https://pl30815332.effectivecpmnetwork.com/98/cd/4d/98cd4d37b3a5c234c49c85952c033714.js';
  const SOCIAL_BAR = 'https://pl30815335.effectivecpmnetwork.com/e7/87/aa/e787aa4e8d5075169853c0d1fe5fcabc.js';
  const NATIVE_SRC = 'https://pl30815334.effectivecpmnetwork.com/29feded00f4ae2c8a3b2719189977fff/invoke.js';
  const NATIVE_CONTAINER_ID = 'container-29feded00f4ae2c8a3b2719189977fff';
  const BANNER_468_SRC = 'https://www.highperformanceformat.com/75b0fc4d7ef9bda7dbda8e3863498abc/invoke.js';
  const BANNER_728_SRC = 'https://www.highperformanceformat.com/b5828b9099d859c0a506e4067dd77370/invoke.js';
  const BANNER_468_KEY = '75b0fc4d7ef9bda7dbda8e3863498abc';
  const BANNER_728_KEY = 'b5828b9099d859c0a506e4067dd77370';
  const SMARTLINK = 'https://www.effectivecpmnetwork.com/hcit0ft2?key=3383ae2b2a94f70103f6b28c372f4f72';

  async function loadConfig() {
    try {
      const current = document.currentScript;
      const base = current?.src ? new URL('../../config/monetization.json', current.src).href : './config/monetization.json';
      const response = await fetch(base, { cache: 'no-store' });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function addScript(src, options = {}) {
    if (document.querySelector(`script[src="${src}"]`)) return null;
    const script = document.createElement('script');
    script.src = src;
    if (options.async) script.async = true;
    if (options.cfasync) script.dataset.cfasync = 'false';
    document.head.appendChild(script);
    return script;
  }

  function addGlobalScripts() {
    addScript(POPUNDER);
    addScript(SOCIAL_BAR);
  }

  function addNative(host) {
    if (!host || host.querySelector(`#${NATIVE_CONTAINER_ID}`)) return;
    const container = document.createElement('div');
    container.id = NATIVE_CONTAINER_ID;
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Advertisement';
    host.append(label, container);
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = NATIVE_SRC;
    host.appendChild(script);
  }

  function addBanner(host, key, src, width, height) {
    if (!host) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'ad-banner';
    wrapper.style.cssText = 'max-width:100%;overflow:hidden;text-align:center';
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = `Advertisement · ${width}×${height}`;
    const frame = document.createElement('div');
    const options = document.createElement('script');
    options.textContent = `atOptions = { key: '${key}', format: 'iframe', height: ${height}, width: ${width}, params: {} };`;
    const loader = document.createElement('script');
    loader.src = src;
    wrapper.append(label, frame, options, loader);
    host.appendChild(wrapper);
  }

  function addSmartlink(host) {
    if (!host) return;
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Sponsored';
    const link = document.createElement('a');
    link.href = SMARTLINK;
    link.target = '_blank';
    link.rel = 'sponsored noopener noreferrer';
    link.textContent = 'Explore sponsored offers →';
    host.append(label, link);
  }

  function mountPlacement(host, placement) {
    if (!host) return;
    host.replaceChildren();
    host.removeAttribute('aria-hidden');
    host.classList.remove('ad-slot-disabled');
    host.classList.add('ad-slot-active');

    if (placement === 'homeTop' || placement === 'articleTop') {
      addNative(host);
      return;
    }
    if (placement === 'homeMid' || placement === 'articleMid' || placement === 'sidebar') {
      addBanner(host, BANNER_728_KEY, BANNER_728_SRC, 728, 90);
      return;
    }
    if (placement === 'articleEnd') {
      addSmartlink(host);
    }
  }

  loadConfig().then(config => {
    const enabled = Boolean(config?.enabled && config?.provider === 'effectivecpm');
    const placements = config?.placements || {};
    const hosts = document.querySelectorAll('[data-ad-slot]');

    if (!enabled) {
      hosts.forEach(host => host.setAttribute('aria-hidden', 'true'));
      return;
    }

    addGlobalScripts();
    hosts.forEach(host => {
      const placement = host.dataset.adSlot;
      if (placements[placement]) mountPlacement(host, placement);
      else host.setAttribute('aria-hidden', 'true');
    });
  });
})();
