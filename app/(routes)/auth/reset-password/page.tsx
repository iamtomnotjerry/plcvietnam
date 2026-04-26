import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu | PLC Việt Nam',
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[60vh] px-4 py-16">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 font-serif text-2xl font-semibold">Đặt lại mật khẩu</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Nhập token và mật khẩu mới (tối thiểu 8 ký tự).
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
