// Simple cookie-consent and AdSense loader.
// Place this file under static/js and include it in pages that will show ads.

(function () {
  function hasConsent() {
    return localStorage.getItem('ads_consent') === 'true';
  }

  function setConsent(val) {
    localStorage.setItem('ads_consent', val ? 'true' : 'false');
  }

  function showBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.style = 'position:fixed;left:0;right:0;bottom:0;background:#111;color:#fff;padding:12px 16px;display:flex;align-items:center;gap:12px;z-index:9999;';
    banner.innerHTML = `
      <div style="flex:1">We use cookies and ads to personalise content and analyse traffic. By clicking "Accept" you agree to our use of cookies and displaying ads.</div>
      <div>
        <button id="cc-accept" style="margin-right:8px;padding:8px 12px;border:none;background:#0b84ff;color:white;border-radius:4px;">Accept</button>
        <button id="cc-decline" style="padding:8px 12px;border:1px solid #ccc;background:transparent;color:#fff;border-radius:4px;">Decline</button>
      </div>
    `;
    document.body.appendChild(banner);
    document.getElementById('cc-accept').addEventListener('click', function () {
      setConsent(true);
      loadAdsifNeeded();
      banner.remove();
    });
    document.getElementById('cc-decline').addEventListener('click', function () {
      setConsent(false);
      banner.remove();
    });
  }

  function getPublisherId() {
    try {
      const el = document.getElementById('adsense-config');
      if (!el) return null;
      const cfg = JSON.parse(el.textContent || '{}');
      return cfg.publisherId || null;
    } catch (e) {
      return null;
    }
  }

  function injectAdsenseScript(publisherId) {
    if (!publisherId) return;
    if (document.getElementById('adsbygoogle-js')) return;
    const s = document.createElement('script');
    s.id = 'adsbygoogle-js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    s.setAttribute('data-ad-client', publisherId);
    document.head.appendChild(s);
  }

  function loadAdsifNeeded() {
    if (!hasConsent()) return;
    const pub = getPublisherId();
    if (!pub) return;
    injectAdsenseScript(pub);
    // Reveal ad containers by removing the 'ads-hidden' class
    document.querySelectorAll('.ad-placeholder.ads-hidden').forEach(el => el.classList.remove('ads-hidden'));
    // Initialize ad slots
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', function () {
    if (!('localStorage' in window)) return;
    if (hasConsent()) {
      loadAdsifNeeded();
    } else {
      showBanner();
    }
  });
})();
