// Two-draft comparison of two extractor runs (step 1 of the review flow).
//   node extract/compare-runs.mjs --a dev2-opus --b dev2-sonnet --name dev2
// Writes test-sets/predictions/compare-<name>.json: one entry per page, status "agree" or "review" (see
// test-sets/compare-drafts.mjs for what counts as a real disagreement; wording, quotes and style are ignored).
import fs from 'node:fs';
import path from 'node:path';
import { compareDrafts } from '../test-sets/compare-drafts.mjs';
import { HERE, readManifest, DEFAULT_DIR, parseArgs } from '../test-sets/lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.a || !args.b || !args.name) { console.error('usage: node extract/compare-runs.mjs --a <run> --b <run> --name <name>'); process.exit(2); }
const dirOf = r => path.join(HERE, 'predictions', r);
const ids = id => fs.readdirSync(dirOf(id)).filter(f => f.endsWith('.json') && f !== '_run.json').map(f => f.slice(0, -5));
const both = ids(args.a).filter(id => fs.existsSync(path.join(dirOf(args.b), id + '.json')));
const urls = new Map(readManifest(DEFAULT_DIR).map(r => [r.id, r.url]));

const out = {};
const byField = {};
for (const id of both) {
  const a = JSON.parse(fs.readFileSync(path.join(dirOf(args.a), id + '.json'), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(dirOf(args.b), id + '.json'), 'utf8'));
  out[id] = { url: urls.get(id), ...compareDrafts(a, b) };
  for (const m of out[id].major) byField[m.field] = (byField[m.field] || 0) + 1;
}
fs.writeFileSync(path.join(dirOf(`compare-${args.name}`).replace(/compare-/, 'compare-') + '.json'), JSON.stringify(out, null, 2) + '\n');
const agree = Object.values(out).filter(v => v.status === 'agree').length;
console.log(`${both.length} pages compared (${args.a} vs ${args.b}): ${agree} agree (${Math.round(100 * agree / both.length)}%), ${both.length - agree} need a decision`);
console.log('what the disagreements are about:', JSON.stringify(Object.fromEntries(Object.entries(byField).sort((x, y) => y[1] - x[1]))));
console.log(`written: test-sets/predictions/compare-${args.name}.json`);
