// Chunk 02 draft labels, slot B. Drafted independently from the saved page text only.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const C = n => `${n} County, CA`;
const noAmount = 'Amount not stated on the page';

/* ---------- Sacramento Region Community Foundation grid ---------- */
const SAC_URL = 'https://www.sacregcf.org/students/';
const SAC_DEADLINE_Q = 'Most scholarships open in December and close in March.';
const sac = ({ name, id, min, max, amtQ, need, levels, rules, renewable, note, conf = 0.7, essay }) => {
  const s = {
    name, provider_org: 'Sacramento Region Community Foundation', provider_type: 'community_foundation',
    apply_url: id.startsWith('http') ? id : `https://sacregcf.academicworks.com/opportunities/${id}`,
    source_url: SAC_URL,
    amount: { min, max },
    deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'unknown',
    geo_scope: { level: 'county', states: ['CA'] },
    eligibility: rules,
    provenance: [
      { field: 'amount', source_quote: amtQ },
      { field: 'deadline', source_quote: SAC_DEADLINE_Q }
    ],
    verified_at: V, confidence: conf
  };
  if (renewable) s.amount.renewable = true;
  if (note) s.amount.note = note;
  if (levels) s.levels = levels;
  if (need) { s.need_based = 'need'; s.provenance.push({ field: 'need_based', source_quote: 'Demonstrated financial need' }); }
  if (essay !== undefined) s.effort = { essay_words: essay };
  return s;
};
const gpa = (v, q) => G(H('academic.gpa', 'gte', v, q));
const status = (vals, q) => G(vals.length === 1 ? H('academic.status', 'eq', vals[0], q) : H('academic.status', 'in', vals, q));
const cip = (vals, q) => G(H('academic.cip_codes', 'prefix_any', vals, q));
const schoolIn = (counties, q) => G(H('geo.county', 'in', counties.map(C), q), H('geo.hs_county', 'in', counties.map(C), q));
const woman = q => G(H('identity.gender', 'eq', 'woman', q));
const FOUR = ['El Dorado', 'Placer', 'Sacramento', 'Yolo'];

const sacRecords = [
  sac({ name: 'AIA Central Valley/John Ellis Architectural Scholarship', id: '1742', min: 1000, max: 1000, amtQ: 'Architecture | $1,000', levels: ['hs_senior', 'undergrad', 'grad', 'returning'], rules: [
    gpa(3.5, '3.5+ GPA | High school senior, undergraduate college student'),
    status(['hs_senior', 'undergrad', 'grad', 'returning'], 'High school senior, undergraduate college student, graduate student or an adult re-entry student in the counties listed'),
    cip(['04'], 'Accredited 2-year or 4- year college or university or vocational school | Architecture'),
    schoolIn(['Alpine', 'Amador', 'Butte', 'Colusa', 'El Dorado', 'Glenn', 'Lassen', 'Nevada', 'Placer', 'Plumas', 'Sacramento', 'Shasta', 'Sierra', 'Sutter', 'Tehama', 'Yolo', 'Yuba'], 'Have attended or currently attending a school in the following counties')
  ] }),
  sac({ name: 'Benny Goodman Foundation', id: '1713', min: 1000, max: 3500, amtQ: '$1,000 – $3,500', levels: ['hs_senior', 'undergrad'], rules: [
    G(F('Applicant has a 3.0+ GPA in music courses', ['academic.gpa', 'academic.majors'], '3.0+ GPA in music courses')),
    status(['hs_senior', 'undergrad'], 'High school senior or undergraduate college student | Any University of California or California State University'),
    G(F('Applicant attends or will attend a University of California or California State University campus', ['academic.institution'], 'Any University of California or California State University')),
    cip(['50.09'], 'Music with an emphasis in jazz or classical'),
    G(F('Applicant plans to pursue a career in music', ['career.field', 'academic.majors'], 'Plan to pursue a career in music'))
  ] }),
  sac({ name: 'Bryan Potts Scholarship', id: '1720', min: 0, max: 10000, amtQ: 'Up to $10,000', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | Graduating Senior at Rio Americano High School'),
    status(['hs_senior'], 'Graduating Senior at Rio Americano High School'),
    G(H('geo.high_school', 'eq', 'Rio Americano High School', 'Graduating Senior at Rio Americano High School')),
    G(F('Applicant is pursuing a field of study leading to a baccalaureate degree', ['academic.majors', 'academic.status'], 'in a field of study leading to a baccalaureate degree'))
  ] }),
  sac({ name: 'Carroylin and Robert Threlkel Scholarship Fund', id: '1938', min: 1000, max: 5000, amtQ: 'Business-related undergraduate degree | $1,000 – $5,000', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(2.5, 'Demonstrated financial need | 2.5+ GPA | High school senior or undergraduate college student | Any accredited college, university, or community college'),
    status(['hs_senior', 'undergrad'], 'High school senior or undergraduate college student | Any accredited college, university, or community college'),
    cip(['52'], 'Business-related undergraduate degree'),
    woman('Business-related undergraduate degree | $1,000 – $5,000 | Female student')
  ] }),
  sac({ name: 'Creative Arts and Science Scholarship', id: '1880', min: 1000, max: 1500, amtQ: '$1,000-$1,500', need: true, essay: null, rules: [
    gpa(2.0, '2.0+ GPA | Graduating high school senior at Esparto High School'),
    G(H('geo.high_school', 'eq', 'Esparto High School', 'Graduating high school senior at Esparto High School or have graduated from Esparto High School in Yolo County'))
  ] }),
  sac({ name: 'Community Scholarship', id: '1973', min: 2500, max: 2500, amtQ: '| $2,500 | Preference given to students with a GPA range of 2.5-3.5', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | High school senior in Sacramento County'),
    status(['hs_senior'], 'High school senior in Sacramento County'),
    schoolIn(['Sacramento'], 'High school senior in Sacramento County')
  ] }),
  sac({ name: 'David Breaux Memorial Scholarship', id: '1758', min: 2000, max: 2000, amtQ: '$2,000 | Must have attended or be currently attending a school in Yolo County', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(3.0, '3.0+ GPA | Yolo County high school senior or college student in their first year of study'),
    status(['hs_senior', 'undergrad'], 'Yolo County high school senior or college student in their first year of study'),
    G(F('Applicant is a high school senior or a college student in their first year of study', ['academic.status', 'academic.year'], 'Yolo County high school senior or college student in their first year of study')),
    schoolIn(['Yolo'], 'Must have attended or be currently attending a school in Yolo County')
  ] }),
  sac({ name: 'Dillard-Jackson Family Scholarship Fund', id: '1726', min: 1000, max: 1000, amtQ: 'Agriculture | $1,000', need: true, levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | Senior from a high school in the Elk Grove school district'),
    status(['hs_senior'], 'Senior from a high school in the Elk Grove school district'),
    G(H('geo.school_district', 'eq', 'Elk Grove Unified School District', 'Senior from a high school in the Elk Grove school district')),
    cip(['01'], 'with a well-recognized agricultural program | Agriculture')
  ] }),
  sac({ name: 'Dreier Family Scholarship', id: '1932', min: 1000, max: 3000, amtQ: '$1,000 – $3,000 | Plan to work a minimum of 10 hours per week', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(2.5, '2.5+ GPA | High school senior or undergraduate college student currently attending a school in the Sacramento County'),
    status(['hs_senior', 'undergrad'], 'High school senior or undergraduate college student currently attending a school in the Sacramento County'),
    schoolIn(['Sacramento'], 'currently attending a school in the Sacramento County'),
    G(F('Applicant attends or will attend an accredited 2-year college, vocational, trade or technical school in Sacramento County', ['academic.institution', 'academic.status'], 'Accredited 2-year college, vocational, trade or technical school in Sacramento County')),
    G(F('Applicant plans to work at least 10 hours per week while attending college', ['activities.work[].employer', 'activities.work[].dates'], 'Plan to work a minimum of 10 hours per week while attending college'))
  ] }),
  sac({ name: 'Eugene and Thora Chin Scholarship Fund', id: '1724', min: 1000, max: 6000, amtQ: '$1,000 – $6,000 | Asian/Pacific Islander heritage', need: true, rules: [
    G(F('Applicant has a 4.0+ GPA in high school, or a 3.5+ GPA in college', ['academic.gpa', 'academic.status'], '4.0+ GPA in high school or 3.5+ in college')),
    G(H('identity.heritage', 'contains_any', ['Asian', 'Pacific Islander'], 'Asian/Pacific Islander heritage'))
  ] }),
  sac({ name: 'Erin Aaberg Givans Memorial Scholarship', id: '1716', min: 2500, max: 5000, amtQ: '$2,500 – $5,000 | Female student', levels: ['grad'], rules: [
    gpa(2.8, '2.8+ GPA'),
    status(['grad'], 'Any accredited graduate school in California'),
    G(F('Applicant attends an accredited graduate school in California', ['academic.institution', 'geo.state'], 'Any accredited graduate school in California')),
    cip(['44.04', '44.05', '51.22', '51.07'], 'Masters in Public Policy, Public Administration, Public Health or Health Administration'),
    woman('Female student; Career goal is children’s health policy or advocacy'),
    G(F('Applicant has a career goal in children\'s health policy or advocacy', ['career.field'], 'Career goal is children’s health policy or advocacy'))
  ] }),
  sac({ name: 'Jack and Ellie Matranga Scholarship', id: '1963', min: 1500, max: 1500, amtQ: 'Mass media | $1,500', need: true, levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | High School senior attending a school in El Dorado, Placer, Sacramento, or Yolo counties'),
    status(['hs_senior'], 'High School senior attending a school in El Dorado, Placer, Sacramento, or Yolo counties'),
    schoolIn(FOUR, 'High School senior attending a school in El Dorado, Placer, Sacramento, or Yolo counties'),
    cip(['09'], 'Mass media')
  ] }),
  sac({ name: 'Julia R. Millon Memorial Scholarship', id: '1717', min: 1500, max: 1500, amtQ: '$1,500', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | High School senior living within the boundaries of the Winters School District'),
    status(['hs_senior'], 'High School senior living within the boundaries of the Winters School District'),
    G(H('geo.school_district', 'eq', 'Winters Joint Unified School District', 'living within the boundaries of the Winters School District'))
  ] }),
  sac({ name: 'Lionakis Foundation Scholarship Program', id: '1882', min: 2500, max: 2500, amtQ: 'Architecture, Engineering and Interior design | $2,500', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(2.5, '2.5+GPA | High school senior or current undergraduate college student | Accredited 2-year or 4- year college or university | Architecture'),
    status(['hs_senior', 'undergrad'], 'High school senior or current undergraduate college student | Accredited 2-year or 4- year college or university | Architecture'),
    cip(['04', '14', '50.0408'], 'Architecture, Engineering and Interior design')
  ] }),
  sac({ name: 'Li Family Charitable Foundation Scholarship', id: '1959', min: 3000, max: 3000, amtQ: '| $3,000 | Preference will go to first-generation college students', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(3.0, '3.0+GPA | High school senior or current undergraduate college student'),
    status(['hs_senior', 'undergrad'], '3.0+GPA | High school senior or current undergraduate college student')
  ] }),
  sac({ name: 'Mary Ellen Dolcini Scholarship', id: '1876', min: 2500, max: 10000, amtQ: '$2,500 – $10,000 | Mexican American descent', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | High schools in Yolo County'),
    G(H('geo.high_school', 'in', ['Davis Senior High School', 'Da Vinci High School', 'King High School', 'Woodland High School', 'Pioneer High School'], 'High schools in Yolo County: Davis High, Da Vinci High School, King High, Woodland High, or Pioneer High School')),
    G(H('identity.heritage', 'contains_any', ['Mexican'], 'Mexican American descent'))
  ], conf: 0.65 }),
  sac({ name: 'Nancy B. Reardan Scholarship', id: '1721', min: 2000, max: 4000, amtQ: '$2,000 – $4,000', need: true, levels: ['hs_senior'], rules: [
    gpa(3.5, '3.5+ GPA | High school seniors in Sacramento County'),
    status(['hs_senior'], 'Must be a female high school senior attending a school in Sacramento County'),
    schoolIn(['Sacramento'], 'Must be a female high school senior attending a school in Sacramento County'),
    woman('Must be a female high school senior attending a school in Sacramento County')
  ] }),
  sac({ name: 'NorYo Opportunity Scholarship', id: '1780', min: 1000, max: 10000, amtQ: '$1,000 – $10,000 | Reside in the following cities/towns & zip codes', need: true, levels: ['hs_senior'], rules: [
    gpa(2.0, '2.0+ GPA | High school senior residing in northern Yolo County'),
    status(['hs_senior'], 'High school senior residing in northern Yolo County (see zip code requirements)'),
    G(H('geo.zip', 'in', ['95607', '95606', '95937', '95627', '95645', '95653', '95695', '95776', '95697', '95698'], 'Capay Valley (95607; 95606), Dunnigan (95937), Esparto (95627), Knights Landing (95645 only within Yolo County), Madison (95653), Woodland (95695; 95776), Yolo (95697), Zamora (95698)')),
    G(F('Applicant plans to attend an accredited 2-year community college, vocational or trade school within two years', ['academic.institution', 'academic.status'], 'planning to attend college within two years | Accredited 2-year community college, vocational or trade school'))
  ] }),
  sac({ name: 'Richard Wiesner Engineering Scholarship', id: '1834', min: 2000, max: 2000, amtQ: 'Engineering | $2,000 | Veteran of the United States Armed Forces', need: true, levels: ['undergrad'], rules: [
    gpa(2.0, '2.0+ GPA | Undergraduate college student attending Sacramento State or UC Davis'),
    status(['undergrad'], 'Undergraduate college student attending Sacramento State or UC Davis'),
    G(H('academic.institution', 'in', ['California State University, Sacramento', 'University of California, Davis'], 'Undergraduate college student attending Sacramento State or UC Davis')),
    cip(['14'], 'Sacramento State or UC Davis | Engineering'),
    G(H('affiliations.military[].who', 'eq', 'self', 'Veteran of the United States Armed Forces (DD214 required)')),
    G(H('affiliations.military[].status', 'in', ['veteran', 'retired'], 'Veteran of the United States Armed Forces (DD214 required)')),
    G(F('Applicant works part time while attending school', ['activities.work[].employer', 'activities.work[].dates'], 'Work part time while attending school'))
  ] }),
  sac({ name: 'Paulsen Family Scholarship Fund', id: '1941', min: 1000, max: 4500, amtQ: '$1,000 – $4,500', levels: ['hs_senior', 'undergrad'], rules: [
    gpa(2.0, '2.0+ GPA | Graduating high school senior from Colusa or Sutter Counties'),
    G(H('geo.hs_county', 'in', [C('Colusa'), C('Sutter')], 'Graduating high school senior from Colusa or Sutter Counties, or student at a 2-year or 4-year college who graduated high school in Colusa or Sutter Counties'), H('geo.county', 'in', [C('Colusa'), C('Sutter')], 'Graduating high school senior from Colusa or Sutter Counties')),
    cip(['01', '03', '51.24'], 'Agriculture, agribusiness, veterinary medicine, forestry, wildlife management, or natural resources')
  ] }),
  sac({ name: 'Ramona Burnham Scholarship Foundation', id: '1741', min: 5000, max: 5000, amtQ: '$5,000 | Must be Hispanic or Latinx', need: true, levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | Graduating high school senior from Baldwin Park Unified School District'),
    status(['hs_senior'], 'Graduating high school senior from Baldwin Park Unified School District'),
    G(H('geo.school_district', 'eq', 'Baldwin Park Unified School District', 'Graduating high school senior from Baldwin Park Unified School District')),
    G(H('identity.heritage', 'contains_any', ['Hispanic', 'Latino'], 'Must be Hispanic or Latinx with English as a second language')),
    G(F('English is the applicant\'s second language', ['identity.languages[].lang', 'identity.languages[].level'], 'Must be Hispanic or Latinx with English as a second language'))
  ] }),
  sac({ name: 'Richard & Lucille Harrison Scholarship', id: '1872', min: 10000, max: 10000, amtQ: '$10,000 | Preference will be given to students who have overcome barriers', need: true, rules: [
    G(F('Applicant has a 2.5+ GPA (not required for students attending vocational school)', ['academic.gpa', 'academic.status'], '2.5+ GPA (not applicable for students attending vocational school)')),
    G(H('geo.school_district', 'eq', 'Woodland Joint Unified School District', 'Woodland Joint Unified School District'))
  ] }),
  sac({ name: 'Roy and Cynthia Kroener Family Scholarship', id: '1718', min: 3000, max: 5000, amtQ: '$3,000 – $5,000 | Preference to United States citizens and renewal students', need: true, levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | Graduating high school senior in Davis'),
    status(['hs_senior'], 'Graduating high school senior in Davis'),
    G(H('geo.city', 'eq', 'Davis', 'Graduating high school senior in Davis'))
  ] }),
  sac({ name: 'Sacramento Police Foundation Scholarship', id: '1955', min: 1000, max: 1000, amtQ: '| $1,000 | Have performed a minimum of 50 hours of community service.', levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | High school senior enrolled in a Criminal Justice and Public Service Magnet Academy program'),
    status(['hs_senior'], 'High school senior enrolled in a Criminal Justice and Public Service Magnet Academy program'),
    G(F('Applicant is enrolled in a Criminal Justice and Public Service Magnet Academy program', ['geo.high_school', 'affiliations.professional'], 'enrolled in a Criminal Justice and Public Service Magnet Academy program')),
    G(F('Applicant will attend an accredited college or university in California', ['academic.institution', 'geo.state'], 'Any accredited 2-year or 4-year college or university in California | | $1,000')),
    G(F('Applicant has performed at least 50 hours of community service', ['activities.extracurricular'], 'Have performed a minimum of 50 hours of community service.'))
  ] }),
  sac({ name: 'Sacramento Region REACH (Rincon Environment and Climate Heroes) Scholarship', id: '1836', min: 1500, max: 1500, amtQ: 'sustainability | $1,500', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(3.0, '3.0 + GPA'),
    status(['hs_senior', 'undergrad'], 'Graduating high school student or undergraduate college student attending or have attended a high school or college in El Dorado, Placer, Sacramento or Yolo Counties'),
    schoolIn(FOUR, 'attending or have attended a high school or college in El Dorado, Placer, Sacramento or Yolo Counties'),
    G(F('Applicant attends an accredited college or university in California', ['academic.institution', 'geo.state'], 'Any accredited 2-year or 4-year college or university in California | Environmental sciences')),
    cip(['03', '04.03', '30.33'], 'Environmental sciences, land use planning, natural resources, cultural resources or sustainability')
  ] }),
  sac({ name: 'Sarah A. Bonnifield Vietnam Veterans Scholarship Fund', id: '1711', min: 1000, max: 1000, amtQ: '$1,000 | Be a Vietnam Veteran', levels: ['hs_senior', 'undergrad'], rules: [
    status(['hs_senior', 'undergrad'], 'High school senior or undergraduate college student | Any accredited 2- or 4-year college or university'),
    G(H('affiliations.military[].era', 'contains_any', ['vietnam'], 'Be a Vietnam Veteran or a dependent or a spouse, son, daughter, grandson, granddaughter, nephew or niece of a Vietnam Veteran'))
  ] }),
  sac({ name: 'Saylor Family Scholarship', id: '1714', min: 1000, max: 2500, amtQ: '$1,000 – $2,500 | Must have experienced significant life challenges', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | Graduating high school senior at Davis Joint Unified School District'),
    status(['hs_senior'], 'Graduating high school senior at Davis Joint Unified School District or Winters Joint Unified School District'),
    G(H('geo.school_district', 'in', ['Davis Joint Unified School District', 'Winters Joint Unified School District'], 'Graduating high school senior at Davis Joint Unified School District or Winters Joint Unified School District')),
    G(F('Applicant has experienced significant life challenges such as foster care, death of a family member during high school, family trauma, teen parenthood, behavioral health challenges, juvenile justice involvement, or working during high school due to financial need', ['circumstances.foster', 'circumstances.parent_status', 'circumstances.dependents', 'circumstances.disability', 'activities.work[].employer'], 'Must have experienced significant life challenges'))
  ] }),
  sac({ name: 'Schwab-Rosenhouse Memorial Scholarship', id: 'https://programs.applyists.com/srms/', min: 1000, max: 5000, amtQ: '$1,000 – $5,000 | Must meet California State residency requirements', need: true, levels: ['hs_senior'], rules: [
    status(['hs_senior'], 'Graduating high school seniors who have lived in El Dorado, Placer, Yolo or Sacramento for at least two years'),
    G(H('geo.county', 'in', FOUR.map(C), 'Graduating high school seniors who have lived in El Dorado, Placer, Yolo or Sacramento for at least two years')),
    G(H('geo.state', 'eq', 'CA', 'Must meet California State residency requirements')),
    G(F('Applicant will attend an accredited college, university or vocational school within 100 miles of the Sacramento County Courthouse', ['academic.institution'], 'within 100 miles of the Sacramento County Courthouse'))
  ] }),
  sac({ name: 'Stolba/Sukkary Family Scholarship', id: '1925', min: 1000, max: 3000, amtQ: '$1,000 – $3,000 | Preference will be given to first generation college students', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(2.5, '2.5+ GPA | Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties'),
    status(['hs_senior', 'undergrad'], 'Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties'),
    schoolIn(FOUR, 'Graduating high school senior or college freshman in Sacramento, Placer, Yolo or El Dorado counties'),
    G(F('Applicant attends or will attend an accredited 2-year college or vocational or trade school', ['academic.institution', 'academic.status'], 'Any accredited 2-year college or vocational or trade school'))
  ] }),
  sac({ name: 'SVVMA Registered Veterinary Technician (RVT) Scholarship', id: '1602', min: 400, max: 800, amtQ: '$400 – $800', rules: [
    gpa(2.5, '2.5+ GPA | Open, but must live in or attend a school in El Dorado, Placer, Sacramento, or Yolo counties'),
    schoolIn(FOUR, 'must live in or attend a school in El Dorado, Placer, Sacramento, or Yolo counties'),
    cip(['51.0808'], 'Veterinary Technology program accredited by AVMA/CVTEA'),
    G(F('Applicant participates in organized veterinary medicine groups (local VMAs) and/or SVVMA/SVVTA activities', ['affiliations.professional', 'activities.extracurricular'], 'Demonstrate participation in organized veterinary medicine groups (local VMA’s) and/or SVVMA/SVVTA activities'))
  ] }),
  sac({ name: 'The Sacramento Valley Veterinary Medical Association (SVVMA) Charitable Giving Committee Student Scholarship - UC Davis', id: '1760', min: 1000, max: 1500, amtQ: '$1,000 – $1,500', levels: ['grad'], rules: [
    gpa(2.5, '2.5+ GPA | UC Davis School of Veterinary Medicine students'),
    G(H('academic.institution', 'eq', 'University of California, Davis', 'UC Davis School of Veterinary Medicine students')),
    cip(['51.24'], 'Veterinary Medicine program'),
    G(F('Applicant participates in organized veterinary medicine groups, SAVMA/local VMAs and SVVMA activities', ['affiliations.professional', 'activities.extracurricular'], 'Demonstrate participation in organized veterinary medicine groups and SAVMA/local VMA’s and SVVMA activities'))
  ] }),
  sac({ name: 'The AVID-College Horizons Scholarship', id: '1739', min: 1500, max: 2000, amtQ: '$1,500 – $2,000 | Participant in the AVID program', need: true, levels: ['hs_senior'], rules: [
    status(['hs_senior'], 'Graduating high school senior in Sacramento County | Accredited 4-year college or university'),
    schoolIn(['Sacramento'], 'Graduating high school senior in Sacramento County | Accredited 4-year college or university'),
    G(F('Applicant participated in the AVID program for at least 3 years in high school', ['activities.extracurricular', 'affiliations.professional'], 'Participant in the AVID program for a minimum 3 years in high school'))
  ] }),
  sac({ name: 'The Diane Dawson Memorial Scholarship', id: '1635', min: 1000, max: 3000, amtQ: '$1,000 – $3,000 | Have a parent or legal guardian with terminal cancer', levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | Graduating high school senior in greater Sacramento or Denver areas'),
    status(['hs_senior'], 'Graduating high school senior in greater Sacramento or Denver areas'),
    G(F('Applicant is a high school senior in the greater Sacramento or Denver area', ['geo.county', 'geo.city', 'geo.state'], 'Graduating high school senior in greater Sacramento or Denver areas')),
    G(F('Applicant has a parent or legal guardian with terminal cancer or other terminal illness, or lost a parent to a terminal disease during high school', ['circumstances.family_illness', 'circumstances.parent_status'], 'Have a parent or legal guardian with terminal cancer or other terminal illness, or have lost a parent to a terminal disease during their tenure in high school'))
  ] }),
  sac({ name: 'The Graydon and Myrth Fox Scholarship', id: '1877', min: 1000, max: 1000, amtQ: '| $1,000 | Be a wounded Veteran', need: true, rules: [
    G(H('affiliations.military[].killed_or_wounded', 'is_true', undefined, 'Be a wounded Veteran who has served honorably in the United States Armed Forces or is still serving on active duty'))
  ], conf: 0.65 }),
  sac({ name: 'The Kathleen Barsotti Scholarship for Sustainable Agriculture', id: '1789', min: 4000, max: 4000, amtQ: '$4,000, payable at $1,000 per year for 4 years', renewable: true, note: '$1,000 per year for 4 years', levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | High school senior in Yolo County'),
    status(['hs_senior'], 'High school senior in Yolo County | Accredited 2-year or 4-year college or university | Pursuing an education'),
    schoolIn(['Yolo'], 'High school senior in Yolo County | Accredited 2-year or 4-year college or university | Pursuing an education'),
    G(F('Applicant is pursuing an education that incorporates sustainable agriculture (not limited to agriculture majors)', ['academic.majors', 'career.field'], 'Pursuing an education that incorporates sustainable agriculture'))
  ] }),
  sac({ name: 'The Kristi Karacozoff Memorial Scholarship', id: '1755', min: 1000, max: 2000, amtQ: '$1,000 – $2,000 | Demonstrate a chronic or life-threatening illness', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    gpa(3.0, '3.0+ GPA | Graduating high school senior or college student who graduated in Sacramento, Placer, El Dorado, or Yolo counties'),
    G(H('geo.hs_county', 'in', FOUR.map(C), 'Graduating high school senior or college student who graduated in Sacramento, Placer, El Dorado, or Yolo counties'), H('geo.county', 'in', FOUR.map(C), 'Graduating high school senior or college student who graduated in Sacramento, Placer, El Dorado, or Yolo counties')),
    G(F('Applicant has a chronic or life-threatening illness certified by a doctor', ['circumstances.disability'], 'Demonstrate a chronic or life-threatening illness with a doctor’s certification of medical condition'))
  ] }),
  sac({ name: 'The Mark McCollum "Ride On" Scholarship', id: '1914', min: 1000, max: 2000, amtQ: 'Engineering or construction | $1,000 – $2,000', levels: ['undergrad'], rules: [
    gpa(2.5, '2.5+ GPA | Undergraduate student | California State University, Sacramento'),
    status(['undergrad'], 'Undergraduate student | California State University, Sacramento'),
    G(H('academic.institution', 'eq', 'California State University, Sacramento', 'Undergraduate student | California State University, Sacramento')),
    cip(['14', '15.10', '46'], 'Engineering or construction')
  ] }),
  sac({ name: 'The Max and Nadine Dimick Scholarship', id: '1754', min: 1000, max: 2000, amtQ: '$1,000 – $2,000', need: true, rules: [
    gpa(3.0, '3.0+ GPA | Graduating high school senior or current student | Accredited 2-year community college'),
    G(F('Applicant attends or will attend an accredited 2-year community college in El Dorado, Placer, Sacramento, or Yolo counties', ['academic.institution', 'geo.county'], 'Accredited 2-year community college in El Dorado, Placer, Sacramento, or Yolo counties'))
  ] }),
  sac({ name: 'The Nadine Dimick Nursing Scholarship', id: '1757', min: 1000, max: 1000, amtQ: 'Nursing | $1,000', need: true, rules: [
    gpa(3.0, 'The Nadine Dimick Nursing Scholarship (https://sacregcf.academicworks.com/opportunities/1757) | Demonstrated financial need | 3.0+ GPA'),
    G(F('Applicant attends an accredited college or university in El Dorado, Placer, Sacramento, or Yolo counties', ['academic.institution', 'geo.county'], 'Accredited 2-year or 4-year college or university in the El Dorado, Placer, Sacramento, or Yolo counties')),
    cip(['51.38'], 'Nursing | $1,000 | Must be accepted into a nursing program'),
    G(F('Applicant has been accepted into a nursing program (pre-nursing does not qualify)', ['academic.majors', 'academic.concentration'], 'Must be accepted into a nursing program (pre-nursing is not allowed)'))
  ] }),
  sac({ name: 'The Pacific Coast Building Products Scholarship', id: '1709', min: 500, max: 5000, amtQ: '$500 – $5,000', need: true, levels: ['hs_senior'], rules: [
    gpa(2.5, '2.5+ GPA | Graduating high school senior | Accredited 2-year or 4-year college or university or vocational school approved by the selection committee'),
    status(['hs_senior'], 'Graduating high school senior | Accredited 2-year or 4-year college or university or vocational school approved by the selection committee'),
    G(H('affiliations.employer[].name', 'eq', 'Pacific Coast Building Products', 'Must be a child or grandchild of a current or retired employee of Pacific Coast Building Products.')),
    G(H('affiliations.employer[].relationship', 'in', ['parent', 'grandparent'], 'Must be a child or grandchild of a current or retired employee of Pacific Coast Building Products.'))
  ] }),
  sac({ name: 'The Phillip M. Dowd Memorial Scholarship', id: '1881', min: 1000, max: 5000, amtQ: 'Public affairs, administration, political science, or government | $1,000 – $5,000', need: true, levels: ['hs_senior'], rules: [
    gpa(3.0, '3.0+ GPA | Graduating high school senior in Sacramento, Placer, Yolo, Shasta, Yuba, Sutter, Colusa, or Butte Counties'),
    status(['hs_senior'], 'Graduating high school senior in Sacramento, Placer, Yolo, Shasta, Yuba, Sutter, Colusa, or Butte Counties'),
    schoolIn(['Sacramento', 'Placer', 'Yolo', 'Shasta', 'Yuba', 'Sutter', 'Colusa', 'Butte'], 'Graduating high school senior in Sacramento, Placer, Yolo, Shasta, Yuba, Sutter, Colusa, or Butte Counties'),
    cip(['44', '45.10'], 'Public affairs, administration, political science, or government')
  ] }),
  sac({ name: 'Yolo Youth Service Awards', id: '1343', min: 1000, max: 1000, amtQ: '1000; (+$500 to the sponsoring nonprofit)', note: '$1,000 to the student plus $500 to the sponsoring nonprofit', levels: ['hs_senior'], rules: [
    status(['hs_senior'], 'Graduating high school senior in Yolo County | Accredited 2-year or 4- year college or university or vocational school | | 1000'),
    schoolIn(['Yolo'], 'Graduating high school senior in Yolo County | Accredited 2-year or 4- year college or university or vocational school | | 1000'),
    G(F('Applicant volunteered at least 60 hours with a recognized Yolo County nonprofit during junior and/or senior year of high school', ['activities.extracurricular'], 'Must have volunteered at least 60 hours with a recognized Yolo County nonprofit organization during the junior and/or senior year(s) of high school'))
  ] })
];

/* ---------- NIAF ---------- */
const NIAF_URL = 'https://www.niaf.org/programs/available-scholarships/';
const IT = q => G(H('identity.heritage', 'contains_any', ['Italian'], q));
const niaf = ({ name, min, max, amtQ, need, levels, rules, renewable, conf = 0.75 }) => {
  const s = {
    name, provider_org: 'National Italian American Foundation', provider_type: 'nonprofit',
    apply_url: NIAF_URL, source_url: NIAF_URL,
    amount: { min, max }, deadline: null, cycle_status: 'unknown',
    geo_scope: { level: 'national' },
    eligibility: rules, provenance: [],
    verified_at: V, confidence: conf
  };
  if (amtQ) s.provenance.push({ field: 'amount', source_quote: amtQ }); else s.amount.note = noAmount;
  if (renewable) s.amount.renewable = true;
  if (levels) s.levels = levels;
  if (need) { s.need_based = 'need'; }
  return s;
};
const G35 = gpa(3.5, 'have a GPA of 3.5 (or the equivalent) or higher');

const niafRecords = [
  niaf({ name: 'A. Lucchetti Martino Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student who is majoring in International Relations'),
    status(['undergrad'], 'outstanding Italian American undergraduate student who is majoring in International Relations'),
    cip(['45.09'], 'majoring in International Relations. This student should have a GPA of 3.5'),
    gpa(3.5, 'This student should have a GPA of 3.5 (or the equivalent) or higher.')
  ] }),
  niaf({ name: 'Agnes E. Vaghi Scholarship', min: 4000, max: 4000, amtQ: 'Amount: $4,000', levels: ['undergrad'], rules: [
    IT('outstanding female Italian American undergraduate student majoring in Italian, English, literature or journalism'),
    woman('outstanding female Italian American undergraduate student majoring in Italian, English, literature or journalism'),
    status(['undergrad'], 'outstanding female Italian American undergraduate student majoring in Italian, English, literature or journalism'),
    cip(['16.0902', '23', '09.04'], 'majoring in Italian, English, literature or journalism'),
    G35
  ] }),
  niaf({ name: 'Caroline Guarini Memorial Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student (undergraduate or graduate) majoring in music or a music-related field'),
    status(['undergrad', 'grad'], 'outstanding Italian American student (undergraduate or graduate) majoring in music or a music-related field'),
    cip(['50.09'], 'majoring in music or a music-related field'),
    G(H('geo.state', 'in', ['NY', 'NJ', 'CT'], 'This student must originally be from New York, New Jersey or Connecticut')),
    G35
  ] }),
  niaf({ name: 'Donald Mazzoni Scholarship', min: 2500, max: 2500, amtQ: 'Amount: $2,500', levels: ['undergrad'], rules: [
    IT('These students must have at least 50% Italian American heritage'),
    status(['undergrad'], 'two outstanding Italian American undergraduate students (one male, one female) who will be majoring in business'),
    cip(['52'], 'who will be majoring in business at a US college or university that they will attend in person'),
    G(F('Applicant will attend a US college or university in person', ['academic.institution'], 'at a US college or university that they will attend in person')),
    gpa(3.0, 'have a GPA of 3.0 (or the equivalent) or higher')
  ] }),
  niaf({ name: 'Emanuele Gianturco Memorial Scholarship', min: 0, max: 0, amtQ: null, need: true, levels: ['undergrad', 'grad'], rules: [
    IT('To be awarded to an outstanding Italian American students (undergraduate and graduate)'),
    status(['undergrad', 'grad'], 'To be awarded to an outstanding Italian American students (undergraduate and graduate)'),
    G(H('identity.first_gen', 'is_true', undefined, 'This student must a first-generation college student')),
    G35
  ] }),
  niaf({ name: 'Ernest L. Pellegri Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', need: true, levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student (undergraduate and graduate) majoring in Latin or a Latin-related field'),
    status(['undergrad', 'grad'], 'outstanding Italian American student (undergraduate and graduate) majoring in Latin or a Latin-related field'),
    cip(['16.1203'], 'majoring in Latin or a Latin-related field'),
    G35
  ] }),
  niaf({ name: 'Filomena C. Peloro Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', need: true, levels: ['undergrad', 'grad'], rules: [
    IT('To be awarded to outstanding Italian American students (undergraduate and graduate).'),
    status(['undergrad', 'grad'], 'To be awarded to outstanding Italian American students (undergraduate and graduate).'),
    G35
  ] }),
  niaf({ name: 'Frank D. Stella Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student majoring in business or a business-related field'),
    status(['undergrad'], 'outstanding Italian American undergraduate student majoring in business or a business-related field'),
    cip(['52'], 'majoring in business or a business-related field'),
    G35
  ] }),
  niaf({ name: 'Furci Family Scholarship Fund', min: 5000, max: 10000, amtQ: 'Amount: $5,000-$10,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student studying 10 credits or above of Italian language or Italian studies'),
    status(['undergrad'], 'outstanding Italian American undergraduate student studying 10 credits or above of Italian language or Italian studies'),
    G(F('Applicant is studying 10 or more credits of Italian language or Italian studies at the university level', ['academic.majors', 'academic.cip_codes'], 'studying 10 credits or above of Italian language or Italian studies at the university level')),
    G35
  ] }),
  niaf({ name: 'LaMantia Family Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', rules: [
    IT('outstanding Italian American student studying computer science or STEM technology'),
    G(F('Applicant is studying computer science or STEM technology', ['academic.majors', 'academic.cip_codes'], 'studying computer science or STEM technology')),
    G35
  ] }),
  niaf({ name: 'Joanne C. D\'Amico Scholarship', min: 0, max: 0, amtQ: null, levels: ['undergrad'], rules: [
    IT('outstanding female Italian American undergraduate student majoring in English, literature, Italian, history, art history or creative writing'),
    woman('outstanding female Italian American undergraduate student majoring in English, literature, Italian, history, art history or creative writing'),
    status(['undergrad'], 'outstanding female Italian American undergraduate student majoring in English, literature, Italian, history, art history or creative writing'),
    cip(['23', '16.0902', '54', '50.0703'], 'majoring in English, literature, Italian, history, art history or creative writing'),
    G35
  ], conf: 0.7 }),
  niaf({ name: 'Joseph and Margaret Rhodes Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student who intends to complete 6 or more credits in Italian studies'),
    status(['undergrad'], 'outstanding Italian American undergraduate student who intends to complete 6 or more credits in Italian studies'),
    G(F('Applicant intends to complete 6 or more credits in Italian studies', ['academic.majors', 'academic.cip_codes'], 'intends to complete 6 or more credits in Italian studies')),
    G(F('Applicant is active in community service', ['activities.extracurricular'], 'is active in community service')),
    gpa(3.5, 'This student should have a GPA of 3.5 (or the equivalent) or higher.')
  ] }),
  niaf({ name: 'Massachusetts Italian American Charitable Society Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', rules: [
    IT('outstanding Italian American student with a permanent residence in Massachusetts'),
    G(H('geo.state', 'eq', 'MA', 'with a permanent residence in Massachusetts')),
    G35
  ] }),
  niaf({ name: 'Maurizio A. Gianturco Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', need: true, rules: [
    G(F('Applicant is studying abroad in Italy', ['academic.institution'], 'studying abroad in Italy and majoring in fine arts, liberal arts, language or architecture')),
    cip(['50', '24', '16', '04'], 'majoring in fine arts, liberal arts, language or architecture'),
    gpa(3.5, 'Students should also have a GPA of 3.5 or higher with demonstrated financial need')
  ], conf: 0.7 }),
  niaf({ name: 'NIAF Frederick A. DeLuca Foundation Scholarship', min: 5000, max: 5000, amtQ: 'Amount: $5,000', levels: ['hs_senior', 'undergrad', 'grad'], rules: [
    IT('outstanding Italian American incoming freshman, undergraduate or graduate student'),
    status(['hs_senior', 'undergrad', 'grad'], 'outstanding Italian American incoming freshman, undergraduate or graduate student'),
    G35
  ] }),
  niaf({ name: 'NIAF Gabelli Foundation Scholarship', min: 2500, max: 10000, amtQ: 'Amount: $2,500-$10,000', levels: ['grad'], rules: [
    G(F('Applicant is an Italian graduate student from Bocconi University', ['academic.institution', 'identity.heritage'], 'an Italian graduate student from Bocconi University')),
    status(['grad'], 'an Italian graduate student from Bocconi University'),
    G(H('academic.institution', 'eq', 'Columbia University', 'who is attending Columbia University’s School of Business to complete their Master’s in Business Administration')),
    cip(['52'], 'to complete their Master’s in Business Administration'),
    G35
  ], conf: 0.7 }),
  niaf({ name: 'NIAF Jim Cantalupo Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student majoring in Italian, Spanish, or business'),
    status(['undergrad'], 'outstanding Italian American undergraduate student majoring in Italian, Spanish, or business'),
    cip(['16.0902', '16.0905', '52'], 'majoring in Italian, Spanish, or business'),
    G35
  ] }),
  niaf({ name: 'NIAF Maaco Enterprises, Inc. Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', need: true, levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student (undergraduate or graduate) who is originally from Pennsylvania'),
    status(['undergrad', 'grad'], 'outstanding Italian American student (undergraduate or graduate) who is originally from Pennsylvania'),
    G(H('geo.state', 'eq', 'PA', 'who is originally from Pennsylvania')),
    G35
  ] }),
  niaf({ name: 'NIAF Norman R. Peterson Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student (undergraduate or graduate) at John Cabot University'),
    status(['undergrad', 'grad'], 'outstanding Italian American student (undergraduate or graduate) at John Cabot University'),
    G(H('academic.institution', 'eq', 'John Cabot University', 'outstanding Italian American student (undergraduate or graduate) at John Cabot University')),
    G(H('geo.state', 'in', ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'], 'This student must originally be from the Midwest (Illinois, Indiana, Iowa, Kansas, Michigan, Minnesota, Missouri, Nebraska, North Dakota, Ohio, South Dakota, and Wisconsin)')),
    G35
  ] }),
  niaf({ name: 'Richard Perrone Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad'], rules: [
    IT('outstanding Italian American undergraduate student attending school in Connecticut'),
    status(['undergrad'], 'outstanding Italian American undergraduate student attending school in Connecticut'),
    G(F('Applicant attends a college or university in Connecticut', ['academic.institution'], 'attending school in Connecticut and majoring in computer science')),
    G(F('Applicant is majoring in computer science or a technology related field', ['academic.majors', 'academic.cip_codes'], 'majoring in computer science or a technology related field')),
    G35
  ] }),
  niaf({ name: 'Salvatore "Sal" Catanese Clark County Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', renewable: true, need: true, levels: ['hs_senior'], rules: [
    IT('outstanding Italian American incoming freshman who is a graduate of a Clark County, NV high school'),
    status(['hs_senior'], 'outstanding Italian American incoming freshman who is a graduate of a Clark County, NV high school'),
    G(H('geo.hs_county', 'eq', 'Clark County, NV', 'who is a graduate of a Clark County, NV high school')),
    G35
  ] }),
  niaf({ name: 'Salvatore "Sal" Catanese National Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', renewable: true, need: true, levels: ['hs_senior'], rules: [
    IT('To be awarded to an outstanding Italian American incoming freshman. This student must demonstrate financial need'),
    status(['hs_senior'], 'To be awarded to an outstanding Italian American incoming freshman. This student must demonstrate financial need'),
    G35
  ] }),
  niaf({ name: 'The Francesco and Mary Giambelli Foundation Study Abroad Scholarship at John Cabot University', min: 0, max: 0, amtQ: null, levels: ['undergrad'], rules: [
    status(['undergrad'], 'To be awarded to an outstanding undergraduate student studying at John Cabot University.'),
    G(H('academic.institution', 'eq', 'John Cabot University', 'To be awarded to an outstanding undergraduate student studying at John Cabot University.')),
    G35
  ], conf: 0.7 }),
  niaf({ name: 'The Graziadio Legacy Scholarship', min: 2500, max: 10000, amtQ: 'Amount: $2,500-$10,000', need: true, rules: [
    G(
      H('identity.heritage', 'contains_any', ['Italian'], 'To be awarded to an Italian American student or a student studying Italian'),
      F('Applicant is studying Italian', ['academic.majors', 'academic.cip_codes'], 'To be awarded to an Italian American student or a student studying Italian')
    ),
    G(H('academic.institution', 'eq', 'Pepperdine University', 'enrolled at the George L. Graziadio School of Business and Management at Pepperdine University')),
    cip(['52'], 'enrolled at the George L. Graziadio School of Business and Management at Pepperdine University'),
    G35
  ] }),
  niaf({ name: 'The Louis A. Caputo, Jr. Legal Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student who is majoring in law'),
    cip(['22'], 'majoring in law (either in law school or declared pre-law in undergraduate school)'),
    gpa(3.5, 'This student should have a GPA of 3.5 (or the equivalent) or higher.')
  ] }),
  niaf({ name: 'The Marnell Foundation Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', levels: ['undergrad', 'grad'], rules: [
    IT('outstanding Italian American student (undergraduate or graduate) originally from the state of Nevada'),
    status(['undergrad', 'grad'], 'outstanding Italian American student (undergraduate or graduate) originally from the state of Nevada'),
    G(H('geo.state', 'eq', 'NV', 'originally from the state of Nevada')),
    G35
  ] }),
  niaf({ name: 'The Martini Foundation/National Italian American Foundation Villanova University Scholarship', min: 2500, max: 5000, amtQ: 'Amount: $2,500-$5,000', need: true, levels: ['hs_senior', 'undergrad'], rules: [
    IT('outstanding Italian American incoming freshman or current undergraduate student at Villanova University'),
    status(['hs_senior', 'undergrad'], 'outstanding Italian American incoming freshman or current undergraduate student at Villanova University'),
    G(H('academic.institution', 'eq', 'Villanova University', 'current undergraduate student at Villanova University')),
    gpa(3.25, 'have a GPA of 3.25 or higher')
  ] })
];

/* ---------- Don Diego ---------- */
const DD_URL = 'https://dondiegoscholarship.org/scholarships/';
const ddBase = {
  provider_org: 'Don Diego Scholarship Foundation', provider_type: 'nonprofit', source_url: DD_URL,
  deadline: '2027-03-30', cycle_status: 'open', geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior'],
  verified_at: V, confidence: 0.6
};
const ddStatus = G(H('academic.status', 'eq', 'hs_senior', 'Applicant must be a high school student applying for/accepted at a college'));
const ddProv = amtQ => [
  ...(amtQ ? [{ field: 'amount', source_quote: amtQ }] : []),
  { field: 'deadline', source_quote: 'Deadline to Apply: Midnight on March 30, 2027' }
];
const DD_EMPLOYERS = ['Del Mar Fairgrounds', 'Del Mar Thoroughbred Club', 'Premier Food Services'];
const pool = 'The $10,000 is described as "In Awards" (total awarded in the category); per-student amount not stated';

export default {
  /* ---------------- Boys & Girls Clubs of Northwest San Diego ---------------- */
  'https://bgcsandieguito.org/about/educational-scholarship-program/': (() => {
    const src = 'https://bgcsandieguito.org/about/educational-scholarship-program/';
    const app = 'https://bgcgreatertogether.org/wp-content/uploads/2026/03/ScholarshipApplication2026.pdf';
    const base = { provider_org: 'Boys & Girls Clubs of Northwest San Diego', provider_type: 'nonprofit', apply_url: app, source_url: src, verified_at: V };
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'Leonard and Edith Polster Scholarship',
          amount: { min: 0, max: 0, renewable: true, note: noAmount }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'state', states: ['CA'] }, levels: ['hs_senior'], need_based: 'need',
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'awarded annually to graduating high school seniors who plan to continue their education at a CA college or university')),
            G(F('Applicant plans to attend a California college or university, community college, or trade/technical school', ['academic.institution', 'geo.state'], 'plan to continue their education at a CA college or university, a community college, or trade/technical school'))
          ],
          provenance: [{ field: 'need_based', source_quote: 'Focuses on financial need and potential for success' }],
          confidence: 0.65 },
        { ...base, name: 'James E. and Patricia Townsend Memorial Fund',
          amount: { min: 0, max: 0, renewable: true, note: noAmount }, deadline: null, cycle_status: 'unknown',
          levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'is awarded annually to graduating high school seniors who plan to pursue careers in the computer field')),
            G(
              F('Applicant plans to pursue a career in the computer field', ['career.field', 'academic.majors'], 'plan to pursue careers in the computer field and/or have Boys & Girls Clubs involvement'),
              F('Applicant has Boys & Girls Clubs involvement', ['activities.extracurricular', 'affiliations.member_org[].name'], 'plan to pursue careers in the computer field and/or have Boys & Girls Clubs involvement')
            )
          ],
          confidence: 0.65 },
        { ...base, name: 'BGC Northwest San Diego Trade, Technical & Vocational Scholarship',
          amount: { min: 0, max: 0, note: noAmount }, deadline: null, deadline_kind: 'rolling', cycle_status: 'open',
          levels: ['trade'],
          eligibility: [
            G(F('Applicant is pursuing education or certification from a trade, technical or vocational school rather than a traditional college or university', ['academic.status', 'academic.majors'], 'pursuing education/certification from a trade, technical or vocational school rather than a traditional college or university'))
          ],
          provenance: [{ field: 'deadline', source_quote: 'Scholarships are available year-round.' }],
          confidence: 0.6 }
      ],
      award_names: ['Leonard and Edith Polster Scholarship', 'James E. and Patricia Townsend Memorial Fund', 'BGC Northwest San Diego Trade, Technical & Vocational Scholarship'],
      follow_links: [],
      vocabulary_gaps: [],
      notes: 'Three awards administered by the club foundation. The page says "2026 Applications Are Now Open!" but gives no deadline or amounts (details are in linked PDF instructions), so Polster and Townsend use deadline null / unknown. Trade scholarship is year-round (rolling). Polster and Townsend have renewal instructions, so renewable=true. No residency rule is stated on the page.'
    };
  })(),

  /* ---------------- Downtown San Diego Lions Club PDF ---------------- */
  'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Downtown San Diego Lions Club Scholarship', provider_org: 'Downtown San Diego Lions Club', provider_type: 'fraternal',
      apply_url: 'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf',
      source_url: 'https://cdnsm5-ss18.sharpschool.com/UserFiles/Servers/Server_27732394/File/Academics/scholarships/2024%20DOWNTOWN%20SAN%20DIEGO%20LIONS%20CLUB%20SCHOLARSHIP%20APPLICATION.pdf',
      amount: { min: 2000, max: 2000 }, deadline: '2024-03-13', cycle_status: 'closed',
      geo_scope: { level: 'school_district', states: ['CA'] }, levels: ['hs_senior'], need_based: 'either',
      effort: { essay_words: null, recs_required: 3 },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Graduating seniors will be selected only from Hoover, Garfield, Kearny, Twain, Lincoln, San Diego, Monarch and Gompers High Schools')),
        G(H('geo.high_school', 'in', ['Hoover High School', 'Garfield High School', 'Kearny High School', 'Twain High School', 'Lincoln High School', 'San Diego High School', 'Monarch High School', 'Gompers High School'], 'Graduating seniors will be selected only from Hoover, Garfield, Kearny, Twain, Lincoln, San Diego, Monarch and Gompers High Schools')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Applicants must be U.S. citizens or legal residents'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Scholarships of $2,000 will be awarded to each student selected.' },
        { field: 'deadline', source_quote: 'by 12:00 pm Wednesday, March 13, 2024' },
        { field: 'need_based', source_quote: 'scholarships will be awarded based on demonstrated community service, financial need, and merit' },
        { field: 'effort', source_quote: 'THREE TYPED PERSONAL REFERENCE LETTERS' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['"Legal residents" must supply an alien registration card; mapped to permanent_resident'],
    notes: '2024 cycle application (stale document). Essay required with no length given. Also requires letters verifying community service and a financial data sheet. The form mentions a 2021-2022 year in one field (template leftover).'
  },

  /* ---------------- Clarke DS Fellowship ---------------- */
  'https://clarkedsfellowship.org/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'William D. Clarke, Sr. Diplomatic Security Fellowship', provider_org: 'The Washington Center (funded by the U.S. Department of State)', provider_type: 'government',
      apply_url: 'https://clarkedsfellowship.org/how-to-apply/', source_url: 'https://clarkedsfellowship.org/',
      amount: { min: 0, max: 0, note: noAmount }, deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' },
      eligibility: [
        G(F('Applicant wants to pursue a master\'s degree', ['academic.status', 'academic.grad_date'], 'designed for individuals who want to pursue a master’s degree and a career as a Diplomatic Security Service (DSS) Special Agent')),
        G(F('Applicant wants a career as a Diplomatic Security Service Special Agent in the Foreign Service', ['career.field', 'career.sectors', 'career.target_employers'], 'a career as a Diplomatic Security Service (DSS) Special Agent in the Foreign Service'))
      ],
      provenance: [],
      verified_at: V, confidence: 0.5
    }],
    vocabulary_gaps: [],
    notes: 'Home page of a two-year graduate fellowship funded by the State Department. Eligibility, amount, deadline and any service obligation are on linked pages not captured here; the page implies a career path with the Foreign Service but does not state an obligation, so service_obligation is left unset.'
  },

  /* ---------------- Coca-Cola Scholars ---------------- */
  'https://www.coca-colascholarsfoundation.org/apply/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Coca-Cola Scholars Program Scholarship', provider_org: 'Coca-Cola Scholars Foundation', provider_type: 'private_foundation',
      apply_url: 'https://webportalapp.com/sp/login/cokescholar', source_url: 'https://www.coca-colascholarsfoundation.org/apply/',
      amount: { min: 20000, max: 20000 }, deadline: '2026-09-30', cycle_status: 'open',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'merit',
      effort: { essay_words: 0, recs_required: 0 },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'This $20,000 college scholarship is for high school students graduating during the 2026-2027 school year.')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident', 'refugee_asylee'], 'U.S. Citizens, U.S. Nationals, U.S. Permanent Residents, Refugees, Asylees, Cuban-Haitian Entrants, or Humanitarian Parolees')),
        G(H('academic.gpa', 'gte', 3.0, 'Able to verify a minimum overall B/3.0 GPA in high school coursework')),
        G(F('Applicant attends school in one of the 50 U.S. states, DC, Puerto Rico, or select DoD schools (not an American or expat school abroad)', ['geo.state', 'geo.high_school'], 'attending school in one of the 50 U.S. states, the District of Columbia, Puerto Rico, or select DoD schools')),
        G(F('Applicant is NOT a child or grandchild of a current employee, officer or owner (or a retiree receiving benefits) of Coca-Cola bottling companies, The Coca-Cola Company, its divisions or subsidiaries', ['affiliations.employer[].name', 'affiliations.employer[].relationship'], 'Children or grandchildren of current employees, officers, or owners of Coca-Cola bottling companies'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'This $20,000 college scholarship' },
        { field: 'deadline', source_quote: 'The deadline to apply is Wednesday, September 30, 2026, at 5 pm Eastern.' },
        { field: 'need_based', source_quote: 'The Coca-Cola Scholars Program scholarship is an achievement-based scholarship.' },
        { field: 'effort', source_quote: 'This phase requires no essays, no transcript, and no recommendations.' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: [
      'Cuban-Haitian entrants and humanitarian parolees are eligible but have no citizenship value of their own',
      'School-location requirement (50 states, DC, Puerto Rico or DoD schools; not expat schools abroad) has no field',
      'Exclusion of children/grandchildren of Coca-Cola system employees cannot be expressed as a hard rule over an array field'
    ],
    notes: 'Deadline is the day after the snapshot, so open. Effort reflects the Phase 1 application only; semifinalists later submit essays, a transcript and a recommendation, and finalists interview. The page also mentions two Phi Theta Kappa programs (Coca-Cola Community College Academic Team, Coca-Cola Leaders of Promise) whose details live on ptk.org; they are not extracted.'
  },

  /* ---------------- Don Diego ---------------- */
  'https://dondiegoscholarship.org/scholarships/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      { ...ddBase, name: 'Don Diego 4-H Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/4-h-scholarship-online-application/?scholarship=4-H%20Scholarship',
        amount: { min: 0, max: 10000, note: pool },
        eligibility: [
          ddStatus,
          G(
            H('activities.competitions', 'contains_any', ['4h'], 'Applicant must be a member in good standing of 4-H'),
            F('Applicant is a member of Grange', ['affiliations.member_org[].name', 'affiliations.fraternal[].org'], 'Members of Grange are eligible to apply for the 4-H scholarship')
          ),
          G(F('Applicant has participated in a competitive exhibit department at the San Diego County Fair', ['activities.competitions', 'activities.extracurricular'], 'have participated (not necessarily during the applying year) in a competitive exhibit department at the San Diego County Fair'))
        ],
        provenance: ddProv('$10,000 |') },
      { ...ddBase, name: 'Don Diego FFA Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/ffa-scholarship-online-application/?scholarship=FFA%20Scholarship',
        amount: { min: 0, max: 10000, note: pool },
        eligibility: [
          ddStatus,
          G(H('activities.competitions', 'contains_any', ['ffa'], 'Applicant must be a member in good standing of FFA')),
          G(F('Applicant has participated in a competitive exhibit department at the San Diego County Fair', ['activities.competitions', 'activities.extracurricular'], 'have participated (not necessarily during the applying year) in a competitive exhibit department at the San Diego County Fair'))
        ],
        provenance: ddProv('$10,000 |') },
      { ...ddBase, name: 'Don Diego Junior Livestock Auction (JLA) Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/4-h-scholarship-online-application/?scholarship=4-H%20Scholarship',
        amount: { min: 0, max: 0, note: 'Additional scholarship for 4-H and FFA exhibitors; amount not stated' },
        eligibility: [
          ddStatus,
          G(H('activities.competitions', 'contains_any', ['4h', 'ffa'], 'offered to students who qualify for the 4-H or FFA Scholarship')),
          G(F('Applicant meets JLA eligibility requirements and participates in the Junior Livestock Auction at the San Diego County Fair', ['activities.competitions', 'activities.extracurricular'], 'Applicant must meet JLA eligibility requirements and participate in the Junior Livestock Auction at the San Diego County Fair'))
        ],
        provenance: ddProv(null) },
      { ...ddBase, name: 'Don Diego Employee Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/employee-scholarship-online-application/?scholarship=Employee%20Scholarship',
        amount: { min: 0, max: 10000, note: pool },
        eligibility: [
          ddStatus,
          G(
            H('activities.work[].employer', 'in', DD_EMPLOYERS, 'Applicant must show verification of employment (prior to the applying year) by the Del Mar Fairgrounds, Del Mar Thoroughbred Club, Premier Food Services or contractor of the Del Mar Fairgrounds'),
            F('Applicant was employed by a contractor of the Del Mar Fairgrounds', ['activities.work[].employer'], 'Premier Food Services or contractor of the Del Mar Fairgrounds')
          )
        ],
        provenance: ddProv('$10,000 |') },
      { ...ddBase, name: 'Don Diego Exhibitor/Participant Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/exhibitor-participant-scholarship-online-application/?scholarship=Exhibitor/Participant%20Scholarship',
        amount: { min: 0, max: 10000, note: pool },
        eligibility: [
          ddStatus,
          G(F('Applicant has participated (prior to the applying year) in a competitive exhibit department or as an entertainer at the San Diego County Fair, Del Mar National Horse Show or another equestrian event at the Del Mar Fairgrounds/Horsepark', ['activities.competitions', 'activities.extracurricular'], 'in a competitive exhibit department or as an entertainer in the special events department at the San Diego County Fair, Del Mar National Horse Show or other equestrian event'))
        ],
        provenance: ddProv('$10,000 |') },
      { ...ddBase, name: 'Don Diego Vocational Education Scholarship',
        apply_url: 'https://dondiegoscholarship.org/scholarships/vocational-educational-online-application/?scholarship=Vocational%20Education%20Scholarship',
        amount: { min: 0, max: 5000, note: 'The $5,000 is described as "In Awards"; per-student amount not stated' },
        eligibility: [
          G(H('academic.status', 'eq', 'hs_senior', 'Applicant must be a high school student applying for/accepted at a college or certificate program')),
          G(F('Applicant is pursuing an AA/AS degree or certificate at a community college or accredited trade school', ['academic.status', 'academic.institution', 'academic.majors'], 'support students pursuing an AA/AS degree or certificate at a community college or accredited trade school')),
          G(
            F('Applicant has participated in an event at the Del Mar Fairgrounds, Horsepark or Del Mar Thoroughbred Club', ['activities.competitions', 'activities.extracurricular'], 'Applicant must have participated (prior to the applying year) in an event at the Del Mar Fairgrounds or Horsepark'),
            H('activities.work[].employer', 'in', ['Del Mar Fairgrounds', 'Del Mar Thoroughbred Club'], 'as an employee of the Del Mar Fairgrounds, Del Mar Thoroughbred Club or contractor of the Del Mar Fairgrounds')
          )
        ],
        provenance: ddProv('$5,000 |') }
    ],
    award_names: ['Don Diego 4-H Scholarship', 'Don Diego FFA Scholarship', 'Don Diego Junior Livestock Auction (JLA) Scholarship', 'Don Diego Employee Scholarship', 'Don Diego Exhibitor/Participant Scholarship', 'Don Diego Vocational Education Scholarship'],
    follow_links: [],
    vocabulary_gaps: [
      'Participation in San Diego County Fair / Del Mar Fairgrounds events has no field',
      '"Good standing" in 4-H or FFA; Grange membership has no dedicated value'
    ],
    notes: 'CONTRADICTORY PAGE: it says "Applications are now available!" with a deadline of March 30, 2027, and also "The application process is now closed." I used the stated 2027 deadline (open). Amounts are category totals ("$10,000 In Awards"), not per-student amounts, so max is the pool and min is 0. Applicants may apply in one category only. Named 20K donor scholarships (CGW, Liss, Dredge, Edwards) are past awards, not separate application categories. Linked application PDFs are dated 2017.'
  },

  /* ---------------- Folds of Honor ---------------- */
  'https://foldsofhonor.org/scholarships/': (() => {
    const base = {
      provider_org: 'Folds of Honor', provider_type: 'nonprofit',
      apply_url: 'https://foldsofhonor.org/scholarships/', source_url: 'https://foldsofhonor.org/scholarships/',
      amount: { min: 0, max: 0, note: 'Based on unmet need; not a flat amount. Higher education payments are capped at $2,500 per term ($1,250 part-time); K-12 private school up to $5,000' },
      deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, need_based: 'need',
      verified_at: V
    };
    const prov = [
      { field: 'amount', source_quote: 'the maximum payment allowable per term is $2,500 ($1,250 for part-time students)' },
      { field: 'deadline', source_quote: 'Our scholarship application window is open between February 1 and March 31 each year.' },
      { field: 'need_based', source_quote: 'The Folds of Honor scholarship is based on unmet need.' }
    ];
    const gpaRule = G(H('academic.gpa', 'gte', 2.0, 'a 2.0 or higher term GPA for the two most recent academic terms'));
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'Folds of Honor Military Scholarships',
          eligibility: [
            G(H('affiliations.military[].who', 'in', ['parent', 'spouse'], 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.')),
            G(
              H('affiliations.military[].killed_or_wounded', 'is_true', undefined, 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.'),
              H('affiliations.military[].disability_rating', 'is_true', undefined, 'Dependents and/or spouses of fallen or disabled US service members are eligible to apply for scholarships.')
            ),
            gpaRule
          ],
          provenance: prov, confidence: 0.7 },
        { ...base, name: 'Folds of Honor First Responder Scholarships',
          eligibility: [
            G(F('Applicant is the spouse or dependent of a first responder (firefighter, law enforcement officer, paramedic, EMT, etc.) who was killed or catastrophically injured', ['circumstances.parent_status', 'affiliations.employer[].name', 'affiliations.employer[].relationship'], 'Eligibility for FOH First Responder scholarships extend to the spouse and/or dependent(s) of a first responder who has fallen or has been catastrophically injured.')),
            gpaRule
          ],
          provenance: prov, confidence: 0.65 }
      ],
      award_names: ['Folds of Honor Military Scholarships', 'Folds of Honor First Responder Scholarships'],
      follow_links: ['https://foldsofhonor.org/scholarships/military-scholarships/', 'https://foldsofhonor.org/scholarships/first-responder-scholarships/'],
      vocabulary_gaps: [
        'Parent/spouse is a fallen or catastrophically injured first responder: no first-responder field',
        'Same-person matching: "who" and killed/disabled must belong to the same military[] entry'
      ],
      notes: 'Overview page covering Military and First Responder programs, each with Higher Education and K-12 Children\'s Fund variants. Window is Feb 1 - Mar 31 each year and currently closed, so deadline null (annual estimate) and cycle upcoming. The 2.0 term GPA applies to Higher Education awards at acceptance. Amounts are need-based; no fixed amount.'
    };
  })(),

  /* ---------------- Girl Scouts ---------------- */
  'https://www.girlscouts.org/goldawardscholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'GSUSA Gold Award Scholarship', provider_org: 'Girl Scouts of the USA', provider_type: 'nonprofit',
      apply_url: 'https://www.girlscouts.org/goldawardscholarship', source_url: 'https://www.girlscouts.org/goldawardscholarship',
      amount: { min: 5000, max: 5000 }, deadline: '2026-04-14', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad'],
      effort: { essay_words: 500 },
      eligibility: [
        G(F('Applicant is a Gold Award Girl Scout whose final report was approved in GoGold within the eligibility date range', ['affiliations.member_org[].name', 'activities.leadership'], 'To be eligible, all Gold Award Girl Scouts must have their final report approved in the GoGold')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad'], 'Gold Award Girl Scouts who are high school seniors or recent high school graduates can apply for the 2026 program.')),
        G(F('Applicant earned the Gold Award before April 1, 2026 as a current senior, or in their senior year after March 31, 2025 as a recent graduate', ['academic.status', 'academic.grad_date'], 'recent high school graduates who earned in their senior year after March 31, 2025'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Gold Award Girl Scouts can earn a $5,000 scholarship.' },
        { field: 'deadline', source_quote: 'Apply between March 13 - April 14, 2026.' },
        { field: 'effort', source_quote: 'In either video (3 minutes or less) or written (500 words or fewer) format, answer four questions about your Gold Award separately' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: [
      'Having earned the Girl Scout Gold Award has no field',
      'Applicants who applied in a previous year are not eligible to re-apply'
    ],
    notes: 'The 2026 program closed; 2027 details not yet posted. One recipient per council (up to 112). Four answers, each 500 words or fewer, or 3-minute video (video is optional so not listed as a required format). Recent graduates are mapped to undergrad.'
  },

  'https://www.girlscouts.org/en/scholarships.All.All.html': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [], award_names: [],
    notes: 'Scholarship directory for Girl Scouts with Type/State filters, but the listings load dynamically and no award names appear in the snapshot text. Nothing to extract.'
  },

  /* ---------------- Knights of Columbus ---------------- */
  'https://www.kofc.org/resources/scholarships/us-undergraduate-scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Knights of Columbus U.S. Undergraduate Scholarships', provider_org: 'Knights of Columbus', provider_type: 'fraternal',
      apply_url: 'https://aim.applyists.net/KofC', source_url: 'https://www.kofc.org/resources/scholarships/us-undergraduate-scholarships/',
      amount: { min: 0, max: 1500, renewable: true, note: 'Maximum $1,500 per year, renewable for up to four years' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Entering freshman year, of a four-year, undergraduate program, leading to a bachelor\'s degree')),
        G(F('Applicant will attend a Catholic college or university in the United States', ['academic.institution'], 'at a Catholic college or Catholic university, in the United States')),
        G(
          H('affiliations.fraternal[].org', 'eq', 'Knights of Columbus', 'A member in good standing of the Knights of Columbus, a son or daughter of such a member'),
          H('affiliations.fraternal[].org', 'eq', 'Columbian Squires', 'or a Columbian Squire in good standing')
        ),
        G(H('affiliations.fraternal[].member', 'in', ['self', 'parent'], 'A member in good standing of the Knights of Columbus, a son or daughter of such a member, or of a such a deceased member'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'The maximum scholarship is $1,500 per year, renewable each year of undergraduate study to a total of four years' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Must attend a Catholic college or university (no institution-type field)',
      'Some sub-funds (Percy J. Johnson, Frank L. Goularte) are need-based and require FAFSA; Percy J. Johnson is for young men'
    ],
    notes: 'One application (ISTS program key KofC) covers several endowed funds (Pro Deo and Pro Patria, McDevitt, Johnson, LaBella, Goularte); modeled as one scholarship. No deadline on the page.'
  },

  /* ---------------- IBEW Local 3 news post ---------------- */
  'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program': (() => {
    const src = 'https://www.local3ibew.org/news/77th-annual-scholarship-awards-program';
    const base = { source_url: src, apply_url: src, verified_at: V };
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'Educational & Cultural Trust Fund Scholarship', provider_org: 'Local Union No. 3 IBEW Educational & Cultural Trust Fund', provider_type: 'union',
          amount: { min: 0, max: 7500, note: 'Up to $7,500 per year toward tuition' }, deadline: '2025-01-31', cycle_status: 'closed',
          geo_scope: { level: 'state', states: ['NY'] }, levels: ['hs_senior', 'undergrad'],
          eligibility: [
            G(H('academic.status', 'in', ['hs_senior', 'undergrad'], 'Do you have a child graduating high school in June 2025 or already enrolled in their first year of college?')),
            G(H('affiliations.union[].name', 'eq', 'IBEW', 'Do you have a child graduating high school in June 2025 or already enrolled in their first year of college?')),
            G(H('affiliations.union[].local', 'eq', '3', 'Local Union No. 3 IBEW'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'which offer up to $7,500 per year toward your child’s tuition' },
            { field: 'deadline', source_quote: 'Applications are due by January 31st.' }
          ],
          confidence: 0.55 },
        { ...base, name: 'Michael Siegel Memorial Scholarship', provider_org: 'Local Union No. 3 IBEW', provider_type: 'union',
          amount: { min: 5000, max: 5000 }, deadline: '2025-01-31', cycle_status: 'closed',
          geo_scope: { level: 'state', states: ['NY'] }, levels: ['undergrad'],
          eligibility: [
            G(H('affiliations.union[].name', 'eq', 'IBEW', 'which offers $5,000 for undergraduate study to the children of eligible Sign Division members')),
            G(H('affiliations.union[].local', 'eq', '3', 'Local Union No. 3 IBEW')),
            G(F('Applicant is the child of an eligible Local 3 Sign Division member', ['affiliations.union[].name', 'affiliations.union[].local'], 'to the children of eligible Sign Division members'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'which offers $5,000 for undergraduate study' },
            { field: 'deadline', source_quote: 'The same application deadline applies to the Michael Siegel Memorial Scholarship' }
          ],
          confidence: 0.55 },
        { ...base, name: 'IBEW Founders\' Scholarship', provider_org: 'International Brotherhood of Electrical Workers', provider_type: 'union',
          amount: { min: 0, max: 24000, note: 'Up to $200 per semester credit hour or $134 per trimester credit hour; maximum $24,000 per person over up to 8 years' },
          deadline: '2025-05-01', cycle_status: 'closed',
          geo_scope: { level: 'national' }, levels: ['undergrad', 'grad', 'returning'],
          eligibility: [
            G(F('Applicant is an adult IBEW member', ['affiliations.union[].name'], 'The IBEW awards scholarships to adults, too.')),
            G(F('Applicant is pursuing an associate\'s, bachelor\'s or postgraduate degree in a field that will further the electrical industry', ['academic.majors', 'career.field'], 'toward an associate’s, bachelor’s, or postgraduate degree in a field that will further the electrical industry overall'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'The maximum distribution is $24,000 per person over a period not to exceed 8 years.' },
            { field: 'deadline', source_quote: 'a printable application due by May 1st' }
          ],
          confidence: 0.45 }
      ],
      award_names: ['Educational & Cultural Trust Fund Scholarship', 'Michael Siegel Memorial Scholarship', 'IBEW Founders\' Scholarship'],
      follow_links: [],
      vocabulary_gaps: [
        'Union membership belongs to the parent, but union[] has no relationship field',
        'Sign Division membership within Local 3 has no field'
      ],
      notes: 'AMBIGUOUS: a news post dated Jan 20, 2025 announcing the 2025 cycle; could be treated as not_scholarship (stale news). Deadlines are given without a year ("January 31st", "May 1st"); the 2025 year is inferred from the post date and "June 2025", so all are closed. Founders\' eligibility is only on ibew.org; IBEW membership is implied, not stated. Links in the text are email-tracking redirects, so no follow_links.'
    };
  })(),

  /* ---------------- MLK Community Choir San Diego ---------------- */
  'https://www.mlkccsd.org/student-grants/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'MLKCCSD Educational Grant', provider_org: 'Martin Luther King Jr. Community Choir of San Diego (MLKCCSD)', provider_type: 'nonprofit',
      apply_url: 'https://cdn.prod.website-files.com/660b749bb73db20bcf391dda/69251fcba72c1a5c381e0c0a_2026%20MLK%20APPLICATION.docx',
      source_url: 'https://www.mlkccsd.org/student-grants/',
      amount: { min: 0, max: 0, note: noAmount }, deadline: '2026-03-16', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', '-You must be a Graduating High School Senior')),
        G(H('academic.gpa', 'gte', 2.75, '-You must have a GPA of 2.75 or higher')),
        G(H('geo.county', 'eq', 'San Diego County, CA', '-You must be a resident of San Diego County and a US citizen')),
        G(H('identity.citizenship', 'eq', 'us_citizen', '-You must be a resident of San Diego County and a US citizen')),
        G(F('Applicant intends to pursue their art (singing, dance, music, visual arts, film, acting, writing or other artistic expression) at a university, college, community college, conservatory or art school next year', ['academic.majors', 'career.field', 'activities.extracurricular'], 'You must intend to pursue your art by attending a university, accredited four-year college, community college, conservatory, or art school in the next school year.'))
      ],
      provenance: [
        { field: 'deadline', source_quote: 'Send the completed application no later than March 16, 2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: [],
    notes: 'Called "educational grants" but they are awards to individual graduating seniors pursuing artistic majors, so treated as a scholarship. Mailed paper application. Amount per student not stated ($360,000 to 147 students since 1998).'
  },

  /* ---------------- NIAF ---------------- */
  'https://www.niaf.org/programs/available-scholarships/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: niafRecords,
    award_names: niafRecords.map(s => s.name),
    follow_links: [],
    vocabulary_gaps: [
      '"Originally from" a state is approximated with geo.state (current residence)',
      'Donald Mazzoni requires at least 50% Italian American heritage (no heritage-fraction field)',
      'General NIAF eligibility criteria are on a separate overview page and are not included'
    ],
    notes: 'One NIAF application matches students to these funds. No deadlines on this page. Several awards give preferences (Florida residence, Sicilian heritage, NY/NJ/CT, northern NJ counties, Boston University, Italian American heritage at John Cabot) that are not encoded as rules. Awards with no stated amount use 0/0.'
  },

  /* ---------------- Sacramento Region Community Foundation ---------------- */
  'https://www.sacregcf.org/students/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: sacRecords,
    award_names: sacRecords.map(s => s.name),
    follow_links: sacRecords.map(s => s.apply_url),
    vocabulary_gaps: [
      'Need-based awards require a FAFSA or CA Dream Act submission summary report (financial.fafsa_filed alone would exclude Dream Act filers)',
      '"Attended a school in X County" is approximated with geo.county OR geo.hs_county',
      'Institution-location requirements (e.g. a college in Sacramento County, within 100 miles of the courthouse) have no field',
      'Sarah A. Bonnifield also accepts nephews/nieces of Vietnam veterans, which military[].who cannot express',
      'Graydon and Myrth Fox also accepts spouse, child or grandchild of a killed/wounded veteran and requires honorable service'
    ],
    notes: 'Grid of 42 scholarships with GPA, status, school, major, amount and other requirements; each links to its academicworks page. No per-award deadlines: "Most scholarships open in December and close in March", so deadline is null with annual_estimate. The grid header is misaligned (the second column is actually GPA). Preferences are not encoded. Many rows leave the status column blank; levels are omitted there.'
  },

  /* ---------------- Salute to Education ---------------- */
  'https://www.salutetoeducation.com/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Placeholder: "We are working on the information and application for the 2026-2027" cycle, expected late October or early November. A real scholarship program from San Diego County Ford Dealers, but the page has no award details to extract. Borderline: could be single with an unextractable record.'
  },

  /* ---------------- Santa Cruz Rotary ---------------- */
  'https://www.santacruzrotary.com/academic-scholarship-program.html': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Rotary Club of Santa Cruz Academic Scholarship', provider_org: 'Rotary Club of Santa Cruz', provider_type: 'fraternal',
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
        G(F('Applicants from Santa Cruz, Harbor, Pacific Collegiate and Kirby High Schools need a GPA greater than 3.3 (Delta and Costanoa applicants are evaluated by a counselor instead)', ['academic.gpa', 'geo.high_school'], 'should reflect a GPA greater than 3.3 for applicants from Santa Cruz, Harbor, Pacific Collegiate, and Kirby High Schools')),
        G(F('Applicant plans to enroll in college for the upcoming Fall term', ['academic.status', 'academic.grad_date'], 'Applicants will be considered only if they plan to enroll in college for the upcoming Fall term.'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Award amounts range between $500 and $5,000' },
        { field: 'deadline', source_quote: 'by 5 p.m. on March 13, 2026' },
        { field: 'need_based', source_quote: 'depending upon the candidate’s performance and financial need' },
        { field: 'effort', source_quote: 'A maximum 500-word essay' },
        { field: 'effort', source_quote: 'Two letters of recommendation' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Delta and Costanoa applicants need a counselor evaluation of ability to succeed in college (no field)'],
    notes: 'Deadline March 13, 2026 has passed. Finalists interview in mid-April. Second-year renewal is possible but not guaranteed, so renewable is not set. High school names are canonicalized guesses (Kirby School, Delta Charter High School).'
  },

  /* ---------------- Santa Barbara Foundation home page ---------------- */
  'https://sbfoundation.org/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Community foundation home page about donors, nonprofit grants and reports. No student scholarship content.'
  },

  /* ---------------- SDSU Future Educator ---------------- */
  'https://sdsu.academicworks.com/opportunities/17312': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Future Educator Endowed Scholarship', provider_org: 'San Diego State University', provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/17312', source_url: 'https://sdsu.academicworks.com/opportunities/17312',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-09-04', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['grad'], need_based: 'need',
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.cip_codes', 'prefix_any', ['13'], 'Recipients must be teaching credential candidates in the College of Education.')),
        G(H('academic.status', 'eq', 'grad', 'Recipients must be teaching credential candidates in the College of Education.')),
        G(H('academic.gpa', 'gte', 3.5, 'Recipients must have a minimum overall cumulative GPA of 3.50 out of 4.00')),
        G(H('financial.fafsa_filed', 'is_true', undefined, 'Applicants must file a Free Application for Federal Student Aid (FAFSA) or the California Dream Act'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee.' },
        { field: 'deadline', source_quote: '09/04/2026' },
        { field: 'need_based', source_quote: 'Recipients must have financial need, as determined by the SDSU Financial Aid Office.' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['FAFSA or California Dream Act filing: financial.fafsa_filed does not cover Dream Act filers'],
    notes: 'Teaching credential candidates are mapped to academic.status = grad (post-baccalaureate). Full-time enrollment is explicitly not required.'
  },

  /* ---------------- SFSU portal: Community Foundation of Sonoma County ---------------- */
  'https://sfsu.academicworks.com/opportunities/4904': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Community Foundation of Sonoma County Scholarships', provider_org: 'Community Foundation of Sonoma County', provider_type: 'community_foundation',
      apply_url: 'https://sfsu.academicworks.com/opportunities/4904', source_url: 'https://sfsu.academicworks.com/opportunities/4904',
      amount: { min: 0, max: 0, note: 'Award varies' }, deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'unknown',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'need',
      effort: { essay_words: null },
      eligibility: [
        G(H('geo.county', 'eq', 'Sonoma County, CA', 'Must be a Sonoma County resident unless otherwise specified by the scholarship')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad'], 'Class Level: HS Seniors; Undergrad: Any; Grad: Other')),
        G(F('Applicant shows perseverance and motivation to attend and complete higher education', ['activities.leadership', 'academic.status'], 'Must demonstrate financial need and perseverance and motivation to attend and complete higher education'))
      ],
      provenance: [
        { field: 'deadline', source_quote: '*Deadline: March 2' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Yes' },
        { field: 'effort', source_quote: 'Must provide a personal statement.' }
      ],
      verified_at: V, confidence: 0.65
    }],
    vocabulary_gaps: [
      'Enrollment requirement differs by level (undergrad full-time, grad half-time)',
      'Graduate applicants are only considered by some Legacy funds'
    ],
    notes: 'SFSU portal listing of an external community-foundation program (multiple scholarships, one application). Deadline "March 2" has no year, so null with annual_estimate. Amount "Varies".'
  },

  /* ---------------- SFSU portal: Scholarship Foundation of Santa Barbara ---------------- */
  'https://sfsu.academicworks.com/opportunities/5729': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Scholarship Foundation of Santa Barbara', provider_org: 'Scholarship Foundation of Santa Barbara', provider_type: 'private_foundation',
      apply_url: 'https://sfsu.academicworks.com/opportunities/5729', source_url: 'https://sfsu.academicworks.com/opportunities/5729',
      amount: { min: 500, max: 5000 }, deadline: '2020-01-15', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'need',
      eligibility: [
        G(H('geo.hs_county', 'eq', 'Santa Barbara County, CA', 'Graduate or receive a GED from a Santa Barbara County High School by June of the current academic year.')),
        G(F('Applicant attended at least 4 of the 6 years of grades 7-12 at a Santa Barbara County school', ['geo.hs_county', 'geo.high_school'], 'Must have attended at least 4 of the 6 years between grades 7-12 at a Santa Barbara County school.')),
        G(
          H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident'], 'Citizenship: US Citizen/Perm Res/AB540'),
          F('Applicant qualifies under California AB540', ['identity.citizenship', 'geo.state', 'geo.hs_county'], 'U.S. citizen or AB540 are eligible to apply.')
        ),
        G(H('academic.enrollment', 'eq', 'full_time', 'Be planning to attend full time at a Title IV-approved school in the next academic year'))
      ],
      provenance: [
        { field: 'amount', source_quote: '$500-$5,000' },
        { field: 'deadline', source_quote: '*Deadline: January 15 2020' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Yes' }
      ],
      verified_at: V, confidence: 0.65
    }],
    vocabulary_gaps: ['AB540 status (California in-state tuition exemption) has no citizenship value'],
    notes: 'Stale listing: deadline January 15, 2020. Page is internally inconsistent: criterion 5 says full time, while "Enrollment Requirement" says half-time for undergrad and grad; the explicit criterion was used. U.S. national is added as a citizen-equivalent.'
  },

  /* ---------------- SDSU Social Work Title IV-E MSW stipend ---------------- */
  'https://socialwork.sdsu.edu/stipend/msw': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'California Title IV-E MSW Stipend (SDSU)', provider_org: 'San Diego State University School of Social Work (Cal IV-E)', provider_type: 'university',
      apply_url: 'https://socialwork.sdsu.edu/stipend/msw/application', source_url: 'https://socialwork.sdsu.edu/stipend/msw',
      amount: { min: 0, max: 50000, renewable: true, note: 'Full-time: $25,000 per year for up to 2 years; part-time county/state employees get tuition, fees, books and travel reimbursed' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['grad'], service_obligation: true,
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'The Cal IV-E program at SDSU')),
        G(H('academic.status', 'eq', 'grad', 'provides up to $50,000 as a taxable stipend to MSW students')),
        G(H('academic.cip_codes', 'prefix_any', ['44.07'], 'provides up to $50,000 as a taxable stipend to MSW students for educational support toward the Master of Social Work degree'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'provides up to $50,000 as a taxable stipend to MSW students' },
        { field: 'amount', source_quote: 'Full-time MSW students receive $25,000 per year of their MSW program not exceeding $50,000 (2 years max).' },
        { field: 'service_obligation', source_quote: 'The stipend recipient assumes certain responsibilities, including coursework requirements, and the post-graduation employment requirement.' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['Part-time track is limited to concurrent employees of a county or the state Department of Social Services'],
    notes: 'A stipend with a post-graduation employment (service) obligation, so service_obligation=true. Detailed requirements and the application are on linked pages. "Strong social justice value orientation" and similar are desired qualities, not eligibility.'
  },

  /* ---------------- Strauss Foundation ---------------- */
  'https://www.straussfoundation.org/apply-1': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Donald A. Strauss Public Service Scholarship', provider_org: 'Strauss Foundation', provider_type: 'private_foundation',
      apply_url: 'https://www.straussfoundation.org/apply-1', source_url: 'https://www.straussfoundation.org/apply-1',
      amount: { min: 15000, max: 15000, note: 'Amount only appears in the navigation link "The $15,000 Award"' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['undergrad'],
      effort: { essay_words: null, recs_required: 2, formats: ['project'] },
      eligibility: [
        G(H('academic.status', 'eq', 'undergrad', 'The applicant has completed at least one year of college and will not graduate before June 2026.')),
        G(H('academic.year', 'gte', 2, 'The applicant has completed at least one year of college')),
        G(F('Applicant will not graduate before June 2026', ['academic.grad_date'], 'will not graduate before June 2026')),
        G(F('Applicant has a desire to "make a difference" in local, regional, national or international communities', ['activities.extracurricular', 'activities.leadership', 'career.sectors'], 'The applicant has a desire to “make a difference” in local, regional, national, or international communities.'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'The $15,000 Award' },
        { field: 'effort', source_quote: 'One-Page Personal Essay' },
        { field: 'effort', source_quote: 'Two Letters of Recommendation are required.' },
        { field: 'effort', source_quote: 'Project Proposal' }
      ],
      verified_at: V, confidence: 0.6
    }],
    vocabulary_gaps: [
      'GPA in the upper third of the class (class rank) has no field',
      'Participating schools may be limited (see "Important Dates & School Contacts"), not stated on this page'
    ],
    notes: 'Application page. Award name inferred from the site (Strauss Foundation scholar program); the page does not state the full name. Requires a 4-page public service project proposal, one-page resume and one-page essay (length stated in pages, not words, so essay_words null). No deadline on this page.'
  },

  /* ---------------- WSAC American Indian Endowed Scholarship ---------------- */
  'https://wsac.wa.gov/american-indian-endowed-scholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'American Indian Endowed Scholarship', provider_org: 'Washington Student Achievement Council', provider_type: 'government',
      apply_url: 'https://portal.wsac.wa.gov/a/aies/', source_url: 'https://wsac.wa.gov/american-indian-endowed-scholarship',
      amount: { min: 500, max: 3000, note: 'Around $500 to $3,000; may be received up to five years but must reapply each year' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'state', states: ['WA'] }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'need',
      eligibility: [
        G(H('financial.fafsa_filed', 'is_true', undefined, 'Demonstrate financial need based on a completed FAFSA')),
        G(H('geo.state', 'eq', 'WA', 'Meet Washington State residency requirements')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Intend to enroll full-time as an undergraduate or graduate student at a participating public or private college or university in Washington State')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad'], 'Intend to enroll full-time as an undergraduate or graduate student')),
        G(F('Applicant will attend a participating public or private college or university in Washington State', ['academic.institution'], 'at a participating public or private college or university in Washington State')),
        G(F('Applicant has close social and cultural ties to an American Indian community in Washington State', ['identity.tribal.status', 'identity.tribal.nation', 'identity.heritage'], 'close social and cultural ties to an American Indian community in Washington State')),
        G(F('Applicant intends to use their education to benefit the American Indian community in Washington State', ['career.field', 'identity.tribal.nation'], 'Intend to use their education to benefit the American Indian community in Washington State.'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Award amounts range from around $500 to $3,000.' },
        { field: 'deadline', source_quote: 'The 2027-28 academic year scholarship applications will be available in December 2026.' },
        { field: 'need_based', source_quote: 'Demonstrate financial need based on a completed FAFSA' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Must not pursue a degree in theology (no "not prefix" rule for CIP codes)',
      'Must not have already received five years of this scholarship'
    ],
    notes: 'The 2026-27 cycle closed; the 2027-28 application opens December 2026, so cycle upcoming with no deadline stated. Upper-division and graduate students are prioritized (preference, not a rule).'
  }
};
