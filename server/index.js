import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import QRCode from 'qrcode';

import { initSchema, UPLOAD_DIR, one, all, run } from './db.js';
import { seed } from './seed.js';
import { requireAuth, requirePermission, audit } from './middleware.js';
import { buildReportCard, buildCertificate } from './reportcard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// ---------- File uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt']);
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) return cb(new Error('File type not allowed'));
    cb(null, true);
  },
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  audit(req.user, 'upload_file', 'file', null, { name: req.file.originalname, path: `/uploads/${req.file.filename}` }, req.ip);
  res.json({ ok: true, url: `/uploads/${req.file.filename}`, name: req.file.originalname, size: req.file.size });
});

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d', fallthrough: true }));

// ---------- Health check (for hosting platforms) ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'aseca-erp', time: new Date().toISOString() });
});

// ---------- QR code generation (for ID cards & result verification) ----------
app.get('/api/qr', (req, res) => {
  const text = String(req.query.text || '');
  if (!text || text.length > 500) return res.status(400).json({ error: 'Invalid text' });
  QRCode.toBuffer(text, { width: 256, margin: 1, color: { dark: '#0c4a2e', light: '#ffffff' } }, (err, buffer) => {
    if (err) return res.status(500).json({ error: 'QR generation failed' });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  });
});

// ---------- Auth ----------
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// ---------- Protected API ----------
import { requireAuth as ra } from './middleware.js';
import schoolsRoutes from './routes/schools.js';
import academicsRoutes from './routes/academics.js';
import studentsRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';
import attendanceRoutes from './routes/attendance.js';
import examsRoutes from './routes/exams.js';
import feesRoutes from './routes/fees.js';
import libraryRoutes from './routes/library.js';
import hostelRoutes from './routes/hostel.js';
import timetableRoutes from './routes/timetable.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';

app.use('/api', schoolsRoutes);
app.use('/api', academicsRoutes);
app.use('/api', studentsRoutes);
app.use('/api', staffRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', examsRoutes);
app.use('/api', feesRoutes);
app.use('/api', libraryRoutes);
app.use('/api', hostelRoutes);
app.use('/api', timetableRoutes);
app.use('/api', contentRoutes);
app.use('/api', adminRoutes);

// ---------- Certificates & report cards ----------
app.get('/api/certificates', requireAuth, (req, res) => {
  const rows = all(`SELECT ct.*, st.name AS student_name, st.student_id AS sid FROM certificates ct LEFT JOIN students st ON st.id = ct.student_id ORDER BY ct.id DESC LIMIT 500`);
  res.json({ ok: true, data: rows });
});
app.post('/api/certificates', requireAuth, requirePermission('certificates', 'create'), (req, res) => {
  const b = req.body || {};
  const cert_no = b.certificate_no || ('CERT-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)));
  const info = run(`INSERT INTO certificates (org_id, student_id, certificate_no, type, title, issue_date, issued_by) VALUES (1,?,?,?,?,?,?)`,
    [b.student_id, cert_no, b.type || 'bonafide', b.title || null, b.issue_date || new Date().toISOString().slice(0, 10), req.user.id]);
  audit(req.user, 'create_certificate', 'certificate', info.lastInsertRowid, { type: b.type, student_id: b.student_id }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
app.get('/api/certificates/:id/pdf', requireAuth, async (req, res) => {
  const cert = one(`SELECT * FROM certificates WHERE id = ?`, [req.params.id]);
  if (!cert) return res.status(404).json({ error: 'Not found' });
  const done = await buildCertificate(cert, res);
  if (!done) return res.status(404).json({ error: 'Student not found' });
});
app.delete('/api/certificates/:id', requireAuth, requirePermission('certificates', 'delete'), (req, res) => {
  run(`DELETE FROM certificates WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/report-card/:examId/:studentId/pdf', requireAuth, async (req, res) => {
  const done = await buildReportCard(req.params.examId, req.params.studentId, res);
  if (!done) return res.status(404).json({ error: 'Result not found' });
});

// ---------- Public API ----------
import publicRoutes from './routes/public.js';
app.use('/api', publicRoutes);

// ---------- SPA fallback ----------
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: '1h' }));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: `Upload error: ${err.message}` });
  if (err && err.message === 'File type not allowed') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;

initSchema();
seed();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] BRANCH ASECA DANGACHUA ERP running on http://0.0.0.0:${PORT}`);
});
