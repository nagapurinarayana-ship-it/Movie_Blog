import { readFile } from 'node:fs/promises';

const requiredPages = [
  'index.html',
  'pages/search.html',
  'pages/trending.html',
  'pages/news.html',
  'pages/category.html',
  'pages/box-office-live.html',
  'pages/ott.html',
  'pages/movie.html',
  'pages/person.html',
  'pages/director.html'
];

const sitemapUrls = [
  'https://movie-blog-bdt.pages.dev/',
  'https://movie-blog-bdt.pages.dev/pages/trending',
  'https://movie-blog-bdt.pages.dev/pages/news',
  'https://movie-blog-bdt.pages.dev/pages/category',
  'https://movie-blog-bdt.pages.dev/pages/box-office-live',
  'https://movie-blog-bdt.pages.dev/pages/ott'
];

const excludedSitemapUrls = [
  'https://movie-blog-bdt.pages.dev/pages/search',
  'https://movie-blog-bdt.pages.dev/pages/person',
  'https://movie-blog-bdt.pages.dev/pages/director'
];

let failed = false;
const exists = async path => {
  try {
    await readFile(path, 'utf8');
    return true;
  } catch (_) {
    return false;
  }
};

for (const path of requiredPages) {
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
for (const url of sitemapUrls) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    failed = true;
    console.error(`FAIL sitemap missing canonical URL ${url}`);
  }
}

for (const url of excludedSitemapUrls) {
  if (sitemap.includes(`<loc>${url}</loc>`)) {
    failed = true;
    console.error(`FAIL sitemap contains non-indexable template URL ${url}`);
  }
}

const robots = await readFile('robots.txt', 'utf8');
if (!robots.includes('Sitemap:')) {
  failed = true;
  console.error('FAIL robots.txt missing Sitemap directive');
}

if (failed) process.exit(1);
console.log('MovieBlog SEO audit passed.');
