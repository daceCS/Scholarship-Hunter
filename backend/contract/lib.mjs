// Shared contract helpers. Used by check.mjs and by backend/test-sets tooling.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const contractPath = p => path.join(here, p);
export const loadVocab = () => JSON.parse(fs.readFileSync(contractPath('vocabulary.json'), 'utf8'));
export const loadScholarshipSchema = () => JSON.parse(fs.readFileSync(contractPath('scholarship.schema.json'), 'utf8'));

/* Checks every rule of one scholarship against the vocabulary: field exists and is usable in rules,
   op is legal for the field type, enum values are legal. Returns a list of error strings.
   JSON Schema can't express this, so it lives here. */
export function checkRules(s, vocab, where = 'scholarship') {
  const byPath = new Map(vocab.fields.map(f => [f.path, f]));
  const errors = [];
  const field = (w, p) => {
    const f = byPath.get(p);
    if (!f) { errors.push(`${w}: unknown field "${p}"`); return null; }
    if (f.role !== 'eligibility') errors.push(`${w}: "${p}" is role=${f.role}, not usable in rules`);
    return f;
  };
  (s.eligibility || []).forEach((g, gi) => g.any_of.forEach((r, ri) => {
    const w = `${where}.eligibility[${gi}].any_of[${ri}]`;
    if (r.kind === 'fuzzy') return (r.relevant_fields || []).forEach(p => field(`${w}.relevant_fields`, p));
    const f = field(w, r.field);
    if (!f) return;
    if (!vocab.ops_by_type[f.type].includes(r.op)) errors.push(`${w}: op "${r.op}" not allowed on ${f.type} field ${f.path}`);
    if (f.values && !f.open && r.value !== undefined) {
      for (const v of [].concat(r.value)) if (!f.values.includes(v)) errors.push(`${w}: "${v}" not in enum for ${f.path}`);
    }
  }));
  return errors;
}

/* Every rule in a scholarship, flattened: [{ group, rule }] */
export const allRules = s => (s.eligibility || []).flatMap((g, gi) => g.any_of.map(rule => ({ group: gi, rule })));
