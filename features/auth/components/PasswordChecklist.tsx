'use client';

interface PasswordCheck {
  label: string;
  passed: boolean;
}

export function getPasswordChecks(password: string, confirmPassword: string): PasswordCheck[] {
  return [
    { label: 'Ít nhất 8 ký tự', passed: password.length >= 8 },
    { label: 'Có ít nhất 1 chữ hoa', passed: /[A-Z]/.test(password) },
    { label: 'Có ít nhất 1 chữ thường', passed: /[a-z]/.test(password) },
    { label: 'Có ít nhất 1 số', passed: /[0-9]/.test(password) },
    { label: 'Có ít nhất 1 ký tự đặc biệt', passed: /[^A-Za-z0-9]/.test(password) },
    {
      label: 'Mật khẩu xác nhận khớp',
      passed: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
}

export function isPasswordChecklistValid(password: string, confirmPassword: string): boolean {
  return getPasswordChecks(password, confirmPassword).every((c) => c.passed);
}

interface PasswordChecklistProps {
  password: string;
  confirmPassword: string;
}

export function PasswordChecklist({ password, confirmPassword }: PasswordChecklistProps) {
  const checks = getPasswordChecks(password, confirmPassword);
  return (
    <div className="rounded-xl border border-border/80 bg-muted/25 px-3 py-2">
      <p className="mb-1 text-xs font-medium text-muted-foreground">Yêu cầu mật khẩu</p>
      <ul className="space-y-1 text-xs">
        {checks.map((item) => (
          <li
            key={item.label}
            className={item.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}
          >
            <span aria-hidden>{item.passed ? '✓' : '•'}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
