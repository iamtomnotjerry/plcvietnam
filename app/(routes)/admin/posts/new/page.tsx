import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';

export const dynamic = 'force-dynamic';

export default async function AdminNewPostPage() {
  const { categories, tags } = await loadPostEditorOptions();
  const firstCategoryId = categories[0]?.id ?? '';

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">Viết bài mới</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Lưu dữ liệu vào mock provider trong tiến trình server (dev).
      </p>
      <PostEditorForm
        mode="create"
        categories={categories}
        tags={tags}
        initial={{
          slug: '',
          title: '',
          excerpt: '',
          content: '<p></p>',
          categoryId: firstCategoryId,
          tagIds: [],
          thumbnailUrl: '',
          status: 'draft',
          seo: { title: '', description: '', keywords: [] },
        }}
      />
    </div>
  );
}
