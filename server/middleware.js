import { verifyToken, loadUserById, hasPermission, touchSession } from './auth.js';
import { one, run } from './db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Session expired or invalid' });
  const user = loadUserById(payload.sub);
  if (!user || user.status !== 'active') return res.status(401).json({ error: 'Account inactive' });
  touchSession(token);
  req.user = user;
  req.token = token;
  next();
}

export function requirePermission(module, action = 'view') {
  return (req, res, next) => {
    if (!hasPermission(req.user, module, action)) {
      return res.status(403).json({ error: `You do not have permission to ${action} ${module}` });
    }
    next();
  };
}

// Restrict queries to the user's accessible schools.
// Returns { where, params } for appending to a query, or null if org-wide.
export function schoolScope(req, column = 'school_id') {
  const u = req.user;
  if (!u) return { where: '', params: [] };
  if (['super_admin', 'org_admin'].includes(u.role_key)) {
    return { where: '', params: [] };
  }
  if (u.school_id) {
    return { where: ` AND ${column} = ?`, params: [u.school_id] };
  }
  return { where: '', params: [] };
}

export function isOrgLevel(user) {
  return ['super_admin', 'org_admin'].includes(user.role_key);
}

export function audit(user, action, entityType, entityId, details = {}, ip = null) {
  try {
    run(
      `INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, details, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user?.org_id || 1, user?.id || null, action, entityType, entityId || null, JSON.stringify(details), ip]
    );
  } catch (e) {
    console.error('audit failed', e.message);
  }
}

export function safeStudentRow(row) {
  if (!row) return row;
  const { aadhaar, ...safe } = row;
  return safe;
}

export function getSetting(orgId, key, fallback = null) {
  const row = one(`SELECT value FROM settings WHERE org_id = ? AND key = ?`, [orgId || 1, key]);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch { return fallback; }
}
