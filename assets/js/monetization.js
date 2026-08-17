(() => {
  'use strict';
  const formats = {
    desktop: { key: 'b4b560626f94ccb0ffe06b2047f809ab', width: 728, height: 90 },
    mobile: { key: '85d1302867474481d7c488ca8f3bf6ce', width: 320, height: 50 }
  };
  let nativeAdded = false;
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
    const children = [label, frame];
    if (!nativeAdded) {
      nativeAdded = true;
      const nativeLabel = document.createElement('span');
      nativeLabel.className = 'ad-label';
      nativeLabel.textContent = 'Sponsored recommendations';
      const nativeFrame = document.createElement('iframe');
      nativeFrame.title = 'Sponsored recommendations';
      nativeFrame.width = '100%';
      nativeFrame.height = '280';
      nativeFrame.loading = 'lazy';
      nativeFrame.style.cssText = 'display:block;width:100%;max-width:760px;height:280px;margin:20px auto 0;border:0;overflow:hidden';
      nativeFrame.setAttribute('sandbox','allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
      nativeFrame.setAttribute('referrerpolicy','no-referrer-when-downgrade');
      nativeFrame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:auto;background:transparent}</style></head><body><script async data-cfasync="false" src="https://pl30851771.effectivecpmnetwork.com/a96924b820785181df59f6efdfa8719f/invoke.js"><\\/script><div id="container-a96924b820785181df59f6efdfa8719f"></div></body></html>';
      children.push(nativeLabel, nativeFrame);
    }
    host.replaceChildren(...children);
  }
  function init(){ document.querySelectorAll('[data-ad-slot]').forEach(render); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
