import type { ReactNode } from 'react';

type AuthAlertVariant = 'error' | 'success' | 'info';

const VARIANT_CLASSES: Record<AuthAlertVariant, string> = {
  error:
    'rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
  success: 'rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary',
  info: 'rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground',
};

interface AuthAlertProps {
  variant: AuthAlertVariant;
  children: ReactNode;
}

export function AuthAlert({ variant, children }: AuthAlertProps) {
  const role = variant === 'error' ? 'alert' : 'status';
  return (
    <p role={role} className={VARIANT_CLASSES[variant]}>
      {children}
    </p>
  );
}
