import { Router } from 'express';
import { db, generateId } from '../db';
import { signToken, hashPassword, comparePassword } from '../lib/auth';
import { AuthenticatedRequest, requireAuth, auditLog } from '../middleware/auth';

const router = Router();

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND status = ?').get(email.toLowerCase().trim(), 'active') as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!comparePassword(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, role: user.role, schoolId: user.school_id });
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);
    auditLog(user.id, user.email, 'LOGIN', 'auth', user.email);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, schoolId: user.school_id, phone: user.phone, photo: user.photo },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, school_id, phone, photo, last_login_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, schoolId: user.school_id, phone: user.phone, photo: user.photo, lastLoginAt: user.last_login_at });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!comparePassword(currentPassword, user.password_hash)) return res.status(401).json({ error: 'Current password is incorrect' });

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), user.id);
    auditLog(user.id, user.email, 'CHANGE_PASSWORD', 'auth');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
