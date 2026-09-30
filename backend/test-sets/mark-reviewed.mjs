// Mark labels as human-reviewed.
//   node mark-reviewed.mjs --batch 1 --labeler david [--status reviewed|second_look] [--except id,id]
//   node mark-reviewed.mjs --ids id1,id2 --labeler david
// Run only after the person has actually checked the labels. Refuses labels that still have check problems.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, parseArgs, isMain } from './lib.mjs';
import { checkLabels } from './check-labels.mjs';

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.labeler) { console.error('--labeler is required (who did the review)'); process.exit(2); }
  const status = args.status || 'reviewed';
  const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8'));
  const except = new Set(String(args.except || '').split(',').filter(Boolean));
  const ids = (args.ids ? String(args.ids).split(',') : (plan.batches.find(b => b.n === Number(args.batch)) || { ids: [] }).ids).filter(id => !except.has(id));
  if (!ids.length) { console.error('no pages selected (use --batch N or --ids)'); process.exit(2); }

  const { problems } = checkLabels(DEFAULT_DIR);
  const bad = problems.filter(p => ids.includes(p.id));
  if (bad.length) { console.error('refusing: these labels still have problems:\n' + bad.map(p => `  ${p.id}: ${p.message}`).join('\n')); process.exit(1); }

  const today = new Date().toISOString().slice(0, 10);
  for (const id of ids) {
    const f = path.join(DEFAULT_DIR, id, 'gold.json');
    const g = JSON.parse(fs.readFileSync(f, 'utf8'));
    fs.writeFileSync(f, JSON.stringify({ ...g, review_status: status, labeler: args.labeler, labeled_at: today }, null, 2) + '\n');
  }
  console.log(`marked ${ids.length} label(s) ${status} by ${args.labeler} on ${today}.`);
}
