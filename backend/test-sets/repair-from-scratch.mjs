// One-time repair of the from-scratch gold labels written by an older transcribe-from-scratch.mjs.
// That script turned effort/basis/service answers into pseudo-rules (hard rules with no field and invented quotes,
// some nested as arrays) and used an op ('exists') the contract does not have. Those facts belong in
// effort / need_based / service_obligation, so this moves them there and drops the pseudo-rules.
//
//   node repair-from-scratch.mjs            (dry run: prints what would change)
//   node repair-from-scratch.mjs --write    (backs up every gold.json it touches to backups/<date>/ first)
//
// Only labels with from_scratch: true are touched. Nothing else in the label changes.
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_DIR, HERE, readManifest, readJson, parseArgs, isMain } from './lib.mjs';

const ESSAY = /^Essay required \((\d+) words\)$/;
const RECS = /^(\d+) letter\(s\) of recommendation required$/;
const FORMATS = /^Formats: (.+)$/;

/* Returns { changed, scholarship } without mutating the input. */
export function repairScholarship(s) {
  const out = structuredClone(s);
  const groups = (s.eligibility || []).flatMap(g => Array.isArray(g) ? g : [g]);   // un-nest arrays
  const keep = [];
  const moved = [];
  for (const g of groups) {
    const any = g.any_of || [];
    const rest = [];
    for (const r of any) {
      let m;
      if (r.kind === 'hard' && !r.field && (m = ESSAY.exec(r.description || ''))) { out.effort = { ...out.effort, essay_words: Number(m[1]) }; moved.push('essay_words'); }
      else if (r.kind === 'hard' && !r.field && (m = RECS.exec(r.description || ''))) { out.effort = { ...out.effort, recs_required: Number(m[1]) }; moved.push('recs_required'); }
      else if (r.kind === 'hard' && !r.field && (m = FORMATS.exec(r.description || ''))) { out.effort = { ...out.effort, formats: m[1].split(',').map(x => x.trim()).filter(Boolean) }; moved.push('formats'); }
      else if (r.kind === 'fuzzy' && r.source_quote === 'Service obligation required') { out.service_obligation = true; moved.push('service_obligation'); }
      else if (r.op === 'exists' && r.source_quote === 'merit') { out.need_based = 'merit'; moved.push('need_based'); }
      else if (r.op === 'exists' && r.source_quote === 'need') { out.need_based = 'need'; moved.push('need_based'); }
      else rest.push(r);
    }
    if (rest.length) keep.push({ ...g, any_of: rest });
  }
  out.eligibility = keep;
  const changed = JSON.stringify(out.eligibility) !== JSON.stringify(s.eligibility) || moved.length > 0;
  return { changed, scholarship: out, moved };
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const write = !!args.write;
  const stamp = new Date().toISOString().slice(0, 10);
  const backupDir = path.join(HERE, 'backups', stamp);
  let files = 0, records = 0;
  for (const r of readManifest(DEFAULT_DIR)) {
    const f = path.join(DEFAULT_DIR, r.id, 'gold.json');
    if (!fs.existsSync(f)) continue;
    const gold = readJson(f);
    if (!gold.from_scratch || !gold.scholarships?.length) continue;
    const results = gold.scholarships.map(repairScholarship);
    if (!results.some(x => x.changed)) continue;
    files++;
    results.forEach((x, i) => { if (x.changed) { records++; console.log(`${r.id}: "${gold.scholarships[i].name.slice(0, 50)}" moved [${[...new Set(x.moved)].join(', ') || 'nothing; un-nested/dropped groups'}]`); } });
    if (write) {
      fs.mkdirSync(path.join(backupDir, r.id), { recursive: true });
      fs.copyFileSync(f, path.join(backupDir, r.id, 'gold.json'));
      gold.scholarships = results.map(x => x.scholarship);
      fs.writeFileSync(f, JSON.stringify(gold, null, 2) + '\n');
    }
  }
  console.log(`\n${write ? 'Repaired' : 'Would repair'} ${records} record(s) in ${files} label file(s).${write ? ` Originals saved under ${path.relative(HERE, backupDir)}/.` : ' Re-run with --write to apply.'}`);
}
