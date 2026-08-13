/* Shared entity URL helpers. */
(() => {
  const ENTITY_URL = '../data/entities.json';

  async function loadEntities() {
    try {
      const response = await fetch(ENTITY_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Entity data request failed: ${response.status}`);
      const data = await response.json();
      return { actors: Array.isArray(data.actors) ? data.actors : [], directors: Array.isArray(data.directors) ? data.directors : [] };
    } catch (_) { return { actors: [], directors: [] }; }
  }

  function slugify(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function entityUrl(type, entity) { return `../pages/${type}?id=${encodeURIComponent(entity.id || slugify(entity.name))}`; }
  function movieUrl(id) { return `../pages/movie?id=${encodeURIComponent(id)}`; }

  function findEntity(collection, id) {
    const target = String(id || '').toLowerCase();
    return collection.find(item => String(item.id || '').toLowerCase() === target || slugify(item.name) === target);
  }

  function makeLink(type, entity) {
    const link = document.createElement('a');
    link.href = entityUrl(type, entity);
    link.textContent = entity.name;
    link.className = 'entity-link';
    return link;
  }

  window.MovieBlogEntities = { loadEntities, slugify, entityUrl, movieUrl, findEntity, makeLink };
})();
