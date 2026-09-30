/* Phase 3c API integration: wire questionnaire to match engine */
window.TW = window.TW || {};

const API_BASE = '';

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
