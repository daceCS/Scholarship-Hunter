# Phase 3c: Match Engine API

Three endpoints to integrate with the questionnaire and dashboard.

## Start the server

```bash
cd backend
npm start          # Production mode (port 3000)
npm run dev        # Development mode with auto-reload
```

Server logs: `✓ Match engine API listening on port 3000`

## Endpoints

### POST /match/count
**Stateless teaser** — evaluate a partial profile without saving.

**Use case:** Show estimated scholarship count in the questionnaire *before* user submits.

**Request:**
```json
{
  "geo": { "state": "CA", "county": "San Diego" },
  "academic": { "status": "hs_senior", "gpa": 3.5 },
  "effort": { "essay_words": 500, "recs": "yes", "min_award": 1000, "deadline_floor": 14 },
  "affiliations": {}
}
```

**Response:**
```json
{
  "count": 5,
  "dollars_total": 180000,
  "possible_count": 12,
  "top_3": [
    {
      "name": "Burger King Scholars",
      "amount": 60000,
      "provider": "Burger King Foundation"
    },
    ...
  ]
}
```

---

### POST /profile
**Save a profile and run full matching.**

**Use case:** After questionnaire submit → save profile → get initial matches.

**Request:**
```json
{
  "core_json": {
    "geo": { "state": "CA", "county": "San Diego" },
    "academic": { "status": "hs_senior", "gpa": 3.5, "cip_codes": ["14"] },
    "effort": { "essay_words": 500, "recs": "yes", "min_award": 1000, "deadline_floor": 14 },
    "affiliations": { "military": [] },
    "phases_completed": ["intake"],
    "withheld": []
  },
  "sensitive_json": {
    "financial": { "income_band": "50k-75k" }
  },
  "consented_at": "2026-09-30T12:00:00Z"
}
```

**Response:**
```json
{
  "profile_id": 42,
  "version": 1,
  "eligible_count": 5,
  "possible_count": 12,
  "top_matches": [
    {
      "name": "Burger King Scholars",
      "amount": 60000,
      "provider": "Burger King Foundation",
      "score": 60000
    },
    ...
  ]
}
```

---

### GET /matches
**Fetch a user's saved matches.**

**Use case:** Dashboard → show user's eligible scholarships with apply links.

**Request:**
```
GET /matches?limit=100
Authorization: Bearer <supabase access token>
```

**Response:**
```json
{
  "matches": [
    {
      "scholarship_id": 1,
      "name": "Burger King Scholars",
      "provider": "Burger King Foundation",
      "amount": {
        "min": 500,
        "max": 60000
      },
      "deadline": "2026-12-31",
      "apply_url": "https://...",
      "effort": {
        "essay_words": 0,
        "recs_required": 0
      },
      "status": "eligible",
      "score": 60000
    },
    ...
  ]
}
```

---

### POST /feedback
**A test user reports a problem with a scholarship.** Auth: Bearer token.

```json
{ "scholarship_id": 12, "kind": "wrong_deadline", "message": "optional details, max 1000 chars" }
```
`kind` is one of `wrong_amount`, `wrong_deadline`, `wrong_requirements`, `not_eligible`, `broken_link`, `other` (`other` needs a message). Returns `201 { "ok": true }`; 400 for a bad kind or message, 404 for an unknown scholarship, 429 after 30 reports in an hour. Stored in the `feedback` table (create it once with `feedback.sql`). Read reports with `node feedback-report.mjs`.

`GET /matches` now also returns `scholarship_id` and `verified` (`true` only when a person checked the record; machine-extracted records are `false` and the dashboard labels them "Unverified details").

---

## Integration with questionnaire

**Before submit (teaser):**
```javascript
const response = await fetch('/match/count', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(partialProfile)
});
const { count, dollars_total, top_3 } = await response.json();
// Show: "You could match 5 scholarships worth $180,000"
```

**After submit (save profile; requires a signed-in session, see `questionnaire/auth.js`):**
```javascript
const response = await TW.auth.fetch('/profile', {
  method: 'POST',
  body: JSON.stringify({ core_json: { ... }, sensitive_json: { ... } })
});
```
The user id comes from the verified Supabase JWT, never from the request body.

**In dashboard:**
```javascript
const { matches } = await (await TW.auth.fetch('/matches?limit=99')).json();
```

---

## Error handling

All endpoints return 4xx/5xx on error:

```json
{
  "error": "geo.state required"
}
```

**Common errors:**
- `geo.state required` — missing state
- `401 sign in required` / `invalid session` — missing or bad Bearer token on /profile and /matches
- `No profile found` — user has no saved profile

---

## Environment

Requires `.env` with:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only, never commit
PORT=3000 (optional, default 3000)
```

---

## Stateless vs Stateful

| Endpoint | Session | Matches | Use |
|---|---|---|---|
| POST /match/count | No | In-memory | Teaser |
| POST /profile | Yes (Bearer JWT) | Saved in DB | Initial load |
| GET /matches | Yes (Bearer JWT) | Read from DB | Dashboard |

---

**Status:** API ready. Wire questionnaire → POST /profile. Wire dashboard → GET /matches.

## POST /dismiss and DELETE /dismiss/:scholarship_id

"Not a match": removes a scholarship from the signed-in user's dashboard. Auth: Bearer token. Run `dismissals.sql` once to create the table.

`POST /dismiss` body: `{ "scholarship_id": 123, "reason": "dont_qualify", "note": "optional, up to 500 characters" }`
`reason` is one of `dont_qualify`, `wrong_school_or_level`, `not_interested`, `amount_too_small`, `deadline_too_soon`, `other` (default `other`). Returns `201 { ok: true }`.
`DELETE /dismiss/123` puts it back. `GET /matches` marks each match with `dismissed: true | false`.

Removals are analyzed on demand with `node analyze-dismissals.mjs` (`--dry-run` shows what would be sent, `--report` summarizes). What the agent sees is defined in `dismissal-case.mjs`: anonymous, and only the profile answers that scholarship's rules read.
