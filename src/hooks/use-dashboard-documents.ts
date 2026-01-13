"use client";

import { useQuery } from "@tanstack/react-query";

// Types for documents
export interface Document {
  id: string;
  nume: string;
  tip_document: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  cerere_id?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

interface UseDocumentsOptions {
  days?: number;
  cerereId?: string;
  type?: string;
  status?: string;
  limit?: number;
}

/**
 * Hook for fetching recent documents
 *
 * @param options - Filter options for documents query
 * @returns Query result with documents array
 */
export function useDashboardDocuments(options: UseDocumentsOptions = {}) {
  const { days = 7, cerereId, type, status, limit = 10 } = options;

  // Build query params
  const params = new URLSearchParams();
  params.append("days", days.toString());
  if (cerereId) params.append("cerere_id", cerereId);
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  params.append("limit", limit.toString());

  return useQuery<ApiResponse<Document[]>>({
    queryKey: ["dashboard", "documents", options],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/documents?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch documents");
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
