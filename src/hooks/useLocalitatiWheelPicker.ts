import { useState, useEffect, useRef } from "react";
import type { WheelPickerOption } from "@/components/wheel-picker";
import type { ApiResponse, ApiErrorResponse, Localitate } from "@/types/api";

interface UseLocalitatiWheelPickerParams {
  judetId: number | null;
}

interface UseLocalitatiWheelPickerReturn {
  options: WheelPickerOption[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  getLocalitateById: (id: string) => Localitate | undefined;
}

// Simple in-memory cache
const localitatiCache = new Map<number, WheelPickerOption[]>();
const localitatiDataCache = new Map<number, Localitate[]>();

export function useLocalitatiWheelPicker({
  judetId,
}: UseLocalitatiWheelPickerParams): UseLocalitatiWheelPickerReturn {
  const [options, setOptions] = useState<WheelPickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLocalitati = async () => {
    // Don't fetch if no județ is selected
    if (!judetId) {
      // Keep previous options visible - don't clear them
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (localitatiCache.has(judetId) && localitatiDataCache.has(judetId)) {
      setOptions(localitatiCache.get(judetId)!);
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

      // Cache the full data for slug lookups
      localitatiDataCache.set(judetId, successData.data);

      // Format localități as WheelPickerOption[]
      const formattedOptions: WheelPickerOption[] = successData.data.map((localitate) => ({
        label: localitate.nume + (localitate.tip ? ` (${localitate.tip})` : ""),
        value: localitate.id.toString(),
      }));

      // Cache the results
      localitatiCache.set(judetId, formattedOptions);

      setOptions(formattedOptions);
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
  };

  useEffect(() => {
    fetchLocalitati();

    // Cleanup: abort request on unmount or when județ changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [judetId]);

  const retry = () => {
    // Clear cache for this județ on retry
    if (judetId) {
      localitatiCache.delete(judetId);
      localitatiDataCache.delete(judetId);
    }
    fetchLocalitati();
  };

  const getLocalitateById = (id: string): Localitate | undefined => {
    // Search across all cached județe
    for (const localitati of localitatiDataCache.values()) {
      const found = localitati.find((loc) => loc.id.toString() === id);
      if (found) return found;
    }
    return undefined;
  };

  return {
    options,
    loading,
    error,
    retry,
    getLocalitateById,
  };
}
