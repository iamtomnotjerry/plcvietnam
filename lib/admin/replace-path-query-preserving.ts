/**
 * Updates the browser URL via `history.replaceState` without triggering RSC refetch.
 * Copies selected keys from the current query into `nextQuery` (e.g. `compose=1` for post composer deep-link).
 */
export function replacePathQueryPreserving(
  pathname: string,
  nextQuery: URLSearchParams | string,
  preserveKeys: readonly string[]
): void {
  if (typeof window === 'undefined') return;
  const merged =
    typeof nextQuery === 'string' ? new URLSearchParams(nextQuery) : new URLSearchParams(nextQuery);
  const current = new URLSearchParams(window.location.search);
  for (const key of preserveKeys) {
    const v = current.get(key);
    if (v !== null) merged.set(key, v);
  }
  const qs = merged.toString();
  window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
}
