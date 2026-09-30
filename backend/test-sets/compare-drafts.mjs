// Compare two independent drafts (slot A vs slot B) of the same chunk and decide which pages need a human.
//   node compare-drafts.mjs 01 02 ...        (chunk numbers)      writes drafts/compare/chunk-NN.json
// A page is "agree" when the drafts match on everything that affects matching: page type, is-scholarship, the awards found,
// and for each award its amount, deadline, cycle status, need/merit, service obligation, renewable, essay, recs, formats,
// levels, and the SET of rules (hard rules by field+op+value; fuzzy rules by the fields they read). Wording, quotes, notes,
// confidence, provenance, apply link and organization spelling are ignored (recorded as "minor" only).
// A page is "review" when any of the first group differ. Group structure of rules is ignored, as in score.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { allRules } from '../contract/lib.mjs';
import { HERE, DEFAULT_DIR, readManifest, normText, normalizeUrl, parseArgs, isMain } from './lib.mjs';

const tokens = s => new Set(normText(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean));
const jaccard = (a, b) => { const A = tokens(a), B = tokens(b); const i = [...A].filter(x => B.has(x)).length; return i / (A.size + B.size - i || 1); };
const squash = x => typeof x === 'string' ? normText(x).replace(/[^a-z0-9]+/g, '') : normText(x);   // "C. K." and "c.k." are the same value
const valueKey = v => v === undefined ? '' : Array.isArray(v) ? [...v].map(squash).sort().join(',') : squash(v);
const ruleKey = r => r.kind === 'fuzzy' ? `fuzzy|${[...(r.relevant_fields || [])].sort().join(',')}` : `${r.field}|${r.op}|${valueKey(r.value)}`;
const ruleSet = s => new Set(allRules(s).map(x => ruleKey(x.rule)));
const cipFamilies = v => new Set([].concat(v || []).map(x => String(x).split('.')[0]));
const overlap = (a, b) => { const A = tokens(a), B = tokens(b); if (!A.size || !B.size) return 0; const i = [...A].filter(x => B.has(x)).length; return i / Math.min(A.size, B.size); };

/* Match the rules of two drafts of one award. Rules are the "same requirement" when they have the identical key, or
   when they came from (nearly) the same sentence. Style differences are not conflicts: which profile fields a fuzzy rule
   reads, and how finely CIP majors are written (27 vs 27.01). Everything else is. */
function compareRules(x, y) {
  const RA = allRules(x).map(r => r.rule), RB = allRules(y).map(r => r.rule);
  const usedB = new Set(), pairs = [], onlyA = [];
  RA.forEach(a => {                                   // pass 1: identical keys
    const j = RB.findIndex((b, k) => !usedB.has(k) && ruleKey(a) === ruleKey(b));
    if (j >= 0) { usedB.add(j); pairs.push([a, RB[j]]); } else onlyA.push(a);
  });
  const left = [];
  onlyA.forEach(a => {                                // pass 2: same sentence, different encoding
    let best = -1, bs = 0;
    RB.forEach((b, k) => { if (usedB.has(k)) return; const sc = overlap(a.source_quote, b.source_quote); if (sc > bs) { bs = sc; best = k; } });
    if (best >= 0 && bs >= 0.6) { usedB.add(best); pairs.push([a, RB[best]]); } else left.push(a);
  });
  const onlyB = RB.filter((_, k) => !usedB.has(k));
  const conflicts = [];
  for (const [a, b] of pairs) {
    if (ruleKey(a) === ruleKey(b)) continue;
    if (a.kind === 'fuzzy' && b.kind === 'fuzzy') continue;          // which fields a fuzzy rule reads is style
    if (a.field === 'academic.cip_codes' && b.field === 'academic.cip_codes' && a.op === b.op && sameSet(cipFamilies(a.value), cipFamilies(b.value))) continue;
    conflicts.push({ a: ruleKey(a), b: ruleKey(b) });
  }
  return { conflicts, only_a: left.map(ruleKey), only_b: onlyB.map(ruleKey) };
}
const setOf = a => new Set((a || []).map(x => normText(x)));
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
const setDiff = (a, b) => ({ only_a: [...a].filter(x => !b.has(x)), only_b: [...b].filter(x => !a.has(x)) });
const eq = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const urlNorm = u => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase(); } catch { return String(u || '').toLowerCase(); } };

function pairAwards(A, B) {
  const cand = [];
  A.forEach((a, i) => B.forEach((b, j) => cand.push({ i, j, s: jaccard(a.name, b.name) })));
  cand.sort((x, y) => y.s - x.s);
  const ui = new Set(), uj = new Set(), pairs = [];
  for (const c of cand) { if (c.s < 0.5 || ui.has(c.i) || uj.has(c.j)) continue; ui.add(c.i); uj.add(c.j); pairs.push([A[c.i], B[c.j]]); }
  return { pairs, onlyA: A.filter((_, i) => !ui.has(i)), onlyB: B.filter((_, j) => !uj.has(j)) };
}

export function compareDrafts(a, b) {
  const major = [], minor = [];
  const M = (field, detail) => major.push({ field, ...detail });
  if (a.page_type !== b.page_type) M('page_type', { a: a.page_type, b: b.page_type });
  if (a.is_scholarship_page !== b.is_scholarship_page) M('is_scholarship_page', { a: a.is_scholarship_page, b: b.is_scholarship_page });
  const A = a.scholarships || [], B = b.scholarships || [];
  const { pairs, onlyA, onlyB } = pairAwards(A, B);
  onlyA.forEach(s => M('award_only_in_A', { name: s.name }));
  onlyB.forEach(s => M('award_only_in_B', { name: s.name }));
  const namesA = setOf(a.award_names), namesB = setOf(b.award_names);
  if (!sameSet(namesA, namesB)) {
    // two lists of names agree if they overlap strongly; only flag clear differences
    const inter = [...namesA].filter(n => [...namesB].some(m => jaccard(n, m) >= 0.6)).length;
    if (!(namesA.size && namesB.size && inter >= 0.8 * Math.max(namesA.size, namesB.size))) M('award_names', setDiff(namesA, namesB));
  }
  for (const [x, y] of pairs) {
    const w = x.name;
    if (!eq(x.amount?.min, y.amount?.min) || !eq(x.amount?.max, y.amount?.max)) M('amount', { award: w, a: [x.amount?.min, x.amount?.max], b: [y.amount?.min, y.amount?.max] });
    if (!eq(x.deadline, y.deadline)) M('deadline', { award: w, a: x.deadline, b: y.deadline });
    const soft = new Set(['unknown', 'upcoming']);
    if (x.cycle_status !== y.cycle_status && !(x.deadline == null && y.deadline == null && soft.has(x.cycle_status) && soft.has(y.cycle_status))) M('cycle_status', { award: w, a: x.cycle_status, b: y.cycle_status });
    if (!eq(x.need_based, y.need_based)) M('need_based', { award: w, a: x.need_based, b: y.need_based });
    if (!!x.service_obligation !== !!y.service_obligation) M('service_obligation', { award: w, a: !!x.service_obligation, b: !!y.service_obligation });
    if (!!x.amount?.renewable !== !!y.amount?.renewable) M('renewable', { award: w, a: !!x.amount?.renewable, b: !!y.amount?.renewable });
    if (!eq(x.effort?.essay_words, y.effort?.essay_words)) M('essay_words', { award: w, a: x.effort?.essay_words, b: y.effort?.essay_words });
    if ((x.effort?.recs_required || 0) !== (y.effort?.recs_required || 0)) M('recs_required', { award: w, a: x.effort?.recs_required || 0, b: y.effort?.recs_required || 0 });
    if (!sameSet(setOf(x.effort?.formats), setOf(y.effort?.formats))) M('formats', { award: w, ...setDiff(setOf(x.effort?.formats), setOf(y.effort?.formats)) });
    if (!sameSet(setOf(x.levels), setOf(y.levels))) M('levels', { award: w, ...setDiff(setOf(x.levels), setOf(y.levels)) });
    const rc = compareRules(x, y);
    if (rc.conflicts.length || rc.only_a.length || rc.only_b.length) M('rules', { award: w, ...rc });
    if (urlNorm(x.apply_url) !== urlNorm(y.apply_url)) minor.push({ field: 'apply_url', award: w, a: x.apply_url, b: y.apply_url });
    if (normText(x.provider_org) !== normText(y.provider_org)) minor.push({ field: 'provider_org', award: w, a: x.provider_org, b: y.provider_org });
    if (!eq(x.geo_scope?.level, y.geo_scope?.level)) minor.push({ field: 'geo_scope', award: w, a: x.geo_scope?.level, b: y.geo_scope?.level });
  }
  if (!sameSet(setOf(a.vocabulary_gaps), setOf(b.vocabulary_gaps)) && (a.vocabulary_gaps || []).length + (b.vocabulary_gaps || []).length) minor.push({ field: 'vocabulary_gaps' });
  return { status: major.length ? 'review' : 'agree', major, minor };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const chunks = args._.map(c => String(c).padStart(2, '0'));
  if (!chunks.length) { console.error('usage: node compare-drafts.mjs 01 [02 ...]'); process.exit(2); }
  const byUrl = new Map(readManifest(DEFAULT_DIR).map(r => [normalizeUrl(r.url), r]));
  fs.mkdirSync(path.join(HERE, 'drafts', 'compare'), { recursive: true });
  let tot = { pages: 0, agree: 0, review: 0 };
  const byField = {};
  for (const c of chunks) {
    const load = async slot => (await import(pathToFileURL(path.join(HERE, 'drafts', slot, `chunk-${c}.mjs`)).href)).default;
    const [A, B] = [await load('A'), await load('B')];
    const norm = d => new Map(Object.entries(d).map(([u, v]) => [normalizeUrl(u), v]));
    const nA = norm(A), nB = norm(B);
    const out = {};
    for (const [u, da] of nA) {
      const row = byUrl.get(u); const db = nB.get(u);
      if (!db) { out[row.id] = { url: row.url, status: 'review', major: [{ field: 'missing_in_B' }], minor: [] }; continue; }
      out[row.id] = { url: row.url, ...compareDrafts(da, db) };
    }
    for (const u of nB.keys()) if (!nA.has(u)) out[byUrl.get(u).id] = { url: byUrl.get(u).url, status: 'review', major: [{ field: 'missing_in_A' }], minor: [] };
    fs.writeFileSync(path.join(HERE, 'drafts', 'compare', `chunk-${c}.json`), JSON.stringify(out, null, 2) + '\n');
    const vals = Object.values(out);
    const ag = vals.filter(v => v.status === 'agree').length;
    tot.pages += vals.length; tot.agree += ag; tot.review += vals.length - ag;
    vals.forEach(v => v.major.forEach(m => byField[m.field] = (byField[m.field] || 0) + 1));
    console.log(`chunk ${c}: ${vals.length} pages, ${ag} agree, ${vals.length - ag} need review`);
  }
  console.log(`\ntotal: ${tot.pages} pages, ${tot.agree} agree (${(100 * tot.agree / tot.pages).toFixed(0)}%), ${tot.review} need review`);
  console.log('what the disagreements are about:', JSON.stringify(Object.fromEntries(Object.entries(byField).sort((x, y) => y[1] - x[1]))));
}
