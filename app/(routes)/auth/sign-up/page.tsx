import type { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export const metadata: Metadata = {
  title: 'Đăng ký | Automation Blog',
  description: 'Tạo tài khoản demo (mock).',
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Đăng ký
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Tài khoản mới có quyền đọc (reader). Admin/Editor dùng tài khoản seed trong mock data.
      </p>

      <SignUpForm />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </main>
  );
}
