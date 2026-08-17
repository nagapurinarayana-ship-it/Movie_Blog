(() => {
  'use strict';
  const formats = {
    desktop: { key: 'b4b560626f94ccb0ffe06b2047f809ab', width: 728, height: 90 },
    mobile: { key: '85d1302867474481d7c488ca8f3bf6ce', width: 320, height: 50 }
  };
  function render(host) {
    if (!host || host.dataset.bannerLoaded === '1') return;
    host.dataset.bannerLoaded = '1';
    host.removeAttribute('aria-hidden');
    host.setAttribute('aria-label', 'Advertisement');
    const ad = matchMedia('(min-width:760px)').matches ? formats.desktop : formats.mobile;
    const label = document.createElement('span');
    label.className = 'ad-label';
    label.textContent = 'Advertisement · ' + ad.width + '×' + ad.height;
    const frame = document.createElement('iframe');
    frame.title = 'Advertisement';
    frame.width = String(ad.width);
    frame.height = String(ad.height);
    frame.loading = 'eager';
    frame.style.cssText = 'display:block;width:' + ad.width + 'px;max-width:100%;height:' + ad.height + 'px;margin:8px auto 0;border:0;overflow:hidden';
    frame.setAttribute('sandbox','allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
    frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');
    frame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={key:"' + ad.key + '",format:"iframe",height:' + ad.height + ',width:' + ad.width + ',params:{}};<\/script><script src="https://www.highperformanceformat.com/' + ad.key + '/invoke.js"><\/script></body></html>';
    host.replaceChildren(label, frame);
  }
  function init(){ document.querySelectorAll('[data-ad-slot]').forEach(render); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
