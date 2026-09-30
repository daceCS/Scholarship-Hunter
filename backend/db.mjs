// Database helpers: connect to Supabase, load scholarships, manage profiles/matches.
// Environment: SUPABASE_URL, SUPABASE_ANON_KEY (from Supabase project settings)

import { createClient } from '@supabase/supabase-js';
import { loadScholarships } from './match.mjs';
import { evaluateScholarship, score } from './match.mjs';

// Initialize Supabase client
export function initSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY required');
  }
  return createClient(url, key);
}

// Load scholarships from gold.json and insert into Supabase
export async function loadScholarshipsToDb(supabase) {
  const scholarships = loadScholarships();
  console.log(`Loading ${scholarships.length} scholarships...`);

  // Delete ALL existing scholarships to avoid duplicates
  const { data: existingCount } = await supabase
    .from('scholarships')
    .select('id', { count: 'exact', head: true });

  if (existingCount && existingCount.length > 0) {
    console.log('Clearing existing scholarships...');
    await supabase.from('scholarships').delete().gte('id', 0);
  }

  // Insert in batches
  const batch_size = 50;
  for (let i = 0; i < scholarships.length; i += batch_size) {
    const batch = scholarships.slice(i, i + batch_size).map(s => ({
      page_id: s.page_id,
      name: s.name,
      provider_org: s.provider_org,
      apply_url: s.apply_url,
      source_url: s.source_url,
      amount: s.amount,
      deadline: s.deadline,
      cycle_status: s.cycle_status,
      geo_scope: s.geo_scope,
      levels: s.levels,
      effort: s.effort,
      eligibility: s.eligibility,
      provenance: s.provenance,
      verified_at: s.verified_at,
      confidence: s.confidence,
      full_data: s,  // Store complete scholarship for later evaluation
    }));

    const { error } = await supabase.from('scholarships').insert(batch);
    if (error) throw error;
    console.log(`  Loaded ${Math.min(i + batch_size, scholarships.length)}/${scholarships.length}`);
  }
  console.log('✓ Scholarships loaded');
}

// Create a new profile version for a user
export async function createProfile(supabase, userId, coreJson, sensitiveJson = null) {
  // Get next version number
  const { data: existing } = await supabase
    .from('profiles')
    .select('version')
    .eq('user_id', userId)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = (existing?.[0]?.version || 0) + 1;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      version: nextVersion,
      core_json: coreJson,
      sensitive_json: sensitiveJson,
      consented_at: sensitiveJson ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Evaluate a profile against all scholarships and store matches
export async function matchProfile(supabase, profileId, profile) {
  const { data: scholarships, error: scholarError } = await supabase
    .from('scholarships')
    .select('*');

  if (scholarError) throw scholarError;

  // Evaluate each scholarship
  const matches = scholarships
    .map(s => ({
      profile_id: profileId,
      scholarship_id: s.id,
      status: evaluateScholarship(profile, s.full_data),
      score: score(profile, s.full_data),
    }))
    .filter(m => m.status !== 'ineligible');  // Only store eligible/possible

  // Insert matches in batches
  const batch_size = 100;
  for (let i = 0; i < matches.length; i += batch_size) {
    const batch = matches.slice(i, i + batch_size);
    const { error } = await supabase.from('matches').upsert(batch, {
      onConflict: 'profile_id,scholarship_id',
    });
    if (error) throw error;
  }

  const eligible = matches.filter(m => m.status === 'eligible').length;
  const possible = matches.filter(m => m.status === 'possible').length;
  console.log(`✓ Matched: ${eligible} eligible, ${possible} possible`);
  return { eligible, possible, total: matches.length };
}

// Get matches for a profile
export async function getMatches(supabase, profileId, limit = 100) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      status,
      score,
      scholarships (
        id,
        name,
        provider_org,
        amount,
        deadline,
        apply_url,
        effort
      )
    `)
    .eq('profile_id', profileId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Get user's profiles
export async function getUserProfiles(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .order('version', { ascending: false });

  if (error) throw error;
  return data;
}

export default {
  initSupabase,
  loadScholarshipsToDb,
  createProfile,
  matchProfile,
  getMatches,
  getUserProfiles,
};
