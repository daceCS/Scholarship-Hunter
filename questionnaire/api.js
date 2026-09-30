/* Phase 3c API integration: wire questionnaire to match engine */
window.TW = window.TW || {};

const API_BASE = 'http://localhost:3000';

// Convert questionnaire answers to profile format
function answersToProfile(answers) {
  return {
    geo: {
      state: answers['geo.state'],
      county: answers['geo.county'],
    },
    academic: {
      status: answers['edu.status'],
      gpa: answers['academic.gpa'] ? parseFloat(answers['academic.gpa']) : undefined,
      cip_codes: answers['academic.cip_codes'] || [],
      enrollment: answers['academic.enrollment'],
    },
    effort: {
      essay_words: answers['effort.essay_words'] ? parseInt(answers['effort.essay_words']) : 500,
      recs: answers['effort.recs'],
      min_award: 500,
      deadline_floor: 14,
    },
    affiliations: {},
    phases_completed: ['intake'],
    withheld: [],
  };
}

// Get teaser estimate (stateless)
async function getEstimate(answers) {
  try {
    if (!answers['geo.state']) return { count: 0, dollars_total: 0, possible_count: 0 };
    const profile = answersToProfile(answers);
    const response = await fetch(`${API_BASE}/match/count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Estimate fetch failed:', error.message);
    return { count: 0, dollars_total: 0, possible_count: 0 };
  }
}

// Convert API match to display format
function displayMatch(m) {
  return {
    name: m.name,
    org: m.provider,
    amt: m.amount?.max || 0,
    pct: Math.min(100, Math.round((m.score / Math.max(m.amount?.max, 1)) * 100)),
    due: m.deadline ? new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
  };
}

TW.api = {
  async saveProgress(/* state */) { /* browser localStorage only (see app.js) */ },

  async submitAvatar(answers) {
    try {
      // Generate or retrieve user ID (in real app, from Supabase Auth)
      const userId = window.TW.userId || localStorage.getItem('tw.user.id') ||
                     crypto.randomUUID?.() || String(Date.now());
      localStorage.setItem('tw.user.id', userId);

      // Save profile + run matching
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: userId,
          core_json: answersToProfile(answers),
          sensitive_json: {},
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      console.info('[intake] avatar submitted', {
        profile_id: result.profile_id,
        eligible: result.eligible_count,
        possible: result.possible_count
      });

      // Store for dashboard
      window.TW.userId = userId;
      window.TW.profileId = result.profile_id;
      window.TW.matches = result.top_matches?.map(displayMatch) || [];

      return { ok: true, userId, matches: window.TW.matches };
    } catch (error) {
      console.error('[intake] avatar submit failed:', error);
      return { ok: false, error: error.message };
    }
  },

  // For teaser in results screen
  getEstimate,
};

// Hook: provide estimate for real-time display (async-safe)
TW.getEstimate = getEstimate;
