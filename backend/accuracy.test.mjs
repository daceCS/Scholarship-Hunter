// Accuracy check: questionnaire answers -> avatar -> normalized profile -> match engine, scored against
// expectations a human derived by reading each scholarship's rules and source quotes (NOT from engine output).
// This tests the whole mapping chain (answer ids/values, derived fields, withheld, phases, operators), not just the operators.
//
// Expected values: 'eligible' | 'possible' | 'ineligible', or '!ineligible' (anything but ineligible).
// Keys match a scholarship by name prefix; 'Name@30000' also pins amount.max (two Truman entries exist).
// Run: npm run test:accuracy   (exit 1 on any mismatch)

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadScholarships, evaluateScholarship, filter } from './match.mjs';
import { normalizeAvatar } from './profile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const qdir = path.join(here, '../questionnaire');

// Load the questionnaire's own data/schema/avatar scripts so personas go through the real avatar builder.
const ctx = vm.createContext({});
ctx.window = ctx;
for (const f of ['data.js', 'schema.js', 'avatar.js']) vm.runInContext(fs.readFileSync(path.join(qdir, f), 'utf8'), ctx, { filename: f });
const TW = ctx.TW;

// A phase counts as completed once the next phase's first screen was visited (see avatar.js phasesCompleted).
const firstOf = id => TW.screens.find(s => s.phase === id).id;
const VISITED = {
  core: { [firstOf('branch')]: true },
  branch: { [firstOf('branch')]: true, [firstOf('sensitive')]: true },
  all: Object.fromEntries(TW.screens.map(s => [s.id, true])),
  none: {},
};

function avatarFor(p) {
  return TW.buildAvatar(p.answers, new Set(p.withheld || []), { id: 'test', updated: 0, visited: VISITED[p.completed] });
}

const NAVY_VET = [{ who: 'self', branch: 'navy', status: 'veteran' }];
const UCSD_EE = {
  'edu.status': 'undergrad', 'edu.year': '3', 'edu.enrollment': 'full_time', 'edu.institution': 'University of California, San Diego',
  'edu.major': ['Electrical Engineering'], 'edu.gpa': 3.5, 'edu.gpa_scale': 'unweighted',
  'geo.current': 'La Jolla, CA', 'geo.zip': '92093', 'id.citizenship': 'us_citizen', 'consent.sensitive': true,
  'affil.military': 'yes', 'affil.military.detail': NAVY_VET,
};

const PERSONAS = [
  {
    name: 'HS senior, San Diego, strong GPA, citizen (questionnaire fully done)',
    completed: 'all',
    answers: {
      'edu.status': 'hs_senior', 'edu.gpa': 3.8, 'edu.gpa_scale': 'unweighted', 'edu.major': ['Undecided'],
      'geo.current': 'San Diego, CA', 'geo.zip': '92127', 'geo.hs': 'Rancho Bernardo High School',
      'id.citizenship': 'us_citizen', 'consent.sensitive': true,
    },
    expect: {
      'Alfred Steele': 'possible', 'Burger King': 'eligible', "Nancy E. O'Malley": 'ineligible', 'SDLRLA': 'possible',
      'OC ABOTA': 'possible', 'The Epilepsy Foundation': 'possible', 'NAIF': 'possible', 'Rotary Club of Rancho Bernardo': 'eligible',
      'Downtown San Diego Lions': 'possible', 'The Amazon Future Engineer': 'possible',
      'San Diego Education Fund Teacher': 'possible', 'San Diego Education Fund STEM': 'possible', 'The San Diego Pride': 'possible',
      'Dryer Family': 'ineligible', 'SDSU Memorial': 'ineligible', 'The American Legion District 22': 'possible',
      'Jim and Lisa Givens': 'possible', 'Eldred G. Mugford': 'possible', 'SDSU Veterans': 'ineligible', 'Coca-Cola Scholars': 'possible',
      'Sequoia Award': 'possible', 'Harry S. Truman Scholarship@0': 'ineligible', 'Harry S. Truman Scholarship@30000': 'ineligible',
      'Alan Turing': 'possible', 'Gregory A. Chauncey': 'ineligible', 'Military Veteran Scholarships': 'possible',
      'American Chemical Society': 'possible', 'Union Plus': 'possible',
    },
  },
  {
    name: 'UCSD electrical-engineering junior, Navy veteran (questionnaire fully done)',
    completed: 'all',
    answers: UCSD_EE,
    expect: {
      'Alfred Steele': 'possible', 'Burger King': 'ineligible', "Nancy E. O'Malley": 'ineligible', 'SDLRLA': 'ineligible',
      'OC ABOTA': 'ineligible', 'The Epilepsy Foundation': 'possible', 'SWE Endowment': 'ineligible', 'Sharon Cascadden': 'ineligible',
      'SWE-LA Section': 'ineligible', 'SWE-LA Volunteer': 'ineligible', 'NAIF': 'possible', 'Rotary Club of Rancho Bernardo': 'ineligible',
      'Downtown San Diego Lions': 'possible', 'The Amazon Future Engineer': 'possible',
      'San Diego Education Fund Teacher': 'possible', 'San Diego Education Fund STEM': 'possible', 'The San Diego Pride': 'possible',
      'Dryer Family': 'ineligible', 'SDSU Memorial': 'ineligible', 'The American Legion District 22': 'possible',
      'Jim and Lisa Givens': 'ineligible', 'Eldred G. Mugford': 'possible', 'SDSU Veterans': 'ineligible', 'Coca-Cola Scholars': 'ineligible',
      'Sequoia Award': 'possible', 'Harry S. Truman Scholarship@0': 'possible', 'Harry S. Truman Scholarship@30000': 'possible',
      'Alan Turing': 'possible', 'Gregory A. Chauncey': 'eligible', 'Military Veteran Scholarships': 'possible',
      'American Chemical Society': 'ineligible', 'Union Plus': 'possible',
    },
  },
  {
    name: 'SDSU accounting grad student, citizenship withheld',
    completed: 'all',
    withheld: ['id.citizenship'],
    answers: {
      'edu.status': 'grad', 'edu.year': '1', 'edu.enrollment': 'full_time', 'edu.institution': 'San Diego State University',
      'edu.major': ['Accounting'], 'edu.gpa': 3.4, 'geo.current': 'San Diego, CA', 'geo.zip': '92115', 'consent.sensitive': true,
    },
    expect: {
      'Burger King': 'ineligible', "Nancy E. O'Malley": 'ineligible', 'SDLRLA': 'ineligible', 'OC ABOTA': 'ineligible',
      'SWE Endowment': 'ineligible', 'Dryer Family': 'ineligible', 'SDSU Memorial': 'ineligible', 'Jim and Lisa Givens': 'possible',
      'SDSU Veterans': 'ineligible', 'Coca-Cola Scholars': 'ineligible', 'Harry S. Truman Scholarship@30000': 'ineligible',
      'Gregory A. Chauncey': 'ineligible', 'American Chemical Society': 'ineligible',
    },
  },
  {
    name: 'Same UCSD veteran, but declined to share military details',
    completed: 'all',
    withheld: ['affil.military'],
    answers: { ...UCSD_EE, 'affil.military': undefined, 'affil.military.detail': undefined },
    expect: { 'Gregory A. Chauncey': 'possible', 'SDSU Veterans': 'ineligible', 'Harry S. Truman Scholarship@30000': 'possible' },
  },
  {
    name: 'Same UCSD veteran, but only the core phase finished (branch not reached)',
    completed: 'core',
    answers: { ...UCSD_EE, 'affil.military': undefined, 'affil.military.detail': undefined },
    expect: { 'Gregory A. Chauncey': 'possible', 'Burger King': 'possible', 'SDSU Veterans': 'ineligible', 'Dryer Family': 'ineligible' },
  },
  {
    name: 'Only a ZIP code entered (nothing else answered): must never rule anything out',
    completed: 'none',
    answers: { 'geo.zip': '94105' },
    expect: Object.fromEntries(['Burger King', 'Rotary Club', 'Coca-Cola', 'Dryer Family', 'SDSU Memorial', 'SDSU Veterans', 'Gregory A. Chauncey',
      'American Chemical Society', 'Harry S. Truman Scholarship@30000', 'SDLRLA', "Nancy E. O'Malley", 'Alfred Steele'].map(k => [k, '!ineligible'])),
  },
];

const scholarships = loadScholarships();
const pick = key => {
  const [prefix, amt] = key.split('@');
  return scholarships.filter(s => s.name.startsWith(prefix) && (amt === undefined || (s.amount?.max || 0) === Number(amt)));
};

const cm = {}; // confusion: expected -> got
let cells = 0, agree = 0;
const hid = [], over = [], other = [];
for (const p of PERSONAS) {
  const profile = normalizeAvatar(avatarFor(p));
  console.log(`\n${p.name}`);
  const bad = [];
  for (const [key, expected] of Object.entries(p.expect)) {
    const matched = pick(key);
    if (!matched.length) { console.log(`  ! expectation key matches no scholarship: ${key}`); process.exitCode = 1; continue; }
    for (const s of matched) {
      const got = evaluateScholarship(profile, s);
      const ok = expected === '!ineligible' ? got !== 'ineligible' : got === expected;
      cells++; if (ok) agree++;
      const tag = expected === '!ineligible' ? 'not-ineligible' : expected;
      (cm[tag] ||= {})[got] = (cm[tag][got] || 0) + 1;
      if (!ok) {
        bad.push(`  ✗ ${s.name.slice(0, 48)}: expected ${expected}, got ${got}`);
        const rec = `${p.name.slice(0, 30)} / ${s.name.slice(0, 40)} (${expected} -> ${got})`;
        if (got === 'ineligible') hid.push(rec); else if (got === 'eligible') over.push(rec); else other.push(rec);
      }
    }
  }
  console.log(bad.length ? bad.join('\n') : '  all expectations met');
  // informational: what the API would serve for this profile on a fixed date (closed/too-small/wrong-level are dropped)
  const served = filter(profile, scholarships, Date.parse('2026-09-30'));
  const st = served.map(s => evaluateScholarship(profile, s));
  console.log(`  served on 2026-09-30: ${st.filter(x => x === 'eligible').length} eligible, ${st.filter(x => x === 'possible').length} possible (of ${scholarships.length})`);
}

console.log('\n' + '═'.repeat(70));
console.log(`Agreement: ${agree}/${cells} cells (${(100 * agree / cells).toFixed(1)}%)`);
console.log('Confusion (rows: expected, columns: engine):');
for (const [e, row] of Object.entries(cm)) console.log(`  ${e.padEnd(15)} ${Object.entries(row).map(([g, n]) => `${g}:${n}`).join('  ')}`);
console.log(`Hid a real match (expected eligible/possible, engine says ineligible): ${hid.length}`);
hid.forEach(x => console.log('   - ' + x));
console.log(`Over-promised (expected ineligible/possible, engine says eligible): ${over.length}`);
over.forEach(x => console.log('   - ' + x));
console.log(`Other disagreements (eligible <-> possible): ${other.length}`);
other.forEach(x => console.log('   - ' + x));
if (agree !== cells) process.exitCode = 1;
else console.log('PASS');
