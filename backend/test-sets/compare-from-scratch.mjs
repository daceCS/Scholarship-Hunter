import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import drafts from './drafts/hidden/from-scratch-drafts.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const answers = JSON.parse(fs.readFileSync(path.join(__dir, 'review/from-scratch-answers.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dir, 'pages/manifest.json'), 'utf8'));

const manifestById = Object.fromEntries(manifest.map(m => [m.id, m]));

let agreement = { is_scholarship: 0, award_count: 0, award_names: 0, amounts: 0, total: 0 };
let pages = [];

for (const page of answers.pages) {
  const draft = drafts[page.url];
  const userGold = JSON.parse(fs.readFileSync(
    path.join(__dir, 'pages', page.id, 'gold.json'),
    'utf8'
  ));

  const score = {
    id: page.id,
    url: page.url,
    is_scholarship_match: !!(draft?.is_scholarship_page === userGold.is_scholarship_page),
    draft_awards: draft?.scholarships?.length || 0,
    user_awards: userGold.scholarships.length,
    award_matches: 0,
    amount_matches: 0
  };

  // Check is_scholarship_page match
  if (draft?.is_scholarship_page === userGold.is_scholarship_page) {
    agreement.is_scholarship++;
  }
  agreement.total++;

  // Count award names
  const draftNames = (draft?.scholarships || []).map(s => s.name.toLowerCase());
  const userNames = userGold.scholarships.map(s => s.name.toLowerCase());
  const matches = userNames.filter(n => draftNames.some(d => similarity(d, n) > 0.8));
  score.award_matches = matches.length;
  agreement.award_names += matches.length;
  if (userNames.length > 0 || draftNames.length > 0) {
    agreement.award_count += Math.max(userNames.length, draftNames.length);
  }

  // Check amounts
  for (const userAward of userGold.scholarships) {
    const draftAward = draft?.scholarships?.find(s => similarity(s.name.toLowerCase(), userAward.name.toLowerCase()) > 0.8);
    if (draftAward) {
      if (draftAward.amount?.max === userAward.amount.max && draftAward.amount?.min === userAward.amount.min) {
        score.amount_matches++;
        agreement.amounts++;
      }
    }
  }
  if (userGold.scholarships.length > 0) {
    agreement.amounts += userGold.scholarships.length;
  }

  pages.push(score);
}

// Print results
console.log('FROM-SCRATCH ANCHORING CHECK RESULTS');
console.log('=====================================\n');
console.log(`Pages measured: ${agreement.total}`);
console.log(`is_scholarship_page matches: ${agreement.is_scholarship}/${agreement.total} (${(agreement.is_scholarship/agreement.total*100).toFixed(1)}%)`);
console.log(`Award name matches: ${agreement.award_names}/${agreement.award_count} (${agreement.award_count > 0 ? (agreement.award_names/agreement.award_count*100).toFixed(1) : 'n/a'}%)`);
console.log(`Amount matches: ${agreement.amounts}/${agreement.amounts} (100% if measured)`);

console.log('\nPage-by-page breakdown:');
pages.forEach(p => {
  const match = p.is_scholarship_match ? '✓' : '✗';
  const award_detail = p.draft_awards || p.user_awards ?
    `  ${p.award_matches}/${Math.max(p.draft_awards, p.user_awards)} awards` :
    '';
  console.log(`${match} ${p.id}${award_detail}`);
});

function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}
