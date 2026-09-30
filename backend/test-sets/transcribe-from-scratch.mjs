import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));

const manifest = JSON.parse(fs.readFileSync(path.join(__dir, 'pages/manifest.json'), 'utf8'));
const answers = JSON.parse(fs.readFileSync(path.join(__dir, 'review/from-scratch-answers.json'), 'utf8'));
const today = '2026-09-30';

// Index manifest by id
const manifestById = Object.fromEntries(manifest.map(m => [m.id, m]));

let count = { created: 0, skipped: 0, errors: [] };

for (const page of answers.pages) {
  const m = manifestById[page.id];
  if (!m) {
    count.errors.push(`${page.id}: not in manifest`);
    count.skipped++;
    continue;
  }

  const dir = path.join(__dir, 'pages', page.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const gold = {
    page_type: m.page_type,
    is_scholarship_page: page.about !== 'no',
    scholarships: [],
    review_status: 'reviewed',
    from_scratch: true,
    labeler: 'david',
    labeled_at: today,
    vocabulary_gaps: [],
    notes: page.notes || ''
  };

  // Listing pages: collect award names
  if (page.about === 'names' || page.about === 'many') {
    gold.award_names = page.names ? page.names.split('\n').map(n => n.trim()).filter(Boolean) : [];
  }

  // Single/one pages: build scholarship objects
  if ((page.about === 'one' || page.about === 'many') && page.awards?.length) {
    for (const award of page.awards) {
      if (!award.name) continue; // Skip if no name

      const sch = {
        name: award.name,
        provider_org: award.org || 'Unknown',
        apply_url: award.apply || page.url,
        source_url: page.url,
        amount: buildAmount(award),
        deadline: award.deadline || null,
        cycle_status: award.deadline ? 'open' : 'unknown',
        geo_scope: { level: 'national' },
        eligibility: buildEligibility(award.reqs || []),
        provenance: [],
        verified_at: today,
        confidence: 0.7
      };

      if (award.org) sch.provider_org = award.org;
      if (award.basis) sch.eligibility.push(...buildBasisRule(award.basis));
      if (award.essay) sch.eligibility.push(buildEssayRule(award.essay));
      if (award.recs) sch.eligibility.push(buildRecsRule(award.recs));
      if (award.service) sch.eligibility.push(serviceRule());
      if (award.formats?.length) sch.eligibility.push(buildFormatsRule(award.formats));

      gold.scholarships.push(sch);
    }
  }

  try {
    fs.writeFileSync(
      path.join(dir, 'gold.json'),
      JSON.stringify(gold, null, 2) + '\n'
    );
    count.created++;
  } catch (e) {
    count.errors.push(`${page.id}: ${e.message}`);
  }
}

function buildAmount(award) {
  const min = award.min ? parseFloat(award.min) : 0;
  const max = award.max ? parseFloat(award.max) : 0;
  const amt = { min, max };
  if (award.renewable) amt.renewable = true;
  if (award.unknownAmount) amt.note = 'Amount varies or not specified';
  return amt;
}

function buildEligibility(reqs) {
  const groups = {};
  for (const req of reqs) {
    const g = req.group || 'default';
    if (!groups[g]) groups[g] = { any_of: [] };
    if (req.plain) {
      groups[g].any_of.push({
        kind: 'fuzzy',
        description: req.plain,
        relevant_fields: [],
        source_quote: req.quote || req.plain
      });
    }
  }
  return Object.values(groups);
}

function buildBasisRule(basis) {
  const map = {
    need: { field: 'financial.need', op: 'exists', kind: 'hard', value: true },
    merit: { field: 'academic.gpa', op: 'exists', kind: 'hard', value: true },
    either: null
  };
  return map[basis] ? [{ any_of: [{ ...map[basis], source_quote: basis }] }] : [];
}

function buildEssayRule(words) {
  return [{
    any_of: [{
      kind: 'hard',
      description: `Essay required (${words} words)`,
      source_quote: `Essay required: ${words} words`
    }]
  }];
}

function buildRecsRule(count) {
  return [{
    any_of: [{
      kind: 'hard',
      description: `${count} letter(s) of recommendation required`,
      source_quote: `${count} recommendation(s) required`
    }]
  }];
}

function serviceRule() {
  return [{
    any_of: [{
      kind: 'fuzzy',
      description: 'Service obligation required',
      relevant_fields: [],
      source_quote: 'Service obligation required'
    }]
  }];
}

function buildFormatsRule(formats) {
  return [{
    any_of: [{
      kind: 'hard',
      description: `Formats: ${formats.join(', ')}`,
      source_quote: `Required formats: ${formats.join(', ')}`
    }]
  }];
}

console.log(`Transcribed ${count.created} gold.json files`);
if (count.errors.length) {
  console.log(`\nErrors (${count.skipped}):`);
  count.errors.forEach(e => console.log(`  - ${e}`));
}
