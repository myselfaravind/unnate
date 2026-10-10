/* Design 02: the sun that leans toward the pointer, the light that crosses each pane of glass, and the work index. */
(() => {
  const { $, $$, esc, DATA, thumb, img, pad, reduce, fine, follow } = UN;
  /* the sun leans a little toward the pointer; on touch and with reduced motion it stays where it is */
  const hero = $('[data-hero]'), sun = $('[data-sun] i');
  if (fine.matches && !reduce.matches) {
    const f = follow((x, y) => { sun.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; }, .08);
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); f.to((e.clientX - r.left - r.width / 2) / r.width * 70, (e.clientY - r.top - r.height / 2) / r.height * 50); });
    hero.addEventListener('pointerleave', () => f.to(0, 0));
  }
  /* glass: a highlight under the pointer */
  $$('[data-glass]').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  /* work index */
  const list = $('[data-index]'), preview = $('[data-preview]');
  list.innerHTML = DATA.map((it, i) => `<li><a href="#work" data-project="${esc(it.id)}" data-i="${i}"><span class="n" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(it.title)}</h3><span class="kind">${esc(it.category)}${it.kind ? ' · ' + esc(it.kind) : ''}</span><p>${esc(it.desc)}</p><span class="thumb">${img(it, false)}</span></a></li>`).join('');
  let shown = -1;
  const showPreview = i => {
    if (i === shown) return; shown = i;
    const it = DATA[i];
    preview.innerHTML = `<img class="swap" src="${thumb(it)}" alt="">`;
    $$('a', list).forEach((a, n) => a.setAttribute('aria-current', String(n === i)));
  };
  list.addEventListener('pointerover', e => { const a = e.target.closest('a[data-i]'); if (a) showPreview(+a.dataset.i); });
  list.addEventListener('focusin', e => { const a = e.target.closest('a[data-i]'); if (a) showPreview(+a.dataset.i); });
  showPreview(0);
})();
