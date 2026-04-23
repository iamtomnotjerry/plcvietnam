/**
 * CommentForm Component Tests
 * Validates Requirements: 4.5, 4.6, 4.7, 4.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from './CommentForm';

/** Helper: set textarea value via fireEvent (avoids userEvent key-by-key issues with long/unicode text) */
function fillTextarea(value: string) {
  const textarea = screen.getByRole('textbox', { name: /bình luận/i });
  fireEvent.change(textarea, { target: { value } });
  return textarea;
}

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders textarea and submit button', () => {
      render(<CommentForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('textbox', { name: /bình luận/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /gửi bình luận/i })).toBeInTheDocument();
    });

    it('textarea starts empty', () => {
      render(<CommentForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox', { name: /bình luận/i });
      expect(textarea).toHaveValue('');
    });
  });

  describe('Validation - empty comment', () => {
    it('shows error when submitting empty content', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Bình luận không được để trống');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('marks textarea as invalid when empty', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      const textarea = screen.getByRole('textbox', { name: /bình luận/i });
      await waitFor(() => expect(textarea).toHaveAttribute('aria-invalid', 'true'));
    });
  });

  describe('Validation - too long comment', () => {
    it('shows error when content exceeds 2000 characters', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('a'.repeat(2001));
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Bình luận không được vượt quá 2000 ký tự'
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Validation - valid comment', () => {
    it('calls onSubmit with content when valid', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('Bình luận hợp lệ');
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith('Bình luận hợp lệ'));
    });

    it('accepts exactly 2000 characters', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('a'.repeat(2000));
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears textarea after successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('Bình luận hợp lệ');
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      await waitFor(() => expect(screen.getByRole('textbox', { name: /bình luận/i })).toHaveValue(''));
    });

    it('clears error when user starts typing after an error', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={mockOnSubmit} />);

      // Trigger error
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      // Change textarea value to clear error
      fillTextarea('x');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Submission flow', () => {
    it('shows loading state while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: () => void;
      mockOnSubmit.mockReturnValue(new Promise<void>(res => { resolveSubmit = res; }));
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('Bình luận');
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      expect(await screen.findByRole('button', { name: /đang gửi/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /đang gửi/i })).toBeDisabled();

      resolveSubmit();
    });

    it('disables textarea while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: () => void;
      mockOnSubmit.mockReturnValue(new Promise<void>(res => { resolveSubmit = res; }));
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('Bình luận');
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: /bình luận/i })).toBeDisabled()
      );

      resolveSubmit();
    });

    it('re-enables form after submission completes', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CommentForm onSubmit={mockOnSubmit} />);

      fillTextarea('Bình luận');
      await user.click(screen.getByRole('button', { name: /gửi bình luận/i }));

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /gửi bình luận/i })).not.toBeDisabled()
      );
      expect(screen.getByRole('textbox', { name: /bình luận/i })).not.toBeDisabled();
    });
  });
});
