// Turns the questionnaire's avatar (questionnaire/avatar.js) into the flat profile the match engine evaluates.
// The avatar intentionally omits derived fields (CIP codes, county...); they are computed here.

// Questionnaire majors (questionnaire/data.js) -> CIP 2020 series. Free-text majors not listed stay unknown.
// ponytail: 4-char series only (e.g. 14.09), not full 6-digit codes; rules use prefix_any so this is enough for now.
export const MAJOR_CIP = {
  'Accounting': '52.03', 'Aerospace Engineering': '14.02', 'Agriculture': '01.00', 'Anthropology': '45.02',
  'Architecture': '04.02', 'Art': '50.07', 'Automotive Technology': '47.06', 'Biochemistry': '26.02',
  'Biology': '26.01', 'Biomedical Engineering': '14.05', 'Business Administration': '52.02',
  'Chemical Engineering': '14.07', 'Chemistry': '40.05', 'Civil Engineering': '14.08', 'Communications': '09.01',
  'Computer Engineering': '14.09', 'Computer Science': '11.07', 'Cosmetology': '12.04', 'Criminal Justice': '43.01',
  'Culinary Arts': '12.05', 'Cybersecurity': '11.10', 'Data Science': '30.70', 'Dental Hygiene': '51.06',
  'Early Childhood Education': '13.12', 'Economics': '45.06', 'Education': '13.01', 'Electrical Engineering': '14.10',
  'Electrician Training': '46.03', 'Elementary Education': '13.12', 'English': '23.01', 'Environmental Science': '03.01',
  'Finance': '52.08', 'Forestry': '03.05', 'Graphic Design': '50.04', 'Health Sciences': '51.00', 'History': '54.01',
  'HVAC Technology': '47.02', 'Information Technology': '11.01', 'International Relations': '45.09',
  'Journalism': '09.04', 'Kinesiology': '31.05', 'Marketing': '52.14', 'Mathematics': '27.01',
  'Mechanical Engineering': '14.19', 'Music': '50.09', 'Nursing': '51.38', 'Nutrition': '51.31',
  'Paralegal Studies': '22.03', 'Pharmacy': '51.20', 'Philosophy': '38.01', 'Physical Therapy': '51.23',
  'Physics': '40.08', 'Political Science': '45.10', 'Pre-Law': '22.01', 'Pre-Med': '51.11', 'Psychology': '42.01',
  'Public Health': '51.22', 'Radiology Technology': '51.09', 'Social Work': '44.07', 'Sociology': '45.11',
  'Software Engineering': '14.09', 'Special Education': '13.10', 'Statistics': '27.05', 'Theater': '50.05',
  'Veterinary Science': '51.24', 'Welding Technology': '48.05',
};

// ponytail: coarse ZIP ranges for the two counties the labelled data cares about; replace with a real ZIP->county table.
const zipNum = z => (/^\d{5}$/.test(z || '') ? Number(z) : null);
export function countyFromZip(zip) {
  const n = zipNum(zip);
  if (n === null) return undefined;
  if ((n >= 91901 && n <= 91980) || (n >= 92003 && n <= 92199)) return 'San Diego County, CA';
  if (n >= 92602 && n <= 92899) return 'Orange County, CA';
  return undefined;
}
// ponytail: California only (ZIPs 90001-96162); other states stay unknown until a real table exists.
export function stateFromZip(zip) {
  const n = zipNum(zip);
  return n !== null && n >= 90001 && n <= 96162 ? 'CA' : undefined;
}

const ESSAY_WORDS = { no: 0, short: 500, any: 100000 };
const SENSITIVE_SECTIONS = ['identity', 'circumstances', 'financial'];

export function normalizeAvatar(avatar = {}) {
  const p = structuredClone(avatar);
  p.geo = { ...p.geo };
  p.geo.state ||= stateFromZip(p.geo.zip);
  p.geo.county ||= countyFromZip(p.geo.zip);
  p.academic = { ...p.academic };
  p.academic.cip_codes = [...new Set((p.academic.majors || []).map(m => MAJOR_CIP[m]).filter(Boolean))];
  if (!p.academic.cip_codes.length) delete p.academic.cip_codes; // unknown, not "no majors"
  if (p.academic.gpa !== undefined) p.academic.gpa = Number(p.academic.gpa);

  const e = p.effort || {};
  p.effort = {
    min_award: e.min_award_usd ?? 500,
    deadline_floor: e.deadline_floor_days ?? 14,
    essay_words: ESSAY_WORDS[e.essay] ?? 500,
    recs: e.recs,
  };

  // The avatar keeps per-section withheld suffixes ('first_gen'); the engine checks full paths ('identity.first_gen').
  const withheld = [];
  for (const section of ['affiliations', ...SENSITIVE_SECTIONS]) {
    for (const key of p[section]?.withheld || []) withheld.push(`${section}.${key}`);
    if (p[section]) delete p[section].withheld;
  }
  p.withheld = withheld;
  return p;
}

// Sensitive sections are stored apart from the core profile (the consent screen promises this).
export function splitAvatar(avatar = {}) {
  const core = { ...avatar }, sensitive = {};
  for (const s of SENSITIVE_SECTIONS) if (s in core) { sensitive[s] = core[s]; delete core[s]; }
  return { core, sensitive };
}
