// Build review/from-scratch.html: the 30 from-scratch pages, each with its text and a plain-language form.
// The page shows NO draft and NO earlier guess about the page type. Answers autosave in the browser and export as JSON.
//   node from-scratch-html.mjs
import fs from 'node:fs';
import path from 'node:path';
import { HERE, DEFAULT_DIR, readManifest, readText, parseArgs, isMain } from './lib.mjs';

if (isMain(import.meta.url)) {
  parseArgs(process.argv.slice(2));
  const plan = JSON.parse(fs.readFileSync(path.join(HERE, 'label-plan.json'), 'utf8'));
  const rows = new Map(readManifest(DEFAULT_DIR).map(r => [r.id, r]));
  // Fixed order by page id, so similar pages are not adjacent, and no type hint is shown.
  const order = [...plan.from_scratch].sort((a, b) => (a < b ? -1 : 1));
  const pages = order.map(id => { const r = rows.get(id); const text = readText(DEFAULT_DIR, id) || ''; return { id, url: r.url, kind: r.kind, chars: text.length, text }; });
  const client = fs.readFileSync(path.join(HERE, 'from-scratch.client.js'), 'utf8');
  const json = JSON.stringify(pages).replace(/</g, '\\u003c');
  const css = `:root{--bg:#fbfaf7;--fg:#1d1d1f;--dim:#6b6b70;--card:#fff;--line:#e3e0d8;--accent:#2f5d50;--on:#dcefe6}
    @media(prefers-color-scheme:dark){:root{--bg:#161615;--fg:#ecebe6;--dim:#9a9a9f;--card:#1f1f1e;--line:#333331;--accent:#7fb5a3;--on:#22382f}}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
    .top{position:sticky;top:0;z-index:5;background:var(--card);border-bottom:1px solid var(--line);padding:8px 16px}.top .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    #bar-wrap{height:4px;background:var(--line);border-radius:2px;margin-top:6px}#bar{height:4px;background:var(--accent);border-radius:2px;width:0}
    #toc{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}#toc a{border:1px solid var(--line);border-radius:5px;padding:0 7px;font-size:12px;text-decoration:none;color:var(--fg)}#toc a.on{background:var(--on)}
    main{max-width:1300px;margin:0 auto;padding:16px 16px 100px}h1{font-size:21px;margin:8px 0 2px}.lead{color:var(--dim);max-width:78ch}
    section{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:18px 0;padding:14px;scroll-margin-top:84px}
    header{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}.hd{flex:1;min-width:0}.num{background:var(--accent);color:var(--bg);border-radius:6px;padding:2px 9px;font-weight:700}
    a{color:var(--accent);word-break:break-all}.dim{color:var(--dim)}.small{font-size:13px}.cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}
    @media(max-width:950px){.cols{grid-template-columns:1fr}}
    .page pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:12.5px/1.45 ui-monospace,monospace;max-height:640px;overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px;position:sticky;top:96px}
    .lbl{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--dim);margin:12px 0 4px}.lbl.first{margin-top:0}
    .f{display:block;margin:6px 0}.f span{display:block;font-size:12.5px;color:var(--dim)}
    input[type=text],input[type=number],input[type=date],select,textarea{width:100%;font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:6px 8px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:end}.grid-req{display:grid;grid-template-columns:3fr 1fr;gap:8px}
    @media(max-width:600px){.grid2,.grid3,.grid-req{grid-template-columns:1fr}}
    .ck{display:inline-flex;gap:6px;align-items:center;margin:2px 10px 2px 0}.ck.block{display:flex;margin:3px 0}.ckrow{margin:8px 0}.done{margin:0}
    .award{border:1px solid var(--line);border-radius:8px;padding:10px;margin:10px 0}.ahead{display:flex;justify-content:space-between}
    .req{border-top:1px dashed var(--line);padding:6px 0}.rbtn{display:flex;gap:10px;align-items:center;margin-top:4px}
    .btn{font:inherit;background:var(--card);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:5px 12px;cursor:pointer}.btn.sm{padding:2px 9px;font-size:13px}
    .btn.primary{background:var(--accent);color:var(--bg);border-color:var(--accent)}.link{background:none;border:0;color:var(--accent);cursor:pointer;font:inherit;text-decoration:underline}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>From-scratch labels</title><style>${css}</style></head><body>
    <div class="top"><div class="row"><b>From-scratch labels</b><span id="prog" class="dim"></span><span class="dim small">Saved in this browser as you type.</span><button id="dl" class="btn primary" type="button">Download my answers</button></div>
    <div id="bar-wrap"><div id="bar"></div></div><div id="toc"></div></div>
    <main><h1>Label these pages yourself, from scratch</h1>
    <p class="lead">These ${pages.length} pages have no draft from me, on purpose. Read each page on the right and fill in what it says on the left. There are no wrong ways to phrase things: I will turn your words into the structured format afterward. Only write what the page actually says. If the page does not give a fact (amount, deadline), leave it blank or tick "not stated". When you finish a page, tick <b>Done</b>. You can stop and come back: your answers stay in this browser. Press <b>Download my answers</b> when you are finished (or any time to save a copy) and tell me where the file landed.</p>
    <div id="root"></div></main>
    <script type="application/json" id="pages-data">${json}</script><script>${client}</script></body></html>`;
  fs.mkdirSync(path.join(HERE, 'review'), { recursive: true });
  const out = path.join(HERE, 'review', 'from-scratch.html');
  fs.writeFileSync(out, html);
  console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB, ${pages.length} pages)`);
}
