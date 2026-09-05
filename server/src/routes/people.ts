import { Router } from 'express';
import { db, generateId } from '../db';
import { AuthenticatedRequest, requireAuth, requireSchoolAccess, requireWrite, auditLog } from '../middleware/auth';

const router = Router();

// Teachers
router.get('/teachers', requireAuth, requireSchoolAccess, (req, res) => {
  try {
    const { schoolId } = req.query;
    let sql = "SELECT * FROM teachers WHERE status = 'active'";
    const args: any[] = [];
    if (schoolId) { sql += ' AND school_id = ?'; args.push(schoolId); }
    sql += ' ORDER BY name';
    res.json(db.prepare(sql).all(...args));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.post('/teachers', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.schoolId) return res.status(400).json({ error: 'Name and school are required' });
    if (!['super_admin', 'org_admin'].includes(req.user?.role || '') && b.schoolId !== req.user?.schoolId) return res.status(403).json({ error: 'You can only manage your assigned school' });
    const id = generateId();
    db.prepare(`INSERT INTO teachers (id, school_id, employee_id, name, photo, dob, gender, qualification, subject_spec, designation, joining_date, phone, email, address, aadhaar, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, b.schoolId, b.employeeId || null, b.name, b.photo || '', b.dob || '', b.gender || '', b.qualification || '',
      b.subjectSpec || '', b.designation || 'Teacher', b.joiningDate || '', b.phone || '', b.email || '', b.address || '', b.aadhaar || '', b.status || 'active'
    );
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'teachers', `${b.name} (id ${id})`);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

router.put('/teachers/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!['super_admin', 'org_admin'].includes(req.user?.role || '') && b.schoolId !== req.user?.schoolId) return res.status(403).json({ error: 'You can only manage your assigned school' });
    db.prepare(`UPDATE teachers SET school_id=?, employee_id=?, name=?, photo=?, dob=?, gender=?, qualification=?, subject_spec=?, designation=?, joining_date=?, phone=?, email=?, address=?, aadhaar=?, status=?, updated_at=datetime('now') WHERE id=?`).run(
      b.schoolId, b.employeeId || null, b.name, b.photo || '', b.dob || '', b.gender || '', b.qualification || '', b.subjectSpec || '', b.designation || '', b.joiningDate || '', b.phone || '', b.email || '', b.address || '', b.aadhaar || '', b.status || 'active', req.params.id
    );
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'teachers', `${b.name} (id ${req.params.id})`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

router.delete('/teachers/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
    auditLog(req.user?.id, req.user?.email, 'DELETE', 'teachers', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// Staff
router.get('/staff', requireAuth, requireSchoolAccess, (req, res) => {
  try {
    const { schoolId } = req.query;
    let sql = "SELECT * FROM staff_members WHERE status = 'active'";
    const args: any[] = [];
    if (schoolId) { sql += ' AND school_id = ?'; args.push(schoolId); }
    sql += ' ORDER BY name';
    res.json(db.prepare(sql).all(...args));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post('/staff', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.schoolId) return res.status(400).json({ error: 'Name and school are required' });
    if (!['super_admin', 'org_admin'].includes(req.user?.role || '') && b.schoolId !== req.user?.schoolId) return res.status(403).json({ error: 'You can only manage your assigned school' });
    const id = generateId();
    db.prepare('INSERT INTO staff_members (id, school_id, name, designation, phone, join_date, duties, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, b.schoolId, b.name, b.designation || '', b.phone || '', b.joinDate || '', b.duties || '', b.status || 'active'
    );
    auditLog(req.user?.id, req.user?.email, 'CREATE', 'staff', `${b.name} (id ${id})`);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

router.put('/staff/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!['super_admin', 'org_admin'].includes(req.user?.role || '') && b.schoolId !== req.user?.schoolId) return res.status(403).json({ error: 'You can only manage your assigned school' });
    db.prepare(`UPDATE staff_members SET school_id=?, name=?, designation=?, phone=?, join_date=?, duties=?, status=?, updated_at=datetime('now') WHERE id=?`).run(
      b.schoolId, b.name, b.designation || '', b.phone || '', b.joinDate || '', b.duties || '', b.status || 'active', req.params.id
    );
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'staff', `${b.name} (id ${req.params.id})`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

router.delete('/staff/:id', requireAuth, requireWrite, (req: AuthenticatedRequest, res) => {
  try {
    db.prepare('DELETE FROM staff_members WHERE id = ?').run(req.params.id);
    auditLog(req.user?.id, req.user?.email, 'DELETE', 'staff', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

export default router;
