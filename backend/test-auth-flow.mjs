// E2E: anonymous questionnaire -> submit -> sign-up form -> create account -> dashboard shows matches.
// Also checks the API rejects unauthenticated / forged requests.
import 'dotenv/config';
import assert from 'assert';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const BASE = 'http://localhost:3000';
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = `e2e-${Date.now()}@example.com`;
const password = 'e2e-Passw0rd!';

// API rejects missing / bogus tokens
for (const [path, opts] of [['/matches', {}], ['/profile', { method: 'POST', body: '{}' }], ['/matches?user_id=x', { headers: { Authorization: 'Bearer nope' } }]]) {
  const r = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  assert.equal(r.status, 401, `${path} should be 401, got ${r.status}`);
}
console.log('✓ unauthenticated requests rejected');

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
page.on('console', m => m.type() === 'error' && console.log('  [console.error]', m.text()));
try {
  await page.goto(BASE + '/questionnaire/');
  await page.evaluate(() => localStorage.clear()); await page.reload();
  const click = async name => { await page.getByRole('button', { name }).first().click(); await page.waitForTimeout(400); };
  // Questionnaire answer ids must map to a profile the engine can use (regression: keys used to be wrong)
  const est = await page.evaluate(() => TW.api.getEstimate({ 'geo.current': 'San Diego, CA', 'edu.status': 'undergrad', 'edu.gpa': '3.6' }));
  assert.ok(est.count + est.possible_count > 0, 'estimate from real answer ids should be non-zero: ' + JSON.stringify(est));
  console.log(`✓ estimate from questionnaire answers: ${est.count} eligible, ${est.possible_count} possible`);
  await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.waitForTimeout(600);
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole('button', { name: 'Send to the search agent' }).count()) break;
    if (await page.getByRole('button', { name: 'Finish for now' }).count()) { await click('Finish for now'); continue; }
    const h1 = await page.locator('h1').first().innerText();
    const zip = page.locator('input[inputmode="numeric"]');
    if (await zip.count() && await zip.first().isVisible()) await zip.first().fill('92028');
    if (h1.startsWith('Where are you in school')) await page.locator('.screen [role=radio], .screen .card-opt, .screen label').first().click().catch(() => {});
    const undec = page.getByRole('button', { name: 'Undecided' });
    if (h1.startsWith('What are you studying') && await undec.count()) await undec.first().click();
    await click(/^(Continue|Finish)/);
  }
  await click('Send to the search agent');
  await page.getByRole('heading', { name: 'Save your profile.' }).waitFor({ timeout: 5000 });
  console.log('✓ submit without session asks for email');

  // Create the account through the real form; submit then saves the pending profile
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder(/Password/).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('heading', { name: 'Profile submitted.' }).waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: /dashboard/ }).click();
  await page.getByText('Burger King Scholars').first().waitFor({ timeout: 10000 });
  assert.equal(await page.evaluate(() => localStorage.getItem('tw.pending')), null, 'pending profile should be flushed');
  console.log('✓ create account -> profile saved -> dashboard shows matches');

  assert.equal(await page.getByText('Amount varies').count() > 0, true, 'zero-amount awards should show "Amount varies"');
  assert.equal(await page.getByText('$0', { exact: true }).count(), 0, 'no bare $0 awards');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('heading', { name: 'Sign in to see your matches.' }).waitFor({ timeout: 5000 });
  console.log('✓ zero-amount awards labelled; sign-out returns to sign-in');

  // Wrong password rejected, right password signs back in
  await page.getByRole('button', { name: 'Already have an account? Sign in' }).click();
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder(/Password/).fill('wrong-password-1');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByText(/invalid login credentials/i).waitFor({ timeout: 10000 });
  await page.getByPlaceholder(/Password/).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByText('Burger King Scholars').first().waitFor({ timeout: 10000 });
  console.log('✓ wrong password rejected; sign-in restores matches');

  // Stored under the verified user, not a client-supplied id
  const { data: u } = await admin.auth.admin.listUsers({ perPage: 200 });
  const uid = u.users.find(x => x.email === email)?.id;
  const { data: rows } = await admin.from('profiles').select('id').eq('user_id', uid);
  assert.equal(rows.length, 1);
  console.log('✓ profile stored under the authenticated user id');
  await admin.auth.admin.deleteUser(uid); // cascades nothing in our tables; clean profile rows too
  await admin.from('matches').delete().eq('user_id', uid); await admin.from('profiles').delete().eq('user_id', uid);
  console.log('PASS');
} catch (e) { console.error('FAIL:', e.message); console.log((await page.innerText('body')).slice(0, 300)); process.exitCode = 1; }
await browser.close();
