import { readFile } from 'node:fs/promises';

// Canonical public routes. The repository may retain legacy .html files for
// compatibility, but sitemap coverage is checked against the clean URLs used
// by canonical tags and internal navigation.
const requiredRoutes = [
  { file: 'pages/search.html', url: '/pages/search' },
  { file: 'pages/trending.html', url: '/pages/trending' },
  { file: 'pages/news.html', url: '/pages/news' },
  { file: 'pages/category.html', url: '/pages/category' },
  { file: 'pages/box-office.html', url: '/pages/box-office' },
  { file: 'pages/ott.html', url: '/pages/ott' },
  { file: 'pages/movie.html', url: '/pages/movie' },
  { file: 'pages/person.html', url: '/pages/person' },
  { file: 'pages/director.html', url: '/pages/director' }
];

const htmlFiles = ['index.html', ...requiredRoutes.map(x => x.file)];
let failed = false;
const exists = async path => { try { await readFile(path, 'utf8'); return true; } catch (_) { return false; } };

for (const path of htmlFiles) {
  if (!(await exists(path))) { failed = true; console.error(`FAIL missing ${path}`); continue; }
  const html = await readFile(path, 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"']) {
    if (!html.includes(marker)) { failed = true; console.error(`FAIL ${path}: missing ${marker}`); }
  }
  console.log(`PASS ${path}`);
}

const sitemap = await readFile('sitemap.xml', 'utf8');
for (const route of requiredRoutes) {
  if (!sitemap.includes(route.url)) { failed = true; console.error(`FAIL sitemap missing canonical route ${route.url}`); }
}

const robots = await readFile('robots.txt', 'utf8');
if (!robots.includes('Sitemap:')) { failed = true; console.error('FAIL robots.txt missing Sitemap directive'); }

if (failed) process.exit(1);
console.log('MovieBlog SEO audit passed.');
