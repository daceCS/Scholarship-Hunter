// One spelling per school, so "UCSD", "UC San Diego" and "University of California, San Diego" all compare equal.
// Used by the match engine on both sides of an institution rule (the student's answer and the scholarship's rule).
// ponytail: a few generic patterns plus a short alias table; add a line to ALIASES when a school shows up spelled two ways.
const ALIASES = {
  ucsd: 'uc san diego', sdsu: 'san diego state university', ucla: 'uc los angeles', ucb: 'uc berkeley', 'berkeley': 'uc berkeley',
  ucsb: 'uc santa barbara', uci: 'uc irvine', ucd: 'uc davis', ucr: 'uc riverside', ucsc: 'uc santa cruz', ucsf: 'uc san francisco', ucm: 'uc merced',
  csuf: 'csu fullerton', 'cal state fullerton': 'csu fullerton', 'cal state la': 'csu los angeles', 'cal state northridge': 'csu northridge',
  'sacramento state': 'csu sacramento', 'sac state': 'csu sacramento', 'csu chico': 'csu chico', 'chico state': 'csu chico',
  usc: 'university of southern california', mit: 'massachusetts institute of technology', 'cal poly': 'cal poly san luis obispo',
};

export function canonInstitution(name) {
  let s = String(name ?? '').toLowerCase().replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/^the /, '');
  s = s.replace(/^university of california(?: at)? /, 'uc ').replace(/^california state university(?: at)? /, 'csu ').replace(/^cal state /, 'csu ');
  return ALIASES[s] || s;
}
