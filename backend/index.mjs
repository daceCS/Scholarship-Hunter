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
import { normalizeAvatar, splitAvatar } from './profile.mjs';
import { rateLimit } from './ratelimit.mjs';

const app = express();
app.set('trust proxy', 1);   // behind one proxy/load balancer in production, so req.ip is the real client
app.use(express.json({ limit: '100kb' }));

const supabase = initSupabase();

// Serve frontends from one origin so localStorage + the Supabase session are shared (and no CORS needed)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const dir of ['questionnaire', 'dashboard']) app.use('/' + dir, express.static(path.join(root, dir)));
app.use(express.static(path.join(root, 'landing')));                       // the landing page is the site root: /, /privacy.html, /terms.html
app.get(['/landing', '/landing/*'], (req, res) => res.redirect(301, '/' + (req.params[0] || '')));   // old /landing/ addresses

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
app.post('/match/count', rateLimit({ max: 120, windowMs: 60_000 }), async (req, res) => {
  try {
    const profile = normalizeAvatar(req.body); // body is the questionnaire avatar (possibly partial)

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
    const { core_json } = req.body; // the questionnaire avatar
    const auth_user_id = req.userId;
    if (!core_json) return res.status(400).json({ error: 'core_json required' });

    // Save profile: sensitive sections are stored apart from the core profile
    const { core, sensitive } = splitAvatar(core_json);
    const profile = await createProfile(supabase, auth_user_id, core, Object.keys(sensitive).length ? sensitive : null);

    // Run matching
    const matchResults = await matchProfile(supabase, profile.id, normalizeAvatar(core_json));

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

// POST /waitlist - join the early-access list. Public. Input: { email, website? } ("website" is a hidden spam trap).
// Always answers the same way for new and repeat emails, so it can't be used to find out who has signed up.
app.post('/waitlist', rateLimit({ max: 5, windowMs: 3600_000, message: 'too many attempts, try again later' }), async (req, res) => {
  try {
    const { email, website } = req.body || {};
    if (website) return res.status(201).json({ ok: true });                        // a bot filled the hidden field; pretend it worked
    const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'please enter a valid email address' });
    const { error } = await supabase.from('waitlist').insert({ email: e });
    if (error && error.code !== '23505') throw error;                               // 23505 = already on the list
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('POST /waitlist:', error.message);
    res.status(500).json({ error: 'something went wrong, please try again' });
  }
});

// POST /feedback - a test user reports a problem with a scholarship's details or match
// Auth: Bearer token. Input: { scholarship_id, kind, message? }. Stored for review (see feedback-report.mjs).
const FEEDBACK_KINDS = ['wrong_amount', 'wrong_deadline', 'wrong_requirements', 'not_eligible', 'broken_link', 'other'];
app.post('/feedback', requireAuth, async (req, res) => {
  try {
    const { scholarship_id, kind, message = '' } = req.body || {};
    if (!FEEDBACK_KINDS.includes(kind)) return res.status(400).json({ error: `kind must be one of ${FEEDBACK_KINDS.join(', ')}` });
    if (typeof message !== 'string' || message.length > 1000) return res.status(400).json({ error: 'message must be text of at most 1000 characters' });
    if (kind === 'other' && !message.trim()) return res.status(400).json({ error: 'please describe the problem' });

    const { data: sch, error: schErr } = await supabase.from('scholarships').select('id, name, source_url').eq('id', scholarship_id).maybeSingle();
    if (schErr) throw schErr;
    if (!sch) return res.status(404).json({ error: 'unknown scholarship' });

    // Simple abuse guard: at most 30 reports per user per hour
    const since = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count, error: cntErr } = await supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('user_id', req.userId).gte('created_at', since);
    if (cntErr) throw cntErr;
    if (count >= 30) return res.status(429).json({ error: 'too many reports, try again later' });

    const { error } = await supabase.from('feedback').insert({
      user_id: req.userId, scholarship_id: sch.id, scholarship_name: sch.name, scholarship_source_url: sch.source_url, kind, message: message.trim(),
    });
    if (error) throw error;
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('POST /feedback:', error.message);
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
        scholarship_id: m.scholarships.id,
        name: m.scholarships.name,
        provider: m.scholarships.provider_org,
        amount: m.scholarships.amount,
        deadline: m.scholarships.deadline,
        apply_url: m.scholarships.apply_url,
        effort: m.scholarships.effort,
        // 'live' = a person checked the details; anything else (draft, review) is machine-extracted and unverified
        verified: m.scholarships.review_status === 'live',
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
  console.log(`  POST /feedback - report a problem (auth required)`);
});
