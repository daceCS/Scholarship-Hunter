# Idea: vector (embedding) ranking on top of the rule engine

Status: idea, not started. Written 2026-10-02. Revisit when there is real dismissal / save data (see "When to revisit").

## The question
Could we turn each student's avatar (profile answers) into a vector, turn each scholarship into a vector, and match by closeness in vector space?

## Short answer
Yes, it is possible, but use it to **rank**, not to decide **eligibility**. Keep the rule engine (`backend/match.mjs`) as the gate.

## Why not for eligibility
Eligibility is mostly hard yes/no rules: "must attend UC San Diego", "GPA 3.0 or higher", "San Diego County resident", "first-year students only". Embeddings measure similarity, not whether a requirement is met.
- A UCSD-only award and an SDSU-only award sit very close together in vector space, but a student can qualify for only one.
- Negation, thresholds and "only" are what embeddings handle worst.
- We already fixed three bugs of exactly this kind (UCSD-only awards, transfer awards, school-name spelling). Each was a hard rule; a vector approach would blur all of them.
- No explanation ("why am I seeing this?"), which the dismissal analysis (`backend/analyze-dismissals.mjs`) relies on.

## Where vectors could help
1. **Fuzzy rules.** Rules like "has an interest in communications" or "commitment to teaching" can never pass or fail today, so they always leave an award at "possible". That is most of the long "possible" list. A similarity score between the student's majors / activities / interests and the rule's wording could turn them into a ranking.
2. **Ordering the "possible" tier**, closest fits first.
3. **"More like this"** from awards a student saved or applied to.
4. **Duplicate / cluster detection** across the scholarship database.

## Costs and requirements
- **Embedding provider.** As far as we know Anthropic has no embeddings endpoint (verify), so this means a new vendor or a self-hosted open-source model. A vendor means another privacy-policy change (profile text leaves the app); self-hosting avoids that.
- **Storage.** Supabase supports vector columns (pgvector), so storage and search are easy.
- **Scale.** About 335 scholarships today; checking rules against all of them is instant. Vector search only matters at tens of thousands.
- **Alternative to embeddings:** an LLM judges a fuzzy rule for one student vs one award. More accurate, higher cost per match; better as an experiment on a student's top matches than as the default.

## Recommendation
Rule engine stays the gate. Add a similarity score later to order "possible" matches and to score fuzzy rules, but only if an offline experiment shows it beats the current ordering.

## Offline experiment (when there is data)
1. Export labels: for each (student, scholarship) shown, did the student **save / apply** (keep) or **remove** (dismissals table, with reason)?
2. Compute a similarity score for each pair (start with a small open-source embedding model run locally, so no profile data leaves the machine).
3. Compare: does the score predict keep vs remove better than the current ordering (`score` from the engine, tier eligible/possible)? Measure e.g. precision in the top 10 and how many removals fall in the top 10.
4. Try the LLM-judge variant on the same pairs for comparison (cost per pair is the trade-off).
5. Adopt only if it clearly wins. Otherwise drop the idea.

## When to revisit
- At least a few dozen real students with several removals / saves each, or
- the "possible" list is still too long after more records are verified and fuzzy rules are tightened, or
- the scholarship database grows past a few thousand records.

## Related
- `backend/match.mjs` (rule engine), `backend/analyze-dismissals.mjs` and `backend/dismissals.sql` (the behavior data this needs).
