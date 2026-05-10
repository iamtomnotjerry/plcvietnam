import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('metaTitle', { brand: tSite('brand') }),
    description: t('metaDescription', { brand: tSite('brand') }),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const intlLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const formattedDate = new Date().toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="mb-6" aria-label={tCommon('breadcrumbAria')}>
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
              {tNav('home')}
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">{t('breadcrumbCurrent')}</span>
          </li>
        </ol>
      </nav>

      <article className="rich-text">
        <h1>{t('h1')}</h1>

        <p className="lead">{t('lead')}</p>

        <h2>{t('s1h')}</h2>
        <p>{t('s1p')}</p>
        <ul>
          <li>
            <strong>{t('s1li1')}</strong> {t('s1li1b')}
          </li>
          <li>
            <strong>{t('s1li2')}</strong> {t('s1li2b')}
          </li>
          <li>
            <strong>{t('s1li3')}</strong> {t('s1li3b')}
          </li>
          <li>
            <strong>{t('s1li4')}</strong> {t('s1li4b')}
          </li>
        </ul>

        <h2>{t('s2h')}</h2>
        <p>{t('s2p')}</p>
        <ul>
          <li>{t('s2li1')}</li>
          <li>{t('s2li2')}</li>
          <li>{t('s2li3')}</li>
          <li>{t('s2li4')}</li>
          <li>{t('s2li5')}</li>
        </ul>

        <h2>{t('s3h')}</h2>
        <p>
          {t('s3p1')}
          <strong>{t('s3strong')}</strong>
          {t('s3p2')}
        </p>
        <ul>
          <li>{t('s3li1')}</li>
          <li>{t('s3li2')}</li>
          <li>{t('s3li3')}</li>
        </ul>

        <h2>{t('s4h')}</h2>
        <p>{t('s4p')}</p>

        <h2>{t('s5h')}</h2>
        <p>{t('s5p')}</p>
        <ul>
          <li>{t('s5li1')}</li>
          <li>{t('s5li2')}</li>
          <li>{t('s5li3')}</li>
          <li>{t('s5li4')}</li>
        </ul>
        <p>
          {t('s5contact')} <a href="mailto:privacy@automationblog.vn">privacy@automationblog.vn</a>
        </p>

        <h2>{t('s6h')}</h2>
        <p>{t('s6p')}</p>
        <ul>
          <li>{t('s6li1')}</li>
          <li>{t('s6li2')}</li>
          <li>{t('s6li3')}</li>
        </ul>
        <p>{t('s6p2')}</p>

        <h2>{t('s7h')}</h2>
        <p>{t('s7p')}</p>

        <h2>{t('s8h')}</h2>
        <p>{t('s8p')}</p>

        <h2>{t('s9h')}</h2>
        <p>{t('s9p')}</p>
        <ul>
          <li>
            {t('s9emailLabel')}{' '}
            <a href="mailto:privacy@automationblog.vn">privacy@automationblog.vn</a>
          </li>
          <li>
            {t('s9pageLabel')} <Link href="/about">{t('aboutLink')}</Link>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground mt-8">
          <em>
            {t('lastUpdated')} {formattedDate}
          </em>
        </p>
      </article>
    </div>
  );
}
