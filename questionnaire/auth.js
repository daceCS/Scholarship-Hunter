/* Supabase email + password auth, shared by questionnaire and dashboard (same origin).
   Accounts are invite-only: people join the waitlist, are approved (backend/waitlist.mjs), and set a password from the invitation email. */
window.TW = window.TW || {};
TW.auth = (() => {
  let clientP;
  const client = () => clientP ||= fetch('/config').then(r => r.json()).then(c => supabase.createClient(c.supabaseUrl, c.supabaseAnonKey));
  const session = async () => (await (await client()).auth.getSession()).data.session;
  return {
    session,
    async setPassword(password) {
      const { error } = await (await client()).auth.updateUser({ password });
      if (error) throw error;
    },
    // Emails a one-time link to /questionnaire/set-password.html. Always reports success so it can't be used to look up accounts.
    async resetPassword(email) {
      const { error } = await (await client()).auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/questionnaire/set-password.html' });
      if (error && error.status !== 400) throw error;
    },
    async signIn(email, password) {
      const { error } = await (await client()).auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // Sign-in form shared by questionnaire and dashboard. onDone() runs once a session exists.
    form(onDone) {
      const mk = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
      const email = mk('input', { className: 'input', type: 'email', autocomplete: 'email', placeholder: 'you@example.com' });
      email.setAttribute('aria-label', 'Email address');
      const pw = mk('input', { className: 'input', type: 'password', autocomplete: 'current-password', placeholder: 'Password' });
      pw.setAttribute('aria-label', 'Password');
      const msg = mk('p', { className: 'fine' }); msg.setAttribute('role', 'status');
      const go = mk('button', { className: 'btn btn-primary', type: 'button' }, 'Sign in');
      const forgot = mk('button', { className: 'link-btn', type: 'button' }, 'Forgot password?');
      forgot.onclick = async () => {
        if (!email.value || !email.checkValidity()) { msg.textContent = 'Enter your email above first.'; return; }
        try { await TW.auth.resetPassword(email.value.trim()); msg.textContent = 'If that email has an account, a reset link is on its way.'; }
        catch (e) { msg.textContent = e.message; }
      };
      go.onclick = async () => {
        if (!email.value || !email.checkValidity()) { msg.textContent = 'Enter a valid email address.'; return; }
        if (!pw.value) { msg.textContent = 'Enter your password.'; return; }
        go.disabled = true; msg.textContent = 'Working...';
        try { await TW.auth.signIn(email.value.trim(), pw.value); await onDone(); }
        catch (e) { go.disabled = false; msg.textContent = e.message; }
      };
      pw.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
      const join = mk('p', { className: 'fine' }, 'Early access is invite-only. ', mk('a', { href: '/landing/#start' }, 'Join the waitlist'), '.');
      return mk('div', { className: 'auth-form' }, email, pw, msg, mk('div', { className: 'actions' }, forgot, mk('span', { className: 'grow' }), go), join);
    },
    async signOut() { await (await client()).auth.signOut(); },
    async fetch(path, opts = {}) {
      const s = await session();
      if (!s) throw new Error('not signed in');
      return fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers, Authorization: 'Bearer ' + s.access_token } });
    },
  };
})();
