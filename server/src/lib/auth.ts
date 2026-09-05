import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const JWT_SECRET = process.env.JWT_SECRET || 'aseca-dev-secret-change-me';
export const JWT_EXPIRES = '24h';

export function signToken(payload: { id: string; email: string; role: string; schoolId: string | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; schoolId: string | null };
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function maskAadhaar(aadhaar?: string | null): string {
  if (!aadhaar) return '';
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length < 12) return aadhaar;
  return 'XXXX-XXXX-' + digits.slice(8, 12);
}
