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
  "auth_user_id": "user-uuid-from-auth",
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
GET /matches?user_id=user-uuid&limit=100
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

## Integration with questionnaire

**Before submit (teaser):**
```javascript
const response = await fetch('http://localhost:3000/match/count', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(partialProfile)
});
const { count, dollars_total, top_3 } = await response.json();
// Show: "You could match 5 scholarships worth $180,000"
```

**After submit (save profile):**
```javascript
const response = await fetch('http://localhost:3000/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    auth_user_id: user.id,
    core_json: { ... },
    sensitive_json: { ... }
  })
});
const { profile_id, eligible_count, top_matches } = await response.json();
// Save profile_id in session; show top_matches on dashboard
```

**In dashboard:**
```javascript
const response = await fetch(`http://localhost:3000/matches?user_id=${user.id}`);
const { matches } = await response.json();
// Display eligible scholarships with apply buttons
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
- `auth_user_id required` — missing user ID
- `No profile found` — user has no saved profile

---

## Environment

Requires `.env` with:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
PORT=3000 (optional, default 3000)
```

---

## Stateless vs Stateful

| Endpoint | Session | Matches | Use |
|---|---|---|---|
| POST /match/count | No | In-memory | Teaser |
| POST /profile | Yes (auth_user_id) | Saved in DB | Initial load |
| GET /matches | Yes (user_id) | Read from DB | Dashboard |

---

**Status:** API ready. Wire questionnaire → POST /profile. Wire dashboard → GET /matches.
