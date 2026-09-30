// Shared helpers for the test-set tooling.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_DIR = path.join(HERE, 'pages');

/* ---------- ids and manifest ---------- */

export function normalizeUrl(u) {
  const x = new URL(u);
  x.hash = '';
  for (const k of [...x.searchParams.keys()]) if (/^utm_/i.test(k)) x.searchParams.delete(k);
  return x.toString();
}

export function pageId(url) {
  const x = new URL(normalizeUrl(url));
  const host = x.hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return `${host}-${crypto.createHash('sha1').update(normalizeUrl(url)).digest('hex').slice(0, 8)}`;
}

export function readManifest(dir) {
  const f = path.join(dir, 'manifest.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
}

export function writeManifest(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  const sorted = [...rows].sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(sorted, null, 2) + '\n');
}

/* Insert or update one row, keeping fields we did not touch (split, tags, ...). */
export function upsertManifest(dir, row) {
  const rows = readManifest(dir);
  const i = rows.findIndex(r => r.id === row.id);
  if (i >= 0) rows[i] = { ...rows[i], ...row }; else rows.push(row);
  writeManifest(dir, rows);
}

export const readText = (dir, id) => {
  const f = path.join(dir, id, 'text.txt');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};

/* ---------- text extraction ---------- */

const BLOCK = 'p,div,li,br,h1,h2,h3,h4,h5,h6,tr,section,article,header,footer,ul,ol,table,dt,dd,blockquote,form,fieldset';

/* Visible text as the extractor will see it. Links are kept as "text (url)" so listing pages
   expose the URLs of the awards they point to. */
export function htmlToText(html, baseUrl) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,iframe,template,head > *:not(title)').remove();
  const title = $('title').first().text().trim();
  $('title').remove();
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return;
    let abs = href;
    try { abs = new URL(href, baseUrl).toString(); } catch { /* keep raw */ }
    const txt = $(el).text().trim();
    if (txt && txt !== abs) $(el).append(` (${abs})`);
  });
  $('td,th').each((_, el) => { $(el).append(' | '); });
  $('br').replaceWith('\n');
  $(BLOCK).each((_, el) => { $(el).append('\n'); });
  const body = $('body').length ? $('body').text() : $.root().text();
  const text = (title ? title + '\n\n' : '') + body;
  return text
    .replace(/\r/g, '')
    .replace(/[ \t\f\v ]+/g, ' ')
    .split('\n').map(l => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

export async function pdfToText(buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const r = await parser.getText();
    return r.text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  } finally {
    await parser.destroy?.();
  }
}

/* ---------- quotes ---------- */

export function normText(s) {
  return String(s)
    .normalize('NFKC')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* True if the quote appears in the page text (case, whitespace and punctuation variants ignored).
   Also tries the text with the "(url)" link annotations removed, since quotes span linked words. */
export function quoteInText(quote, text) {
  const q = normText(quote);
  if (!q) return false;
  const full = normText(text);
  if (full.includes(q)) return true;
  return normText(text.replace(/ \(https?:\/\/[^)\s]+\)/g, '')).includes(q);
}

/* ---------- misc ---------- */

export const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
export const isMain = importMetaUrl => process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(importMetaUrl);

export function parseArgs(argv, multi = []) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      const isFlag = next === undefined || next.startsWith('--');
      const v = isFlag ? true : next;
      if (!isFlag) i++;
      if (multi.includes(k)) (out[k] = out[k] || []).push(v); else out[k] = v;
    } else out._.push(a);
  }
  return out;
}
