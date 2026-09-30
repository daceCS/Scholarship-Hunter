// Read what test users reported.
//   node feedback-report.mjs            new reports, grouped by scholarship (most reported first)
//   node feedback-report.mjs --all      include seen / fixed reports
//   node feedback-report.mjs --mark seen|fixed|wont_fix --ids 3,4,5     update the status of reports
import 'dotenv/config';
import { initSupabase } from './db.mjs';

const args = process.argv.slice(2);
const flag = n => args.includes('--' + n);
const val = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
const supabase = initSupabase();

if (val('mark')) {
  const ids = (val('ids') || '').split(',').map(Number).filter(Boolean);
  if (!['seen', 'fixed', 'wont_fix'].includes(val('mark')) || !ids.length) { console.error('usage: --mark seen|fixed|wont_fix --ids 1,2,3'); process.exit(2); }
  const { error } = await supabase.from('feedback').update({ status: val('mark') }).in('id', ids);
  if (error) throw error;
  console.log(`marked ${ids.length} report(s) ${val('mark')}`);
  process.exit(0);
}

let q = supabase.from('feedback').select('id, scholarship_id, scholarship_name, scholarship_source_url, kind, message, status, created_at').order('created_at', { ascending: false }).limit(500);
if (!flag('all')) q = q.eq('status', 'new');
const { data, error } = await q;
if (error) { console.error(error.message.includes('feedback') ? 'The feedback table does not exist yet. Run backend/feedback.sql in the Supabase SQL editor.' : error.message); process.exit(1); }
if (!data.length) { console.log('No reports.'); process.exit(0); }

const groups = new Map();
for (const r of data) { const k = r.scholarship_name; (groups.get(k) || groups.set(k, []).get(k)).push(r); }
const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
console.log(`${data.length} report(s) on ${sorted.length} scholarship(s)\n`);
for (const [name, rs] of sorted) {
  console.log(`${name}  (${rs.length})  ${rs[0].scholarship_source_url || ''}`);
  for (const r of rs) console.log(`  #${r.id} [${r.kind}]${r.status !== 'new' ? ' (' + r.status + ')' : ''} ${r.created_at.slice(0, 16).replace('T', ' ')}  ${r.message || ''}`);
}
