# Phase 1: Supabase Setup

Set up persistence for profiles and matches.

## 1. Create Supabase Project

Go to https://supabase.com/ and sign up (free tier included).

1. Click **"Create a project"**
2. Name: `Scholarship Hunter` (or your choice)
3. Database password: save it (you won't need it again)
4. Region: closest to you (or US West if unsure)
5. Click **Create new project** (takes ~2 min)

## 2. Get API Keys

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy **anon public** key (under "Project API keys")

## 3. Load Schema

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Open `backend/supabase.sql` (in this folder) and paste the entire contents
4. Click **Run** (runs 5 minutes)
5. Check **Tables** on the left — should see `profiles`, `scholarships`, `matches`

## 4. Load Scholarships

Create a `.env` file in `backend/`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Then run:

```bash
cd backend
npm install @supabase/supabase-js
node -e "import('./db.mjs').then(m => m.initSupabase()).then(db => m.loadScholarshipsToDb(db))"
```

Or use the setup script:

```bash
node backend/setup.mjs
```

Should print: `✓ Scholarships loaded (32 scholarships)`

## 5. Verify in Supabase

1. Go to **Table Editor** in Supabase
2. Click **scholarships** — should see 32 rows
3. Click one row to see the full scholarship data (eligibility rules, amounts, etc.)

## What You Have Now

✓ `profiles` table — stores user profiles (core_json + sensitive_json)  
✓ `scholarships` table — 32 scholarships with eligibility rules  
✓ `matches` table — links profiles to scholarships with status + score  
✓ Row-level security — users see only their own data  

## Next: Phase 3c (Endpoints)

Use `db.mjs` helpers in your API:

```javascript
import { initSupabase, createProfile, matchProfile } from './db.mjs';

const supabase = initSupabase();
const profile = await createProfile(supabase, userId, coreJson, sensitiveJson);
await matchProfile(supabase, profile.id, coreJson);
const matches = await getMatches(supabase, profile.id);
```

## Troubleshooting

**"SUPABASE_URL and SUPABASE_ANON_KEY required"**  
→ Create `.env` file in `backend/` with your keys

**"Could not connect to Supabase"**  
→ Check your URL and key are correct (copy from Supabase Settings → API)

**"Scholarships table already exists"**  
→ The schema is idempotent; safe to run again

---

**Done.** You now have a working backend with persistence. Ready for Phase 3c endpoints.
