import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit } from '../middleware.js';
import { ok, fail, parseIntSafe, jsonOrNull } from './_util.js';

const router = Router();

// ---------- Notices ----------
router.get('/notices', requireAuth, (req, res) => {
  const clauses = []; const params = [];
  if (req.query.status && req.query.status !== 'all') { clauses.push('status = ?'); params.push(req.query.status); }
  if (req.query.category) { clauses.push('category = ?'); params.push(req.query.category); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const rows = all(`SELECT n.*, u.name AS created_by_name FROM notices n LEFT JOIN users u ON u.id = n.created_by ${where} ORDER BY n.id DESC LIMIT 500`, params);
  res.json({ ok: true, data: rows });
});
router.post('/notices', requireAuth, requirePermission('notices', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.title) return fail(res, 400, 'Title required');
  const info = run(`INSERT INTO notices (org_id, title, body, category, target_type, target_ids, attachment, priority, status, publish_at, expire_at, created_by)
    VALUES (1,?,?,?,?,?,?,?,?,?,?,?)`,
    [b.title, b.body || '', b.category || 'General', b.target_type || 'all', jsonOrNull(b.target_ids), b.attachment || null,
     b.priority || 'normal', b.status || 'draft', b.publish_at || null, b.expire_at || null, req.user.id]);
  audit(req.user, 'create_notice', 'notice', info.lastInsertRowid, { title: b.title }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/notices/:id', requireAuth, requirePermission('notices', 'update'), (req, res) => {
  const b = req.body || {};
  const fields = ['title','body','category','target_type','target_ids','attachment','priority','status','publish_at','expire_at'];
  const sets = []; const params = [];
  for (const f of fields) if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(f === 'target_ids' ? jsonOrNull(b[f]) : b[f]); }
  if (!sets.length) return res.json({ ok: true });
  sets.push(`updated_at = datetime('now')`);
  params.push(req.params.id);
  run(`UPDATE notices SET ${sets.join(', ')} WHERE id = ?`, params);
  audit(req.user, 'update_notice', 'notice', req.params.id, {}, req.ip);
  res.json({ ok: true });
});
router.delete('/notices/:id', requireAuth, requirePermission('notices', 'delete'), (req, res) => {
  run(`DELETE FROM notices WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Events ----------
router.get('/events', requireAuth, (req, res) => {
  const rows = all(`SELECT * FROM events ORDER BY event_date DESC LIMIT 500`);
  res.json({ ok: true, data: rows });
});
router.post('/events', requireAuth, requirePermission('events', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.event_date) return fail(res, 400, 'Title and date required');
  const info = run(`INSERT INTO events (org_id, title, description, category, event_date, start_time, end_time, venue, image, status, created_by)
    VALUES (1,?,?,?,?,?,?,?,?,?,?)`,
    [b.title, b.description || '', b.category || 'Cultural', b.event_date, b.start_time || null, b.end_time || null, b.venue || null, b.image || null, b.status || 'published', req.user.id]);
  audit(req.user, 'create_event', 'event', info.lastInsertRowid, { title: b.title }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/events/:id', requireAuth, requirePermission('events', 'update'), (req, res) => {
  const b = req.body || {};
  const fields = ['title','description','category','event_date','start_time','end_time','venue','image','status'];
  const sets = []; const params = [];
  for (const f of fields) if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  run(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});
router.delete('/events/:id', requireAuth, requirePermission('events', 'delete'), (req, res) => {
  run(`DELETE FROM events WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Managing Body ----------
router.get('/managing-body', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM managing_body ORDER BY order_index`) });
});
router.post('/managing-body', requireAuth, requirePermission('managing_body', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO managing_body (org_id, name, designation, photo, bio, order_index, status) VALUES (1,?,?,?,?,?,?)`,
    [b.name, b.designation, b.photo || null, b.bio || '', parseIntSafe(b.order_index, 0), b.status || 'active']);
  audit(req.user, 'create_managing_member', 'managing_body', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/managing-body/:id', requireAuth, requirePermission('managing_body', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE managing_body SET name=?, designation=?, photo=?, bio=?, order_index=?, status=? WHERE id=?`,
    [b.name, b.designation, b.photo, b.bio ?? '', parseIntSafe(b.order_index, 0), b.status, req.params.id]);
  res.json({ ok: true });
});
router.delete('/managing-body/:id', requireAuth, requirePermission('managing_body', 'delete'), (req, res) => {
  run(`DELETE FROM managing_body WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Culture content ----------
router.get('/culture-content', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM culture_content ORDER BY id`) });
});
router.put('/culture-content/:key', requireAuth, requirePermission('culture', 'update'), (req, res) => {
  const b = req.body || {};
  run(`INSERT INTO culture_content (org_id, section_key, title, body, image, updated_at) VALUES (1,?,?,?,?,datetime('now'))
    ON CONFLICT(section_key) DO UPDATE SET title=excluded.title, body=excluded.body, image=excluded.image, updated_at=datetime('now')`,
    [req.params.key, b.title, b.body ?? '', b.image || null]);
  audit(req.user, 'update_culture_content', 'culture_content', null, { key: req.params.key }, req.ip);
  res.json({ ok: true });
});

// ---------- Achievements ----------
router.get('/achievements', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT * FROM achievements ORDER BY achievement_date DESC`) });
});
router.post('/achievements', requireAuth, requirePermission('achievements', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO achievements (org_id, title, description, category, image, achievement_date, is_public) VALUES (1,?,?,?,?,?,?)`,
    [b.title, b.description || '', b.category || 'Academic', b.image || null, b.achievement_date || null, b.is_public ? 1 : 0]);
  audit(req.user, 'create_achievement', 'achievement', info.lastInsertRowid, { title: b.title }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/achievements/:id', requireAuth, requirePermission('achievements', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE achievements SET title=?, description=?, category=?, image=?, achievement_date=?, is_public=? WHERE id=?`,
    [b.title, b.description ?? '', b.category, b.image || null, b.achievement_date || null, b.is_public ? 1 : 0, req.params.id]);
  res.json({ ok: true });
});
router.delete('/achievements/:id', requireAuth, requirePermission('achievements', 'delete'), (req, res) => {
  run(`DELETE FROM achievements WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

// ---------- Gallery / Albums ----------
router.get('/albums', requireAuth, (req, res) => {
  res.json({ ok: true, data: all(`SELECT a.*, (SELECT COUNT(*) FROM gallery g WHERE g.album_id = a.id) AS photo_count FROM albums a ORDER BY a.id`) });
});
router.post('/albums', requireAuth, requirePermission('gallery', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO albums (org_id, name, cover, description) VALUES (1,?,?,?)`, [b.name, b.cover || null, b.description || '']);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.get('/gallery', requireAuth, (req, res) => {
  const clauses = []; const params = [];
  if (req.query.album_id) { clauses.push('album_id = ?'); params.push(req.query.album_id); }
  if (req.query.category) { clauses.push('category = ?'); params.push(req.query.category); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  res.json({ ok: true, data: all(`SELECT g.*, a.name AS album_name FROM gallery g LEFT JOIN albums a ON a.id = g.album_id ${where} ORDER BY g.id DESC LIMIT 500`, params) });
});
router.post('/gallery', requireAuth, requirePermission('gallery', 'create'), (req, res) => {
  const b = req.body || {};
  if (!b.image) return fail(res, 400, 'Image required');
  const info = run(`INSERT INTO gallery (org_id, album_id, title, image, category, caption, is_public) VALUES (1,?,?,?,?,?,?)`,
    [parseIntSafe(b.album_id), b.title || '', b.image, b.category || 'school', b.caption || '', b.is_public ? 1 : 0]);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.delete('/gallery/:id', requireAuth, requirePermission('gallery', 'delete'), (req, res) => {
  run(`DELETE FROM gallery WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
