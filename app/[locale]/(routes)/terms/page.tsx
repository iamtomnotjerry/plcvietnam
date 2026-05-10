import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'termsPage' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('metaTitle', { brand: tSite('brand') }),
    description: t('metaDescription', { brand: tSite('brand') }),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'termsPage' });
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

        <h2>{t('s2h')}</h2>
        <h3>{t('s21h')}</h3>
        <p>{t('s21p')}</p>
        <ul>
          <li>{t('s21li1')}</li>
          <li>{t('s21li2')}</li>
          <li>{t('s21li3')}</li>
          <li>{t('s21li4')}</li>
        </ul>

        <h3>{t('s22h')}</h3>
        <p>{t('s22p')}</p>
        <ul>
          <li>{t('s22li1')}</li>
          <li>{t('s22li2')}</li>
          <li>{t('s22li3')}</li>
        </ul>

        <h2>{t('s3h')}</h2>
        <h3>{t('s31h')}</h3>
        <p>{t('s31p')}</p>
        <ul>
          <li>{t('s31li1')}</li>
          <li>{t('s31li2')}</li>
          <li>{t('s31li3')}</li>
          <li>{t('s31li4')}</li>
        </ul>

        <h3>{t('s32h')}</h3>
        <p>{t('s32p')}</p>

        <h3>{t('s33h')}</h3>
        <p>{t('s33p')}</p>

        <h2>{t('s4h')}</h2>
        <h3>{t('s41h')}</h3>
        <p>{t('s41p')}</p>

        <h3>{t('s42h')}</h3>
        <p>{t('s42p')}</p>
        <ul>
          <li>{t('s42li1')}</li>
          <li>{t('s42li2')}</li>
          <li>{t('s42li3')}</li>
        </ul>
        <p>{t('s42p2')}</p>

        <h2>{t('s5h')}</h2>
        <p>{t('s5p')}</p>

        <h2>{t('s6h')}</h2>
        <p>{t('s6p')}</p>
        <ul>
          <li>{t('s6li1')}</li>
          <li>{t('s6li2')}</li>
          <li>{t('s6li3')}</li>
        </ul>

        <h2>{t('s7h')}</h2>
        <p>{t('s7p')}</p>
        <ul>
          <li>{t('s7li1')}</li>
          <li>{t('s7li2')}</li>
          <li>{t('s7li3')}</li>
          <li>{t('s7li4')}</li>
        </ul>

        <h2>{t('s8h')}</h2>
        <p>{t('s8p')}</p>
        <ul>
          <li>{t('s8li1')}</li>
          <li>{t('s8li2')}</li>
          <li>{t('s8li3')}</li>
        </ul>

        <h2>{t('s9h')}</h2>
        <p>{t('s9p')}</p>

        <h2>{t('s10h')}</h2>
        <p>{t('s10p')}</p>

        <h2>{t('s11h')}</h2>
        <p>{t('s11p')}</p>

        <h2>{t('s12h')}</h2>
        <p>{t('s12p')}</p>
        <ul>
          <li>
            {t('s12emailLabel')}{' '}
            <a href="mailto:legal@automationblog.vn">legal@automationblog.vn</a>
          </li>
          <li>
            {t('s12pageLabel')} <Link href="/about">{t('aboutLink')}</Link>
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
