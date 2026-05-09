'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAdminRole } from '@/features/auth/hooks/useAdminRole';

export function AdminHeaderLink() {
  const { isEditor } = useAdminRole();
  const t = useTranslations('footer');
  if (!isEditor) return null;
  return (
    <Link
      href="/admin/posts"
      className="hidden rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-block"
    >
      {t('admin')}
    </Link>
  );
}
