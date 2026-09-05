import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, generateId } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole, requireWrite, auditLog } from '../middleware/auth';

const router = Router();
const uploadRoot = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadRoot, { recursive: true });
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4']);
const upload = multer({
  dest: uploadRoot,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, allowed.has(file.mimetype)),
});

const json = (value: any, fallback: any = []) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const clean = (value: any, max = 10000) => String(value ?? '').trim().slice(0, max);
const isEditor = (req: AuthenticatedRequest) => ['super_admin', 'org_admin', 'school_admin'].includes(req.user?.role || '');

// Public heritage profile and normalized editorial content.
router.get('/public/historical/:slug', (_req, res) => {
  try {
    const profile = db.prepare("SELECT * FROM historical_profiles WHERE slug = ? AND status = 'published'").get(_req.params.slug) as any;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const sections = db.prepare("SELECT * FROM historical_profile_sections WHERE profile_id = ? AND status = 'published' ORDER BY display_order").all(profile.id);
    const timeline = db.prepare("SELECT * FROM historical_timeline WHERE profile_id = ? AND status = 'published' ORDER BY display_order, date_label").all(profile.id);
    const contributions = db.prepare("SELECT * FROM historical_contributions WHERE profile_id = ? AND status = 'published' ORDER BY display_order").all(profile.id);
    const images = db.prepare("SELECT * FROM historical_images WHERE profile_id = ? AND status = 'published' ORDER BY display_order").all(profile.id);
    const references = db.prepare("SELECT * FROM historical_references WHERE profile_id = ? AND status = 'published' ORDER BY display_order").all(profile.id);
    res.json({ ...profile, sections, timeline, contributions, images, references });
  } catch (error) { res.status(500).json({ error: 'Failed to load heritage profile' }); }
});

router.get('/public/dictionary', (req, res) => {
  try {
    const q = clean(req.query.q, 120);
    const category = clean(req.query.category, 80);
    let sql = "SELECT d.*, c.name as category_name FROM dictionary_entries d LEFT JOIN dictionary_categories c ON c.id = d.category_id WHERE d.status = 'active' AND d.verified = 1";
    const args: any[] = [];
    if (q) { sql += ' AND (d.word LIKE ? OR d.ol_chiki LIKE ? OR d.roman LIKE ? OR d.odia LIKE ? OR d.hindi LIKE ? OR d.english LIKE ?)'; const term = `%${q}%`; args.push(term, term, term, term, term, term); }
    if (category) { sql += ' AND (c.id = ? OR c.name = ?)'; args.push(category, category); }
    sql += ' ORDER BY d.word LIMIT 100';
    const entries = db.prepare(sql).all(...args).map((entry: any) => ({ ...entry, synonyms: json(entry.synonyms), antonyms: json(entry.antonyms), relatedWords: json(entry.related_words) }));
    const categories = db.prepare("SELECT * FROM dictionary_categories ORDER BY display_order, name").all();
    res.json({ entries, categories });
  } catch (error) { res.status(500).json({ error: 'Failed to load dictionary' }); }
});

router.get('/public/olchiki/letters', (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM olchiki_letters WHERE status = 'active' ORDER BY display_order").all()); }
  catch { res.status(500).json({ error: 'Failed to load letters' }); }
});

router.get('/public/olchiki/lessons', (_req, res) => {
  try {
    const lessons = db.prepare("SELECT * FROM olchiki_lessons WHERE status = 'active' ORDER BY display_order").all() as any[];
    res.json(lessons.map((lesson) => ({ ...lesson, letters: json(lesson.letters), exercises: json(lesson.exercises), quiz: json(lesson.quiz) })));
  } catch { res.status(500).json({ error: 'Failed to load lessons' }); }
});

router.get('/public/culture', (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM culture_content WHERE status = 'published' ORDER BY display_order, title").all()); }
  catch { res.status(500).json({ error: 'Failed to load culture content' }); }
});
router.get('/public/resources', (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM educational_resources WHERE status = 'published' ORDER BY display_order, title").all()); }
  catch { res.status(500).json({ error: 'Failed to load resources' }); }
});
router.get('/public/notices', (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM notices WHERE status = 'published' AND (expiry_date IS NULL OR expiry_date = '' OR expiry_date >= date('now')) ORDER BY date DESC LIMIT 20").all()); }
  catch { res.status(500).json({ error: 'Failed to load notices' }); }
});
router.get('/public/events', (_req, res) => {
  try { res.json(db.prepare("SELECT * FROM events ORDER BY date DESC LIMIT 20").all()); }
  catch { res.status(500).json({ error: 'Failed to load events' }); }
});
router.get('/public/managing-body', (_req, res) => {
  try {
    res.json(db.prepare("SELECT id, name, designation, responsibility, biography, qualification, experience, photo, mobile, email, school_org, display_order FROM smc_members WHERE status = 'active' AND is_public = 1 ORDER BY display_order, name").all());
  } catch { res.status(500).json({ error: 'Failed to load managing body' }); }
});

router.get('/public/pages/:slug', (_req, res) => {
  try {
    const page = db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'").get(_req.params.slug) as any;
    if (!page) return res.status(404).json({ error: 'Page not found' });
    const blocks = db.prepare('SELECT id, block_type, title, content, config, display_order FROM page_blocks WHERE page_id = ? AND is_visible = 1 ORDER BY display_order').all(page.id).map((block: any) => ({ ...block, config: json(block.config, {}) }));
    res.json({ ...page, sections: json(page.sections), blocks });
  } catch { res.status(500).json({ error: 'Failed to load public page' }); }
});

// Editable dictionary administration.
router.get('/dictionary/entries', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (_req, res) => {
  try { res.json(db.prepare('SELECT d.*, c.name as category_name FROM dictionary_entries d LEFT JOIN dictionary_categories c ON c.id = d.category_id ORDER BY d.updated_at DESC').all()); }
  catch { res.status(500).json({ error: 'Failed to fetch dictionary entries' }); }
});
router.post('/dictionary/entries', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    if (!isEditor(req)) return res.status(403).json({ error: 'Dictionary editors only' });
    const b = req.body; if (!b.word) return res.status(400).json({ error: 'Word is required' });
    const id = generateId();
    db.prepare(`INSERT INTO dictionary_entries (id, category_id, word, ol_chiki, roman, odia, hindi, english, pronunciation, part_of_speech, definition, example, synonyms, antonyms, related_words, audio_url, source, contributor, verified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, b.categoryId || null, clean(b.word, 200), clean(b.olChiki, 200), clean(b.roman, 200), clean(b.odia, 200), clean(b.hindi, 200), clean(b.english, 200), clean(b.pronunciation, 200), clean(b.partOfSpeech, 80), clean(b.definition), clean(b.example), JSON.stringify(b.synonyms || []), JSON.stringify(b.antonyms || []), JSON.stringify(b.relatedWords || []), clean(b.audioUrl, 500), clean(b.source, 500), clean(b.contributor, 160), b.verified ? 1 : 0, b.status || 'draft'
    );
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'dictionary_entries', clean(b.word, 120)); res.json({ id });
  } catch (error: any) { res.status(error?.message?.includes('UNIQUE') ? 400 : 500).json({ error: 'Failed to create dictionary entry' }); }
});
router.put('/dictionary/entries/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    if (!isEditor(req)) return res.status(403).json({ error: 'Dictionary editors only' });
    const b = req.body;
    db.prepare(`UPDATE dictionary_entries SET category_id=?, word=?, ol_chiki=?, roman=?, odia=?, hindi=?, english=?, pronunciation=?, part_of_speech=?, definition=?, example=?, synonyms=?, antonyms=?, related_words=?, audio_url=?, source=?, contributor=?, verified=?, status=?, updated_at=datetime('now') WHERE id=?`).run(
      b.categoryId || null, clean(b.word, 200), clean(b.olChiki, 200), clean(b.roman, 200), clean(b.odia, 200), clean(b.hindi, 200), clean(b.english, 200), clean(b.pronunciation, 200), clean(b.partOfSpeech, 80), clean(b.definition), clean(b.example), JSON.stringify(b.synonyms || []), JSON.stringify(b.antonyms || []), JSON.stringify(b.relatedWords || []), clean(b.audioUrl, 500), clean(b.source, 500), clean(b.contributor, 160), b.verified ? 1 : 0, b.status || 'draft', req.params.id
    );
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'dictionary_entries', req.params.id); res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Failed to update dictionary entry' }); }
});
router.delete('/dictionary/entries/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try { db.prepare("UPDATE dictionary_entries SET status = 'archived', updated_at = datetime('now') WHERE id = ?").run(req.params.id); auditLog(req.user?.id, req.user?.email, 'ARCHIVE', 'dictionary_entries', req.params.id); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Failed to archive dictionary entry' }); }
});

// CMS/page builder endpoints. Blocks are JSON so design controls remain editable without source changes.
router.get('/pages', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (_req, res) => {
  try {
    const pages = db.prepare('SELECT * FROM pages ORDER BY display_order, title').all() as any[];
    res.json(pages.map((page) => ({ ...page, sections: json(page.sections), blocks: db.prepare('SELECT * FROM page_blocks WHERE page_id = ? ORDER BY display_order').all(page.id) })));
  } catch { res.status(500).json({ error: 'Failed to fetch pages' }); }
});
router.put('/pages/:id', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    db.prepare('UPDATE pages SET title=?, sections=?, status=?, updated_at=datetime(\'now\') WHERE id=?').run(clean(b.title, 200), JSON.stringify(b.sections || []), b.status || 'draft', req.params.id);
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'pages', req.params.id); res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Failed to update page' }); }
});
router.put('/page-blocks/:id', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    db.prepare('UPDATE page_blocks SET block_type=?, title=?, content=?, config=?, display_order=?, is_visible=?, updated_at=datetime(\'now\') WHERE id=?').run(clean(b.blockType, 80), clean(b.title, 200), clean(b.content), JSON.stringify(b.config || {}), Number(b.displayOrder || 0), b.isVisible === false ? 0 : 1, req.params.id);
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'page_blocks', req.params.id); res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Failed to update page block' }); }
});

router.get('/media', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM media ORDER BY created_at DESC').all()); }
  catch { res.status(500).json({ error: 'Failed to fetch media' }); }
});
router.post('/media', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), upload.single('file'), (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Supported image, PDF, audio or video file required' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${generateId()}${ext}`;
    const target = path.join(uploadRoot, safeName); fs.renameSync(req.file.path, target);
    const id = generateId();
    db.prepare('INSERT INTO media (id, title, file_url, file_type, file_size, category, alt_text, source, license, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, clean(req.body.title || req.file.originalname, 200), `/uploads/${safeName}`, req.file.mimetype, req.file.size, clean(req.body.category, 80), clean(req.body.altText, 300), clean(req.body.source, 500), clean(req.body.license, 200), 'active');
    auditLog(req.user?.id, req.user?.email, 'UPLOAD', 'media', safeName); res.json({ id, url: `/uploads/${safeName}` });
  } catch { if (req.file) try { fs.unlinkSync(req.file.path); } catch {} res.status(500).json({ error: 'Upload failed' }); }
});
router.delete('/media/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try { const item = db.prepare('SELECT file_url FROM media WHERE id = ?').get(req.params.id) as any; if (item?.file_url?.startsWith('/uploads/')) { try { fs.unlinkSync(path.join(uploadRoot, path.basename(item.file_url))); } catch {} } db.prepare("UPDATE media SET status = 'archived' WHERE id = ?").run(req.params.id); auditLog(req.user?.id, req.user?.email, 'ARCHIVE', 'media', req.params.id); res.json({ ok: true }); }
  catch { res.status(500).json({ error: 'Failed to archive media' }); }
});

export default router;
