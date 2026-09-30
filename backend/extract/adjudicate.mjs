// Step 2 of the review flow: a third model call settles the pages where the two drafts disagree.
//   node extract/adjudicate.mjs --a dev2-opus --b dev2-sonnet --compare dev2 --run dev2-final
// For every page with status "review" in predictions/compare-<compare>.json it sends the page text, both drafts (labelled
// "draft 1"/"draft 2", order alternated so neither model is favoured) and the list of differences. The reply is the complete
// final label plus adjudication: { unsure, reasons }. Validated like any extraction (schema, vocabulary, quotes on the page).
// Flags: --model (default claude-sonnet-5-5)  --effort (default medium; not sent to Haiku, which has no effort setting)  --concurrency 3  --ids a,b  --force
// It never reads gold labels, so the result is independent of any human label.
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { HERE, DEFAULT_DIR, readManifest, readText, parseArgs } from '../test-sets/lib.mjs';
import { validatePrediction } from './validate.mjs';
import { buildSystemPrompt, callModel, textOf, parseJson, cost, pool } from './extract.mjs';

const ADDENDUM = `

## Adjudication task (this request only)

You are also given two independent drafts of the same page (draft 1 and draft 2) and a list of where they differ. The drafts may both be wrong; do not simply pick one. Decide every disputed point from the page text alone. If a point is genuinely ambiguous on the page, choose the reading a careful person would most likely choose and record the doubt. Apply the labeling rules and rulings to the WHOLE label, including parts where the drafts agree.

Reply with the complete final label in the usual JSON shape, plus one extra top-level key:
"adjudication": { "unsure": boolean, "reasons": ["short plain-language reason", ...] }
Set "unsure": true when a careful person could reasonably disagree with a decision you made (but NOT for points the rulings already settle), when the page is genuinely ambiguous, or when the page is so large that you could not check it fully. Give at least one reason whenever unsure is true.`;

const args = parseArgs(process.argv.slice(2));
if (!args.a || !args.b || !args.compare || !args.run) { console.error('usage: node extract/adjudicate.mjs --a <run> --b <run> --compare <name> --run <name>'); process.exit(2); }
if (!process.env.ANTHROPIC_API_KEY) { await import('dotenv').then(d => d.config({ path: path.join(HERE, '../.env') })); }
if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY is not set (backend/.env).'); process.exit(2); }

const pred = id => path.join(HERE, 'predictions', id);
const cmp = JSON.parse(fs.readFileSync(pred(`compare-${args.compare}.json`), 'utf8'));
const rows = new Map(readManifest(DEFAULT_DIR).map(r => [r.id, r]));
const wanted = args.ids ? new Set(String(args.ids).split(',')) : null;
const outDir = pred(args.run);
fs.mkdirSync(outDir, { recursive: true });
const todo = Object.entries(cmp).filter(([id, v]) => v.status === 'review' && (!wanted || wanted.has(id)) && (args.force || !fs.existsSync(path.join(outDir, id + '.json')))).map(([id]) => id);

const opts = {
  model: args.model || 'claude-sonnet-5-5',
  effort: args.effort || 'medium',
  today: args.today || new Date().toISOString().slice(0, 10),
  system: [{ type: 'text', text: buildSystemPrompt() + ADDENDUM, cache_control: { type: 'ephemeral' } }],
};
console.log(`${todo.length} disputed page(s) to adjudicate with ${opts.model}, effort ${opts.effort}`);

const client = new Anthropic({ maxRetries: 5 });
const logFile = path.join(outDir, '_run.json');
const log = { run: args.run, model: opts.model, effort: opts.effort, pages: fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')).pages : {} };
let done = 0, total$ = 0;

async function adjudicate(id, i) {
  const row = rows.get(id);
  const text = readText(DEFAULT_DIR, id) || '';
  const A = JSON.parse(fs.readFileSync(path.join(pred(args.a), id + '.json'), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.join(pred(args.b), id + '.json'), 'utf8'));
  const [d1, d2] = i % 2 ? [B, A] : [A, B];           // alternate which model is "draft 1"
  const diffs = cmp[id].major;
  const content = `Today's date: ${opts.today}\nPage URL: ${row.url}\nPage kind: ${row.kind}\n\n<page_text>\n${text}\n</page_text>\n\n<draft_1>\n${JSON.stringify(d1)}\n</draft_1>\n\n<draft_2>\n${JSON.stringify(d2)}\n</draft_2>\n\n<differences>\n${JSON.stringify(diffs)}\n</differences>\n\nReturn the final JSON object for this page.`;
  const messages = [{ role: 'user', content }];
  const usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  let final = null, errors = [], attempts = 0;
  for (; attempts < 2; attempts++) {
    const msg = await callModel(client, { ...opts, messages });
    for (const k of Object.keys(usage)) usage[k] += msg.usage?.[k] || 0;
    if (msg.stop_reason === 'refusal') return { final, errors: ['refused'], usage, attempts: attempts + 1 };
    try { final = parseJson(textOf(msg)); errors = validatePrediction(final, { text, kind: row.kind }); }
    catch (e) { final = null; errors = [`reply was not valid JSON: ${e.message}`]; }
    if (!errors.length) break;
    messages.push({ role: 'assistant', content: msg.content });
    messages.push({ role: 'user', content: `Your answer had these problems:\n${errors.slice(0, 25).map(e => '- ' + e).join('\n')}\n\nFix exactly these problems and return the complete corrected JSON object again (only the JSON).` });
  }
  return { final, errors, usage, attempts: attempts + 1 };
}

await pool(todo.map((id, i) => [id, i]), Number(args.concurrency || 3), async ([id, i]) => {
  try {
    const { final, errors, usage, attempts } = await adjudicate(id, i);
    const usd = cost(opts.model, usage);
    total$ += usd;
    if (final) fs.writeFileSync(path.join(outDir, id + '.json'), JSON.stringify(final, null, 2) + '\n');
    log.pages[id] = { ok: !!final && !errors.length, attempts, errors, unsure: final?.adjudication?.unsure ?? null, usd: Number(usd.toFixed(4)) };
    console.log(`[${++done}/${todo.length}] ${id}: ${final?.page_type || 'NO OUTPUT'}${final?.adjudication?.unsure ? ' (unsure)' : ''}${errors.length ? ` (${errors.length} problem(s) remain)` : ''} $${usd.toFixed(3)}`);
  } catch (e) {
    log.pages[id] = { ok: false, errors: [`request failed: ${e.message}`] };
    console.log(`[${++done}/${todo.length}] ${id}: FAILED ${e.message}`);
  }
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n');
});
const all = Object.values(log.pages);
console.log(`\nDone. ${all.filter(p => p.ok).length}/${all.length} valid, ${all.filter(p => p.unsure).length} flagged unsure. This run cost ~$${total$.toFixed(2)}.`);
