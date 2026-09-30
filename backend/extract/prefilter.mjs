// Free checks that run before any model call.
//   slim(text)            drops repeated lines (menus, footers) so fewer tokens are sent; the original text is still what quotes are checked against
//   skipReason(text, row) a reason this page can't hold a scholarship, or null. Deliberately conservative: a wrong skip loses a real award silently.

export function slim(text) {
  const lines = text.split('\n');
  const count = new Map();
  for (const l of lines) count.set(l, (count.get(l) || 0) + 1);
  const seen = new Set();
  return lines.filter(l => {
    if (!l.trim()) return true;
    if (count.get(l) > 2 && seen.has(l)) return false;   // keep the first occurrence of a repeated line
    seen.add(l);
    return true;
  }).join('\n').replace(/\n{3,}/g, '\n\n');
}

const WALL = /access denied|403 forbidden|404|page not found|not found|verify you are (a )?human|enable javascript|sign in to continue|log ?in to (view|continue)|captcha/i;
const TOPIC = /scholarship|fellowship|grant|award|bursar|financ(e|ial) aid|tuition|stipend|fund\b/i;

export function skipReason(text) {
  const t = text.trim();
  if (t.length < 300) return `almost no text (${t.length} chars)`;
  if (t.length < 2500 && WALL.test(t)) return 'looks like a block, login or not-found page';
  if (!TOPIC.test(t)) return 'no scholarship, grant, award or aid wording';
  return null;
}
