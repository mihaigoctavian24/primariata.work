"use client";

import { useCallback } from "react";
import { saveLocation } from "@/lib/location-storage";

interface SwitchTarget {
  judetSlug: string;
  localitateSlug: string;
  judetId: string;
  localitateId: string;
  redirectPath?: string;
}

/**
 * Hook for handling primarie context switching.
 *
 * Updates the location cookie/localStorage BEFORE navigating to prevent
 * middleware redirect loops, then triggers a full page reload (not router.push)
 * to clear React Query cache, Zustand stores, and Realtime subscriptions.
 */
export function usePrimarieSwitch(): {
  switchPrimarie: (target: SwitchTarget) => void;
} {
  const switchPrimarie = useCallback((target: SwitchTarget): void => {
    // CRITICAL: Update cookie BEFORE navigation to prevent middleware redirect loop
    saveLocation({
      judetSlug: target.judetSlug,
      localitateSlug: target.localitateSlug,
      judetId: target.judetId,
      localitateId: target.localitateId,
    });

    // Build full path
    const fullPath = `/app/${target.judetSlug}/${target.localitateSlug}${target.redirectPath || ""}`;

    // Full page reload (NOT router.push) to clear React Query cache, Zustand, Realtime
    window.location.href = fullPath;
  }, []);

  return { switchPrimarie };
}

/**
 * Parse an action_url from notification data into a relative path.
 *
 * Handles mixed formats from different DB triggers:
 * - Absolute: `/app/timis/timisoara/cereri/123` -> `/cereri/123`
 * - Relative: `/cereri/123` -> `/cereri/123` (returned as-is)
 */
export function parseActionUrl(actionUrl: string): string {
  if (actionUrl.startsWith("/app/")) {
    // Extract path after /app/{judet}/{localitate}
    const parts = actionUrl.split("/");
    // parts: ["", "app", judet, localitate, ...rest]
    if (parts.length > 4) {
      return "/" + parts.slice(4).join("/");
    }
    return "/";
  }

  // Already relative -- return as-is
  return actionUrl;
}
