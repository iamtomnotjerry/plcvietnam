import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import {
  authOutlineButtonClassName,
  authPrimaryButtonClassName,
} from '@/features/auth/form-classes';

export const metadata: Metadata = {
  title: 'Xác nhận email | PLC Việt Nam',
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function ConfirmedPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const isError = error === '1';

  return (
    <AuthPageShell variant={isError ? 'email-confirm-failed' : 'email-confirmed'}>
      <div className="space-y-6 text-center">
        {isError ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Link không hợp lệ
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Link xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng đăng ký lại hoặc liên hệ hỗ
                trợ.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/auth/sign-up" className={authPrimaryButtonClassName}>
                Đăng ký lại
              </Link>
              <Link href="/" className={authOutlineButtonClassName}>
                Về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Email đã xác nhận!
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/auth/sign-in" className={authPrimaryButtonClassName}>
                Đăng nhập
              </Link>
              <Link href="/" className={authOutlineButtonClassName}>
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
