// Per-IP request limiter, in memory (resets on restart; one server process).
// ponytail: in-memory per process, move to a shared store (e.g. Redis) if the app runs on several instances.
export function rateLimit({ max, windowMs, message = 'too many requests, try again later' }) {
  const hits = new Map();   // ip -> { n, reset }
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const now = Date.now();
    let h = hits.get(req.ip);
    if (!h || h.reset < now) hits.set(req.ip, h = { n: 0, reset: now + windowMs });
    if (++h.n > max) {
      res.set('Retry-After', String(Math.ceil((h.reset - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}
