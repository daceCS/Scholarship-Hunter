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

Things in the frontend the backend would trip over. #1 to #3 were fixed in `questionnaire/avatar.js` on 2026-09-29; #4 and #5 remain.

1. ~~Mixed-type avatar values~~ **Fixed.** `effort.essay` (`no|short|any`) and `effort.recs` (`yes|maybe|no`) now emit plain enums; the server compares them with the scholarship's `effort.essay_words` / `recs_required`.
2. ~~A skipped sub-field looks unanswered~~ **Fixed.** Military `disability_rating` / `killed_or_wounded` skips now appear in `affiliations.withheld` as `military.disability_rating` etc.
3. ~~"No" and "not asked yet" both emit nothing~~ **Fixed.** The avatar carries `phases_completed`. A field whose phase is not listed is unknown, not "no". The sensitive phase only counts with consent. The match engine must implement that rule.
4. **Same-element matching.** `affiliations.military[].who = parent AND .status = veteran` can't be expressed yet: separate rules could be satisfied by different people. Fine for v1; revisit if seeds need it.
5. **Free-text canonicalization.** Rules and profiles both hold free strings (`"IBEW"`, `"IBEW Local 569"`). The Normalize stage must map both to canonical names (the `canonical` key in the vocabulary names the list) before comparing.

## Not decided here

- Derived-field lookup tables (ZIP to county/district, majors to CIP codes): data sources still to pick.
- Whether `academic.majors` rules are allowed at all, or only `academic.cip_codes`.
