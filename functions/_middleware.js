export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (context.request.method !== 'GET' || !contentType.includes('text/html')) {
    return response;
  }

  const pathname = new URL(context.request.url).pathname.toLowerCase();
  if (/\/(privacy|terms|disclaimer|contact|about)(\.html)?$/.test(pathname)) {
    return response;
  }

  const html = await response.text();
  if (html.includes('/assets/js/monetization.js')) {
    return new Response(html, response);
  }

  const injected = html.replace(
    /<\/body>/i,
    '<script src="/assets/js/monetization.js" defer></script></body>'
  );

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
