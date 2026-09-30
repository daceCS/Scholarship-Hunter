/* Supabase magic-link auth, shared by questionnaire and dashboard (same origin). */
window.TW = window.TW || {};
TW.auth = (() => {
  let clientP;
  const client = () => clientP ||= fetch('/config').then(r => r.json()).then(c => supabase.createClient(c.supabaseUrl, c.supabaseAnonKey));
  const session = async () => (await (await client()).auth.getSession()).data.session;
  return {
    session,
    async sendLink(email) {
      const { error } = await (await client()).auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + '/dashboard/' } });
      if (error) throw error;
    },
    async fetch(path, opts = {}) {
      const s = await session();
      if (!s) throw new Error('not signed in');
      return fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers, Authorization: 'Bearer ' + s.access_token } });
    },
  };
})();
