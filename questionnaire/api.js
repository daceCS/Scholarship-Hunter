/* Phase 3c API integration: wire questionnaire to match engine */
window.TW = window.TW || {};

const API_BASE = '';

// Get teaser estimate (stateless)
async function getEstimate(avatar) {
  try {
    const response = await fetch(`${API_BASE}/match/count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(avatar), // the backend normalizes it (backend/profile.mjs)
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
  async submitAvatar(avatar) {
    const body = { core_json: avatar };
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
