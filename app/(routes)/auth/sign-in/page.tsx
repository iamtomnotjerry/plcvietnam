import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
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
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Đăng nhập
      </h1>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <SignInForm />
      </Suspense>

      {googleConfigured && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-muted" />}>
            <GoogleSignInBlock />
          </Suspense>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </main>
  );
}
