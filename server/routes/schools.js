import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, schoolScope, isOrgLevel } from '../middleware.js';
import { ok, fail, listResult, parseIntSafe } from './_util.js';

const router = Router();

// ---------- Schools ----------
router.get('/schools', requireAuth, (req, res) => {
  const u = req.user;
  let where = '';
  let params = [];
  if (!isOrgLevel(u)) {
    if (u.school_id) { where = ' WHERE id = ?'; params = [u.school_id]; }
    else { where = ' WHERE 0'; }
  }
  if (req.query.status && req.query.status !== 'all') {
    where += (where ? ' AND ' : ' WHERE ') + 'status = ?';
    params.push(req.query.status);
  }
  const rows = all(`SELECT * FROM schools ${where} ORDER BY name`, params);
  res.json({ ok: true, data: rows });
});

router.get('/schools/:id', requireAuth, (req, res) => {
  const school = one(`SELECT * FROM schools WHERE id = ?`, [req.params.id]);
  if (!school) return fail(res, 404, 'School not found');
  const stats = {
    students: one(`SELECT COUNT(*) c FROM students WHERE school_id = ?`, [school.id]).c,
    teachers: one(`SELECT COUNT(*) c FROM staff WHERE school_id = ? AND staff_type = 'teaching'`, [school.id]).c,
    staff: one(`SELECT COUNT(*) c FROM staff WHERE school_id = ?`, [school.id]).c,
    classes: one(`SELECT COUNT(*) c FROM sections WHERE school_id = ?`, [school.id]).c,
  };
  res.json({ ok: true, data: { ...school, stats } });
});

router.post('/schools', requireAuth, requirePermission('schools', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'School name is required');
  const code = b.code || ('SCH-' + Math.random().toString(36).slice(2, 6).toUpperCase());
  try {
    const info = run(`INSERT INTO schools (org_id, name, code, school_id, logo, photo, address, village, block, district, cluster, pincode, phone, email, principal_name, school_type, medium, established_year, status, description)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.name, code, b.school_id || null, b.logo || null, b.photo || null, b.address || null, b.village || null, b.block || null,
       b.district || null, b.cluster || null, b.pincode || null, b.phone || null, b.email || null, b.principal_name || null,
       b.school_type || 'High School', b.medium || 'Odia', parseIntSafe(b.established_year), b.status || 'active', b.description || null]);
    audit(req.user, 'create_school', 'school', info.lastInsertRowid, { name: b.name }, req.ip);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    return fail(res, 400, e.message.includes('UNIQUE') ? 'School code already exists' : e.message);
  }
});

router.put('/schools/:id', requireAuth, requirePermission('schools', 'update'), (req, res) => {
  const b = req.body || {};
  const existing = one(`SELECT * FROM schools WHERE id = ?`, [req.params.id]);
  if (!existing) return fail(res, 404, 'School not found');
  run(`UPDATE schools SET name=?, code=?, school_id=?, logo=?, photo=?, address=?, village=?, block=?, district=?, cluster=?, pincode=?, phone=?, email=?, principal_name=?, school_type=?, medium=?, established_year=?, status=?, description=?, updated_at=datetime('now')
    WHERE id=?`,
    [b.name ?? existing.name, b.code ?? existing.code, b.school_id ?? existing.school_id, b.logo ?? existing.logo,
     b.photo ?? existing.photo, b.address ?? existing.address, b.village ?? existing.village, b.block ?? existing.block,
     b.district ?? existing.district, b.cluster ?? existing.cluster, b.pincode ?? existing.pincode, b.phone ?? existing.phone,
     b.email ?? existing.email, b.principal_name ?? existing.principal_name, b.school_type ?? existing.school_type,
     b.medium ?? existing.medium, parseIntSafe(b.established_year, existing.established_year), b.status ?? existing.status,
     b.description ?? existing.description, req.params.id]);
  audit(req.user, 'update_school', 'school', req.params.id, { name: b.name }, req.ip);
  res.json({ ok: true });
});

router.post('/schools/:id/archive', requireAuth, requirePermission('schools', 'update'), (req, res) => {
  run(`UPDATE schools SET status = 'archived' WHERE id = ?`, [req.params.id]);
  audit(req.user, 'archive_school', 'school', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.post('/schools/:id/restore', requireAuth, requirePermission('schools', 'update'), (req, res) => {
  run(`UPDATE schools SET status = 'active' WHERE id = ?`, [req.params.id]);
  audit(req.user, 'restore_school', 'school', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/schools/:id', requireAuth, requirePermission('schools', 'delete'), (req, res) => {
  run(`DELETE FROM schools WHERE id = ?`, [req.params.id]);
  audit(req.user, 'delete_school', 'school', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ---------- Academic Years ----------
router.get('/academic-years', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM academic_years ORDER BY is_current DESC, name DESC`) });
});
router.post('/academic-years', requireAuth, requirePermission('academics', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.name) return fail(res, 400, 'Name required');
  const info = run(`INSERT INTO academic_years (org_id, name, start_date, end_date, is_current, status) VALUES (1,?,?,?,?,?)`,
    [b.name, b.start_date, b.end_date, b.is_current ? 1 : 0, b.status || 'active']);
  if (b.is_current) run(`UPDATE academic_years SET is_current = 0 WHERE id != ?`, [info.lastInsertRowid]);
  audit(req.user, 'create_academic_year', 'academic_year', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/academic-years/:id', requireAuth, requirePermission('academics', 'update'), (req, res) => {
  const b = req.body || {};
  if (b.is_current) run(`UPDATE academic_years SET is_current = 0 WHERE id != ?`, [req.params.id]);
  run(`UPDATE academic_years SET name=?, start_date=?, end_date=?, is_current=?, status=? WHERE id=?`,
    [b.name, b.start_date, b.end_date, b.is_current ? 1 : 0, b.status, req.params.id]);
  audit(req.user, 'update_academic_year', 'academic_year', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/academic-years/:id', requireAuth, requirePermission('academics', 'delete'), (req, res) => {
  run(`DELETE FROM academic_years WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
