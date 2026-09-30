// Create a starter gold.json for pages that don't have one.
//   node new-label.mjs <id> [<id> ...] [--dir pages] [--from-scratch]
//   node new-label.mjs --all            every snapshotted page without a label
// Drafts (from Claude Code or by hand) overwrite the `scholarships` array; review_status moves draft -> reviewed.
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_DIR, readManifest, parseArgs, isMain } from './lib.mjs';

export function newLabel(dir, id, { fromScratch = false } = {}) {
  const f = path.join(dir, id, 'gold.json');
  if (!fs.existsSync(path.join(dir, id))) throw new Error(`no snapshot for ${id}; run snapshot.mjs first`);
  if (fs.existsSync(f)) return false;
  const m = readManifest(dir).find(r => r.id === id) || {};
  const page_type = m.page_type || (m.kind === 'pdf' ? 'pdf_form' : 'single');
  const gold = {
    page_type,
    is_scholarship_page: page_type !== 'not_scholarship',
    scholarships: [],
    follow_links: [],
    review_status: 'draft',
    from_scratch: fromScratch,
    vocabulary_gaps: [],
    notes: ''
  };
  fs.writeFileSync(f, JSON.stringify(gold, null, 2) + '\n');
  return true;
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const dir = args.dir || DEFAULT_DIR;
  const ids = args.all ? readManifest(dir).filter(r => r.status === 200 && r.selected !== false).map(r => r.id) : args._;
  if (!ids.length) { console.error('usage: node new-label.mjs <id...> | --all [--dir pages] [--from-scratch]'); process.exit(2); }
  let n = 0;
  for (const id of ids) if (newLabel(dir, id, { fromScratch: !!args['from-scratch'] })) n++;
  console.log(`created ${n} label file(s), ${ids.length - n} already existed.`);
}
