"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, Cerere } from "@/types/api";
import type { CerereStatusType } from "@/lib/validations/cereri";

interface UseCereriListParams {
  page?: number;
  limit?: number;
  status?: CerereStatusType;
  tipCerereId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: "created_at" | "updated_at" | "data_termen" | "numar_inregistrare";
  order?: "asc" | "desc";
}

interface UseCereriListResult {
  cereri: Cerere[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching cereri list with filters and pagination
 * Uses React Query for caching, loading states, and automatic refetching
 *
 * ENHANCED (Issue #88): Added date range filtering support
 *
 * @param params - Filter and pagination parameters
 * @returns Query result with cereri data and pagination metadata
 */
export function useCereriList(params: UseCereriListParams = {}): UseCereriListResult {
  const {
    page = 1,
    limit = 20,
    status,
    tipCerereId,
    search,
    dateFrom,
    dateTo,
    sort = "created_at",
    order = "desc",
  } = params;

  const queryKey = [
    "cereri",
    { page, limit, status, tipCerereId, search, dateFrom, dateTo, sort, order },
  ];

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResponse<Cerere>>({
    queryKey,
    queryFn: async () => {
      // Build query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      if (status) queryParams.set("status", status);
      if (tipCerereId) queryParams.set("tip_cerere_id", tipCerereId);
      if (search) queryParams.set("search", search);

      // ENHANCED (Issue #88): Date range parameters
      if (dateFrom) {
        queryParams.set("date_from", dateFrom.toISOString());
      }
      if (dateTo) {
        queryParams.set("date_to", dateTo.toISOString());
      }

      const response = await fetch(`/api/cereri?${queryParams.toString()}`, {
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
        throw new Error(errorData.error?.message || "Failed to fetch cereri");
      }

      return response.json();
    },
    // Stale time of 30 seconds - data is considered fresh for this duration
    staleTime: 30 * 1000,
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });

  return {
    cereri: data?.data.items || [],
    pagination: data?.data.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    },
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
