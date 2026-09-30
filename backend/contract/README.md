# Contract (Phase 0)

The shared language between the user's profile and a scholarship's eligibility rules.

| File | Purpose |
|---|---|
| `vocabulary.json` | Registry of every profile field: type, allowed values, phase, sensitivity, derived or asked, which ops apply. Paths mirror the avatar from `questionnaire/avatar.js`. |
| `scholarship.schema.json` | JSON Schema for one scholarship, with eligibility as `AND` of groups, each an `OR` of rules. This is the shape extraction produces and the importer loads. |
| `fixtures/scholarships.json` | Three illustrative (fake) scholarships used to test the contract. Never import them. |
| `check.mjs` | `npm run check`. Validates fixtures, validates rules against the vocabulary, and loads the real frontend scripts to make sure the avatar only emits paths and enum values the vocabulary knows. |

Rules use avatar paths, e.g. `geo.county`, `academic.cip_codes`, `affiliations.union[].name`. (The older plan text used `edu.*`; the avatar's `academic.*` wins.)

## Mismatches found while building this

Things in the frontend the backend would trip over. #1 to #3 were fixed in `questionnaire/avatar.js` on 2026-09-29. #4 and #5 are documented and deferred.

1. ~~Mixed-type avatar values~~ **Fixed.** `effort.essay` (`no|short|any`) and `effort.recs` (`yes|maybe|no`) now emit plain enums; the server compares them with the scholarship's `effort.essay_words` / `recs_required`.
2. ~~A skipped sub-field looks unanswered~~ **Fixed.** Military `disability_rating` / `killed_or_wounded` skips now appear in `affiliations.withheld` as `military.disability_rating` etc.
3. ~~"No" and "not asked yet" both emit nothing~~ **Fixed.** The avatar carries `phases_completed`. A field whose phase is not listed is unknown, not "no". The sensitive phase only counts with consent. The match engine must implement that rule.
4. **Same-element matching (deferred to Phase 3+).** Rules like `affiliations.military[].who = parent AND .status = veteran` can't be expressed yet: separate rules could be satisfied by different array elements. This gap was found during from-scratch labeling (2026-09-30). For v1, rules are written to work around this (e.g., a single rule per element). Revisit in Phase 3 if seeds need it; upgrade may require a new operator like `and_same_element`.
5. **Free-text canonicalization (deferred to Phase 2 Normalize stage).** Rules and profiles both hold free strings (`"IBEW"`, `"IBEW Local 569"`). The extraction pipeline's Normalize step must map both to canonical names. Vocabulary entries with a `canonical` key will list the canonical name of the entity (e.g., `"IBEW Local 569"` → canonical `"ibew_569"`). Matching will compare canonical values, not raw strings.

## Not decided here

- Derived-field lookup tables (ZIP to county/district, majors to CIP codes): data sources still to pick.
- Whether `academic.majors` rules are allowed at all, or only `academic.cip_codes`.
