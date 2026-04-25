/**
 * Badge Component
 * Reusable badge for tags, categories, status indicators
 */

import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

    const variantStyles = {
      default: 'bg-primary/10 text-primary hover:bg-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      outline: 'border border-border text-foreground hover:bg-accent',
    };

    return (
      <div ref={ref} className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
