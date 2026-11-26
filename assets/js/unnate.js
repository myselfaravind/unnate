/* UNNATE — menu, footer contacts, the QA summary and the project form.
   The form posts to FormSubmit (https://formsubmit.co) using the addresses in config.js, the same service
   the previous site used. Success is shown only when FormSubmit confirms it accepted the enquiry. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.UNNATE_CONFIG || {};
  const EMAILS = (CFG.emails || []).filter(Boolean);

  /* mobile menu */
  const toggle = $('.menu-toggle'), menu = $('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); } });
  }

  /* contact addresses come from config.js only; nothing is invented */
  $$('[data-emails]').forEach(el => {
    if (!EMAILS.length) { el.hidden = true; return; }
    el.innerHTML = EMAILS.map(m => `<a href="mailto:${m}">${m}</a>`).join(' · ');
  });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* QA summary: numbers come from the real QA run (qa/summary.json), never typed by hand */
  const qa = $('[data-qa-summary]');
  if (qa) {
    const src = qa.dataset.qaSrc || '/qa/summary.json';
    fetch(src).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      $$('[data-qa-pass]').forEach(el => { el.textContent = d.passed; });
      $$('[data-qa-total]').forEach(el => { el.textContent = d.total; });
      $$('[data-qa-date]').forEach(el => { el.textContent = d.date; });
    }).catch(() => {});
  }

  /* project form */
  const form = $('[data-form]');
  if (!form) return;
  /* preselect from links like /start/?service=website&package=one-page */
  const q = new URLSearchParams(location.search);
  const svc = { website: 'A website', software: 'Custom business software' }[q.get('service')];
  if (svc) { const r = $$('input[name=service]', form).find(i => i.value === svc); if (r) r.checked = true; }
  const pkg = q.get('package');
  if (pkg && form.elements.package && [...form.elements.package.options].some(o => o.value === pkg)) form.elements.package.value = pkg;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URLISH = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i;
  const ENDPOINT = EMAILS.length ? `https://formsubmit.co/ajax/${encodeURIComponent(String(CFG.formsubmitAlias || '').trim() || EMAILS[0])}` : '';
  const BLACKLIST = 'viagra, cialis, casino, porn, escort, payday loan, backlinks, guest post';
  const card = form.closest('[data-formcard]');
  const sentView = $('[data-view=sent]', card), formView = $('[data-view=form]', card);
  const alertBox = $('.form-alert', form), submit = $('button[type=submit]', form), label = $('[data-label]', submit);
  const idle = label.textContent;
  const contactHint = EMAILS.length ? ` You can also email ${EMAILS.join(' or ')}.` : '';

  const labelOf = el => {
    const host = (el.type === 'checkbox' || el.type === 'radio') ? el.closest('fieldset')?.querySelector('legend') : $(`label[for="${CSS.escape(el.id)}"]`, form);
    if (!host) return el.name;
    const c = host.cloneNode(true); $$('.opt', c).forEach(o => o.remove());
    return c.textContent.replace(/\s+/g, ' ').trim().replace(/[?:]$/, '');
  };
  const setError = (el, msg) => {
    const field = el.closest('.field'); if (!field) return;
    let p = $('.err', field);
    if (!msg) { p?.remove(); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); return; }
    if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = (el.id || el.name) + '-err'; field.appendChild(p); }
    p.textContent = msg;
    el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
  };
  const validate = () => {
    const bad = [];
    $$('input:not([type=checkbox]):not([type=radio]),select,textarea', form).forEach(el => {
      if (el.closest('.hp')) return;
      const v = el.value.trim(); let msg = '';
      if (el.required && !v) msg = el.dataset.msg || 'Fill in this field.';
      else if (el.type === 'email' && v && !EMAIL.test(v)) msg = 'Enter an email address like name@business.com.';
      else if (el.name === 'website' && v && !URLISH.test(v)) msg = 'Enter a web address like yourbusiness.com, or leave it empty.';
      setError(el, msg); if (msg) bad.push(el);
    });
    $$('fieldset[data-required]', form).forEach(fs => {
      const first = $('input', fs), any = $$('input', fs).some(i => i.checked);
      const field = fs.closest('.field');
      let p = field && $('.err', field);
      if (any) { p?.remove(); fs.removeAttribute('aria-invalid'); return; }
      if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = fs.id + '-err'; field.appendChild(p); }
      p.textContent = fs.dataset.msg || 'Choose at least one option.';
      fs.setAttribute('aria-invalid', 'true'); fs.setAttribute('aria-describedby', p.id);
      bad.push(first);
    });
    return bad;
  };
  form.addEventListener('input', () => { if ($('[aria-invalid=true]', form)) validate(); });
  form.addEventListener('change', () => { if ($('[aria-invalid=true]', form)) validate(); });

  let sending = false;
  const setSending = on => {
    sending = on; submit.setAttribute('aria-disabled', String(on));
    label.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Sending…' : idle;
  };
  const fail = msg => { alertBox.textContent = msg; alertBox.hidden = false; alertBox.focus(); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    alertBox.hidden = true;
    const bad = validate(); if (bad.length) { bad[0].focus(); return; }
    if (!ENDPOINT) { fail('This form cannot send yet.' + contactHint); return; }
    const fields = {};
    $$('input,select,textarea', form).forEach(el => {
      if (!el.name || el.closest('.hp') || ((el.type === 'checkbox' || el.type === 'radio') && !el.checked)) return;
      const k = labelOf(el), v = el.value.trim();
      if (el.type === 'checkbox') fields[k] = fields[k] ? `${fields[k]}, ${v}` : v;
      else fields[k] = v || '—';
    });
    const name = form.elements.name.value.trim(), biz = form.elements.business.value.trim();
    const payload = {
      _subject: `${form.dataset.subject || 'Project enquiry'} — ${biz || name}`,
      _replyto: form.elements.email.value.trim(),
      _cc: EMAILS.slice(1).join(','),
      _template: 'table',
      _captcha: 'false',
      _honey: form.elements._honey?.value || '',
      _blacklist: BLACKLIST,
      ...fields,
      Page: `${location.origin}${location.pathname}`
    };
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 20000);
    setSending(true);
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      let body = null; try { body = await res.json(); } catch { /* not JSON */ }
      if (res.ok && body && String(body.success) === 'true') {
        formView.hidden = true; sentView.hidden = false;
        $('h2', sentView).focus();
      } else {
        if (body && body.message) console.warn('FormSubmit:', body.message);
        fail('Your enquiry was not sent: the form service did not accept it. Nothing you typed is lost. Try again in a minute.' + contactHint);
      }
    } catch (err) {
      fail((err.name === 'AbortError' ? 'Your enquiry was not sent: the connection timed out.' : 'Your enquiry was not sent: the form service could not be reached.') + ' Nothing you typed is lost. Check your connection and try again.' + contactHint);
    } finally { clearTimeout(t); setSending(false); }
  });
})();
