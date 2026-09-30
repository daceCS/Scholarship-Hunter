// Self-test for the tooling. Runs the whole pipeline against a local server; touches no real websites.
//   npm test
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { snapshotUrls, parseRobots, robotsAllows } from './snapshot.mjs';
import { newLabel } from './new-label.mjs';
import { checkLabels } from './check-labels.mjs';
import { scoreRun, calibrate, ruleKey } from './score.mjs';
import { readManifest, upsertManifest, readText, quoteInText, normText, pageId, htmlToText } from './lib.mjs';

const failures = [];
let passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else failures.push(msg); };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);

/* ---------- local site ---------- */

const AWARD = `<!doctype html><html><head><title>Example County Nursing Award</title><style>.x{}</style><script>var junk=1</script></head>
<body><nav>Home | About</nav><h1>Example County Nursing Award</h1>
<p>Open to residents of San Diego County. Applicants must be pursuing a career in nursing.</p>
<p>Awards range from $2,500 to $5,000. Applications due November&nbsp;14, 2026.</p>
<p><a href="/apply">Apply here</a></p></body></html>`;
const pdfBody = 'BT /F1 12 Tf 72 720 Td (Union scholars award deadline is March 1 2027) Tj ET';
const PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${pdfBody.length}>>stream
${pdfBody}
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R/Size 6>>
%%EOF`;

const server = http.createServer((req, res) => {
  const send = (code, type, body) => { res.writeHead(code, { 'Content-Type': type }); res.end(body); };
  switch (req.url) {
    case '/robots.txt': return send(200, 'text/plain', 'User-agent: *\nDisallow: /private\n');
    case '/award': return send(200, 'text/html', AWARD);
    case '/listing': return send(200, 'text/html', `<html><body><h1>Awards</h1><ul><li><a href="/award">Nursing Award</a></li><li><a href="/doc.pdf">Union Scholars</a></li></ul></body></html>`);
    case '/doc.pdf': return send(200, 'application/pdf', PDF);
    case '/private/secret': return send(200, 'text/html', '<p>should never be fetched</p>');
    case '/js': return send(200, 'text/html', `<html><body><div id="app"></div><script>${'x'.repeat(30000)}</script></body></html>`);
    default: return send(404, 'text/plain', 'nope');
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sh-pages-'));
const predDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sh-pred-'));

try {
  /* ---------- unit-ish ---------- */
  const g = parseRobots('User-agent: *\nDisallow: /a\nAllow: /a/ok\nUser-agent: ScholarshipHunterBot\nDisallow: /b\n');
  ok(!robotsAllows(g, '/b/x'), 'robots: bot-specific group applies');
  ok(robotsAllows(g, '/a/x'), 'robots: bot group replaces * group');
  const star = parseRobots('User-agent: *\nDisallow: /a\nAllow: /a/ok\n');
  ok(!robotsAllows(star, '/a/x') && robotsAllows(star, '/a/ok/y') && robotsAllows(star, '/z'), 'robots: longest match wins');
  ok(normText('Don’t  stop now') === "don't stop now", 'normText handles curly quotes and nbsp');
  ok(quoteInText('open to residents of san diego county', 'x\nOpen to residents\nof San Diego County.'), 'quote matches across whitespace/case');
  ok(!quoteInText('invented sentence', 'real page text'), 'quote check rejects invented text');
  ok(pageId(`${base}/award#frag`) === pageId(`${base}/award`), 'pageId ignores fragments');
  ok(htmlToText('<p>See <a href="/x">the rules</a></p>', 'http://h.test/').includes('the rules (http://h.test/x)'), 'links keep their URL');
  eq(ruleKey({ kind: 'hard', field: 'geo.county', op: 'in', value: ['B', 'a'] }), 'geo.county|in|a,b', 'ruleKey sorts and lowercases');
  const cal = calibrate([...Array(25).fill({ conf: 0.96, correct: true }), ...Array(10).fill(0).map((_, i) => ({ conf: 0.6, correct: i % 2 === 0 }))]);
  eq(cal.auto_publish_cutoff.min_confidence, 0.96, 'calibration picks the 0.96 cutoff');

  /* ---------- snapshot ---------- */
  const urls = ['/award', '/listing', '/doc.pdf', '/private/secret', '/missing', '/js'].map(p => ({ url: base + p, tags: {} }));
  await snapshotUrls(urls, { dir, delay: 0 });
  const m = Object.fromEntries(readManifest(dir).map(r => [r.url.replace(base, ''), r]));
  eq(m['/award'].status, 200, 'award fetched');
  ok(fs.existsSync(path.join(dir, m['/award'].id, 'raw.html')), 'raw.html saved');
  const awardText = readText(dir, m['/award'].id);
  ok(awardText.startsWith('Example County Nursing Award') && awardText.includes('November 14, 2026'), 'award text extracted');
  ok(!awardText.includes('junk') && !awardText.includes('.x{'), 'scripts and styles stripped');
  ok(readText(dir, m['/listing'].id).includes(`(${base}/award)`), 'listing keeps award URLs');
  eq(m['/doc.pdf'].kind, 'pdf', 'pdf detected');
  ok((readText(dir, m['/doc.pdf'].id) || '').includes('March 1 2027'), 'pdf text extracted');
  eq(m['/private/secret'].status, 'blocked_by_robots', 'robots disallow respected');
  ok(!fs.existsSync(path.join(dir, m['/private/secret'].id)), 'blocked page not saved');
  eq(m['/missing'].status, 404, '404 recorded');
  eq(m['/js'].js_suspect, true, 'js-only page flagged');
  const again = await snapshotUrls([{ url: base + '/award', tags: { page_type: 'single', source_type: 'test' } }], { dir, delay: 0 });
  ok(again[0].skipped, 'existing snapshot skipped without --force');
  eq(readManifest(dir).find(r => r.id === m['/award'].id).source_type, 'test', 'tags merged into manifest on re-run');

  /* ---------- labels ---------- */
  const award = m['/award'].id;
  newLabel(dir, award); newLabel(dir, m['/listing'].id); newLabel(dir, m['/js'].id);
  ok(!newLabel(dir, award), 'newLabel does not overwrite');
  const good = {
    name: 'Example County Nursing Award', provider_org: 'Example Foundation', apply_url: `${base}/apply`, source_url: `${base}/award`,
    amount: { min: 2500, max: 5000 }, deadline: '2026-11-14', cycle_status: 'open', verified_at: '2026-09-29', confidence: 0.95,
    eligibility: [
      { any_of: [{ field: 'geo.county', op: 'in', value: ['San Diego County, CA'], kind: 'hard', source_quote: 'Open to residents of San Diego County' }] },
      { any_of: [{ field: 'academic.cip_codes', op: 'prefix_any', value: ['51.38'], kind: 'hard', source_quote: 'pursuing a career in nursing' }] }
    ],
    provenance: [{ field: 'deadline', source_quote: 'Applications due November 14, 2026' }]
  };
  const writeGold = (id, patch) => {
    const f = path.join(dir, id, 'gold.json');
    fs.writeFileSync(f, JSON.stringify({ ...JSON.parse(fs.readFileSync(f, 'utf8')), labeler: 'tester', labeled_at: '2026-09-29', ...patch }, null, 2));
  };
  writeGold(award, { review_status: 'reviewed', scholarships: [good] });
  writeGold(m['/listing'].id, { page_type: 'listing', review_status: 'draft' });
  writeGold(m['/js'].id, { page_type: 'not_scholarship', is_scholarship_page: false });
  let r = checkLabels(dir);
  eq(r.problems.filter(p => p.review_status !== 'draft').length, 0, 'valid reviewed label has no problems');
  eq(r.stats.labeled, 3, 'the three labeled pages are counted');

  const invented = JSON.parse(JSON.stringify(good));
  invented.eligibility[0].any_of[0].source_quote = 'Open to everyone on Earth';
  invented.eligibility[1].any_of[0].field = 'edu.major';
  writeGold(award, { scholarships: [invented] });
  r = checkLabels(dir);
  const msgs = r.problems.map(p => p.message).join('\n');
  ok(/quote not found/.test(msgs), 'invented quote is caught');
  ok(/unknown field "edu.major"/.test(msgs), 'unknown vocabulary field is caught');
  writeGold(award, { scholarships: [good] });

  /* ---------- scoring ---------- */
  upsertManifest(dir, { id: award, split: 'dev' });
  const put = (id, obj) => fs.writeFileSync(path.join(predDir, id + '.json'), JSON.stringify(obj));
  const pagePred = s => ({ page_type: 'single', is_scholarship_page: true, scholarships: s });

  put(award, pagePred([good]));
  let s = scoreRun({ dir, predDir, split: 'dev' });
  eq([s.pages, s.triage.f1, s.rules.recall, s.rules.precision, s.quote_in_page.rate], [1, 1, 1, 1, 1], 'perfect prediction scores 1.0');
  eq(s.fields.deadline.accuracy, 1, 'perfect deadline');

  const worse = JSON.parse(JSON.stringify(good));
  worse.deadline = '2026-11-15';
  worse.eligibility.pop();
  worse.eligibility.push({ any_of: [{ field: 'academic.gpa', op: 'gte', value: 3.5, kind: 'hard', source_quote: 'GPA of at least 3.5 required' }] });
  put(award, pagePred([worse]));
  s = scoreRun({ dir, predDir, split: 'dev' });
  eq(s.fields.deadline.accuracy, 0, 'wrong deadline detected');
  eq([s.rules.tp, s.rules.fp, s.rules.fn], [1, 1, 1], 'one rule right, one invented, one missed');
  ok(s.quote_in_page.rate < 1 && s.quote_in_page.missing_examples.length === 1, 'invented quote lowers quote-in-page rate');

  fs.unlinkSync(path.join(predDir, award + '.json'));
  s = scoreRun({ dir, predDir, split: 'dev' });
  eq([s.missing_predictions, s.triage.recall, s.awards.fn], [1, 0, 1], 'missing prediction counts as a miss');
  eq(scoreRun({ dir, predDir, split: 'test' }).pages, 0, 'split filter applies');
} finally {
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(predDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`FAIL: ${failures.length} of ${passed + failures.length} checks failed:\n` + failures.map(f => ' - ' + f).join('\n'));
  process.exit(1);
}
console.log(`OK: ${passed} checks passed.`);
