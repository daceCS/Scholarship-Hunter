// Contract checks. Run: node check.mjs
//  1. Fixtures validate against scholarship.schema.json.
//  2. Every rule points at a real, eligibility-role vocabulary field with a legal op and legal values.
//  3. Drift: the avatar the frontend actually builds (questionnaire/avatar.js) only uses paths and enum
//     values that vocabulary.json knows about, and every asked field is reachable from the questionnaire.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import { checkRules } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = p => fs.readFileSync(path.join(here, p), 'utf8');
const vocab = JSON.parse(read('vocabulary.json'));
const byPath = new Map(vocab.fields.map(f => [f.path, f]));
const errors = [];
const err = m => errors.push(m);

// 1. schema
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(JSON.parse(read('scholarship.schema.json')));
const fixtures = JSON.parse(read('fixtures/scholarships.json'));
fixtures.forEach((s, i) => {
  if (!validate(s)) err(`fixture[${i}] ${s.name}: ${ajv.errorsText(validate.errors)}`);
});

// 2. rules vs vocabulary
fixtures.forEach((s, i) => checkRules(s, vocab, `fixture[${i}]`).forEach(err));

// 3. drift against the real frontend
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['data.js', 'schema.js', 'avatar.js']) {
  vm.runInContext(fs.readFileSync(path.join(here, '../../questionnaire', f), 'utf8'), ctx, { filename: f });
}
const TW = ctx.TW;
const pick = (opts, k) => { const o = typeof opts === 'function' ? opts({}) : opts; return o && o.length ? o[k % o.length].v : undefined; };
const sample = (q, k) => {
  const fieldVal = f => f.type === 'multi' ? [pick(f.options, k)] : f.options ? pick(f.options, k) : 'x';
  switch (q.type) {
    case 'single': return pick(q.options, k);
    case 'multi': return q.options && q.options.length ? [pick(q.options, k), pick(q.options, k + 1)] : ['x'];
    case 'bool': case 'flag': return true;
    case 'number': return Math.max(q.min ?? 1, 1);
    case 'date': return '2028-05';
    case 'long_text': return 'a, b';
    case 'group': return [Object.fromEntries(q.fields.map(f => [f.key, fieldVal(f)]))];
    case 'autocomplete': if (q.id === 'geo.current') return 'Fallbrook, CA'; return q.multiple ? ['x'] : 'x';
    case 'note': return undefined;
    default: return 'x';
  }
};
const seen = new Set();
const leaves = (o, prefix, out) => {
  if (Array.isArray(o)) {
    if (o.length && typeof o[0] === 'object') o.forEach(e => leaves(e, prefix + '[]', out));
    else out.push([prefix, o]);
  } else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) leaves(v, prefix ? `${prefix}.${k}` : k, out);
  } else out.push([prefix, o]);
  return out;
};
const META = new Set(['avatar_id', 'version', 'updated_at']);
const enumBad = new Set();
for (let k = 0; k < 8; k++) {
  const A = {};
  for (const q of TW.questions) { const v = sample(q, k); if (v !== undefined) A[q.id] = v; }
  A['edu.gpa_scale'] = 'weighted';
  const W = new Set(k === 0 ? [] : ['id.lgbtq', 'circ.housing']);
  const allVisited = Object.fromEntries(TW.screens.map(s => [s.id, true]));
  const avatar = TW.buildAvatar(A, W, { id: 'x', updated: 0, visited: allVisited });
  for (const [p, v] of leaves(avatar, '', [])) {
    const clean = p.replace(/\.withheld$/, '.withheld');
    if (META.has(p) || clean.endsWith('.withheld')) {
      if (clean.endsWith('.withheld')) [].concat(v).forEach(key => seen.add(`withheld:${clean.split('.')[0]}:${key}`));
      continue;
    }
    const f = byPath.get(p);
    if (!f) { err(`drift: avatar emits "${p}" but vocabulary.json has no such field`); continue; }
    seen.add(p);
    if (f.values && !f.open) {
      for (const x of [].concat(v)) if (typeof x === 'string' && !f.values.includes(x)) enumBad.add(`drift: ${p} emits "${x}" not in vocabulary values`);
    }
  }
}
enumBad.forEach(err);
for (const f of vocab.fields) {
  if (f.source === 'asked' && !seen.has(f.path)) err(`drift: vocabulary field "${f.path}" is never emitted by avatar.js`);
  if (f.withheld_key) {
    const tail = q => q.id.replace(/^([a-z]+)\./, '');
    const keys = q => [tail(q), ...(q.fields || []).map(x => tail(q).replace(/\.detail$/, '') + '.' + x.key)];
    const ok = TW.questions.some(q => keys(q).includes(f.withheld_key) && (q.skippable || q.screen.sensitive || q.type === 'bool' || q.fields));
    if (!ok) err(`withheld_key "${f.withheld_key}" on ${f.path} matches no skippable question id`);
  }
}

// phases_completed and sub-field withheld behavior
const base = { 'consent.sensitive': true, 'affil.military.detail': [{ who: 'parent', disability_rating: 'skip', killed_or_wounded: 'no' }] };
const build = (A, visited) => TW.buildAvatar(A, new Set(), { id: 'x', updated: 0, visited });
const allV = Object.fromEntries(TW.screens.map(s => [s.id, true]));
const eq = (a, b, m) => JSON.stringify(a) === JSON.stringify(b) || err(`${m}: got ${JSON.stringify(a)}`);
eq(build(base, allV).phases_completed, ['core', 'branch', 'sensitive', 'history'], 'all visited + consent');
eq(build({ ...base, 'consent.sensitive': false }, allV).phases_completed, ['core', 'branch', 'history'], 'no consent drops sensitive');
eq(build(base, { welcome: true, results: true }).phases_completed, undefined, 'stopped at results: core not yet passed');
eq(build(base, { welcome: true, results: true, 'affil-employer': true, consent: true }).phases_completed, ['core', 'branch'], 'reached consent');
eq(build(base, allV).affiliations.withheld, ['military.disability_rating'], 'military sub-field skip is withheld');
eq(build(base, allV).affiliations.military[0].killed_or_wounded, false, 'explicit no is kept');

if (errors.length) {
  console.error(`FAIL, ${errors.length} problem(s):\n` + errors.map(e => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`OK: ${fixtures.length} fixtures valid, ${vocab.fields.length} vocabulary fields match the frontend avatar.`);
