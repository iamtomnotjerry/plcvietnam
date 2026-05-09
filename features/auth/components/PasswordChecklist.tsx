'use client';

import { useTranslations } from 'next-intl';

export type PasswordCheckId =
  | 'minLength'
  | 'upperCase'
  | 'lowerCase'
  | 'digit'
  | 'special'
  | 'confirmMatch';

export interface PasswordCheckResult {
  id: PasswordCheckId;
  passed: boolean;
}

export function getPasswordCheckResults(
  password: string,
  confirmPassword: string
): PasswordCheckResult[] {
  return [
    { id: 'minLength', passed: password.length >= 8 },
    { id: 'upperCase', passed: /[A-Z]/.test(password) },
    { id: 'lowerCase', passed: /[a-z]/.test(password) },
    { id: 'digit', passed: /[0-9]/.test(password) },
    { id: 'special', passed: /[^A-Za-z0-9]/.test(password) },
    {
      id: 'confirmMatch',
      passed: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
}

export function isPasswordChecklistValid(password: string, confirmPassword: string): boolean {
  return getPasswordCheckResults(password, confirmPassword).every((c) => c.passed);
}

interface PasswordChecklistProps {
  password: string;
  confirmPassword: string;
}

export function PasswordChecklist({ password, confirmPassword }: PasswordChecklistProps) {
  const t = useTranslations('auth.passwordChecklist');
  const checks = getPasswordCheckResults(password, confirmPassword);
  return (
    <div className="rounded-xl border border-border/80 bg-muted/25 px-3 py-2">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{t('title')}</p>
      <ul className="space-y-1 text-xs">
        {checks.map((item) => (
          <li
            key={item.id}
            className={item.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}
          >
            <span aria-hidden>{item.passed ? '✓' : '•'}</span> {t(item.id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
