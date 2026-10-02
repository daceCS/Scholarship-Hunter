// POST /waitlist - join the early-access list. Public. Input: { email, website? } ("website" is a hidden spam trap).
// Always answers the same way for new and repeat emails, so it can't be used to find out who has signed up.
// Shared by index.mjs (the full app) and landing-server.mjs (landing page only). Usage: app.post('/waitlist', ...waitlistRoute(supabase))
import { rateLimit } from './ratelimit.mjs';

export function waitlistRoute(supabase) {
  const limit = rateLimit({ max: 5, windowMs: 3600_000, message: 'too many attempts, try again later' });
  const handler = async (req, res) => {
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
  };
  return [limit, handler];
}
