// Phase 3c: HTTP endpoints for the match engine
// POST /match/count - stateless teaser (answers → count + top 3)
// POST /profile - save profile, run matching
// GET /matches - fetch user's matches

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSupabase, createProfile, matchProfile, getMatches } from './db.mjs';
import { filter, evaluateScholarship, score, rank } from './match.mjs';

const app = express();
app.use(express.json());

const supabase = initSupabase();

// Serve frontends from one origin so localStorage + the Supabase session are shared (and no CORS needed)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const dir of ['landing', 'questionnaire', 'dashboard']) app.use('/' + dir, express.static(path.join(root, dir)));

// Public browser config (the anon key is public by design)
app.get('/config', (req, res) => res.json({ supabaseUrl: process.env.SUPABASE_URL, supabaseAnonKey: process.env.SUPABASE_ANON_KEY }));

// Verify the Supabase JWT; user id comes from the token, never from the client
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return res.status(401).json({ error: 'sign in required' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'invalid session' });
  req.userId = data.user.id;
  next();
}

// POST /match/count - Stateless teaser endpoint
// Input: { geo, academic, effort, affiliations, ... } (partial profile)
// Output: { count: N, dollars_total: X, top_3: [...] }
app.post('/match/count', async (req, res) => {
  try {
    const profile = req.body;
    if (!profile.geo?.state) return res.status(400).json({ error: 'geo.state required' });

    // Load scholarships from Supabase
    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*');

    if (error) throw error;

    // Filter + evaluate
    const candidates = filter(profile, scholarships.map(s => s.full_data || s));
    const matches = candidates
      .map(s => ({
        scholarship: s,
        status: evaluateScholarship(profile, s),
        score: score(profile, s),
      }))
      .filter(m => m.status !== 'ineligible')
      .sort((a, b) => b.score - a.score);

    const eligible = matches.filter(m => m.status === 'eligible');
    const top3 = eligible.slice(0, 3).map(m => ({
      name: m.scholarship.name,
      amount: m.scholarship.amount?.max,
      provider: m.scholarship.provider_org,
    }));
    const dollars_total = eligible.reduce((sum, m) => sum + (m.scholarship.amount?.max || 0), 0);

    res.json({
      count: eligible.length,
      dollars_total,
      possible_count: matches.filter(m => m.status === 'possible').length,
      top_3: top3,
    });
  } catch (error) {
    console.error('POST /match/count:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /profile - Save profile and run matching
// Auth: Bearer token. Input: { core_json, sensitive_json?, consented_at? }
// Output: { profile_id, version, eligible_count, possible_count, top_matches }
app.post('/profile', requireAuth, async (req, res) => {
  try {
    const { core_json, sensitive_json } = req.body;
    const auth_user_id = req.userId;
    if (!core_json) return res.status(400).json({ error: 'core_json required' });

    // Save profile
    const profile = await createProfile(supabase, auth_user_id, core_json, sensitive_json);

    // Run matching
    const fullProfile = { ...core_json, ...sensitive_json };
    const matchResults = await matchProfile(supabase, profile.id, fullProfile);

    // Get top matches
    const matches = await getMatches(supabase, profile.id, 10);
    const topMatches = matches
      .filter(m => m.status === 'eligible')
      .slice(0, 3)
      .map(m => ({
        name: m.scholarships.name,
        amount: m.scholarships.amount?.max,
        provider: m.scholarships.provider_org,
        score: m.score,
      }));

    res.json({
      profile_id: profile.id,
      version: profile.version,
      eligible_count: matchResults.eligible,
      possible_count: matchResults.possible,
      top_matches: topMatches,
    });
  } catch (error) {
    console.error('POST /profile:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /matches - Fetch user's matches
// Auth: Bearer token. Query: ?limit=100
// Output: { matches: [...] } with scholarship details
app.get('/matches', requireAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const user_id = req.userId;

    // Get user's latest profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .order('version', { ascending: false })
      .limit(1);

    if (profileError) throw profileError;
    if (!profiles?.length) return res.status(404).json({ error: 'No profile found' });

    const profileId = profiles[0].id;

    // Get matches
    const matches = await getMatches(supabase, profileId, parseInt(limit));

    res.json({
      matches: matches.map(m => ({
        scholarship_id: m.scholarship_id,
        name: m.scholarships.name,
        provider: m.scholarships.provider_org,
        amount: m.scholarships.amount,
        deadline: m.scholarships.deadline,
        apply_url: m.scholarships.apply_url,
        effort: m.scholarships.effort,
        status: m.status,
        score: m.score,
      })),
    });
  } catch (error) {
    console.error('GET /matches:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Match engine API listening on port ${PORT}`);
  console.log(`  POST /match/count - stateless teaser`);
  console.log(`  POST /profile - save profile + match (auth required)`);
  console.log(`  GET /matches - fetch matches (auth required)`);
});
