/**
 * CommentSection Component Tests
 * Validates Requirements: 4.1, 4.2, 4.4, 4.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentSection } from './CommentSection';
import type { Comment } from '@/lib/types/domain';

const mockUseSupabaseAuth = vi.fn();

vi.mock('../hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => mockUseSupabaseAuth(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

function makeComment(overrides?: Partial<Comment>): Comment {
  return {
    id: 'c1',
    postId: 'post-1',
    userId: 'user-1',
    userName: 'Nguyễn Văn A',
    content: 'Bình luận thử nghiệm',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  };
}

const defaultProps = {
  postId: 'post-1',
  postSlug: 'test-post',
  comments: [],
  onSubmit: vi.fn(),
};

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated state', () => {
    beforeEach(() => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'unauthenticated' });
    });

    it('shows sign-in prompt when unauthenticated', () => {
      render(<CommentSection {...defaultProps} />);

      expect(screen.getByText(/Đăng nhập để bình luận/)).toBeInTheDocument();
    });

    it('shows social login buttons when unauthenticated', async () => {
      render(<CommentSection {...defaultProps} />);

      expect(
        await screen.findByRole('button', { name: /Đăng nhập với Google/i })
      ).toBeInTheDocument();
    });

    it('does not show comment form when unauthenticated', () => {
      render(<CommentSection {...defaultProps} />);

      expect(screen.queryByRole('textbox', { name: /bình luận/i })).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows loading skeleton while session is loading', () => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'loading' });
      render(<CommentSection {...defaultProps} />);

      expect(screen.getByLabelText('Đang tải...')).toBeInTheDocument();
    });

    it('does not show comment form while loading', () => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'loading' });
      render(<CommentSection {...defaultProps} />);

      expect(screen.queryByRole('textbox', { name: /bình luận/i })).not.toBeInTheDocument();
    });
  });

  describe('Authenticated state', () => {
    beforeEach(() => {
      mockUseSupabaseAuth.mockReturnValue({
        user: {
          id: 'a0a2ae86-cf2b-4f5b-a5c7-d2f1c2412e9c',
          email: 'b@example.com',
          user_metadata: {
            full_name: 'Trần Thị B',
            avatar_url: null,
          },
        },
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'a0a2ae86-cf2b-4f5b-a5c7-d2f1c2412e9c',
            email: 'b@example.com',
            user_metadata: { full_name: 'Trần Thị B', avatar_url: null },
          },
        },
        status: 'authenticated',
      });
    });

    it('shows comment form when authenticated', () => {
      render(<CommentSection {...defaultProps} />);

      expect(screen.getByRole('textbox', { name: /bình luận/i })).toBeInTheDocument();
    });

    it('shows sign-out button when authenticated', () => {
      render(<CommentSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Đăng xuất/i })).toBeInTheDocument();
    });

    it('does not show social login buttons when authenticated', () => {
      render(<CommentSection {...defaultProps} />);

      expect(
        screen.queryByRole('button', { name: /Đăng nhập với Google/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Comment list rendering', () => {
    beforeEach(() => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'unauthenticated' });
    });

    it('shows empty state when no comments', () => {
      render(<CommentSection {...defaultProps} comments={[]} />);

      expect(screen.getByText(/Chưa có bình luận nào/)).toBeInTheDocument();
    });

    it('renders comments when provided', () => {
      const comments = [
        makeComment({ id: 'c1', content: 'Bình luận đầu tiên' }),
        makeComment({ id: 'c2', content: 'Bình luận thứ hai' }),
      ];
      render(<CommentSection {...defaultProps} comments={comments} />);

      expect(screen.getByText('Bình luận đầu tiên')).toBeInTheDocument();
      expect(screen.getByText('Bình luận thứ hai')).toBeInTheDocument();
    });

    it('shows comment count in heading', () => {
      const comments = [makeComment(), makeComment({ id: 'c2' })];
      render(<CommentSection {...defaultProps} comments={comments} />);

      expect(screen.getByRole('heading', { name: /Bình luận \(2\)/i })).toBeInTheDocument();
    });

    it('shows zero count when no comments', () => {
      render(<CommentSection {...defaultProps} comments={[]} />);

      expect(screen.getByRole('heading', { name: /Bình luận \(0\)/i })).toBeInTheDocument();
    });
  });
});
