import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, schoolScope, isOrgLevel } from '../middleware.js';
import { ok, fail, parseIntSafe, toJSON } from './_util.js';

const router = Router();

router.get('/staff', requireAuth, (req, res) => {
  const u = req.user;
  const clauses = []; const params = [];
  if (!isOrgLevel(u)) {
    if (u.school_id) { clauses.push('sf.school_id = ?'); params.push(u.school_id); }
    else clauses.push('0');
  }
  if (req.query.q) { clauses.push('(sf.name LIKE ? OR sf.employee_id LIKE ? OR sf.designation LIKE ? OR sf.mobile LIKE ?)'); const q = `%${req.query.q}%`; params.push(q, q, q, q); }
  if (req.query.school_id) { clauses.push('sf.school_id = ?'); params.push(req.query.school_id); }
  if (req.query.staff_type) { clauses.push('sf.staff_type = ?'); params.push(req.query.staff_type); }
  if (req.query.status && req.query.status !== 'all') { clauses.push('sf.status = ?'); params.push(req.query.status); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const rows = all(`SELECT sf.*, sc.name AS school_name FROM staff sf LEFT JOIN schools sc ON sc.id = sf.school_id ${where} ORDER BY sf.id DESC`, params);
  res.json({ ok: true, data: rows });
});

router.get('/staff/:id', requireAuth, (req, res) => {
  const sf = one(`SELECT sf.*, sc.name AS school_name FROM staff sf LEFT JOIN schools sc ON sc.id = sf.school_id WHERE sf.id = ?`, [req.params.id]);
  if (!sf) return fail(res, 404, 'Staff not found');
  res.json({ ok: true, data: sf });
});

router.post('/staff', requireAuth, requirePermission('staff', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'Name required');
  const employee_id = b.employee_id || ('EMP-' + Math.floor(100 + Math.random() * 900));
  try {
    const info = run(`INSERT INTO staff (org_id, school_id, user_id, employee_id, name, photo, qualification, designation, staff_type, department, subject_ids, joining_date, mobile, email, address, gender, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [parseIntSafe(b.school_id), parseIntSafe(b.user_id), employee_id, b.name, b.photo || null, b.qualification || null,
       b.designation || 'Teacher', b.staff_type || 'teaching', b.department || null, toJSON(b.subject_ids), b.joining_date || null,
       b.mobile || null, b.email || null, b.address || null, b.gender || null, b.status || 'active']);
    audit(req.user, 'create_staff', 'staff', info.lastInsertRowid, { name: b.name }, req.ip);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    return fail(res, 400, e.message.includes('UNIQUE') ? 'Employee ID exists' : e.message);
  }
});

router.put('/staff/:id', requireAuth, requirePermission('staff', 'update'), (req, res) => {
  const b = req.body || {};
  const fields = ['school_id','user_id','employee_id','name','photo','qualification','designation','staff_type','department','joining_date','mobile','email','address','gender','status'];
  const sets = []; const params = [];
  for (const f of fields) {
    if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(f === 'subject_ids' ? toJSON(b[f]) : b[f]); }
  }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  run(`UPDATE staff SET ${sets.join(', ')} WHERE id = ?`, params);
  audit(req.user, 'update_staff', 'staff', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

router.post('/staff/:id/toggle-status', requireAuth, requirePermission('staff', 'update'), (req, res) => {
  run(`UPDATE staff SET status = CASE status WHEN 'active' THEN 'inactive' ELSE 'active' END WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});
router.delete('/staff/:id', requireAuth, requirePermission('staff', 'delete'), (req, res) => {
  run(`DELETE FROM staff WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
