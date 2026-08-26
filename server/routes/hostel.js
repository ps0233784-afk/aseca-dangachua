import { Router } from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, requirePermission, audit } from '../middleware.js';
import { ok, fail, parseIntSafe } from './_util.js';

const router = Router();

router.get('/hostels', requireAuth, (req, res) => {
  const hostels = all(`SELECT h.*, sc.name AS school_name,
      (SELECT COUNT(*) FROM hostel_rooms hr WHERE hr.hostel_id = h.id) AS room_count,
      (SELECT COUNT(*) FROM hostel_allocations ha WHERE ha.hostel_id = h.id AND ha.status='active') AS occupied
    FROM hostels h LEFT JOIN schools sc ON sc.id = h.school_id ORDER BY h.name`);
  res.json({ ok: true, data: hostels });
});
router.post('/hostels', requireAuth, requirePermission('hostel', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO hostels (org_id, school_id, name, type, address, warden_id, total_rooms, total_beds) VALUES (1,?,?,?,?,?,?,?)`,
    [parseIntSafe(b.school_id), b.name, b.type || 'boys', b.address || null, parseIntSafe(b.warden_id), parseIntSafe(b.total_rooms, 0), parseIntSafe(b.total_beds, 0)]);
  audit(req.user, 'create_hostel', 'hostel', info.lastInsertRowid, { name: b.name }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.put('/hostels/:id', requireAuth, requirePermission('hostel', 'update'), (req, res) => {
  const b = req.body || {};
  run(`UPDATE hostels SET name=?, type=?, address=?, warden_id=?, total_rooms=?, total_beds=? WHERE id=?`,
    [b.name, b.type, b.address, parseIntSafe(b.warden_id), parseIntSafe(b.total_rooms, 0), parseIntSafe(b.total_beds, 0), req.params.id]);
  res.json({ ok: true });
});
router.delete('/hostels/:id', requireAuth, requirePermission('hostel', 'delete'), (req, res) => {
  run(`DELETE FROM hostels WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

router.get('/hostels/:id/rooms', requireAuth, (req, res) => {
  const rooms = all(`SELECT hr.*,
      (SELECT COUNT(*) FROM hostel_allocations ha WHERE ha.room_id = hr.id AND ha.status='active') AS occupied,
      (SELECT GROUP_CONCAT(st.name, ', ') FROM hostel_allocations ha JOIN students st ON st.id = ha.student_id WHERE ha.room_id = hr.id AND ha.status='active') AS occupants
    FROM hostel_rooms hr WHERE hr.hostel_id = ? ORDER BY hr.room_no`, [req.params.id]);
  res.json({ ok: true, data: rooms });
});
router.post('/hostels/:id/rooms', requireAuth, requirePermission('hostel', 'create'), (req, res) => {
  const b = req.body || {};
  const info = run(`INSERT INTO hostel_rooms (hostel_id, room_no, beds) VALUES (?,?,?)`, [req.params.id, b.room_no, parseIntSafe(b.beds, 4)]);
  res.json({ ok: true, id: info.lastInsertRowid });
});

router.get('/hostel/allocations', requireAuth, (req, res) => {
  const rows = all(`SELECT ha.*, st.name AS student_name, st.student_id AS sid, h.name AS hostel_name, hr.room_no
    FROM hostel_allocations ha
    JOIN students st ON st.id = ha.student_id
    JOIN hostels h ON h.id = ha.hostel_id
    JOIN hostel_rooms hr ON hr.id = ha.room_id
    ORDER BY ha.id DESC LIMIT 1000`);
  res.json({ ok: true, data: rows });
});
router.post('/hostel/allocations', requireAuth, requirePermission('hostel', 'create'), (req, res) => {
  const b = req.body || {};
  const room = one(`SELECT * FROM hostel_rooms WHERE id = ?`, [b.room_id]);
  if (!room) return fail(res, 404, 'Room not found');
  const occupied = one(`SELECT COUNT(*) c FROM hostel_allocations WHERE room_id = ? AND status='active'`, [room.id]).c;
  if (occupied >= room.beds) return fail(res, 400, 'Room is full');
  const info = run(`INSERT INTO hostel_allocations (org_id, hostel_id, room_id, student_id, from_date, to_date, fee, status)
    VALUES (1,?,?,?,?,?,?,?)`, [room.hostel_id, b.room_id, b.student_id, b.from_date || null, b.to_date || null, b.fee || 0, 'active']);
  audit(req.user, 'allocate_hostel', 'hostel_allocation', info.lastInsertRowid, { student_id: b.student_id }, req.ip);
  res.json({ ok: true, id: info.lastInsertRowid });
});
router.post('/hostel/allocations/:id/vacate', requireAuth, requirePermission('hostel', 'update'), (req, res) => {
  run(`UPDATE hostel_allocations SET status='vacated', to_date = date('now') WHERE id = ?`, [req.params.id]);
  res.json({ ok: true });
});

router.get('/hostel/stats', requireAuth, (req, res) => {
  const totalBeds = one(`SELECT COALESCE(SUM(total_beds),0) c FROM hostels`).c;
  const occupied = one(`SELECT COUNT(*) c FROM hostel_allocations WHERE status='active'`).c;
  res.json({ ok: true, data: { total: totalBeds, occupied, available: totalBeds - occupied } });
});

export default router;
