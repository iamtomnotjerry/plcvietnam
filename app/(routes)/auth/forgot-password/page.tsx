import type { Metadata } from 'next';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Quên mật khẩu | PLC Việt Nam',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell variant="forgot-password">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Quên mật khẩu
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập email để nhận liên kết đặt lại mật khẩu qua Supabase.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
