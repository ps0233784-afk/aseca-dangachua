import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { db } from '../db';
import { generateId } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string; schoolId: string | null };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = verifyToken(token);
    const user = db.prepare('SELECT id, status FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user || user.status !== 'active') return res.status(401).json({ error: 'Invalid or inactive session' });

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role, schoolId: decoded.schoolId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

export function requireWrite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const writeRoles = ['super_admin', 'org_admin', 'school_admin', 'principal', 'teacher'];
  if (!writeRoles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
}

export function requireSchoolAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (['super_admin', 'org_admin'].includes(req.user.role)) return next();
  next();
}

export function auditLog(userId: string | undefined, username: string | undefined, action: string, entity: string, detail?: string) {
  try {
    db.prepare('INSERT INTO audit_logs (id, user_id, username, action, entity, detail) VALUES (?, ?, ?, ?, ?, ?)').run(
      generateId(), userId || null, username || 'anonymous', action, entity, detail?.slice(0, 500) || ''
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}
