// Chunk 02, slot A. Drafted by Claude from the snapshot text only; NOT reviewed by a human.
// Conventions: amount not stated -> 0/0 with note; "up to $X" -> 0/X; deadline not stated -> null + unknown;
// month/day with no year -> null + annual_estimate; essay_words is per essay; apply_url falls back to the page.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const CA = (...names) => names.map(n => `${n} County, CA`);

/* ---------------- Sacramento Region Community Foundation grid ---------------- */
const SRCF_PAGE = 'https://www.sacregcf.org/students/';
const srcfUrl = id => `https://sacregcf.academicworks.com/opportunities/${id}`;
const NEED = 'Demonstrated financial need';
const srcf = (name, id, o) => {
  const apply = typeof id === 'string' ? id : srcfUrl(id);
  const elig = [];
  if (o.gpa) elig.push(G(H('academic.gpa', 'gte', o.gpa[0], o.gpa[1])));
  elig.push(...(o.rules || []));
  const prov = [
    { field: 'amount', source_quote: o.amount[2] },
    { field: 'deadline', source_quote: 'Most scholarships open in December and close in March' }
  ];
  if (o.need) prov.push({ field: 'need_based', source_quote: NEED });
  const rec = {
    name, provider_org: 'Sacramento Region Community Foundation', provider_type: 'community_foundation',
    apply_url: apply, source_url: SRCF_PAGE,
    amount: { min: o.amount[0], max: o.amount[1], ...(o.amountNote ? { note: o.amountNote } : {}), ...(o.renewable ? { renewable: true } : {}) },
    deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
    geo_scope: o.geo || { level: 'county', states: ['CA'] },
    ...(o.levels ? { levels: o.levels } : {}),
    ...(o.need ? { need_based: 'need' } : {}),
    eligibility: elig, provenance: prov, verified_at: V, confidence: o.conf || 0.7
  };
  return rec;
};
const SAC4 = CA('El Dorado', 'Placer', 'Sacramento', 'Yolo');
const gpa = (n, q) => [n, q || `${n.toFixed(1)}+ GPA`];
const hsU = q => G(H('academic.status', 'in', ['hs_senior', 'undergrad'], q));
const hsOnly = q => G(H('academic.status', 'eq', 'hs_senior', q));
const cnty = (list, q) => G(H('geo.county', 'in', list, q), H('geo.hs_county', 'in', list, q));

const srcfRecords = [
  srcf('AIA Central Valley/John Ellis Architectural Scholarship', 1742, {
    amount: [1000, 1000, 'Architecture | $1,000'], gpa: gpa(3.5), levels: ['hs_senior', 'undergrad', 'grad', 'returning'],
    rules: [
      G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'returning'], 'High school senior, undergraduate college student, graduate student or an adult re-entry student in the counties listed')),
      G(H('academic.cip_codes', 'prefix_any', ['04'], 'Architecture | $1,000')),
      cnty(CA('Alpine', 'Amador', 'Butte', 'Colusa', 'El Dorado', 'Glenn', 'Lassen', 'Nevada', 'Placer', 'Plumas', 'Sacramento', 'Shasta', 'Sierra', 'Sutter', 'Tehama', 'Yolo', 'Yuba'), 'Have attended or currently attending a school in the following counties')
    ]
  }),
  srcf('Benny Goodman Foundation', 1713, {
    amount: [1000, 3500, '$1,000 – $3,500'], levels: ['hs_senior', 'undergrad'],
    rules: [
      G(F('Applicant has a 3.0 or higher GPA in music courses', ['academic.gpa'], '3.0+ GPA in music courses')),
      hsU('High school senior or undergraduate college student'),
      G(F('Applicant attends or will attend a University of California or California State University campus', ['academic.institution'], 'Any University of California or California State University')),
      G(H('academic.cip_codes', 'prefix_any', ['50.09'], 'Music with an emphasis in jazz or classical')),
      G(F('Applicant plans to pursue a career in music', ['career.field', 'academic.majors'], 'Plan to pursue a career in music'))
    ]
  }),
  srcf('Bryan Potts Scholarship', 1720, {
    amount: [0, 10000, 'Up to $10,000'], gpa: gpa(2.5), need: true, levels: ['hs_senior'], geo: { level: 'school_district', states: ['CA'] },
    rules: [
      hsOnly('Graduating Senior at Rio Americano High School'),
      G(H('geo.high_school', 'eq', 'Rio Americano High School', 'Graduating Senior at Rio Americano High School'))
    ]
  }),
  srcf('Carroylin and Robert Threlkel Scholarship Fund', 1938, {
    amount: [1000, 5000, '$1,000 – $5,000 | Female student'], gpa: gpa(2.5), need: true, levels: ['hs_senior', 'undergrad'], geo: { level: 'national' },
    rules: [
      hsU('High school senior or undergraduate college student'),
      G(H('academic.cip_codes', 'prefix_any', ['52'], 'Business-related undergraduate degree')),
      G(H('identity.gender', 'eq', 'woman', 'Female student'))
    ]
  }),
  srcf('Creative Arts and Science Scholarship', 1880, {
    amount: [1000, 1500, '$1,000-$1,500'], gpa: gpa(2.0), need: true, geo: { level: 'school_district', states: ['CA'] },
    rules: [
      G(H('geo.high_school', 'eq', 'Esparto High School', 'Graduating high school senior at Esparto High School or have graduated from Esparto High School in Yolo County'))
    ]
  }),
  srcf('Community Scholarship', 1973, {
    amount: [2500, 2500, '$2,500 | Preference given to students with a GPA range'], gpa: gpa(2.5), need: true, levels: ['hs_senior'],
    rules: [hsOnly('High school senior in Sacramento County'), cnty(CA('Sacramento'), 'High school senior in Sacramento County')]
  }),
  srcf('David Breaux Memorial Scholarship', 1758, {
    amount: [2000, 2000, '$2,000 | Must have attended'], gpa: gpa(3.0), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      G(H('academic.status', 'eq', 'hs_senior', 'Yolo County high school senior or college student in their first year of study'),
        H('academic.year', 'eq', 1, 'Yolo County high school senior or college student in their first year of study')),
      cnty(CA('Yolo'), 'Must have attended or be currently attending a school in Yolo County')
    ]
  }),
  srcf('Dillard-Jackson Family Scholarship Fund', 1726, {
    amount: [1000, 1000, 'Agriculture | $1,000'], gpa: gpa(3.0), need: true, levels: ['hs_senior'], geo: { level: 'school_district', states: ['CA'] },
    rules: [
      hsOnly('Senior from a high school in the Elk Grove school district'),
      G(H('geo.school_district', 'eq', 'Elk Grove Unified School District', 'Senior from a high school in the Elk Grove school district')),
      G(H('academic.cip_codes', 'prefix_any', ['01'], 'Agriculture | $1,000'))
    ]
  }),
  srcf('Dreier Family Scholarship', 1932, {
    amount: [1000, 3000, '$1,000 – $3,000 | Plan to work'], gpa: gpa(2.5), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      hsU('High school senior or undergraduate college student currently attending a school in the Sacramento County'),
      cnty(CA('Sacramento'), 'currently attending a school in the Sacramento County'),
      G(F('Applicant will attend an accredited 2-year college, vocational, trade or technical school in Sacramento County', ['academic.institution', 'academic.status'], 'Accredited 2-year college, vocational, trade or technical school in Sacramento County')),
      G(F('Applicant plans to work at least 10 hours per week while attending college', ['activities.work[].role', 'activities.work[].dates'], 'Plan to work a minimum of 10 hours per week while attending college'))
    ]
  }),
  srcf('Eugene and Thora Chin Scholarship Fund', 1724, {
    amount: [1000, 6000, '$1,000 – $6,000'], need: true, geo: { level: 'county', states: ['CA'] },
    rules: [
      G(F('Applicant has a 4.0+ GPA in high school or a 3.5+ GPA in college', ['academic.gpa', 'academic.status'], '4.0+ GPA in high school or 3.5+ in college')),
      G(F('Applicant has Asian or Pacific Islander heritage', ['identity.heritage'], 'Asian/Pacific Islander heritage'))
    ]
  }),
  srcf('Erin Aaberg Givans Memorial Scholarship', 1716, {
    amount: [2500, 5000, '$2,500 – $5,000 | Female student'], gpa: gpa(2.8), levels: ['grad'], geo: { level: 'state', states: ['CA'] },
    rules: [
      G(H('academic.status', 'eq', 'grad', 'Any accredited graduate school in California')),
      G(F('Applicant attends a graduate school in California', ['academic.institution'], 'Any accredited graduate school in California')),
      G(H('academic.cip_codes', 'prefix_any', ['44.05', '44.04', '51.22', '51.07'], 'Masters in Public Policy, Public Administration, Public Health or Health Administration')),
      G(H('identity.gender', 'eq', 'woman', 'Female student; Career goal is children')),
      G(F('Applicant\'s career goal is children\'s health policy or advocacy', ['career.field'], 'Career goal is children’s health policy or advocacy'))
    ]
  }),
  srcf('Jack and Ellie Matranga Scholarship', 1963, {
    amount: [1500, 1500, 'Mass media | $1,500'], gpa: gpa(3.0), need: true, levels: ['hs_senior'],
    rules: [
      hsOnly('High School senior attending a school in El Dorado, Placer, Sacramento, or Yolo counties'),
      cnty(SAC4, 'High School senior attending a school in El Dorado, Placer, Sacramento, or Yolo counties'),
      G(H('academic.cip_codes', 'prefix_any', ['09'], 'Mass media | $1,500'))
    ]
  }),
  srcf('Julia R. Millon Memorial Scholarship', 1717, {
    amount: [1500, 1500, '$1,500'], gpa: gpa(2.5), need: true, levels: ['hs_senior'], geo: { level: 'school_district', states: ['CA'] },
    rules: [
      hsOnly('High School senior living within the boundaries of the Winters School District'),
      G(H('geo.school_district', 'eq', 'Winters Joint Unified School District', 'High School senior living within the boundaries of the Winters School District'))
    ]
  }),
  srcf('Lionakis Foundation Scholarship Program', 1882, {
    amount: [2500, 2500, 'Architecture, Engineering and Interior design | $2,500'], gpa: gpa(2.5, '2.5+GPA'), need: true, levels: ['hs_senior', 'undergrad'], geo: { level: 'national' },
    rules: [
      hsU('High school senior or current undergraduate college student'),
      G(H('academic.cip_codes', 'prefix_any', ['04', '14', '50.0408'], 'Architecture, Engineering and Interior design'))
    ]
  }),
  srcf('Li Family Charitable Foundation Scholarship', 1959, {
    amount: [3000, 3000, '$3,000 | Preference will go to first-generation'], gpa: gpa(3.0, '3.0+GPA'), need: true, levels: ['hs_senior', 'undergrad'], geo: { level: 'national' },
    rules: [hsU('High school senior or current undergraduate college student')]
  }),
  srcf('Mary Ellen Dolcini Scholarship', 1876, {
    amount: [2500, 10000, '$2,500 – $10,000 | Mexican American descent'], gpa: gpa(2.5), need: true, geo: { level: 'school_district', states: ['CA'] },
    rules: [
      G(H('geo.high_school', 'in', ['Davis Senior High School', 'Da Vinci High School', 'King High School', 'Woodland High School', 'Pioneer High School'], 'High schools in Yolo County: Davis High, Da Vinci High School, King High, Woodland High, or Pioneer High School')),
      G(H('identity.heritage', 'contains_any', ['Mexican'], 'Mexican American descent'))
    ]
  }),
  srcf('Nancy B. Reardan Scholarship', 1721, {
    amount: [2000, 4000, '$2,000 – $4,000'], gpa: gpa(3.5), need: true, levels: ['hs_senior'],
    rules: [
      hsOnly('Must be a female high school senior attending a school in Sacramento County'),
      cnty(CA('Sacramento'), 'Must be a female high school senior attending a school in Sacramento County'),
      G(H('identity.gender', 'eq', 'woman', 'Must be a female high school senior attending a school in Sacramento County'))
    ]
  }),
  srcf('NorYo Opportunity Scholarship', 1780, {
    amount: [1000, 10000, '$1,000 – $10,000 | Reside in the following'], gpa: gpa(2.0), need: true, levels: ['hs_senior'], geo: { level: 'city', states: ['CA'] },
    rules: [
      hsOnly('High school senior residing in northern Yolo County'),
      G(H('geo.zip', 'in', ['95607', '95606', '95937', '95627', '95645', '95653', '95695', '95776', '95697', '95698'], 'Reside in the following cities/towns & zip codes')),
      G(F('Applicant plans to attend a 2-year community college, vocational or trade school within two years', ['academic.institution', 'academic.status'], 'Accredited 2-year community college, vocational or trade school'))
    ]
  }),
  srcf('Richard Wiesner Engineering Scholarship', 1834, {
    amount: [2000, 2000, 'Engineering | $2,000'], gpa: gpa(2.0), need: true, levels: ['undergrad'], geo: { level: 'institution', states: ['CA'] },
    rules: [
      G(H('academic.status', 'eq', 'undergrad', 'Undergraduate college student attending Sacramento State or UC Davis')),
      G(H('academic.institution', 'in', ['California State University, Sacramento', 'University of California, Davis'], 'Undergraduate college student attending Sacramento State or UC Davis')),
      G(H('academic.cip_codes', 'prefix_any', ['14'], 'Engineering | $2,000')),
      G(H('affiliations.military[].who', 'eq', 'self', 'Veteran of the United States Armed Forces (DD214 required)')),
      G(H('affiliations.military[].status', 'in', ['veteran', 'retired'], 'Veteran of the United States Armed Forces (DD214 required)')),
      G(F('Applicant works part time while attending school', ['activities.work[].role', 'activities.work[].dates'], 'Work part time while attending school'))
    ]
  }),
  srcf('Paulsen Family Scholarship Fund', 1941, {
    amount: [1000, 4500, '$1,000 – $4,500'], gpa: gpa(2.0), levels: ['hs_senior', 'undergrad'],
    rules: [
      hsU('Graduating high school senior from Colusa or Sutter Counties, or student at a 2-year or 4-year college who graduated high school in Colusa or Sutter Counties'),
      cnty(CA('Colusa', 'Sutter'), 'Graduating high school senior from Colusa or Sutter Counties, or student at a 2-year or 4-year college who graduated high school in Colusa or Sutter Counties'),
      G(H('academic.cip_codes', 'prefix_any', ['01', '03', '51.24'], 'Agriculture, agribusiness, veterinary medicine, forestry, wildlife management, or natural resources'))
    ]
  }),
  srcf('Ramona Burnham Scholarship Foundation', 1741, {
    amount: [5000, 5000, '$5,000 | Must be Hispanic'], gpa: gpa(3.0), need: true, levels: ['hs_senior'], geo: { level: 'school_district', states: ['CA'] },
    rules: [
      hsOnly('Graduating high school senior from Baldwin Park Unified School District'),
      G(H('geo.school_district', 'eq', 'Baldwin Park Unified School District', 'Graduating high school senior from Baldwin Park Unified School District')),
      G(H('identity.heritage', 'contains_any', ['Hispanic or Latino', 'Mexican', 'Cuban', 'Puerto Rican'], 'Must be Hispanic or Latinx with English as a second language')),
      G(F('Applicant speaks English as a second language', ['identity.languages[].lang', 'identity.languages[].level'], 'Must be Hispanic or Latinx with English as a second language'))
    ]
  }),
  srcf('Richard & Lucille Harrison Scholarship', 1872, {
    amount: [10000, 10000, '$10,000 | Preference will be given'], need: true, geo: { level: 'school_district', states: ['CA'] },
    rules: [
      G(F('Applicant has a 2.5+ GPA (not required for students attending vocational school)', ['academic.gpa', 'academic.status'], '2.5+ GPA (not applicable for students attending vocational school)')),
      G(H('geo.school_district', 'eq', 'Woodland Joint Unified School District', 'Woodland Joint Unified School District'))
    ]
  }),
  srcf('Roy and Cynthia Kroener Family Scholarship', 1718, {
    amount: [3000, 5000, '$3,000 – $5,000 | Preference to United States citizens'], gpa: gpa(3.0), need: true, levels: ['hs_senior'], geo: { level: 'city', states: ['CA'] },
    rules: [
      hsOnly('Graduating high school senior in Davis'),
      G(H('geo.city', 'eq', 'Davis, CA', 'Graduating high school senior in Davis'))
    ]
  }),
  srcf('Sacramento Police Foundation Scholarship', 1955, {
    amount: [1000, 1000, '$1,000 | Have performed a minimum of 50 hours'], gpa: gpa(2.5), levels: ['hs_senior'], geo: { level: 'state', states: ['CA'] },
    rules: [
      hsOnly('High school senior enrolled in a Criminal Justice and Public Service Magnet Academy program'),
      G(F('Applicant is enrolled in a Criminal Justice and Public Service Magnet Academy program in high school', ['geo.high_school', 'activities.extracurricular'], 'enrolled in a Criminal Justice and Public Service Magnet Academy program')),
      G(F('Applicant will attend an accredited college or university in California', ['academic.institution'], 'Any accredited 2-year or 4-year college or university in California')),
      G(F('Applicant has performed at least 50 hours of community service', ['activities.extracurricular'], 'Have performed a minimum of 50 hours of community service'))
    ]
  }),
  srcf('Sacramento Region REACH (Rincon Environment and Climate Heroes) Scholarship', 1836, {
    amount: [1500, 1500, '$1,500 | Preference will be given to applicants who are first generation'], gpa: gpa(3.0, '3.0 + GPA'), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      hsU('Graduating high school student or undergraduate college student'),
      cnty(SAC4, 'attending or have attended a high school or college in El Dorado, Placer, Sacramento or Yolo Counties'),
      G(F('Applicant attends an accredited college or university in California', ['academic.institution'], 'Any accredited 2-year or 4-year college or university in California')),
      G(H('academic.cip_codes', 'prefix_any', ['03', '04.03', '30.33'], 'Environmental sciences, land use planning, natural resources, cultural resources or sustainability'))
    ]
  }),
  srcf('Sarah A. Bonnifield Vietnam Veterans Scholarship Fund', 1711, {
    amount: [1000, 1000, '$1,000 | Be a Vietnam Veteran'], levels: ['hs_senior', 'undergrad'], geo: { level: 'national' },
    rules: [
      hsU('High school senior or undergraduate college student'),
      G(H('affiliations.military[].era', 'contains_any', ['vietnam'], 'Be a Vietnam Veteran or a dependent or a spouse, son, daughter, grandson, granddaughter, nephew or niece of a Vietnam Veteran')),
      G(H('affiliations.military[].who', 'in', ['self', 'parent', 'grandparent', 'spouse'], 'Be a Vietnam Veteran or a dependent or a spouse, son, daughter, grandson, granddaughter, nephew or niece of a Vietnam Veteran'))
    ]
  }),
  srcf('Saylor Family Scholarship', 1714, {
    amount: [1000, 2500, '$1,000 – $2,500 | Must have experienced'], gpa: gpa(2.5), need: true, levels: ['hs_senior'], geo: { level: 'school_district', states: ['CA'] },
    rules: [
      hsOnly('Graduating high school senior at Davis Joint Unified School District or Winters Joint Unified School District'),
      G(H('geo.school_district', 'in', ['Davis Joint Unified School District', 'Winters Joint Unified School District'], 'Graduating high school senior at Davis Joint Unified School District or Winters Joint Unified School District')),
      G(F('Applicant has experienced significant life challenges such as foster care, death of a family member, teen parenthood, behavioral health challenges, juvenile justice involvement, or working during high school due to financial need', ['circumstances.foster', 'circumstances.parent_status', 'circumstances.dependents', 'circumstances.family_illness', 'activities.work[].role'], 'Must have experienced significant life challenges'))
    ]
  }),
  srcf('Schwab-Rosenhouse Memorial Scholarship', 'https://programs.applyists.com/srms/', {
    amount: [1000, 5000, '$1,000 – $5,000 | Must meet California State residency'], need: true, levels: ['hs_senior'],
    rules: [
      hsOnly('Graduating high school seniors who have lived in El Dorado, Placer, Yolo or Sacramento for at least two years'),
      G(H('geo.county', 'in', SAC4, 'Graduating high school seniors who have lived in El Dorado, Placer, Yolo or Sacramento for at least two years')),
      G(H('geo.state', 'eq', 'CA', 'Must meet California State residency requirements')),
      G(F('Applicant will attend an accredited college, university or vocational school within 100 miles of the Sacramento County Courthouse', ['academic.institution'], 'within 100 miles of the Sacramento County Courthouse'))
    ]
  }),
  srcf('Stolba/Sukkary Family Scholarship', 1925, {
    amount: [1000, 3000, '$1,000 – $3,000 | Preference will be given to first generation'], gpa: gpa(2.5), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      G(H('academic.status', 'eq', 'hs_senior', 'Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties'),
        H('academic.year', 'eq', 1, 'Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties')),
      cnty(SAC4, 'Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties'),
      G(F('Applicant attends or will attend an accredited 2-year college or vocational or trade school', ['academic.institution', 'academic.status'], 'Any accredited 2-year college or vocational or trade school'))
    ]
  }),
  srcf('SVVMA Registered Veterinary Technician (RVT) Scholarship', 1602, {
    amount: [400, 800, '$400 – $800'], gpa: gpa(2.5),
    rules: [
      G(H('geo.county', 'in', SAC4, 'Open, but must live in or attend a school in El Dorado, Placer, Sacramento, or Yolo counties'),
        F('Applicant attends a school in El Dorado, Placer, Sacramento, or Yolo counties', ['academic.institution', 'geo.hs_county'], 'Open, but must live in or attend a school in El Dorado, Placer, Sacramento, or Yolo counties')),
      G(H('academic.cip_codes', 'prefix_any', ['51.0808'], 'Veterinary Technology program accredited by AVMA/CVTEA')),
      G(F('Applicant demonstrates participation in organized veterinary medicine groups (local VMAs) and/or SVVMA/SVVTA activities', ['affiliations.professional', 'activities.extracurricular'], 'Demonstrate participation in organized veterinary medicine groups'))
    ]
  }),
  srcf('The Sacramento Valley Veterinary Medical Association (SVVMA) Charitable Giving Committee Student Scholarship – UC Davis', 1760, {
    amount: [1000, 1500, '$1,000 – $1,500 | Demonstrate participation'], gpa: gpa(2.5), levels: ['grad'], geo: { level: 'institution', states: ['CA'] },
    rules: [
      G(H('academic.institution', 'eq', 'University of California, Davis', 'UC Davis School of Veterinary Medicine students')),
      G(H('academic.cip_codes', 'prefix_any', ['51.24'], 'Veterinary Medicine program')),
      G(F('Applicant demonstrates participation in organized veterinary medicine groups, SAVMA/local VMAs and SVVMA activities', ['affiliations.professional', 'activities.extracurricular'], 'Demonstrate participation in organized veterinary medicine groups and SAVMA/local VMA'))
    ]
  }),
  srcf('The AVID-College Horizons Scholarship', 1739, {
    amount: [1500, 2000, '$1,500 – $2,000'], need: true, levels: ['hs_senior'],
    rules: [
      hsOnly('Graduating high school senior in Sacramento County'),
      cnty(CA('Sacramento'), 'Graduating high school senior in Sacramento County'),
      G(F('Applicant will attend an accredited 4-year college or university', ['academic.institution'], 'Accredited 4-year college or university')),
      G(F('Applicant participated in the AVID program for at least 3 years in high school', ['activities.extracurricular'], 'Participant in the AVID program for a minimum 3 years in high school'))
    ]
  }),
  srcf('The Diane Dawson Memorial Scholarship', 1635, {
    amount: [1000, 3000, '$1,000 – $3,000 | Have a parent'], gpa: gpa(2.5), levels: ['hs_senior'],
    rules: [
      hsOnly('Graduating high school senior in greater Sacramento or Denver areas'),
      G(F('Applicant lives in the greater Sacramento or Denver area', ['geo.county', 'geo.city', 'geo.state'], 'Graduating high school senior in greater Sacramento or Denver areas')),
      G(F('Applicant has a parent or legal guardian with terminal cancer or another terminal illness, or lost a parent to a terminal disease during high school', ['circumstances.family_illness', 'circumstances.parent_status'], 'Have a parent or legal guardian with terminal cancer or other terminal illness'))
    ]
  }),
  srcf('The Graydon and Myrth Fox Scholarship', 1877, {
    amount: [1000, 1000, '$1,000 | Be a wounded Veteran'], need: true, geo: { level: 'national' },
    rules: [
      G(H('affiliations.military[].killed_or_wounded', 'is_true', undefined, 'You must have been wounded due to a service-related circumstance or be the spouse, dependent child, or grandchild of a Veteran who was killed or wounded')),
      G(H('affiliations.military[].who', 'in', ['self', 'spouse', 'parent', 'grandparent'], 'You must have been wounded due to a service-related circumstance or be the spouse, dependent child, or grandchild of a Veteran who was killed or wounded'))
    ]
  }),
  srcf('The Kathleen Barsotti Scholarship for Sustainable Agriculture', 1789, {
    amount: [4000, 4000, '$4,000, payable at $1,000 per year for 4 years'], amountNote: 'Paid at $1,000 per year for 4 years', gpa: gpa(3.0), levels: ['hs_senior'],
    rules: [
      hsOnly('High school senior in Yolo County'),
      cnty(CA('Yolo'), 'High school senior in Yolo County'),
      G(F('Applicant is pursuing an education that incorporates sustainable agriculture (not limited to agriculture majors)', ['academic.majors', 'academic.cip_codes', 'career.field'], 'Pursuing an education that incorporates sustainable agriculture'))
    ]
  }),
  srcf('The Kristi Karacozoff Memorial Scholarship', 1755, {
    amount: [1000, 2000, '$1,000 – $2,000 | Demonstrate a chronic'], gpa: gpa(3.0), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      hsU('Graduating high school senior or college student who graduated in Sacramento, Placer, El Dorado, or Yolo counties'),
      cnty(SAC4, 'Graduating high school senior or college student who graduated in Sacramento, Placer, El Dorado, or Yolo counties'),
      G(H('circumstances.disability', 'contains_any', ['chronic'], 'Demonstrate a chronic or life-threatening illness with a doctor’s certification of medical condition'))
    ]
  }),
  srcf('The Mark McCollum "Ride On" Scholarship', 1914, {
    amount: [1000, 2000, 'Engineering or construction | $1,000 – $2,000'], gpa: gpa(2.5), levels: ['undergrad'], geo: { level: 'institution', states: ['CA'] },
    rules: [
      G(H('academic.status', 'eq', 'undergrad', 'Undergraduate student | California State University, Sacramento')),
      G(H('academic.institution', 'eq', 'California State University, Sacramento', 'California State University, Sacramento')),
      G(H('academic.cip_codes', 'prefix_any', ['14', '15.10', '46'], 'Engineering or construction'))
    ]
  }),
  srcf('The Max and Nadine Dimick Scholarship', 1754, {
    amount: [1000, 2000, '$1,000 – $2,000'], gpa: gpa(3.0), need: true, levels: ['hs_senior', 'undergrad'],
    rules: [
      hsU('Graduating high school senior or current student'),
      G(F('Applicant attends or will attend an accredited 2-year community college in El Dorado, Placer, Sacramento, or Yolo counties', ['academic.institution'], 'Accredited 2-year community college in El Dorado, Placer, Sacramento, or Yolo counties'))
    ]
  }),
  srcf('The Nadine Dimick Nursing Scholarship', 1757, {
    amount: [1000, 1000, 'Nursing | $1,000'], gpa: gpa(3.0), need: true,
    rules: [
      G(F('Applicant attends an accredited 2-year or 4-year college or university in El Dorado, Placer, Sacramento, or Yolo counties', ['academic.institution'], 'Accredited 2-year or 4-year college or university in the El Dorado, Placer, Sacramento, or Yolo counties')),
      G(H('academic.cip_codes', 'prefix_any', ['51.38'], 'Nursing | $1,000')),
      G(F('Applicant has been accepted into a nursing program (pre-nursing does not qualify)', ['academic.majors', 'academic.concentration'], 'Must be accepted into a nursing program (pre-nursing is not allowed)'))
    ]
  }),
  srcf('The Pacific Coast Building Products Scholarship', 1709, {
    amount: [500, 5000, '$500 – $5,000'], gpa: gpa(2.5), need: true, levels: ['hs_senior'], geo: { level: 'national' },
    rules: [
      hsOnly('Graduating high school senior | Accredited 2-year or 4-year college or university or vocational school approved by the selection committee'),
      G(H('affiliations.employer[].name', 'eq', 'Pacific Coast Building Products', 'Must be a child or grandchild of a current or retired employee of Pacific Coast Building Products')),
      G(H('affiliations.employer[].relationship', 'in', ['parent', 'grandparent'], 'Must be a child or grandchild of a current or retired employee of Pacific Coast Building Products'))
    ]
  }),
  srcf('The Phillip M. Dowd Memorial Scholarship', 1881, {
    amount: [1000, 5000, '$1,000 – $5,000'], gpa: gpa(3.0), need: true, levels: ['hs_senior'],
    rules: [
      hsOnly('Graduating high school senior in Sacramento, Placer, Yolo, Shasta, Yuba, Sutter, Colusa, or Butte Counties'),
      cnty(CA('Sacramento', 'Placer', 'Yolo', 'Shasta', 'Yuba', 'Sutter', 'Colusa', 'Butte'), 'Graduating high school senior in Sacramento, Placer, Yolo, Shasta, Yuba, Sutter, Colusa, or Butte Counties'),
      G(H('academic.cip_codes', 'prefix_any', ['44', '45.10'], 'Public affairs, administration, political science, or government'))
    ]
  }),
  srcf('Yolo Youth Service Awards', 1343, {
    amount: [1000, 1000, '1000; (+$500 to the sponsoring nonprofit)'], amountNote: '$1,000 to the student plus $500 to the sponsoring nonprofit', levels: ['hs_senior'],
    rules: [
      hsOnly('Graduating high school senior in Yolo County'),
      cnty(CA('Yolo'), 'Graduating high school senior in Yolo County'),
      G(F('Applicant volunteered at least 60 hours with a recognized Yolo County nonprofit during junior and/or senior year of high school', ['activities.extracurricular'], 'Must have volunteered at least 60 hours with a recognized Yolo County nonprofit organization'))
    ]
  })
];
const SRCF_IDS = [1742, 1713, 1720, 1938, 1880, 1973, 1758, 1726, 1932, 1724, 1716, 1963, 1717, 1882, 1959, 1876, 1721, 1780, 1834, 1941, 1741, 1872, 1718, 1955, 1836, 1711, 1714, 1925, 1602, 1760, 1739, 1635, 1877, 1789, 1755, 1914, 1754, 1757, 1709, 1881, 1343];

/* ---------------- NIAF available scholarships ---------------- */
const NIAF_PAGE = 'https://www.niaf.org/programs/available-scholarships/';
const IT = G(H('identity.heritage', 'contains_any', ['Italian'], 'outstanding Italian American'));
const niaf = (name, amt, o) => {
  const rules = [];
  if (o.it !== false) rules.push(o.itRule || IT);
  if (o.status) rules.push(G(H('academic.status', o.status[0].length === 1 ? 'eq' : 'in', o.status[0].length === 1 ? o.status[0][0] : o.status[0], o.status[1])));
  rules.push(...(o.rules || []));
  if (o.gpa) rules.push(G(H('academic.gpa', 'gte', o.gpa[0], o.gpa[1])));
  const prov = [{ field: 'amount', source_quote: amt[2] }];
  if (o.need) prov.push({ field: 'need_based', source_quote: o.need });
  return {
    name, provider_org: 'National Italian American Foundation', provider_type: 'nonprofit',
    apply_url: 'https://www.niaf.org/programs/scholarships/', source_url: NIAF_PAGE,
    amount: { min: amt[0], max: amt[1], ...(amt[3] ? { note: amt[3] } : {}), ...(o.renewable ? { renewable: true } : {}) },
    deadline: null, cycle_status: 'unknown',
    geo_scope: o.geo || { level: 'national' },
    ...(o.status ? { levels: o.status[0] } : {}),
    ...(o.need ? { need_based: 'need' } : {}),
    eligibility: rules, provenance: prov, verified_at: V, confidence: o.conf || 0.75
  };
};
const G35 = [3.5, 'have a GPA of 3.5 (or the equivalent) or higher'];
const A25 = [2500, 5000, 'Amount: $2,500-$5,000'];
const NEEDQ = 'This student must demonstrate financial need';
const niafRecords = [
  niaf('A. Lucchetti Martino Scholarship', A25, {
    status: [['undergrad'], 'undergraduate student who is majoring in International Relations'], gpa: G35,
    rules: [G(H('academic.cip_codes', 'prefix_any', ['45.09'], 'majoring in International Relations'))]
  }),
  niaf('Agnes E. Vaghi Scholarship', [4000, 4000, 'Amount: $4,000'], {
    status: [['undergrad'], 'female Italian American undergraduate student majoring in Italian, English, literature or journalism'], gpa: G35,
    rules: [
      G(H('identity.gender', 'eq', 'woman', 'female Italian American undergraduate student majoring in Italian, English, literature or journalism')),
      G(H('academic.cip_codes', 'prefix_any', ['16.0902', '23', '09.04'], 'majoring in Italian, English, literature or journalism'))
    ]
  }),
  niaf('Caroline Guarini Memorial Scholarship', A25, {
    status: [['undergrad', 'grad'], 'student (undergraduate or graduate) majoring in music or a music-related field'], gpa: G35,
    rules: [
      G(H('academic.cip_codes', 'prefix_any', ['50.09'], 'majoring in music or a music-related field')),
      G(H('geo.state', 'in', ['NY', 'NJ', 'CT'], 'must originally be from New York, New Jersey or Connecticut'))
    ]
  }),
  niaf('Donald Mazzoni Scholarship', [2500, 2500, 'Amount: $2,500'], {
    status: [['undergrad'], 'Italian American undergraduate students (one male, one female) who will be majoring in business'], gpa: [3.0, 'have a GPA of 3.0 (or the equivalent) or higher'],
    rules: [
      G(H('academic.cip_codes', 'prefix_any', ['52'], 'majoring in business at a US college or university that they will attend in person')),
      G(F('Applicant will attend a US college or university in person', ['academic.institution'], 'at a US college or university that they will attend in person')),
      G(F('Applicant has at least 50% Italian American heritage', ['identity.heritage'], 'must have at least 50% Italian American heritage'))
    ]
  }),
  niaf('Emanuele Gianturco Memorial Scholarship', [0, 0, 'Amount: Varies', 'Amount varies (not stated)'], {
    status: [['undergrad', 'grad'], 'Italian American students (undergraduate and graduate). This student must a first-generation'], gpa: G35, need: 'demonstrate financial need',
    rules: [G(H('identity.first_gen', 'is_true', undefined, 'This student must a first-generation college student'))]
  }),
  niaf('Ernest L. Pellegri Scholarship', A25, {
    status: [['undergrad', 'grad'], 'student (undergraduate and graduate) majoring in Latin or a Latin-related field'], gpa: G35, need: NEEDQ,
    rules: [G(H('academic.cip_codes', 'prefix_any', ['16.12'], 'majoring in Latin or a Latin-related field'))]
  }),
  niaf('Filomena C. Peloro Scholarship', A25, {
    status: [['undergrad', 'grad'], 'To be awarded to outstanding Italian American students (undergraduate and graduate). This student must demonstrate financial need'], gpa: G35, need: NEEDQ
  }),
  niaf('Frank D. Stella Scholarship', A25, {
    status: [['undergrad'], 'undergraduate student majoring in business or a business-related field'], gpa: G35,
    rules: [G(H('academic.cip_codes', 'prefix_any', ['52'], 'majoring in business or a business-related field'))]
  }),
  niaf('Furci Family Scholarship Fund', [5000, 10000, 'Amount: $5,000-$10,000'], {
    status: [['undergrad'], 'undergraduate student studying 10 credits or above of Italian language or Italian studies'], gpa: G35,
    rules: [G(F('Applicant is studying 10 or more credits of Italian language or Italian studies at the university level', ['academic.majors', 'academic.cip_codes', 'academic.concentration'], 'studying 10 credits or above of Italian language or Italian studies at the university level'))]
  }),
  niaf('LaMantia Family Scholarship', A25, {
    gpa: G35,
    rules: [G(F('Applicant is studying computer science or STEM technology', ['academic.cip_codes', 'academic.majors'], 'studying computer science or STEM technology'))]
  }),
  niaf('Joanne C. D\'Amico Scholarship', [0, 0, 'To be awarded to an outstanding female Italian American undergraduate student majoring in English', 'Amount not stated on the page'], {
    status: [['undergrad'], 'female Italian American undergraduate student majoring in English, literature, Italian, history, art history or creative writing'], gpa: G35,
    rules: [
      G(H('identity.gender', 'eq', 'woman', 'female Italian American undergraduate student majoring in English, literature, Italian, history, art history or creative writing')),
      G(H('academic.cip_codes', 'prefix_any', ['23', '16.0902', '54', '50.0703'], 'majoring in English, literature, Italian, history, art history or creative writing'))
    ]
  }),
  niaf('Joseph and Margaret Rhodes Scholarship', A25, {
    status: [['undergrad'], 'undergraduate student who intends to complete 6 or more credits in Italian studies'], gpa: G35,
    rules: [
      G(F('Applicant intends to complete 6 or more credits in Italian studies', ['academic.majors', 'academic.concentration'], 'intends to complete 6 or more credits in Italian studies')),
      G(F('Applicant is active in community service', ['activities.extracurricular'], 'is active in community service'))
    ]
  }),
  niaf('Massachusetts Italian American Charitable Society Scholarship', A25, {
    gpa: G35, geo: { level: 'state', states: ['MA'] },
    rules: [G(H('geo.state', 'eq', 'MA', 'with a permanent residence in Massachusetts'))]
  }),
  niaf('Maurizio A. Gianturco Scholarship', A25, {
    it: false, gpa: [3.5, 'Students should also have a GPA of 3.5 or higher'], need: 'with demonstrated financial need',
    rules: [
      G(F('Applicant is studying abroad in Italy', ['academic.institution'], 'studying abroad in Italy')),
      G(H('academic.cip_codes', 'prefix_any', ['50', '24', '16', '04'], 'majoring in fine arts, liberal arts, language or architecture'))
    ]
  }),
  niaf('NIAF Frederick A. DeLuca Foundation Scholarship', [5000, 5000, 'Amount: $5,000'], {
    status: [['hs_senior', 'undergrad', 'grad'], 'incoming freshman, undergraduate or graduate student'], gpa: G35
  }),
  niaf('NIAF Gabelli Foundation Scholarship', [2500, 10000, 'Amount: $2,500-$10,000'], {
    it: false, status: [['grad'], 'to complete their Master’s in Business Administration'], gpa: G35, geo: { level: 'institution', states: ['NY'] },
    rules: [
      G(H('academic.institution', 'eq', 'Columbia University', 'attending Columbia University’s School of Business')),
      G(H('academic.cip_codes', 'prefix_any', ['52'], 'to complete their Master’s in Business Administration')),
      G(F('Applicant is an Italian graduate student from Bocconi University', ['identity.citizenship', 'academic.institution'], 'an Italian graduate student from Bocconi University'))
    ]
  }),
  niaf('NIAF Jim Cantalupo Scholarship', A25, {
    status: [['undergrad'], 'undergraduate student majoring in Italian, Spanish, or business'], gpa: G35,
    rules: [G(H('academic.cip_codes', 'prefix_any', ['16.0902', '16.0905', '52'], 'majoring in Italian, Spanish, or business'))]
  }),
  niaf('NIAF Maaco Enterprises, Inc. Scholarship', A25, {
    status: [['undergrad', 'grad'], 'student (undergraduate or graduate) who is originally from Pennsylvania'], gpa: G35, need: NEEDQ, geo: { level: 'state', states: ['PA'] },
    rules: [G(H('geo.state', 'eq', 'PA', 'who is originally from Pennsylvania'))]
  }),
  niaf('NIAF Norman R. Peterson Scholarship', A25, {
    status: [['undergrad', 'grad'], 'student (undergraduate or graduate) at John Cabot University'], gpa: G35, geo: { level: 'institution' },
    rules: [
      G(H('academic.institution', 'eq', 'John Cabot University', 'at John Cabot University')),
      G(H('geo.state', 'in', ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'], 'must originally be from the Midwest'))
    ]
  }),
  niaf('Richard Perrone Scholarship', A25, {
    status: [['undergrad'], 'undergraduate student attending school in Connecticut'], gpa: G35, geo: { level: 'state', states: ['CT'] },
    rules: [
      G(F('Applicant attends a college or university in Connecticut', ['academic.institution'], 'attending school in Connecticut')),
      G(H('academic.cip_codes', 'prefix_any', ['11'], 'majoring in computer science or a technology related field'))
    ]
  }),
  niaf('Salvatore "Sal" Catanese Clark County Scholarship', A25, {
    status: [['hs_senior'], 'incoming freshman who is a graduate of a Clark County, NV high school'], gpa: G35, need: NEEDQ, renewable: true, geo: { level: 'county', states: ['NV'] },
    rules: [G(H('geo.hs_county', 'eq', 'Clark County, NV', 'graduate of a Clark County, NV high school'))]
  }),
  niaf('Salvatore "Sal" Catanese National Scholarship', A25, {
    status: [['hs_senior'], 'To be awarded to an outstanding Italian American incoming freshman. This student must demonstrate financial need'], gpa: G35, need: NEEDQ, renewable: true
  }),
  niaf('The Francesco and Mary Giambelli Foundation Study Abroad Scholarship at John Cabot University', [0, 0, 'To be awarded to an outstanding undergraduate student studying at John Cabot University', 'Amount not stated on the page'], {
    it: false, status: [['undergrad'], 'undergraduate student studying at John Cabot University'], gpa: G35, geo: { level: 'institution' },
    rules: [G(H('academic.institution', 'eq', 'John Cabot University', 'undergraduate student studying at John Cabot University'))]
  }),
  niaf('The Graziadio Legacy Scholarship', [2500, 10000, 'Amount: $2,500-$10,000'], {
    itRule: G(
      H('identity.heritage', 'contains_any', ['Italian'], 'an Italian American student or a student studying Italian'),
      F('Applicant is studying Italian', ['academic.majors', 'academic.concentration'], 'an Italian American student or a student studying Italian')
    ),
    gpa: G35, need: NEEDQ, geo: { level: 'institution', states: ['CA'] },
    rules: [G(H('academic.institution', 'eq', 'Pepperdine University', 'enrolled at the George L. Graziadio School of Business and Management at Pepperdine University'))]
  }),
  niaf('The Louis A. Caputo, Jr. Legal Scholarship', A25, {
    gpa: G35,
    rules: [G(
      H('academic.cip_codes', 'prefix_any', ['22.01'], 'majoring in law (either in law school or declared pre-law in undergraduate school)'),
      F('Applicant has declared pre-law in undergraduate school', ['academic.majors', 'academic.concentration', 'career.field'], 'majoring in law (either in law school or declared pre-law in undergraduate school)')
    )]
  }),
  niaf('The Marnell Foundation Scholarship', A25, {
    status: [['undergrad', 'grad'], 'student (undergraduate or graduate) originally from the state of Nevada'], gpa: G35, geo: { level: 'state', states: ['NV'] },
    rules: [G(H('geo.state', 'eq', 'NV', 'originally from the state of Nevada'))]
  }),
  niaf('The Martini Foundation/National Italian American Foundation Villanova University Scholarship', A25, {
    status: [['hs_senior', 'undergrad'], 'incoming freshman or current undergraduate student at Villanova University'], gpa: [3.25, 'have a GPA of 3.25 or higher'], need: 'The student must have demonstrated financial need', geo: { level: 'institution', states: ['PA'] },
    rules: [G(H('academic.institution', 'eq', 'Villanova University', 'current undergraduate student at Villanova University'))]
  })
];

/* ---------------- Don Diego ---------------- */
const DD_PAGE = 'https://dondiegoscholarship.org/scholarships/';
const DD = {
  h4: 'https://dondiegoscholarship.org/scholarships/4-h-scholarship-online-application/?scholarship=4-H%20Scholarship',
  ffa: 'https://dondiegoscholarship.org/scholarships/ffa-scholarship-online-application/?scholarship=FFA%20Scholarship',
  emp: 'https://dondiegoscholarship.org/scholarships/employee-scholarship-online-application/?scholarship=Employee%20Scholarship',
  exh: 'https://dondiegoscholarship.org/scholarships/exhibitor-participant-scholarship-online-application/?scholarship=Exhibitor/Participant%20Scholarship',
  voc: 'https://dondiegoscholarship.org/scholarships/vocational-educational-online-application/?scholarship=Vocational%20Education%20Scholarship'
};
const ddStatus = q => G(H('academic.status', 'eq', 'hs_senior', q));
const ddFair = G(F('Applicant has participated (not necessarily in the applying year) in a competitive exhibit department at the San Diego County Fair', ['activities.competitions', 'activities.extracurricular'], 'have participated (not necessarily during the applying year) in a competitive exhibit department at the San Diego County Fair'));
const dd = (name, url, amt, rules, extraNote) => ({
  name, provider_org: 'Don Diego Scholarship Foundation', provider_type: 'nonprofit',
  apply_url: url, source_url: DD_PAGE,
  amount: { min: 0, max: amt[0], note: amt[1] },
  deadline: '2027-03-30', cycle_status: 'open',
  geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior'],
  eligibility: rules,
  provenance: [
    ...(amt[2] ? [{ field: 'amount', source_quote: amt[2] }] : []),
    { field: 'deadline', source_quote: 'Deadline to Apply: Midnight on March 30, 2027' }
  ],
  verified_at: V, confidence: 0.65
});
const HSQ = 'Applicant must be a high school student applying for/accepted at a college';
const ddRecords = [
  dd('4-H Scholarship', DD.h4, [10000, 'Stated as "$10,000 In Awards" (category total); individual award size not stated', '$10,000'], [
    ddStatus(HSQ),
    G(H('activities.competitions', 'contains_any', ['4h'], 'Applicant must be a member in good standing of 4-H'),
      H('affiliations.fraternal[].org', 'eq', 'Grange', 'Members of Grange are eligible to apply for the 4-H scholarship')),
    ddFair
  ]),
  dd('FFA Scholarship', DD.ffa, [10000, 'Stated as "$10,000 In Awards" (category total); individual award size not stated', '$10,000'], [
    ddStatus(HSQ),
    G(H('activities.competitions', 'contains_any', ['ffa'], 'Applicant must be a member in good standing of FFA')),
    ddFair
  ]),
  dd('JLA Scholarship', DD.h4, [0, 'Amount not stated; an additional scholarship for 4-H and FFA exhibitors'], [
    ddStatus(HSQ),
    G(H('activities.competitions', 'contains_any', ['4h', 'ffa'], 'offered to students who qualify for the 4-H or FFA Scholarship')),
    G(F('Applicant meets JLA eligibility requirements and participates in the Junior Livestock Auction at the San Diego County Fair', ['activities.competitions', 'activities.extracurricular'], 'Applicant must meet JLA eligibility requirements and participate in the Junior Livestock Auction at the San Diego County Fair'))
  ]),
  dd('Employee Scholarship', DD.emp, [10000, 'Stated as "$10,000 In Awards" (category total); individual award size not stated', '$10,000'], [
    ddStatus(HSQ),
    G(
      H('activities.work[].employer', 'in', ['Del Mar Fairgrounds', 'Del Mar Thoroughbred Club', 'Premier Food Services'], 'Applicant must show verification of employment (prior to the applying year) by the Del Mar Fairgrounds, Del Mar Thoroughbred Club, Premier Food Services or contractor of the Del Mar Fairgrounds'),
      F('Applicant was employed (prior to the applying year) by a contractor of the Del Mar Fairgrounds', ['activities.work[].employer', 'activities.work[].dates'], 'Premier Food Services or contractor of the Del Mar Fairgrounds')
    )
  ]),
  dd('Exhibitor/Participant Scholarship', DD.exh, [10000, 'Stated as "$10,000 In Awards" (category total); individual award size not stated', '$10,000'], [
    ddStatus(HSQ),
    G(F('Applicant participated (prior to the applying year) in a competitive exhibit department or as an entertainer at the San Diego County Fair, Del Mar National Horse Show or another equestrian event at the Del Mar Fairgrounds and/or Horsepark', ['activities.competitions', 'activities.extracurricular'], 'Applicant must have participated (prior to the applying year) in a competitive exhibit department or as an entertainer in the special events department'))
  ]),
  dd('Vocational Education Scholarship', DD.voc, [5000, 'Stated as "$5,000 In Awards" (category total); individual award size not stated', '$5,000'], [
    ddStatus('Applicant must be a high school student applying for/accepted at a college or certificate program'),
    G(F('Applicant is pursuing an AA/AS degree or certificate at a community college or accredited trade school', ['academic.institution', 'academic.status', 'career.field'], 'offered to support students pursuing an AA/AS degree or certificate at a community college or accredited trade school')),
    G(F('Applicant participated (prior to the applying year) in an event at the Del Mar Fairgrounds, Horsepark or Del Mar Thoroughbred Club, or worked for the Fairgrounds, the Thoroughbred Club or a Fairgrounds contractor', ['activities.extracurricular', 'activities.work[].employer'], 'Applicant must have participated (prior to the applying year) in an event at the Del Mar Fairgrounds or Horsepark'))
  ])
];

/* ---------------- BGC ---------------- */
const BGC_PAGE = 'https://bgcsandieguito.org/about/educational-scholarship-program/';
const bgcBase = {
  provider_org: 'Boys & Girls Clubs of Northwest San Diego', provider_type: 'nonprofit', source_url: BGC_PAGE,
  amount: { min: 0, max: 0, note: 'Amount not stated on the page' },
  geo_scope: { level: 'county', states: ['CA'] }, verified_at: V
};

export default {
  'https://bgcsandieguito.org/about/educational-scholarship-program/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      {
        ...bgcBase, name: 'Leonard and Edith Polster Scholarship',
        apply_url: 'https://bgcgreatertogether.org/wp-content/uploads/2026/03/ScholarshipApplication2026.pdf',
        deadline: null, cycle_status: 'unknown', levels: ['hs_senior'], need_based: 'need',
        eligibility: [
          G(H('academic.status', 'eq', 'hs_senior', 'awarded annually to graduating high school seniors who plan to continue their education at a CA college or university')),
          G(F('Applicant plans to attend a California college or university, community college, or trade/technical school', ['academic.institution', 'geo.residency'], 'plan to continue their education at a CA college or university, a community college, or trade/technical school'))
        ],
        provenance: [
          { field: 'need_based', source_quote: 'Focuses on financial need and potential for success' }
        ],
        confidence: 0.6
      },
      {
        ...bgcBase, name: 'The James E. and Patricia Townsend Memorial Fund',
        apply_url: 'https://bgcgreatertogether.org/wp-content/uploads/2026/03/ScholarshipApplication2026.pdf',
        deadline: null, cycle_status: 'unknown', levels: ['hs_senior'],
        eligibility: [
          G(H('academic.status', 'eq', 'hs_senior', 'awarded annually to graduating high school seniors who plan to pursue careers in the computer field')),
          G(
            F('Applicant plans to pursue a career in the computer field', ['career.field', 'academic.cip_codes'], 'plan to pursue careers in the computer field and/or have Boys & Girls Clubs involvement'),
            F('Applicant has been involved with Boys & Girls Clubs', ['activities.extracurricular', 'affiliations.member_org[].name'], 'plan to pursue careers in the computer field and/or have Boys & Girls Clubs involvement')
          )
        ],
        confidence: 0.6
      },
      {
        ...bgcBase, name: 'BGC Northwest San Diego Trade, Technical & Vocational Scholarship',
        apply_url: 'https://bgcgreatertogether.org/wp-content/uploads/2026/03/ScholarshipApplication2026.pdf',
        deadline: null, deadline_kind: 'rolling', cycle_status: 'open',
        eligibility: [
          G(H('academic.status', 'eq', 'trade', 'pursuing education/certification from a trade, technical or vocational school rather than a traditional college or university'))
        ],
        provenance: [
          { field: 'deadline', source_quote: 'Scholarships are available year-round.' }
        ],
        confidence: 0.6
      }
    ],
    award_names: ['Leonard and Edith Polster Scholarship', 'The James E. and Patricia Townsend Memorial Fund', 'BGC Northwest San Diego Trade, Technical & Vocational Scholarship'],
    follow_links: [
      'https://bgcgreatertogether.org/wp-content/uploads/2026/03/PolsterCover2026.pdf',
      'https://bgcgreatertogether.org/wp-content/uploads/2026/03/Townsend2026Cover.pdf',
      'https://bgcgreatertogether.org/wp-content/uploads/2026/03/TTV-Scholarship2026.pdf'
    ],
    vocabulary_gaps: ['Community tie to the Boys & Girls Clubs service area is implied ("youth in our community") but not stated as a rule'],
    notes: 'Three awards with short descriptions; amounts and deadlines are in linked PDFs, not on the page. Page says "2026 Applications Are Now Open!" but gives no deadline, so Polster and Townsend are unknown. The trade scholarship is available year-round (rolling, open). follow_links are the per-award instruction PDFs.'
  },

  'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Downtown San Diego Lions Club Scholarship', provider_org: 'Downtown San Diego Lions Club Welfare Foundation', provider_type: 'fraternal',
      apply_url: 'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf',
      source_url: 'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf',
      amount: { min: 2000, max: 2000 }, deadline: '2024-03-13', cycle_status: 'closed',
      geo_scope: { level: 'school_district', states: ['CA'] }, levels: ['hs_senior'], need_based: 'need',
      effort: { essay_words: null, recs_required: 3 },
      eligibility: [
        G(H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Applicants must be U.S. citizens or legal residents')),
        G(H('academic.status', 'eq', 'hs_senior', 'Graduating seniors will be selected only from Hoover, Garfield, Kearny, Twain, Lincoln, San Diego, Monarch and Gompers High Schools')),
        G(H('geo.high_school', 'in', ['Hoover High School', 'Garfield High School', 'Kearny High School', 'Mark Twain High School', 'Lincoln High School', 'San Diego High School', 'Monarch School', 'Gompers Preparatory Academy'], 'Graduating seniors will be selected only from Hoover, Garfield, Kearny, Twain, Lincoln, San Diego, Monarch and Gompers High Schools'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Scholarships of $2,000 will be awarded to each student selected' },
        { field: 'deadline', source_quote: 'by 12:00 pm Wednesday, March 13, 2024' },
        { field: 'need_based', source_quote: 'scholarships will be awarded based on demonstrated community service, financial need, and merit' },
        { field: 'effort', source_quote: 'THREE TYPED PERSONAL REFERENCE LETTERS' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['"Legal residents" must submit an alien registration card; mapped to permanent_resident'],
    notes: 'A 2024 application PDF (stale cycle). Full high school names are expanded from the short names on the form (Twain -> Mark Twain High School, Monarch -> Monarch School, Gompers -> Gompers Preparatory Academy), a judgment call. Essay length is not given. Letters verifying community service are also required. Selection weighs service, need and merit; need_based set to need.'
  },

  'https://clarkedsfellowship.org/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'William D. Clarke, Sr. Diplomatic Security Fellowship', provider_org: 'U.S. Department of State (administered by The Washington Center)', provider_type: 'government',
      apply_url: 'https://clarkedsfellowship.org/how-to-apply/', source_url: 'https://clarkedsfellowship.org/',
      amount: { min: 0, max: 0, note: 'Amount not stated on the home page' }, deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['grad'],
      eligibility: [
        G(F('Applicant wants to pursue a master\'s degree', ['academic.status', 'academic.grad_date'], 'a two-year graduate fellowship program designed for individuals who want to pursue a master’s degree')),
        G(F('Applicant wants a career as a Diplomatic Security Service Special Agent in the Foreign Service', ['career.field', 'career.sectors'], 'a career as a Diplomatic Security Service (DSS) Special Agent in the Foreign Service'))
      ],
      provenance: [
        { field: 'levels', source_quote: 'a two-year graduate fellowship program' }
      ],
      verified_at: V, confidence: 0.5
    }],
    follow_links: [],
    vocabulary_gaps: [],
    notes: 'Home page of a State Department funded graduate fellowship. Eligibility, amount, deadline and any service obligation are on linked sub-pages (Eligibility, How To Apply) that are not in this snapshot, so only the purpose-level requirements are encoded. Could be argued not_scholarship (a fellowship home page); labeled single because students apply to it for graduate funding.'
  },

  'https://www.coca-colascholarsfoundation.org/apply/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Coca-Cola Scholars Program Scholarship', provider_org: 'Coca-Cola Scholars Foundation', provider_type: 'private_foundation',
      apply_url: 'https://webportalapp.com/sp/login/cokescholar', source_url: 'https://www.coca-colascholarsfoundation.org/apply/',
      amount: { min: 20000, max: 20000 }, deadline: '2026-09-30', cycle_status: 'open',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'merit',
      effort: { essay_words: 0 },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'who will graduate high school during the 2026-2027 academic school year')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident', 'refugee_asylee'], 'U.S. Citizens, U.S. Nationals, U.S. Permanent Residents, Refugees, Asylees, Cuban-Haitian Entrants, or Humanitarian Parolees')),
        G(H('academic.gpa', 'gte', 3.0, 'Able to verify a minimum overall B/3.0 GPA in high school coursework')),
        G(F('Applicant attends high school in one of the 50 U.S. states, the District of Columbia, Puerto Rico, or a select DoD school (not an American or expat school abroad)', ['geo.state', 'geo.high_school'], 'attending school in one of the 50 U.S. states, the District of Columbia, Puerto Rico, or select DoD schools')),
        G(F('Applicant is NOT a child or grandchild of a current employee, officer or owner (or a former employee receiving retirement benefits) of Coca-Cola bottling companies, The Coca-Cola Company, or its divisions or subsidiaries', ['affiliations.employer[].name', 'affiliations.employer[].relationship', 'affiliations.employer[].status'], 'Children or grandchildren of current employees, officers, or owners of Coca-Cola bottling companies'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'This $20,000 college scholarship is for high school students graduating during the 2026-2027 school year.' },
        { field: 'deadline', source_quote: 'The deadline to apply is Wednesday, September 30, 2026, at 5 pm Eastern.' },
        { field: 'need_based', source_quote: 'The Coca-Cola Scholars Program scholarship is an achievement-based scholarship' },
        { field: 'effort', source_quote: 'This phase requires no essays, no transcript, and no recommendations.' }
      ],
      verified_at: V, confidence: 0.85
    }],
    follow_links: [
      'https://www.ptk.org/scholarships/coca-cola-academic-team-scholarship/',
      'https://www.ptk.org/scholarships/coca-cola-leaders-of-promise-scholarship/'
    ],
    vocabulary_gaps: [
      'Cuban-Haitian entrants and humanitarian parolees are eligible but have no citizenship value (they fall under "other")',
      'Exclusion by a relative\'s employer (Coca-Cola family members) cannot be expressed as a hard rule',
      'Temporary residents and students at American/expat schools abroad are excluded'
    ],
    notes: 'The page also briefly describes two Phi Theta Kappa programs funded by the foundation (Coca-Cola Community College Academic Team, Coca-Cola Leaders of Promise) with details at ptk.org; they are secondary, so the page is labeled single for the Coke Scholars award, with the PTK pages in follow_links. Phase 1 has no essays; semifinalists later submit essays, a transcript and a recommendation, and finalists interview. essay_words 0 reflects the initial application only.'
  },

  'https://dondiegoscholarship.org/scholarships/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: ddRecords,
    award_names: ['4-H Scholarship', 'FFA Scholarship', 'JLA Scholarship', 'Employee Scholarship', 'Exhibitor/Participant Scholarship', 'Vocational Education Scholarship', 'CGW Family Foundation Scholarship', 'Liss Family Scholarship', 'Dredge Family Scholarship', 'Edwards Family Scholarship'],
    follow_links: [DD.h4, DD.ffa, DD.emp, DD.exh, DD.voc],
    vocabulary_gaps: [
      'Participation in San Diego County Fair / Del Mar Fairgrounds events has no field',
      '"Good standing" membership in 4-H or FFA approximated with activities.competitions',
      'Applicants may apply in one scholarship category only'
    ],
    notes: 'Page is contradictory: "Applications are now available!" with a March 30, 2027 deadline, but also "The application process is now closed." Treated as open for the 2027 cycle. The "$10,000 In Awards" figures are category totals, used as max. The 20K four-year family scholarships (CGW, Liss, Dredge, Edwards) are donor-named awards to past recipients and are listed only as award names. Application PDFs on the page are from 2017.'
  },

  'https://foldsofhonor.org/scholarships/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      {
        name: 'Folds of Honor Military Scholarships', provider_org: 'Folds of Honor Foundation', provider_type: 'nonprofit',
        apply_url: 'https://foldsofhonor.org/scholarships/military-scholarships/', source_url: 'https://foldsofhonor.org/scholarships/',
        amount: { min: 0, max: 5000, note: 'Based on unmet need; K-12 private school up to $5,000 per year; Higher Education payments up to $2,500 per term ($1,250 part-time)' },
        deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
        geo_scope: { level: 'national' }, need_based: 'need',
        eligibility: [
          G(H('affiliations.military[].who', 'in', ['parent', 'spouse'], 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.')),
          G(
            H('affiliations.military[].killed_or_wounded', 'is_true', undefined, 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.'),
            H('affiliations.military[].disability_rating', 'is_true', undefined, 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.')
          )
        ],
        provenance: [
          { field: 'amount', source_quote: 'the maximum payment allowable per term is $2,500 ($1,250 for part-time students)' },
          { field: 'deadline', source_quote: 'Our scholarship application window is open between February 1 and March 31 each year.' },
          { field: 'need_based', source_quote: 'The Folds of Honor scholarship is based on unmet need.' }
        ],
        verified_at: V, confidence: 0.7
      },
      {
        name: 'Folds of Honor First Responder Scholarships', provider_org: 'Folds of Honor Foundation', provider_type: 'nonprofit',
        apply_url: 'https://foldsofhonor.org/scholarships/first-responder-scholarships/', source_url: 'https://foldsofhonor.org/scholarships/',
        amount: { min: 0, max: 5000, note: 'Based on unmet need; K-12 private school up to $5,000 per year; Higher Education payments up to $2,500 per term ($1,250 part-time)' },
        deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
        geo_scope: { level: 'national' }, need_based: 'need',
        eligibility: [
          G(F('Applicant is the spouse or dependent of a first responder (firefighter, law enforcement officer, paramedic, EMT or similar) who died or was catastrophically injured', ['affiliations.employer[].name', 'affiliations.employer[].relationship', 'circumstances.parent_status'], 'Eligibility for FOH First Responder scholarships extend to the spouse and/or dependent(s) of a first responder who has fallen or has been catastrophically injured'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'a check (up to $5000) for the entire academic year' },
          { field: 'deadline', source_quote: 'Our scholarship application window runs from February 1 to March 31 every year.' },
          { field: 'need_based', source_quote: 'The Folds of Honor scholarship is based on unmet need.' }
        ],
        verified_at: V, confidence: 0.65
      }
    ],
    award_names: ['Military Scholarships', 'First Responder Scholarships', 'Higher Education Scholarship', 'Children\'s Fund Scholarship'],
    follow_links: ['https://foldsofhonor.org/scholarships/military-scholarships/', 'https://foldsofhonor.org/scholarships/first-responder-scholarships/'],
    vocabulary_gaps: [
      'First-responder family status has no field',
      'Higher Education awards require a 2.0+ term GPA for the two most recent terms on acceptance (does not apply to K-12 Children\'s Fund, so not encoded as a rule)'
    ],
    notes: 'Hub page for two programs, each covering Higher Education and K-12 (Children\'s Fund private school/tutoring). "Application Window Is Closed"; the window is Feb 1 to Mar 31 every year, so the next cycle has not opened (upcoming), deadline month/day only. Amount is need-based, not flat; max 5000 reflects the stated K-12 cap, higher-ed annual cap is not stated.'
  },

  'https://www.girlscouts.org/goldawardscholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'GSUSA Gold Award Scholarship', provider_org: 'Girl Scouts of the USA', provider_type: 'nonprofit',
      apply_url: 'https://www.girlscouts.org/goldawardscholarship', source_url: 'https://www.girlscouts.org/goldawardscholarship',
      amount: { min: 5000, max: 5000 }, deadline: '2026-04-14', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad'],
      effort: { essay_words: 500 },
      eligibility: [
        G(F('Applicant is a Gold Award Girl Scout whose final report was approved in GoGold within the eligibility date range', ['affiliations.member_org[].name', 'activities.leadership'], 'Gold Award Girl Scouts who are high school seniors or recent high school graduates can apply')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad'], 'Gold Award Girl Scouts who are high school seniors or recent high school graduates can apply'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Gold Award Girl Scouts can earn a $5,000 scholarship.' },
        { field: 'deadline', source_quote: 'Apply between March 13 - April 14, 2026.' },
        { field: 'effort', source_quote: 'In either video (3 minutes or less) or written (500 words or fewer) format, answer four questions' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Gold Award earned within a date window (seniors earning before April 1, 2026; graduates who earned after March 31, 2025) has no field',
      'Applicants who applied in a previous year are not eligible to re-apply',
      'Selection is one recipient per council via council nomination'
    ],
    notes: 'The 2026 program has closed; check back in 2027. Four questions answered in video (3 min) or written (500 words) form; essay_words is per answer. "Recent graduates" mapped to undergrad status.'
  },

  'https://www.girlscouts.org/en/scholarships.All.All.html': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [], award_names: [],
    notes: 'Scholarship search hub for Girl Scouts; the listings load dynamically via a Type/State filter and none appear in the snapshot text. Only navigation, a CollegeLab promo and a listing request form.'
  },

  'https://www.kofc.org/resources/scholarships/us-undergraduate-scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Knights of Columbus U.S. Undergraduate Scholarships', provider_org: 'Knights of Columbus Supreme Council', provider_type: 'fraternal',
      apply_url: 'https://aim.applyists.net/KofC', source_url: 'https://www.kofc.org/resources/scholarships/us-undergraduate-scholarships/',
      amount: { min: 0, max: 1500, renewable: true, note: 'Maximum $1,500 per year, renewable up to four years' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Entering freshman year, of a four-year, undergraduate program, leading to a bachelor')),
        G(F('Applicant will attend a Catholic college or university in the United States', ['academic.institution'], 'at a Catholic college or Catholic university, in the United States')),
        G(H('affiliations.fraternal[].org', 'in', ['Knights of Columbus', 'Columbian Squires'], 'A member in good standing of the Knights of Columbus, a son or daughter of such a member')),
        G(H('affiliations.fraternal[].member', 'in', ['self', 'parent'], 'A member in good standing of the Knights of Columbus, a son or daughter of such a member'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'The maximum scholarship is $1,500 per year, renewable each year of undergraduate study to a total of four years' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: [
      'Children of deceased members who were in good standing at death are eligible (member status "deceased" has no value)',
      'Good standing in the Knights of Columbus has no field',
      'Some component funds (Percy J. Johnson) are for young men with financial need; others (Goularte) are need-based'
    ],
    notes: 'One application (ISTS, program key KofC) covers several endowed funds (Pro Deo and Pro Patria, McDevitt, Johnson, LaBella, Goularte), modeled as one record. No deadline on the page. "Entering freshman" mapped to hs_senior.'
  },

  'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      {
        name: 'Educational & Cultural Trust Fund Scholarship Awards', provider_org: 'Local Union No. 3 IBEW Educational & Cultural Trust Fund', provider_type: 'union',
        apply_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program', source_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program',
        amount: { min: 0, max: 7500, note: 'Up to $7,500 per year toward tuition' }, deadline: '2025-01-31', cycle_status: 'closed',
        geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad'],
        eligibility: [
          G(H('affiliations.union[].name', 'eq', 'IBEW', 'Local Union No. 3 IBEW')),
          G(H('affiliations.union[].local', 'eq', '3', 'Local Union No. 3 IBEW')),
          G(H('academic.status', 'eq', 'hs_senior', 'a child graduating high school in June 2025 or already enrolled in their first year of college'),
            H('academic.year', 'eq', 1, 'a child graduating high school in June 2025 or already enrolled in their first year of college'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'offer up to $7,500 per year toward your child’s tuition' },
          { field: 'deadline', source_quote: 'Applications are due by January 31st.' }
        ],
        verified_at: V, confidence: 0.55
      },
      {
        name: 'Michael Siegel Memorial Scholarship', provider_org: 'Local Union No. 3 IBEW Educational & Cultural Trust Fund', provider_type: 'union',
        apply_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program', source_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program',
        amount: { min: 5000, max: 5000 }, deadline: '2025-01-31', cycle_status: 'closed',
        geo_scope: { level: 'national' }, levels: ['undergrad'],
        eligibility: [
          G(H('affiliations.union[].name', 'eq', 'IBEW', 'Local Union No. 3 IBEW')),
          G(F('Applicant is the child of an eligible Local 3 Sign Division member', ['affiliations.union[].name', 'affiliations.union[].local'], 'to the children of eligible Sign Division members')),
          G(F('Applicant is pursuing undergraduate study', ['academic.status'], 'which offers $5,000 for undergraduate study'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'which offers $5,000 for undergraduate study' },
          { field: 'deadline', source_quote: 'The same application deadline applies to the Michael Siegel Memorial Scholarship' }
        ],
        verified_at: V, confidence: 0.5
      },
      {
        name: 'IBEW Founders\' Scholarship', provider_org: 'International Brotherhood of Electrical Workers', provider_type: 'union',
        apply_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program', source_url: 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program',
        amount: { min: 0, max: 24000, note: 'Up to $200 per semester credit hour ($134 per trimester credit hour); maximum $24,000 per person over up to 8 years' },
        deadline: '2025-05-01', cycle_status: 'closed',
        geo_scope: { level: 'national' }, levels: ['undergrad', 'grad', 'returning'],
        eligibility: [
          G(F('Applicant is pursuing an associate\'s, bachelor\'s, or postgraduate degree at an accredited college or university', ['academic.status'], 'at any accredited college or university toward an associate’s, bachelor’s, or postgraduate degree')),
          G(F('Applicant\'s field of study will further the electrical industry overall (as determined by the Founders\' Scholarship Administrator)', ['academic.cip_codes', 'career.field'], 'in a field that will further the electrical industry overall'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'The maximum distribution is $24,000 per person over a period not to exceed 8 years.' },
          { field: 'deadline', source_quote: 'a printable application due by May 1st' }
        ],
        verified_at: V, confidence: 0.45
      }
    ],
    award_names: ['Educational & Cultural Trust Fund scholarship awards', 'Michael Siegel Memorial Scholarship', 'Founders\' Scholarship'],
    follow_links: [],
    vocabulary_gaps: [
      'Awards are for children of Local 3 members; union membership belongs to the parent, and union[] has no relationship field',
      'Founders\' Scholarship membership requirements are on ibew.org, not on this page'
    ],
    notes: 'AMBIGUOUS: a union news post dated Jan 20, 2025 announcing that applications were open. It could be labeled not_scholarship (news about a past cycle); labeled listing because it describes three awards with amounts, audiences and deadlines. Deadline years (2025) are inferred from the post date. Award links in the text are email-tracking redirects, so none are in follow_links.'
  },

  'https://www.mlkccsd.org/student-grants/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'MLKCCSD Educational Grant', provider_org: 'Martin Luther King Jr. Community Choir of San Diego', provider_type: 'nonprofit',
      apply_url: 'https://cdn.prod.website-files.com/660b749bb73db20bcf391dda/69251fcba72c1a5c381e0c0a_2026%20MLK%20APPLICATION.docx', source_url: 'https://www.mlkccsd.org/student-grants/',
      amount: { min: 0, max: 0, note: 'Amount not stated on the page' }, deadline: '2026-03-16', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'You must be a Graduating High School Senior')),
        G(H('academic.gpa', 'gte', 2.75, 'You must have a GPA of 2.75 or higher')),
        G(H('geo.county', 'eq', 'San Diego County, CA', 'You must be a resident of San Diego County and a US citizen')),
        G(H('identity.citizenship', 'eq', 'us_citizen', 'You must be a resident of San Diego County and a US citizen')),
        G(F('Applicant intends to pursue their art (singing, dancing, music, visual arts, film, acting, writing or other artistic expression) at a university, college, community college, conservatory or art school next year', ['academic.cip_codes', 'academic.majors', 'activities.extracurricular'], 'You must intend to pursue your art by attending a university, accredited four-year college, community college, conservatory, or art school in the next school year'))
      ],
      provenance: [
        { field: 'deadline', source_quote: 'Send the completed application no later than March 16, 2026' }
      ],
      verified_at: V, confidence: 0.8
    }],
    notes: 'Called an "educational grant" but it is an award to individual students for college, so treated as a scholarship. Provider name expanded from the MLKCCSD abbreviation (judgment call; the page does not spell it out). Page says $360,000 to 147 students since 1998 but no per-award amount.'
  },

  'https://www.niaf.org/programs/available-scholarships/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: niafRecords,
    award_names: niafRecords.map(s => s.name),
    follow_links: [],
    vocabulary_gaps: [
      '"At least 50% Italian American heritage" (Mazzoni) cannot be expressed',
      '"Originally from" a state is approximated with current geo.state',
      'Preferences (Sicilian heritage, Florida residence, northern New Jersey, Boston University, no other aid) are not encoded'
    ],
    notes: 'One NIAF application matches students to all funds. General NIAF eligibility criteria are on the Scholarship Overview page, not here. No deadlines on this page, so all are unknown. apply_url is the Scholarship Overview page linked for "how to" instructions. Maurizio Gianturco, Gabelli (Italian student from Bocconi) and the Giambelli John Cabot award do not require Italian American heritage per the text.'
  },

  'https://www.sacregcf.org/students/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: srcfRecords,
    award_names: srcfRecords.map(s => s.name),
    follow_links: [...SRCF_IDS.map(srcfUrl), 'https://programs.applyists.com/srms/'],
    vocabulary_gaps: [
      '"Attended a school in" a county is approximated with geo.county or geo.hs_county',
      'Preferences (first-generation, foster youth, renewal applicants) are not encoded',
      'Nephews and nieces of Vietnam veterans are eligible for the Bonnifield fund but military[].who has no such value',
      'Honorable service (Fox) has no field'
    ],
    notes: 'Scholarships grid with need, GPA, status, school, major, amount and other criteria per award, so each row is a record (42 rows). No per-award deadlines; the page says most open in December and close in March, so deadline is null/annual_estimate and cycle upcoming. Ramona Burnham is for Baldwin Park USD (Los Angeles County) despite being on a Sacramento page. Mary Ellen Dolcini high school names are expanded from short forms.'
  },

  'https://www.salutetoeducation.com/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Placeholder: the San Diego County Ford Dealers\' Salute to Education scholarship site says the 2026-2027 information and application are not ready yet (expected late October or early November). A real program but nothing extractable; a defensible alternative is single with an upcoming record.'
  },

  'https://www.santacruzrotary.com/academic-scholarship-program.html': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Santa Cruz Rotary Academic Scholarship', provider_org: 'Rotary Club of Santa Cruz', provider_type: 'fraternal',
      apply_url: 'https://docs.google.com/forms/d/e/1FAIpQLSfV4kYX8r6jjtqKSDlSiMkaiGBLnkRUi3K9oDJsLorQ3aG4Nw/viewform?usp=header',
      source_url: 'https://www.santacruzrotary.com/academic-scholarship-program.html',
      amount: { min: 500, max: 5000 }, deadline: '2026-03-13', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad'], need_based: 'either',
      effort: { essay_words: 500, recs_required: 2, formats: ['interview'] },
      eligibility: [
        G(H('geo.county', 'eq', 'Santa Cruz County, CA', 'Students who reside in Santa Cruz County')),
        G(
          H('geo.high_school', 'in', ['Santa Cruz High School', 'Harbor High School', 'Pacific Collegiate School', 'Kirby School', 'Delta Charter High School', 'Costanoa High School'], 'are graduating from Santa Cruz High School, Harbor High School, Pacific Collegiate, Kirby, Delta, Costanoa'),
          F('Applicant is a Rotaract Club member at UC Santa Cruz', ['affiliations.fraternal[].org', 'academic.institution'], 'Rotaract Club Members from UCSC are eligible to apply')
        ),
        G(F('Applicants from Santa Cruz, Harbor, Pacific Collegiate and Kirby should have a GPA above 3.3; Delta and Costanoa applicants are evaluated by a counselor instead', ['academic.gpa', 'geo.high_school'], 'should reflect a GPA greater than 3.3 for applicants from Santa Cruz, Harbor, Pacific Collegiate, and Kirby High Schools')),
        G(F('Applicant plans to enroll in college for the upcoming Fall term', ['academic.grad_date', 'academic.status'], 'Applicants will be considered only if they plan to enroll in college for the upcoming Fall term'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Award amounts range between $500 and $5,000' },
        { field: 'deadline', source_quote: 'by 5 p.m. on March 13, 2026' },
        { field: 'need_based', source_quote: 'depending upon the candidate’s performance and financial need' },
        { field: 'effort', source_quote: 'A maximum 500-word essay' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['Counselor evaluation of ability to succeed (Delta and Costanoa applicants) has no field'],
    notes: 'Most of the page is club navigation. Short school names (Pacific Collegiate, Kirby, Delta, Costanoa) were expanded to full names, a judgment call. The GPA threshold applies only to some schools, so it is fuzzy. Interviews are for finalists. Amount depends on performance and financial need (need_based either).'
  },

  'https://sbfoundation.org/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Santa Barbara Foundation home page: donor, nonprofit grant and event content. No student scholarship is mentioned.'
  },

  'https://sdsu.academicworks.com/opportunities/17312': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Future Educator Endowed Scholarship', provider_org: 'San Diego State University', provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/17312', source_url: 'https://sdsu.academicworks.com/opportunities/17312',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-09-04', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['grad'], need_based: 'need',
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.status', 'eq', 'grad', 'Recipients must be teaching credential candidates in the College of Education')),
        G(H('academic.cip_codes', 'prefix_any', ['13'], 'Recipients must be teaching credential candidates in the College of Education')),
        G(H('academic.gpa', 'gte', 3.5, 'Recipients must have a minimum overall cumulative GPA of 3.50 out of 4.00')),
        G(H('financial.fafsa_filed', 'is_true', undefined, 'Applicants must file a Free Application for Federal Student Aid (FAFSA) or the California Dream Act'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee.' },
        { field: 'deadline', source_quote: '09/04/2026' },
        { field: 'need_based', source_quote: 'Recipients must have financial need, as determined by the SDSU Financial Aid Office.' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['The California Dream Act application is accepted in place of FAFSA; financial.fafsa_filed may not capture Dream Act filers'],
    notes: 'Teaching credential candidates mapped to academic.status = grad (judgment call). Full-time enrollment not required.'
  },

  'https://sfsu.academicworks.com/opportunities/4904': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Community Foundation of Sonoma County Scholarships', provider_org: 'Community Foundation of Sonoma County', provider_type: 'community_foundation',
      apply_url: 'https://sfsu.academicworks.com/opportunities/4904', source_url: 'https://sfsu.academicworks.com/opportunities/4904',
      amount: { min: 0, max: 0, note: 'Award varies (not stated)' }, deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'unknown',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'need',
      effort: { essay_words: null },
      eligibility: [
        G(H('geo.county', 'eq', 'Sonoma County, CA', 'Must be a Sonoma County resident unless otherwise specified by the scholarship')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad'], 'Class Level: HS Seniors; Undergrad: Any; Grad: Other')),
        G(F('Undergraduates must enroll full-time; graduate students at least half-time', ['academic.enrollment', 'academic.status'], 'Enrollment Requirement: Undergrad: FULL-TIME; Grad: HALF-TIME')),
        G(F('Applicant demonstrates perseverance and motivation to attend and complete higher education', ['activities.leadership', 'activities.extracurricular'], 'Must demonstrate financial need and perseverance and motivation to attend and complete higher education'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Number of Awards: Varies' },
        { field: 'deadline', source_quote: '*Deadline: March 2' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Yes' },
        { field: 'effort', source_quote: 'Must provide a personal statement.' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: ['Graduate students are eligible only for some legacy funds'],
    notes: 'External scholarship listed on the SFSU portal (one application covers several CFSC scholarships). Deadline "March 2" has no year, so null with annual_estimate. The structured Deadline field is empty.'
  },

  'https://sfsu.academicworks.com/opportunities/5729': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Scholarship Foundation of Santa Barbara', provider_org: 'Scholarship Foundation of Santa Barbara', provider_type: 'nonprofit',
      apply_url: 'https://sfsu.academicworks.com/opportunities/5729', source_url: 'https://sfsu.academicworks.com/opportunities/5729',
      amount: { min: 500, max: 5000 }, deadline: '2020-01-15', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'need',
      eligibility: [
        G(H('geo.hs_county', 'eq', 'Santa Barbara County, CA', 'Graduate or receive a GED from a Santa Barbara County High School')),
        G(
          H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Citizenship: US Citizen/Perm Res/AB540'),
          F('Applicant qualifies as an AB540 student', ['identity.citizenship', 'geo.residency'], 'U.S. citizen or AB540 are eligible to apply')
        ),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad'], 'Class Level: HS Seniors; Undergrad: Any; Grad: Any')),
        G(F('Applicant plans to attend full time at a Title IV-approved school in the next academic year', ['academic.enrollment'], 'Be planning to attend full time at a Title IV-approved school in the next academic year'))
      ],
      provenance: [
        { field: 'amount', source_quote: '$500-$5,000' },
        { field: 'deadline', source_quote: '*Deadline: January 15 2020' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Yes' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: ['Must have attended at least 4 of the 6 years of grades 7-12 at a Santa Barbara County school'],
    notes: 'External scholarship listing on the SFSU portal with a stale 2020 deadline (stale-listing test). The page is internally inconsistent on enrollment (criterion says full time, structured field says half-time).'
  },

  'https://socialwork.sdsu.edu/stipend/msw': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'California Title IV-E MSW Child Welfare Stipend', provider_org: 'San Diego State University School of Social Work (Cal IV-E program)', provider_type: 'university',
      apply_url: 'https://socialwork.sdsu.edu/stipend/msw/application', source_url: 'https://socialwork.sdsu.edu/stipend/msw',
      amount: { min: 0, max: 50000, renewable: true, note: 'Full-time students receive $25,000 per year up to $50,000 (2 years); part-time county/state employees receive tuition, fees, books and travel reimbursement' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['grad'], service_obligation: true,
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'The Cal IV-E program at SDSU')),
        G(H('academic.status', 'eq', 'grad', 'provides up to $50,000 as a taxable stipend to MSW students')),
        G(H('academic.cip_codes', 'prefix_any', ['44.07'], 'provides up to $50,000 as a taxable stipend to MSW students'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Full-time MSW students receive $25,000 per year of their MSW program not exceeding $50,000 (2 years max).' },
        { field: 'service_obligation', source_quote: 'the post-graduation employment requirement' }
      ],
      verified_at: V, confidence: 0.7
    }],
    follow_links: [],
    vocabulary_gaps: ['Part-time track is limited to concurrent employees of a county or the state Department of Social Services'],
    notes: 'A taxable stipend with a post-graduation child-welfare employment requirement (service obligation). Detailed requirements and deadlines are on the linked Requirements and Application pages, not here. The social-justice orientation language describes what the program seeks, not eligibility.'
  },

  'https://www.straussfoundation.org/apply-1': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Donald A. Strauss Public Service Scholarship', provider_org: 'Strauss Foundation', provider_type: 'private_foundation',
      apply_url: 'https://www.straussfoundation.org/apply-1', source_url: 'https://www.straussfoundation.org/apply-1',
      amount: { min: 15000, max: 15000 }, deadline: null, cycle_status: 'unknown',
      levels: ['undergrad'],
      effort: { essay_words: null, recs_required: 2, formats: ['project'] },
      eligibility: [
        G(H('academic.status', 'eq', 'undergrad', 'The applicant has completed at least one year of college and will not graduate before June 2026')),
        G(H('academic.year', 'gte', 2, 'The applicant has completed at least one year of college')),
        G(F('Applicant will not graduate before June 2026', ['academic.grad_date'], 'will not graduate before June 2026')),
        G(F('Applicant has a desire to make a difference in local, regional, national or international communities', ['activities.extracurricular', 'activities.leadership', 'career.sectors'], 'The applicant has a desire to “make a difference” in local, regional, national, or international communities'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'The $15,000 Award' },
        { field: 'effort', source_quote: 'Two Letters of Recommendation are required.' }
      ],
      verified_at: V, confidence: 0.6
    }],
    vocabulary_gaps: [
      'GPA in the upper 1/3 of their class (class rank) has no field',
      'Participating schools are listed on a separate page (Important Dates & School Contacts)'
    ],
    notes: 'Application-process page. The award name is not stated explicitly beyond "Strauss Award"/"Strauss Scholars"; name is a judgment call. Amount comes from the nav link "The $15,000 Award". A one-page personal essay (no word count) and a 4-page public service project proposal are required. No deadline on the page; the June 2026 graduation cutoff suggests the 2026 cycle.'
  },

  'https://wsac.wa.gov/american-indian-endowed-scholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'American Indian Endowed Scholarship', provider_org: 'Washington Student Achievement Council', provider_type: 'government',
      apply_url: 'https://portal.wsac.wa.gov/a/aies/', source_url: 'https://wsac.wa.gov/american-indian-endowed-scholarship',
      amount: { min: 500, max: 3000, renewable: true, note: 'Around $500 to $3,000; may be received up to five years but must reapply each year' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'state', states: ['WA'] }, levels: ['undergrad', 'grad'], need_based: 'need',
      eligibility: [
        G(H('financial.fafsa_filed', 'is_true', undefined, 'Demonstrate financial need based on a completed FAFSA')),
        G(H('geo.state', 'eq', 'WA', 'Meet Washington State residency requirements')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Intend to enroll full-time as an undergraduate or graduate student')),
        G(H('academic.status', 'in', ['undergrad', 'grad'], 'Intend to enroll full-time as an undergraduate or graduate student')),
        G(F('Applicant will attend a participating public or private college or university in Washington State', ['academic.institution'], 'at a participating public or private college or university in Washington State')),
        G(F('Applicant has close social and cultural ties to an American Indian community in Washington State', ['identity.tribal.status', 'identity.tribal.nation', 'identity.heritage'], 'who have close social and cultural ties to an American Indian community in Washington State')),
        G(F('Applicant intends to use their education to benefit the American Indian community in Washington State', ['career.field', 'career.sectors'], 'Intend to use their education to benefit the American Indian community in Washington State'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Award amounts range from around $500 to $3,000.' },
        { field: 'deadline', source_quote: 'The 2027-28 academic year scholarship applications will be available in December 2026.' },
        { field: 'need_based', source_quote: 'Demonstrate financial need based on a completed FAFSA' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Must not pursue a degree in theology (no negative rule for a list field)',
      'Must not have already received five years of this scholarship'
    ],
    notes: 'The 2026-27 application period has closed and 2027-28 applications open in December 2026, so cycle_status is upcoming with no deadline. The program prioritizes upper-division and graduate students (preference, not encoded).'
  }
};
