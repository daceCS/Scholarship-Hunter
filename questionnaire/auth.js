/* Supabase email + password auth, shared by questionnaire and dashboard (same origin). */
window.TW = window.TW || {};
TW.auth = (() => {
  let clientP;
  const client = () => clientP ||= fetch('/config').then(r => r.json()).then(c => supabase.createClient(c.supabaseUrl, c.supabaseAnonKey));
  const session = async () => (await (await client()).auth.getSession()).data.session;
  return {
    session,
    async signUp(email, password) {
      const { data, error } = await (await client()).auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('Account created, but email confirmation is on. Turn off "Confirm email" in Supabase (Authentication > Sign In / Providers > Email) for development.');
    },
    async signIn(email, password) {
      const { error } = await (await client()).auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // Sign-in / create-account form shared by questionnaire and dashboard. onDone() runs once a session exists.
    form(onDone) {
      let mode = 'signup';
      const mk = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
      const email = mk('input', { className: 'input', type: 'email', autocomplete: 'email', placeholder: 'you@example.com' });
      email.setAttribute('aria-label', 'Email address');
      const pw = mk('input', { className: 'input', type: 'password', minLength: 8, placeholder: 'Password (8+ characters)' });
      pw.setAttribute('aria-label', 'Password');
      const msg = mk('p', { className: 'fine' }); msg.setAttribute('role', 'status');
      const go = mk('button', { className: 'btn btn-primary', type: 'button' });
      const toggle = mk('button', { className: 'link-btn', type: 'button' });
      const render = () => {
        go.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
        pw.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
        toggle.textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account';
        msg.textContent = '';
      };
      toggle.onclick = () => { mode = mode === 'signup' ? 'signin' : 'signup'; render(); };
      go.onclick = async () => {
        if (!email.value || !email.checkValidity()) { msg.textContent = 'Enter a valid email address.'; return; }
        if (pw.value.length < 8) { msg.textContent = 'Password must be at least 8 characters.'; return; }
        go.disabled = true; msg.textContent = 'Working...';
        try { await (mode === 'signup' ? TW.auth.signUp : TW.auth.signIn)(email.value.trim(), pw.value); await onDone(); }
        catch (e) { go.disabled = false; msg.textContent = e.message; }
      };
      pw.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
      render();
      return mk('div', { className: 'auth-form' }, email, pw, msg, mk('div', { className: 'actions' }, toggle, mk('span', { className: 'grow' }), go));
    },
    async signOut() { await (await client()).auth.signOut(); },
    async fetch(path, opts = {}) {
      const s = await session();
      if (!s) throw new Error('not signed in');
      return fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers, Authorization: 'Bearer ' + s.access_token } });
    },
  };
})();
