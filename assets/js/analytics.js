(() => {
  function allowedEnvironment() {
    return typeof navigator !== 'undefined' && navigator.doNotTrack !== '1';
  }

  async function init() {
    if (!allowedEnvironment()) return;
    try {
      const response = await fetch('./config/analytics.json', { cache: 'no-store' });
      if (!response.ok) return;
      const config = await response.json();
      if (!config.enabled || !config.provider || !config.measurementId) return;

      // Provider loading stays behind explicit configuration. Do not add
      // third-party analytics code until the site operator enables it.
      window.MovieBlogAnalytics = {
        provider: config.provider,
        track: (name, params = {}) => {
          if (window.gtag) window.gtag('event', name, params);
        }
      };
    } catch (_) {}
  }

  init();
})();
