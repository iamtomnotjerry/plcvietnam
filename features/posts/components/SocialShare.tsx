/**
 * SocialShare Component
 * Social sharing buttons for posts
 * Validates Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export interface SocialShareProps {
  /**
   * URL to share
   */
  url: string;

  /**
   * Title to share
   */
  title: string;

  /**
   * Optional class name for styling
   */
  className?: string;
}

/**
 * SocialShare Component
 *
 * Provides social sharing buttons for Facebook, LinkedIn, Twitter/X, and copy link.
 *
 * Features:
 * - Share to Facebook, LinkedIn, Twitter/X
 * - Copy link to clipboard with confirmation toast
 * - Opens share dialogs in new tabs
 * - Accessible button labels
 *
 * Requirements:
 * - 14.1: Display social sharing buttons on post detail page
 * - 14.2: Facebook share dialog with post URL and title
 * - 14.3: LinkedIn share dialog with post URL
 * - 14.4: Twitter/X compose dialog with post title and URL
 * - 14.5: Copy link button with clipboard API and confirmation toast
 */
export function SocialShare({ url, title, className = '' }: SocialShareProps) {
  const t = useTranslations('posts');
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  /**
   * Share URLs for each platform
   */
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  /**
   * Handle copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedToast(true);

      // Hide toast after 2 seconds
      setTimeout(() => {
        setShowCopiedToast(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  /**
   * Handle share button click - open in new tab
   */
  const handleShare = (platform: 'facebook' | 'linkedin' | 'twitter') => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Share label */}
      <span className="text-sm font-medium text-muted-foreground">{t('shareLabel')}</span>

      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-full
          bg-[#1877F2] hover:bg-[#1877F2]/90
          text-white
          transition-colors duration-200
          cursor-pointer
        "
        aria-label={t('shareFacebook')}
        title={t('shareFacebook')}
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-full
          bg-[#0A66C2] hover:bg-[#0A66C2]/90
          text-white
          transition-colors duration-200
          cursor-pointer
        "
        aria-label={t('shareLinkedIn')}
        title={t('shareLinkedIn')}
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => handleShare('twitter')}
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-full
          bg-[#000000] hover:bg-[#000000]/90
          text-white
          transition-colors duration-200
          cursor-pointer
        "
        aria-label={t('shareTwitter')}
        title={t('shareTwitter')}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Copy Link */}
      <div className="relative">
        <button
          onClick={handleCopyLink}
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-full
            bg-muted hover:bg-muted/80
            text-muted-foreground hover:text-foreground
            transition-colors duration-200
            cursor-pointer
          "
          aria-label={t('copyLink')}
          title={t('copyLink')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Copied toast */}
        {showCopiedToast && (
          <div
            className="
            absolute -top-12 left-1/2 -translate-x-1/2
            px-3 py-2
            bg-foreground text-background
            text-sm font-medium
            rounded-md
            whitespace-nowrap
            shadow-lg
            animate-in fade-in slide-in-from-bottom-2
            duration-200
          "
          >
            {t('copiedToast')}
          </div>
        )}
      </div>
    </div>
  );
}
