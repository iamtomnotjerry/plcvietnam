import { describe, expect, it } from 'vitest';
import { CreateBookSchema, UpdatePostSchema } from './schemas';

describe('validation schemas', () => {
  it('accepts post update payload without id in body', () => {
    const parsed = UpdatePostSchema.parse({
      title: 'Updated title',
      slug: 'updated-title',
    });
    expect(parsed.title).toBe('Updated title');
    expect(parsed.slug).toBe('updated-title');
  });

  it('accepts minimal create book payload used by admin route', () => {
    const parsed = CreateBookSchema.parse({
      title: 'Industrial Automation Handbook',
      slug: 'industrial-automation-handbook',
    });
    expect(parsed.title).toBe('Industrial Automation Handbook');
    expect(parsed.slug).toBe('industrial-automation-handbook');
  });
});
