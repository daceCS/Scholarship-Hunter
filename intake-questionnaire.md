# Scholarship Hunter — Step 1 Intake Spec

Adaptive questionnaire that builds the user's eligibility avatar. Output is a structured tag set consumed by the Step 2 search agent and the Step 3 verifier.

**Design rules**

- Never render all questions at once. Three phases, gated.
- Every question has a stable `id`. Answers are stored keyed by `id`, never by position.
- Root questions are cheap and broad. Follow-ups only fire when the root answer is non-empty.
- Identity, health, and financial questions are always skippable, with an explicit "prefer not to answer" that is distinct from "no."
- Emit tags, not prose. Empty answers emit nothing rather than a null tag.

**Field types**

`text` · `long_text` · `number` · `date` · `bool` · `single` · `multi` · `autocomplete` · `group` (repeatable set of subfields)

---

## Phase 1 — Core

Always shown. Target: under 3 minutes. This block alone must be enough to return a first result set, so the user sees value before Phase 2.

### 1.1 Academic

| id | prompt | type | notes |
|---|---|---|---|
| `edu.status` | Where are you in school right now? | single | HS senior / HS underclass / Undergrad / Grad / Returning after gap / Trade or cert program |
| `edu.institution` | What school do you attend or plan to attend? | autocomplete | IPEDS list; allow "undecided" |
| `edu.year` | What year will you be entering? | single | 1st–5th+, Grad year 1–N |
| `edu.major` | Major or intended major | autocomplete | CIP code list; allow multiple |
| `edu.concentration` | Concentration, minor, or focus area | text | Optional. High value — funds often target subfields, not majors |
| `edu.gpa` | Cumulative GPA | number | 0.0–4.0+, allow unweighted/weighted flag |
| `edu.grad_date` | Expected graduation | date | Month + year |
| `edu.enrollment` | Enrollment status | single | Full-time / Part-time / Transfer |

### 1.2 Geography

Ask at four levels. Granularity is where the low-competition awards live — county bar associations and community foundations routinely see single-digit applicant pools.

| id | prompt | type | notes |
|---|---|---|---|
| `geo.current` | Current city and state | autocomplete | Derive county server-side from ZIP |
| `geo.zip` | ZIP code | text | Drives county, congressional district, school district lookups |
| `geo.hs` | High school you graduated from | autocomplete | Derive district server-side |
| `geo.hs_county` | County you lived in during high school | autocomplete | Only ask if it differs from derived `geo.current` county |
| `geo.residency` | Are you attending school in-state or out-of-state? | single | In-state / Out-of-state / Not yet decided |

### 1.3 Effort budget

Feeds Step 4 filtering and ranking. Ask early — it prevents surfacing awards the user will never complete.

| id | prompt | type | notes |
|---|---|---|---|
| `effort.min_award` | Minimum award amount worth your time | number | USD |
| `effort.hours_week` | Hours per week you can spend applying | single | <1 / 1–3 / 3–6 / 6+ |
| `effort.essay` | Will you write essays? | single | No / Short only (≤500 words) / Any length |
| `effort.formats` | Which formats are you open to? | multi | Video / Portfolio / Interview / Project submission / Test or quiz |
| `effort.recs` | Can you get recommendation letters? | single | Yes, have people lined up / Maybe / No |
| `effort.deadline_floor` | Minimum lead time before a deadline | single | 1 week / 2 weeks / 1 month |
| `effort.renewable` | Open to renewable awards requiring annual reapplication? | bool | |

---

## Phase 2 — Branch

Shown after the first result set. Frame as "unlock more matches." Each root question is one tap; the expensive follow-ups only render on a positive answer.

### 2.1 Affiliations — highest yield block

This is the single most valuable section. Put it first in Phase 2 and say why.

```
ROOT affil.employer_parents
  "Where do your parents or guardians work, or where did they work before?"
  type: group, repeatable
  fields: employer (autocomplete) · relationship (single) · current_or_former (single)
  → emits: affiliations.employer[]
```

```
ROOT affil.union  "Is anyone in your household a union member?"  bool
  IF true → affil.union.detail
    fields: union (autocomplete: IBEW, UAW, Teamsters, AFT, SEIU, …) · local_number (text)
    → emits: affiliations.union[]
```

```
ROOT affil.military  "Are you or an immediate family member military-affiliated?"  bool
  IF true → affil.military.detail
    fields: who (single: self / parent / grandparent / spouse)
            branch (single) · status (single: active / reserve / guard / veteran / retired)
            era (multi: Vietnam / Gulf / OEF-OIF / current / other)
            disability_rating (bool, skippable) · killed_or_wounded_in_action (bool, skippable)
    → emits: affiliations.military[]
```

```
ROOT affil.fraternal  "Are you or your family involved in any civic or service organization?"  bool
  IF true → affil.fraternal.detail
    fields: org (autocomplete: Elks, Rotary, Kiwanis, Lions, Masons, Knights of Columbus,
                 VFW, American Legion, Eastern Star, Moose, Odd Fellows, …)
            lodge_or_chapter (text) · member (single: self / parent / grandparent)
    → emits: affiliations.fraternal[]
```

```
ROOT affil.religious  "Do you or your family belong to a religious community?"  bool  [skippable]
  IF true → affil.religious.detail
    fields: tradition (autocomplete) · denomination (text) · congregation (text)
    → emits: affiliations.religious[]
```

```
ROOT affil.financial  "Does your family bank with a credit union, or belong to a utility or
                       agricultural co-op?"  bool
  IF true → affil.financial.detail
    fields: institution (autocomplete) · type (single: credit union / electric co-op /
            farm bureau / insurer / other)
    → emits: affiliations.member_org[]
```

```
ROOT affil.professional  "Are you in any professional association, honor society, or student org?"
  type: multi + free text
  → emits: affiliations.professional[]
```

### 2.2 Activities and distinguishing traits

| id | prompt | type | notes |
|---|---|---|---|
| `act.extracurricular` | Clubs, sports, arts, volunteering | multi + text | |
| `act.competitions` | Have you competed in anything? | multi | Debate / Robotics / FFA / 4-H / Marching band / Esports / Science fair / Model UN / Academic decathlon / Other |
| `act.unusual` | Any unusual hobbies or skills? | long_text | Prompt with examples: beekeeping, bagpiping, ham radio, falconry, competitive shooting, horticulture, duck calling. Named awards exist for all of these |
| `act.work` | Where do you work, or have you worked? | group | employer · industry · role · dates |
| `act.built` | Have you started a business, published, or built something? | long_text | |
| `act.leadership` | Any leadership roles? | text | |

### 2.3 Career intent

| id | prompt | type | notes |
|---|---|---|---|
| `career.field` | Field you want to work in | autocomplete | |
| `career.employers` | Specific employers or agencies you're targeting | multi + text | |
| `career.sector` | Sector preference | multi | Federal / Defense / State or local gov / Nonprofit / Private / Academia |
| `career.service_obligation` | Would you accept a service commitment in exchange for funding? | single | Yes / Depends on terms / No |

`career.service_obligation = yes` should unlock a distinct result category — SMART, SFS/CyberCorps, NHSC, and similar pay well above typical private awards with far smaller applicant pools, but they carry a work commitment and belong in their own bucket rather than mixed into the main list.

---

## Phase 3 — Sensitive

Gate behind an explicit consent screen explaining what the data unlocks and that every field is optional. Store separately from Phase 1–2 data. Every field gets three states: yes / no / prefer not to answer.

### 3.1 Heritage and identity

| id | prompt | type | notes |
|---|---|---|---|
| `id.heritage` | Ethnic or national heritage, including ancestry you don't identify with day to day | multi + text | Phrasing matters. Heritage societies (Italian, Polish, Armenian, Scottish clan, Hellenic) often accept partial or distant descent and receive very few applications |
| `id.tribal` | Are you enrolled in, or eligible for enrollment in, a recognized tribe? | single | Enrolled / Eligible / Descendant, not enrolled / No |
| `id.tribe_name` | Which nation or tribe? | autocomplete | Conditional on above |
| `id.first_gen` | First in your family to attend college? | bool | |
| `id.languages` | Languages you speak and proficiency | group | language · level |
| `id.immigration_context` | Are you an immigrant, refugee, or child of immigrants? | single | Skippable. Do not ask for legal status |
| `id.gender` | Gender | single | Many awards are gender-restricted |
| `id.lgbtq` | Do you identify as LGBTQ+? | bool | Skippable |

### 3.2 Circumstances

| id | prompt | type | notes |
|---|---|---|---|
| `circ.disability` | Do you have a disability or chronic condition? | multi + text | Skippable |
| `circ.family_illness` | Has an immediate family member had a serious illness? | text | Skippable. Many disease-specific funds cover patients' children |
| `circ.foster` | Were you in foster care, adopted, or raised by a non-parent? | single | |
| `circ.caregiver` | Are you a caregiver for a family member? | bool | |
| `circ.dependents` | Do you have dependents, or are you a single parent? | single | |
| `circ.housing` | Have you experienced homelessness or housing instability? | bool | Skippable |
| `circ.parent_status` | Parent or guardian status | multi | Deceased / Disabled / Incarcerated / Separated — all map to real award criteria |

### 3.3 Financial

| id | prompt | type | notes |
|---|---|---|---|
| `fin.fafsa` | Have you filed a FAFSA? | bool | |
| `fin.sai` | Student Aid Index | number | Conditional on above |
| `fin.dependency` | Dependent or independent student? | single | |
| `fin.income_band` | Approximate household income | single | Bands, not exact figures |
| `fin.current_aid` | Aid you already receive | multi | Pell / State grant / Institutional / Private / None |

This block filters in both directions — some awards are need-restricted, others explicitly need-blind or merit-only. Missing financial data should not suppress merit results.

---

## Phase 4 — Deduplication

Ask on first run, then persist and re-ask incrementally on return visits.

| id | prompt | type |
|---|---|---|
| `dedupe.applied` | Scholarships you've already applied to | multi + text |
| `dedupe.won` | Scholarships you've won | multi + text |
| `dedupe.rejected` | Awards you were rejected from and don't want to see again | multi + text |
| `dedupe.blocklist` | Any providers you want excluded | text |

---

## Output schema

Step 1 emits this object. Discrete tags — the search agent generates targeted queries from them, and the verifier checks eligibility against them field by field. A prose description works for neither.

```json
{
  "avatar_id": "uuid",
  "version": 1,
  "updated_at": "2026-09-06T00:00:00Z",
  "academic": {
    "status": "undergrad",
    "institution": "San Diego State University",
    "institution_ipeds": "445188",
    "year": 2,
    "majors": ["Computer Science"],
    "cip_codes": ["11.0701"],
    "concentration": "Cybersecurity",
    "gpa": 3.6,
    "grad_date": "2028-05",
    "enrollment": "full_time"
  },
  "geo": {
    "city": "Fallbrook",
    "state": "CA",
    "county": "San Diego County",
    "zip": "92028",
    "congressional_district": "CA-48",
    "high_school": "...",
    "school_district": "...",
    "residency": "in_state"
  },
  "affiliations": {
    "employer": [{"name": "...", "relationship": "parent", "status": "current"}],
    "union": [{"name": "IBEW", "local": "569"}],
    "military": [{"who": "parent", "branch": "navy", "status": "veteran", "era": "oef_oif"}],
    "fraternal": [{"org": "Elks", "chapter": "1450", "member": "grandparent"}],
    "religious": [],
    "member_org": [],
    "professional": []
  },
  "identity": {
    "heritage": [],
    "tribal": null,
    "first_gen": true,
    "languages": [{"lang": "es", "level": "fluent"}],
    "gender": null,
    "withheld": ["lgbtq", "immigration_context"]
  },
  "circumstances": { "withheld": [] },
  "financial": { "fafsa_filed": true, "sai": null, "income_band": "..." },
  "activities": { "competitions": [], "unusual_skills": [], "work": [] },
  "career": {
    "field": "network security engineering",
    "sectors": ["defense", "federal"],
    "target_employers": [],
    "service_obligation": "depends"
  },
  "effort": {
    "min_award_usd": 500,
    "hours_per_week": "1_3",
    "max_essay_words": 500,
    "formats_ok": ["portfolio"],
    "recs_available": true,
    "deadline_floor_days": 14,
    "renewable_ok": true
  },
  "exclusions": { "applied": [], "won": [], "rejected": [], "blocked_providers": [] }
}
```

**Schema notes**

- `withheld` arrays are load-bearing. They distinguish "user declined" from "user answered no," which changes whether the search agent should treat a criterion as unknown or as disqualifying.
- Derived fields (`county`, `congressional_district`, `school_district`, `cip_codes`, `institution_ipeds`) are computed server-side, never asked. They expand the query surface for free.
- Version the avatar. Users return each cycle; diffing versions lets you surface only newly matched awards.

---

## Implementation notes

**Question count management.** The full tree is 60+ fields. Phase 1 is ~20 and must stand alone. Show a live match counter during Phases 2 and 3 — "answering this unlocked 4 more awards" is the only thing that reliably keeps users going through the sensitive block.

**Rarity weighting.** Tag each answer with an estimated pool-narrowing factor. A union local narrows far harder than a major. The Step 2 agent should prioritize queries built from high-narrowing tags, since that is the entire premise of the product.

**Skip logic must be forward-looking.** If `edu.status = HS underclass`, suppress the entire financial block — no FAFSA yet — and surface essay-contest categories instead.

**Progressive save.** Persist after every question. Users abandon mid-flow and return; losing Phase 2 answers means losing the affiliation data, which is the most valuable and the most tedious to re-enter.
