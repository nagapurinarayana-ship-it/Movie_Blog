(() => {
  const POPUNDER = 'https://pl30851769.effectivecpmnetwork.com/1c/c7/e4/1cc7e4e406db4b9476e0f28559c0b9a8.js';
  const SOCIAL_BAR = 'https://pl30851772.effectivecpmnetwork.com/67/81/f1/6781f148df67e59df827d9028b51be69.js';
  const NATIVE_SRC = 'https://pl30851771.effectivecpmnetwork.com/a96924b820785181df59f6efdfa8719f/invoke.js';
  const NATIVE_CONTAINER_ID = 'container-a96924b820785181df59f6efdfa8719f';
  const BANNER_468_SRC = 'https://www.highperformanceformat.com/63e6ab533495630055076eb684026b90/invoke.js';
  const BANNER_468_KEY = '63e6ab533495630055076eb684026b90';
  const BANNER_728_SRC = 'https://www.highperformanceformat.com/b4b560626f94ccb0ffe06b2047f809ab/invoke.js';
  const BANNER_728_KEY = 'b4b560626f94ccb0ffe06b2047f809ab';
  const BANNER_320_SRC = 'https://www.highperformanceformat.com/85d1302867474481d7c488ca8f3bf6ce/invoke.js';
  const BANNER_320_KEY = '85d1302867474481d7c488ca8f3bf6ce';
  const BANNER_300_SRC = 'https://www.highperformanceformat.com/e2b5aeccaccd5399e3ca497e7d30b95b/invoke.js';
  const BANNER_300_KEY = 'e2b5aeccaccd5399e3ca497e7d30b95b';
  const BANNER_160X300_SRC = 'https://www.highperformanceformat.com/2d3550da16b1b6f1294563a97a9b21d9/invoke.js';
  const BANNER_160X300_KEY = '2d3550da16b1b6f1294563a97a9b21d9';
  const BANNER_160X600_SRC = 'https://www.highperformanceformat.com/33768b1090012fa1b3cae3845bc9a074/invoke.js';
  const BANNER_160X600_KEY = '33768b1090012fa1b3cae3845bc9a074';
  const SMARTLINK = 'https://www.effectivecpmnetwork.com/yjevb0bc?key=4f5ce136b4df6a95c4e824c66aaeb316';

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
    // Adsterra recommends one popunder per page. Social Bar is also global.
    addScript(POPUNDER);
    addScript(SOCIAL_BAR);
  }

  function createHost(className = 'ad-slot-generated') {
    const host = document.createElement('div');
    host.className = `ad-slot ${className}`;
    host.setAttribute('aria-label', 'Advertisement');
    return host;
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
    wrapper.style.cssText = 'max-width:100%;overflow:hidden;text-align:center;min-height:' + height + 'px';
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = `Advertisement · ${width}×${height}`;
    const options = document.createElement('script');
    options.textContent = `atOptions = { key: '${key}', format: 'iframe', height: ${height}, width: ${width}, params: {} };`;
    const loader = document.createElement('script');
    loader.src = src;
    wrapper.append(label, options, loader);
    host.appendChild(wrapper);
  }

  function addResponsiveBanner(host) {
    if (!host) return;
    const desktop = document.createElement('div');
    desktop.className = 'ad-desktop-only';
    addBanner(desktop, BANNER_728_KEY, BANNER_728_SRC, 728, 90);
    const mobile = document.createElement('div');
    mobile.className = 'ad-mobile-only';
    addBanner(mobile, BANNER_320_KEY, BANNER_320_SRC, 320, 50);
    host.append(desktop, mobile);
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

  function prepareHost(host) {
    if (!host) return;
    host.replaceChildren();
    host.removeAttribute('aria-hidden');
    host.classList.remove('ad-slot-disabled');
    host.classList.add('ad-slot-active');
  }

  function mountPlacement(host, placement) {
    if (!host) return;
    prepareHost(host);

    if (placement === 'homeTop') {
      addNative(host);
      addBanner(host, BANNER_468_KEY, BANNER_468_SRC, 468, 60);
      return;
    }
    if (placement === 'homeMid' || placement === 'articleMid') {
      addResponsiveBanner(host);
      return;
    }
    if (placement === 'articleTop') {
      addNative(host);
      return;
    }
    if (placement === 'sidebar') {
      const desktop = document.createElement('div');
      desktop.className = 'ad-desktop-only';
      addBanner(desktop, BANNER_300_KEY, BANNER_300_SRC, 300, 250);
      addBanner(desktop, BANNER_160X300_KEY, BANNER_160X300_SRC, 160, 300);
      host.appendChild(desktop);
      return;
    }
    if (placement === 'sidebarTall') {
      const desktop = document.createElement('div');
      desktop.className = 'ad-desktop-only';
      addBanner(desktop, BANNER_160X600_KEY, BANNER_160X600_SRC, 160, 600);
      host.appendChild(desktop);
      return;
    }
    if (placement === 'articleEnd') {
      addSmartlink(host);
    }
  }

  function autoCreateSlots() {
    if (document.querySelector('[data-ad-slot]')) return;
    const path = location.pathname.toLowerCase();
    const isLegal = /\/(privacy|terms|disclaimer|contact|about)(\.html)?$/.test(path);
    if (isLegal) return;

    const main = document.querySelector('main');
    if (!main) return;

    const top = createHost('ad-slot-auto-top');
    top.dataset.adSlot = path.includes('/article') || path.includes('/movie') || path.includes('/actor') || path.includes('/director') ? 'articleTop' : 'homeTop';
    main.insertBefore(top, main.firstChild);

    const sections = [...main.querySelectorAll('section')];
    if (sections.length > 1) {
      const mid = createHost('ad-slot-auto-mid');
      mid.dataset.adSlot = 'articleMid';
      sections[Math.min(1, sections.length - 1)].after(mid);
    }

    const end = createHost('ad-slot-auto-end');
    end.dataset.adSlot = 'articleEnd';
    main.appendChild(end);
  }

  loadConfig().then(config => {
    const enabled = Boolean(config?.enabled && config?.provider === 'effectivecpm');
    const placements = config?.placements || {};

    if (!enabled) {
      document.querySelectorAll('[data-ad-slot]').forEach(host => host.setAttribute('aria-hidden', 'true'));
      return;
    }

    autoCreateSlots();
    addGlobalScripts();

    document.querySelectorAll('[data-ad-slot]').forEach(host => {
      const placement = host.dataset.adSlot;
      if (placements[placement]) mountPlacement(host, placement);
      else host.setAttribute('aria-hidden', 'true');
    });
  });
})();
