import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { z } from 'zod';
import { apiBadRequest, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireEditorAuth } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

const UpdateAuthorPayloadSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  bio: z.string().min(1, 'Tiểu sử không được để trống'),
  avatarUrl: z.string().url('Avatar URL không hợp lệ').optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
});

function unauthorized() {
  return apiUnauthorized();
}

/**
 * PUT /api/admin/author
 * Update author information
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await requireEditorAuth())) return unauthorized();

    const payload = UpdateAuthorPayloadSchema.safeParse(await request.json());
    if (!payload.success) {
      return apiBadRequest(payload.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ');
    }
    const body = payload.data;

    // Update author via repository
    const updatedAuthor = await contentRepository.updateAuthor({
      name: body.name,
      email: body.email,
      bio: body.bio,
      avatarUrl: body.avatarUrl || undefined,
      expertise: body.expertise ?? [],
      certifications: body.certifications ?? [],
      socialLinks: body.socialLinks ?? {},
    });

    return NextResponse.json({ success: true, author: updatedAuthor }, { status: 200 });
  } catch (error) {
    console.error('Error updating author:', error);
    return apiInternalError('Không thể cập nhật thông tin tác giả');
  }
}
