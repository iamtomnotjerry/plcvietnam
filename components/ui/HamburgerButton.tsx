/**
 * HamburgerButton Component
 * Toggles mobile navigation drawer open/closed
 * Validates Requirements: 16.2, 16.6
 */

'use client';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * HamburgerButton
 *
 * 44×44px tap target (w-11 h-11) per Requirement 16.6.
 * Shows hamburger icon when closed, X icon when open.
 * aria-label switches between Vietnamese open/close labels.
 */
export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  const ariaLabel = isOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      className="
        inline-flex items-center justify-center
        w-11 h-11
        rounded-lg
        cursor-pointer
        text-muted-foreground
        hover:bg-muted hover:text-foreground
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      "
    >
      {isOpen ? (
        /* X / close icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        /* Hamburger icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
    </button>
  );
}
