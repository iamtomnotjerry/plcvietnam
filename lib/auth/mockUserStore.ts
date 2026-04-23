/**
 * In-memory mock user store (seed from JSON + runtime registrations).
 * For development/demo only — replace with DB in production.
 */

import usersSeed from '@/public/mock-data/users.json';
import { hashPassword } from './password';

export type MockUserRole = 'reader' | 'editor' | 'admin';

export interface MockUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: MockUserRole;
}

const seed: MockUserRecord[] = usersSeed.map((u) => ({
  id: u.id,
  email: u.email.toLowerCase(),
  name: u.name,
  passwordHash: u.passwordHash,
  role: u.role as MockUserRole,
}));

const runtimeUsers: MockUserRecord[] = [...seed];

export function findMockUserByEmail(email: string): MockUserRecord | undefined {
  const e = email.trim().toLowerCase();
  return runtimeUsers.find(u => u.email === e);
}

export function verifyMockPassword(user: MockUserRecord, password: string): boolean {
  return user.passwordHash === hashPassword(user.email, password);
}

export function updateMockUserPassword(email: string, newPassword: string): void {
  const e = email.trim().toLowerCase();
  const user = runtimeUsers.find(u => u.email === e);
  if (!user) throw new Error('USER_NOT_FOUND');
  user.passwordHash = hashPassword(user.email, newPassword);
}

export function registerMockUser(input: {
  email: string;
  password: string;
  name: string;
}): MockUserRecord {
  const email = input.email.trim().toLowerCase();
  if (findMockUserByEmail(email)) {
    throw new Error('EMAIL_TAKEN');
  }
  const id = `mock-user-${Date.now()}`;
  const user: MockUserRecord = {
    id,
    email,
    name: input.name.trim() || email.split('@')[0],
    passwordHash: hashPassword(email, input.password),
    role: 'reader',
  };
  runtimeUsers.push(user);
  return user;
}
