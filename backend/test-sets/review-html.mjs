// Build a local review page for one batch of draft labels: draft on the left, page text on the right,
// with each rule's source quote highlighted in the page.
//   node review-html.mjs [--batch 1]      -> review/batch-01.html   (git-ignored; contains page text)
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, readManifest, readText, normText, parseArgs, isMain } from './lib.mjs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const straight = s => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/ /g, ' ');

function highlight(text, quotes) {
  let t = esc(straight(text));
  let hits = 0;
  for (const q of [...new Set(quotes)].filter(Boolean)) {
    const words = straight(q).trim().split(/\s+/).map(w => esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(words.join('(?:\\s|\\([^)]*\\))+'), 'i');
    const before = t;
    t = t.replace(re, m => `<mark>${m}</mark>`);
    if (t !== before) hits++;
  }
  return { html: t, hits };
}

const money = a => !a ? '' : (a.max === 0 && a.min === 0) ? 'amount not stated' : a.min === a.max ? `$${a.max.toLocaleString()}` : `$${a.min.toLocaleString()} to $${a.max.toLocaleString()}`;

function ruleHtml(r) {
  if (r.kind === 'fuzzy') return `<li><span class="tag fz">fuzzy</span> ${esc(r.description)} <span class="dim">reads: ${esc((r.relevant_fields || []).join(', '))}</span><q>${esc(r.source_quote)}</q></li>`;
  const v = r.value === undefined ? '' : ' ' + esc(JSON.stringify(r.value));
  return `<li><code>${esc(r.field)} ${esc(r.op)}${v}</code><q>${esc(r.source_quote)}</q></li>`;
}

function scholarshipHtml(s) {
  const bits = [money(s.amount), s.amount?.renewable ? 'renewable' : '', s.deadline ? `deadline ${s.deadline}` : 'no deadline', s.cycle_status, s.need_based ? s.need_based + '-based' : '', s.service_obligation ? 'service obligation' : '', s.effort?.essay_words ? `essay ${s.effort.essay_words} words` : '', s.effort?.recs_required ? `${s.effort.recs_required} rec(s)` : '', (s.effort?.formats || []).join('/')].filter(Boolean);
  const groups = (s.eligibility || []).map(g => g.any_of.length > 1
    ? `<li class="or">any one of:<ul>${g.any_of.map(ruleHtml).join('')}</ul></li>` : ruleHtml(g.any_of[0])).join('');
  return `<div class="sch"><h4>${esc(s.name)}</h4>
    <p class="meta">${esc(s.provider_org)} <span class="dim">(${esc(s.provider_type || '')})</span></p>
    <p class="meta">${esc(bits.join('  ·  '))}</p>
    ${s.amount?.note ? `<p class="dim">${esc(s.amount.note)}</p>` : ''}
    <p class="dim">apply: ${esc(s.apply_url)}</p>
    <div class="lbl">All of these must pass</div><ul class="rules">${groups || '<li class="dim">no eligibility rules</li>'}</ul>
    ${(s.provenance || []).length ? `<div class="lbl">Other facts and where they came from</div><ul class="rules">${s.provenance.map(p => `<li><b>${esc(p.field)}</b><q>${esc(p.source_quote)}</q></li>`).join('')}</ul>` : ''}
  </div>`;
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const n = Number(args.batch || 1);
  const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8'));
  const batch = plan.batches.find(b => b.n === n);
  const rows = new Map(readManifest(DEFAULT_DIR).map(r => [r.id, r]));
  const items = batch.ids.map((id, i) => {
    const r = rows.get(id);
    const g = JSON.parse(fs.readFileSync(path.join(DEFAULT_DIR, id, 'gold.json'), 'utf8'));
    const text = readText(DEFAULT_DIR, id) || '';
    const quotes = [...(g.scholarships || []).flatMap(s => [...(s.eligibility || []).flatMap(x => x.any_of.map(y => y.source_quote)), ...(s.provenance || []).map(p => p.source_quote)])];
    const hl = highlight(text, quotes);
    const hint = r.page_type || 'unset';
    const differs = hint !== g.page_type && !(hint === 'unset');
    return `<section id="i${i + 1}"><header><span class="num">${i + 1}</span>
      <div><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>
      <div class="dim">${esc(r.geo)} · ${esc(r.source_type)} · ${r.text_chars.toLocaleString()} characters · <span class="dim">${esc(id)}</span></div></div></header>
      <div class="cols"><div class="draft">
        <p><span class="pill ${g.page_type}">${esc(g.page_type)}</span>${differs ? ` <span class="warn">differs from my earlier guess (${esc(hint)})</span>` : ''} ${g.is_scholarship_page ? '' : '<span class="dim">not a scholarship page</span>'}</p>
        ${(g.scholarships || []).map(scholarshipHtml).join('') || ''}
        ${(g.award_names || []).length ? `<div class="lbl">Awards named on the page (details not on the page)</div><ul>${g.award_names.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${(g.vocabulary_gaps || []).length ? `<div class="lbl">Things I could not express</div><ul class="gaps">${g.vocabulary_gaps.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${g.notes ? `<div class="lbl">My notes</div><p class="note">${esc(g.notes)}</p>` : ''}
        <p class="dim">${hl.hits} of ${new Set(quotes).size} quote(s) highlighted on the right</p>
      </div><div class="page"><pre>${hl.html}</pre></div></div></section>`;
  });
  const css = `:root{--bg:#fbfaf7;--fg:#1d1d1f;--dim:#6b6b70;--card:#fff;--line:#e3e0d8;--mark:#ffe58a;--accent:#2f5d50}
    @media(prefers-color-scheme:dark){:root{--bg:#161615;--fg:#ecebe6;--dim:#9a9a9f;--card:#1f1f1e;--line:#333331;--mark:#6b5a12;--accent:#7fb5a3}}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
    main{max-width:1280px;margin:0 auto;padding:24px 16px 80px}h1{font-size:22px;margin:0 0 4px}.lead{color:var(--dim);max-width:70ch}
    section{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:20px 0;padding:16px}
    header{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}.num{background:var(--accent);color:var(--bg);border-radius:6px;padding:2px 9px;font-weight:700}
    a{color:var(--accent);word-break:break-all}.dim{color:var(--dim);font-size:13px}.cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}
    @media(max-width:900px){.cols{grid-template-columns:1fr}}
    .page pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:12.5px/1.45 ui-monospace,monospace;max-height:560px;overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px}
    mark{background:var(--mark);color:inherit;border-radius:2px}.pill{font-size:12px;border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-weight:600}
    .warn{color:#b3541e;font-size:13px}.sch{border-top:1px solid var(--line);padding-top:8px;margin-top:10px}h4{margin:0 0 2px;font-size:16px}
    .meta{margin:2px 0}.lbl{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--dim);margin:10px 0 2px}
    ul.rules{margin:0;padding-left:18px}ul.rules li{margin:4px 0}code{font:12.5px ui-monospace,monospace;background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:1px 5px}
    q{display:block;color:var(--dim);font-size:12.5px;quotes:"“" "”";margin-top:1px}.tag{font-size:11px;background:var(--mark);border-radius:4px;padding:0 5px}
    .note{background:var(--bg);border-left:3px solid var(--accent);padding:6px 10px;margin:4px 0}.or{list-style:none;margin-left:-18px}
    nav.toc{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}nav.toc a{border:1px solid var(--line);border-radius:6px;padding:1px 9px;text-decoration:none;word-break:normal;background:var(--card)}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Batch ${n} draft labels</title><style>${css}</style></head><body><main>
    <h1>Batch ${n}: draft labels to review</h1>
    <p class="lead">Left: my draft. Right: the saved page text, with the evidence for each rule highlighted. Check that each fact is right, that nothing important is missing, and that the page type makes sense. Reply with the item number and what to change, for example "5: deadline is wrong" or "3, 7, 9 are fine".</p>
    <nav class="toc">${batch.ids.map((_, i) => `<a href="#i${i + 1}">${i + 1}</a>`).join('')}</nav>
    ${items.join('\n')}</main></body></html>`;
  fs.mkdirSync(path.join(HERE, 'review'), { recursive: true });
  const out = path.join(HERE, 'review', `batch-${String(n).padStart(2, '0')}.html`);
  fs.writeFileSync(out, html);
  console.log('wrote', out);
}
