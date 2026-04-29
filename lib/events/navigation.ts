/**
 * Navigation Tree Events
 * Custom events for triggering navigation tree refresh across components
 */

export const NAVIGATION_REFRESH_EVENT = 'navigation:refresh';

/**
 * Trigger navigation tree refresh
 * Call this after any CMS operation that affects the navigation tree
 * (creating/updating/deleting fields, categories, or posts)
 */
export function triggerNavigationRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NAVIGATION_REFRESH_EVENT));
  }
}

/**
 * Listen for navigation refresh events
 * @param callback Function to call when refresh is triggered
 * @returns Cleanup function to remove the event listener
 */
export function onNavigationRefresh(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(NAVIGATION_REFRESH_EVENT, callback);
  return () => window.removeEventListener(NAVIGATION_REFRESH_EVENT, callback);
}
