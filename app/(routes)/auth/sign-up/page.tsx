import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export const metadata: Metadata = {
  title: 'Đăng ký | PLC Việt Nam',
  description: 'Tạo tài khoản demo .',
};

export default function SignUpPage() {
  return (
    <AuthPageShell variant="sign-up">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Đăng ký
        </h1>
        <p className="text-sm text-muted-foreground">
          Đăng ký bằng email để bắt đầu trải nghiệm PLC Việt Nam.
        </p>
      </div>

      <SignUpForm />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary transition-colors hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </AuthPageShell>
  );
}
