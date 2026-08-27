import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'aseca-dev-secret-change-me';

export interface AuthedRequest extends Request {
  user?: { id: number; name: string; email: string; role: string; school_id: number | null };
}

export function signToken(user: any) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, school_id: user.school_id },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

const WRITE_ROLES = ['super_admin', 'admin', 'principal'];
export function requireWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!WRITE_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to perform this action' });
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

export function logAction(req: AuthedRequest, action: string, entity: string, detail: string) {
  try {
    const { db } = require('./db');
    db.prepare(`INSERT INTO audit_logs (user_id,username,action,entity,detail) VALUES (?,?,?,?,?)`)
      .run(req.user?.id || null, req.user?.email || 'anonymous', action, entity, detail.slice(0, 500));
  } catch { /* logging is best-effort */ }
}
