'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export interface NavigationTreeSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  clearLabel: string;
  className?: string;
}

export function NavigationTreeSearch({
  value,
  onChange,
  onClear,
  placeholder,
  clearLabel,
  className = '',
}: NavigationTreeSearchProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2}
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 border-border/80 bg-background/80 pl-9 pr-9 shadow-sm backdrop-blur-sm transition-[box-shadow,border-color] focus-visible:bg-background"
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={clearLabel}
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
