// Add a school rule (prompt ruling 12) to every record on one page that lacks one, without re-extracting it.
// For pages too long for the model to return in one reply: the records already extracted are kept and patched.
//   node extract/add-school-rule.mjs --from crawl1 --page fas-ucsd-edu-c835dc38 --school "UC San Diego" --quote "Continuing undergraduate students can apply for scholarships annually" --run edu1-patch
// The quote must appear verbatim on the page. Records that already have a hard institution rule are left alone.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, readManifest, readText, parseArgs } from '../test-sets/lib.mjs';
import { validatePrediction } from './validate.mjs';

const a = parseArgs(process.argv.slice(2));
if (!a.from || !a.page || !a.school || !a.quote || !a.run) { console.error('usage: --from <run> --page <page id> --school "<name>" --quote "<text on the page>" --run <new run>'); process.exit(2); }
const text = readText(DEFAULT_DIR, a.page) || '';
const row = readManifest(DEFAULT_DIR).find(r => r.id === a.page);
const pred = JSON.parse(fs.readFileSync(path.join(HERE, 'predictions', a.from, a.page + '.json'), 'utf8'));

let added = 0;
for (const s of pred.scholarships || []) {
  if ((s.eligibility || []).some(g => (g.any_of || []).some(r => r.kind === 'hard' && r.field === 'academic.institution'))) continue;
  s.eligibility = [...(s.eligibility || []), { any_of: [{ kind: 'hard', field: 'academic.institution', op: 'eq', value: a.school, source_quote: a.quote }] }];
  added++;
}
const errors = validatePrediction(pred, { text, kind: row?.kind });
if (errors.length) { console.error('not written, problems:\n' + errors.slice(0, 10).map(e => '- ' + e).join('\n')); process.exit(1); }
const out = path.join(HERE, 'predictions', a.run);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, a.page + '.json'), JSON.stringify(pred, null, 2) + '\n');
fs.writeFileSync(path.join(out, '_run.json'), JSON.stringify({ run: a.run, note: `school rule added to ${added} record(s) from ${a.from}`, pages: { [a.page]: { ok: true, errors: [], usd: 0 } } }, null, 2) + '\n');
console.log(`added the "${a.school}" rule to ${added} record(s); wrote predictions/${a.run}/${a.page}.json`);
