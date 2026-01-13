"use client";

import { useQuery } from "@tanstack/react-query";

// Types for chart data
export interface CerereTimelineData {
  id: string;
  numar_cerere: string;
  tip_cerere: {
    nume: string;
  };
  status: string;
  progress: {
    percentage: number;
    current_step: string;
    eta_days: number | null;
    last_activity: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface PlatiMonthlyData {
  monthly: Array<{
    month: string;
    month_label: string;
    total_suma: number;
    total_plati: number;
    success_count: number;
    pending_count: number;
    success_suma: number;
    pending_suma: number;
  }>;
  summary: {
    total_year: number;
    total_month_current: number;
    upcoming_payments: number;
  };
}

export interface ServiceBreakdownData {
  breakdown: Array<{
    tip_cerere_id: string;
    tip_cerere_nume: string;
    categorie: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

/**
 * Hook for fetching cereri timeline data (for StatusTimelineChart)
 */
export function useCereriTimeline() {
  return useQuery<ApiResponse<CerereTimelineData[]>>({
    queryKey: ["dashboard", "cereri-timeline"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/cereri-timeline", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch cereri timeline");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching monthly payments data (for PlatiOverviewChart)
 */
export function usePlatiMonthly() {
  return useQuery<ApiResponse<PlatiMonthlyData>>({
    queryKey: ["dashboard", "plati-monthly"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/plati-monthly", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch plati monthly data");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching service breakdown data (for ServiceBreakdownChart)
 */
export function useServiceBreakdown() {
  return useQuery<ApiResponse<ServiceBreakdownData>>({
    queryKey: ["dashboard", "service-breakdown"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/service-breakdown", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch service breakdown");
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (breakdown changes less frequently)
    refetchOnWindowFocus: false,
  });
}
