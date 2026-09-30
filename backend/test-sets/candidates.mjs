// Build candidates.tsv from candidates.src.txt and print a summary by stratum.
//   node candidates.mjs
// Source lines:  url | page_type | source_type | geo | note      ('#' comments, blank lines ignored)
//   page_type: single | listing | not_scholarship | pdf_form | hard   (a hint only; the label decides)
//   geo:       san_diego | california | national
// Edit candidates.src.txt to strike or add rows, then rerun. Output is what snapshot.mjs reads.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, normalizeUrl } from './lib.mjs';

const src = path.join(HERE, 'candidates.src.txt');
const rows = [];
const seen = new Set();
const dups = [];
const bad = [];

for (const [i, raw] of fs.readFileSync(src, 'utf8').split(/\r?\n/).entries()) {
  const line = raw.replace(/^\s*#.*$/, '').trim();
  if (!line) continue;
  const [url, page_type = '', source_type = '', geo = '', ...note] = line.split('|').map(s => s.trim());
  let key;
  try { key = normalizeUrl(url); } catch { bad.push(`line ${i + 1}: not a URL: ${url}`); continue; }
  if (seen.has(key)) { dups.push(url); continue; }
  seen.add(key);
  rows.push({ url: key, page_type, source_type, geo, note: note.join(' | ') });
}

const GEO = ['san_diego', 'california', 'national'];
const PT = ['single', 'listing', 'not_scholarship', 'pdf_form', 'hard', ''];
rows.forEach(r => {
  if (!GEO.includes(r.geo)) bad.push(`bad geo "${r.geo}": ${r.url}`);
  if (!PT.includes(r.page_type)) bad.push(`bad page_type "${r.page_type}": ${r.url}`);
});

fs.writeFileSync(path.join(HERE, 'candidates.tsv'), rows.map(r => [r.url, r.page_type === 'hard' ? '' : r.page_type, r.source_type, r.geo, r.note].join('\t')).join('\n') + '\n');

const count = k => rows.reduce((m, r) => (m[r[k] || '(unset)'] = (m[r[k] || '(unset)'] || 0) + 1, m), {});
const target = { single: 210, listing: 52, not_scholarship: 41, pdf_form: 29, hard: 18 };
console.log(`${rows.length} candidates (${dups.length} duplicate(s) dropped)`);
const pt = count('page_type');
console.log('\npage_type      have / target');
for (const [k, t] of Object.entries(target)) console.log(`  ${k.padEnd(14)} ${String(pt[k] || 0).padStart(3)} / ${t}`);
if (pt['(unset)']) console.log(`  (unset)        ${pt['(unset)']}`);
const g = count('geo');
console.log('\ngeo            have / target');
for (const [k, t] of Object.entries({ san_diego: 140, california: 88, national: 122 })) console.log(`  ${k.padEnd(14)} ${String(g[k] || 0).padStart(3)} / ${t}`);
console.log('\nsource_type', JSON.stringify(count('source_type')));
if (dups.length) console.log('\nduplicates dropped:\n' + dups.map(d => '  ' + d).join('\n'));
if (bad.length) { console.error('\nproblems:\n' + bad.map(b => '  ' + b).join('\n')); process.exit(1); }
