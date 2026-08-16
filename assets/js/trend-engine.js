/* MovieBlog Trend Engine: turns raw India trend signals into clear editorial buckets. */
(function(){
  const entertainment=/movie|film|cinema|trailer|teaser|actor|actress|celebrity|ott|netflix|prime video|jiohotstar|hotstar|zee5|series|web series|song|music|bollywood|tollywood|kollywood|mollywood|hollywood|review|box office|cast|director|producer|episode|season|streaming|theatrical|anime|marvel|dc/i;
  const gossip=/rumou?r|dating|relationship|marriage|breakup|engagement|spotted|affair|secret|wedding|controvers|clash|feud|fans think|reportedly/i;
  const viral=/viral|meme|trending|internet|social media|reels|instagram|youtube|x\\.com|fans|reaction|views|broke the internet/i;
  function bucket(t){const s=[t.title,t.description,...(t.newsTitles||[])].join(' ');if(gossip.test(s))return'buzz';if(viral.test(s))return'viral';return'trending'}
  function clean(v){return String(v||'').replace(/\\s+/g,' ').trim()}
  function transform(items){return(items||[]).filter(x=>x.relevance!=='low'||entertainment.test([x.title,x.description].join(' '))).map((x,i)=>{const b=bucket(x);return{...x,rank:i+1,bucket:b,headline:clean(x.title)||'Entertainment topic is trending in India',status:x.relevance==='high'?'rising':'watch',explanation:clean(x.description)||'Search interest is rising around this entertainment topic.',caution:b==='buzz'?'Unconfirmed discussion — treat as buzz, not fact.':null}})}
  window.MovieBlogTrendEngine={transform,bucket};
})();
