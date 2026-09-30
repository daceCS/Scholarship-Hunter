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
