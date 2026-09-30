// Score extractor output against gold labels.
//   node score.mjs --pred <dir> [--dir pages] [--split dev|test|all] [--json out.json]
// <dir> holds one <page id>.json per page, in the same shape as gold.json
// (page_type, is_scholarship_page, scholarships[] with optional confidence, follow_links).
// A page with no prediction file counts as "predicted not a scholarship page, nothing extracted".
import fs from 'node:fs';
import path from 'node:path';
import { allRules } from '../contract/lib.mjs';
import { validatePrediction } from '../extract/validate.mjs';
import { DEFAULT_DIR, readManifest, readText, readJson, quoteInText, normText, parseArgs, isMain } from './lib.mjs';

/* ---------- normalization ---------- */

const normUrl = u => {
  if (!u) return '';
  try {
    const x = new URL(u);
    for (const k of [...x.searchParams.keys()]) if (/^utm_/i.test(k)) x.searchParams.delete(k);
    return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase();
  } catch { return String(u).trim().toLowerCase(); }
};

const valueKey = v => v === undefined ? '' : Array.isArray(v) ? [...v].map(x => normText(x)).sort().join(',') : normText(v);

/* One key per rule. Group structure is ignored; fuzzy rules are keyed by the fields they may read,
   since their free-text description can't be compared automatically. */
export const ruleKey = r => r.kind === 'fuzzy'
  ? `fuzzy|${[...(r.relevant_fields || [])].sort().join(',')}`
  : `${r.field}|${r.op}|${valueKey(r.value)}`;

const ruleSet = s => new Set(allRules(s).map(x => ruleKey(x.rule)));

const tokens = s => new Set(normText(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(Boolean));
const jaccard = (a, b) => { const A = tokens(a), B = tokens(b); const i = [...A].filter(x => B.has(x)).length; return i / (A.size + B.size - i || 1); };

/* Pair predicted scholarships with gold ones on one page, best name match first. */
function pair(goldList, predList) {
  const cand = [];
  goldList.forEach((g, gi) => predList.forEach((p, pi) => cand.push({ gi, pi, s: jaccard(g.name, p.name) })));
  cand.sort((a, b) => b.s - a.s);
  const gUsed = new Set(), pUsed = new Set(), pairs = [];
  for (const c of cand) {
    if (c.s < 0.6 || gUsed.has(c.gi) || pUsed.has(c.pi)) continue;
    gUsed.add(c.gi); pUsed.add(c.pi); pairs.push([goldList[c.gi], predList[c.pi]]);
  }
  return {
    pairs,
    missed: goldList.filter((_, i) => !gUsed.has(i)),
    spurious: predList.filter((_, i) => !pUsed.has(i))
  };
}

const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
const prf = (tp, fp, fn) => {
  const p = tp + fp ? tp / (tp + fp) : null, r = tp + fn ? tp / (tp + fn) : null;
  return { precision: p, recall: r, f1: p && r ? 2 * p * r / (p + r) : (p === 0 || r === 0 ? 0 : null), tp, fp, fn };
};

/* ---------- scoring ---------- */

/* Options: reviewed = only labels a person has reviewed; valid = only labels that pass the validator (schema, vocabulary, quotes);
   lenient = skip rule comparison on from-scratch labels (their rules are plain-text fuzzy rules, not comparable); details = per-page diffs. */
export function scoreRun({ dir = DEFAULT_DIR, predDir, split = 'all', reviewed = false, valid = false, lenient = false, details = false, limit = 0 }) {
  // limit = first N pages of the split (same order the extractor uses), applied before the label filters
  let base = readManifest(dir).filter(r => r.status === 200 && (split === 'all' || r.split === split) && fs.existsSync(path.join(dir, r.id, 'gold.json')));
  if (limit) base = base.slice(0, limit);
  const rows = base.filter(r => {
    if (!reviewed && !valid) return true;
    const g = readJson(path.join(dir, r.id, 'gold.json'));
    if (reviewed && (g.review_status || 'draft') === 'draft') return false;
    if (valid && validatePrediction(g, { text: readText(dir, r.id) || '', kind: r.kind }).length) return false;
    return true;
  });
  const diffs = [];
  const notes = [];
  const triage = { tp: 0, fp: 0, fn: 0, tn: 0, type_ok: 0 };
  const field = { name: [0, 0], amount: [0, 0], amount_min: [0, 0], deadline: [0, 0], apply_url: [0, 0] };
  const rules = { tp: 0, fp: 0, fn: 0 };
  const awards = { tp: 0, fp: 0, fn: 0 };
  const quotes = { total: 0, found: 0, missing: [] };
  const records = [];  // one per predicted scholarship: { conf, correct }
  let missingPreds = 0;

  for (const r of rows) {
    const gold = readJson(path.join(dir, r.id, 'gold.json'));
    const pf = path.join(predDir, `${r.id}.json`);
    let pred = { page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [] };
    if (fs.existsSync(pf)) pred = readJson(pf); else missingPreds++;
    const text = readText(dir, r.id) || '';

    // triage
    if (gold.is_scholarship_page && pred.is_scholarship_page) triage.tp++;
    else if (!gold.is_scholarship_page && pred.is_scholarship_page) triage.fp++;
    else if (gold.is_scholarship_page && !pred.is_scholarship_page) triage.fn++;
    else triage.tn++;
    if (gold.page_type === pred.page_type) triage.type_ok++;

    // extraction
    const { pairs, missed, spurious } = pair(gold.scholarships || [], pred.scholarships || []);
    awards.tp += pairs.length; awards.fn += missed.length; awards.fp += spurious.length;
    if (details) {
      if (gold.page_type !== pred.page_type) diffs.push({ page: r.id, page_type: 'gold ' + gold.page_type + ' vs pred ' + pred.page_type });
      for (const m of missed) diffs.push({ page: r.id, missed_award: m.name });
      for (const x of spurious) diffs.push({ page: r.id, spurious_award: x.name });
    }

    for (const [g, p] of pairs) {
      const ok = {
        name: normText(g.name) === normText(p.name),
        amount: g.amount?.max === p.amount?.max,   // max = the most one winner could receive; min is reported separately (amount_min)
        deadline: (g.deadline ?? null) === (p.deadline ?? null),
        apply_url: normUrl(g.apply_url) === normUrl(p.apply_url)
      };
      for (const k of Object.keys(ok)) { field[k][1]++; if (ok[k]) field[k][0]++; }
      field.amount_min[1]++; if (g.amount?.min === p.amount?.min) field.amount_min[0]++;   // informational; not part of record correctness
      const gs = ruleSet(g), ps = ruleSet(p);
      const skipRules = lenient && gold.from_scratch;
      const tp = [...ps].filter(x => gs.has(x)).length;
      if (!skipRules) { rules.tp += tp; rules.fp += ps.size - tp; rules.fn += gs.size - tp; }
      records.push({ conf: p.confidence ?? null, correct: Object.values(ok).every(Boolean) && (skipRules || sameSet(gs, ps)) });
      if (details) {
        const bad = Object.keys(ok).filter(k => !ok[k]).map(k => k + ': gold ' + JSON.stringify(k === 'amount' ? g.amount : g[k]) + ' vs pred ' + JSON.stringify(k === 'amount' ? p.amount : p[k]));
        const miss = skipRules ? [] : [...gs].filter(x => !ps.has(x)), extra = skipRules ? [] : [...ps].filter(x => !gs.has(x));
        if (bad.length || miss.length || extra.length) diffs.push({ page: r.id, name: g.name, field_diffs: bad, rules_missing: miss, rules_extra: extra });
      }
    }
    for (const p of spurious) records.push({ conf: p.confidence ?? null, correct: false });

    // quotes must exist in the page, matched or not
    for (const p of pred.scholarships || []) {
      const qs = [...allRules(p).map(x => x.rule.source_quote), ...(p.provenance || []).map(x => x.source_quote)];
      for (const q of qs) {
        quotes.total++;
        if (q && quoteInText(q, text)) quotes.found++; else if (quotes.missing.length < 10) quotes.missing.push(`${r.id}: "${q}"`);
      }
    }
  }

  const acc = ([a, b]) => b ? a / b : null;
  const triageStats = prf(triage.tp, triage.fp, triage.fn);
  return {
    split, pages: rows.length, missing_predictions: missingPreds,
    triage: { ...triageStats, page_type_accuracy: rows.length ? triage.type_ok / rows.length : null },
    awards: prf(awards.tp, awards.fp, awards.fn),
    fields: Object.fromEntries(Object.entries(field).map(([k, v]) => [k, { accuracy: acc(v), n: v[1] }])),
    rules: prf(rules.tp, rules.fp, rules.fn),
    quote_in_page: { rate: quotes.total ? quotes.found / quotes.total : null, total: quotes.total, missing_examples: quotes.missing },
    calibration: calibrate(records),
    ...(details ? { diffs } : {}),
    notes
  };
}

/* Bucket records by the model's own confidence and find the lowest cutoff whose accepted records
   are at least `target` correct. Records with no confidence are counted separately. */
export function calibrate(records, target = 0.98) {
  const withConf = records.filter(r => typeof r.conf === 'number');
  const edges = [0, 0.5, 0.7, 0.85, 0.95, 1.0001];
  const buckets = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1];
    const rs = withConf.filter(r => r.conf >= lo && r.conf < hi);
    return { range: `${lo}-${Math.min(hi, 1)}`, n: rs.length, correct: rs.filter(r => r.correct).length };
  });
  let cutoff = null;
  const sorted = [...withConf].sort((a, b) => b.conf - a.conf);
  let good = 0;
  sorted.forEach((r, i) => {
    if (r.correct) good++;
    const next = sorted[i + 1];
    if (next && next.conf === r.conf) return;              // only cut between distinct confidence values
    if (i + 1 >= 20 && good / (i + 1) >= target) cutoff = { min_confidence: r.conf, accepted: i + 1, precision: good / (i + 1) };
  });
  return {
    records: records.length, without_confidence: records.length - withConf.length, buckets,
    auto_publish_cutoff: cutoff || (withConf.length < 20 ? 'not enough records (need 20+)' : `no cutoff reaches ${target} precision`)
  };
}

/* ---------- output ---------- */

const pct = x => x === null || x === undefined ? '  n/a' : (x * 100).toFixed(1).padStart(5) + '%';
const TARGETS = { triage_f1: 0.95, field: 0.95, rule_recall: 0.85, rule_precision: 0.92 };
const flag = (v, t) => v === null ? '' : v >= t ? '  ok' : '  BELOW TARGET';

export function report(s) {
  const L = [];
  L.push(`Split: ${s.split}   pages scored: ${s.pages}   missing predictions: ${s.missing_predictions}`);
  L.push('');
  L.push(`Triage        F1 ${pct(s.triage.f1)}${flag(s.triage.f1, TARGETS.triage_f1)}   precision ${pct(s.triage.precision)}   recall ${pct(s.triage.recall)}   page-type accuracy ${pct(s.triage.page_type_accuracy)}`);
  L.push(`Awards found  precision ${pct(s.awards.precision)}   recall ${pct(s.awards.recall)}   (missed ${s.awards.fn}, spurious ${s.awards.fp})`);
  for (const [k, v] of Object.entries(s.fields)) L.push(`  ${k.padEnd(10)} ${pct(v.accuracy)}${flag(v.accuracy, TARGETS.field)}   (n=${v.n})`);
  L.push(`Rules         recall ${pct(s.rules.recall)}${flag(s.rules.recall, TARGETS.rule_recall)}   precision ${pct(s.rules.precision)}${flag(s.rules.precision, TARGETS.rule_precision)}`);
  const q = s.quote_in_page;
  L.push(`Quote in page ${pct(q.rate)}${q.rate === null ? '' : q.rate === 1 ? '  ok' : '  MUST BE 100%'}   (${q.total} quotes)`);
  q.missing_examples.forEach(m => L.push('   missing: ' + m));
  L.push('');
  L.push('Calibration (model confidence vs correct records)');
  s.calibration.buckets.forEach(b => L.push(`  ${b.range.padEnd(10)} n=${String(b.n).padStart(3)}  correct ${b.n ? pct(b.correct / b.n) : '  n/a'}`));
  const c = s.calibration.auto_publish_cutoff;
  L.push('  auto-publish cutoff: ' + (typeof c === 'string' ? c : `confidence >= ${c.min_confidence} (accepts ${c.accepted} records at ${pct(c.precision).trim()} precision)`));
  if (s.calibration.without_confidence) L.push(`  ${s.calibration.without_confidence} record(s) had no confidence value`);
  return L.join('\n');
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.pred) { console.error('usage: node score.mjs --pred <dir> [--dir pages] [--split dev|test|all] [--reviewed] [--valid] [--lenient] [--details] [--limit N] [--json out.json]'); process.exit(2); }
  const s = scoreRun({ dir: args.dir || DEFAULT_DIR, predDir: args.pred, split: args.split || 'all', reviewed: !!args.reviewed, valid: !!args.valid, lenient: !!args.lenient, details: !!args.details, limit: Number(args.limit || 0) });
  console.log(report(s));
  if (args.details) { console.log('\nPer-page differences:'); for (const d of s.diffs) console.log(' ', JSON.stringify(d)); }
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(s, null, 2));
}
