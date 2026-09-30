// Write a drafts file into the pages' gold.json files.
//   node apply-drafts.mjs drafts/batch-01.mjs [--dir pages]
// Each draft is keyed by page URL. Existing gold.json fields are preserved unless the draft sets them.
// Drafts always land as review_status "draft", drafted_by "claude", and never touch from-scratch pages.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULT_DIR, HERE, readManifest, normalizeUrl, parseArgs, isMain } from './lib.mjs';

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0];
  if (!file) { console.error('usage: node apply-drafts.mjs drafts/batch-01.mjs [--dir pages]'); process.exit(2); }
  const dir = args.dir || DEFAULT_DIR;
  const drafts = (await import(pathToFileURL(path.resolve(HERE, file)).href)).default;
  const byUrl = new Map(readManifest(dir).map(r => [normalizeUrl(r.url), r]));
  const plan = fs.existsSync(path.join(HERE, 'label-plan.json')) ? JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8')) : { from_scratch: [] };
  let n = 0;
  const missing = [];
  for (const [url, draft] of Object.entries(drafts)) {
    const row = byUrl.get(normalizeUrl(url));
    if (!row) { missing.push(url); continue; }
    if (plan.from_scratch.includes(row.id)) { console.error(`refusing: ${url} is in the from-scratch set`); process.exit(1); }
    const f = path.join(dir, row.id, 'gold.json');
    const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    if (cur.review_status && cur.review_status !== 'draft') { console.error(`refusing: ${url} is already ${cur.review_status}`); process.exit(1); }
    const next = { ...cur, ...draft, review_status: 'draft', from_scratch: false, drafted_by: 'claude' };
    delete next.labeler; delete next.labeled_at;   // set by the human reviewer
    fs.writeFileSync(f, JSON.stringify(next, null, 2) + '\n');
    n++;
  }
  console.log(`wrote ${n} draft label(s).`);
  if (missing.length) { console.error('URLs not in the manifest:\n  ' + missing.join('\n  ')); process.exit(1); }
}
