/**
 * CommentList Component Tests
 * Validates Requirements: 4.1, 4.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentList } from './CommentList';
import type { Comment } from '@/lib/types/domain';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
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

describe('CommentList', () => {
  describe('Empty state', () => {
    it('shows empty state message when no comments', () => {
      render(<CommentList comments={[]} />);

      expect(screen.getByText(/Chưa có bình luận nào/)).toBeInTheDocument();
    });

    it('does not render a list when empty', () => {
      render(<CommentList comments={[]} />);

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('Rendering comments', () => {
    it('renders each comment content', () => {
      const comments = [
        makeComment({ id: 'c1', content: 'Bình luận thứ nhất' }),
        makeComment({ id: 'c2', content: 'Bình luận thứ hai' }),
      ];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('Bình luận thứ nhất')).toBeInTheDocument();
      expect(screen.getByText('Bình luận thứ hai')).toBeInTheDocument();
    });

    it('renders user names', () => {
      const comments = [
        makeComment({ id: 'c1', userName: 'Trần Thị B' }),
      ];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    it('renders a list with accessible label', () => {
      render(<CommentList comments={[makeComment()]} />);

      expect(screen.getByRole('list', { name: /danh sách bình luận/i })).toBeInTheDocument();
    });
  });

  describe('Ascending date order', () => {
    it('displays comments in ascending date order (oldest first)', () => {
      const comments = [
        makeComment({ id: 'c3', content: 'Mới nhất', createdAt: new Date('2024-03-01') }),
        makeComment({ id: 'c1', content: 'Cũ nhất', createdAt: new Date('2024-01-01') }),
        makeComment({ id: 'c2', content: 'Giữa', createdAt: new Date('2024-02-01') }),
      ];
      render(<CommentList comments={comments} />);

      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Cũ nhất');
      expect(items[1]).toHaveTextContent('Giữa');
      expect(items[2]).toHaveTextContent('Mới nhất');
    });

    it('does not mutate the original comments array', () => {
      const comments = [
        makeComment({ id: 'c2', content: 'Second', createdAt: new Date('2024-02-01') }),
        makeComment({ id: 'c1', content: 'First', createdAt: new Date('2024-01-01') }),
      ];
      const originalOrder = comments.map(c => c.id);
      render(<CommentList comments={comments} />);

      expect(comments.map(c => c.id)).toEqual(originalOrder);
    });
  });

  describe('Avatar display', () => {
    it('renders avatar image when userAvatar is provided', () => {
      const comment = makeComment({
        userName: 'Lê Văn C',
        userAvatar: 'https://example.com/avatar.jpg',
      });
      render(<CommentList comments={[comment]} />);

      const img = screen.getByAltText('Lê Văn C');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders initial letter fallback when no avatar', () => {
      const comment = makeComment({ userName: 'Phạm Thị D', userAvatar: undefined });
      render(<CommentList comments={[comment]} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      // First letter of name as fallback
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('uses uppercase first letter for avatar fallback', () => {
      const comment = makeComment({ userName: 'nguyễn văn e', userAvatar: undefined });
      render(<CommentList comments={[comment]} />);

      expect(screen.getByText('N')).toBeInTheDocument();
    });
  });
});
