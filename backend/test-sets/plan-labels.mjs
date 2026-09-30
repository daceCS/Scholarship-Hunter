// Choose which dev pages you label from scratch (anchoring check) and which get model drafts, batch by batch.
//   node plan-labels.mjs [--seed label-plan-1] [--batch 1] [--size 25] [--dry]
// Writes label-plan.json (tracked). The from-scratch set is chosen once and never receives a visible draft.
// Batches are drawn from dev pages that are not in the from-scratch set, spread across page types.
// Pages over 20,000 characters are skipped in batches (they cost a lot to draft and review); they get their own batch later.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HERE, DEFAULT_DIR, readManifest, parseArgs, isMain } from './lib.mjs';

const PLAN = path.join(HERE, 'label-plan.json');
const FROM_SCRATCH = { single: 18, listing: 5, pdf_form: 2, not_scholarship: 3, unset: 2 };   // 30
const MIX = { single: 15, listing: 4, pdf_form: 2, not_scholarship: 3, unset: 1 };           // 25
const MAX_CHARS = 20000;
const hash = (seed, s) => parseInt(crypto.createHash('sha1').update(seed + ':' + s).digest('hex').slice(0, 8), 16);
const typeOf = r => r.page_type || 'unset';

function take(rows, quota, seed) {
  const out = [];
  for (const [type, n] of Object.entries(quota)) {
    const pool = rows.filter(r => typeOf(r) === type).sort((a, b) => hash(seed, a.id) - hash(seed, b.id));
    out.push(...pool.slice(0, n).map(r => r.id));
  }
  return out;
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const seed = args.seed || 'label-plan-1';
  const batchNo = Number(args.batch || 1), size = Number(args.size || 25);
  const dev = readManifest(DEFAULT_DIR).filter(r => r.status === 200 && r.selected && r.split === 'dev');
  const plan = fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { seed, from_scratch: [], batches: [] };

  if (!plan.from_scratch.length) plan.from_scratch = take(dev, FROM_SCRATCH, plan.seed);
  if (plan.batches.some(b => b.n === batchNo)) { console.error(`batch ${batchNo} already planned`); process.exit(1); }

  const used = new Set([...plan.from_scratch, ...plan.batches.flatMap(b => b.ids)]);
  const avail = dev.filter(r => !used.has(r.id) && r.text_chars <= MAX_CHARS);
  const quota = Object.fromEntries(Object.entries(MIX).map(([k, v]) => [k, Math.round(v * size / 25)]));
  const ids = take(avail, quota, plan.seed + ':b' + batchNo);
  plan.batches.push({ n: batchNo, ids });

  const byId = new Map(dev.map(r => [r.id, r]));
  const show = (label, list) => {
    console.log(`\n${label} (${list.length})`);
    list.forEach(id => { const r = byId.get(id); console.log(`  ${typeOf(r).padEnd(15)} ${r.geo.padEnd(10)} ${String(r.text_chars).padStart(6)}  ${r.url.slice(0, 90)}`); });
  };
  if (!args.dry) {
    fs.writeFileSync(PLAN, JSON.stringify(plan, null, 2) + '\n');
    show('From scratch (you label these first, no draft shown)', plan.from_scratch);
  }
  show(`Batch ${batchNo} (drafts)`, ids);
  if (args.dry) console.log('\n(dry run: nothing written)');
}
