// Landing page + waitlist only. This is what runs on the public host while the questionnaire and dashboard are not live:
// it serves landing/ at "/" and accepts POST /waitlist. Nothing else is exposed (no profile, matches or auth endpoints).
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Run: node landing-server.mjs   (the full app is index.mjs)
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSupabase } from './db.mjs';
import { waitlistRoute } from './waitlist-route.mjs';

const app = express();
app.set('trust proxy', 1);                       // behind one proxy/load balancer, so req.ip is the real client
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY' });
  next();
});

const supabase = initSupabase();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(express.static(path.join(root, 'landing'), { index: 'index.html', extensions: ['html'] }));   // /, /privacy, /terms (and .html)
app.post('/waitlist', ...waitlistRoute(supabase));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).type('text').send('Not found'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ Landing page and waitlist listening on port ${PORT}`));
