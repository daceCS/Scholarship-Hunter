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
      // Effort, basis and service answers are facts about the award, not eligibility rules (no invented quotes, no pseudo-rules).
      if (award.basis === 'need' || award.basis === 'merit') sch.need_based = award.basis;
      const effort = {};
      if (award.essay) effort.essay_words = Number(award.essay);
      if (award.recs) effort.recs_required = Number(award.recs);
      if (award.formats?.length) effort.formats = award.formats;
      if (Object.keys(effort).length) sch.effort = effort;
      if (award.service) sch.service_obligation = true;

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

console.log(`Transcribed ${count.created} gold.json files`);
if (count.errors.length) {
  console.log(`\nErrors (${count.skipped}):`);
  count.errors.forEach(e => console.log(`  - ${e}`));
}
