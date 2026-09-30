/* Tuitionwing dashboard. Reads the saved questionnaire profile (tw.intake.v1), builds the
   avatar, and shows matches, deadlines and profile strength.
   Backend seams: TW.mock.awards / TW.mock.estimate stand in for the search agent's results.
   Application status is saved in the browser only (tw.dash.v1). */
(async function () {
  'use strict';
  const { questions } = TW;
  const INTAKE = 'tw.intake.v1', DASH = 'tw.dash.v1';
  const app = document.getElementById('app');
  const money = n => '$' + Math.round(n).toLocaleString('en-US');

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
  const DEMO = {
    'edu.status': 'undergrad', 'edu.major': ['Nursing'], 'edu.institution': 'Palomar College', 'edu.gpa': 3.6,
    'geo.current': 'Fallbrook, CA', 'geo.zip': '92028', 'id.first_gen': true, 'effort.min_award': 1000,
    'effort.essay': 'short', 'career.field': 'Nursing'
  };
  const isDemo = /[?&]demo\b/.test(location.search);

  function loadState() {
    if (isDemo) return { id: 'demo', answers: DEMO, withheld: {}, updated: Date.now() };
    try { const s = JSON.parse(localStorage.getItem(INTAKE)); return s && s.answers && Object.keys(s.answers).length ? s : null; } catch (e) { return null; }
  }
  const visibleQ = (q, a) => (!q.screen.when || q.screen.when(a)) && (!q.when || q.when(a));
  function effective(state) {
    const out = {};
    for (const q of questions) {
      if (!visibleQ(q, out) || state.withheld[q.id]) continue;
      if (state.answers[q.id] !== undefined) out[q.id] = state.answers[q.id];
    }
    return out;
  }

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
  function firstRun() {
    document.getElementById('who').textContent = '';
    app.replaceChildren(h('div', { class: 'first' },
      h('span', { class: 'eyebrow' }, 'Dashboard'),
      h('h1', {}, 'Your matches will show up here.'),
      h('p', {}, 'Answer the short questionnaire and we build your profile. Then this page lists the awards you could apply for, with deadlines and progress.'),
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-primary', href: '../questionnaire/index.html' }, 'Build my profile', icon('ph ph-arrow-right')),
        h('a', { class: 'btn btn-ghost', href: '?demo' }, 'See a sample'))));
  }

  /* ───────────── render ───────────── */
  const SECTIONS = [
    ['academic', 'Academic'], ['geo', 'Location'], ['affiliations', 'Affiliations'], ['activities', 'Activities'],
    ['career', 'Career'], ['identity', 'Identity'], ['circumstances', 'Circumstances'], ['financial', 'Financial'], ['exclusions', 'Already tried']
  ];
  const FILTERS = [['all', 'All'], ['saved', 'Saved'], ['applying', 'Applying'], ['applied', 'Applied'], ['dismissed', 'Dismissed']];
  let filter = 'all', sort = 'match';

  async function start() {
    // Check for userId first (from questionnaire submission via API)
    const userId = window.TW?.userId || localStorage.getItem('tw.user.id');

    // Try to fetch from API if we have a userId
    let all = [], total = 0, service = 0, state = null, A = {}, W = new Set();
    let avatar = null;

    if (userId) {
      try {
        console.log('[dashboard] Fetching matches for user:', userId);
        const response = await fetch(`http://localhost:3000/matches?user_id=${userId}&limit=99`);
        console.log('[dashboard] Fetch response:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[dashboard] Got matches:', data.matches?.length || 0);
          all = (data.matches || []).map(m => ({
            name: m.name,
            org: m.provider,
            amt: m.amount?.max || 0,
            pct: Math.min(100, Math.round((m.score / Math.max(m.amount?.max, 1)) * 100)),
            due: m.deadline ? new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
            id: m.name,
            due2: m.deadline ? nextDue(new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : { days: 999 }
          }));
          total = all.length;
          service = 0; // TODO: separate service obligations
          console.log('[dashboard] Processed', all.length, 'matches');

          // Create a minimal state for consistency
          state = { id: 'api', answers: {}, withheld: {}, updated: Date.now() };
          A = {};
          avatar = { id: 'api', updated: Date.now(), visited: [] };
        }
      } catch (error) {
        console.warn('[dashboard] Failed to fetch matches from API:', error);
      }
    }

    // Fall back to saved questionnaire state if no API data was fetched
    if (!state && all.length === 0) {
      console.log('[dashboard] No API data, trying saved state');
      state = loadState();
      if (!state) {
        console.log('[dashboard] No saved state, showing firstRun');
        return firstRun();
      }
      A = effective(state);
      W = new Set(Object.keys(state.withheld).filter(id => TW.qById[id]));
      avatar = TW.buildAvatar(A, W, { id: state.id, updated: state.updated, visited: state.visited });

      // Use mock data if no API matches
      total = TW.mock.estimate(A);
      service = TW.mock.serviceBucket?.(A) || 0;
      all = TW.mock.awards(A, 99).map(m => ({ ...m, id: m.name, due2: nextDue(m.due) }));
    } else if (!state) {
      // API data was fetched successfully
      console.log('[dashboard] Using API data with', all.length, 'matches');
    }

    const city = (A['geo.current'] || '').split(',')[0];
    document.getElementById('who').textContent = isDemo ? 'Sample profile' : (A['edu.institution'] || city || '');

    function view() {
      const active = all.filter(m => status[m.id] !== 'dismissed');
      const open = active.filter(m => status[m.id] !== 'applied');
      const soonest = open.slice().sort((a, b) => a.due2.days - b.due2.days)[0];
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
          h('div', { class: 'amt' }, money(m.amt)),
          h('div', { class: 'meta' },
            h('span', { class: 'tagp pct' }, icon('ph-fill ph-target'), m.pct + '% match'),
            h('span', { class: 'tagp' + (soon ? ' warn' : '') }, icon('ph ph-calendar-blank'), 'Due ' + m.due + ' · ' + leftText(m.due2.days)),
            st === 'applied' ? h('span', { class: 'tagp ok' }, icon('ph-fill ph-check-circle'), 'Applied') : null),
          h('div', { class: 'acts' },
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'saved'), onclick: () => setStatus(m, 'saved') }, icon(st === 'saved' ? 'ph-fill ph-bookmark-simple' : 'ph ph-bookmark-simple'), 'Save'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'applying'), onclick: () => setStatus(m, 'applying') }, icon('ph ph-pencil-line'), 'Applying'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'applied'), onclick: () => setStatus(m, 'applied') }, icon('ph ph-check'), 'Applied'),
              h('button', { class: 'act', type: 'button', 'aria-pressed': String(st === 'dismissed'), onclick: () => setStatus(m, 'dismissed') }, icon('ph ph-eye-slash'), st === 'dismissed' ? 'Restore' : 'Hide')));
      };

      const matches = h('section', { class: 'card', 'aria-labelledby': 'mh' },
        h('div', { class: 'card-head' }, h('h2', { id: 'mh' }, 'Your matches'), sortSel),
        filterBar,
        h('div', { class: 'list' }, rows.length ? rows.map(card)
          : h('div', { class: 'empty' }, filter === 'all' ? 'No matches yet. Add more to your profile to find awards.' : 'Nothing here yet. Use the buttons on a match to move it into this list.')),
        h('p', { class: 'fine' }, icon('ph ph-info'), 'Preview matches. Verified results arrive once the search agent runs.'));

      const upcoming = open.slice().sort((a, b) => a.due2.days - b.due2.days).slice(0, 5);
      const deadlines = h('section', { class: 'card', 'aria-labelledby': 'dh' },
        h('div', { class: 'card-head' }, h('h2', { id: 'dh' }, 'Coming up')),
        upcoming.length ? h('ul', { class: 'dl' }, upcoming.map(m => h('li', {},
          h('div', { class: 'date' }, h('small', {}, MONTHS[m.due2.date.getMonth()]), h('b', {}, String(m.due2.date.getDate()))),
          h('div', {}, h('div', { class: 't' }, m.name), h('div', { class: 'd' }, money(m.amt) + (status[m.id] ? ' · ' + status[m.id] : ''))),
          h('span', { class: 'left' + (m.due2.days <= 14 ? ' soon' : '') }, leftText(m.due2.days)))))
          : h('div', { class: 'empty' }, 'No open deadlines.'));

      const profile = h('section', { class: 'card', 'aria-labelledby': 'ph' },
        h('div', { class: 'card-head' }, h('h2', { id: 'ph' }, 'Profile strength')),
        h('div', { class: 'pct-big' }, strength + '%'),
        h('div', { class: 'meter', role: 'img', 'aria-label': strength + ' percent complete', style: '--p:' + strength + '%' }, h('i')),
        h('ul', { class: 'secs' }, SECTIONS.map(([k, label]) => avatar[k]
          ? h('li', { class: 'done' }, icon('ph-fill ph-check-circle'), label)
          : h('li', { class: 'todo' }, icon('ph ph-circle'), label, h('a', { href: '../questionnaire/index.html' }, 'Add')))),
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
  start();
})();
