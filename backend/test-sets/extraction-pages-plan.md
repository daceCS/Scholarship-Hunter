# Test set 1: 300 hand-labeled scholarship pages

Status: **plan** · 2026-09-29 · Supersedes the "~200 pages" line in `backend-plan.md` §8.

## What this set is for

1. **Measure extraction.** Given a saved page, does the extractor produce the right scholarship JSON (`backend/contract/scholarship.schema.json`)? We can't trust any prompt or model until we have a number.
2. **Measure triage.** Can it tell a scholarship page from a listing page, a loan page, a news post or a dead page?
3. **Set the auto-publish threshold.** The confidence cutoff for "goes live without review" is picked from this set, not guessed.
4. **Catch regressions.** Re-run on every prompt or model change (cost: a few dollars).
5. **Double as seed data.** Every labeled award in the launch region is a reviewed Phase 2 record, so the labeling work is not throwaway.

## Composition (300 pages)

| Page type | Count | Why |
|---|---|---|
| Single-award page | 180 | The core case |
| Listing page (many awards on one page) | 45 | Must extract each award, or route to "follow links" |
| Not a scholarship (loans, jobs, news, about, closed or dead) | 35 | Negatives for triage; the false-positive rate matters most here |
| PDF / flyer / application form | 25 | Common at small local funders; text layout is messy |
| Hard cases (JS-rendered, multiple deadlines, closed cycle, ambiguous wording) | 15 | Where the confidence score has to be honest |

Balance the 180 singles and 45 listings on three axes:

- **Source type:** community foundations 25%, employers/unions/fraternal 20%, private foundations and nonprofits 15%, universities 15%, bar and professional societies 10%, state/federal 10%, other 5%.
- **Geography:** San Diego County 40%, California statewide 25%, national 35%.
- **Eligibility shape:** no or one rule 25%, two or three rules 50%, four or more 25%. Force these in: at least 25 pages with a fuzzy rule, 30 need-based, 20 service-obligation, 20 where deadlines or eligibility differ by level.

Deliberate overlap: include about 15 awards that appear on two or three pages (provider page, a foundation's listing, a PDF). That yields the ~50 duplicate pairs for test set 3 almost for free.

## Dev / test split

- **Dev: 100 pages.** Look at these freely while writing prompts.
- **Test: 200 pages, locked.** Not viewed while tuning. Run once per candidate prompt/model to report a score. If we ever tune against it, it stops being a test, and then we add a fresh 100.
- Split stratified by the axes above and decided at freeze time, before any extractor exists. **Frozen 2026-09-29** (seed `scholarship-hunter-1`, `split-lock.json`). Split is by provider group so the same provider or award never sits in both dev and test.

## Folder layout

```
backend/test-sets/pages/
  manifest.json                 one row per page: id, url, fetched_at, page_type, source_type, geo, split
  <id>/
    raw.html | raw.pdf          exactly what we fetched
    text.txt                    extracted visible text (what the extractor sees)
    gold.json                   the label (below)
```

Snapshots are frozen. Live pages change, so scoring against a live URL would be scoring against a moving target. Snapshots are for internal evaluation only and are never served or redistributed.

**Gold label (`gold.json`):**

```json
{
  "page_type": "single | listing | not_scholarship | pdf_form",
  "is_scholarship_page": true,
  "scholarships": [ /* full contract objects; empty for negatives */ ],
  "follow_links": [ /* listing pages: URLs of individual award pages */ ],
  "labeler": "david",
  "labeled_at": "2026-10-05",
  "notes": "anything ambiguous, and why the label was chosen"
}
```

Gold uses the same contract as production, so the vocabulary and schema are exercised early. Where a page states a rule the vocabulary can't express, label it as a fuzzy rule and add the page id to a **vocabulary gaps** list. That list drives v2 of the vocabulary.

## Sourcing (no aggregators)

Do not use Fastweb, Scholarships.com or similar. Pull from primary sources:

- San Diego Foundation and other community foundations (San Diego County first, then California, then a national sample).
- County and state bar associations, medical, nursing and engineering societies.
- Union locals, Elks/Rotary/Lions/Knights of Columbus lodges, credit unions, co-ops.
- University and community college financial aid pages; state higher-ed agencies (CSAC).
- Federal programs and private foundations (IRS 990-PF filers).

Claude Code finds and proposes candidates per stratum (about 350 to end with 300 after dead links and duplicates). You approve the list before anything is fetched. Fetching respects robots.txt and is slow and polite; save with a plain script, not a crawler.

## Labeling workflow

Labeling from scratch costs about 8 to 10 minutes a page; reviewing a draft costs about 3. But a model-drafted label biases the reviewer toward agreeing (anchoring), and if the same model is later scored against its own draft, the score is inflated.

1. **Draft:** Claude Code reads each snapshot and writes a draft `gold.json`.
2. **Review:** you check every draft against the page text and fix it. Every rule's `source_quote` is verified by script to appear in `text.txt`, so quotes can't be invented.
3. **Anchoring check:** 30 pages (chosen at random) are labeled by you from scratch first, then compared with the draft. Field agreement on those 30 tells us how much drafting biased review. If agreement is above about 95% the bias is small; if lower, more pages get from-scratch labels.
4. **Second look:** the 45 hardest pages (all listings and hard cases) get a second review a day later.
5. **Freeze:** lock the split, tag the commit, record the date.

Estimated effort: about 20 hours of your time total (300 reviews at ~3 min = 15 h, 30 from-scratch extras ≈ 4 h, second looks ≈ 1.5 h), spread over 2 to 3 weeks in 1-hour sessions. API cost for baseline runs is under $10 (300 pages × ~$0.012 with a Haiku-class model).

## Scoring

Automatic script (`backend/test-sets/score.mjs`), run against dev or test:

| Metric | How it's computed | Target to proceed |
|---|---|---|
| Triage F1 | scholarship page vs not, and single vs listing | ≥ 0.95 |
| Name, amount range, deadline, apply URL | exact match after normalization | ≥ 95% each |
| Rule recall | share of gold rules found (field + op + value match) | ≥ 85% |
| Rule precision | share of extracted rules that are in gold | ≥ 92% |
| **Quote-in-page rate** | every extracted rule's `source_quote` appears in `text.txt` (needs no gold) | 100%, hard requirement |
| Confidence calibration | records bucketed by the model's confidence vs actual correctness | Pick the auto-publish cutoff where precision ≥ 98% |

Anything below target goes into the review queue by default; the targets decide how much manual review the system needs, not whether it launches.

## Build order

1. ~~**Tooling**~~ (done 2026-09-29, `backend/test-sets/README.md`) (~1 day): snapshot script, `manifest.json` builder, quote checker, `score.mjs`, label template. Test them on 5 pages.
2. ~~**Candidate list**~~ (350 URLs drafted 2026-09-29 in `candidates.src.txt`; awaiting your approval) (~1 day of Claude Code work, 1 h of your approval): 350 URLs with proposed stratum tags.
3. ~~**Snapshot**~~ (done 2026-09-29: 318 usable pages of 415 attempted; see `pages/manifest.json`)
4. **Draft labels** with Claude Code in batches of 25.
5. **Review** sessions, from-scratch 30 first (before you see any drafts).
6. **Freeze and baseline:** run the first extractor prompt on dev only; report scores.
7. Feed the vocabulary-gaps list back into `backend/contract/`.

## Decisions I'd default on unless you object

- Split 100 dev / 200 test, locked.
- Snapshots are committed to git only if the total is small (a few hundred MB is not); otherwise keep them out of git and back them up to Supabase Storage or a drive.
- You are the only labeler. A second human would be better, but a solo build can't afford one; the from-scratch subset is the substitute.
