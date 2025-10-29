"use client";

import { useRealTimeData } from "@/hooks/useRealTimeData";
import { LiveIndicator } from "@/components/admin/LiveIndicator";
import { invalidateQueries } from "@/lib/react-query";
import { useEffect } from "react";

interface RealTimeUpdate {
  timestamp: Date;
  changes: {
    newResponses: number;
    updatedResponses: number;
    deletedResponses: number;
  };
  metrics?: {
    total: number;
    completed: number;
    citizens: number;
    officials: number;
    completionRate: number;
  };
  recentResponses?: unknown[];
}

/**
 * Fetches real-time updates from the API
 */
async function fetchRealTimeUpdates(): Promise<RealTimeUpdate> {
  const response = await fetch("/api/admin/survey/realtime?type=all");

  if (!response.ok) {
    throw new Error(`Failed to fetch updates: ${response.statusText}`);
  }

  return response.json();
}

/**
 * RealTimeWrapper Component
 *
 * Wraps the admin dashboard with real-time update capabilities
 * - Auto-refresh data at configurable intervals
 * - Live indicator with settings
 * - Toast notifications for changes
 * - Smart cache invalidation
 */
export function RealTimeWrapper() {
  const {
    data,
    isLive,
    isPulse,
    lastUpdated,
    interval,
    isFetching,
    toggleLive,
    setRefreshInterval,
    manualRefresh,
  } = useRealTimeData<RealTimeUpdate>({
    queryKey: ["admin", "realtime"],
    fetchFn: fetchRealTimeUpdates,
    refetchInterval: 60000, // 1 minute default
    enabled: true,
    enableNotifications: true,
    notificationMessage: (data) => {
      const { newResponses, updatedResponses } = data.changes;

      if (newResponses > 0 && updatedResponses > 0) {
        return `${newResponses} răspunsuri noi, ${updatedResponses} actualizate`;
      } else if (newResponses > 0) {
        return `${newResponses} răspuns${newResponses === 1 ? "" : "uri"} nou${newResponses === 1 ? "" : "i"}`;
      } else if (updatedResponses > 0) {
        return `${updatedResponses} răspuns${updatedResponses === 1 ? "" : "uri"} actualizat${updatedResponses === 1 ? "" : "e"}`;
      }

      return null; // No notification if no changes
    },
  });

  // Invalidate related queries when real-time data updates
  useEffect(() => {
    if (data?.changes) {
      const { newResponses, updatedResponses, deletedResponses } = data.changes;

      // If there are changes, invalidate relevant queries
      if (newResponses > 0 || updatedResponses > 0 || deletedResponses > 0) {
        // Invalidate dashboard stats
        invalidateQueries.dashboard();

        // Invalidate surveys if there are structural changes
        if (newResponses > 0 || deletedResponses > 0) {
          invalidateQueries.surveys();
        }
      }
    }
  }, [data?.changes]);

  return (
    <LiveIndicator
      isLive={isLive}
      isPulse={isPulse}
      lastUpdated={lastUpdated}
      interval={interval}
      isFetching={isFetching}
      onToggleLive={toggleLive}
      onSetInterval={setRefreshInterval}
      onManualRefresh={manualRefresh}
    />
  );
}
