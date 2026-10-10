/* UNNATE review concepts: shared behaviour (arrival, enquiry form, project viewer). Each design adds its own script after this. */
const UN = (() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DATA = window.UNNATE_PORTFOLIO || [];
  const ASSETS = window.UNNATE_ASSETS || {};
  const SERVICES = ['Web', 'Content & Social', 'Paid Campaigns', 'Not sure yet'];
  const ARR = '<span class="arr" aria-hidden="true">→</span>';
  const thumbName = it => it.id + ({ web: '-wide', video: '-poster' }[it.type] || '-full');
  const thumb = it => ASSETS[thumbName(it)] || '';
  const full = it => ASSETS[it.type === 'video' ? it.id + '-poster' : it.id + '-full'] || thumb(it);
  const dims = it => it.type === 'web' ? [1200, 750] : it.type === 'video' ? [720, 1280] : (it.size || [1400, 1867]);
  const alt = it => esc(`${it.title}: ${it.category.toLowerCase()}`);
  const img = (it, eager) => { const [w, h] = dims(it); return `<img src="${thumb(it)}" width="${w}" height="${h}" ${eager ? '' : 'loading="lazy" '}decoding="async" draggable="false" alt="${alt(it)}">`; };
  const tags = it => `<span class="tag">${esc(it.category)}</span>${it.kind ? `<span class="tag">${esc(it.kind)}</span>` : ''}`;
  const pad = n => String(n).padStart(2, '0');

  /* arrival */
  const arrive = els => {
    if (!('IntersectionObserver' in window) || reduce.matches) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .06 });
    els.forEach(el => io.observe(el));
  };
  arrive($$('[data-reveal]'));
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  /* a spring-ish follower for pointer-driven visuals: runs only while it has somewhere to go */
  const follow = (apply, k = .14) => {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, init = false;
    const tick = () => { x += (tx - x) * k; y += (ty - y) * k; apply(x, y); raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(tick) : 0; };
    return { to(nx, ny, jump) { tx = nx; ty = ny; if (jump || !init || reduce.matches) { x = nx; y = ny; init = true; apply(x, y); return; } if (!raf) raf = requestAnimationFrame(tick); } };
  };

  /* enquiry form */
  const modal = document.createElement('dialog');
  modal.className = 'modal'; modal.id = 'enquiry'; modal.setAttribute('aria-labelledby', 'enquiry-title');
  modal.innerHTML = `
    <button type="button" class="close" data-close aria-label="Close enquiry form"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
    <div class="modal-in">
      <div data-view="form">
        <p class="eye">Have something in mind?</p>
        <h2 id="enquiry-title" tabindex="-1">Let’s make something that matters.</h2>
        <p class="intro">Tell us a little about it. Everything is required unless it says optional.</p>
        <form class="form" novalidate>
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
          <div class="field"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" spellcheck="false"></div>
          <div class="field"><label for="f-company">Company or brand name</label><input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="160"></div>
          <div class="field"><label for="f-site">Website or social profile <span class="opt">(optional)</span></label><input id="f-site" name="website" type="text" autocomplete="url" maxlength="300" spellcheck="false"></div>
          <fieldset class="field full"><legend>What do you need help with? <span class="opt">(choose any that apply)</span></legend>
            <div class="picks">${SERVICES.map(s => `<label class="pick"><input type="checkbox" name="services" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('')}</div></fieldset>
          <div class="field full"><label for="f-msg">Tell us a little about your project</label><textarea id="f-msg" name="message" rows="5" required maxlength="5000" placeholder="What’s the idea, challenge or goal you’re working towards?"></textarea></div>
          <div class="hp" aria-hidden="true"><label for="f-hp">Leave this field empty</label><input id="f-hp" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="form-alert" role="alert" hidden></div>
          <div class="form-foot"><button type="submit" class="btn"><span data-label>Submit enquiry&nbsp;${ARR}</span></button><p class="privacy">Your information will be used to respond to your enquiry.</p></div>
        </form>
      </div>
      <div data-view="sent" class="sent" hidden><h2 tabindex="-1" style="margin:0">Thanks for reaching out.</h2><p>We’ve received your enquiry and will be in touch soon.</p><button type="button" class="btn" data-close>Close</button></div>
    </div>`;
  document.body.appendChild(modal);
  const form = $('form', modal), alertBox = $('.form-alert', modal), submitBtn = $('button[type="submit"]', modal);
  const views = { form: $('[data-view="form"]', modal), sent: $('[data-view="sent"]', modal) };
  let opener = null, sending = false, sent = false;
  const setError = (input, msg) => {
    const field = input.closest('.field'); if (!field) return;
    let el = $('.err', field);
    if (!msg) { if (el) el.remove(); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); return; }
    if (!el) { el = document.createElement('p'); el.className = 'err'; el.id = input.id + '-err'; field.appendChild(el); }
    el.textContent = msg; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', el.id);
  };
  const clearErrors = () => { $$('input,textarea', form).forEach(i => i.id && setError(i, '')); alertBox.hidden = true; };
  const openModal = (trigger, service) => {
    opener = trigger || document.activeElement;
    if (sent) { form.reset(); clearErrors(); sent = false; }
    views.form.hidden = false; views.sent.hidden = true;
    if (service) $$('input[name="services"]', form).forEach(c => { if (c.value === service) c.checked = true; });
    modal.showModal(); doc.classList.add('locked'); modal.scrollTop = 0; $('#f-name', modal).focus({ preventScroll: true });
  };
  modal.addEventListener('close', () => { doc.classList.remove('locked'); if (opener && document.contains(opener)) opener.focus({ preventScroll: true }); });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) modal.close(); });
  document.addEventListener('click', e => { const t = e.target.closest('[data-enquire]'); if (!t) return; e.preventDefault(); openModal(t, t.dataset.service); });
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const validate = () => {
    const f = form.elements, bad = [];
    const need = (input, msg) => { const m = input.value.trim() ? '' : msg; setError(input, m); if (m) bad.push(input); };
    need(f.name, 'Enter your name.');
    const ev = f.email.value.trim(), emsg = !ev ? 'Enter your work email.' : (!EMAIL.test(ev) ? 'Enter an email address in the format name@company.com.' : '');
    setError(f.email, emsg); if (emsg) bad.push(f.email);
    need(f.company, 'Enter your company or brand name.'); need(f.message, 'Tell us a little about your project.');
    return bad;
  };
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid')) validate(); });
  const setSending = on => { sending = on; submitBtn.setAttribute('aria-disabled', String(on)); $('[data-label]', submitBtn).innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Sending…' : `Submit enquiry&nbsp;${ARR}`; };
  const fail = msg => { alertBox.textContent = msg; alertBox.hidden = false; alertBox.scrollIntoView({ block: 'nearest' }); };
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (sending) return; alertBox.hidden = true;
    const bad = validate(); if (bad.length) { bad[0].focus(); return; }
    const fd = new FormData(form);
    const payload = { name: fd.get('name').trim(), email: fd.get('email').trim(), company: fd.get('company').trim(), website: fd.get('website').trim(), services: fd.getAll('services'), message: fd.get('message').trim(), company_url: fd.get('company_url'), page: location.pathname };
    if (location.protocol === 'file:') { fail('This is a review copy opened from a file, so the form has nowhere to send. On the live site this is where your enquiry is delivered. Nothing you typed has been lost.'); return; }
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 20000);
    setSending(true);
    try {
      const res = await fetch(window.UNNATE_ENDPOINT || '../api/enquiry', { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      let body = null; try { body = await res.json(); } catch { /* not JSON */ }
      if (res.ok && body && (body.ok === true || body.success === true)) { sent = true; views.form.hidden = true; views.sent.hidden = false; $('h2', views.sent).focus(); }
      else if (res.status === 422 && body && body.fields) { Object.entries(body.fields).forEach(([k, m]) => form.elements[k] && setError(form.elements[k], m)); const first = $('[aria-invalid="true"]', form); if (first) first.focus(); }
      else fail('Your enquiry wasn’t sent. The server didn’t accept it. Nothing you typed has been lost. Try sending it again in a moment.');
    } catch (err) { fail('Your enquiry wasn’t sent. We couldn’t reach the server. Nothing you typed has been lost. Check your connection and send it again.'); }
    finally { clearTimeout(timer); setSending(false); }
  });

  /* project viewer */
  const viewer = document.createElement('dialog');
  viewer.className = 'viewer'; viewer.id = 'viewer'; viewer.setAttribute('aria-labelledby', 'viewer-title');
  viewer.innerHTML = `<div class="viewer-in"><div class="viewer-media"></div><div class="viewer-side">
      <button type="button" class="close" data-close aria-label="Close project"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
      <div data-info style="display:contents"></div>
      <div class="viewer-nav"><p class="count"></p>
        <button type="button" data-prev aria-label="Previous project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
        <button type="button" data-next aria-label="Next project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></div></div>`;
  document.body.appendChild(viewer);
  let cur = null, vOpener = null, list = DATA;
  const show = it => {
    cur = it;
    $('.viewer-media', viewer).innerHTML = `<img src="${full(it)}" alt="${alt(it)}">`;
    $('[data-info]', viewer).innerHTML = `<div class="tags">${tags(it)}</div><h2 id="viewer-title" tabindex="-1">${esc(it.title)}</h2><p>${esc(it.desc)}</p>
      ${it.type === 'web' ? `<p><a class="btn" href="../${it.src.split('/').map(encodeURIComponent).join('/')}" target="_blank" rel="noopener">Open the live project&nbsp;${ARR}<span class="vh"> (opens in a new tab)</span></a></p>` : ''}
      ${it.type === 'video' ? '<p class="note">A still frame from the film. The film itself plays on the Work page of the live site.</p>' : ''}`;
    $('.count', viewer).textContent = `${list.indexOf(it) + 1} of ${list.length}`;
    if (!viewer.open) { vOpener = document.activeElement; viewer.showModal(); doc.classList.add('locked'); }
    viewer.scrollTop = 0; $('#viewer-title', viewer).focus({ preventScroll: true });
  };
  const step = d => show(list[(list.indexOf(cur) + d + list.length) % list.length]);
  viewer.addEventListener('close', () => { doc.classList.remove('locked'); if (vOpener && document.contains(vOpener)) vOpener.focus({ preventScroll: true }); });
  viewer.addEventListener('click', e => { if (e.target === viewer || e.target.closest('[data-close]')) viewer.close(); else if (e.target.closest('[data-prev]')) step(-1); else if (e.target.closest('[data-next]')) step(1); });
  viewer.addEventListener('keydown', e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-project]'); if (!t) return;
    const it = DATA.find(i => i.id === t.dataset.project); if (!it) return;
    e.preventDefault(); list = t.dataset.scope ? DATA.filter(i => i.group === t.dataset.scope) : DATA; if (!list.includes(it)) list = DATA; show(it);
  });
  return { $, $$, esc, DATA, thumb, img, tags, pad, dims, reduce, fine, follow, arrive, ARR };
})();
