/* UNNATE — /work/ wall: category filters + project viewer. Needs site.js loaded first. */
(() => {
  'use strict';
  const { esc, ROOT, pieceHTML, tagsHTML, alt } = window.UNNATE;
  const data = window.UNNATE_PORTFOLIO || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wall = $('#wall'), filters = $('#filters'), status = $('#wall-status');
  const GROUPS = ['Brand Identity', 'Websites', 'Content & Creative', 'Campaigns'];
  const file = p => ROOT + p.split('/').map(encodeURIComponent).join('/');
  const num = it => String(data.indexOf(it) + 1).padStart(2, '0');
  let filter = 'all';
  const visible = () => data.filter(i => filter === 'all' || i.group === filter);

  // a category only gets a filter once it has real work in it
  filters.innerHTML = [['all', 'All work', data.length], ...GROUPS.map(g => [g, g, data.filter(i => i.group === g).length])]
    .filter(([, , n]) => n)
    .map(([k, label, n]) => `<button type="button" data-filter="${esc(k)}" aria-pressed="${k === filter}">${esc(label)}<span class="count">${n}</span></button>`).join('');
  const render = () => {
    const list = visible();
    wall.innerHTML = list.map(it => `<li><a class="hung" href="#${encodeURIComponent(it.id)}" data-id="${esc(it.id)}">
        ${pieceHTML(it)}
        <span class="cap"><span class="n" aria-hidden="true">${num(it)}</span>
          <span><h2>${esc(it.title)}</h2><span class="meta">${tagsHTML(it)}</span><p>${esc(it.desc)}</p></span>
        </span></a></li>`).join('');
    status.textContent = `Showing ${list.length} ${list.length === 1 ? 'project' : 'projects'}.`;
  };
  filters.addEventListener('click', e => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    filter = b.dataset.filter;
    $$('[data-filter]', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  render();

  /* viewer */
  const viewer = $('#viewer'), media = $('.viewer-media', viewer), side = $('[data-info]', viewer), count = $('.count', viewer);
  let current = null, opener = null;
  const show = id => {
    const it = data.find(i => i.id === id); if (!it) return false;
    if (filter !== 'all' && it.group !== filter) $('[data-filter="all"]', filters).click();
    current = it;
    media.innerHTML = it.type === 'video'
      ? `<video controls playsinline preload="metadata" poster="${ROOT}assets/work/${esc(it.id)}-poster.webp" aria-label="${esc(it.title)}, video"><source src="${file(it.src)}" type="video/mp4"></video>`
      : `<img src="${ROOT}assets/work/${esc(it.id)}-full.webp" alt="${alt(it)}">`;
    side.innerHTML = `
      <div class="tags">${tagsHTML(it)}</div>
      <h2 class="display" id="viewer-title" tabindex="-1">${esc(it.title)}</h2>
      <p>${esc(it.desc)}</p>
      ${it.type === 'web' ? `<p><a class="btn" href="${file(it.src)}" target="_blank" rel="noopener">Open the live project <span class="arr" aria-hidden="true">→</span><span class="vh"> (opens in a new tab)</span></a></p>` : ''}`;
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
    const card = current && $(`.hung[data-id="${CSS.escape(current.id)}"]`, wall);
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
