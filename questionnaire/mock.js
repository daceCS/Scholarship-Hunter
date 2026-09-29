/* MOCK ONLY. Stand-ins for the Step 2 search agent so the live match counter and result
   previews have something to show. Delete this file when the backend returns real counts
   and matches; app.js only touches TW.mock.estimate / TW.mock.awards / TW.mock.serviceBucket. */
window.TW = window.TW || {};
(function () {
  const RANGE = { low: [2, 6], med: [5, 12], high: [12, 26] };

  function fnv(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function contribution(q, val) {
    if (val === false || val === undefined || val === '' || (Array.isArray(val) && !val.length)) return 0;
    if (q.type === 'bool' || q.type === 'note' || q.type === 'flag') return 0;
    const [lo, hi] = RANGE[q.yield || 'low'];
    const base = lo + (fnv(q.id + JSON.stringify(val)) % (hi - lo + 1));
    const n = Array.isArray(val) ? Math.min(val.length, 3) : 1;
    return Math.round(base * (1 + 0.4 * (n - 1)));
  }

  const maj = (a, re) => (a['edu.major'] || []).some(m => re.test(m));
  const has = (a, id) => Array.isArray(a[id]) ? a[id].length > 0 : !!a[id];

  const POOL = [
    { name: 'Tri-County Nursing Futures Award', org: 'Community Foundation', amt: 5000, due: 'Nov 14', score: a => maj(a, /nurs|health|pre-med/i) ? 1 : 0 },
    { name: 'STEM Pathways Award', org: 'Regional STEM Council', amt: 3000, due: 'Dec 15', score: a => maj(a, /engineer|computer|cyber|math|physics|data|software|chem|biolog|statistic/i) ? 0.95 : 0 },
    { name: 'First-Generation Scholars Grant', org: 'State Higher Education Office', amt: 2500, due: 'Dec 1', score: a => a['id.first_gen'] === true ? 0.95 : 0.2 },
    { name: 'Future Teachers Fund', org: 'State Education Association', amt: 2000, due: 'Feb 3', score: a => maj(a, /educat|teach/i) ? 0.9 : 0 },
    { name: 'Skilled Trades Career Starter Grant', org: 'Workforce Development Board', amt: 2500, due: 'Mar 1', score: a => a['edu.status'] === 'trade' ? 0.95 : 0 },
    { name: 'Graduate Research Stipend', org: 'Professional Association', amt: 4000, due: 'Feb 28', score: a => a['edu.status'] === 'grad' ? 0.9 : 0 },
    { name: 'Essay Contest: Your Voice Matters', org: 'Civic Youth Alliance', amt: 1000, due: 'Dec 20', score: a => a['edu.status'] === 'hs_underclass' ? 0.9 : (a['effort.essay'] === 'no' ? 0 : 0.35) },
    { name: 'Emerging Artists Award', org: 'Local Arts League', amt: 1200, due: 'Jan 22', score: a => maj(a, /art|design|music|theater/i) ? 0.85 : 0 },
    { name: 'Working Student Relief Award', org: 'Employer Foundation', amt: 1500, due: 'Jan 15', score: a => has(a, 'act.work') ? 0.8 : 0 },
    { name: 'Military Family Tuition Aid', org: 'Veterans Auxiliary', amt: 3500, due: 'Mar 15', score: a => has(a, 'affil.military.detail') ? 0.97 : 0 },
    { name: 'Union Members\' Children Scholarship', org: 'Regional Labor Council', amt: 3000, due: 'Feb 10', score: a => has(a, 'affil.union.detail') ? 0.98 : 0 },
    { name: 'Community Leaders Scholarship', org: 'Civic Service Foundation', amt: 1500, due: 'Feb 15', score: a => has(a, 'affil.fraternal.detail') ? 0.97 : 0.4 },
    { name: 'County Merit Award', org: 'County Bar Auxiliary', amt: 1000, due: 'Jan 30', score: a => a['geo.zip'] ? 0.6 : 0.3 },
    { name: 'Local Community Foundation Grant', org: 'Community Foundation', amt: 1000, due: 'Jan 9', score: a => a['geo.zip'] ? 0.5 : 0.25 }
  ];

  TW.mock = {
    estimate(A) {
      let total = 0;
      for (const q of TW.questions) total += contribution(q, A[q.id]);
      return total;
    },
    serviceBucket(A) {
      return A['career.service_obligation'] === 'yes' ? 6 + (fnv('service' + (A['edu.major'] || []).join()) % 7) : 0;
    },
    awards(A, n) {
      const min = Number(A['effort.min_award']) || 0;
      const ranked = POOL.map(p => ({ ...p, s: p.score(A) })).filter(p => p.s > 0).sort((x, y) => y.s - x.s || y.amt - x.amt);
      const ok = ranked.filter(p => p.amt >= min);
      const pick = (ok.length >= n ? ok : ok.concat(ranked.filter(p => !ok.includes(p)))).slice(0, n);
      return pick.map(p => ({ ...p, pct: Math.round(72 + p.s * 26) }));
    }
  };
})();
