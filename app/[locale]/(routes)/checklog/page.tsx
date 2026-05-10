import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ChecklogClient } from '@/features/checklog/components/ChecklogClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checklog');
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function ChecklogPage() {
  return (
    <div className="mx-auto w-full max-w-[min(96rem,calc(100%-1.5rem))] px-3 py-8 sm:px-5">
      <ChecklogClient />
    </div>
  );
}
