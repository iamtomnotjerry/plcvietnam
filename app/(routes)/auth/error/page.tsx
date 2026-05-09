import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { Suspense } from 'react';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { AuthErrorContent } from '@/features/auth/components/AuthErrorContent';

export const metadata: Metadata = {
  title: 'Lỗi đăng nhập | PLC Việt Nam',
};

export default function AuthErrorPage() {
  return (
    <AuthPageShell variant="auth-error">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/80" />}>
        <AuthErrorContent />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href={'/' as Route} className="text-primary transition-colors hover:underline">
          Về trang chủ
        </Link>
      </p>
    </AuthPageShell>
  );
}
