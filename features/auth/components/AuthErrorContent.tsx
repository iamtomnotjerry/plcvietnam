'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const isConfiguration = error === 'Configuration';

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-2 font-serif text-2xl font-semibold text-destructive">
        Đăng nhập thất bại
      </h1>
      {isConfiguration ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Lỗi cấu hình máy chủ (thường gặp trên{' '}
            <strong className="text-foreground">Vercel</strong> khi thiếu biến môi trường Supabase).
          </p>
          <p className="font-medium text-foreground">
            Cần thiết lập trên Vercel → Project → Settings → Environment Variables:
          </p>
          <ul className="list-inside list-disc space-y-2 pl-1">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{' '}
              — URL project Supabase.
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{' '}
              — publishable key dùng cho client-side auth.
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{' '}
              — chỉ dùng server-side cho admin/privileged routes.
            </li>
          </ul>
          <p>
            Sau khi thêm biến, hãy <strong className="text-foreground">Redeploy</strong> project.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {error
            ? `Mã lỗi: ${error}. Thử đăng nhập lại hoặc kiểm tra log trên Vercel (Runtime Logs).`
            : 'Đã xảy ra lỗi. Thử lại sau.'}
        </p>
      )}
      <div className="mt-6">
        <Link
          href={'/auth/sign-in' as Route}
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}

export function AuthErrorContent() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
      <AuthErrorInner />
    </Suspense>
  );
}
