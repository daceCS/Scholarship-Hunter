/* Tuitionwing dashboard. Reads the saved questionnaire profile (tw.intake.v1), builds the
   avatar, and shows matches, deadlines and profile strength.
   Matches come from GET /matches (see questionnaire/api.js and backend/index.mjs).
   Application status is saved in the browser only (tw.dash.v1). */
(async function () {
  'use strict';
  const { questions } = TW;
  const INTAKE = 'tw.intake.v1', DASH = 'tw.dash.v1';
  const app = document.getElementById('app');
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const award = n => n ? money(n) : 'Amount varies'; // 0 in the data means the page states no amount

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

  /* ───────────── load profile ───────────── */
  /* dashboard state: id -> 'saved' | 'applying' | 'applied' | 'dismissed' */
  let status = {};
  try { status = JSON.parse(localStorage.getItem(DASH)) || {}; } catch (e) { /* start empty */ }
  const saveStatus = () => { try { localStorage.setItem(DASH, JSON.stringify(status)); } catch (e) { /* keep in memory */ } };

  /* ───────────── dates ───────────── */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function nextDue(str) {
    const [mon, day] = str.split(' ');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    let d = new Date(now.getFullYear(), MONTHS.indexOf(mon), Number(day));
    if (d < now) d = new Date(now.getFullYear() + 1, MONTHS.indexOf(mon), Number(day));
    return { date: d, days: Math.round((d - now) / 864e5) };
  }
  const leftText = n => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n + ' days';

  /* ───────────── first run ───────────── */
  function signInCard() {
    document.getElementById('who').textContent = '';
    app.replaceChildren(h('div', { class: 'first' },
      h('span', { class: 'eyebrow' }, 'Dashboard'),
      h('h1', {}, 'Sign in to see your matches.'),
      h('p', {}, 'New here? Build your profile first, or create an account now.'),
      TW.auth.form(() => location.reload()),
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-ghost', href: '/questionnaire/' }, 'Build my profile'))));
  }

  function firstRun() {
    document.getElementById('who').textContent = '';
    app.replaceChildren(h('div', { class: 'first' },
      h('span', { class: 'eyebrow' }, 'Dashboard'),
      h('h1', {}, 'Your matches will show up here.'),
      h('p', {}, 'Answer the short questionnaire and we build your profile. Then this page lists the awards you could apply for, with deadlines and progress.'),
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-primary', href: '/questionnaire/' }, 'Build my profile', icon('ph ph-arrow-right')))));
  }

  /* ───────────── report a problem ───────────── */
  const REPORT_KINDS = [['wrong_amount', 'The amount is wrong'], ['wrong_deadline', 'The deadline is wrong'], ['wrong_requirements', 'The requirements are wrong or missing'],
    ['not_eligible', 'I am not eligible, but it shows as a match'], ['broken_link', 'The link does not work'], ['other', 'Something else']];
  let reportDialog;
  function openReport(m) {
    if (!reportDialog) {
      const kind = h('select', { id: 'rp-kind', class: 'rp-field', 'aria-label': 'What is wrong?' }, REPORT_KINDS.map(([v, t]) => h('option', { value: v }, t)));
      const msg = h('textarea', { id: 'rp-msg', class: 'rp-field', rows: 4, maxlength: 1000, placeholder: 'Tell us what you saw on the provider’s page (optional unless you chose "Something else")', 'aria-label': 'Details' });
      const out = h('p', { class: 'rp-out', role: 'status' });
      const send = h('button', { class: 'btn btn-primary btn-sm', type: 'button' }, 'Send report');
      const cancel = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => reportDialog.close() }, 'Cancel');
      const title = h('h2', { id: 'rp-title' });
      send.onclick = async () => {
        const cur = reportDialog._m;
        send.disabled = true; out.textContent = 'Sending...';
        try {
          const r = await TW.auth.fetch('/feedback', { method: 'POST', body: JSON.stringify({ scholarship_id: cur.sid, kind: kind.value, message: msg.value }) });
          if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'HTTP ' + r.status);
          out.textContent = 'Thanks, we will look into it.';
          setTimeout(() => reportDialog.close(), 1200);
        } catch (e) { out.textContent = 'Could not send: ' + e.message; send.disabled = false; }
      };
      reportDialog = h('dialog', { class: 'report', 'aria-labelledby': 'rp-title' }, title, kind, msg, out, h('div', { class: 'rp-row' }, cancel, send));
      reportDialog._parts = { title, kind, msg, out, send };
      document.body.append(reportDialog);
    }
    const { title, kind, msg, out, send } = reportDialog._parts;
    reportDialog._m = m;
    title.textContent = 'Report a problem: ' + m.name;
    kind.value = 'wrong_amount'; msg.value = ''; out.textContent = ''; send.disabled = false;
    reportDialog.showModal();
  }

  /* ───────────── render ───────────── */
  const SECTIONS = [
    ['academic', 'Academic'], ['geo', 'Location'], ['affiliations', 'Affiliations'], ['activities', 'Activities'],
    ['career', 'Career'], ['identity', 'Identity'], ['circumstances', 'Circumstances'], ['financial', 'Financial'], ['exclusions', 'Already tried']
  ];
  const FILTERS = [['all', 'All'], ['saved', 'Saved'], ['applying', 'Applying'], ['applied', 'Applied'], ['dismissed', 'Dismissed']];
  let filter = 'all', sort = 'match';

  async function start() {
    const session = await TW.auth.session();
    if (!session) return signInCard();
    if (session) {
      const out = document.getElementById('signout');
      out.hidden = false;
      out.onclick = async () => { await TW.auth.signOut(); location.reload(); };
    }

    // Try to fetch from API when signed in
    let all = [], total = 0, service = 0, state = null, A = {}, W = new Set();
    let avatar = null;

    if (session) {
      try {
        await TW.api.flushPending(); // profile saved before the user signed in
        const response = await TW.auth.fetch('/matches?limit=99');
        if (response.ok) {
          const data = await response.json();
          all = (data.matches || []).map(m => ({
            name: m.name,
            org: m.provider,
            amt: m.amount?.max || 0,
            pct: m.status === 'eligible' ? 100 : 50, // ponytail: coarse; all rules pass vs some unknown. Refine with fraction of rules passed.
            possible: m.status !== 'eligible',
            due: m.deadline ? new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
            id: m.name,
            sid: m.scholarship_id,
            url: m.apply_url,
            verified: !!m.verified,
            due2: m.deadline ? nextDue(new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : { days: 999 }
          }));
          total = all.length;
          service = 0; // TODO: separate service obligations

          // Create a minimal state for consistency
          state = { id: 'api', answers: {}, withheld: {}, updated: Date.now() };
          A = {};
          avatar = { id: 'api', updated: Date.now(), visited: [] };
        }
      } catch (error) {
        console.warn('[dashboard] Failed to fetch matches from API:', error);
      }
    }

    if (!state) return firstRun(); // signed in but no saved profile / matches yet

    const city = (A['geo.current'] || '').split(',')[0];
    document.getElementById('who').textContent = A['edu.institution'] || city || '';

    function view() {
      const active = all.filter(m => status[m.id] !== 'dismissed');
      const open = active.filter(m => status[m.id] !== 'applied');
      const dated = open.filter(m => m.due2.date); // awards with no listed deadline have no date
      const soonest = dated.slice().sort((a, b) => a.due2.days - b.due2.days)[0];
      const potential = open.reduce((s, m) => s + m.amt, 0);
      const counts = { all: all.filter(m => status[m.id] !== 'dismissed').length };
      for (const [k] of FILTERS.slice(1)) counts[k] = all.filter(m => status[m.id] === k).length;

      const done = SECTIONS.filter(([k]) => avatar[k]);
      const strength = Math.round(done.length / SECTIONS.length * 100);
      const missing = SECTIONS.filter(([k]) => !avatar[k]);

      let rows = all.filter(m => filter === 'all' ? status[m.id] !== 'dismissed' : status[m.id] === filter);
      rows.sort(sort === 'amount' ? (a, b) => b.amt - a.amt : sort === 'due' ? (a, b) => a.due2.days - b.due2.days : (a, b) => b.pct - a.pct);

      const hero = h('section', { class: 'hero' },
        h('div', {},
          h('span', { class: 'eyebrow' }, 'Dashboard'),
          h('h1', {}, 'You could apply for ', h('em', {}, String(total)), ' awards.'),
          h('p', {}, 'Here are the strongest matches for your profile right now.' + (service ? ` ${service} service-commitment awards are kept in their own list.` : ''))),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', {}, money(potential)), h('span', {}, 'Open in top matches')),
          h('div', { class: 'stat' }, h('b', {}, String(open.length)), h('span', {}, 'Not yet applied')),
          h('div', { class: 'stat' }, h('b', {}, soonest ? soonest.due : 'None'), h('span', {}, 'Next deadline'))));

      const filterBar = h('div', { class: 'filters', role: 'group', 'aria-label': 'Filter matches' },
        FILTERS.map(([k, label]) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(filter === k), onclick: () => { filter = k; render(); } },
          label, h('span', { class: 'n' }, String(counts[k])))));
      const sortSel = h('select', { class: 'sort', id: 'sort', 'aria-label': 'Sort matches', onchange: e => { sort = e.target.value; render(); } },
        [['match', 'Best match'], ['amount', 'Highest award'], ['due', 'Soonest deadline']].map(([v, t]) => h('option', { value: v, selected: v === sort }, t)));

      const setStatus = (m, key) => { if (status[m.id] === key) delete status[m.id]; else status[m.id] = key; saveStatus(); render(); };
      const card = (m, i) => {
        const st = status[m.id];
        const soon = m.due2.days <= 14;
        return h('article', { class: 'match' + (i === 0 && sort === 'match' && filter === 'all' ? ' top' : '') + (st === 'dismissed' ? ' is-dismissed' : '') },
          h('div', {}, h('h3', {}, m.name), h('div', { class: 'org' }, m.org)),
          h('div', { class: 'amt' }, award(m.amt)),
          h('div', { class: 'meta' },
            h('span', { class: 'tagp pct' }, icon('ph-fill ph-target'), (m.possible ? 'Possible match' : 'Eligible')),
            h('span', { class: 'tagp' + (soon ? ' warn' : '') }, icon('ph ph-calendar-blank'), m.due2.date ? 'Due ' + m.due + ' · ' + leftText(m.due2.days) : 'No deadline listed'),
            m.verified ? null : h('span', { class: 'tagp', title: 'Read automatically from the provider’s page and not yet checked by a person. Confirm on the provider’s page before you apply.' }, icon('ph ph-seal-question'), 'Unverified details'),
            st === 'applied' ? h('span', { class: 'tagp ok' }, icon('ph-fill ph-check-circle'), 'Applied') : null),
          h('div', { class: 'acts' },
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'saved'), onclick: () => setStatus(m, 'saved') }, icon(st === 'saved' ? 'ph-fill ph-bookmark-simple' : 'ph ph-bookmark-simple'), 'Save'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'applying'), onclick: () => setStatus(m, 'applying') }, icon('ph ph-pencil-line'), 'Applying'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'applied'), onclick: () => setStatus(m, 'applied') }, icon('ph ph-check'), 'Applied'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'dismissed'), onclick: () => setStatus(m, 'dismissed') }, icon('ph ph-eye-slash'), st === 'dismissed' ? 'Restore' : 'Hide'),
              m.url ? h('a', { class: 'act', href: m.url, target: '_blank', rel: 'noopener' }, icon('ph ph-arrow-square-out'), 'Open page') : null,
              m.sid ? h('button', { class: 'act report-btn', type: 'button', onclick: () => openReport(m) }, icon('ph ph-flag'), 'Report a problem') : null));
      };

      const matches = h('section', { class: 'card', 'aria-labelledby': 'mh' },
        h('div', { class: 'card-head' }, h('h2', { id: 'mh' }, 'Your matches'), sortSel),
        filterBar,
        h('div', { class: 'list' }, rows.length ? rows.map(card)
          : h('div', { class: 'empty' }, filter === 'all' ? 'No matches yet. Add more to your profile to find awards.' : 'Nothing here yet. Use the buttons on a match to move it into this list.')),
        h('p', { class: 'fine' }, icon('ph ph-info'), 'Details are read automatically from each provider’s page and can be wrong or out of date. If something looks off, use "Report a problem".'));

      const upcoming = dated.slice().sort((a, b) => a.due2.days - b.due2.days).slice(0, 5);
      const deadlines = h('section', { class: 'card', 'aria-labelledby': 'dh' },
        h('div', { class: 'card-head' }, h('h2', { id: 'dh' }, 'Coming up')),
        upcoming.length ? h('ul', { class: 'dl' }, upcoming.map(m => h('li', {},
          h('div', { class: 'date' }, h('small', {}, MONTHS[m.due2.date.getMonth()]), h('b', {}, String(m.due2.date.getDate()))),
          h('div', {}, h('div', { class: 't' }, m.name), h('div', { class: 'd' }, award(m.amt) + (status[m.id] ? ' · ' + status[m.id] : ''))),
          h('span', { class: 'left' + (m.due2.days <= 14 ? ' soon' : '') }, leftText(m.due2.days)))))
          : h('div', { class: 'empty' }, 'No open deadlines.'));

      const profile = h('section', { class: 'card', 'aria-labelledby': 'ph' },
        h('div', { class: 'card-head' }, h('h2', { id: 'ph' }, 'Profile strength')),
        h('div', { class: 'pct-big' }, strength + '%'),
        h('div', { class: 'meter', role: 'img', 'aria-label': strength + ' percent complete', style: '--p:' + strength + '%' }, h('i')),
        h('ul', { class: 'secs' }, SECTIONS.map(([k, label]) => avatar[k]
          ? h('li', { class: 'done' }, icon('ph-fill ph-check-circle'), label)
          : h('li', { class: 'todo' }, icon('ph ph-circle'), label, h('a', { href: '/questionnaire/' }, 'Add')))),
        missing.length ? h('div', { class: 'note' }, icon('ph-fill ph-lightbulb'), h('span', {}, 'Adding your ' + missing[0][1].toLowerCase() + ' helps us find smaller local awards.')) : null);

      return [hero, h('div', { class: 'cols' }, matches, h('div', { class: 'side' }, deadlines, profile))];
    }

    function render() {
      const y = scrollY;
      app.replaceChildren(...view());
      scrollTo(0, y);
    }
    render();
  }
  await start();
})();
