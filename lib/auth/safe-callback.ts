export function resolveSafeCallbackPath(input: string | null | undefined, fallback = '/'): string {
  if (!input) return fallback;

  try {
    if (input.startsWith('/')) {
      return input.startsWith('//') ? fallback : input;
    }

    const parsed = new URL(input);
    const currentOrigin =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : null;

    if (!currentOrigin || parsed.origin !== currentOrigin) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
