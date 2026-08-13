const RSS_URL = 'https://trends.google.com/trending/rss?geo=IN';
const TRENDS_WEB_URL = 'https://trends.google.com/trending?geo=IN';

function xmlDecode(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? xmlDecode(match[1].trim()) : '';
}

function allTags(block, name) {
  return [...block.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'gi'))]
    .map(match => xmlDecode(match[1].trim()))
    .filter(Boolean);
}

function extractItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]).map(block => ({
    title: tag(block, 'title'),
    traffic: tag(block, 'ht:approx_traffic'),
    description: tag(block, 'description'),
    link: tag(block, 'link'),
    pubDate: tag(block, 'pubDate'),
    newsTitles: allTags(block, 'ht:news_item_title'),
    newsUrls: allTags(block, 'ht:news_item_url'),
    newsSources: allTags(block, 'ht:news_item_source')
  })).filter(item => item.title);
}

const ENTERTAINMENT_TERMS = [
  'movie','movies','film','films','cinema','trailer','teaser','actor','actress','celebrity','celebrities','ott','netflix','prime video','jiohotstar','hotstar','zee5','sony liv','series','web series','web-series','song','singer','music','bollywood','tollywood','kollywood','mollywood','hollywood','tv show','television','review','reviews','box office','release date','star cast','cast','director','producer','episode','season','streaming','theatrical','marvel','dc comics','superhero','anime','k-pop','kpop'
];

const ENTERTAINMENT_NEGATIVE_TERMS = [
  'stock market','inflation','bank','investment','road construction','highway','bus accident','ration card','e-kyc','election','minister','parliament','court','police','crime','weather','shaving','medical','disease','hospital','fuel price','gold price','share price','index'
];

function classify(title, description, newsTitles = [], newsSources = []) {
  const haystack = [title, description, ...newsTitles, ...newsSources].join(' ').toLowerCase();
  const matched = ENTERTAINMENT_TERMS.filter(term => haystack.includes(term));
  const negativeMatched = ENTERTAINMENT_NEGATIVE_TERMS.filter(term => haystack.includes(term));
  if (matched.length >= 2) return 'high';
  if (matched.length === 1 && negativeMatched.length === 0) return 'medium';
  return 'low';
}

function score(item) {
  const relevance = classify(item.title, item.description, item.newsTitles, item.newsSources);
  const relevanceScore = relevance === 'high' ? 55 : relevance === 'medium' ? 30 : 0;
  const traffic = String(item.traffic || '').toLowerCase();
  const trafficScore = traffic.includes('500k') || traffic.includes('1m') || traffic.includes('10l') ? 35 : traffic.includes('200k') || traffic.includes('100k') || traffic.includes('5l') ? 28 : traffic.includes('50k') || traffic.includes('20k') || traffic.includes('2l') ? 20 : traffic.includes('10k') || traffic.includes('1l') ? 12 : traffic.includes('5k') || traffic.includes('2k') || traffic.includes('1k') ? 10 : 6;
  const newsBonus = Math.min(10, (item.newsTitles?.length || 0) * 2);
  return Math.min(100, relevanceScore + trafficScore + newsBonus + 10);
}

export async function onRequestGet() {
  try {
    const response = await fetch(RSS_URL, { headers: { accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!response.ok) throw new Error(`Google Trends returned ${response.status}`);
    const xml = await response.text();
    const trends = extractItems(xml).map(item => ({
      ...item,
      relevance: classify(item.title, item.description, item.newsTitles, item.newsSources),
      score: score(item),
      // Never expose the Google Trends RSS endpoint as a clickable destination.
      // Prefer the first related news article; otherwise use the normal Trends UI.
      openUrl: item.newsUrls?.[0] || TRENDS_WEB_URL
    })).sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({
      source: 'Google Trends Trending Now RSS',
      geo: 'IN',
      fetchedAt: new Date().toISOString(),
      trends
    }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=600, s-maxage=600'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      source: 'Google Trends Trending Now RSS',
      geo: 'IN',
      fetchedAt: new Date().toISOString(),
      trends: [],
      error: 'Trending data is temporarily unavailable.'
    }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' }
    });
  }
}
