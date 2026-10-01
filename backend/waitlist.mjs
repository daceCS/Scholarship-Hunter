// Manage the early-access waitlist.
//   node waitlist.mjs                      pending people, oldest first (--all shows everyone)
//   node waitlist.mjs --approve a@x.com,b@y.com   approve them and email each an invitation to set a password
//   node waitlist.mjs --approve-next 10    approve the 10 who have waited longest
//   node waitlist.mjs --reject a@x.com
// Needs SITE_URL in .env (where the invitation link lands, e.g. https://yourdomain.com/questionnaire/) and email set up in Supabase.
// A person is marked approved only after their invitation was sent, so a failed send can be retried.
import 'dotenv/config';
import { initSupabase } from './db.mjs';

const args = process.argv.slice(2);
const val = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
const list = v => (v || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const supabase = initSupabase();
const fmt = r => `${r.created_at.slice(0, 16).replace('T', ' ')}  ${r.status.padEnd(8)} ${r.email}`;

async function approve(emails) {
  const redirectTo = process.env.SITE_URL || 'http://localhost:3000/questionnaire/';
  for (const email of emails) {
    const { data: row } = await supabase.from('waitlist').select('id, status').ilike('email', email).maybeSingle();
    if (!row) { console.log(`not on the list: ${email}`); continue; }
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo });
    // "already registered" means they have an account; still counts as approved
    if (error && !/already.*(registered|exists)/i.test(error.message)) { console.log(`invite failed for ${email}: ${error.message}`); continue; }
    await supabase.from('waitlist').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', row.id);
    console.log(`approved and invited: ${email}`);
  }
}

if (val('approve')) await approve(list(val('approve')));
else if (val('approve-next')) {
  const { data, error } = await supabase.from('waitlist').select('email').eq('status', 'pending').order('created_at').limit(Number(val('approve-next')));
  if (error) throw error;
  await approve(data.map(r => r.email));
} else if (val('reject')) {
  for (const email of list(val('reject'))) {
    const { error } = await supabase.from('waitlist').update({ status: 'rejected' }).ilike('email', email);
    console.log(error ? `failed: ${email}: ${error.message}` : `rejected: ${email}`);
  }
} else {
  let q = supabase.from('waitlist').select('email, status, created_at').order('created_at').limit(500);
  if (!args.includes('--all')) q = q.eq('status', 'pending');
  const { data, error } = await q;
  if (error) { console.error(error.message.includes('waitlist') ? 'The waitlist table does not exist yet. Run backend/waitlist.sql in the Supabase SQL editor.' : error.message); process.exit(1); }
  console.log(data.length ? data.map(fmt).join('\n') : 'Nobody waiting.');
}
