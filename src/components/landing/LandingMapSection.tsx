"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocation } from "@/lib/location-storage";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

// Dynamic import of MapWidget (Leaflet cannot SSR)
const MapWidget = dynamic(
  () => import("@/components/dashboard/MapWidget").then((mod) => ({ default: mod.MapWidget })),
  { ssr: false }
);

/**
 * Parse PostgreSQL POINT type returned as string "(lng,lat)" from Supabase
 */
function parseCoordonate(coordonate: unknown): { lng: number; lat: number } | null {
  if (!coordonate) return null;
  const str = String(coordonate);
  const match = str.match(/\(([^,]+),([^)]+)\)/);
  if (!match || !match[1] || !match[2]) return null;
  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);
  if (isNaN(lng) || isNaN(lat)) return null;
  return { lng, lat };
}

interface MapData {
  lat: number;
  lng: number;
  locationName: string;
  primarieInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
  };
}

/**
 * LandingMapSection -- shows an interactive Leaflet map on the landing page
 * that updates when the user selects a localitate via HeroSection Step 2.
 *
 * - Reads location from localStorage via getLocation()
 * - Fetches coordinates from Supabase localitati table
 * - Fetches primarie info for the popup
 * - Polls every 2s while no location is selected
 * - Listens for storage events for cross-tab updates
 * - Fade-in animation when map appears
 */
export function LandingMapSection(): React.JSX.Element {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  const fetchMapData = useCallback(async (): Promise<void> => {
    const location = getLocation();
    if (!location) {
      setHasLocation(false);
      return;
    }

    setHasLocation(true);

    // Don't refetch if we already have data for this location
    if (mapData && mapData.locationName) return;

    try {
      const supabase = createClient();

      // Fetch coordinates and primarie info in parallel
      const [localitateResult, primarieResult] = await Promise.all([
        supabase
          .from("localitati")
          .select("id, nume, coordonate")
          .eq("slug", location.localitateSlug)
          .single(),
        supabase
          .from("primarii")
          .select("nume_oficial, adresa, telefon, email, program_lucru")
          .eq("slug", location.localitateSlug)
          .single(),
      ]);

      if (localitateResult.error) {
        logger.error("[LandingMapSection] Error fetching localitate:", localitateResult.error);
        return;
      }

      const coords = parseCoordonate(localitateResult.data?.coordonate);
      if (!coords) {
        logger.warn("[LandingMapSection] No coordinates for localitate:", location.localitateSlug);
        return;
      }

      const primarieData = primarieResult.data;

      setMapData({
        lat: coords.lat,
        lng: coords.lng,
        locationName: localitateResult.data?.nume ?? location.localitateSlug,
        primarieInfo: primarieData
          ? {
              name: primarieData.nume_oficial,
              address: primarieData.adresa ?? undefined,
              phone: primarieData.telefon ?? undefined,
              email: primarieData.email ?? undefined,
              workingHours: primarieData.program_lucru ?? undefined,
            }
          : undefined,
      });
    } catch (error) {
      logger.error("[LandingMapSection] Error fetching map data:", error);
    }
  }, [mapData]);

  // Poll for location every 2s while no location is selected
  useEffect(() => {
    // Initial check
    fetchMapData();

    if (hasLocation) return;

    const interval = setInterval(() => {
      fetchMapData();
    }, 2000);

    return () => clearInterval(interval);
  }, [hasLocation, fetchMapData]);

  // Listen for storage events (cross-tab location changes)
  useEffect(() => {
    const handleStorage = (e: StorageEvent): void => {
      if (e.key === "selected_location") {
        fetchMapData();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchMapData]);

  // Memoize the primarie info to prevent unnecessary re-renders
  const primarieInfo = useMemo(() => mapData?.primarieInfo, [mapData?.primarieInfo]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <AnimatePresence mode="wait">
        {mapData ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            style={{ height: "clamp(300px, 40vw, 400px)" }}
          >
            <MapWidget
              lat={mapData.lat}
              lng={mapData.lng}
              locationName={mapData.locationName}
              zoom={14}
              primarieInfo={primarieInfo}
            />
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30"
            style={{ height: "clamp(200px, 30vw, 300px)" }}
          >
            <div className="text-center">
              <MapPin className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Selecteaza localitatea pentru a vedea harta
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
