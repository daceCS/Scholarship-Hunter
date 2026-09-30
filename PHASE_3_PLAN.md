# Phase 3: Match Engine Plan

**Goal:** Build the core that evaluates whether a profile matches a scholarship, rank matches, and measure accuracy on your 30 from-scratch labels.

**Constraint:** No Supabase or infrastructure yet. In-memory only. Proves the matching logic works before wiring to the database.

---

## Part 3a: In-Memory Match Engine (this session)

### 1. Hard-rule checker (`backend/lib.mjs` — already exists with `checkRules`)
**What:** Evaluates eligibility rules against a profile.

**Input:**
- A profile object (e.g., `{ geo: { county: 'San Diego County' }, academic: { gpa: 3.5 } }`)
- Eligibility rules from a scholarship (array of groups)

**Output:**
- For each group: `pass`, `fail`, `unknown` (withheld or missing required phase)
- Overall: `eligible` (all groups pass), `possible` (unknown in any group), `ineligible` (any group fails)

**Already in lib.mjs?** Check what's there. If it exists, just verify it handles:
- `withheld` fields → unknown, not fail
- Missing financial data in rules → unknown if the rule requires it
- `phases_completed` logic: if a field's phase isn't listed, it's unknown

**Effort:** ~50 lines if it exists and just needs a `--match` mode; rewrite if not.

---

### 2. Database filter (`backend/match.mjs`)
**What:** Fast pre-filter before rule evaluation. Eliminates 90% of scholarships without touching rules.

**Input:**
- A profile
- All scholarships (your 30 dev labels loaded from JSON)

**Output:**
- Candidates (typically a few dozen out of thousands)

**Filters:**
1. `is_scholarship_page: true` (skip not_scholarship)
2. `deadline >= today + effort.deadline_floor` (skip closed)
3. `amount.max >= effort.min_award` (skip too-small)
4. `geo_scope.level` matches profile's state (national or CA, and profile is CA)
5. Not in user's `applied/won/rejected/blocked` lists
6. `levels` matches `academic.status` (if specified)

**Effort:** ~30 lines.

---

### 3. Ranking and effort fit (`backend/match.mjs`)
**What:** Score candidates so the dashboard shows highest-value scholarships first.

**For each candidate:**
- `score = amount.max × effort_fit`
- `effort_fit = (1 - (essay_words / budget.essay_words)) × (1 - (recs_required / budget.recs))`
  - If budget is 0, effort_fit = 1 (no effort penalty)
  - Capped at [0, 1]

**Service obligation scholarships:** Separate list (not ranked with regular ones).

**Effort:** ~20 lines.

---

### 4. Load dev scholarships (`backend/match.mjs`)
**What:** Read your 30 gold.json files and build a searchable scholarship index.

```javascript
import fs from 'fs';
import path from 'path';

const pages = fs.readdirSync('backend/test-sets/pages');
const scholarships = [];

for (const pageId of pages) {
  const gold = JSON.parse(
    fs.readFileSync(path.join('backend/test-sets/pages', pageId, 'gold.json'), 'utf8')
  );
  scholarships.push(...gold.scholarships.map(s => ({ ...s, page_id: pageId })));
}

export default scholarships;
```

**Effort:** ~10 lines.

---

### 5. Test profiles from avatar
**What:** Build a few synthetic test profiles that match different rule types.

Examples:
- **San Diego high-school senior:** geo.county = San Diego, academic.status = hs_senior, academic.gpa = 3.2
- **UC student, engineering major:** geo.county = San Diego, academic.status = undergrad, academic.cip_codes = ['14.09'], academic.gpa = 3.5
- **Veteran, full-time:** affiliations.military[] with status = veteran, academic.status = undergrad
- **Withheld income:** financial.income_band = withheld (to test unknown logic)

Each profile: match against all 30 scholarships, collect results.

**Effort:** ~20 lines (profiles) + 30 lines (loop and display).

---

### 6. Score the dev labels
**What:** Run each profile against all 30 scholarships. Measure:
- How many are `eligible`?
- How many are `possible` (unknown)?
- What do the top 3 look like?

Build a simple report:
```
Profile: HS Senior (San Diego)
─────────────────────────────
Eligible: 5
  1. Epilepsy Foundation of San Diego ($6,000) — need San Diego residency ✓, epileptic ✗ unknown
  2. Lions Club Downtown SD ($2,000) — HS senior ✓, high school list ✓
  3. ...
Possible: 8
Ineligible: 17
```

**Effort:** ~50 lines (for a readable report).

---

### 7. Verify and commit
- Run `npm run check` and `npm test` (both still pass)
- Test the match logic manually on 2–3 profiles
- Commit: `"Phase 3a: Match engine core, in-memory scoring on dev labels"`

**Effort:** ~5 lines git.

---

## Part 3b: Persistence (Phase 1, done BEFORE 3b)

Before building endpoints, Supabase must be set up:

1. **Create free Supabase project** — https://supabase.com/
2. **Schema (minimal):**
   - `users` (Supabase manages this)
   - `profiles` (user_id, version, core_json, created_at)
   - `profiles_sensitive` (user_id, version, sensitive_json, consented_at)
   - `scholarships` (load once from `backend/data/scholarships.json` — export from step 4 above)
   - `matches` (user_id, profile_version, scholarship_id, state, score, reasons)
3. **Row-level security:** users see only their own profiles and matches
4. **Auth:** Supabase sign-up, simple trial stub (no Stripe yet)
5. **Geography:** ZIP to county lookup table (seed with San Diego ZIPs)

Minimal Supabase work: one `.sql` file, load it, done.

**Effort:** ~100 lines SQL + 50 lines JS init.

---

## Part 3c: Wire to endpoints (after Phase 1)

### Endpoints to build:
1. **`POST /match/count`** — stateless teaser
   - Input: answers object
   - Output: `{ count, dollars_total, top_3 }`
   - Logic: build temp profile, run filter + rules, return count

2. **`POST /profile`** — save profile at sign-up
   - Input: full avatar, consent flag
   - Output: profile version, user_id
   - Logic: split sensitive fields, save versions, queue match job

3. **`GET /matches`** — list user's matches
   - Input: user auth, limit
   - Output: array of { scholarship, reasons, unknowns }
   - Logic: read from matches table (requires Phase 1 persistence)

### Update dashboard:
- Replace `TW.mock.estimate` → call `POST /match/count`
- Replace `TW.mock.awards` → call `GET /matches`
- Delete `mock.js`

**Effort:** ~150 lines (3 endpoints) + ~30 lines (dashboard wiring).

---

## Stopping point

After 3c, you have:
- ✓ Hard rules working
- ✓ Profiles saved and matched
- ✓ Dashboard showing real matches
- ✓ Accuracy measured on dev labels

**Not yet:**
- Extraction (Phase 2) — needs a prompt and scoring
- Automation (Phase 5) — crawlers, re-checks

---

## Files to create/modify

| File | Purpose | Lines |
|---|---|---|
| `backend/match.mjs` | Filter, rank, score | 100 |
| `backend/match.test.mjs` | Test profiles, report | 100 |
| `backend/data/scholarships.json` | Export from gold labels | (auto) |
| `backend/lib.mjs` | Already has `checkRules` — verify | ~10 |
| `backend/index.mjs` | API endpoints (Phase 1) | 150 |
| `.sql` | Supabase schema (Phase 1) | 100 |
| `questionnaire/app.js` | Swap endpoints (Phase 1) | ~30 |

---

## Estimate

**3a (this session):** ~4 hours (match logic, test profiles, score report)  
**Phase 1:** ~2 hours (Supabase + sign-up stub + geography)  
**3c:** ~3 hours (endpoints + dashboard wiring)  
**Total for Phases 1 + 3:** ~9 hours

Do 3a now. Phase 1 and 3c are straightforward and can move fast once 3a is solid.
