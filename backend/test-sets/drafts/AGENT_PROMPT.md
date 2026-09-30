# Instructions for a drafting agent

You write draft labels for a chunk of saved scholarship web pages and PDFs, working alone. This file plus the files it names are all the context you need. Your spawn message told you two things: your **chunk number** (NN) and your **slot** (A or B).

## Purpose
A student-scholarship matching product needs an AI that reads a scholarship page and produces structured data. To measure that AI we keep "gold" labels for saved pages. A label says what kind of page it is and, for each scholarship on it, the name, amount, deadline and eligibility rules, with the exact sentence each rule came from. Write these labels for your chunk as if you were the extractor.

Another agent (the other slot) drafts the same pages independently. A program compares the two drafts, and people review only the pages where you disagree. So your labels must come ONLY from the page text and your own judgment, and be as careful as you can. Do not try to guess what the other draft says.

## Independence rules (strict)
- Do NOT open, list, search for, or read: the folder `drafts/A/` if you are slot B, or `drafts/B/` if you are slot A (never the other slot's files); `drafts/hidden/`; any `gold.json` file; any `review/` file; any `from-scratch-answers.json`; anything in the user's Downloads folder.
- Do NOT run `apply-drafts.mjs`, `check-labels.mjs`, `mark-reviewed.mjs`, or anything that writes labels. Do not edit or create any file except your single output file.
- Do not fetch anything from the internet. Use only the saved page text.
- Do not spawn other agents.

## Where things are
Working directory: `C:\Users\David\Desktop\Scholarship Hunter\backend\test-sets` (paths below are relative to it).
- `drafts/chunks/chunk-NN.json`: `ids` lists the pages you must label.
- `pages/manifest.json`: one row per page with `id`, `url`, `kind` (`html` or `pdf`).
- `pages/<id>/text.txt`: the saved page text. Links appear as `link text (https://url)`.
- `../contract/scholarship.schema.json`: the exact shape of one scholarship record.
- `../contract/vocabulary.json`: every profile field a rule may use (`path`, `type`, allowed `values`, `role`). Rules may only use fields with `role: "eligibility"` and the ops listed for that field type in `ops_by_type`. `identity.citizenship` values: us_citizen, us_national, permanent_resident, refugee_asylee, daca_tps, other. County values look like `San Diego County, CA`. Use CIP code prefixes (for example `14` engineering, `22.01` law, `51.38` nursing, `13` education, `52` business) with `prefix_any` on `academic.cip_codes`.
- `gold.schema.json`: the page-level shape (`page_type`, `is_scholarship_page`, `scholarships`, `follow_links`, `award_names`, `vocabulary_gaps`, `notes`).
- `drafts/batch-01.mjs`: a finished EXAMPLE of the exact output format, including the helper functions `H` (hard rule), `F` (fuzzy rule), `G` (any-one-of group) and the level of care expected. Copy the format and helpers, never the content.

## Output
Create exactly one file: `drafts/<slot>/chunk-NN.mjs` (for example `drafts/A/chunk-01.mjs`). It must `export default` an object keyed by page URL (exactly as in the manifest), one entry per page, in the same shape as `batch-01.mjs`. Do not put `review_status`, `labeler`, or `from_scratch` in entries. Create the folder if it does not exist.

## Labeling rules
- `page_type`: `single` (page describes one award), `listing` (several awards), `not_scholarship` (news, about pages, loans, jobs, grants to organizations, discount programs, error pages, placeholders, anything a student cannot apply to as a scholarship), `pdf_form` (a PDF that is a scholarship application, flyer or guidelines). `is_scholarship_page` is false only for `not_scholarship`. Decide from the page text, not from the URL.
- Listing pages: if the page gives enough detail per award to fill the required fields, extract each award as a scholarship record. Otherwise leave `scholarships` empty and list the individual award names in `award_names`. Put URLs in `follow_links` only if the full URLs of individual award pages appear in the text.
- Amount not stated: `min: 0, max: 0` with an `amount.note`. "Up to $X": `min: 0, max: X`. A range: min and max.
- Deadline not stated: `null` and `cycle_status: "unknown"`. Today is 2026-09-29. A stated deadline before today: `closed`. A deadline in the future: `open`. A cycle that has not opened yet: `upcoming`. Only a month and no year: `null` with `deadline_kind: "annual_estimate"`.
- `essay_words` is the limit for ONE essay. `apply_url` is the page's own apply link if it gives one, otherwise the page URL itself. `source_url` is the page URL.
- Rules: one requirement per rule. Alternatives ("A or B") go in one `G(...)` group as separate rules; different requirements are separate groups. Use a hard rule (`H`) only when a vocabulary field can express the requirement exactly. Use a fuzzy rule (`F`) for soft or judgment requirements (leadership, commitment, "planning a career in ...") and give it `relevant_fields` from the vocabulary. Requirements no field can express (class rank, nomination by an institution, discharge status, and similar) go in `vocabulary_gaps` in plain words, not into a rule.
- What judges look for when choosing winners is NOT eligibility, so do not make rules from evaluation criteria or essay topics.
- Every rule's `source_quote` and every `provenance` quote must be copied verbatim from the page text (case, extra spaces and curly-versus-straight quotes do not matter, but the words must match). Prefer short, distinctive phrases. Never invent or paraphrase a quote. Add `provenance` entries for amount, deadline, effort and similar facts you extract.
- `confidence` is your honest 0 to 1 estimate that the record is right. `verified_at` is `2026-09-29`.
- Use `notes` for anything ambiguous. Do not guess facts the page does not state.

## Rulings (approved by the project owner; they override any other judgment)
These settle recurring judgment calls. Apply them exactly. Do not mark a page "unsure" because of a point a ruling already covers.

1. **Prize pool shared by several winners** (for example $15,000 for 5 winners): record the pool as `max` (with `min: 0`) and say in `amount.note` that it is shared. Use a per-award amount only when the page states one.
2. **A page that only offers an application link, with no award facts:** `page_type: single`, `is_scholarship_page: true`, with a minimal record: name, organization, `apply_url`, `amount` 0/0 with a note, `deadline: null`, `cycle_status: unknown`, and no rules.
3. **Recommendation letters required but no count given:** `recs_required: 1`.
4. **"Engineering" majors:** CIP family `14` only. Include engineering technology (`15`) only when the page mentions technology.
5. **Exclusions such as "not the child of a Rotarian":** put them in `vocabulary_gaps`. Do not encode them as a fuzzy rule.
6. **Financial need mentioned only as a factor judges consider:** leave `need_based` unset. Set `need_based: "need"` only when need is a stated requirement to apply, and `"merit"` only when the page says need is not considered.
7. **Renewable:** set `amount.renewable: true` only when the page says THIS award renews or can be renewed. If only some awards in a program renew, leave it unset and say so in `notes`.
8. **Levels:** set `levels` only when the page names a level (high school, undergraduate, graduate). Do not infer a level from a credential or program type.
9. **"File the FAFSA" (or a similar filing) as the way to apply:** that is the application route, not an eligibility rule. Mention it in `notes`; do not make a rule from it.
10. **A page that names organizations rather than awards** (for example a list of professional societies): leave `award_names` empty and explain in `notes`. `award_names` is only for things the page itself calls a scholarship, award, grant or fellowship.

## Validate
From the working directory run `node check-drafts.mjs drafts/<slot>/chunk-NN.mjs --chunk drafts/chunks/chunk-NN.json` and fix problems until it prints `OK`. It checks schema, vocabulary, quotes on the page, and that you covered exactly the pages in the chunk. Some pages are long; read each one properly. Work through the chunk in order and write the file in pieces if you need to, but the final file must be complete and valid.

## Report back
Reply in under 100 words with: pages drafted, counts by `page_type`, total scholarship records, and whether validation printed OK. No award facts.
