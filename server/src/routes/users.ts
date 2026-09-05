import { Router } from 'express';
import { db, generateId } from '../db';
import { hashPassword } from '../lib/auth';
import { AuthenticatedRequest, requireAuth, requireRole, auditLog } from '../middleware/auth';

const router = Router();

router.get('/users', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, school_id, phone, status, last_login_at, created_at FROM users ORDER BY created_at DESC').all();
    res.json((users as any[]).map((u) => ({ ...u, schoolId: u.school_id, lastLoginAt: u.last_login_at })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, password, role, schoolId, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const id = generateId();
    db.prepare('INSERT INTO users (id, name, email, password_hash, role, school_id, phone) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, name, email.toLowerCase().trim(), hashPassword(password), role || 'viewer', schoolId || null, phone || ''
    );

    auditLog(req.user?.id, req.user?.email, 'CREATE', 'users', `${email} as ${role || 'viewer'}`);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (req: AuthenticatedRequest, res) => {
  try {
    const { name, role, schoolId, phone, status, password } = req.body;
    if (password && password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    if (password) {
      db.prepare("UPDATE users SET name=?, role=?, school_id=?, phone=?, status=?, password_hash=?, updated_at=datetime('now') WHERE id=?").run(
        name, role, schoolId || null, phone || '', status || 'active', hashPassword(password), req.params.id
      );
    } else {
      db.prepare("UPDATE users SET name=?, role=?, school_id=?, phone=?, status=?, updated_at=datetime('now') WHERE id=?").run(
        name, role, schoolId || null, phone || '', status || 'active', req.params.id
      );
    }

    auditLog(req.user?.id, req.user?.email, 'UPDATE', 'users', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req: AuthenticatedRequest, res) => {
  try {
    if (req.params.id === req.user?.id) return res.status(400).json({ error: 'Cannot delete your own account' });
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    auditLog(req.user?.id, req.user?.email, 'DELETE', 'users', `id ${req.params.id}`);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/audit-logs', requireAuth, requireRole('super_admin', 'org_admin', 'school_admin'), (_req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200').all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
