// Load machine-extracted scholarships into Supabase, flagged as unverified, without wiping anything users rely on.
//   node extract/load-scholarships.mjs --run dev2-sonnet                 dry run: prints what would change
//   node extract/load-scholarships.mjs --run dev2-sonnet --write         applies it
// (repeat --run to load several prediction runs)
//
// Differences from the old loadScholarshipsToDb (which deleted every row and, through the matches cascade, every user's matches):
//  - updates/inserts by page_id, which is "<page id>#<award slug>" so one page can hold many awards;
//  - a row from an older load is replaced only when a newly extracted record has the same award name or comes from the same source page;
//  - records are stored with status "draft" and origin "crawler" in full_data (the API reports them as unverified);
//  - afterwards every user's latest profile is matched again, because replaced rows take their matches with them.
// Only pages whose extraction passed validation are used. Duplicate awards across pages keep the richer record.
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { initSupabase, matchProfile } from '../db.mjs';
import { normalizeAvatar } from '../profile.mjs';
import { HERE, parseArgs } from '../test-sets/lib.mjs';
import { allRules } from '../contract/lib.mjs';

const args = parseArgs(process.argv.slice(2), ['run']);
const runs = args.run || [];
if (!runs.length) { console.error('usage: node extract/load-scholarships.mjs --run <prediction run> [--run ...] [--write]'); process.exit(2); }
const write = !!args.write;

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'award';
const richness = s => allRules(s).length * 10 + (s.confidence || 0);

// 1) gather valid extracted records
const found = [];
let pagesUsed = 0, pagesSkipped = 0;
for (const run of runs) {
  const dir = path.join(HERE, 'predictions', run);
  const log = JSON.parse(fs.readFileSync(path.join(dir, '_run.json'), 'utf8')).pages || {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== '_run.json')) {
    const id = f.slice(0, -5);
    if (log[id] && !log[id].ok) { pagesSkipped++; continue; }          // failed validation: not loaded
    const pred = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!pred.is_scholarship_page || !(pred.scholarships || []).length) continue;
    pagesUsed++;
    for (const s of pred.scholarships) found.push({ pageId: id, s });
  }
}

// 2) dedupe by award name (keep the record with more rules, then higher confidence)
const byName = new Map();
const dropped = [];
for (const r of found) {
  const k = norm(r.s.name);
  const cur = byName.get(k);
  if (!cur) byName.set(k, r);
  else if (richness(r.s) > richness(cur.s)) { dropped.push(cur); byName.set(k, r); }
  else dropped.push(r);
}
const used = new Set();
let rows = [...byName.values()].map(({ pageId, s }) => {
  let key = `${pageId}#${slug(s.name)}`, n = 2;
  while (used.has(key)) key = `${pageId}#${slug(s.name)}-${n++}`;
  used.add(key);
  const full = { ...s, status: 'draft', origin: 'crawler' };
  return {
    page_id: key, name: s.name, provider_org: s.provider_org, apply_url: s.apply_url, source_url: s.source_url,
    amount: s.amount, deadline: s.deadline ?? null, cycle_status: s.cycle_status, geo_scope: s.geo_scope ?? null,
    levels: s.levels ?? null, effort: s.effort ?? null, eligibility: s.eligibility, provenance: s.provenance ?? null,
    verified_at: s.verified_at, confidence: Math.min(1, Math.max(0, Math.round((s.confidence ?? 0.5) * 100) / 100)), full_data: full,
  };
});

const supabase = initSupabase();
const { data: existing, error: exErr } = await supabase.from('scholarships').select('id, page_id, name, eligibility');
if (exErr) throw exErr;
// An existing record with more rules than the new one for the same award is kept as it is (the new extraction may have missed rules).
const keepOld = new Set(existing.filter(e => { const r = rows.find(x => norm(x.name) === norm(e.name)); return r && allRules(e).length > allRules(r).length; }).map(e => norm(e.name)));
rows = rows.filter(r => !keepOld.has(norm(r.name)));
if (keepOld.size) console.log(`keeping ${keepOld.size} existing record(s) that have more rules than the new extraction`);
const newNames = new Set(rows.map(r => norm(r.name)));
const newKeys = new Set(rows.map(r => r.page_id));
// An older row (page_id without '#') is superseded when an extracted record has the same award name OR comes from the same source page
// (the extractor may name the award slightly differently, and showing both would duplicate it).
const newPages = new Set(rows.map(r => r.page_id.split('#')[0]));
const replaced = existing.filter(e => !newKeys.has(e.page_id) && (newNames.has(norm(e.name)) || (!e.page_id.includes('#') && newPages.has(e.page_id))));
const kept = existing.length - replaced.length - existing.filter(e => newKeys.has(e.page_id)).length;

console.log(`pages used: ${pagesUsed} (skipped as invalid: ${pagesSkipped}); records found: ${found.length}; after removing ${dropped.length} duplicate(s): ${rows.length}`);
console.log(`database now: ${existing.length} rows. This load: upsert ${rows.length}, replace ${replaced.length} older row(s) for the same awards/pages, leave ${Math.max(kept, 0)} other row(s) alone.`);
if (!write) { console.log('\nDry run. Re-run with --write to apply (it also re-matches every user).'); process.exit(0); }

// 3) write (after saving the current rows, so the load can be undone by re-inserting them)
const backupFile = path.join(HERE, 'backups', `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}-scholarships-before-load.json`);
fs.mkdirSync(path.dirname(backupFile), { recursive: true });
const { data: before, error: bErr } = await supabase.from('scholarships').select('*');
if (bErr) throw bErr;
fs.writeFileSync(backupFile, JSON.stringify(before, null, 2));
console.log(`backed up ${before.length} existing row(s) to ${path.relative(process.cwd(), backupFile)}`);
// Not relying on a unique constraint on page_id (the live table may not have one): rows that already exist are
// updated by primary key, the rest are inserted.
const idByKey = new Map(existing.map(e => [e.page_id, e.id]));
const toUpdate = rows.filter(r => idByKey.has(r.page_id));
const toInsert = rows.filter(r => !idByKey.has(r.page_id));
for (let i = 0; i < toUpdate.length; i += 10) {       // id is GENERATED ALWAYS, so update row by row rather than upsert
  await Promise.all(toUpdate.slice(i, i + 10).map(async r => {
    const { error } = await supabase.from('scholarships').update(r).eq('id', idByKey.get(r.page_id));
    if (error) throw error;
  }));
}
for (let i = 0; i < toInsert.length; i += 50) {
  const { error } = await supabase.from('scholarships').insert(toInsert.slice(i, i + 50));
  if (error) throw error;
}
if (replaced.length) {
  const { error } = await supabase.from('scholarships').delete().in('id', replaced.map(r => r.id));   // cascades their matches; re-matched below
  if (error) throw error;
}
console.log(`upserted ${rows.length}, removed ${replaced.length} superseded row(s).`);

// 4) re-match every user's latest profile against the new set
const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, user_id, version, core_json, sensitive_json').order('version', { ascending: false });
if (pErr) throw pErr;
const latest = new Map();
for (const p of profiles) if (!latest.has(p.user_id)) latest.set(p.user_id, p);
let n = 0;
for (const p of latest.values()) {
  await supabase.from('matches').delete().eq('profile_id', p.id);          // drop stale rows so removed/ineligible matches disappear
  await matchProfile(supabase, p.id, normalizeAvatar({ ...p.core_json, ...(p.sensitive_json || {}) }));
  n++;
}
console.log(`re-matched ${n} user profile(s).`);
