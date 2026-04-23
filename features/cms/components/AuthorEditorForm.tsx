'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Author } from '@/lib/types/domain';

interface AuthorEditorFormProps {
  author: Author;
}

export function AuthorEditorForm({ author }: AuthorEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: author.name,
    email: author.email,
    bio: author.bio,
    avatarUrl: author.avatarUrl || '',
    expertise: author.expertise.join(', '),
    certifications: author.certifications.join('\n'),
    socialLinks: {
      email: author.socialLinks.email || '',
      linkedin: author.socialLinks.linkedin || '',
      github: author.socialLinks.github || '',
      twitter: author.socialLinks.twitter || '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
        expertise: formData.expertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: formData.certifications
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        socialLinks: {
          email: formData.socialLinks.email.trim() || undefined,
          linkedin: formData.socialLinks.linkedin.trim() || undefined,
          github: formData.socialLinks.github.trim() || undefined,
          twitter: formData.socialLinks.twitter.trim() || undefined,
        },
      };

      const response = await fetch('/api/admin/author', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Không thể cập nhật thông tin');
      }

      router.push('/about');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Tên <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground mb-2">
          URL ảnh đại diện
        </label>
        <input
          type="url"
          id="avatarUrl"
          value={formData.avatarUrl}
          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
          Giới thiệu <span className="text-destructive">*</span>
        </label>
        <textarea
          id="bio"
          required
          rows={5}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Expertise */}
      <div>
        <label htmlFor="expertise" className="block text-sm font-medium text-foreground mb-2">
          Chuyên môn{' '}
          <span className="text-muted-foreground text-xs">(phân cách bằng dấu phẩy)</span>
        </label>
        <input
          type="text"
          id="expertise"
          value={formData.expertise}
          onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
          placeholder="PLC Programming, SCADA Systems, Siemens TIA Portal"
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Certifications */}
      <div>
        <label htmlFor="certifications" className="block text-sm font-medium text-foreground mb-2">
          Chứng chỉ <span className="text-muted-foreground text-xs">(mỗi dòng một chứng chỉ)</span>
        </label>
        <textarea
          id="certifications"
          rows={5}
          value={formData.certifications}
          onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
          placeholder="Siemens Certified Programmer&#10;Rockwell Automation Certified&#10;ISA Certified Automation Professional"
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="font-semibold text-foreground">Liên kết mạng xã hội</h3>

        <div>
          <label htmlFor="social-email" className="block text-sm font-medium text-foreground mb-2">
            Email liên hệ
          </label>
          <input
            type="email"
            id="social-email"
            value={formData.socialLinks.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, email: e.target.value },
              })
            }
            placeholder="contact@example.com"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="social-linkedin"
            className="block text-sm font-medium text-foreground mb-2"
          >
            LinkedIn
          </label>
          <input
            type="url"
            id="social-linkedin"
            value={formData.socialLinks.linkedin}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
              })
            }
            placeholder="https://linkedin.com/in/username"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="social-github" className="block text-sm font-medium text-foreground mb-2">
            GitHub
          </label>
          <input
            type="url"
            id="social-github"
            value={formData.socialLinks.github}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, github: e.target.value },
              })
            }
            placeholder="https://github.com/username"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="social-twitter"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Twitter / X
          </label>
          <input
            type="url"
            id="social-twitter"
            value={formData.socialLinks.twitter}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value },
              })
            }
            placeholder="https://twitter.com/username"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
