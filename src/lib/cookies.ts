/**
 * Cookie Helpers
 *
 * Client-side cookie utilities for sidebar collapse state persistence.
 * Uses cookies (not localStorage) so server components can read the value
 * on first render, preventing layout shift / hydration mismatch.
 */

export const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export function getSidebarCollapsed(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SIDEBAR_COLLAPSED_KEY}=([^;]*)`));
  return match ? match[1] === "true" : false;
}

export function setSidebarCollapsed(collapsed: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SIDEBAR_COLLAPSED_KEY}=${collapsed};path=/;max-age=31536000;SameSite=Lax`;
}
