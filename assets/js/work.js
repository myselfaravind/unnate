/* UNNATE · work: project rails and grids, category filters, hover previews and the project viewer.
   Used by the homepage, /work/ and both landing pages. Data: portfolio/portfolio.js. Needs site.js first.

   <section data-work data-pool="featured | all | tag:healthcare | group:Websites" data-mode="rail | grid">
     [data-filters]  optional filter pills        [data-prev] [data-next]  optional rail buttons
     [data-rail]     the list the cards go into   [data-allwork]           optional "see all" button   */
(() => {
  'use strict';
  const { $, $$, esc, RM, FINE } = window.UNNATE;
  const P = window.UNNATE_PORTFOLIO || [];
  const sections = $$('[data-work]');
  if (!P.length || !sections.length) return;
  const GROUPS = ['Brand Identity', 'Websites', 'Content & Creative', 'Campaigns'];   // a group with no projects gets no filter
  const ICON = id => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/img/icons.svg#${id}"/></svg>`;
  const byId = id => P.find(p => p.id === id);
  const poolOf = spec => {
    if (spec === 'all') return P.slice();
    if (spec?.startsWith('tag:')) return P.filter(p => (p.tags || []).includes(spec.slice(4)));
    if (spec?.startsWith('group:')) return P.filter(p => p.group === spec.slice(6));
    return P.filter(p => p.featured);
  };
  const swap = fn => (document.startViewTransition && !RM.matches) ? document.startViewTransition(fn) : fn();
  let lastList = P;                                       // the list the viewer steps through

  const cardHTML = (p, i) => `<li class="slide"><a href="/work/#${esc(p.id)}" data-id="${esc(p.id)}" aria-label="${esc(p.title)}, ${esc(p.category)}${p.kind ? ', ' + esc(p.kind) : ''}: view project">
      <div class="thumb"><img src="${esc(p.thumb)}" alt="${esc(p.alt || '')}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" width="800" height="1000">${p.type === 'video' ? `<span class="play glass-dark" aria-hidden="true">${ICON('play')}</span>` : ''}<span class="cue glass" aria-hidden="true">${p.case ? 'Case notes' : p.type === 'video' ? 'Watch' : 'View project'}${ICON('arrow')}</span></div>
      <div class="meta"><h3>${esc(p.title)}</h3><span class="cat">${esc(p.category)}</span></div>${p.kind ? `<span class="kind">${esc(p.kind)}</span>` : ''}</a></li>`;

  sections.forEach(sec => {
    const rail = $('[data-rail]', sec), filters = $('[data-filters]', sec), status = $('[data-workstatus]', sec), allBtn = $('[data-allwork]', sec);
    let pool = poolOf(sec.dataset.pool), filter = 'all';
    const asked = new URLSearchParams(location.search).get('show');
    if (sec.dataset.mode === 'grid' && GROUPS.includes(asked) && pool.some(p => p.group === asked)) filter = asked;
    const visible = () => pool.filter(p => filter === 'all' || p.group === filter);
    const ind = document.createElement('span'); ind.className = 'pill-ind'; ind.setAttribute('aria-hidden', 'true');
    const moveInd = () => { const b = filters && $('[aria-pressed=true]', filters); if (!b) return; ind.style.setProperty('--x', b.offsetLeft + 'px'); ind.style.setProperty('--w', b.offsetWidth + 'px'); };
    const drawFilters = () => {
      if (!filters) return;
      const opts = [['all', 'All work', pool.length], ...GROUPS.map(g => [g, g, pool.filter(p => p.group === g).length])].filter(o => o[2]);
      if (opts.length < 3) { filters.hidden = true; return; }          // one category: no filter needed
      if (!opts.some(o => o[0] === filter)) filter = 'all';
      filters.innerHTML = opts.map(([k, l, c]) => `<button type="button" data-filter="${esc(k)}" aria-pressed="${k === filter}">${esc(l)}<span class="c">${c}</span></button>`).join('');
      filters.prepend(ind); requestAnimationFrame(moveInd);
    };
    const drawRail = () => {
      const list = visible();
      rail.innerHTML = list.map(cardHTML).join('');
      rail.scrollLeft = 0;
      if (status) status.textContent = `Showing ${list.length} ${list.length === 1 ? 'project' : 'projects'}.`;
    };
    filters?.addEventListener('click', e => {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      filter = b.dataset.filter;
      $$('[data-filter]', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      moveInd(); swap(drawRail);
      if (sec.dataset.mode === 'grid') history.replaceState(null, '', filter === 'all' ? location.pathname : `?show=${encodeURIComponent(filter)}`);
    });
    allBtn?.addEventListener('click', () => {
      pool = P.slice(); allBtn.setAttribute('aria-expanded', 'true');
      swap(() => { sec.classList.add('all'); drawFilters(); drawRail(); });
      rail.querySelector('a')?.focus({ preventScroll: true });
    });
    addEventListener('resize', moveInd);
    if (sec.dataset.mode === 'grid') sec.classList.add('all');
    drawFilters(); drawRail();

    // rail buttons move two cards at a time
    const step = () => { const s = $('.slide', rail); return s ? s.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 16) : 300; };
    $('[data-prev]', sec)?.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: RM.matches ? 'auto' : 'smooth' }));
    $('[data-next]', sec)?.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: RM.matches ? 'auto' : 'smooth' }));

    // mouse: throw the rail. It tracks 1:1, then lands where the throw was heading.
    let drag = null, moved = false;
    const project = (v, d = .998) => (v / 1000) * d / (1 - d);
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || sec.classList.contains('all')) return;
      drag = { x: e.clientX, left: rail.scrollLeft, hist: [[e.clientX, performance.now()]] }; moved = false;
    });
    addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) { moved = true; rail.classList.add('dragging'); }
      rail.scrollLeft = drag.left - dx;
      const now = performance.now(); drag.hist.push([e.clientX, now]); while (drag.hist.length > 5) drag.hist.shift();
      const [x0, t0] = drag.hist[0]; const v = (e.clientX - x0) / Math.max(1, now - t0) * 1000;
      if (!RM.matches) rail.style.setProperty('--skew', Math.max(-5, Math.min(5, v / 400)).toFixed(2) + 'deg');
    });
    addEventListener('pointerup', e => {
      if (!drag) return;
      const d = drag; drag = null;
      rail.style.setProperty('--skew', '0deg');
      if (!moved) return;
      const now = performance.now(); const [x0, t0] = d.hist[0];
      const v = (e.clientX - x0) / Math.max(1, now - t0) * 1000;
      const w = step(), snapTo = Math.round((rail.scrollLeft - project(v)) / w) * w;
      rail.classList.remove('dragging');
      rail.style.scrollSnapType = 'none';
      rail.scrollTo({ left: snapTo, behavior: RM.matches ? 'auto' : 'smooth' });
      setTimeout(() => { rail.style.scrollSnapType = ''; }, 700);
      const block = ev => { ev.preventDefault(); ev.stopPropagation(); };
      rail.addEventListener('click', block, { capture: true, once: true });
      setTimeout(() => rail.removeEventListener('click', block, { capture: true }), 50);
    });

    /* hover previews: a 5-second muted loop, fetched only when a pointer rests on a film's card */
    if (FINE.matches && !RM.matches) {
      rail.addEventListener('pointerover', e => {
        const a = e.target.closest('a[data-id]'); if (!a || drag) return;
        const p = byId(a.dataset.id); if (!p?.preview) return;
        const thumb = $('.thumb', a);
        let v = $('video', thumb);
        if (!v) {
          v = document.createElement('video');
          Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' });
          v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1');
          v.src = p.preview; thumb.insertBefore(v, thumb.children[1]);
          v.addEventListener('playing', () => { if (a.matches(':hover')) v.classList.add('on'); });
          v.addEventListener('error', () => v.remove());
        }
        v.play().then(() => v.classList.add('on')).catch(() => {});
        a.addEventListener('pointerleave', () => { v.classList.remove('on'); setTimeout(() => v.pause(), 350); }, { once: true });
      });
    }

    rail.addEventListener('click', e => {
      const a = e.target.closest('a[data-id]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const p = byId(a.dataset.id); if (!p) return;
      e.preventDefault();
      lastList = visible();
      open(p, a);
    });
  });

  /* ---------- the project viewer ---------- */
  const viewer = document.createElement('dialog');
  viewer.className = 'viewer'; viewer.id = 'viewer'; viewer.setAttribute('aria-labelledby', 'viewer-title');
  viewer.innerHTML = `<div class="viewer-in"><div class="viewer-media"></div><div class="viewer-side">
      <button type="button" class="round close" data-close aria-label="Close project"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
      <div class="viewer-info"></div>
      <div class="viewer-nav"><p class="count"></p>
        <button type="button" class="round" data-vprev aria-label="Previous project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg></button>
        <button type="button" class="round" data-vnext aria-label="Next project">${ICON('arrow')}</button></div></div></div>`;
  document.body.appendChild(viewer);
  const vMedia = $('.viewer-media', viewer), vInfo = $('.viewer-info', viewer), vCount = $('.count', viewer);
  let vCur = null, opener = null;
  const list2 = (h, items) => `<h3>${h}</h3><ul>${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const show = p => {
    vCur = p;
    const c = p.case;
    vMedia.classList.toggle('gallery', !!c);
    if (c) {
      vMedia.innerHTML = `<div class="shots">${c.shots.map(([src, alt]) => `<img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="750" decoding="async">`).join('')}<figure class="phone-fig"><img src="${esc(c.phone)}" alt="${esc(p.title)} on a phone" width="585" height="1266" decoding="async"><figcaption>On a phone</figcaption></figure></div>`;
    } else if (p.type === 'video') {
      vMedia.innerHTML = `<div class="vid"><video controls playsinline preload="metadata" poster="${esc(p.poster)}" aria-label="${esc(p.title)}, short-form video"><source src="${esc(p.video)}" type="video/mp4"></video></div>`;
      const v = $('video', vMedia);
      $('source', v).addEventListener('error', () => {
        v.removeAttribute('controls');
        v.insertAdjacentHTML('afterend', '<p class="missing" role="status">This film can’t be played right now. The still above is a frame from it.</p>');
      });
    } else {
      vMedia.innerHTML = `<img src="${esc(p.full || p.thumb)}" alt="${esc(p.alt || p.title)}" ${p.size ? `width="${p.size[0]}" height="${p.size[1]}"` : ''} decoding="async">`;
    }
    const note = p.kind === 'Demo' ? 'A demo build: the clinic or studio, its people and its contact details are placeholders.'
      : p.kind === 'Concept' ? 'A self-initiated concept, not a client commission.' : '';
    vInfo.innerHTML = `<div class="tags"><span>${esc(p.category)}</span>${p.kind ? `<span>${esc(p.kind)}</span>` : ''}</div><h2 id="viewer-title" tabindex="-1">${esc(p.title)}</h2><p class="brief">${esc(p.desc)}</p>`
      + (note ? `<p class="demo-note">${note}</p>` : '')
      + (p.demoUrl ? `<a class="btn btn-ink btn-sm" href="${esc(p.demoUrl)}" target="_blank" rel="noopener">Open the working ${p.kind === 'Concept' ? 'concept' : 'demo'} <span class="btn-dot" aria-hidden="true">${ICON('arrow')}</span><span class="vh"> (opens in a new tab)</span></a>` : '')
      + (c ? `<div class="case"><h3>On the page</h3><p>${esc(c.page)}</p>${list2('Design decisions', c.decisions)}<div class="kit"><span class="faces">${esc(c.type)}</span><span class="sw">${c.palette.map(h => `<i style="background:${h}" title="${h}"></i>`).join('')}</span></div>${list2('Interaction details', c.details)}<p class="src">Notes and screenshots are taken from the project’s own files.</p></div>` : '');
    const i = lastList.indexOf(p);
    vCount.textContent = i < 0 ? '' : `${i + 1} of ${lastList.length}`;
    $$('[data-vprev],[data-vnext]', viewer).forEach(b => { b.hidden = lastList.length < 2 || i < 0; });
    vMedia.scrollTop = 0; viewer.querySelector('.viewer-side').scrollTop = 0;
  };
  const open = (p, from) => {
    opener = from || document.activeElement;
    if (from) {
      const r = from.getBoundingClientRect();
      viewer.style.transformOrigin = `${((r.left + r.width / 2) / innerWidth * 100).toFixed(1)}% ${((r.top + r.height / 2) / innerHeight * 100).toFixed(1)}%`;
    }
    show(p);
    if (!viewer.open) { viewer.showModal(); document.documentElement.classList.add('locked'); }
    if (location.pathname.startsWith('/work')) history.replaceState(null, '', '#' + p.id);
    $('#viewer-title', viewer).focus({ preventScroll: true });
  };
  const vStep = d => { const l = lastList; const i = l.indexOf(vCur); if (i < 0) return; open(l[(i + d + l.length) % l.length]); };
  viewer.addEventListener('click', e => {
    if (e.target === viewer || e.target.closest('[data-close]')) viewer.close();
    else if (e.target.closest('[data-vprev]')) vStep(-1);
    else if (e.target.closest('[data-vnext]')) vStep(1);
  });
  viewer.addEventListener('keydown', e => {
    if (e.target.closest('video')) return;                // leave arrow keys to the video scrubber
    if (e.key === 'ArrowRight') vStep(1);
    if (e.key === 'ArrowLeft') vStep(-1);
  });
  viewer.addEventListener('close', () => {
    vMedia.innerHTML = '';                                  // stops any playing film
    document.documentElement.classList.remove('locked');
    if (location.pathname.startsWith('/work') && location.hash) history.replaceState(null, '', location.pathname + location.search);
    const back = vCur && $(`a[data-id="${CSS.escape(vCur.id)}"]`);
    (back || opener)?.focus({ preventScroll: true }); vCur = null;
  });
  // /work/#id opens that project directly (links from other pages, shared links)
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1)), p = id && byId(id);
    if (p && $('[data-work][data-mode=grid]')) { lastList = P; open(p, $(`a[data-id="${CSS.escape(id)}"]`)); }
  };
  addEventListener('hashchange', fromHash);
  fromHash();
})();
