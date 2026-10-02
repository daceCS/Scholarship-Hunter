// Why do students remove scholarships from their dashboard? An AI agent reads each removal and diagnoses it, so the
// matching engine and the scholarship records can be tuned. Run it when you want it to; nothing runs on a schedule.
//   node analyze-dismissals.mjs --dry-run          show exactly what would be sent for each removal (no API call, no cost)
//   node analyze-dismissals.mjs                    analyze removals that have no analysis yet (--limit 20, --all to redo every one)
//   node analyze-dismissals.mjs --report           summary: diagnoses, most-removed scholarships, suggested fixes
// Flags: --model (default claude-sonnet-5-5)  --effort medium  --concurrency 3  --limit 20
// Removals made for taste (not interested, amount too small, deadline too soon) are labelled "preference" without calling the model.
// Nothing is changed automatically: the output is a list of suggested fixes for a person to review.
// What the model sees is defined in dismissal-case.mjs (anonymous, only the profile fields this scholarship's rules read).
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { initSupabase } from './db.mjs';
import { normalizeAvatar } from './profile.mjs';
import { buildCase } from './dismissal-case.mjs';
import { parseArgs } from './test-sets/lib.mjs';
import { callModel, textOf, parseJson, cost, pool } from './extract/extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const supabase = initSupabase();

const DIAGNOSES = ['already_fixed', 'missing_requirement', 'rule_too_soft', 'question_gap', 'engine_bug', 'student_error', 'preference', 'cannot_tell'];
const WHERE = ['record', 'extraction_prompt', 'vocabulary_questionnaire', 'engine', 'none'];
const TASTE = new Set(['not_interested', 'amount_too_small', 'deadline_too_soon']);
const PAGE_CHARS = 40000;

export const SYSTEM = `You help tune a scholarship-matching engine. A student removed a scholarship from their list, saying it was not a match. You receive a case file as JSON:
- student: their stated reason, an optional note in their own words, and the profile answers that matter for this award (anonymous).
- scholarship: the record the engine used, and engine.rules: every eligibility rule with the engine's verdict for this student (pass, fail, or unknown; "unknown" means the engine could not tell and kept the award as a "possible" match).
- page_text: the provider's page the record was read from (it may be missing or cut short).
Decide the most likely reason the engine showed an award this student did not want, and what would prevent it. engine.overall is the engine's verdict TODAY. The student removed the award earlier, when it was shown, so records and rules may have been corrected since.
Choose exactly one diagnosis:
- already_fixed: engine.overall is "ineligible" today, so the award would no longer be shown to this student; the record or rules were corrected after the student removed it. Use this instead of engine_bug whenever the engine now rules the award out.
- missing_requirement: the page states a requirement that no rule captures, and the student does not meet it. Suggest the rule.
- rule_too_soft: a fuzzy or "unknown" rule is something the student plainly fails; it could be made a precise rule or a question.
- question_gap: the record carries a requirement the questionnaire never asks about (see requirements_not_expressible), so the engine could not use it.
- engine_bug: engine.overall is still "possible" or "eligible", yet the rules and the student's answers were enough to rule the award out, but the engine did not (for example a value that should have matched but did not).
- student_error: the student appears to meet every requirement; the removal looks mistaken or the award was unclear.
- preference: a valid match the student simply does not want.
- cannot_tell: not enough information.
Rules: base every claim on the case file; never guess about the student beyond it. If you cite the page, evidence_quote must be copied word for word from page_text, otherwise null. Prefer the student's own note when it names the problem. Keep explanation to two sentences.
Reply with only this JSON object:
{"diagnosis": "<one of the above>", "confidence": <0 to 1>, "explanation": "<plain words>", "evidence_quote": "<verbatim from page_text or null>", "suggested_fix": {"where": "record|extraction_prompt|vocabulary_questionnaire|engine|none", "action": "<one concrete step>"}}`;

const squash = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

export function validate(a, pageText) {
  const errors = [];
  if (!a || typeof a !== 'object') return ['not an object'];
  if (!DIAGNOSES.includes(a.diagnosis)) errors.push('diagnosis must be one of ' + DIAGNOSES.join(', '));
  if (typeof a.confidence !== 'number' || a.confidence < 0 || a.confidence > 1) errors.push('confidence must be 0 to 1');
  if (typeof a.explanation !== 'string' || !a.explanation) errors.push('explanation is required');
  if (!a.suggested_fix || !WHERE.includes(a.suggested_fix.where) || typeof a.suggested_fix.action !== 'string') errors.push('suggested_fix needs where (' + WHERE.join('|') + ') and action');
  if (a.evidence_quote && !(pageText && squash(pageText).includes(squash(a.evidence_quote)))) { a.evidence_quote = null; a.quote_not_found_on_page = true; }
  return errors;
}

async function loadCases(rows) {
  const out = [];
  for (const d of rows) {
    const { data: sch } = await supabase.from('scholarships').select('id, name, provider_org, source_url, amount, deadline, levels, eligibility, full_data, page_id').eq('id', d.scholarship_id).maybeSingle();
    const { data: prof } = await supabase.from('profiles').select('core_json, sensitive_json').eq('user_id', d.user_id).order('version', { ascending: false }).limit(1);
    if (!sch || !prof?.length) continue;
    const profile = normalizeAvatar({ ...prof[0].core_json, ...(prof[0].sensitive_json || {}) });
    const pageFile = path.join(here, 'test-sets/pages', String(sch.page_id).split('#')[0], 'text.txt');
    const pageText = fs.existsSync(pageFile) ? fs.readFileSync(pageFile, 'utf8').slice(0, PAGE_CHARS) : null;
    out.push({ d, sch, pageText, case: buildCase({ dismissal: d, scholarship: sch, profile, pageText }) });
  }
  return out;
}

async function report() {
  const { data, error } = await supabase.from('dismissals').select('scholarship_id, reason, note, analysis, scholarships(name)').not('analysis', 'is', null);
  if (error) throw error;
  if (!data.length) { console.log('No analyzed removals yet. Run: node analyze-dismissals.mjs'); return; }
  const tally = (rows, f) => Object.entries(rows.reduce((o, r) => (o[f(r)] = (o[f(r)] || 0) + 1, o), {})).sort((a, b) => b[1] - a[1]);
  console.log(`${data.length} analyzed removal(s)\n\nDiagnoses:`);
  for (const [k, n] of tally(data, r => r.analysis.diagnosis)) console.log(`  ${String(n).padStart(3)}  ${k}`);
  console.log('\nStated reasons:');
  for (const [k, n] of tally(data, r => r.reason)) console.log(`  ${String(n).padStart(3)}  ${k}`);
  const fixes = data.filter(r => r.analysis.suggested_fix?.where && r.analysis.suggested_fix.where !== 'none');
  console.log('\nSuggested fixes, grouped by where they go:');
  for (const where of WHERE.filter(w => w !== 'none')) {
    const rows = fixes.filter(r => r.analysis.suggested_fix.where === where);
    if (!rows.length) continue;
    console.log(`\n  ${where} (${rows.length})`);
    const byAction = new Map();
    for (const r of rows) { const k = r.analysis.suggested_fix.action; (byAction.get(k) || byAction.set(k, []).get(k)).push(r); }
    for (const [action, rs] of [...byAction].sort((a, b) => b[1].length - a[1].length)) console.log(`   - ${action}  [${[...new Set(rs.map(r => r.scholarships?.name))].slice(0, 3).join('; ')}]${rs.length > 1 ? ` x${rs.length}` : ''}`);
  }
  console.log('\nMost-removed scholarships:');
  for (const [k, n] of tally(data, r => r.scholarships?.name || r.scholarship_id).slice(0, 10)) console.log(`  ${String(n).padStart(3)}  ${k}`);
}

async function main() {
  if (args.report) return report();
  let q = supabase.from('dismissals').select('user_id, scholarship_id, reason, note, created_at').order('created_at').limit(Number(args.limit || 20));
  if (!args.all) q = q.is('analyzed_at', null);
  const { data: rows, error } = await q;
  if (error) { console.error(error.message.includes('dismissals') ? 'The dismissals table is not set up. Run backend/dismissals.sql in the Supabase SQL editor.' : error.message); process.exit(1); }
  if (!rows.length) { console.log('Nothing to analyze.'); return; }

  const cases = await loadCases(rows);
  const model = args.model || 'claude-sonnet-5-5', effort = args.effort || 'medium';
  const needModel = cases.filter(c => !TASTE.has(c.d.reason));
  console.log(`${rows.length} removal(s): ${cases.length - needModel.length} are preferences (no model call), ${needModel.length} need the agent (${model}, effort ${effort}).`);

  if (args['dry-run']) {
    for (const c of needModel) console.log('\n--- what the agent would see ---\n' + JSON.stringify(c.case, null, 1).slice(0, 3500));
    const chars = needModel.reduce((s, c) => s + JSON.stringify(c.case).length + SYSTEM.length, 0);
    console.log(`\nRough cost: about $${(chars / 4 * 2 / 1e6 + needModel.length * 600 * 10 / 1e6).toFixed(2)}. Nothing was sent.`);
    return;
  }

  const save = (c, analysis) => supabase.from('dismissals').update({ analysis, analyzed_at: new Date().toISOString() }).eq('user_id', c.d.user_id).eq('scholarship_id', c.d.scholarship_id);
  for (const c of cases.filter(c => TASTE.has(c.d.reason))) await save(c, { diagnosis: 'preference', confidence: 1, explanation: `The student said: ${c.d.reason.replace(/_/g, ' ')}.`, evidence_quote: null, suggested_fix: { where: 'none', action: 'none' }, source: 'stated reason' });
  if (!needModel.length) { console.log('Done.'); return; }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY is not set (backend/.env).'); process.exit(2); }

  const client = new Anthropic({ maxRetries: 5 });
  const system = [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }];
  let total = 0, done = 0;
  await pool(needModel, Number(args.concurrency || 3), async c => {
    const name = c.sch.name.slice(0, 50);
    try {
      const messages = [{ role: 'user', content: JSON.stringify(c.case) }];
      let analysis = null, usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
      for (let attempt = 0; attempt < 2 && !analysis; attempt++) {
        const msg = await callModel(client, { model, effort, system, messages });
        for (const k of Object.keys(usage)) usage[k] += msg.usage?.[k] || 0;
        let a, errs;
        try { a = parseJson(textOf(msg)); errs = validate(a, c.pageText); } catch (e) { errs = ['reply was not valid JSON']; }
        if (!errs.length) analysis = { ...a, source: 'agent', model };
        else { messages.push({ role: 'assistant', content: msg.content }, { role: 'user', content: 'Problems: ' + errs.join('; ') + '. Return the corrected JSON object only.' }); }
      }
      total += cost(model, usage);
      if (analysis) await save(c, analysis);
      console.log(`[${++done}/${needModel.length}] ${name}: ${analysis ? `${analysis.diagnosis} (${analysis.confidence})` : 'NO VALID ANSWER (left unanalyzed)'}`);
    } catch (e) { console.log(`[${++done}/${needModel.length}] ${name}: FAILED ${e.message}`); }
  });
  console.log(`\nDone. About $${total.toFixed(2)}. See the results with: node analyze-dismissals.mjs --report`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
