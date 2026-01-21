/**
 * Location Sync Helper
 * Syncs localStorage location to database after authentication
 */

import { getLocation } from "./location-storage";

/**
 * Sync saved location from localStorage to database
 * This should be called after successful authentication
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function syncLocationToDatabase(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get saved location from localStorage
    const location = getLocation();

    if (!location) {
      console.log("[sync-location] No saved location found in localStorage");
      return { success: true }; // Not an error - user may not have selected location yet
    }

    console.log("[sync-location] Syncing location to database:", {
      localitateId: location.localitateId,
      judetSlug: location.judetSlug,
      localitateSlug: location.localitateSlug,
    });

    // Call API to set location in database
    const response = await fetch("/api/location/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localitateId: location.localitateId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || "Failed to sync location to database";
      console.error("[sync-location] API error:", errorMessage);
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    console.log("[sync-location] ✅ Location synced successfully to database:", data);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[sync-location] Failed to sync location:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if user has location set in database
 * @returns Promise<boolean>
 */
export async function hasLocationInDatabase(): Promise<boolean> {
  try {
    const response = await fetch("/api/location/check", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasLocation === true;
  } catch (error) {
    console.error("[sync-location] Failed to check location:", error);
    return false;
  }
}
