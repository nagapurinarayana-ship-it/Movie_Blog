import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/monetization.json', 'utf8'));
const homepage = fs.readFileSync('index.html', 'utf8');
const middleware = fs.readFileSync('functions/_middleware.js', 'utf8');
const loader = fs.readFileSync('assets/js/monetization.js', 'utf8');

if (config.enabled !== true || config.provider !== 'adsterra-safe') {
  throw new Error('Reviewed safe monetization configuration must be enabled.');
}

if (config.placements?.homeTop !== true) {
  throw new Error('The labelled homepage placement must remain enabled.');
}

const scriptReferences = homepage.match(/assets\/js\/monetization\.js/g) || [];
if (scriptReferences.length !== 1) {
  throw new Error('The homepage must load exactly one monetization script.');
}

if (middleware.includes('monetization.js')) {
  throw new Error('Cloudflare middleware must not inject a second monetization script.');
}

for (const marker of ['POPUNDER_SRC', 'SOCIAL_BAR_SRC', 'pl30851769', 'pl30851772', 'highperformancecpmgate.com']) {
  if (loader.includes(marker) || middleware.includes(marker)) {
    throw new Error(`Unsafe monetization marker remains executable: ${marker}`);
  }
}

for (const requiredMarker of ['highperformanceformat.com', 'pl30851771', 'Advertisement', 'Sponsored recommendations', 'sandbox', 'data-movieblog-banners']) {
  if (!loader.includes(requiredMarker)) {
    throw new Error(`Missing reviewed monetization requirement: ${requiredMarker}`);
  }
}

const rules = Array.isArray(config.rules) ? config.rules.join(' ').toLowerCase() : '';
for (const requiredRule of ['popunders', 'social bars', 'forced redirects', 'automatic tab-opening']) {
  if (!rules.includes(requiredRule)) {
    throw new Error(`Missing monetization safety rule: ${requiredRule}`);
  }
}

console.log('Monetization audit passed: one sandboxed banner/native loader with no popunder or social-bar code.');
