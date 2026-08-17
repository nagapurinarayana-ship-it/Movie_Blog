import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/monetization.json', 'utf8'));
const homepage = fs.readFileSync('index.html', 'utf8');
const middleware = fs.readFileSync('functions/_middleware.js', 'utf8');
const loader = fs.readFileSync('assets/js/monetization.js', 'utf8');

const forbiddenNetworkMarkers = [
  'effectivecpmnetwork.com',
  'highperformanceformat.com',
  'highperformancecpmgate.com',
  'pl30851769',
  'pl30851771',
  'pl30851772'
];

if (config.enabled !== false || config.provider !== 'disabled') {
  throw new Error('Monetization must remain disabled until a reviewed provider is configured.');
}

if (Object.values(config.placements || {}).some(Boolean)) {
  throw new Error('Every monetization placement must be disabled.');
}

if (homepage.includes('monetization.js')) {
  throw new Error('The homepage must not load the retired monetization script.');
}

if (middleware.includes('monetization.js')) {
  throw new Error('Cloudflare middleware must not inject the retired monetization script.');
}

for (const marker of forbiddenNetworkMarkers) {
  if (loader.includes(marker) || middleware.includes(marker)) {
    throw new Error(`Retired ad-network marker remains executable: ${marker}`);
  }
}

const rules = Array.isArray(config.rules) ? config.rules.join(' ').toLowerCase() : '';
for (const requiredRule of ['popunders', 'forced redirects', 'automatic tab-opening']) {
  if (!rules.includes(requiredRule)) {
    throw new Error(`Missing monetization safety rule: ${requiredRule}`);
  }
}

console.log('Monetization audit passed: retired redirecting network is disabled and not injected.');
