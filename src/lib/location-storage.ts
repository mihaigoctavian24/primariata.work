/**
 * Location Storage Management
 * Handles localStorage + cookie persistence for selected location (județ + localitate)
 */

export interface SavedLocation {
  judetSlug: string;
  localitateSlug: string;
  judetId: string;
  localitateId: string;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = "selected_location";
const COOKIE_NAME = "selected_location";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Save location to localStorage and cookie
 * @param location - Location data to save
 */
export function saveLocation(location: Omit<SavedLocation, "savedAt">): void {
  if (typeof window === "undefined") return; // Server-side guard

  const dataToSave: SavedLocation = {
    ...location,
    savedAt: new Date().toISOString(),
  };

  try {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

    // Save to cookie (for server-side access)
    const cookieValue = encodeURIComponent(JSON.stringify(dataToSave));
    document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;

    console.log("[location-storage] Location saved:", dataToSave);
  } catch (error) {
    console.error("[location-storage] Failed to save location:", error);
  }
}

/**
 * Get saved location from localStorage
 * Falls back to cookie if localStorage is empty
 * @returns SavedLocation | null
 */
export function getLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null; // Server-side guard

  try {
    // Try localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SavedLocation;
      return parsed;
    }

    // Fallback to cookie
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
      const decoded = decodeURIComponent(cookieValue);
      const parsed = JSON.parse(decoded) as SavedLocation;

      // Sync back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      return parsed;
    }

    return null;
  } catch (error) {
    console.error("[location-storage] Failed to get location:", error);
    return null;
  }
}

/**
 * Clear saved location from localStorage and cookie
 */
export function clearLocation(): void {
  if (typeof window === "undefined") return; // Server-side guard

  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);

    // Clear cookie by setting max-age=0
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;

    console.log("[location-storage] Location cleared");
  } catch (error) {
    console.error("[location-storage] Failed to clear location:", error);
  }
}

/**
 * Helper: Get cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());
    if (cookieName === name) {
      return cookieValue || null;
    }
  }

  return null;
}

/**
 * Validate that saved location still exists in database
 * This should be called on app init to verify saved slugs are valid
 * @param location - Location to validate
 * @returns Promise<boolean> - true if valid
 */
export async function validateLocation(location: SavedLocation): Promise<boolean> {
  try {
    // Verify județ exists
    const judeteResponse = await fetch("/api/localitati/judete");
    if (!judeteResponse.ok) return false;

    const judeteData = await judeteResponse.json();
    const judetExists = judeteData.data?.some(
      (j: { slug: string; id: number }) =>
        j.slug === location.judetSlug && j.id.toString() === location.judetId
    );

    if (!judetExists) return false;

    // Verify localitate exists
    const localitatiResponse = await fetch(`/api/localitati?judet_id=${location.judetId}`);
    if (!localitatiResponse.ok) return false;

    const localitatiData = await localitatiResponse.json();
    const localitateExists = localitatiData.data?.some(
      (l: { slug: string; id: number }) =>
        l.slug === location.localitateSlug && l.id.toString() === location.localitateId
    );

    return localitateExists;
  } catch (error) {
    console.error("[location-storage] Failed to validate location:", error);
    return false;
  }
}
