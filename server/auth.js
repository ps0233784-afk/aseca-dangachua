import jwt from 'jsonwebtoken';
import { db, one, run, now } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aseca-dangachua-dev-secret-2026';
const TOKEN_TTL_HOURS = 24 * 7; // 7 days

export function hashPassword(plain) {
  // bcryptjs is imported lazily to keep this module cheap
  return import('bcryptjs').then(({ default: bcrypt }) => bcrypt.hashSync(plain, 10));
}

export function verifyPassword(plain, hash) {
  return import('bcryptjs').then(({ default: bcrypt }) => bcrypt.compareSync(plain, hash));
}

export function signToken(user) {
  const jti = 'jti_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const token = jwt.sign(
    { sub: user.id, role: user.role_key, school_id: user.school_id, org_id: user.org_id, jti },
    JWT_SECRET,
    { expiresIn: `${TOKEN_TTL_HOURS}h` }
  );
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000).toISOString();
  run(
    `INSERT INTO sessions (user_id, token, jti, ip, user_agent, expires_at, last_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, token, jti, null, null, expires, now()]
  );
  return { token, expires };
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function revokeToken(token) {
  run(`DELETE FROM sessions WHERE token = ?`, [token]);
}

export function touchSession(token) {
  run(`UPDATE sessions SET last_active = ? WHERE token = ?`, [now(), token]);
}

export function loadUserById(id) {
  const row = one(
    `SELECT u.*, r.key AS role_key, r.name AS role_name, r.permissions AS role_permissions
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [id]
  );
  return row || null;
}

// ---- Role & permission helpers ----
export const MODULES = [
  'dashboard', 'schools', 'students', 'staff', 'academics', 'attendance',
  'exams', 'results', 'report_cards', 'timetable', 'fees', 'hostel',
  'library', 'notices', 'events', 'gallery', 'documents', 'certificates',
  'id_cards', 'reports', 'users', 'roles', 'settings', 'audit_logs',
  'notifications', 'culture', 'achievements', 'managing_body'
];

export const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export'];

// Parse role permissions from JSON (defaults when missing)
export function rolePermissions(roleKey) {
  const FULL = Object.fromEntries(MODULES.map((m) => [m, [...ACTIONS]]));
  const presets = {
    super_admin: FULL,
    org_admin: FULL,
    school_admin: { ...FULL, roles: [], settings: ['view'], audit_logs: ['view'] },
    principal: preset({}, ['dashboard','schools','students','staff','academics','attendance','exams','results','report_cards','timetable','fees','hostel','library','notices','events','gallery','documents','certificates','id_cards','reports','notifications','culture','achievements','managing_body'], ['view','create','update','delete']),
    teacher: preset({}, ['dashboard','students','attendance','exams','results','report_cards','timetable','notices','events','library','documents','notifications'], ['view','create','update']),
    accountant: preset({}, ['dashboard','students','fees','reports','notices','notifications'], ['view','create','update']),
    librarian: preset({}, ['dashboard','library','students','notices','notifications'], ['view','create','update']),
    staff: preset({}, ['dashboard','students','attendance','notices','documents','notifications'], ['view','create']),
    student: preset({}, ['dashboard','notices','events','timetable','results','documents','library','notifications'], ['view']),
    parent: preset({}, ['dashboard','notices','events','timetable','results','fees','documents','notifications'], ['view']),
  };
  return presets[roleKey] || {};
}

function preset(extra, modules, actions) {
  const p = { ...extra };
  for (const m of modules) p[m] = actions;
  return p;
}

export function hasPermission(user, module, action = 'view') {
  if (!user) return false;
  if (user.role_key === 'super_admin') return true;
  let perms = null;
  try {
    perms = JSON.parse(user.role_permissions || 'null');
  } catch { perms = null; }
  if (!perms) perms = rolePermissions(user.role_key);
  const modPerms = perms[module];
  if (!modPerms) return false;
  if (modPerms.includes('*')) return true;
  return modPerms.includes(action);
}
