/* MovieBlog production shell: one header, one navigation, every page. */
(() => {
  const header=document.querySelector('header.nav');
  if(!header) return;
  const base=location.pathname.includes('/pages/')?'../':'./';
  const links=[['Today',base],['Trending',base+'pages/trending'],['Movies',base+'pages/search'],['OTT',base+'pages/ott'],['News',base+'pages/news'],['Box Office',base+'pages/box-office-live']];
  const path=location.pathname.replace(/\/$/,'');
  const active=label=>label==='Today'?(path===''||path.endsWith('/index.html')):path.endsWith('/'+label.toLowerCase().replace(' ','-'))|| (label==='Movies'&&path.endsWith('/search'))||(label==='Box Office'&&path.endsWith('/box-office-live'));
  header.innerHTML=`<div class="container nav-inner"><div class="brand"><button id="menuToggle" class="hamburger" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button><a href="${base}" class="logo" aria-label="MovieBlog home"><span class="logo-mark">M</span> MovieBlog</a></div><nav id="mainNav" class="main-nav" aria-label="Primary navigation"><ul>${links.map(([label,href])=>`<li><a href="${href}"${active(label)?' aria-current="page"':''}>${label}</a></li>`).join('')}</ul></nav><div class="nav-actions"><a href="${base}pages/search" class="search-link" aria-label="Search movies and entertainment">⌕</a></div></div>`;
  const toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
  if(!location.pathname.includes('/pages/') && !document.querySelector('script[src*="home-live-sections.js"]')){
    const script=document.createElement('script');script.src=`${base}assets/js/home-live-sections.js`;script.defer=true;document.head.appendChild(script);
  }
})();
