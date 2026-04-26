import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Quên mật khẩu | PLC Việt Nam',
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-[60vh] px-4 py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 font-serif text-2xl font-semibold">Quên mật khẩu</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Bản demo: không gửi email. Trong development, API trả về token để thử reset.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
