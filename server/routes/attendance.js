import { Router } from 'express';
import { db, all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, schoolScope, isOrgLevel } from '../middleware.js';
import { ok, fail, parseIntSafe } from './_util.js';

const router = Router();

// Mark / bulk-mark attendance
router.post('/attendance', requireAuth, requirePermission('attendance', 'create'), (req, res) => {
  const { date, person_type, records } = req.body || {};
  if (!date || !person_type || !Array.isArray(records)) return fail(res, 400, 'date, person_type and records are required');
  const upsert = db.prepare(`INSERT INTO attendance (org_id, school_id, person_type, person_id, date, status, remark, marked_by)
    VALUES (1,?,?,?,?,?,?,?)
    ON CONFLICT(person_type, person_id, date) DO UPDATE SET status = excluded.status, remark = excluded.remark, marked_by = excluded.marked_by`);
  const tx = db.transaction(() => {
    for (const r of records) {
      upsert.run(parseIntSafe(r.school_id), person_type, r.person_id, date, r.status, r.remark || null, req.user.id);
    }
  });
  tx();
  audit(req.user, 'mark_attendance', 'attendance', null, { date, person_type, count: records.length }, req.ip);
  res.json({ ok: true, count: records.length });
});

// Get attendance for a given date + section (students) or all staff
router.get('/attendance', requireAuth, (req, res) => {
  const { date, section_id, class_id, school_id, person_type = 'student' } = req.query;
  if (!date) return fail(res, 400, 'date required');
  let persons;
  if (person_type === 'staff') {
    let where = ''; const p = [];
    if (school_id) { where = ' WHERE school_id = ?'; p.push(school_id); }
    persons = all(`SELECT id AS person_id, name, designation, employee_id, school_id FROM staff ${where}`, p);
  } else {
    let where = ' WHERE 1=1'; const p = [];
    if (section_id) { where += ' AND current_section_id = ?'; p.push(section_id); }
    else if (class_id) { where += ' AND current_class_id = ?'; p.push(class_id); }
    if (school_id) { where += ' AND school_id = ?'; p.push(school_id); }
    persons = all(`SELECT id AS person_id, name, roll_no, student_id, current_class_id, current_section_id, school_id FROM students ${where} ORDER BY roll_no`, p);
  }
  const marks = all(`SELECT * FROM attendance WHERE person_type = ? AND date = ?`, [person_type, date]);
  const map = new Map(marks.map((m) => [m.person_id, m]));
  const data = persons.map((p) => ({ ...p, attendance: map.get(p.person_id) || null }));
  res.json({ ok: true, data });
});

// Student attendance history + percentage
router.get('/attendance/summary', requireAuth, (req, res) => {
  const { student_id, from, to } = req.query;
  const rows = all(`SELECT * FROM attendance WHERE person_type = 'student' AND person_id = ? AND date >= ? AND date <= ? ORDER BY date DESC`,
    [student_id, from || '0000-00-00', to || '9999-99-99']);
  const total = rows.length;
  const counts = {};
  for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
  const presentish = (counts.present || 0) + (counts.late || 0) + (counts.half_day || 0) * 0.5;
  const pct = total ? Math.round((presentish / total) * 100) : 0;
  res.json({ ok: true, data: rows, summary: { total, counts, percentage: pct } });
});

// Class-wise attendance for a date range (charts)
router.get('/attendance/class-stats', requireAuth, (req, res) => {
  const { school_id, from, to } = req.query;
  let where = ' WHERE a.person_type = "student"'; const p = [];
  if (school_id) { where += ' AND a.school_id = ?'; p.push(school_id); }
  if (from) { where += ' AND a.date >= ?'; p.push(from); }
  if (to) { where += ' AND a.date <= ?'; p.push(to); }
  const rows = all(`SELECT c.name AS class_name, a.status, COUNT(*) AS n
    FROM attendance a
    JOIN students st ON st.id = a.person_id
    LEFT JOIN classes c ON c.id = st.current_class_id
    ${where} GROUP BY c.name, a.status ORDER BY c.name`, p);
  res.json({ ok: true, data: rows });
});

router.get('/attendance/month', requireAuth, (req, res) => {
  const { month, student_id, staff_id } = req.query; // month = YYYY-MM
  const prefix = month || new Date().toISOString().slice(0, 7);
  const type = student_id ? 'student' : 'staff';
  const pid = student_id || staff_id;
  const rows = all(`SELECT * FROM attendance WHERE person_type = ? AND person_id = ? AND date LIKE ? ORDER BY date`, [type, pid, prefix + '%']);
  res.json({ ok: true, data: rows });
});

export default router;
