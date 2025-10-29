"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";

export interface MetricData {
  current: number;
  previous: number;
  trend: "up" | "down" | "stable";
  sparklineData: Array<{ value: number; label: string }>;
  historicalData: Array<{ date: string; value: number }>;
  breakdown: Array<{ name: string; value: number; percentage: number }>;
}

export interface MetricsResponse {
  totalResponses: MetricData;
  completedResponses: MetricData;
  citizenResponses: MetricData;
  officialResponses: MetricData;
  completionRate: MetricData;
}

/**
 * Fetches metrics data from the API
 */
async function fetchMetrics(): Promise<MetricsResponse> {
  const response = await fetch("/api/admin/survey/stats");

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for fetching dashboard metrics data with React Query
 *
 * Features:
 * - Automatic refetching every 1 minute for real-time updates
 * - 5-minute stale time (from global config)
 * - Retry logic with exponential backoff
 * - Loading, error, and success states
 */
export function useMetricsData() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchMetrics,
    // Refetch every 1 minute for real-time updates
    refetchInterval: 60 * 1000,
    // Refetch when window gains focus (enabled for dashboard)
    refetchOnWindowFocus: true,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });

  return {
    // Data
    data: query.data,
    totalResponses: query.data?.totalResponses,
    completedResponses: query.data?.completedResponses,
    citizenResponses: query.data?.citizenResponses,
    officialResponses: query.data?.officialResponses,
    completionRate: query.data?.completionRate,

    // State flags
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,

    // Error handling
    error: query.error,

    // Manual refetch
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single metric's detailed data
 */
export function useMetricDetail(metricType: keyof MetricsResponse) {
  const { data, isLoading, isError, error } = useMetricsData();

  return {
    data: data?.[metricType],
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook for getting sparkline data for a specific metric
 */
export function useSparklineData(metricType: keyof MetricsResponse) {
  const { data, isLoading } = useMetricsData();

  return {
    sparklineData: data?.[metricType]?.sparklineData || [],
    isLoading,
  };
}

/**
 * Hook for getting historical data for a specific metric
 */
export function useHistoricalData(metricType: keyof MetricsResponse) {
  const { data, isLoading } = useMetricsData();

  return {
    historicalData: data?.[metricType]?.historicalData || [],
    isLoading,
  };
}

/**
 * Hook for getting breakdown data for a specific metric
 */
export function useBreakdownData(metricType: keyof MetricsResponse) {
  const { data, isLoading } = useMetricsData();

  return {
    breakdown: data?.[metricType]?.breakdown || [],
    isLoading,
  };
}

/**
 * Helper function to generate mock data for development
 * This will be replaced with actual API data in production
 */
export function generateMockMetrics(): MetricsResponse {
  const now = new Date();

  // Generate sparkline data for the last 7 days
  const generateSparkline = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.floor(baseValue * (0.7 + Math.random() * 0.6)),
      label: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("ro-RO", {
        month: "short",
        day: "numeric",
      }),
    }));
  };

  // Generate historical data for the last 30 days
  const generateHistorical = (baseValue: number) => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("ro-RO", {
        month: "short",
        day: "numeric",
      }),
      value: Math.floor(baseValue * (0.7 + Math.random() * 0.6)),
    }));
  };

  const totalCurrent = 247;
  const totalPrevious = 189;
  const completedCurrent = 182;
  const completedPrevious = 145;

  return {
    totalResponses: {
      current: totalCurrent,
      previous: totalPrevious,
      trend: "up",
      sparklineData: generateSparkline(totalCurrent),
      historicalData: generateHistorical(totalCurrent),
      breakdown: [
        { name: "Cetățeni", value: 158, percentage: 63.97 },
        { name: "Funcționari", value: 89, percentage: 36.03 },
      ],
    },
    completedResponses: {
      current: completedCurrent,
      previous: completedPrevious,
      trend: "up",
      sparklineData: generateSparkline(completedCurrent),
      historicalData: generateHistorical(completedCurrent),
      breakdown: [
        { name: "Cetățeni - Completat", value: 115, percentage: 63.19 },
        { name: "Funcționari - Completat", value: 67, percentage: 36.81 },
      ],
    },
    citizenResponses: {
      current: 158,
      previous: 120,
      trend: "up",
      sparklineData: generateSparkline(158),
      historicalData: generateHistorical(158),
      breakdown: [
        { name: "Completat", value: 115, percentage: 72.78 },
        { name: "Draft", value: 43, percentage: 27.22 },
      ],
    },
    officialResponses: {
      current: 89,
      previous: 69,
      trend: "up",
      sparklineData: generateSparkline(89),
      historicalData: generateHistorical(89),
      breakdown: [
        { name: "Completat", value: 67, percentage: 75.28 },
        { name: "Draft", value: 22, percentage: 24.72 },
      ],
    },
    completionRate: {
      current: 73.68,
      previous: 76.72,
      trend: "down",
      sparklineData: generateSparkline(75),
      historicalData: generateHistorical(75),
      breakdown: [
        { name: "Cetățeni - Rate", value: 72.78, percentage: 50 },
        { name: "Funcționari - Rate", value: 75.28, percentage: 50 },
      ],
    },
  };
}
