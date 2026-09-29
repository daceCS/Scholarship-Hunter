/* Questionnaire schema. Mirrors intake-questionnaire.md.
   - Every question has a stable `id`; answers are stored by id, never by position.
   - `when(a)` receives the effective answers (hidden questions already removed).
   - prompt / title / lede / options may be functions of `a`.
   - `yield` (low | med | high) is the rough pool-narrowing tier used by the mock match estimate.
   - Screens in the `sensitive` phase default every question to skippable ("Prefer not to answer"). */
window.TW = window.TW || {};
(function () {
  const O = (...xs) => xs.map(x => Array.isArray(x) ? { v: x[0], l: x[1], d: x[2] } : { v: x, l: x });
  const YNS = O(['yes', 'Yes'], ['no', 'No'], ['skip', 'Prefer not to say']);

  const hs = a => a['edu.status'] === 'hs_senior' || a['edu.status'] === 'hs_underclass';
  const hsUnder = a => a['edu.status'] === 'hs_underclass';
  const yes = id => a => a[id] === true;
  TW.helpers = { hs, hsUnder };

  TW.phases = [
    { id: 'core', label: 'Core' },
    { id: 'branch', label: 'Branch' },
    { id: 'sensitive', label: 'Sensitive' },
    { id: 'history', label: 'History' }
  ];

  const yearOpts = a => a['edu.status'] === 'grad'
    ? O(['1', 'Grad year 1'], ['2', 'Grad year 2'], ['3', 'Grad year 3'], ['4', 'Grad year 4'], ['5', 'Grad year 5+'])
    : O(['1', '1st year'], ['2', '2nd year'], ['3', '3rd year'], ['4', '4th year'], ['5', '5th year or more']);

  TW.screens = [
    /* ───────────── Phase 1: Core ───────────── */
    { id: 'welcome', phase: 'core', kind: 'welcome', section: 'Welcome', questions: [] },

    { id: 'edu-status', phase: 'core', section: 'Academic',
      title: 'Where are you in school right now?',
      lede: 'This sets which questions we ask next. Nothing here is permanent.',
      questions: [
        { id: 'edu.status', type: 'single', ui: 'cards', required: true, yield: 'low', prompt: 'Current stage',
          options: O(
            ['hs_senior', 'High school senior', 'Applying to or heading to college'],
            ['hs_underclass', 'High school underclassman', 'Freshman to junior year'],
            ['undergrad', 'Undergraduate', 'Community college or university'],
            ['grad', 'Graduate student', 'Master\'s, doctoral, or professional'],
            ['returning', 'Returning after a gap', 'Back in school after time away'],
            ['trade', 'Trade or certificate program', 'Skilled trades, technical, or vocational']) }
      ] },

    { id: 'edu-school', phase: 'core', section: 'Academic',
      title: a => hs(a) ? 'Where are you headed?' : 'Tell us about your school',
      lede: 'Many awards are limited to students at one school or one set of schools.',
      questions: [
        { id: 'edu.institution', type: 'autocomplete', source: 'institutions', yield: 'med',
          prompt: a => hs(a) ? 'What college do you plan to attend?' : 'What school do you attend or plan to attend?',
          placeholder: 'Start typing a school name', quick: ['Undecided'],
          hint: 'Not on the list? Type it in anyway.' },
        { id: 'edu.year', type: 'single', yield: 'low', when: a => !hs(a) && !!a['edu.status'],
          prompt: 'What year will you be in this coming school year?', options: yearOpts }
      ] },

    { id: 'edu-field', phase: 'core', section: 'Academic',
      title: 'What are you studying?',
      lede: 'Add more than one if you are torn. It only widens your matches.',
      questions: [
        { id: 'edu.major', type: 'autocomplete', multiple: true, source: 'majors', required: true, yield: 'med',
          prompt: 'Major or intended major', placeholder: 'Start typing a major', quick: ['Undecided'] },
        { id: 'edu.concentration', type: 'text', yield: 'med',
          prompt: 'Concentration, minor, or focus area',
          placeholder: 'e.g. Cybersecurity, pediatric nursing, watershed science',
          hint: 'Optional, but worth filling in. Funds often target subfields, not majors.' }
      ] },

    { id: 'edu-numbers', phase: 'core', section: 'Academic',
      title: 'A few numbers',
      lede: 'These decide which merit awards you clear. Leave GPA blank if you are not sure.',
      questions: [
        { id: 'edu.gpa', type: 'number', min: 0, max: 5, decimals: 2, placeholder: '3.60', yield: 'low',
          prompt: 'Cumulative GPA', hint: 'On a 4.0 scale. Unweighted or weighted both work.' },
        { id: 'edu.gpa_scale', type: 'single', ui: 'chips', notag: true, when: a => a['edu.gpa'] !== undefined,
          prompt: 'Is that GPA weighted?', options: O(['unweighted', 'Unweighted'], ['weighted', 'Weighted']) },
        { id: 'edu.grad_date', type: 'date', yield: 'low', when: a => !hs(a),
          prompt: 'When do you expect to graduate?', hint: 'Month and year.' },
        { id: 'edu.enrollment', type: 'single', yield: 'low', when: a => !hs(a),
          prompt: 'Enrollment status', options: O(['full_time', 'Full-time'], ['part_time', 'Part-time'], ['transfer', 'Transfer student']) }
      ] },

    { id: 'geo-where', phase: 'core', section: 'Geography',
      title: 'Where do you live?',
      lede: 'This is where the low-competition awards live. County bar associations and community foundations often get single-digit applicant pools.',
      questions: [
        { id: 'geo.current', type: 'autocomplete', source: 'cities', yield: 'med',
          prompt: 'Current city and state', placeholder: 'City, ST' },
        { id: 'geo.zip', type: 'text', digits: true, maxlength: 5, inputmode: 'numeric', ac: 'postal-code', required: true, yield: 'med',
          prompt: 'ZIP code', placeholder: '92028', hint: 'We use this to find your county, congressional district, and school district. You never have to enter them.' },
        { id: 'geo.residency', type: 'single', yield: 'low',
          prompt: 'Are you attending school in-state or out-of-state?',
          options: O(['in_state', 'In-state'], ['out_of_state', 'Out-of-state'], ['undecided', 'Not decided yet']) }
      ] },

    { id: 'geo-hs', phase: 'core', section: 'Geography',
      title: a => hs(a) ? 'Your high school' : 'Where did you go to high school?',
      lede: 'Alumni funds and district foundations are some of the least crowded awards there are.',
      questions: [
        { id: 'geo.hs', type: 'autocomplete', yield: 'med',
          prompt: a => hs(a) ? 'Which high school do you attend?' : 'High school you graduated from',
          placeholder: 'School name and city' },
        { id: 'geo.hs_same_county', type: 'single', ui: 'chips', notag: true, when: a => !hs(a) && !!a['geo.hs'],
          prompt: 'Did you live in the same county then as you do now?', options: O(['same', 'Yes, same county'], ['different', 'No, a different county']) },
        { id: 'geo.hs_county', type: 'text', yield: 'med', when: a => a['geo.hs_same_county'] === 'different',
          prompt: 'County you lived in during high school', placeholder: 'e.g. Riverside County, CA' }
      ] },

    { id: 'effort-money', phase: 'core', section: 'Effort budget',
      title: 'What is your time worth?',
      lede: 'Tell us now and we will never show you awards you would not finish.',
      questions: [
        { id: 'effort.min_award', type: 'number', prefix: '$', min: 0, max: 100000, decimals: 0, presets: [250, 500, 1000, 2500], yield: 'low',
          prompt: 'Minimum award worth your time', placeholder: '500', hint: 'Awards below this amount are hidden from your list.' },
        { id: 'effort.hours_week', type: 'single', yield: 'low',
          prompt: 'How many hours a week can you spend applying?',
          options: O(['lt1', 'Under 1'], ['1_3', '1 to 3'], ['3_6', '3 to 6'], ['6plus', '6 or more']) }
      ] },

    { id: 'effort-work', phase: 'core', section: 'Effort budget',
      title: 'What are you willing to submit?',
      lede: 'Some awards need more than a form. Pick what you would actually do.',
      questions: [
        { id: 'effort.essay', type: 'single', ui: 'cards', yield: 'low',
          prompt: 'Will you write essays?',
          options: O(['no', 'No essays'], ['short', 'Short only', '500 words or fewer'], ['any', 'Any length']) },
        { id: 'effort.formats', type: 'multi', yield: 'low',
          prompt: 'Which formats are you open to?',
          options: O(['video', 'Video'], ['portfolio', 'Portfolio'], ['interview', 'Interview'], ['project', 'Project submission'], ['test', 'Test or quiz']) }
      ] },

    { id: 'effort-logistics', phase: 'core', section: 'Effort budget',
      title: 'Last few details',
      lede: 'These keep deadlines and paperwork from surprising you.',
      questions: [
        { id: 'effort.recs', type: 'single', ui: 'cards', yield: 'low',
          prompt: 'Can you get recommendation letters?',
          options: O(['yes', 'Yes, I have people lined up'], ['maybe', 'Maybe'], ['no', 'No']) },
        { id: 'effort.deadline_floor', type: 'single', yield: 'low',
          prompt: 'How much lead time do you need before a deadline?',
          options: O(['w1', '1 week'], ['w2', '2 weeks'], ['m1', '1 month']) },
        { id: 'effort.renewable', type: 'bool', yield: 'low',
          prompt: 'Are you open to renewable awards that need a new application each year?' }
      ] },

    { id: 'results', phase: 'core', kind: 'results', section: 'First results', questions: [] },

    /* ───────────── Phase 2: Branch ───────────── */
    { id: 'affil-employer', phase: 'branch', section: 'Affiliations',
      title: 'Where do your parents or guardians work?',
      lede: 'This is the highest-yield question in the whole profile. Employers, unions, and clubs fund awards for the families of their members, and very few people apply.',
      callout: { icon: 'ph-fill ph-lightning', text: 'Include former employers and jobs that ended years ago. Many awards still count them.' },
      questions: [
        { id: 'affil.employer_parents', type: 'group', yield: 'high', addLabel: 'Add another employer',
          prompt: 'Employers, current or past', rowLabel: 'Employer',
          fields: [
            { key: 'employer', label: 'Employer', type: 'autocomplete', source: 'employers', placeholder: 'e.g. UPS' },
            { key: 'relationship', label: 'Who works or worked there', type: 'single', ui: 'select', options: O(['parent', 'Parent'], ['guardian', 'Guardian'], ['grandparent', 'Grandparent'], ['sibling', 'Sibling'], ['self', 'Me']) },
            { key: 'current_or_former', label: 'Current or former', type: 'single', options: O(['current', 'Current'], ['former', 'Former']) }
          ] }
      ] },

    { id: 'affil-groups', phase: 'branch', section: 'Affiliations',
      title: 'Unions and civic groups',
      lede: 'One tap each. We only ask for details if the answer is yes.',
      questions: [
        { id: 'affil.union', type: 'bool', notag: true, prompt: 'Is anyone in your household a union member?' },
        { id: 'affil.union.detail', type: 'group', yield: 'high', when: yes('affil.union'), addLabel: 'Add another union', rowLabel: 'Union',
          prompt: 'Which union?',
          fields: [
            { key: 'union', label: 'Union', type: 'autocomplete', source: 'unions', placeholder: 'e.g. IBEW' },
            { key: 'local_number', label: 'Local number', type: 'text', placeholder: 'e.g. 569' }
          ] },
        { id: 'affil.fraternal', type: 'bool', notag: true, prompt: 'Are you or your family involved in any civic or service organization?' },
        { id: 'affil.fraternal.detail', type: 'group', yield: 'high', when: yes('affil.fraternal'), addLabel: 'Add another organization', rowLabel: 'Organization',
          prompt: 'Which organization?',
          fields: [
            { key: 'org', label: 'Organization', type: 'autocomplete', source: 'fraternal', placeholder: 'e.g. Elks' },
            { key: 'lodge_or_chapter', label: 'Lodge or chapter', type: 'text', placeholder: 'e.g. Lodge 1450' },
            { key: 'member', label: 'Who is a member', type: 'single', options: O(['self', 'Me'], ['parent', 'Parent'], ['grandparent', 'Grandparent']) }
          ] }
      ] },

    { id: 'affil-military', phase: 'branch', section: 'Affiliations',
      title: 'Military connections',
      lede: 'Thousands of awards go to service members and their families, and the eligibility often stretches to grandchildren.',
      questions: [
        { id: 'affil.military', type: 'bool', notag: true, prompt: 'Are you or an immediate family member military-affiliated?' },
        { id: 'affil.military.detail', type: 'group', tagField: 'branch', yield: 'high', when: yes('affil.military'), addLabel: 'Add another person', rowLabel: 'Service member',
          prompt: 'Tell us about them',
          fields: [
            { key: 'who', label: 'Relationship to you', type: 'single', options: O(['self', 'Me'], ['parent', 'Parent'], ['grandparent', 'Grandparent'], ['spouse', 'Spouse']) },
            { key: 'branch', label: 'Branch', type: 'single', ui: 'select', options: O(['army', 'Army'], ['navy', 'Navy'], ['air_force', 'Air Force'], ['marines', 'Marine Corps'], ['coast_guard', 'Coast Guard'], ['space_force', 'Space Force']) },
            { key: 'status', label: 'Status', type: 'single', ui: 'select', options: O(['active', 'Active duty'], ['reserve', 'Reserve'], ['guard', 'National Guard'], ['veteran', 'Veteran'], ['retired', 'Retired']) },
            { key: 'era', label: 'Era of service', type: 'multi', wide: true, options: O(['vietnam', 'Vietnam'], ['gulf', 'Gulf War'], ['oef_oif', 'OEF or OIF'], ['current', 'Current'], ['other', 'Other']) },
            { key: 'disability_rating', label: 'Service-connected disability rating', type: 'single', options: YNS },
            { key: 'killed_or_wounded', label: 'Killed or wounded in action', type: 'single', options: YNS }
          ] }
      ] },

    { id: 'affil-community', phase: 'branch', section: 'Affiliations',
      title: 'Faith and financial memberships',
      lede: 'Congregations, credit unions, and co-ops all run scholarship programs for members and their children.',
      questions: [
        { id: 'affil.religious', type: 'bool', skippable: true, notag: true, prompt: 'Do you or your family belong to a religious community?' },
        { id: 'affil.religious.detail', type: 'group', yield: 'high', when: yes('affil.religious'), addLabel: 'Add another', rowLabel: 'Community',
          prompt: 'Which community?',
          fields: [
            { key: 'tradition', label: 'Tradition', type: 'autocomplete', source: 'traditions', placeholder: 'e.g. Catholic' },
            { key: 'denomination', label: 'Denomination', type: 'text' },
            { key: 'congregation', label: 'Congregation', type: 'text', placeholder: 'Name of your church, mosque, temple' }
          ] },
        { id: 'affil.financial', type: 'bool', notag: true, prompt: 'Does your family bank with a credit union, or belong to a utility or agricultural co-op?' },
        { id: 'affil.financial.detail', type: 'group', yield: 'high', when: yes('affil.financial'), addLabel: 'Add another', rowLabel: 'Membership',
          prompt: 'Which one?',
          fields: [
            { key: 'institution', label: 'Institution', type: 'autocomplete', source: 'memberOrgs', placeholder: 'e.g. Navy Federal Credit Union' },
            { key: 'type', label: 'Type', type: 'single', ui: 'select', options: O(['credit_union', 'Credit union'], ['electric_coop', 'Electric co-op'], ['farm_bureau', 'Farm Bureau'], ['insurer', 'Insurer'], ['other', 'Other']) }
          ] }
      ] },

    { id: 'affil-professional', phase: 'branch', section: 'Affiliations',
      title: 'Associations and honor societies',
      lede: 'Pick what applies, or add your own.',
      questions: [
        { id: 'affil.professional', type: 'multi', yield: 'med', other: true, otherPlaceholder: 'Add another association',
          prompt: 'Professional associations, honor societies, and student orgs',
          options: O(['nhs', 'National Honor Society'], ['ptk', 'Phi Theta Kappa'], ['honors_program', 'Honors program'], ['student_gov', 'Student government'], ['greek', 'Greek life'], ['rotc', 'ROTC'], ['deca', 'DECA'], ['fbla', 'FBLA'], ['hosa', 'HOSA'], ['nsbe', 'NSBE'], ['shpe', 'SHPE'], ['swe', 'Society of Women Engineers']) }
      ] },

    { id: 'act-1', phase: 'branch', section: 'Activities',
      title: 'What do you do outside class?',
      lede: 'Clubs, teams, and competitions all have named awards attached.',
      questions: [
        { id: 'act.extracurricular', type: 'multi', yield: 'med', other: true, otherPlaceholder: 'Add another activity',
          prompt: 'Clubs, sports, arts, volunteering',
          options: O(['sports', 'Sports'], ['music', 'Music'], ['theater', 'Theater'], ['visual_arts', 'Visual arts'], ['volunteering', 'Volunteering'], ['student_media', 'Student media'], ['youth_group', 'Youth group'], ['community_service', 'Community service']) },
        { id: 'act.competitions', type: 'multi', yield: 'med', other: true, otherPlaceholder: 'Add another competition',
          prompt: 'Have you competed in anything?',
          options: O(['debate', 'Debate'], ['robotics', 'Robotics'], ['ffa', 'FFA'], ['4h', '4-H'], ['marching_band', 'Marching band'], ['esports', 'Esports'], ['science_fair', 'Science fair'], ['model_un', 'Model UN'], ['decathlon', 'Academic decathlon']) }
      ] },

    { id: 'act-2', phase: 'branch', section: 'Activities',
      title: 'The unusual stuff',
      lede: 'Named awards exist for surprisingly specific things. The weirder, the better.',
      questions: [
        { id: 'act.unusual', type: 'long_text', yield: 'high',
          prompt: 'Any unusual hobbies or skills?', placeholder: 'Write anything, separated by commas or new lines',
          examples: ['beekeeping', 'bagpiping', 'ham radio', 'falconry', 'competitive shooting', 'horticulture', 'duck calling'],
          hint: 'Tap an example to add it.' },
        { id: 'act.built', type: 'long_text', yield: 'med',
          prompt: 'Have you started a business, published, or built something?', placeholder: 'A shop, an app, a zine, a research paper' }
      ] },

    { id: 'act-3', phase: 'branch', section: 'Activities',
      title: 'Work and leadership',
      lede: 'Employers and leadership roles both open up their own awards.',
      questions: [
        { id: 'act.work', type: 'group', yield: 'med', addLabel: 'Add another job', rowLabel: 'Job',
          prompt: 'Where do you work, or where have you worked?',
          fields: [
            { key: 'employer', label: 'Employer', type: 'autocomplete', source: 'employers', placeholder: 'e.g. Publix' },
            { key: 'industry', label: 'Industry', type: 'autocomplete', source: 'industries', placeholder: 'e.g. Retail' },
            { key: 'role', label: 'Role', type: 'text', placeholder: 'e.g. Cashier' },
            { key: 'dates', label: 'Dates', type: 'text', placeholder: 'e.g. 2023 to present' }
          ] },
        { id: 'act.leadership', type: 'text', yield: 'med',
          prompt: 'Any leadership roles?', placeholder: 'e.g. Team captain, club president' }
      ] },

    { id: 'career-1', phase: 'branch', section: 'Career',
      title: 'Where are you headed?',
      lede: 'Career-specific funds are some of the largest awards out there.',
      questions: [
        { id: 'career.field', type: 'autocomplete', source: 'careers', yield: 'med',
          prompt: 'Field you want to work in', placeholder: 'Start typing a field' },
        { id: 'career.sector', type: 'multi', yield: 'med', prompt: 'Sector preference',
          options: O(['federal', 'Federal'], ['defense', 'Defense'], ['state_local', 'State or local government'], ['nonprofit', 'Nonprofit'], ['private', 'Private'], ['academia', 'Academia']) }
      ] },

    { id: 'career-2', phase: 'branch', section: 'Career',
      title: 'Employers and commitments',
      lede: 'Some of the best-funded awards ask for a work commitment in return.',
      questions: [
        { id: 'career.employers', type: 'multi', source: 'employers', other: true, yield: 'med', otherPlaceholder: 'Add an employer or agency',
          prompt: 'Specific employers or agencies you are targeting', options: [] },
        { id: 'career.service_obligation', type: 'single', ui: 'cards', yield: 'high',
          prompt: 'Would you accept a service commitment in exchange for funding?',
          options: O(['yes', 'Yes'], ['depends', 'Depends on the terms'], ['no', 'No']) },
        { id: 'career.service_note', type: 'note', notag: true, when: a => a['career.service_obligation'] === 'yes',
          icon: 'ph-fill ph-medal',
          text: 'Programs like SMART, CyberCorps SFS, and NHSC pay well above typical private awards with far smaller applicant pools. They carry a work commitment, so we keep them in their own list instead of mixing them with the rest.' }
      ] },

    /* ───────────── Phase 3: Sensitive ───────────── */
    { id: 'consent', phase: 'sensitive', kind: 'consent', section: 'Consent',
      questions: [{ id: 'consent.sensitive', type: 'flag', notag: true }] },

    { id: 'id-heritage', phase: 'sensitive', sensitive: true, section: 'Heritage', when: a => a['consent.sensitive'] === true,
      title: 'Heritage and ancestry',
      lede: 'Heritage societies often accept partial or distant descent and get very few applications.',
      questions: [
        { id: 'id.heritage', type: 'autocomplete', multiple: true, source: 'heritage', yield: 'high',
          prompt: 'Ethnic or national heritage, including ancestry you do not identify with day to day',
          placeholder: 'e.g. Italian, Scottish clan, Armenian',
          hint: 'Great-grandparents count. Partial descent counts.' },
        { id: 'id.tribal', type: 'single', ui: 'cards', yield: 'high',
          prompt: 'Are you enrolled in, or eligible for enrollment in, a recognized tribe?',
          options: O(['enrolled', 'Enrolled'], ['eligible', 'Eligible'], ['descendant', 'Descendant, not enrolled'], ['no', 'No']) },
        { id: 'id.tribe_name', type: 'autocomplete', source: 'tribes', yield: 'high',
          when: a => ['enrolled', 'eligible', 'descendant'].includes(a['id.tribal']),
          prompt: 'Which nation or tribe?', placeholder: 'Start typing' }
      ] },

    { id: 'id-background', phase: 'sensitive', sensitive: true, section: 'Background', when: a => a['consent.sensitive'] === true,
      title: 'Family and language',
      lede: 'First-generation and language-based awards are among the most common in the country.',
      questions: [
        { id: 'id.first_gen', type: 'bool', yield: 'med', prompt: 'Are you the first in your family to attend college?' },
        { id: 'id.languages', type: 'group', yield: 'med', addLabel: 'Add another language', rowLabel: 'Language',
          prompt: 'Languages you speak',
          fields: [
            { key: 'language', label: 'Language', type: 'autocomplete', source: 'languages', placeholder: 'e.g. Spanish' },
            { key: 'level', label: 'Level', type: 'single', ui: 'select', options: O(['basic', 'Basic'], ['conversational', 'Conversational'], ['fluent', 'Fluent'], ['native', 'Native']) }
          ] },
        { id: 'id.immigration_context', type: 'single', ui: 'cards', yield: 'med',
          prompt: 'Are you an immigrant, refugee, or child of immigrants?',
          hint: 'We never ask about legal status.',
          options: O(['immigrant', 'I am an immigrant'], ['refugee', 'I am a refugee'], ['child_of_immigrants', 'My parent or parents immigrated'], ['none', 'None of these']) }
      ] },

    { id: 'id-gender', phase: 'sensitive', sensitive: true, section: 'Identity', when: a => a['consent.sensitive'] === true,
      title: 'Gender and identity',
      lede: 'Many awards are restricted by gender or open to LGBTQ+ students.',
      questions: [
        { id: 'id.gender', type: 'single', yield: 'med', prompt: 'Gender',
          options: O(['woman', 'Woman'], ['man', 'Man'], ['nonbinary', 'Non-binary'], ['other', 'Another identity']) },
        { id: 'id.lgbtq', type: 'bool', yield: 'med', prompt: 'Do you identify as LGBTQ+?' }
      ] },

    { id: 'circ-health', phase: 'sensitive', sensitive: true, section: 'Circumstances', when: a => a['consent.sensitive'] === true,
      title: 'Health and family',
      lede: 'Many disease-specific funds cover the children of patients.',
      questions: [
        { id: 'circ.disability', type: 'multi', yield: 'med', other: true, otherPlaceholder: 'Add another',
          prompt: 'Do you have a disability or chronic condition?',
          options: O(['mobility', 'Mobility or physical'], ['learning', 'Learning disability or ADHD'], ['mental_health', 'Mental health'], ['sensory', 'Vision or hearing'], ['chronic', 'Chronic illness'], ['neurodivergent', 'Neurodivergent']) },
        { id: 'circ.family_illness', type: 'text', yield: 'high',
          prompt: 'Has an immediate family member had a serious illness?', placeholder: 'e.g. cancer, diabetes, ALS' },
        { id: 'circ.parent_status', type: 'multi', yield: 'med',
          prompt: 'Parent or guardian status',
          options: O(['deceased', 'Deceased'], ['disabled', 'Disabled'], ['incarcerated', 'Incarcerated'], ['separated', 'Separated or divorced']) }
      ] },

    { id: 'circ-home', phase: 'sensitive', sensitive: true, section: 'Circumstances', when: a => a['consent.sensitive'] === true,
      title: 'Home and responsibilities',
      lede: 'These map to real award criteria, from foster youth funds to single-parent grants.',
      questions: [
        { id: 'circ.foster', type: 'single', ui: 'cards', yield: 'med',
          prompt: 'Were you in foster care, adopted, or raised by a non-parent?',
          options: O(['foster', 'Foster care'], ['adopted', 'Adopted'], ['relative', 'Raised by a relative or non-parent'], ['none', 'None of these']) },
        { id: 'circ.caregiver', type: 'bool', yield: 'med', prompt: 'Are you a caregiver for a family member?' },
        { id: 'circ.dependents', type: 'single', yield: 'med', prompt: 'Do you have dependents, or are you a single parent?',
          options: O(['none', 'No dependents'], ['dependents', 'I have dependents'], ['single_parent', 'I am a single parent']) },
        { id: 'circ.housing', type: 'bool', yield: 'med', prompt: 'Have you experienced homelessness or housing instability?' }
      ] },

    { id: 'fin-aid', phase: 'sensitive', sensitive: true, section: 'Financial', when: a => a['consent.sensitive'] === true && !hsUnder(a),
      title: 'Financial aid',
      lede: 'Some awards need financial need, others are need-blind. Missing answers never hide your merit matches.',
      questions: [
        { id: 'fin.fafsa', type: 'bool', yield: 'low', prompt: 'Have you filed a FAFSA?' },
        { id: 'fin.sai', type: 'number', min: -1500, max: 999999, decimals: 0, yield: 'low', when: yes('fin.fafsa'),
          prompt: 'Student Aid Index (SAI)', placeholder: 'e.g. 4200', hint: 'It is on your FAFSA Submission Summary.' },
        { id: 'fin.dependency', type: 'single', yield: 'low', prompt: 'Dependent or independent student?',
          options: O(['dependent', 'Dependent'], ['independent', 'Independent']) }
      ] },

    { id: 'fin-income', phase: 'sensitive', sensitive: true, section: 'Financial', when: a => a['consent.sensitive'] === true && !hsUnder(a),
      title: 'Household income and current aid',
      lede: 'We use bands, never exact figures.',
      questions: [
        { id: 'fin.income_band', type: 'single', ui: 'cards', yield: 'med', prompt: 'Approximate household income',
          options: O(['lt30', 'Under $30,000'], ['30_48', '$30,000 to $48,000'], ['48_75', '$48,000 to $75,000'], ['75_110', '$75,000 to $110,000'], ['110_150', '$110,000 to $150,000'], ['150plus', 'Over $150,000']) },
        { id: 'fin.current_aid', type: 'multi', yield: 'low', prompt: 'Aid you already receive',
          options: [{ v: 'pell', l: 'Pell Grant' }, { v: 'state_grant', l: 'State grant' }, { v: 'institutional', l: 'Institutional aid' }, { v: 'private', l: 'Private scholarships' }, { v: 'none', l: 'None', x: true }] }
      ] },

    /* ───────────── Phase 4: Deduplication ───────────── */
    { id: 'history', phase: 'history', section: 'History',
      title: 'What have you already tried?',
      lede: 'So we never show you the same award twice. Skip anything that does not apply.',
      questions: [
        { id: 'dedupe.applied', type: 'multi', source: 'scholarships', other: true, options: [], otherPlaceholder: 'Type a scholarship name and press Enter',
          prompt: 'Scholarships you have already applied to' },
        { id: 'dedupe.won', type: 'multi', source: 'scholarships', other: true, options: [], otherPlaceholder: 'Type a scholarship name and press Enter',
          prompt: 'Scholarships you have won' },
        { id: 'dedupe.rejected', type: 'multi', source: 'scholarships', other: true, options: [], otherPlaceholder: 'Type a scholarship name and press Enter',
          prompt: 'Awards you were rejected from and do not want to see again' },
        { id: 'dedupe.blocklist', type: 'multi', other: true, options: [], otherPlaceholder: 'Type a provider name and press Enter',
          prompt: 'Any providers you want excluded' }
      ] },

    { id: 'summary', phase: 'history', kind: 'summary', section: 'Summary', questions: [] }
  ];

  /* Flat question index, each question keeps a pointer to its screen. */
  TW.questions = [];
  TW.qById = {};
  TW.screens.forEach(s => {
    (s.questions || []).forEach(q => {
      q.screen = s;
      if (s.sensitive && q.skippable === undefined && q.type !== 'note') q.skippable = true;
      TW.questions.push(q);
      TW.qById[q.id] = q;
    });
  });
})();
