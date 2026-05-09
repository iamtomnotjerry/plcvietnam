/**
 * Loading UI for (routes) group
 * Displays skeleton while pages are loading
 */

import { RouteLoadingFallback } from '@/components/RouteLoadingFallback';

export default function Loading() {
  return <RouteLoadingFallback />;
}
