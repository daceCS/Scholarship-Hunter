import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const reqs = [];
page.on('request', r => { if (r.url().includes(':3000')) reqs.push(`${r.method()} ${r.url().split('?')[0]}`); });
page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
await page.goto('http://localhost:8080/index.html');
await page.evaluate(() => localStorage.clear()); await page.reload();
const click = async name => { await page.getByRole('button', { name }).first().click(); await page.waitForTimeout(400); };
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
  console.log('screen:', h1);
  await click(/^(Continue|Finish)/);
  if (h1 === await page.locator('h1').first().innerText()) { console.log('STUCK on', h1); break; }
}
await page.getByRole('button', { name: 'Send to the search agent' }).click();
await page.waitForTimeout(2500);
console.log('userId:', await page.evaluate(() => localStorage.getItem('tw.user.id')));
console.log('API:', reqs.join(' | '));
await page.getByRole('button', { name: /dashboard/ }).click();
await page.waitForTimeout(2500);
console.log('URL:', page.url());
console.log((await page.innerText('body')).slice(0, 400));
await browser.close();
