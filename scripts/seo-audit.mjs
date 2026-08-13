import { readFile } from 'node:fs/promises';

const requiredRoutes = [
  'pages/search.html',
  'pages/trending.html',
  'pages/news.html',
  'pages/category.html',
  'pages/box-office.html',
  'pages/ott.html',
  'pages/movie.html',
  'pages/actor.html',
  'pages/director.html'
];

const canonicalRoutes = [
  '/pages/search',
  '/pages/trending',
  '/pages/news',
  '/pages/category',
  '/pages/box-office',
  '/pages/ott',
  '/pages/movie',
  '/pages/actor',
  '/pages/director'
];

const htmlFiles = ['index.html', ...requiredRoutes];
let failed = false;

const exists = async path => {
  try { await readFile(path, 'utf8'); return true; } catch (_) { return false; }
};

for (const path of htmlFiles) {
  if (!(await exists(path))) {
    failed = true;
    console.error(`FAIL missing ${path}`);
    continue;
  }
  const html = await readFile(path, 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"']) {
    if (!html.includes(marker)) {
      failed = true;
      console.error(`FAIL ${path}: missing ${marker}`);
    }
  }
  console.log(`PASS ${path}`);
}

const sitemap = await readFile('sitemap.xml', 'utf8');
for (const route of canonicalRoutes) {
  if (!sitemap.includes(route)) {
    failed = true;
    console.error(`FAIL sitemap missing canonical route ${route}`);
  }
}

const robots = await readFile('robots.txt', 'utf8');
if (!robots.includes('Sitemap:')) {
  failed = true;
  console.error('FAIL robots.txt missing Sitemap directive');
}

if (failed) process.exit(1);
console.log('MovieBlog SEO audit passed.');
