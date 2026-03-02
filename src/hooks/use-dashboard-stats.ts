"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/app/api/dashboard/stats/route";
import type { ApiResponse } from "@/types/api";

interface UseDashboardStatsOptions {
  judet?: string;
  localitate?: string;
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching dashboard statistics
 * Uses React Query for caching, loading states, and automatic refetching
 *
 * @param options - judet and localitate slugs for primarie context
 * @returns Query result with dashboard statistics
 */
export function useDashboardStats(options?: UseDashboardStatsOptions): UseDashboardStatsResult {
  const { judet, localitate } = options ?? {};

  const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["dashboard", "stats", judet, localitate],
    enabled: !!judet && !!localitate,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (judet) params.set("judet", judet);
      if (localitate) params.set("localitate", localitate);

      const response = await fetch(`/api/dashboard/stats?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch dashboard stats");
      }

      return response.json();
    },
    // Stale time of 60 seconds - dashboard stats don't need to be real-time
    staleTime: 60 * 1000,
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
  });

  return {
    stats: data?.data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
