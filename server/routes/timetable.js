import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit } from '../middleware.js';
import { ok, fail, parseIntSafe } from './_util.js';

const router = Router();

router.get('/periods', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM timetable_periods ORDER BY order_index`) });
});
router.post('/periods', requireAuth, requirePermission('timetable', 'update'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO timetable_periods (org_id, school_id, name, start_time, end_time, order_index) VALUES (1,?,?,?,?,?)`,
    [parseIntSafe(b.school_id), b.name, b.start_time, b.end_time, parseIntSafe(b.order_index, 0)]);
  res.json({ ok: true, id: info.lastInsertRowid });
});

router.get('/timetable', requireAuth, (req, res) => {
  const { school_id, class_id, section_id, teacher_id } = req.query;
  let where = ' WHERE 1=1'; const p = [];
  if (school_id) { where += ' AND tt.school_id = ?'; p.push(school_id); }
  if (class_id) { where += ' AND tt.class_id = ?'; p.push(class_id); }
  if (section_id) { where += ' AND tt.section_id = ?'; p.push(section_id); }
  if (teacher_id) { where += ' AND tt.teacher_id = ?'; p.push(teacher_id); }
  const rows = all(`SELECT tt.*, c.name AS class_name, sec.name AS section_name, s.name AS subject_name,
      st.name AS teacher_name, tp.name AS period_name, tp.start_time, tp.end_time, sc.name AS school_name
    FROM timetable tt
    LEFT JOIN classes c ON c.id = tt.class_id
    LEFT JOIN sections sec ON sec.id = tt.section_id
    LEFT JOIN subjects s ON s.id = tt.subject_id
    LEFT JOIN staff st ON st.id = tt.teacher_id
    LEFT JOIN timetable_periods tp ON tp.id = tt.period_id
    LEFT JOIN schools sc ON sc.id = tt.school_id
    ${where} ORDER BY tt.day, tp.order_index`, p);
  res.json({ ok: true, data: rows });
});

router.post('/timetable', requireAuth, requirePermission('timetable', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO timetable (org_id, school_id, class_id, section_id, day, period_id, subject_id, teacher_id, room)
    VALUES (1,?,?,?,?,?,?,?,?)`,
    [b.school_id, b.class_id, parseIntSafe(b.section_id), parseIntSafe(b.day), b.period_id, parseIntSafe(b.subject_id), parseIntSafe(b.teacher_id), b.room || null]);
  audit(req.user, 'create_timetable_entry', 'timetable', info.lastInsertRowid, {}, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/timetable/:id', requireAuth, requirePermission('timetable', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE timetable SET class_id=?, section_id=?, day=?, period_id=?, subject_id=?, teacher_id=?, room=? WHERE id=?`,
    [b.class_id, parseIntSafe(b.section_id), parseIntSafe(b.day), b.period_id, parseIntSafe(b.subject_id), parseIntSafe(b.teacher_id), b.room || null, req.params.id]);
  res.json({ ok: true });
});
router.delete('/timetable/:id', requireAuth, requirePermission('timetable', 'delete'), (req, res) => {
  run(`DELETE FROM timetable WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// Student timetable (portal)
router.get('/timetable/student/:studentId', requireAuth, (req, res) => {
  const st = one(`SELECT * FROM students WHERE id = ?`, [req.params.studentId]);
  if (!st) return fail(res, 404, 'Student not found');
  const rows = all(`SELECT tt.day, tp.name AS period_name, tp.start_time, tp.end_time, s.name AS subject_name, st2.name AS teacher_name, tt.room
    FROM timetable tt
    LEFT JOIN timetable_periods tp ON tp.id = tt.period_id
    LEFT JOIN subjects s ON s.id = tt.subject_id
    LEFT JOIN staff st2 ON st2.id = tt.teacher_id
    WHERE tt.school_id = ? AND tt.class_id = ? AND (tt.section_id = ? OR tt.section_id IS NULL)
    ORDER BY tt.day, tp.order_index`, [st.school_id, st.current_class_id, st.current_section_id]);
  res.json({ ok: true, data: rows });
});

export default router;
