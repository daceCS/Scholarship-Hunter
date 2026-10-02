// Privacy check for the dismissal-analysis agent: the case file must not carry identity or unrelated sensitive answers.
// Run: npm run test:analysis
import assert from 'node:assert/strict';
import { buildCase } from './dismissal-case.mjs';

const profile = {
  academic: { status: 'undergrad', institution: 'San Diego State University', gpa: 3.5, majors: ['Nursing'] },
  geo: { state: 'CA', county: 'San Diego County, CA', zip: '92115' },
  identity: { heritage: ['Armenian'], gender: 'nonbinary', first_gen: true },
  financial: { income_band: 'under_30k' },
  circumstances: { disability: 'yes' },
  email: 'student@example.com', user_id: '11111111-2222-3333-4444-555555555555',
  withheld: ['identity.tribal'],
  phases_completed: ['core', 'branch', 'sensitive'],
};
const scholarship = (fields) => ({
  name: 'Test Award', provider_org: 'Test Foundation', source_url: 'https://example.org/a', amount: { min: 1000, max: 1000 }, full_data: {},
  eligibility: fields.map(field => ({ any_of: [{ kind: 'hard', field, op: 'present', source_quote: 'x' }] })),
});
const dismissal = { reason: 'dont_qualify', note: 'it needs a nursing license' };
const json = c => JSON.stringify(c);

// 1. A rule about GPA: no sensitive answers, no identity.
let c = buildCase({ dismissal, scholarship: scholarship(['academic.gpa']), profile, pageText: 'page' });
for (const secret of ['Armenian', 'nonbinary', 'under_30k', 'disability', 'student@example.com', '11111111-2222', '92115']) assert.ok(!json(c).includes(secret), `${secret} must not be sent`);
assert.equal(c.student.answers['academic.gpa'], 3.5);
assert.equal(c.student.answers['academic.institution'], 'San Diego State University');
assert.equal(c.student.note, 'it needs a nursing license');

// 2. A rule that reads heritage: only that sensitive answer is included, nothing else sensitive.
c = buildCase({ dismissal, scholarship: scholarship(['identity.heritage']), profile, pageText: null });
assert.deepEqual(c.student.answers['identity.heritage'], ['Armenian']);
for (const secret of ['nonbinary', 'under_30k', 'disability', 'student@example.com']) assert.ok(!json(c).includes(secret), `${secret} must not be sent`);

// 3. A rule on something the student chose not to share: reported as withheld, no value.
c = buildCase({ dismissal, scholarship: scholarship(['identity.tribal']), profile, pageText: null });
assert.deepEqual(c.student.withheld_by_student, ['identity.tribal']);

console.log('PASS: case files carry only anonymous, rule-relevant data');
