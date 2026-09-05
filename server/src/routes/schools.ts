import { Router } from 'express';
import { db, generateId } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole, auditLog } from '../middleware/auth';

const router = Router();

router.get('/schools', (_req, res) => {
  try {
    const schools = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id AND st.status = 'active') student_count,
        (SELECT COUNT(*) FROM teachers t WHERE t.school_id = s.id AND t.status = 'active') teacher_count,
        (SELECT COUNT(*) FROM smc_members m WHERE m.school_id = s.id) smc_count
      FROM schools s ORDER BY s.name
    `).all();
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

router.get('/schools/:id', (req, res) => {
  try {
    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id) as any;
    if (!school) return res.status(404).json({ error: 'School not found' });
    school.smc = db.prepare('SELECT * FROM smc_members WHERE school_id = ? ORDER BY display_order').all(school.id);
    res.json(school);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

router.post('/schools', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.code) return res.status(400).json({ error: 'Name and code are required' });

    let org = db.prepare('SELECT id FROM organization LIMIT 1').get() as any;
    if (!org) {
      const orgId = generateId();
      db.prepare('INSERT INTO organization (id, name, tagline) VALUES (?, ?, ?)').run(orgId, 'BRANCH ASECA DANGACHUA', 'Education • Culture • Community');
      org = { id: orgId };
    }

    const id = generateId();
    db.prepare(`INSERT INTO schools
      (id, organization_id, code, name, ol_chiki_name, village, po, ps, block, district, pin, state, phone, email, principal, established_year, type, medium, affiliation_no, affiliation_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, org.id, b.code, b.name, b.olChikiName || '', b.village || '', b.po || '', b.ps || '', b.block || '', b.district || '',
      b.pin || '', b.state || 'Odisha', b.phone || '', b.email || '', b.principal || '', b.establishedYear || null,
      b.type || 'Ol-Itun Ashra', b.medium || 'Santali', b.affiliationNo || '', b.affiliationDate || '', b.status || 'active'
    );

    auditLog(req.user?.id, req.user?.email, 'CREATE', 'schools', `${b.name} (id ${id})`);
    res.json({ id });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) return res.status(400).json({ error: 'School code already exists' });
    res.status(500).json({ error: 'Failed to create school' });
  }
});

router.put('/schools/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const b = req.body;
    db.prepare(`UPDATE schools SET code=?, name=?, ol_chiki_name=?, village=?, po=?, ps=?, block=?, district=?, pin=?, state=?, phone=?, email=?, principal=?, established_year=?, type=?, medium=?, affiliation_no=?, affiliation_date=?, status=?, updated_at=datetime('now') WHERE id=?`).run(
      b.code, b.name, b.olChikiName || '', b.village || '', b.po || '', b.ps || '', b.block || '', b.district || '',
      b.pin || '', b.state || 'Odisha', b.phone || '', b.email || '', b.principal || '', b.establishedYear || null,
      b.type || 'Ol-Itun Ashra', b.medium || 'Santali', b.affiliationNo || '', b.affiliationDate || '', b.status || 'active', req.params.id
    );
    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'schools', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update school' });
  }
});

router.delete('/schools/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try {
    db.prepare('DELETE FROM schools WHERE id = ?').run(req.params.id);
    auditLog(req.user?.id, req.user?.email, 'DELETE', 'schools', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

router.get('/organization', (_req, res) => {
  try {
    const org = db.prepare('SELECT * FROM organization LIMIT 1').get();
    res.json(org || { name: 'BRANCH ASECA DANGACHUA', tagline: 'Education • Culture • Community' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

export default router;
