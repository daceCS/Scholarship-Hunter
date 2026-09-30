// Validate every gold label.
//   node check-labels.mjs [--dir pages] [--strict]
// Checks: page-level schema, each scholarship against the contract schema, every rule against the vocabulary,
// every source_quote actually present in the snapshot text, and page_type consistency.
// Drafts are checked too; a draft with problems is normal, a "reviewed" label with problems is a bug.
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { loadVocab, loadScholarshipSchema, checkRules, allRules } from '../contract/lib.mjs';
import { HERE, DEFAULT_DIR, readManifest, readText, readJson, quoteInText, parseArgs, isMain } from './lib.mjs';

export function checkLabels(dir) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateGold = ajv.compile(readJson(path.join(HERE, 'gold.schema.json')));
  const validateScholarship = ajv.compile(loadScholarshipSchema());
  const vocab = loadVocab();
  const rows = readManifest(dir).filter(r => r.status === 200 && r.selected !== false);

  const problems = [];   // { id, review_status, message }
  const stats = { pages: rows.length, labeled: 0, unlabeled: [], by_type: {}, by_status: {}, by_split: {}, scholarships: 0, vocabulary_gaps: [] };

  for (const r of rows) {
    const f = path.join(dir, r.id, 'gold.json');
    if (!fs.existsSync(f)) { stats.unlabeled.push(r.id); continue; }
    let gold;
    try { gold = JSON.parse(fs.readFileSync(f, 'utf8')); }
    catch (e) { problems.push({ id: r.id, review_status: 'draft', message: `gold.json is not valid JSON: ${e.message}` }); continue; }
    stats.labeled++;
    const status = gold.review_status || 'draft';
    const bad = m => problems.push({ id: r.id, review_status: status, message: m });
    stats.by_type[gold.page_type] = (stats.by_type[gold.page_type] || 0) + 1;
    stats.by_status[status] = (stats.by_status[status] || 0) + 1;
    stats.by_split[r.split || 'unassigned'] = (stats.by_split[r.split || 'unassigned'] || 0) + 1;
    (gold.vocabulary_gaps || []).forEach(g => stats.vocabulary_gaps.push(`${r.id}: ${g}`));

    if (!validateGold(gold)) { bad(`gold schema: ${ajv.errorsText(validateGold.errors)}`); continue; }

    if (gold.is_scholarship_page !== (gold.page_type !== 'not_scholarship')) bad('is_scholarship_page disagrees with page_type');
    if (gold.page_type === 'not_scholarship' && (gold.scholarships.length || (gold.follow_links || []).length)) bad('not_scholarship page must have no scholarships or follow_links');
    if (gold.page_type === 'single' && gold.scholarships.length !== 1 && status !== 'draft') bad(`single page should have exactly 1 scholarship, has ${gold.scholarships.length}`);
    if (gold.page_type === 'listing' && !gold.scholarships.length && !(gold.follow_links || []).length && !(gold.award_names || []).length && status !== 'draft') bad('listing page needs scholarships, follow_links or award_names');
    if (status !== 'draft' && !gold.labeler) bad('reviewed label has no labeler');

    const text = readText(dir, r.id) || '';
    stats.scholarships += gold.scholarships.length;
    gold.scholarships.forEach((s, i) => {
      const w = `scholarships[${i}] "${s.name || '?'}"`;
      if (!validateScholarship(s)) bad(`${w}: ${ajv.errorsText(validateScholarship.errors)}`);
      checkRules(s, vocab, w).forEach(bad);
      for (const { rule } of allRules(s)) {
        if (rule.source_quote && !quoteInText(rule.source_quote, text)) bad(`${w}: rule quote not found in page: "${rule.source_quote}"`);
      }
      for (const p of s.provenance || []) {
        if (!quoteInText(p.source_quote, text)) bad(`${w}: provenance quote (${p.field}) not found in page: "${p.source_quote}"`);
      }
    });
  }
  return { stats, problems };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const { stats, problems } = checkLabels(args.dir || DEFAULT_DIR);
  console.log(`pages: ${stats.pages}   labeled: ${stats.labeled}   unlabeled: ${stats.unlabeled.length}   scholarships labeled: ${stats.scholarships}`);
  console.log('by page_type:', JSON.stringify(stats.by_type));
  console.log('by review_status:', JSON.stringify(stats.by_status));
  console.log('by split:', JSON.stringify(stats.by_split));
  if (stats.vocabulary_gaps.length) console.log(`\nvocabulary gaps (${stats.vocabulary_gaps.length}):\n` + stats.vocabulary_gaps.map(g => ' - ' + g).join('\n'));
  const serious = problems.filter(p => p.review_status !== 'draft');
  const drafts = problems.filter(p => p.review_status === 'draft');
  if (drafts.length) console.log(`\n${drafts.length} problem(s) in drafts (expected until reviewed):\n` + drafts.slice(0, 20).map(p => ` - ${p.id}: ${p.message}`).join('\n') + (drafts.length > 20 ? `\n   ... ${drafts.length - 20} more` : ''));
  if (serious.length) console.error(`\nFAIL: ${serious.length} problem(s) in reviewed labels:\n` + serious.map(p => ` - ${p.id}: ${p.message}`).join('\n'));
  else console.log('\nOK: no problems in reviewed labels.');
  if (serious.length || (args.strict && problems.length)) process.exit(1);
}
