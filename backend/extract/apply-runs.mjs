// Step 3 of the review flow: turn the two-draft results into gold drafts, and report where the extractor disagrees with
// labels a person already reviewed.
//   node extract/apply-runs.mjs --a dev2-opus --compare dev2 --final dev2-final            dry run: prints the plan
//   node extract/apply-runs.mjs --a dev2-opus --compare dev2 --final dev2-final --write    writes gold.json (backs up first)
//
// For each compared page:
//   - the current label is a human one (reviewed / second_look / from-scratch): NOT touched. The extractor's answer is
//     compared with it instead, and differences are listed (they are either extractor mistakes or label mistakes).
//   - the two drafts agreed: the first run's (--a) label is written with review_status "agreed".
//   - the drafts disagreed: the adjudicated label (--final) is written with review_status "adjudicated"
//     and its adjudication { unsure, reasons }.
// Nothing written here counts as human-reviewed. Use review-html.mjs --ids ... and mark-reviewed.mjs for that.
import fs from 'node:fs';
import path from 'node:path';
import { compareDrafts } from '../test-sets/compare-drafts.mjs';
import { HERE, DEFAULT_DIR, readManifest, readText, parseArgs } from '../test-sets/lib.mjs';
import { validatePrediction } from './validate.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.a || !args.compare || !args.final) { console.error('usage: node extract/apply-runs.mjs --a <run> --compare <name> --final <run> [--write]'); process.exit(2); }
const write = !!args.write;
const pred = id => path.join(HERE, 'predictions', id);
const cmp = JSON.parse(fs.readFileSync(pred(`compare-${args.compare}.json`), 'utf8'));
const rows = new Map(readManifest(DEFAULT_DIR).map(r => [r.id, r]));
const stamp = `${new Date().toISOString().slice(0, 10)}-apply-${args.compare}`;
const backupDir = path.join(HERE, 'backups', stamp);
const HUMAN = new Set(['reviewed', 'second_look']);

const plan = { agreed: [], adjudicated: [], skipped_unadjudicated: [], invalid: [], human: [] };
const humanDiffs = [];

for (const [id, c] of Object.entries(cmp)) {
  const row = rows.get(id);
  const f = path.join(DEFAULT_DIR, id, 'gold.json');
  const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  const text = readText(DEFAULT_DIR, id) || '';
  let label, status;
  if (c.status === 'agree') { label = JSON.parse(fs.readFileSync(path.join(pred(args.a), id + '.json'), 'utf8')); status = 'agreed'; }
  else {
    const ff = path.join(pred(args.final), id + '.json');
    if (!fs.existsSync(ff)) { plan.skipped_unadjudicated.push(id); continue; }
    label = JSON.parse(fs.readFileSync(ff, 'utf8')); status = 'adjudicated';
  }
  const errors = validatePrediction(label, { text, kind: row.kind });
  if (errors.length) { plan.invalid.push({ id, error: errors[0].slice(0, 120) }); continue; }

  if (cur && (HUMAN.has(cur.review_status) || cur.from_scratch)) {
    plan.human.push(id);
    const d = compareDrafts(cur, label);                      // human label vs extractor's final answer
    const major = cur.from_scratch ? d.major.filter(m => !['rules', 'need_based', 'levels', 'formats', 'essay_words', 'recs_required', 'service_obligation'].includes(m.field)) : d.major;
    if (major.length) humanDiffs.push({ id, from_scratch: !!cur.from_scratch, major });
    continue;
  }
  (status === 'agreed' ? plan.agreed : plan.adjudicated).push(id);
  if (!write) continue;
  fs.mkdirSync(path.join(backupDir, id), { recursive: true });
  if (cur) fs.copyFileSync(f, path.join(backupDir, id, 'gold.json'));
  const next = { ...(cur || {}), ...label, review_status: status, from_scratch: false, drafted_by: args.a.includes('sonnet') ? 'claude-sonnet-5-5' : 'claude-opus-5-5 (+ second draft)' };
  delete next.labeler; delete next.labeled_at;
  if (status === 'agreed') delete next.adjudication;
  fs.writeFileSync(f, JSON.stringify(next, null, 2) + '\n');
}

const unsure = plan.adjudicated.filter(id => JSON.parse(fs.readFileSync(path.join(pred(args.final), id + '.json'), 'utf8')).adjudication?.unsure);
console.log(`${write ? 'WROTE' : 'DRY RUN - would write'}: ${plan.agreed.length} agreed, ${plan.adjudicated.length} adjudicated (${unsure.length} flagged unsure)`);
console.log(`not touched (human-labeled): ${plan.human.length}; awaiting adjudication: ${plan.skipped_unadjudicated.length}; invalid, skipped: ${plan.invalid.length}`);
plan.invalid.forEach(x => console.log('  invalid', x.id, x.error));
console.log(`\nExtractor vs human-reviewed labels: ${humanDiffs.length} of ${plan.human.length} pages differ (from-scratch labels compared on page type, awards, amounts, deadlines only)`);
for (const d of humanDiffs) console.log(`  ${d.id}${d.from_scratch ? ' [from-scratch]' : ''}: ${d.major.map(m => m.field + (m.award ? `(${m.award.slice(0, 24)})` : '')).join(', ')}`);
if (write) console.log(`\nBackups of replaced labels: test-sets/backups/${stamp}/`);
fs.writeFileSync(path.join(HERE, 'predictions', `apply-${args.compare}-plan.json`), JSON.stringify({ ...plan, unsure, human_diffs: humanDiffs }, null, 2) + '\n');
console.log(`\nReview these in a browser: node test-sets/review-html.mjs --name ${args.compare}-review --ids ${[...unsure].join(',') || '<none flagged>'}`);
