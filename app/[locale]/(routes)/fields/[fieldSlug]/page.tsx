import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import { Link } from '@/i18n/navigation';
import { categoryHref } from '@/lib/utils/routes';
import { withLocales } from '@/lib/i18n/staticParams';
import { absoluteUrlForLocale, metadataLanguageAlternates } from '@/lib/i18n/urls';

interface FieldPageProps {
  params: Promise<{ locale: string; fieldSlug: string }>;
}

export async function generateStaticParams() {
  const fields = await contentRepository.getFields();
  return withLocales(fields.map((field) => ({ fieldSlug: field.slug })));
}

export async function generateMetadata({ params }: FieldPageProps) {
  const { locale, fieldSlug } = await params;
  setRequestLocale(locale);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const path = `/fields/${fieldSlug}`;
  const field = await contentRepository.getFieldBySlug(fieldSlug);
  if (!field) {
    const t = await getTranslations({ locale, namespace: 'errors' });
    return { title: t('fieldNotFoundTitle') };
  }
  const [tPages, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'site' }),
  ]);
  return {
    title: tPages('field.metaTitle', { name: field.name, brand: tSite('brand') }),
    description:
      field.description?.trim() || tPages('field.metaDescriptionFallback', { name: field.name }),
    alternates: {
      canonical: absoluteUrlForLocale(locale, path, baseUrl),
      languages: metadataLanguageAlternates(path, baseUrl).languages,
    },
  };
}

/**
 * Field index page: displays all categories in this field
 */
export default async function FieldPage({ params }: FieldPageProps) {
  const { locale, fieldSlug } = await params;
  setRequestLocale(locale);
  const field = await contentRepository.getFieldBySlug(fieldSlug);
  if (!field) {
    notFound();
  }

  const categories = await contentRepository.getCategoriesByFieldId(field.id);

  const [tNav, tPages, tErrors, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {tNav('home')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{field.name}</span>
      </nav>

      {/* Field Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">{field.name}</h1>
        {field.description && <p className="text-lg text-muted-foreground">{field.description}</p>}
      </div>

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {tPages('field.categoriesHeading', { count: categories.length })}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(field.slug, category.slug)}
                className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tCommon('postCount', { count: category.postCount })}
                  </span>
                  <svg
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {tPages('field.emptyTitle')}
          </h3>
          <p className="text-muted-foreground">{tPages('field.emptyBody')}</p>
          <Link
            href="/"
            className="inline-block mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {tErrors('backHome')}
          </Link>
        </div>
      )}
    </div>
  );
}
