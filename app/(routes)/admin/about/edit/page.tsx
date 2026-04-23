import { contentRepository } from '@/lib/data/factory';
import { AuthorEditorForm } from '@/features/cms/components/AuthorEditorForm';

export const dynamic = 'force-dynamic';

export default async function AdminEditAboutPage() {
  const author = await contentRepository.getAuthor();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">
        Chỉnh sửa thông tin giới thiệu
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Cập nhật thông tin tác giả, chuyên môn, chứng chỉ và liên kết mạng xã hội.
      </p>
      <AuthorEditorForm author={author} />
    </div>
  );
}
