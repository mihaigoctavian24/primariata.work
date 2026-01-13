"use client";

import { useQuery } from "@tanstack/react-query";
import type { Document } from "./use-dashboard-documents";

// Types for search results
export interface CerereSearchResult {
  id: string;
  numar_cerere: string;
  tip_cerere: string;
  status: string;
  data_depunere: string;
  observatii?: string;
}

export interface PlataSearchResult {
  id: string;
  numar_plata: string;
  suma: number;
  status: string;
  scadenta?: string;
  tip_plata?: string;
}

export type SearchResultType = "cerere" | "plata" | "document";

export interface SearchResult {
  type: SearchResultType;
  data: CerereSearchResult | PlataSearchResult | Document;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

/**
 * Hook for searching cereri
 *
 * @param query - Search query string
 * @param enabled - Whether the query should run
 * @returns Query result with cereri search results
 */
export function useSearchCereri(query: string, enabled = true) {
  return useQuery<ApiResponse<CerereSearchResult[]>>({
    queryKey: ["dashboard", "search", "cereri", query],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/search/cereri?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to search cereri");
      }

      return response.json();
    },
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for searching plati
 *
 * @param query - Search query string
 * @param enabled - Whether the query should run
 * @returns Query result with plati search results
 */
export function useSearchPlati(query: string, enabled = true) {
  return useQuery<ApiResponse<PlataSearchResult[]>>({
    queryKey: ["dashboard", "search", "plati", query],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/search/plati?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to search plati");
      }

      return response.json();
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for searching documents
 *
 * @param query - Search query string
 * @param enabled - Whether the query should run
 * @returns Query result with documents search results
 */
export function useSearchDocuments(query: string, enabled = true) {
  return useQuery<ApiResponse<Document[]>>({
    queryKey: ["dashboard", "search", "documents", query],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/search/documents?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to search documents");
      }

      return response.json();
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

/**
 * Combined hook for searching across all types
 *
 * @param query - Search query string
 * @param enabled - Whether the queries should run
 * @returns Combined search results from all types
 */
export function useGlobalSearch(query: string, enabled = true) {
  const cereriQuery = useSearchCereri(query, enabled);
  const platiQuery = useSearchPlati(query, enabled);
  const documentsQuery = useSearchDocuments(query, enabled);

  const isLoading = cereriQuery.isLoading || platiQuery.isLoading || documentsQuery.isLoading;
  const isError = cereriQuery.isError || platiQuery.isError || documentsQuery.isError;

  // Combine results
  const results: SearchResult[] = [];

  if (cereriQuery.data?.data) {
    cereriQuery.data.data.forEach((cerere) => {
      results.push({ type: "cerere", data: cerere });
    });
  }

  if (platiQuery.data?.data) {
    platiQuery.data.data.forEach((plata) => {
      results.push({ type: "plata", data: plata });
    });
  }

  if (documentsQuery.data?.data) {
    documentsQuery.data.data.forEach((document) => {
      results.push({ type: "document", data: document });
    });
  }

  return {
    results,
    isLoading,
    isError,
    cereriQuery,
    platiQuery,
    documentsQuery,
  };
}
