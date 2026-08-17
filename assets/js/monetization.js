(() => {
  'use strict';
  const formats = {
    desktop: { key: 'b4b560626f94ccb0ffe06b2047f809ab', width: 728, height: 90, src: 'https://www.highperformanceformat.com/b4b560626f94ccb0ffe06b2047f809ab/invoke.js' },
    mobile: { key: '85d1302867474481d7c488ca8f3bf6ce', width: 320, height: 50, src: 'https://www.highperformanceformat.com/85d1302867474481d7c488ca8f3bf6ce/invoke.js' }
  };
  let queue = Promise.resolve();
  function render(host) {
    if (!host || host.dataset.bannerLoaded === '1') return;
    host.dataset.bannerLoaded = '1';
    host.removeAttribute('aria-hidden');
    host.setAttribute('aria-label', 'Advertisement');
    const format = matchMedia('(min-width: 760px)').matches ? formats.desktop : formats.mobile;
    host.innerHTML = '<span class="ad-label">Advertisement · ' + format.width + '×' + format.height + '</span><div class="ad-banner" style="max-width:100%;overflow:hidden;text-align:center;min-height:' + format.height + 'px"></div>';
    const target = host.querySelector('.ad-banner');
    queue = queue.then(() => new Promise(resolve => {
      window.atOptions = { key: format.key, format: 'iframe', height: format.height, width: format.width, params: {} };
      const script = document.createElement('script');
      script.src = format.src;
      script.onload = script.onerror = () => { delete window.atOptions; resolve(); };
      target.appendChild(script);
    }));
  }
  function init(){ document.querySelectorAll('[data-ad-slot]').forEach(render); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
