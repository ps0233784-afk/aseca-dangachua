import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { db } from '../db';
import { requireAuth, requireWrite, requireAdmin, AuthedRequest, logAction } from '../auth';

const r = Router();

/* ================= UPLOADS (private object-storage style) ================= */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

r.post('/upload', requireAuth, upload.single('file'), (req: AuthedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/' + req.file.filename;
  if (req.body.type === 'media') {
    db.prepare('INSERT INTO media (title,file_path,type,size) VALUES (?,?,?,?)')
      .run(req.body.title || req.file.originalname, url, req.file.mimetype.startsWith('image') ? 'image' : 'document', req.file.size);
  }
  logAction(req, 'UPLOAD', 'files', req.file.originalname);
  res.json({ url, filename: req.file.filename, size: req.file.size });
});

/* ================= HOSTEL ================= */
r.get('/hostels', (req: AuthedRequest, res: Response) => {
  const hostels: any[] = db.prepare('SELECT * FROM hostels WHERE school_id=?').all(req.query.school_id);
  hostels.forEach((h) => { h.allocations = db.prepare('SELECT * FROM hostel_allocations WHERE hostel_id=?').all(h.id); });
  res.json(hostels);
});
r.post('/hostels', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE hostels SET name=?,type=?,warden=?,capacity=? WHERE id=?')
      .run(b.name, b.type, b.warden, b.capacity, b.id);
  } else {
    const info = db.prepare('INSERT INTO hostels (school_id,name,type,warden,capacity,occupied) VALUES (?,?,?,?,?,0)')
      .run(b.school_id, b.name, b.type || 'Boys', b.warden || '', b.capacity || 0);
    logAction(req, 'CREATE', 'hostels', b.name);
    return res.json({ id: Number(info.lastInsertRowid) });
  }
  res.json({ ok: true });
});
r.post('/hostels/allocate', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  const stu: any = db.prepare('SELECT name FROM students WHERE id=?').get(b.student_id);
  db.prepare('INSERT INTO hostel_allocations (hostel_id,room_no,student_id,student_name,bed,check_in,status) VALUES (?,?,?,?,?,?,?)')
    .run(b.hostel_id, b.room_no, b.student_id, stu?.name || b.student_name, b.bed || '', new Date().toISOString().slice(0, 10), 'boarding');
  db.prepare('UPDATE hostels SET occupied = occupied + 1 WHERE id=?').run(b.hostel_id);
  logAction(req, 'ALLOCATE', 'hostels', `Student ${b.student_id} -> hostel ${b.hostel_id}`);
  res.json({ ok: true });
});
r.post('/hostels/vacate/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  const alloc: any = db.prepare('SELECT * FROM hostel_allocations WHERE id=?').get(req.params.id);
  if (alloc) {
    db.prepare("UPDATE hostel_allocations SET status='vacated' WHERE id=?").run(req.params.id);
    db.prepare('UPDATE hostels SET occupied = MAX(0, occupied - 1) WHERE id=?').run(alloc.hostel_id);
  }
  res.json({ ok: true });
});

/* ================= LIBRARY ================= */
r.get('/books', (req: AuthedRequest, res: Response) => {
  let sql = 'SELECT * FROM books WHERE 1=1';
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND school_id=?'; args.push(req.query.school_id); }
  const books: any[] = db.prepare(sql + ' ORDER BY id DESC').all(...args);
  res.json(books);
});
r.post('/books', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE books SET title=?,author=?,isbn=?,category=?,copies=?,available=?,pdf_file=? WHERE id=?')
      .run(b.title, b.author, b.isbn, b.category, b.copies, b.available ?? b.copies, b.pdf_file || '', b.id);
  } else {
    db.prepare('INSERT INTO books (school_id,title,author,isbn,category,copies,available,pdf_file) VALUES (?,?,?,?,?,?,?,?)')
      .run(b.school_id, b.title, b.author || '', b.isbn || '', b.category || 'General', b.copies || 1, b.available ?? b.copies ?? 1, b.pdf_file || '');
    logAction(req, 'CREATE', 'books', b.title);
  }
  res.json({ ok: true });
});
r.delete('/books/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  db.prepare('DELETE FROM books WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
r.get('/book-issues', (_req: AuthedRequest, res: Response) => {
  res.json(db.prepare(`SELECT bi.*, b.title, b.author FROM book_issues bi JOIN books b ON b.id=bi.book_id ORDER BY bi.id DESC`).all());
});
r.post('/book-issues', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  const due = new Date(); due.setDate(due.getDate() + 30);
  db.prepare(`INSERT INTO book_issues (book_id,member_type,member_id,member_name,issue_date,due_date,status) VALUES (?,?,?,?,?,?, 'issued')`)
    .run(b.book_id, b.member_type || 'student', b.member_id || null, b.member_name, new Date().toISOString().slice(0, 10), due.toISOString().slice(0, 10));
  db.prepare('UPDATE books SET available = MAX(0, available - 1) WHERE id=?').run(b.book_id);
  logAction(req, 'ISSUE', 'books', `Book ${b.book_id} -> ${b.member_name}`);
  res.json({ ok: true });
});
r.post('/book-issues/return/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  const iss: any = db.prepare('SELECT * FROM book_issues WHERE id=?').get(req.params.id);
  db.prepare("UPDATE book_issues SET status='returned', return_date=? WHERE id=?")
    .run(new Date().toISOString().slice(0, 10), req.params.id);
  if (iss) db.prepare('UPDATE books SET available = MIN(copies, available + 1) WHERE id=?').run(iss.book_id);
  res.json({ ok: true });
});

/* ================= NOTICES ================= */
r.get('/notices', (req: AuthedRequest, res: Response) => {
  let sql = 'SELECT * FROM notices WHERE 1=1';
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND (school_id=0 OR school_id=?)'; args.push(req.query.school_id); }
  res.json(db.prepare(sql + ' ORDER BY date DESC, id DESC').all(...args));
});
r.post('/notices', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE notices SET school_id=?,title=?,body=?,category=?,priority=?,date=?,audience=? WHERE id=?')
      .run(b.school_id || 0, b.title, b.body, b.category || 'General', b.priority || 'normal', b.date, b.audience || 'all', b.id);
  } else {
    db.prepare('INSERT INTO notices (school_id,title,body,category,priority,date,audience) VALUES (?,?,?,?,?,?,?)')
      .run(b.school_id || 0, b.title, b.body, b.category || 'General', b.priority || 'normal', b.date || new Date().toISOString().slice(0, 10), b.audience || 'all');
    logAction(req, 'CREATE', 'notices', b.title);
  }
  res.json({ ok: true });
});
r.delete('/notices/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  db.prepare('DELETE FROM notices WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ================= EVENTS ================= */
r.get('/events', (req: AuthedRequest, res: Response) => {
  let sql = 'SELECT * FROM events WHERE 1=1';
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND (school_id=0 OR school_id=?)'; args.push(req.query.school_id); }
  res.json(db.prepare(sql + ' ORDER BY date').all(...args));
});
r.post('/events', requireWrite, (req: AuthedRequest, res: Response) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE events SET school_id=?,title=?,description=?,date=?,venue=?,category=? WHERE id=?')
      .run(b.school_id || 0, b.title, b.description, b.date, b.venue, b.category || 'General', b.id);
  } else {
    db.prepare('INSERT INTO events (school_id,title,description,date,venue,category) VALUES (?,?,?,?,?,?)')
      .run(b.school_id || 0, b.title, b.description || '', b.date, b.venue || '', b.category || 'General');
    logAction(req, 'CREATE', 'events', b.title);
  }
  res.json({ ok: true });
});
r.delete('/events/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ================= MEDIA LIBRARY ================= */
r.get('/media', (_req: AuthedRequest, res: Response) => {
  res.json(db.prepare('SELECT * FROM media ORDER BY id DESC').all());
});
r.delete('/media/:id', requireWrite, (req: AuthedRequest, res: Response) => {
  const m: any = db.prepare('SELECT * FROM media WHERE id=?').get(req.params.id);
  if (m?.file_path) {
    const fp = path.join(UPLOAD_DIR, path.basename(m.file_path));
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  db.prepare('DELETE FROM media WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ================= CMS PAGE BUILDER ================= */
r.get('/pages', requireAuth, requireAdmin, (_req: AuthedRequest, res: Response) => {
  res.json(db.prepare('SELECT * FROM cms_pages ORDER BY slug').all());
});
r.get('/pages/:slug', (req: AuthedRequest, res: Response) => {
  const page: any = db.prepare('SELECT * FROM cms_pages WHERE slug=?').get(req.params.slug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json({ ...page, blocks: JSON.parse(page.blocks || '[]') });
});
r.put('/pages/:slug', requireAuth, requireAdmin, (req: AuthedRequest, res: Response) => {
  const { title, blocks } = req.body;
  db.prepare(`INSERT INTO cms_pages (slug,title,blocks,updated_at) VALUES (?,?,?,datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET title=excluded.title, blocks=excluded.blocks, updated_at=datetime('now')`)
    .run(req.params.slug, title, JSON.stringify(blocks || []));
  logAction(req, 'UPDATE', 'cms_pages', req.params.slug);
  res.json({ ok: true });
});

/* ================= EXCEL IMPORT / EXPORT CENTER ================= */
const EXPORTABLE: Record<string, { table: string; cols: string[]; sheet: string }> = {
  students: { table: 'students', cols: ['id', 'school_id', 'admission_no', 'roll_no', 'name', 'name_odia', 'name_santali', 'dob', 'gender', 'blood_group', 'aadhaar', 'father_name', 'mother_name', 'guardian_name', 'guardian_mobile', 'village', 'block', 'district', 'state', 'pin', 'category', 'academic_year', 'class', 'section', 'admission_date', 'previous_school', 'status'], sheet: 'Students' },
  teachers: { table: 'teachers', cols: ['id', 'school_id', 'name', 'designation', 'qualification', 'phone', 'email', 'subject_spec', 'join_date', 'status'], sheet: 'Teachers' },
  staff: { table: 'staff', cols: ['id', 'school_id', 'name', 'designation', 'phone', 'join_date', 'status', 'duties'], sheet: 'Staff' },
  smc: { table: 'smc_members', cols: ['id', 'school_id', 'sl_no', 'name', 'father_name', 'designation', 'mobile', 'signature_status'], sheet: 'SMC' },
  books: { table: 'books', cols: ['id', 'school_id', 'title', 'author', 'isbn', 'category', 'copies', 'available'], sheet: 'Library' },
  notices: { table: 'notices', cols: ['id', 'school_id', 'title', 'body', 'category', 'priority', 'date', 'audience'], sheet: 'Notices' },
  exams: { table: 'exams', cols: ['id', 'school_id', 'name', 'session', 'standard', 'exam_center', 'center_code', 'exam_date', 'status'], sheet: 'Exams' },
};

r.get('/excel/export/:entity', requireAuth, (req: AuthedRequest, res: Response) => {
  const cfg = EXPORTABLE[req.params.entity];
  if (!cfg) return res.status(404).json({ error: 'Unknown export entity' });
  const rows = db.prepare(`SELECT ${cfg.cols.join(',')} FROM ${cfg.table}`).all();
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, cfg.sheet);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename="aseca-${req.params.entity}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

r.get('/excel/template/:entity', requireAuth, (req: AuthedRequest, res: Response) => {
  const cfg = EXPORTABLE[req.params.entity];
  if (!cfg) return res.status(404).json({ error: 'Unknown template entity' });
  const sample: Record<string, any> = {};
  if (req.params.entity === 'students') {
    Object.assign(sample, {
      school_id: 1, admission_no: 'HH/ADM/2026/301', roll_no: '36SSMS026010', name: 'Example Student',
      name_odia: '', name_santali: '', dob: '2008-01-01', gender: 'Male', blood_group: 'O+',
      aadhaar: '123412341234', father_name: "Father's Name", mother_name: "Mother's Name",
      guardian_name: "Guardian's Name", guardian_mobile: '9430000000', village: 'Dangachua',
      block: 'Soso', district: 'Kendujhar', state: 'Odisha', pin: '758078', category: 'ST',
      academic_year: '2026-27', class: 'Matric (Class X)', section: 'A',
      admission_date: '2026-07-01', previous_school: '', status: 'active',
    });
  }
  const ws = XLSX.utils.json_to_sheet([sample], { header: cfg.cols.filter((c) => c !== 'id') });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, cfg.sheet + ' Template');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename="aseca-${req.params.entity}-template.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

r.post('/excel/import/:entity', requireAuth, requireWrite, upload.single('file'), (req: AuthedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Upload an .xlsx file' });
  const cfg = EXPORTABLE[req.params.entity];
  if (!cfg) return res.status(404).json({ error: 'Unknown import entity' });
  try {
    const wb = XLSX.readFile(req.file.path);
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    const cols = cfg.cols.filter((c) => c !== 'id');
    let inserted = 0; let skipped = 0;
    const insert = db.prepare(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`);
    const tx = db.transaction(() => {
      rows.forEach((row) => {
        if (!row.name && req.params.entity !== 'books') { skipped++; return; }
        const vals = cols.map((c) => (row[c] === undefined || row[c] === '' ? null : row[c]));
        try { insert.run(...vals); inserted++; } catch { skipped++; }
      });
    });
    tx();
    logAction(req, 'IMPORT', req.params.entity, `${inserted} rows imported, ${skipped} skipped`);
    res.json({ ok: true, inserted, skipped, total: rows.length });
  } catch (e: any) {
    res.status(400).json({ error: 'Could not parse file: ' + e.message });
  } finally {
    try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
  }
});

export default r;
