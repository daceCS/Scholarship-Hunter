// Match engine: evaluate whether a profile matches a scholarship's eligibility rules.
// Stateless, no database yet. Load scholarships from gold.json files.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Load all scholarships from test-sets gold.json files
export function loadScholarships(dir = path.join(here, 'test-sets/pages')) {
  const scholarships = [];
  for (const pageId of fs.readdirSync(dir)) {
    const goldPath = path.join(dir, pageId, 'gold.json');
    if (fs.existsSync(goldPath)) {
      const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
      if (gold.scholarships?.length) {
        scholarships.push(...gold.scholarships.map(s => ({ ...s, page_id: pageId })));
      }
    }
  }
  return scholarships;
}

// Field metadata from the contract (phase + type), used to decide what a missing value means.
import { canonInstitution } from './institutions.mjs';
const VOCAB = new Map(JSON.parse(fs.readFileSync(path.join(here, 'contract/vocabulary.json'), 'utf8')).fields.map(f => [f.path, f]));

// Leaf values at a path. "a.b[].c" fans out over the array b; a plain list leaf is returned whole.
function resolve(obj, segs) {
  if (obj === null || obj === undefined) return [];
  if (!segs.length) return [obj];
  const [seg, ...rest] = segs;
  const m = seg.match(/^(.+)\[\]$/);
  if (m) {
    const arr = obj[m[1]];
    return Array.isArray(arr) ? arr.flatMap(el => resolve(el, rest)) : [];
  }
  return resolve(obj[seg], rest);
}

// 'withheld' holds paths like "identity.tribal"; an entry covers that path and everything under it.
const isWithheld = (profile, field) => {
  const base = field.replace(/\[\]/g, '');
  return (profile.withheld || []).some(w => base === w || base.startsWith(w + '.'));
};

// One op against one value -> boolean (null = unsupported op).
function test(op, v, value) {
  switch (op) {
    case 'eq': return v === value;
    case 'gte': return v >= value;
    case 'lte': return v <= value;
    case 'between': return v >= value[0] && v <= value[1];
    case 'in': return value.includes(v);
    case 'not_in': return !value.includes(v);
    case 'contains_any': return Array.isArray(v) && v.some(x => value.includes(x));
    case 'contains_all': return Array.isArray(v) && value.every(x => v.includes(x));
    case 'prefix_any': return Array.isArray(v) && v.some(x => value.some(p => String(x).startsWith(String(p))));
    case 'present': case 'exists': return v !== null && v !== undefined; // some labels say 'exists'; the contract says 'present'
    case 'is_true': return v === true;
    case 'is_false': return v === false;
    default: return null;
  }
}

// Evaluate a single rule against a profile.
// Returns 'pass', 'fail', or 'unknown' (fuzzy, withheld, or not answered).
function evaluateRule(profile, rule, phasesCompleted) {
  // Fuzzy rules always return unknown (needs human judgment)
  if (rule.kind === 'fuzzy') return 'unknown';
  const { field, op, value } = rule;
  if (!field) return 'unknown';
  if (isWithheld(profile, field)) return 'unknown';

  const isInst = field === 'academic.institution';   // schools are written many ways; compare one canonical spelling
  const vals = resolve(profile, field.split('.')).map(x => isInst ? canonInstitution(x) : x);
  if (!vals.length) {
    // Empty answers are pruned from the avatar. For list-like fields in a phase the user finished,
    // empty means "none" (fail); for scalars (GPA, institution...) blank means "not sure" (unknown).
    const meta = VOCAB.get(field);
    // Only optional 'do you have any...' lists count: not core fields, and not derived ones (cip_codes comes from the major, which may be 'Undecided').
    const listLike = field.includes('[]') || /_list$/.test(meta?.type || '');
    const isNone = listLike && meta?.phase !== 'core' && meta?.source !== 'derived';
    return isNone && phasesCompleted.includes(meta?.phase) ? 'fail' : 'unknown';
  }
  const target = !isInst ? value : Array.isArray(value) ? value.map(canonInstitution) : canonInstitution(value);
  const results = vals.map(v => test(op, v, target));
  if (results.includes(null)) return 'unknown'; // unsupported op
  // ponytail: array-of-object rules pass if ANY element passes; separate rules need not hit the same element.
  return results.includes(true) ? 'pass' : 'fail';
}

// Evaluate one group: any rule passes = group passes.
function evaluateGroup(profile, group, phasesCompleted) {
  if (!group.any_of?.length) return 'pass';  // Empty group passes
  const results = group.any_of.map(rule => evaluateRule(profile, rule, phasesCompleted));
  if (results.includes('pass')) return 'pass';
  if (results.includes('unknown')) return 'unknown';
  return 'fail';
}

// Evaluate a scholarship: all groups pass = eligible.
export function evaluateScholarship(profile, scholarship) {
  const phasesCompleted = profile.phases_completed || [];
  // No rules: open to everyone only if a person verified that. For machine-extracted records it usually means the
  // requirements were not captured, so the honest answer is 'possible', never 'eligible'.
  if (!scholarship.eligibility?.length) return scholarship.status === 'live' ? 'eligible' : 'possible';

  const results = scholarship.eligibility.map(g => evaluateGroup(profile, g, phasesCompleted));
  if (results.includes('fail')) return 'ineligible';
  if (results.includes('unknown')) return 'possible';
  return 'eligible';
}

// Fast pre-filter: eliminate 90% without touching rules
export function filter(profile, scholarships, now = Date.now()) {
  const deadline_floor = profile.effort?.deadline_floor || 14;  // days
  const min_award = profile.effort?.min_award ?? 500;
  const minDeadline = new Date(now + deadline_floor * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return scholarships.filter(s => {
    // Must be a scholarship page
    if (s.is_scholarship_page === false) return false;
    // Check deadline
    if (s.deadline && s.deadline < minDeadline) return false;
    // Check amount
    if (s.amount?.max && s.amount.max < min_award) return false; // 0 = amount not stated: keep
    // Check geo scope
    if (s.geo_scope?.level === 'state' && s.geo_scope?.states) {
      if (profile.geo?.state && !s.geo_scope.states.includes(profile.geo.state)) return false; // unknown state: keep
    }
    // Check academic level if specified
    if (s.levels?.length && profile.academic?.status) {
      if (!s.levels.includes(profile.academic.status)) return false;
    }
    return true;
  });
}

// Effort fit: how well the effort matches the user's tolerance.
// score = amount × effort_fit
// effort_fit = (1 - essay_burden) × (1 - recs_burden)
export function scoreEffort(profile, scholarship) {
  const budget_essay = profile.effort?.essay_words ?? 500;
  const budget_recs = profile.effort?.recs === 'yes' ? 1 : profile.effort?.recs === 'maybe' ? 0.5 : 0;

  const essay_burden = scholarship.effort?.essay_words
    ? Math.min(1, scholarship.effort.essay_words / budget_essay)
    : 0;
  const recs_burden = scholarship.effort?.recs_required
    ? Math.min(1, scholarship.effort.recs_required / Math.max(1, budget_recs))
    : 0;

  const effort_fit = Math.max(0, Math.min(1, (1 - essay_burden) * (1 - recs_burden)));
  return effort_fit;
}

// Calculate total score for ranking
export function score(profile, scholarship) {
  const amount = scholarship.amount?.max || 0;
  const effort_fit = scoreEffort(profile, scholarship);
  return amount * effort_fit;
}

// Rank candidates by score (highest first)
export function rank(profile, candidates) {
  return candidates
    .map(s => ({ scholarship: s, score: score(profile, s) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.scholarship);
}

export default { loadScholarships, filter, evaluateScholarship, score, rank };
