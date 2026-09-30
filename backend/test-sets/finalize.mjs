// Turn two-draft results into gold labels and pick what a human reviews.
//   node finalize.mjs 01 02 ...  [--dry] [--seed final-sample-1]
// For each chunk:
//   compare says "agree"  -> gold = draft A, review_status "agreed"
//   compare says "review" -> gold = the adjudicator's label (drafts/final/chunk-NN.mjs), review_status "adjudicated",
//                            with the adjudicator's `unsure` flag and reasons stored in gold.adjudication
// Never touches reviewed / second_look labels, from-scratch pages, or batch-1 pages.
// Then it writes drafts/final/review-queue.json:
//   unsure             every adjudicated page the adjudicator flagged as unsure (always reviewed)
//   adjudicated_sample a seeded 20% sample of the other adjudicated pages
//   agreed_sample      a seeded 10% sample of the "agreed" pages (guards against both drafters making the same mistake)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { HERE, DEFAULT_DIR, readManifest, normalizeUrl, parseArgs, isMain } from './lib.mjs';

const hash = (seed, s) => parseInt(crypto.createHash('sha1').update(seed + ':' + s).digest('hex').slice(0, 8), 16);
const sample = (ids, frac, seed) => [...ids].sort((a, b) => hash(seed, a) - hash(seed, b)).slice(0, Math.max(ids.length ? 1 : 0, Math.round(ids.length * frac)));

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const seed = args.seed || 'final-sample-1';
  const chunks = args._.map(c => String(c).padStart(2, '0'));
  if (!chunks.length) { console.error('usage: node finalize.mjs 01 [02 ...] [--dry]'); process.exit(2); }
  const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8'));
  const protectedIds = new Set([...plan.from_scratch, ...plan.batches.flatMap(b => b.ids)]);
  const load = async f => (fs.existsSync(f) ? await import(pathToFileURL(f).href) : null);

  const agreed = [], adjudicated = [], unsure = [], problems = [];
  const writes = [];
  for (const c of chunks) {
    const cmp = JSON.parse(fs.readFileSync(path.join(HERE, 'drafts', 'compare', `chunk-${c}.json`), 'utf8'));
    const A = (await load(path.join(HERE, 'drafts', 'A', `chunk-${c}.mjs`))).default;
    const fin = await load(path.join(HERE, 'drafts', 'final', `chunk-${c}.mjs`));
    const byUrl = m => new Map(Object.entries(m || {}).map(([u, v]) => [normalizeUrl(u), v]));
    const nA = byUrl(A), nF = byUrl(fin && fin.default), nM = byUrl(fin && fin.meta);
    for (const [id, v] of Object.entries(cmp)) {
      if (protectedIds.has(id)) { problems.push(`${id}: protected page (batch 1 or from-scratch), skipped`); continue; }
      const u = normalizeUrl(v.url);
      let draft, status, extra = {};
      if (v.status === 'agree') { draft = nA.get(u); status = 'agreed'; }
      else {
        draft = nF.get(u); status = 'adjudicated';
        if (!draft) { problems.push(`${id}: disputed but not adjudicated yet (chunk ${c})`); continue; }
        const m = nM.get(u) || { unsure: true, reasons: ['adjudicator gave no meta'] };
        extra = { adjudication: { unsure: !!m.unsure, reasons: m.reasons || [] } };
        if (m.unsure) unsure.push(id);
      }
      (status === 'agreed' ? agreed : adjudicated).push(id);
      writes.push({ id, draft, status, extra });
    }
  }
  const q = { seed, unsure, adjudicated_sample: sample(adjudicated.filter(i => !unsure.includes(i)), 0.2, seed), agreed_sample: sample(agreed, 0.1, seed) };
  console.log(`agreed ${agreed.length}, adjudicated ${adjudicated.length} (${unsure.length} flagged unsure)`);
  console.log(`human review queue: ${q.unsure.length} unsure + ${q.adjudicated_sample.length} adjudicated sample + ${q.agreed_sample.length} agreed spot-check = ${q.unsure.length + q.adjudicated_sample.length + q.agreed_sample.length} pages`);
  if (problems.length) console.log('\nproblems:\n' + problems.map(p => ' - ' + p).join('\n'));
  if (args.dry) process.exit(problems.length ? 1 : 0);

  for (const { id, draft, status, extra } of writes) {
    const f = path.join(DEFAULT_DIR, id, 'gold.json');
    const cur = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (['reviewed', 'second_look'].includes(cur.review_status)) { console.error(`skipping ${id}: already ${cur.review_status}`); continue; }
    const next = { ...cur, ...draft, review_status: status, from_scratch: false, drafted_by: status === 'agreed' ? 'claude x2 (agreed)' : 'claude x2 + adjudicator', ...extra };
    delete next.labeler; delete next.labeled_at;
    if (status === 'agreed') delete next.adjudication;
    fs.writeFileSync(f, JSON.stringify(next, null, 2) + '\n');
  }
  const qf = path.join(HERE, 'drafts', 'final', 'review-queue.json');
  const prev = fs.existsSync(qf) ? JSON.parse(fs.readFileSync(qf, 'utf8')) : { chunks: [] };
  const merged = { seed, chunks: [...new Set([...(prev.chunks || []), ...chunks])].sort() };
  for (const k of ['unsure', 'adjudicated_sample', 'agreed_sample']) merged[k] = [...new Set([...(prev[k] || []), ...q[k]])];
  fs.writeFileSync(qf, JSON.stringify(merged, null, 2) + '\n');
  console.log(`wrote ${writes.length} gold.json file(s) and drafts/final/review-queue.json`);
  if (problems.length) process.exit(1);
}
