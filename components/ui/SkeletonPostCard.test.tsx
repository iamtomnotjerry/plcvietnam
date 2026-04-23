/**
 * SkeletonPostCard Component Tests
 * Validates Requirements: 17.1, 17.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonPostCard } from './SkeletonPostCard';

describe('SkeletonPostCard', () => {
  it('renders without errors', () => {
    render(<SkeletonPostCard />);
    expect(screen.getByTestId('skeleton-post-card')).toBeInTheDocument();
  });

  it('has animate-pulse class on skeleton elements', () => {
    render(<SkeletonPostCard />);
    const container = screen.getByTestId('skeleton-post-card');
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('has aria-hidden to hide from assistive technology', () => {
    render(<SkeletonPostCard />);
    const container = screen.getByTestId('skeleton-post-card');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders title placeholder lines (2 lines)', () => {
    const { container } = render(<SkeletonPostCard />);
    // Title section has 2 lines inside a space-y-2 div after the category badge
    const content = container.querySelector('.p-5');
    expect(content).toBeInTheDocument();
    // There should be multiple animate-pulse elements representing title + excerpt + metadata
    const pulseElements = content!.querySelectorAll('.animate-pulse');
    // 1 category + 2 title + 3 excerpt + 2 metadata = 8 minimum
    expect(pulseElements.length).toBeGreaterThanOrEqual(8);
  });

  it('renders excerpt placeholder lines (3 lines)', () => {
    const { container } = render(<SkeletonPostCard />);
    // Excerpt section has 3 lines inside a space-y-2 div
    const excerptSection = container.querySelectorAll('.mb-4.space-y-2');
    expect(excerptSection.length).toBeGreaterThan(0);
    const excerptLines = excerptSection[0].querySelectorAll('.animate-pulse');
    expect(excerptLines.length).toBe(3);
  });

  it('renders metadata row with date and reading time placeholders', () => {
    const { container } = render(<SkeletonPostCard />);
    // Metadata row is a flex container with 2 items
    const metadataRow = container.querySelector('.flex.items-center.gap-4');
    expect(metadataRow).toBeInTheDocument();
    const metadataItems = metadataRow!.querySelectorAll('.animate-pulse');
    expect(metadataItems.length).toBe(2);
  });

  it('renders thumbnail placeholder', () => {
    const { container } = render(<SkeletonPostCard />);
    const thumbnail = container.querySelector('.h-\\[200px\\]');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveClass('animate-pulse');
  });

  it('matches expected card structure with border and rounded corners', () => {
    render(<SkeletonPostCard />);
    const card = screen.getByTestId('skeleton-post-card');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-card');
  });
});
