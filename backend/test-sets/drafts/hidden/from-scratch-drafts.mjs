// From-scratch blind draft labels (30 pages). Drafted by Claude from the snapshot text only.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });

export default {
  'https://www.bgca.org/programs/youth-of-the-year/scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Boys & Girls Clubs Youth of the Year Scholarships (Alumni & Friends Scholarship Fund)',
      provider_org: 'Boys & Girls Clubs of America', provider_type: 'nonprofit',
      apply_url: 'https://www.bgca.org/programs/youth-of-the-year/scholarships/', source_url: 'https://www.bgca.org/programs/youth-of-the-year/scholarships/',
      amount: { min: 2500, max: 50000, note: 'State winners $2,500; Regional winners $20,000; National Youth of the Year $50,000' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' },
      eligibility: [
        G(F('Applicant is a Boys & Girls Club teen participating in the Youth of the Year program', ['affiliations.member_org[].name', 'activities.extracurricular', 'activities.leadership'], 'Club teens expand their leadership skills through the Youth of the Year program'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'State Youth of the Year winners receive $2,500' },
        { field: 'amount', source_quote: 'The National Youth of the Year receives $50,000' }
      ],
      verified_at: V, confidence: 0.55
    }],
    vocabulary_gaps: ['Awards go only to state, regional and national Youth of the Year winners/finalists; there is no direct application and no field for competition placement'],
    notes: 'Page describes one scholarship fund with tiered awards tied to the Youth of the Year competition. No application process, eligibility details or deadline on the page. Could arguably be not_scholarship (a recognition program, not an application), but students do receive scholarships by participating.'
  },

  'https://sandiegolions.org/community-service/downtown-san-diego-lions-club-scholarship-fund/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Downtown San Diego Lions Club Scholarship', provider_org: 'Downtown San Diego Lions Club', provider_type: 'fraternal',
      apply_url: 'https://sandiegolions.org/community-service/downtown-san-diego-lions-club-scholarship-fund/', source_url: 'https://sandiegolions.org/community-service/downtown-san-diego-lions-club-scholarship-fund/',
      amount: { min: 2000, max: 2000 }, deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'unknown',
      geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'], need_based: 'need',
      effort: { essay_words: null },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'available to graduating seniors from the following high schools')),
        G(H('geo.high_school', 'in', ['Hoover High School', 'Garfield High School', 'Kearny High School', 'Lincoln High School', 'Monarch High School', 'Twain High School', 'Gompers High School', 'San Diego High School'], 'available to graduating seniors from the following high schools within the club’s geographical area')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Applicants must be U.S. citizens or legal residents with an alien registration card'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Each scholarship recipient will receive $2,000' },
        { field: 'deadline', source_quote: 'Applications are available through school counselors starting in early February' },
        { field: 'need_based', source_quote: 'While financial need and a sufficient grade point average must be demonstrated' },
        { field: 'effort', source_quote: 'Applicants must write an essay explaining why they deserve the scholarship' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Award may only be used at a community college or vocational school (no field for intended institution type)', 'A "sufficient grade point average" is required but no number is given'],
    notes: 'No deadline stated; applications become available through counselors in early February. Community service and merit are selection criteria, not encoded. Essay length not given.'
  },

  'https://scholarshipamerica.org/scholarship/amazonfutureengineer/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Amazon Future Engineer Scholarship', provider_org: 'Amazon (administered by Scholarship America)', provider_type: 'employer',
      apply_url: 'https://scholarshipamerica.org/scholarship/amazonfutureengineer/', source_url: 'https://scholarshipamerica.org/scholarship/amazonfutureengineer/',
      amount: { min: 0, max: 40000, renewable: true, note: 'Up to $40,000; last-dollar amount varies with financial need; renewable up to three years' },
      deadline: '2026-01-22', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'need',
      effort: { recs_required: 1 },
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'You’re a high school senior with a 2.3 cumulative GPA')),
        G(H('academic.gpa', 'gte', 2.3, 'Students need a minimum 2.3 GPA (on a 4.0 scale or equivalent)')),
        G(H('academic.cip_codes', 'prefix_any', ['11', '14.09', '14.10', '27', '30.70', '30.25'], 'Planning to pursue a bachelor’s degree in computer science or other computer science related field of study')),
        G(
          H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'This includes United States citizens, United States permanent residents'),
          F('Applicant is employment-authorized to work in the United States for at least two years', ['identity.citizenship'], 'Employment Authorized to work in the United States. Employment authorization must be valid for at least 2 years')
        ),
        G(F('Applicant has substantial financial need', ['financial.income_band', 'financial.sai'], 'This opportunity is offered to support students with a substantial need for financial assistance'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Up to $40,000' },
        { field: 'deadline', source_quote: 'Applications must be submitted by January 22, 2026 at 3 PM CT' },
        { field: 'effort', source_quote: 'Online Recommendation' },
        { field: 'need_based', source_quote: 'substantial need for financial assistance' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: [
      'Must have taken a high school computer science class OR pass an optional Amazon assessment (no field for coursework)',
      'Must plan to attend a 4-year institution or a 2-year college with intent to transfer'
    ],
    notes: 'Page gives two different deadlines (January 26, 2026 in the documents checklist and January 22, 2026 in the FAQ); both are past and the page says "Status: Closed". Majors list includes Transportation Technology and Cognitive Science; CIP mapping is approximate.'
  },

  'https://pflagsdc.org/scholarships/': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [],
    award_names: [
      'Mary Wagner Memorial Scholarship', 'John Bessemer Memorial Scholarship', 'Rob Benzon Memorial Scholarship', 'Stephen G. Bowersox Memorial Scholarship',
      'Kendall Family Memorial Scholarship', 'M. Lynne Austin Memorial Scholarship', 'Daniel J. Ferbal Memorial Scholarship', 'Gary A. Marcus Scholarship for the Fine and Applied Arts',
      'Bill Hanson Community College Scholarships', 'Personal Achievement Scholarships', 'Jeffrey D. Shorn and Charles S. Kaminski Scholarships', 'Trischman Family Scholarship',
      'Don Wahl Memorial Scholarship', 'Tom Schaide and Russell Fox Scholarships', 'Madruga Family Scholarship', 'Andy Thomas Memorial Scholarship',
      'OUTbio San Diego Next Generation Innovator Scholarship', 'Tyler Christenson Memorial Scholarship', 'Dave Adams and Tom Hammond Scholarship',
      'Dan and Ted Gadawski Callam Scholarships', 'James Ziegler and PFLAG San Diego County Fund STEM Scholarship', 'George Vickrey and Robert Lerner Scholarships'
    ],
    vocabulary_gaps: [],
    notes: 'Portfolio of about 22 named PFLAG San Diego County scholarships. Shared facts: LGBTQ+ high school seniors or full-time undergraduate/graduate students; minimum $2,000. Deadlines and application are on a separate page (https://pflagsdc.org/scholarship-applicants/), which is a general application page rather than individual award pages, so it is not in follow_links. Per-award descriptions are mostly donor stories with only a field of study for some, so no individual records were extracted. A defensible alternative is one record for the shared application.'
  },

  'https://www.sandiegorotary.club/committees/stem/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [],
    follow_links: [],
    notes: 'A Rotary STEM committee page about robotics programs and teacher stipends. It only links to the separate CADES Scholarship page, (https://sandiegorotary.club/committees/cades-scholarship/); not_scholarship pages carry no follow_links.'
  },

  'https://www.sdccd.edu/students/student-promise/index.aspx': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'San Diego Promise', provider_org: 'San Diego Community College District', provider_type: 'university',
      apply_url: 'https://www.sdccd.edu/students/student-promise/apply-promise.aspx', source_url: 'https://www.sdccd.edu/students/student-promise/index.aspx',
      amount: { min: 0, max: 0, renewable: true, note: 'No dollar amount; covers enrollment fees ($46 per unit) and health fees plus book grants for up to two years' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'institution', states: ['CA'] },
      eligibility: [
        G(H('academic.institution', 'in', ['San Diego City College', 'San Diego Mesa College', 'San Diego Miramar College'], 'Have an active application for Admission to San Diego City, Mesa, or Miramar College')),
        G(H('geo.residency', 'eq', 'in_state', 'Classified as a California Resident by the San Diego Community College District')),
        G(
          H('financial.fafsa_filed', 'is_true', undefined, 'Submit a Free Application for Federal Student Aid (FAFSA) or a California Dream Act application (CADAA)'),
          F('Applicant has submitted a California Dream Act Application', ['financial.fafsa_filed', 'identity.citizenship'], 'or a California Dream Act application (CADAA)')
        ),
        G(
          H('academic.enrollment', 'eq', 'full_time', 'Students must be enrolled in 12 units for the semester'),
          F('Applicant has a DSPS waiver of the full-time requirement or an approved unit-reduction petition', ['circumstances.disability'], 'Disability Support Programs and Services Waiver of Full-Time Status Requirement')
        ),
        G(
          F('Applicant is a first-time college student with no postsecondary experience after high school', ['academic.status', 'academic.year'], 'First Time to Any College Student'),
          F('Applicant is a returning SDCCD student who has not enrolled for three main semesters', ['academic.status', 'academic.institution'], 'Returning SDCCD Student who have not enrolled in classes for three main semester'),
          H('identity.lgbtq', 'is_true', undefined, 'Lesbian, Gay, Bisexual, Transgender, Queer, Intersex, Asexual, and other'),
          H('affiliations.military[].status', 'in', ['veteran', 'retired'], 'A veteran of the U.S Armed Forces'),
          H('circumstances.foster', 'eq', 'foster', 'Be a current or former foster youth in California'),
          F('Applicant is undocumented or has (or had) DACA', ['identity.citizenship'], 'An undocumented student is a foreign national'),
          F('Applicant is a current student or alumnus of the San Diego College of Continuing Education, or is justice involved', ['academic.institution'], 'Current/ Alumni of College of Continuing Education')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'Eligible students receive up to two years of: free tuition (Per-Unit Fee) and health fees' },
        { field: 'amount', source_quote: 'Eligible students can receive book grants for up to two years' },
        { field: 'apply_url', source_quote: 'Apply to the Promise' }
      ],
      verified_at: V, confidence: 0.55
    }],
    vocabulary_gaps: [
      'Must not have earned a prior postsecondary degree or certificate, or previously been in the Promise program',
      'Track 3 applicants must not have attempted more than 24 postsecondary units',
      'Justice-involved status has no field',
      'Must have a high school diploma or equivalency'
    ],
    notes: 'A college promise (tuition-free) program rather than a named cash scholarship; labeled single because students apply for the award. Arguably not_scholarship as a fee waiver program. Eligibility tracks are an OR group (first-time, returning, or a Track 3 identity group); Track 3 veteran rule excludes active duty. No application deadline on the page.'
  },

  'https://sfsu.academicworks.com/opportunities/5759': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'The Sequoia Awards', provider_org: 'The Sequoia Awards', provider_type: 'nonprofit',
      apply_url: 'https://sfsu.academicworks.com/opportunities/5759', source_url: 'https://sfsu.academicworks.com/opportunities/5759',
      amount: { min: 5000, max: 10000 }, deadline: '2018-10-31', cycle_status: 'closed',
      geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'], need_based: 'merit',
      eligibility: [
        G(H('geo.city', 'eq', 'Redwood City', 'Must live in Redwood City')),
        G(H('academic.status', 'eq', 'hs_senior', 'Class Level: HS Seniors')),
        G(F('Applicant has performed significant, uncompensated volunteer activities', ['activities.extracurricular', 'activities.leadership'], 'Must have performed significant, uncompensated volunteer activities')),
        G(H('academic.enrollment', 'in', ['full_time', 'part_time'], 'Enrollment Requirement: Undergrad: HALF-TIME'))
      ],
      provenance: [
        { field: 'amount', source_quote: '$5,000-$10,000' },
        { field: 'deadline', source_quote: 'Deadline: October 31, 2018' },
        { field: 'need_based', source_quote: 'Financial Need as determined by the FAFSA and/or CA Dream App: Not a Requirement' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Must attend the awards dinner to receive the award'],
    notes: 'External scholarship listed on the SFSU portal; the listing is stale (2018 deadline). Half-time enrollment minimum mapped to full_time or part_time.'
  },

  'https://ucsd.academicworks.com/opportunities/5532': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Military Veteran Scholarships Endowment', provider_org: 'University of California, San Diego', provider_type: 'university',
      apply_url: 'https://ucsd.academicworks.com/opportunities/5532', source_url: 'https://ucsd.academicworks.com/opportunities/5532',
      amount: { min: 1000, max: 1000 }, deadline: '2026-04-02', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'], need_based: 'need',
      eligibility: [
        G(H('academic.institution', 'eq', 'University of California, San Diego', 'UC San Diego Scholarships')),
        G(H('academic.status', 'eq', 'undergrad', 'transfer undergraduate students')),
        G(H('academic.enrollment', 'eq', 'transfer', 'transfer undergraduate students')),
        G(H('academic.gpa', 'gte', 3.0, 'have a minimum GPA of 3.0')),
        G(F('Applicant demonstrates financial need', ['financial.sai', 'financial.income_band', 'financial.fafsa_filed'], 'demonstrate financial need')),
        G(H('affiliations.military[].who', 'eq', 'self', 'are serving with honor or who have been honorably discharged from the armed forces of the United States')),
        G(H('affiliations.military[].status', 'in', ['active', 'reserve', 'guard', 'veteran', 'retired'], 'are serving with honor or who have been honorably discharged from the armed forces of the United States'))
      ],
      provenance: [
        { field: 'amount', source_quote: '$1,000' },
        { field: 'deadline', source_quote: '04/02/2026' },
        { field: 'need_based', source_quote: 'demonstrate financial need' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Honorable discharge / serving with honor has no field'],
    notes: 'Transfer status mapped to academic.enrollment = transfer.'
  },

  'https://sdsu.academicworks.com/opportunities/15825': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Eldred G. Mugford, in Memory of Clare H. Mugford, R.N., Endowed Scholarship', provider_org: 'San Diego State University', provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/15825', source_url: 'https://sdsu.academicworks.com/opportunities/15825',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-04-10', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.cip_codes', 'prefix_any', ['51.38'], 'Recipients will be pursuing a major in the School of Nursing')),
        G(H('academic.gpa', 'gte', 3.0, 'Recipients must have a minimum overall cumulative GPA of 3.00 out of 4.00'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Recipients may receive the scholarship only once (no field for prior receipt)'],
    notes: 'Financial need is a preference, not a requirement; FAFSA/CADAA is only needed for need to be assessed, so not encoded as a rule. All class levels, enrollment not required full-time.'
  },

  'https://www.epilepsysandiego.org/college-scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Epilepsy Foundation of San Diego County College Scholarships', provider_org: 'Epilepsy Foundation of San Diego County', provider_type: 'nonprofit',
      apply_url: 'https://www.epilepsysandiego.org/college-scholarships/', source_url: 'https://www.epilepsysandiego.org/college-scholarships/',
      amount: { min: 250, max: 6000, note: 'Includes the Michael Zapoticzny Memorial Scholarship (up to $6,000) and the Kim Tallian Memorial Scholarship ($2,000)' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'trade'], need_based: 'need',
      effort: { recs_required: 2 },
      eligibility: [
        G(
          H('geo.county', 'in', ['San Diego County, CA', 'Imperial County, CA', 'Riverside County, CA'], 'must reside in or be permanent residents of San Diego County, Imperial County, or Southern Riverside County'),
          F('Applicant is an out-of-state student currently enrolled in a San Diego school', ['academic.institution', 'geo.residency'], 'out-of-state students currently enrolled in a San Diego school are also eligible')
        ),
        G(
          F('Applicant is currently being treated for epilepsy/seizure disorder and is or will be enrolled in a college, university or trade school in fall 2026', ['circumstances.disability', 'academic.status'], 'Students currently being treated for epilepsy that are currently enrolled or will be enrolled in a college, university or trade school'),
          F('Applicant is a full-time college student involved in an epilepsy research project in health or social science with a GPA of at least 3.0', ['academic.enrollment', 'academic.gpa', 'academic.majors', 'activities.built'], 'Full-time college or university students involved in epilepsy research projects in the fields of health or social science')
        ),
        G(F('Applicant demonstrates financial need', ['financial.income_band', 'financial.sai'], 'demonstrate financial need'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'provides scholarships ranging from $250–$6,000 annually' },
        { field: 'deadline', source_quote: 'Coming in 2027: 2027-28 College Scholarship Application' },
        { field: 'effort', source_quote: 'Two Letters of Recommendation' }
      ],
      verified_at: V, confidence: 0.65
    }],
    vocabulary_gaps: [
      'Being treated for epilepsy has no specific field (only broad disability categories)',
      '"Southern" Riverside County is narrower than the county field',
      'Satisfactory academic performance is required but undefined'
    ],
    notes: 'One application program covering several awards, two of which are named memorial scholarships; modeled as one record (could be seen as a listing). 2026-27 recipients have been announced and the 2027-28 application is "coming in 2027", so the cycle is upcoming with no date. The Tallian award gives priority to bioscience/life-science majors (preference, not encoded).'
  },

  'https://www.niaf.org/programs/scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'NIAF Scholarship Program', provider_org: 'National Italian American Foundation', provider_type: 'nonprofit',
      apply_url: 'https://niaf.communityforce.com/Login.aspx', source_url: 'https://www.niaf.org/programs/scholarships/',
      amount: { min: 2500, max: 12000, note: 'Nearly 200 scholarships annually ranging from $2,500 to $12,000' },
      deadline: '2027-03-01', cycle_status: 'upcoming',
      geo_scope: { level: 'national' },
      eligibility: [
        G(F('Applicant (or a parent, guardian or grandparent) has an active NIAF membership', ['affiliations.member_org[].name'], 'Have an active NIAF Membership')),
        G(H('academic.enrollment', 'eq', 'full_time', 'Be enrolled in a US accredited institution of higher education on a full-time basis for the Fall 2027 semester')),
        G(H('academic.gpa', 'gte', 3.5, 'Have a GPA of at least 3.5 out of 4.0 (or the equivalent)')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'Be a United States Citizen or permanent resident alien')),
        G(F('Applicant demonstrates a commitment to or interest in Italian culture and heritage', ['identity.heritage', 'identity.languages[].lang', 'activities.extracurricular'], 'Applicant must demonstrate a commitment to or interest in Italian culture and heritage'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'ranging in value from $2,500 to $12,000' },
        { field: 'deadline', source_quote: 'March 1, 2027 11:59 p.m. EST' },
        { field: 'deadline', source_quote: 'The application will reopen for the 2027-2028 academic year on December 1, 2026' },
        { field: 'apply_url', source_quote: 'Complete Application' }
      ],
      verified_at: V, confidence: 0.75
    }],
    follow_links: [],
    vocabulary_gaps: ['Membership may be the applicant\'s own or a parent/guardian/grandparent\'s; no field for family membership in a member organization'],
    notes: 'Umbrella page for one shared application covering ~200 scholarships (details on an Available Scholarships page not captured). Some scholarships accept a lower GPA than 3.5; the 3.5 general rule is encoded. Application reopens December 1, 2026, so cycle is upcoming. Number of recommendation letters is not stated.'
  },

  'https://teamster.org/scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Teamsters Scholarship Fund', provider_org: 'International Brotherhood of Teamsters', provider_type: 'union',
      apply_url: 'https://aim.applyists.net/TSF', source_url: 'https://teamster.org/scholarships/',
      amount: { min: 0, max: 0, note: 'Amount not stated on the page' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Applications will be live for Class of 2027'))
      ],
      provenance: [
        { field: 'apply_url', source_quote: 'Click here to apply for a Teamsters Scholarship' },
        { field: 'deadline', source_quote: 'Applications will be live for Class of 2027, November 1, 2026' }
      ],
      verified_at: V, confidence: 0.45
    }],
    follow_links: [],
    vocabulary_gaps: [],
    notes: 'Nearly empty page: only apply/donate links, an FAQ PDF link and the note that applications open November 1, 2026 for the Class of 2027 (read as graduating high school seniors). No eligibility, amount or deadline is stated; a Teamster family connection is likely but not stated, so it is not encoded.'
  },

  'https://www.unionplus.org/benefits/education/union-plus-scholarships': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Union Plus Scholarship', provider_org: 'Union Plus Education Foundation', provider_type: 'union',
      apply_url: 'https://apply.mykaleidoscope.com/program/UnionPlusScholarship2027', source_url: 'https://www.unionplus.org/benefits/education/union-plus-scholarships',
      amount: { min: 1000, max: 4000, renewable: false, note: 'One-time awards; students may re-apply each year' },
      deadline: '2027-01-31', cycle_status: 'open',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad', 'trade', 'returning'],
      effort: { essay_words: 350, recs_required: 1 },
      eligibility: [
        G(F('Applicant is a current or retired member of a participating union, or the spouse or IRS-dependent child of one', ['affiliations.union[].name', 'affiliations.union[].local'], 'Current and retired members of participating unions, their spouses and their dependent children')),
        G(F('The applicant, spouse or parent has at least one year of continuous union membership by May 31, 2027', ['affiliations.union[].name'], 'At least one year of continuous union membership by the applicant, applicant\'s spouse or parent'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Amounts range from $1,000 to $4,000' },
        { field: 'deadline', source_quote: 'Application deadline: January 31, 2027' },
        { field: 'effort', source_quote: 'Two required essays of approximately 350 words each' },
        { field: 'effort', source_quote: 'One letter of reference from a teacher or other adult' },
        { field: 'apply_url', source_quote: 'Apply for the 2027 Scholarship' }
      ],
      verified_at: V, confidence: 0.8
    }],
    follow_links: [],
    vocabulary_gaps: [
      'Only unions that participate in Union Plus programs qualify (list only in the application)',
      'Members and families from the U.S., Puerto Rico, Guam, the U.S. Virgin Islands and Canada are eligible; must attend a U.S. accredited school (no field for intended school location)',
      'The union field has no relationship (self/spouse/parent) attribute',
      'Grandchildren are excluded unless IRS dependents'
    ],
    notes: 'A 3.0 GPA is only "recommended" and financial need is an evaluation criterion, so neither is a rule. Isaiah\'s Award (special connection to foster care) and the Val Cole Award are sub-awards within the same program; not split out.'
  },

  'https://ucsd.academicworks.com/opportunities/5500': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Alan Turing Memorial Scholarship Endowment Fund', provider_org: 'University of California, San Diego', provider_type: 'university',
      apply_url: 'https://ucsd.academicworks.com/opportunities/5500', source_url: 'https://ucsd.academicworks.com/opportunities/5500',
      amount: { min: 0, max: 12000, note: 'Up to $12,000; anticipated total over the full term of the award is $12,000' },
      deadline: '2026-04-02', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      effort: { essay_words: null },
      eligibility: [
        G(H('academic.institution', 'eq', 'University of California, San Diego', 'UC San Diego Scholarships')),
        G(
          H('academic.cip_codes', 'prefix_any', ['11', '14.09', '14.10', '09.01', '45.10', '44.05'], 'Computer Science, Computer or Electrical Engineering, Communications, or Political Science/Public Policy majors'),
          F('Applicant is in another program touching on networked systems', ['academic.majors', 'academic.cip_codes'], 'and other programs touching on networked systems')
        ),
        G(F('Applicant can describe how they are connected to the LGBTQIA+ community', ['identity.lgbtq', 'activities.extracurricular', 'activities.leadership'], 'who can describe in their application how they are connected to the LGBTQIA+ community')),
        G(F('Applicant is actively advocating for LGBTQIA+ issues', ['activities.leadership', 'activities.extracurricular'], 'are actively advocating for LGBTQIA+ issues'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Up to $12,000' },
        { field: 'deadline', source_quote: '04/02/2026' },
        { field: 'effort', source_quote: 'One or two-sentence submissions will not be considered' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [],
    notes: 'Merit, involvement and financial need are preferences only. Connection to the LGBTQIA+ community need not mean the applicant identifies as LGBTQIA+, so it is fuzzy. Supplemental essay has no stated word limit.'
  },

  'https://sdsu.academicworks.com/opportunities/10450': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'The American Legion District 22 Endowed Veterans Scholarship', provider_org: 'San Diego State University', provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/10450', source_url: 'https://sdsu.academicworks.com/opportunities/10450',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-07-31', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] },
      effort: { essay_words: 500 },
      eligibility: [
        G(H('academic.institution', 'eq', 'San Diego State University', 'Recipients must be pursuing a program of study at SDSU')),
        G(H('academic.gpa', 'gte', 3.0, 'Recipients must have a minimum overall cumulative GPA of 3.00 out of 4.00')),
        G(H('affiliations.military[].who', 'eq', 'self', 'Recipients must have served as active duty in the Armed Forces of the United States of America')),
        G(H('affiliations.military[].status', 'in', ['veteran', 'retired'], 'have been discharged or released therefrom under conditions other than dishonorable')),
        G(H('academic.enrollment', 'in', ['full_time', 'part_time'], 'Recipients must be enrolled in at least 6 units of study'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '07/31/2026' },
        { field: 'effort', source_quote: 'Submit an essay (250 to 500 words)' }
      ],
      verified_at: V, confidence: 0.85
    }],
    vocabulary_gaps: ['Discharge under conditions other than dishonorable (no discharge-status field)', 'Minimum of 6 units is finer than the part_time enrollment value'],
    notes: 'Financial need is a preference only; FAFSA/CADAA is needed only for need to be assessed.'
  },

  'https://www.nmcrs.org/get-help/financial-assistance/education-assistance': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Navy-Marine Corps Relief Society Education Assistance Scholarship', provider_org: 'Navy-Marine Corps Relief Society', provider_type: 'nonprofit',
      apply_url: 'https://nmcrs.scholarshipapps.org/', source_url: 'https://www.nmcrs.org/get-help/financial-assistance/education-assistance',
      amount: { min: 500, max: 3000, note: 'Awarded once per academic year; recipients can apply every year they are eligible. Interest-free loans up to $4,000 are separate.' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, levels: ['undergrad', 'grad', 'trade'], need_based: 'need',
      eligibility: [
        G(H('affiliations.military[].who', 'in', ['parent', 'spouse'], 'Children (under 23 by September 30 of current academic year) of active duty, retired or qualifying deceased Sailors and Marines')),
        G(H('affiliations.military[].branch', 'in', ['navy', 'marines'], 'active duty, retired or qualifying deceased Sailors and Marines')),
        G(H('affiliations.military[].status', 'in', ['active', 'retired'], 'active duty, retired or qualifying deceased Sailors and Marines')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'trade'], 'Applicants may be pursuing career & technical education, associate\'s degree, bachelor\'s degree, or master\'s degree'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Scholarships are awarded once per academic year and range from $500–$3,000' },
        { field: 'need_based', source_quote: 'Awards are determined by cost of attendance and FAFSA Student Aid Index (SAI)' },
        { field: 'deadline', source_quote: 'stay up to date for the 2027-28 application window' },
        { field: 'apply_url', source_quote: 'apply here for interest-free loans and grants' }
      ],
      verified_at: V, confidence: 0.65
    }],
    vocabulary_gaps: [
      'Children must be under 23 by September 30 of the academic year (no age field)',
      'Children/spouses of "qualifying deceased" Sailors and Marines are eligible; no deceased-service-member status value',
      'Same-person matching: who, branch and status must refer to the same military[] entry'
    ],
    notes: 'Page mixes need-based scholarships ($500-$3,000) with interest-free loans; only the scholarship is recorded. Active-duty members in commissioning programs are eligible for loans only, so not included. No application dates; the 2027-28 window is not open yet, so upcoming. Levels include hs_senior as incoming students may apply (judgment).'
  },

  'https://gogold.girlscouts.org/en/GSUSA-Gold-Award-Scholarship-App.html': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'GSUSA Gold Award Scholarship', provider_org: 'Girl Scouts of the United States of America', provider_type: 'nonprofit',
      apply_url: 'https://gogold.girlscouts.org/en/GSUSA-Gold-Award-Scholarship-App.html', source_url: 'https://gogold.girlscouts.org/en/GSUSA-Gold-Award-Scholarship-App.html',
      amount: { min: 0, max: 0, note: 'Amount not stated on the application page' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' },
      effort: { essay_words: null },
      eligibility: [
        G(F('Applicant is a Girl Scout who has completed a Gold Award project', ['affiliations.member_org[].name', 'activities.leadership', 'activities.built'], 'please summarize your Gold Award project'))
      ],
      provenance: [
        { field: 'effort', source_quote: 'In 2000 characters or less, please summarize your Gold Award project' },
        { field: 'effort', source_quote: 'Answer each prompt via written essay or video response' }
      ],
      verified_at: V, confidence: 0.5
    }],
    follow_links: [],
    vocabulary_gaps: ['Applications are submitted to the applicant\'s Girl Scout council, which nominates candidates (no field for council nomination)', 'Must be a Girl Scout Gold Award earner (no Girl Scouts / Gold Award field)'],
    notes: 'An online application form shown in read-only mode ("either you are not yet eligible or accessing the page outside of application period"). Not a PDF, so labeled single rather than pdf_form. Four prompts, each 2,000 characters or less (about 300-350 words) as essay or video; essay_words left null because the limit is in characters. No amount, deadline or eligibility text.'
  },

  'https://freemason.org/masonic-charities/scholarships/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Masons of California Scholarship Program', provider_org: 'California Masonic Foundation', provider_type: 'fraternal',
      apply_url: 'https://freemason.org/masonic-charities/scholarships/', source_url: 'https://freemason.org/masonic-charities/scholarships/',
      amount: { min: 0, max: 0, renewable: true, note: 'Amount not stated; recipients retain the scholarship through the entirety of their education if they remain eligible' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'state', states: ['CA'] }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Our Masonic scholarship program gives high school seniors')),
        G(F('Applicant has actively pursued education in spite of hardships and overcome significant obstacles', ['circumstances.housing_instability', 'circumstances.foster', 'circumstances.parent_status', 'circumstances.caregiver', 'financial.income_band'], 'who demonstrate an active pursuit of education in spite of hardships'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'scholarship recipients retain their scholarship through the entirety of their education' }
      ],
      verified_at: V, confidence: 0.4
    }],
    follow_links: [],
    vocabulary_gaps: [],
    notes: 'A general Masonic education-philanthropy page (public education, literacy partnerships, Teacher of the Year). Only one short paragraph describes the Masonic scholarship program, with no amount, deadline or application link. Borderline between single and not_scholarship; labeled single because a specific award and its target group are described. California scope is inferred from the organization, not stated for the scholarship.'
  },

  'https://www.oc-cf.org/scholarships/': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [], award_names: [],
    vocabulary_gaps: [],
    notes: 'Scholarship landing/hub page of the Orange County Community Foundation. It names no individual awards; it only links to an "Available Scholarships" page, FAQ, collecting awards and tips pages (not individual award pages, so not in follow_links). Could also be treated as not_scholarship since nothing is extractable.'
  },

  'https://www.truman.gov/OtherScholarships': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [],
    follow_links: [
      'https://amscan.org/fellowships-and-grants/fellowshipsgrants-to-study-in-scandinavia/',
      'https://asiafoundation.org/programs/education-and-leadership/leadex/asia-foundation-development-fellows/',
      'https://aif.org/fellowship/',
      'https://www.blakemorefoundation.org/',
      'https://www.borenawards.org/',
      'https://chateaubriand-fellowship.org/hss-application/',
      'https://chateaubriand-fellowship.org/stem-application/',
      'https://www.cbyx.info/',
      'https://clscholarship.org/',
      'https://www.interexchange.org/programs/travel-experiences-for-u-s-residents/christianson-fellowship/',
      'https://www.daad.org/en/',
      'https://www.daad.de/rise/en/',
      'https://www.us.fulbrightonline.org/',
      'https://www.icwa.org/apply/',
      'https://lucescholars.org/',
      'https://www.princetoninafrica.org/',
      'https://www.princetoninasia.org/',
      'https://pila-princeton.org/',
      'https://www.quadfellowship.org/',
      'https://watson.foundation/',
      'https://www.churchillscholarship.org/',
      'https://www.eit.org/scholars',
      'https://www.gatescambridge.org/',
      'https://villa-albertine.org/va/news/announcing-the-lafayette-fellowship-a-new-opportunity-for-graduate-studies-in-france-for-tomorrows-leaders/',
      'https://www.marshallscholarship.org/',
      'https://www.marshallscholarship.org/marshall-sherfield',
      'https://mccallmacbainscholars.org/',
      'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
      'https://www.schwarzmanscholars.org/',
      'https://www.cmu.edu/graduate/rales-fellows',
      'https://clarkedsfellowship.org/',
      'https://www.krellinst.org/csgf/',
      'https://www.faitfellowship.org/',
      'https://www.fasfellowship.org/',
      'https://www.hhmi.org/programs/gilliam-fellows',
      'https://research.google/programs-and-events/phd-fellowship/',
      'https://www.gwis.org/page/fellowship_program',
      'https://www.hertzfoundation.org/the-fellowship/',
      'https://www.cancer.gov/grants-training/training/funding/f31',
      'https://knight-hennessy.stanford.edu/',
      'https://www.jamesmadison.gov/',
      'https://www.marshallmotleyscholars.org/',
      'https://www.acls.org/programs/mellon-acls-dissertation-innovation-fellowships/',
      'https://naeducation.org/naed-spencer-dissertation-fellowship/',
      'https://ndseg.sysplus.com/',
      'https://www.nsf.gov/funding/opportunities/grfp-nsf-graduate-research-fellowship-program',
      'https://newcombefoundation.org/fellowships/',
      'https://www.peointernational.org/educational-support/scholar-awards/',
      'https://www.peointernational.org/educational-support/international-peace-scholarship-fund/',
      'https://pickeringfellowship.org/',
      'https://rangelprogram.org/graduate-fellowship-program/',
      'https://www.smartscholarship.org/',
      'https://pdsoros.org/',
      'https://pattillmanfoundation.org/apply/',
      'https://www.udall.gov/OurPrograms/Fellowship/Fellowship.aspx',
      'https://wennergren.org/program/dissertation-fieldwork-grant/'
    ],
    award_names: [
      'ASF Fellowships and Grants to Study in Scandinavia', 'Asia Foundation Development Fellows', 'Banyan Impact Fellowship', 'Blakemore Freeman Fellows', 'Boren Fellowship',
      'Chateaubriand Fellowship', 'Congress-Bundestag Youth Exchange for Youth (CBYX)', 'Critical Language Scholarship (CLS)', 'Christianson Fellowship', 'DAAD & DAAD RISE Research Grants',
      'English Program in Korea', 'Fulbright US Student Program', 'ICWA Fellowship', 'Japan Exchange and Teaching (JET) Program', 'Luce Scholars Program',
      'Princeton in Africa Fellowship', 'Princeton in Asia', 'Princeton in Latin America Fellowship', 'Quad Fellowship', 'Watson Fellowship',
      'Churchill Scholarship', 'DAAD Study Scholarships – Master Studies for All Academic Disciplines', 'Ellison Scholars', 'Gates Cambridge Scholarship', 'The Lafayette Fellowship',
      'Marshall Scholarship', 'Marshall Sherfield Fellowship', 'McCall MacBain Scholarship', 'Rhodes Scholarship', 'Schwarzman Scholars',
      'CMU Rales Fellows Program', 'Clarke Diplomatic Security Fellowship', 'DOE Computational Science Graduate Fellowship (DOE CSGF)', 'Foreign Affairs Information Technology (FAIT) Fellowship',
      'Foreign Agricultural Service International Agricultural Fellowship', 'Gilliam Fellows Program', 'Google PhD Fellowship Program', 'Graduate Women in Science National Fellowship Program',
      'Hertz Fellowship', 'Kirschstein National Research Service for Individual Predoctoral Fellows', 'Knight-Hennessy Scholars', 'Madison Fellowship', 'Marshall-Motley Scholars Program',
      'Mellon/ACLS Dissertation Innovation Fellowship Program', 'NAEd/Spencer Dissertation Fellowship', 'National Defense Science and Engineering Graduate Fellowship Program',
      'National Science Foundation Graduate Research Fellowship Program', 'Newcombe Doctoral Dissertation Fellowships', 'P.E.O. Scholar Awards', 'Pickering Graduate Foreign Affairs Fellowship',
      'Rangel International Affairs Graduate Fellowship', 'SMART Scholarship', 'Soros Fellowships for New Americans', 'Tillman Scholars Program',
      'Udall Native American Graduate Fellowship', 'Wenner-Gren Dissertation Fieldwork Grant'
    ],
    vocabulary_gaps: [],
    notes: 'Reference list of outside scholarships and fellowships compiled for Truman Scholars. Descriptions are short and mostly lack amounts, deadlines and eligibility, so no records are extracted. Excluded from award_names: pure jobs/work programs and internships in the "Domestic Fellowship Programs" section (Emerson, Gaither, Hertog, Humanity in Action, Horseshoe Farm, Mirzayan, NIAID IRTA, CSPC Presidential Fellows, Samvid, Udall Internship); JET and EPIK are jobs but kept since they appear in the awards section (reviewer may drop them). Only a few entries (Christianson, Madison, McCall MacBain) state amounts. Duplicates (Fulbright, Quad) listed once.'
  },

  'https://www.cwsl.edu/admissions_and_aid/financial_aid/aid_programs/scholarships/external_scholarships.html': (() => {
    const src = 'https://www.cwsl.edu/admissions_and_aid/financial_aid/aid_programs/scholarships/external_scholarships.html';
    const law = (quote) => G(H('academic.cip_codes', 'prefix_any', ['22.01'], quote));
    const grad = (quote) => G(H('academic.status', 'eq', 'grad', quote));
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          name: 'HBAIE Law Student Scholarship', provider_org: 'Hispanic Bar Association Inland Empire', provider_type: 'bar_association',
          apply_url: 'https://www.hbaie.com/Scholarship', source_url: src,
          amount: { min: 2000, max: 2000, note: 'Two $2,000 scholarships' }, deadline: '2026-10-02', cycle_status: 'open',
          geo_scope: { level: 'county', states: ['CA'] }, levels: ['grad'], need_based: 'need',
          eligibility: [
            grad('Hispanic Bar Association Inland Empire (HBAIE) 2026 Law Student Scholarship'),
            law('Hispanic Bar Association Inland Empire (HBAIE) 2026 Law Student Scholarship'),
            G(F('Applicant has strong ties to the Inland Empire (Riverside/San Bernardino counties)', ['geo.county', 'geo.city', 'academic.institution'], 'two deserving individuals with strong ties to the Inland Empire'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'offering a $2,000 scholarship to two deserving individuals' },
            { field: 'deadline', source_quote: 'The application deadline has been extended to October 2, 2026' },
            { field: 'need_based', source_quote: 'scholastic excellence, financial need, and outstanding personal qualities' }
          ],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'SDLRLA Scholarship Program', provider_org: 'San Diego La Raza Lawyers Association Scholarship Fund', provider_type: 'bar_association',
          apply_url: 'https://sdlrlascholarshipfund.org/scholarships/', source_url: src,
          amount: { min: 0, max: 0, note: 'Amount not stated on this page' }, deadline: '2026-09-18', cycle_status: 'closed',
          geo_scope: { level: 'county', states: ['CA'] }, levels: ['grad'], need_based: 'need',
          eligibility: [
            law('Scholarships are awarded to 2L and 3L law school students'),
            G(H('academic.year', 'between', [2, 3], 'Scholarships are awarded to 2L and 3L law school students')),
            G(F('Applicant has contributed to advancing the Latino/a or Spanish-speaking community', ['activities.extracurricular', 'activities.leadership', 'identity.languages[].lang'], 'who have contributed to advancing the Latino/a or Spanish-speaking community'))
          ],
          provenance: [
            { field: 'deadline', source_quote: 'on or before September 18, 2026, at 11:59 p.m.' },
            { field: 'need_based', source_quote: 'who meet the criteria of community service, financial need, and academic achievement' }
          ],
          verified_at: V, confidence: 0.65
        },
        {
          name: 'The Anita Hill Scholarship', provider_org: 'StitchCrew (Anita Hill Scholarship coalition)', provider_type: 'nonprofit',
          apply_url: 'https://www.stitchcrew.com/anita-hill-scholarship', source_url: src,
          amount: { min: 10000, max: 10000, note: 'Five $10,000 scholarships' }, deadline: '2026-09-22', cycle_status: 'closed',
          geo_scope: { level: 'national' }, levels: ['grad'],
          eligibility: [
            grad('supporting law students who demonstrate a commitment to advancing democracy'),
            law('supporting law students who demonstrate a commitment to advancing democracy'),
            G(F('Applicant demonstrates a commitment to advancing democracy, civil rights, and gender equity', ['activities.extracurricular', 'activities.leadership', 'career.field', 'career.sectors'], 'demonstrate a commitment to advancing democracy, civil rights, and gender equity'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'Five $10,000 scholarships will be distributed' },
            { field: 'deadline', source_quote: 'Deadline to apply is September 22, 2026' }
          ],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'Nancy E. O\'Malley Scholarship', provider_org: 'California Women Lawyers', provider_type: 'bar_association',
          apply_url: 'https://www.cwl.org/Nancy-E.OMalley-Scholarship', source_url: src,
          amount: { min: 5000, max: 5000 }, deadline: '2026-09-25', cycle_status: 'closed',
          geo_scope: { level: 'state', states: ['CA'] }, levels: ['grad'],
          eligibility: [
            grad('One scholarship is awarded annually to a law student'),
            law('One scholarship is awarded annually to a law student'),
            G(F('Applicant\'s activities and plans demonstrate a commitment to issues affecting women and/or children in the community', ['activities.extracurricular', 'activities.leadership', 'career.field'], 'demonstrate a commitment to issues affecting women and/or children in the community'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'One $5,000 scholarship will be awarded' },
            { field: 'deadline', source_quote: 'The application deadline is September 25, 2026, at 5 p.m. PST' }
          ],
          verified_at: V, confidence: 0.75
        },
        {
          name: 'OC ABOTA Scholarship', provider_org: 'Orange County Chapter, American Board of Trial Advocates', provider_type: 'bar_association',
          apply_url: 'https://www.cwsl.edu/2026_oc_abota_scholarship.pdf', source_url: src,
          amount: { min: 0, max: 0, note: 'Amount not stated on this page' }, deadline: '2026-10-06', cycle_status: 'open',
          geo_scope: { level: 'county', states: ['CA'] }, levels: ['grad'],
          eligibility: [
            law('be in good standing at a California State Bar-accredited law school'),
            G(H('academic.year', 'between', [2, 3], 'Applicants must be a second- or third-year law student')),
            G(
              H('geo.county', 'eq', 'Orange County, CA', 'reside in Orange County'),
              F('Applicant is enrolled in an Orange County law school', ['academic.institution'], 'be enrolled in an Orange County law school')
            ),
            G(H('academic.gpa', 'gte', 3.0, 'have a minimum 3.0 GPA from the past academic year'))
          ],
          provenance: [
            { field: 'deadline', source_quote: 'The application deadline is October 6, 2026' }
          ],
          verified_at: V, confidence: 0.75
        }
      ],
      follow_links: [
        'https://www.hbaie.com/Scholarship',
        'https://sdlrlascholarshipfund.org/scholarships/',
        'https://www.stitchcrew.com/anita-hill-scholarship',
        'https://www.cwl.org/Nancy-E.OMalley-Scholarship',
        'https://www.cwsl.edu/2026_oc_abota_scholarship.pdf'
      ],
      award_names: ['HBAIE Law Student Scholarship', 'SDLRLA Scholarship Program', 'The Anita Hill Scholarship', 'Nancy E. O\'Malley Scholarship', 'OC ABOTA Scholarship'],
      vocabulary_gaps: ['OC ABOTA requires good standing at a California State Bar-accredited law school (no standing field)', '"Strong ties" to a region is looser than residence'],
      notes: 'Law school list of external scholarships. The AccessLex Law School Scholarship Databank is a search tool, not an award, so it is excluded. Each entry is summarized briefly; eligibility beyond law-student status is thin. SDLRLA text mixes "scholarships" and "bar stipends". Financial need for HBAIE and SDLRLA is listed among award criteria.'
    };
  })(),

  'https://cfnorthstate.org/grant/scholarships/': (() => {
    const slugs = [
      ['Andy Peek Livestock Endowed Scholarship Fund', 'andy-peek-livestock-endowed-scholarship-fund'],
      ['Balma Family Scholarship Fund', 'balma-family-scholarship-fund'],
      ['Christine Begley Scholarship', 'christine-begley-scholarship'],
      ['Don & Debbie Bankson Scholarship Endowment Fund', 'don-debbie-bankson-scholarship-endowment-fund'],
      ['Dr. Donald and Ann Gleason Memorial Scholarship', 'dr-donald-and-ann-gleason-memorial-scholarship'],
      ['Dr. Frank L. Doane Memorial Scholarship Fund', 'dr-frank-l-doane-memorial-scholarship-fund'],
      ['Ethel Zwiebel Scholarship', 'ethel-zwiebel-scholarship'],
      ['FWF ’62 Scholarship Fund', 'fwf-62-scholarship-fund'],
      ['Glen Hawk Sr. Endowed Scholarship Fund', 'glen-hawk-sr-endowed-scholarship-fund'],
      ['Gregory L. Morris II Memorial Scholarship', 'gregory-l-morris-ii-memorial-scholarship'],
      ['Gustafson Fritz Scholarship for Women', 'gustafson-fritz-scholarship-for-women'],
      ['Jack Schreder Scholarship Fund', 'jack-schreder-scholarship-fund'],
      ['Jackson Family Scholarship', 'jackson-family-scholarship'],
      ['Jeanne Yalon-Owens Memorial Scholarship', 'jeanne-yalon-owens-memorial-scholarship'],
      ['Jim and Dolores Cusick Memorial Scholarship', 'jim-and-dolores-cusick-memorial-scholarship'],
      ['Jim Freeman, MD Memorial Scholarship', 'jim-freeman-memorial-scholarship'],
      ['Kelly Moravec Academic Encouragement Scholarship', 'kelly-moravec-academic-encouragement-scholarship'],
      ['Ken Putnam Choral Music Endowed Scholarship Fund', 'ken-putnam-choral-music-endowed-scholarship-fund'],
      ['Key Club Scholarship', 'key-club-scholarship'],
      ['Lou and Diane Gerard Scholarship Fund', 'lou-and-diane-gerard-scholarship-fund'],
      ['Marcia McKenzie Pay It Forward Scholarship', 'marcia_mckenzie'],
      ['Matt Solus Memorial Scholarship Fund', 'matt-solus-memorial-scholarship-fund'],
      ['Nicholas Gaynor Memorial Fund', 'nicholas-gaynor-memorial-fund'],
      ['Prudence Rose Kennedy Fund', 'prudence-rose-kennedy-fund'],
      ['Pucek Family Scholarship Endowment Fund', 'pucek-family-scholarship-endowment-fund'],
      ['Reach Higher Scholarship Fund', 'reach-higher-scholarship-fund'],
      ['Redding Sunrise Rotary Scholarship', 'redding-sunrise-rotary-scholarship'],
      ['REU Powering Redding’s Future Scholarship Fund', 'reu-powering-reddings-future-scholarship-fund'],
      ['Savage Scholarship Fund', 'savage-scholarship-fund'],
      ['Shasta Community Health Center Future Workforce Scholarship Fund', 'shasta-community-health-center-future-workforce-scholarship-fund'],
      ['Shasta Health Rock Stars Scholarship Fund', 'shasta-health-rock-stars-scholarship-fund'],
      ['The Tom and Nancy Driscoll Foundation Scholarship', 'the-tom-and-nancy-driscoll-foundation-scholarship'],
      ['Top of the State Scholarship Endowment Fund', 'top-of-the-state-scholarship-endowment-fund'],
      ['Tri Counties Bank Endowed Scholarship Fund', 'tri-counties-bank-endowed-scholarship-fund'],
      ['United Scholarships, Inc.', 'united-scholarships-inc'],
      ['Weed Community Scholarship', 'weed-community-scholarship']
    ];
    return {
      page_type: 'listing', is_scholarship_page: true, scholarships: [],
      follow_links: slugs.map(([, s]) => `https://cfnorthstate.org/scholarships/${s}/`),
      award_names: slugs.map(([n]) => n),
      vocabulary_gaps: [],
      notes: 'Community foundation directory of 36 scholarship funds with one-line truncated summaries ("[…] Read More"). Most lack amount and deadline, so no records extracted; each has its own page URL in follow_links. The Fall 2027 Universal Application opens November 2; the Andy Peek 2026/27 application is open with a November 4 deadline (year not stated).'
    };
  })(),

  'https://www.apcf.org/scholarships': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [], follow_links: [], award_names: [],
    vocabulary_gaps: [],
    notes: 'Asian Pacific Community Fund scholarships hub. It describes donor-partnered scholarship programs in general (selection on merit, community involvement, leadership, mentor recommendation; many for low-income youth) and has a single student application link (https://apcf2.tfaforms.net/f/apcf_schol26), but the "current scholarship program partners" list did not render in the text, so no award names, amounts or deadlines are available. Borderline single (one shared application) vs listing; nothing extractable either way.'
  },

  'https://teamster.org/wp-content/uploads/2018/12/2012-2013_JRHMSF_brochure_eng.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'James R. Hoffa Memorial Scholarship Fund', provider_org: 'International Brotherhood of Teamsters', provider_type: 'union',
      apply_url: 'https://teamster.org/wp-content/uploads/2018/12/2012-2013_JRHMSF_brochure_eng.pdf', source_url: 'https://teamster.org/wp-content/uploads/2018/12/2012-2013_JRHMSF_brochure_eng.pdf',
      amount: { min: 1000, max: 10000, renewable: true, note: '31 four-year awards of $10,000 ($2,500 per year, renewable); 119 one-time $1,000 grants' },
      deadline: '2012-03-31', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'need',
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Applicants to the current program must graduate')),
        G(F('Applicant is a son, daughter, grandchild or financial dependent of a Teamster member in good standing for the 12 consecutive months before the deadline', ['affiliations.union[].name', 'affiliations.union[].local'], 'Children or Grandchildren')),
        G(F('Applicant demonstrates financial need', ['financial.income_band', 'financial.sai'], 'Demonstrate financial need'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Thirty-one of the awards total $10,000 each' },
        { field: 'amount', source_quote: 'time $1,000 grants' },
        { field: 'deadline', source_quote: 'line of March 31, 2012' },
        { field: 'levels', source_quote: 'For High School Seniors who' }
      ],
      verified_at: V, confidence: 0.7
    }],
    follow_links: [],
    vocabulary_gaps: [
      'The Teamster parent/grandparent must not have been a full-time elected officer and must be in good standing (no fields)',
      'The union field has no relationship (parent/grandparent) attribute',
      'Must attend a tuition-charging accredited U.S. or Canadian college',
      'Guidelines suggest top 15 percent class rank (advisory, no class-rank field)',
      'Application must be routed through the member\'s local union'
    ],
    notes: 'A 2012-2013 program brochure/guide (stale). Financial need appears in the "Guidelines" (advisory) and in selection criteria; encoded as need_based plus a fuzzy rule, which a reviewer may drop. Canadian and Puerto Rican applicants are eligible. The PDF text has missing spaces in places.'
  },

  'https://ahepa.org/wp-content/uploads/2026/01/2026-AEF-Application.pdf': (() => {
    const src = 'https://ahepa.org/wp-content/uploads/2026/01/2026-AEF-Application.pdf';
    const base = { provider_org: 'AHEPA Educational Foundation', provider_type: 'fraternal', apply_url: src, source_url: src, verified_at: V };
    return {
      page_type: 'pdf_form', is_scholarship_page: true,
      scholarships: [
        {
          ...base, name: 'AHEPA Educational Foundation (AEF) Scholarship',
          amount: { min: 0, max: 2500, note: 'Up to $2,500; separate categories for Undergraduate I, Undergraduate II, Graduate and Hellenic College/Holy Cross Seminary' },
          deadline: '2026-03-31', cycle_status: 'closed',
          geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad'], need_based: 'either',
          effort: { recs_required: 2 },
          eligibility: [
            G(H('affiliations.fraternal[].org', 'in', ['AHEPA', 'Daughters of Penelope', 'Sons of Pericles', 'Maids of Athena'], 'of anyone of the AHEPA Family (AHEPA, Daughters of Penelope, Sons of')),
            G(H('affiliations.fraternal[].member', 'in', ['self', 'parent', 'grandparent'], 'applicants or their father/mother/grandparents (MUST BE AN')),
            G(F('Applicant is of Hellenic descent or identifies as a Phil-Hellene', ['identity.heritage', 'identity.languages[].lang'], 'They must also be of Hellenic descent or identify as Phil-Hellenes')),
            G(H('academic.gpa', 'gte', 3.0, 'maintain a minimum GPA of 3.0 to qualify for consideration')),
            G(H('academic.gpa_scale', 'eq', 'unweighted', 'Un-weighted GPA, (maximum 4.0 Scale)')),
            G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad'], 'A high school graduate or a high school senior planning to attend, full time, an Accredited College or University')),
            G(H('academic.enrollment', 'eq', 'full_time', 'A college student currently attending an Accredited College or University and will continue to attend, full time,'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'may reach up to a maximum of $2,500.00' },
            { field: 'deadline', source_quote: 'from January 2nd through March 31st each year' },
            { field: 'effort', source_quote: 'Two letters of recommendation' },
            { field: 'need_based', source_quote: 'Type of Scholarship: (Please check ONLY ONE!!!)' }
          ],
          confidence: 0.75
        },
        {
          ...base, name: 'Chariclea Christodulakis-Cummins Educational Charity Fund Scholarship',
          amount: { min: 10000, max: 10000, note: 'One-time financial need-based award' },
          deadline: '2026-03-30', cycle_status: 'closed',
          geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'need',
          eligibility: [
            G(H('identity.gender', 'eq', 'woman', 'graduating (female) High School student')),
            G(H('academic.status', 'eq', 'hs_senior', 'graduating (female) High School student')),
            G(F('Applicant (and parents/legal guardians) have been AHEPA members for at least one year before the deadline', ['affiliations.fraternal[].org', 'affiliations.fraternal[].member'], 'parent(s) and legal guardian(s) must have been a member of')),
            G(F('Applicant has financial need', ['financial.income_band', 'financial.sai'], 'A $10,000 financial need-based Scholarship available only to, a'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'A $10,000 financial need-based Scholarship available only to, a' },
            { field: 'deadline', source_quote: 'date of March 30th' }
          ],
          confidence: 0.6
        },
        {
          ...base, name: 'Constantine and Patricia Mavroyannis Scholarship', apply_url: src,
          amount: { min: 5000, max: 5000 }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'national' }, levels: ['grad'],
          eligibility: [
            G(H('academic.status', 'eq', 'grad', 'Scholarship is open to graduate students who are either Greek or of')),
            G(F('Applicant is Greek or of Greek heritage', ['identity.heritage'], 'Scholarship is open to graduate students who are either Greek or of')),
            G(H('academic.cip_codes', 'prefix_any', ['40.08', '40.0506'], 'Greek heritage and are enrolled in a PhD program in either theoretical'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'The scholarship is in the amount of $5,000 and' }
          ],
          confidence: 0.6
        }
      ],
      follow_links: [],
      award_names: [
        'AHEPA Educational Foundation (AEF) Scholarship', 'Chariclea Christodulakis-Cummins Educational Charity Fund Scholarship', 'Constantine and Patricia Mavroyannis Scholarship',
        'AHEPA National Housing Corporation Scholarships', 'James G. Pulos Memorial Scholarship', 'Webster University – Athens Campus Scholarship'
      ],
      vocabulary_gaps: [
        'Membership must be active and paid for the current year (2026)',
        'Chariclea: must attend an accredited 4-year U.S. college and submit an affidavit of no felony convictions',
        'Mavroyannis: must be in a PhD program at a North American university (no degree-type or school-location field)',
        'A recipient may only ever receive one undergraduate and one graduate AEF award',
        'Financial-need track requires family gross income under $100,000 (only for applicants choosing that track)'
      ],
      notes: 'A 2026 application PDF for the AHEPA Educational Foundation scholarships, listing benefactor-named funds that are awarded through the general application. Records: the general AEF award plus two separately described awards with amounts. The Chariclea deadline says "March 30th" (year assumed 2026 from the form). Mavroyannis applicants apply by contacting staff; no deadline given. Webster University (full or 30% tuition), AHEPA National Housing Corporation and James G. Pulos awards are described without amounts and not extracted. need_based "either" because applicants choose Scholastic Achievement or Financial Need.'
    };
  })(),

  'https://www.burgerkingfoundation.org/about/who-we-are': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'About page (history, board, staff) of the Burger King Foundation. It mentions the BK Scholars Program and the three $60,000 WHOPPER awards historically but gives no eligibility, deadline or way to apply. It links to the Scholars Program page (https://www.burgerkingfoundation.org/programs/burger-king-sm-scholars).'
  },

  'https://rsffoundation.org/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Community foundation home page for donors and nonprofits (donor-advised funds, grants to organizations, Advancing Education grants for grades 3-8 programs). No student scholarship content.'
  },

  'https://www.unionplus.org/blog/member-stories/2025-union-plus-scholarships-award-250000-union-members-and-families': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [],
    follow_links: [],
    notes: 'Press release (August 2025) announcing 2025 Union Plus Scholarship winners. News about a past cycle; the program page is linked. The page itself is internally inconsistent (93 vs 193 winners).'
  },

  'https://sdpride.org/tdoe/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Transgender Day of Empowerment (TDOE) Scholarship (Tracie Jada O’Brien Trans* Student Scholarship Fund)', provider_org: 'San Diego Pride', provider_type: 'nonprofit',
      apply_url: 'https://docs.google.com/forms/d/e/1FAIpQLScybF9iGygccdz_C9W6y84YEjltcfHsfXprRsD0fHRk_pYHxw/viewform', source_url: 'https://sdpride.org/tdoe/',
      amount: { min: 500, max: 500, note: 'As funds permit, 20 scholarships of $500 each; may apply for up to four consecutive years' },
      deadline: '2026-03-06', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad', 'grad', 'trade'],
      effort: { essay_words: 250 },
      eligibility: [
        G(H('geo.county', 'eq', 'San Diego County, CA', 'open to students from or residing in San Diego County')),
        G(F('Applicant identifies as transgender, lives outside the gender binary, and/or is in the process of transitioning', ['identity.gender', 'identity.lgbtq'], 'who identify as transgender, live outside of the gender binary, and/or are in the process of transitioning their gender')),
        G(F('Applicant is accepted to or enrolled in a 2-year college, 4-year college/university, technical school, graduate program or vocational training program', ['academic.status', 'academic.institution'], 'Upload proof of acceptance to or enrollment in the educational institution'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'will award 20 scholarships of $500 each' },
        { field: 'deadline', source_quote: 'Application Deadline: Friday, March 6, 2026' },
        { field: 'effort', source_quote: 'Submit a 250-word essay' },
        { field: 'apply_url', source_quote: 'Access the 2026 TDOE Scholarship Application Here' }
      ],
      verified_at: V, confidence: 0.85
    }],
    follow_links: [],
    vocabulary_gaps: ['Transgender identity has no specific value in identity.gender', 'Students who have already been funded for four years are ineligible (no prior-award field)', '"From" San Diego County (origin) is broader than current residence'],
    notes: 'Financial need, essay quality and academic promise are evaluation criteria, not rules. The 2026 cycle closed March 6, 2026.'
  },

  'https://sites.google.com/ucdavis.edu/ca4h-resourcecenter/recognitions/scholarships': (() => {
    const src = 'https://sites.google.com/ucdavis.edu/ca4h-resourcecenter/recognitions/scholarships';
    const form = 'https://docs.google.com/forms/d/e/1FAIpQLSfMbfRFrDWqz1JO7MONcKp6EQQzUs-EyWf5TVYPHieAVAHtzQ/viewform?usp=header';
    const h4 = {
      provider_org: 'University of California 4-H Youth Development Program', provider_type: 'university',
      apply_url: form, source_url: src, deadline: '2026-10-25', cycle_status: 'open',
      geo_scope: { level: 'state', states: ['CA'] }, verified_at: V
    };
    const common = [
      G(H('activities.competitions', 'contains_any', ['4h'], 'Enrolled in the University of California 4-H Youth Development Program at the time of high school graduation')),
      G(H('academic.status', 'in', ['undergrad', 'grad', 'trade', 'returning'], 'A high school graduate or equivalent who can show proof of enrollment in an institution of higher education')),
      G(H('academic.enrollment', 'in', ['full_time', 'part_time'], 'You must be enrolled or planning to enroll in at least half of the full-time course load'))
    ];
    const dl = { field: 'deadline', source_quote: 'Deadline to Apply: October 25, 2026, 11:59 pm' };
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          ...h4, name: 'Dean Memorial Legacy Scholarship', amount: { min: 1000, max: 1000 }, levels: ['undergrad', 'grad', 'trade'],
          eligibility: [...common],
          provenance: [{ field: 'amount', source_quote: 'Award: $1,000 scholarship' }, dl],
          confidence: 0.75
        },
        {
          ...h4, name: 'Samarin Family Vocational Scholarship', amount: { min: 1000, max: 1000 }, levels: ['trade'], need_based: 'need',
          eligibility: [
            ...common,
            G(F('Applicant is enrolled in or intends to enroll in a vocational/trade school or junior college vocational training program in the United States', ['academic.status', 'academic.institution', 'career.field'], 'Candidates must be enrolled in, or intending to enroll in (upon high school graduation), a vocational/trade school'))
          ],
          provenance: [{ field: 'amount', source_quote: 'Award: $1000 scholarship' }, dl, { field: 'need_based', source_quote: 'Applications will be judged on financial need' }],
          confidence: 0.7
        },
        {
          ...h4, name: 'Ehn Family Scholarship', amount: { min: 2000, max: 2000 }, levels: ['undergrad', 'grad'],
          eligibility: [
            ...common,
            G(H('academic.cip_codes', 'prefix_any', ['14.03', '01'], 'students pursuing agricultural engineering, or related field at a post-secondary accredited college or university'))
          ],
          provenance: [{ field: 'amount', source_quote: 'Award: $2000 scholarship' }, dl],
          confidence: 0.7
        },
        {
          ...h4, name: 'Kaye Suddath Memorial Scholarship', amount: { min: 2000, max: 2000 }, levels: ['undergrad', 'grad'],
          eligibility: [
            ...common,
            G(H('academic.cip_codes', 'prefix_any', ['01'], 'students pursuing a degree focused on agriculture at a post-secondary accredited college or university'))
          ],
          provenance: [{ field: 'amount', source_quote: 'Award: $2000 scholarship' }, dl],
          confidence: 0.7
        },
        {
          name: 'Pembroke Welsh Corgi Club of America Scholarship', provider_org: 'Pembroke Welsh Corgi Club of America', provider_type: 'nonprofit',
          apply_url: 'https://pwcca.org/PWCCA-Scholarships', source_url: src,
          amount: { min: 0, max: 2000 }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad', 'trade'],
          eligibility: [
            G(F('Applicant is actively involved in the sport of dogs (emphasis on Pembroke Welsh Corgis)', ['activities.extracurricular', 'activities.unusual_skills', 'activities.competitions'], 'young people that are actively involved in the sport of dogs')),
            G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'trade', 'returning'], 'This includes high school seniors, high school graduates, and those already enrolled in higher education'))
          ],
          provenance: [{ field: 'amount', source_quote: 'The PWCCA will award up to $2,000' }],
          verified_at: V, confidence: 0.6
        },
        {
          name: 'Dellavalle Soil Science Scholarship', provider_org: 'Soil Science Society of America', provider_type: 'professional_society',
          apply_url: 'https://www.soils.org/awards/view/213/', source_url: src,
          amount: { min: 5000, max: 5000 }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'state', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'will be awarded to a California high school senior')),
            G(H('geo.state', 'eq', 'CA', 'will be awarded to a California high school senior')),
            G(F('Applicant plans to pursue a degree in a soil-science related field', ['academic.majors', 'academic.cip_codes', 'career.field'], 'plans to pursue a degree in a soil-science related field'))
          ],
          provenance: [{ field: 'amount', source_quote: 'A $5,000 scholarship will be awarded' }],
          verified_at: V, confidence: 0.55
        }
      ],
      follow_links: ['https://pwcca.org/PWCCA-Scholarships', 'https://www.soils.org/awards/view/213/'],
      award_names: ['Dean Memorial Legacy Scholarship', 'Samarin Family Vocational Scholarship', 'Ehn Family Scholarship', 'Kaye Suddath Memorial Scholarship', 'Pembroke Welsh Corgi Club of America Scholarship', 'Dellavalle Soil Science Scholarship'],
      vocabulary_gaps: [
        '4-H awards: applicant must be no older than 25 as of December 31 of the application year (no age field)',
        '4-H membership must have been at the time of high school graduation; mapped to activities.competitions contains 4h',
        'Only one 4-H scholarship may be received per year'
      ],
      notes: 'Four California 4-H Higher Education scholarships share one application (deadline October 25, 2026) and shared qualifications; two outside scholarships (PWCCA, Dellavalle) are also described with amounts but no deadlines. The Dellavalle provider is inferred from the soils.org link (judgment). Ehn gives consideration to Fresno County 4-H members (preference only).'
    };
  })(),
};
