import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import coreRoutes from './routes/core';
import peopleRoutes from './routes/people';
import academicRoutes from './routes/academic';
import opsRoutes from './routes/ops';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Uploaded files (document/photo store)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'BRANCH ASECA DANGACHUA', time: new Date().toISOString() }));

app.use('/api', coreRoutes);
app.use('/api', peopleRoutes);
app.use('/api', academicRoutes);
app.use('/api', opsRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

// Serve built React app in production
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ASECA] Server running on port ${PORT}`);
  console.log(`[ASECA] DB at ${process.env.DATA_DIR || 'local data/'} — client dist ${fs.existsSync(CLIENT_DIST) ? 'found' : 'not found (dev mode)'}`);
});
