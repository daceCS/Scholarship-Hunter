// Scholarship page extractor: saved page text -> structured JSON (gold.json shape), one file per page.
//
//   node extract/extract.mjs --split dev --run dev1                 extract every dev page into test-sets/predictions/dev1/
//   node extract/extract.mjs --ids a,b --run try                    just those pages
//   node extract/extract.mjs --split dev --limit 5 --run smoke      first 5 pages of the split
//   node extract/extract.mjs --split dev --dry-run                  no API calls: list pages and estimate tokens/cost
//   then: node test-sets/score.mjs --pred predictions/dev1 --split dev
//
// Flags: --model (default claude-sonnet-5-5)  --effort low|medium|high|xhigh|max (default medium)  --concurrency 3
//        --today YYYY-MM-DD  --force (re-extract pages that already have output)  --no-fallback  --no-cache
//        --batch (submit to the Batch API: half price, results within ~24h)  --collect (fetch and validate a submitted batch; same --run)
// Free savings, on by default: pages whose text hasn't changed since a valid extraction reuse it (predictions/_cache/),
// pages that can't hold a scholarship are skipped (extract/prefilter.mjs), and repeated menu/footer lines aren't sent.
// Needs ANTHROPIC_API_KEY in backend/.env (never commit it).
//
// Each page: one request with the page text; the reply is validated (schema, vocabulary, quotes really on the page).
// If validation fails the problems are sent back once for a corrected answer. The best answer is written either way;
// pages that still have problems are listed in <run>/_run.json so they can be reviewed.

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { loadVocab, loadScholarshipSchema } from '../contract/lib.mjs';
import { HERE as TEST_SETS, DEFAULT_DIR, readManifest, readText, parseArgs } from '../test-sets/lib.mjs';
import { validatePrediction } from './validate.mjs';
import { slim, skipReason } from './prefilter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '../.env') });

// $ per million tokens: input, output, cache write (1.25x input), cache read
export const PRICES = {
  'claude-opus-5-5': [4, 20, 5, 0.2],
  'claude-sonnet-5-5': [2, 10, 2.5, 0.2],
  'claude-haiku-4-5': [1, 5, 1.25, 0.1],
};
export const priceFor = model => PRICES[model] || PRICES['claude-sonnet-5-5'];
export const cost = (model, u) => {
  const [i, o, cw, cr] = priceFor(model);
  return ((u.input_tokens || 0) * i + (u.output_tokens || 0) * o + (u.cache_creation_input_tokens || 0) * cw + (u.cache_read_input_tokens || 0) * cr) / 1e6;
};

export function buildSystemPrompt() {
  const base = fs.readFileSync(path.join(here, 'prompt.md'), 'utf8');
  return `${base}\n\n## Scholarship record JSON schema\n\`\`\`json\n${JSON.stringify(loadScholarshipSchema())}\n\`\`\`\n\n## Vocabulary (profile fields rules may use)\n\`\`\`json\n${JSON.stringify(loadVocab())}\n\`\`\`\n`;
}

const userMessage = (row, text, today) =>
  `Today's date: ${today}\nPage URL: ${row.url}\nPage kind: ${row.kind}\n\n<page_text>\n${text}\n</page_text>\n\nReturn the JSON object for this page.`;

/* The model should reply with bare JSON; tolerate fences and stray prose around it. */
export function parseJson(text) {
  const t = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('no JSON object in the reply');
  return JSON.parse(t.slice(a, b + 1));
}

export const setFallback = v => { fallbackOn = v; };
let fallbackOn = true;

export async function callModel(client, { model, effort, system, messages }) {
  // Haiku 4.5 has no effort setting (the API rejects it), so it is only sent to models that support it.
  const params = { model, max_tokens: 32000, system, messages, ...(/haiku/.test(model) ? {} : { output_config: { effort } }) };
  const run = async useFallback => {
    const stream = useFallback
      ? client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      : client.messages.stream(params);
    return stream.finalMessage();
  };
  try {
    return await run(fallbackOn && /opus|sonnet-5|fable/.test(model));
  } catch (e) {
    if (fallbackOn && e instanceof Anthropic.BadRequestError && /fallback/i.test(e.message)) {
      console.warn('  (refusal fallback not accepted here; continuing without it)');
      fallbackOn = false;
      return run(false);
    }
    throw e;
  }
}

export const textOf = msg => msg.content.filter(b => b.type === 'text').map(b => b.text).join('');

const requestParams = (opts, row, text) => ({
  model: opts.model, max_tokens: 32000, system: opts.system,
  messages: [{ role: 'user', content: userMessage(row, slim(text), opts.today) }],
  ...(/haiku/.test(opts.model) ? {} : { output_config: { effort: opts.effort } }),
});

// `first` is an already-received reply (from a batch); otherwise the first attempt is a normal call.
async function extractPage(client, opts, row, first) {
  const text = readText(DEFAULT_DIR, row.id) || '';
  const messages = requestParams(opts, row, text).messages;
  const usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  const add = u => { for (const k of Object.keys(usage)) usage[k] += u?.[k] || 0; };
  let pred = null, errors = [], attempts = 0;

  for (; attempts < 2; attempts++) {
    const msg = attempts === 0 && first ? first : await callModel(client, { ...opts, messages });
    add(msg.usage);
    if (msg.stop_reason === 'refusal') return { pred, errors: [`refused (${msg.stop_details?.category || 'unknown category'})`], usage, attempts: attempts + 1 };
    if (msg.stop_reason === 'max_tokens') errors = ['reply was cut off at max_tokens'];
    else {
      try { pred = parseJson(textOf(msg)); errors = validatePrediction(pred, { text, kind: row.kind }); }
      catch (e) { pred = null; errors = [`reply was not valid JSON: ${e.message}`]; }
    }
    if (!errors.length) break;
    messages.push({ role: 'assistant', content: msg.content });
    messages.push({ role: 'user', content: `Your answer had these problems:\n${errors.slice(0, 25).map(e => '- ' + e).join('\n')}\n\nFix exactly these problems and return the complete corrected JSON object again (only the JSON).` });
  }
  return { pred, errors, usage, attempts: attempts + 1 };
}

export async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const item = items[i++]; await fn(item); } }));
}

const hashOf = x => crypto.createHash('sha256').update(x).digest('hex');
// Same page text + model + effort + prompt => same extraction. `today` is left out on purpose (it only shifts cycle_status).
const cacheKey = (opts, row, text) => hashOf([opts.model, opts.effort, opts.system[0].text, row.url, row.kind, text].join('\u0001'));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const opts = {
    model: args.model || 'claude-sonnet-5-5',
    effort: args.effort || 'medium',
    today: args.today || new Date().toISOString().slice(0, 10),
    system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
  };
  fallbackOn = !args['no-fallback'];
  const concurrency = Number(args.concurrency || 3);
  const split = args.split || 'dev';
  const ids = args.ids ? String(args.ids).split(',') : null;
  let rows = readManifest(DEFAULT_DIR).filter(r => r.status === 200 && (ids ? ids.includes(r.id) : (split === 'all' || r.split === split)));
  if (args.limit) rows = rows.slice(0, Number(args.limit));
  const runName = args.run || `run-${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16)}`;
  const outDir = path.join(TEST_SETS, 'predictions', runName);
  const cacheDir = path.join(TEST_SETS, 'predictions', '_cache');
  const logFile = path.join(outDir, '_run.json');
  const batchFile = path.join(outDir, '_batch.json');
  const useCache = !args['no-cache'];
  const pending = rows.filter(r => args.force || !fs.existsSync(path.join(outDir, `${r.id}.json`)));

  // free steps: skip pages that can't hold a scholarship, reuse earlier valid extractions of identical text
  const skipped = {}, cached = {}, todo = [];
  for (const r of pending) {
    const text = readText(DEFAULT_DIR, r.id) || '';
    const why = skipReason(text);
    if (why) { skipped[r.id] = why; continue; }
    const f = path.join(cacheDir, cacheKey(opts, r, text) + '.json');
    if (useCache && !args.force && fs.existsSync(f)) { cached[r.id] = f; continue; }
    todo.push(r);
  }

  const sysChars = opts.system[0].text.length;
  const pageChars = todo.reduce((s, r) => s + slim(readText(DEFAULT_DIR, r.id) || '').length, 0);
  const estIn = Math.round((sysChars * todo.length + pageChars) / 4), estOut = todo.length * 2500;
  const [pi, po] = priceFor(opts.model);
  const half = args.batch ? 0.5 : 1;
  console.log(`${pending.length} page(s) to do (${rows.length - pending.length} already done) into predictions/${runName}/ with ${opts.model}, effort ${opts.effort}`);
  console.log(`  ${Object.keys(skipped).length} skipped by the free pre-filter, ${Object.keys(cached).length} reused from cache, ${todo.length} need the model${args.batch ? ' (batch: half price)' : ''}`);
  for (const [id, why] of Object.entries(skipped)) console.log(`  skip ${id}: ${why}`);
  console.log(`rough estimate: ${(estIn / 1e6).toFixed(2)}M input tokens (system prompt is cached after the first request), ~${(estOut / 1e6).toFixed(2)}M output; upper bound ~$${(half * (estIn * pi + estOut * po) / 1e6).toFixed(2)}`);
  if (args['dry-run']) return;

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });
  const log = { run: runName, model: opts.model, effort: opts.effort, today: opts.today, pages: {} };
  if (fs.existsSync(logFile)) Object.assign(log.pages, JSON.parse(fs.readFileSync(logFile, 'utf8')).pages || {});
  const save = () => fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n');
  for (const [id, why] of Object.entries(skipped)) log.pages[id] = { ok: true, skipped: why, errors: [], usd: 0 };
  for (const [id, f] of Object.entries(cached)) {
    fs.copyFileSync(f, path.join(outDir, `${id}.json`));
    log.pages[id] = { ok: true, cached: true, errors: [], usd: 0 };
  }
  save();

  const finish = (row, { pred, errors, usage, attempts }, discount = 1) => {
    const usd = cost(opts.model, usage) * discount;
    if (pred) fs.writeFileSync(path.join(outDir, `${row.id}.json`), JSON.stringify(pred, null, 2) + '\n');
    if (pred && !errors.length && useCache) fs.writeFileSync(path.join(cacheDir, cacheKey(opts, row, readText(DEFAULT_DIR, row.id) || '') + '.json'), JSON.stringify(pred, null, 2) + '\n');
    log.pages[row.id] = { ok: !!pred && !errors.length, attempts, errors, usage, usd: Number(usd.toFixed(4)) };
    save();
    return usd;
  };
  const fail = (row, e) => { log.pages[row.id] = { ok: false, errors: [`request failed: ${e.message}`] }; save(); };
  const client = new Anthropic({ maxRetries: 5 });
  let done = 0, total$ = 0;

  if (args.batch) {                                            // submit; --collect picks the results up later
    if (!todo.length) { console.log('Nothing to send.'); return; }
    const map = {};
    const requests = todo.map((r, i) => { map[`p${i}`] = r.id; return { custom_id: `p${i}`, params: requestParams(opts, r, readText(DEFAULT_DIR, r.id) || '') }; });
    const batch = await client.messages.batches.create({ requests });
    fs.writeFileSync(batchFile, JSON.stringify({ id: batch.id, map, submitted: new Date().toISOString() }, null, 2) + '\n');
    console.log(`\nSubmitted batch ${batch.id} (${requests.length} pages). Check later with the same command but --collect instead of --batch.`);
    return;
  }

  if (args.collect) {
    const b = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
    const st = await client.messages.batches.retrieve(b.id);
    if (st.processing_status !== 'ended') { console.log(`Batch ${b.id} is still ${st.processing_status}: ${JSON.stringify(st.request_counts)}`); return; }
    const byId = new Map(rows.map(r => [r.id, r]));
    const got = [];
    for await (const item of await client.messages.batches.results(b.id)) got.push(item);
    await pool(got, concurrency, async item => {
      const row = byId.get(b.map[item.custom_id]);
      if (!row) return;
      try {
        if (item.result.type !== 'succeeded') throw new Error(`batch result: ${item.result.type}`);
        const r = await extractPage(client, opts, row, item.result.message);   // a repair retry, if needed, is a normal (full price) call
        total$ += finish(row, r, 0.5);
        console.log(`[${++done}/${got.length}] ${row.id}: ${r.pred?.page_type || 'NO OUTPUT'}${r.errors.length ? ` (${r.errors.length} problem(s) remain)` : ''}`);
      } catch (e) { fail(row, e); console.log(`[${++done}/${got.length}] ${row.id}: FAILED ${e.message}`); }
    });
  } else {
    await pool(todo, concurrency, async row => {
      try {
        const r = await extractPage(client, opts, row);
        total$ += finish(row, r);
        console.log(`[${++done}/${todo.length}] ${row.id}: ${r.pred?.page_type || 'NO OUTPUT'}${r.errors.length ? ` (${r.errors.length} problem(s) remain)` : ''} $${cost(opts.model, r.usage).toFixed(3)}`);
      } catch (e) { fail(row, e); console.log(`[${++done}/${todo.length}] ${row.id}: FAILED ${e.message}`); }
    });
  }

  const all = Object.values(log.pages);
  console.log(`\nDone. ${all.filter(p => p.ok).length}/${all.length} pages valid, ${all.filter(p => !p.ok).length} with problems (see ${path.relative(process.cwd(), logFile)}). This run cost ~$${total$.toFixed(2)}.`);
  console.log(`Score it: node test-sets/score.mjs --pred predictions/${runName} --split ${split}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
