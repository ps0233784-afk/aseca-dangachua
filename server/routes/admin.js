import { Router } from 'express';
import { db, all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit, isOrgLevel } from '../middleware.js';
import { MODULES, ACTIONS } from '../auth.js';
import { ok, fail, parseIntSafe, toJSON, getSettingValue } from './_util.js';
import { hashPassword } from '../auth.js';

const router = Router();

// ---------- Users ----------
router.get('/users', requireAuth, requirePermission('users', 'view'), (req, res) => {
  const rows = all(`SELECT u.id, u.org_id, u.school_id, u.role_id, u.name, u.username, u.email, u.phone, u.avatar, u.gender, u.language, u.theme, u.status, u.last_login, u.created_at,
      r.name AS role_name, r.key AS role_key, sc.name AS school_name
    FROM users u JOIN roles r ON r.id = u.role_id LEFT JOIN schools sc ON sc.id = u.school_id ORDER BY u.id`);
  res.json({ ok: true, data: rows });
});
router.post('/users', requireAuth, requirePermission('users', 'create'), async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.username || !b.password || !b.role_id) return fail(res, 400, 'Name, username, password and role are required');
  const hash = await hashPassword(b.password);
  try {
    const info = run(`INSERT INTO users (org_id, school_id, role_id, name, username, email, password_hash, phone, gender, language, theme, status)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?)`,
      [parseIntSafe(b.school_id), b.role_id, b.name, b.username, b.email || null, hash, b.phone || null, b.gender || null, b.language || 'en', b.theme || 'system', b.status || 'active']);
    audit(req.user, 'create_user', 'user', info.lastInsertRowid, { username: b.username, role_id: b.role_id }, req.ip);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    return fail(res, 400, e.message.includes('UNIQUE') ? 'Username or email already exists' : e.message);
  }
});
router.put('/users/:id', requireAuth, requirePermission('users', 'update'), async (req, res) => {
  const b = req.body || {};
  const fields = ['school_id','role_id','name','username','email','phone','gender','language','theme','status'];
  const sets = []; const params = [];
  for (const f of fields) if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
  if (b.password) { sets.push('password_hash = ?'); params.push(await hashPassword(b.password)); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  try {
    run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
  } catch (e) {
    return fail(res, 400, e.message.includes('UNIQUE') ? 'Username or email already exists' : e.message);
  }
  audit(req.user, 'update_user', 'user', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/users/:id', requireAuth, requirePermission('users', 'delete'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return fail(res, 400, 'You cannot delete your own account');
  run(`DELETE FROM users WHERE id = ?`, [req.params.id]);
  audit(req.user, 'delete_user', 'user', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ---------- Roles ----------
router.get('/roles', requireAuth, requirePermission('roles', 'view'), (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM roles ORDER BY id`) });
});
router.put('/roles/:id', requireAuth, requirePermission('roles', 'update'), (req, res) => {
  const b = req.body || {};
  const role = one(`SELECT * FROM roles WHERE id = ?`, [req.params.id]);
  if (!role) return fail(res, 404, 'Role not found');
  if (role.is_system && !['super_admin', 'org_admin'].includes(req.user.role_key)) return fail(res, 403, 'Only Super/Org Admin can modify this role');
  if (b.permissions !== undefined) {
    run(`UPDATE roles SET permissions = ? WHERE id = ?`, [toJSON(b.permissions), req.params.id]);
  }
  if (b.name) run(`UPDATE roles SET name = ?, description = ? WHERE id = ?`, [b.name, b.description ?? role.description, req.params.id]);
  audit(req.user, 'update_role', 'role', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ---------- Settings ----------
router.get('/settings', requireAuth, (req, res) => {
  const org = one(`SELECT * FROM organizations ORDER BY id LIMIT 1`);
  const rows = all(`SELECT key, value FROM settings WHERE org_id = 1`);
  const settings = {};
  for (const r of rows) { try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; } }
  res.json({ ok: true, data: { org, settings } });
});
router.put('/settings/org', requireAuth, requirePermission('settings', 'update'), (req, res) => {
  const b = req.body || {};
  const fields = ['name','short_name','tagline','logo','favicon','hero_image','address','village','block','district','state','pincode','phone','email','website','established_year','about','mission','vision','footer_text','social','theme'];
  const sets = []; const params = [];
  for (const f of fields) if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(f === 'social' || f === 'theme' ? toJSON(b[f]) : b[f]); }
  if (sets.length) { params.push(1); run(`UPDATE organizations SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = 1`, params); }
  audit(req.user, 'update_organization', 'organization', 1, {}, req.ip);
  res.json({ ok: true });
});
router.put('/settings/:key', requireAuth, requirePermission('settings', 'update'), (req, res) => {
  const b = req.body || {};
  run(`INSERT INTO settings (org_id, key, value) VALUES (1,?,?) ON CONFLICT(org_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    [req.params.key, toJSON(b.value !== undefined ? b.value : b)]);
  audit(req.user, 'update_setting', 'setting', null, { key: req.params.key }, req.ip);
  res.json({ ok: true });
});

// ---------- Audit logs ----------
router.get('/audit-logs', requireAuth, requirePermission('audit_logs', 'view'), (req, res) => {
  const clauses = []; const params = [];
  if (req.query.action) { clauses.push('action LIKE ?'); params.push(`%${req.query.action}%`); }
  if (req.query.user_id) { clauses.push('user_id = ?'); params.push(req.query.user_id); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const rows = all(`SELECT a.*, u.name AS user_name FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ${where} ORDER BY a.id DESC LIMIT 500`, params);
  res.json({ ok: true, data: rows });
});

// ---------- Notifications ----------
router.get('/notifications', requireAuth, (req, res) => {
  const rows = all(`SELECT * FROM notifications WHERE user_id = ? AND is_archived = 0 ORDER BY id DESC LIMIT 100`, [req.user.id]);
  res.json({ ok: true, data: rows, unread: rows.filter((r) => !r.is_read).length });
});
router.post('/notifications/read', requireAuth, (req, res) => {
  const { ids, all: markAll } = req.body || {};
  if (markAll) run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
  else if (Array.isArray(ids)) for (const id of ids) run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, req.user.id]);
  res.json({ ok: true });
});
router.post('/notifications/archive', requireAuth, (req, res) => {
  const { ids } = req.body || {};
  if (Array.isArray(ids)) for (const id of ids) run(`UPDATE notifications SET is_archived = 1 WHERE id = ? AND user_id = ?`, [id, req.user.id]);
  res.json({ ok: true });
});
router.post('/notifications', requireAuth, requirePermission('notifications', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO notifications (org_id, user_id, title, body, type, link, is_important) VALUES (1,?,?,?,?,?,?)`,
    [b.user_id, b.title, b.body || '', b.type || 'info', b.link || null, b.is_important ? 1 : 0]);
  res.json({ ok: true, id: info.lastInsertRowid });
});

// ---------- Global search ----------
router.get('/search', requireAuth, (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const limit = 6;
  const sc = isOrgLevel(req.user) ? '' : (req.user.school_id ? ` AND school_id = ${req.user.school_id}` : ' AND 0');
  const results = {
    students: all(`SELECT id, name, student_id, roll_no, school_id, current_class_id FROM students WHERE (name LIKE ? OR student_id LIKE ? OR admission_no LIKE ? OR roll_no LIKE ?) ${sc} LIMIT ?`, [q, q, q, q, limit]),
    teachers: all(`SELECT id, name, employee_id, designation, school_id FROM staff WHERE (name LIKE ? OR employee_id LIKE ?) ${sc} LIMIT ?`, [q, q, limit]),
    schools: isOrgLevel(req.user) ? all(`SELECT id, name, code FROM schools WHERE name LIKE ? OR code LIKE ? LIMIT ?`, [q, q, limit]) : [],
    classes: all(`SELECT id, name FROM classes WHERE name LIKE ? LIMIT ?`, [q, limit]),
    results: all(`SELECT r.id, st.name, r.percentage, r.grade FROM results r JOIN students st ON st.id = r.student_id WHERE st.name LIKE ? LIMIT ?`, [q, limit]),
    notices: all(`SELECT id, title, category FROM notices WHERE title LIKE ? LIMIT ?`, [q, limit]),
    books: all(`SELECT id, title, author FROM books WHERE title LIKE ? OR author LIKE ? LIMIT ?`, [q, q, limit]),
    documents: all(`SELECT id, name, doc_type FROM documents WHERE name LIKE ? LIMIT ?`, [q, limit]),
  };
  res.json({ ok: true, data: results });
});

// ---------- Dashboard ----------
router.get('/dashboard', requireAuth, (req, res) => {
  const u = req.user;
  const orgLevel = isOrgLevel(u);
  const schoolFilter = orgLevel ? '' : (u.school_id ? ` WHERE school_id = ${u.school_id}` : ' WHERE 0');
  const scId = u.school_id || null;
  const data = {
    schools: orgLevel ? one(`SELECT COUNT(*) c FROM schools`).c : (scId ? 1 : 0),
    active_schools: orgLevel ? one(`SELECT COUNT(*) c FROM schools WHERE status='active'`).c : (scId ? 1 : 0),
    students: one(`SELECT COUNT(*) c FROM students ${schoolFilter}`).c,
    teachers: one(`SELECT COUNT(*) c FROM staff ${schoolFilter}`).c,
    staff: one(`SELECT COUNT(*) c FROM staff ${schoolFilter}`).c,
    today_attendance: one(`SELECT COUNT(*) c FROM attendance WHERE date = date('now') AND status='present' ${scId ? `AND school_id=${scId}` : ''}`).c,
    attendance_total: one(`SELECT COUNT(*) c FROM attendance WHERE date = date('now') ${scId ? `AND school_id=${scId}` : ''}`).c,
    pending_fees: one(`SELECT COALESCE(SUM(amount - paid),0) c FROM fee_assignments fa JOIN students st ON st.id = fa.student_id WHERE fa.status IN ('pending','partial') ${scId ? `AND st.school_id=${scId}` : ''}`).c,
    exams: one(`SELECT COUNT(*) c FROM exams`).c,
    results: one(`SELECT COUNT(*) c FROM results`).c,
    notices: one(`SELECT COUNT(*) c FROM notices WHERE status='published'`).c,
  };
  res.json({ ok: true, data });
});

export default router;
