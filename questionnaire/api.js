/* Phase 3c API integration: wire questionnaire to match engine */
window.TW = window.TW || {};

const API_BASE = '';

// Convert questionnaire answers (schema.js ids) to the match engine's profile shape.
// ponytail: county, CIP codes and most affiliations aren't mapped yet (needs ZIP->county and major->CIP tables).
const stateOf = city => (/,\s*([A-Z]{2})/.exec(city || '') || [])[1];
function answersToProfile(answers) {
  return {
    geo: { state: stateOf(answers['geo.current']), zip: answers['geo.zip'] },
    academic: {
      status: answers['edu.status'],
      gpa: answers['edu.gpa'] !== undefined ? parseFloat(answers['edu.gpa']) : undefined,
      cip_codes: [],
      enrollment: answers['edu.enrollment'],
    },
    effort: { essay_words: 500, recs: answers['effort.recs'], min_award: 500, deadline_floor: 14 },
    affiliations: {},
    phases_completed: ['intake'],
    withheld: [],
  };
}

// Get teaser estimate (stateless)
async function getEstimate(answers) {
  try {
    const profile = answersToProfile(answers);
    if (!profile.geo.state) return { count: 0, dollars_total: 0, possible_count: 0 }; // needs "City, ST"
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

TW.api = {
  async saveProgress(/* state */) { /* browser localStorage only (see app.js) */ },

  // Saves the profile for the signed-in user. Without a session, parks it in localStorage
  // (shared with the dashboard) and returns needsAuth; the dashboard flushes it on next load.
  async submitAvatar(answers) {
    const body = { core_json: answersToProfile(answers), sensitive_json: {} };
    if (!(await TW.auth.session())) {
      localStorage.setItem('tw.pending', JSON.stringify(body));
      return { needsAuth: true };
    }
    return TW.api.postProfile(body);
  },

  async postProfile(body) {
    const response = await TW.auth.fetch(`${API_BASE}/profile`, { method: 'POST', body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    localStorage.removeItem('tw.pending'); // saved: don't let the dashboard flush it again
    return response.json();
  },

  async flushPending() {
    const raw = localStorage.getItem('tw.pending');
    if (raw) await TW.api.postProfile(JSON.parse(raw));
  },

  // For teaser in results screen
  getEstimate,
};

// Hook: provide estimate for real-time display (async-safe)
TW.getEstimate = getEstimate;
