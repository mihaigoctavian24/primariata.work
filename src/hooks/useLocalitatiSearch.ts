import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ApiResponse, ApiErrorResponse, Localitate } from "@/types/api";

interface UseLocalitatiSearchParams {
  judetId: number | null;
  searchQuery: string;
}

interface UseLocalitatiSearchReturn {
  localitati: Localitate[];
  filteredLocalitati: Localitate[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// Simple cache: Map<judetId, Localitate[]>
const localitatiCache = new Map<number, Localitate[]>();

// Smart search function - matches anywhere in the name, case-insensitive
function smartSearch(localitati: Localitate[], query: string): Localitate[] {
  if (!query || query.trim() === "") {
    return localitati;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return localitati.filter((localitate) => {
    const normalizedName = localitate.nume.toLowerCase();
    return normalizedName.includes(normalizedQuery);
  });
}

export function useLocalitatiSearch({
  judetId,
  searchQuery,
}: UseLocalitatiSearchParams): UseLocalitatiSearchReturn {
  const [localitati, setLocalitati] = useState<Localitate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Client-side filtering in real-time (no API calls for search)
  const filteredLocalitati = useMemo(() => {
    return smartSearch(localitati, searchQuery);
  }, [localitati, searchQuery]);

  const fetchLocalitati = useCallback(async () => {
    // Don't fetch if no județ is selected
    if (!judetId) {
      setLocalitati([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first - load ALL localități for this județ once
    const cachedData = localitatiCache.get(judetId);
    if (cachedData) {
      setLocalitati(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const params = new URLSearchParams({
        judet_id: judetId.toString(),
      });

      // Load ALL localități for this județ (no search parameter)
      const response = await fetch(`/api/localitati?${params.toString()}`, {
        signal: abortController.signal,
      });
      const data = await response.json();

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.error.message || "Eroare la încărcarea localităților");
      }

      const successData = data as ApiResponse<Localitate[]>;

      // Cache ALL results for this județ
      localitatiCache.set(judetId, successData.data);

      setLocalitati(successData.data);
    } catch (err) {
      // Don't show error if request was aborted
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Eroare la încărcarea localităților";
      setError(errorMessage);
      console.error("Error fetching localități:", err);
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [judetId]);

  useEffect(() => {
    fetchLocalitati();

    // Cleanup: abort request on unmount or when județ changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLocalitati]);

  const retry = useCallback(() => {
    // Clear cache for this județ on retry
    if (judetId) {
      localitatiCache.delete(judetId);
    }
    fetchLocalitati();
  }, [judetId, fetchLocalitati]);

  return {
    localitati,
    filteredLocalitati,
    loading,
    error,
    retry,
  };
}
