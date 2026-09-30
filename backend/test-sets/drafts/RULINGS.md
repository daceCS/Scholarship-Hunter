## Rulings (approved by the project owner; they override any other judgment)
These settle recurring judgment calls. Apply them exactly. Do not mark a page "unsure" because of a point a ruling already covers.

1. **Amount = the most one individual winner could receive.** The number a student sees must be what they could win themselves, never a pool or program total.
   - A per-award amount is stated ("five $10,000 scholarships", "$2,000 to each student"): `min` and `max` are both that amount; put the number of awards in `amount.note`.
   - It is unclear whether a stated amount is per winner or shared ("$2,500 awarded to two students", "2 Scholarships - $2,500"): `min: 0`, `max` = the stated amount, and say in `amount.note` that the page does not say which.
   - A pool shared among several winners with no per-winner figure ("$15,000 shared among 5 winners"): `min: 0`, `max` = the pool (the most anyone could receive), and say in `amount.note` that it is a shared pool with no per-winner amount stated. Do not divide the pool yourself.
   - Tiers or ranges ("$1,000 to $60,000", state/regional/national prizes): `min` = the smallest, `max` = the largest; list the tiers in `amount.note`.
2. **A page that only offers an application link, with no award facts:** `page_type: single`, `is_scholarship_page: true`, with a minimal record: name, organization, `apply_url`, `amount` 0/0 with a note, `deadline: null`, `cycle_status: unknown`, and no rules.
3. **Recommendation letters required but no count given:** `recs_required: 1`.
4. **"Engineering" majors:** CIP family `14` only. Include engineering technology (`15`) only when the page mentions technology.
5. **Exclusions such as "not the child of a Rotarian":** put them in `vocabulary_gaps`. Do not encode them as a fuzzy rule.
6. **Financial need mentioned only as a factor judges consider:** leave `need_based` unset. Set `need_based: "need"` only when need is a stated requirement to apply, and `"merit"` only when the page says need is not considered.
7. **Renewable:** set `amount.renewable: true` only when the page says THIS award renews or can be renewed. If only some awards in a program renew, leave it unset and say so in `notes`.
8. **Levels:** set `levels` only when the page names a level (high school, undergraduate, graduate). Do not infer a level from a credential or program type.
9. **"File the FAFSA" (or a similar filing) as the way to apply:** that is the application route, not an eligibility rule. Mention it in `notes`; do not make a rule from it.
10. **A page that names organizations rather than awards** (for example a list of professional societies): leave `award_names` empty and explain in `notes`. `award_names` is only for things the page itself calls a scholarship, award, grant or fellowship.
11. **Named awards with their own amounts:** when a page lists several named awards and gives each its own amount, extract one record per named award, each with its own amount. When it lists awards but gives no separate amount or details for each, extract one record for the program and list the names in `notes`.
