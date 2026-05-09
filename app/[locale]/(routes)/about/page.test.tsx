/**
 * About Page Tests
 * Validates Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage, { generateMetadata } from './page';
import type { Author } from '@/lib/types/domain';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock content repository
const mockAuthor: Author = {
  id: 'author-1',
  name: 'Nguyễn Văn Tự Động',
  email: 'contact@automation-blog.com',
  bio: 'Chuyên gia tự động hóa công nghiệp với hơn 15 năm kinh nghiệm trong lĩnh vực lập trình PLC, SCADA và các hệ thống điều khiển công nghiệp.',
  avatarUrl: '/images/author-avatar.jpg',
  expertise: [
    'Lập trình PLC (Siemens, Allen-Bradley, Mitsubishi)',
    'Hệ thống SCADA (WinCC, Ignition, Wonderware)',
    'Siemens TIA Portal & Step 7',
  ],
  certifications: [
    'Siemens Certified Programmer - TIA Portal',
    'Rockwell Automation Certified Professional',
  ],
  socialLinks: {
    email: 'contact@automation-blog.com',
    linkedin: 'https://linkedin.com/in/automation-expert',
    github: 'https://github.com/automation-blog',
    twitter: 'https://twitter.com/automation-blog',
  },
};

vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getAuthor: vi.fn(() => Promise.resolve(mockAuthor)),
  },
}));

const aboutProps = { params: Promise.resolve({ locale: 'vi' }) };

describe('AboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display author name and professional title', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.2: Display author name and professional title
    expect(screen.getByText('Nguyễn Văn Tự Động')).toBeInTheDocument();
    expect(screen.getByText('Automation Consultant')).toBeInTheDocument();
  });

  it('should display author avatar with correct alt text', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.2: Display profile photo
    const avatar = screen.getByAltText('Nguyễn Văn Tự Động');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/images/author-avatar.jpg');
  });

  it('should display author biography', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.2: Display professional biography
    expect(screen.getByText(/Chuyên gia tư vấn tự động hóa/)).toBeInTheDocument();
  });

  it('should display all expertise areas as tags', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.2: Display areas of expertise
    expect(screen.getByText('Chuyên môn')).toBeInTheDocument();
    expect(
      screen.getByText('Lập trình PLC (Siemens, Allen-Bradley, Mitsubishi)')
    ).toBeInTheDocument();
    expect(screen.getByText('Hệ thống SCADA (WinCC, Ignition, Wonderware)')).toBeInTheDocument();
    expect(screen.getByText('Siemens TIA Portal & Step 7')).toBeInTheDocument();
  });

  it('should display all certifications with icons', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.3: Display certifications
    expect(screen.getByText('Chứng chỉ')).toBeInTheDocument();
    expect(screen.getByText('Siemens Certified Programmer - TIA Portal')).toBeInTheDocument();
    expect(screen.getByText('Rockwell Automation Certified Professional')).toBeInTheDocument();
  });

  it('should display contact section with all social links', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.2: Display contact information
    expect(screen.getByText('Liên hệ')).toBeInTheDocument();

    // Check for social link labels
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('should open email link with mailto protocol', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.4: Contact links open in new tab
    const emailLink = screen.getByText('Email').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@automation-blog.com');
    expect(emailLink).toHaveAttribute('target', '_blank');
    expect(emailLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should open social profile links in new tab with security attributes', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.4: Social links open in new tab
    const linkedinLink = screen.getByText('LinkedIn').closest('a');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/automation-expert');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubLink = screen.getByText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/automation-blog');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/automation-blog');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display breadcrumb navigation', async () => {
    const page = await AboutPage(aboutProps);
    render(page);

    // Requirement 6.1: Accessible from main navigation (aria-label from message catalog)
    const breadcrumb = screen.getByRole('navigation', { name: 'Dẫn hướng' });
    expect(breadcrumb).toBeInTheDocument();
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();

    // Check for breadcrumb item specifically (not the section heading)
    const breadcrumbItems = screen.getAllByText('Giới thiệu');
    expect(breadcrumbItems.length).toBeGreaterThan(0);
  });

  it('should handle author without optional social links', async () => {
    const authorWithoutTwitter: Author = {
      ...mockAuthor,
      socialLinks: {
        email: 'contact@automation-blog.com',
        linkedin: 'https://linkedin.com/in/automation-expert',
      },
    };

    vi.mocked(
      (await import('@/lib/data/factory')).contentRepository.getAuthor
    ).mockResolvedValueOnce(authorWithoutTwitter);

    const page = await AboutPage(aboutProps);
    render(page);

    // Should display available links
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();

    // Should not display missing links
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  it('should generate correct metadata with author name and bio', async () => {
    const metadata = await generateMetadata(aboutProps);

    expect(metadata.title).toBe('Giới thiệu - Nguyễn Văn Tự Động');
    expect(metadata.description).toContain('Trần Văn Hiếu');
  });
});
