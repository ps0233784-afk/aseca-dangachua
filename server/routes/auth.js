import { Router } from 'express';
import { db, all, one, run, now } from '../db.js';
import { hashPassword, verifyPassword, signToken, revokeToken, verifyToken } from '../auth.js';
import { requireAuth, audit, isOrgLevel } from '../middleware.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  const user = one(
    `SELECT u.*, r.key AS role_key, r.name AS role_name, r.permissions AS role_permissions
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.username = ? OR u.email = ?`,
    [username, username]
  );
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.status !== 'active') return res.status(403).json({ error: 'Your account is inactive. Contact the administrator.' });
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const { token, expires } = signToken(user);
  run(`UPDATE users SET last_login = ? WHERE id = ?`, [now(), user.id]);
  run(`UPDATE sessions SET ip = ?, user_agent = ? WHERE token = ?`, [req.ip, req.headers['user-agent'] || '', token]);
  audit(user, 'login', 'user', user.id, {}, req.ip);
  const { password_hash, role_permissions, ...safe } = user;
  const school = user.school_id ? one('SELECT id, name, code FROM schools WHERE id = ?', [user.school_id]) : null;
  res.json({
    ok: true,
    token,
    expires,
    user: { ...safe, school },
  });
});

router.post('/logout', requireAuth, (req, res) => {
  revokeToken(req.token);
  audit(req.user, 'logout', 'user', req.user.id, {}, req.ip);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const { password_hash, role_permissions, ...safe } = req.user;
  const school = req.user.school_id ? one('SELECT id, name, code FROM schools WHERE id = ?', [req.user.school_id]) : null;
  res.json({ ok: true, user: { ...safe, school } });
});

router.get('/sessions', requireAuth, (req, res) => {
  const sessions = all(
    `SELECT id, ip, user_agent, created_at, expires_at, last_active, token,
            (token = ?) AS is_current FROM sessions WHERE user_id = ? ORDER BY last_active DESC`,
    [req.token, req.user.id]
  );
  res.json({ ok: true, data: sessions });
});

router.delete('/sessions/:id', requireAuth, (req, res) => {
  const sess = one(`SELECT * FROM sessions WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
  if (!sess) return res.status(404).json({ error: 'Session not found' });
  run(`DELETE FROM sessions WHERE id = ?`, [req.params.id]);
  audit(req.user, 'revoke_session', 'session', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password || new_password.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  const valid = await verifyPassword(current_password, req.user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
  const hash = await hashPassword(new_password);
  run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);
  audit(req.user, 'change_password', 'user', req.user.id, {}, req.ip);
  res.json({ ok: true });
});

router.put('/profile', requireAuth, (req, res) => {
  const { name, phone, language, theme, avatar } = req.body || {};
  run(`UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
       language = COALESCE(?, language), theme = COALESCE(?, theme), avatar = COALESCE(?, avatar)
       WHERE id = ?`,
    [name ?? null, phone ?? null, language ?? null, theme ?? null, avatar ?? null, req.user.id]);
  audit(req.user, 'update_profile', 'user', req.user.id, { name, phone }, req.ip);
  res.json({ ok: true });
});

// Forgot / reset password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  const user = one(`SELECT * FROM users WHERE email = ?`, [email || '']);
  if (!user) return res.json({ ok: true, message: 'If that email exists, a reset link has been sent.' });
  const token = 'rst_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  run(`INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?,?,?)`,
    [user.id, token, new Date(Date.now() + 3600 * 1000).toISOString()]);
  // In a production deployment this would email the link; here we return it for the demo.
  audit(user, 'request_password_reset', 'user', user.id, {}, req.ip);
  res.json({ ok: true, message: 'Reset link generated.', demoResetToken: token });
});

router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body || {};
  if (!token || !new_password || new_password.length < 6) return res.status(400).json({ error: 'Invalid request' });
  const row = one(`SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')`, [token]);
  if (!row) return res.status(400).json({ error: 'Reset token is invalid or expired' });
  const hash = await hashPassword(new_password);
  run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, row.user_id]);
  run(`UPDATE password_reset_tokens SET used = 1 WHERE id = ?`, [row.id]);
  res.json({ ok: true, message: 'Password reset successfully.' });
});

export default router;
