/* Client script for review/from-scratch.html. Plain JS, no dependencies.
   State is saved to localStorage after every keystroke; "Download my answers" writes a JSON file. */
(function () {
  const PAGES = JSON.parse(document.getElementById('pages-data').textContent);
  const KEY = 'sh.fromscratch.v1';
  const FORMATS = [['video', 'Video'], ['portfolio', 'Portfolio'], ['interview', 'Interview'], ['project', 'Project'], ['test', 'Test or quiz']];
  const newReq = () => ({ plain: '', quote: '', group: '' });
  const newAward = () => ({ name: '', org: '', min: '', max: '', unknownAmount: false, deadline: '', apply: '', renewable: false, essay: '', recs: '', formats: [], service: false, basis: '', reqs: [newReq()] });
  const newPage = () => ({ done: false, about: '', awards: [newAward()], names: '', notes: '' });

  let S = {};
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  PAGES.forEach(p => { if (!S[p.id]) S[p.id] = newPage(); });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } progress(); };

  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  function set(o, path, v) { const ks = path.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; }

  const field = (id, path, label, opts = {}) => {
    const v = get(S[id], path);
    const type = opts.type || 'text';
    return `<label class="f ${opts.cls || ''}"><span>${label}</span><input type="${type}" data-p="${id}" data-k="${path}" value="${esc(v)}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''} ${opts.step ? `step="${opts.step}"` : ''}></label>`;
  };
  const check = (id, path, label) => `<label class="ck"><input type="checkbox" data-p="${id}" data-k="${path}" ${get(S[id], path) ? 'checked' : ''}> ${label}</label>`;

  function awardHtml(id, i) {
    const a = S[id].awards[i], b = `awards.${i}`;
    return `<div class="award"><div class="ahead"><b>Award ${i + 1}</b>${S[id].awards.length > 1 ? `<button type="button" class="link" data-action="rm-award" data-p="${id}" data-i="${i}">remove this award</button>` : ''}</div>
      <div class="grid2">${field(id, b + '.name', 'Name of the award')}${field(id, b + '.org', 'Who gives it (organization)')}</div>
      <div class="grid3">${field(id, b + '.min', 'Amount: lowest $', { type: 'number', ph: 'e.g. 1000' })}${field(id, b + '.max', 'Amount: highest $', { type: 'number', ph: 'e.g. 5000' })}${check(id, b + '.unknownAmount', 'Amount is not stated')}</div>
      <div class="grid3">${field(id, b + '.deadline', 'Deadline', { type: 'date' })}${field(id, b + '.apply', 'Where to apply (link)', { ph: 'blank = this page' })}${check(id, b + '.renewable', 'Renewable / can reapply')}</div>
      <div class="grid3">${field(id, b + '.essay', 'Essay: words for ONE essay', { type: 'number', ph: 'blank = none/unstated' })}${field(id, b + '.recs', 'Recommendation letters needed', { type: 'number', ph: '0' })}
        <label class="f"><span>Judged mainly on</span><select data-p="${id}" data-k="${b}.basis"><option value="">not stated</option>${['need:Financial need', 'merit:Merit', 'either:Need or merit'].map(o => { const [v, l] = o.split(':'); return `<option value="${v}" ${a.basis === v ? 'selected' : ''}>${l}</option>`; }).join('')}</select></label></div>
      <div class="ckrow"><span class="dim">Also required:</span> ${FORMATS.map(([v, l]) => `<label class="ck"><input type="checkbox" data-p="${id}" data-k="${b}.formats" data-arr="${v}" ${a.formats.includes(v) ? 'checked' : ''}> ${l}</label>`).join('')}
        ${check(id, b + '.service', 'Must work or serve afterwards (a commitment)')}</div>
      <div class="lbl">Who can get it? One requirement per row.</div>
      <p class="dim small">Say it in your own words, then paste the exact sentence from the page: select the text in the page on the right and press "use selected text". If two rows are alternatives (either/or), give them the same group number.</p>
      ${a.reqs.map((r, j) => `<div class="req"><div class="grid-req">
          <label class="f"><span>Requirement, in your words</span><input type="text" data-p="${id}" data-k="${b}.reqs.${j}.plain" value="${esc(r.plain)}" placeholder="e.g. must live in San Diego County"></label>
          <label class="f"><span>Group</span><input type="text" data-p="${id}" data-k="${b}.reqs.${j}.group" value="${esc(r.group)}" placeholder="same # = either/or"></label></div>
        <label class="f"><span>Exact text from the page</span><input type="text" data-p="${id}" data-k="${b}.reqs.${j}.quote" value="${esc(r.quote)}" placeholder="paste, or select on the right and press the button"></label>
        <div class="rbtn"><button type="button" class="btn sm" data-action="grab" data-p="${id}" data-k="${b}.reqs.${j}.quote">use selected text</button>
        ${a.reqs.length > 1 ? `<button type="button" class="link" data-action="rm-req" data-p="${id}" data-i="${i}" data-j="${j}">remove row</button>` : ''}</div></div>`).join('')}
      <button type="button" class="btn sm" data-action="add-req" data-p="${id}" data-i="${i}">+ add another requirement</button></div>`;
  }

  function formHtml(id) {
    const s = S[id];
    const radios = [['one', 'Yes, it describes one scholarship'], ['many', 'Yes, it describes several scholarships in detail'], ['names', 'Yes, it lists scholarships by name only (details are elsewhere)'], ['no', 'No: news, about, grants to organizations, loans, jobs, error, etc.']]
      .map(([v, l]) => `<label class="ck block"><input type="radio" name="about-${id}" data-p="${id}" data-k="about" data-val="${v}" ${s.about === v ? 'checked' : ''}> ${l}</label>`).join('');
    const detail = (s.about === 'one' || s.about === 'many') ? s.awards.map((_, i) => awardHtml(id, i)).join('') + (s.about === 'many' ? `<button type="button" class="btn" data-action="add-award" data-p="${id}">+ add another award</button>` : '') : '';
    const names = s.about === 'names' ? `<label class="f"><span>Names of the awards, one per line</span><textarea rows="5" data-p="${id}" data-k="names">${esc(s.names)}</textarea></label>` : '';
    return `<div class="lbl first">Is this page about a scholarship?</div>${radios}${detail}${names}
      <label class="f"><span>Anything odd, unclear, or worth telling me (optional)</span><textarea rows="2" data-p="${id}" data-k="notes">${esc(s.notes)}</textarea></label>`;
  }

  function pageSection(p, n) {
    return `<section id="p${n}" data-id="${p.id}"><header><span class="num">${n}</span>
      <div class="hd"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a><div class="dim small">${p.chars.toLocaleString()} characters · saved ${p.kind === 'pdf' ? 'PDF text' : 'web page text'}</div></div>
      <label class="ck done"><input type="checkbox" data-p="${p.id}" data-k="done" ${S[p.id].done ? 'checked' : ''}> Done</label></header>
      <div class="cols"><div class="form" id="form-${p.id}">${formHtml(p.id)}</div><div class="page"><pre data-page="${p.id}">${esc(p.text)}</pre></div></div></section>`;
  }

  const root = document.getElementById('root');
  root.innerHTML = PAGES.map((p, i) => pageSection(p, i + 1)).join('');
  const rerender = id => { const f = document.getElementById('form-' + id); const y = window.scrollY; f.innerHTML = formHtml(id); window.scrollTo(0, y); };

  function progress() {
    const done = PAGES.filter(p => S[p.id].done).length;
    document.getElementById('prog').textContent = `${done} of ${PAGES.length} done`;
    document.getElementById('bar').style.width = (100 * done / PAGES.length) + '%';
    PAGES.forEach((p, i) => { const el = document.querySelector(`#toc a[href="#p${i + 1}"]`); if (el) el.classList.toggle('on', S[p.id].done); });
  }

  root.addEventListener('input', e => {
    const t = e.target; const id = t.dataset.p; if (!id || !t.dataset.k) return;
    if (t.type === 'radio') { S[id].about = t.dataset.val; save(); rerender(id); return; }
    if (t.dataset.arr) { const arr = get(S[id], t.dataset.k); const i = arr.indexOf(t.dataset.arr); if (t.checked && i < 0) arr.push(t.dataset.arr); if (!t.checked && i >= 0) arr.splice(i, 1); save(); return; }
    set(S[id], t.dataset.k, t.type === 'checkbox' ? t.checked : t.value); save();
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-action]'); if (!b) return;
    const id = b.dataset.p, a = b.dataset.action;
    if (a === 'add-award') { S[id].awards.push(newAward()); }
    else if (a === 'rm-award') { S[id].awards.splice(+b.dataset.i, 1); }
    else if (a === 'add-req') { S[id].awards[+b.dataset.i].reqs.push(newReq()); }
    else if (a === 'rm-req') { S[id].awards[+b.dataset.i].reqs.splice(+b.dataset.j, 1); }
    else if (a === 'grab') {
      const sel = String(window.getSelection()).replace(/\s+/g, ' ').trim();
      if (!sel) { alert('First select the sentence in the page text on the right, then press this button.'); return; }
      set(S[id], b.dataset.k, sel); save();
      const inp = document.querySelector(`[data-p="${id}"][data-k="${b.dataset.k}"]`); if (inp) inp.value = sel; return;
    }
    save(); rerender(id);
  });

  document.getElementById('dl').addEventListener('click', () => {
    const out = { exported_at: new Date().toISOString(), pages: PAGES.map(p => ({ id: p.id, url: p.url, kind: p.kind, ...S[p.id] })) };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'from-scratch-answers.json'; document.body.appendChild(a); a.click(); a.remove();
  });
  document.getElementById('toc').innerHTML = PAGES.map((p, i) => `<a href="#p${i + 1}">${i + 1}</a>`).join('');
  progress();
})();
