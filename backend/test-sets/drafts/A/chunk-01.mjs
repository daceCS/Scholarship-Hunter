// Chunk 01, slot A draft labels. Drafted independently from the snapshot text only; NOT reviewed by a human.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const noAmount = 'Amount not stated on the page';
const SDSU = 'San Diego State University';
const UCSD = 'University of California, San Diego';
const NNYCF_NAMES = ["North Central Zone New York State Retired Teachers’ Association Inc. Scholarship","Russell I. Wilcox Thousand Islands Bridge Authority Scholarship","Evergreen STEM Scholarship","Jefferson County Sons of the American Legion Brian A. L’Huillier Memorial Scholarship","Vici and Steve Diehl Foundation Graduate Environmental Scholarship","Vici and Steve Diehl Foundation Graduate Music Scholarship","Rebecca Rhodes Memorial Scholarship","North Country Goes Green Irish Festival Scholarship","J. Richard Gaffney & William K. Archer Academic Scholarship","J. Richard Gaffney & William K. Archer Career and Technical Education Scholarship","Terence M. O'Brien Academic Scholarship","Caswell Morgan Human Services Memorial Scholarship of the North Country Council of Social Agencies","Rotary Purple Heart Scholarship","10th Mountain Division (Light) Scholarship","Keith Brabant Music Scholarship","Frances Anderson Luck Foundation Scholarship","George C. Boldt Scholarship","North Pleasant Street Scholarship","Northpole Fire Company Scholarship","Timothy F. Wright Memorial Scholarship","Michelle D. Salisbury Memorial Scholarship","Ann B. Northrop “You’ll Never Walk Alone” Scholarship","Barbara D. and Robert J. Hanrahan Family Scholarship","Betty Evans Educational Scholarship","Beverly Colligan Family Scholarship","Black River Communities Corp. Inc. and James C. Cox Memorial Scholarship","Brittany Walroth Memorial Scholarship","Catherine C. Johnson Scholarship","Charles A. Campbell Scholarship","Charles and Fern Brown Scholarship","Charlotte J. Smith Scholarship","Chef Dennis J. Laemmermann Culinary Arts Scholarship","Chester F. Gray Scholarship","College Women’s Club of Jefferson County Scholarship","Daisy Allard Jamerson & Dorothy Jamerson Eckford Scholarship","Daphne A. Pickert Scholarship","Darrel Rippeteau Architecture Scholarship","Delos M. Cosgrove, Jr. Memorial Scholarship","Donald J. Grant Scholarship","Doris E. Carleton Scholarship","Douglas & Helen Murray Scholarship","Dr. Arthur C. Peckham Jr. Medical Scholarship","Dr. Douglas M. Sanford Scholarship","Edward Ruble Music Scholarship","Elena G. Van Eenenaam Education Scholarship","Elizabeth Joynt Haley Memorial Scholarship","Friends of Mercy Hospital Scholarship","Garry T. McGivney Scholarship","Gary Berry Creativity Award","Harry L. Minnich, Jr. “Mr. Fix-It” Memorial Scholarship","Heather Anderson Memorial Scholarship","Helen Lewicki Percoski Memorial Medical Scholarship","Henry H. & Emily T. Willmott Memorial Scholarship","Herring College Memorial Scholarship","Hyde-Stone Scholarship","Jan B. Summerville Legacy of Leadership Award","Janet Ostanek Memorial Scholarship","Jefferson Physician Organization Lewis Yecies, M.D., Memorial Scholarship","Joe Foti Memorial Scholarship","John C. Prentice Scholarship","John G. Pircsuk Memorial Scholarship","John W. Cobb Scholarship","Katie Stiegelbauer Memorial Scholarship","Kelli Johnson Memorial Scholarship","Kenneth J. Eysaman II Legacy Scholarship","Kenneth G. Trainor Scholarship","Margery J. Smith Scholarship","Margot Rhode Planned Parenthood Nursing Scholarship","Mark J. Wearne Memorial Music Scholarship","Marsellus Family Scholarship","Mary McGuire Mills Nursing Scholarship","Marine Corps League Detachment 961 Scholarship Award","Masters Family Farm Scholarship","Matt Doheny Scholarship","Merton P. Evans Agricultural Scholarship","Morse & Mary Dial Scholarship","North Country Human Resource Association Scholarship","North Side Legacy Scholarship","Otakie Family Scholarship","Pat Tubbs Award","Patrick R. Farmer Scholarship for the Arts","Pennies from Heaven Scholarship","Peter L. White Memorial Scholarship","Paul R. Haley Memorial Scholarship","Ralph F. Brouty Watertown Savings Bank Scholarship","Rev. Phillip A. Caruso Memorial Scholarship","Robert E. and Dora M. Belcher Scholarship","Robert J. Tompkins Scholarship","Rosamond Van Arnam Memorial Nursing Scholarship","Ryan D. Abel Memorial Scholarship","Ryan D. Ingalls Memorial Scholarship","Ryden Howard Frederick Scholarship","Sally Wilson Scholarship","Sarah Burgoon Memorial Scholarship","Shannon McAllister Brownson “Good Life” Scholarship","Shaw Harbor Foundation Scholarship","Shirley Ann Parker Scholarship","St. Lawrence County Board of REALTORS Community Scholarship","St. Lawrence County Board of REALTORS Family Scholarship","Susan Stone Memorial Scholarship","The Harbor Scholarship","The Perrine Agricultural Scholarship","The Watertown Elks Lodge No. 496 Scholarship","Thousand Islands Young Leaders Organization Scholarship","UpNComing Writers Award","Visiting Nurse Association (VNA) Scholarship","Watertown Morning Musicales Scholarship","Edison Cox Foundation Scholarship","Grace E. De Young Scholarship","Lost Individuals Seeking Healthy Answers “LISHA” Scholarship","Margaret F. Ryan Scholarship for Nursing","Mr. and Mrs. Sheridan E. Sullivan Educational Scholarship","Trooper David J. Lane Memorial Nontraditional Scholarship","Class of 1964 Excellence Award","Danielle Marie DeSetto Memorial Scholarship","Daryl Payne Memorial Scholarship","Donald and Jean Hennessey Scholarship","Dr. and Mrs. Reams A. Domser Scholarship","Edward G. Andrews Memorial Scholarship","Eugene Hendrickson Memorial Scholarship","Frank Yazowski Agriculture Award","Frederick Morgan Memorial Scholarship","Gertrude Smith Scholarship","Greg Huxley Jr. Memorial Scholarship","Heath B. Pritchard Memorial Scholarship","James Powell Memorial Music Award","Jeanette Talcot Pitcher Memorial Scholarship","Jeannette and Katrina Seiter Scholarship","Kenneth Lyon Sr. Scholarship","Kenneth V. Sawyer and Jeanette Remp Sawyer Scholarship","Marion Seavey and Doris Sanford Memorial Award","Mary Beth Durr Memorial Scholarship","Penny Doolen Prosser Memorial Award","Peter J. DeVoe Memorial Award","Robert Health Sr. Memorial Award","Robert E. Larrabee Memorial Scholarship","Thomas A. Maurer Memorial Scholarship","William “Bill” Bain Memorial Soccer Scholarship","Garlock Lumber & Hardware Scholarship","Jean McInnis Walldroff Fine Arts Scholarship","Mary Bastian Memorial Foundation Scholarship","Marie C. and Ralph J. Marilley Scholarship","Eulene and Dorrance D. Bush Scholarship","James, James and Virginia Burr Scholarship","John L. Gormley Scholarship","Winifred Christiansen Scholarship","Berry Brothers FFA Award","Julie L. Bettinger Memorial Scholarship","Friends of Michelle D. Salisbury Memorial Scholarship","Maurice L. Herron Memorial Scholarship","Richard and Gladys Ross Memorial Scholarship","David and Alma Price Scholarship","Michael J. Cerroni Memorial Scholarship","The DeWitt-Archer Scholarship","The Ethan Phillips Scholarship","The Kenneth Deskins Scholarship","The Lucy Fulton Scholarship","The Miller Hospital Scholarship","The Rhode Estate Scholarship","The Robert Jeschawitz Scholarship","The Terry Coffman Memorial Scholarship","Dorothy B. Ayers Memorial Scholarship","Anne T. and Emmett M. Fenlon Scholarship","Gina L. Rushlo Memorial Scholarship","Kelly Memorial Award","Don Cronk Memorial Scholarship","Mary and David Stanley Faith Fellowship Christian School Scholarship","Holland Memorial Scholarship","Donald and Bernice Gardner Memorial Scholarship","Florence Agnes White Scholarship","Gary West Faith-Based Scholarship","James and Janice St. Croix Scholarship","Clarence “Boots” Gaffney Award","Florence B. Joynt Scholarship","Gary Ashe Memorial Golf Scholarship","Terry O’Brien Memorial Scholarship","William P. Plante Scholarship","Gabriel Otero & Lexie Morgan Memorial Scholarship","Hazel Shannon Chapin and Maida Chapin Dougherty Scholarship","Indian River Education Association Scholarship","Jacob Pete Memorial Scholarship","Jon LaClair Award","Russell I Wilcox Family Scholarship","William C. Heck Memorial Scholarship","Elizabeth May Duvall Foundation Scholarship","Peyton Lane S. Morse Legacy Award","Simmons Family Scholarship","Robert and Esther Thompson Scholarship","Beatrice Gravely Memorial Art Scholarship","Dorothy M. Arthur Scholarship","Edward J. & Mary Doviak Scholarship","Edward Watkins Determination Scholarship Award","Henry C. Northam Scholarship","James Leonard Scholarship","Kenneth Ford Memorial Scholarship","Kirschner Music Scholarship","Kyle E. O’Brien Scholarship","Leon A. Davis Scholarship","Louis C. Marlane Scholarship for Math","Louis C. Marlane Scholarship for Science","Lowville Academy 2008 Scholarship","Marcia Dean Memorial Scholarship","Mary E. Butts Scholarship","Mary H. O’Connor Scholarship","Miller G. Sherwood Scholarship","Philip & Martha McDowell Scholarship","Richard A. Lyndaker Humanitarian Memorial Scholarship","Robert F. Breeze Scholarship","Wanda Lewicki Memorial Scholarship","Wormuth Family Scholarship","Ball and Knight Scholarship","Gene Derefinko Scholarship","Lyme Central School Scholarship","Alexander B. Fowler Memorial Award","Barbara Richmond Moran Memorial Scholarship","Carol Hunter Memorial Scholarship","Cecile Timerman Williams Memorial Scholarship","Charles F. Zeltwanger Memorial Scholarship","Cindy Dwyer Memorial Scholarship","Coach Steve Fisher Legacy Scholarship","Cora Bura Scholarship","Dick P. Case Memorial Scholarship","Donald J. Grant Memorial Scholarship","Eleanor Walrath Memorial Scholarship","Francis Grant Memorial Scholarship","Gertrude E. Glasier Scholarship","Gilbert Lamon Memorial Award","Glen Park Hydro Scholarship","Jay Peckham Wrestling Award","Jeanne Lane Plantz Memorial Scholarship","Leslie G. Eisenhauer Memorial Scholarship","Marguerite E. Brewster Memorial Scholarship","Merrill & Vivian Hurd Memorial Scholarship","Mighty Lion Wrestling Scholarship","Molly J. Bogenschutz Endless Possibilities Award","Purwillia “Pug” Weideman Nursing Scholarship","Ralph B. Doane Memorial Scholarship","Raymond W. Marlowe Memorial Scholarship","Ron Siver Outstanding Lineman Award","Sam Johnson Memorial Scholarship","Terry Hanson Memorial Scholarship","Tracy Ashley Memorial Scholarship","Trooper David J. Lane “Heart of a Lion” Scholarship","Trooper David J. Lane Memorial Scholarship","Dr. Allen A. & Joan Taylor Education Scholarship","Learned J. and Janet Langlois Memorial Scholarship","Lorraine Power Tharp Scholarship","William “Billy” Todd Memorial Scholarship","Wing/Bishop/Patterson Scholarship","OFA Alumni Scholarship","Francisco Clark – Bouchard Memorial Scholarship","Karen Kirchgasser Memorial Scholarship","Kocan Family Scholarship","Michael Matthys Memorial Scholarship","Sipher Scholarship","Smith Family Award","Susan Williams Bullard Award","April Resseguie Memorial Scholarship","Assistant Fire Chief Garrett W. Loomis Memorial Scholarship","Carl Robbins Memorial Scholarship","Donald J. Bachner Memorial Community Service Scholarship","Donald T. McPhail Scholarship","Dr. Charles E. Commeret, Sr. Scholarship","Jana L. Boulton Memorial Scholarship","Patrick X. & Mary E. Brennan Scholarship","Pauline and Alfred Lyng Scholarship","Ralph E. Smith Graduate Scholarship","Ralph E. Smith Undergraduate Scholarship","Sergeant James G. Everett Scholarship","Al Thomas Memorial Scholarship","Albert F. & Rachel W. Hyde Scholarship","Andrew J. Stevenson Memorial Scholarship","Anna Mae Searles Cooper Scholarship","Anthony Lephart Memorial Scholarship","Barbara Richmond Moran Scholarship","Berry Brothers Lumber FFA Award","Brian C. Thomas Scholarship","Class of 1967 Scholarship","Dan & Mabel Griggs Higher Education Scholarship","David A. Sinclair Scholarship","Donald & Arlene Moore Scholarship","Doris Heath Reading Award","Edward Blackford IV Memorial Scholarship","Eleanor Greene Memorial Scholarship","Enzo Greenwood Coinco Scholarship","Evelyn Avery Award","Frederick N. Scholtz Scholarship","Grant & Joyce Crumb Memorial Scholarship","Greenley / Wyman Scholarship","Henry Coffeen Memorial Scholarship","International Water Level Coalition Scholarship","Jeff Gregory Scholarship","John Booth Memorial Scholarship","Joshua P. Sullivan Pharm.D. Legacy Scholarship","Kathleen Graves Scholarship","Kirk Steele Scholarship","Leuze-Reardon-Belloff Scholarship","Lucas Damon Scholarship","Luke A. Tyrrell Memorial Scholarship","Marcus Judson Memorial Scholarship","Margaret “Ann” Kibling Memorial Scholarship","Marion Blount Public Speaking Memorial Scholarship","Maude Fleming Scholarship Award","Maureen Preskenis Scholarship","Nicholas J. Patell Memorial Award","Patricia Lephart Scholarship","Richard and Donna Bibbins Empowerment Scholarship","Robert Barrows Scholarship","Robert L. Shippee Memorial Scholarship","Ruth Hannah Nichols Scholarship","SPENNY15 Scholarship","South Jefferson High School Class of 1966 Scholarship","South Jefferson High School Class of 1967 Scholarship","Stephanie (Mathous) Bossinger Team Player Award","Timothy M. Reynolds III Scholarship","Wilson Davis Award","William F. & Ernestine K. Kellerhals Sr. Helping Professionals Scholarship","Barry L. Mills Beechwood Scholarship","Carl H. Frink Scholarship","Episcopal River Parishes Scholarship","Gerald Reinman Scholarship Class of 1954 Scholarship","Greenizen Scholarship","Mary M. & George W. Forbes Thousand Islands Central School Scholarship","Scott Fiorentino Athletic Memorial Scholarship","Stumpf Farm Productions Scholarship","Lyon Family Scholarship","Alfred & Frances Paige Scholarship","Brian D. Soper Memorial Scholarship","Cathleen A. Haggerty Scholarship","Christopher P. Waite Memorial Scholarship","Colleen St. Pierre Scholarship","Douglas A. Medley Education Scholarship","Douglas W. Wood Music Scholarship","Dr. Charles E. Commeret, Sr. Memorial Scholarship","Dr. Errol Putman Scholarship","Frank Sacci Instrumental Scholarship","Gail Conlin Phillips Memorial Scholarship","Gary M. Jones Memorial Scholarship","Glenn S. Doull Scholarship","Harvey Simon Scholarship","Hiram Duane Buck Scholarship","Jeffrey W. Kimball MBA, WHS Class of 2003 Scholarship","Jennifer Corbett Rainbow Scholarship","John R. Williamson Scholarship","Mary Alice & Joseph B. Meichelbeck Scholarship","Maurice D. Barnette Scholarship","Russell Faunce Scholarship","Watertown High School Class of 1956 Scholarship","Watertown High School Class of 1967 Scholarship","Watertown High School Class of 1982 Scholarship","Watertown Savings Bank Cup Scholarship","William I. Graf Award","Brian A. L’Huillier BOCES Scholarship","Dr. Walter and Mary Atkinson Legacy Scholarship","Excellence of Achievement & Outstanding Academic Achievement Awards","Jefferson-Lewis BOCES Scholarship","Ruth Seal Memorial Scholarship (Jefferson BOCES)","Thousand Islands Foundation Scholarship","Thousand Islands Foundation Nontraditional Scholarship","Clayton Volunteer Fire Department Foundation Scholarship","Daniel Ekpe Scholarship","Elizabeth (Betty) Streets Scholarship","Grindstone Island Heritage Scholarship","Grindstone Island Mary Lou Nunn Rusho Memorial Scholarship","Hazel Northrup Hyde Family Scholarship","John and Eva Argyos Scholarship","Lechler Scholarship","Margaret Maser Scholarship","Mark Schmeer Scholarship","Ruth and Robert Phillips Scholarship","Seaway Trail Foundation Scholarship","Adirondack Mennonite Camping Association Scholarship","Henderson Harbor Water Sports Programs Scholarship","Rev. Peter N. Butler Guggenheim Summer Camp Scholarship","Women's Council of REALTORS Tri-County NY Scholarship","Trisomy 21 Foundation of Northern New York"];

export default {
  /* ---------------- Amazon Future Engineer ---------------- */
  'https://www.amazonfutureengineer.com/scholarships': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Amazon Future Engineer Scholarship', provider_org: 'Amazon Future Engineer (Amazon)', provider_type: 'other',
      apply_url: 'https://www.amazonfutureengineer.com/scholarships', source_url: 'https://www.amazonfutureengineer.com/scholarships',
      amount: { min: 0, max: 40000, renewable: true, note: 'Covers unmet financial need up to $10,000 per year for four years, plus a paid Amazon internship' },
      deadline: null, cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'need',
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Be a high school senior in the U.S.')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident', 'refugee_asylee', 'daca_tps'], 'Must be authorized to work in the U.S. Example: Employment Authorization Document holder, Permanent Resident, or U.S. Citizen.')),
        G(H('academic.gpa', 'gte', 2.3, 'Have a minimum cumulative grade point average of 2.3 on a 4.0 scale')),
        G(H('academic.cip_codes', 'prefix_any', ['11', '14.09', '14.10', '27.01', '27.03', '30.70', '30.25'], 'Be planning to attain a bachelor’s degree in computer science, software engineering, computer engineering, electrical engineering, or other computer science related field of study'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'up to $10,000 per year for four years and a paid summer internship at Amazon' },
        { field: 'deadline', source_quote: 'Sign up for our newsletter to be the first to know when the next cycle opens' },
        { field: 'need_based', source_quote: 'Must demonstrate financial need' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Must have taken (or be taking) a high school or dual-enrollment computer science course, or opt in to an Amazon assessment instead (no coursework field)',
      'Work authorization is approximated with citizenship values; EAD holders other than DACA/TPS map to "other"'
    ],
    notes: 'The 2025-2026 cycle is closed and no next deadline is given, so deadline null and cycle_status closed. Eligible majors include a long related-majors list (CS, computer/software/electrical engineering, math, data science, information systems, cognitive science, informatics, IT, transportation technology); CIP prefixes are an approximation. FAQ says awards renew up to three years, while the headline says four years/$40,000; the headline figure is used.'
  },

  /* ---------------- California FFA news ---------------- */
  'https://calaged.org/news/90000-awarded-state-ffa-scholarships': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'A 2022 news item about state FFA scholarships already awarded. It mentions requirements (State FFA Degree, agriculture major) and that applications are typically due in December, but there is no application or award detail. News, not an application page.'
  },

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
    notes: 'The $15,000 is the total pool for 5 winners, so no per-award amount is recorded. Whether graduate students count as "college students" is a judgment call.'
  },

  /* ---------------- CSA: Raymond A. Tice ---------------- */
  'https://www.csascholars.org/tice1/index.php/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Raymond A. Tice Scholarship', provider_org: 'Raymond A. Tice Scholarship (administered by the Center for Scholarship Administration, Inc.)', provider_type: 'other',
      apply_url: 'https://www.csascholars.org/tice1/index.php/', source_url: 'https://www.csascholars.org/tice1/index.php/',
      amount: { min: 0, max: 0, note: noAmount },
      deadline: '2027-02-18', cycle_status: 'upcoming',
      eligibility: [],
      provenance: [
        { field: 'deadline', source_quote: 'The application will be open from January 7, 2027 until February 18, 2027' }
      ],
      verified_at: V, confidence: 0.55
    }],
    notes: 'Application portal landing page. It states only the next application window; no eligibility, amount or level is given, so eligibility is empty (unknown, not truly open to all).'
  },

  /* ---------------- HBAIE ---------------- */
  'https://www.hbaie.com/Scholarship': {
    page_type: 'single', is_scholarship_page: true, scholarships: [],
    follow_links: ['https://www.hbaie.com/resources/Documents/2026-HBAIE-Scholarship-Letter-and-Application.pdf'],
    award_names: ['HBAIE Scholarship'],
    notes: 'The Scholarships page of the Hispanic Bar Association of the Inland Empire contains only a link to the 2026 scholarship letter and application PDF. No award facts are in the snapshot text, so no record is extracted.'
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
        { field: 'need_based', source_quote: 'awarded on the basis of merit' }
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
      notes: 'Two tiers (freshman and upper-class) of the Houston Area section award, split into two records. The page mentions letters of recommendation and resumes but no count; recs_required 1 is a minimum guess. No amounts or deadlines. The upper-class tier covers students enrolled in or transferring from a community college to a 4-year ABET program.'
    };
  })(),

  /* ---------------- IBEW news ---------------- */
  'https://ibew.org/ibew-members-children-awarded-union-plus-scholarships/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'A 2016 news story about IBEW members\' children who won Union Plus scholarships. Recipient profiles only; not an application page.'
  },

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
        G(H('affiliations.fraternal[].org', 'eq', 'Knights of Columbus', 'The child of a member of Council 4678 in good standing')),
        G(H('affiliations.fraternal[].chapter', 'eq', 'Council 4678', 'The child of a member of Council 4678 in good standing')),
        G(
          H('affiliations.fraternal[].member', 'eq', 'parent', 'The child of a member of Council 4678 in good standing'),
          H('affiliations.fraternal[].member', 'eq', 'grandparent', 'The grandchild of a member of Council 4678 in good standing must be from the State College area')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'One $1,000 scholarship will be awarded' },
        { field: 'deadline', source_quote: 'DEADLINE IS DEC 15, 2024' },
        { field: 'effort', source_quote: 'Attach a copy of your SAT or ACT scores' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'Grandchildren of members must also be from the State College (PA) area or surrounding school systems; this condition applies only to the grandchild branch and cannot be expressed per-branch',
      'Member must be "in good standing" (no standing field)'
    ],
    notes: 'Stale 2025 (2024-2025 academic year) application; deadline passed. SAT/ACT scores are required, mapped to effort.formats test. No essay is requested.'
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
        { field: 'deadline', source_quote: 'will remain open until January 31, 2023' }
      ],
      verified_at: V, confidence: 0.6
    }],
    notes: 'AMBIGUOUS: a November 2022 news post announcing the 2023 NESA scholarship cycle, with eligibility and dates. Labeled single (stale, closed) because it describes how to apply; not_scholarship (news) is a defensible alternative. The apply link is the portal named in the text.'
  },

  /* ---------------- NIAF press release ---------------- */
  'https://www.niaf.org/niaf_event/scholarships-and-grants-available-through-the-national-italian-american-foundation/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'NIAF Scholarship Program', provider_org: 'National Italian American Foundation', provider_type: 'nonprofit',
      apply_url: 'https://www.niaf.org/scholarships',
      source_url: 'https://www.niaf.org/niaf_event/scholarships-and-grants-available-through-the-national-italian-american-foundation/',
      amount: { min: 2000, max: 10000, note: 'Program-wide range across more than 100 annual scholarships' },
      deadline: '2012-03-02', cycle_status: 'closed',
      geo_scope: { level: 'national' }, need_based: 'merit',
      eligibility: [
        G(
          H('identity.heritage', 'contains_any', ['Italian'], 'must be of Italian descent, with at least one ancestor who has emigrated from Italy'),
          F('Applicant majors or minors in the Italian language, Italian studies, Italian-American studies or a related field', ['academic.majors', 'academic.cip_codes', 'academic.concentration'], 'a student of any ethnic background majoring or minoring in the Italian language, Italian studies, Italian-American studies or a related field')
        ),
        G(H('academic.gpa', 'gte', 3.5, 'Students must have a minimum GPA of 3.5 to apply'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'more than 100 annual scholarships ranging from $2,000 to $10,000 each' },
        { field: 'deadline', source_quote: 'Application deadline is March 2, 2012' },
        { field: 'need_based', source_quote: 'NIAF scholarship recipients are selected based on academic merit' }
      ],
      verified_at: V, confidence: 0.6
    }],
    notes: 'AMBIGUOUS: a December 2011 press release announcing the 2012-2013 scholarship program (and organizational grants, which are not student awards). Very stale. Labeled single for the scholarship program; not_scholarship (old news) is defensible. apply_url comes from "www.niaf.org/scholarships" in the text.'
  },

  /* ---------------- NNYCF listing ---------------- */
  'https://nnycf.org/scholarships/scholarships-available/': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [],
    award_names: NNYCF_NAMES,
    follow_links: [
      'https://nnycf.org/wp-content/uploads/2022/12/RENY_Scholarship_Application_22-23.pdf',
      'https://www.nnycf.org/wp-content/uploads/2022/02/Jefferson_County-Sons_of_American-Legion_Brian_A_LHuillier_Memorial_Scholarship_2022.pdf',
      'https://nnycf.org/wp-content/uploads/2023/03/Keith_Brabant_Music_Scholarship_2023.pdf',
      'https://www.nnycf.org/wp-content/uploads/2020/01/Thoughtful_Legacies_Willmott.pdf',
      'https://nnycf.org/wp-content/uploads/2023/01/SLC_Family_Scholarships_2023.pdf',
      'https://nnycf.org/wp-content/uploads/2023/01/2023_MarieC_RalphJ_Marilley_Scholarship.pdf',
      'https://nnycf.org/wp-content/uploads/2023/03/Michael_J_Cerroni_Memorial_Scholarship.pdf',
      'https://www.nnycf.org/wp-content/uploads/2022/04/2022_Donald_Bernice_Gardner_Memorial_Scholarship.pdf',
      'https://nnycf.org/wp-content/uploads/2023/04/2023_Wright_Scholarship.pdf',
      'https://www.nnycf.org/wp-content/uploads/2020/02/WCR_scholarship.pdf'
    ],
    notes: 'Long list of named funds grouped by school district. Most entries are names only (no amount, deadline or eligibility), so no records. A few carry one-line hints (Russell I. Wilcox: Thousand Islands Bridge Authority employees/retirees and their children or grandchildren; Evergreen STEM: St. Lawrence County juniors, Class of 2027; deadlines from 2023 for Wright and Salisbury). Many links go to a common login portal (grantinterface), which is not an individual award page and is excluded from follow_links. Summer camp and professional development "scholarships" are included in award_names. Names repeated across districts are listed once.'
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
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        { ...base, name: 'Derek Ian Arnold Annual Scholarship', amount: { min: 1200, max: 1200 },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'eq', 'Delta High School', 'graduating class at Delta High School')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating class at Delta High School'),
            ft('be enrolled full-time in undergraduate studies in an accredited four-year higher education school')
          ],
          provenance: [{ field: 'amount', source_quote: '1 Scholarships – $1200' }, cycle], confidence: 0.75 },
        { ...base, name: 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships',
          amount: { min: 1750, max: 2500, note: 'Rotary Club of Sacramento Foundation: 2 x $2,500; Robinson Crowell: 2 x $1,750' },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'in', ['C. K. McClatchy High School', 'Sacramento Charter High School', 'West Campus High School'], 'McClatchy, Sacramento Charter and West Campus High Schools')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating classes, not be the son or daughter of a Rotarian'),
            ft('enroll full-time in undergraduate studies in an accredited 4-year university or junior college transferring to a 4-year university')
          ],
          provenance: [{ field: 'amount', source_quote: 'Rotary Club of Sacramento Foundation: 2 Scholarships – $2500 each; Robinson Crowell: 2 Scholarships – $1750 each' }, cycle], confidence: 0.7 },
        { ...base, name: 'Harold and Lilla Strauch Annual Scholarship', amount: { min: 2500, max: 2500 },
          geo_scope: { level: 'city', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('geo.high_school', 'eq', 'Rio Americano High School', 'graduating classes at Rio Americano High School')),
            senior('Candidates must be high school seniors in the academic upper one-third of their graduating classes at Rio Americano High School'),
            ft('enroll full-time in undergraduate studies in an accredited four-year college')
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $2500' }, cycle], confidence: 0.75 },
        { ...base, name: 'Philip and Joan Knox Scholarship', amount: { min: 0, max: 0, note: noAmount },
          deadline_kind: undefined, cycle_status: 'unknown',
          geo_scope: { level: 'city', states: ['CA'] }, need_based: 'need',
          eligibility: [
            G(H('geo.high_school', 'eq', 'Jesuit High School', 'Incoming and returning students at Jesuit High School are eligible to apply')),
            G(F('Applicant demonstrates academic promise', ['academic.gpa', 'activities.competitions'], 'demonstrate academic promise'))
          ],
          provenance: [{ field: 'need_based', source_quote: 'have a financial need' }], confidence: 0.55 },
        { ...base, name: 'Susan and Jon R. Snyder Annual Scholarship Fund', amount: { min: 0, max: 0, note: noAmount },
          deadline_kind: undefined, cycle_status: 'unknown',
          geo_scope: { level: 'city', states: ['CA'] }, need_based: 'need',
          eligibility: [
            G(H('geo.high_school', 'eq', 'Cristo Rey High School (Oakland)', 'an eighth grader enrolling at Cristo Rey High School (Oakland) or a student currently enrolled at Cristo Rey'))
          ],
          provenance: [{ field: 'need_based', source_quote: 'leadership qualities, and financial need' }], confidence: 0.55 },
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
            ft('enroll full-time in undergraduate studies in an accredited 4-year university or community college transferring to a 4-year university')
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $5,000 each' }, cycle], confidence: 0.75 }
      ].map(s => { const o = { ...s }; if (o.deadline_kind === undefined) delete o.deadline_kind; return o; }),
      award_names: ['Derek Ian Arnold Annual Scholarship', 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships', 'Harold and Lilla Strauch Annual Scholarship', 'Philip and Joan Knox Scholarship', 'Susan and Jon R. Snyder Annual Scholarship Fund', 'Oleta Lambert Scholarship', 'Jim and Mary Jo Streng Scholarship'],
      vocabulary_gaps: [
        'Class rank ("academic upper one-third of their graduating class") has no field',
        'Exclusion of children of Rotarians ("not be the son or daughter of a Rotarian") cannot be expressed as a no-element-matches rule',
        'Good standing at the present school (Knox, Snyder) has no field'
      ],
      notes: 'The page says 2025-26 applications are open but also that the next cycle runs January through April, so the next deadline is an April estimate with no year (deadline null, annual_estimate, upcoming). Knox and Snyder are applied for through the schools and appear to fund high school tuition (incoming/returning students, eighth graders), so no deadline or status rule is set. Oleta Lambert gives no class-level rule. The Robinson Crowell heading covers two parallel awards with different amounts, kept as one record with a range.'
    };
  })(),

  /* ---------------- RSF Foundation ---------------- */
  'https://rsffoundation.org/rsf-foundation-grants-200000-for-advancing-education/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Blog post about grants to nonprofit organizations (A Step Beyond, Casa de Amistad). Grants to organizations, not student scholarships.'
  },

  /* ---------------- SDCEC listing ---------------- */
  'https://www.sandiegoengineers.org/stem/scholarships': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [],
    award_names: [
      'ACEC California San Diego Scholarship', 'AIAA San Diego Reuben H. Fleet Scholarship', 'ASCE San Diego Student Scholarship', 'ASHRAE San Diego Scholarship',
      'ASM San Diego Scholarship', 'AWIS San Diego Scholarship', 'ITE San Diego Scholarship', 'SEAOSD Student Scholarship', 'SHPE San Diego Scholarship',
      'SWE San Diego Scholarship', 'WTS San Diego Scholarship',
      'AIAA High School Student Scholarships', 'ASCE Scholarships', 'ASHRAE High School Senior Scholarships', 'ASM Foundation Scholarships', 'NSBE Scholarships',
      'NSPE Scholarships', 'SHPE ScholarSHPE', 'SWE Scholarships', 'WiCyS Scholarships'
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
    notes: 'Directory of local engineering-society section scholarships (with deadlines) and national society scholarships (with typical deadlines). No amounts or eligibility per award, so no records. Award names are built from the society names on the page since most entries are not given formal award names.'
  },

  /* ---------------- North Island Credit Union (SDUSD, 2022) ---------------- */
  'https://www.sandiegounified.org/about/newscenter/archived_news/north_island_credit_union_offering_scholarships': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'North Island Credit Union Student Scholarship Program', provider_org: 'North Island Credit Union', provider_type: 'other',
      apply_url: 'http://www.northisland.ccu.com/studentscholarship',
      source_url: 'https://www.sandiegounified.org/about/newscenter/archived_news/north_island_credit_union_offering_scholarships',
      amount: { min: 1000, max: 1000 }, deadline: '2022-04-08', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad'],
      effort: { essay_words: null, recs_required: 1 },
      eligibility: [
        G(H('geo.county', 'eq', 'San Diego County, CA', 'students in San Diego County to apply for its 2022 Student Scholarship Program')),
        G(
          H('academic.status', 'eq', 'hs_senior', 'high school seniors and community college students transferring to a four'),
          H('academic.enrollment', 'eq', 'transfer', 'high school seniors and community college students transferring to a four')
        ),
        G(H('academic.gpa', 'gte', 3.0, 'who maintain a minimum grade point average of 3.0 are eligible to participate'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'the credit union awards 20 scholarships of $1,000 each' },
        { field: 'deadline', source_quote: 'applications will be accepted through April 8, 2022' },
        { field: 'effort', source_quote: 'a letter of recommendation, and an essay submission' }
      ],
      verified_at: V, confidence: 0.75
    }],
    notes: 'Archived 2022 district news item about the credit union\'s 2022 program; stale. The program also covers LA, Orange and Riverside counties per the last paragraph, but this article states San Diego County eligibility. Deadline April 8, 2022.'
  },

  /* ---------------- North Island Credit Union Foundation (SDCOE, 2025) ---------------- */
  'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/north-island-credit-union-foundation-offering-scholarships-to-san-diego-county-students': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'North Island Credit Union Foundation Student Scholarship Program', provider_org: 'North Island Credit Union Foundation', provider_type: 'nonprofit',
      apply_url: 'http://northisland.ccu.com/studentscholarship',
      source_url: 'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/north-island-credit-union-foundation-offering-scholarships-to-san-diego-county-students',
      amount: { min: 1000, max: 1000 }, deadline: '2025-03-07', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad'],
      effort: { essay_words: null, recs_required: 1 },
      eligibility: [
        G(
          H('geo.county', 'in', ['San Diego County, CA', 'Riverside County, CA'], 'who reside in San Diego and Riverside counties'),
          H('affiliations.member_org[].name', 'eq', 'North Island Credit Union', 'Scholarships are also available to North Island Credit Union members or their dependents residing in any geographic area')
        ),
        G(
          H('academic.status', 'eq', 'hs_senior', 'college-bound high school seniors and community college students transferring to a four-year university'),
          H('academic.enrollment', 'eq', 'transfer', 'college-bound high school seniors and community college students transferring to a four-year university')
        ),
        G(H('academic.gpa', 'gte', 3.0, 'Students must maintain a minimum grade point average of 3.0 to be eligible to participate'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Apply For $1,000 scholarships' },
        { field: 'deadline', source_quote: 'Online applications will be accepted through Friday, March 7, 2025' },
        { field: 'effort', source_quote: 'a letter of recommendation and an essay submission' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Dependents of credit union members also qualify; member_org has no relationship field, so the rule only matches the member themself'],
    notes: 'January 2025 SDCOE news post about the 2025 cycle; deadline passed. Same program as the 2022 SDUSD article (overlap test), now run by the Foundation with a broader residency rule.'
  },

  /* ---------------- SDCOE opportunities roundup ---------------- */
  'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/scholarship-and-award-opportunities-for-san-diego-county-students': {
    page_type: 'listing', is_scholarship_page: true,
    scholarships: [
      {
        name: 'Institute of Transportation Engineers San Diego Chapter Scholarship', provider_org: 'Institute of Transportation Engineers, San Diego Chapter', provider_type: 'professional_society',
        apply_url: 'https://sandiegoite.org/scholarship',
        source_url: 'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/scholarship-and-award-opportunities-for-san-diego-county-students',
        amount: { min: 1000, max: 1000 }, deadline: '2026-09-25', cycle_status: 'closed',
        geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior'],
        eligibility: [
          G(H('academic.status', 'eq', 'hs_senior', 'a high school senior graduating in 2027')),
          G(F('Applicant plans to pursue a career in transportation engineering or a related field', ['career.field', 'academic.majors', 'academic.cip_codes'], 'plans to pursue a career in transportation engineering or related field'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'awarding one $1,000 scholarship' },
          { field: 'deadline', source_quote: 'The application deadline is Sept. 25.' }
        ],
        verified_at: V, confidence: 0.65
      },
      {
        name: 'Coca-Cola Scholars Program Scholarship', provider_org: 'Coca-Cola Scholars Foundation', provider_type: 'private_foundation',
        apply_url: 'https://www.coca-colascholarsfoundation.org/apply/',
        source_url: 'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/scholarship-and-award-opportunities-for-san-diego-county-students',
        amount: { min: 20000, max: 20000 }, deadline: '2026-09-30', cycle_status: 'open',
        geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'merit',
        eligibility: [
          G(H('academic.status', 'eq', 'hs_senior', 'high school seniors who plan to graduate during the 2026-27 academic year'))
        ],
        provenance: [
          { field: 'amount', source_quote: 'an achievement-based scholarship of $20,000 awarded to 150 high school seniors' },
          { field: 'deadline', source_quote: 'The application deadline is Sept. 30.' },
          { field: 'need_based', source_quote: 'achievement-based scholarship' }
        ],
        verified_at: V, confidence: 0.7
      }
    ],
    award_names: ['Institute of Transportation Engineers Scholarship', 'Coca-Cola Scholars Program Scholarship'],
    follow_links: ['https://sandiegoite.org/scholarship', 'https://www.coca-colascholarsfoundation.org/apply/'],
    vocabulary_gaps: ['ITE requires graduation in 2027 specifically (grad-year match not expressible with the grad_date string ops)'],
    notes: 'Roundup post dated April 1, 2026. Deadlines are given as month/day only ("Sept. 25", "Sept. 30"); the year 2026 is inferred from the post date and the class of 2027 / 2026-27 context, so ITE is closed and Coca-Cola is open. San Diego Promise info nights and Cal-SOAP workshops are not specific awards and are not extracted. The ITE award is presented to San Diego County students but the text states no county requirement, so no county rule.'
  },

  /* ---------------- SDSU portal ---------------- */
  'https://sdsu.academicworks.com/opportunities/13777': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'San Diego Padres Veterans Endowed Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/13777', source_url: 'https://sdsu.academicworks.com/opportunities/13777',
      amount: { min: 0, max: 0, note: 'To be determined by the scholarship committee' }, deadline: '2026-04-10', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad', 'grad'],
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('affiliations.military[].who', 'eq', 'self', 'Recipients must be active duty service members, reservists, National Guard, and/or veterans of the United States Armed Forces. [Family members do not qualify]')),
        G(H('affiliations.military[].status', 'in', ['active', 'reserve', 'guard', 'veteran', 'retired'], 'Recipients must be active duty service members, reservists, National Guard, and/or veterans of the United States Armed Forces')),
        G(H('academic.cip_codes', 'prefix_any', ['52'], 'Recipients must be pursuing a major or minor in the Fowler College of Business'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' }
      ],
      verified_at: V, confidence: 0.85
    }],
    notes: 'Business major or minor mapped to CIP family 52; minors are not captured by cip_codes. Part-time allowed for undergraduate and graduate students, so no enrollment rule.'
  },

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
        G(H('financial.fafsa_filed', 'is_true', undefined, 'Applicants must file a Free Application for Federal Student Aid (FAFSA) or the California Dream Act Application')),
        G(F('Applicant is involved with an SDSU-approved woman-affiliated student organization that is open to all SDSU students', ['affiliations.professional', 'activities.extracurricular'], 'Recipients must be involved with an SDSU approved woman-affiliated student organization'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' },
        { field: 'need_based', source_quote: 'Recipients must have financial need, as determined by the SDSU Financial Aid Office' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [
      'California Dream Act Application filers also qualify, but fafsa_filed may not capture a CADAA filing',
      'Membership in a specific kind of campus organization (woman-affiliated SDSU student org) has no field'
    ],
    notes: 'Part-time enrollment allowed, so no enrollment rule.'
  },

  /* ---------------- SWE national flyer ---------------- */
  'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'SWE Scholarships', provider_org: 'Society of Women Engineers', provider_type: 'professional_society',
      apply_url: 'https://swe.org/scholarships',
      source_url: 'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf',
      amount: { min: 1000, max: 20000, renewable: true, note: 'Individual scholarships range from $1,000 to $20,000; many renewable' },
      deadline: null, cycle_status: 'upcoming',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad', 'returning'],
      eligibility: [
        G(H('identity.gender', 'eq', 'woman', 'A person who identifies as a woman')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'returning'], 'An incoming freshman through Ph.D. student')),
        G(
          H('academic.enrollment', 'eq', 'full_time', 'Studying engineering full-time (exceptions made for re-entry/non-traditional students)'),
          H('academic.status', 'eq', 'returning', 'Studying engineering full-time (exceptions made for re-entry/non-traditional students)')
        ),
        G(H('academic.cip_codes', 'prefix_any', ['14', '15', '11'], 'pursuing undergraduate or graduate degrees in engineering, engineering technology, or fields related to engineering'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Individual scholarships range from $1,000 to $20,000' },
        { field: 'deadline', source_quote: 'SWE Scholarship Applications open late fall/early winter each academic year' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: ['Program must be ABET or Washington Accord accredited (or a SWE Global Affiliate in India); no accreditation field'],
    notes: 'A 2023 national flyer for the SWE general application covering many scholarships. No deadline; applications open late fall/early winter each year, so the next cycle is treated as upcoming. Computing (CIP 11) is included because the flyer names computing programs.'
  },

  /* ---------------- Teamsters Local 542 ---------------- */
  'https://www.teamsters542.org/scholarships/': (() => {
    const src = 'https://www.teamsters542.org/scholarships/';
    const teamster = (q) => G(H('affiliations.union[].name', 'eq', 'International Brotherhood of Teamsters', q));
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
          name: 'Teamsters Scholarship Fund', provider_org: 'International Brotherhood of Teamsters', provider_type: 'union',
          apply_url: 'http://www.teamster.org/scholarships', source_url: src,
          amount: { min: 2000, max: 2000 }, deadline: '2026-04-01', cycle_status: 'closed',
          geo_scope: { level: 'national' }, need_based: 'either',
          eligibility: [
            teamster('for children and financial dependents of Teamsters members, including BLET, BMWED, and TCRC members')
          ],
          provenance: [
            { field: 'amount', source_quote: '600 one-time $2,000 scholarships' },
            { field: 'deadline', source_quote: 'Deadline: April 1, 2026' },
            { field: 'need_based', source_quote: 'and financial need' }
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
      notes: 'Local union bulletin board listing four union scholarships. The Teamsters Scholarship Fund deadline (April 1, 2026) is listed on the page next to the 2025-2026 fund description; used as given. Union name canonicalized as International Brotherhood of Teamsters.'
    };
  })(),

  /* ---------------- UCSD portal ---------------- */
  'https://ucsd.academicworks.com/opportunities/5870': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Asian/Pacific-Islander Alumni Council Scholarship', provider_org: UCSD, provider_type: 'university',
      apply_url: 'https://ucsd.academicworks.com/opportunities/5870', source_url: 'https://ucsd.academicworks.com/opportunities/5870',
      amount: { min: 0, max: 2250 }, deadline: '2026-04-02', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'],
      effort: { essay_words: null },
      eligibility: [
        G(H('academic.institution', 'eq', UCSD, 'UC San Diego Scholarships')),
        G(H('academic.status', 'eq', 'undergrad', 'Undergraduate students in all majors')),
        G(H('identity.first_gen', 'is_true', undefined, 'The Award recognizes first generation students')),
        G(F('Applicant has demonstrated commitment to the advancement of Asian and Pacific Islander heritage leadership, mentorship, education and community building', ['activities.leadership', 'activities.extracurricular', 'identity.heritage'], 'demonstrated commitment to the advancement of Asian and Pacific Islander heritage leadership, mentorship, education and community building'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'up to $2250' },
        { field: 'deadline', source_quote: '04/02/2026' },
        { field: 'effort', source_quote: 'Essay responses should be 1-2 pages' }
      ],
      verified_at: V, confidence: 0.8
    }],
    notes: 'Essay length is given in pages (1-2 pages), not words, so essay_words is null. API heritage itself is not required; the commitment to API communities is a fuzzy rule.'
  },

  /* ---------------- CSAC Middle Class Scholarship brochure ---------------- */
  'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Middle Class Scholarship', provider_org: 'California Student Aid Commission', provider_type: 'government',
      apply_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      source_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      amount: { min: 0, max: 0, renewable: true, note: 'Between 10% and 40% of UC/CSU system-wide tuition and fees; amounts vary by student and state funding' },
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
        G(F('Applicant\'s family income and assets do not exceed $156,000', ['financial.income_band', 'financial.sai', 'financial.dependency'], 'have family income and assets not exceeding $156,000'))
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
      'Eligibility is limited to 4 years',
      'Applying requires a FAFSA or California Dream Act Application; CADAA filers are not captured by financial.fafsa_filed'
    ],
    notes: 'State program brochure (not a form). Deadline is "March 2nd" with no year, so null/annual_estimate; the FAFSA/CADAA window opens October 1, so the next cycle is upcoming. The brochure has no separate apply link, so apply_url is the brochure itself (application is through FAFSA/CADAA). Amounts are percentages of tuition, not dollars.'
  }
};
