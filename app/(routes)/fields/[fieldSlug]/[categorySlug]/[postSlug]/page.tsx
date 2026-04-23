/**
 * Post Detail Page
 * Displays full post content with metadata and features
 * Validates Requirements: 2.1, 2.3, 2.4, 2.5, 8.6, 13.3, 13.4, 13.5
 */

import { notFound } from 'next/navigation';
import { contentRepository } from '@/lib/data/factory';
import { PostDetail } from '@/features/posts/components/PostDetail';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{
    fieldSlug: string;
    categorySlug: string;
    postSlug: string;
  }>;
}

/**
 * Generate static params for all post pages
 * Enables static generation at build time
 */
export async function generateStaticParams() {
  const fields = await contentRepository.getFields();
  const params: { fieldSlug: string; categorySlug: string; postSlug: string }[] = [];
  
  for (const field of fields) {
    const categories = await contentRepository.getCategoriesByFieldId(field.id);
    for (const category of categories) {
      const postsResult = await contentRepository.getPostsByCategory(category.id);
      for (const post of postsResult.data) {
        params.push({
          fieldSlug: field.slug,
          categorySlug: category.slug,
          postSlug: post.slug,
        });
      }
    }
  }
  
  return params;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PostPageProps) {
  const { fieldSlug, categorySlug, postSlug } = await params;
  const post = await contentRepository.getPostBySlug(
    fieldSlug,
    categorySlug,
    postSlug
  );
  
  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }
  
  return {
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.seo.title || post.title,
      description: post.seo.description || post.excerpt,
      images: post.seo.ogImage ? [post.seo.ogImage] : post.thumbnailUrl ? [post.thumbnailUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author ? [post.author.name] : [],
      tags: post.tags.map(tag => tag.name),
    },
  };
}

/**
 * Post Detail Page Component
 */
export default async function PostPage({ params }: PostPageProps) {
  const { fieldSlug, categorySlug, postSlug } = await params;
  // Fetch post
  const post = await contentRepository.getPostBySlug(
    fieldSlug,
    categorySlug,
    postSlug
  );
  
  // Handle 404 for invalid slugs
  if (!post) {
    notFound();
    return null; // TypeScript guard
  }
  
  // Fetch related posts (up to 4)
  const relatedPosts = await contentRepository.getRelatedPosts(post.id, 4);
  
  // Increment view count (client-side in mock provider)
  // This will be handled by the PostDetail component on mount
  
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <PostDetail post={post} relatedPosts={relatedPosts} />
      </div>
    </main>
  );
}
