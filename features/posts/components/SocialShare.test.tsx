/**
 * SocialShare Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialShare } from './SocialShare';

describe('SocialShare', () => {
  const mockUrl = 'https://example.com/post';
  const mockTitle = 'Test Post Title';
  
  beforeEach(() => {
    // Mock window.open
    vi.stubGlobal('open', vi.fn());
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('renders all social share buttons', () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    expect(screen.getByLabelText('Chia sẻ lên Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Chia sẻ lên LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Chia sẻ lên Twitter/X')).toBeInTheDocument();
    expect(screen.getByLabelText('Sao chép liên kết')).toBeInTheDocument();
  });
  
  it('renders share label', () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    expect(screen.getByText('Chia sẻ:')).toBeInTheDocument();
  });
  
  it('opens Facebook share dialog when Facebook button is clicked', () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    const facebookButton = screen.getByLabelText('Chia sẻ lên Facebook');
    fireEvent.click(facebookButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });
  
  it('opens LinkedIn share dialog when LinkedIn button is clicked', () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    const linkedinButton = screen.getByLabelText('Chia sẻ lên LinkedIn');
    fireEvent.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing'),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });
  
  it('opens Twitter share dialog when Twitter button is clicked', () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    const twitterButton = screen.getByLabelText('Chia sẻ lên Twitter/X');
    fireEvent.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });
  
  it('copies link to clipboard when copy button is clicked', async () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    const copyButton = screen.getByLabelText('Sao chép liên kết');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl);
    });
  });
  
  it('shows confirmation toast after copying link', async () => {
    render(<SocialShare url={mockUrl} title={mockTitle} />);
    
    const copyButton = screen.getByLabelText('Sao chép liên kết');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Đã sao chép!')).toBeInTheDocument();
    });
  });
  
  it('encodes URL and title in share URLs', () => {
    const urlWithSpecialChars = 'https://example.com/post?id=123&lang=vi';
    const titleWithSpecialChars = 'Test & Title';
    
    render(<SocialShare url={urlWithSpecialChars} title={titleWithSpecialChars} />);
    
    const facebookButton = screen.getByLabelText('Chia sẻ lên Facebook');
    fireEvent.click(facebookButton);
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(urlWithSpecialChars)),
      expect.any(String),
      expect.any(String)
    );
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <SocialShare url={mockUrl} title={mockTitle} className="custom-class" />
    );
    
    const shareContainer = container.firstChild;
    expect(shareContainer).toHaveClass('custom-class');
  });
});
