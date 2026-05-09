import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { GoogleSignInBlock } from '@/features/auth/components/GoogleSignInBlock';

const googleConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim().length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim().length > 0;

export const metadata: Metadata = {
  title: 'Đăng nhập | PLC Việt Nam',
  description: 'Đăng nhập để bình luận và quản lý nội dung .',
};

export default function SignInPage() {
  return (
    <AuthPageShell variant="sign-in">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Đăng nhập
        </h1>
        <p className="text-sm text-muted-foreground">Nhập email và mật khẩu để tiếp tục.</p>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/80" />}>
        <SignInForm />
      </Suspense>

      {googleConfigured && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <Suspense fallback={<div className="h-11 animate-pulse rounded-xl bg-muted/80" />}>
            <GoogleSignInBlock />
          </Suspense>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary transition-colors hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </AuthPageShell>
  );
}
