"use client";

import { useQuery } from "@tanstack/react-query";
import type { NotificationResponse } from "@/types/notifications";
import type { NextStep } from "@/types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

/**
 * Hook for fetching next steps/recommended actions
 */
export function useNextSteps() {
  return useQuery<ApiResponse<NextStep[]>>({
    queryKey: ["dashboard", "next-steps"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/next-steps", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch next steps");
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (recommendations should be fresh)
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching dashboard notifications
 */
export function useDashboardNotifications() {
  return useQuery<NotificationResponse>({
    queryKey: ["dashboard", "notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds (notifications should be very fresh)
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Poll every minute for new notifications
  });
}
