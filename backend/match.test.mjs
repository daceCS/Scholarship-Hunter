// Test the match engine: load 28 labeled scholarships, create synthetic profiles,
// run matching, print a report.

import { loadScholarships, filter, evaluateScholarship, score, rank } from './match.mjs';

// Test profiles representing different scholarship seekers
const profiles = {
  'HS Senior (San Diego, Strong GPA)': {
    geo: { county: 'San Diego', state: 'CA' },
    academic: { status: 'hs_senior', gpa: 3.5, cip_codes: [], enrollment: 'full_time' },
    effort: { essay_words: 500, recs: 'yes', min_award: 500, deadline_floor: 14 },
    phases_completed: ['intake'],
    withheld: [],
  },
  'Engineering Student (UC San Diego)': {
    geo: { county: 'San Diego', state: 'CA' },
    academic: { status: 'undergrad', gpa: 3.5, cip_codes: ['14.09'], enrollment: 'full_time' },
    effort: { essay_words: 1000, recs: 'yes', min_award: 1000, deadline_floor: 14 },
    phases_completed: ['intake', 'academic'],
    withheld: [],
  },
  'Business Transfer Student (Palomar CC)': {
    geo: { county: 'San Diego', state: 'CA' },
    academic: { status: 'undergrad', gpa: 3.2, cip_codes: ['52.01'], enrollment: 'full_time' },
    effort: { essay_words: 750, recs: 'maybe', min_award: 500, deadline_floor: 30 },
    phases_completed: ['intake'],
    withheld: [],
  },
  'Military Veteran (Any Field)': {
    geo: { county: 'San Diego', state: 'CA' },
    academic: { status: 'undergrad', gpa: 2.9, cip_codes: [] },
    affiliations: { military: [{ status: 'veteran' }] },
    effort: { essay_words: 500, recs: 'no', min_award: 500, deadline_floor: 60 },
    phases_completed: ['intake'],
    withheld: [],
  },
  'High School, Withheld Financial': {
    geo: { county: 'San Diego', state: 'CA' },
    academic: { status: 'hs_senior', gpa: 3.4 },
    effort: { essay_words: 500, recs: 'yes', min_award: 500, deadline_floor: 30 },
    phases_completed: ['intake'],
    withheld: ['financial.income_band'],
  },
};

// Run matching for each profile and print results
function runReport(scholarships) {
  console.log(`\nLoaded ${scholarships.length} scholarships from 28 pages`);
  console.log('═'.repeat(80));

  for (const [profileName, profile] of Object.entries(profiles)) {
    console.log(`\n\nProfile: ${profileName}`);
    console.log('─'.repeat(80));

    // Filter candidates
    const candidates = filter(profile, scholarships);
    console.log(`Filtered: ${candidates.length} candidates (${Math.round(candidates.length / scholarships.length * 100)}%)`);

    // Evaluate and rank each candidate
    const results = candidates
      .map(s => ({
        scholarship: s,
        status: evaluateScholarship(profile, s),
        score: score(profile, s),
      }))
      .sort((a, b) => {
        // Sort: eligible first (by score), then possible, then ineligible
        const order = { eligible: 0, possible: 1, ineligible: 2 };
        const cmp = order[a.status] - order[b.status];
        return cmp !== 0 ? cmp : b.score - a.score;
      });

    // Count and show results by category
    const eligible = results.filter(r => r.status === 'eligible');
    const possible = results.filter(r => r.status === 'possible');
    const ineligible = results.filter(r => r.status === 'ineligible');

    console.log(`  Eligible: ${eligible.length} | Possible: ${possible.length} | Ineligible: ${ineligible.length}`);

    // Show top 5 eligible scholarships
    if (eligible.length > 0) {
      console.log(`\n  Top eligible scholarships:`);
      eligible.slice(0, 5).forEach((r, i) => {
        const { name, amount, effort } = r.scholarship;
        const maxAmount = amount?.max || 0;
        const effortStr = effort?.essay_words ? `${effort.essay_words}w essay` : 'no essay';
        console.log(
          `    ${i + 1}. ${name} ($${maxAmount}) [${r.status}] score=${r.score.toFixed(0)} (${effortStr})`
        );
      });
    }

    // Show top 3 possible scholarships if there are eligible ones too
    if (possible.length > 0 && eligible.length === 0) {
      console.log(`\n  Top possible scholarships (may be eligible if you provide withheld info):`);
      possible.slice(0, 3).forEach((r, i) => {
        const { name, amount } = r.scholarship;
        const maxAmount = amount?.max || 0;
        console.log(`    ${i + 1}. ${name} ($${maxAmount}) [${r.status}]`);
      });
    }

    // Summary stats
    const totalEligibleValue = eligible.reduce((sum, r) => sum + (r.scholarship.amount?.max || 0), 0);
    console.log(
      `\n  Summary: ${eligible.length} eligible scholarships, ~$${totalEligibleValue.toLocaleString()} if all won`
    );
  }

  console.log('\n' + '═'.repeat(80));
}

// Main
const scholarships = loadScholarships();
runReport(scholarships);
