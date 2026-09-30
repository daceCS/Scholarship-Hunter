/* Builds the Step 1 output object from answers.
   - A: effective answers (hidden questions already dropped). W: Set of withheld question ids.
   - Empty answers emit nothing. `false` and 0 are real answers and are kept.
   - `withheld` arrays are separate from "no": they mean the user declined, so the search agent treats the criterion as unknown.
   - Derived fields (county, district, IPEDS, CIP) are intentionally not emitted. The backend computes them. */
window.TW = window.TW || {};
(function () {
  const isEmpty = v => v === undefined || v === null || v === '' ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

  function prune(v) {
    if (Array.isArray(v)) return v.map(prune).filter(x => !isEmpty(x));
    if (v && typeof v === 'object') {
      const o = {};
      for (const [k, x] of Object.entries(v)) {
        const p = prune(x);
        if (!isEmpty(p)) o[k] = p;
      }
      return o;
    }
    return v;
  }

  const yn = v => v === 'yes' ? true : v === 'no' ? false : undefined;
  const num = v => (v === undefined || v === '' ? undefined : Number(v));
  const lines = s => (s || '').split(/[\n,;]+/).map(x => x.trim()).filter(Boolean);

  /* A phase counts as completed once the user has moved past it (visited the next phase's first
     screen, or the final summary). Fields in a phase that is not completed are unknown, not "no",
     because empty answers are pruned. Sensitive needs consent: without it every sensitive field is unknown. */
  function phasesCompleted(A, visited) {
    const first = id => (TW.screens.find(s => s.phase === id) || {}).id;
    return TW.phases.map((p, i) => {
      const next = TW.phases[i + 1];
      const passed = next ? !!visited[first(next.id)] : !!visited.summary;
      return passed && (p.id !== 'sensitive' || A['consent.sensitive'] === true) ? p.id : null;
    }).filter(Boolean);
  }

  TW.buildAvatar = function (A, W, meta) {
    const arr = id => Array.isArray(A[id]) ? A[id] : [];
    const withheld = prefix => [...W].filter(id => id.startsWith(prefix + '.')).map(id => id.slice(prefix.length + 1));
    const cityState = (() => {
      const s = (A['geo.current'] || '').trim();
      const i = s.lastIndexOf(',');
      return i > 0 ? { city: s.slice(0, i).trim(), state: s.slice(i + 1).trim().toUpperCase() } : { city: s };
    })();
    const floor = { w1: 7, w2: 14, m1: 30 }[A['effort.deadline_floor']];
    const langCode = n => TW.data.langCodes[n] || (n || '').toLowerCase();

    // A sub-field answered "Prefer not to say" is withheld, not unanswered.
    const militaryRows = arr('affil.military.detail');
    const militarySkips = ['disability_rating', 'killed_or_wounded']
      .filter(k => militaryRows.some(r => r[k] === 'skip')).map(k => 'military.' + k);

    return prune({
      avatar_id: meta.id,
      version: 1,
      updated_at: new Date(meta.updated).toISOString(),
      phases_completed: phasesCompleted(A, meta.visited || {}),
      academic: {
        status: A['edu.status'],
        institution: A['edu.institution'],
        year: num(A['edu.year']),
        majors: arr('edu.major'),
        concentration: A['edu.concentration'],
        gpa: A['edu.gpa'],
        gpa_scale: A['edu.gpa_scale'],
        grad_date: A['edu.grad_date'],
        enrollment: A['edu.enrollment']
      },
      geo: {
        city: cityState.city,
        state: cityState.state,
        zip: A['geo.zip'],
        high_school: A['geo.hs'],
        hs_county: A['geo.hs_county'],
        residency: A['geo.residency']
      },
      affiliations: {
        employer: arr('affil.employer_parents').map(r => ({ name: r.employer, relationship: r.relationship, status: r.current_or_former })),
        union: arr('affil.union.detail').map(r => ({ name: r.union, local: r.local_number })),
        military: arr('affil.military.detail').map(r => ({
          who: r.who, branch: r.branch, status: r.status, era: r.era,
          disability_rating: yn(r.disability_rating), killed_or_wounded: yn(r.killed_or_wounded)
        })),
        fraternal: arr('affil.fraternal.detail').map(r => ({ org: r.org, chapter: r.lodge_or_chapter, member: r.member })),
        religious: arr('affil.religious.detail').map(r => ({ tradition: r.tradition, denomination: r.denomination, congregation: r.congregation })),
        member_org: arr('affil.financial.detail').map(r => ({ name: r.institution, type: r.type })),
        professional: arr('affil.professional'),
        withheld: [...withheld('affil'), ...militarySkips]
      },
      identity: {
        heritage: arr('id.heritage'),
        tribal: A['id.tribal'] ? { status: A['id.tribal'], nation: A['id.tribe_name'] } : undefined,
        first_gen: A['id.first_gen'],
        citizenship: A['id.citizenship'],
        languages: arr('id.languages').map(r => ({ lang: langCode(r.language), level: r.level })),
        immigration_context: A['id.immigration_context'],
        gender: A['id.gender'],
        lgbtq: A['id.lgbtq'],
        withheld: withheld('id')
      },
      circumstances: {
        disability: arr('circ.disability'),
        family_illness: A['circ.family_illness'],
        foster: A['circ.foster'],
        caregiver: A['circ.caregiver'],
        dependents: A['circ.dependents'],
        housing_instability: A['circ.housing'],
        parent_status: arr('circ.parent_status'),
        withheld: withheld('circ')
      },
      financial: {
        fafsa_filed: A['fin.fafsa'],
        sai: A['fin.sai'],
        dependency: A['fin.dependency'],
        income_band: A['fin.income_band'],
        current_aid: arr('fin.current_aid'),
        withheld: withheld('fin')
      },
      activities: {
        extracurricular: arr('act.extracurricular'),
        competitions: arr('act.competitions'),
        unusual_skills: lines(A['act.unusual']),
        built: lines(A['act.built']),
        work: arr('act.work').map(r => ({ employer: r.employer, industry: r.industry, role: r.role, dates: r.dates })),
        leadership: lines(A['act.leadership'])
      },
      career: {
        field: A['career.field'],
        sectors: arr('career.sector'),
        target_employers: arr('career.employers'),
        service_obligation: A['career.service_obligation']
      },
      effort: {
        min_award_usd: A['effort.min_award'],
        hours_per_week: A['effort.hours_week'],
        essay: A['effort.essay'],
        formats_ok: arr('effort.formats'),
        recs: A['effort.recs'],
        deadline_floor_days: floor,
        renewable_ok: A['effort.renewable']
      },
      exclusions: {
        applied: arr('dedupe.applied'),
        won: arr('dedupe.won'),
        rejected: arr('dedupe.rejected'),
        blocked_providers: arr('dedupe.blocklist')
      }
    });
  };
})();
