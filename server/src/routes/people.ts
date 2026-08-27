import { Router } from 'express';
import { db, maskAadhaar } from '../db';
import { requireAuth, requireWrite, AuthedRequest, logAction } from '../auth';

const r = Router();
r.use(requireAuth);

/* ================= STUDENTS ================= */
const STUDENT_COLS = `id,school_id,admission_no,roll_no,name,name_odia,name_santali,dob,gender,blood_group,photo,
  aadhaar,father_name,father_aadhaar,mother_name,mother_aadhaar,guardian_name,guardian_mobile,
  village,block,district,state,pin,category,academic_year,class,section,admission_date,previous_school,status`;

r.get('/students', (req: AuthedRequest, res) => {
  const { school_id, q, class: cls } = req.query;
  let sql = `SELECT ${STUDENT_COLS} FROM students WHERE 1=1`;
  const args: any[] = [];
  if (school_id) { sql += ' AND school_id=?'; args.push(school_id); }
  if (cls) { sql += ' AND class=?'; args.push(cls); }
  if (q) { sql += ' AND (name LIKE ? OR roll_no LIKE ? OR admission_no LIKE ? OR aadhaar LIKE ?)'; const s = `%${q}%`; args.push(s, s, s, s); }
  sql += ' ORDER BY id DESC';
  const rows: any[] = db.prepare(sql).all(...args);
  // Mask Aadhaar for non-admin viewers
  const isAdmin = ['super_admin', 'admin', 'principal'].includes(req.user!.role);
  res.json(rows.map((row) => ({
    ...row,
    aadhaar: isAdmin ? row.aadhaar : maskAadhaar(row.aadhaar),
    father_aadhaar: isAdmin ? row.father_aadhaar : maskAadhaar(row.father_aadhaar),
    mother_aadhaar: isAdmin ? row.mother_aadhaar : maskAadhaar(row.mother_aadhaar),
  })));
});

r.get('/students/:id', (req: AuthedRequest, res) => {
  const stu: any = db.prepare(`SELECT * FROM students WHERE id=?`).get(req.params.id);
  if (!stu) return res.status(404).json({ error: 'Student not found' });
  const isAdmin = ['super_admin', 'admin', 'principal'].includes(req.user!.role);
  if (!isAdmin) {
    stu.aadhaar = maskAadhaar(stu.aadhaar);
    stu.father_aadhaar = maskAadhaar(stu.father_aadhaar);
    stu.mother_aadhaar = maskAadhaar(stu.mother_aadhaar);
  }
  stu.attendance = db.prepare(`SELECT * FROM attendance WHERE student_id=? ORDER BY date DESC LIMIT 60`).all(stu.id);
  stu.results = db.prepare(`SELECT er.*, e.name exam_name, e.session FROM exam_results er JOIN exams e ON e.id=er.exam_id WHERE er.student_id=?`).all(stu.id);
  stu.issues = db.prepare(`SELECT bi.*, b.title FROM book_issues bi JOIN books b ON b.id=bi.book_id WHERE bi.member_type='student' AND bi.member_id=?`).all(stu.id);
  stu.hostel = db.prepare(`SELECT * FROM hostel_allocations WHERE student_id=? AND status='boarding'`).get(stu.id);
  stu.school = db.prepare('SELECT id,name,village,po,ps,district,pin FROM schools WHERE id=?').get(stu.school_id);
  const present = (db.prepare(`SELECT COUNT(*) c FROM attendance WHERE student_id=? AND status='present'`).get(stu.id) as any).c;
  const total = (db.prepare(`SELECT COUNT(*) c FROM attendance WHERE student_id=?`).get(stu.id) as any).c;
  stu.attendance_pct = total ? Math.round((present / total) * 100) : null;
  res.json(stu);
});

const clean = (v: any) => (v === undefined || v === null ? '' : v);
const aadhaar12 = (v: any) => (v ? String(v).replace(/\D/g, '').slice(0, 12) : '');

r.post('/students', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  if (!b.name || !b.school_id) return res.status(400).json({ error: 'Name and school are required' });
  if (b.aadhaar && String(b.aadhaar).replace(/\D/g, '').length !== 12)
    return res.status(400).json({ error: 'Aadhaar must be exactly 12 digits' });
  const info = db.prepare(`INSERT INTO students
    (school_id,admission_no,roll_no,name,name_odia,name_santali,dob,gender,blood_group,photo,aadhaar,aadhaar_doc,
     father_name,father_aadhaar,mother_name,mother_aadhaar,guardian_name,guardian_mobile,
     village,block,district,state,pin,category,caste_doc,academic_year,class,section,admission_date,previous_school,status)
    VALUES (${Array(31).fill('?').join(',')})`).run(
      b.school_id, clean(b.admission_no), clean(b.roll_no), b.name, clean(b.name_odia), clean(b.name_santali),
      clean(b.dob), clean(b.gender), clean(b.blood_group), clean(b.photo),
      aadhaar12(b.aadhaar), clean(b.aadhaar_doc),
      clean(b.father_name), aadhaar12(b.father_aadhaar),
      clean(b.mother_name), aadhaar12(b.mother_aadhaar),
      clean(b.guardian_name), clean(b.guardian_mobile),
      clean(b.village), clean(b.block), clean(b.district), clean(b.state) || 'Odisha', clean(b.pin),
      clean(b.category), clean(b.caste_doc),
      clean(b.academic_year), clean(b.class), clean(b.section),
      clean(b.admission_date), clean(b.previous_school), clean(b.status) || 'active');
  logAction(req, 'CREATE', 'students', `${b.name} (id ${info.lastInsertRowid})`);
  res.json({ id: Number(info.lastInsertRowid) });
});

r.put('/students/:id', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  if (b.aadhaar && String(b.aadhaar).replace(/\D/g, '').length !== 12)
    return res.status(400).json({ error: 'Aadhaar must be exactly 12 digits' });
  db.prepare(`UPDATE students SET school_id=?,admission_no=?,roll_no=?,name=?,name_odia=?,name_santali=?,dob=?,gender=?,
    blood_group=?,photo=?,aadhaar=?,father_name=?,father_aadhaar=?,mother_name=?,mother_aadhaar=?,guardian_name=?,
    guardian_mobile=?,village=?,block=?,district=?,state=?,pin=?,category=?,academic_year=?,class=?,section=?,
    admission_date=?,previous_school=?,status=? WHERE id=?`)
    .run(
      b.school_id, clean(b.admission_no), clean(b.roll_no), b.name, clean(b.name_odia), clean(b.name_santali),
      clean(b.dob), clean(b.gender), clean(b.blood_group), clean(b.photo),
      aadhaar12(b.aadhaar),
      clean(b.father_name), aadhaar12(b.father_aadhaar),
      clean(b.mother_name), aadhaar12(b.mother_aadhaar),
      clean(b.guardian_name), clean(b.guardian_mobile),
      clean(b.village), clean(b.block), clean(b.district), clean(b.state) || 'Odisha', clean(b.pin),
      clean(b.category),
      clean(b.academic_year), clean(b.class), clean(b.section),
      clean(b.admission_date), clean(b.previous_school), clean(b.status) || 'active',
      req.params.id);
  logAction(req, 'UPDATE', 'students', `${b.name} (id ${req.params.id})`);
  res.json({ ok: true });
});

r.delete('/students/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM students WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'students', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= TEACHERS ================= */
r.get('/teachers', (req, res) => {
  let sql = 'SELECT * FROM teachers WHERE 1=1';
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND school_id=?'; args.push(req.query.school_id); }
  res.json(db.prepare(sql + ' ORDER BY id').all(...args));
});
r.post('/teachers', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO teachers (school_id,name,designation,qualification,phone,email,aadhaar,subject_spec,join_date,status,photo)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(b.school_id, b.name, b.designation || 'Asst. Teacher', b.qualification || '',
      b.phone || '', b.email || '', b.aadhaar || '', b.subject_spec || '', b.join_date || '', b.status || 'active', b.photo || '');
  logAction(req, 'CREATE', 'teachers', `${b.name}`);
  res.json({ id: Number(info.lastInsertRowid) });
});
r.put('/teachers/:id', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  db.prepare(`UPDATE teachers SET school_id=?,name=?,designation=?,qualification=?,phone=?,email=?,aadhaar=?,subject_spec=?,join_date=?,status=? WHERE id=?`)
    .run(b.school_id, b.name, b.designation, b.qualification, b.phone, b.email, b.aadhaar, b.subject_spec, b.join_date, b.status || 'active', req.params.id);
  logAction(req, 'UPDATE', 'teachers', `${b.name}`);
  res.json({ ok: true });
});
r.delete('/teachers/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM teachers WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'teachers', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= STAFF ================= */
r.get('/staff', (req, res) => {
  let sql = 'SELECT * FROM staff WHERE 1=1';
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND school_id=?'; args.push(req.query.school_id); }
  res.json(db.prepare(sql + ' ORDER BY id').all(...args));
});
r.post('/staff', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO staff (school_id,name,designation,phone,join_date,status,duties) VALUES (?,?,?,?,?,?,?)`)
    .run(b.school_id, b.name, b.designation || '', b.phone || '', b.join_date || '', b.status || 'active', b.duties || '');
  logAction(req, 'CREATE', 'staff', `${b.name}`);
  res.json({ id: Number(info.lastInsertRowid) });
});
r.put('/staff/:id', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  db.prepare(`UPDATE staff SET school_id=?,name=?,designation=?,phone=?,join_date=?,status=?,duties=? WHERE id=?`)
    .run(b.school_id, b.name, b.designation, b.phone, b.join_date, b.status || 'active', b.duties || '', req.params.id);
  logAction(req, 'UPDATE', 'staff', `${b.name}`);
  res.json({ ok: true });
});
r.delete('/staff/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM staff WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'staff', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= SMC ================= */
r.get('/smc', (req, res) => {
  res.json(db.prepare('SELECT * FROM smc_members WHERE school_id=? ORDER BY sl_no').all(req.query.school_id));
});
r.post('/smc', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE smc_members SET sl_no=?,name=?,father_name=?,designation=?,mobile=?,signature_status=? WHERE id=?')
      .run(b.sl_no, b.name, b.father_name || '', b.designation, b.mobile || '', b.signature_status || 'pending', b.id);
    logAction(req, 'UPDATE', 'smc', `${b.name}`);
  } else {
    db.prepare('INSERT INTO smc_members (school_id,sl_no,name,father_name,designation,mobile,signature_status) VALUES (?,?,?,?,?,?,?)')
      .run(b.school_id, b.sl_no, b.name, b.father_name || '', b.designation, b.mobile || '', b.signature_status || 'pending');
    logAction(req, 'CREATE', 'smc', `${b.name}`);
  }
  res.json({ ok: true });
});
r.delete('/smc/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM smc_members WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'smc', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= ATTENDANCE ================= */
r.get('/attendance', (req, res) => {
  const { school_id, date } = req.query;
  if (!school_id || !date) return res.status(400).json({ error: 'school_id and date required' });
  const students: any[] = db.prepare(`SELECT id,name,roll_no,class FROM students WHERE school_id=? AND status='active' ORDER BY class,name`).all(school_id);
  const records: any[] = db.prepare('SELECT * FROM attendance WHERE school_id=? AND date=?').all(school_id, date);
  const map = new Map(records.map((x) => [x.student_id, x]));
  res.json(students.map((s) => ({ ...s, status: map.get(s.id)?.status || 'unmarked', note: map.get(s.id)?.note || '' })));
});

r.post('/attendance', requireWrite, (req: AuthedRequest, res) => {
  const { school_id, date, records } = req.body;
  const ins = db.prepare(`INSERT INTO attendance (school_id,student_id,date,status,note) VALUES (?,?,?,?,?)
    ON CONFLICT(student_id,date) DO UPDATE SET status=excluded.status, note=excluded.note`);
  const tx = db.transaction((recs: any[]) => recs.forEach((x) => ins.run(school_id, x.student_id, date, x.status, x.note || '')));
  tx(records);
  logAction(req, 'ATTENDANCE', 'students', `School ${school_id} on ${date}: ${records.length} records`);
  res.json({ ok: true, count: records.length });
});

r.get('/attendance/summary', (req, res) => {
  const { school_id } = req.query;
  const rows = db.prepare(`SELECT st.id, st.name, st.class,
    SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) present,
    SUM(CASE WHEN a.status='absent' THEN 1 ELSE 0 END) absent,
    SUM(CASE WHEN a.status='late' THEN 1 ELSE 0 END) late,
    COUNT(a.id) total
    FROM students st LEFT JOIN attendance a ON a.student_id=st.id
    WHERE st.school_id=? AND st.status='active' GROUP BY st.id ORDER BY st.class, st.name`).all(school_id);
  res.json(rows);
});

/* Teacher attendance */
r.get('/teacher-attendance', (req, res) => {
  const { school_id, date } = req.query;
  const teachers: any[] = db.prepare('SELECT id,name,designation FROM teachers WHERE school_id=?').all(school_id);
  const records: any[] = db.prepare('SELECT * FROM teacher_attendance WHERE school_id=? AND date=?').all(school_id, date);
  const map = new Map(records.map((x) => [x.teacher_id, x]));
  res.json(teachers.map((t) => ({ ...t, status: map.get(t.id)?.status || 'unmarked' })));
});
r.post('/teacher-attendance', requireWrite, (req: AuthedRequest, res) => {
  const { school_id, date, records } = req.body;
  const ins = db.prepare(`INSERT INTO teacher_attendance (school_id,teacher_id,date,status,note) VALUES (?,?,?,?,?)
    ON CONFLICT(teacher_id,date) DO UPDATE SET status=excluded.status`);
  const tx = db.transaction((recs: any[]) => recs.forEach((x) => ins.run(school_id, x.teacher_id, date, x.status, '')));
  tx(records);
  logAction(req, 'ATTENDANCE', 'teachers', `School ${school_id} on ${date}`);
  res.json({ ok: true });
});

export default r;
