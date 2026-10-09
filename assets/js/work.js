/* UNNATE — /work/ gallery: filters + project viewer. Needs site.js loaded first. */
(() => {
  'use strict';
  const { cardHTML, esc, ROOT } = window.UNNATE;
  const data = window.UNNATE_PORTFOLIO || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const grid = $('#grid'), filters = $('#filters'), status = $('#grid-status');
  const TYPES = [['all', 'All work'], ['web', 'Websites'], ['creative', 'Creatives'], ['video', 'Short-form video']];
  const file = p => ROOT + p.split('/').map(encodeURIComponent).join('/');
  let filter = 'all';
  const visible = () => data.filter(i => filter === 'all' || i.type === filter);

  filters.innerHTML = TYPES.map(([k, label]) => {
    const n = k === 'all' ? data.length : data.filter(i => i.type === k).length;
    return n ? `<button type="button" data-filter="${k}" aria-pressed="${k === filter}">${label}<span class="count">${n}</span></button>` : '';
  }).join('');
  const renderGrid = () => {
    const list = visible();
    grid.innerHTML = list.map(it => `<li>${cardHTML(it, '#' + encodeURIComponent(it.id))}</li>`).join('');
    status.textContent = `Showing ${list.length} ${list.length === 1 ? 'project' : 'projects'}.`;
  };
  filters.addEventListener('click', e => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    filter = b.dataset.filter;
    $$('[data-filter]', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderGrid();
  });
  renderGrid();

  /* viewer */
  const viewer = $('#viewer'), media = $('.viewer-media', viewer), side = $('[data-info]', viewer), count = $('.car-count', viewer);
  let current = null, opener = null;
  const show = id => {
    const it = data.find(i => i.id === id); if (!it) return false;
    if (filter !== 'all' && it.type !== filter) { $('[data-filter="all"]', filters).click(); }
    current = it;
    const alt = esc(it.alt || `${it.title}: ${it.category.toLowerCase()}`);
    media.innerHTML = it.type === 'video'
      ? `<video controls playsinline preload="metadata" poster="${ROOT}assets/work/${esc(it.id)}-poster.webp" aria-label="${esc(it.title)}, video"><source src="${file(it.src)}" type="video/mp4"></video>`
      : `<img src="${ROOT}assets/work/${esc(it.id)}-full.webp" alt="${alt}">`;
    side.innerHTML = `
      <div class="chips"><span class="chip chip-cat">${esc(it.category)}</span>${it.kind ? `<span class="chip chip-kind">${esc(it.kind)}</span>` : ''}</div>
      <h2 class="h-display" id="viewer-title" tabindex="-1">${esc(it.title)}</h2>
      <p>${esc(it.desc)}</p>
      ${it.type === 'web' ? `<p><a class="btn btn-orange" href="${file(it.src)}" target="_blank" rel="noopener">Open the live project <span class="arr" aria-hidden="true">→</span><span class="vh"> (opens in a new tab)</span></a></p>` : ''}`;
    const list = visible();
    count.textContent = `${list.indexOf(it) + 1} of ${list.length}`;
    if (!viewer.open) {
      opener = document.activeElement;
      viewer.showModal();
      document.documentElement.classList.add('locked');
    }
    viewer.scrollTop = 0;
    $('#viewer-title', viewer).focus({ preventScroll: true });
    return true;
  };
  const step = d => {
    const list = visible(); const i = list.indexOf(current);
    const next = list[(i + d + list.length) % list.length];
    history.replaceState(null, '', '#' + encodeURIComponent(next.id));
    show(next.id);
  };
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && id !== 'main') { if (!show(id)) history.replaceState(null, '', location.pathname); }
    else if (viewer.open) viewer.close();
  };
  viewer.addEventListener('close', () => {
    media.innerHTML = '';                                   // stops any playing video
    document.documentElement.classList.remove('locked');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const card = current && $(`.card[data-id="${CSS.escape(current.id)}"]`, grid);
    (card || opener)?.focus({ preventScroll: true });
    current = null;
  });
  viewer.addEventListener('click', e => {
    if (e.target === viewer || e.target.closest('[data-close]')) viewer.close();
    else if (e.target.closest('[data-prev]')) step(-1);
    else if (e.target.closest('[data-next]')) step(1);
  });
  viewer.addEventListener('keydown', e => {
    if (e.target.closest('video')) return;                  // leave arrow keys to the video scrubber
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
