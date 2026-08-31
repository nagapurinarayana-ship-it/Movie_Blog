import { readFile } from 'node:fs/promises';

const site = 'https://movie-blog-bdt.pages.dev';
const pages = [
  ['index.html', `${site}/`, true],
  ['pages/search.html', `${site}/pages/search`, false],
  ['pages/trending.html', `${site}/pages/trending`, true],
  ['pages/news.html', `${site}/pages/news`, true],
  ['pages/category.html', `${site}/pages/category`, true],
  ['pages/box-office-live.html', `${site}/pages/box-office-live`, true],
  ['pages/ott.html', `${site}/pages/ott`, true],
  ['pages/movie.html', `${site}/pages/movie`, true],
  ['pages/person.html', `${site}/pages/person`, false],
  ['pages/director.html', `${site}/pages/director`, false]
];

const sitemapUrls = [
  `${site}/`,
  `${site}/pages/trending`,
  `${site}/pages/news`,
  `${site}/pages/category`,
  `${site}/pages/box-office-live`,
  `${site}/pages/ott`
];

const excludedSitemapUrls = [
  `${site}/pages/search`,
  `${site}/pages/person`,
  `${site}/pages/director`
];

let failed = false;
const titles = new Map();

const fail = message => {
  failed = true;
  console.error(`FAIL ${message}`);
};

for (const [path, canonical, shouldIndex] of pages) {
  let html;
  try {
    html = await readFile(path, 'utf8');
  } catch (_) {
    fail(`missing ${path}`);
    continue;
  }

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)?.[1]?.trim();
  const canonicalHref = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)/i)?.[1] || '';

  if (!title || title.length < 20 || title.length > 70) fail(`${path}: title missing or poor length`);
  if (!description || description.length < 70 || description.length > 180) fail(`${path}: description missing or poor length`);
  if (canonicalHref !== canonical) fail(`${path}: canonical should be ${canonical}, got ${canonicalHref || 'missing'}`);

  if (shouldIndex && !/index/.test(robots)) fail(`${path}: expected indexable robots directive`);
  if (!shouldIndex && !/noindex/.test(robots)) fail(`${path}: dynamic/search template must be noindex`);
  if (!/follow/.test(robots)) fail(`${path}: robots directive must allow follow`);

  if (shouldIndex) {
    for (const marker of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'property="og:image"']) {
      if (!html.includes(marker)) fail(`${path}: missing ${marker}`);
    }
    if (!html.includes('name="twitter:card"')) fail(`${path}: missing Twitter card metadata`);
  }

  if (title) {
    if (titles.has(title) && shouldIndex) fail(`${path}: duplicates title used by ${titles.get(title)}`);
    else titles.set(title, path);
  }

  console.log(`PASS ${path}`);
}

const sitemap = await readFile('sitemap.xml', 'utf8');
for (const url of sitemapUrls) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap missing canonical URL ${url}`);
}
for (const url of excludedSitemapUrls) {
  if (sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap contains non-indexable template URL ${url}`);
}
if (/<loc>[^<]*[?&](?:q|page)=/i.test(sitemap)) fail('sitemap contains search/pagination parameter URLs');

const robots = await readFile('robots.txt', 'utf8');
if (!robots.includes(`Sitemap: ${site}/sitemap.xml`)) fail('robots.txt missing exact production sitemap directive');
if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) fail('robots.txt should allow public crawling');

const home = await readFile('index.html', 'utf8');
if (!home.includes('max-image-preview:large')) fail('homepage should allow large image previews');
if (!home.includes(`${site}/og-image.jpg`)) fail('homepage should expose preferred 1200x630 image metadata');
if (!home.includes('"@type":"WebSite"')) fail('homepage missing WebSite structured data');

if (failed) process.exit(1);
console.log('MovieBlog SEO audit passed.');
