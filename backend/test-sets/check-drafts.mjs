// Validate a drafts file (drafts/*.mjs, keyed by page URL) WITHOUT writing anything to gold.json.
//   node check-drafts.mjs drafts/hidden/from-scratch-drafts.mjs            (expects the 30 from-scratch pages)
//   node check-drafts.mjs drafts/A/chunk-01.mjs --chunk drafts/chunks/chunk-01.json   (expects that chunk's pages)
// Checks each draft the same way check-labels checks a label: page-level schema, each scholarship against the contract
// schema, every rule against the vocabulary, every source_quote present in the saved page text, page_type consistency.
// Also reports pages in the manifest's from-scratch set that have no draft yet.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import { loadVocab, loadScholarshipSchema, checkRules, allRules } from '../contract/lib.mjs';
import { HERE, DEFAULT_DIR, readManifest, readText, readJson, quoteInText, normalizeUrl, parseArgs, isMain } from './lib.mjs';

export async function checkDrafts(file, dir = DEFAULT_DIR, chunkFile = null) {
  const drafts = (await import(pathToFileURL(path.resolve(HERE, file)).href)).default;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateGold = ajv.compile(readJson(path.join(HERE, 'gold.schema.json')));
  const validateScholarship = ajv.compile(loadScholarshipSchema());
  const vocab = loadVocab();
  const byUrl = new Map(readManifest(dir).map(r => [normalizeUrl(r.url), r]));
  const errors = [];
  const seen = new Set();
  const counts = { pages: 0, scholarships: 0, by_type: {} };

  for (const [url, d] of Object.entries(drafts)) {
    const row = byUrl.get(normalizeUrl(url));
    const bad = m => errors.push(`${url}: ${m}`);
    if (!row) { bad('URL is not in the manifest'); continue; }
    seen.add(row.id);
    counts.pages++;
    counts.by_type[d.page_type] = (counts.by_type[d.page_type] || 0) + 1;
    if (!validateGold({ scholarships: [], ...d })) { bad(`page-level schema: ${ajv.errorsText(validateGold.errors)}`); continue; }
    if (d.is_scholarship_page !== (d.page_type !== 'not_scholarship')) bad('is_scholarship_page disagrees with page_type');
    if (d.page_type === 'not_scholarship' && ((d.scholarships || []).length || (d.follow_links || []).length || (d.award_names || []).length)) bad('not_scholarship must have no scholarships, follow_links or award_names');
    if (row.kind === 'pdf' && d.page_type !== 'pdf_form' && d.page_type !== 'not_scholarship') bad(`this page is a PDF, so page_type should be pdf_form or not_scholarship, not ${d.page_type}`);
    const text = readText(dir, row.id) || '';
    (d.scholarships || []).forEach((s, i) => {
      counts.scholarships++;
      const w = `scholarships[${i}] "${s.name || '?'}"`;
      if (!validateScholarship(s)) bad(`${w}: ${ajv.errorsText(validateScholarship.errors)}`);
      checkRules(s, vocab, w).forEach(bad);
      for (const { rule } of allRules(s)) if (rule.source_quote && !quoteInText(rule.source_quote, text)) bad(`${w}: rule quote not found in page: "${rule.source_quote}"`);
      for (const p of s.provenance || []) if (!quoteInText(p.source_quote, text)) bad(`${w}: provenance quote (${p.field}) not found in page: "${p.source_quote}"`);
    });
  }
  const plan = fs.existsSync(path.join(HERE, 'label-plan.json')) ? readJson(path.join(HERE, 'label-plan.json')) : { from_scratch: [] };
  let expected = plan.from_scratch;
  if (chunkFile) {
    const j = readJson(path.resolve(HERE, chunkFile));
    expected = Array.isArray(j.ids) ? j.ids : Object.entries(j).filter(([, v]) => v.status === 'review').map(([id]) => id);   // chunk file, or a compare file (only disputed pages)
  }
  const missing = expected.filter(id => !seen.has(id));
  const unexpected = [...seen].filter(id => !expected.includes(id));
  if (unexpected.length) errors.push(`draft covers ${unexpected.length} page(s) that are not in the expected set: ${unexpected.join(', ')}`);
  return { errors, counts, missing_from_scratch_pages: missing };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args._[0]) { console.error('usage: node check-drafts.mjs drafts/<file>.mjs'); process.exit(2); }
  const { errors, counts, missing_from_scratch_pages } = await checkDrafts(args._[0], DEFAULT_DIR, args.chunk || null);
  console.log(`drafts: ${counts.pages} pages, ${counts.scholarships} scholarship records, by type ${JSON.stringify(counts.by_type)}`);
  if (missing_from_scratch_pages.length) console.log(`pages in the expected set with no draft yet: ${missing_from_scratch_pages.length}`);
  if (errors.length) { console.error(`\nFAIL: ${errors.length} problem(s):\n` + errors.map(e => ' - ' + e).join('\n')); process.exit(1); }
  console.log('OK: every draft is valid and every quote is on its page.');
}
