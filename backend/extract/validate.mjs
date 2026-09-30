// Validates one extractor output (gold.json shape) against the contract: page-level schema, each scholarship against
// scholarship.schema.json, every rule against the vocabulary, and that every quote really appears in the page text.
// Same checks as test-sets/check-drafts.mjs, as a function so the extractor can feed errors back to the model.
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { loadVocab, loadScholarshipSchema, checkRules, allRules } from '../contract/lib.mjs';
import { HERE, readJson, quoteInText } from '../test-sets/lib.mjs';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateGold = ajv.compile(readJson(path.join(HERE, 'gold.schema.json')));
const validateScholarship = ajv.compile(loadScholarshipSchema());
const vocab = loadVocab();

/* pred: parsed model output. text: saved page text. kind: 'html' | 'pdf'. Returns a list of problem strings (empty = valid). */
export function validatePrediction(pred, { text = '', kind = 'html' } = {}) {
  const errors = [];
  if (!pred || typeof pred !== 'object') return ['output is not a JSON object'];
  if (!validateGold({ scholarships: [], ...pred })) return [`page-level schema: ${ajv.errorsText(validateGold.errors)}`];
  if (pred.is_scholarship_page !== (pred.page_type !== 'not_scholarship')) errors.push('is_scholarship_page disagrees with page_type');
  if (pred.page_type === 'not_scholarship' && ((pred.scholarships || []).length || (pred.follow_links || []).length || (pred.award_names || []).length)) {
    errors.push('not_scholarship must have no scholarships, follow_links or award_names');
  }
  if (kind === 'pdf' && pred.page_type !== 'pdf_form' && pred.page_type !== 'not_scholarship') {
    errors.push(`this page is a PDF, so page_type should be pdf_form or not_scholarship, not ${pred.page_type}`);
  }
  if (pred.page_type === 'single' && (pred.scholarships || []).length !== 1) errors.push(`single page should have exactly 1 scholarship, has ${(pred.scholarships || []).length}`);
  (pred.scholarships || []).forEach((s, i) => {
    const w = `scholarships[${i}] "${s.name || '?'}"`;
    if (!validateScholarship(s)) errors.push(`${w}: ${ajv.errorsText(validateScholarship.errors)}`);
    if ((s.eligibility || []).some(g => !g || !Array.isArray(g.any_of))) { errors.push(`${w}: every eligibility group must be {"any_of": [...]}`); return; }
    checkRules(s, vocab, w).forEach(e => errors.push(e));
    for (const { rule } of allRules(s)) {
      if (rule.source_quote && !quoteInText(rule.source_quote, text)) errors.push(`${w}: rule quote not found in page: "${rule.source_quote}"`);
    }
    for (const p of s.provenance || []) {
      if (!quoteInText(p.source_quote, text)) errors.push(`${w}: provenance quote (${p.field}) not found in page: "${p.source_quote}"`);
    }
  });
  return errors;
}
