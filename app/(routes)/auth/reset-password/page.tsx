import type { Metadata } from 'next';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu | PLC Việt Nam',
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell variant="reset-password">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập mật khẩu mới (tối thiểu 8 ký tự) sau khi mở link từ email.
        </p>
      </div>
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
