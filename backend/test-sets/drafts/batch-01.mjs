// Batch 1 draft labels (25 dev pages). Drafted by Claude from the snapshot text; NOT yet reviewed by a human.
// Conventions used in every draft (please challenge any you disagree with):
//  - Amount not stated -> min 0, max 0 with a note. "Up to $X" -> min 0, max X. (The contract has no "unknown" amount.)
//  - Deadline not stated -> null and cycle_status "unknown". A stated past date (today is 2026-09-29) -> "closed".
//  - essay_words is the limit for ONE essay, not the total.
//  - When a page gives no separate apply link, apply_url is the page itself.
//  - Requirements the vocabulary cannot express go in vocabulary_gaps, not into a rule.
//  - Evaluation criteria (what judges look for) are not eligibility, so they are not rules.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const SDSU = 'San Diego State University';
const noAmount = 'Amount not stated on the page (to be determined by the scholarship committee)';

export default {
  /* ---------------- SDSU portal pages ---------------- */
  'https://sdsu.academicworks.com/opportunities/16050': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Dryer Family Endowed Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/16050', source_url: 'https://sdsu.academicworks.com/opportunities/16050',
      amount: { min: 0, max: 0, note: noAmount }, deadline: '2026-09-04', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['grad'],
      effort: { essay_words: 150 },
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.enrollment', 'in', ['full_time', 'part_time'], 'Recipients must be enrolled at least part-time to remain eligible for this scholarship')),
        G(H('academic.gpa', 'gte', 2.67, 'Recipients must have a minimum overall cumulative GPA of 2.67 out of 4.00')),
        G(H('academic.cip_codes', 'prefix_any', ['13', '42.28'], 'Recipients must be pursuing one of the following degrees in the College of Education')),
        G(H('academic.status', 'eq', 'grad', 'Recipients must be pursuing one of the following degrees in the College of Education'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '09/04/2026' },
        { field: 'effort', source_quote: '150 words per essay prompt' }
      ],
      verified_at: V, confidence: 0.9
    }],
    notes: 'Credential and master\'s programs are mapped to academic.status = grad (judgment call). Three essay prompts of 150 words each; essay_words is the per-essay limit.'
  },

  'https://sdsu.academicworks.com/opportunities/15966': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Jim and Lisa Givens Accountancy Endowed Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/15966', source_url: 'https://sdsu.academicworks.com/opportunities/15966',
      amount: { min: 0, max: 0, note: noAmount }, deadline: '2026-09-04', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.gpa', 'gte', 3.0, 'Recipient(s) must have a minimum overall cumulative GPA of 3.00 out of 4.00')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Recipient(s) must be enrolled full-time')),
        G(H('academic.cip_codes', 'prefix_any', ['52.03'], 'Recipient(s) must be majoring in Accounting in the Fowler College of Business')),
        G(F('Applicant has applied to or is enrolled in the BMACC (bachelor\'s/master\'s accountancy) program', ['academic.majors', 'academic.concentration'], 'Recipient(s) must have applied to or be enrolled in the BMACC program')),
        G(F('Applicant is involved in an SDSU cultural center or recognized student organization such as the Black Business Society, ALPFA or Hispanic Business Student Association', ['affiliations.professional', 'activities.extracurricular'], 'Recipient(s) must be involved in one or more of the following SDSU Cultural Centers or SDSU Recognized Student Organizations'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '09/04/2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Membership in a specific campus organization or cultural center (no field for campus organizations)'],
    notes: 'BMACC and organization involvement are encoded as fuzzy rules because the vocabulary has no field for a named degree program or campus club.'
  },

  'https://sdsu.academicworks.com/opportunities/15812': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'SDSU Memorial Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/15812', source_url: 'https://sdsu.academicworks.com/opportunities/15812',
      amount: { min: 0, max: 0, note: noAmount }, deadline: '2026-09-04', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('affiliations.professional', 'contains_any', ['honors_program'], 'Recipients must be Weber Honors College students')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Recipients must be enrolled full-time to remain eligible for this scholarship')),
        G(H('academic.gpa', 'gte', 3.2, 'students are required to maintain a 3.2 GPA'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '09/04/2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    notes: 'Weber Honors College membership is mapped to affiliations.professional = honors_program. The 3.2 GPA is a Honors College graduation requirement quoted on the page; treated as the GPA rule.'
  },

  'https://sdsu.academicworks.com/opportunities/16221': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'SDSU Veterans Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/16221', source_url: 'https://sdsu.academicworks.com/opportunities/16221',
      amount: { min: 0, max: 0, renewable: true, note: noAmount }, deadline: '2026-07-31', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      effort: { essay_words: 500 },
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('affiliations.military[].who', 'eq', 'self', 'veterans of the Armed Forces of the United States of America who have been awarded an Honorable Discharge')),
        G(H('affiliations.military[].status', 'in', ['veteran', 'retired'], 'veterans of the Armed Forces of the United States of America who have been awarded an Honorable Discharge')),
        G(H('academic.gpa', 'gte', 2.0, 'minimum overall cumulative GPA of 2.00 out of 4.00')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Recipient must be enrolled and maintain full-time status'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '07/31/2026' },
        { field: 'effort', source_quote: 'Submit an essay of approximately 500 words' }
      ],
      verified_at: V, confidence: 0.9
    }],
    vocabulary_gaps: ['Honorable discharge is required but the vocabulary has no discharge-status field'],
    notes: 'Open to all majors and class levels, so no level or major rules.'
  },

  /* ---------------- Other university-portal pages ---------------- */
  'https://sfsu.academicworks.com/opportunities/4895': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Coca-Cola Scholars Foundation Scholarship', provider_org: 'Coca-Cola Scholars Foundation', provider_type: 'private_foundation',
      apply_url: 'https://sfsu.academicworks.com/opportunities/4895', source_url: 'https://sfsu.academicworks.com/opportunities/4895',
      amount: { min: 20000, max: 20000 }, deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'merit',
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Must be current high school or home-school senior anticipating graduation')),
        G(H('academic.gpa', 'gte', 3.0, '3.0 minimum unweighted GPA at the end of junior year of high school')),
        G(H('academic.gpa_scale', 'eq', 'unweighted', '3.0 minimum unweighted GPA at the end of junior year of high school')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident', 'refugee_asylee'], 'US Nationals, US Permanent Resident, Refugee, Asylee, Cuban-Haitian Entrant, and Humanitarian Parolee are also eligible')),
        G(F('Applicant is NOT a child or grandchild of an employee, officer or owner of a Coca-Cola bottling company, The Coca-Cola Company or its divisions or subsidiaries', ['affiliations.employer[].name'], 'Applicants may not be children or grandchildren of employees, officers or owners of Coca-Cola bottling companies, The Coca-Cola Company, Company divisions or subsidiaries')),
        G(F('Applicant demonstrates leadership and commitment to community', ['activities.leadership', 'activities.extracurricular'], 'Demonstrate leadership. Commitment to community.'))
      ],
      provenance: [
        { field: 'amount', source_quote: '$20,000' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Not a Requirement' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Cuban-Haitian entrants and humanitarian parolees are eligible but the citizenship field has no value for them (they fall under "other")',
      'Exclusion by relative\'s employer: a "not in" rule over an array field cannot express "no element matches"'
    ],
    notes: 'The Deadline heading on the page is empty, so deadline is null. The page lists 150 awards; not represented in the contract. The page is inconsistent: criterion 4 lists many statuses but a later line says "Citizenship: US Citizen/Perm Res"; the broader criterion is used.'
  },

  'https://ucsd.academicworks.com/opportunities/5848': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Gregory A. Chauncey and Naomi C. Broering Endowed Engineering Scholarship Fund for Combat Veterans',
      provider_org: 'University of California, San Diego', provider_type: 'university',
      apply_url: 'https://ucsd.academicworks.com/opportunities/5848', source_url: 'https://ucsd.academicworks.com/opportunities/5848',
      amount: { min: 0, max: 3000 }, deadline: '2026-04-03', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'],
      eligibility: [
        G(H('academic.institution', 'eq', 'University of California, San Diego', 'UC San Diego Scholarships')),
        G(H('academic.status', 'eq', 'undergrad', 'Undergraduate student veterans')),
        G(H('academic.cip_codes', 'prefix_any', ['14'], 'Jacobs School of Engineering')),
        G(H('affiliations.military[].who', 'eq', 'self', 'Undergraduate student veterans')),
        G(H('affiliations.military[].branch', 'in', ['navy', 'marines'], 'who served in the U.S. Navy or U.S. Marine Corps'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Up to $3,000' },
        { field: 'deadline', source_quote: '04/03/2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: [
      'Combat-zone assignment is a preference, not a requirement, and the vocabulary has no combat-service field',
      'Same-person matching: branch and "self" must belong to the same military[] entry (mismatch #4 in the contract README)'
    ],
    notes: 'Engineering is inferred from "Jacobs School of Engineering" and mapped to CIP family 14.'
  },

  /* ---------------- Professional societies, foundations ---------------- */
  'https://losangeles.swe.org/swe-la-collegiate-scholarships/': (() => {
    const base = {
      provider_org: 'Society of Women Engineers, Los Angeles Section', provider_type: 'professional_society',
      apply_url: 'https://docs.google.com/forms/d/e/1FAIpQLSePtbt4yhWbLtJey8vxlPzN88MFlmcbHslz_5ydNUhAnqA_ow/viewform',
      source_url: 'https://losangeles.swe.org/swe-la-collegiate-scholarships/',
      amount: { min: 0, max: 0, note: 'Amounts are not stated on the page' },
      deadline: '2026-03-13', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'],
      effort: { essay_words: 500, recs_required: 0 },
      provenance: [
        { field: 'deadline', source_quote: 'All applications are due Friday, March 13, 2026' },
        { field: 'effort', source_quote: 'The length of each essay is limited to 500 words' }
      ],
      verified_at: V, confidence: 0.7
    };
    const common = [
      G(H('academic.institution', 'in', ['California State Polytechnic University, Pomona', 'California Institute of Technology', 'California State University, Los Angeles', 'California State University, Northridge', 'Harvey Mudd College', 'Loyola Marymount University', 'University of California, Los Angeles', 'University of Southern California'],
        'collegiate SWE section affiliated with the Los Angeles professional SWE section (Cal Poly Pomona, Caltech, Cal State LA, Cal State Northridge, Harvey Mudd, Loyola Marymount, UCLA, or USC)')),
      G(H('academic.status', 'eq', 'undergrad', 'currently be enrolled as a full-time sophomore, junior, or senior in an engineering curriculum')),
      G(H('academic.year', 'between', [2, 4], 'currently be enrolled as a full-time sophomore, junior, or senior in an engineering curriculum')),
      G(H('academic.enrollment', 'eq', 'full_time', 'currently be enrolled as a full-time sophomore, junior, or senior in an engineering curriculum')),
      G(H('academic.cip_codes', 'prefix_any', ['14'], 'in an engineering curriculum leading to a bachelor')),
      G(H('affiliations.professional', 'contains_any', ['swe'], 'The applicant must be a paid SWE student member in good standing'))
    ];
    const award = (name, gpa, quote, extra = []) => ({ ...base, name, eligibility: [...common, G(H('academic.gpa', 'gte', gpa, quote)), ...extra] });
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        award('SWE Endowment Scholarship', 3.0, 'Must have a minimum 3.0 GPA'),
        award('Sharon Cascadden Memorial Scholarship', 3.0, 'Must have a minimum 3.0 GPA'),
        award('SWE-LA Section Scholarship', 3.2, 'Must have a minimum 3.2 GPA', [G(H('identity.gender', 'eq', 'woman', 'ONLY open to students who identify as women'))]),
        award('SWE-LA Volunteer Scholarship', 2.5, 'Must have a minimum 2.5 GPA', [G(F('Applicant has demonstrated strong community service and/or outreach', ['activities.extracurricular', 'activities.leadership'], 'Must have demonstrated strong community service and/or outreach'))])
      ],
      award_names: ['SWE Endowment Scholarship', 'Sharon Cascadden Memorial Scholarship', 'SWE-LA Section Scholarship', 'SWE-LA Volunteer Scholarship', 'SWE National Scholarships'],
      vocabulary_gaps: ['Membership status "paid SWE student member" is approximated by affiliations.professional = swe'],
      notes: 'Hint said single, but the page describes four separately named section awards that share eligibility and differ in GPA, gender and service rules, so it is a listing. SWE National Scholarships are only mentioned with a link, not described. Sharon Cascadden gives priority to re-entry students and to CSUN/UCLA; that is a preference and is not encoded.'
    };
  })(),

  'https://www.unh.edu/fellowships-office/resource/american-chemical-society-undergraduate-scholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'American Chemical Society Undergraduate Scholarship', provider_org: 'American Chemical Society', provider_type: 'professional_society',
      apply_url: 'https://www.unh.edu/fellowships-office/resource/american-chemical-society-undergraduate-scholarship',
      source_url: 'https://www.unh.edu/fellowships-office/resource/american-chemical-society-undergraduate-scholarship',
      amount: { min: 0, max: 5000 }, deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad'],
      eligibility: [
        G(H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Be U.S. citizen or permanent U.S. resident')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad'], 'be a graduating high school senior or college freshman, sophomore or junior')),
        G(H('academic.year', 'lte', 3, 'be a graduating high school senior or college freshman, sophomore or junior')),
        G(H('academic.enrollment', 'eq', 'full_time', 'full-time student at a high school or accredited college, university, or community college')),
        G(H('academic.gpa', 'gte', 3.0, 'Grade Point Average 3.0')),
        G(H('academic.cip_codes', 'prefix_any', ['40.05', '26.02', '14.07', '41.03'], 'intending to or already majoring in chemistry, biochemistry, chemical engineering or a chemically-related science')),
        G(F('Applicant is planning a career in the chemical sciences', ['career.field', 'academic.majors'], 'be planning a career in the chemical sciences'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Awards of up to $5,000 are given to qualified students' },
        { field: 'deadline', source_quote: 'Deadline: March' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [],
    notes: 'This is UNH\'s summary of an ACS award (duplicate-test source). The deadline is only "March" with no year, so deadline is null. academic.year is undefined for high school seniors, so the year rule may wrongly exclude them; the matcher should treat it as unknown.'
  },

  'https://www.aspe.org/SteeleScholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Alfred Steele Scholarship', provider_org: 'American Society of Plumbing Engineers', provider_type: 'professional_society',
      apply_url: 'https://www.aspe.org/SteeleScholarship', source_url: 'https://www.aspe.org/SteeleScholarship',
      amount: { min: 500, max: 5000, note: 'Maximum $5,000 in total per year across all recipients, awarded in $500 increments' },
      deadline: null, cycle_status: 'unknown', geo_scope: { level: 'national' },
      eligibility: [
        G(F('Applicant is an ASPE member or an immediate family member of one', ['affiliations.professional'], 'ASPE members and their immediate families')),
        G(H('academic.gpa', 'gte', 3.0, 'a GPA of 3.0 or higher')),
        G(H('academic.enrollment', 'eq', 'full_time', 'on a full-time basis (minimum 12 credit hours)')),
        G(H('academic.cip_codes', 'prefix_any', ['14'], 'enrolled in an engineering program'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'ASPE will bestow a maximum of $5,000 (U.S.) scholarships in any one application year' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Family membership in an organization ("members and their immediate families")'],
    notes: 'No deadline on the page. The page also announces a 2026 recipient from the San Diego Chapter; that is news, not a rule.'
  },

  'https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Burger King Scholars', provider_org: 'Burger King Foundation', provider_type: 'private_foundation',
      apply_url: 'https://scholarshipamerica.org/scholarship/burgerking/', source_url: 'https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars',
      amount: { min: 1000, max: 60000 }, deadline: '2026-12-15', cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, need_based: 'either',
      eligibility: [
        G(
          H('academic.status', 'eq', 'hs_senior', 'deserving high school seniors and Burger King'),
          H('affiliations.employer[].name', 'in', ['Burger King'], 'deserving high school seniors and Burger King'),
          H('activities.work[].employer', 'in', ['Burger King'], 'deserving high school seniors and Burger King')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'Scholarships range from $1,000 to $60,000' },
        { field: 'deadline', source_quote: 'will be open until we receive 30,000 applications or until December 15th, 2026' },
        { field: 'need_based', source_quote: 'financial need' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['The window can close early once 30,000 applications arrive, so the deadline is only a latest date'],
    notes: 'Eligible group is high school seniors OR Burger King employees and their families (one OR-group). The 2027-2028 cycle opens 2026-10-15, hence cycle_status upcoming. The three WHOPPER awards ($60,000) are a sub-category and are not split out.'
  },

  /* ---------------- Government ---------------- */
  'https://www.truman.gov/apply/applying/eligibility': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Harry S. Truman Scholarship', provider_org: 'Harry S. Truman Scholarship Foundation', provider_type: 'government',
      apply_url: 'https://www.truman.gov/apply', source_url: 'https://www.truman.gov/apply/applying/eligibility',
      amount: { min: 0, max: 0, note: 'Amount not stated on this page (see the Bulletin of Information page)' }, deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, service_obligation: true,
      eligibility: [
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national'], 'US Citizens, US National residents of American Samoa, or expecting their citizenship by the date of the award')),
        G(H('academic.status', 'eq', 'undergrad', 'Currently enrolled at a US-based accredited institution')),
        G(F('Applicant is in their penultimate year of school (or final year if graduating in three years or fewer)', ['academic.year', 'academic.grad_date'], 'In their penultimate year of school (for candidates graduating in four years or more) or in their final year of school (for candidates graduating in three years or fewer)')),
        G(F('Applicant plans to attend graduate school in pursuit of a career in public service', ['career.field', 'career.sectors'], 'Planning to attend graduate school in pursuit of a career in public service'))
      ],
      provenance: [
        { field: 'service_obligation', source_quote: 'File an employment report for three of seven years after graduation from a Foundation funded graduate program' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: [
      'Requires nomination by the applicant\'s institution (not something a profile can answer)'
    ],
    notes: 'Same award as the Bulletin of Information page; this page lacks amount and deadline. Duplicate/overlap test with the bulletin page in this batch.'
  },

  'https://www.truman.gov/apply/applying/bulletin-information': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Harry S. Truman Scholarship', provider_org: 'Harry S. Truman Scholarship Foundation', provider_type: 'government',
      apply_url: 'https://www.truman.gov/apply', source_url: 'https://www.truman.gov/apply/applying/bulletin-information',
      amount: { min: 0, max: 30000 }, deadline: '2027-02-02', cycle_status: 'open',
      geo_scope: { level: 'national' }, levels: ['undergrad'], service_obligation: true, need_based: 'merit',
      eligibility: [
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national'], 'a United States citizen or a United States national from American Samoa')),
        G(H('academic.status', 'eq', 'undergrad', 'a full-time junior-level student at a four-year institution pursuing a bachelor\'s degree during the 2026-2027 academic year')),
        G(H('academic.enrollment', 'eq', 'full_time', 'a full-time junior-level student at a four-year institution pursuing a bachelor\'s degree during the 2026-2027 academic year')),
        G(H('academic.year', 'eq', 3, 'a full-time junior-level student at a four-year institution pursuing a bachelor\'s degree during the 2026-2027 academic year')),
        G(F('Applicant has an extensive record of public and community service', ['activities.extracurricular', 'activities.leadership'], 'has an extensive record of public and community service')),
        G(F('Applicant has outstanding leadership potential and communication skills', ['activities.leadership'], 'has outstanding leadership potential and communication skills')),
        G(F('Applicant is committed to a career in government or elsewhere in public service', ['career.field', 'career.sectors'], 'is committed to a career in government or elsewhere in public service, as defined by the Foundation'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Up to $30,000 toward a public service-related graduate degree' },
        { field: 'deadline', source_quote: 'Deadline for receipt of nominations: February 2, 2027' },
        { field: 'service_obligation', source_quote: 'Scholars are required to work in public service for three of the seven years following completion of a Foundation-funded graduate degree program' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: [
      'Class rank ("in the upper quarter of their class") has no field',
      'Requires nomination by the Truman Faculty Representative at the applicant\'s institution'
    ],
    notes: 'The deadline is for nominations by the institution, not for the student. Award is for graduate school, paid after undergraduate study; still modeled as one scholarship. Duplicate/overlap test with the Eligibility page in this batch.'
  },

  /* ---------------- Bar and law ---------------- */
  'https://www.cwl.org/Nancy-E.OMalley-Scholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Nancy E. O\'Malley Scholarship', provider_org: 'California Women Lawyers', provider_type: 'bar_association',
      apply_url: 'https://www.cwl.org/Nancy-E.OMalley-Scholarship', source_url: 'https://www.cwl.org/Nancy-E.OMalley-Scholarship',
      amount: { min: 5000, max: 5000 }, deadline: '2026-09-25', cycle_status: 'closed',
      geo_scope: { level: 'state', states: ['CA'] }, levels: ['grad'], need_based: 'need',
      effort: { recs_required: 1 },
      eligibility: [
        G(H('affiliations.professional', 'contains_any', ['California Women Lawyers'], 'Current membership in CWL')),
        G(H('academic.status', 'eq', 'grad', 'Be currently enrolled in a law school accredited by the Committee of Bar Examiners of the State of California')),
        G(H('academic.cip_codes', 'prefix_any', ['22.01'], 'Be currently enrolled in a law school accredited by the Committee of Bar Examiners of the State of California')),
        G(F('Applicant demonstrates a commitment to issues affecting women and/or children in the community', ['activities.extracurricular', 'activities.leadership', 'career.field'], 'Demonstrate a commitment to issues affecting women and/or children in the community'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'One $5,000 scholarship will be awarded' },
        { field: 'deadline', source_quote: 'the application deadline will be September 25, 2026, at 5 p.m.' },
        { field: 'need_based', source_quote: 'Demonstrate financial need' },
        { field: 'effort', source_quote: 'Minimum of one letter of recommendation (maximum of three letters)' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Law school class rank ("top fifty percent of their law school class") has no field'],
    notes: 'Deadline was four days before the snapshot date, so cycle_status is closed. Personal statement length is not given, so essay_words is omitted.'
  },

  'https://www.cwsl.edu/2026_oc_abota_scholarship.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'OC ABOTA Fall 2026 Scholarship Awards', provider_org: 'Orange County Chapter, American Board of Trial Advocates', provider_type: 'bar_association',
      apply_url: 'https://www.cwsl.edu/2026_oc_abota_scholarship.pdf', source_url: 'https://www.cwsl.edu/2026_oc_abota_scholarship.pdf',
      amount: { min: 5000, max: 5000, note: 'Stated as $5,000 for second- and third-year law students' }, deadline: '2026-10-06', cycle_status: 'open',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['grad'],
      effort: { formats: ['interview'] },
      eligibility: [
        G(H('academic.cip_codes', 'prefix_any', ['22.01'], 'a school of law that is accredited by the State Bar of California')),
        G(H('academic.year', 'between', [2, 3], 'must be in the second or third year of law school')),
        G(
          H('geo.county', 'eq', 'Orange County, CA', 'must be a resident of Orange County'),
          F('Applicant is enrolled at a law school located in Orange County', ['academic.institution'], 'proof of enrollment in an Orange County Law School')
        ),
        G(H('academic.gpa', 'gte', 3.0, 'grade point average of at least 3.0 for the past academic year'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'The recipient will receive $5,000' },
        { field: 'deadline', source_quote: 'APPLICATION DEADLINE: October 6th, 2026' },
        { field: 'effort', source_quote: 'The applicant will participate in an interview with members of the OC ABOTA Board' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Good standing at a law school is required (no standing field)'],
    notes: 'Residency OR enrollment in an Orange County law school is one OR-group. Essay is required but no length is given. The first part of the PDF is a list of past presidents (noise).'
  },

  'https://www.cwsl.edu/2025_sdlrla_bar_stipend_fillable.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'SDLRLA Scholarship Fund 2025 Bar Stipend', provider_org: 'San Diego La Raza Lawyers Association Scholarship Fund', provider_type: 'bar_association',
      apply_url: 'https://www.cwsl.edu/2025_sdlrla_bar_stipend_fillable.pdf', source_url: 'https://www.cwsl.edu/2025_sdlrla_bar_stipend_fillable.pdf',
      amount: { min: 0, max: 0, note: 'Amount not stated on the form' }, deadline: '2025-04-06', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, need_based: 'need',
      eligibility: [
        G(H('geo.county', 'in', ['San Diego County, CA', 'Imperial County, CA'], 'Bar stipend applicants must have ties to San Diego or Imperial Counties')),
        G(H('academic.cip_codes', 'prefix_any', ['22.01'], 'graduated (or be on track to graduate) from a J.D. program at an ABA accredited law school')),
        G(F('Applicant has contributed to advancing the Latino/a or Spanish-speaking community', ['identity.languages[].lang', 'activities.extracurricular', 'activities.leadership'], 'who have contributed to advancing the Latino/a or Spanish-speaking community'))
      ],
      provenance: [
        { field: 'deadline', source_quote: 'on or before Sunday, April 6, 2025, at 11:59 p.m.' },
        { field: 'need_based', source_quote: 'community service, financial need, and academic achievement' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: [
      'Must be sitting for a specific bar exam sitting (July 2025 or February 2026)',
      '"Ties to" a county is looser than residence; mapped to geo.county'
    ],
    notes: 'A 2025 cycle document, stale in 2026 (stale-document test). Recipients need not be Latino/a. The form part of the PDF is questions only.'
  },

  /* ---------------- Local nonprofits ---------------- */
  'https://www.rbrotary.org/page/youth-services-projects': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Rotary Club of Rancho Bernardo High School Scholarships', provider_org: 'Rotary Club of Rancho Bernardo', provider_type: 'fraternal',
      apply_url: 'https://www.rbrotary.org/page/youth-services-projects', source_url: 'https://www.rbrotary.org/page/youth-services-projects',
      amount: { min: 1500, max: 1500 }, deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'school_district' }, levels: ['hs_senior'],
      eligibility: [
        G(H('geo.high_school', 'in', ['Rancho Bernardo High School', 'Del Norte High School'], 'awards scholarships annually to selected students in the community attending Rancho Bernardo High School and Del Norte High School')),
        G(H('academic.status', 'eq', 'hs_senior', 'To be eligible, a student must be a graduating senior during the current school year'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Four (4) $1500 Scholarships for each school are awarded' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['One of the four awards per school is reserved for a student with a significant disability (a separate award, not encoded)'],
    notes: 'The page is mostly other Rotary youth programs (LEAD, RYLA, speech contest, MusiCamp, music competition); only the High School Scholarships section is a scholarship. Modeled as one scholarship. No deadline given.'
  },

  'https://www.sdef.org/': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      {
        name: 'San Diego Education Fund Teacher Scholarship', provider_org: 'San Diego Education Fund', provider_type: 'nonprofit',
        apply_url: 'https://www.sdef.org/', source_url: 'https://www.sdef.org/',
        amount: { min: 17000, max: 17000, renewable: true, note: 'Four undergraduate years at $3,000 per year plus a fifth year at $5,000 for a credential' },
        deadline: null, cycle_status: 'closed', geo_scope: { level: 'school_district' }, need_based: 'need',
        eligibility: [
          G(H('geo.school_district', 'eq', 'San Diego Unified School District', 'low-income San Diego Unified School District graduates')),
          G(F('Applicant dreams of becoming a teacher', ['career.field', 'academic.majors'], 'target students who dream of becoming teachers or STEM professionals'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'covers four undergraduate years at $3,000 per year and a fifth year to secure a credential at $5,000' },
          { field: 'deadline', source_quote: 'The 2026 application period has closed' }
        ],
        verified_at: V, confidence: 0.7
      },
      {
        name: 'San Diego Education Fund STEM Scholarship', provider_org: 'San Diego Education Fund', provider_type: 'nonprofit',
        apply_url: 'https://www.sdef.org/', source_url: 'https://www.sdef.org/',
        amount: { min: 14000, max: 14000, renewable: true, note: '$3,500 per year for four years' },
        deadline: null, cycle_status: 'closed', geo_scope: { level: 'school_district' }, need_based: 'need',
        eligibility: [
          G(H('geo.school_district', 'eq', 'San Diego Unified School District', 'low-income San Diego Unified School District graduates')),
          G(F('Applicant dreams of becoming a STEM professional', ['career.field', 'academic.majors'], 'target students who dream of becoming teachers or STEM professionals'))
        ],
        provenance: [
          { field: 'amount', source_quote: '$3,500 per year for four years' },
          { field: 'deadline', source_quote: 'The 2026 application period has closed' }
        ],
        verified_at: V, confidence: 0.7
      }
    ],
    award_names: ['San Diego Education Fund Teacher Scholarship', 'San Diego Education Fund STEM Scholarship'],
    vocabulary_gaps: ['Whether the school-district rule means graduates or current students is ambiguous on the page'],
    notes: 'Home page describing two scholarship programs. The application link is not in the text, so apply_url is the page. The 2026 window is closed and the next date is not given.'
  },

  /* ---------------- Listing pages that cannot be turned into records ---------------- */
  'https://www.ebcf.org/grants/scholarship-opportunities/': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [],
    award_names: ['Florence Baldwin Scholarship', 'Oakland High School Mathematics Club Scholarship', 'Lam Research Core Values Scholarship', 'ACUMEN Scholarship', 'Alice B. Hansen Scholarship', 'Leggo Scholarship', 'Margaret McElhinnie Rotanzi Scholarship', 'Booker T. Washington Scholarship', 'Thomas J. Sweeney Scholarship', 'Fly Me To The Foon Scholarship'],
    vocabulary_gaps: [],
    notes: 'Ten named scholarship funds are listed with a "Details" toggle, but no eligibility, amount or deadline appears in the snapshot text and no links were captured, so no records can be extracted. Page says 11 active funds; only ten names appear (Oakland High School Mathematics Club Scholarship has no Details toggle). This is the "fetched page hides the content" case.'
  },

  'https://fas.ucsd.edu/types/scholarships/index.html': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [],
    award_names: ['Hope Scholars Program', 'Middle Class Scholarship', 'Chancellor\'s Scholarships for Entering First-Year', 'Regents Scholarships for Entering Freshmen', 'The San Diego Foundation'],
    vocabulary_gaps: [],
    notes: 'A hub of scholarship categories and outside resources (including for-profit search engines). Only the named programs are listed as award_names; the rest are categories, not awards. Individual award details are on other pages and their URLs were not captured in the text.'
  },

  /* ---------------- Not scholarship pages ---------------- */
  'https://www.nusnasd.org/scholarships.html': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Hint said single, but the snapshot is a website-builder placeholder ("The DEMO version only includes 4 pages"). There is no scholarship content. Tests that the extractor does not invent an award from a URL that says "scholarships".'
  },

  'https://www.dpkfoundation.org/apply': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'AMBIGUOUS, please decide. It is an application form for "Educational Funding" from a charitable foundation, but the page has no eligibility, amount, deadline or award name, so nothing can be extracted. I labeled it not_scholarship; a defensible alternative is single with an unextractable record. Note the form asks for Social Security and driver\'s license numbers.'
  },

  'https://www.ebcf.org/grants/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Grants to organizations, mostly by invitation. It only points to the Scholarship Opportunities page.'
  },

  'https://sdpride.org/195000-2/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'A news post about 2024 grant recipients. "Scholarship/Solidarity Fund" appears only as a grantee name (InterPride).'
  },

  'https://www.burgerkingfoundation.org/blog-posts/from-dreams-to-reality-2024-burger-king-sm-scholars-recipients-announced': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Recipient announcement from April 2024. It repeats award amounts and the Oct 15 to Dec 15 window, but it is news about a past cycle, not an application page.'
  },

  'https://www.unionplus.org/benefits/education/college-program/bachelors-degree': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Hint said hard. It is a tuition-discount program for union families (Empire State, Rowan, WGU and others). It mentions "Scholarships available" for WGU only in passing. Borderline: a discount, not an award. Decide if you want discount programs counted as scholarships.'
  }
};
