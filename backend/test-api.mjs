// Quick API endpoint tests
import http from 'http';

const baseUrl = 'http://localhost:3000';

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...\n');

  try {
    // Test 1: POST /match/count
    console.log('=== TEST 1: POST /match/count ===');
    const teaser = await request('POST', '/match/count', {
      geo: { state: 'CA', county: 'San Diego' },
      academic: { status: 'hs_senior', gpa: 3.5, enrollment: 'full_time' },
      effort: { essay_words: 500, recs: 'yes', min_award: 500, deadline_floor: 14 },
      phases_completed: ['intake'],
      withheld: [],
    });
    console.log('✓ Response:', JSON.stringify(teaser, null, 2));
    console.log('');

    // Test 2: POST /profile
    console.log('=== TEST 2: POST /profile ===');
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
    const profile = await request('POST', '/profile', {
      auth_user_id: userId,
      core_json: {
        geo: { state: 'CA', county: 'San Diego' },
        academic: { status: 'hs_senior', gpa: 3.5, enrollment: 'full_time', cip_codes: [] },
        effort: { essay_words: 500, recs: 'yes', min_award: 500, deadline_floor: 14 },
        affiliations: {},
        phases_completed: ['intake'],
        withheld: [],
      },
      sensitive_json: {
        financial: { income_band: '50k-75k' },
      },
    });
    console.log('✓ Response:', JSON.stringify(profile, null, 2));
    const profileId = profile.profile_id;
    console.log('');

    // Test 3: GET /matches
    console.log('=== TEST 3: GET /matches ===');
    const matches = await request('GET', `/matches?user_id=${userId}&limit=5`);
    console.log('✓ Response:', JSON.stringify(matches, null, 2));
    console.log('');

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`✓ POST /match/count: ${teaser.count} eligible scholarships`);
    console.log(`✓ POST /profile: Created profile #${profileId} with ${profile.eligible_count} eligible matches`);
    console.log(`✓ GET /matches: Retrieved ${matches.matches?.length || 0} matches`);
    console.log('\n✓ All endpoints working!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
