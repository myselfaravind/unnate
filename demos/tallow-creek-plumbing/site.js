/* Demo quote form: validates like a real one, but sends nothing. */
(() => {
  const form = document.querySelector('[data-demo-form]'); if (!form) return;
  const done = form.querySelector('[data-done]');
  const fields = [...form.querySelectorAll('[required]')];
  const check = el => {
    const bad = !el.value.trim(); let p = el.parentElement.querySelector('.err');
    if (bad) { if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = el.id + '-err'; el.after(p); } p.textContent = 'This field is needed for a quote.'; el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id); }
    else { p?.remove(); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
    return bad;
  };
  form.addEventListener('input', e => { if (e.target.hasAttribute('aria-invalid')) check(e.target); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = fields.filter(check);
    if (bad.length) { done.hidden = true; bad[0].focus(); return; }
    done.hidden = false; done.focus();
  });
})();
