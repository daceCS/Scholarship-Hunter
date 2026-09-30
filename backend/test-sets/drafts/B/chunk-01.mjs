// Chunk 01 draft labels, slot B. Drafted independently from the saved page text only.
const V = '2026-09-29';
const H = (field, op, value, quote) => (value === undefined
  ? { field, op, kind: 'hard', source_quote: quote }
  : { field, op, value, kind: 'hard', source_quote: quote });
const F = (description, relevant_fields, quote) => ({ kind: 'fuzzy', description, relevant_fields, source_quote: quote });
const G = (...rules) => ({ any_of: rules });
const SDSU = 'San Diego State University';
const UCSD = 'University of California, San Diego';
const TBD = 'Amount not stated (to be determined by the scholarship committee)';
const TEAMSTERS = 'International Brotherhood of Teamsters';
const notRotarian = F('Applicant is NOT the son or daughter of a Rotarian', ['affiliations.fraternal[].org', 'affiliations.fraternal[].member'], 'not be the son or daughter of a Rotarian');

const NNYCF_AWARDS = [
  "North Central Zone New York State Retired Teachers’ Association Inc. Scholarship",
  "Russell I. Wilcox Thousand Islands Bridge Authority Scholarship",
  "Evergreen STEM Scholarship",
  "Jefferson County Sons of the American Legion Brian A. L’Huillier Memorial Scholarship",
  "Vici and Steve Diehl Foundation Graduate Environmental Scholarship",
  "Vici and Steve Diehl Foundation Graduate Music Scholarship",
  "Rebecca Rhodes Memorial Scholarship",
  "North Country Goes Green Irish Festival Scholarship",
  "J. Richard Gaffney & William K. Archer Academic Scholarship",
  "J. Richard Gaffney & William K. Archer Career and Technical Education Scholarship",
  "Terence M. O'Brien Academic Scholarship",
  "Caswell Morgan Human Services Memorial Scholarship of the North Country Council of Social Agencies",
  "Rotary Purple Heart Scholarship",
  "10th Mountain Division (Light) Scholarship",
  "Keith Brabant Music Scholarship",
  "Frances Anderson Luck Foundation Scholarship",
  "George C. Boldt Scholarship",
  "North Pleasant Street Scholarship",
  "Northpole Fire Company Scholarship",
  "Timothy F. Wright Memorial Scholarship",
  "Michelle D. Salisbury Memorial Scholarship",
  "Ann B. Northrop “You’ll Never Walk Alone” Scholarship",
  "Barbara D. and Robert J. Hanrahan Family Scholarship",
  "Betty Evans Educational Scholarship",
  "Beverly Colligan Family Scholarship",
  "Black River Communities Corp. Inc. and James C. Cox Memorial Scholarship",
  "Brittany Walroth Memorial Scholarship",
  "Catherine C. Johnson Scholarship",
  "Charles A. Campbell Scholarship",
  "Charles and Fern Brown Scholarship",
  "Charlotte J. Smith Scholarship",
  "Chef Dennis J. Laemmermann Culinary Arts Scholarship",
  "Chester F. Gray Scholarship",
  "College Women’s Club of Jefferson County Scholarship",
  "Daisy Allard Jamerson & Dorothy Jamerson Eckford Scholarship",
  "Daphne A. Pickert Scholarship",
  "Darrel Rippeteau Architecture Scholarship",
  "Delos M. Cosgrove, Jr. Memorial Scholarship",
  "Donald J. Grant Scholarship",
  "Doris E. Carleton Scholarship",
  "Douglas & Helen Murray Scholarship",
  "Dr. Arthur C. Peckham Jr. Medical Scholarship",
  "Dr. Douglas M. Sanford Scholarship",
  "Edward Ruble Music Scholarship",
  "Elena G. Van Eenenaam Education Scholarship",
  "Elizabeth Joynt Haley Memorial Scholarship",
  "Friends of Mercy Hospital Scholarship",
  "Garry T. McGivney Scholarship",
  "Gary Berry Creativity Award",
  "Harry L. Minnich, Jr. “Mr. Fix-It” Memorial Scholarship",
  "Heather Anderson Memorial Scholarship",
  "Helen Lewicki Percoski Memorial Medical Scholarship",
  "Henry H. & Emily T. Willmott Memorial Scholarship",
  "Herring College Memorial Scholarship",
  "Hyde-Stone Scholarship",
  "Jan B. Summerville Legacy of Leadership Award",
  "Janet Ostanek Memorial Scholarship",
  "Jefferson Physician Organization Lewis Yecies, M.D., Memorial Scholarship",
  "Joe Foti Memorial Scholarship",
  "John C. Prentice Scholarship",
  "John G. Pircsuk Memorial Scholarship",
  "John W. Cobb Scholarship",
  "Katie Stiegelbauer Memorial Scholarship",
  "Kelli Johnson Memorial Scholarship",
  "Kenneth J. Eysaman II Legacy Scholarship",
  "Kenneth G. Trainor Scholarship",
  "Margery J. Smith Scholarship",
  "Margot Rhode Planned Parenthood Nursing Scholarship",
  "Mark J. Wearne Memorial Music Scholarship",
  "Marsellus Family Scholarship",
  "Mary McGuire Mills Nursing Scholarship",
  "Marine Corps League Detachment 961 Scholarship Award",
  "Masters Family Farm Scholarship",
  "Matt Doheny Scholarship",
  "Merton P. Evans Agricultural Scholarship",
  "Morse & Mary Dial Scholarship",
  "North Country Human Resource Association Scholarship",
  "North Side Legacy Scholarship",
  "Otakie Family Scholarship",
  "Pat Tubbs Award",
  "Patrick R. Farmer Scholarship for the Arts",
  "Pennies from Heaven Scholarship",
  "Peter L. White Memorial Scholarship",
  "Paul R. Haley Memorial Scholarship",
  "Ralph F. Brouty Watertown Savings Bank Scholarship",
  "Rev. Phillip A. Caruso Memorial Scholarship",
  "Robert E. and Dora M. Belcher Scholarship",
  "Robert J. Tompkins Scholarship",
  "Rosamond Van Arnam Memorial Nursing Scholarship",
  "Ryan D. Abel Memorial Scholarship",
  "Ryan D. Ingalls Memorial Scholarship",
  "Ryden Howard Frederick Scholarship",
  "Sally Wilson Scholarship",
  "Sarah Burgoon Memorial Scholarship",
  "Shannon McAllister Brownson “Good Life” Scholarship",
  "Shaw Harbor Foundation Scholarship",
  "Shirley Ann Parker Scholarship",
  "St. Lawrence County Board of REALTORS Community Scholarship",
  "St. Lawrence County Board of REALTORS Family Scholarship",
  "Susan Stone Memorial Scholarship",
  "The Harbor Scholarship",
  "The Perrine Agricultural Scholarship",
  "The Watertown Elks Lodge No. 496 Scholarship",
  "Thousand Islands Young Leaders Organization Scholarship",
  "UpNComing Writers Award",
  "Visiting Nurse Association (VNA) Scholarship",
  "Watertown Morning Musicales Scholarship",
  "Edison Cox Foundation Scholarship",
  "Grace E. De Young Scholarship",
  "Lost Individuals Seeking Healthy Answers “LISHA” Scholarship",
  "Margaret F. Ryan Scholarship for Nursing",
  "Mr. and Mrs. Sheridan E. Sullivan Educational Scholarship",
  "Trooper David J. Lane Memorial Nontraditional Scholarship",
  "Class of 1964 Excellence Award",
  "Danielle Marie DeSetto Memorial Scholarship",
  "Daryl Payne Memorial Scholarship",
  "Donald and Jean Hennessey Scholarship",
  "Dr. and Mrs. Reams A. Domser Scholarship",
  "Edward G. Andrews Memorial Scholarship",
  "Eugene Hendrickson Memorial Scholarship",
  "Frank Yazowski Agriculture Award",
  "Frederick Morgan Memorial Scholarship",
  "Gertrude Smith Scholarship",
  "Greg Huxley Jr. Memorial Scholarship",
  "Heath B. Pritchard Memorial Scholarship",
  "James Powell Memorial Music Award",
  "Jeanette Talcot Pitcher Memorial Scholarship",
  "Jeannette and Katrina Seiter Scholarship",
  "Kenneth Lyon Sr. Scholarship",
  "Kenneth V. Sawyer and Jeanette Remp Sawyer Scholarship",
  "Marion Seavey and Doris Sanford Memorial Award",
  "Mary Beth Durr Memorial Scholarship",
  "Penny Doolen Prosser Memorial Award",
  "Peter J. DeVoe Memorial Award",
  "Robert Health Sr. Memorial Award",
  "Robert E. Larrabee Memorial Scholarship",
  "Thomas A. Maurer Memorial Scholarship",
  "William “Bill” Bain Memorial Soccer Scholarship",
  "Garlock Lumber & Hardware Scholarship",
  "Jean McInnis Walldroff Fine Arts Scholarship",
  "Mary Bastian Memorial Foundation Scholarship",
  "Marie C. and Ralph J. Marilley Scholarship",
  "Eulene and Dorrance D. Bush Scholarship",
  "James, James and Virginia Burr Scholarship",
  "John L. Gormley Scholarship",
  "Winifred Christiansen Scholarship",
  "Berry Brothers FFA Award",
  "Julie L. Bettinger Memorial Scholarship",
  "Friends of Michelle D. Salisbury Memorial Scholarship",
  "Maurice L. Herron Memorial Scholarship",
  "Richard and Gladys Ross Memorial Scholarship",
  "David and Alma Price Scholarship",
  "Michael J. Cerroni Memorial Scholarship",
  "The DeWitt-Archer Scholarship",
  "The Ethan Phillips Scholarship",
  "The Kenneth Deskins Scholarship",
  "The Lucy Fulton Scholarship",
  "The Miller Hospital Scholarship",
  "The Rhode Estate Scholarship",
  "The Robert Jeschawitz Scholarship",
  "The Terry Coffman Memorial Scholarship",
  "Dorothy B. Ayers Memorial Scholarship",
  "Anne T. and Emmett M. Fenlon Scholarship",
  "Gina L. Rushlo Memorial Scholarship",
  "Kelly Memorial Award",
  "Don Cronk Memorial Scholarship",
  "Mary and David Stanley Faith Fellowship Christian School Scholarship",
  "Holland Memorial Scholarship",
  "Donald and Bernice Gardner Memorial Scholarship",
  "Florence Agnes White Scholarship",
  "Gary West Faith-Based Scholarship",
  "James and Janice St. Croix Scholarship",
  "Clarence “Boots” Gaffney Award",
  "Florence B. Joynt Scholarship",
  "Gary Ashe Memorial Golf Scholarship",
  "Terry O’Brien Memorial Scholarship",
  "William P. Plante Scholarship",
  "Gabriel Otero & Lexie Morgan Memorial Scholarship",
  "Hazel Shannon Chapin and Maida Chapin Dougherty Scholarship",
  "Indian River Education Association Scholarship",
  "Jacob Pete Memorial Scholarship",
  "Jon LaClair Award",
  "Russell I Wilcox Family Scholarship",
  "William C. Heck Memorial Scholarship",
  "Elizabeth May Duvall Foundation Scholarship",
  "Peyton Lane S. Morse Legacy Award",
  "Simmons Family Scholarship",
  "Robert and Esther Thompson Scholarship",
  "Beatrice Gravely Memorial Art Scholarship",
  "Dorothy M. Arthur Scholarship",
  "Edward J. & Mary Doviak Scholarship",
  "Edward Watkins Determination Scholarship Award",
  "Henry C. Northam Scholarship",
  "James Leonard Scholarship",
  "Kenneth Ford Memorial Scholarship",
  "Kirschner Music Scholarship",
  "Kyle E. O’Brien Scholarship",
  "Leon A. Davis Scholarship",
  "Louis C. Marlane Scholarship for Math",
  "Louis C. Marlane Scholarship for Science",
  "Lowville Academy 2008 Scholarship",
  "Marcia Dean Memorial Scholarship",
  "Mary E. Butts Scholarship",
  "Mary H. O’Connor Scholarship",
  "Miller G. Sherwood Scholarship",
  "Philip & Martha McDowell Scholarship",
  "Richard A. Lyndaker Humanitarian Memorial Scholarship",
  "Robert F. Breeze Scholarship",
  "Wanda Lewicki Memorial Scholarship",
  "Wormuth Family Scholarship",
  "Ball and Knight Scholarship",
  "Gene Derefinko Scholarship",
  "Lyme Central School Scholarship",
  "Alexander B. Fowler Memorial Award",
  "Barbara Richmond Moran Memorial Scholarship",
  "Carol Hunter Memorial Scholarship",
  "Cecile Timerman Williams Memorial Scholarship",
  "Charles F. Zeltwanger Memorial Scholarship",
  "Cindy Dwyer Memorial Scholarship",
  "Coach Steve Fisher Legacy Scholarship",
  "Cora Bura Scholarship",
  "Dick P. Case Memorial Scholarship",
  "Donald J. Grant Memorial Scholarship",
  "Eleanor Walrath Memorial Scholarship",
  "Francis Grant Memorial Scholarship",
  "Gertrude E. Glasier Scholarship",
  "Gilbert Lamon Memorial Award",
  "Glen Park Hydro Scholarship",
  "Jay Peckham Wrestling Award",
  "Jeanne Lane Plantz Memorial Scholarship",
  "Leslie G. Eisenhauer Memorial Scholarship",
  "Marguerite E. Brewster Memorial Scholarship",
  "Merrill & Vivian Hurd Memorial Scholarship",
  "Mighty Lion Wrestling Scholarship",
  "Molly J. Bogenschutz Endless Possibilities Award",
  "Purwillia “Pug” Weideman Nursing Scholarship",
  "Ralph B. Doane Memorial Scholarship",
  "Raymond W. Marlowe Memorial Scholarship",
  "Ron Siver Outstanding Lineman Award",
  "Sam Johnson Memorial Scholarship",
  "Terry Hanson Memorial Scholarship",
  "Tracy Ashley Memorial Scholarship",
  "Trooper David J. Lane “Heart of a Lion” Scholarship",
  "Trooper David J. Lane Memorial Scholarship",
  "Dr. Allen A. & Joan Taylor Education Scholarship",
  "Learned J. and Janet Langlois Memorial Scholarship",
  "Lorraine Power Tharp Scholarship",
  "William “Billy” Todd Memorial Scholarship",
  "Wing/Bishop/Patterson Scholarship",
  "OFA Alumni Scholarship",
  "Francisco Clark – Bouchard Memorial Scholarship",
  "Karen Kirchgasser Memorial Scholarship",
  "Kocan Family Scholarship",
  "Michael Matthys Memorial Scholarship",
  "Sipher Scholarship",
  "Smith Family Award",
  "Susan Williams Bullard Award",
  "April Resseguie Memorial Scholarship",
  "Assistant Fire Chief Garrett W. Loomis Memorial Scholarship",
  "Carl Robbins Memorial Scholarship",
  "Donald J. Bachner Memorial Community Service Scholarship",
  "Donald T. McPhail Scholarship",
  "Dr. Charles E. Commeret, Sr. Scholarship",
  "Jana L. Boulton Memorial Scholarship",
  "Patrick X. & Mary E. Brennan Scholarship",
  "Pauline and Alfred Lyng Scholarship",
  "Ralph E. Smith Graduate Scholarship",
  "Ralph E. Smith Undergraduate Scholarship",
  "Sergeant James G. Everett Scholarship",
  "Al Thomas Memorial Scholarship",
  "Albert F. & Rachel W. Hyde Scholarship",
  "Andrew J. Stevenson Memorial Scholarship",
  "Anna Mae Searles Cooper Scholarship",
  "Anthony Lephart Memorial Scholarship",
  "Barbara Richmond Moran Scholarship",
  "Berry Brothers Lumber FFA Award",
  "Brian C. Thomas Scholarship",
  "Class of 1967 Scholarship",
  "Dan & Mabel Griggs Higher Education Scholarship",
  "David A. Sinclair Scholarship",
  "Donald & Arlene Moore Scholarship",
  "Doris Heath Reading Award",
  "Edward Blackford IV Memorial Scholarship",
  "Eleanor Greene Memorial Scholarship",
  "Enzo Greenwood Coinco Scholarship",
  "Evelyn Avery Award",
  "Frederick N. Scholtz Scholarship",
  "Grant & Joyce Crumb Memorial Scholarship",
  "Greenley / Wyman Scholarship",
  "Henry Coffeen Memorial Scholarship",
  "International Water Level Coalition Scholarship",
  "Jeff Gregory Scholarship",
  "John Booth Memorial Scholarship",
  "Joshua P. Sullivan Pharm.D. Legacy Scholarship",
  "Kathleen Graves Scholarship",
  "Kirk Steele Scholarship",
  "Leuze-Reardon-Belloff Scholarship",
  "Lucas Damon Scholarship",
  "Luke A. Tyrrell Memorial Scholarship",
  "Marcus Judson Memorial Scholarship",
  "Margaret “Ann” Kibling Memorial Scholarship",
  "Marion Blount Public Speaking Memorial Scholarship",
  "Maude Fleming Scholarship Award",
  "Maureen Preskenis Scholarship",
  "Nicholas J. Patell Memorial Award",
  "Patricia Lephart Scholarship",
  "Richard and Donna Bibbins Empowerment Scholarship",
  "Robert Barrows Scholarship",
  "Robert L. Shippee Memorial Scholarship",
  "Ruth Hannah Nichols Scholarship",
  "SPENNY15 Scholarship",
  "South Jefferson High School Class of 1966 Scholarship",
  "South Jefferson High School Class of 1967 Scholarship",
  "Stephanie (Mathous) Bossinger Team Player Award",
  "Timothy M. Reynolds III Scholarship",
  "Wilson Davis Award",
  "William F. & Ernestine K. Kellerhals Sr. Helping Professionals Scholarship",
  "Barry L. Mills Beechwood Scholarship",
  "Carl H. Frink Scholarship",
  "Episcopal River Parishes Scholarship",
  "Gerald Reinman Scholarship Class of 1954 Scholarship",
  "Greenizen Scholarship",
  "Mary M. & George W. Forbes Thousand Islands Central School Scholarship",
  "Scott Fiorentino Athletic Memorial Scholarship",
  "Stumpf Farm Productions Scholarship",
  "Lyon Family Scholarship",
  "Alfred & Frances Paige Scholarship",
  "Brian D. Soper Memorial Scholarship",
  "Cathleen A. Haggerty Scholarship",
  "Christopher P. Waite Memorial Scholarship",
  "Colleen St. Pierre Scholarship",
  "Douglas A. Medley Education Scholarship",
  "Douglas W. Wood Music Scholarship",
  "Dr. Charles E. Commeret, Sr. Memorial Scholarship",
  "Dr. Errol Putman Scholarship",
  "Frank Sacci Instrumental Scholarship",
  "Gail Conlin Phillips Memorial Scholarship",
  "Gary M. Jones Memorial Scholarship",
  "Glenn S. Doull Scholarship",
  "Harvey Simon Scholarship",
  "Hiram Duane Buck Scholarship",
  "Jeffrey W. Kimball MBA, WHS Class of 2003 Scholarship",
  "Jennifer Corbett Rainbow Scholarship",
  "John R. Williamson Scholarship",
  "Mary Alice & Joseph B. Meichelbeck Scholarship",
  "Maurice D. Barnette Scholarship",
  "Russell Faunce Scholarship",
  "Watertown High School Class of 1956 Scholarship",
  "Watertown High School Class of 1967 Scholarship",
  "Watertown High School Class of 1982 Scholarship",
  "Watertown Savings Bank Cup Scholarship",
  "William I. Graf Award",
  "Brian A. L’Huillier BOCES Scholarship",
  "Dr. Walter and Mary Atkinson Legacy Scholarship",
  "Excellence of Achievement & Outstanding Academic Achievement Awards",
  "Jefferson-Lewis BOCES Scholarship",
  "Ruth Seal Memorial Scholarship (Jefferson BOCES)",
  "Thousand Islands Foundation Scholarship",
  "Thousand Islands Foundation Nontraditional Scholarship",
  "Clayton Volunteer Fire Department Foundation Scholarship",
  "Daniel Ekpe Scholarship",
  "Elizabeth (Betty) Streets Scholarship",
  "Grindstone Island Heritage Scholarship",
  "Grindstone Island Mary Lou Nunn Rusho Memorial Scholarship",
  "Hazel Northrup Hyde Family Scholarship",
  "John and Eva Argyos Scholarship",
  "Lechler Scholarship",
  "Margaret Maser Scholarship",
  "Mark Schmeer Scholarship",
  "Ruth and Robert Phillips Scholarship",
  "Seaway Trail Foundation Scholarship",
  "Adirondack Mennonite Camping Association Scholarship",
  "Henderson Harbor Water Sports Programs Scholarship",
  "Rev. Peter N. Butler Guggenheim Summer Camp Scholarship",
  "Women's Council of REALTORS Tri-County NY Scholarship",
  "Trisomy 21 Foundation of Northern New York"
];

export default {
  /* 1 */
  'https://www.amazonfutureengineer.com/scholarships': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Amazon Future Engineer Scholarship', provider_org: 'Amazon Future Engineer', provider_type: 'other',
      apply_url: 'https://www.amazonfutureengineer.com/scholarships', source_url: 'https://www.amazonfutureengineer.com/scholarships',
      amount: { min: 0, max: 40000, renewable: true, note: 'Covers unmet need up to $10,000 per year for four years, plus a paid Amazon internship' },
      deadline: null, cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'need',
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'Be a high school senior in the U.S.')),
        G(H('identity.citizenship', 'in', ['us_citizen', 'us_national', 'permanent_resident', 'refugee_asylee', 'daca_tps'], 'Must be authorized to work in the U.S.')),
        G(H('academic.gpa', 'gte', 2.3, 'minimum cumulative grade point average of 2.3 on a 4.0 scale')),
        G(H('academic.cip_codes', 'prefix_any', ['11', '14.09', '14.10', '27', '30.70', '30.25'], 'Be planning to attain a bachelor’s degree in computer science, software engineering, computer engineering, electrical engineering, or other computer science related field of study'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Up to $40,000 for your computer science degree' },
        { field: 'amount', source_quote: 'up to a maximum of $10,000 annually' },
        { field: 'deadline', source_quote: 'Applications for 2025–2026 are closed' },
        { field: 'need_based', source_quote: 'Must demonstrate financial need' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Must be planning to attend an accredited 4-year college (or a 2-year college with intent to transfer); no field for intended institution type'],
    notes: 'The 2025-2026 cycle is closed and no next date is given, so deadline is null and status closed. The computer science course requirement is not encoded because students without the course can opt in to an Amazon assessment instead. "Authorized to work" mapped to citizen, national, permanent resident, refugee/asylee and DACA/TPS (EAD holders). Related majors list includes math, data science, cognitive science, informatics.'
  },

  /* 2 */
  'https://calaged.org/news/90000-awarded-state-ffa-scholarships': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'A 2022 news item announcing that about $90,000 in State FFA scholarships was awarded. It mentions requirements (State FFA Degree, agriculture major) and that applications are typically due in December, but it is a recipient announcement, not an award page.'
  },

  /* 3 */
  'https://www.causesandiego.org/scholarship/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Cause San Diego Social Impact Scholarship Program', provider_org: 'Cause San Diego', provider_type: 'nonprofit',
      apply_url: 'https://www.causesandiego.org/scholarship/', source_url: 'https://www.causesandiego.org/scholarship/',
      amount: { min: 0, max: 15000, note: 'Up to $15,000 in total across 5 winners; per-winner amount not stated' },
      deadline: null, cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['undergrad', 'grad', 'trade'],
      eligibility: [
        G(H('academic.status', 'in', ['undergrad', 'grad', 'trade'], 'college and trade school students')),
        G(F('Applicant is currently enrolled at and attending a San Diego County-based college, university or trade school', ['academic.institution'], 'open to students currently enrolled and attending San Diego County-based colleges, universities and trade schools')),
        G(F('Applicant is engaged in social impact activities in the San Diego region', ['activities.extracurricular', 'activities.leadership'], 'engaged in social impact activities in the San Diego region'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'awarding up to $15,000 in scholarships' },
        { field: 'deadline', source_quote: 'Our 2026 Scholarship Application period is now closed' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['Institution location (San Diego County-based school) has no field; encoded as fuzzy'],
    notes: 'The 2026 application period is closed; no deadline date or next cycle is given. The $15,000 is the total pool for 5 winners.'
  },

  /* 4 */
  'https://www.csascholars.org/tice1/index.php/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Raymond A. Tice Scholarship', provider_org: 'Raymond A. Tice Scholarship (administered by the Center for Scholarship Administration)', provider_type: 'private_foundation',
      apply_url: 'https://www.csascholars.org/tice1/index.php/', source_url: 'https://www.csascholars.org/tice1/index.php/',
      amount: { min: 0, max: 0, note: 'Amount not stated on the page' },
      deadline: '2027-02-18', cycle_status: 'upcoming',
      eligibility: [],
      provenance: [
        { field: 'deadline', source_quote: 'The application will be open from January 7, 2027 until February 18, 2027' }
      ],
      verified_at: V, confidence: 0.55
    }],
    vocabulary_gaps: [],
    notes: 'Application management page with no eligibility criteria ("deserving students" only), so eligibility is empty (unknown, not truly open to everyone). Application window January 7 to February 18, 2027, so upcoming.'
  },

  /* 5 */
  'https://www.hbaie.com/Scholarship': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Hispanic Bar Association of the Inland Empire Scholarship', provider_org: 'Hispanic Bar Association of the Inland Empire', provider_type: 'bar_association',
      apply_url: 'https://www.hbaie.com/resources/Documents/2026-HBAIE-Scholarship-Letter-and-Application.pdf', source_url: 'https://www.hbaie.com/Scholarship',
      amount: { min: 0, max: 0, note: 'Amount not stated on the page' },
      deadline: null, cycle_status: 'unknown',
      eligibility: [],
      provenance: [
        { field: 'apply_url', source_quote: 'DOWNLOAD APPLICATION HERE' }
      ],
      verified_at: V, confidence: 0.4
    }],
    follow_links: ['https://www.hbaie.com/resources/Documents/2026-HBAIE-Scholarship-Letter-and-Application.pdf'],
    vocabulary_gaps: [],
    notes: 'The page only links the 2026 scholarship letter and application PDF; no eligibility, amount or deadline in the text. Eligibility left empty because nothing is stated (details are in the PDF). Could also be treated as a page with no extractable record.'
  },

  /* 6 */
  'https://houston.swe.org/student-scholarships/': (() => {
    const base = {
      provider_org: 'Society of Women Engineers, Houston Area Section', provider_type: 'professional_society',
      apply_url: 'https://houston.swe.org/student-scholarships/scholarship-application/', source_url: 'https://houston.swe.org/student-scholarships/',
      amount: { min: 0, max: 0, note: 'Monetary award toward a single year of study; amount not stated' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'city', states: ['TX'] }, need_based: 'merit',
      verified_at: V, confidence: 0.7
    };
    const prov = [
      { field: 'amount', source_quote: 'The recipient(s) will receive a monetary award towards a single year of study' },
      { field: 'need_based', source_quote: 'awarded on the basis of merit' }
    ];
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          ...base, name: 'SWE Houston Area Freshman Scholarship', levels: ['hs_senior'],
          eligibility: [
            G(H('identity.gender', 'eq', 'woman', 'Freshman Scholarships to female students')),
            G(H('academic.status', 'eq', 'hs_senior', 'Senior High School Female Student at a Houston Area school')),
            G(F('Applicant attends a high school in the Houston area', ['geo.high_school', 'geo.city', 'geo.county'], 'Senior High School Female Student at a Houston Area school')),
            G(H('academic.cip_codes', 'prefix_any', ['14'], 'Plans to major in an Engineering or Engineering-related discipline'))
          ],
          provenance: prov
        },
        {
          ...base, name: 'SWE Houston Area Upper-class Scholarship', levels: ['undergrad'],
          eligibility: [
            G(H('identity.gender', 'eq', 'woman', 'to female students currently enrolled in or transferring from a community college')),
            G(H('academic.status', 'eq', 'undergrad', 'Upper-class Scholarships (Sophomores, Juniors, and Seniors)')),
            G(H('academic.year', 'between', [2, 4], 'Upper-class Scholarships (Sophomores, Juniors, and Seniors)')),
            G(F('Applicant is a student in the Greater Houston Area', ['geo.city', 'geo.county', 'academic.institution'], 'qualified female student in the Greater Houston Area')),
            G(H('academic.cip_codes', 'prefix_any', ['14'], 'pursuing an engineering or engineering-related discipline'))
          ],
          provenance: prov
        }
      ],
      award_names: ['SWE Houston Area Freshman Scholarship', 'SWE Houston Area Upper-class Scholarship', 'SWE National Scholarships'],
      follow_links: ['https://houston.swe.org/student-scholarships/scholarship-application/'],
      vocabulary_gaps: ['Must attend (or plan to attend) an ABET-accredited 4-year program; no accreditation field'],
      notes: 'Two section award types (freshman and upper-class) share the page. No amounts or deadlines given. SWE-HA does not offer graduate scholarships. Middle and high school student awards are recognitions, not scholarships. SWE National Scholarships only linked.'
    };
  })(),

  /* 7 */
  'https://ibew.org/ibew-members-children-awarded-union-plus-scholarships/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'A July 2016 news story about IBEW members\' children who won Union Plus scholarships. Recipient announcement, not an application page.'
  },

  /* 8 */
  'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Knights of Columbus Council 4678 Scholarship', provider_org: 'Knights of Columbus Council No. 4678', provider_type: 'fraternal',
      apply_url: 'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf', source_url: 'https://www.kc4678.com/Council%204678%20Scholarship%202025%20Application.pdf',
      amount: { min: 1000, max: 1000 }, deadline: '2024-12-15', cycle_status: 'closed',
      geo_scope: { level: 'city', states: ['PA'] }, levels: ['hs_senior'],
      eligibility: [
        G(H('academic.status', 'eq', 'hs_senior', 'any graduating high school senior must have been accepted')),
        G(H('academic.enrollment', 'eq', 'full_time', 'as a full-time student')),
        G(H('affiliations.fraternal[].org', 'eq', 'Knights of Columbus', 'KNIGHTS OF COLUMBUS')),
        G(H('affiliations.fraternal[].chapter', 'eq', 'Council 4678', 'Council No. 4678')),
        G(
          H('affiliations.fraternal[].member', 'eq', 'parent', 'The child of a member of Council 4678 in good standing'),
          F('Applicant is the grandchild of a Council 4678 member in good standing AND is from the State College (PA) area or surrounding school systems', ['affiliations.fraternal[].member', 'geo.city', 'geo.high_school', 'geo.school_district'], 'The grandchild of a member of Council 4678 in good standing must be from the State College area or surrounding school systems')
        )
      ],
      provenance: [
        { field: 'amount', source_quote: 'One $1,000 scholarship will be awarded' },
        { field: 'deadline', source_quote: 'DEADLINE IS DEC 15, 2024' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Relative must be a member "in good standing"', 'Must submit SAT or ACT scores (selection uses them)'],
    notes: 'Stale 2025 application (deadline December 15, 2024). Grandchildren additionally must be from the State College area, so that alternative is a fuzzy rule combining both conditions.'
  },

  /* 9 */
  'https://nesa.org/nesa-news/spread-the-word/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'NESA Eagle Scout Scholarships', provider_org: 'National Eagle Scout Association', provider_type: 'nonprofit',
      apply_url: 'https://nesa.org/scholarships', source_url: 'https://nesa.org/nesa-news/spread-the-word/',
      amount: { min: 0, max: 0, note: 'Per-award amount not stated (over $500,000 awarded to 65 Eagle Scouts in 2022-23)' },
      deadline: '2023-01-31', cycle_status: 'closed',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'trade'],
      eligibility: [
        G(F('Applicant is a current member of the National Eagle Scout Association', ['affiliations.member_org[].name', 'affiliations.professional'], 'Be a current member of the National Eagle Scout Association')),
        G(F('Applicant earned the rank of Eagle Scout by January 24, 2023', ['activities.extracurricular', 'activities.leadership'], 'Earned the rank of Eagle Scout by January 24, 2023')),
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
    vocabulary_gaps: ['Eagle Scout rank and NESA membership have no dedicated fields'],
    notes: 'A November 2022 news post announcing the 2023-24 NESA scholarship cycle (portal open December 1, 2022 to January 31, 2023). Stale. Could alternatively be labeled not_scholarship as a news post; labeled single because it describes one application with its eligibility.'
  },

  /* 10 */
  'https://www.niaf.org/niaf_event/scholarships-and-grants-available-through-the-national-italian-american-foundation/': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'NIAF Scholarship Program', provider_org: 'National Italian American Foundation', provider_type: 'nonprofit',
      apply_url: 'https://www.niaf.org/niaf_event/scholarships-and-grants-available-through-the-national-italian-american-foundation/',
      source_url: 'https://www.niaf.org/niaf_event/scholarships-and-grants-available-through-the-national-italian-american-foundation/',
      amount: { min: 2000, max: 10000 }, deadline: '2012-03-02', cycle_status: 'closed',
      geo_scope: { level: 'national' }, need_based: 'merit',
      eligibility: [
        G(
          H('identity.heritage', 'contains_any', ['Italian'], 'must be of Italian descent, with at least one ancestor who has emigrated from Italy'),
          F('Applicant is majoring or minoring in Italian language, Italian studies, Italian-American studies or a related field', ['academic.majors', 'academic.concentration'], 'majoring or minoring in the Italian language, Italian studies, Italian-American studies or a related field')
        ),
        G(H('academic.gpa', 'gte', 3.5, 'Students must have a minimum GPA of 3.5 to apply'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'ranging from $2,000 to $10,000 each' },
        { field: 'deadline', source_quote: 'Application deadline is March 2, 2012' },
        { field: 'need_based', source_quote: 'NIAF scholarship recipients are selected based on academic merit' }
      ],
      verified_at: V, confidence: 0.6
    }],
    vocabulary_gaps: [],
    notes: 'A December 2011 press release about the 2012-2013 NIAF scholarship program (more than 80 scholarships sharing one application). Very stale. Modeled as one program-level record; could alternatively be labeled not_scholarship as a news release. The grants mentioned are for organizations and are not included.'
  },

  /* 11 */
  'https://nnycf.org/scholarships/scholarships-available/': {
    page_type: 'listing', is_scholarship_page: true, scholarships: [],
    award_names: NNYCF_AWARDS,
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
    vocabulary_gaps: [],
    notes: 'Long list of named funds grouped by school district, with almost no per-award detail (a few one-line restrictions and a couple of 2023 deadlines), so no records are extracted. Several names repeat across districts; duplicates removed. follow_links are the award-specific PDFs; the grantinterface login link is a shared portal, not an award page.'
  },

  /* 12 */
  'https://rotarysacramento.com/our-foundations/scholarships/': (() => {
    const url = 'https://rotarysacramento.com/our-foundations/scholarships/';
    const base = {
      provider_org: 'Rotary Club of Sacramento Foundation', provider_type: 'fraternal',
      apply_url: url, source_url: url,
      deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
      geo_scope: { level: 'school_district', states: ['CA'] }
    };
    const dl = { field: 'deadline', source_quote: 'Applications for the next cycle will be accepted from January through April' };
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          ...base, name: 'Derek Ian Arnold Annual Scholarship', levels: ['hs_senior'],
          amount: { min: 1200, max: 1200 },
          eligibility: [
            G(H('geo.high_school', 'eq', 'Delta High School', 'graduating class at Delta High School')),
            G(H('academic.status', 'eq', 'hs_senior', 'Candidates must be high school seniors in the academic upper one-third')),
            G(notRotarian),
            G(H('academic.enrollment', 'eq', 'full_time', 'be enrolled full-time in undergraduate studies in an accredited four-year higher education school'))
          ],
          provenance: [{ field: 'amount', source_quote: '1 Scholarships – $1200' }, dl],
          verified_at: V, confidence: 0.75
        },
        {
          ...base, name: 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships', levels: ['hs_senior'],
          amount: { min: 1750, max: 2500, note: 'Rotary Club of Sacramento Foundation: 2 x $2,500; Robinson Crowell: 2 x $1,750' },
          eligibility: [
            G(H('geo.high_school', 'in', ['C.K. McClatchy High School', 'Sacramento Charter High School', 'West Campus High School'], 'McClatchy, Sacramento Charter and West Campus High Schools')),
            G(H('academic.status', 'eq', 'hs_senior', 'Candidates must be high school seniors in the academic upper one-third of their graduating classes')),
            G(notRotarian),
            G(H('academic.enrollment', 'eq', 'full_time', 'enroll full-time in undergraduate studies in an accredited 4-year university or junior college transferring to a 4-year university'))
          ],
          provenance: [{ field: 'amount', source_quote: 'Rotary Club of Sacramento Foundation: 2 Scholarships – $2500 each; Robinson Crowell: 2 Scholarships – $1750 each' }, dl],
          verified_at: V, confidence: 0.7
        },
        {
          ...base, name: 'Harold and Lilla Strauch Annual Scholarship', levels: ['hs_senior'],
          amount: { min: 2500, max: 2500 },
          eligibility: [
            G(H('geo.high_school', 'eq', 'Rio Americano High School', 'graduating classes at Rio Americano High School')),
            G(H('academic.status', 'eq', 'hs_senior', 'Candidates must be high school seniors in the academic upper one-third of their graduating classes')),
            G(notRotarian),
            G(H('academic.enrollment', 'eq', 'full_time', 'enroll full-time in undergraduate studies in an accredited four-year college'))
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $2500' }, dl],
          verified_at: V, confidence: 0.75
        },
        {
          ...base, name: 'Philip and Joan Knox Scholarship', levels: ['hs_underclass', 'hs_senior'], need_based: 'need',
          apply_url: url,
          amount: { min: 0, max: 0, note: 'One scholarship; amount not stated' },
          eligibility: [
            G(H('geo.high_school', 'eq', 'Jesuit High School', 'Incoming and returning students at Jesuit High School are eligible to apply')),
            G(F('Applicant demonstrates academic promise', ['academic.gpa'], 'demonstrate academic promise'))
          ],
          provenance: [{ field: 'need_based', source_quote: 'have a financial need' }, dl],
          verified_at: V, confidence: 0.6
        },
        {
          ...base, name: 'Susan and Jon R. Snyder Annual Scholarship Fund', levels: ['hs_underclass', 'hs_senior'],
          geo_scope: { level: 'school_district', states: ['CA'] },
          amount: { min: 0, max: 0, note: 'One scholarship; amount not stated' },
          eligibility: [
            G(
              H('geo.high_school', 'eq', 'Cristo Rey High School (Oakland)', 'a student currently enrolled at Cristo Rey'),
              F('Applicant is an eighth grader enrolling at Cristo Rey High School in Oakland', ['geo.high_school', 'academic.status'], 'an eighth grader enrolling at Cristo Rey High School (Oakland)')
            )
          ],
          provenance: [dl],
          verified_at: V, confidence: 0.6
        },
        {
          ...base, name: 'Oleta Lambert Scholarship', geo_scope: { level: 'county', states: ['CA'] },
          amount: { min: 1100, max: 1100 },
          eligibility: [
            G(H('geo.hs_county', 'eq', 'Sacramento County, CA', 'Any High School in Sacramento County'))
          ],
          provenance: [{ field: 'amount', source_quote: '1 Scholarship – $1100' }, dl],
          verified_at: V, confidence: 0.6
        },
        {
          ...base, name: 'Jim and Mary Jo Streng Scholarship', levels: ['hs_senior'],
          amount: { min: 5000, max: 5000 },
          eligibility: [
            G(H('geo.high_school', 'eq', 'Bella Vista High School', 'annual scholarships established at Bella Vista High School')),
            G(H('academic.status', 'eq', 'hs_senior', 'Candidates must be high school seniors, not be the son or daughter of a Rotarian')),
            G(notRotarian),
            G(H('academic.enrollment', 'eq', 'full_time', 'enroll full-time in undergraduate studies in an accredited 4-year university or community college transferring to a 4-year university'))
          ],
          provenance: [{ field: 'amount', source_quote: '2 Scholarships – $5,000 each' }, dl],
          verified_at: V, confidence: 0.75
        }
      ],
      award_names: ['Derek Ian Arnold Annual Scholarship', 'Robinson Crowell & Rotary Club of Sacramento Foundation Annual Scholarships', 'Harold and Lilla Strauch Annual Scholarship', 'Philip and Joan Knox Scholarship', 'Susan and Jon R. Snyder Annual Scholarship Fund', 'Oleta Lambert Scholarship', 'Jim and Mary Jo Streng Scholarship'],
      vocabulary_gaps: [
        'Class rank ("academic upper one-third of their graduating class") has no field',
        '"Student in good standing" at the current school has no field'
      ],
      notes: 'Seven school-specific awards. The page still says 2025-26 applications are open but also says the next cycle runs January through April, so deadline is null (annual estimate) and status upcoming. Knox and Snyder are for Jesuit / Cristo Rey (Oakland) high school students (incoming and current), applied for through the school; Snyder lists financial need only as a consideration. Oleta Lambert gives no qualifications beyond a Sacramento County high school. The Crowell entry combines two named awards with different amounts.'
    };
  })(),

  /* 13 */
  'https://rsffoundation.org/rsf-foundation-grants-200000-for-advancing-education/': {
    page_type: 'not_scholarship', is_scholarship_page: false, scholarships: [], follow_links: [],
    notes: 'Blog post about grants to nonprofit organizations (A Step Beyond, Casa de Amistad). Not a student scholarship.'
  },

  /* 14 */
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
      'https://www.nspe.org/resources/students/scholarships',
      'https://shpe.org/engage/programs/scholarshpe/',
      'https://swe.org/scholarships/',
      'https://www.wicys.org/events/wicys-2026/scholarships/'
    ],
    vocabulary_gaps: [],
    notes: 'Link hub from the San Diego County Engineering Council. Each entry gives only a society name, link and deadline, so no records. Award names are built from the society names (the page does not name the individual awards). The ASM San Diego entry links to a Google Doc application.'
  },

  /* 15 */
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
        G(
          H('academic.status', 'eq', 'hs_senior', 'college-bound high school seniors'),
          H('academic.enrollment', 'eq', 'transfer', 'community college students transferring to a four-year')
        ),
        G(H('geo.county', 'eq', 'San Diego County, CA', 'San Diego County college-bound high school seniors')),
        G(H('academic.gpa', 'gte', 3.0, 'who maintain a minimum grade point average of 3.0'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'awards 20 scholarships of $1,000 each' },
        { field: 'deadline', source_quote: 'applications will be accepted through April 8, 2022' },
        { field: 'effort', source_quote: 'a letter of recommendation, and an essay submission' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: [],
    notes: 'Archived January 2022 district news post about the 2022 cycle (stale, closed). The program overall serves San Diego, Los Angeles, Orange and Riverside counties, but the eligibility sentence in this post names San Diego County only. Could alternatively be labeled not_scholarship as a news post. Same program as the SDCOE 2025 post in this chunk.'
  },

  /* 16 */
  'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/north-island-credit-union-foundation-offering-scholarships-to-san-diego-county-students': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'North Island Credit Union Foundation Student Scholarship Program', provider_org: 'North Island Credit Union Foundation', provider_type: 'private_foundation',
      apply_url: 'http://northisland.ccu.com/studentscholarship',
      source_url: 'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/north-island-credit-union-foundation-offering-scholarships-to-san-diego-county-students',
      amount: { min: 1000, max: 1000 }, deadline: '2025-03-07', cycle_status: 'closed',
      geo_scope: { level: 'county', states: ['CA'] }, levels: ['hs_senior', 'undergrad'],
      effort: { essay_words: null, recs_required: 1 },
      eligibility: [
        G(
          H('academic.status', 'eq', 'hs_senior', 'college-bound high school seniors and community college students transferring to a four-year university'),
          H('academic.enrollment', 'eq', 'transfer', 'community college students transferring to a four-year university')
        ),
        G(
          H('geo.county', 'in', ['San Diego County, CA', 'Riverside County, CA'], 'who reside in San Diego and Riverside counties'),
          H('affiliations.member_org[].name', 'eq', 'North Island Credit Union', 'Scholarships are also available to North Island Credit Union members or their dependents residing in any geographic area')
        ),
        G(H('academic.gpa', 'gte', 3.0, 'Students must maintain a minimum grade point average of 3.0 to be eligible to participate'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Apply For $1,000 scholarships' },
        { field: 'deadline', source_quote: 'Online applications will be accepted through Friday, March 7, 2025' },
        { field: 'effort', source_quote: 'a letter of recommendation and an essay submission' }
      ],
      verified_at: V, confidence: 0.75
    }],
    vocabulary_gaps: ['"Members or their dependents": the member_org field has no relationship, so a dependent of a member is approximated by the member_org rule'],
    notes: 'January 2025 news post about the 2025 cycle (stale, closed). Residence in San Diego or Riverside County OR credit union membership (self or parent) is one OR-group. Essay length not given. Could alternatively be labeled not_scholarship as a news post.'
  },

  /* 17 */
  'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/scholarship-and-award-opportunities-for-san-diego-county-students': (() => {
    const src = 'https://www.sdcoe.net/about-sdcoe/news/post/~board/news/post/scholarship-and-award-opportunities-for-san-diego-county-students';
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          name: 'Institute of Transportation Engineers San Diego Chapter Scholarship', provider_org: 'Institute of Transportation Engineers, San Diego Chapter', provider_type: 'professional_society',
          apply_url: 'https://sandiegoite.org/scholarship', source_url: src,
          amount: { min: 1000, max: 1000 }, deadline: '2026-09-25', cycle_status: 'closed',
          levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'a high school senior graduating in 2027')),
            G(F('Applicant plans to pursue a career in transportation engineering or a related field', ['career.field', 'academic.majors'], 'who plans to pursue a career in transportation engineering or related field'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'will be awarding one $1,000 scholarship' },
            { field: 'deadline', source_quote: 'The application deadline is Sept. 25.' }
          ],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'Coca-Cola Scholars Program Scholarship', provider_org: 'Coca-Cola Scholars Foundation', provider_type: 'private_foundation',
          apply_url: 'https://www.coca-colascholarsfoundation.org/apply/', source_url: src,
          amount: { min: 20000, max: 20000 }, deadline: '2026-09-30', cycle_status: 'open',
          geo_scope: { level: 'national' }, levels: ['hs_senior'], need_based: 'merit',
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'high school seniors who plan to graduate during the 2026-27 academic year'))
          ],
          provenance: [
            { field: 'amount', source_quote: 'achievement-based scholarship of $20,000' },
            { field: 'deadline', source_quote: 'The application deadline is Sept. 30.' },
            { field: 'need_based', source_quote: 'achievement-based scholarship' }
          ],
          verified_at: V, confidence: 0.7
        }
      ],
      award_names: ['Institute of Transportation Engineers Scholarship', 'Coca-Cola Scholars Program Scholarship'],
      follow_links: ['https://sandiegoite.org/scholarship', 'https://www.coca-colascholarsfoundation.org/apply/'],
      vocabulary_gaps: [],
      notes: 'April 1, 2026 SDCOE roundup. Deadlines are given as "Sept. 25" and "Sept. 30" without a year; 2026 is inferred from the post date and the graduating-class context (so ITE is closed, Coca-Cola open). San Diego Promise information nights and Cal-SOAP workshops are not scholarships and are not recorded. ITE geography is not stated (San Diego chapter; page is aimed at San Diego County students).'
    };
  })(),

  /* 18 */
  'https://sdsu.academicworks.com/opportunities/13777': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'San Diego Padres Veterans Endowed Scholarship', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/13777', source_url: 'https://sdsu.academicworks.com/opportunities/13777',
      amount: { min: 0, max: 0, note: TBD }, deadline: '2026-04-10', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad', 'grad'],
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('affiliations.military[].who', 'eq', 'self', 'Family members do not qualify')),
        G(H('affiliations.military[].status', 'in', ['active', 'reserve', 'guard', 'veteran', 'retired'], 'Recipients must be active duty service members, reservists, National Guard, and/or veterans of the United States Armed Forces')),
        G(H('academic.cip_codes', 'prefix_any', ['52'], 'Recipients must be pursuing a major or minor in the Fowler College of Business'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['A business minor also qualifies; the CIP rule covers majors only'],
    notes: 'Both undergraduate and graduate students are eligible and need not be full-time.'
  },

  /* 19 */
  'https://sdsu.academicworks.com/opportunities/9188': {
    page_type: 'single', is_scholarship_page: true,
    scholarships: [{
      name: 'Alumni Endowed Scholarship for Nursing', provider_org: SDSU, provider_type: 'university',
      apply_url: 'https://sdsu.academicworks.com/opportunities/9188', source_url: 'https://sdsu.academicworks.com/opportunities/9188',
      amount: { min: 0, max: 0, note: TBD }, deadline: '2026-04-10', cycle_status: 'closed',
      geo_scope: { level: 'institution', states: ['CA'] }, levels: ['undergrad'], need_based: 'need',
      eligibility: [
        G(H('academic.institution', 'eq', SDSU, 'San Diego State University Aztec Scholarships Portal')),
        G(H('academic.status', 'eq', 'undergrad', 'Recipients must be undergraduates pursuing a degree in the School of Nursing')),
        G(H('academic.cip_codes', 'prefix_any', ['51.38'], 'Recipients must be undergraduates pursuing a degree in the School of Nursing')),
        G(
          H('financial.fafsa_filed', 'is_true', undefined, 'Applicants must file a Free Application for Federal Student Aid (FAFSA)'),
          F('Applicant filed a California Dream Act Application', ['financial.fafsa_filed', 'identity.citizenship'], 'or the California Dream Act Application')
        ),
        G(F('Applicant is involved with an SDSU approved woman-affiliated student organization open to all SDSU students', ['affiliations.professional', 'activities.extracurricular'], 'Recipients must be involved with an SDSU approved woman-affiliated student organization'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'To be determined by the scholarship committee' },
        { field: 'deadline', source_quote: '04/10/2026' },
        { field: 'need_based', source_quote: 'Recipients must have financial need, as determined by the SDSU Financial Aid Office' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: ['Involvement in a specific kind of campus organization (woman-affiliated SDSU student org) has no field'],
    notes: 'Part-time undergraduates are eligible. Financial need is required (need_based = need).'
  },

  /* 20 */
  'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'SWE Scholarships', provider_org: 'Society of Women Engineers', provider_type: 'professional_society',
      apply_url: 'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf',
      source_url: 'https://swe.org/wp-content/uploads/2023/12/23-SWE-017-Scholarship-Flyer-010924-CPR4.pdf',
      amount: { min: 1000, max: 20000, note: 'Individual scholarships range from $1,000 to $20,000; many are renewable' },
      deadline: null, cycle_status: 'unknown',
      geo_scope: { level: 'national' }, levels: ['hs_senior', 'undergrad', 'grad', 'returning'],
      eligibility: [
        G(H('identity.gender', 'eq', 'woman', 'A person who identifies as a woman')),
        G(H('academic.status', 'in', ['hs_senior', 'undergrad', 'grad', 'returning'], 'An incoming freshman through Ph.D. student')),
        G(
          H('academic.enrollment', 'eq', 'full_time', 'Studying engineering full-time'),
          H('academic.status', 'eq', 'returning', 'exceptions made for re-entry/non-traditional students')
        ),
        G(H('academic.cip_codes', 'prefix_any', ['14', '15', '11'], 'accredited program in engineering, technology or computing'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'Individual scholarships range from $1,000 to $20,000' },
        { field: 'deadline', source_quote: 'SWE Scholarship Applications open late fall/early winter each academic year' }
      ],
      verified_at: V, confidence: 0.7
    }],
    vocabulary_gaps: [
      'Program must be ABET or Washington Accord accredited (or at a SWE Global Affiliate in India); no accreditation field',
      'Some individual SWE scholarships require SWE membership (not all)'
    ],
    notes: 'General flyer for the national SWE scholarship program (one general application for 320+ awards). No deadline date; applications open late fall/early winter. References are required but the number is not stated.'
  },

  /* 21 */
  'https://www.teamsters542.org/scholarships/': (() => {
    const src = 'https://www.teamsters542.org/scholarships/';
    const unionQuote = 'children and dependents (this does not include spouses)';
    return {
      page_type: 'listing', is_scholarship_page: true,
      scholarships: [
        {
          name: 'California Teamsters Hispanic Caucus Scholarship', provider_org: 'California Teamsters Hispanic Caucus', provider_type: 'union',
          apply_url: 'https://www.teamsters542.org/app/uploads/2026/07/2026-California-Teamsters-Hispanic-Caucus-Scholarship-Application.pdf', source_url: src,
          amount: { min: 0, max: 0, note: 'Amount not stated on the page' }, deadline: '2026-08-28', cycle_status: 'closed',
          geo_scope: { level: 'state', states: ['CA'] }, levels: ['hs_senior'],
          eligibility: [
            G(H('academic.status', 'eq', 'hs_senior', 'high school senior daughters or sons graduating with the class of 2026')),
            G(H('affiliations.union[].name', 'eq', TEAMSTERS, 'with an active Teamster member whose dues are current with his/her Local Union'))
          ],
          provenance: [{ field: 'deadline', source_quote: 'DEADLINE TO APPLY IS AUGUST 28TH, 2026' }],
          verified_at: V, confidence: 0.7
        },
        {
          name: 'Teamsters Scholarship Fund', provider_org: 'International Brotherhood of Teamsters', provider_type: 'union',
          apply_url: 'http://www.teamster.org/scholarships', source_url: src,
          amount: { min: 2000, max: 2000 }, deadline: '2026-04-01', cycle_status: 'closed',
          geo_scope: { level: 'national' },
          eligibility: [
            G(H('affiliations.union[].name', 'eq', TEAMSTERS, 'for children and financial dependents of Teamsters members, including BLET, BMWED, and TCRC members'))
          ],
          provenance: [
            { field: 'amount', source_quote: '600 one-time $2,000 scholarships' },
            { field: 'deadline', source_quote: 'Deadline: April 1, 2026' }
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
            G(H('affiliations.union[].name', 'eq', TEAMSTERS, 'the sons/daughters/financial dependents of Teamster members'))
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
          amount: { min: 0, max: 0, note: 'Amount not stated on the page' }, deadline: null, cycle_status: 'unknown',
          geo_scope: { level: 'state', states: ['CA'] },
          eligibility: [
            G(H('affiliations.union[].name', 'eq', TEAMSTERS, 'children of active Teamsters Union members')),
            G(H('affiliations.union[].local', 'in', ['14', '63', '166', '186', '396', '399', '481', '495', '542', '572', '630', '631', '683', '848', '896', '952', '986', '996', '1699', '1932', '2010', '2118'], 'belong to one of the following Teamster Local Unions'))
          ],
          verified_at: V, confidence: 0.65
        }
      ],
      award_names: ['California Hispanic Caucus Scholarship', 'Teamsters Scholarship Fund', 'James R. Hoffa Memorial Scholarship Fund', 'Teamsters Joint Council 42 Scholarship'],
      follow_links: ['https://www.teamsters542.org/app/uploads/2026/07/2026-California-Teamsters-Hispanic-Caucus-Scholarship-Application.pdf', 'https://aim.applyists.net/JRHMSF/', 'https://www.teamstersjc42.com/home/scholarships/'],
      vocabulary_gaps: [
        'All four awards are for children/dependents of Teamster members (not spouses, not the member); affiliations.union[] has no relationship field, so the union rule cannot say "parent"',
        'Member must be active with dues current'
      ],
      notes: 'Local union bulletin board listing four Teamster scholarships. The general line "' + unionQuote + '" applies to all. Hispanic Caucus is for the class of 2026 and its deadline (Aug 28, 2026) has passed; no Hispanic heritage requirement is stated. JRHMSF awards differ for academic vs vocational programs.'
    };
  })(),

  /* 22 */
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
        G(F('Applicant has demonstrated commitment to the advancement of Asian and Pacific Islander heritage leadership, mentorship, education and community building', ['identity.heritage', 'activities.leadership', 'activities.extracurricular'], 'demonstrated commitment to the advancement of Asian and Pacific Islander heritage leadership, mentorship, education and community building'))
      ],
      provenance: [
        { field: 'amount', source_quote: 'up to $2250' },
        { field: 'deadline', source_quote: '04/02/2026' },
        { field: 'effort', source_quote: 'Essay responses should be 1-2 pages' }
      ],
      verified_at: V, confidence: 0.8
    }],
    vocabulary_gaps: [],
    notes: 'Essay is 1-2 pages (no word count), so essay_words is null. A resume is also required. API heritage itself is not required, only commitment to API communities.'
  },

  /* 23 */
  'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf': {
    page_type: 'pdf_form', is_scholarship_page: true,
    scholarships: [{
      name: 'Middle Class Scholarship', provider_org: 'California Student Aid Commission', provider_type: 'government',
      apply_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      source_url: 'https://webutil.csac.ca.gov/epubs/assets/documents/MCS_Brochure_English_V1.pdf',
      amount: { min: 0, max: 0, renewable: true, note: 'Not a set amount: 10% to 40% of mandatory system-wide UC/CSU tuition and fees; eligibility limited to 4 years' },
      deadline: null, deadline_kind: 'annual_estimate', cycle_status: 'upcoming',
      geo_scope: { level: 'state', states: ['CA'] }, levels: ['undergrad'], need_based: 'need',
      eligibility: [
        G(H('geo.state', 'eq', 'CA', 'be a California resident attending a UC or CSU')),
        G(F('Applicant attends a University of California or California State University campus', ['academic.institution'], 'be a California resident attending a UC or CSU')),
        G(
          H('identity.citizenship', 'in', ['us_citizen', 'permanent_resident'], 'be a U.S. citizen, permanent resident or have'),
          F('Applicant has AB 540 student status (3+ years at a California high school and graduated from a California high school or equivalent)', ['geo.state', 'geo.high_school', 'identity.citizenship'], 'AB 540 student status')
        ),
        G(F('Family income and assets do not exceed $156,000', ['financial.income_band', 'financial.sai'], 'have family income and assets not exceeding $156,000')),
        G(
          H('financial.fafsa_filed', 'is_true', undefined, 'complete the Free Application for Federal Student Aid'),
          F('Applicant completed the California Dream Act Application (CADAA)', ['financial.fafsa_filed', 'identity.citizenship'], 'California Dream Act Application (CADAA)')
        ),
        G(
          H('academic.status', 'eq', 'undergrad', 'available to eligible undergraduate and teaching credential students'),
          F('Applicant is a teaching credential student', ['academic.status', 'academic.majors'], 'available to eligible undergraduate and teaching credential students')
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
      'Must be enrolled in 6 or more units (no unit-count field)',
      'Must maintain satisfactory academic progress, not be in default on a student loan, and not be incarcerated',
      'Eligibility limited to 4 years; students must reapply each year',
      'Income limit $156,000 straddles the 150plus income band, so it is fuzzy'
    ],
    notes: 'State brochure. Application is via FAFSA or CADAA (October 1 to March 2); March 2 has no year, so deadline is null (annual estimate) and the next window opening October 1 makes the cycle upcoming. No separate apply URL is given as a full link.'
  }
};
