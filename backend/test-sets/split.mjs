// Choose the final 300 pages and split them into dev (100) and locked test (200).
//   node split.mjs [--seed scholarship-hunter-1] [--dry]     (--dry prints the plan and writes nothing)
// Refuses to run again once split-lock.json exists (--force overrides; that invalidates the test set).
//
// Selection: keeps every page except the surplus in over-target types. Stale documents and national pages are
//            dropped first; duplicate-test pages are protected.
// Split:     by PROVIDER GROUP, not by page. A provider's pages, or one award listed on several sites, always land
//            in the same split. Otherwise tuning on dev would leak into test. Groups are assigned greedily so that
//            every (page type x geography) cell splits about 1/3 dev, 2/3 test.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HERE, DEFAULT_DIR, readManifest, writeManifest, normalizeUrl, parseArgs, isMain } from './lib.mjs';

export const TARGET = { total: 300, dev: 100, drop: { pdf_form: 6, not_scholarship: 7, unset: 5 } };
const LOCK = path.join(HERE, 'split-lock.json');

const hash = (seed, s) => parseInt(crypto.createHash('sha1').update(seed + ':' + s).digest('hex').slice(0, 8), 16);

// Pages that describe the same program or provider on different sites share a group.
const MERGES = [
  ['sdf', /sdfoundation\.org|scholarshipamerica\.org\/scholarship\/sandiegofoundation|ucsd\.academicworks\.com\/opportunities\/6022/],
  ['soroptimist', /soroptimist\.org|academicworks\.com\/opportunities\/5822|expo\.uw\.edu\/expo\/scholarships\/sorodream/],
  ['svcf', /svcf\.org|sjsu\.academicworks\.com\/opportunities\/251|fhda\.academicworks\.com\/opportunities\/(6541|2011|9884)/],
  ['girlscouts', /girlscouts\.org/],
  ['escondido-chamber', /escondidochamber\.org|greaterescondido\.org/],
  ['car', /car\.org|csun\.edu\/blaw|cdaronline\.org/],
  ['cocacola', /coca-colascholarsfoundation|academicworks\.com\/opportunities\/4895/],
  ['asce', /asce\.org|expo\.uw\.edu\/expo\/scholarships\/asce/],
  ['amazon-fe', /amazonfutureengineer|scholarshipamerica\.org\/scholarship\/amazonfutureengineer/],
  ['apcf', /apcf\.org|financialaid\.ucdavis\.edu\/scholarships\/asian-pacific/],
  ['sharp-sdsu', /sdsu\.academicworks\.com\/opportunities\/(7628|14460)/],
  ['kiwanis-sd', /kiwanissandiego|sandiegokiwanisclubfoundation|csusm\.academicworks\.com\/opportunities\/906/],
  ['scottish-rite', /scottishrite|coronadousd\.net/],
  ['sd-lions', /sandiegolions\.org|cdnsm5-ss18\.sharpschool\.com/],
  ['horatio-alger', /horatioalger\.org/],
  ['elks', /elks\.org|elks1108|alamedaelks|sanmateoelks|chea-elks|sandiegoelks/],
  ['vfw', /vfw/],
  ['kofc', /kofc\.org|kc4678\.com/],
  ['uaw', /uaw\.org/],
  ['csac', /csac\.ca\.gov/],
  ['nhsc', /hrsa\.gov/],
  ['gates', /thegatesscholarship\.org/],
  ['dell', /dellscholars\.org/],
  ['ibew-1245', /ibew1245\.com/],
  ['teamsters-jc', /teamster\.org|teamsters542\.org/],
  ['palomar', /palomar\.edu/],
  ['miracosta', /miracosta\.edu/],
  ['usd', /sandiego\.edu/],
  ['hsf', /hsf\.net/]
];
const PORTAL = /academicworks\.com|sites\.google\.com|mykaleidoscope\.com/;   // one page = one group unless merged

export function groupOf(url) {
  for (const [name, re] of MERGES) if (re.test(url)) return name;
  const u = new URL(url);
  return PORTAL.test(u.host) ? u.host + u.pathname : u.host.replace(/^www\./, '');
}

/* notes from candidates.src.txt, keyed by normalized URL */
function readNotes() {
  const f = path.join(HERE, 'candidates.src.txt');
  const notes = new Map();
  if (!fs.existsSync(f)) return notes;
  for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#') || !l.includes('|')) continue;
    const [url, , , , ...n] = l.split('|').map(s => s.trim());
    try { notes.set(normalizeUrl(url), n.join(' | ')); } catch { /* skip */ }
  }
  return notes;
}

const typeOf = r => r.page_type || 'unset';
const isStale = note => /stale|old year|prior year|older|likely expired|very old|dead-link|2012|2021|2023/i.test(note);

export function plan(rows, notes, seed) {
  const info = new Map(rows.map(r => [r.id, { group: groupOf(r.url), note: notes.get(normalizeUrl(r.url)) || '' }]));
  const groupSize = {};
  for (const i of info.values()) groupSize[i.group] = (groupSize[i.group] || 0) + 1;

  // ---- selection ----
  const dropped = new Map();
  for (const [type, n] of Object.entries(TARGET.drop)) {
    const pool = rows.filter(r => typeOf(r) === type).map(r => {
      const i = info.get(r.id);
      const protectedPage = /duplicate test|overlaps/i.test(i.note) || groupSize[i.group] > 1 && MERGES.some(([g]) => g === i.group);
      const score = (isStale(i.note) ? 100 : 0) + (r.geo === 'national' ? 10 : 0) + (protectedPage ? -1000 : 0);
      return { r, score, h: hash(seed, r.id) };
    }).sort((a, b) => b.score - a.score || a.h - b.h);
    pool.slice(0, n).forEach(x => dropped.set(x.r.id, isStale(info.get(x.r.id).note) ? 'stale document' : 'surplus of an over-target page type'));
  }
  const selected = rows.filter(r => !dropped.has(r.id));

  // ---- split by group ----
  const cells = r => [`${typeOf(r)}|${r.geo}`, `src|${r.source_type}`, `type|${typeOf(r)}`, `type|${typeOf(r)}`];
  const groups = {};
  for (const r of selected) (groups[info.get(r.id).group] ||= []).push(r);
  const n = {}, N = selected.length;
  selected.forEach(r => cells(r).forEach(c => n[c] = (n[c] || 0) + 1));
  const dev = { ALL: 0 }, test = { ALL: 0 };
  const assign = {};
  const devFrac = TARGET.dev / N;
  const cost = (side, add, frac) => Object.entries(add).reduce((s, [c, k]) => {
    const want = (c === 'ALL' ? N : n[c]) * frac, have = side[c] || 0;
    return s + ((have + k - want) ** 2 - (have - want) ** 2) * (c === 'ALL' ? 4 : 1);
  }, 0);
  const order = Object.entries(groups).sort((a, b) => b[1].length - a[1].length || hash(seed, a[0]) - hash(seed, b[0]));
  for (const [g, rs] of order) {
    const add = { ALL: rs.length };
    rs.forEach(r => cells(r).forEach(c => add[c] = (add[c] || 0) + 1));
    const toDev = cost(dev, add, devFrac) < cost(test, add, 1 - devFrac) || (cost(dev, add, devFrac) === cost(test, add, 1 - devFrac) && hash(seed, g) % 3 === 0);
    const side = toDev ? dev : test;
    for (const [c, k] of Object.entries(add)) side[c] = (side[c] || 0) + k;
    assign[g] = toDev ? 'dev' : 'test';
  }
  // nudge to exactly TARGET.dev using the smallest groups
  const size = g => groups[g].length;
  for (let guard = 0; guard < 500; guard++) {
    const devN = Object.entries(assign).filter(([, s]) => s === 'dev').reduce((a, [g]) => a + size(g), 0);
    const diff = devN - TARGET.dev;
    if (diff === 0) break;
    const from = diff > 0 ? 'dev' : 'test', to = diff > 0 ? 'test' : 'dev';
    const cand = Object.keys(assign).filter(g => assign[g] === from && size(g) <= Math.abs(diff)).sort((a, b) => size(b) - size(a) || hash(seed, a) - hash(seed, b));
    if (!cand.length) break;
    assign[cand[0]] = to;
  }
  return { info, dropped, selected, assign, groups };
}

export function summarize({ selected, assign, info, dropped }, rows) {
  const L = [];
  const split = r => assign[info.get(r.id).group];
  const count = (rs, k) => rs.reduce((a, r) => (a[k(r)] = (a[k(r)] || 0) + 1, a), {});
  const devR = selected.filter(r => split(r) === 'dev'), testR = selected.filter(r => split(r) === 'test');
  L.push(`Selected ${selected.length} of ${rows.length} usable pages (dropped ${dropped.size}).  dev ${devR.length}  test ${testR.length}`);
  for (const [label, k] of [['page type', typeOf], ['geography', r => r.geo], ['source type', r => r.source_type]]) {
    const all = count(selected, k), d = count(devR, k), t = count(testR, k);
    L.push(`\n${label.padEnd(24)} total   dev  test`);
    Object.keys(all).sort().forEach(x => L.push(`  ${String(x).padEnd(22)} ${String(all[x]).padStart(4)}  ${String(d[x] || 0).padStart(4)}  ${String(t[x] || 0).padStart(4)}`));
  }
  const big = Object.entries(count(selected, r => info.get(r.id).group)).sort((a, b) => b[1] - a[1]).slice(0, 6);
  L.push('\nLargest provider groups (kept whole in one split): ' + big.map(([g, n]) => `${g} ${n}->${assign[g]}`).join(', '));
  const portal = selected.filter(r => /academicworks/.test(r.url));
  L.push(`Portal-template pages: ${portal.length} total, ${portal.filter(r => split(r) === 'dev').length} dev / ${portal.filter(r => split(r) === 'test').length} test`);
  L.push('\nDropped: ' + [...dropped].map(([id, why]) => `${rows.find(r => r.id === id).url.slice(0, 70)} (${why})`).join('\n         '));
  return L.join('\n');
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const seed = args.seed || 'scholarship-hunter-1';
  if (fs.existsSync(LOCK) && !args.force && !args.dry) { console.error('split-lock.json exists: the split is frozen. (--force would invalidate the test set.)'); process.exit(1); }
  const dir = args.dir || DEFAULT_DIR;
  const manifest = readManifest(dir);
  const rows = manifest.filter(r => r.status === 200);
  const p = plan(rows, readNotes(), seed);
  console.log(summarize(p, rows));
  if (args.dry) process.exit(0);

  const { info, dropped, assign } = p;
  for (const r of manifest) {
    if (r.status !== 200) continue;
    r.group = info.get(r.id).group;
    if (dropped.has(r.id)) { r.selected = false; r.dropped_reason = dropped.get(r.id); delete r.split; }
    else { r.selected = true; r.split = assign[r.group]; delete r.dropped_reason; }
  }
  writeManifest(dir, manifest);
  const ids = s => manifest.filter(r => r.selected && r.split === s).map(r => r.id).sort();
  fs.writeFileSync(LOCK, JSON.stringify({
    frozen_at: new Date().toISOString(), seed,
    rule: 'Split by provider group; dev is for tuning, test is locked and must not be viewed until an extractor is final.',
    counts: { dev: ids('dev').length, test: ids('test').length, dropped: dropped.size },
    dev: ids('dev'), test: ids('test'),
    dropped: [...dropped].map(([id, reason]) => ({ id, reason }))
  }, null, 2) + '\n');
  console.log('\nWrote split to pages/manifest.json and split-lock.json (commit the lock file).');
}
