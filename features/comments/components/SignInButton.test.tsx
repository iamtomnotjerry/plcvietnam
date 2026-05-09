/**
 * SignInButton Component Tests
 * Validates Requirements: 4.2, 4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInButton } from './SignInButton';

const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockUseSupabaseAuth = vi.fn();

vi.mock('../hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => mockUseSupabaseAuth(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signOut: () => mockSignOut(),
    },
  },
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} width={width} height={height} {...props} />,
}));

describe('SignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should display loading skeleton while session is loading', () => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'loading' });

      render(<SignInButton />);

      const loadingEl = screen.getByLabelText('Đang tải...');
      expect(loadingEl).toBeInTheDocument();
    });

    it('should not show sign-in link while loading', () => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'loading' });

      render(<SignInButton />);

      expect(screen.queryByText('Đăng nhập để bình luận')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated state (Requirement 4.2)', () => {
    beforeEach(() => {
      mockUseSupabaseAuth.mockReturnValue({ user: null, session: null, status: 'unauthenticated' });
    });

    it('should display sign-in link when not authenticated', () => {
      render(<SignInButton />);

      const link = screen.getByRole('link', { name: /Đăng nhập để bình luận/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/auth/sign-in');
    });

    it('should not show user profile when unauthenticated', () => {
      render(<SignInButton />);

      expect(screen.queryByText('Đăng xuất')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated state (Requirement 4.4)', () => {
    const mockSession = {
      user: {
        id: '26fcd2b2-803c-42f8-8aa8-81f6f8fa1c42',
        email: 'user@example.com',
        user_metadata: {
          full_name: 'Nguyễn Văn A',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      session: { access_token: 'token' },
      status: 'authenticated' as const,
    };

    beforeEach(() => {
      mockUseSupabaseAuth.mockReturnValue(mockSession);
    });

    it('should display user name when authenticated', () => {
      render(<SignInButton />);

      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });

    it('should display user avatar when authenticated', () => {
      render(<SignInButton />);

      const avatar = screen.getByAltText('Nguyễn Văn A');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should display "Đăng xuất" button when authenticated', () => {
      render(<SignInButton />);

      expect(screen.getByRole('button', { name: /Đăng xuất/i })).toBeInTheDocument();
    });

    it('should not show sign-in link when authenticated', () => {
      render(<SignInButton />);

      expect(screen.queryByText('Đăng nhập để bình luận')).not.toBeInTheDocument();
    });

    it('should call signOut when "Đăng xuất" button is clicked', async () => {
      const user = userEvent.setup();
      render(<SignInButton />);

      await user.click(screen.getByRole('button', { name: /Đăng xuất/i }));

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Authenticated state without avatar', () => {
    it('should display initial letter fallback when user has no avatar', () => {
      mockUseSupabaseAuth.mockReturnValue({
        user: {
          id: '26fcd2b2-803c-42f8-8aa8-81f6f8fa1c42',
          email: 'user@example.com',
          user_metadata: {
            full_name: 'Trần Thị B',
            avatar_url: null,
          },
        },
        session: { access_token: 'token' },
        status: 'authenticated',
      });

      render(<SignInButton />);

      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });
});
