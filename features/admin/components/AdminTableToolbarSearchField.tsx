'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

type AdminTableToolbarSearchFieldProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  /** Merged after base `pl-9` (e.g. min width). */
  inputClassName?: string;
};

/** Shared search control for admin table toolbars (matches `AdminDataTable` styling). */
export function AdminTableToolbarSearchField({
  id,
  name,
  value,
  onChange,
  placeholder,
  ariaLabel,
  inputClassName,
}: AdminTableToolbarSearchFieldProps) {
  return (
    <div className="relative max-w-md flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={['pl-9', inputClassName].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
      />
    </div>
  );
}
