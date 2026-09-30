# Test-set tooling

Plan: `extraction-pages-plan.md`. Everything here is plain Node (v22), no build step. `npm install` once, then `npm test` runs a self-test against a local server (no real sites touched).

| Script | What it does |
|---|---|
| `snapshot.mjs` | Fetch URLs, obey robots.txt, wait between requests to the same host, save `pages/<id>/raw.html\|raw.pdf` + `text.txt`, update `pages/manifest.json`. Flags pages that look JavaScript-rendered (`js_suspect`). |
| `new-label.mjs` | Create a starter `gold.json` for snapshotted pages that have none. |
| `check-labels.mjs` | Validate every label: schema, vocabulary, and that every `source_quote` really appears in the page text. Prints counts by page type, status and split, plus the vocabulary-gaps list. |
| `score.mjs` | Score an extractor's output directory against the gold labels (triage, fields, rules, quote-in-page, confidence calibration and the auto-publish cutoff). |
| `candidates.mjs` | Builds `candidates.tsv` from `candidates.src.txt` (pipe-separated, one candidate URL per line, editable) and prints counts by page type, geography and source type. |
| `split.mjs` | Chooses the final 300 pages and splits them 100 dev / 200 locked test **by provider group**, so one provider or one award never spans both. Writes `selected`/`split`/`group` into the manifest and a tracked `split-lock.json`. Refuses to re-run once the lock exists. |
| `plan-labels.mjs` | Picks the 30 from-scratch dev pages (never drafted) and each draft batch; writes the tracked `label-plan.json`. |
| `apply-drafts.mjs` | Writes a `drafts/batch-NN.mjs` file into the pages' `gold.json` files as `draft` (refuses from-scratch or already-reviewed pages). |
| `review-html.mjs` | Builds `review/batch-NN.html`: draft next to page text with each rule's quote highlighted. |
| `mark-reviewed.mjs` | After a person has checked a batch, records `reviewed`, the reviewer and the date. Refuses labels that still fail `check-labels`. |
| `from-scratch-html.mjs` | Builds `review/from-scratch.html`: the 30 anchoring-check pages with a plain-language form and no draft. Answers autosave in the browser and export as JSON. |
| `check-drafts.mjs` | Validates a drafts file (schema, vocabulary, quotes on the page) without touching any `gold.json`. |
| `plan-chunks.mjs` | Splits the unlabeled pages into 8 work chunks (2 dev, 6 test) for two independent model drafts each. |
| `drafts/AGENT_PROMPT.md` | The instructions every drafting agent reads. Slot A and slot B write `drafts/A|B/chunk-NN.mjs` independently. |
| `compare-drafts.mjs` | Compares slot A and slot B per page: `agree` (safe to accept) or `review` (a person decides). |
| `gold.schema.json` | Page-level label format. Each scholarship inside is validated against `../contract/scholarship.schema.json`. |

## Typical run

```
# SNAPSHOT_CONTACT lives in the git-ignored .env file (goes in the crawler's User-Agent)
node candidates.mjs                                      # rebuild candidates.tsv after editing candidates.src.txt
node snapshot.mjs urls.tsv                               # url<TAB>page_type<TAB>source_type<TAB>geo, tags optional
node new-label.mjs --all
# ... draft and review labels in pages/<id>/gold.json ...
node check-labels.mjs
node score.mjs --pred predictions/run1 --split dev
```

`pages/` and `predictions/` are git-ignored (snapshots can get large; back them up separately).

## Label conventions

- `review_status`: `draft` (model or first pass) -> `reviewed` (you checked it against the page) -> `second_look` (hard pages, checked again a day later).
- `from_scratch: true` marks the 30 pages labeled without seeing a draft (the anchoring check).
- Add anything the vocabulary can't express to `vocabulary_gaps`; that list feeds vocabulary v2.
- A `reviewed` label with any problem makes `check-labels` exit non-zero. Problems in drafts are reported but tolerated.

## Prediction files

One `<page id>.json` per page in the same shape as `gold.json`: `page_type`, `is_scholarship_page`, `scholarships[]` (each with a `confidence`), `follow_links`. A missing file counts as "not a scholarship page, nothing extracted".

## Scoring notes

- Predicted and gold awards on a page are paired by name similarity (word overlap >= 0.6).
- Rules are compared as `(field, op, value)`; group structure is ignored. Fuzzy rules compare by the fields they may read, since their wording can't be compared automatically.
- A record counts as correct only if name, amount, deadline, URL and the full rule set all match. The auto-publish cutoff is the lowest confidence at which accepted records are >= 98% correct (needs 20+ records).
