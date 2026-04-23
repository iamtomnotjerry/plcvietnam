import { createHash } from 'crypto';

/** Mock-only password hash (not bcrypt). Salt scheme tied to email. */
export function hashPassword(email: string, password: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash('sha256')
    .update(`${password}:${normalized}:plcvietnam-mock`)
    .digest('hex');
}
