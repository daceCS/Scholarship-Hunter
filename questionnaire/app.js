/* Questionnaire engine. Reads TW.screens (schema.js), renders one screen at a time,
   stores answers by question id, and saves after every change.
   Backend seams: TW.api (api.js) and TW.mock (mock.js). */
(function () {
  'use strict';
  const { phases, screens, questions, qById } = TW;
  const KEY = 'tw.intake.v1';
  const $ = id => document.getElementById(id);
  const card = $('card');

  /* ───────────── small helpers ───────────── */
  const val = (x, a) => typeof x === 'function' ? x(a) : x;
  const cssId = s => String(s).replace(/[^\w-]/g, '_');
  const isEmpty = v => v === undefined || v === null || v === '' ||
    (typeof v === 'number' && Number.isNaN(v)) || (Array.isArray(v) && v.length === 0);
  const clone = x => JSON.parse(JSON.stringify(x));
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = s => (s || '').split(/[\n,;]+/).map(x => x.trim()).filter(Boolean);

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(9)) {
      if (kid === undefined || kid === null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return el;
  }
  const icon = cls => h('i', { class: cls, 'aria-hidden': 'true' });

  /* ───────────── state ───────────── */
  function fresh() {
    return { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), answers: {}, withheld: {}, screen: 'welcome', visited: { welcome: true }, updated: Date.now() };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.answers ? s : null; } catch (e) { return null; }
  }
  let state = load();
  const resumed = !!(state && Object.keys(state.answers).length);
  if (!state) state = fresh();

  let A = {};          // effective answers: hidden questions dropped
  let W = new Set();   // effective withheld ids

  const visibleQ = (q, a) => (!q.screen.when || q.screen.when(a)) && (!q.when || q.when(a));
  const screenVisible = (s, a) => (!s.when || s.when(a)) && (!s.questions.length || s.questions.some(q => visibleQ(q, a)));
  const visibleScreens = () => screens.filter(s => screenVisible(s, A));

  function effective() {
    const out = {};
    for (const q of questions) {
      if (!visibleQ(q, out) || state.withheld[q.id]) continue;
      const v = state.answers[q.id];
      if (v !== undefined) out[q.id] = v;
    }
    return out;
  }
  function recompute() {
    A = effective();
    W = new Set(Object.keys(state.withheld).filter(id => qById[id] && visibleQ(qById[id], A)));
  }

  let savedTimer;
  function flashSaved(text) {
    const el = $('saved');
    el.replaceChildren(icon('ph-fill ph-check-circle'), text || 'Saved');
    el.classList.add('on');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => el.classList.remove('on'), 1600);
  }
  function save() {
    state.updated = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); flashSaved(); } catch (e) { /* private mode: keep going in memory */ }
    TW.api.saveProgress(state);
  }

  function setAnswer(id, v) {
    if (isEmpty(v)) delete state.answers[id]; else state.answers[id] = v;
    delete state.withheld[id];
    afterChange();
  }
  function setWithheld(id, on) {
    if (on) { state.withheld[id] = true; delete state.answers[id]; } else delete state.withheld[id];
    afterChange();
  }
  function afterChange() {
    save();
    recompute();
    refreshBlocks();
    renderChrome();
  }

  /* ───────────── validation ───────────── */
  function validateQ(q) {
    const v = A[q.id];
    if (q.required && isEmpty(v) && !state.withheld[q.id]) return 'This one is needed to continue.';
    if (v === undefined) return '';
    if (q.id === 'geo.zip' && !/^\d{5}$/.test(v)) return 'Enter a 5-digit ZIP code.';
    if (q.type === 'number') {
      if (q.min !== undefined && v < q.min) return `Enter a number of ${q.min} or more.`;
      if (q.max !== undefined && v > q.max) return `Enter a number of ${q.max} or less.`;
    }
    if (q.type === 'date' && !/^\d{4}-\d{2}$/.test(v)) return 'Use month and year, like 2028-05.';
    return '';
  }

  /* ───────────── controls ───────────── */
  // Each control: (q, ctx) => { el, sync, input?, inputId? }. ctx = { get, set, withheld, setWithheld }.
  const CONTROLS = {};

  function highlight(s, q) {
    q = q.trim();
    const i = q ? s.toLowerCase().indexOf(q.toLowerCase()) : -1;
    return i < 0 ? s : [s.slice(0, i), h('mark', {}, s.slice(i, i + q.length)), s.slice(i + q.length)];
  }

  function combo({ id, source, placeholder, mode, onValue, onCommit, exclude }) {
    const src = TW.data[source] || [];
    const list = h('ul', { class: 'listbox', role: 'listbox', id: id + '-lb', hidden: true });
    const input = h('input', { class: 'input', id, type: 'text', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': id + '-lb', autocomplete: 'off', placeholder });
    const wrap = h('div', { class: 'combo' }, input, list);
    let items = [], active = -1;

    function find(q) {
      const lq = q.trim().toLowerCase();
      const ex = (exclude ? exclude() : []).map(x => x.toLowerCase());
      const pool = src.filter(s => !ex.includes(s.toLowerCase()));
      const res = lq
        ? pool.filter(s => s.toLowerCase().startsWith(lq)).concat(pool.filter(s => !s.toLowerCase().startsWith(lq) && s.toLowerCase().includes(lq)))
        : pool;
      return res.slice(0, 7);
    }
    function close() {
      list.hidden = true; active = -1;
      input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant');
    }
    function open() {
      items = find(input.value); active = -1;
      if (!items.length) return close();
      list.replaceChildren(...items.map((s, i) => h('li', { role: 'option', id: `${id}-o${i}`, 'aria-selected': 'false', onmousedown: e => { e.preventDefault(); pick(s); } }, highlight(s, input.value))));
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function setActive(i) {
      active = i;
      [...list.children].forEach((li, j) => li.setAttribute('aria-selected', j === i ? 'true' : 'false'));
      if (i >= 0) { input.setAttribute('aria-activedescendant', `${id}-o${i}`); list.children[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function commitText() {
      const t = input.value.trim();
      input.value = '';
      if (t) onCommit(t);
    }
    function pick(s) {
      if (mode === 'commit') { input.value = ''; onCommit(s); } else { input.value = s; onValue(s); }
      close();
    }

    input.addEventListener('input', () => {
      if (mode === 'value') onValue(input.value.trim() === '' ? undefined : input.value);
      if (src.length) open();
    });
    input.addEventListener('focus', () => { if (src.length && !input.value) open(); });
    input.addEventListener('blur', () => { close(); if (mode === 'commit') commitText(); });
    input.addEventListener('keydown', e => {
      if (e.isComposing) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(); else setActive((active + 1) % items.length); }
      else if (e.key === 'ArrowUp' && !list.hidden) { e.preventDefault(); setActive((active - 1 + items.length) % items.length); }
      else if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(); }
      else if (e.key === 'Enter') {
        if (!list.hidden && active >= 0) { e.preventDefault(); pick(items[active]); }
        else if (mode === 'commit' && input.value.trim()) { e.preventDefault(); commitText(); close(); }
      } else if (e.key === ',' && mode === 'commit' && input.value.trim()) { e.preventDefault(); commitText(); close(); }
    });
    return { el: wrap, input };
  }

  CONTROLS.text = (q, ctx) => {
    const id = 'i-' + cssId(q.id);
    const input = h('input', { class: 'input' + (q.digits ? ' field-narrow' : ''), id, type: 'text', placeholder: q.placeholder, maxlength: q.maxlength, inputmode: q.inputmode, autocomplete: q.ac || 'off' });
    input.addEventListener('input', () => {
      if (q.digits) input.value = input.value.replace(/\D/g, '');
      ctx.set(input.value.trim() === '' ? undefined : input.value);
    });
    input.addEventListener('blur', () => {
      const t = input.value.trim();
      if (t !== input.value) { input.value = t; ctx.set(t || undefined); }
    });
    const sync = () => {
      const v = ctx.get(), s = v === undefined ? '' : String(v);
      if (input.value !== s && document.activeElement !== input) input.value = s;
    };
    sync();
    return { el: input, input, inputId: id, sync };
  };

  CONTROLS.long_text = (q, ctx) => {
    const id = 'i-' + cssId(q.id);
    const ta = h('textarea', { class: 'textarea', id, placeholder: q.placeholder, rows: 4 });
    ta.addEventListener('input', () => ctx.set(ta.value.trim() === '' ? undefined : ta.value));
    ta.addEventListener('blur', () => { const t = ta.value.trim(); if (t !== ta.value) { ta.value = t; ctx.set(t || undefined); } });
    const ex = q.examples ? h('div', { class: 'quick' }, q.examples.map(x => h('button', {
      type: 'button', class: 'chip ghost',
      onclick: () => { const cur = ta.value.trim().replace(/[,;\s]+$/, ''); ta.value = cur ? cur + ', ' + x : x; ctx.set(ta.value); }
    }, '+ ' + x))) : null;
    const sync = () => {
      const v = ctx.get() || '';
      if (ta.value !== v && document.activeElement !== ta) ta.value = v;
    };
    sync();
    return { el: h('div', {}, ta, ex), input: ta, inputId: id, sync };
  };

  CONTROLS.number = (q, ctx) => {
    const id = 'i-' + cssId(q.id);
    const input = h('input', { class: 'input' + (q.prefix ? ' has-prefix' : ''), id, type: 'text', inputmode: q.decimals ? 'decimal' : 'numeric', placeholder: q.placeholder, autocomplete: 'off' });
    const presetBtns = (q.presets || []).map(p => h('button', {
      type: 'button', class: 'chip', 'aria-pressed': 'false',
      onclick: () => { input.value = String(p); ctx.set(p); sync(); }
    }, (q.prefix || '') + p.toLocaleString('en-US')));
    input.addEventListener('input', () => {
      let s = input.value.replace(q.min < 0 ? /[^\d.\-]/g : /[^\d.]/g, '').replace(/(?!^)-/g, '');
      if (!q.decimals) s = s.replace(/\./g, '');
      else if (s.includes('.')) { const [i, ...d] = s.split('.'); s = i + '.' + d.join('').slice(0, q.decimals); }
      input.value = s;
      const n = parseFloat(s);
      ctx.set(Number.isFinite(n) ? n : undefined);
      sync();
    });
    function sync() {
      const v = ctx.get();
      if (document.activeElement !== input) input.value = v === undefined ? '' : String(v);
      presetBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(v === q.presets[i])));
    }
    sync();
    const field = h('div', { class: 'num-wrap' }, q.prefix ? h('span', { class: 'prefix' }, q.prefix) : null, input);
    return { el: h('div', {}, field, presetBtns.length ? h('div', { class: 'presets' }, presetBtns) : null), input, inputId: id, sync };
  };

  CONTROLS.date = (q, ctx) => {
    const id = 'i-' + cssId(q.id), yr = new Date().getFullYear();
    const input = h('input', { class: 'input field-narrow', id, type: 'month', min: `${yr - 1}-01`, max: `${yr + 10}-12`, placeholder: 'YYYY-MM' });
    input.addEventListener('input', () => ctx.set(input.value || undefined));
    const sync = () => { const v = ctx.get() || ''; if (input.value !== v) input.value = v; };
    sync();
    return { el: input, input, inputId: id, sync };
  };

  CONTROLS.autocomplete = (q, ctx) => {
    const id = 'i-' + cssId(q.id);
    const c = combo({ id, source: q.source, placeholder: q.placeholder, mode: 'value', onValue: v => { ctx.set(v); sync(); } });
    const quick = (q.quick || []).map(x => h('button', {
      type: 'button', class: 'chip ghost', 'aria-pressed': 'false',
      onclick: () => { c.input.value = x; ctx.set(x); sync(); }
    }, x));
    function sync() {
      const v = ctx.get();
      const s = v === undefined ? '' : String(v);
      if (c.input.value !== s && document.activeElement !== c.input) c.input.value = s;
      quick.forEach((b, i) => b.setAttribute('aria-pressed', String(v === q.quick[i])));
    }
    sync();
    return { el: h('div', {}, c.el, quick.length ? h('div', { class: 'quick' }, quick) : null), input: c.input, inputId: id, sync };
  };

  CONTROLS.single = (q, ctx) => {
    const id = 'i-' + cssId(q.id);
    const opts = val(q.options, A) || [];
    const ui = q.ui || (opts.some(o => o.d) ? 'cards' : 'chips');
    if (ui === 'select') {
      const sel = h('select', { class: 'select', id }, h('option', { value: '' }, 'Select'), opts.map(o => h('option', { value: o.v }, o.l)));
      sel.addEventListener('change', () => ctx.set(sel.value || undefined));
      const sync = () => { sel.value = ctx.get() === undefined ? '' : String(ctx.get()); };
      sync();
      return { el: sel, input: sel, inputId: id, sync };
    }
    const radios = opts.map(o => h('input', { type: 'radio', name: q.id, value: o.v }));
    radios.forEach((r, i) => r.addEventListener('change', () => { ctx.set(opts[i].v); }));
    const labels = opts.map((o, i) => ui === 'cards'
      ? h('label', { class: 'opt' }, radios[i], h('span', { class: 'opt-body' }, h('span', { class: 'opt-l' }, o.l), o.d ? h('span', { class: 'opt-s' }, o.d) : null), h('span', { class: 'tick' }, icon('ph-fill ph-check')))
      : h('label', { class: 'chip' }, radios[i], h('span', {}, o.l)));
    const sync = () => { const v = ctx.get(); radios.forEach(r => { r.checked = !ctx.withheld() && v !== undefined && r.value === String(v); }); };
    sync();
    const el = ui === 'cards' ? h('div', { class: 'opt-list' + (opts.length >= 4 ? ' two' : '') }, labels) : h('div', { class: 'chips' }, labels);
    return { el, sync };
  };

  CONTROLS.bool = (q, ctx) => {
    const items = [['yes', 'Yes'], ['no', 'No']].concat(q.skippable ? [['skip', 'Prefer not to answer']] : []);
    const radios = items.map(([v]) => h('input', { type: 'radio', name: q.id, value: v }));
    radios.forEach((r, i) => r.addEventListener('change', () => {
      const v = items[i][0];
      if (v === 'skip') ctx.setWithheld(true); else ctx.set(v === 'yes');
    }));
    const sync = () => {
      const cur = ctx.withheld() ? 'skip' : ctx.get() === true ? 'yes' : ctx.get() === false ? 'no' : null;
      radios.forEach(r => { r.checked = r.value === cur; });
    };
    sync();
    return { el: h('div', { class: 'seg' }, items.map(([, l], i) => h('label', { class: 'chip' }, radios[i], h('span', {}, l)))), sync };
  };

  CONTROLS.multi = (q, ctx) => {
    const base = cssId(q.id);
    const opts = val(q.options, A) || [];
    const get = () => Array.isArray(ctx.get()) ? ctx.get() : [];
    const isOpt = v => opts.some(o => o.v === v);
    const exclusive = opts.filter(o => o.x).map(o => o.v);
    const boxes = opts.map(o => h('input', { type: 'checkbox', value: o.v }));
    boxes.forEach((b, i) => b.addEventListener('change', () => {
      const o = opts[i];
      let cur = get().slice();
      if (b.checked) cur = o.x ? [o.v] : cur.filter(v => !exclusive.includes(v)).concat(o.v);
      else cur = cur.filter(v => v !== o.v);
      ctx.set(cur.length ? cur : undefined);
      sync();
    }));
    const chips = opts.length ? h('div', { class: 'chips' }, opts.map((o, i) => h('label', { class: 'chip' }, boxes[i], h('span', {}, o.l)))) : null;
    const tagRow = h('div', { class: 'tag-row' });
    const add = t => {
      const cur = get();
      if (cur.some(v => v.toLowerCase() === t.toLowerCase())) return;
      ctx.set(cur.filter(v => !exclusive.includes(v)).concat(t));
      sync();
    };
    const remove = t => { const cur = get().filter(v => v !== t); ctx.set(cur.length ? cur : undefined); sync(); };
    const showInput = q.other || !opts.length;
    const inputId = 'i-' + base;
    const c = showInput ? combo({
      id: inputId, source: q.source, placeholder: q.otherPlaceholder || q.placeholder || 'Add your own',
      mode: 'commit', onCommit: add, exclude: get
    }) : null;
    if (c && opts.length) c.input.setAttribute('aria-label', q.otherPlaceholder || 'Add your own');
    const quick = (q.quick || []).map(x => h('button', { type: 'button', class: 'chip ghost', 'aria-pressed': 'false', onclick: () => (get().includes(x) ? remove(x) : add(x)) }, x));
    function sync() {
      const cur = get();
      boxes.forEach((b, i) => { b.checked = cur.includes(opts[i].v); });
      tagRow.replaceChildren(...cur.filter(v => !isOpt(v)).map(t => h('span', { class: 'chip tag' }, t,
        h('button', { type: 'button', 'aria-label': 'Remove ' + t, onclick: () => remove(t) }, icon('ph ph-x')))));
      quick.forEach((b, i) => b.setAttribute('aria-pressed', String(cur.includes(q.quick[i]))));
    }
    sync();
    const el = h('div', { class: 'multi-wrap' }, chips, c && c.el, tagRow, quick.length ? h('div', { class: 'quick' }, quick) : null);
    return { el, sync, input: !opts.length && c ? c.input : undefined, inputId: !opts.length && c ? inputId : undefined };
  };

  function controlFor(q, ctx) {
    const type = q.type === 'autocomplete' && q.multiple ? 'multi' : q.type;
    const nq = type === 'multi' && q.type === 'autocomplete' ? { ...q, options: [], other: true } : q;
    return CONTROLS[type](nq, ctx);
  }

  CONTROLS.group = (q, ctx) => {
    const base = cssId(q.id);
    const nonEmptyRow = r => Object.values(r).some(v => !isEmpty(v));
    let rows = Array.isArray(ctx.get()) && ctx.get().length ? clone(ctx.get()) : [{}];
    let last = JSON.stringify(ctx.get() || []);
    const list = h('div', { class: 'rows' });

    function commit() {
      const clean = rows.filter(nonEmptyRow);
      last = JSON.stringify(clean);
      ctx.set(clean.length ? clone(clean) : undefined);
    }
    function buildRow(row, i) {
      const grid = h('div', { class: 'grow-grid' });
      q.fields.forEach(f => {
        const opts = val(f.options, A) || [];
        const fq = { ...f, id: `${base}_${i}_${f.key}`, ui: f.ui || (f.type === 'single' && opts.length > 4 ? 'select' : undefined) };
        const fctx = {
          get: () => row[f.key],
          set: v => { if (isEmpty(v)) delete row[f.key]; else row[f.key] = v; commit(); },
          withheld: () => false, setWithheld: () => {}
        };
        const c = controlFor(fq, fctx);
        const lid = fq.id + '-l';
        const lab = c.inputId ? h('label', { class: 'gf-label', for: c.inputId }, f.label) : h('div', { class: 'gf-label', id: lid }, f.label);
        const wrap = h('div', { class: 'gf' + (f.wide || f.type === 'multi' ? ' wide' : '') }, lab, c.el);
        if (!c.inputId) { wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-labelledby', lid); }
        grid.append(wrap);
      });
      const head = h('div', { class: 'grow-head' },
        h('span', { class: 'grow-title' }, `${q.rowLabel || 'Item'} ${i + 1}`),
        rows.length > 1 ? h('button', { type: 'button', class: 'rm', onclick: () => { rows.splice(i, 1); commit(); renderRows(); } }, icon('ph ph-trash'), 'Remove') : null);
      return h('div', { class: 'grow-row' }, head, grid);
    }
    function renderRows() { list.replaceChildren(...rows.map(buildRow)); }
    renderRows();
    const addBtn = h('button', {
      type: 'button', class: 'add',
      onclick: () => {
        rows.push({}); renderRows();
        const f = list.lastElementChild.querySelector('input,select');
        if (f) f.focus();
      }
    }, icon('ph ph-plus'), q.addLabel || 'Add another');
    const sync = () => {
      const cur = ctx.get();
      if (JSON.stringify(cur || []) !== last) {
        rows = cur && cur.length ? clone(cur) : [{}];
        last = JSON.stringify(cur || []);
        renderRows();
      }
    };
    return { el: h('div', {}, list, addBtn), sync };
  };

  /* ───────────── question blocks ───────────── */
  let blocks = [];
  let attempted = false;

  function buildBlock(q) {
    if (q.type === 'flag') return null;
    const lid = 'l-' + cssId(q.id);
    if (q.type === 'note') {
      const el = h('div', { class: 'note' }, icon(q.icon || 'ph ph-info'), h('p', {}, q.text));
      const noteBlock = { q, el, visible: true, showErr() {}, refresh: first => toggleVisible(noteBlock, first) };
      return noteBlock;
    }
    const ctx = {
      get: () => state.answers[q.id],
      set: v => setAnswer(q.id, v),
      withheld: () => !!state.withheld[q.id],
      setWithheld: b => setWithheld(q.id, b)
    };
    const ctl = controlFor(q, ctx);
    const groupish = !ctl.inputId;
    const prompt = val(q.prompt, A), hintText = val(q.hint, A);
    const label = groupish ? h('div', { class: 'q-label', id: lid }, prompt) : h('label', { class: 'q-label', for: ctl.inputId, id: lid }, prompt);
    if (q.required) label.append(h('span', { class: 'req' }, 'Required'));
    const clearBtn = h('button', { class: 'clear', type: 'button', hidden: true, onclick: () => ctx.set(undefined) }, 'Clear');
    const hint = hintText ? h('p', { class: 'hint', id: lid + '-h' }, hintText) : null;
    const body = h('div', { class: 'q-body' }, ctl.el);
    const err = h('p', { class: 'err', id: lid + '-e', role: 'alert', hidden: true });
    const showPna = q.skippable && q.type !== 'bool';
    const pnaBtn = showPna ? h('button', { class: 'pna', type: 'button', 'aria-pressed': 'false', onclick: () => ctx.setWithheld(!ctx.withheld()) }, icon('ph ph-eye-slash'), 'Prefer not to answer') : null;
    const pnaNote = showPna ? h('p', { class: 'pna-note', hidden: true }, 'Skipped. We will treat this as unknown, not as no.') : null;
    const el = h('div', { class: 'q', 'data-qid': q.id }, h('div', { class: 'q-head' }, label, clearBtn), hint, body, showPna ? h('div', { class: 'pna-row' }, pnaBtn, pnaNote) : null, err);
    if (groupish) {
      el.setAttribute('role', 'group'); el.setAttribute('aria-labelledby', lid);
      if (hint) el.setAttribute('aria-describedby', lid + '-h');
    } else {
      ctl.input.setAttribute('aria-describedby', (hint ? lid + '-h ' : '') + lid + '-e');
    }
    const block = {
      q, el, ctl, visible: true, shown: false,
      refresh(first) {
        toggleVisible(block, first);
        ctl.sync && ctl.sync();
        const w = ctx.withheld();
        body.classList.toggle('is-withheld', w && q.type !== 'bool');
        body.inert = w && q.type !== 'bool';
        if (pnaBtn) { pnaBtn.setAttribute('aria-pressed', String(w)); pnaNote.hidden = !w; }
        clearBtn.hidden = !(!q.required && ['single', 'date', 'number'].includes(q.type) && A[q.id] !== undefined);
      },
      showErr(msg) {
        err.hidden = !msg;
        err.replaceChildren(...(msg ? [icon('ph-fill ph-warning-circle'), msg] : []));
        if (ctl.input) ctl.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
    };
    return block;
  }
  function toggleVisible(block, first) {
    const vis = visibleQ(block.q, A);
    block.el.hidden = !vis;
    if (vis && !block.visible && !first && !reduceMotion()) {
      block.el.classList.add('enter');
      block.el.addEventListener('animationend', () => block.el.classList.remove('enter'), { once: true });
    }
    block.visible = vis;
  }
  function refreshBlocks() {
    blocks.forEach(b => {
      b.refresh(false);
      if (attempted) b.showErr(b.visible ? validateQ(b.q) : '');
    });
  }

  /* ───────────── navigation ───────────── */
  const currentScreen = () => screens.find(s => s.id === state.screen);
  function go(id, dir = 1) {
    state.screen = id; state.visited[id] = true;
    save(); recompute();
    renderScreen(dir); renderChrome();
    window.scrollTo({ top: 0 });
  }
  function step(delta) {
    const vs = visibleScreens();
    const i = vs.findIndex(s => s.id === state.screen);
    const t = vs[i + delta];
    if (t) go(t.id, delta);
  }
  const next = () => step(1);
  const back = () => step(-1);

  function tryNext() {
    attempted = true;
    let first = null;
    for (const b of blocks) {
      if (!b.visible) continue;
      const msg = validateQ(b.q);
      b.showErr(msg);
      if (msg && !first) first = b;
    }
    if (first) {
      first.el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
      const f = first.el.querySelector('input,select,textarea,button');
      if (f) f.focus({ preventScroll: true });
      return;
    }
    next();
  }
  function withholdScreen(s) {
    for (const q of s.questions) {
      if (q.type === 'note' || q.type === 'flag' || !visibleQ(q, A)) continue;
      if (A[q.id] === undefined) state.withheld[q.id] = true;
    }
    save(); recompute(); next();
  }

  /* ───────────── screens ───────────── */
  function head(s, title, lede) {
    const phase = phases.find(p => p.id === s.phase);
    return [
      h('span', { class: 'eyebrow' }, `${phase.label} · ${s.section}`),
      h('h1', { tabindex: '-1' }, title),
      lede ? h('p', { class: 'lede' }, lede) : null
    ];
  }
  const backBtn = () => h('button', { class: 'btn btn-ghost', type: 'button', onclick: back }, icon('ph ph-arrow-left'), 'Back');

  function questionScreen(s) {
    blocks = []; attempted = false;
    const body = h('div', { class: 'body' });
    s.questions.forEach(q => { const b = buildBlock(q); if (b) { blocks.push(b); body.append(b.el); } });
    blocks.forEach(b => b.refresh(true));
    const vs = visibleScreens();
    const nextScreen = vs[vs.findIndex(x => x.id === s.id) + 1];
    const hasRequired = s.questions.some(q => q.required && visibleQ(q, A));
    const skip = hasRequired ? null : s.sensitive
      ? h('button', { class: 'link-btn', type: 'button', onclick: () => withholdScreen(s) }, 'Prefer not to answer these')
      : h('button', { class: 'link-btn', type: 'button', onclick: next }, 'Skip');
    const nextLabel = nextScreen && nextScreen.kind === 'summary' ? 'Finish' : 'Continue';
    return h('div', { class: 'screen' },
      head(s, val(s.title, A), val(s.lede, A)),
      s.callout ? h('div', { class: 'callout' }, icon(s.callout.icon), h('span', {}, s.callout.text)) : null,
      body,
      h('div', { class: 'actions' }, backBtn(), h('span', { class: 'grow' }), skip,
        h('button', { class: 'btn btn-primary', type: 'button', 'data-next': '', onclick: tryNext }, nextLabel, icon('ph ph-arrow-right'))));
  }

  function welcomeScreen(s) {
    blocks = [];
    const item = (ic, title, text) => h('li', {}, icon(ic), h('span', {}, h('b', {}, title), ' ', text));
    return h('div', { class: 'screen' },
      h('span', { class: 'eyebrow' }, 'About 3 minutes'),
      h('h1', { tabindex: '-1' }, 'Let\'s build your scholarship profile.'),
      h('p', { class: 'lede' }, 'Answer a few questions and our agent will look for awards you actually qualify for. The more you share, the sharper the matches.'),
      h('ul', { class: 'promises' },
        item('ph ph-timer', 'Quick start.', 'The core questions take about 3 minutes, and you see your first results right after.'),
        item('ph ph-eye-slash', 'Skip anything personal.', 'Skipping is never treated as a no.'),
        item('ph ph-floppy-disk', 'Saved as you go.', 'Close the tab and pick up later.')),
      h('div', { class: 'actions' }, h('span', { class: 'grow' }),
        h('button', { class: 'btn btn-primary', type: 'button', 'data-next': '', onclick: next }, 'Start', icon('ph ph-arrow-right'))));
  }

  function matchCard(m, top) {
    return h('article', { class: 'match' + (top ? ' top' : '') },
      h('div', {}, h('h3', {}, m.name), h('div', { class: 'org' }, m.org)),
      h('div', { class: 'amt' }, '$' + m.amt.toLocaleString('en-US')),
      h('div', { class: 'meta' },
        h('span', { class: 'tagp pct' }, icon('ph-fill ph-target'), m.pct + '% match'),
        h('span', { class: 'tagp' }, 'Due ' + m.due),
        h('span', { class: 'tagp' }, 'Preview')));
  }

  function resultsScreen(s) {
    blocks = [];
    const total = TW.mock.estimate(A);
    const awards = TW.mock.awards(A, 4);
    return h('div', { class: 'screen' },
      h('span', { class: 'eyebrow' }, 'Core · First results'),
      h('h1', { tabindex: '-1' }, 'That is your core profile.'),
      h('p', { class: 'lede' }, 'Here is a first look at what the search agent will go after.'),
      h('div', { class: 'big-count' }, h('b', {}, total), h('span', {}, 'awards you could apply for')),
      A['edu.status'] === 'hs_underclass'
        ? h('div', { class: 'callout' }, icon('ph-fill ph-pencil-line'), h('span', {}, 'Since you are still in high school, we skip the financial aid questions and include essay contests you can enter now.'))
        : null,
      h('div', { class: 'matches' }, awards.map((m, i) => matchCard(m, i === 0))),
      h('p', { class: 'fine' }, icon('ph ph-info'), 'Preview only. Real, verified matches arrive once your search runs.'),
      h('div', { class: 'unlock' },
        h('h2', {}, 'Want more matches?'),
        h('p', {}, 'The next questions are about your family, activities, and goals. They are the most valuable part of your profile, because they point to the small local awards most people never see.')),
      h('div', { class: 'actions' }, backBtn(), h('span', { class: 'grow' }),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('summary', 1) }, 'Finish for now'),
        h('button', { class: 'btn btn-primary', type: 'button', 'data-next': '', onclick: next }, 'Unlock more matches', icon('ph ph-arrow-right'))));
  }

  function consentScreen(s) {
    blocks = [];
    const item = text => h('li', {}, icon('ph-fill ph-check-circle'), h('span', {}, text));
    const choose = yesConsent => { setAnswer('consent.sensitive', yesConsent); next(); };
    return h('div', { class: 'screen' },
      h('span', { class: 'eyebrow' }, 'Sensitive · Before we continue'),
      h('h1', { tabindex: '-1' }, 'The next questions are more personal.'),
      h('p', { class: 'lede' }, 'Answering them unlocks awards tied to heritage, first-generation status, disability, family circumstances, and financial need. Many of these get very few applicants.'),
      h('ul', { class: 'consent-list' },
        item('Every question is optional. You can skip any one.'),
        item('"Prefer not to answer" is never treated as "no". We treat it as unknown, so it never rules you out.'),
        item('This data is stored separately from the rest of your profile, and you can delete it any time.'),
        item('We never ask about legal status.')),
      h('div', { class: 'actions' }, backBtn(), h('span', { class: 'grow' }),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => choose(false) }, 'Skip this section'),
        h('button', { class: 'btn btn-primary', type: 'button', 'data-next': '', onclick: () => choose(true) }, 'Continue', icon('ph ph-arrow-right'))));
  }

  const SECTION_TARGET = { academic: 'edu-status', geo: 'geo-where', affiliations: 'affil-employer', activities: 'act-1', career: 'career-1', identity: 'id-heritage', circumstances: 'circ-health', financial: 'fin-aid', effort: 'effort-money', exclusions: 'history' };
  const SECTION_NAME = { academic: 'Academic', geo: 'Location', affiliations: 'Affiliations', activities: 'Activities', career: 'Career', identity: 'Identity', circumstances: 'Circumstances', financial: 'Financial', effort: 'Effort budget', exclusions: 'Already tried' };

  function flatten(v, key) {
    if (Array.isArray(v)) return v.flatMap(x => (x && typeof x === 'object') ? [`${key}: ${Object.values(x).flat().join(' · ')}`] : [`${key}: ${x}`]);
    if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => flatten(x, k));
    return [`${key}: ${v}`];
  }

  function summaryScreen(s) {
    blocks = [];
    const avatar = TW.buildAvatar(A, W, { id: state.id, updated: state.updated, visited: state.visited });
    const json = JSON.stringify(avatar, null, 2);
    const total = TW.mock.estimate(A), service = TW.mock.serviceBucket(A);
    const vs = visibleScreens();

    const profile = h('div', { class: 'sum' }, Object.keys(SECTION_NAME).map(key => {
      const tags = avatar[key] ? flatten(avatar[key], key) : [];
      const target = vs.find(x => x.id === SECTION_TARGET[key]) ? SECTION_TARGET[key] : (key === 'identity' || key === 'circumstances' ? 'consent' : null);
      return h('div', { class: 'sum-sec' },
        h('h3', {}, SECTION_NAME[key]),
        tags.length ? h('div', { class: 'sum-tags' }, tags.map(t => h('span', { class: 'mono' }, t))) : h('span', { class: 'sum-none' }, 'Nothing added'),
        target ? h('button', { class: 'link-btn', type: 'button', onclick: () => go(target, -1) }, 'Edit') : h('span'));
    }));
    const pre = h('pre', { class: 'json', tabindex: '0', hidden: true, 'aria-label': 'Profile as JSON' }, json);
    const tabProfile = h('button', { role: 'tab', 'aria-selected': 'true', type: 'button' }, 'Profile');
    const tabJson = h('button', { role: 'tab', 'aria-selected': 'false', type: 'button' }, 'JSON');
    const showTab = isJson => {
      tabProfile.setAttribute('aria-selected', String(!isJson)); tabJson.setAttribute('aria-selected', String(isJson));
      profile.hidden = isJson; pre.hidden = !isJson;
    };
    tabProfile.onclick = () => showTab(false); tabJson.onclick = () => showTab(true);

    const copyBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, icon('ph ph-copy'), 'Copy JSON');
    copyBtn.onclick = async () => {
      try { await navigator.clipboard.writeText(json); copyBtn.replaceChildren(icon('ph ph-check'), 'Copied'); setTimeout(() => copyBtn.replaceChildren(icon('ph ph-copy'), 'Copy JSON'), 1600); } catch (e) { showTab(true); }
    };
    const dlBtn = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => {
      const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: 'tuitionwing-profile.json' });
      a.click(); URL.revokeObjectURL(a.href);
    } }, icon('ph ph-download-simple'), 'Download');
    const submit = h('button', { class: 'btn btn-primary', type: 'button', 'data-next': '' }, 'Send to the search agent', icon('ph ph-arrow-right'));
    submit.onclick = async () => {
      submit.disabled = true; submit.textContent = 'Sending';
      try { await TW.api.submitAvatar(avatar); card.replaceChildren(doneScreen()); focusHeading(); }
      catch (e) { submit.disabled = false; submit.textContent = 'Try again'; }
    };

    return h('div', { class: 'screen' },
      h('span', { class: 'eyebrow' }, 'History · Summary'),
      h('h1', { tabindex: '-1' }, 'Your profile is ready.'),
      h('p', { class: 'lede' }, 'Check it over. You can edit any section, and you can come back later to add more.'),
      h('div', { class: 'big-count' }, h('b', {}, total), h('span', {}, 'awards you could apply for')),
      service ? h('div', { class: 'callout' }, icon('ph-fill ph-medal'), h('span', {}, `${service} more service-commitment awards (SMART, CyberCorps SFS, NHSC and similar) are kept in their own list.`)) : null,
      h('p', { class: 'fine' }, icon('ph ph-info'), 'Preview estimate. Real counts come from the search agent.'),
      h('div', { class: 'tabs', role: 'tablist' }, tabProfile, tabJson),
      profile, pre,
      h('div', { class: 'sum-actions' }, dlBtn, copyBtn),
      h('div', { class: 'actions' }, backBtn(), h('span', { class: 'grow' }), submit));
  }

  function doneScreen() {
    return h('div', { class: 'screen' },
      h('div', { class: 'done-mark' }, icon('ph-fill ph-check')),
      h('h1', { tabindex: '-1' }, 'Profile submitted.'),
      h('p', { class: 'lede' }, 'The agent is searching now. Verified matches will be sent to your inbox.'),
      h('div', { class: 'actions' }, h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => go('summary', -1) }, 'Back to my profile'),
        h('span', { class: 'grow' }),
        h('a', { class: 'btn btn-primary', href: '../dashboard/index.html' }, 'Go to my dashboard', icon('ph ph-arrow-right'))));
  }

  function focusHeading() {
    const h1 = card.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });
  }

  function renderScreen(dir) {
    const s = currentScreen();
    const build = { welcome: welcomeScreen, results: resultsScreen, consent: consentScreen, summary: summaryScreen }[s.kind] || questionScreen;
    const el = build(s);
    card.replaceChildren(el);
    if (!reduceMotion()) el.animate([{ opacity: 0, transform: `translateX(${dir * 14}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    focusHeading();
  }

  card.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing) return;
    if (e.target.tagName !== 'INPUT') return;
    const btn = card.querySelector('[data-next]');
    if (btn) { e.preventDefault(); btn.click(); }
  });

  /* ───────────── chrome: stepper, panel ───────────── */
  const stepsEl = $('steps');
  const stepBtns = phases.map(p => {
    const bar = h('i'), btn = h('button', { class: 'st', type: 'button', disabled: true },
      h('span', { class: 'st-l' }, p.label), h('span', { class: 'st-bar' }, bar));
    btn.addEventListener('click', () => {
      const ps = visibleScreens().filter(s => s.phase === p.id);
      const target = ps.find(s => !s.kind) || ps[0];
      if (target) go(target.id, -1);
    });
    stepsEl.append(h('li', {}, btn));
    return { p, btn, bar };
  });

  function optLabel(q, key, v) {
    const src = key ? q.fields.find(f => f.key === key) : q;
    const o = (val(src.options, A) || []).find(x => x.v === String(v));
    return o ? o.l : String(v);
  }
  function tagValues(q, v) {
    if (q.type === 'group') {
      const key = q.tagField || (q.fields.find(f => f.type === 'autocomplete') || q.fields[0]).key;
      return v.map(r => r[key]).filter(x => !isEmpty(x)).map(x => optLabel(q, key, x));
    }
    if (q.type === 'long_text') return lines(v).slice(0, 4);
    if (Array.isArray(v)) return v.map(x => optLabel(q, null, x));
    if (typeof v === 'boolean') return [v ? 'yes' : 'no'];
    return [optLabel(q, null, v)];
  }
  function tagList() {
    const out = [];
    for (const q of questions) {
      if (q.notag || q.type === 'flag' || q.type === 'note' || A[q.id] === undefined) continue;
      for (const t of tagValues(q, A[q.id])) out.push({ k: q.id.replace(/\.detail$/, '').split('.').pop(), t, hi: q.yield === 'high' });
    }
    return out;
  }

  let shown = null, lastTotal = null, raf, deltaTimer;
  function tweenCount(to) {
    const el = $('count'), pill = $('pillCount');
    cancelAnimationFrame(raf);
    const from = shown === null ? to : shown, t0 = performance.now();
    (function s(t) {
      const p = reduceMotion() ? 1 : Math.min((t - t0) / 500, 1);
      shown = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = shown; pill.textContent = shown;
      if (p < 1) raf = requestAnimationFrame(s);
    })(t0);
  }

  function renderPanel() {
    const tags = tagList();
    const answered = Object.keys(A).filter(id => qById[id].type !== 'flag').length;
    $('answerCount').textContent = `${answered} answer${answered === 1 ? '' : 's'}`;
    const seen = !!state.visited.results;
    $('countWrap').hidden = !seen; $('pill').hidden = !seen; $('panelFine').hidden = !seen;
    const total = TW.mock.estimate(A);
    if (seen) {
      if (lastTotal !== null && total > lastTotal) {
        const d = $('delta'); d.textContent = '+' + (total - lastTotal); d.classList.add('on');
        clearTimeout(deltaTimer); deltaTimer = setTimeout(() => d.classList.remove('on'), 2200);
      }
      tweenCount(total);
    }
    lastTotal = seen ? total : null;
    const service = TW.mock.serviceBucket(A);
    $('bucket').hidden = !(seen && service);
    $('bucketCount').textContent = service;

    const phase = (currentScreen() || {}).phase;
    $('panelNote').textContent = !seen ? 'Finish the core questions to see your first matches.'
      : phase === 'branch' ? 'Affiliations and unusual interests unlock the most matches.'
      : phase === 'sensitive' ? 'Every answer here is optional. Skipping never counts as no.'
      : phase === 'history' ? 'Almost done. This keeps repeats out of your results.'
      : 'The more you add, the fewer awards you see that you cannot win.';

    const cap = 40;
    const chips = tags.slice(-cap).map(t => h('span', { class: 'mono' + (t.hi ? ' hi' : ''), title: t.hi ? 'Narrows the pool a lot' : null }, `${t.k}: ${t.t}`));
    if (tags.length > cap) chips.unshift(h('span', { class: 'mono more' }, `+${tags.length - cap} earlier`));
    $('tags').replaceChildren(...chips);
  }

  function renderChrome() {
    const vs = visibleScreens();
    const cur = vs.findIndex(s => s.id === state.screen);
    stepBtns.forEach(({ p, btn, bar }) => {
      const ps = vs.filter(s => s.phase === p.id);
      const done = ps.filter(s => vs.indexOf(s) < cur).length;
      const isCur = ps.some(s => s.id === state.screen);
      bar.style.setProperty('--p', state.screen === 'summary' ? 1 : ps.length ? done / ps.length : 0);
      btn.classList.toggle('is-current', isCur);
      if (isCur) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
      btn.disabled = !ps.some(s => state.visited[s.id]);
    });
    renderPanel();
  }

  /* ───────────── reset ───────────── */
  const resetBtn = $('reset');
  let armed = false, armTimer;
  resetBtn.addEventListener('click', () => {
    if (!armed) {
      armed = true; resetBtn.textContent = 'Erase all answers?';
      armTimer = setTimeout(() => { armed = false; resetBtn.textContent = 'Start over'; }, 3500);
      return;
    }
    clearTimeout(armTimer); armed = false; resetBtn.textContent = 'Start over';
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = fresh(); shown = null; lastTotal = null;
    $('delta').classList.remove('on');
    go('welcome', -1);
  });

  /* ───────────── boot ───────────── */
  recompute();
  if (!screens.some(s => s.id === state.screen) || !screenVisible(currentScreen(), A)) state.screen = 'welcome';
  state.visited[state.screen] = true;
  renderScreen(1);
  renderChrome();
  if (resumed) flashSaved('Picked up where you left off');
})();
