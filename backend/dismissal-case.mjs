// Builds the "case file" the dismissal-analysis agent sees. This is the privacy boundary: whatever is not in here is never sent.
//  - the student is anonymous (no id, name or email);
//  - only profile fields that this scholarship's rules read, plus a few basics (level, school, year, major, GPA, state/county), are included;
//  - sensitive sections (heritage, gender, health, home, finances...) appear only when a rule of this scholarship reads them;
//  - the student's own words (stated reason and optional note) are included, because that is the point of the analysis.
import { evaluateScholarship, explainScholarship } from './match.mjs';

const BASICS = ['academic.status', 'academic.institution', 'academic.year', 'academic.majors', 'academic.cip_codes', 'academic.gpa', 'geo.state', 'geo.county', 'geo.hs_county', 'geo.residency'];

// Leaf values at a path; "a.b[].c" fans out over the array b (same convention as the match engine).
function leaf(obj, segs) {
  if (obj === null || obj === undefined) return [];
  if (!segs.length) return [obj];
  const [seg, ...rest] = segs;
  const m = seg.match(/^(.+)\[\]$/);
  if (m) return Array.isArray(obj[m[1]]) ? obj[m[1]].flatMap(el => leaf(el, rest)) : [];
  return leaf(obj[seg], rest);
}

const rulePaths = scholarship => {
  const paths = new Set();
  for (const g of scholarship.eligibility || []) for (const r of g.any_of || []) {
    if (r.field) paths.add(r.field);
    for (const f of r.relevant_fields || []) paths.add(f);
  }
  return paths;
};

export function minimalProfile(profile, scholarship) {
  const out = {}, withheld = [];
  for (const path of new Set([...BASICS, ...rulePaths(scholarship)])) {
    const base = path.replace(/\[\]/g, '');
    if ((profile.withheld || []).some(w => base === w || base.startsWith(w + '.'))) { withheld.push(path); continue; }
    const vals = leaf(profile, path.split('.'));
    if (vals.length) out[path] = path.includes('[]') || vals.length > 1 ? vals : vals[0];
  }
  return { answers: out, withheld_by_student: withheld };
}

export function buildCase({ dismissal, scholarship, profile, pageText }) {
  const rules = explainScholarship(profile, scholarship);
  const unknown = rules.flatMap(g => g.rules).filter(r => r.verdict === 'unknown').length;
  return {
    student: { stated_reason: dismissal.reason, note: dismissal.note || null, ...minimalProfile(profile, scholarship) },
    scholarship: {
      name: scholarship.name, provider: scholarship.provider_org, source_url: scholarship.source_url,
      amount: scholarship.amount, deadline: scholarship.deadline, levels: scholarship.levels,
      requirements_not_expressible: scholarship.full_data?.vocabulary_gaps || [], notes: scholarship.full_data?.notes || null,
    },
    engine: { overall: evaluateScholarship(profile, { ...scholarship, status: scholarship.full_data?.status }), unknown_rules: unknown, rules },
    page_text: pageText || null,
  };
}
