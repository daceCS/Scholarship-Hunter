// Turn the links that extraction found on listing pages into a fetch queue for snapshot.mjs.
//   node discover.mjs --run dev2-sonnet [--run other]      writes crawl-queue.tsv, prints what it found (no network)
//   node snapshot.mjs crawl-queue.tsv                      fetches them politely (robots.txt, delay, User-Agent)
//   node ../extract/extract.mjs --split new --run crawl1   extracts the newly fetched pages (they have no eval split)
//   node discover.mjs --run crawl1                         ...and repeat: new listing pages yield the next round of links
// A link is queued when it is http(s), not already in the manifest, and not an obvious non-page (mail, images, social sites).
// crawl-log.json remembers which page each queued URL came from and skips URLs queued before, so rounds never repeat.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, readManifest, normalizeUrl, pageId, parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2), ['run']);
if (!(args.run || []).length) { console.error('usage: node discover.mjs --run <prediction run> [--run ...] [--max-per-host 60]'); process.exit(2); }
const maxPerHost = Number(args['max-per-host'] || 60);

const SKIP = /^(mailto|tel):|\.(jpe?g|png|gif|svg|webp|zip|docx?|xlsx?|pptx?|mp4|mp3)(\?|$)|facebook\.com|twitter\.com|x\.com\/|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|fastweb\.com|scholarships\.com|niche\.com|bigfuture\.collegeboard\.org/i;

const known = new Set(readManifest(DEFAULT_DIR).map(r => r.id));
const logFile = path.join(HERE, 'crawl-log.json');
const crawlLog = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : {};   // id -> { url, from }

const found = new Map();   // id -> { url, from }
for (const run of args.run) {
  const dir = path.join(HERE, 'predictions', run);
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))) {
    const pred = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const link of pred.follow_links || []) {
      if (SKIP.test(link)) continue;
      let url; try { url = normalizeUrl(link); if (!/^https?:/.test(url)) continue; } catch { continue; }
      const id = pageId(url);
      if (!known.has(id) && !crawlLog[id] && !found.has(id)) found.set(id, { url, from: f.slice(0, -5) });
    }
  }
}

const perHost = {};
const queue = [];
for (const [id, v] of found) {
  const host = new URL(v.url).hostname.replace(/^www\./, '');
  if ((perHost[host] = (perHost[host] || 0) + 1) > maxPerHost) continue;   // a runaway site shouldn't dominate a round
  queue.push({ id, ...v });
}

fs.writeFileSync(path.join(HERE, 'crawl-queue.tsv'), queue.map(q => q.url).join('\n') + '\n');
for (const q of queue) crawlLog[q.id] = { url: q.url, from: q.from };
fs.writeFileSync(logFile, JSON.stringify(crawlLog, null, 2) + '\n');

console.log(`${found.size} new link(s) found; ${queue.length} queued (per-host cap ${maxPerHost}) -> crawl-queue.tsv`);
const hosts = Object.entries(perHost).sort((a, b) => b[1] - a[1]);
console.log(hosts.slice(0, 15).map(([h, n]) => `  ${String(n).padStart(4)}  ${h}`).join('\n'));
console.log(`\nNext: node snapshot.mjs crawl-queue.tsv   (about ${Math.ceil(queue.length * 3 / 60)} min at the default 3 s per-host delay)`);
