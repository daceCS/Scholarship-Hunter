// Fetch pages and freeze them as snapshots.
//   node snapshot.mjs urls.tsv [--dir pages] [--delay 3000] [--force]
//   node snapshot.mjs --url https://example.org/a --url https://example.org/b
// urls.tsv: one URL per line, optional tab-separated tags: url  page_type  source_type  geo. '#' starts a comment.
// Polite by design: obeys robots.txt, identifies itself, waits between requests to the same host.
// Set SNAPSHOT_CONTACT to a contact URL or email for the User-Agent.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DEFAULT_DIR, normalizeUrl, pageId, readManifest, upsertManifest, htmlToText, pdfToText, parseArgs, isMain } from './lib.mjs';

// Load KEY=VALUE pairs from ./.env (git-ignored) without overriding real environment variables.
const envFile = new URL('./.env', import.meta.url);
if (fs.existsSync(envFile)) {
  for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const TOKEN = 'ScholarshipHunterBot';
const MAX_BYTES = 15 * 1024 * 1024;
const ua = () => `${TOKEN}/0.1 (research snapshot for a scholarship-matching project; ${process.env.SNAPSHOT_CONTACT || 'contact not set'})`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- robots.txt ---------- */

export function parseRobots(txt) {
  const groups = [];
  let cur = null, lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === 'user-agent') {
      if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(v.toLowerCase());
      lastWasAgent = true;
    } else if ((k === 'allow' || k === 'disallow') && cur) {
      cur.rules.push({ allow: k === 'allow', path: v });
      lastWasAgent = false;
    } else lastWasAgent = false;
  }
  return groups;
}

export function robotsAllows(groups, urlPath) {
  const token = TOKEN.toLowerCase();
  const g = groups.find(x => x.agents.some(a => a !== '*' && token.includes(a))) || groups.find(x => x.agents.includes('*'));
  if (!g) return true;
  let best = null;
  for (const r of g.rules) {
    if (r.path === '') continue; // empty Disallow allows everything
    const pat = r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$');
    if (!new RegExp('^' + pat).test(urlPath)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return best ? best.allow : true;
}

/* ---------- fetching ---------- */

export function createFetcher({ delay = 3000 } = {}) {
  const lastHit = new Map();   // host -> timestamp
  const robots = new Map();    // origin -> groups | 'deny'

  async function wait(host) {
    const gap = (lastHit.get(host) || 0) + delay - Date.now();
    if (gap > 0) await sleep(gap);
    lastHit.set(host, Date.now());
  }

  async function get(url) {
    const x = new URL(url);
    await wait(x.host);
    return fetch(url, {
      headers: { 'User-Agent': ua(), Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.5' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000)
    });
  }

  async function allowed(url) {
    const x = new URL(url);
    if (!robots.has(x.origin)) {
      try {
        const r = await get(`${x.origin}/robots.txt`);
        robots.set(x.origin, r.status >= 500 ? 'deny' : r.ok ? parseRobots(await r.text()) : []);
      } catch { robots.set(x.origin, 'deny'); }
    }
    const g = robots.get(x.origin);
    return g === 'deny' ? false : robotsAllows(g, x.pathname + x.search);
  }

  return { get, allowed };
}

/* ---------- one page ---------- */

async function snapshotOne(fetcher, dir, url, tags, force) {
  const id = pageId(url);
  const folder = path.join(dir, id);
  const existing = readManifest(dir).find(r => r.id === id);
  if (existing && existing.status === 200 && !force && fs.existsSync(path.join(folder, 'text.txt'))) {
    if (tags && Object.keys(tags).length) upsertManifest(dir, { id, ...tags });
    return { id, skipped: true };
  }
  const row = { id, url: normalizeUrl(url), fetched_at: new Date().toISOString(), ...tags };

  if (!(await fetcher.allowed(url))) {
    upsertManifest(dir, { ...row, status: 'blocked_by_robots' });
    return { id, status: 'blocked_by_robots' };
  }
  let res;
  try { res = await fetcher.get(url); }
  catch (e) { upsertManifest(dir, { ...row, status: 'error', error: String(e.message || e) }); return { id, status: 'error', error: String(e.message || e) }; }

  const type = (res.headers.get('content-type') || '').toLowerCase();
  if (!res.ok) { upsertManifest(dir, { ...row, status: res.status, content_type: type }); return { id, status: res.status }; }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) { upsertManifest(dir, { ...row, status: 'too_large', bytes: buf.length }); return { id, status: 'too_large' }; }

  const isPdf = type.includes('pdf') || buf.subarray(0, 5).toString() === '%PDF-';
  let text;
  try { text = isPdf ? await pdfToText(buf) : htmlToText(buf.toString('utf8'), res.url || url); }
  catch (e) { upsertManifest(dir, { ...row, status: 'parse_error', error: String(e.message || e) }); return { id, status: 'parse_error', error: String(e.message || e) }; }

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, isPdf ? 'raw.pdf' : 'raw.html'), buf);
  fs.writeFileSync(path.join(folder, 'text.txt'), text);
  upsertManifest(dir, {
    ...row,
    final_url: res.url || url,
    status: 200,
    content_type: type,
    kind: isPdf ? 'pdf' : 'html',
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    bytes: buf.length,
    text_chars: text.length,
    // Big page, almost no visible text: probably rendered by JavaScript. Needs a browser fetch.
    js_suspect: !isPdf && buf.length > 20000 && text.length < 600
  });
  return { id, status: 200, text_chars: text.length };
}

export async function snapshotUrls(items, { dir = DEFAULT_DIR, delay = 3000, force = false, log = () => {} } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const fetcher = createFetcher({ delay });
  const results = [];
  for (const { url, tags } of items) {
    const r = await snapshotOne(fetcher, dir, url, tags, force);
    log(r);
    results.push(r);
  }
  return results;
}

export function readUrlFile(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .map(l => l.replace(/#.*/, '').trim()).filter(Boolean)
    .map(l => {
      const [url, page_type, source_type, geo] = l.split('\t').map(s => s.trim());
      const tags = {};
      if (page_type) tags.page_type = page_type;
      if (source_type) tags.source_type = source_type;
      if (geo) tags.geo = geo;
      return { url, tags };
    });
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['url']);
  const items = [...(args.url || []).map(url => ({ url, tags: {} })), ...args._.flatMap(readUrlFile)];
  if (!items.length) { console.error('usage: node snapshot.mjs urls.tsv | --url <url> [--dir pages] [--delay 3000] [--force]'); process.exit(2); }
  if (!process.env.SNAPSHOT_CONTACT) console.warn('note: SNAPSHOT_CONTACT is not set; the User-Agent will say "contact not set".');
  const results = await snapshotUrls(items, {
    dir: args.dir || DEFAULT_DIR, delay: Number(args.delay ?? 3000), force: !!args.force,
    log: r => console.log(r.skipped ? `skip   ${r.id}` : `${String(r.status).padEnd(6)} ${r.id}${r.text_chars ? ` (${r.text_chars} chars)` : ''}${r.error ? ' ' + r.error : ''}`)
  });
  const bad = results.filter(r => !r.skipped && r.status !== 200);
  console.log(`\n${results.length - bad.length} ok, ${bad.length} not saved.`);
}
