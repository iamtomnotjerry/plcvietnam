/** Shared Tailwind classes for auth forms — keep Sign-in / Sign-up / Forgot / Reset visually aligned. */
export const authInputClassName =
  'w-full rounded-xl border border-input bg-background/90 px-3 py-2.5 text-sm shadow-sm transition-[box-shadow,border-color] duration-200 placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35';

export const authPrimaryButtonClassName =
  'w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-[transform,box-shadow,opacity] duration-200 hover:bg-primary/92 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60';

/** Secondary / ghost actions on auth screens (e.g. “Về trang chủ”). */
export const authOutlineButtonClassName =
  'w-full rounded-xl border border-border/80 bg-background/80 py-3 text-sm font-semibold text-foreground shadow-sm transition-[transform,colors,box-shadow] duration-200 hover:border-primary/30 hover:bg-muted/70 active:scale-[0.99]';
