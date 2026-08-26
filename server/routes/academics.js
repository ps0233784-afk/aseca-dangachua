import { Router } from 'express';
import { db, all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit } from '../middleware.js';
import { ok, fail, parseIntSafe } from './_util.js';

const router = Router();

// ---------- Classes ----------
router.get('/classes', requireAuth, (req, res) => {
  const rows = all(`SELECT c.*,
      (SELECT COUNT(*) FROM class_subjects cs WHERE cs.class_id = c.id) AS subject_count,
      (SELECT COUNT(*) FROM sections s WHERE s.class_id = c.id) AS section_count
    FROM classes c ORDER BY c.order_index`);
  res.json({ ok: true, data: rows });
});
router.post('/classes', requireAuth, requirePermission('academics', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'Class name required');
  const info = run(`INSERT INTO classes (org_id, name, code, order_index, default_capacity) VALUES (1,?,?,?,?)`,
    [b.name, b.code || null, parseIntSafe(b.order_index, 0), parseIntSafe(b.default_capacity, 40)]);
  audit(req.user, 'create_class', 'class', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/classes/:id', requireAuth, requirePermission('academics', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE classes SET name=?, code=?, order_index=?, default_capacity=? WHERE id=?`,
    [b.name, b.code, parseIntSafe(b.order_index, 0), parseIntSafe(b.default_capacity, 40), req.params.id]);
  audit(req.user, 'update_class', 'class', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/classes/:id', requireAuth, requirePermission('academics', 'delete'), (req, res) => {
  run(`DELETE FROM classes WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Sections ----------
router.get('/sections', requireAuth, (req, res) => {
  const { school_id, class_id } = req.query;
  let where = ''; const params = [];
  if (school_id) { where += ' WHERE s.school_id = ?'; params.push(school_id); }
  if (class_id) { where += (where ? ' AND ' : ' WHERE ') + 's.class_id = ?'; params.push(class_id); }
  const rows = all(`SELECT s.*, c.name AS class_name, sc.name AS school_name,
      (SELECT COUNT(*) FROM students st WHERE st.current_section_id = s.id) AS student_count,
      u.name AS class_teacher_name
    FROM sections s
    JOIN classes c ON c.id = s.class_id
    JOIN schools sc ON sc.id = s.school_id
    LEFT JOIN staff u ON u.id = s.class_teacher_id
    ${where} ORDER BY sc.name, c.order_index, s.name`, params);
  res.json({ ok: true, data: rows });
});
router.post('/sections', requireAuth, requirePermission('academics', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO sections (school_id, class_id, name, room, capacity, class_teacher_id) VALUES (?,?,?,?,?,?)`,
    [b.school_id, b.class_id, b.name, b.room || null, parseIntSafe(b.capacity, 40), b.class_teacher_id || null]);
  audit(req.user, 'create_section', 'section', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/sections/:id', requireAuth, requirePermission('academics', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE sections SET school_id=?, class_id=?, name=?, room=?, capacity=?, class_teacher_id=? WHERE id=?`,
    [b.school_id, b.class_id, b.name, b.room, parseIntSafe(b.capacity, 40), b.class_teacher_id || null, req.params.id]);
  audit(req.user, 'update_section', 'section', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/sections/:id', requireAuth, requirePermission('academics', 'delete'), (req, res) => {
  run(`DELETE FROM sections WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Subjects ----------
router.get('/subjects', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM subjects ORDER BY name`) });
});
router.post('/subjects', requireAuth, requirePermission('academics', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'Subject name required');
  const info = run(`INSERT INTO subjects (org_id, name, code, full_marks, pass_marks, theory_marks, practical_marks, subject_type, color)
    VALUES (1,?,?,?,?,?,?,?,?)`,
    [b.name, b.code || null, parseIntSafe(b.full_marks, 100), parseIntSafe(b.pass_marks, 33),
     parseIntSafe(b.theory_marks, 100), parseIntSafe(b.practical_marks, 0), b.subject_type || 'core', b.color || '#1a56db']);
  audit(req.user, 'create_subject', 'subject', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/subjects/:id', requireAuth, requirePermission('academics', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE subjects SET name=?, code=?, full_marks=?, pass_marks=?, theory_marks=?, practical_marks=?, subject_type=?, color=? WHERE id=?`,
    [b.name, b.code, parseIntSafe(b.full_marks, 100), parseIntSafe(b.pass_marks, 33),
     parseIntSafe(b.theory_marks, 100), parseIntSafe(b.practical_marks, 0), b.subject_type || 'core', b.color || '#1a56db', req.params.id]);
  audit(req.user, 'update_subject', 'subject', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/subjects/:id', requireAuth, requirePermission('academics', 'delete'), (req, res) => {
  run(`DELETE FROM subjects WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Class-Subject mapping ----------
router.get('/classes/:id/subjects', requireAuth, (req, res) => {
  const rows = all(`SELECT s.* FROM subjects s JOIN class_subjects cs ON cs.subject_id = s.id WHERE cs.class_id = ? ORDER BY s.name`, [req.params.id]);
  res.json({ ok: true, data: rows });
});
router.put('/classes/:id/subjects', requireAuth, requirePermission('academics', 'update'), (req, res) => {
  const { subject_ids } = req.body || {};
  run(`DELETE FROM class_subjects WHERE class_id = ?`, [req.params.id]);
  if (Array.isArray(subject_ids)) {
    for (const sid of subject_ids) db.prepare(`INSERT OR IGNORE INTO class_subjects (class_id, subject_id) VALUES (?,?)`).run(req.params.id, sid);
  }
  audit(req.user, 'update_class_subjects', 'class', req.params.id, { subject_ids }, req.ip);
  res.json({ ok: true });
});

export default router;
