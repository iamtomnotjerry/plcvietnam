import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { contentRepository } from '@/lib/data/factory';
import {
  generateBookSchema,
  generateBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/utils/structuredData';

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await contentRepository.getBooks({ page: 1, limit: 200 });
  return result.data.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await contentRepository.getBookBySlug(slug);
  if (!book) {
    return { title: 'Không tìm thấy sách' };
  }
  return {
    title: `${book.title} | Sách`,
    description: book.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const book = await contentRepository.getBookBySlug(slug);
  if (!book) {
    notFound();
  }

  // Generate structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const bookSchema = generateBookSchema(book);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Sách', url: `${baseUrl}/books` },
    { name: book.title },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(bookSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />
      <article className="min-h-screen">
        <div className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-4 py-10 max-w-5xl">
            <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/books" className="hover:text-foreground transition-colors">
                    Sách
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground font-medium line-clamp-1">{book.title}</li>
              </ol>
            </nav>

            <div className="flex flex-col md:flex-row gap-10 md:gap-12">
              <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-xl ring-1 ring-border bg-muted">
                {book.coverImageUrl ? (
                  <Image
                    src={book.coverImageUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 280px, 280px"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <svg
                      className="w-16 h-16 opacity-30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                {book.series && (
                  <p className="text-sm font-medium text-primary uppercase tracking-wide">
                    {book.series}
                  </p>
                )}
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
                  {book.title}
                </h1>
                <p className="text-muted-foreground">
                  {book.authorName}
                  {book.publishedYear ? ` · ${book.publishedYear}` : ''}
                </p>
                <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                  {book.description}
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  {book.downloadUrl && (
                    <a
                      href={book.downloadUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Tải PDF
                    </a>
                  )}
                  {book.externalUrl && (
                    <a
                      href={book.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Xem nguồn bên ngoài
                    </a>
                  )}
                  {!book.downloadUrl && !book.externalUrl && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có liên kết tải cho sách này.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <Link href="/books" className="text-sm font-medium text-primary hover:underline">
            ← Quay lại danh sách sách
          </Link>
        </div>
      </article>
    </>
  );
}
