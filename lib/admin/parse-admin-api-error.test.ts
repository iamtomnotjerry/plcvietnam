import { describe, expect, it } from 'vitest';
import { messageFromAdminApiErrorBody } from './parse-admin-api-error';

describe('messageFromAdminApiErrorBody', () => {
  it('reads standardized admin API envelope', () => {
    expect(
      messageFromAdminApiErrorBody({ error: { code: 'BAD_REQUEST', message: 'Invalid' } })
    ).toBe('Invalid');
  });

  it('reads legacy string error', () => {
    expect(messageFromAdminApiErrorBody({ error: 'oops' })).toBe('oops');
  });

  it('returns null for empty body', () => {
    expect(messageFromAdminApiErrorBody(null)).toBe(null);
    expect(messageFromAdminApiErrorBody({})).toBe(null);
  });
});
