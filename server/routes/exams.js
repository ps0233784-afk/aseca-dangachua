import { Router } from 'express';
import { db, all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, isOrgLevel } from '../middleware.js';
import { ok, fail, parseIntSafe } from './_util.js';

const router = Router();

function gradingRules() {
  return all(`SELECT * FROM grading_rules ORDER BY order_index`);
}

// ---------- Exams ----------
router.get('/exams', requireAuth, (req, res) => {
  const rows = all(`SELECT e.*, ay.name AS academic_year_name,
      (SELECT COUNT(*) FROM results r WHERE r.exam_id = e.id) AS results_count
    FROM exams e LEFT JOIN academic_years ay ON ay.id = e.academic_year_id ORDER BY e.id DESC`);
  res.json({ ok: true, data: rows });
});

router.get('/exams/:id', requireAuth, (req, res) => {
  const exam = one(`SELECT e.*, ay.name AS academic_year_name FROM exams e LEFT JOIN academic_years ay ON ay.id = e.academic_year_id WHERE e.id = ?`, [req.params.id]);
  if (!exam) return fail(res, 404, 'Exam not found');
  const classes = all(`SELECT c.* FROM exam_classes ec JOIN classes c ON c.id = ec.class_id WHERE ec.exam_id = ? ORDER BY c.order_index`, [exam.id]);
  const subjects = all(`SELECT es.*, s.name AS subject_name FROM exam_subjects es JOIN subjects s ON s.id = es.subject_id WHERE es.exam_id = ?`, [exam.id]);
  res.json({ ok: true, data: { ...exam, classes, subjects } });
});

router.post('/exams', requireAuth, requirePermission('exams', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'Exam name required');
  const info = run(`INSERT INTO exams (org_id, name, exam_type, academic_year_id, start_date, end_date, publish_date, status, created_by)
    VALUES (1,?,?,?,?,?,?,?,?)`,
    [b.name, b.exam_type || 'custom', parseIntSafe(b.academic_year_id), b.start_date, b.end_date, b.publish_date, b.status || 'draft', req.user.id]);
  const examId = info.lastInsertRowid;
  if (Array.isArray(b.class_ids)) for (const c of b.class_ids) run(`INSERT OR IGNORE INTO exam_classes (exam_id, class_id) VALUES (?,?)`, [examId, c]);
  audit(req.user, 'create_exam', 'exam', examId, { name: b.name }, req.ip);
  res.json({ ok: true, id: examId });
});

router.put('/exams/:id', requireAuth, requirePermission('exams', 'update'), (req, res) => {
  const b = req.body || {};
  const fields = ['name','exam_type','academic_year_id','start_date','end_date','publish_date','status'];
  const sets = []; const params = [];
  for (const f of fields) if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
  if (sets.length) { params.push(req.params.id); run(`UPDATE exams SET ${sets.join(', ')} WHERE id = ?`, params); }
  if (Array.isArray(b.class_ids)) {
    run(`DELETE FROM exam_classes WHERE exam_id = ?`, [req.params.id]);
    for (const c of b.class_ids) run(`INSERT OR IGNORE INTO exam_classes (exam_id, class_id) VALUES (?,?)`, [req.params.id, c]);
  }
  audit(req.user, 'update_exam', 'exam', req.params.id, { name: b.name }, req.ip);
  res.json({ ok: true });
});

router.delete('/exams/:id', requireAuth, requirePermission('exams', 'delete'), (req, res) => {
  run(`DELETE FROM exams WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Exam subjects ----------
router.post('/exams/:id/subjects', requireAuth, requirePermission('exams', 'update'), (req, res) => {
  const { subjects } = req.body || {}; // [{class_id, subject_id, full_marks, pass_marks, exam_date}]
  const tx = db.transaction(() => {
    for (const s of subjects) {
      run(`INSERT INTO exam_subjects (exam_id, class_id, subject_id, full_marks, pass_marks, exam_date) VALUES (?,?,?,?,?,?)
        ON CONFLICT(exam_id, class_id, subject_id) DO UPDATE SET full_marks=excluded.full_marks, pass_marks=excluded.pass_marks`,
        [req.params.id, s.class_id, s.subject_id, parseIntSafe(s.full_marks, 100), parseIntSafe(s.pass_marks, 33), s.exam_date || null]);
    }
  });
  tx();
  audit(req.user, 'configure_exam_subjects', 'exam', req.params.id, { count: subjects.length }, req.ip);
  res.json({ ok: true });
});

// ---------- Marks entry ----------
// GET students + their marks for an exam+class+subject
router.get('/exams/:id/marksheet', requireAuth, (req, res) => {
  const { class_id, subject_id } = req.query;
  const students = all(`SELECT st.id AS student_id, st.name, st.roll_no, st.student_id AS sid FROM students st WHERE st.current_class_id = ? ORDER BY st.roll_no`, [class_id]);
  const marks = all(`SELECT * FROM marks WHERE exam_id = ? AND subject_id = ?`, [req.params.id, subject_id]);
  const map = new Map(marks.map((m) => [m.student_id, m]));
  res.json({ ok: true, data: students.map((s) => ({ ...s, mark: map.get(s.student_id) || null })) });
});

router.post('/exams/:id/marks', requireAuth, requirePermission('exams', 'update'), (req, res) => {
  const { entries, status = 'draft' } = req.body || {}; // [{student_id, subject_id, theory_marks, practical_marks}]
  if (!Array.isArray(entries)) return fail(res, 400, 'entries required');
  const rules = gradingRules();
  const gradeFor = (pct) => rules.find((r) => pct >= r.min_percent && pct <= r.max_percent)?.grade || 'F';
  const upsert = db.prepare(`INSERT INTO marks (org_id, exam_id, student_id, subject_id, theory_marks, practical_marks, total, grade, status, entered_by)
    VALUES (1,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(exam_id, student_id, subject_id) DO UPDATE SET theory_marks=excluded.theory_marks, practical_marks=excluded.practical_marks, total=excluded.total, grade=excluded.grade, status=excluded.status, entered_by=excluded.entered_by, updated_at=datetime('now')`);
  const tx = db.transaction(() => {
    for (const en of entries) {
      const theory = parseFloat(en.theory_marks) || 0;
      const practical = parseFloat(en.practical_marks) || 0;
      const total = Math.round((theory + practical) * 100) / 100;
      const es = one(`SELECT full_marks FROM exam_subjects WHERE exam_id = ? AND subject_id = ? AND class_id = (SELECT current_class_id FROM students WHERE id = ?)`, [req.params.id, en.subject_id, en.student_id]);
      const fm = es?.full_marks || 100;
      const pct = fm ? (total / fm) * 100 : 0;
      upsert.run(req.params.id, en.student_id, en.subject_id, theory, practical, total, gradeFor(pct), status, req.user.id);
    }
  });
  tx();
  audit(req.user, 'enter_marks', 'marks', req.params.id, { count: entries.length, status }, req.ip);
  res.json({ ok: true, count: entries.length });
});

// ---------- Results (compute) ----------
router.post('/exams/:id/compute-results', requireAuth, requirePermission('results', 'update'), (req, res) => {
  const exam = one(`SELECT * FROM exams WHERE id = ?`, [req.params.id]);
  if (!exam) return fail(res, 404, 'Exam not found');
  const rules = gradingRules();
  const gradeFor = (pct) => rules.find((r) => pct >= r.min_percent && pct <= r.max_percent)?.grade || 'F';
  const students = all(`SELECT DISTINCT m.student_id, st.school_id FROM marks m JOIN students st ON st.id = m.student_id WHERE m.exam_id = ?`, [req.params.id]);
  const del = db.prepare(`DELETE FROM results WHERE exam_id = ? AND student_id = ?`);
  const ins = db.prepare(`INSERT INTO results (org_id, exam_id, student_id, total_marks, max_marks, percentage, grade, result_status, remarks, published_at)
    VALUES (1,?,?,?,?,?,?,?,?,?)`);
  const perSchool = new Map();
  const tx = db.transaction(() => {
    for (const s of students) {
      const mrows = all(`SELECT m.total, m.subject_id, es.pass_marks, es.full_marks, m.grade FROM marks m
        LEFT JOIN exam_subjects es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
        WHERE m.exam_id = ? AND m.student_id = ?`, [req.params.id, s.student_id]);
      if (!mrows.length) continue;
      let total = 0, max = 0, failed = false;
      for (const m of mrows) {
        total += m.total || 0;
        const fm = m.full_marks || 100;
        max += fm;
        const pm = m.pass_marks || 33;
        const pct = fm ? ((m.total || 0) / fm) * 100 : 0;
        if (pct < (pm / fm) * 100 && pm > 0) failed = true;
      }
      const percentage = max ? (total / max) * 100 : 0;
      const status = failed ? 'fail' : 'pass';
      del.run(req.params.id, s.student_id);
      ins.run(req.params.id, s.student_id, Math.round(total * 100) / 100, max, Math.round(percentage * 100) / 100, gradeFor(percentage), status, null, null);
      if (!perSchool.has(s.school_id)) perSchool.set(s.school_id, []);
      perSchool.get(s.school_id).push({ id: s.student_id, pct: percentage });
    }
  });
  tx();
  // ranks per school
  const upd = db.prepare(`UPDATE results SET rank = ? WHERE exam_id = ? AND student_id = ?`);
  for (const [, list] of perSchool) {
    list.sort((a, b) => b.pct - a.pct);
    list.forEach((it, i) => upd.run(i + 1, req.params.id, it.id));
  }
  audit(req.user, 'compute_results', 'results', req.params.id, { students: students.length }, req.ip);
  res.json({ ok: true, computed: students.length });
});

router.post('/exams/:id/publish', requireAuth, requirePermission('results', 'approve'), (req, res) => {
  run(`UPDATE exams SET status = 'results_published', publish_date = date('now') WHERE id = ?`, [req.params.id]);
  run(`UPDATE results SET published_at = datetime('now') WHERE exam_id = ?`, [req.params.id]);
  audit(req.user, 'publish_results', 'results', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

router.post('/exams/:id/lock', requireAuth, requirePermission('results', 'approve'), (req, res) => {
  run(`UPDATE exams SET status = 'locked' WHERE id = ?`, [req.params.id]);
  run(`UPDATE marks SET status = 'locked' WHERE exam_id = ?`, [req.params.id]);
  audit(req.user, 'lock_results', 'results', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ---------- Results listing ----------
router.get('/exams/:id/results', requireAuth, (req, res) => {
  const { class_id } = req.query;
  let where = ' WHERE r.exam_id = ?'; const p = [req.params.id];
  if (class_id) { where += ' AND st.current_class_id = ?'; p.push(class_id); }
  const rows = all(`SELECT r.*, st.name, st.roll_no, st.student_id AS sid, c.name AS class_name, sec.name AS section_name
    FROM results r JOIN students st ON st.id = r.student_id
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    ${where} ORDER BY r.rank IS NULL, r.rank, st.roll_no`, p);
  res.json({ ok: true, data: rows });
});

// Student results (portal / parent)
router.get('/student-results/:studentId', requireAuth, (req, res) => {
  const rows = all(`SELECT e.id AS exam_id, e.name AS exam_name, e.exam_type, r.* FROM results r
    JOIN exams e ON e.id = r.exam_id WHERE r.student_id = ? ORDER BY e.id DESC`, [req.params.studentId]);
  res.json({ ok: true, data: rows });
});

// Detailed result (subject-wise) for report card
router.get('/exams/:id/result/:studentId', requireAuth, (req, res) => {
  const result = one(`SELECT r.*, st.name, st.roll_no, st.student_id AS sid, st.photo, st.dob, st.gender, st.father_name, st.mother_name, st.current_class_id, st.current_section_id, st.school_id, st.admission_no,
      c.name AS class_name, sec.name AS section_name, sc.name AS school_name
    FROM results r JOIN students st ON st.id = r.student_id
    LEFT JOIN classes c ON c.id = st.current_class_id
    LEFT JOIN sections sec ON sec.id = st.current_section_id
    LEFT JOIN schools sc ON sc.id = st.school_id
    WHERE r.exam_id = ? AND r.student_id = ?`, [req.params.id, req.params.studentId]);
  if (!result) return fail(res, 404, 'Result not found');
  const subjects = all(`SELECT m.*, s.name AS subject_name, es.full_marks, es.pass_marks
    FROM marks m JOIN subjects s ON s.id = m.subject_id
    LEFT JOIN exam_subjects es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
    WHERE m.exam_id = ? AND m.student_id = ? ORDER BY s.name`, [req.params.id, req.params.studentId]);
  res.json({ ok: true, data: { ...result, subjects } });
});

// ---------- Grading rules ----------
router.get('/grading-rules', requireAuth, (req, res) => {
  res.json({ ok: true, data: gradingRules() });
});
router.put('/grading-rules', requireAuth, requirePermission('settings', 'update'), (req, res) => {
  const { rules } = req.body || {};
  if (!Array.isArray(rules)) return fail(res, 400, 'rules required');
  const tx = db.transaction(() => {
    run(`DELETE FROM grading_rules`);
    const ins = db.prepare(`INSERT INTO grading_rules (org_id, min_percent, max_percent, grade, remark, is_pass, order_index) VALUES (1,?,?,?,?,?,?)`);
    rules.forEach((r, i) => ins.run(r.min_percent, r.max_percent, r.grade, r.remark || null, r.is_pass ? 1 : 0, i));
  });
  tx();
  audit(req.user, 'update_grading_rules', 'settings', null, { count: rules.length }, req.ip);
  res.json({ ok: true });
});

export default router;
