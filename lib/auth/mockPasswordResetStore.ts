/**
 * In-memory reset tokens . Dev-only token echo in API response.
 */

import { randomBytes } from 'crypto';

export interface MockResetTokenRecord {
  email: string;
  expiresAt: number;
}

const tokenToRecord = new Map<string, MockResetTokenRecord>();

const TTL_MS = 60 * 60 * 1000; // 1 hour

export function createMockPasswordResetToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const token = randomBytes(32).toString('hex');
  tokenToRecord.set(token, {
    email: normalized,
    expiresAt: Date.now() + TTL_MS,
  });
  return token;
}

export function consumeMockPasswordResetToken(token: string): string | null {
  const rec = tokenToRecord.get(token);
  if (!rec) return null;
  tokenToRecord.delete(token);
  if (Date.now() > rec.expiresAt) return null;
  return rec.email;
}
