/* Operations app demo — fictional data, saved only in this browser (localStorage).
   Dashboard, requests, a week booking calendar that refuses double bookings, and a customer portal
   whose requests land in the team's list. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = 'unnate-demo-ops-v1';
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TODAY = 1, NOW = 10.67, OPEN = 8, CLOSE = 17;
  const TECH = { ali: 'Ali Haddad', mei: 'Mei Tan', josh: 'Josh Park' };
  const PROPS = ['Unit 3, 14 Elm St', '22 Station Rd', 'Unit 12, 9 Harbour View', '31 Kent Ave', '5 Wattle Ln', 'Unit 7, 40 Grove St', '18 Ferry Rd', 'Unit 2, 61 Bay St'];
  const TYPES = ['Plumbing', 'Electrical', 'Locks and doors', 'Appliances', 'General repairs'];
  const ST = { new: ['New', 's-new'], booked: ['Booked', 's-booked'], progress: ['In progress', 's-prog'], done: ['Done', 's-done'] };
  const HISTORY = [9, 12, 10, 14, 11, 15, 13];

  const seed = () => ({
    next: 2049, nextB: 40,
    requests: [
      { id: 'R-2048', title: 'Kitchen tap dripping', type: 'Plumbing', prop: PROPS[0], from: 'Priya S., tenant', when: 'Tue 08:40', urg: 'Normal', status: 'new', resp: null, desc: 'Drips all the time, worse at night.' },
      { id: 'R-2047', title: 'No power to bedroom sockets', type: 'Electrical', prop: PROPS[3], from: 'Tom W., tenant', when: 'Mon 08:05', urg: 'Urgent', status: 'booked', resp: 1.2, b: 'B-39', desc: 'Two sockets in the main bedroom stopped working.' },
      { id: 'R-2046', title: 'Front door lock sticking', type: 'Locks and doors', prop: PROPS[2], from: 'Harbour View strata', when: 'Fri 16:20', urg: 'Normal', status: 'booked', resp: 2.5, b: 'B-38', desc: 'Key turns only with force.' },
      { id: 'R-2045', title: 'Dishwasher not draining', type: 'Appliances', prop: PROPS[5], from: 'Ana R., tenant', when: 'Fri 11:02', urg: 'Normal', status: 'progress', resp: 3.1, b: 'B-37', desc: 'Water left in the bottom after every cycle.' },
      { id: 'R-2044', title: 'Hot water unit leaking', type: 'Plumbing', prop: PROPS[1], from: 'Owen L., landlord', when: 'Thu 14:45', urg: 'Urgent', status: 'progress', resp: 0.8, b: 'B-36', late: true, desc: 'Leak at the base of the unit. Part on order.' },
      { id: 'R-2043', title: 'Bathroom exhaust fan noisy', type: 'Electrical', prop: PROPS[4], from: 'Kim D., tenant', when: 'Thu 09:30', urg: 'Normal', status: 'booked', resp: 4.2, b: 'B-35', desc: 'Rattles loudly when switched on.' },
      { id: 'R-2042', title: 'Cracked window latch', type: 'General repairs', prop: PROPS[6], from: 'Sam B., tenant', when: 'Wed 15:10', urg: 'Normal', status: 'new', resp: null, late: true, desc: 'Bedroom window will not lock.' },
      { id: 'R-2041', title: 'Blocked shower drain', type: 'Plumbing', prop: PROPS[7], from: 'Leah M., tenant', when: 'Wed 10:00', urg: 'Normal', status: 'done', resp: 2.0, desc: 'Slow drain, now cleared.' },
      { id: 'R-2040', title: 'Oven door hinge broken', type: 'Appliances', prop: PROPS[0], from: 'Priya S., tenant', when: 'Tue 13:30', urg: 'Normal', status: 'done', resp: 5.5, desc: 'Hinge replaced.' },
      { id: 'R-2039', title: 'Garage door remote not working', type: 'Locks and doors', prop: PROPS[3], from: 'Owen L., landlord', when: 'Mon 09:15', urg: 'Normal', status: 'done', resp: 3.0, desc: 'Receiver reset.' }
    ],
    bookings: [
      { id: 'B-30', day: 0, start: 8.5, dur: 1, tech: 'mei', title: 'Smoke alarm checks', prop: PROPS[2] },
      { id: 'B-39', day: 0, start: 10, dur: 1.5, tech: 'ali', title: 'No power to bedroom sockets', prop: PROPS[3], r: 'R-2047', done: true },
      { id: 'B-36', day: 0, start: 13, dur: 2, tech: 'josh', title: 'Hot water unit leaking', prop: PROPS[1], r: 'R-2044', done: true },
      { id: 'B-31', day: 1, start: 8, dur: 1, tech: 'ali', title: 'Gutter clean', prop: PROPS[6], done: true },
      { id: 'B-38', day: 1, start: 9, dur: 1, tech: 'mei', title: 'Front door lock sticking', prop: PROPS[2], r: 'R-2046', done: true },
      { id: 'B-37', day: 1, start: 10.5, dur: 1.5, tech: 'josh', title: 'Dishwasher not draining', prop: PROPS[5], r: 'R-2045' },
      { id: 'B-32', day: 1, start: 13.5, dur: 2, tech: 'ali', title: 'End-of-lease repairs', prop: PROPS[7] },
      { id: 'B-41', day: 1, start: 15, dur: 1, tech: 'mei', title: 'Replace door handle', prop: PROPS[4] },
      { id: 'B-35', day: 2, start: 10, dur: 1, tech: 'mei', title: 'Bathroom exhaust fan noisy', prop: PROPS[4], r: 'R-2043' },
      { id: 'B-33', day: 2, start: 8.5, dur: 3, tech: 'josh', title: 'Bathroom re-seal', prop: PROPS[0] },
      { id: 'B-34', day: 3, start: 9, dur: 1.5, tech: 'ali', title: 'Pre-inspection check', prop: PROPS[3] },
      { id: 'B-24', day: 3, start: 13, dur: 1, tech: 'mei', title: 'Tap washer replacement', prop: PROPS[1] },
      { id: 'B-26', day: 4, start: 10, dur: 2, tech: 'ali', title: 'Deck boards repair', prop: PROPS[4] },
      { id: 'B-27', day: 4, start: 8, dur: 1, tech: 'mei', title: 'Smoke alarm checks', prop: PROPS[5] }
    ]
  });

  let S;
  const load = () => { try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage off: changes last until reload */ } };
  load();

  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hhmm = h => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, '0') : '00'}`;
  const chip = s => `<span class="st ${ST[s][1]}">${ST[s][0]}</span>`;
  const reqOf = id => S.requests.find(r => r.id === id);
  const bookOf = id => S.bookings.find(b => b.id === id);
  const toast = msg => { const t = $('[data-toast]'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 3200); };

  /* ---------- tabs ---------- */
  let tab = 'dashboard';
  const show = (name, keepUrl) => {
    tab = name;
    $$('[data-tab]').forEach(b => { if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $$('[data-view]').forEach(v => { v.hidden = v.dataset.view !== name; });
    render();
    if (!keepUrl && location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tab],[data-tab-go]');
    if (t) { show(t.dataset.tab || t.dataset.tabGo); window.scrollTo({ top: 0 }); }
  });

  /* ---------- dashboard ---------- */
  const renderDash = () => {
    const open = S.requests.filter(r => r.status !== 'done');
    const late = open.filter(r => r.late);
    const rs = S.requests.filter(r => r.resp != null).map(r => r.resp);
    $('[data-k=open]').textContent = open.length;
    $('[data-k=open-sub]').textContent = `${open.filter(r => r.status === 'new').length} not booked yet`;
    $('[data-k=booked]').textContent = S.bookings.length;
    $('[data-k=late]').textContent = late.length;
    $('[data-k=resp]').textContent = rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) + ' h' : '–';
    const thisWeek = S.requests.filter(r => !/^(Thu|Fri|Wed) /.test(r.when) || r.fresh).length;
    const vals = [...HISTORY, thisWeek], max = Math.max(...vals) * 1.15;
    const labels = ['7 wk', '6 wk', '5 wk', '4 wk', '3 wk', '2 wk', 'Last', 'This'];
    const bars = $('[data-bars]');
    bars.innerHTML = vals.map((v, i) => `<div><i></i><b>${v}</b><span>${labels[i]}</span></div>`).join('');
    $$('div', bars).forEach((d, i) => d.style.setProperty('--h', (vals[i] / max * 100).toFixed(1) + '%'));
    bars.setAttribute('aria-label', `Requests per week, oldest first: ${vals.join(', ')}`);
    const counts = TYPES.map(t => [t, open.filter(r => r.type === t).length]);
    const cmax = Math.max(1, ...counts.map(c => c[1]));
    const ty = $('[data-types]');
    ty.innerHTML = counts.map(([t, n]) => `<li><span>${t}</span><i><b></b></i><em>${n}</em></li>`).join('');
    $$('b', ty).forEach((b, i) => b.style.setProperty('--w', (counts[i][1] / cmax * 100) + '%'));
    const today = S.bookings.filter(b => b.day === TODAY).sort((a, b) => a.start - b.start);
    $('[data-today]').innerHTML = today.length ? today.map(b => `<li class="${b.done ? 'done' : ''}"><time>${hhmm(b.start)}</time><span class="av t-${b.tech}" title="${TECH[b.tech]}" aria-hidden="true">${TECH[b.tech][0]}</span><span><b>${esc(b.title)}</b><small>${esc(b.prop)} · ${TECH[b.tech].split(' ')[0]}${b.done ? ' · done' : ''}</small></span></li>`).join('') : '<li class="empty">No visits today.</li>';
    const attn = [...late.map(r => [r, 'Overdue', 'why-late']), ...open.filter(r => r.status === 'new' && !r.late).map(r => [r, 'Not booked', 'why-new'])];
    $('[data-attn]').innerHTML = attn.length ? attn.map(([r, w, c]) => `<li><span><b>${esc(r.title)}</b><small>${r.id} · ${esc(r.prop)}</small></span><span class="why ${c}">${w}</span></li>`).join('') : '<li class="empty">Nothing needs attention.</li>';
  };

  /* ---------- requests ---------- */
  let filter = 'all';
  const renderReqs = () => {
    const q = $('#rq').value.trim().toLowerCase();
    const list = S.requests.filter(r => (filter === 'all' || r.status === filter) && (!q || `${r.id} ${r.title} ${r.prop} ${r.from} ${r.type}`.toLowerCase().includes(q)));
    $('[data-reqs]').innerHTML = list.length ? list.map(r => `<button type="button" class="rq${r.fresh ? ' fresh' : ''}" data-open="${r.id}"><span class="id">${r.id}</span><span><b>${esc(r.title)}</b><small>${esc(r.prop)}${r.urg === 'Urgent' ? ' · <span class="urg">Urgent</span>' : ''}</small></span><span class="who-col"><small>${esc(r.from)}</small><small>${esc(r.when)}</small></span><span class="type-col"><small>${esc(r.type)}</small>${r.late && r.status !== 'done' ? '<span class="late-tag">Overdue</span>' : ''}</span>${chip(r.status)}</button>`).join('') : '<p class="empty pad">No requests match.</p>';
    S.requests.forEach(r => { delete r.fresh; });
  };
  $$('[data-f]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; $$('[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderReqs(); }));
  $('#rq').addEventListener('input', renderReqs);

  /* drawer */
  let lastFocus = null;
  const drawer = $('[data-drawer]'), scrim = $('[data-scrim]');
  const closeAll = () => {
    drawer.hidden = true; scrim.hidden = true; $('[data-modal]').hidden = true;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };
  const openReq = id => {
    const r = reqOf(id); if (!r) return;
    lastFocus = document.activeElement;
    const b = r.b && bookOf(r.b);
    $('[data-dr-id]').textContent = `${r.id} · ${r.type}`;
    $('[data-dr-title]').textContent = r.title;
    const order = ['new', 'booked', 'progress', 'done'], at = order.indexOf(r.status);
    $('[data-dr-body]').innerHTML = `
      <div>${chip(r.status)} ${r.late && r.status !== 'done' ? '<span class="late-tag">Overdue</span>' : ''}</div>
      <dl class="facts"><dt>Property</dt><dd>${esc(r.prop)}</dd><dt>From</dt><dd>${esc(r.from)}</dd><dt>Received</dt><dd>${esc(r.when)}</dd><dt>Urgency</dt><dd>${esc(r.urg)}</dd>${b ? `<dt>Visit</dt><dd>${DAYS[b.day]} ${hhmm(b.start)}–${hhmm(b.start + b.dur)} · ${TECH[b.tech]}</dd>` : ''}</dl>
      <p>${esc(r.desc || '')}</p>
      <ol class="steps" aria-label="Progress">${order.map((s, i) => `<li class="${i <= at ? 'on' : ''}"><b>${ST[s][0]}</b></li>`).join('')}</ol>
      <div class="dr-act">${r.status === 'new' ? `<button type="button" class="b b-go" data-book-req="${r.id}">Book a visit</button>` : ''}${r.status === 'booked' ? `<button type="button" class="b" data-set="${r.id}:progress">Mark in progress</button>` : ''}${r.status === 'booked' || r.status === 'progress' ? `<button type="button" class="b" data-set="${r.id}:done">Mark done</button>` : ''}</div>`;
    drawer.hidden = false; scrim.hidden = false; drawer.focus();
  };
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) openReq(o.dataset.open);
    const s = e.target.closest('[data-set]');
    if (s) {
      const [id, st] = s.dataset.set.split(':'); const r = reqOf(id); r.status = st;
      if (st === 'done') { r.late = false; const b = r.b && bookOf(r.b); if (b) b.done = true; }
      save(); render(); openReq(id); toast(`${id} marked ${ST[st][0].toLowerCase()}.`);
    }
    const br = e.target.closest('[data-book-req]'); if (br) { closeAll(); openBooking(br.dataset.bookReq); }
    if (e.target.closest('[data-act=close]') || e.target === scrim || e.target === $('[data-modal]')) closeAll();
    const bk = e.target.closest('[data-bk]'); if (bk) openBookingView(bk.dataset.bk);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && (!drawer.hidden || !$('[data-modal]').hidden)) closeAll(); });

  /* ---------- bookings ---------- */
  const hidden = new Set();
  $$('[data-tech]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.tech; hidden.has(t) ? hidden.delete(t) : hidden.add(t);
    b.setAttribute('aria-pressed', String(!hidden.has(t))); renderWeek();
  }));
  const H = CLOSE - OPEN;
  const renderWeek = () => {
    const wk = $('[data-week]');
    let html = '<div class="wh" aria-hidden="true"></div>' + DAYS.map((d, i) => `<div class="wh${i === TODAY ? ' is-today' : ''}">${d}${i === TODAY ? '<small>Today</small>' : '<small>&nbsp;</small>'}</div>`).join('');
    html += '<div class="times" aria-hidden="true">' + Array.from({ length: H + 1 }, (_, i) => `<span data-y="${i / H}">${hhmm(OPEN + i)}</span>`).join('') + '</div>';
    DAYS.forEach((d, i) => {
      const items = S.bookings.filter(b => b.day === i && !hidden.has(b.tech)).sort((a, b) => a.start - b.start);
      html += `<div class="col${i === TODAY ? ' is-today' : ''}" aria-label="${d}">${i === TODAY ? '<span class="now" data-y="' + ((NOW - OPEN) / H) + '"></span>' : ''}` +
        items.map(b => `<button type="button" class="bk t-${b.tech}${b.done ? ' done' : ''}${b.fresh ? ' fresh' : ''}" data-bk="${b.id}" data-y="${(b.start - OPEN) / H}" data-hh="${b.dur / H}" aria-label="${esc(b.title)}, ${d} ${hhmm(b.start)} to ${hhmm(b.start + b.dur)}, ${TECH[b.tech]}${b.done ? ', done' : ''}"><time>${hhmm(b.start)}–${hhmm(b.start + b.dur)}</time><b>${esc(b.title)}</b><small>${TECH[b.tech].split(' ')[0]} · ${esc(b.prop)}</small></button>`).join('') + '</div>';
    });
    wk.innerHTML = html;
    $$('[data-y]', wk).forEach(el => el.style.setProperty('top', (Number(el.dataset.y) * 100).toFixed(3) + '%'));
    /* visits that overlap in time (different people) share the column side by side */
    $$('.col', wk).forEach(col => {
      const bs = $$('.bk', col).map(el => ({ el, b: bookOf(el.dataset.bk) }));
      const groups = [];
      bs.forEach(x => { const g = groups.find(g => g.some(y => x.b.start < y.b.start + y.b.dur && y.b.start < x.b.start + x.b.dur)); g ? g.push(x) : groups.push([x]); });
      groups.forEach(g => {
        const lanes = [];
        g.forEach(x => { let i = lanes.findIndex(end => end <= x.b.start); if (i < 0) { i = lanes.length; lanes.push(0); } lanes[i] = x.b.start + x.b.dur; x.lane = i; });
        g.forEach(x => { const n = lanes.length, w = 100 / n; x.el.style.setProperty('left', `calc(${(x.lane * w).toFixed(3)}% + ${x.lane ? 2 : 6}px)`); x.el.style.setProperty('right', `calc(${(100 - (x.lane + 1) * w).toFixed(3)}% + ${x.lane === n - 1 ? 6 : 2}px)`); });
      });
    });
    $$('[data-hh]', wk).forEach(el => el.style.setProperty('height', `calc(${(Number(el.dataset.hh) * 100).toFixed(3)}% - 4px)`));
    S.bookings.forEach(b => { delete b.fresh; });
  };
  const openBookingView = id => {
    const b = bookOf(id); if (!b) return;
    lastFocus = document.activeElement;
    const r = b.r && reqOf(b.r);
    $('[data-dr-id]').textContent = `${b.id} · ${TECH[b.tech]}`;
    $('[data-dr-title]').textContent = b.title;
    $('[data-dr-body]').innerHTML = `<dl class="facts"><dt>When</dt><dd>${DAYS[b.day]}, ${hhmm(b.start)}–${hhmm(b.start + b.dur)}</dd><dt>Property</dt><dd>${esc(b.prop)}</dd><dt>Technician</dt><dd>${TECH[b.tech]}</dd>${r ? `<dt>Request</dt><dd>${r.id} · ${esc(r.from)}</dd>` : ''}<dt>Status</dt><dd>${b.done ? 'Done' : 'Booked'}</dd></dl>
      <div class="dr-act">${b.done ? '' : `<button type="button" class="b b-go" data-bdone="${b.id}">Mark visit done</button>`}<button type="button" class="b" data-bdel="${b.id}">Cancel booking</button></div>`;
    drawer.hidden = false; scrim.hidden = false; drawer.focus();
  };
  document.addEventListener('click', e => {
    const d = e.target.closest('[data-bdone]');
    if (d) { const b = bookOf(d.dataset.bdone); b.done = true; const r = b.r && reqOf(b.r); if (r) { r.status = 'done'; r.late = false; } save(); render(); closeAll(); toast('Visit marked done.'); }
    const x = e.target.closest('[data-bdel]');
    if (x) { const b = bookOf(x.dataset.bdel); S.bookings = S.bookings.filter(y => y !== b); const r = b.r && reqOf(b.r); if (r && r.status === 'booked') { r.status = 'new'; delete r.b; } save(); render(); closeAll(); toast('Booking cancelled.'); }
  });

  /* booking dialog: refuses double bookings */
  const bform = $('[data-bform]');
  const fillSelect = (sel, opts) => { sel.innerHTML = opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join(''); };
  fillSelect(bform.elements.prop, PROPS.map(p => [p, p]));
  fillSelect(bform.elements.day, DAYS.map((d, i) => [i, d]));
  fillSelect(bform.elements.start, Array.from({ length: (H - 0.5) * 2 }, (_, i) => OPEN + i / 2).map(h => [h, hhmm(h)]));
  fillSelect(bform.elements.dur, [0.5, 1, 1.5, 2, 3].map(h => [h, h < 1 ? '30 min' : `${h} h`]));
  fillSelect(bform.elements.tech, Object.entries(TECH));
  const openBooking = reqId => {
    lastFocus = document.activeElement;
    fillSelect(bform.elements.req, [['', 'No request'], ...S.requests.filter(r => r.status === 'new').map(r => [r.id, `${r.id} · ${r.title}`])]);
    bform.reset(); $('[data-berr]').hidden = true;
    $$('[aria-invalid]', bform).forEach(el => el.removeAttribute('aria-invalid'));
    bform.elements.day.value = String(Math.min(4, TODAY + 1)); bform.elements.start.value = '9'; bform.elements.dur.value = '1';
    if (reqId) { const r = reqOf(reqId); bform.elements.req.value = reqId; bform.elements.title.value = r.title; bform.elements.prop.value = r.prop; }
    $('[data-modal]').hidden = false; (reqId ? bform.elements.day : bform.elements.title).focus();
  };
  bform.elements.req.addEventListener('change', () => { const r = reqOf(bform.elements.req.value); if (r) { bform.elements.title.value = r.title; bform.elements.prop.value = r.prop; } });
  $$('[data-act=new-booking]').forEach(b => b.addEventListener('click', () => openBooking()));
  bform.addEventListener('submit', e => {
    e.preventDefault();
    const f = bform.elements, err = $('[data-berr]');
    const title = f.title.value.trim(), day = Number(f.day.value), start = Number(f.start.value), dur = Number(f.dur.value), tech = f.tech.value;
    if (!title) { f.title.setAttribute('aria-invalid', 'true'); err.textContent = 'Say what the visit is for.'; err.hidden = false; f.title.focus(); return; }
    f.title.removeAttribute('aria-invalid');
    if (start + dur > CLOSE) { err.textContent = `That visit would run past ${hhmm(CLOSE)}. Pick an earlier start or a shorter visit.`; err.hidden = false; f.start.focus(); return; }
    const clash = S.bookings.find(b => b.tech === tech && b.day === day && start < b.start + b.dur && b.start < start + dur);
    if (clash) { err.textContent = `${TECH[tech].split(' ')[0]} already has "${clash.title}" on ${DAYS[day]} from ${hhmm(clash.start)} to ${hhmm(clash.start + clash.dur)}. Pick another time or person.`; err.hidden = false; f.start.focus(); return; }
    const id = 'B-' + S.nextB++;
    const nb = { id, day, start, dur, tech, title, prop: f.prop.value, fresh: true };
    const r = f.req.value && reqOf(f.req.value);
    if (r) { nb.r = r.id; r.b = id; r.status = 'booked'; if (r.resp == null) r.resp = 1.5; }
    S.bookings.push(nb); save(); closeAll();
    show('bookings'); toast(`Booked: ${title}, ${DAYS[day]} ${hhmm(start)} with ${TECH[tech].split(' ')[0]}.`);
  });

  /* ---------- customer portal ---------- */
  const pform = $('[data-portal]');
  fillSelect(pform.elements.prop, [['', 'Choose your property'], ...PROPS.map(p => [p, p])]);
  fillSelect(pform.elements.type, TYPES.map(t => [t, t]));
  pform.addEventListener('submit', e => {
    e.preventDefault();
    const f = pform.elements, err = $('[data-perr]');
    const bad = ['name', 'prop', 'desc'].filter(k => !f[k].value.trim());
    ['name', 'prop', 'desc'].forEach(k => bad.includes(k) ? f[k].setAttribute('aria-invalid', 'true') : f[k].removeAttribute('aria-invalid'));
    if (bad.length) { err.textContent = 'Fill in your name, the property and what is wrong.'; err.hidden = false; f[bad[0]].focus(); return; }
    err.hidden = true;
    const id = 'R-' + S.next++;
    const desc = f.desc.value.trim();
    S.requests.unshift({ id, title: desc.length > 42 ? desc.slice(0, 40).trim() + '…' : desc, type: f.type.value, prop: f.prop.value, from: `${f.name.value.trim()}, via portal`, when: 'Tue just now', urg: f.urg.value, status: 'new', resp: null, desc, fresh: true });
    save();
    pform.hidden = true; const done = $('[data-pdone]'); $('[data-pref]').textContent = id; done.hidden = false; done.focus();
    toast(`${id} added to Requests for the team.`);
    renderCounts();
  });
  $('[data-act=portal-again]').addEventListener('click', () => { pform.reset(); pform.hidden = false; $('[data-pdone]').hidden = true; pform.elements.name.focus(); });

  /* ---------- reset ---------- */
  $('[data-act=reset]').addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } S = seed(); pform.reset(); pform.hidden = false; $('[data-pdone]').hidden = true; render(); toast('Sample data restored.'); });

  const renderCounts = () => { $('[data-k=newcount]').textContent = S.requests.filter(r => r.status === 'new').length; };
  const render = () => {
    renderCounts();
    if (tab === 'dashboard') renderDash();
    if (tab === 'requests') renderReqs();
    if (tab === 'bookings') renderWeek();
  };
  // First view: leave the URL alone (writing #dashboard before load makes the browser jump to that
  // view and scroll the demo notice out of sight). A deep link such as #portal opens that tab, and
  // the page is returned to the top once loaded so the notice stays visible.
  const start = (location.hash || '').slice(1);
  const deep = ['dashboard', 'requests', 'bookings', 'portal'].includes(start);
  show(deep ? start : 'dashboard', true);
  if (deep) addEventListener('load', () => requestAnimationFrame(() => window.scrollTo(0, 0)), { once: true });
})();
