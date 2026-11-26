/* Job tracker demo — UNNATE. Runs entirely in the browser with fictional sample data.
   State is kept in localStorage (wrapped in try/catch: some browsers block it); Reset restores the sample. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = 'unnate-demo-job-tracker-v1';
  const STATUSES = [['new', 'New'], ['scheduled', 'Scheduled'], ['progress', 'In progress'], ['parts', 'Waiting on parts'], ['done', 'Done']];
  const SL = Object.fromEntries(STATUSES);
  const TEAM = ['Ali', 'Mei', 'Josh', 'Priya'];
  const TYPES = ['Repair', 'Hot water', 'Drains', 'Gas', 'Maintenance visit', 'Quote'];
  const CHECK = ['Customer contacted', 'Quote approved', 'Parts ready', 'Work completed', 'Invoice sent'];
  const PRIO = { urgent: 0, normal: 1, low: 2 };
  const PRIO_L = { urgent: 'Urgent', normal: 'Normal', low: 'Low' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* dates: everything is relative to today, so the sample always looks current */
  const day0 = new Date(); day0.setHours(0, 0, 0, 0);
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = n => { const d = new Date(day0); d.setDate(d.getDate() + n); return d; };
  const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const diff = s => Math.round((parseISO(s) - day0) / 86400000);
  const at = (off, h, m = 0) => { const d = addDays(off); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const fmtWhen = isoStr => {
    const d = new Date(isoStr), dd = new Date(d); dd.setHours(0, 0, 0, 0);
    const n = Math.round((dd - day0) / 86400000);
    const t = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return (n === 0 ? 'Today' : n === -1 ? 'Yesterday' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })) + ', ' + t;
  };
  const dueLabel = j => {
    if (j.status === 'done') return { text: j.doneAt ? 'Done ' + relDay(j.doneAt) : 'Done', cls: '' };
    const n = diff(j.due);
    if (n < 0) return { text: `${-n} day${n === -1 ? '' : 's'} late`, cls: 'late' };
    if (n === 0) return { text: 'Today', cls: '' };
    if (n === 1) return { text: 'Tomorrow', cls: '' };
    return { text: `In ${n} days`, cls: '' };
  };
  const relDay = isoStr => { const d = new Date(isoStr); d.setHours(0, 0, 0, 0); const n = Math.round((day0 - d) / 86400000); return n === 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`; };

  /* fictional sample data: [no, work, customer, suburb, type, priority, due offset, assignee, status, checklist done, created offset, done offset] */
  const SAMPLE = [
    [1043, 'Water heater pilot will not light', 'W. Tan', 'Wentworthville', 'Gas', 'normal', 5, '', 'new', 0, 0],
    [1042, 'Hot water unit leaking', 'S. Nguyen', 'Parramatta', 'Hot water', 'urgent', 0, 'Ali', 'progress', 3, -1],
    [1041, 'Blocked drain, rear yard', 'A. Fraser', 'Ryde', 'Drains', 'normal', -1, 'Mei', 'parts', 2, -4],
    [1040, 'Replace three tap sets', 'M. Haddad', 'Epping', 'Repair', 'normal', 4, 'Josh', 'scheduled', 2, -3],
    [1039, 'Quote request from website', "L. O'Brien", 'Carlingford', 'Quote', 'normal', 1, '', 'new', 0, 0],
    [1038, 'Annual backflow test', 'R. Okafor', 'Ermington', 'Maintenance visit', 'low', -2, 'Josh', 'done', 5, -9, -2],
    [1037, 'Gas cooktop connection', 'T. Brennan', 'Dundas', 'Gas', 'normal', 2, 'Priya', 'scheduled', 2, -5],
    [1036, 'Running toilet, ensuite', 'K. Sato', 'Meadowbank', 'Repair', 'low', 6, 'Ali', 'scheduled', 1, -6],
    [1035, 'Stormwater pit overflowing', 'P. Ramirez', 'Rydalmere', 'Drains', 'urgent', 0, 'Mei', 'progress', 2, -2],
    [1034, 'Quote: hot water system replacement', 'J. Whitlock', 'North Rocks', 'Quote', 'normal', 3, 'Priya', 'new', 0, -1],
    [1033, 'Leaking shower mixer', 'H. Moreau', 'Telopea', 'Repair', 'normal', 1, 'Josh', 'parts', 3, -10],
    [1032, 'Quarterly maintenance, six units', 'C. Lindqvist', 'Westmead', 'Maintenance visit', 'normal', 9, 'Ali', 'scheduled', 1, -8],
    [1031, 'Burst pipe under kitchen sink', 'B. Adeyemi', 'Granville', 'Repair', 'urgent', -4, 'Mei', 'done', 5, -6, -4],
    [1030, 'Gas leak check', 'E. Petrov', 'Oatlands', 'Gas', 'urgent', -5, 'Priya', 'done', 5, -7, -5],
    [1029, 'New outdoor tap', 'G. Rossi', 'Northmead', 'Repair', 'low', 12, '', 'new', 0, -2],
    [1028, 'CCTV drain inspection', 'N. Ivers', 'West Ryde', 'Drains', 'normal', 1, 'Josh', 'scheduled', 2, -5],
    [1027, 'Hot water pressure valve', 'D. Kowalski', 'Rosehill', 'Hot water', 'normal', 0, 'Priya', 'progress', 3, -3],
    [1026, 'Dishwasher connection', 'F. Marsh', 'Harris Park', 'Repair', 'low', -11, 'Ali', 'done', 5, -14, -10]
  ];
  const NOTES = { 1041: 'Root intrusion confirmed with camera. Ordered 100 mm junction, arriving tomorrow.', 1033: 'Cartridge is a discontinued model; replacement on order.', 1042: 'Tenant has turned off the cold supply to the unit.', 1039: 'Sent from the website quote form, with two photos.' };
  const order = STATUSES.map(s => s[0]);
  function sample() {
    return SAMPLE.map(([no, title, customer, suburb, type, priority, dueOff, assignee, status, checks, createdOff, doneOff]) => {
      const history = [{ at: at(createdOff, 8, 30), kind: 'created', text: type === 'Quote' && createdOff === 0 ? 'Job created from the website form' : 'Job created' }];
      const steps = order.slice(1, order.indexOf(status) + 1);
      steps.forEach((s, i) => history.push({ at: at(Math.min(createdOff + i + 1, doneOff ?? 0), 9 + i, 15), kind: 'status', text: `Status changed to ${SL[s]}` }));
      if (assignee) history.splice(1, 0, { at: at(createdOff, 10, 5), kind: 'assign', text: `Assigned to ${assignee}` });
      if (NOTES[no]) history.push({ at: at(Math.min(createdOff + 1, 0), 14, 40), kind: 'note', text: NOTES[no], by: assignee || 'Office' });
      return { no, title, customer, suburb, type, priority, due: iso(addDays(dueOff)), assignee, status, checklist: CHECK.map((t, i) => ({ t, done: i < checks })), doneAt: doneOff != null ? at(doneOff, 16, 0) : null, history };
    });
  }

  /* storage */
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s) && s.length) return s; } catch { /* storage blocked */ } return sample(); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(jobs)); } catch { /* storage blocked: the demo still works for this visit */ } };

  let jobs = load();
  const F = { q: '', who: '', status: 'open', sort: 'due' };
  let view = 'list', current = null, opener = null;

  /* elements */
  const listEl = $('[data-list]'), boardEl = $('[data-board]'), emptyEl = $('[data-empty]'), resultEl = $('[data-result]');
  const sfEl = $('[data-status-filter]'), drawer = $('[data-drawer]'), detail = $('[data-detail]'), modal = $('[data-new]'), newForm = $('[data-newform]');
  const toastEl = $('[data-toast]');
  let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 3200); };

  /* filters */
  const isOpen = j => j.status !== 'done';
  const FILTERS = [['open', 'Open', isOpen], ['today', 'Due today', j => isOpen(j) && diff(j.due) === 0], ['late', 'Overdue', j => isOpen(j) && diff(j.due) < 0],
    ...STATUSES.map(([id, l]) => [id, l, j => j.status === id]), ['all', 'All', () => true]];
  const FMAP = Object.fromEntries(FILTERS.map(f => [f[0], f]));
  const textMatch = j => { const q = F.q.trim().toLowerCase(); if (!q) return true; return [j.no, j.title, j.customer, j.suburb, j.type, j.assignee].join(' ').toLowerCase().includes(q); };
  const base = j => textMatch(j) && (!F.who || (F.who === '-' ? !j.assignee : j.assignee === F.who));
  const sorters = { due: (a, b) => (a.status === 'done') - (b.status === 'done') || a.due.localeCompare(b.due) || PRIO[a.priority] - PRIO[b.priority], no: (a, b) => b.no - a.no, prio: (a, b) => PRIO[a.priority] - PRIO[b.priority] || a.due.localeCompare(b.due) };
  const visible = () => jobs.filter(j => base(j) && FMAP[F.status][2](j)).sort(sorters[F.sort]);
  const pct = j => Math.round(j.checklist.filter(c => c.done).length / j.checklist.length * 100);

  function renderKpis() {
    const open = jobs.filter(isOpen);
    $('[data-k=open]').textContent = open.length;
    $('[data-k=today]').textContent = open.filter(j => diff(j.due) === 0).length;
    $('[data-k=late]').textContent = open.filter(j => diff(j.due) < 0).length;
    $('[data-k=week]').textContent = jobs.filter(j => j.status === 'done' && j.doneAt && (day0 - new Date(j.doneAt)) / 86400000 < 7).length;
  }
  function renderStatusFilter() {
    sfEl.innerHTML = FILTERS.map(([id, label, fn]) => `<button type="button" class="sf" data-sf="${id}" aria-pressed="${F.status === id}">${label} <span class="n">${jobs.filter(j => base(j) && fn(j)).length}</span></button>`).join('');
  }
  const chip = s => `<span class="chip s-${s}">${SL[s]}</span>`;
  const progressHtml = j => `<span class="bar" aria-hidden="true"><i style="width:${pct(j)}%"></i></span><span class="pct">${pct(j)}%</span>`;

  function renderList(rows) {
    listEl.innerHTML = rows.length ? `<table class="tbl"><caption class="vh">Jobs</caption><thead><tr><th scope="col">Job</th><th scope="col">Work</th><th scope="col">Due</th><th scope="col">Assigned</th><th scope="col">Priority</th><th scope="col">Progress</th><th scope="col">Status</th></tr></thead><tbody>${rows.map(j => {
      const d = dueLabel(j);
      return `<tr><td class="c-no"><span class="no">#${j.no}</span></td><td class="c-work"><button type="button" class="open-btn" data-open="${j.no}">${esc(j.title)}</button><span class="sub">${esc(j.customer)} · ${esc(j.suburb)}</span></td><td class="c-due"><span class="${d.cls}">${d.text}</span></td><td class="c-who">${j.assignee ? `<span class="who-cell"><span class="av av-${esc(j.assignee)}" aria-hidden="true">${esc(j.assignee[0])}</span>${esc(j.assignee)}</span>` : '<span class="who-cell"><span class="av av-none" aria-hidden="true">–</span><span class="sub">Not assigned</span></span>'}</td><td class="c-prio"><span class="prio-${j.priority}">${PRIO_L[j.priority]}</span></td><td class="c-prog">${progressHtml(j)}</td><td class="c-status">${chip(j.status)}</td></tr>`;
    }).join('')}</tbody></table>` : '';
  }
  function renderBoard(rows) {
    boardEl.innerHTML = `<div class="board">${STATUSES.map(([id, label]) => {
      const lane = rows.filter(j => j.status === id);
      const next = order[order.indexOf(id) + 1];
      return `<section class="lane" aria-label="${label}"><h2>${label}<span>${lane.length}</span></h2>${lane.map(j => {
        const d = dueLabel(j);
        return `<article class="card"><div class="top"><span class="no">#${j.no}</span><span class="${d.cls}">${d.text}</span></div><button type="button" class="open-btn" data-open="${j.no}">${esc(j.title)}</button><span class="sub"><span class="av av-${esc(j.assignee) || 'none'}" aria-hidden="true">${esc(j.assignee ? j.assignee[0] : '–')}</span> ${esc(j.suburb)} · ${esc(j.assignee) || 'Not assigned'}</span>${progressHtml(j)}${next ? `<div class="acts"><button type="button" class="mv" data-move="${j.no}" data-to="${next}">Move to ${SL[next]}</button></div>` : ''}</article>`;
      }).join('')}</section>`;
    }).join('')}</div>`;
  }
  function render() {
    const rows = visible();
    renderKpis(); renderStatusFilter();
    resultEl.textContent = `Showing ${rows.length} of ${jobs.length} jobs` + (F.status !== 'all' ? ` · ${FMAP[F.status][1]}` : '') + (F.who ? ` · ${F.who === '-' ? 'not assigned' : F.who}` : '') + (F.q.trim() ? ` · matching “${F.q.trim()}”` : '');
    emptyEl.hidden = rows.length > 0;
    listEl.hidden = view !== 'list'; boardEl.hidden = view !== 'board';
    if (view === 'list') renderList(rows); else renderBoard(rows);
  }

  /* changes */
  const byNo = no => jobs.find(j => j.no === Number(no));
  const log = (j, kind, text, by) => j.history.push({ at: new Date().toISOString(), kind, text, by });
  function setStatus(j, s) {
    if (j.status === s) return;
    j.status = s; log(j, 'status', `Status changed to ${SL[s]}`);
    if (s === 'done') { j.doneAt = new Date().toISOString(); } else { j.doneAt = null; }
    save(); render(); toast(`Job #${j.no} moved to ${SL[s]}`);
  }

  /* detail drawer */
  function openDetail(no, from) {
    current = byNo(no); if (!current) return;
    opener = from || document.activeElement;
    renderDetail();
    if (!drawer.open) drawer.showModal();
    $('#d-title', detail)?.focus();
  }
  function renderDetail() {
    const j = current; const done = j.checklist.filter(c => c.done).length;
    detail.innerHTML = `
      <div class="d-head"><div><span class="no">#${j.no} · ${esc(j.type)}</span><h2 id="d-title" tabindex="-1">${esc(j.title)}</h2></div><button type="button" class="x" data-close aria-label="Close job">×</button></div>
      <div class="d-grid">
        <div class="d-field"><label for="d-status">Status</label><select id="d-status">${STATUSES.map(([id, l]) => `<option value="${id}"${id === j.status ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="d-field"><label for="d-who">Assigned to</label><select id="d-who"><option value="">Not assigned</option>${TEAM.map(t => `<option${t === j.assignee ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="d-field"><label for="d-due">Due</label><input id="d-due" type="date" value="${j.due}"></div>
        <div class="d-field"><label for="d-prio">Priority</label><select id="d-prio">${Object.entries(PRIO_L).map(([k, l]) => `<option value="${k}"${k === j.priority ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="d-field"><span class="lab">Customer</span><span class="val">${esc(j.customer)}</span></div>
        <div class="d-field"><span class="lab">Suburb</span><span class="val">${esc(j.suburb)}</span></div>
      </div>
      <div class="d-sec"><h3>Checklist</h3><p class="prog-line">${progressHtml(j)} <span>${done} of ${j.checklist.length} done</span></p>
        <ul class="checklist">${j.checklist.map((c, i) => `<li><label><input type="checkbox" data-check="${i}"${c.done ? ' checked' : ''}><span>${esc(c.t)}</span></label></li>`).join('')}</ul></div>
      <div class="d-sec d-note"><h3><label for="d-note">Add a note</label></h3><textarea id="d-note" rows="3" placeholder="What happened on site, what is needed next"></textarea><div><button type="button" class="b b-sm" data-addnote>Add note</button></div></div>
      <div class="d-sec"><h3>History</h3><ol class="timeline">${[...j.history].reverse().map(h => `<li class="k-${h.kind}"><time datetime="${h.at}">${fmtWhen(h.at)}</time>${esc(h.text)}${h.by ? ` <span class="sub">— ${esc(h.by)}</span>` : ''}</li>`).join('')}</ol></div>
      <div class="d-actions">${j.status === 'done' ? '<button type="button" class="b" data-reopen>Reopen job</button>' : '<button type="button" class="b b-go" data-done>Mark as done</button>'}<button type="button" class="b b-ghost" data-close>Close</button></div>`;
  }
  detail.addEventListener('change', e => {
    const j = current; if (!j) return;
    const t = e.target;
    if (t.id === 'd-status') { setStatus(j, t.value); renderDetail(); $('#d-status', detail).focus(); }
    else if (t.id === 'd-who') { j.assignee = t.value; log(j, 'assign', t.value ? `Assigned to ${t.value}` : 'Unassigned'); save(); render(); renderDetail(); $('#d-who', detail).focus(); toast(t.value ? `Job #${j.no} assigned to ${t.value}` : `Job #${j.no} unassigned`); }
    else if (t.id === 'd-due' && t.value) { j.due = t.value; log(j, 'due', `Due date changed to ${parseISO(t.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`); save(); render(); renderDetail(); $('#d-due', detail).focus(); }
    else if (t.id === 'd-prio') { j.priority = t.value; log(j, 'prio', `Priority set to ${PRIO_L[t.value]}`); save(); render(); renderDetail(); $('#d-prio', detail).focus(); }
    else if (t.dataset.check != null) {
      const c = j.checklist[Number(t.dataset.check)]; c.done = t.checked;
      log(j, 'check', `${c.t}: ${c.done ? 'ticked' : 'unticked'}`); save(); render();
      const idx = t.dataset.check; renderDetail(); $(`[data-check="${idx}"]`, detail).focus();
    }
  });
  detail.addEventListener('click', e => {
    const j = current; if (!j) return;
    if (e.target.closest('[data-close]')) { drawer.close(); return; }
    if (e.target.closest('[data-done]')) { setStatus(j, 'done'); renderDetail(); $('[data-reopen]', detail).focus(); return; }
    if (e.target.closest('[data-reopen]')) { setStatus(j, 'progress'); renderDetail(); $('[data-done]', detail).focus(); return; }
    if (e.target.closest('[data-addnote]')) {
      const ta = $('#d-note', detail), v = ta.value.trim();
      if (!v) { ta.setAttribute('aria-invalid', 'true'); ta.focus(); toast('Write a note first'); return; }
      log(j, 'note', v, 'You'); save(); render(); renderDetail(); $('#d-note', detail).focus(); toast(`Note added to job #${j.no}`);
    }
  });
  drawer.addEventListener('close', () => {
    const no = current?.no; current = null;
    // the list may have been redrawn while the panel was open: find the job's button again, or fall back to the list
    setTimeout(() => {
      const again = opener && document.contains(opener) ? opener : no && $(`[data-open="${no}"]`);
      (again || $('#jobs')).focus();
    }, 0);
  });
  drawer.addEventListener('click', e => { if (e.target === drawer) drawer.close(); });

  /* new job */
  const nWho = $('#n-who'), nType = $('#n-type');
  TEAM.forEach(t => nWho.insertAdjacentHTML('beforeend', `<option>${t}</option>`));
  TYPES.forEach(t => nType.insertAdjacentHTML('beforeend', `<option>${t}</option>`));
  const whoSel = $('#who');
  TEAM.forEach(t => whoSel.insertAdjacentHTML('beforeend', `<option>${t}</option>`));
  whoSel.insertAdjacentHTML('beforeend', '<option value="-">Not assigned</option>');
  const setErr = (el, msg) => {
    const f = el.closest('.f'); let p = $('.err', f);
    if (!msg) { p?.remove(); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); return; }
    if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = el.id + '-err'; f.appendChild(p); }
    p.textContent = msg; el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
  };
  const validateNew = () => $$('[required]', newForm).filter(el => { const bad = !el.value.trim(); setErr(el, bad ? el.dataset.msg : ''); return bad; });
  function openNew(from) {
    opener = from; newForm.reset(); $$('[required]', newForm).forEach(el => setErr(el, ''));
    $('.form-alert', newForm).hidden = true;
    $('#n-due').value = iso(addDays(1));
    modal.showModal(); $('#n-work').focus();
  }
  newForm.addEventListener('input', () => { if ($('[aria-invalid=true]', newForm)) validateNew(); });
  newForm.addEventListener('click', e => { if (e.target.closest('[data-close]')) modal.close(); });
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); });
  newForm.addEventListener('submit', e => {
    e.preventDefault();
    const bad = validateNew();
    if (bad.length) { const a = $('.form-alert', newForm); a.textContent = `Fix ${bad.length === 1 ? 'the highlighted field' : `the ${bad.length} highlighted fields`} to add the job.`; a.hidden = false; bad[0].focus(); return; }
    const d = Object.fromEntries(new FormData(newForm));
    const no = Math.max(...jobs.map(j => j.no)) + 1;
    const j = { no, title: d.title.trim(), customer: d.customer.trim(), suburb: d.suburb.trim(), type: d.type, priority: d.priority, due: d.due, assignee: d.assignee, status: d.assignee ? 'scheduled' : 'new', checklist: CHECK.map(t => ({ t, done: false })), doneAt: null, history: [] };
    log(j, 'created', 'Job created');
    if (j.assignee) { log(j, 'assign', `Assigned to ${j.assignee}`); log(j, 'status', 'Status changed to Scheduled'); }
    if (d.note && d.note.trim()) log(j, 'note', d.note.trim(), 'You');
    jobs.unshift(j); save();
    F.q = ''; $('#q').value = ''; F.who = ''; whoSel.value = ''; F.status = 'open';
    opener = null; modal.close(); render();
    toast(`Job #${no} added`);
    const btn = $(`[data-open="${no}"]`); if (btn) btn.focus();
  });

  /* export */
  function exportCsv() {
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Job no', 'Work', 'Customer', 'Suburb', 'Type', 'Priority', 'Status', 'Assigned to', 'Due', 'Checklist %'];
    const rows = visible().map(j => [j.no, j.title, j.customer, j.suburb, j.type, PRIO_L[j.priority], SL[j.status], j.assignee, j.due, pct(j)]);
    const csv = [head, ...rows].map(r => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tallow-creek-jobs-demo.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Spreadsheet with ${rows.length} jobs downloaded`);
  }

  /* wiring */
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.open) openDetail(t.dataset.open, t);
    else if (t.dataset.move) { const j = byNo(t.dataset.move); setStatus(j, t.dataset.to); const b = $(`[data-open="${j.no}"]`); if (b) b.focus(); }
    else if (t.dataset.sf) { F.status = t.dataset.sf; render(); $(`[data-sf="${F.status}"]`).focus(); }
    else if (t.dataset.kpi) { F.status = t.dataset.kpi; render(); toast(`Showing ${FMAP[F.status][1].toLowerCase()} jobs`); }
    else if (t.dataset.view) { view = t.dataset.view; $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view))); render(); }
    else if (t.dataset.act === 'new') openNew(t);
    else if (t.dataset.act === 'export') exportCsv();
    else if (t.dataset.act === 'clear') { F.q = ''; $('#q').value = ''; F.who = ''; whoSel.value = ''; F.status = 'all'; render(); }
    else if (t.dataset.act === 'reset') { try { localStorage.removeItem(KEY); } catch { /* ignore */ } jobs = sample(); F.q = ''; $('#q').value = ''; F.who = ''; whoSel.value = ''; F.status = 'open'; render(); toast('Sample data restored'); }
  });
  $('#q').addEventListener('input', e => { F.q = e.target.value; render(); });
  whoSel.addEventListener('change', e => { F.who = e.target.value; render(); });
  $('#sort').addEventListener('change', e => { F.sort = e.target.value; render(); });
  render();
})();
