# Scholarship Hunter — Backend System Plan

Status: **Phase 0 in progress** · Drafted 2026-09-28 · Contract v1 written in `backend/contract/` (2026-09-28). Mismatches #1-3 fixed in the frontend 2026-09-29; #4-5 open. Test-set tooling built (`backend/test-sets/`). Test set 1: 318 usable page snapshots saved in `backend/test-sets/pages/`; final 300 chosen and split 100 dev / 200 test (frozen 2026-09-29, `backend/test-sets/split-lock.json`); next: create label files, draft the first batch, user reviews.

## 1. Design principles

1. **The tag vocabulary is the shared language.** The user's profile (the "avatar" in `intake-questionnaire.md`) and each scholarship's eligibility rules use the same field names (`geo.county`, `academic.cip_codes`, `affiliations.union[].name`, ...). Everything else depends on this.
2. **AI runs when a scholarship is added, not when a user is matched.** The costly AI work happens once per scholarship. Matching a user is mostly database lookups plus a few Jev calls.
3. **Each step has one job, and its output is stored.** Fetch, extract, validate and publish are separate steps with saved results. When something breaks, you can see which step failed and re-run only that one.
4. **Accuracy over size.** Every scholarship records where each fact came from, when it was last checked, and a confidence score. Don't aim for a database of *all* scholarships.

## 2. System overview

```
┌──────────────── FRONTEND (existing, static) ────────────────┐
│ landing/   questionnaire/   dashboard/                      │
└──────────────┬──────────────────────────────▲───────────────┘
               │ answers / profile             │ matches, counts
┌──────────────▼──────────────────────────────┴───────────────┐
│ API LAYER                                                   │
│  auth (sign-up + trial) · profile save · stateless preview   │
│  count · matches · application tracking · feedback          │
└──────┬─────────────────────────────┬────────────────────────┘
       │                             │
┌──────▼─────────┐        ┌──────────▼──────────┐
│ MATCH ENGINE   │        │ POSTGRES            │
│ filter → rules │◄──────►│ users · profiles    │
│ → Jev → rank   │        │ scholarships · rules│
└────────────────┘        │ sources · snapshots │
                          │ matches · jobs      │
┌─────────────────────────┴─────────────────────┴──────────────┐
│ INGESTION WORKERS (job queue)                                │
│ source list → fetch → Jev check → AI extract → validate      │
│ → dedupe → review queue → publish → re-check schedule        │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ ADMIN REVIEW UI · accuracy test sets · cost/usage dashboards │
└──────────────────────────────────────────────────────────────┘
```

**Recommended stack** (simple and inexpensive for a solo builder):

| Layer | Choice | Why |
|---|---|---|
| Database + auth + files | **Supabase** (Postgres, row-level security, auth, file storage, pgvector) | One service covers the database, sign-up and file storage. Row-level security keeps each user's data private. |
| Workers | **TypeScript** on Fly.io or Railway, with **pg-boss** (a job queue that runs on Postgres) | Crawls run for a long time, so serverless edge functions don't fit. TypeScript matches the frontend, and a Postgres-based queue means no extra service to run. |
| Page fetching | Plain HTTP by default; Playwright only for sites that need JavaScript | Headless browsers are slow and costly. |
| Extraction AI | A text-generating AI with structured output (e.g. Claude Haiku 4.5, moving up to a larger model when confidence is low) | Only this kind of model can pull the name, amount, deadline and URL out of a page. |
| Decision layer | **Jev** (TypeSafe AI), called only through our own `decide(question, context) → { value, p }` wrapper | Jev is in early access (released 2026-09-15), so it must be easy to swap for an AI with structured output. |
| Frontend hosting | Cloudflare Pages / Netlify | The frontend is static files. |

### Where Jev is used, and where it isn't

- **Use Jev for:** deciding whether a page is a scholarship page, which links to follow, which fixed category or tag a scholarship belongs to, whether two records are the same award, whether an award is still open, fuzzy eligibility rules, and sending low-confidence results to review.
- **Don't use Jev for:**
  - Hard rules (state, GPA, major). Use a database query.
  - Pulling out text like names, amounts, dates and URLs. Jev doesn't generate text.
  - Checking every user against every scholarship. Filter in the database first.
- **Cost reasoning** (vendor pricing of $0.042 per 1M input tokens, not independently verified): 10k users × 5k scholarships × ~2k tokens ≈ $4,200 per full matching run without a database filter. With a filter down to ~200 candidates per user, it's ≈ $170.
- **Before relying on it:** check Jev's confidence scores against our own labeled test set, get a data processing agreement, and send only the fields each question needs.

## 3. Data model

### Scholarship side

```
sources            the organizations we check
  id, org_name, org_type (community_foundation | bar_assoc | employer | university | ...),
  root_url, geo_scope, crawl_frequency, last_crawled_at, origin (seed | user_demand | discovered)

snapshots          saved copy of every page we fetch
  id, source_id, url, content_hash, storage_path, fetched_at, status_code
  → if content_hash hasn't changed, skip extraction (big cost saving)

scholarships       one published award
  id, name, provider_org, source_id, apply_url, amount_min, amount_max,
  renewable, deadline, cycle_status (open | closed | upcoming | unknown),
  level[], effort_essay_words, effort_formats[], recs_required,
  service_obligation, need_based (need | merit | either),
  est_pool_size, confidence, last_verified_at, status (draft | review | live | retired)

scholarship_rules  eligibility in OUR tag vocabulary
  scholarship_id, group_no, field, op, value, kind (hard | fuzzy), source_quote
  -- every group must pass; within a group, any one rule can pass
  -- e.g. group 1: field=geo.county  op=in  value=["San Diego County"]
  --      group 2: field=academic.cip_codes op=prefix value=["51.38"]   (nursing)
  --      group 3: kind=fuzzy value="demonstrated community leadership"
  --               relevant_fields=["act.leadership","act.extracurricular"]

field_provenance   scholarship_id, field, source_quote, snapshot_id
```

`source_quote` is what keeps the data honest. Every extracted fact points to the exact text it came from, so a reviewer (or a user who reports a problem) can check it in seconds.

### User side

```
users              Supabase auth, created at sign-up + trial start (see §11)
intake_state       raw questionnaire state for signed-up users editing their answers — one row per user
profiles           versioned: user_id, version, core_json, created_at
profiles_sensitive user_id, version, sensitive_json, consented_at   ← SEPARATE table, per intake spec
derived_geo        county, congressional_district, school_district (worked out on the
                   server from ZIP code lookup tables)
matches            user_id, profile_version, scholarship_id, state (eligible | possible),
                   p_eligible, score, reasons[], unknowns[], computed_at
applications       user_id, scholarship_id, status (saved | applying | submitted | won | lost)
feedback           user_id, scholarship_id, type (wrong_info | closed | ineligible | spam), note
```

Two rules from the intake spec that the design must keep:
- **Withheld is not the same as "no."** If a rule depends on a field the user withheld, the result is *unknown* (shown as "possibly eligible"), not *ineligible*.
- **Missing financial data doesn't exclude merit awards.** A `need_based = need` rule only applies when the user actually gave financial answers.

## 4. Ingestion pipeline

Each stage is a queued job, safe to re-run, and saves its output before the next stage starts.

| # | Stage | Tool | Output |
|---|---|---|---|
| 1 | **Schedule** | cron | Due sources go into the fetch queue |
| 2 | **Fetch** | HTTP, following robots.txt, rate-limited per domain | Saved snapshot + content hash; skip if unchanged |
| 3 | **Triage** | **Jev**: "Is this a scholarship page?" / "Which links are worth following?" | Discard, follow links, or extract |
| 4 | **Extract** | Extraction AI with a strict output schema | Draft scholarship + rules + source quotes |
| 5 | **Normalize** | **Jev** (pick from fixed choices) + lookup tables | Rules converted to our tags; majors to CIP codes; places to counties |
| 6 | **Validate** | Automatic code checks | Deadline is in the future, URL works, amount parses, required fields present |
| 7 | **Dedupe** | Vector similarity finds candidates → **Jev** decides whether they're the same award | Merge into the existing record, or create a new one |
| 8 | **Route** | Confidence scores | High confidence → live; low → review queue |
| 9 | **Re-check** | Scheduler | Check again before the deadline, after it passes, and when the next cycle opens |

**How new sources get added:**
- **Seed lists:** community foundations (~700–800 in the US), county and state bar associations, medical societies, Rotary/Elks/Lions chapters, state higher-ed agencies, college financial aid pages (from the federal IPEDS college list), and private foundations that report scholarship grants on their tax filings (IRS 990-PF).
- **User demand:** when a profile names an employer, union local or lodge that isn't a known source, create a discovery job. It runs a web search, asks Jev "Is this the official scholarship page for X?", then adds the source.
- **Link following:** a crawled page links to another funder's page, and Jev decides whether it's a new source worth adding.

Don't scrape aggregator sites like Fastweb or Scholarships.com: they risk terms-of-service problems, and their data is stale and the same data every competitor already has.

## 5. Match engine

A match runs when a profile is submitted, when a profile version changes, and each night to pick up new scholarships.

```
1. Database filter  (fast, uses indexes)
     live AND deadline ≥ today + effort.deadline_floor
     AND amount_max ≥ effort.min_award AND level matches edu.status
     AND geo_scope covers the user's state (or is national)
     AND not in the user's applied/won/rejected/blocked lists
   → a few hundred to a few thousand candidates

2. Rule check  (plain TypeScript, fully testable)
     for each hard rule: pass / fail / unknown (withheld or missing)
   → drop any with a fail; keep "unknown" as "possibly eligible"

3. Jev  (fuzzy rules only, sending only each rule's relevant fields)
     p ≥ 0.85 → eligible · 0.4–0.85 → possibly eligible · below 0.4 → drop
     (tune these cutoffs on our own labeled test set)

4. Rank
     score = amount × chance-of-winning estimate × effort fit
     chance-of-winning estimate: early on, a rule of thumb (local scope and many narrow
     rules mean a small applicant pool); later, learned from users' win/loss results
     service-obligation awards → a separate list (serviceBucket)

5. Save to matches, with reasons[] and unknowns[] for the "why you matched" display
```

**The live match counter needs special care.** `TW.mock.estimate` runs after every answer. The real version should run **only step 1 plus the cheap hard-rule checks**, return a count, and be debounced. Jev should never run on each keystroke.

## 6. API: replacing the placeholders

| Frontend call today | Real version |
|---|---|
| `TW.api.saveProgress(state)` | Before the trial: stays localStorage-only (no server call). After the trial starts: `PUT /intake` saves edits for returning users |
| `TW.api.submitAvatar(avatar)` | `POST /profile` → called at sign-up + trial start (see §11); new profile version, splits out sensitive fields, derives geography, queues a match job |
| `TW.mock.estimate(A)` | `POST /match/count` → hard filter count only, stateless (answers in, count out, nothing stored) |
| `TW.mock.awards(A, n)` | `GET /matches?limit=n` → reads the `matches` table |
| `TW.mock.serviceBucket(A)` | Included in the `/matches` response as a separate list |
| *(new)* | `POST /applications`, `POST /feedback`, `GET /matches/new` (since last visit) |

Simple reads and writes can go straight through Supabase with row-level security. Profile submission and matching go through the worker service.

## 7. Privacy and security

- **Many users are minors.** Get legal advice on minors' data and state student-privacy laws before launch, and write a clear privacy policy.
- **Sensitive answers** go in a separate table with stricter access. Encrypt identity, health and financial fields, and record when consent was given.
- **Send Jev and the extraction AI only what they need.** Scholarship pages contain no user data. Fuzzy-rule checks send only the relevant fields, never the full profile. Get a data processing agreement from every AI vendor, confirming whether they keep inputs or train on them.
- **Deletion:** one delete action that removes the user and all profile versions, matches and feedback.
- **Scraping:** follow robots.txt, identify our crawler, rate-limit per domain, and don't copy aggregator databases.

## 8. Operations

- **Test sets** (build these early):
  - 300 pages labeled by hand (for extraction accuracy); see `backend/test-sets/extraction-pages-plan.md`
  - ~200 labeled user-and-rule pairs (to check Jev's confidence scores)
  - ~50 pairs of duplicate listings

  Re-run them whenever a prompt or model changes.
- **Admin review UI:** a simple page showing a draft scholarship next to its saved snapshot, with the source quotes highlighted and approve/edit/reject buttons.
- **Cost tracking:** log tokens and calls per stage.
- **Freshness numbers to track:** share of live scholarships checked in the last 30 days, and user "wrong info" reports per 100 views.

## 9. Build order

| Phase | Goal | Done when |
|---|---|---|
| **0: Contract** | Tag vocabulary as a shared JSON Schema; scholarship schema; the three test sets | Profile and rule fields come from the same definition |
| **1: Persistence** | Supabase (free tier), sign-up, real `submitAvatar` saving profile versions + sensitive split, stateless `/match/count` and `/match/preview` stubs. Trial/billing is stubbed as "everyone who signs up is on a trial" until Phase 4 | Signing up saves the avatar; nothing is stored for users who don't sign up |
| **2: Seed data** | Extraction tool + admin review UI; 300–500 scholarships for the launch region: San Diego County + California statewide + national | Every record has source quotes and has been reviewed |
| **3: Matching** | Match engine, replacing all three `TW.mock` calls | The dashboard shows real matches with reasons, and `mock.js` is deleted |
| **4: Beta** | Real users in the launch region; free teaser + Stripe subscription + `entitlements`; Supabase Pro; feedback button; application tracking | Users pay and apply to scholarships we surfaced |
| **5: Automation** | Crawlers over the source list, Jev triage, dedupe, re-checks | New scholarships appear without manual entry |
| **6: Growth loops** | User-driven discovery, "new matches" emails, learning from win/loss results | Coverage grows with the user base |

Phases 0–3 get us to a working product without any automated crawling. Crawlers make an existing product scale; they aren't needed to launch.

## 10. Open decisions

- [x] **Launch region:** San Diego County, California (decided 2026-09-28). Seed data in Phase 2 = San Diego County + California statewide + national awards.
- [x] **Hosting:** Supabase (Postgres, auth, storage, pgvector) plus a small TypeScript worker service with pg-boss on Fly.io or Railway (decided 2026-09-28). Worker host still to pick.
- [x] **Accounts:** the questionnaire is part of the funnel and works **before** account creation or payment (decided 2026-09-28). See §11.
- [x] **Team and budget:** solo founder; **$30/month** plus a Claude subscription until there are users (decided 2026-09-28). See §12.
- [ ] **Free vs. paid:** what does a non-paying user see? Proposal in §11 needs confirmation.
- [ ] **Pricing** and who pays (student or parent).

## 11. Funnel, accounts and payments

```
landing → questionnaire (browser only) → teaser results → sign up + start trial → avatar saved → full dashboard
```

**Decided 2026-09-28: the avatar (profile) is written to the database only when the user starts a free trial or subscription.** Before that, nothing about the user is stored on the server.

- **Before the trial, everything stays in the browser.** Answers stay in localStorage, which the questionnaire already does. No anonymous Supabase users, no server-side progress saving. The trade-off: no resuming on another device before sign-up (the same device still resumes).
- **The teaser is stateless.** `POST /match/preview` receives the answers, runs only the database filter and rule check (no Jev), returns count, dollar total and top 3, and **stores and logs nothing**. Rate-limited, with Cloudflare Turnstile (free CAPTCHA) against scraping of the catalog.
- **Sign-up and trial start are one step.** Creating an account and starting the trial happen together. At that moment the client sends the full avatar (`submitAvatar`), the server saves profile version 1 (sensitive fields in `profiles_sensitive`, with consent recorded), and the first full match runs with Jev. Avoid a third "account but no trial" state that would need its own rules.
- **Trial ends without paying, or subscription cancelled:** keep the avatar for a 90-day grace period so they can resubscribe without redoing the questionnaire, then delete it automatically. Tell users this at sign-up.
- **Trial abuse:** requiring a card at trial start (Stripe supports trials with a card on file) cuts down on sign-up → view full list → leave.
- **Drop-off analytics without personal data:** record anonymous events like "reached screen X" (no answers) so the funnel can be measured even though answers aren't stored.
- **Paywall enforced on the server:** an `entitlements` table (user_id, plan, status, current_period_end) is updated by a Stripe webhook running as a Supabase Edge Function. Row-level security and the `/matches` endpoint check it. The frontend only reflects it.
- **Proposed free vs. paid split** (to confirm):
  - **Free:** total match count, dollar total, and the top 3 matches in full. The frontend already has a teaser in `TW.mock.awards` and the live counter.
  - **Paid:** the full list, "why you matched" details, deadline reminders, application tracking, and "new matches" alerts each cycle.
- **Payments:** Stripe Checkout + Customer Portal. There's no monthly fee, only fees per transaction. Many users are minors, so offer a "send to a parent to pay" checkout link.

API additions:

| Endpoint | Purpose |
|---|---|
| `POST /match/preview` | Stateless teaser: answers in → count, dollar total, top 3; nothing stored |
| `POST /billing/checkout` | Creates a Stripe Checkout session |
| `POST /billing/webhook` | Stripe → updates `entitlements` |
| `POST /billing/portal` | Stripe Customer Portal link |

## 12. Budget: $30/month until there are users

| Item | Phases 0–3 (building) | Phase 4+ (beta with users) |
|---|---|---|
| Supabase | **Free tier**: $0 (projects pause after 7 days without activity; fine while developing) | **Pro: $25/mo** (daily backups, no pausing; needed once we hold real users' data) |
| Worker service | **Run locally** on your PC: $0. Seed extraction is batch work and doesn't need hosting | Scheduled jobs start as Supabase cron / Edge Functions: $0. A hosted worker (Railway ~$5/mo) waits until Phase 5 crawling |
| Extraction AI | Build the seed data with **Claude Code on your subscription** (it reads pages and writes structured JSON files for import), or the API at roughly <$10 for ~500 pages with a Haiku-class model (check current pricing) | Pay-per-use API; small at this scale |
| Jev | Negligible at this volume ($0.042 per 1M input tokens, vendor pricing) | Negligible |
| Frontend hosting | Cloudflare Pages: $0 | $0 |
| Domain | ~$1/mo | ~$1/mo |
| Email (reminders) | not needed yet | Resend free tier: $0 |
| Stripe | $0 | per-transaction fees only |
| **Total** | **~$1–10/mo** | **~$26–31/mo** |

Note: a Claude subscription doesn't include API access (the API is billed separately). The subscription covers development work in Claude Code, including building the seed data by hand-assisted extraction.

## 13. Cost per user (estimated 2026-09-28)

Prices checked 2026-09-28: Claude Haiku 4.5 $1 / $5 per 1M input/output tokens (Batch API 50% off); Supabase Pro $25/mo (8 GB database, 100k monthly active users); Stripe 2.9% + 30¢ per card payment + 0.7% for Billing; Resend free for 3,000 emails/mo (100/day cap), paid from ~$20/mo; Jev $0.042 per 1M input tokens (vendor early-access pricing).

**Cost per paying user each month, at $9.99/mo:**

| Item | Estimate | Assumption |
|---|---|---|
| Stripe fees | **~$0.66** | 2.9% + 30¢ + 0.7% Billing |
| Jev matching | ~$0.005 | first match ~60 fuzzy checks × 1.5k tokens; after that only new scholarships are checked |
| Supabase storage | ~$0 | ~100 KB per user; 8 GB holds ~80k users |
| Email reminders | $0–0.003 | ~8/user/month; free up to ~375 users |
| **Total** | **~$0.67** | **Stripe is ~98% of the cost per user** |

**Shared costs, not tied to how many users you have:**
- Supabase Pro $25/mo, domain ~$1/mo, hosted worker ~$5/mo (from Phase 5)
- Keeping the scholarship data current:
  - Extraction ≈ $0.008–0.016 per page with Haiku 4.5 (~8k tokens in, ~1.5k out; batched vs. not): **~$40–80 to build a 5,000-scholarship catalog once**
  - Re-checks are cheap because unchanged pages are skipped
  - Jev triage ≈ $0.0003 per page
- **Largest cost: your time for manual review**, e.g. 500 records × ~5 min ≈ 40 hours

**Monthly totals by paying users** (at $9.99/mo):

| Paying users | Revenue | Total cost | Cost per user | Margin |
|---|---|---|---|---|
| 5 | $50 | ~$45 | ~$9.00 | ~break-even |
| 100 | $999 | ~$110 | ~$1.10 | ~89% |
| 1,000 | $9,990 | ~$760 | ~$0.76 | ~92% |
| 10,000 | $99,900 | ~$7,000 | ~$0.70 | ~93% |

(Totals at 1,000 and above assume a larger Supabase instance, a paid email plan, and more regions of scholarship data.)

Takeaways:
- **Stripe's fixed 30¢ is the main per-user cost**, so a low monthly price loses the most to fees. At $4.99/mo fees are ~9.6%; at $9.99/mo ~6.6%. An annual or "application season" plan (one charge per year) cuts fees to ~4%.
- **Other risks to budget for:** each chargeback costs $15, refunds don't return Stripe's fees, Stripe Tax adds 0.5% if you need to collect sales tax, and Jev's early-access price may change (even at 10× it would stay under $0.05 per user).
- **Free visitors cost almost nothing:** the teaser endpoint only does database work, which is included in Supabase's plan.
