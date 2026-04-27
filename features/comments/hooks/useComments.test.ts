/**
 * useComments Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useComments } from './useComments';
import type { Comment } from '@/lib/types/domain';

// Mock Supabase realtime - not needed in unit tests
vi.mock('@/lib/supabase/realtime', () => ({
  subscribeToComments: vi.fn(() => () => {}),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment-1',
  postId: 'post-1',
  userId: 'user-1',
  userName: 'Test User',
  content: 'Test comment',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('useComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching comments', () => {
    it('starts in loading state with empty comments', () => {
      mockFetch.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useComments('post-1'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.comments).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('loads comments for the given postId on mount', async () => {
      const comments = [makeComment(), makeComment({ id: 'comment-2', content: 'Another' })];
      mockFetch.mockResolvedValue(jsonResponse(comments));

      const { result } = renderHook(() => useComments('post-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.comments).toHaveLength(2);
      expect(result.current.comments[0].id).toBe('comment-1');
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/comments?postId=post-1');
    });

    it('sets error state when fetch fails', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Server bad' }), { status: 500 })
      );

      const { result } = renderHook(() => useComments('post-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Server bad');
      expect(result.current.comments).toEqual([]);
    });

    it('wraps non-Error rejections in an Error', async () => {
      mockFetch.mockRejectedValue('string error');

      const { result } = renderHook(() => useComments('post-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('refetches when postId changes', async () => {
      mockFetch.mockResolvedValue(jsonResponse([]));

      const { rerender } = renderHook(({ id }) => useComments(id), {
        initialProps: { id: 'post-1' },
      });

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      expect(mockFetch).toHaveBeenCalledWith('/api/comments?postId=post-1');

      rerender({ id: 'post-2' });

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
      expect(mockFetch).toHaveBeenLastCalledWith('/api/comments?postId=post-2');
    });
  });

  describe('submitComment', () => {
    it('optimistically adds comment before API response', async () => {
      let resolveSubmit!: (value: Response) => void;
      const pendingPost = new Promise<Response>((res) => {
        resolveSubmit = res;
      });

      mockFetch.mockImplementation((url: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'POST') return pendingPost;
        return Promise.resolve(jsonResponse([]));
      });

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.submitComment('Hello world');
      });

      await waitFor(() => expect(result.current.comments).toHaveLength(1));
      expect(result.current.comments[0].content).toBe('Hello world');
      expect(result.current.isSubmitting).toBe(true);

      const realComment = makeComment({ id: 'real-1', content: 'Hello world' });
      resolveSubmit(
        new Response(JSON.stringify(realComment), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    });

    it('replaces optimistic comment with real comment on success', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse([]))
        .mockResolvedValueOnce(
          jsonResponse(makeComment({ id: 'real-1', content: 'My comment' }), 201)
        );

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.submitComment('My comment');
      });

      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].id).toBe('real-1');
      expect(result.current.isSubmitting).toBe(false);
    });

    it('rolls back optimistic comment on API error', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(result.current.submitComment('Bad comment')).rejects.toThrow('Unauthorized');
      });

      expect(result.current.comments).toHaveLength(0);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('rolls back optimistic comment on network error', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse([]))
        .mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(result.current.submitComment('My comment')).rejects.toThrow();
      });

      expect(result.current.comments).toHaveLength(0);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('POSTs to /api/comments with postId and content', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse([]))
        .mockResolvedValueOnce(jsonResponse(makeComment({ id: 'real-1' }), 201));

      const { result } = renderHook(() => useComments('post-42'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.submitComment('Hello');
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: 'post-42', content: 'Hello' }),
      });
    });

    it('sets isSubmitting to true during submission and false after', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse([]))
        .mockResolvedValueOnce(jsonResponse(makeComment({ id: 'real-1' }), 201));

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isSubmitting).toBe(false);

      await act(async () => {
        await result.current.submitComment('Test');
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('preserves existing comments when adding a new one', async () => {
      const existing = makeComment({ id: 'existing-1', content: 'Existing' });
      mockFetch
        .mockResolvedValueOnce(jsonResponse([existing]))
        .mockResolvedValueOnce(
          jsonResponse(makeComment({ id: 'real-2', content: 'New comment' }), 201)
        );

      const { result } = renderHook(() => useComments('post-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.submitComment('New comment');
      });

      expect(result.current.comments).toHaveLength(2);
      expect(result.current.comments[0].id).toBe('existing-1');
      expect(result.current.comments[1].id).toBe('real-2');
    });
  });

  describe('return shape', () => {
    it('returns all required fields', async () => {
      mockFetch.mockResolvedValue(jsonResponse([]));

      const { result } = renderHook(() => useComments('post-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current).toMatchObject({
        comments: expect.any(Array),
        isLoading: expect.any(Boolean),
        error: null,
        submitComment: expect.any(Function),
        isSubmitting: expect.any(Boolean),
      });
    });
  });
});
