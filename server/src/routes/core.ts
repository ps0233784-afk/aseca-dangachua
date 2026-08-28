import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, maskAadhaar } from '../db';
import { signToken, requireAuth, requireAdmin, AuthedRequest, logAction } from '../auth';

const r = Router();

/* ---------- Auth ---------- */
r.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user: any = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(String(email).toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  logAction({ user } as AuthedRequest, 'LOGIN', 'auth', user.email);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, school_id: user.school_id, phone: user.phone },
  });
});

r.get('/auth/me', requireAuth, (req: AuthedRequest, res) => {
  const u: any = db.prepare('SELECT id,name,email,role,school_id,phone FROM users WHERE id=?').get(req.user!.id);
  res.json(u);
});

/* ---------- Dashboard ---------- */
r.get('/dashboard/stats', requireAuth, (req, res) => {
  const schoolId = (req.query.school_id as string) || '';
  const args = schoolId ? [schoolId] : [];
  const count = (sql: string, a: any[] = []) => (db.prepare(sql).get(...a) as any).c;
  const stats = {
    schools: count("SELECT COUNT(*) c FROM schools WHERE status != 'archived'"),
    students: count(`SELECT COUNT(*) c FROM students WHERE status='active' ${schoolId ? 'AND school_id=?' : ''}`, args),
    teachers: count(`SELECT COUNT(*) c FROM teachers WHERE status='active' ${schoolId ? 'AND school_id=?' : ''}`, args),
    staff: count(`SELECT COUNT(*) c FROM staff WHERE status='active' ${schoolId ? 'AND school_id=?' : ''}`, args),
    exams: count('SELECT COUNT(*) c FROM exams'),
    notices: count('SELECT COUNT(*) c FROM notices'),
    events: count('SELECT COUNT(*) c FROM events'),
    books: count('SELECT COUNT(*) c FROM books'),
    hostels: count('SELECT COUNT(*) c FROM hostels'),
    smcSigned: count("SELECT COUNT(*) c FROM smc_members WHERE signature_status='signed'"),
    smcTotal: count('SELECT COUNT(*) c FROM smc_members'),
  };
  const attendanceTrend = db.prepare(`
    SELECT date,
      SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) present,
      SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) absent,
      SUM(CASE WHEN status='late' THEN 1 ELSE 0 END) late,
      COUNT(*) total
    FROM attendance ${schoolId ? 'WHERE school_id=?' : ''}
    GROUP BY date ORDER BY date DESC LIMIT 14`).all(...(args as any[])).reverse();
  const genderSplit = db.prepare(`SELECT gender, COUNT(*) c FROM students WHERE status='active' GROUP BY gender`).all();
  const recentNotices = db.prepare('SELECT * FROM notices ORDER BY date DESC LIMIT 5').all();
  const schoolWise = db.prepare(`
    SELECT s.name, COUNT(st.id) students FROM schools s
    LEFT JOIN students st ON st.school_id=s.id AND st.status='active'
    GROUP BY s.id`).all();
  res.json({ stats, attendanceTrend, genderSplit, recentNotices, schoolWise });
});

/* ---------- Schools ---------- */
r.get('/schools', (_req, res) => {
  const schools = db.prepare(`
    SELECT s.*, (SELECT COUNT(*) FROM students st WHERE st.school_id=s.id AND st.status='active') student_count,
      (SELECT COUNT(*) FROM teachers t WHERE t.school_id=s.id AND t.status='active') teacher_count,
      (SELECT COUNT(*) FROM smc_members m WHERE m.school_id=s.id) smc_count
    FROM schools s ORDER BY s.id`).all();
  res.json(schools);
});

r.get('/schools/:id', (req, res) => {
  const school: any = db.prepare('SELECT * FROM schools WHERE id=?').get(req.params.id);
  if (!school) return res.status(404).json({ error: 'School not found' });
  school.smc = db.prepare('SELECT * FROM smc_members WHERE school_id=? ORDER BY sl_no').all(school.id);
  res.json(school);
});

r.post('/schools', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO schools
    (code,name,ol_chiki_name,type,village,po,ps,district,pin,state,headmaster,phone,email,affiliation_no,affiliation_date,established,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      b.code, b.name, b.ol_chiki_name || '', b.type || 'Ol-Itun Ashra', b.village, b.po, b.ps, b.district,
      b.pin, b.state || 'Odisha', b.headmaster, b.phone, b.email, b.affiliation_no, b.affiliation_date, b.established, b.status || 'active');
  logAction(req, 'CREATE', 'schools', `${b.name} (id ${info.lastInsertRowid})`);
  res.json({ id: Number(info.lastInsertRowid) });
});

r.put('/schools/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  const b = req.body;
  db.prepare(`UPDATE schools SET code=?,name=?,ol_chiki_name=?,type=?,village=?,po=?,ps=?,district=?,pin=?,state=?,
    headmaster=?,phone=?,email=?,affiliation_no=?,affiliation_date=?,established=?,status=? WHERE id=?`).run(
      b.code, b.name, b.ol_chiki_name || '', b.type || 'Ol-Itun Ashra', b.village, b.po, b.ps, b.district,
      b.pin, b.state || 'Odisha', b.headmaster, b.phone, b.email, b.affiliation_no, b.affiliation_date, b.established, b.status || 'active',
      req.params.id);
  logAction(req, 'UPDATE', 'schools', `${b.name} (id ${req.params.id})`);
  res.json({ ok: true });
});

r.delete('/schools/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM schools WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'schools', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Users ---------- */
r.get('/users', requireAuth, requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT id,name,email,role,school_id,phone,active,created_at FROM users ORDER BY id').all());
});

r.post('/users', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  const b = req.body;
  if (!b.name || !b.email || !b.password) return res.status(400).json({ error: 'Name, email and password are required' });
  try {
    const info = db.prepare('INSERT INTO users (name,email,password_hash,role,school_id,phone) VALUES (?,?,?,?,?,?)')
      .run(b.name, String(b.email).toLowerCase().trim(), bcrypt.hashSync(b.password, 10), b.role || 'viewer', b.school_id || null, b.phone || '');
    logAction(req, 'CREATE', 'users', `${b.email} as ${b.role}`);
    res.json({ id: Number(info.lastInsertRowid) });
  } catch (e: any) {
    res.status(400).json({ error: e.message.includes('UNIQUE') ? 'Email already registered' : e.message });
  }
});

r.put('/users/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  const b = req.body;
  if (b.password) {
    db.prepare('UPDATE users SET name=?,role=?,school_id=?,phone=?,active=?,password_hash=? WHERE id=?')
      .run(b.name, b.role, b.school_id || null, b.phone || '', b.active ? 1 : 0, bcrypt.hashSync(b.password, 10), req.params.id);
  } else {
    db.prepare('UPDATE users SET name=?,role=?,school_id=?,phone=?,active=? WHERE id=?')
      .run(b.name, b.role, b.school_id || null, b.phone || '', b.active ? 1 : 0, req.params.id);
  }
  logAction(req, 'UPDATE', 'users', `id ${req.params.id}`);
  res.json({ ok: true });
});

r.delete('/users/:id', requireAuth, requireAdmin, (req: AuthedRequest, res) => {
  if (Number(req.params.id) === req.user!.id) return res.status(400).json({ error: 'You cannot delete your own account' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'users', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ---------- Audit logs ---------- */
r.get('/audit-logs', requireAuth, requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200').all());
});

/* ---------- PUBLIC DATA (no auth) — registered before '/schools/:id' ---------- */
r.get('/public/home', (_req, res) => {
  const schools = db.prepare(`SELECT s.id,s.name,s.ol_chiki_name,s.village,s.po,s.ps,s.district,s.pin,s.headmaster,s.type,
    (SELECT COUNT(*) FROM students st WHERE st.school_id=s.id AND st.status='active') student_count
    FROM schools s WHERE s.status!='archived'`).all();

  const notices = db.prepare(
    'SELECT title,body,category,priority,date FROM notices ORDER BY date DESC LIMIT 6'
  ).all();

  const events = db.prepare(
    'SELECT title,description,date,venue,category FROM events ORDER BY date LIMIT 6'
  ).all();

  // Public-safe SMC projection.
  // Deliberately excludes mobile numbers, father names and other private fields.
  // Member photos are taken from the existing media library using the title:
  // SMC-{memberId}-{schoolId}
  const committeeRows = db.prepare(`
    SELECT m.id, m.school_id, s.name AS school_name, s.ol_chiki_name AS school_olchiki,
      m.sl_no, m.name, m.designation
    FROM smc_members m
    JOIN schools s ON s.id = m.school_id
    ORDER BY m.school_id, m.sl_no
  `).all() as any[];

  const photoFor = (memberId: number, schoolId: number) => {
    const title = `SMC-${memberId}-${schoolId}`;
    const row = db.prepare(
      "SELECT file_path FROM media WHERE title = ? AND type = 'image' ORDER BY id DESC LIMIT 1"
    ).get(title) as any;
    return row ? row.file_path : null;
  };

  const committee = committeeRows.map((m) => ({
    ...m,
    photo: photoFor(m.id, m.school_id),
  }));

  // Existing admin-uploaded media for the public gallery.
  const media = db.prepare(
    'SELECT title, file_path, type FROM media ORDER BY id DESC LIMIT 24'
  ).all();

  const stats = {
    schools: (db.prepare('SELECT COUNT(*) c FROM schools').get() as any).c,
    students: (db.prepare("SELECT COUNT(*) c FROM students WHERE status='active'").get() as any).c,
    teachers: (db.prepare("SELECT COUNT(*) c FROM teachers WHERE status='active'").get() as any).c,
    staff: (db.prepare("SELECT COUNT(*) c FROM staff WHERE status='active'").get() as any).c,
    books: (db.prepare('SELECT COUNT(*) c FROM books').get() as any).c,
    hostels: (db.prepare('SELECT COUNT(*) c FROM hostels').get() as any).c,
    committees: (db.prepare('SELECT COUNT(*) c FROM schools').get() as any).c,
    events: (db.prepare('SELECT COUNT(*) c FROM events').get() as any).c,
  };

  res.json({ schools, notices, events, committee, media, stats });
});

/* ---------- Organization profile (for letterheads) ---------- */
r.get('/org', (_req, res) => {
  res.json({
    name: 'ADIVASI SOCIO-EDUCATIONAL & CULTURAL ASSOCIATION, ODISHA (ASECA)',
    olchiki: 'ᱚ.ᱟ.ᱮ.ᱥ.ᱮ.ᱠ.ᱮ ᱩᱰᱤᱥᱟ ᱥᱟᱠᱷᱟ ᱫᱟᱸᱜᱩᱣᱟᱹ ᱠᱮᱱᱫᱩᱡᱷᱟᱹᱨ, ᱩᱰᱤᱥᱟ',
    branch: 'BRANCH ASECA DANGACHUA',
    tagline: 'Education • Culture • Community',
    ho: 'Regd No-2667/269 of 1964, Rairangpur',
    bo: 'Regd No-77/26 of 2026, At-Dangachua, P.O.-Bidyadharpur, P.S.-Soso, Dist-Kendujhar, PIN-758078, Odisha',
  });
});

export { maskAadhaar };
export default r;
