import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { AuthErrorContent } from '@/features/auth/components/AuthErrorContent';

export const metadata: Metadata = {
  title: 'Lỗi đăng nhập | Automation Blog',
};

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
      <AuthErrorContent />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href={'/' as Route} className="text-primary hover:underline">
          Về trang chủ
        </Link>
      </p>
    </main>
  );
}
