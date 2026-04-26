/**
 * HeroSection Component Tests
 * Validates Requirements: 11.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  const defaultProps = {
    title: 'PLC Việt Nam',
    tagline: 'Chia sẻ kiến thức tự động hóa công nghiệp',
    description: 'Khám phá kiến thức về PLC, SCADA, và Siemens Automation',
  };

  it('renders title correctly', () => {
    render(<HeroSection {...defaultProps} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('PLC Việt Nam');
  });

  it('renders tagline correctly', () => {
    render(<HeroSection {...defaultProps} />);

    expect(screen.getByText('Chia sẻ kiến thức tự động hóa công nghiệp')).toBeInTheDocument();
  });

  it('renders description correctly', () => {
    render(<HeroSection {...defaultProps} />);

    expect(
      screen.getByText('Khám phá kiến thức về PLC, SCADA, và Siemens Automation')
    ).toBeInTheDocument();
  });

  it('renders primary and secondary CTAs', () => {
    render(<HeroSection {...defaultProps} />);

    const postsCta = screen.getByRole('link', { name: /đọc bài viết/i });
    expect(postsCta).toHaveAttribute('href', '/posts');

    const booksCta = screen.getByRole('link', { name: /thư viện sách/i });
    expect(booksCta).toHaveAttribute('href', '/books');
  });

  it('renders with custom content', () => {
    const customProps = {
      title: 'Custom Title',
      tagline: 'Custom Tagline',
      description: 'Custom Description',
    };

    render(<HeroSection {...customProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
    expect(screen.getByText('Custom Tagline')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });
});
