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

// Evaluate a single rule against a profile field.
// Returns 'pass', 'fail', or 'unknown' (withheld or missing phase).
function evaluateRule(profile, rule, phasesCompleted) {
  // Fuzzy rules always return unknown (needs human judgment)
  if (rule.kind === 'fuzzy') return 'unknown';

  const { field, op, value } = rule;
  if (!field) return 'unknown';  // No field specified

  // Get the profile field value (supports nested paths like "geo.county")
  let profileValue = profile;
  for (const segment of field.split('.')) {
    if (profileValue === null || profileValue === undefined) return 'unknown';
    // Handle array notation like affiliations.union[] or academic.cip_codes[]
    const match = segment.match(/^(.+)\[\]$/);
    if (match) {
      profileValue = profileValue[match[1]];
      if (!Array.isArray(profileValue)) return 'unknown';
      profileValue = profileValue; // Keep as array for array operations
    } else {
      profileValue = profileValue[segment];
    }
  }

  // Withheld fields are unknown, not fail
  if (profile.withheld?.includes(field)) return 'unknown';

  // Missing data is unknown if the rule needs it
  if (profileValue === null || profileValue === undefined) return 'unknown';

  // Evaluate the operation
  switch (op) {
    case 'eq':
      return profileValue === value ? 'pass' : 'fail';
    case 'gte':
      return profileValue >= value ? 'pass' : 'fail';
    case 'lte':
      return profileValue <= value ? 'pass' : 'fail';
    case 'between':
      const [min, max] = value;
      return profileValue >= min && profileValue <= max ? 'pass' : 'fail';
    case 'in':
      return value.includes(profileValue) ? 'pass' : 'fail';
    case 'not_in':
      return !value.includes(profileValue) ? 'pass' : 'fail';
    case 'contains_any':
      if (!Array.isArray(profileValue)) return 'fail';
      return profileValue.some(v => value.includes(v)) ? 'pass' : 'fail';
    case 'contains_all':
      if (!Array.isArray(profileValue)) return 'fail';
      return value.every(v => profileValue.includes(v)) ? 'pass' : 'fail';
    case 'prefix_any':
      if (!Array.isArray(profileValue)) return 'fail';
      return profileValue.some(v => value.some(p => String(v).startsWith(String(p)))) ? 'pass' : 'fail';
    case 'present':
      return profileValue !== null && profileValue !== undefined ? 'pass' : 'fail';
    case 'is_true':
      return profileValue === true ? 'pass' : 'fail';
    case 'is_false':
      return profileValue === false ? 'pass' : 'fail';
    default:
      return 'unknown';
  }
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
  if (!scholarship.eligibility?.length) return 'eligible';  // No rules = open to all

  const results = scholarship.eligibility.map(g => evaluateGroup(profile, g, phasesCompleted));
  if (results.includes('fail')) return 'ineligible';
  if (results.includes('unknown')) return 'possible';
  return 'eligible';
}

// Fast pre-filter: eliminate 90% without touching rules
export function filter(profile, scholarships) {
  const today = new Date().toISOString().split('T')[0];
  const deadline_floor = profile.effort?.deadline_floor || 14;  // days
  const min_award = profile.effort?.min_award || 500;
  const minDeadline = new Date(Date.now() + deadline_floor * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return scholarships.filter(s => {
    // Must be a scholarship page
    if (s.is_scholarship_page === false) return false;
    // Check deadline
    if (s.deadline && s.deadline < minDeadline) return false;
    // Check amount
    if (s.amount?.max < min_award) return false;
    // Check geo scope
    if (s.geo_scope?.level === 'state' && s.geo_scope?.states) {
      if (!s.geo_scope.states.includes(profile.geo?.state)) return false;
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
  const budget_essay = profile.effort?.essay_words || 500;
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
