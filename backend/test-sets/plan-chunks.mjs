// Split every selected page that is not yet labeled into work chunks for two independent model drafts each.
//   node plan-chunks.mjs [--dry]
// Excluded: pages already reviewed (batch 1) and the 30 from-scratch pages (those get human labels).
// Dev pages and test pages are chunked separately, so the dev labels finish first and test labels are made once, later.
// Within a split, pages are dealt out largest-first (snake order) so each chunk has a similar amount of text.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, readManifest, parseArgs, isMain } from './lib.mjs';

const SIZES = { dev: 2, test: 12 };   // number of chunks per split

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8'));
  const done = new Set([...plan.from_scratch, ...plan.batches.flatMap(b => b.ids)]);
  const rows = readManifest(DEFAULT_DIR).filter(r => r.status === 200 && r.selected && !done.has(r.id));
  const chunks = [];
  for (const split of ['dev', 'test']) {
    const pool = rows.filter(r => r.split === split).sort((a, b) => b.text_chars - a.text_chars || (a.id < b.id ? -1 : 1));
    const n = SIZES[split], buckets = Array.from({ length: n }, () => []);
    pool.forEach((r, i) => { const round = Math.floor(i / n); const k = i % n; buckets[round % 2 === 0 ? k : n - 1 - k].push(r); });
    buckets.forEach(b => chunks.push({ split, ids: b.map(r => r.id).sort(), chars: b.reduce((a, r) => a + r.text_chars, 0) }));
  }
  chunks.forEach((c, i) => { c.chunk = String(i + 1).padStart(2, '0'); });
  chunks.forEach(c => console.log(`chunk ${c.chunk}  ${c.split.padEnd(4)}  ${String(c.ids.length).padStart(3)} pages  ${(c.chars / 1000).toFixed(0)}k characters`));
  console.log(`total ${chunks.reduce((a, c) => a + c.ids.length, 0)} pages`);
  if (args.dry) process.exit(0);
  const dir = path.join(HERE, 'drafts', 'chunks');
  fs.mkdirSync(dir, { recursive: true });
  for (const c of chunks) fs.writeFileSync(path.join(dir, `chunk-${c.chunk}.json`), JSON.stringify({ chunk: c.chunk, split: c.split, ids: c.ids }, null, 2) + '\n');
  console.log('wrote drafts/chunks/chunk-NN.json');
}
