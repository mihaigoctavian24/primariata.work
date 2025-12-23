"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocation } from "@/lib/location-storage";
import { Badge } from "@/components/ui/badge";

/**
 * LocationBadge Component
 *
 * Displays selected location (județ + localitate) with:
 * - Dynamic data fetching from saved location
 * - Animated badge with morphing text
 * - Loading skeleton state
 * - Hover expansion with details (desktop only)
 * - Compact mode for mobile
 *
 * @example
 * <LocationBadge compact={false} animated />
 */

interface LocationData {
  judetNume: string;
  localitateNume: string;
  tip: string;
  populatie?: number;
}

interface LocationBadgeProps {
  compact?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

export function LocationBadge({
  compact = false,
  showIcon = true,
  animated = true,
  className = "",
}: LocationBadgeProps) {
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchLocationData() {
      try {
        const savedLocation = getLocation();
        if (!savedLocation) {
          setLoading(false);
          return;
        }

        // Fetch județ data
        const judeteResponse = await fetch("/api/localitati/judete");
        const judeteData = await judeteResponse.json();
        const judet = judeteData.data?.find(
          (j: { id: number; nume: string; slug: string }) =>
            j.id.toString() === savedLocation.judetId
        );

        // Fetch localitate data
        const localitatiResponse = await fetch(`/api/localitati?judet_id=${savedLocation.judetId}`);
        const localitatiData = await localitatiResponse.json();
        const localitate = localitatiData.data?.find(
          (l: { id: number; nume: string; slug: string; tip?: string; populatie?: number }) =>
            l.id.toString() === savedLocation.localitateId
        );

        if (judet && localitate) {
          setLocationData({
            judetNume: judet.nume,
            localitateNume: localitate.nume,
            tip: localitate.tip || "Localitate",
            populatie: localitate.populatie,
          });
        }
      } catch (error) {
        console.error("Failed to fetch location data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-muted h-8 w-64 rounded-full"></div>
      </div>
    );
  }

  if (!locationData) {
    return null;
  }

  const BadgeContent = () => (
    <>
      {showIcon && <MapPin className="h-4 w-4" />}

      {compact ? (
        <span className="text-sm font-medium">
          {locationData.localitateNume}, Jud. {locationData.judetNume}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm font-medium">
          Primăria
          <Image
            src="/vector_heart.svg"
            alt="❤️"
            width={14}
            height={14}
            className="inline-block"
            style={{ width: "0.875em", height: "0.875em" }}
          />
          {locationData.localitateNume}, Jud. {locationData.judetNume}
        </span>
      )}

      {!compact && (
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      )}
    </>
  );

  const Component = animated ? motion.div : "div";

  return (
    <Component
      className={`relative ${className}`}
      {...(animated && {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, delay: 0.5 },
      })}
    >
      <Badge
        variant="secondary"
        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-white transition-all hover:scale-105"
        style={{
          backgroundColor: "#be3144",
          borderColor: "#be3144",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))",
        }}
        onClick={() => !compact && setExpanded(!expanded)}
      >
        <BadgeContent />
      </Badge>

      {/* Expanded Details (Desktop Only) */}
      <AnimatePresence>
        {expanded && !compact && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-border bg-card absolute top-full right-0 left-0 z-10 mt-2 rounded-lg border p-3 shadow-lg"
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip:</span>
                <span className="font-medium">{locationData.tip}</span>
              </div>
              {locationData.populatie && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Populație:</span>
                  <span className="font-medium">
                    {locationData.populatie.toLocaleString("ro-RO")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Component>
  );
}
