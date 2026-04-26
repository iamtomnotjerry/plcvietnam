import type { Metadata } from 'next';
import Link from 'next/link';

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
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
        {isError ? (
          <>
            {/* Error state */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-destructive"
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
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Link không hợp lệ</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Link xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng đăng ký lại hoặc liên hệ hỗ
                trợ.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/sign-up"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center"
              >
                Đăng ký lại
              </Link>
              <Link
                href="/"
                className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground text-center hover:bg-muted transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
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
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email đã xác nhận!</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/sign-in"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center"
              >
                Đăng nhập
              </Link>
              <Link
                href="/"
                className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground text-center hover:bg-muted transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
