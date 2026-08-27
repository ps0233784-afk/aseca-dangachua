import { Router } from 'express';
import { db, gradeFor } from '../db';
import { requireAuth, requireWrite, AuthedRequest, logAction } from '../auth';

const r = Router();
r.use(requireAuth);

/* ================= SUBJECTS (Dynamic Ol-Itun Ashra subjects) ================= */
r.get('/subjects', (req, res) => {
  const rows: any[] = db.prepare('SELECT * FROM subjects WHERE is_active=1 AND (school_id=0 OR school_id=?) ORDER BY id')
    .all(req.query.school_id || 0);
  res.json(rows);
});
r.post('/subjects', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  const info = db.prepare('INSERT INTO subjects (school_id,name,code,class_level,paper_group,max_marks) VALUES (?,?,?,?,?,?)')
    .run(b.school_id || 0, b.name, b.code || '', b.class_level || '', b.paper_group || 'Core', b.max_marks || 100);
  logAction(req, 'CREATE', 'subjects', b.name);
  res.json({ id: Number(info.lastInsertRowid) });
});
r.put('/subjects/:id', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  db.prepare('UPDATE subjects SET name=?,code=?,class_level=?,paper_group=?,max_marks=? WHERE id=?')
    .run(b.name, b.code, b.class_level, b.paper_group, b.max_marks, req.params.id);
  logAction(req, 'UPDATE', 'subjects', b.name);
  res.json({ ok: true });
});
r.delete('/subjects/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('UPDATE subjects SET is_active=0 WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'subjects', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= EXAMS ================= */
r.get('/exams', (req, res) => {
  let sql = `SELECT e.*, s.name school_name, (SELECT COUNT(*) FROM exam_results r WHERE r.exam_id=e.id) candidate_count
    FROM exams e JOIN schools s ON s.id=e.school_id WHERE 1=1`;
  const args: any[] = [];
  if (req.query.school_id) { sql += ' AND e.school_id=?'; args.push(req.query.school_id); }
  res.json(db.prepare(sql + ' ORDER BY e.id DESC').all(...args));
});

r.post('/exams', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  const info = db.prepare(`INSERT INTO exams (school_id,name,session,standard,exam_center,center_code,exam_date,status)
    VALUES (?,?,?,?,?,?,?,?)`).run(b.school_id, b.name, b.session, b.standard, b.exam_center, b.center_code, b.exam_date, b.status || 'published');
  logAction(req, 'CREATE', 'exams', b.name);
  res.json({ id: Number(info.lastInsertRowid) });
});

r.put('/exams/:id', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  db.prepare(`UPDATE exams SET school_id=?,name=?,session=?,standard=?,exam_center=?,center_code=?,exam_date=?,status=? WHERE id=?`)
    .run(b.school_id, b.name, b.session, b.standard, b.exam_center, b.center_code, b.exam_date, b.status || 'published', req.params.id);
  logAction(req, 'UPDATE', 'exams', b.name);
  res.json({ ok: true });
});

r.delete('/exams/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM exam_results WHERE exam_id=?').run(req.params.id);
  db.prepare('DELETE FROM exams WHERE id=?').run(req.params.id);
  logAction(req, 'DELETE', 'exams', `id ${req.params.id}`);
  res.json({ ok: true });
});

/* ================= MARK SHEETS / RESULTS ================= */
r.get('/exams/:id/results', (req, res) => {
  const exam: any = db.prepare(`SELECT e.*, s.name school_name, s.affiliation_no, s.village, s.po, s.ps, s.district, s.pin
    FROM exams e JOIN schools s ON s.id=e.school_id WHERE e.id=?`).get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  exam.results = db.prepare('SELECT * FROM exam_results WHERE exam_id=? ORDER BY roll_no').all(exam.id);
  res.json(exam);
});

r.post('/exams/:id/results', requireWrite, (req: AuthedRequest, res) => {
  const { results } = req.body;
  const upsert = db.prepare(`INSERT INTO exam_results
    (exam_id,student_id,roll_no,student_name,mother_name,father_name,dob,mil1,mil2,mil3,mil4,odia,english,total,result,grade)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET roll_no=excluded.roll_no,student_name=excluded.student_name,mother_name=excluded.mother_name,
      father_name=excluded.father_name,dob=excluded.dob,mil1=excluded.mil1,mil2=excluded.mil2,mil3=excluded.mil3,mil4=excluded.mil4,
      odia=excluded.odia,english=excluded.english,total=excluded.total,result=excluded.result,grade=excluded.grade`);
  const tx = db.transaction((rows: any[]) => {
    rows.forEach((x) => {
      const g = gradeFor(x);
      if (x.id) {
        db.prepare(`UPDATE exam_results SET roll_no=?,student_name=?,mother_name=?,father_name=?,dob=?,mil1=?,mil2=?,mil3=?,mil4=?,odia=?,english=?,total=?,result=?,grade=? WHERE id=?`)
          .run(x.roll_no, x.student_name, x.mother_name, x.father_name, x.dob,
            Number(x.mil1) || 0, Number(x.mil2) || 0, Number(x.mil3) || 0, Number(x.mil4) || 0,
            Number(x.odia) || 0, Number(x.english) || 0, g.total, g.result, g.grade, x.id);
      } else {
        upsert.run(req.params.id, x.student_id || null, x.roll_no, x.student_name, x.mother_name, x.father_name, x.dob,
          Number(x.mil1) || 0, Number(x.mil2) || 0, Number(x.mil3) || 0, Number(x.mil4) || 0,
          Number(x.odia) || 0, Number(x.english) || 0, g.total, g.result, g.grade);
      }
    });
  });
  tx(results);
  logAction(req, 'UPDATE', 'exam_results', `Exam ${req.params.id}: ${results.length} candidates`);
  res.json({ ok: true, count: results.length });
});

r.delete('/results/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM exam_results WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ================= TIMETABLE ================= */
r.get('/timetable', (req, res) => {
  const { school_id, class: cls, section } = req.query;
  let sql = 'SELECT * FROM timetable WHERE school_id=?';
  const args: any[] = [school_id];
  if (cls) { sql += ' AND class=?'; args.push(cls); }
  if (section) { sql += ' AND section=?'; args.push(section); }
  sql += ' ORDER BY day, period';
  res.json(db.prepare(sql).all(...args));
});
r.post('/timetable', requireWrite, (req: AuthedRequest, res) => {
  const b = req.body;
  if (b.id) {
    db.prepare('UPDATE timetable SET class=?,section=?,day=?,period=?,start_time=?,end_time=?,subject=?,teacher=? WHERE id=?')
      .run(b.class, b.section, b.day, b.period, b.start_time, b.end_time, b.subject, b.teacher, b.id);
  } else {
    db.prepare('INSERT INTO timetable (school_id,class,section,day,period,start_time,end_time,subject,teacher) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(b.school_id, b.class, b.section, b.day, b.period, b.start_time, b.end_time, b.subject, b.teacher);
  }
  logAction(req, 'UPDATE', 'timetable', `${b.class} ${b.day} P${b.period}`);
  res.json({ ok: true });
});
r.delete('/timetable/:id', requireWrite, (req: AuthedRequest, res) => {
  db.prepare('DELETE FROM timetable WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default r;
