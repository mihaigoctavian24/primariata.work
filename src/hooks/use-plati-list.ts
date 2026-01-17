"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, Plata } from "@/types/api";
import type { PlataStatusType } from "@/lib/validations/plati";

interface UsePlatiListParams {
  page?: number;
  limit?: number;
  status?: PlataStatusType;
  dateFrom?: string;
  dateTo?: string;
  sort?: "created_at" | "suma";
  order?: "asc" | "desc";
}

interface UsePlatiListResult {
  plati: Plata[];
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
 * Custom hook for fetching plati list with filters and pagination
 * Uses React Query for caching, loading states, and automatic refetching
 *
 * @param params - Filter and pagination parameters
 * @returns Query result with plati data and pagination metadata
 */
export function usePlatiList(params: UsePlatiListParams = {}): UsePlatiListResult {
  const {
    page = 1,
    limit = 20,
    status,
    dateFrom,
    dateTo,
    sort = "created_at",
    order = "desc",
  } = params;

  const queryKey = ["plati", { page, limit, status, dateFrom, dateTo, sort, order }];

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResponse<Plata>>({
    queryKey,
    queryFn: async () => {
      // Build query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      if (status) {
        queryParams.append("status", status);
      }

      if (dateFrom) {
        queryParams.append("date_from", dateFrom);
      }

      if (dateTo) {
        queryParams.append("date_to", dateTo);
      }

      // Fetch from API
      const response = await fetch(`/api/plati?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Eroare la încărcarea plăților");
      }

      return response.json();
    },
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });

  return {
    plati: data?.data.items || [],
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
