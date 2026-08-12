const RSS_URL = 'https://trends.google.com/trending/rss?geo=IN';

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

function extractItems(xml) {
  return [...xml.matchAll(/<item>([\\s\\S]*?)<\\/item>/gi)].map(match => match[1]).map(block => ({
    title: tag(block, 'title'),
    traffic: tag(block, 'ht:approx_traffic'),
    description: tag(block, 'description'),
    link: tag(block, 'link'),
    pubDate: tag(block, 'pubDate')
  })).filter(item => item.title);
}

const ENTERTAINMENT_TERMS = [
  'movie','film','cinema','trailer','actor','actress','celebrity','ott','netflix','prime video','jiohotstar','zee5','sony liv','series','web series','song','singer','bollywood','tollywood','kollywood','mollywood','hollywood','tv show','television','review','box office','release date'
];

function classify(title, description) {
  const haystack = `${title} ${description}`.toLowerCase();
  const matched = ENTERTAINMENT_TERMS.filter(term => haystack.includes(term));
  if (matched.length >= 2) return 'high';
  if (matched.length === 1) return 'medium';
  return 'low';
}

function score(item) {
  const relevance = classify(item.title, item.description);
  const relevanceScore = relevance === 'high' ? 55 : relevance === 'medium' ? 30 : 0;
  const traffic = String(item.traffic || '').toLowerCase();
  const trafficScore = traffic.includes('500k') || traffic.includes('1m') || traffic.includes('10l') ? 35 : traffic.includes('200k') || traffic.includes('100k') || traffic.includes('5l') ? 28 : traffic.includes('50k') || traffic.includes('20k') || traffic.includes('2l') ? 20 : traffic.includes('10k') || traffic.includes('1l') ? 12 : 6;
  return Math.min(100, relevanceScore + trafficScore + 10);
}

export async function onRequestGet() {
  try {
    const response = await fetch(RSS_URL, { headers: { accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!response.ok) throw new Error(`Google Trends returned ${response.status}`);
    const xml = await response.text();
    const trends = extractItems(xml).map(item => ({
      ...item,
      relevance: classify(item.title, item.description),
      score: score(item)
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
