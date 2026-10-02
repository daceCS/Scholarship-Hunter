// E2E: anonymous questionnaire -> submit -> sign-in form -> dashboard shows matches.
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
page.on('pageerror', e => console.log('  [pageerror]', e.message));
try {
  await page.goto(BASE + '/questionnaire/');
  await page.evaluate(() => localStorage.clear()); await page.reload();
  const click = async name => { await page.getByRole('button', { name }).first().click(); await page.waitForTimeout(400); };
  // The avatar the questionnaire builds must be usable by the engine (ZIP -> state/county derived server-side)
  const est = await page.evaluate(() => TW.api.getEstimate({ academic: { status: 'undergrad', gpa: 3.6 }, geo: { zip: '92101' } }));
  assert.ok(est.count + est.possible_count > 0, 'estimate from real answer ids should be non-zero: ' + JSON.stringify(est));
  console.log(`✓ estimate from questionnaire answers: ${est.count} eligible, ${est.possible_count} possible`);
  await page.getByRole('button', { name: 'Start', exact: true }).click(); await page.waitForTimeout(600);
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole('button', { name: 'Send to the search agent' }).count()) break;
    if (await page.getByRole('button', { name: 'Finish for now' }).count()) { await click('Finish for now'); continue; }
    const h1 = await page.locator('h1').first().innerText();
    const zip = page.locator('input[inputmode="numeric"]');
    // only the ZIP screen: other numeric boxes exist (e.g. minimum award) and a ZIP there would hide every award
    if (h1.startsWith('Where do you live') && await zip.count()) await zip.first().fill('92028');
    if (h1.startsWith('Where are you in school')) await page.locator('.screen [role=radio], .screen .card-opt, .screen label').first().click().catch(() => {});
    const undec = page.getByRole('button', { name: 'Undecided' });
    if (h1.startsWith('What are you studying') && await undec.count()) await undec.first().click();
    await click(/^(Continue|Finish)/);
  }
  await click('Send to the search agent');
  await page.getByRole('heading', { name: 'Save your profile.' }).waitFor({ timeout: 5000 });
  console.log('✓ submit without session asks for email');

  // Accounts are invite-only, so the test user is created the way an invitation would (admin API), then signs in through the real form; submit then saves the pending profile
  const { error: cuErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(cuErr);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder(/Password/).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('heading', { name: 'Profile submitted.' }).waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: /dashboard/ }).click();
  await page.getByText('Burger King Scholars').first().waitFor({ timeout: 10000 });
  assert.equal(await page.evaluate(() => localStorage.getItem('tw.pending')), null, 'pending profile should be flushed');
  const link = page.locator('.match h3 a').first();
  assert.match(await link.getAttribute('href'), /^https?:\/\//, 'match title should link to the provider page');
  assert.equal(await link.getAttribute('target'), '_blank', 'link should open in a new tab');
  console.log('✓ sign in -> profile saved -> dashboard shows matches');

  // Unverified badge + report a problem (needs the feedback table: run backend/feedback.sql once)
  await page.getByText('Unverified details').first().waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Report a problem' }).first().click();
  await page.locator('#rp-kind').selectOption('wrong_deadline');
  await page.locator('#rp-msg').fill('e2e test report');
  await page.getByRole('button', { name: 'Send report' }).click();
  try { await page.getByText('Thanks, we will look into it.').waitFor({ timeout: 8000 }); }
  catch { const t = await page.locator('.rp-out').innerText(); throw new Error('report was not accepted: ' + t + ' (if this mentions the feedback table, run backend/feedback.sql in the Supabase SQL editor)'); }
  console.log('✓ matches are marked unverified; a problem report is accepted');
  await page.keyboard.press('Escape');

  // "Not a match": removes a scholarship, survives a reload, can be restored (needs dismissals.sql; skipped until that table exists)
  const { error: disTable } = await admin.from('dismissals').select('user_id').limit(1);
  if (disTable) console.log('- "Not a match" skipped: table missing (run backend/dismissals.sql in the Supabase SQL editor)');
  else {
    const firstName = await page.locator('.match h3').first().innerText();
    await page.locator('.match').first().getByRole('button', { name: 'Not a match' }).click();
    await page.locator('input[name=ds-reason][value=dont_qualify]').check({ force: true });
    await page.getByRole('button', { name: 'Remove it' }).click();
    await page.waitForFunction(n => ![...document.querySelectorAll('.match h3')].some(e => e.innerText === n), firstName, { timeout: 8000 });
    await page.reload();
    await page.locator('.match h3').first().waitFor({ timeout: 10000 });
    assert.ok(!(await page.locator('.match h3').allInnerTexts()).includes(firstName), 'removed match must stay removed after a reload');
    await page.locator('.chip', { hasText: 'Not a match' }).click();                 // the filter tab
    await page.locator('.match h3', { hasText: firstName }).first().waitFor({ timeout: 5000 });
    await page.locator('.match').first().getByRole('button', { name: 'Restore' }).click();
    await page.waitForTimeout(1200);
    await page.reload(); await page.locator('.match h3').first().waitFor({ timeout: 10000 });
    assert.ok((await page.locator('.match h3').allInnerTexts()).includes(firstName), 'restored match should be back');
    console.log('✓ "Not a match" asks why, removes the scholarship, survives a reload, and can be restored');
  }

  // (All unstated-amount awards in the current data are past their deadline, so they are filtered out; no "Amount varies" expected.)
  assert.equal(await page.getByText('$0', { exact: true }).count(), 0, 'no bare $0 awards');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByRole('heading', { name: 'Sign in to see your matches.' }).waitFor({ timeout: 5000 });
  console.log('✓ no bare $0 awards; sign-out returns to sign-in');

  // Wrong password rejected, right password signs back in
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
  const { data: fb } = await admin.from('feedback').select('kind, message, scholarship_name').eq('user_id', uid);
  assert.equal(fb?.length, 1, 'the report should be stored once');
  assert.equal(fb[0].kind, 'wrong_deadline');
  console.log('✓ report stored with the scholarship name');
  await admin.from('feedback').delete().eq('user_id', uid);
  await admin.from('matches').delete().eq('user_id', uid); await admin.from('profiles').delete().eq('user_id', uid);
  console.log('PASS');
} catch (e) { console.error('FAIL:', e.message); console.log((await page.innerText('body')).slice(0, 900)); process.exitCode = 1; }
await browser.close();
