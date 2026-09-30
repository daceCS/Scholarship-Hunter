// Chunk 01 adjudicated labels (pages where the two drafts disagreed). Settled from the saved page text only.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const SDSU = 'San Diego State University';
const noAmount = 'Amount not stated on the page';
const TEAMSTERS = 'International Brotherhood of Teamsters';

export default {
  /* ---------------- Cause San Diego ---------------- */
  'https://www.causesandiego.org/scholarship/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Cause San Diego Social Impact Scholarship', provider_org: 'Cause San Diego', provider_type: 'nonprofit',
      apply_url: 'https://www.causesandiego.org/scholarship/', source_url: 'https://www.causesandiego.org/scholarship/',
      amount: { min: 0, max: 0, note: 'Up to $15,000 in total across 5 winners; per-winner amount not stated' },
      deadline: null, cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['undergrad', 'grad', 'trade'],
      eligibility: [
        G(H('academic.status', 'in', ['undergrad', 'grad', 'trade'], 'college and trade school students engaged in social impact activities')),
        G(F('Applicant is currently enrolled at and attending a college, university or trade school based in San Diego County', ['academic.institution'], 'open to students currently enrolled and attending San Diego County-based colleges, universities and trade schools')),
        G(F('Applicant is engaged in social impact activities in the San Diego region', ['activities.extracurricular', 'activities.leadership'], 'engaged in social impact activities in the San Diego region'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'awarding up to $15,000 in scholarships' },
        { field: 'deadline', source_quote: 'Our 2026 Scholarship Application period is now closed' }
      ],
      verified_at: V, confidence: 0.7
    }],
    notes: 'The $15,000 is the total pool shared by 5 winners, not a per-award cap, so the per-award amount is recorded as not stated (0/0 with a note). Whether graduate students count as "college students" is a judgment call.'
  },

  /* ---------------- HBAIE ---------------- */
  'https://www.hbaie.com/Scholarship': {
    page_type: 'single', is_scholarship_page: true, scholarships: [],
    follow_links: ['https://www.hbaie.com/resources/Documents/2026-HBAIE-Scholarship-Letter-and-Application.pdf'],
    award_names: ['HBAIE Scholarship'],
    notes: 'The Scholarships page of the Hispanic Bar Association of the Inland Empire contains only a "DOWNLOAD APPLICATION HERE" link to the 2026 scholarship letter and application PDF. No amount, deadline or eligibility is in the page text, so no record is extracted; the facts live in the linked PDF.'
  },

  /* ---------------- SWE Houston Area ---------------- */
  'https://houston.swe.org/student-scholarships/': (() => {
    const base = {
      provider_org: 'Society of Women Engineers, Houston Area Section', provider_type: 'professional_society',
      apply_url: 'https://houston.swe.org/student-scholarships/scholarship-application/',
      source_url: 'https://houston.swe.org/student-scholarships/',
      amount: { min: 0, max: 0, note: 'A monetary award towards a single year of study; amount not stated' },
      deadline: null, cycle_status: 'unknown', need_based: 'merit',
      geo_scope: { level: 'city', states: ['TX'] },
      effort: { recs_required: 1 },
      provenance: [
        { field: 'amount', source_quote: 'The recipient(s) will receive a monetary award towards a single year of study' },
        { field: 'need_based', source_quote: 'awarded on the basis of merit' },
        { field: 'effort', source_quote: 'along with letters of recommendation and reviews of resumes' }
      ],
      verified_at: V, confidence: 0.65
    };
    const area = G(F('Applicant is a student in the Greater Houston Area', ['geo.city', 'geo.county', 'geo.high_school', 'academic.institution'], 'a qualified female student in the Greater Houston Area'));
    const eng = G(H('academic.cip_codes', 'prefix_any', ['14', '15'], 'Plans to major in an Engineering or Engineering-related discipline at an ABET-accredited 4-year college or university'));
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'SWE-HA Freshman Scholarship', levels: ['hs_senior'],
          eligibility: [
            G(H('identity.gender', 'eq', 'woman', 'Freshman Scholarships to female students')),
            G(H('academic.status', 'eq', 'hs_senior', 'Senior High School Female Student at a Houston Area school')),
            G(F('Applicant attends a Houston Area high school', ['geo.high_school', 'geo.city', 'geo.county'], 'Senior High School Female Student at a Houston Area school')),
            eng
          ] },
        { ...base, name: 'SWE-HA Upper-class Scholarship', levels: ['undergrad'],
          eligibility: [
            G(H('identity.gender', 'eq', 'woman', 'to female students currently enrolled in or transferring from a community college')),
            G(H('academic.status', 'eq', 'undergrad', 'Upper-class Scholarships (Sophomores, Juniors, and Seniors)')),
            G(H('academic.year', 'between', [2, 4], 'Upper-class Scholarships (Sophomores, Juniors, and Seniors)')),
            area,
            eng
          ] }
      ],
      award_names: ['SWE-HA Freshman Scholarship', 'SWE-HA Upper-class Scholarship', 'SWE National Scholarships', 'Middle & High School Student Awards'],
      follow_links: ['https://houston.swe.org/student-scholarships/middle-and-high-school-student-awards/', 'https://swe.org/scholarships/'],
      vocabulary_gaps: ['ABET accreditation of the intended 4-year program has no field'],
      notes: 'Two tiers (freshman and upper-class) of the Houston Area section award, split into two records. "Engineering or engineering-related discipline" is mapped to CIP 14 and 15 (engineering technology). The page says applications include letters of recommendation but gives no count; recs_required 1 is a lower bound. No amounts or deadlines. Middle and high school student awards are recognitions described on a separate page; listed by name only.'
    };
  })(),

  /* ---------------- Knights of Columbus Council 4678 ---------------- */
  'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Knights of Columbus Council 4678 Scholarship', provider_org: 'Knights of Columbus Council No. 4678', provider_type: 'fraternal',
      apply_url: 'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf',
      source_url: 'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf',
      amount: { min: 1000, max: 1000 }, deadline: '2024-12-15', cycle_status: 'closed',
      geo_scope: { level: 'city', states: ['PA'] }, levels: ['hs_senior'],
      effort: { essay_words: 0, formats: ['test'] },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'To be eligible any graduating high school senior must have been accepted')),
        G(H('academic.enrollment', 'eq', 'full_time', 'accepted by an accredited university, college, or trade school as a full-time student')),
        G(H('affiliations.fraternal[].org', 'eq', 'Knights of Columbus', 'KNIGHTS OF COLUMBUS')),
        G(H('affiliations.fraternal[].chapter', 'eq', 'Council 4678', 'Council No. 4678')),
        G(
          H('affiliations.fraternal[].member', 'eq', 'parent', 'The child of a member of Council 4678 in good standing'),
          F('Applicant is the grandchild of a Council 4678 member in good standing AND is from the State College (PA) area or surrounding school systems', ['affiliations.fraternal[].member', 'geo.city', 'geo.high_school', 'geo.school_district'], 'The grandchild of a member of Council 4678 in good standing must be from the State College area or surrounding school systems')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'One $1,000 scholarship will be awarded' },
        { field: 'deadline', source_quote: 'DEADLINE IS DEC 15, 2024' },
        { field: 'effort', source_quote: 'Attach a copy of your SAT or ACT scores' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Member must be "in good standing" (no standing field)'],
    notes: 'Stale 2025 (2024-2025 academic year) application; deadline passed. SAT/ACT scores must be attached, mapped to effort.formats test. The form asks for no essay, so essay_words is 0. The grandchild branch carries an extra State College area condition, so it is a fuzzy rule combining both conditions rather than a bare grandparent rule.'
  },

  /* ---------------- NESA news post ---------------- */
  'https://nesa.org/nesa-news/spread-the-word/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'NESA Scholarships', provider_org: 'National Eagle Scout Association', provider_type: 'nonprofit',
      apply_url: 'https://nesa.org/scholarships', source_url: 'https://nesa.org/nesa-news/spread-the-word/',
      amount: { min: 0, max: 0, note: 'Per-award amount not stated (over $500,000 was awarded to 65 Eagle Scouts in 2022-23)' },
      deadline: '2023-01-31', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'trade'],
      eligibility: [
        G(H('affiliations.member_org[].name', 'eq', 'National Eagle Scout Association', 'Be a current member of the National Eagle Scout Association')),
        G(F('Applicant earned the rank of Eagle Scout by January 24, 2023', ['activities.extracurricular', 'activities.leadership', 'affiliations.member_org[].name'], 'Earned the rank of Eagle Scout by January 24, 2023')),
        G(
          H('academic.status', 'eq', 'hs_senior', 'A current senior in high school'),
          F('Applicant is a current full-time undergraduate who is a junior or below', ['academic.status', 'academic.year', 'academic.enrollment'], 'A current full-time Junior or below in an undergraduate program'),
          F('Applicant is less than halfway through an associate degree or skilled trade program', ['academic.status', 'academic.year'], 'Less than halfway through an associate degree or skilled trade program')
        )
      ],
      provenance: [
        { field: 'deadline', source_quote: 'will remain open until January 31, 2023' },
        { field: 'amount', source_quote: 'NESA awarded over $500,000 in scholarships to 65 Eagle Scouts' }
      ],
      verified_at: V, confidence: 0.6
    }],
    vocabulary_gaps: ['Eagle Scout rank has no dedicated field'],
    notes: 'A November 2022 news post announcing the 2023-24 NESA scholarship cycle (portal open December 1, 2022 to January 31, 2023). Stale. Labeled single because it describes one application with its eligibility; not_scholarship (news) is a defensible alternative. Current NESA membership is a named-organization membership, so it is a hard member_org rule.'
  },

  /* ---------------- Rotary Club of Sacramento ---------------- */
  'https://rotarysacramento.com/our-foundations/scholarships/': (() => {
    const src = 'https://rotarysacramento.com/our-foundations/scholarships/';
    const base = {
      provider_org: 'Rotary Club of Sacramento Foundation', provider_type: 'fraternal',
      apply_url: src, source_url: src,
      deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
      verified_at: V
    };
    const cycle = { field: 'deadline', source_quote: 'Applications for the next cycle will be accepted from January through April' };
    const senior = (q) => G(H('academic.status', 'eq', 'hs_senior', q));
    const ft = (q) => G(H('academic.enrollment', 'eq', 'full_time', q));
    const notRotarian = G(F('Applicant is NOT the son or daughter of a Rotarian', ['affiliations.fraternal[].org', 'affiliations.fraternal[].member'], 'not be the son or daughter of a Rotarian'));
    const unknownCycle = (s) => { const o = { ...s, cycle_status: 'unknown' }; delete o.deadline_kind; return o; };
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'Derek Ian Arnold Annual Scholarship', amount: { min: 1200, max: 1200 },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'eq', 'Delta High School', 'graduating class at Delta High School')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating class at Delta High School'),
            notRotarian,
            ft('be enrolled full-time in undergraduate studies in an accredited four-year higher education school')
          ],
          provenance: [{ field: 'amount', source_quote: '1 Scholarships – $1200' }, cycle], confidence: 0.75 },
        { ...base, name: 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships',
          amount: { min: 1750, max: 2500, note: 'Rotary Club of Sacramento Foundation: 2 x $2,500; Robinson Crowell: 2 x $1,750' },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'in', ['C. K. McClatchy High School', 'Sacramento Charter High School', 'West Campus High School'], 'McClatchy, Sacramento Charter and West Campus High Schools')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating classes'),
            notRotarian,
            ft('enroll full-time in undergraduate studies in an accredited 4-year university or junior college transferring to a 4-year university')
          ],
          provenance: [{ field: 'amount', source_quote: 'Rotary Club of Sacramento Foundation: 2 Scholarships – $2500 each; Robinson Crowell: 2 Scholarships – $1750 each' }, cycle], confidence: 0.7 },
        { ...base, name: 'Harold and Lilla Strauch Annual Scholarship', amount: { min: 2500, max: 2500 },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'eq', 'Rio Americano High School', 'graduating classes at Rio Americano High School')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating classes at Rio Americano High School'),
            notRotarian,
            ft('enroll full-time in undergraduate studies in an accredited four-year college')
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $2500' }, cycle], confidence: 0.75 },
        unknownCycle({ ...base, name: 'Philip and Joan Knox Scholarship', amount: { min: 0, max: 0, note: 'One scholarship; amount not stated' },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_underclass', 'hs_senior'], need_based: 'need',
          eligibility: [
            G(H('geo.high_school', 'eq', 'Jesuit High School', 'Incoming and returning students at Jesuit High School are eligible to apply')),
            G(F('Applicant demonstrates academic promise', ['academic.gpa', 'activities.competitions'], 'demonstrate academic promise'))
          ],
          provenance: [{ field: 'need_based', source_quote: 'have a financial need' }], confidence: 0.55 }),
        unknownCycle({ ...base, name: 'Susan and Jon R. Snyder Annual Scholarship Fund', amount: { min: 0, max: 0, note: 'One scholarship; amount not stated' },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_underclass', 'hs_senior'], need_based: 'either',
          eligibility: [
            G(
              H('geo.high_school', 'eq', 'Cristo Rey High School (Oakland)', 'a student currently enrolled at Cristo Rey'),
              F('Applicant is an eighth grader enrolling at Cristo Rey High School in Oakland', ['geo.high_school', 'academic.status'], 'an eighth grader enrolling at Cristo Rey High School (Oakland)')
            )
          ],
          provenance: [{ field: 'need_based', source_quote: 'scholastic ability, leadership qualities, and financial need' }], confidence: 0.55 }),
        { ...base, name: 'Oleta Lambert Scholarship', amount: { min: 1100, max: 1100 },
          geo_scope: { level: 'county', states: ['CA'] },
          eligibility: [
            G(H('geo.hs_county', 'eq', 'Sacramento County, CA', 'Oleta Lambert Scholarship - Any High School in Sacramento County'))
          ],
          provenance: [{ field: 'amount', source_quote: '1 Scholarship – $1100' }, cycle], confidence: 0.6 },
        { ...base, name: 'Jim and Mary Jo Streng Scholarship', amount: { min: 5000, max: 5000 },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'eq', 'Bella Vista High School', 'Jim and Mary Jo Streng Scholarship - Bella Vista High School')),
            senior('Candidates must be high school seniors, not be the son or daughter of a Rotarian'),
            notRotarian,
            ft('enroll full-time in undergraduate studies in an accredited 4-year university or community college transferring to a 4-year university')
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $5,000 each' }, cycle], confidence: 0.75 }
      ],
      award_names: ['Derek Ian Arnold Annual Scholarship', 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships', 'Harold and Lilla Strauch Annual Scholarship', 'Philip and Joan Knox Scholarship', 'Susan and Jon R. Snyder Annual Scholarship Fund', 'Oleta Lambert Scholarship', 'Jim and Mary Jo Streng Scholarship'],
      vocabulary_gaps: [
        'Class rank ("academic upper one-third of their graduating class") has no field',
        'Good standing at the present school (Knox, Snyder) has no field'
      ],
      notes: 'The page says 2025-26 applications are open but also that the next cycle runs January through April, so the next deadline is an April estimate with no year (deadline null, annual_estimate, upcoming). "Not the son or daughter of a Rotarian" is an exclusion encoded as a fuzzy rule over the fraternal fields. Knox and Snyder are applied for through the schools and fund high school students (incoming/returning at Jesuit; eighth graders enrolling or current students at Cristo Rey Oakland), so levels are high school and no deadline is set. Knox requires financial need; for Snyder, need is one of several considerations alongside scholastic ability, so need_based is either. Oleta Lambert gives no class-level rule. The Robinson Crowell heading covers two parallel awards with different amounts, kept as one record with a range.'
    };
  })(),

  /* ---------------- SDCEC listing ---------------- */
  'https://www.sandiegoengineers.org/stem/scholarships': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [],
    award_names: [
      'ACEC California San Diego Scholarship', 'AIAA San Diego Scholarship', 'ASCE San Diego Scholarship', 'ASHRAE San Diego Scholarship',
      'ASM San Diego Scholarship', 'AWIS San Diego Scholarship', 'ITE San Diego Scholarship', 'SEAOSD Student Scholarship',
      'SHPE San Diego Scholarship', 'SWE San Diego Scholarship', 'WTS San Diego Scholarship',
      'AIAA National Scholarship', 'ASCE National Scholarship', 'ASHRAE High School Senior Scholarship', 'ASM Foundation Scholarship',
      'NSBE Scholarship', 'NSPE Scholarship', 'SHPE ScholarSHPE', 'SWE National Scholarship', 'WiCyS Scholarship'
    ],
    follow_links: [
      'https://acec-ca-sd.org/advocacy-initiatives/scholarships/',
      'https://www.aiaa-sd.org/reuben-h-fleet-scholarship',
      'http://www.sandiego-ymf.org/student-scholarship.html',
      'https://ashraesd.org/Student_Activities',
      'https://docs.google.com/document/d/1WCPJXaDDAe-7x3WSRk1Hy0k6Ib4QnDFz/edit?usp=sharing&ouid=114017936329090348748&rtpof=true&sd=true',
      'https://www.awissd.org/programs/scholarships/',
      'https://sandiegoite.org/scholarship',
      'https://seaosd.org/Student_Scholarships',
      'https://www.shpesd.org/students/scholarships/',
      'https://www.swesandiego.org/scholarships',
      'https://www.wtsinternational.org/chapters/san-diego/scholarships',
      'https://www.aiaa-sd.org/hs-student-scholarships',
      'https://www.asce.org/career-growth/awards-and-honors/scholarships/',
      'https://www.ashrae.org/communities/student-zone/scholarships-and-grants/high-school-senior-scholarships',
      'https://www.asmfoundation.org/students/scholarships/',
      'https://nsbe.org/scholarships/',
      'https://www.nsbe.org/k-12/education/college-scholarships',
      'https://www.nspe.org/resources/students/scholarships',
      'https://shpe.org/engage/programs/scholarshpe/',
      'https://swe.org/scholarships/',
      'https://www.wicys.org/events/wicys-2026/scholarships/'
    ],
    notes: 'Link hub from the San Diego County Engineering Council: local society section scholarships (with deadlines) and national society scholarships (with typical deadlines). No amounts or per-award eligibility, so no records. The page names societies, not awards, so award names are built from the visible society names (not from link URLs). The ASM San Diego entry links to a Google Doc application and NSBE also links a grades 9-12 scholarship page; both are included in follow_links.'
  },

  /* ---------------- SDSU portal: nursing ---------------- */
  'https://sdsu.academicworks.com/opportunities/9188': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Alumni Endowed Scholarship for Nursing', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/9188', source_url: 'https://sdsu.academicworks.com/opportunities/9188',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-04-10', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'], need_based: 'need',
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.status', 'eq', 'undergrad', 'Recipients must be undergraduates pursuing a degree in the School of Nursing')),
        G(H('academic.cip_codes', 'prefix_any', ['51.38'], 'Recipients must be undergraduates pursuing a degree in the School of Nursing')),
        G(
          H('financial.fafsa_filed', 'is_true', undefined, 'Applicants must file a Free Application for Federal Student Aid (FAFSA)'),
          F('Applicant filed a California Dream Act Application', ['financial.fafsa_filed', 'identity.citizenship'], 'or the California Dream Act Application')
        ),
        G(F('Applicant is involved with an SDSU approved woman-affiliated student organization that is open to all SDSU students', ['affiliations.professional', 'activities.extracurricular'], 'Recipients must be involved with an SDSU approved woman-affiliated student organization'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' },
        { field: 'need_based', source_quote: 'Recipients must have financial need, as determined by the SDSU Financial Aid Office' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Involvement in a specific kind of campus organization (woman-affiliated SDSU student org) has no field'],
    notes: 'Part-time undergraduates are eligible, so no enrollment rule. FAFSA or California Dream Act Application are alternatives, so they share one group.'
  },

  /* ---------------- SWE national flyer ---------------- */
  'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'SWE Scholarships', provider_org: 'Society of Women Engineers', provider_type: 'professional_society',
      apply_url: 'https://swe.org/scholarships',
      source_url: 'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf',
      amount: { min: 1000, max: 20000, renewable: true, note: 'Individual scholarships range from $1,000 to $20,000; many (not all) are renewable for 1+ years' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad', 'returning'],
      eligibility: [
        G(H('identity.gender', 'eq', 'woman', 'A person who identifies as a woman')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'returning'], 'An incoming freshman through Ph.D. student')),
        G(
          H('academic.enrollment', 'eq', 'full_time', 'Studying engineering full-time'),
          H('academic.status', 'eq', 'returning', 'exceptions made for re-entry/non-traditional students')
        ),
        G(H('academic.cip_codes', 'prefix_any', ['14', '15', '11'], 'pursuing undergraduate or graduate degrees in engineering, engineering technology, or fields related to engineering'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Individual scholarships range from $1,000 to $20,000' },
        { field: 'amount', source_quote: 'Many of the scholarships offered are renewable' },
        { field: 'deadline', source_quote: 'SWE Scholarship Applications open late fall/early winter each academic year' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: ['Program must be ABET or Washington Accord accredited (or a SWE Global Affiliate in India); no accreditation field'],
    notes: 'A 2023 national flyer for the SWE general application covering 320+ scholarships. No deadline; applications open late fall/early winter each year, so the next cycle is treated as upcoming. renewable is true at program level because the flyer says many of the scholarships are renewable (not all). Computing (CIP 11) is included because the flyer names computing programs. Some individual SWE scholarships require SWE membership, but membership is not required to apply.'
  },

  /* ---------------- Teamsters Local 542 ---------------- */
  'https://www.teamsters542.org/scholarships/': (() => {
    const src = 'https://www.teamsters542.org/scholarships/';
    const teamster = (q) => G(H('affiliations.union[].name', 'eq', TEAMSTERS, q));
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          name: 'California Hispanic Caucus Scholarship', provider_org: 'California Teamsters Hispanic Caucus', provider_type: 'union',
          apply_url: 'https://www.teamsters542.org/app/uploads/2026/07/2026-California-Teamsters-Hispanic-Caucus-Scholarship-Application.pdf', source_url: src,
          amount: { min: 0, max: 0, note: noAmount }, deadline: '2026-08-28', cycle_status: 'closed',
          geo_scope: { level: 'state', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'high school senior daughters or sons graduating with the class of 2026')),
            teamster('with an active Teamster member whose dues are current with his/her Local Union')
          ],
          provenance: [{ field: 'deadline', source_quote: 'DEADLINE TO APPLY IS AUGUST 28TH, 2026' }],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'Teamsters Scholarship Fund', provider_org: TEAMSTERS, provider_type: 'union',
          apply_url: 'http://www.teamster.org/scholarships', source_url: src,
          amount: { min: 2000, max: 2000 }, deadline: '2026-04-01', cycle_status: 'closed',
          geo_scope: { level: 'national' }, need_based: 'either',
          eligibility: [
            teamster('for children and financial dependents of Teamsters members, including BLET, BMWED, and TCRC members')
          ],
          provenance: [
            { field: 'amount', source_quote: '600 one-time $2,000 scholarships' },
            { field: 'deadline', source_quote: 'Deadline: April 1, 2026' },
            { field: 'need_based', source_quote: 'academic accomplishments, community service, letters of recommendation (if a Canadian or Puerto Rican applicant), and financial need' }
          ],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'James R. Hoffa Memorial Scholarship Fund', provider_org: 'James R. Hoffa Memorial Scholarship Fund', provider_type: 'union',
          apply_url: 'https://aim.applyists.net/JRHMSF/', source_url: src,
          amount: { min: 500, max: 10000, note: 'Academic $1,000-$10,000; vocational/training $500-$2,000' }, deadline: '2026-03-02', cycle_status: 'closed',
          geo_scope: { level: 'national' }, levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'are available to High School seniors who are the sons/daughters/financial dependents of Teamster members')),
            teamster('are available to High School seniors who are the sons/daughters/financial dependents of Teamster members')
          ],
          provenance: [
            { field: 'amount', source_quote: 'Academic scholarships ranging from $1,000 to $10,000 and Vocational/Training program scholarships ranging from $500 to $2,000' },
            { field: 'deadline', source_quote: 'The deadline for application completion is March 2, 2026' }
          ],
          verified_at: V, confidence: 0.75
        },
        {
          name: 'Teamsters Joint Council 42 Scholarship', provider_org: 'Teamsters Joint Council 42', provider_type: 'union',
          apply_url: 'https://www.teamstersjc42.com/home/scholarships/', source_url: src,
          amount: { min: 0, max: 0, note: noAmount }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'state', states: ['CA'] },
          eligibility: [
            teamster('for children of active Teamsters Union members'),
            G(H('affiliations.union[].local', 'in', ['14', '63', '166', '186', '396', '399', '481', '495', '542', '572', '630', '631', '683', '848', '896', '952', '986', '996', '1699', '1932', '2010', '2118'], 'belong to one of the following Teamster Local Unions: 14, 63, 166, 186, 396, 399, 481, 495, 542, 572, 630, 631, 683, 848, 896, 952, 986, 996, 1699, 1932, 2010 and 2118'))
          ],
          verified_at: V, confidence: 0.6
        }
      ],
      award_names: ['California Hispanic Caucus Scholarship', 'Teamsters Scholarship Fund', 'James R. Hoffa Memorial Scholarship Fund', 'Teamsters Joint Council 42 Scholarship'],
      follow_links: ['https://www.teamsters542.org/app/uploads/2026/07/2026-California-Teamsters-Hispanic-Caucus-Scholarship-Application.pdf', 'https://aim.applyists.net/JRHMSF/', 'https://www.teamstersjc42.com/home/scholarships/'],
      vocabulary_gaps: [
        'All four awards are for children/dependents of Teamster members (spouses excluded); the union fields have no relationship field, so the rule cannot say "parent is a member"',
        'The parent must be an active member with current dues'
      ],
      notes: 'Local union bulletin board listing four union scholarships. The Teamsters Scholarship Fund deadline (April 1, 2026) is listed next to the 2025-2026 fund description; used as given. Its reviewers weigh academic accomplishments and financial need together (need is a factor, not a stated requirement), so need_based is either. Union name canonicalized as International Brotherhood of Teamsters.'
    };
  })(),

  /* ---------------- CSAC Middle Class Scholarship brochure ---------------- */
  'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Middle Class Scholarship', provider_org: 'California Student Aid Commission', provider_type: 'government',
      apply_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      source_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      amount: { min: 0, max: 0, renewable: true, note: 'Not a set amount: 10% to 40% of mandatory system-wide UC/CSU tuition and fees; varies by student and state funding; eligibility limited to 4 years' },
      deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
      geo_scope: { level: 'state', states: ['CA'] }, levels: ['undergrad', 'grad'], need_based: 'need',
      eligibility: [
        G(H('geo.state', 'eq', 'CA', 'be a California resident attending a UC or CSU')),
        G(F('Applicant attends a University of California or California State University campus', ['academic.institution'], 'be a California resident attending a UC or CSU')),
        G(
          H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'be a U.S. citizen, permanent resident or have'),
          F('Applicant has AB 540 student status (attended and graduated from a California high school and meets the other AB 540 conditions)', ['identity.citizenship', 'geo.state', 'geo.high_school'], 'AB 540 student status')
        ),
        G(
          H('academic.status', 'eq', 'undergrad', 'available to eligible undergraduate and teaching credential students'),
          F('Applicant is a teaching credential student', ['academic.status', 'academic.majors', 'academic.cip_codes'], 'available to eligible undergraduate and teaching credential students')
        ),
        G(F('Applicant\'s family income and assets do not exceed $156,000', ['financial.income_band', 'financial.sai', 'financial.dependency'], 'have family income and assets not exceeding $156,000')),
        G(
          H('financial.fafsa_filed', 'is_true', undefined, 'complete the Free Application for Federal Student Aid'),
          F('Applicant completed the California Dream Act Application (CADAA)', ['financial.fafsa_filed', 'identity.citizenship'], 'California Dream Act Application (CADAA)')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'no less than 10% and no more than 40% of the mandatory system-wide tuition and fees' },
        { field: 'deadline', source_quote: 'The deadline to apply is March 2nd.' },
        { field: 'need_based', source_quote: 'meet certain income/asset and other financial aid standards' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: [
      'Must be enrolled in 6 or more units (half-time); the enrollment enum cannot express a unit minimum',
      'Must maintain satisfactory academic progress and not be in default on a student loan',
      'Must not be incarcerated',
      'Eligibility is limited to 4 years'
    ],
    notes: 'State program brochure. Deadline is "March 2nd" with no year, so null/annual_estimate; the FAFSA/CADAA window opens October 1, so the next cycle is upcoming. The brochure has no separate apply link, so apply_url is the brochure itself (application is through FAFSA/CADAA, encoded as one either-or group). Teaching credential students are post-baccalaureate, so grad is included in levels alongside undergrad. Amounts are percentages of tuition, not dollars.'
  }
};

export const meta = {
  'https://www.causesandiego.org/scholarship/': { unsure: true, reasons: ['The $15,000 is a pool for 5 winners; recording it as an "up to" per-award max is a defensible alternative'] },
  'https://www.hbaie.com/Scholarship': { unsure: true, reasons: ['Page has only an application link; a record with all-unknown fields is a defensible alternative to no record'] },
  'https://houston.swe.org/student-scholarships/': { unsure: true, reasons: ['Letters of recommendation are required but no count is given; 1 is a lower bound', 'Whether "engineering-related" should include engineering technology (CIP 15)', 'Middle and high school awards may be recognitions rather than scholarships'] },
  'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf': { unsure: false, reasons: ['Submitting existing SAT/ACT scores is treated as the test format'] },
  'https://nesa.org/nesa-news/spread-the-word/': { unsure: false, reasons: ['NESA membership is a named organization, so a hard member_org rule fits'] },
  'https://rotarysacramento.com/our-foundations/scholarships/': { unsure: true, reasons: ['Encoding "not the child of a Rotarian" as a fuzzy rule versus a vocabulary gap is a judgment call', 'Snyder lists financial need only as a consideration; need_based either versus need is debatable', 'High school levels for Knox and Snyder are inferred from incoming/current student wording'] },
  'https://www.sandiegoengineers.org/stem/scholarships': { unsure: true, reasons: ['The page names societies, not awards, so award names are constructed'] },
  'https://sdsu.academicworks.com/opportunities/9188': { unsure: false, reasons: ['FAFSA and Dream Act Application are stated alternatives'] },
  'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf': { unsure: true, reasons: ['Only "many" of the scholarships are renewable, so a program-level renewable flag is a judgment call'] },
  'https://www.teamsters542.org/scholarships/': { unsure: true, reasons: ['Financial need is a review factor, not a stated requirement; either versus need versus unset is debatable'] },
  'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf': { unsure: true, reasons: ['Mapping teaching credential students to grad level is an inference', 'Filing FAFSA/CADAA is the application route; treating it as an eligibility rule is a judgment call'] }
};
