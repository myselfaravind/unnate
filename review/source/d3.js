/* Design 03: the lens in the hero, the tilting mosaic with its filters, and the button that pulls toward the pointer. */
(() => {
  const { $, $$, esc, DATA, img, reduce, fine, follow, arrive } = UN;
  /* the lens: a circle of the second layer, following the pointer (or a finger), resting over the last word */
  const hero = $('[data-lens-area]'), lens = $('[data-lens]'), ring = $('[data-ring]');
  const R = () => Math.max(58, Math.min(innerWidth * .15, 210));
  const put = (x, y) => { for (const el of [lens, ring]) { el.style.setProperty('--x', x.toFixed(1) + 'px'); el.style.setProperty('--y', y.toFixed(1) + 'px'); el.style.setProperty('--r', R() + 'px'); } };
  const f = follow(put, .16);
  const home = () => { const em = $('h1 em', hero).getBoundingClientRect(), r = hero.getBoundingClientRect(); return [em.left - r.left + em.width / 2, em.top - r.top + em.height / 2]; };
  const rest = jump => { const [x, y] = home(); f.to(x, y, jump); };
  rest(true);
  document.fonts?.ready.then(() => rest(true));
  addEventListener('resize', () => rest(true));
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); f.to(e.clientX - r.left, e.clientY - r.top); });
  hero.addEventListener('pointerleave', () => rest(false));

  /* work: filters and a mosaic whose pieces lean toward the pointer */
  const GROUPS = ['Websites', 'Content & Creative', 'Campaigns'].filter(g => DATA.some(i => i.group === g));
  const filters = $('[data-filters]'), mosaic = $('[data-mosaic]'), status = $('[data-status]');
  let filter = 'all';
  filters.innerHTML = [['all', 'All work'], ...GROUPS.map(g => [g, g])].map(([k, l]) => `<button type="button" data-filter="${esc(k)}" aria-pressed="${k === filter}">${esc(l)}</button>`).join('');
  const render = () => {
    const list = DATA.filter(i => filter === 'all' || i.group === filter);
    mosaic.innerHTML = list.map((it, i) => `<li data-reveal style="--d:${(i % 4) * .05}s"><a href="#work" data-project="${esc(it.id)}"${filter === 'all' ? '' : ` data-scope="${esc(filter)}"`}><span class="shot">${img(it, false)}</span><h3>${esc(it.title)}</h3><p class="meta">${esc(it.category)}${it.kind ? ' / ' + esc(it.kind) : ''}</p><p>${esc(it.desc)}</p></a></li>`).join('');
    status.textContent = `Showing ${list.length} ${list.length === 1 ? 'project' : 'projects'}.`;
    arrive($$('[data-reveal]', mosaic));
  };
  filters.addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter; $$('[data-filter]', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(); });
  render();
  if (fine.matches && !reduce.matches) {
    mosaic.addEventListener('pointermove', e => {
      const s = e.target.closest('a')?.querySelector('.shot'); if (!s) return;
      const r = s.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      s.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg'); s.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
    });
    mosaic.addEventListener('pointerout', e => { const s = e.target.closest('a')?.querySelector('.shot'); if (s && !e.relatedTarget?.closest?.('a')?.contains(s)) { s.style.setProperty('--rx', '0deg'); s.style.setProperty('--ry', '0deg'); } });
  }
  /* the contact button leans toward the pointer while it is near */
  const mag = $('[data-magnet]');
  if (mag && fine.matches && !reduce.matches) {
    const m = follow((x, y) => { mag.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; }, .18);
    const area = mag.closest('section');
    area.addEventListener('pointermove', e => {
      const r = mag.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), reach = r.width * 1.3;
      d < reach ? m.to(dx * .28, dy * .28) : m.to(0, 0);
    });
    area.addEventListener('pointerleave', () => m.to(0, 0));
  }
})();
