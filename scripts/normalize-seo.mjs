import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const site = 'https://movie-blog-bdt.pages.dev';
const dynamic = new Set([
  'pages/movie.html',
  'pages/actor.html',
  'pages/director.html',
  'pages/article.html'
]);
const noindex = new Set([
  'pages/search.html',
  'pages/editorial-queue.html'
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function canonicalFor(rel) {
  if (rel === 'index.html') return `${site}/`;
  return `${site}/${rel}`;
}

let changed = 0;
for (const file of walk(root)) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (dynamic.has(rel)) continue;

  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  const canonical = canonicalFor(rel);
  const canonicalTag = `<link rel="canonical" href="${canonical}">`;
  const canonicalRe = /<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>/i;
  if (canonicalRe.test(html)) html = html.replace(canonicalRe, canonicalTag);
  else html = html.replace(/<\/head>/i, `${canonicalTag}</head>`);

  const robotsTag = noindex.has(rel)
    ? '<meta name="robots" content="noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">'
    : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
  const robotsRe = /<meta\s+name=["']robots["'][^>]*>/i;
  if (robotsRe.test(html)) html = html.replace(robotsRe, robotsTag);
  else html = html.replace(/<\/head>/i, `${robotsTag}</head>`);

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
  }
}

const sitemapPath = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/movie-blog-bdt\.pages\.dev\/pages\/search<\/loc>\s*<\/url>/g, '');
  sitemap = sitemap.replaceAll('https://movie-blog-bdt.pages.dev/pages/contact</loc>', 'https://movie-blog-bdt.pages.dev/pages/contact.html</loc>');
  sitemap = sitemap.replaceAll('https://movie-blog-bdt.pages.dev/pages/privacy</loc>', 'https://movie-blog-bdt.pages.dev/pages/privacy.html</loc>');
  sitemap = sitemap.replaceAll('https://movie-blog-bdt.pages.dev/pages/terms</loc>', 'https://movie-blog-bdt.pages.dev/pages/terms.html</loc>');
  sitemap = sitemap.replaceAll('https://movie-blog-bdt.pages.dev/pages/disclaimer</loc>', 'https://movie-blog-bdt.pages.dev/pages/disclaimer.html</loc>');
  fs.writeFileSync(sitemapPath, sitemap);
  changed++;
}

console.log(`SEO normalization complete: ${changed} files updated.`);
