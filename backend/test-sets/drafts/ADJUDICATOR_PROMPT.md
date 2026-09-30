# Instructions for an adjudicator agent

Two agents drafted labels for the same saved scholarship pages, independently. On some pages their drafts disagree. You settle those pages. Your spawn message told you your **chunk number** (NN). This file plus the files it names are all the context you need.

## Purpose
A student-scholarship matching product needs an AI that reads a scholarship page and produces structured data. To measure that AI we keep "gold" labels for saved pages. A label says what kind of page it is and, for each scholarship on it, the name, amount, deadline and eligibility rules, with the exact sentence each rule came from. Your final labels become the gold labels for the disputed pages, so accuracy matters more than speed. The PAGE TEXT is the only authority. Neither draft is trusted: do not pick a winner by default, do not split the difference, and do not assume agreement between the drafts means a fact is right.

## Independence and safety rules (strict)
- Do NOT open, list, search for, or read: any `gold.json` file; any `review/` file; any `from-scratch-answers.json`; `drafts/hidden/`; anything in the user's Downloads folder.
- Do NOT run `apply-drafts.mjs`, `check-labels.mjs`, `mark-reviewed.mjs`, or anything that writes labels. Do not edit or create any file except your single output file.
- Do not fetch anything from the internet. Do not spawn other agents.

## Where things are
Working directory: `C:\Users\David\Desktop\Scholarship Hunter\backend\test-sets` (paths relative to it).
- `drafts/compare/chunk-NN.json`: keyed by page id. Only pages with `status: "review"` are yours. `major` lists what differs: page type, awards found, amount, deadline, cycle status, need-based, service obligation, renewable, essay words, recommendation letters, formats, levels, and rules (`only_a` / `only_b` are rules one draft has and the other lacks, `conflicts` are matched requirements encoded differently). `minor` differences do not need a decision.
- `drafts/A/chunk-NN.mjs` and `drafts/B/chunk-NN.mjs`: the two drafts, each an object keyed by page URL. The slot letters are arbitrary; treat them as "draft 1" and "draft 2".
- `pages/manifest.json` (`id`, `url`, `kind`) and `pages/<id>/text.txt`: the saved page text. Links appear as `link text (https://url)`.
- `../contract/scholarship.schema.json`, `../contract/vocabulary.json`, `gold.schema.json`: the output formats and the fields a rule may use. Rules may only use fields with `role: "eligibility"` and the ops listed for that field type in `ops_by_type`.
- `drafts/batch-01.mjs`: a finished example of the exact output format and helper functions `H` (hard rule), `F` (fuzzy rule), `G` (any-one-of group).
- `drafts/AGENT_PROMPT.md`: the labeling conventions both drafters followed. Follow the same conventions (page types, amount and deadline handling, one requirement per rule, quotes verbatim, vocabulary gaps, and so on).

## What to do
For EVERY page with `status: "review"` in your chunk's compare file:
1. Read the page text carefully. Then read both drafts and the list of differences.
2. Decide each disputed point from the page text. If both drafts are wrong, fix it. If a point is genuinely ambiguous on the page, choose the reading a careful person would most likely choose and record the doubt.
3. Write the complete final label for that page: the same page-level shape as the drafts (`page_type`, `is_scholarship_page`, `scholarships`, `follow_links`, `award_names`, `vocabulary_gaps`, `notes`). Every rule quote must be copied verbatim from the page text.
4. Apply the Rulings section to every part of the page label, including parts where the two drafts agree. Then record in a `meta` entry whether you are unsure and why.

Do not label pages whose status is `agree`; they are not your job.

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

## Output
Create exactly one file: `drafts/final/chunk-NN.mjs` (create the folder if needed). It must have:
- `export default { "<page url>": <final label>, ... }` covering exactly the pages with status `review`, in the same shape as the drafts.
- `export const meta = { "<page url>": { unsure: <true|false>, reasons: ["short plain-language reason", ...] }, ... }` with one entry for every page. Set `unsure: true` when a careful person could reasonably disagree (but NOT for points the Rulings section already settles) with a decision you made, when the page is genuinely ambiguous, or when the page is so large that you could not check it fully. Keep reasons short and concrete (what the doubt is, not the facts).

## Validate
From the working directory run `node check-drafts.mjs drafts/final/chunk-NN.mjs --chunk drafts/compare/chunk-NN.json` and fix problems until it prints `OK`. It checks schema, vocabulary, quotes on the page, and that you covered exactly the pages that needed adjudication. Some pages are long (some have dozens of awards); read them properly.

## Report back
Reply in under 100 words with: pages adjudicated, how many you marked unsure, and whether validation printed OK. No award facts.
