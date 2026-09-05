import { Router } from 'express';
import crypto from 'crypto';
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

router.post('/auth/forgot-password', (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const generic = { message: 'If the account exists, password reset instructions will be sent through the configured provider.' };
    if (!email) return res.json(generic);
    const user = db.prepare("SELECT id FROM users WHERE email = ? AND status = 'active'").get(email) as any;
    if (!user) return res.json(generic);
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at < datetime('now')").run(user.id);
    db.prepare("INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+30 minutes'))").run(generateId(), user.id, tokenHash);
    // In production an email/SMS provider should consume this token. It is returned only for local demo setup.
    if (process.env.NODE_ENV !== 'production') return res.json({ ...generic, demoResetToken: raw });
    return res.json(generic);
  } catch { return res.json({ message: 'If the account exists, password reset instructions will be sent through the configured provider.' }); }
});

router.post('/auth/reset-password', (req, res) => {
  try {
    const token = String(req.body?.token || ''); const password = String(req.body?.password || '');
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = db.prepare("SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')").get(tokenHash) as any;
    if (!record) return res.status(400).json({ error: 'Reset token is invalid or expired' });
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hashPassword(password), record.user_id);
    db.prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?").run(record.id);
    auditLog(record.user_id, 'password-reset', 'RESET_PASSWORD', 'auth');
    return res.json({ message: 'Password reset successfully' });
  } catch { return res.status(500).json({ error: 'Could not reset password' }); }
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
