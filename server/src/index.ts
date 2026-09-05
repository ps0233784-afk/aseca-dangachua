import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { db, initSchema } from './db';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import schoolsRoutes from './routes/schools';
import usersRoutes from './routes/users';
import studentsRoutes from './routes/students';
import peopleRoutes from './routes/people';
import academicRoutes from './routes/academic';
import contentRoutes from './routes/content';

async function start() {
  // Initialize database
  await db.init();
  initSchema();

  const app = express();
  const PORT = Number(process.env.PORT) || 4000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Uploaded files
  const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, app: 'BRANCH ASECA DANGACHUA', version: '2.0.0', time: new Date().toISOString() });
  });

  // Small dependency-free login throttle for the demo adapter. Production should use a shared store.
  const authHits = new Map<string, { count: number; resetAt: number }>();
  app.use('/api/auth/login', (req, res, next) => {
    const key = `${req.ip}:${String(req.body?.email || '').toLowerCase()}`;
    const now = Date.now(); const current = authHits.get(key);
    if (!current || current.resetAt < now) authHits.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    else if (current.count >= 10) return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    else current.count += 1;
    next();
  });

  // API routes
  app.use('/api', authRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api', schoolsRoutes);
  app.use('/api', usersRoutes);
  app.use('/api', studentsRoutes);
  app.use('/api', peopleRoutes);
  app.use('/api', academicRoutes);
  app.use('/api', contentRoutes);

  // 404 for unknown API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Serve built React app in production
  const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASECA] Server running on port ${PORT}`);
    console.log(`[ASECA] Client dist ${fs.existsSync(CLIENT_DIST) ? 'found' : 'not found (dev mode)'}`);
  });
}

start().catch((err) => {
  console.error('[ASECA] Failed to start:', err);
  process.exit(1);
});
