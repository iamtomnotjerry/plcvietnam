import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/author
 * Update author information
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.bio) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: name, email, bio' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
    }

    // Validate expertise array
    if (body.expertise && !Array.isArray(body.expertise)) {
      return NextResponse.json({ error: 'Expertise phải là mảng' }, { status: 400 });
    }

    // Validate certifications array
    if (body.certifications && !Array.isArray(body.certifications)) {
      return NextResponse.json({ error: 'Certifications phải là mảng' }, { status: 400 });
    }

    // Update author via repository
    const updatedAuthor = await contentRepository.updateAuthor({
      name: body.name,
      email: body.email,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      expertise: body.expertise || [],
      certifications: body.certifications || [],
      socialLinks: body.socialLinks || {},
    });

    return NextResponse.json({ success: true, author: updatedAuthor }, { status: 200 });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json({ error: 'Không thể cập nhật thông tin tác giả' }, { status: 500 });
  }
}
